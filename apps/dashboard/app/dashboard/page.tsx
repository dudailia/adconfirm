// AdConfirm Dashboard v3 - NO REDIRECTS
import { createClient } from '../../lib/supabase/server'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export default async function DashboardPage() {
  let email = 'Guest'
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    email = data?.user?.email ?? 'Guest'
  } catch {}
  return (
    <div style={{minHeight:'100vh',background:'#04070F',color:'white',padding:'40px',fontFamily:'system-ui'}}>
      <h1 style={{fontSize:'28px',marginBottom:'8px'}}>AdConfirm Dashboard</h1>
      <p style={{color:'#8A9BC4',marginBottom:'40px'}}>Welcome, {email}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px'}}>
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'8px'}}>Receipts</p>
          <p style={{fontSize:'28px',fontWeight:'bold'}}>0</p>
        </div>
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'8px'}}>Ads Delivered</p>
          <p style={{fontSize:'28px',fontWeight:'bold'}}>0</p>
        </div>
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'8px'}}>Xero</p>
          <p style={{fontSize:'28px',fontWeight:'bold',color:'#00E5A0'}}>Connected</p>
        </div>
      </div>
    </div>
  )
}
