'use client';

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { GlucoseTrendPoint } from '../lib/types';

interface LabTrendsChartProps {
  data: GlucoseTrendPoint[];
}

export default function LabTrendsChart({ data }: LabTrendsChartProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
            <span>Glycemic & Metabolic Trend (Last 4 Months)</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Uncontrolled HbA1c
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Fasting & Post-Prandial Blood Glucose (mg/dL) vs HbA1c (%)
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400">Target Range:</span>{' '}
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
            FBS &lt; 100 | PP &lt; 140 | HbA1c &lt; 6.5%
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis
              yAxisId="left"
              domain={[80, 280]}
              stroke="#0284c7"
              fontSize={12}
              unit=" mg"
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[5.0, 10.0]}
              stroke="#dc2626"
              fontSize={12}
              unit=" %"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#cbd5e1',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                fontSize: '12px',
                fontWeight: 600,
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            
            {/* Reference threshold lines */}
            <ReferenceLine yAxisId="left" y={100} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Norm Fasting', fill: '#10b981', fontSize: 10 }} />
            <ReferenceLine yAxisId="left" y={140} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Norm PP', fill: '#f59e0b', fontSize: 10 }} />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="fasting"
              name="Fasting Glucose (mg/dL)"
              stroke="#0284c7"
              strokeWidth={3}
              dot={{ r: 5, fill: '#0284c7' }}
              activeDot={{ r: 7 }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="postPrandial"
              name="PP Glucose (mg/dL)"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ r: 5, fill: '#8b5cf6' }}
              activeDot={{ r: 7 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="hba1c"
              name="HbA1c (%)"
              stroke="#dc2626"
              strokeWidth={3}
              strokeDasharray="4 2"
              dot={{ r: 6, fill: '#dc2626' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
