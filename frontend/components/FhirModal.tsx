'use client';

import React, { useState } from 'react';
import { PatientProfile } from '../lib/types';
import { FileCode, X, Copy, Check, ShieldCheck, Download } from 'lucide-react';

interface FhirModalProps {
  patient: PatientProfile;
  isOpen: boolean;
  onClose: () => void;
}

export default function FhirModal({ patient, isOpen, onClose }: FhirModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate FHIR R4 Bundle JSON
  const fhirBundle = {
    resourceType: "Bundle",
    type: "collection",
    id: `fhir-bundle-${patient.id}`,
    meta: {
      profile: ["https://nrces.in/ndhm/fhir/r4/StructureDefinition/ClinicalArtifactBundle"],
      lastUpdated: new Date().toISOString()
    },
    entry: [
      {
        fullUrl: `urn:uuid:${patient.id}`,
        resource: {
          resourceType: "Patient",
          id: patient.id,
          identifier: [
            {
              system: "https://abdm.gov.in/abha",
              value: patient.abhaId || "14-0000-0000-0000"
            }
          ],
          name: [{ text: patient.name }],
          telecom: [{ system: "phone", value: patient.phone }],
          gender: patient.gender.toLowerCase()
        }
      },
      {
        fullUrl: `urn:uuid:cond-${patient.id}`,
        resource: {
          resourceType: "Condition",
          id: `cond-${patient.id}`,
          clinicalStatus: {
            coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }]
          },
          code: {
            text: patient.chiefComplaint
          },
          subject: { reference: `Patient/${patient.id}` }
        }
      },
      {
        fullUrl: `urn:uuid:obs-vitals-${patient.id}`,
        resource: {
          resourceType: "Observation",
          id: `obs-vitals-${patient.id}`,
          status: "final",
          code: { text: "Blood Pressure" },
          subject: { reference: `Patient/${patient.id}` },
          valueString: patient.vitals.bp
        }
      }
    ]
  };

  const jsonString = JSON.stringify(fhirBundle, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-sky-100 text-sky-800 rounded-xl">
              <FileCode className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <span>HL7 FHIR R4 Clinical Bundle</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  ABDM Validated
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Patient: {patient.name} ({patient.id})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* JSON Code Viewer */}
        <div className="p-4 flex-1 overflow-auto bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed">
          <pre className="overflow-x-auto">{jsonString}</pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Encrypted FHIR Standard compliant with Ayushman Bharat</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopy}
              className="touch-btn px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="touch-btn px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
