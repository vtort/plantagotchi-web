'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, Reading } from '@/lib/supabase'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const STATE_CONFIG: Record<string, { emoji: string; label: string; color: string }> = {
  HAPPY:      { emoji: '🌸', label: 'Feliz',           color: '#22c55e' },
  THIRSTY:    { emoji: '🏜️', label: 'Sedienta',        color: '#f97316' },
  DROWNING:   { emoji: '💧', label: 'Ahogada',          color: '#3b82f6' },
  DARK:       { emoji: '🌑', label: 'Sin luz',          color: '#a855f7' },
  TOO_BRIGHT: { emoji: '☀️', label: 'Demasiada luz',    color: '#eab308' },
  COLD:       { emoji: '🥶', label: 'Frío',             color: '#67e8f9' },
  HOT:        { emoji: '🌡️', label: 'Demasiado calor',  color: '#ef4444' },
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function StatCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <div className="bg-zinc-900 rounded-2xl p-5 flex flex-col gap-1">
      <span className="text-zinc-500 text-sm">{label}</span>
      <span className="text-3xl font-bold" style={{ color }}>
        {value}<span className="text-lg text-zinc-400 font-normal ml-1">{unit}</span>
      </span>
    </div>
  )
}

function Chart({ data, dataKey, color, label, unit }: {
  data: Reading[]; dataKey: keyof Reading; color: string; label: string; unit: string
}) {
  const chartData = [...data].reverse().map(r => ({
    t: formatTime(r.created_at),
    v: r[dataKey]
  }))

  return (
    <div className="bg-zinc-900 rounded-2xl p-5">
      <p className="text-zinc-400 text-sm mb-4">{label}</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="t" tick={{ fontSize: 11, fill: '#71717a' }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 11, fill: '#71717a' }} width={38} unit={unit} />
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
            labelStyle={{ color: '#a1a1aa' }}
            itemStyle={{ color }}
          />
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function Home() {
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    const { data } = await supabase
      .from('plantagotchi_readings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
    if (data) { setReadings(data); setLastUpdate(new Date()) }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const latest = readings[0]
  const state = latest ? (STATE_CONFIG[latest.state] ?? STATE_CONFIG.HAPPY) : null

  return (
    <main className="min-h-screen bg-black text-white p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight">🌱 Plantagotchi</h1>
        {lastUpdate && (
          <span className="text-zinc-600 text-xs">
            {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-zinc-500 text-center mt-20">Cargando...</p>
      ) : !latest ? (
        <p className="text-zinc-500 text-center mt-20">Sin datos todavía</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="bg-zinc-900 rounded-2xl p-6 flex items-center gap-4">
            <span className="text-6xl">{state?.emoji}</span>
            <div>
              <p className="text-zinc-500 text-sm">Estado actual</p>
              <p className="text-3xl font-bold" style={{ color: state?.color }}>{state?.label}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Temperatura" value={latest.temperature.toFixed(1)}  unit="°C"  color="#f97316" />
            <StatCard label="Luz"         value={String(Math.round(latest.lux))} unit="lux" color="#eab308" />
            <StatCard label="Presión"     value={latest.pressure.toFixed(0)}     unit="hPa" color="#60a5fa" />
          </div>


          <Chart data={readings} dataKey="temperature" color="#f97316" label="Temperatura (°C)" unit="°C" />
          <Chart data={readings} dataKey="lux"         color="#eab308" label="Luz (lux)"        unit=""    />

          <p className="text-zinc-700 text-xs text-center">
            Última lectura: {new Date(latest.created_at).toLocaleString('es-ES')}
          </p>
        </div>
      )}
    </main>
  )
}
