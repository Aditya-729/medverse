'use client';

import React from 'react';
import { Delete, Check, RotateCcw } from 'lucide-react';

interface VirtualNumpadProps {
  onDigitPress: (digit: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onConfirm: () => void;
}

export default function VirtualNumpad({
  onDigitPress,
  onBackspace,
  onClear,
  onConfirm,
}: VirtualNumpadProps) {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full max-w-sm mx-auto bg-slate-100 p-4 rounded-3xl border border-slate-300 shadow-inner">
      <div className="grid grid-cols-3 gap-3">
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            onClick={() => onDigitPress(digit)}
            className="touch-btn h-16 w-full bg-white hover:bg-sky-50 text-slate-900 border border-slate-200 shadow rounded-2xl text-2xl font-bold active:scale-95 active:bg-sky-100 transition"
          >
            {digit}
          </button>
        ))}

        {/* Clear Button */}
        <button
          type="button"
          onClick={onClear}
          className="touch-btn h-16 w-full bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 shadow rounded-2xl text-sm font-bold flex flex-col items-center justify-center active:scale-95 transition"
          title="Clear all digits"
        >
          <RotateCcw className="h-5 w-5 mb-0.5" />
          <span>Clear</span>
        </button>

        {/* 0 Button */}
        <button
          type="button"
          onClick={() => onDigitPress('0')}
          className="touch-btn h-16 w-full bg-white hover:bg-sky-50 text-slate-900 border border-slate-200 shadow rounded-2xl text-2xl font-bold active:scale-95 active:bg-sky-100 transition"
        >
          0
        </button>

        {/* Backspace Button */}
        <button
          type="button"
          onClick={onBackspace}
          className="touch-btn h-16 w-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 shadow rounded-2xl text-sm font-bold flex flex-col items-center justify-center active:scale-95 transition"
          title="Backspace"
        >
          <Delete className="h-5 w-5 mb-0.5 text-amber-800" />
          <span>Del</span>
        </button>
      </div>

      {/* Large Confirm Button */}
      <button
        type="button"
        onClick={onConfirm}
        className="touch-btn mt-3 h-14 w-full bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-lg font-extrabold flex items-center justify-center space-x-2 shadow-lg active:scale-98 transition"
      >
        <Check className="h-6 w-6 stroke-[3]" />
        <span>Confirm Number / आगे बढ़ें</span>
      </button>
    </div>
  );
}
