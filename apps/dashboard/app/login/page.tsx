// v4 LOGIN - NO SERVER REDIRECTS - 2026-05-17 cache bust
'use client'
import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { window.location.replace('/dashboard') }
  }
  return (
    <div style={{ minHeight: '100vh', background: '#04070F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0D1629', padding: '40px', borderRadius: '12px', width: '380px', border: '1px solid #1A2540' }}>
        <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '8px', fontSize: '24px' }}>AdConfirm</h1>
        <p style={{ color: '#00E5A0', textAlign: 'center', marginBottom: '24px', fontSize: '12px' }}>v4 login no redirects active</p>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '12px', marginBottom: '12px', background: '#04070F', border: '1px solid #1A2540', borderRadius: '6px', color: 'white', fontSize: '14px', boxSizing: 'border-box' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '12px', marginBottom: '16px', background: '#04070F', border: '1px solid #1A2540', borderRadius: '6px', color: 'white', fontSize: '14px', boxSizing: 'border-box' }} />
          {error && <p style={{ color: '#FF3B5C', marginBottom: '12px', fontSize: '14px' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#0052FF', border: 'none', borderRadius: '6px', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'wait' : 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
