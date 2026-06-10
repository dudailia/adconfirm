'use client'

import { useEffect, useState } from 'react'

const API = 'https://adconfirm-api.onrender.com/health'
const REFRESH_MS = 30_000

type Status = 'checking' | 'ok' | 'down'

export default function StatusPage() {
  const [status, setStatus] = useState<Status>('checking')
  const [checkedAt, setCheckedAt] = useState<string | null>(null)

  async function check() {
    try {
      const res = await fetch(API, { signal: AbortSignal.timeout(8000) })
      setStatus(res.ok ? 'ok' : 'down')
    } catch {
      setStatus('down')
    }
    setCheckedAt(new Date().toLocaleTimeString('en-GB'))
  }

  useEffect(() => {
    check()
    const id = setInterval(check, REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  const dot = status === 'ok' ? '#00E5A0' : status === 'down' ? '#FF3B5C' : '#FFB800'
  const label =
    status === 'ok' ? 'All systems operational' :
    status === 'down' ? 'Backend offline' :
    'Checking…'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#04070F',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      color: 'white',
      padding: '40px',
    }}>
      <div style={{
        background: '#0D1629',
        border: '1px solid #1A2540',
        borderRadius: '16px',
        padding: '48px 56px',
        textAlign: 'center',
        maxWidth: '420px',
        width: '100%',
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#F0F4FF', margin: '0 0 32px' }}>
          AdConfirm Status
        </h1>

        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
          <span style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: dot,
            boxShadow: `0 0 8px ${dot}`,
          }} />
          <span style={{ fontSize: '18px', fontWeight: 600, color: dot }}>{label}</span>
        </div>

        {/* Service row */}
        <div style={{
          background: '#04070F',
          border: '1px solid #1A2540',
          borderRadius: '8px',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <span style={{ fontSize: '14px', color: '#8A9BC4' }}>API (Render)</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: dot }}>
            {status === 'ok' ? 'Online' : status === 'down' ? 'Offline' : '…'}
          </span>
        </div>

        {checkedAt && (
          <p style={{ fontSize: '12px', color: '#4A5568', margin: 0 }}>
            Last checked: {checkedAt} · auto-refreshes every 30s
          </p>
        )}
      </div>
    </div>
  )
}
