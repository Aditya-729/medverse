'use client';

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Key, 
  FileCheck, 
  ArrowRight, 
  Send, 
  Lock, 
  Globe2, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { PatientProfile } from '../lib/types';

interface AbdmSandboxModalProps {
  patient: PatientProfile;
  isOpen: boolean;
  onClose: () => void;
}

export default function AbdmSandboxModal({
  patient,
  isOpen,
  onClose,
}: AbdmSandboxModalProps) {
  const [currentMilestone, setCurrentMilestone] = useState<'M1' | 'M2' | 'M3'>('M1');
  
  // M1 states
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('849201');
  const [m1Verified, setM1Verified] = useState(false);

  // M2 states
  const [hipLinking, setHipLinking] = useState(false);
  const [m2Linked, setM2Linked] = useState(false);
  const [consentArtefactId, setConsentArtefactId] = useState<string | null>(null);

  // M3 states
  const [transferring, setTransferring] = useState(false);
  const [m3Transferred, setM3Transferred] = useState(false);

  if (!isOpen) return null;

  const handleVerifyM1 = () => {
    setM1Verified(true);
    setCurrentMilestone('M2');
  };

  const handleLinkM2 = () => {
    setHipLinking(true);
    setTimeout(() => {
      setHipLinking(false);
      setM2Linked(true);
      setConsentArtefactId(`CONSENT-ABDM-${Math.floor(100000 + Math.random() * 900000)}`);
      setCurrentMilestone('M3');
    }, 800);
  };

  const handleTransferM3 = () => {
    setTransferring(true);
    setTimeout(() => {
      setTransferring(false);
      setM3Transferred(true);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500 text-slate-950 rounded-2xl">
              <Globe2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black tracking-tight">
                  ABDM Sandbox Gateway Simulator
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-700">
                  v0.5 ABDM Spec
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                National Health Authority • Ayushman Bharat Digital Mission
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Milestone Selector Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 grid grid-cols-3 gap-2">
          {[
            { id: 'M1', label: 'Milestone 1 (M1)', desc: 'ABHA ID & Auth' },
            { id: 'M2', label: 'Milestone 2 (M2)', desc: 'HIP Linking & Consent' },
            { id: 'M3', label: 'Milestone 3 (M3)', desc: 'FHIR Data Transfer' },
          ].map((m) => {
            const isCompleted = 
              (m.id === 'M1' && m1Verified) || 
              (m.id === 'M2' && m2Linked) || 
              (m.id === 'M3' && m3Transferred);
            const isCurrent = currentMilestone === m.id;

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setCurrentMilestone(m.id as any)}
                className={`p-2.5 rounded-xl text-left border transition ${
                  isCurrent
                    ? 'bg-white text-slate-900 border-slate-300 shadow-sm font-bold ring-2 ring-sky-500'
                    : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-black">{m.label}</span>
                  {isCompleted && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                </div>
                <span className="text-[10px] text-slate-500 block truncate">{m.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Milestone Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* M1: ABHA Registration & OTP */}
          {currentMilestone === 'M1' && (
            <div className="space-y-4">
              <div className="bg-sky-50 p-4 rounded-2xl border border-sky-200 text-xs">
                <h4 className="font-extrabold text-sky-950 text-sm mb-1 flex items-center space-x-1.5">
                  <Smartphone className="h-4 w-4 text-sky-600" />
                  <span>Milestone 1: ABHA Number &amp; OTP Verification</span>
                </h4>
                <p className="text-sky-800">
                  Simulates ABDM Aadhaar/Mobile OTP auth for Patient: <strong>{patient.name}</strong>.
                </p>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>ABHA ID:</span>
                  <span className="font-mono text-sky-700">{patient.abhaId || '14-8921-7734-0192'}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Registered Mobile:</span>
                  <span>{patient.phone}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-700">
                  <span>ABHA Address (PHR):</span>
                  <span className="font-mono text-emerald-700">ramesh.sharma@abdm</span>
                </div>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Simulated Aadhaar/SMS OTP (One-Time Password):
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="h-12 px-4 text-xl font-mono tracking-widest text-center font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(true);
                      alert('Simulated OTP 849201 dispatched via ABDM Gateway.');
                    }}
                    className="touch-btn px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyM1}
                  className="touch-btn w-full h-12 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Verify ABHA OTP &amp; Proceed to M2</span>
                </button>
              </div>
            </div>
          )}

          {/* M2: Health Information Provider (HIP) Linking */}
          {currentMilestone === 'M2' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs">
                <h4 className="font-extrabold text-emerald-950 text-sm mb-1 flex items-center space-x-1.5">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  <span>Milestone 2: HIP Record Linking &amp; Consent Artefact</span>
                </h4>
                <p className="text-emerald-900">
                  Binds this OPD episode to the hospital HIP registry: <strong>AIIMS_ND_01</strong> under an immutable ABDM Consent Artefact.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 font-mono text-slate-800">
                <p className="text-[11px] text-slate-500 font-sans">Draft Consent Artefact Payload:</p>
                <pre className="bg-slate-950 text-emerald-400 p-3 rounded-xl overflow-x-auto text-[11px]">
{`{
  "consentId": "artefact-uuid-99218",
  "patient": { "id": "${patient.abhaId}" },
  "hip": { "id": "AIIMS_NEW_DELHI" },
  "hiTypes": ["OPConsultation", "DiagnosticReport", "Prescription"],
  "permission": {
    "accessMode": "VIEW",
    "dateRange": { "from": "2023-01-01", "to": "2026-12-31" }
  }
}`}
                </pre>
              </div>

              <button
                type="button"
                onClick={handleLinkM2}
                disabled={hipLinking}
                className="touch-btn w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow"
              >
                <Lock className="h-5 w-5" />
                <span>{hipLinking ? 'Linking Records to ABDM...' : 'Link Records & Generate Signed Consent'}</span>
              </button>

              {m2Linked && (
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                  <span>Verified Consent Artefact: {consentArtefactId}</span>
                </div>
              )}
            </div>
          )}

          {/* M3: HIU Encrypted FHIR Transfer */}
          {currentMilestone === 'M3' && (
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 text-xs">
                <h4 className="font-extrabold text-purple-950 text-sm mb-1 flex items-center space-x-1.5">
                  <Lock className="h-4 w-4 text-purple-600" />
                  <span>Milestone 3: Encrypted HL7 FHIR Bundle Transfer</span>
                </h4>
                <p className="text-purple-900">
                  End-to-end encrypted ECDH Diffie-Hellman key exchange for medical record transfer to the physician console.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-semibold">Encryption:</span>
                  <span className="font-bold text-slate-800">ECDH (Curve25519) + AES-GCM</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block font-semibold">Gateway Status:</span>
                  <span className="font-bold text-emerald-700">Connected (Sandbox Live)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleTransferM3}
                disabled={transferring}
                className="touch-btn w-full h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow"
              >
                <Send className="h-5 w-5" />
                <span>{transferring ? 'Encrypting & Dispatching FHIR Bundle...' : 'Dispatch Encrypted FHIR Bundle'}</span>
              </button>

              {m3Transferred && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-xs text-emerald-950 space-y-1">
                  <div className="flex items-center space-x-2 font-bold text-sm text-emerald-800">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>M1, M2 &amp; M3 Milestones Successfully Completed!</span>
                  </div>
                  <p className="text-slate-600">
                    Health record packet has been acknowledged by ABDM gateway transaction ID: <code>TXN-{Date.now()}</code>.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>NHA Sandbox Environment</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="touch-btn px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Close Sandbox
          </button>
        </div>
      </div>
    </div>
  );
}
