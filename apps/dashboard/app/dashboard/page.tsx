import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div style={{ minHeight: '100vh', background: '#04070F', color: 'white', padding: '40px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>AdConfirm Dashboard</h1>
      <p style={{ color: '#8A9BC4' }}>Welcome {user?.email}</p>
      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ background: '#0D1629', padding: '24px', borderRadius: '12px', border: '1px solid #1A2540' }}>
          <p style={{ color: '#8A9BC4', marginBottom: '8px' }}>Receipts Processed</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>0</p>
        </div>
        <div style={{ background: '#0D1629', padding: '24px', borderRadius: '12px', border: '1px solid #1A2540' }}>
          <p style={{ color: '#8A9BC4', marginBottom: '8px' }}>Ads Delivered</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>0</p>
        </div>
        <div style={{ background: '#0D1629', padding: '24px', borderRadius: '12px', border: '1px solid #1A2540' }}>
          <p style={{ color: '#8A9BC4', marginBottom: '8px' }}>Xero Status</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#00E5A0' }}>Connected</p>
        </div>
      </div>
    </div>
  )
}
