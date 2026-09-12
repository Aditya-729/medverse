'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import KioskHeader from '@/components/KioskHeader';
import VirtualNumpad from '@/components/VirtualNumpad';
import AudioGuideButton from '@/components/AudioGuideButton';
import { 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  HelpCircle,
  ArrowRight,
  Info
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  
  // Registration Mode: Phone vs ABHA
  const [inputMode, setInputMode] = useState<'PHONE' | 'ABHA'>('ABHA');
  const [inputValue, setInputValue] = useState<string>('14-8921-7734-0192');
  const [patientName, setPatientName] = useState<string>('Ramesh Kumar Sharma');
  const [patientAge, setPatientAge] = useState<number>(52);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [clinicalMode, setClinicalMode] = useState<'ALLOPATHIC' | 'AYUSH'>('ALLOPATHIC');
  
  // Strict Consent State
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDigitPress = (digit: string) => {
    setErrorMsg(null);
    if (inputMode === 'PHONE') {
      if (inputValue.replace(/\D/g, '').length < 10) {
        setInputValue((prev) => prev + digit);
      }
    } else {
      // ABHA ID 14 digits format: XX-XXXX-XXXX-XXXX
      const digitsOnly = inputValue.replace(/\D/g, '') + digit;
      if (digitsOnly.length <= 14) {
        let formatted = '';
        for (let i = 0; i < digitsOnly.length; i++) {
          if (i === 2 || i === 6 || i === 10) formatted += '-';
          formatted += digitsOnly[i];
        }
        setInputValue(formatted);
      }
    }
  };

  const handleBackspace = () => {
    setErrorMsg(null);
    if (inputValue.endsWith('-')) {
      setInputValue((prev) => prev.slice(0, -2));
    } else {
      setInputValue((prev) => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    setInputValue('');
    setErrorMsg(null);
  };

  const handleProceed = () => {
    if (!consentGiven) {
      setErrorMsg('Mandatory Consent Required: You must tap "I Agree to Health Data Processing" before proceeding.');
      return;
    }

    if (inputValue.trim().length < 8) {
      setErrorMsg('Please enter a valid ABHA ID or 10-digit Phone Number.');
      return;
    }

    // Save registration info to sessionStorage
    if (typeof window !== 'undefined') {
      const payload = JSON.stringify({
        id: 'P-101',
        name: patientName,
        age: patientAge,
        gender: patientGender,
        identifier: inputValue,
        inputMode,
        clinicalMode,
        consentGiven: true,
        consentTimestamp: new Date().toISOString(),
      });
      sessionStorage.setItem('medverse_patient', payload);
      sessionStorage.setItem('medikiosk_patient', payload);
    }

    router.push('/kiosk/interview');
  };

  const consentAudioScript = 
    "Welcome to Medverse. Under Ayushman Bharat Digital Mission guidelines, your clinical data will be processed securely and shared only with your attending hospital physician. Please tap I Agree to begin your health evaluation.";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <KioskHeader 
        mode={clinicalMode} 
        onModeToggle={setClinicalMode} 
        showModeToggle={true} 
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col justify-between">
        
        {/* Top Info & Audio Guide */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-sky-700 bg-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Step 1 of 4: Patient Identification
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Patient Registration & Consent
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              मरीज पंजीकरण एवं सहमति • Enter your ABHA ID or Mobile Number to begin.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <AudioGuideButton 
              textToSpeak={consentAudioScript} 
              label="Audio Guide / आवाज से सुनें" 
            />
          </div>
        </div>

        {/* Form & Numpad Grid */}
        <div className="grid lg:grid-cols-12 gap-6 flex-1 items-start">
          
          {/* Left Column: Form & Identification */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
            
            {/* Input Mode Selector: ABHA vs Phone */}
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-2">
                Choose Identification Method / पहचान का तरीका चुनें:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode('ABHA');
                    setInputValue('14-8921-7734-0192');
                  }}
                  className={`touch-btn py-3 px-4 rounded-2xl border-2 flex items-center justify-center space-x-2 font-bold text-base transition ${
                    inputMode === 'ABHA'
                      ? 'bg-sky-50 border-sky-600 text-sky-900 ring-2 ring-sky-300'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-sky-600" />
                  <span>14-Digit ABHA ID</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInputMode('PHONE');
                    setInputValue('9876543210');
                  }}
                  className={`touch-btn py-3 px-4 rounded-2xl border-2 flex items-center justify-center space-x-2 font-bold text-base transition ${
                    inputMode === 'PHONE'
                      ? 'bg-sky-50 border-sky-600 text-sky-900 ring-2 ring-sky-300'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="h-5 w-5 text-emerald-600" />
                  <span>Mobile Number</span>
                </button>
              </div>
            </div>

            {/* Display Input Field */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">
                {inputMode === 'ABHA' ? 'ABHA Health Account Number:' : '10-Digit Mobile Phone Number:'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={inputValue}
                  placeholder={inputMode === 'ABHA' ? '12-3456-7890-1234' : '9876543210'}
                  className="w-full h-16 px-4 text-2xl sm:text-3xl font-black text-slate-900 bg-slate-50 border-2 border-slate-300 rounded-2xl tracking-widest text-center focus:outline-none focus:border-sky-600 transition"
                />
                {inputValue && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                )}
              </div>
            </div>

            {/* Demographic Info Confirmation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Full Name / पूरा नाम:
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full h-12 px-3 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Age / उम्र:
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(parseInt(e.target.value) || 0)}
                  className="w-full h-12 px-3 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Gender / लिंग:
                </label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value as any)}
                  className="w-full h-12 px-3 text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-600"
                >
                  <option value="Male">Male / पुरुष</option>
                  <option value="Female">Female / महिला</option>
                  <option value="Other">Other / अन्य</option>
                </select>
              </div>
            </div>

            {/* Department / Stream Mode Selector */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200">
              <span className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-2">
                Select Clinical Intake Department:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setClinicalMode('ALLOPATHIC')}
                  className={`touch-btn py-3 px-3 rounded-xl border text-sm font-extrabold flex flex-col items-center transition ${
                    clinicalMode === 'ALLOPATHIC'
                      ? 'bg-sky-600 text-white border-sky-700 shadow-md ring-2 ring-sky-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>Allopathic Medicine</span>
                  <span className="text-[10px] font-normal opacity-90">SOCRATES Framework</span>
                </button>

                <button
                  type="button"
                  onClick={() => setClinicalMode('AYUSH')}
                  className={`touch-btn py-3 px-3 rounded-xl border text-sm font-extrabold flex flex-col items-center transition ${
                    clinicalMode === 'AYUSH'
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>AYUSH (Ayurveda)</span>
                  <span className="text-[10px] font-normal opacity-90">दशविध परीक्षा (Dashavidha)</span>
                </button>
              </div>
            </div>

            {/* Strict Accessible Consent Panel */}
            <div className="border-2 border-amber-300 bg-amber-50/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start space-x-3">
                <ShieldCheck className="h-6 w-6 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-amber-950">
                      Patient Health Data Consent (ABDM)
                    </h3>
                    <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">
                      Mandatory
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    I hereby authorize Medverse and AIIMS/Hospital staff to process my demographic details, previous medical records, and AI interview responses for the purpose of clinical consultation under the Ayushman Bharat Digital Mission guidelines.
                  </p>
                  <p className="text-xs text-amber-800 mt-1 italic">
                    मैं एतद्द्वारा अपनी स्वास्थ्य जानकारी को चिकित्सीय परामर्श हेतु संसाधित करने की सहमति देता/देती हूँ।
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setConsentGiven(!consentGiven);
                    setErrorMsg(null);
                  }}
                  className={`touch-btn w-full sm:w-auto px-6 py-3 rounded-xl border-2 flex items-center justify-center space-x-2 font-extrabold text-base transition-all ${
                    consentGiven
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-4 ring-emerald-200'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center ${
                    consentGiven ? 'border-white bg-emerald-700' : 'border-slate-400 bg-white'
                  }`}>
                    {consentGiven && <CheckCircle className="h-5 w-5 text-white" />}
                  </div>
                  <span>{consentGiven ? '✓ I Agree / मुझे स्वीकार है' : 'Tap to Agree / सहमति दें'}</span>
                </button>

                <span className="text-xs text-slate-500 font-medium text-center sm:text-right">
                  Strictly confidential • HIPAA & ABDM Compliant
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl flex items-center space-x-2 text-xs font-bold animate-pulse">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Right Column: Virtual Numpad & Next Button */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col items-center">
              <div className="w-full flex items-center justify-between mb-3 text-xs font-bold text-slate-500">
                <span>Accessibility Numpad / वर्चुअल कीपैड</span>
                <span className="text-sky-600 font-semibold">Touch 48px+</span>
              </div>

              <VirtualNumpad
                onDigitPress={handleDigitPress}
                onBackspace={handleBackspace}
                onClear={handleClear}
                onConfirm={handleProceed}
              />
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleProceed}
              className={`touch-btn h-16 w-full rounded-2xl text-xl font-black flex items-center justify-center space-x-3 shadow-xl transition-all ${
                consentGiven
                  ? 'bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white shadow-sky-600/30'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Begin AI Interview / साक्षात्कार शुरू करें</span>
              <ArrowRight className="h-6 w-6 stroke-[3]" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
