'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReceiptRow {
  id: string
  created_at: string
  issued_at: string
  total_cents: number
  currency: string
  channel: string
  email_failed: boolean
  receipt_ad_placements: Array<{
    ad_creatives: { headline: string } | null
  }>
}

type Range = 'today' | '7d' | '30d' | 'all'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rangeStart(range: Range): string | null {
  const d = new Date()
  if (range === 'today') {
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }
  if (range === '7d') {
    d.setDate(d.getDate() - 6)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }
  if (range === '30d') {
    d.setDate(d.getDate() - 29)
    d.setHours(0, 0, 0, 0)
    return d.toISOString()
  }
  return null // all time
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtAmount(cents: number, currency: string) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: currency || 'GBP' }).format(cents / 100)
}

function channelLabel(ch: string) {
  if (ch === 'xero') return 'Xero'
  if (ch === 'eposnow') return 'Epos Now'
  return ch
}

function adHeadline(r: ReceiptRow) {
  return r.receipt_ad_placements?.[0]?.ad_creatives?.headline ?? '—'
}

function emailStatus(r: ReceiptRow) {
  if (!r.email_failed) return 'Sent'
  return 'Failed'
}

// Build bar chart data: receipts per day for the selected range (max 30 days)
function buildChartData(receipts: ReceiptRow[], range: Range) {
  const days = range === 'today' ? 1 : range === '7d' ? 7 : 30
  const buckets: Record<string, number> = {}

  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]!
    buckets[key] = 0
  }

  for (const r of receipts) {
    const key = r.issued_at.split('T')[0] ?? r.created_at.split('T')[0]!
    if (key in buckets) buckets[key] = (buckets[key] ?? 0) + 1
  }

  return Object.entries(buckets).map(([date, count]) => ({
    date: date.slice(5), // MM-DD
    count,
  }))
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCSV(receipts: ReceiptRow[]) {
  const header = 'Date,Amount,Currency,Channel,Ad Shown,Email Status'
  const rows = receipts.map(r =>
    [
      fmtDate(r.issued_at),
      (r.total_cents / 100).toFixed(2),
      r.currency,
      channelLabel(r.channel),
      `"${adHeadline(r).replace(/"/g, '""')}"`,
      emailStatus(r),
    ].join(',')
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `receipts-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Component ────────────────────────────────────────────────────────────────

const TOOLTIP_STYLE = {
  background: '#0D1629', border: '1px solid #1A2540',
  borderRadius: '8px', color: '#F0F4FF', fontSize: '12px',
}

export function ReceiptHistory({ businessId }: { businessId: string }) {
  const [range, setRange] = useState<Range>('30d')
  const [receipts, setReceipts] = useState<ReceiptRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReceipts = useCallback(async (r: Range) => {
    setLoading(true)
    const supabase = createClient()
    const from = rangeStart(r)

    let query = supabase
      .from('receipts')
      .select(`
        id, created_at, issued_at, total_cents, currency, channel, email_failed,
        receipt_ad_placements(
          ad_creatives(headline)
        )
      `)
      .eq('business_id', businessId)
      .order('issued_at', { ascending: false })
      .limit(500)

    if (from) query = query.gte('issued_at', from)

    const { data, error } = await query
    if (!error && data) setReceipts(data as ReceiptRow[])
    setLoading(false)
  }, [businessId])

  useEffect(() => { fetchReceipts(range) }, [range, fetchReceipts])

  const chartData = buildChartData(receipts, range === 'all' ? '30d' : range)
  const tableRows = receipts.slice(0, 20)

  const RANGES: { key: Range; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: '7d', label: 'Last 7 days' },
    { key: '30d', label: 'Last 30 days' },
    { key: 'all', label: 'All time' },
  ]

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Section header + controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#F0F4FF', margin: 0 }}>
          Receipt History
        </h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Date range filter */}
          <div style={{ display: 'flex', gap: '4px', background: '#0D1629', border: '1px solid #1A2540', borderRadius: '8px', padding: '4px' }}>
            {RANGES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setRange(key)}
                style={{
                  padding: '5px 12px', borderRadius: '5px', border: 'none',
                  fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                  background: range === key ? '#1A2540' : 'transparent',
                  color: range === key ? '#F0F4FF' : '#8A9BC4',
                  transition: 'background 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {/* CSV export */}
          <button
            onClick={() => exportCSV(receipts)}
            disabled={receipts.length === 0}
            style={{
              padding: '6px 14px', background: '#1A2540', color: '#8A9BC4',
              border: '1px solid #1A2540', borderRadius: '6px', fontSize: '12px',
              cursor: receipts.length === 0 ? 'default' : 'pointer',
              opacity: receipts.length === 0 ? 0.5 : 1,
            }}
          >
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* Bar chart */}
      {range !== 'all' && (
        <div style={{ background: '#0D1629', border: '1px solid #1A2540', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
          <p style={{ color: '#8A9BC4', fontSize: '12px', margin: '0 0 16px' }}>
            Receipts per day
          </p>
          {loading ? (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A5568', fontSize: '13px' }}>
              Loading…
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A2540" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#8A9BC4', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval={range === 'today' ? 0 : range === '7d' ? 0 : 4}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#8A9BC4', fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelStyle={{ color: '#8A9BC4', marginBottom: 4 }}
                  formatter={(v: number) => [v, 'receipts']}
                />
                <Bar dataKey="count" fill="#0052FF" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Receipts table */}
      <div style={{ background: '#0D1629', border: '1px solid #1A2540', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1A2540', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#F0F4FF' }}>
            Recent receipts
          </span>
          <span style={{ fontSize: '12px', color: '#4A5568' }}>
            {loading ? '…' : `${receipts.length} total${receipts.length > 20 ? ', showing 20' : ''}`}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#4A5568', fontSize: '13px' }}>
            Loading…
          </div>
        ) : tableRows.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#4A5568', fontSize: '13px' }}>
            No receipts in this date range.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1A2540' }}>
                  {['Date', 'Amount', 'Channel', 'Ad shown', 'Email'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#8A9BC4', fontWeight: 500, fontSize: '11px', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(26,37,64,0.6)' }}>
                    <td style={{ padding: '11px 16px', color: '#8A9BC4', whiteSpace: 'nowrap' }}>
                      {fmtDate(r.issued_at)}
                    </td>
                    <td style={{ padding: '11px 16px', color: '#F0F4FF', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                      {fmtAmount(r.total_cents, r.currency)}
                    </td>
                    <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                        background: r.channel === 'xero' ? 'rgba(0,82,255,0.15)' : 'rgba(0,229,160,0.12)',
                        color: r.channel === 'xero' ? '#4F9FFF' : '#00E5A0',
                      }}>
                        {channelLabel(r.channel)}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', color: '#8A9BC4', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {adHeadline(r)}
                    </td>
                    <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '11px',
                        background: r.email_failed ? 'rgba(255,59,92,0.15)' : 'rgba(0,229,160,0.12)',
                        color: r.email_failed ? '#FF9090' : '#00E5A0',
                      }}>
                        {emailStatus(r)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
