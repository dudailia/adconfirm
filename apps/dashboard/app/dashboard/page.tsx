import { createClient } from '../../lib/supabase/server'
export const dynamic = 'force-dynamic'
export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <div style={{ minHeight: '100vh', background: '#04070F', color: 'white', padding: '40px', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px', color: '#F0F4FF' }}>AdConfirm Dashboard</h1>
      <p style={{ color: '#8A9BC4', marginBottom: '40px' }}>Welcome, {user?.email ?? 'Guest'}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {[['Receipts Processed', '0'], ['Ads Delivered', '0'], ['Xero', 'Connected']].map(([label, value]) => (
          <div key={label} style={{ background: '#0D1629', padding: '24px', borderRadius: '12px', border: '1px solid #1A2540' }}>
            <p style={{ color: '#8A9BC4', fontSize: '14px', marginBottom: '8px' }}>{label}</p>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: label === 'Xero' ? '#00E5A0' : '#F0F4FF' }}>{value}</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '40px' }}>
        <a href="/dashboard/connect-xero" style={{ display: 'inline-block', padding: '12px 24px', background: '#0052FF', color: 'white', borderRadius: '6px', textDecoration: 'none', marginRight: '12px' }}>Connect Xero</a>
        <a href="/dashboard/settings" style={{ display: 'inline-block', padding: '12px 24px', background: '#0D1629', color: 'white', borderRadius: '6px', textDecoration: 'none', border: '1px solid #1A2540' }}>Settings</a>
      </div>
    </div>
  )
}
