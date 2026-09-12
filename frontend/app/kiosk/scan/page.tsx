'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import KioskHeader from '@/components/KioskHeader';
import AudioGuideButton from '@/components/AudioGuideButton';
import { extractDocumentOCR } from '@/lib/api';
import { DocumentExtractionResult } from '@/lib/types';
import { 
  Camera, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  UploadCloud, 
  RefreshCw, 
  Trash2, 
  Eye,
  AlertCircle
} from 'lucide-react';

interface ScannedThumbnail {
  id: string;
  presetKey: string;
  title: string;
  type: string;
  date: string;
  previewUrl: string;
}

export default function ScanPage() {
  const router = useRouter();

  const [activePreset, setActivePreset] = useState<string>('lab_glucose');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [thumbnails, setThumbnails] = useState<ScannedThumbnail[]>([
    {
      id: 'thumb-1',
      presetKey: 'lab_glucose',
      title: 'Blood Sugar & HbA1c Lab Report',
      type: 'Lab Report',
      date: '2024-03-12',
      previewUrl: '/docs/lab_report.png'
    }
  ]);

  const [selectedThumb, setSelectedThumb] = useState<ScannedThumbnail | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [extractionResult, setExtractionResult] = useState<DocumentExtractionResult | null>(null);

  useEffect(() => {
    if (thumbnails.length > 0 && !selectedThumb) {
      setSelectedThumb(thumbnails[0]);
    }
  }, [thumbnails]);

  const handleCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);

      const presets: Record<string, { title: string; type: string; date: string }> = {
        lab_glucose: { title: 'AIIMS Central Pathology Blood Report', type: 'Lab Report', date: '2024-03-12' },
        prescription_rx: { title: 'Civil Hospital OPD Prescription Slip', type: 'Prescription', date: '2024-01-18' },
        ayush_chikitsa: { title: 'NIA Ayurvedic Chikitsa Patra', type: 'Ayurvedic Rx', date: '2023-11-05' }
      };

      const meta = presets[activePreset] || presets.lab_glucose;
      const newThumb: ScannedThumbnail = {
        id: `thumb-${Date.now()}`,
        presetKey: activePreset,
        title: meta.title,
        type: meta.type,
        date: meta.date,
        previewUrl: '/docs/document.png'
      };

      setThumbnails((prev) => [newThumb, ...prev]);
      setSelectedThumb(newThumb);
    }, 600);
  };

  const handleProcessOCR = async () => {
    if (!selectedThumb) return;
    setProcessing(true);

    try {
      const result = await extractDocumentOCR(selectedThumb.presetKey);
      setExtractionResult(result);

      // Save to session storage for the summary receipt
      if (typeof window !== 'undefined') {
        const ocrStr = JSON.stringify(result);
        sessionStorage.setItem('medverse_scanned_ocr', ocrStr);
        sessionStorage.setItem('medikiosk_scanned_ocr', ocrStr);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteThumb = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThumbnails((prev) => prev.filter((t) => t.id !== id));
    if (selectedThumb?.id === id) {
      setSelectedThumb(null);
      setExtractionResult(null);
    }
  };

  const scanAudioScript = 
    "Please position your paper prescription or lab test report inside the camera box on screen. Tap Capture Document, then tap Process Records to run our automatic OCR extractor.";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <KioskHeader />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col justify-between">
        
        {/* Header Bar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-sky-700 bg-sky-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Step 3 of 4: Medical Records Digitization
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Camera Document Scanner & OCR
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              दस्तावेज़ स्कैनर • Capture your past prescriptions and lab reports for automatic timeline extraction.
            </p>
          </div>

          <AudioGuideButton 
            textToSpeak={scanAudioScript} 
            label="Audio Instructions" 
          />
        </div>

        {/* Viewfinder & Side Thumbnails Grid */}
        <div className="grid lg:grid-cols-12 gap-6 items-start flex-1">
          
          {/* Left / Center Viewfinder Box (Col 8) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            
            {/* Specimen Presets Bar */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Select Document Specimen to Place in Scanner:
              </span>
              <span className="text-xs font-bold text-sky-600">
                Optical Alignment: Ready
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { key: 'lab_glucose', label: '1. Lab Report (HbA1c & Glucose)' },
                { key: 'prescription_rx', label: '2. OPD Prescription Slip (Rx)' },
                { key: 'ayush_chikitsa', label: '3. AYUSH Chikitsa Patra' },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setActivePreset(p.key)}
                  className={`touch-btn py-2.5 px-3 rounded-xl border text-xs font-extrabold transition text-center ${
                    activePreset === p.key
                      ? 'bg-sky-600 text-white border-sky-700 shadow-md ring-2 ring-sky-300'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Simulated Live Camera Viewfinder */}
            <div className="relative w-full aspect-[4/3] max-h-[380px] bg-slate-950 rounded-2xl overflow-hidden border-4 border-slate-800 shadow-inner flex flex-col items-center justify-center text-white">
              
              {/* Corner Viewfinder Targeting Reticles */}
              <div className="absolute top-4 left-4 w-10 h-10 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg pointer-events-none"></div>
              <div className="absolute top-4 right-4 w-10 h-10 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg pointer-events-none"></div>
              <div className="absolute bottom-4 left-4 w-10 h-10 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg pointer-events-none"></div>
              <div className="absolute bottom-4 right-4 w-10 h-10 border-b-4 border-r-4 border-emerald-400 rounded-br-lg pointer-events-none"></div>

              {/* Scanning Laser Guide Line */}
              <div className="absolute inset-x-0 top-1/3 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-pulse"></div>

              {/* Simulated Document inside Viewfinder */}
              <div className="w-4/5 h-4/5 bg-white text-slate-900 rounded-lg p-5 shadow-2xl overflow-hidden border border-slate-300 flex flex-col justify-between font-serif opacity-95 scale-95 transform">
                <div>
                  <div className="border-b-2 border-slate-800 pb-2 mb-3 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                        {activePreset === 'lab_glucose'
                          ? 'AIIMS NEW DELHI • CENTRAL PATHOLOGY REPORT'
                          : activePreset === 'prescription_rx'
                          ? 'CIVIL DISTRICT HOSPITAL • OPD PRESCRIPTION'
                          : 'NATIONAL INSTITUTE OF AYURVEDA • ROGIPATRA'}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-sans">
                        Patient: Ramesh Kumar Sharma • ID: AIIMS-98211 • Date: 12-03-2024
                      </p>
                    </div>
                    <span className="text-[10px] font-sans font-bold bg-slate-100 px-2 py-1 rounded border">
                      Verified Barcode
                    </span>
                  </div>

                  {activePreset === 'lab_glucose' ? (
                    <div className="space-y-1 text-[11px] font-mono text-slate-800">
                      <div className="flex justify-between font-bold border-b border-slate-200 pb-1">
                        <span>TEST DESCRIPTION</span>
                        <span>RESULT</span>
                        <span>NORMAL RANGE</span>
                      </div>
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>Glycated Hemoglobin (HbA1c)</span>
                        <span>8.2 %</span>
                        <span>&lt; 5.7 %</span>
                      </div>
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>Fasting Blood Sugar (FBS)</span>
                        <span>168 mg/dL</span>
                        <span>70 - 100</span>
                      </div>
                      <div className="flex justify-between text-rose-600 font-bold">
                        <span>Post-Prandial Glucose (PP)</span>
                        <span>245 mg/dL</span>
                        <span>&lt; 140</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Serum Creatinine</span>
                        <span>1.1 mg/dL</span>
                        <span>0.7 - 1.3</span>
                      </div>
                    </div>
                  ) : activePreset === 'prescription_rx' ? (
                    <div className="space-y-2 text-xs font-sans text-slate-800">
                      <p className="font-bold text-slate-900">Rx: (Prescribed Medications)</p>
                      <p>1. Tab Metformin 500mg — 1 tab BD after meals</p>
                      <p>2. Tab Telmisartan 40mg — 1 tab OD morning</p>
                      <p>3. Tab Atorvastatin 10mg — 1 tab HS</p>
                      <p className="text-[11px] text-slate-500 italic mt-2">Advised: Low carbohydrate diet, daily exercise</p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-xs font-sans text-emerald-950">
                      <p className="font-bold">Ayurvedic Chikitsa: Sandhivata (Osteoarthritis)</p>
                      <p>• Yogaraj Guggulu — 2 tabs BD with warm water</p>
                      <p>• Dashamoola Kashayam — 15ml BD before meals</p>
                      <p>• Janu Basti with Mahanarayana Taila</p>
                      <p className="text-[11px] text-slate-600">Nadi: Vata-dominant • Agni: Mandagni</p>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 font-sans text-center border-t pt-1">
                  Optical Character Recognition Target • High Contrast Resolution
                </div>
              </div>

              {/* Viewfinder Status Overlay */}
              <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between text-xs font-bold text-slate-300 pointer-events-none">
                <span className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Camera Ready • 4K Sensor</span>
                </span>
                <span>Auto-Focus: LOCKED</span>
              </div>
            </div>

            {/* Viewfinder Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handleCapture}
                disabled={isCapturing}
                className="touch-btn h-16 w-full sm:w-auto px-8 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-lg font-black flex items-center justify-center space-x-3 shadow-lg shadow-sky-600/30 transition active:scale-95"
              >
                <Camera className={`h-6 w-6 ${isCapturing ? 'animate-spin' : ''}`} />
                <span>{isCapturing ? 'Capturing Document...' : 'Capture Document / स्कैन करें'}</span>
              </button>

              <button
                type="button"
                onClick={handleProcessOCR}
                disabled={processing || thumbnails.length === 0}
                className="touch-btn h-16 w-full sm:w-auto px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-lg font-black flex items-center justify-center space-x-3 shadow-lg shadow-emerald-600/30 transition active:scale-95"
              >
                <Sparkles className="h-6 w-6 text-amber-300" />
                <span>{processing ? 'Extracting Entities...' : 'Process Records (OCR)'}</span>
              </button>
            </div>
          </div>

          {/* Right Side Panel: Scanned Thumbnails & Extracted Entities (Col 4) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Thumbnails Reel */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-1.5">
                  <FileText className="h-4 w-4 text-sky-600" />
                  <span>Scanned Pages ({thumbnails.length})</span>
                </h3>
                <span className="text-xs text-slate-400 font-bold">Tap to inspect</span>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {thumbnails.map((thumb) => {
                  const isSelected = selectedThumb?.id === thumb.id;
                  return (
                    <div
                      key={thumb.id}
                      onClick={() => {
                        setSelectedThumb(thumb);
                        setExtractionResult(null);
                      }}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-sky-50 border-sky-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                          <FileText className="h-5 w-5 text-sky-600" />
                        </div>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {thumb.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {thumb.type} • {thumb.date}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteThumb(thumb.id, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Remove page"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}

                {thumbnails.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400">
                    No documents captured yet. Click &quot;Capture Document&quot; above.
                  </div>
                )}
              </div>
            </div>

            {/* OCR Extracted Entities Preview Box */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span>OCR Extracted Entities</span>
                </h3>
                {extractionResult && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    FHIR R4 JSON
                  </span>
                )}
              </div>

              {extractionResult ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium">
                    <p className="font-bold">{extractionResult.facility_name}</p>
                    <p className="text-[11px] text-emerald-800">Date: {extractionResult.date}</p>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {extractionResult.extracted_entities.map((ent, i) => (
                      <div
                        key={i}
                        className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-800 block">{ent.name}</span>
                          <span className="text-[10px] text-slate-500">{ent.clinical_category}</span>
                        </div>
                        <div className="text-right">
                          <span className={`font-black text-sm ${ent.is_abnormal ? 'text-rose-600' : 'text-slate-900'}`}>
                            {ent.value} {ent.unit || ''}
                          </span>
                          {ent.is_abnormal && (
                            <span className="block text-[10px] text-rose-600 font-bold">Abnormal</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  Tap &quot;Process Records (OCR)&quot; to extract structured medical values into FHIR format.
                </div>
              )}
            </div>

            {/* Next Route Button */}
            <button
              type="button"
              onClick={() => router.push('/kiosk/summary')}
              className="touch-btn h-16 w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-lg font-black flex items-center justify-center space-x-2 shadow-xl transition"
            >
              <span>Verify Summary &amp; Token</span>
              <ArrowRight className="h-6 w-6 stroke-[3]" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
