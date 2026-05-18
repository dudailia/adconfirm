export default function DashboardPage() {
  return (
    <div style={{minHeight:'100vh',background:'#04070F',color:'white',padding:'40px',fontFamily:'system-ui'}}>
      <h1 style={{fontSize:'28px',marginBottom:'16px',color:'#F0F4FF'}}>AdConfirm Dashboard</h1>
      <p style={{color:'#8A9BC4',marginBottom:'40px'}}>You are logged in.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px',maxWidth:'800px'}}>
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'8px'}}>Receipts</p>
          <p style={{fontSize:'32px',fontWeight:'bold',color:'#F0F4FF'}}>0</p>
        </div>
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'8px'}}>Ads Delivered</p>
          <p style={{fontSize:'32px',fontWeight:'bold',color:'#F0F4FF'}}>0</p>
        </div>
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'8px'}}>Xero</p>
          <p style={{fontSize:'32px',fontWeight:'bold',color:'#00E5A0'}}>Connected</p>
        </div>
      </div>
      <div style={{marginTop:'40px'}}>
        <a href="/dashboard/connect-xero" style={{display:'inline-block',padding:'12px 24px',background:'#0052FF',color:'white',borderRadius:'6px',textDecoration:'none',marginRight:'12px',fontSize:'14px'}}>Connect Xero</a>
        <a href="/dashboard/settings" style={{display:'inline-block',padding:'12px 24px',background:'#0D1629',color:'white',borderRadius:'6px',textDecoration:'none',border:'1px solid #1A2540',fontSize:'14px'}}>Settings</a>
      </div>
    </div>
  )
}
