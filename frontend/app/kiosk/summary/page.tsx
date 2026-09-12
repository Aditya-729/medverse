'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KioskHeader from '@/components/KioskHeader';
import AudioGuideButton from '@/components/AudioGuideButton';
import { 
  CheckCircle2, 
  Edit3, 
  Printer, 
  QrCode, 
  HeartPulse, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  ShieldCheck,
  Stethoscope,
  Sparkles
} from 'lucide-react';

export default function SummaryPage() {
  const router = useRouter();

  // Patient & Clinical state
  const [patientData, setPatientData] = useState({
    name: 'Ramesh Kumar Sharma',
    age: 52,
    gender: 'Male',
    abhaId: '14-8921-7734-0192',
    phone: '+91 98765 43210',
    chiefComplaint: 'Uncontrolled Blood Sugar, Post-Prandial Lethargy & Fatigue',
    symptoms: [
      { name: 'Persistent Fatigue / Sluggishness', duration: 'Past 3 Weeks', severity: 'Moderate (6/10)' },
      { name: 'Increased Thirst (Polydipsia)', duration: 'Past 2 Weeks', severity: 'Mild (4/10)' },
      { name: 'Sluggish Digestion (Mandagni)', duration: 'Chronic', severity: 'Variable' },
    ],
    medicines: [
      { name: 'Metformin Hydrochloride', dose: '500 mg', frequency: 'Twice daily after meals (BD)' },
      { name: 'Telmisartan', dose: '40 mg', frequency: 'Once daily morning (OD)' },
      { name: 'Yogaraj Guggulu (Ayurvedic)', dose: '2 Tablets', frequency: 'Twice daily with warm water' },
    ],
    allergies: ['Penicillin (Moderate Rash)', 'No Known Herbal Allergies'],
    vitals: { bp: '142/88 mmHg', pulse: '76 bpm', temp: '98.4 F', spo2: '98%' },
    triageLevel: 'NORMAL',
    tokenNumber: 'OPD-AIIMS-A104',
    counter: 'Room 12 (Internal Medicine & AYUSH Clinic)'
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPatient = sessionStorage.getItem('medverse_patient') || sessionStorage.getItem('medikiosk_patient');
      const savedSummary = sessionStorage.getItem('medverse_summary') || sessionStorage.getItem('medikiosk_summary');
      const savedOcr = sessionStorage.getItem('medverse_scanned_ocr') || sessionStorage.getItem('medikiosk_scanned_ocr');

      if (savedPatient) {
        try {
          const p = JSON.parse(savedPatient);
          setPatientData((prev) => ({
            ...prev,
            name: p.name || prev.name,
            age: p.age || prev.age,
            gender: p.gender || prev.gender,
            abhaId: p.identifier || prev.abhaId,
          }));
        } catch (e) {}
      }

      if (savedSummary) {
        try {
          const s = JSON.parse(savedSummary);
          if (s.is_red_flag) {
            setPatientData((prev) => ({
              ...prev,
              triageLevel: 'EMERGENCY_RED_FLAG',
              tokenNumber: 'EMERG-AIIMS-RED01',
              counter: 'Emergency Resuscitation Bay 2',
              chiefComplaint: s.chief_complaint || prev.chiefComplaint
            }));
          }
        } catch (e) {}
      }
    }
  }, []);

  const handleConfirm = () => {
    setIsConfirmed(true);
  };

  const handlePrintSlip = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const summaryAudio = 
    "Please check your hospital intake slip on screen. Verify your recorded symptoms, current medicines, and allergies. If correct, tap the green Correct button to receive your OPD token.";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <KioskHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col justify-between">
        
        {/* Header Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-sky-700 bg-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Step 4 of 4: Patient Verification
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Intake Summary &amp; OPD Slip
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              मरीज पर्ची सत्यापन • Verify your extracted symptoms, medications, and allergies.
            </p>
          </div>

          <AudioGuideButton 
            textToSpeak={summaryAudio} 
            label="Audio Verification Guide" 
          />
        </div>

        {/* RECEIPT-LIKE CLINICAL SLIP */}
        <div className="receipt-paper rounded-3xl p-6 sm:p-10 border border-slate-300 shadow-xl mb-6 font-sans">
          
          {/* Slip Header */}
          <div className="border-b-2 border-dashed border-slate-300 pb-6 text-center relative">
            <div className="inline-flex items-center space-x-2 text-sky-700 font-extrabold text-sm mb-1">
              <HeartPulse className="h-5 w-5" />
              <span>ALL INDIA INSTITUTE OF MEDICAL SCIENCES &amp; AYUSH CENTER</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              MEDVERSE PATIENT CLINICAL INTAKE SLIP
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              National Health Authority • Ayushman Bharat Digital Mission (ABDM)
            </p>

            {/* Token Highlight Box */}
            <div className={`mt-4 inline-block px-6 py-3 rounded-2xl border-2 ${
              patientData.triageLevel === 'EMERGENCY_RED_FLAG'
                ? 'bg-rose-50 border-rose-500 text-rose-900 animate-red-flag'
                : 'bg-sky-50 border-sky-600 text-sky-950'
            }`}>
              <div className="text-xs uppercase font-extrabold tracking-widest text-slate-500">
                Assigned OPD Queue Token
              </div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight mt-0.5">
                {patientData.tokenNumber}
              </div>
              <div className="text-xs font-bold text-slate-600 mt-1 flex items-center justify-center space-x-1">
                <Clock className="h-3.5 w-3.5 text-sky-600" />
                <span>Assigned: {patientData.counter}</span>
              </div>
            </div>
          </div>

          {/* Demographic Grid */}
          <div className="py-5 border-b-2 border-dashed border-slate-300 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold block">Patient Name:</span>
              <span className="font-extrabold text-slate-900 text-sm">{patientData.name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">Age / Gender:</span>
              <span className="font-extrabold text-slate-900 text-sm">{patientData.age} Yrs / {patientData.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">ABHA Number:</span>
              <span className="font-extrabold text-slate-900 text-sm">{patientData.abhaId}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">Triage Status:</span>
              <span className={`font-black text-sm px-2 py-0.5 rounded-full inline-block ${
                patientData.triageLevel === 'EMERGENCY_RED_FLAG'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {patientData.triageLevel === 'EMERGENCY_RED_FLAG' ? '🚨 LEVEL 1 RED-FLAG' : '✓ Normal OPD'}
              </span>
            </div>
          </div>

          {/* Section 1: Chief Complaint & Extracted Symptoms */}
          <div className="py-5 border-b-2 border-dashed border-slate-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-600"></span>
                <span>1. Chief Complaint &amp; Extracted Symptoms</span>
              </h3>
              <span className="text-xs text-slate-400 font-semibold">SOCRATES Extracted</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-3">
              <span className="text-xs font-bold text-slate-500 block mb-0.5">Primary Concern:</span>
              <p className="text-sm font-extrabold text-slate-900">{patientData.chiefComplaint}</p>
            </div>

            <div className="space-y-2">
              {patientData.symptoms.map((sym, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white border border-slate-200">
                  <span className="font-bold text-slate-800">• {sym.name}</span>
                  <div className="flex items-center space-x-3 text-slate-500">
                    <span>Duration: {sym.duration}</span>
                    <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {sym.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Current Medicines */}
          <div className="py-5 border-b-2 border-dashed border-slate-300">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center space-x-1.5 mb-3">
              <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
              <span>2. Current Active Medications (Allopathic &amp; AYUSH)</span>
            </h3>

            <div className="space-y-2">
              {patientData.medicines.map((med, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm block">{med.name}</span>
                    <span className="text-slate-500">{med.frequency}</span>
                  </div>
                  <span className="font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {med.dose}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Known Allergies & Vitals */}
          <div className="py-5 border-b-2 border-dashed border-slate-300 grid sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-2 flex items-center space-x-1">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>3. Documented Allergies</span>
              </h3>
              <div className="space-y-1.5">
                {patientData.allergies.map((all, i) => (
                  <div key={i} className="text-xs p-2 bg-amber-50 text-amber-900 rounded-xl border border-amber-200 font-bold">
                    ⚠️ {all}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-2">
                4. Recorded Baseline Vitals
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-semibold">Blood Pressure:</span>
                  <span className="font-extrabold text-slate-900">{patientData.vitals.bp}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-semibold">Pulse Rate:</span>
                  <span className="font-extrabold text-slate-900">{patientData.vitals.pulse}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-semibold">Body Temp:</span>
                  <span className="font-extrabold text-slate-900">{patientData.vitals.temp}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-semibold">Oxygen (SpO2):</span>
                  <span className="font-extrabold text-slate-900">{patientData.vitals.spo2}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Slip Footer with QR Code */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-100 rounded-xl border border-slate-300">
                <QrCode className="h-12 w-12 text-slate-800" />
              </div>
              <div className="text-xs text-slate-500 font-medium">
                <span className="font-bold text-slate-800 block">ABDM Health QR Token</span>
                <span>Scan at OPD room or pharmacy counter</span>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400">
              Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* INTERACTIVE VERIFICATION BUTTONS (Large 48px+ Targets) */}
        {!isConfirmed ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => router.push('/kiosk/interview')}
              className="touch-btn h-16 bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-300 rounded-2xl text-lg font-black flex items-center justify-center space-x-3 shadow transition active:scale-95"
            >
              <Edit3 className="h-6 w-6 text-slate-600" />
              <span>✏️ Edit Information / बदलाव करें</span>
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="touch-btn h-16 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-lg font-black flex items-center justify-center space-x-3 shadow-xl shadow-emerald-600/30 transition active:scale-95"
            >
              <CheckCircle2 className="h-7 w-7 stroke-[3]" />
              <span>✅ Correct / जानकारी सही है</span>
            </button>
          </div>
        ) : (
          /* Confirmation State View */
          <div className="bg-emerald-50 rounded-3xl p-6 sm:p-8 border-2 border-emerald-400 text-center space-y-4 shadow-xl animate-fade-in">
            <div className="h-16 w-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="h-10 w-10 stroke-[3]" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-emerald-950">
              Intake Verified &amp; Submitted to Hospital Queue!
            </h3>
            <p className="text-sm text-emerald-900 max-w-lg mx-auto font-medium">
              Your records have been structured into HL7 FHIR format and routed to the Physician Command Center. Please proceed to <strong>{patientData.counter}</strong> when your token <strong>{patientData.tokenNumber}</strong> is called.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrintSlip}
                className="touch-btn px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-2xl text-base font-bold flex items-center space-x-2 shadow-sm transition"
              >
                <Printer className="h-5 w-5" />
                <span>Print Physical Slip / पर्ची प्रिंट करें</span>
              </button>

              <button
                type="button"
                onClick={() => router.push('/dashboard/doctor')}
                className="touch-btn px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-base font-black flex items-center space-x-2 shadow-xl transition"
              >
                <Stethoscope className="h-5 w-5 text-emerald-400" />
                <span>View in Doctor Command Center</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
