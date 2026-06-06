'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

// 30 days May 8 → Jun 6, daily ad deliveries (~312 total)
const DATA = [
  { day: 'May 8',  ads: 6  },
  { day: 'May 9',  ads: 8  },
  { day: 'May 10', ads: 7  },
  { day: 'May 11', ads: 9  },
  { day: 'May 12', ads: 11 },
  { day: 'May 13', ads: 10 },
  { day: 'May 14', ads: 12 },
  { day: 'May 15', ads: 11 },
  { day: 'May 16', ads: 13 },
  { day: 'May 17', ads: 10 },
  { day: 'May 18', ads: 12 },
  { day: 'May 19', ads: 14 },
  { day: 'May 20', ads: 12 },
  { day: 'May 21', ads: 15 },
  { day: 'May 22', ads: 16 },
  { day: 'May 23', ads: 18 },
  { day: 'May 24', ads: 15 },
  { day: 'May 25', ads: 17 },
  { day: 'May 26', ads: 13 },
  { day: 'May 27', ads: 14 },
  { day: 'May 28', ads: 12 },
  { day: 'May 29', ads: 10 },
  { day: 'May 30', ads: 9  },
  { day: 'May 31', ads: 8  },
  { day: 'Jun 1',  ads: 7  },
  { day: 'Jun 2',  ads: 6  },
  { day: 'Jun 3',  ads: 5  },
  { day: 'Jun 4',  ads: 6  },
  { day: 'Jun 5',  ads: 5  },
  { day: 'Jun 6',  ads: 8  },
]

const TOOLTIP_STYLE = {
  background: '#0D1629',
  border: '1px solid #1A2540',
  borderRadius: '8px',
  color: '#F0F4FF',
  fontSize: '13px',
}

export default function DemoChart() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={DATA} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1A2540" />
        <XAxis
          dataKey="day"
          tick={{ fill: '#8A9BC4', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          interval={4}
        />
        <YAxis
          tick={{ fill: '#8A9BC4', fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={TOOLTIP_STYLE}
          labelStyle={{ color: '#8A9BC4', marginBottom: 4 }}
          formatter={(v: number) => [v, 'Ads delivered']}
        />
        <Line
          type="monotone"
          dataKey="ads"
          stroke="#00E5A0"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#00E5A0' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
