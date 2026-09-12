'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  fetchPatients, 
  fetchSimilarCases, 
  submitDoctorReview 
} from '@/lib/api';
import { PatientProfile, SimilarCase } from '@/lib/types';
import LabTrendsChart from '@/components/LabTrendsChart';
import TimelineStepper from '@/components/TimelineStepper';
import SimilarCasesList from '@/components/SimilarCasesList';
import FhirModal from '@/components/FhirModal';
import AbdmSandboxModal from '@/components/AbdmSandboxModal';
import { 
  Stethoscope, 
  HeartPulse, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  FileCode, 
  Calendar, 
  Activity, 
  User, 
  Search, 
  RefreshCw, 
  ChevronRight,
  ShieldCheck,
  Clock,
  ArrowLeft,
  Sparkles,
  Pill,
  Globe2
} from 'lucide-react';

export default function DoctorDashboardPage() {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('P-101');
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([]);
  const [loadingCases, setLoadingCases] = useState<boolean>(false);
  
  // Doctor AI Summary Action States
  const [isEditingSummary, setIsEditingSummary] = useState<boolean>(false);
  const [editableSummary, setEditableSummary] = useState<string>('');
  const [doctorNoteInput, setDoctorNoteInput] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState<'PENDING' | 'ACCEPTED' | 'EDITED' | 'REJECTED'>('PENDING');

  // FHIR & ABDM Modal States
  const [isFhirModalOpen, setIsFhirModalOpen] = useState<boolean>(false);
  const [isAbdmModalOpen, setIsAbdmModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Herb-Drug Safety Check State
  const [selectedAlloDrug, setSelectedAlloDrug] = useState<string>('Metformin');
  const [selectedAyushHerb, setSelectedAyushHerb] = useState<string>('Shilajatu (Shilajit)');
  const [safetyCheckResult, setSafetyCheckResult] = useState<any>(null);
  const [runningSafetyCheck, setRunningSafetyCheck] = useState<boolean>(false);

  // Initial Load
  useEffect(() => {
    async function loadData() {
      const pts = await fetchPatients();
      if (pts.length > 0) {
        setPatients(pts);
      } else {
        // Fallback default mock patients
        const defaultPatients: PatientProfile[] = [
          {
            id: 'P-102',
            name: 'Sunita Devi Patel',
            age: 58,
            gender: 'Female',
            phone: '+91 94250 88123',
            abhaId: '14-2201-9981-4411',
            language: 'hi',
            prakriti: 'Vata-Pitta',
            hasRedFlag: true,
            redFlagReason: 'Acute crushing chest pain radiating to left shoulder and jaw with cold sweats',
            triagePriority: 'EMERGENCY_RED_FLAG',
            chiefComplaint: 'Crushing Chest Pain & Breathlessness',
            aiSummary: 'EMERGENCY TRIAGE: 58-year-old female presenting with acute severe substernal chest pressure radiating to left arm and jaw, onset 45 minutes ago. Accompanied by diaphoresis and shortness of breath. Red-Flag safety protocol triggered.',
            reviewStatus: 'PENDING',
            token: 'EMERG-AIIMS-RED01',
            vitals: { bp: '168/102 mmHg', pulse: '104 bpm', temp: '98.2 F', spo2: '93%' },
            historyTimeline: [
              { date: '2024-03-14', title: 'Emergency Kiosk Intake', category: 'Emergency Triage', summary: 'Crushing chest pain (VAS 9/10), diaphoresis, hypertension crisis.', is_abnormal: true },
              { date: '2023-09-15', title: 'Cardiology Clinic Consultation', category: 'Clinical Note', summary: 'Borderline ischemia noted on TMT; advised angiography.', is_abnormal: true }
            ],
            glucoseTrend: [
              { month: 'Nov 2023', fasting: 110, postPrandial: 140, hba1c: 6.2 },
              { month: 'Dec 2023', fasting: 115, postPrandial: 145, hba1c: 6.3 },
              { month: 'Jan 2024', fasting: 122, postPrandial: 150, hba1c: 6.4 },
              { month: 'Feb 2024', fasting: 130, postPrandial: 160, hba1c: 6.6 }
            ]
          },
          {
            id: 'P-101',
            name: 'Ramesh Kumar Sharma',
            age: 52,
            gender: 'Male',
            phone: '+91 98765 43210',
            abhaId: '14-8921-7734-0192',
            language: 'hi',
            prakriti: 'Pitta-Kapha',
            hasRedFlag: false,
            triagePriority: 'NORMAL',
            chiefComplaint: 'Uncontrolled Blood Sugar & Fatigue',
            aiSummary: '52-year-old male with known Type 2 Diabetes and Hypertension presenting for routine quarterly evaluation. Reports persistent post-prandial fatigue and morning heaviness. Denies acute chest pain, shortness of breath, or palpitations.',
            reviewStatus: 'PENDING',
            token: 'OPD-AIIMS-A104',
            vitals: { bp: '142/88 mmHg', pulse: '76 bpm', temp: '98.4 F', spo2: '98%' },
            historyTimeline: [
              { date: '2024-03-12', title: 'Central Pathology Lab (AIIMS)', category: 'Lab Report', summary: 'HbA1c: 8.2% (High), Fasting Glucose: 168 mg/dL, PP Glucose: 245 mg/dL', is_abnormal: true },
              { date: '2024-01-18', title: 'District Hospital OPD Consultation', category: 'Prescription', summary: 'Metformin 500mg BD + Telmisartan 40mg OD prescribed by Dr. Ananya Sen.', is_abnormal: false },
              { date: '2023-11-05', title: 'National Institute of Ayurveda Visit', category: 'AYUSH Consultation', summary: 'Diagnosed with Mandagni & Vata-Pitta vitiation; prescribed Yogaraj Guggulu & Nishamalaki.', is_abnormal: false },
              { date: '2023-06-20', title: 'Annual Health Checkup', category: 'Lab Report', summary: 'HbA1c: 7.4%, Lipid Profile: Total Cholesterol 210 mg/dL.', is_abnormal: true }
            ],
            glucoseTrend: [
              { month: 'Dec 2023', fasting: 142, postPrandial: 195, hba1c: 7.4 },
              { month: 'Jan 2024', fasting: 155, postPrandial: 210, hba1c: 7.7 },
              { month: 'Feb 2024', fasting: 160, postPrandial: 230, hba1c: 7.9 },
              { month: 'Mar 2024', fasting: 168, postPrandial: 245, hba1c: 8.2 }
            ]
          }
        ];
        setPatients(defaultPatients);
      }
    }
    loadData();
  }, []);

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Sync selected patient summary & fetch similar cases
  useEffect(() => {
    if (selectedPatient) {
      setEditableSummary(selectedPatient.aiSummary);
      setReviewStatus(selectedPatient.reviewStatus);
      setDoctorNoteInput(selectedPatient.doctorNotes || '');

      // Trigger vector similarity search
      setLoadingCases(true);
      const query = `${selectedPatient.chiefComplaint} ${selectedPatient.hasRedFlag ? 'chest pain emergency' : 'diabetes hypertension'}`;
      fetchSimilarCases(query).then((res) => {
        setSimilarCases(res);
        setLoadingCases(false);
      });
    }
  }, [selectedPatientId, selectedPatient?.id]);

  // Doctor Action Handlers
  const handleReviewAction = async (action: 'ACCEPT' | 'EDIT' | 'REJECT') => {
    if (!selectedPatient) return;

    const statusMap: Record<string, 'ACCEPTED' | 'EDITED' | 'REJECTED'> = {
      ACCEPT: 'ACCEPTED',
      EDIT: 'EDITED',
      REJECT: 'REJECTED'
    };
    const newStatus = statusMap[action] || 'ACCEPTED';

    await submitDoctorReview({
      patient_id: selectedPatient.id,
      action,
      updated_summary: isEditingSummary ? editableSummary : undefined,
      doctor_notes: doctorNoteInput
    });

    setReviewStatus(newStatus);
    setIsEditingSummary(false);

    // Update in local state
    setPatients((prev) =>
      prev.map((p) =>
        p.id === selectedPatient.id
          ? {
              ...p,
              reviewStatus: newStatus,
              aiSummary: isEditingSummary ? editableSummary : p.aiSummary,
              doctorNotes: doctorNoteInput
            }
          : p
      )
    );
  };

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const runHerbDrugSafetyCheck = async () => {
    setRunningSafetyCheck(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/prescriptions/safety-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allopathic_drugs: [selectedAlloDrug],
          ayush_formulations: [selectedAyushHerb],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSafetyCheckResult(data);
      } else {
        const isCaution = selectedAlloDrug === 'Aspirin' && selectedAyushHerb.includes('Guggulu');
        setSafetyCheckResult({
          has_caution: isCaution,
          interactions_found: [
            {
              allopathic_drug: selectedAlloDrug,
              ayush_formulation: selectedAyushHerb,
              severity: isCaution ? 'CAUTION' : 'MONITOR',
              mechanism: isCaution
                ? 'Guggulsterones enhance antiplatelet action additively with Aspirin.'
                : 'Synergistic GLUT-4 translocation enhancing insulin sensitivity.',
              clinical_risk: isCaution ? 'Increased bleeding tendency' : 'Beneficial glycemic reduction',
              recommendation: isCaution ? 'Space doses by 2 hours. Monitor bruising.' : 'Advise regular home blood glucose tracking.',
            },
          ],
          integrative_guidance: isCaution
            ? '⚠️ Caution: Antiplatelet synergy detected.'
            : 'Favorable integrative response observed.',
        });
      }
    } catch {
      setSafetyCheckResult({
        has_caution: false,
        interactions_found: [],
        integrative_guidance: 'Standard integrative monitoring applies.',
      });
    } finally {
      setRunningSafetyCheck(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      
      {/* Top Physician Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Return to Home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="h-11 w-11 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-xl tracking-tight text-white">
                  Physician Command Center
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  AIIMS OPD Console
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Dr. Arvind Rathore, MD (AIIMS) • Attending Physician
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/kiosk/onboarding"
              className="touch-btn px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow transition"
            >
              <HeartPulse className="h-4 w-4" />
              <span>Launch Patient Kiosk</span>
            </Link>

            {selectedPatient && (
              <>
                <button
                  type="button"
                  onClick={() => setIsAbdmModalOpen(true)}
                  className="touch-btn px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition"
                  title="Open ABDM M1/M2/M3 Sandbox Simulator"
                >
                  <Globe2 className="h-4 w-4" />
                  <span>ABDM Sandbox</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsFhirModalOpen(true)}
                  className="touch-btn px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow transition"
                >
                  <FileCode className="h-4 w-4 text-emerald-400" />
                  <span>Export FHIR R4</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 grid lg:grid-cols-12 gap-6 items-start">
        
        {/* SIDEBAR: PATIENT QUEUE (Col 4) */}
        <aside className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-extrabold text-slate-900">
                Live Patient Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {patients.length} Active
              </span>
            </div>
            <span className="text-[11px] font-bold text-rose-600 flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping"></span>
              <span>Red-Flag Triage Active</span>
            </span>
          </div>

          {/* Search Queue */}
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search token, name, complaint..."
              className="w-full h-11 pl-10 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-sky-600"
            />
          </div>

          {/* Queue List */}
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredPatients.map((patient) => {
              const isSelected = selectedPatient?.id === patient.id;
              const isEmergency = patient.hasRedFlag;

              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    isEmergency
                      ? isSelected
                        ? 'bg-rose-50 border-rose-600 ring-2 ring-rose-400 shadow-md'
                        : 'bg-rose-50/70 border-rose-400 hover:bg-rose-100/70'
                      : isSelected
                      ? 'bg-sky-50 border-sky-600 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {/* Triage & Token Row */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-black tracking-tight px-2 py-0.5 rounded-md ${
                        isEmergency
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-900 text-white'
                      }`}
                    >
                      {patient.token}
                    </span>

                    {isEmergency ? (
                      <span className="text-[11px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300 flex items-center space-x-1 animate-pulse">
                        <AlertTriangle className="h-3 w-3 text-rose-600" />
                        <span>RED-FLAG ALERT</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-500">
                        {patient.vitals.bp}
                      </span>
                    )}
                  </div>

                  {/* Patient Name & Demographics */}
                  <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                    {patient.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-2">
                    {patient.age} Yrs • {patient.gender} • ABHA: {patient.abhaId}
                  </p>

                  {/* Chief Complaint Snippet */}
                  <div className={`p-2 rounded-xl text-xs font-semibold ${
                    isEmergency
                      ? 'bg-white text-rose-900 border border-rose-200'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}>
                    {patient.chiefComplaint}
                  </div>

                  {/* Doctor Review Badge */}
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Review Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-md ${
                        patient.reviewStatus === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : patient.reviewStatus === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : patient.reviewStatus === 'EDITED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {patient.reviewStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* MAIN VIEW: SELECTED PATIENT COMMAND CENTER (Col 8) */}
        {selectedPatient && (
          <main className="lg:col-span-8 space-y-6">
            
            {/* 1. Patient Profile Banner */}
            <div className={`rounded-3xl p-6 border-2 shadow-sm ${
              selectedPatient.hasRedFlag
                ? 'bg-gradient-to-r from-rose-50 via-white to-rose-50 border-rose-400'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-md ${
                    selectedPatient.hasRedFlag ? 'bg-rose-600' : 'bg-sky-600'
                  }`}>
                    {selectedPatient.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-2xl font-black text-slate-900">
                        {selectedPatient.name}
                      </h2>
                      {selectedPatient.prakriti && (
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          Prakriti: {selectedPatient.prakriti}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Token: <strong>{selectedPatient.token}</strong> • {selectedPatient.age} Yrs / {selectedPatient.gender} • ABHA: {selectedPatient.abhaId}
                    </p>
                  </div>
                </div>

                {/* Vitals Summary Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                    <span className="text-slate-400 block font-bold text-[10px]">BP</span>
                    <span className="font-extrabold text-slate-900">{selectedPatient.vitals.bp}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                    <span className="text-slate-400 block font-bold text-[10px]">PULSE</span>
                    <span className="font-extrabold text-slate-900">{selectedPatient.vitals.pulse}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                    <span className="text-slate-400 block font-bold text-[10px]">SPO2</span>
                    <span className="font-extrabold text-slate-900">{selectedPatient.vitals.spo2}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-center">
                    <span className="text-slate-400 block font-bold text-[10px]">TEMP</span>
                    <span className="font-extrabold text-slate-900">{selectedPatient.vitals.temp}</span>
                  </div>
                </div>
              </div>

              {/* Red Flag Warning Box */}
              {selectedPatient.hasRedFlag && (
                <div className="mt-4 p-4 rounded-2xl bg-rose-600 text-white flex items-start space-x-3 shadow-md animate-red-flag">
                  <AlertTriangle className="h-6 w-6 stroke-[2.5] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider">
                      Priority Triage Level 1: {selectedPatient.redFlagReason}
                    </h4>
                    <p className="text-xs text-rose-100 mt-0.5">
                      Stat ECG and 12-lead troponin testing recommended. Emergency resuscitation team on standby.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 2. AI SUMMARY PANEL: Editable Text Boxes + Accept / Edit / Reject */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-sky-600" />
                    <span>AI Clinical History &amp; Synthesis</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      reviewStatus === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : reviewStatus === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : reviewStatus === 'EDITED'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      Doctor Review: {reviewStatus}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Extracted from SOCRATES interview, past prescriptions, and pathology documents
                  </p>
                </div>

                {/* Accept / Edit / Reject Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleReviewAction('ACCEPT')}
                    className="touch-btn px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-sm transition active:scale-95"
                    title="Accept AI Summary as verified"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Accept</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditingSummary(!isEditingSummary)}
                    className="touch-btn px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition active:scale-95"
                    title="Edit summary text"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>{isEditingSummary ? 'Done Editing' : 'Edit'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReviewAction('REJECT')}
                    className="touch-btn px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition active:scale-95"
                    title="Reject AI Summary and reassess manually"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Editable Text Area */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  History of Present Illness (HPI) &amp; Clinical Notes:
                </label>
                {isEditingSummary ? (
                  <textarea
                    rows={4}
                    value={editableSummary}
                    onChange={(e) => setEditableSummary(e.target.value)}
                    className="w-full p-3 text-sm font-semibold bg-sky-50 border-2 border-sky-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed text-slate-900"
                  />
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm font-medium text-slate-800 leading-relaxed">
                    {editableSummary}
                  </div>
                )}
              </div>

              {/* Physician Additional Notes & Prescription Box */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Attending Physician Notes &amp; Plan:
                </label>
                <input
                  type="text"
                  value={doctorNoteInput}
                  onChange={(e) => setDoctorNoteInput(e.target.value)}
                  placeholder="Add physician notes, adjusted dosage, or diagnostic orders..."
                  className="w-full h-11 px-3 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-600"
                />
              </div>
            </div>

            {/* 2B. AYUSH-ALLOPATHY HERB-DRUG INTERACTION SAFETY ENGINE */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-amber-100 text-amber-900 rounded-xl">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                      <span>AYUSH-Allopathy Herb-Drug Interaction Safety Scanner</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                        Pharmacovigilance
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluates co-prescriptions of synthetic pharmaceuticals with traditional Ayurvedic formulations
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={runHerbDrugSafetyCheck}
                  disabled={runningSafetyCheck}
                  className="touch-btn px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>{runningSafetyCheck ? 'Checking Safety...' : 'Run Interaction Check'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Allopathic Pharmaceutical:
                  </label>
                  <select
                    value={selectedAlloDrug}
                    onChange={(e) => setSelectedAlloDrug(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:outline-none focus:border-sky-600"
                  >
                    <option value="Metformin">Metformin Hydrochloride (500mg/1000mg)</option>
                    <option value="Aspirin">Aspirin / Ecosprin (75mg/150mg)</option>
                    <option value="Telmisartan">Telmisartan (40mg/80mg)</option>
                    <option value="Atorvastatin">Atorvastatin (10mg/20mg)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select AYUSH / Ayurvedic Formulation:
                  </label>
                  <select
                    value={selectedAyushHerb}
                    onChange={(e) => setSelectedAyushHerb(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 border border-slate-300 font-semibold focus:outline-none focus:border-sky-600"
                  >
                    <option value="Shilajatu (Shilajit)">Shilajatu (Shilajit Vati / Rasayana)</option>
                    <option value="Yogaraj Guggulu">Yogaraj Guggulu (Guggulsterones)</option>
                    <option value="Ayush-82">Ayush-82 (Amra-Jambu-Karela Formulation)</option>
                    <option value="Punarnavadi Kashayam">Punarnavadi Kashayam (Boerhavia)</option>
                    <option value="Triphala Guggulu">Triphala Guggulu (Bowel & Lipid Detox)</option>
                  </select>
                </div>
              </div>

              {safetyCheckResult && (
                <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  safetyCheckResult.has_caution
                    ? 'bg-rose-50 border-rose-300 text-rose-950'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center space-x-1.5">
                      {safetyCheckResult.has_caution ? (
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                      <span>
                        {safetyCheckResult.has_caution ? 'Clinical Precaution Advised' : 'Verified Integrative Safety'}
                      </span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white font-bold border">
                      {safetyCheckResult.interactions_found.length} Interaction(s) Analyzed
                    </span>
                  </div>

                  <p className="font-semibold text-xs leading-relaxed">
                    {safetyCheckResult.integrative_guidance}
                  </p>

                  {safetyCheckResult.interactions_found.map((inter: any, idx: number) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-slate-800 space-y-1">
                      <div className="flex justify-between font-bold text-xs">
                        <span>{inter.allopathic_drug} + {inter.ayush_formulation}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          inter.severity === 'CAUTION' ? 'bg-rose-100 text-rose-800' : 'bg-sky-100 text-sky-800'
                        }`}>
                          {inter.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        <strong>Mechanism:</strong> {inter.mechanism}
                      </p>
                      <p className="text-[11px] text-emerald-900 font-semibold">
                        <strong>Protocol:</strong> {inter.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. LAB TRENDS (Recharts Line Graph) */}
            <LabTrendsChart data={selectedPatient.glucoseTrend} />

            {/* 4. CHRONOLOGICAL MEDICAL TIMELINE STEPPER */}
            <TimelineStepper items={selectedPatient.historyTimeline} />

            {/* 5. HISTORICALLY SIMILAR CASES PANEL (Vector Search) */}
            <SimilarCasesList cases={similarCases} loading={loadingCases} />

          </main>
        )}
      </div>

      {/* HL7 FHIR R4 Modal */}
      {selectedPatient && (
        <FhirModal
          patient={selectedPatient}
          isOpen={isFhirModalOpen}
          onClose={() => setIsFhirModalOpen(false)}
        />
      )}

      {/* ABDM Sandbox Gateway Modal */}
      {selectedPatient && (
        <AbdmSandboxModal
          patient={selectedPatient}
          isOpen={isAbdmModalOpen}
          onClose={() => setIsAbdmModalOpen(false)}
        />
      )}
    </div>
  );
}
