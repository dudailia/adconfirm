import DemoChart from './DemoChart'

const RECEIPTS = [
  {
    business: 'Acme Supplies Ltd',
    amount: '£2,340.00',
    date: '3 Jun 2026',
    headline: '50% off Sage subscriptions',
  },
  {
    business: 'Harbour Coffee Co',
    amount: '£189.50',
    date: '3 Jun 2026',
    headline: 'Try Xero free for 30 days',
  },
  {
    business: 'Nordic Print Studio',
    amount: '£4,120.00',
    date: '2 Jun 2026',
    headline: 'Square POS — no setup fees',
  },
  {
    business: 'Greenfield Catering',
    amount: '£876.00',
    date: '2 Jun 2026',
    headline: 'Expensify — smarter receipts',
  },
  {
    business: 'Coastal Law LLP',
    amount: '£12,500.00',
    date: '1 Jun 2026',
    headline: 'Shopify for B2B — go live today',
  },
]

const s = {
  page: {
    minHeight: '100vh',
    background: '#04070F',
    color: 'white',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  } as React.CSSProperties,

  banner: {
    background: '#1A1200',
    borderBottom: '1px solid #4D3800',
    padding: '12px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
  } as React.CSSProperties,

  bannerText: {
    color: '#FFB800',
    fontSize: '14px',
    fontWeight: 500,
    margin: 0,
  } as React.CSSProperties,

  cta: {
    display: 'inline-block',
    padding: '8px 20px',
    background: '#FFB800',
    color: '#0D0A00',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 700,
    whiteSpace: 'nowrap',
  } as React.CSSProperties,

  body: { padding: '40px' } as React.CSSProperties,

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  } as React.CSSProperties,

  h1: { fontSize: '28px', marginBottom: '4px', color: '#F0F4FF', margin: '0 0 4px' } as React.CSSProperties,
  sub: { color: '#8A9BC4', margin: 0, fontSize: '14px' } as React.CSSProperties,

  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    maxWidth: '900px',
    marginBottom: '32px',
  } as React.CSSProperties,

  card: {
    background: '#0D1629',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #1A2540',
  } as React.CSSProperties,

  cardLabel: { color: '#8A9BC4', fontSize: '14px', marginBottom: '8px', margin: '0 0 8px' } as React.CSSProperties,
  cardValue: { fontSize: '32px', fontWeight: 'bold', color: '#F0F4FF', margin: 0 } as React.CSSProperties,
  cardSub: { color: '#8A9BC4', fontSize: '12px', marginTop: '6px', margin: '6px 0 0' } as React.CSSProperties,

  chartSection: {
    background: '#0D1629',
    border: '1px solid #1A2540',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '900px',
    marginBottom: '32px',
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#F0F4FF',
    margin: '0 0 20px',
  } as React.CSSProperties,

  tableWrap: {
    background: '#0D1629',
    border: '1px solid #1A2540',
    borderRadius: '12px',
    maxWidth: '900px',
    overflow: 'hidden',
  } as React.CSSProperties,

  tableHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #1A2540',
    fontSize: '14px',
    fontWeight: 600,
    color: '#F0F4FF',
    margin: 0,
  } as React.CSSProperties,

  th: {
    padding: '10px 20px',
    textAlign: 'left' as const,
    fontSize: '12px',
    color: '#8A9BC4',
    fontWeight: 500,
    borderBottom: '1px solid #1A2540',
    background: '#0D1629',
  } as React.CSSProperties,

  td: {
    padding: '14px 20px',
    fontSize: '13px',
    color: '#F0F4FF',
    borderBottom: '1px solid rgba(26,37,64,0.5)',
  } as React.CSSProperties,

  tdMuted: {
    padding: '14px 20px',
    fontSize: '13px',
    color: '#8A9BC4',
    borderBottom: '1px solid rgba(26,37,64,0.5)',
  } as React.CSSProperties,

  badge: {
    display: 'inline-block',
    background: 'rgba(0,229,160,0.1)',
    color: '#00E5A0',
    border: '1px solid rgba(0,229,160,0.2)',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '12px',
  } as React.CSSProperties,
}

export default function DemoPage() {
  return (
    <div style={s.page}>
      {/* Demo banner */}
      <div style={s.banner}>
        <p style={s.bannerText}>
          📊 Live demo — connect your Xero to see your real data
        </p>
        <a href="/signup" style={s.cta}>Get Started Free →</a>
      </div>

      <div style={s.body}>
        {/* Header */}
        <div style={s.header}>
          <div>
            <h1 style={s.h1}>AdConfirm Dashboard</h1>
            <p style={s.sub}>Acme Supplies Ltd</p>
          </div>
          <a
            href="/signup"
            style={{
              padding: '8px 16px',
              background: '#0052FF',
              borderRadius: '6px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Get Started Free
          </a>
        </div>

        {/* Stat cards */}
        <div style={s.cards}>
          <div style={s.card}>
            <p style={s.cardLabel}>Receipts Processed</p>
            <p style={s.cardValue}>47</p>
            <p style={s.cardSub}>this month</p>
          </div>

          <div style={s.card}>
            <p style={s.cardLabel}>Ads Delivered</p>
            <p style={s.cardValue}>312</p>
            <p style={s.cardSub}>all time</p>
          </div>

          <div style={s.card}>
            <p style={s.cardLabel}>Xero Status</p>
            <p style={{ ...s.cardValue, fontSize: '24px', color: '#00E5A0' }}>Connected</p>
            <p style={s.cardSub}>Acme Supplies Ltd</p>
            <p style={s.cardSub}>Last sync: Today at 09:41</p>
          </div>
        </div>

        {/* Chart */}
        <div style={s.chartSection}>
          <p style={s.sectionTitle}>Daily Ad Deliveries — Last 30 Days</p>
          <DemoChart />
        </div>

        {/* Recent receipts table */}
        <div style={s.tableWrap}>
          <p style={s.tableHeader}>Recent Receipts</p>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={s.th}>Business</th>
                <th style={s.th}>Amount</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Ad Delivered</th>
              </tr>
            </thead>
            <tbody>
              {RECEIPTS.map((r) => (
                <tr key={r.business + r.date} style={{ background: 'transparent' }}>
                  <td style={s.td}>{r.business}</td>
                  <td style={{ ...s.td, fontFamily: 'monospace' }}>{r.amount}</td>
                  <td style={s.tdMuted}>{r.date}</td>
                  <td style={s.td}>
                    <span style={s.badge}>{r.headline}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
