import { createClient } from '@/lib/supabase/server'
import { getBusinessForUser } from '@/lib/business'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const business = user ? await getBusinessForUser(user) : null

  const { count: receiptCount } = business
    ? await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
    : { count: 0 }

  const { count: adCount } = business
    ? await supabase
        .from('receipt_ad_placements')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
    : { count: 0 }

  const xeroConnected = Boolean(business?.xero_tenant_id)

  return (
    <div style={{minHeight:'100vh',background:'#04070F',color:'white',padding:'40px',fontFamily:'system-ui'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'40px'}}>
        <div>
          <h1 style={{fontSize:'28px',marginBottom:'4px',color:'#F0F4FF'}}>AdConfirm Dashboard</h1>
          <p style={{color:'#8A9BC4',margin:0}}>{business?.name ?? user?.email}</p>
        </div>
        <a href="/api/auth/signout" style={{padding:'8px 16px',background:'#0D1629',border:'1px solid #1A2540',borderRadius:'6px',color:'white',textDecoration:'none',fontSize:'14px'}}>Sign out</a>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px',maxWidth:'800px',marginBottom:'40px'}}>
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'8px'}}>Receipts</p>
          <p style={{fontSize:'32px',fontWeight:'bold',color:'#F0F4FF'}}>{receiptCount ?? 0}</p>
        </div>
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'8px'}}>Ads Delivered</p>
          <p style={{fontSize:'32px',fontWeight:'bold',color:'#F0F4FF'}}>{adCount ?? 0}</p>
        </div>
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'8px'}}>Xero</p>
          <p style={{fontSize:'32px',fontWeight:'bold',color: xeroConnected ? '#00E5A0' : '#FF3B5C'}}>
            {xeroConnected ? 'Connected' : 'Not connected'}
          </p>
        </div>
      </div>

      <div style={{marginTop:'16px'}}>
        <a href="/dashboard/connect-xero" style={{display:'inline-block',padding:'12px 24px',background:'#0052FF',color:'white',borderRadius:'6px',textDecoration:'none',marginRight:'12px',fontSize:'14px'}}>
          {xeroConnected ? 'Manage Xero' : 'Connect Xero'}
        </a>
        <a href="/dashboard/settings" style={{display:'inline-block',padding:'12px 24px',background:'#0D1629',color:'white',borderRadius:'6px',textDecoration:'none',border:'1px solid #1A2540',fontSize:'14px'}}>Settings</a>
      </div>
    </div>
  )
}
