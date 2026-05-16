'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#04070F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#0D1629', padding: '40px', borderRadius: '12px', width: '400px', border: '1px solid #1A2540' }}>
        <h1 style={{ color: 'white', marginBottom: '24px', textAlign: 'center' }}>AdConfirm</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '12px', background: '#04070F', border: '1px solid #1A2540', borderRadius: '6px', color: 'white', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '12px', background: '#04070F', border: '1px solid #1A2540', borderRadius: '6px', color: 'white', boxSizing: 'border-box' }}
          />
          {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#0052FF', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '16px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
