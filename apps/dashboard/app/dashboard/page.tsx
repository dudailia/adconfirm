import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EposNowCard } from './EposNowCard'
import { ReceiptHistory } from './ReceiptHistory'
import { QBODisconnect } from './QBODisconnect'

export const dynamic = 'force-dynamic'

const API_URL = (process.env['NEXT_PUBLIC_API_URL'] ?? 'https://adconfirm-api.onrender.com').replace(/\/$/, '')

const XERO_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Xero connection was cancelled.',
  token_failed: 'Xero authorisation failed. Please try again.',
  no_org: 'No Xero organisation was connected. Select an organisation in Xero and try again.',
  missing_params: 'Something went wrong with the Xero redirect. Please try again.',
  invalid_state: 'Invalid Xero session state. Please start the connection again.',
}

const QBO_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'QuickBooks connection was cancelled.',
  token_failed: 'QuickBooks authorisation failed. Please try again.',
  missing_params: 'Something went wrong with the QuickBooks redirect. Please try again.',
  invalid_state: 'Invalid QuickBooks session. Please start the connection again.',
}

const SQUARE_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Square connection was cancelled.',
  token_failed: 'Square authorisation failed. Please try again.',
  missing_params: 'Something went wrong with the Square redirect. Please try again.',
  invalid_state: 'Invalid Square session. Please start the connection again.',
  db_failed: 'Failed to save Square credentials. Please try again.',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { connected?: string; xero_error?: string; qbo_connected?: string; qbo_error?: string; square_connected?: string; square_error?: string; fa_connected?: string; fa_error?: string }
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
    qbo_realm_id?: string | null
    qbo_access_token?: string | null
    fa_access_token?: string | null
    square_merchant_id?: string | null
    square_access_token?: string | null
  } | null = null

  // Core select excludes qbo_* so the dashboard never hard-breaks if the
  // QBO migration (006) has not been applied yet — qbo fields are fetched
  // separately below in a fail-safe query.
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

  // QBO/FA/Square fields — separate query so missing columns (pre-migration) degrade
  // only those cards instead of nulling the whole business row.
  if (business) {
    const { data: extra } = await supabase
      .from('businesses')
      .select('qbo_realm_id, qbo_access_token, fa_access_token, square_merchant_id, square_access_token')
      .eq('id', business.id)
      .maybeSingle()
    if (extra) {
      business.qbo_realm_id = extra.qbo_realm_id
      business.qbo_access_token = extra.qbo_access_token
      business.fa_access_token = (extra as any).fa_access_token ?? null
      business.square_merchant_id = (extra as any).square_merchant_id ?? null
      business.square_access_token = (extra as any).square_access_token ?? null
    }
  }

  const xeroConnected   = business?.xero_tenant_id != null && business?.xero_access_token != null
  const qboConnected    = business?.qbo_realm_id != null && business?.qbo_access_token != null
  const faConnected     = business?.fa_access_token != null
  const squareConnected = business?.square_merchant_id != null && business?.square_access_token != null

  const connectXeroUrl   = business?.id ? `${API_URL}/auth/xero/connect?business_id=${encodeURIComponent(business.id)}`   : null
  const connectQBOUrl    = business?.id ? `${API_URL}/auth/qbo/connect?business_id=${encodeURIComponent(business.id)}`    : null
  const connectFAUrl     = business?.id ? `${API_URL}/auth/freeagent/connect?business_id=${encodeURIComponent(business.id)}` : null
  const connectSquareUrl = business?.id ? `${API_URL}/auth/square/connect?business_id=${encodeURIComponent(business.id)}`  : null

  // Receipt counts — total + per channel
  const { count: receiptCount } = business
    ? await supabase.from('receipts').select('*', { count: 'exact', head: true }).eq('business_id', business.id)
    : { count: 0 }

  const { count: xeroReceiptCount } = business
    ? await supabase.from('receipts').select('*', { count: 'exact', head: true }).eq('business_id', business.id).eq('channel', 'xero')
    : { count: 0 }

  const { count: eposReceiptCount } = business
    ? await supabase.from('receipts').select('*', { count: 'exact', head: true }).eq('business_id', business.id).eq('channel', 'eposnow')
    : { count: 0 }

  const { count: qboReceiptCount } = business
    ? await supabase.from('receipts').select('*', { count: 'exact', head: true }).eq('business_id', business.id).eq('channel', 'quickbooks')
    : { count: 0 }

  const { count: squareReceiptCount } = business
    ? await supabase.from('receipts').select('*', { count: 'exact', head: true }).eq('business_id', business.id).eq('channel', 'square')
    : { count: 0 }

  const { count: adCount } = business
    ? await supabase.from('receipt_ad_placements').select('receipts!inner(business_id)', { count: 'exact', head: true }).eq('receipts.business_id', business.id)
    : { count: 0 }

  const { data: lastReceiptRow } = business
    ? await supabase.from('receipts').select('created_at').eq('business_id', business.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
    : { data: null }

  const lastSync = lastReceiptRow?.created_at
    ? new Date(lastReceiptRow.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : null

  const justConnected       = searchParams.connected === 'true'
  const qboJustConnected    = searchParams.qbo_connected === 'true'
  const faJustConnected     = searchParams.fa_connected === 'true'
  const squareJustConnected = searchParams.square_connected === 'true'
  const xeroError   = searchParams.xero_error   ? (XERO_ERROR_MESSAGES[searchParams.xero_error]     ?? 'Something went wrong connecting Xero.')    : null
  const qboError    = searchParams.qbo_error    ? (QBO_ERROR_MESSAGES[searchParams.qbo_error]        ?? 'Something went wrong connecting QuickBooks.') : null
  const squareError = searchParams.square_error ? (SQUARE_ERROR_MESSAGES[searchParams.square_error] ?? 'Something went wrong connecting Square.')   : null

  const hasChannelBreakdown = (xeroReceiptCount ?? 0) + (eposReceiptCount ?? 0) + (qboReceiptCount ?? 0) + (squareReceiptCount ?? 0) > 0

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
        <div style={{marginBottom:'20px',padding:'12px 16px',background:'#0D1A0D',border:'1px solid #1A3D1A',borderRadius:'8px',color:'#00E5A0',fontSize:'13px'}}>
          ✓ Xero connected successfully. Your invoices will now be processed automatically.
        </div>
      )}
      {qboJustConnected && (
        <div style={{marginBottom:'20px',padding:'12px 16px',background:'#0D1A0D',border:'1px solid #1A3D1A',borderRadius:'8px',color:'#00E5A0',fontSize:'13px'}}>
          ✓ QuickBooks Online connected successfully. Your invoices will now be processed automatically.
        </div>
      )}
      {faJustConnected && (
        <div style={{marginBottom:'20px',padding:'12px 16px',background:'#0D1A0D',border:'1px solid #1A3D1A',borderRadius:'8px',color:'#00E5A0',fontSize:'13px'}}>
          ✓ FreeAgent connected successfully. Your invoices will now be processed automatically.
        </div>
      )}
      {squareJustConnected && (
        <div style={{marginBottom:'20px',padding:'12px 16px',background:'#0D1A0D',border:'1px solid #1A3D1A',borderRadius:'8px',color:'#00E5A0',fontSize:'13px'}}>
          ✓ Square connected successfully. Your receipts will now be processed automatically.
        </div>
      )}
      {xeroError && (
        <div style={{marginBottom:'20px',padding:'12px 16px',background:'#1A0D0D',border:'1px solid #3D1515',borderRadius:'8px',color:'#FF9090',fontSize:'13px'}}>
          {xeroError}
        </div>
      )}
      {qboError && (
        <div style={{marginBottom:'20px',padding:'12px 16px',background:'#1A0D0D',border:'1px solid #3D1515',borderRadius:'8px',color:'#FF9090',fontSize:'13px'}}>
          {qboError}
        </div>
      )}
      {squareError && (
        <div style={{marginBottom:'20px',padding:'12px 16px',background:'#1A0D0D',border:'1px solid #3D1515',borderRadius:'8px',color:'#FF9090',fontSize:'13px'}}>
          {squareError}
        </div>
      )}
      {!business && (
        <div style={{marginBottom:'20px',padding:'12px 16px',background:'#1A0D0D',border:'1px solid #3D1515',borderRadius:'8px',color:'#FF9090',fontSize:'13px'}}>
          No business profile found for <strong>{user.email}</strong>. Contact support if this is unexpected.
        </div>
      )}

      {/* Stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'20px',maxWidth:'900px',marginBottom:'32px'}}>
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'8px'}}>Receipts Processed</p>
          <p style={{fontSize:'32px',fontWeight:'bold',color:'#F0F4FF'}}>{receiptCount ?? 0}</p>
          {hasChannelBreakdown && (
            <p style={{color:'#8A9BC4',fontSize:'11px',marginTop:'6px'}}>
              Xero: {xeroReceiptCount ?? 0} · QBO: {qboReceiptCount ?? 0} · Epos Now: {eposReceiptCount ?? 0} · Square: {squareReceiptCount ?? 0}
            </p>
          )}
        </div>
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'8px'}}>Ads Delivered</p>
          <p style={{fontSize:'32px',fontWeight:'bold',color:'#F0F4FF'}}>{adCount ?? 0}</p>
        </div>
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'8px'}}>Integrations</p>
          <div style={{display:'flex',flexDirection:'column',gap:'4px',marginTop:'4px'}}>
            <span style={{fontSize:'12px',color: xeroConnected ? '#00E5A0' : '#4A5568'}}>
              {xeroConnected ? '✓' : '○'} Xero
            </span>
            <span style={{fontSize:'12px',color: qboConnected ? '#00E5A0' : '#4A5568'}}>
              {qboConnected ? '✓' : '○'} QuickBooks
            </span>
            <span style={{fontSize:'12px',color: business?.eposnow_api_key ? '#00E5A0' : '#4A5568'}}>
              {business?.eposnow_api_key ? '✓' : '○'} Epos Now
            </span>
            <span style={{fontSize:'12px',color: faConnected ? '#00E5A0' : '#4A5568'}}>
              {faConnected ? '✓' : '○'} FreeAgent
            </span>
            <span style={{fontSize:'12px',color: squareConnected ? '#00E5A0' : '#4A5568'}}>
              {squareConnected ? '✓' : '○'} Square
            </span>
          </div>
          {lastSync && (
            <p style={{color:'#8A9BC4',fontSize:'11px',marginTop:'8px'}}>Last sync: {lastSync}</p>
          )}
        </div>
      </div>

      {/* Integrations */}
      <h2 style={{fontSize:'16px',fontWeight:600,color:'#8A9BC4',marginBottom:'16px',maxWidth:'1100px'}}>Integrations</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'20px',maxWidth:'1100px',marginBottom:'32px'}}>

        {/* Xero */}
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

        {/* QuickBooks Online */}
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'4px'}}>QuickBooks Online</p>
          {business?.qbo_realm_id && (
            <p style={{color:'#4A5568',fontSize:'10px',fontFamily:'monospace',marginBottom:'12px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
              Realm: {business.qbo_realm_id}
            </p>
          )}
          {!qboConnected && !business?.qbo_realm_id && (
            <div style={{marginTop:'12px'}}>
              {connectQBOUrl ? (
                <a href={connectQBOUrl} style={{display:'inline-block',padding:'8px 18px',background:'#2CA01C',color:'white',borderRadius:'6px',textDecoration:'none',fontSize:'13px',fontWeight:600}}>
                  Connect QuickBooks
                </a>
              ) : (
                <span style={{color:'#4A5568',fontSize:'12px'}}>No business profile</span>
              )}
            </div>
          )}
          {qboConnected && business && (
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginTop:'4px'}}>
              <span style={{display:'inline-block',padding:'8px 14px',background:'#0D1629',color:'#00E5A0',borderRadius:'6px',fontSize:'13px',border:'1px solid #00E5A0'}}>
                Connected ✓
              </span>
              <QBODisconnect businessId={business.id} />
            </div>
          )}
          {!qboConnected && business?.qbo_realm_id && connectQBOUrl && (
            <div style={{marginTop:'4px',display:'flex',gap:'8px',flexWrap:'wrap'}}>
              <a href={connectQBOUrl} style={{display:'inline-block',padding:'8px 14px',background:'#2CA01C',color:'white',borderRadius:'6px',textDecoration:'none',fontSize:'13px'}}>
                Reconnect
              </a>
              {business && <QBODisconnect businessId={business.id} />}
            </div>
          )}
        </div>

        {/* Epos Now */}
        <EposNowCard
          apiKey={business?.eposnow_api_key ?? null}
          enabled={business?.eposnow_enabled ?? false}
        />

        {/* FreeAgent */}
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'12px'}}>FreeAgent</p>
          {!faConnected && connectFAUrl && (
            <a href={connectFAUrl} style={{display:'inline-block',padding:'8px 18px',background:'#E84C00',color:'white',borderRadius:'6px',textDecoration:'none',fontSize:'13px',fontWeight:600}}>
              Connect FreeAgent
            </a>
          )}
          {faConnected && business && (
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              <span style={{display:'inline-block',padding:'8px 14px',background:'#0D1629',color:'#00E5A0',borderRadius:'6px',fontSize:'13px',border:'1px solid #00E5A0'}}>
                Connected ✓
              </span>
              <form method="POST" action={`${API_URL}/auth/freeagent/disconnect`} style={{display:'inline'}}>
                <input type="hidden" name="business_id" value={business.id} />
                <button type="submit" style={{padding:'8px 14px',background:'#1A0D0D',color:'#FF9090',borderRadius:'6px',fontSize:'13px',border:'1px solid #3D1515',cursor:'pointer'}}>
                  Disconnect
                </button>
              </form>
            </div>
          )}
          {!faConnected && !connectFAUrl && (
            <span style={{color:'#4A5568',fontSize:'12px'}}>No business profile</span>
          )}
        </div>

        {/* Square */}
        <div style={{background:'#0D1629',padding:'24px',borderRadius:'12px',border:'1px solid #1A2540'}}>
          <p style={{color:'#8A9BC4',fontSize:'14px',marginBottom:'12px'}}>Square</p>
          {!squareConnected && connectSquareUrl && (
            <a href={connectSquareUrl} style={{display:'inline-block',padding:'8px 18px',background:'#006AFF',color:'white',borderRadius:'6px',textDecoration:'none',fontSize:'13px',fontWeight:600}}>
              Connect Square
            </a>
          )}
          {squareConnected && business && (
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              <span style={{display:'inline-block',padding:'8px 14px',background:'#0D1629',color:'#00E5A0',borderRadius:'6px',fontSize:'13px',border:'1px solid #00E5A0'}}>
                Connected ✓
              </span>
              <form method="POST" action={`${API_URL}/auth/square/disconnect`} style={{display:'inline'}}>
                <input type="hidden" name="business_id" value={business.id} />
                <button type="submit" style={{padding:'8px 14px',background:'#1A0D0D',color:'#FF9090',borderRadius:'6px',fontSize:'13px',border:'1px solid #3D1515',cursor:'pointer'}}>
                  Disconnect
                </button>
              </form>
            </div>
          )}
          {!squareConnected && !connectSquareUrl && (
            <span style={{color:'#4A5568',fontSize:'12px'}}>No business profile</span>
          )}
        </div>
      </div>

      {/* Settings */}
      <div style={{marginBottom:'40px'}}>
        <a href="/dashboard/settings" style={{display:'inline-block',padding:'12px 24px',background:'#0D1629',color:'white',borderRadius:'6px',textDecoration:'none',border:'1px solid #1A2540',fontSize:'14px'}}>
          Settings
        </a>
      </div>

      {/* Receipt history */}
      {business && <ReceiptHistory businessId={business.id} />}
    </div>
  )
}
