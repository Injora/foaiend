import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#ec4899',
  '#f97316',
  '#14b8a6',
  '#6366f1',
];

export default function Charts({ speedHistory, articles }) {
  const { theme } = useTheme();

  // Compute news distribution by source
  const sourceDistribution = articles.reduce((acc, article) => {
    const source = article.source?.name || 'Unknown';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(sourceDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const axisColor = theme === 'dark' ? '#64748b' : '#94a3b8';
  const gridColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tooltipText = theme === 'dark' ? '#e2e8f0' : '#1e293b';

  return (
    <section id="charts-section" className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-1">
        <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2
            className={`text-lg font-bold ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            Data Visualization
          </h2>
          <p
            className={`text-xs ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Real-time charts and analytics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speed Line Chart */}
        <div
          className={`rounded-xl border p-5 transition-all ${
            theme === 'dark'
              ? 'border-slate-700/50 bg-slate-800/40'
              : 'border-slate-200 bg-white shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp
              className={`w-4 h-4 ${
                theme === 'dark' ? 'text-primary-400' : 'text-primary-600'
              }`}
            />
            <h3
              className={`text-sm font-bold ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              ISS Speed Over Time
            </h3>
            <span
              className={`ml-auto text-xs ${
                theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              Last {speedHistory.length} readings
            </span>
          </div>

          {speedHistory.length < 2 ? (
            <div
              className={`flex items-center justify-center h-52 rounded-lg border border-dashed ${
                theme === 'dark'
                  ? 'border-slate-700 text-slate-500'
                  : 'border-slate-300 text-slate-400'
              }`}
            >
              <p className="text-sm font-medium">
                Waiting for speed data... ({speedHistory.length}/2 readings)
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={speedHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="time"
                  tick={{ fill: axisColor, fontSize: 10 }}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 10 }}
                  axisLine={{ stroke: gridColor }}
                  tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '10px',
                    color: tooltipText,
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  formatter={(value) => [`${value.toLocaleString()} km/h`, 'Speed']}
                />
                <Line
                  type="monotone"
                  dataKey="speed"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* News Distribution Pie Chart */}
        <div
          className={`rounded-xl border p-5 transition-all ${
            theme === 'dark'
              ? 'border-slate-700/50 bg-slate-800/40'
              : 'border-slate-200 bg-white shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <PieIcon
              className={`w-4 h-4 ${
                theme === 'dark' ? 'text-accent-400' : 'text-accent-600'
              }`}
            />
            <h3
              className={`text-sm font-bold ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              News by Source
            </h3>
            <span
              className={`ml-auto text-xs ${
                theme === 'dark' ? 'text-slate-500' : 'text-slate-400'
              }`}
            >
              {pieData.length} sources
            </span>
          </div>

          {pieData.length === 0 ? (
            <div
              className={`flex items-center justify-center h-52 rounded-lg border border-dashed ${
                theme === 'dark'
                  ? 'border-slate-700 text-slate-500'
                  : 'border-slate-300 text-slate-400'
              }`}
            >
              <p className="text-sm font-medium">No news data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: '10px',
                    color: tooltipText,
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  formatter={(value, name) => [`${value} article(s)`, name]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', color: axisColor }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
