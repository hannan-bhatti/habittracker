import type React from 'react';
import { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Activity, BarChart3 } from 'lucide-react';
import type { DailyChartPoint } from '../types/habit';

interface TooltipPayloadItem {
  payload: DailyChartPoint;
}

interface CustomChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

/**
 * Declared outside the component to prevent recreation during render (fixes Oxlint static-components warning).
 */
export const CustomChartTooltip: React.FC<CustomChartTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-lg text-slate-800 dark:text-slate-200 backdrop-blur-xs">
        <p className="font-bold text-xs text-slate-900 dark:text-slate-100">
          {data.fullDay} <span className="text-slate-400 font-normal">({data.date})</span>
        </p>
        <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
          {data.completed} of {data.total} completed ({data.percentage}%)
        </p>
      </div>
    );
  }
  return null;
};

interface WeeklyChartProps {
  chartData: DailyChartPoint[];
  isDarkMode: boolean;
}

export const WeeklyChart: React.FC<WeeklyChartProps> = ({ chartData, isDarkMode }) => {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
            Weekly Progress Trend
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Completion percentage across the selected week.
          </p>
        </div>
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setChartType('area')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              chartType === 'area'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Wave
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              chartType === 'bar'
                ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Bars
          </button>
        </div>
      </div>

      <div className="h-48 sm:h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
            >
              <defs>
                <linearGradient id="tealSkyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDarkMode ? '#1e293b' : '#f1f5f9'}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10 }}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="#0d9488"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tealSkyGrad)"
                activeDot={{ r: 5, fill: '#0284c7', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={isDarkMode ? '#1e293b' : '#f1f5f9'}
              />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10 }}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Bar
                dataKey="percentage"
                fill="#0d9488"
                radius={[6, 6, 0, 0]}
                maxBarSize={38}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
