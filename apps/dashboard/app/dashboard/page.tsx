import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EposNowCard } from './EposNowCard'
import { ReceiptHistory } from './ReceiptHistory'

export const dynamic = 'force-dynamic'

const API_URL = (process.env['NEXT_PUBLIC_API_URL'] ?? 'https://adconfirm-api.onrender.com').replace(/\/$/, '')

const XERO_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Xero connection was cancelled.',
  token_failed: 'Xero authorisation failed. Please try again.',
  no_org: 'No Xero organisation was connected. Select an organisation in Xero and try again.',
  missing_params: 'Something went wrong with the Xero redirect. Please try again.',
  invalid_state: 'Invalid Xero session state. Please start the connection again.',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { connected?: string; xero_error?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let business: {
    id: string
    name: string
    email: string
    xero_tenant_id: string | null
    xero_access_token: string | null
    eposnow_api_key: string | null
    eposnow_enabled: boolean
  } | null = null

  const SELECT = 'id, name, email, xero_tenant_id, xero_access_token, eposnow_api_key, eposnow_enabled'

  if (user.email) {
    const { data: byEmail } = await supabase
      .from('businesses')
      .select(SELECT)
      .ilike('email', user.email.trim())
      .maybeSingle()
    business = byEmail ?? null
  }

  if (!business) {
    const { data: byId } = await supabase
      .from('businesses')
      .select(SELECT)
      .eq('id', user.id)
      .maybeSingle()
    business = byId ?? null
  }

  const xeroConnected =
    business?.xero_tenant_id != null &&
    business?.xero_access_token != null

  const connectXeroUrl = business?.id
    ? `${API_URL}/auth/xero/connect?business_id=${encodeURIComponent(business.id)}`
    : null

  // Total receipt count + per-channel breakdown
  const { count: receiptCount } = business
    ? await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
    : { count: 0 }

  const { count: xeroReceiptCount } = business
    ? await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .eq('channel', 'xero')
    : { count: 0 }

  const { count: eposReceiptCount } = business
    ? await supabase
        .from('receipts')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', business.id)
        .eq('channel', 'eposnow')
    : { count: 0 }

  const { count: adCount } = business
    ? await supabase
        .from('receipt_ad_placements')
        .select('receipts!inner(business_id)', { count: 'exact', head: true })
        .eq('receipts.business_id', business.id)
    : { count: 0 }

  const { data: lastReceiptRow } = business
    ? await supabase
        .from('receipts')
        .select('created_at')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }

  const lastSync = lastReceiptRow?.created_at
    ? new Date(lastReceiptRow.created_at).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null

  const justConnected = searchParams.connected === 'true'
  const xeroError = searchParams.xero_error
    ? (XERO_ERROR_MESSAGES[searchParams.xero_error] ?? 'Something went wrong connecting Xero.')
    : null

  return (
    <div style={{minHeight:'100vh',background:'#04070F',color:'white',padding:'40px',fontFamily:'system-ui'}}>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px'}}>
        <div>
          <h1 style={{fontSize:'28px',marginBottom:'4px',color:'#F0F4FF'}}>AdConfirm Dashboard</h1>
          <p style={{color:'#8A9BC4',margin:0}}>{business?.name ?? user.email}</p>
        </div>
        <a href="/api/auth/signout" style={{padding:'8px 16px',background:'#0D1629',border:'1px solid #1A2540',borderRadius:'6px',color:'white',textDecoration:'none',fontSize:'14px'}}>Sign out</a>
      </div>

      {/* Banners */}
      {justConnected && (
        <div style={{marginBottom:'24px',padding:'12px 16px',background:'#0D1A0D',border:'1px solid #1A3D1A',borderRadius:'8px',color:'#00E5A0',fontSize:'13px'}}>
          ✓ Xero connected successfully. Your invoices will now be processed automatically.
        </div>
      )}
      {xeroError && (
        <div style={{marginBottom:'24px',padding:'12px 16px',background:'#1A0D0D',border:'1px solid #3D1515',borderRadius:'8px',color:'#FF9090',fontSize:'13px'}}>
          {xeroError}
        </div>
      )}
      {!business && (
        <div style={{marginBottom:'24px',padding:'12px 16px',background:'#1A0D0D',border:'1px solid #3D1515',borderRadius:'8px',color:'#FF9090',fontSize:'13px'}}>
          No business profile found for <strong>{user.email}</strong>. Contact support if this is unexpected.
        </div>
      )}

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px',maxWidth:'900px',marginBottom:'32px'}}>
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'8px'}}>Receipts Processed</p>
          <p style={{fontSize:'32px',fontWeight:'bold',color:'#F0F4FF'}}>{receiptCount ?? 0}</p>
          {((xeroReceiptCount ?? 0) > 0 || (eposReceiptCount ?? 0) > 0) && (
            <p style={{color:'#8A9BC4',fontSize:'11px',marginTop:'6px'}}>
              Xero: {xeroReceiptCount ?? 0} · Epos Now: {eposReceiptCount ?? 0}
            </p>
          )}
        </div>
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'8px'}}>Ads Delivered</p>
          <p style={{fontSize:'32px',fontWeight:'bold',color:'#F0F4FF'}}>{adCount ?? 0}</p>
        </div>
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'8px'}}>Xero Status</p>
          <p style={{fontSize:'24px',fontWeight:'bold',color: xeroConnected ? '#00E5A0' : '#FF3B5C'}}>
            {xeroConnected ? 'Connected' : 'Not connected'}
          </p>
          {xeroConnected && business?.xero_tenant_id && (
            <p style={{color:'#8A9BC4',fontSize:'11px',marginTop:'6px',fontFamily:'monospace',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              {business.xero_tenant_id}
            </p>
          )}
          {lastSync && (
            <p style={{color:'#8A9BC4',fontSize:'11px',marginTop:'4px'}}>Last sync: {lastSync}</p>
          )}
        </div>
      </div>

      {/* Integrations row */}
      <h2 style={{fontSize:'16px',fontWeight:600,color:'#8A9BC4',marginBottom:'16px',maxWidth:'900px'}}>Integrations</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',maxWidth:'900px',marginBottom:'32px'}}>
        {/* Xero card */}
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'12px'}}>Xero</p>
          {!xeroConnected && connectXeroUrl && (
            <a href={connectXeroUrl} style={{display:'inline-block',padding:'8px 18px',background:'#0052FF',color:'white',borderRadius:'6px',textDecoration:'none',fontSize:'13px',fontWeight:600}}>
              Connect Xero
            </a>
          )}
          {xeroConnected && (
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              <a href="/dashboard/connect-xero" style={{display:'inline-block',padding:'8px 14px',background:'#0D1629',color:'#00E5A0',borderRadius:'6px',textDecoration:'none',fontSize:'13px',border:'1px solid #00E5A0'}}>
                Connected ✓
              </a>
              <a href="/dashboard/connect-xero" style={{display:'inline-block',padding:'8px 14px',background:'#1A0D0D',color:'#FF9090',borderRadius:'6px',textDecoration:'none',fontSize:'13px',border:'1px solid #3D1515'}}>
                Disconnect
              </a>
            </div>
          )}
        </div>

        {/* Epos Now card */}
        <EposNowCard
          apiKey={business?.eposnow_api_key ?? null}
          enabled={business?.eposnow_enabled ?? false}
        />
      </div>

      {/* Other actions */}
      <div style={{marginBottom:'40px'}}>
        <a href="/dashboard/settings" style={{display:'inline-block',padding:'12px 24px',background:'#0D1629',color:'white',borderRadius:'6px',textDecoration:'none',border:'1px solid #1A2540',fontSize:'14px'}}>
          Settings
        </a>
      </div>

      {/* Receipt history — only shown when business profile is found */}
      {business && <ReceiptHistory businessId={business.id} />}
    </div>
  )
}
