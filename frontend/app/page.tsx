import React from 'react';
import Link from 'next/link';
import { 
  HeartPulse, 
  Stethoscope, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  Flame,
  Globe2,
  BookOpen
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-100 flex flex-col">
      {/* Top Banner */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-emerald-600 flex items-center justify-center text-white shadow-md">
              <HeartPulse className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-2xl tracking-tight text-slate-900">
                  Med<span className="text-sky-600">verse</span>
                </span>
                <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  AYUSH + Allopathic
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Autonomous Patient Intake & Clinical History Platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/overview"
              className="touch-btn px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs transition"
            >
              <BookOpen className="h-4 w-4 text-sky-600" />
              <span>Project Summary</span>
            </Link>
            <Link
              href="/dashboard/doctor"
              className="touch-btn px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow transition"
            >
              <Stethoscope className="h-4 w-4 text-emerald-400" />
              <span>Doctor Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold mb-4 shadow-xs">
            <Sparkles className="h-4 w-4 text-sky-600" />
            <span>Built for High-Throughput Indian Government Hospitals & AYUSH Centers</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-none mb-4">
            Next-Gen Autonomous <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600">
              Clinical Intake & History
            </span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed font-medium">
            Bridging modern allopathic intake (SOCRATES framework) with traditional Ayurvedic Dashavidha Pariksha, instant OCR record timeline sorting, and emergency red-flag triage.
          </p>
        </div>

        {/* Primary Role Selector Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
          
          {/* Card 1: Patient Kiosk Mode */}
          <div className="bg-white rounded-3xl p-8 border-2 border-sky-200 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-36 h-36 bg-sky-50 rounded-bl-full -z-0"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="h-16 w-16 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <HeartPulse className="h-9 w-9" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-sky-100 text-sky-800 border border-sky-300">
                  Touchscreen Optimized (48px+)
                </span>
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-2">
                Patient Self-Service Kiosk
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Designed for public hospital lobbies. Patients register with ABHA/phone, converse with the Multimodal AI doctor in Allopathic or AYUSH mode, scan previous prescription documents, and receive a verified clinical summary token.
              </p>

              <ul className="space-y-2.5 mb-8 text-xs font-semibold text-slate-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>ABHA ID & Virtual Numpad with ABDM Consent</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>SOCRATES & Ayurvedic Dashavidha Pariksha State Machine</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Real-time Red-Flag Emergency Detection Middleware</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>Camera Viewfinder Document OCR & Receipt Generator</span>
                </li>
              </ul>
            </div>

            <Link
              href="/kiosk/onboarding"
              className="touch-btn w-full bg-sky-600 hover:bg-sky-700 text-white rounded-2xl text-lg font-bold flex items-center justify-center space-x-2 shadow-lg shadow-sky-600/30 group-hover:bg-sky-500 transition relative z-10"
            >
              <span>Start Patient Kiosk / कियोस्क शुरू करें</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Card 2: Doctor Dashboard */}
          <div className="bg-slate-900 rounded-3xl p-8 border-2 border-slate-800 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between group text-white">
            <div className="absolute top-0 right-0 w-36 h-36 bg-slate-800/50 rounded-bl-full -z-0"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Stethoscope className="h-9 w-9" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Physician Command Center
                </span>
              </div>

              <h2 className="text-2xl font-black text-white mb-2">
                Doctor OPD Dashboard
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Equips hospital doctors to triage high-volume queues. Red-flag patients are highlighted at the top. Review editable AI summaries with Accept/Edit/Reject, inspect chronological timelines, and check 4-month Recharts lab trends.
              </p>

              <ul className="space-y-2.5 mb-8 text-xs font-semibold text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Real-time Triage Queue with Red-Flag Emergency Alerts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Editable AI Summary Panel with Doctor Accept/Reject Actions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>Interactive 4-Month Recharts Glycemic & Metabolic Trend Line</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span>pgvector Matched Historically Similar Cases & Outcomes</span>
                </li>
              </ul>
            </div>

            <Link
              href="/dashboard/doctor"
              className="touch-btn w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl text-lg font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition relative z-10"
            >
              <span>Open Doctor Dashboard</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto w-full">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs">
            <Globe2 className="h-6 w-6 text-sky-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-900">ABHA & FHIR R4</div>
            <div className="text-xs text-slate-500">ABDM compliant JSON schemas</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs">
            <Flame className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-900">Dashavidha Pariksha</div>
            <div className="text-xs text-slate-500">Ayurvedic Prakriti & Agni eval</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs">
            <Activity className="h-6 w-6 text-rose-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-900">Red-Flag Safety</div>
            <div className="text-xs text-slate-500">Instant acute triage alerting</div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-xs">
            <Sparkles className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-900">Vector Similar Cases</div>
            <div className="text-xs text-slate-500">pgvector embedding search</div>
          </div>
        </div>
      </main>
    </div>
  );
}
