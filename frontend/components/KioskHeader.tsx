'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ShieldAlert, FileText, UserCheck, Stethoscope, HeartPulse, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '@/lib/translations';

interface KioskHeaderProps {
  mode?: 'ALLOPATHIC' | 'AYUSH';
  onModeToggle?: (mode: 'ALLOPATHIC' | 'AYUSH') => void;
  showModeToggle?: boolean;
  currentLang?: SupportedLanguage;
  onLangChange?: (lang: SupportedLanguage) => void;
}

export default function KioskHeader({
  mode = 'ALLOPATHIC',
  onModeToggle,
  showModeToggle = false,
  currentLang = 'hi',
  onLangChange,
}: KioskHeaderProps) {
  const pathname = usePathname();

  const steps = [
    { name: '1. Registration', href: '/kiosk/onboarding', icon: UserCheck },
    { name: '2. AI Interview', href: '/kiosk/interview', icon: Activity },
    { name: '3. Scan Records', href: '/kiosk/scan', icon: FileText },
    { name: '4. Summary Slip', href: '/kiosk/summary', icon: HeartPulse },
  ];

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Hospital Brand & Kiosk Title */}
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-sky-600 to-emerald-600 flex items-center justify-center text-white shadow-md">
              <HeartPulse className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                  Med<span className="text-sky-600">verse</span>
                </span>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  ABDM Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                AIIMS & AYUSH Integrated Hospital Smart Intake
              </p>
            </div>
          </div>

          {/* Stepper Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {steps.map((step) => {
              const isActive = pathname === step.href;
              const Icon = step.icon;
              return (
                <Link
                  key={step.href}
                  href={step.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-sky-600 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{step.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Mode Switcher & Doctor Link */}
          <div className="flex items-center space-x-3">
            {showModeToggle && onModeToggle && (
              <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
                <button
                  type="button"
                  onClick={() => onModeToggle('ALLOPATHIC')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'ALLOPATHIC'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Allopathic (SOCRATES)
                </button>
                <button
                  type="button"
                  onClick={() => onModeToggle('AYUSH')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'AYUSH'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  AYUSH (Pariksha)
                </button>
              </div>
            )}

            {/* Language Selector Dropdown */}
            {onLangChange && (
              <div className="flex items-center space-x-1 bg-slate-100 px-2 py-1 rounded-xl border border-slate-200">
                <Globe className="h-4 w-4 text-slate-500" />
                <select
                  value={currentLang}
                  onChange={(e) => onLangChange(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeLabel} ({lang.label})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Link
              href="/dashboard/doctor"
              className="touch-btn bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 py-2 rounded-xl flex items-center space-x-1.5 font-bold shadow transition"
              title="Switch to Doctor Command Center"
            >
              <Stethoscope className="h-4 w-4 text-emerald-400" />
              <span>Doctor Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
