'use client';

import React from 'react';

interface AyushTrackerProps {
  currentStep: string;
}

const AYUSH_STEPS = [
  { key: 'PRAKRITI', label: 'Prakriti', desc: 'Constitution' },
  { key: 'VIKRITI', label: 'Vikriti', desc: 'Dosha Vitiation' },
  { key: 'AGNI', label: 'Agni', desc: 'Digestive Fire' },
  { key: 'KOSHTHA', label: 'Koshtha', desc: 'Bowel Habit' },
  { key: 'SARA_SAMHANANA', label: 'Sara/Bala', desc: 'Tissue Strength' },
  { key: 'SATMYA_AHARA', label: 'Satmya', desc: 'Diet Suitability' },
  { key: 'SATVA_VAYA', label: 'Satva', desc: 'Mental Resilience' },
];

export default function AyushTracker({ currentStep }: AyushTrackerProps) {
  const currentIndex = AYUSH_STEPS.findIndex(
    (s) => s.key.toLowerCase() === currentStep.toLowerCase()
  );

  return (
    <div className="w-full bg-emerald-50 border-b border-emerald-200 py-2.5 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between text-xs font-bold text-emerald-800 mb-1.5">
          <span className="flex items-center space-x-1.5 text-emerald-900">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>AYUSH Framework: Dashavidha Pariksha (दशविध परीक्षा)</span>
          </span>
          <span>
            Stage {Math.max(1, currentIndex + 1)} of {AYUSH_STEPS.length}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {AYUSH_STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex || (currentIndex === -1 && idx === 0);

            return (
              <div
                key={step.key}
                className={`flex flex-col items-center py-1.5 px-1 rounded-lg border text-center transition-all ${
                  isCurrent
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow font-bold scale-105'
                    : isCompleted
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-white text-slate-400 border-slate-200'
                }`}
              >
                <span className="text-[11px] leading-tight font-extrabold">
                  {step.label}
                </span>
                <span
                  className={`text-[9px] hidden sm:block truncate ${
                    isCurrent ? 'text-emerald-100' : 'text-slate-500'
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
