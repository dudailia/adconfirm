// v5 ROOT - NO REDIRECTS - 2026-05-17 cache bust
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Home() {
  return (
    <div style={{minHeight:'100vh',background:'#04070F',color:'white',padding:'40px',fontFamily:'system-ui'}}>
      <h1 style={{fontSize:'28px',marginBottom:'8px'}}>AdConfirm Dashboard</h1>
      <p style={{color:'#00E5A0',fontSize:'12px',marginBottom:'24px'}}>v5 root no redirects active</p>
      <p style={{color:'#8A9BC4',marginBottom:'32px'}}>Choose where to continue.</p>
      <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
        <a href="/dashboard" style={{display:'inline-block',padding:'12px 20px',background:'#0052FF',color:'white',borderRadius:'6px',textDecoration:'none',fontWeight:'bold'}}>Open Dashboard</a>
        <a href="/login" style={{display:'inline-block',padding:'12px 20px',background:'#0D1629',color:'white',borderRadius:'6px',textDecoration:'none',border:'1px solid #1A2540'}}>Sign In</a>
      </div>
    </div>
  )
}
