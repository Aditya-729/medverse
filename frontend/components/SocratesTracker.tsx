'use client';

import React from 'react';

interface SocratesTrackerProps {
  currentStep: string;
}

const SOCRATES_STEPS = [
  { key: 'SITE', label: 'Site', desc: 'Location' },
  { key: 'ONSET', label: 'Onset', desc: 'When started' },
  { key: 'CHARACTER', label: 'Character', desc: 'Pain type' },
  { key: 'RADIATION', label: 'Radiation', desc: 'Spreads where' },
  { key: 'ASSOCIATIONS', label: 'Associations', desc: 'Other signs' },
  { key: 'TIME_COURSE', label: 'Time', desc: 'Pattern' },
  { key: 'EXACERBATING', label: 'Factors', desc: 'Triggers/relief' },
  { key: 'SEVERITY', label: 'Severity', desc: '1 - 10 Scale' },
];

export default function SocratesTracker({ currentStep }: SocratesTrackerProps) {
  const currentIndex = SOCRATES_STEPS.findIndex(
    (s) => s.key.toLowerCase() === currentStep.toLowerCase()
  );

  return (
    <div className="w-full bg-slate-50 border-b border-slate-200 py-2.5 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
          <span className="flex items-center space-x-1.5 text-sky-700">
            <span className="h-2 w-2 rounded-full bg-sky-600 animate-ping"></span>
            <span>Allopathic Framework: SOCRATES Clinical Interview</span>
          </span>
          <span>
            Stage {Math.max(1, currentIndex + 1)} of {SOCRATES_STEPS.length}
          </span>
        </div>

        <div className="grid grid-cols-8 gap-1 sm:gap-2">
          {SOCRATES_STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex || (currentIndex === -1 && idx === 0);

            return (
              <div
                key={step.key}
                className={`flex flex-col items-center py-1.5 px-1 rounded-lg border text-center transition-all ${
                  isCurrent
                    ? 'bg-sky-600 text-white border-sky-700 shadow font-bold scale-105'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-400 border-slate-200'
                }`}
              >
                <span className="text-[11px] leading-tight uppercase tracking-wider font-extrabold">
                  {step.label}
                </span>
                <span
                  className={`text-[9px] hidden sm:block truncate ${
                    isCurrent ? 'text-sky-100' : 'text-slate-500'
                  }`}
                >
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
