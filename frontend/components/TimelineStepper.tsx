'use client';

import React, { useState } from 'react';
import { TimelineItem } from '../lib/types';
import { Calendar, FileText, AlertCircle, CheckCircle2, ChevronRight, Stethoscope } from 'lucide-react';

interface TimelineStepperProps {
  items: TimelineItem[];
}

export default function TimelineStepper({ items }: TimelineStepperProps) {
  const [filter, setFilter] = useState<string>('ALL');

  const filteredItems = items.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'ABNORMAL') return item.is_abnormal;
    return item.category.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-sky-600" />
            <span>Chronological Medical Timeline</span>
          </h3>
          <p className="text-xs text-slate-500">
            Unified records from scanned documents, past OPD visits & AYUSH consultations
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {['ALL', 'ABNORMAL', 'Lab Report', 'Prescription', 'AYUSH'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-lg transition ${
                filter === cat
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'ABNORMAL' ? '⚠️ Abnormal Only' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Vertical Stepper */}
      <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
        {filteredItems.map((item, index) => {
          const isLab = item.category.toLowerCase().includes('lab');
          const isAyush = item.category.toLowerCase().includes('ayush');
          const isEmergency = item.category.toLowerCase().includes('emergency');

          return (
            <div key={index} className="relative pl-6 group">
              {/* Stepper Dot */}
              <div
                className={`absolute -left-[11px] top-1.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  item.is_abnormal || isEmergency
                    ? 'bg-rose-500 border-white ring-4 ring-rose-100 shadow-sm'
                    : isAyush
                    ? 'bg-emerald-600 border-white ring-4 ring-emerald-100 shadow-sm'
                    : 'bg-sky-600 border-white ring-4 ring-sky-100 shadow-sm'
                }`}
              >
                {item.is_abnormal ? (
                  <AlertCircle className="h-3 w-3 text-white" />
                ) : (
                  <CheckCircle2 className="h-3 w-3 text-white" />
                )}
              </div>

              {/* Event Content Card */}
              <div className="bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200 transition">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800">
                      {item.date}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        isEmergency
                          ? 'bg-rose-100 text-rose-800'
                          : isAyush
                          ? 'bg-emerald-100 text-emerald-800'
                          : isLab
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>
                  {item.is_abnormal && (
                    <span className="text-[11px] font-bold text-rose-600 flex items-center space-x-1">
                      <span>Out of Range</span>
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="pl-6 text-xs text-slate-400 italic">
            No events match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
