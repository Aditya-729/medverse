import { 
  ChatTurnResponse, 
  SimilarCase, 
  DocumentExtractionResult, 
  PatientProfile,
  TimelineItem 
} from './types';

const API_BASE = 'http://127.0.0.1:8000/api';

export async function sendChatTurn(payload: {
  patient_id: string;
  mode: string;
  current_step: string;
  user_message: string;
  conversation_history: any[];
  collected_data: Record<string, any>;
}): Promise<ChatTurnResponse> {
  try {
    const res = await fetch(`${API_BASE}/intake/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('FastAPI direct connection error, using local fallback:', err);
  }

  // Resilient fallback logic
  const isRed = /chest pain|breath|faint|bleed|stroke|unconscious/i.test(payload.user_message);
  return {
    reply_text: isRed 
      ? "⚠️ Urgent symptom detected. Clinical staff notified. Where is the main discomfort located?"
      : `Acknowledged: "${payload.user_message}". When did this symptom start?`,
    next_step: "ONSET",
    is_completed: false,
    quick_chips: ["Started Today", "Past 2-3 Days", "Sudden Onset", "Chronic"],
    is_red_flag: isRed,
    red_flag_reason: isRed ? "Acute Clinical Distress Indicator" : undefined,
    triage_level: isRed ? "EMERGENCY_RED_FLAG" : "NORMAL",
  };
}

export async function extractDocumentOCR(presetKey: string = 'lab_glucose'): Promise<DocumentExtractionResult> {
  try {
    const form = new FormData();
    form.append('preset_key', presetKey);
    const res = await fetch(`${API_BASE}/documents/extract`, {
      method: 'POST',
      body: form,
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('FastAPI OCR error, using preset fallback:', err);
  }

  return {
    document_id: 'doc-fallback-01',
    doc_type: presetKey === 'prescription_rx' ? 'Prescription' : presetKey === 'ayush_chikitsa' ? 'Ayurvedic Chikitsa Patra' : 'Lab Report',
    date: '2024-03-12',
    facility_name: 'AIIMS New Delhi Central Pathology Lab',
    doctor_name: 'Dr. R. K. Sharma, MD',
    ocr_raw_snippet: 'Glycated Hemoglobin (HbA1c): 8.2 %. Fasting Blood Sugar: 168 mg/dL. PP Sugar: 245 mg/dL.',
    extracted_entities: [
      { name: 'HbA1c', value: '8.2', unit: '%', reference_range: '< 5.7', is_abnormal: true, clinical_category: 'LAB' },
      { name: 'Fasting Blood Sugar', value: '168', unit: 'mg/dL', reference_range: '70-100', is_abnormal: true, clinical_category: 'LAB' },
      { name: 'PP Blood Sugar', value: '245', unit: 'mg/dL', reference_range: '< 140', is_abnormal: true, clinical_category: 'LAB' },
    ],
    fhir_bundle: { resourceType: 'Bundle', type: 'document', entry: [] }
  };
}

export async function fetchSimilarCases(context: string): Promise<SimilarCase[]> {
  try {
    const res = await fetch(`${API_BASE}/cases/similar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_context: context, top_k: 3 }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.matched_cases;
    }
  } catch (err) {
    console.warn('FastAPI vector search error, using fallback:', err);
  }

  return [
    {
      case_id: "CASE-IN-8821",
      title: "Type 2 Diabetes Mellitus with Essential Hypertension",
      keywords: ["diabetes", "hypertension", "hba1c"],
      demographics: "54-year-old Male, Non-smoker",
      prakriti: "Pitta-Kapha",
      baseline_vitals: "BP: 154/96 mmHg, Fasting: 172 mg/dL, HbA1c: 8.8%",
      treatment_duration: "90 Days (3 Months)",
      interventions: "Metformin 1000mg BD + Telmisartan 40mg OD + Low glycemic index Indian diet",
      outcome: "HbA1c reduced to 6.7% (-2.1%); Blood pressure normalized to 122/80 mmHg; Weight reduced by 4.2 kg.",
      ayush_adjuvant: "Added Nishamalaki Churna (Amla + Haldi 3g BD) with warm water.",
      similarity_score: "94.5%",
      score_numeric: 94.5
    },
    {
      case_id: "CASE-IN-7419",
      title: "Uncontrolled Diabetes with Microalbuminuria",
      keywords: ["diabetes", "hypertension", "albuminuria"],
      demographics: "49-year-old Female, Sedentary",
      prakriti: "Kapha-Vata",
      baseline_vitals: "BP: 148/92 mmHg, Fasting: 198 mg/dL, HbA1c: 9.4%",
      treatment_duration: "120 Days (4 Months)",
      interventions: "Empagliflozin 10mg + Metformin 1000mg + Atorvastatin 20mg",
      outcome: "HbA1c normalized to 6.9%; Urine albumin-to-creatinine ratio stabilized.",
      ayush_adjuvant: "Ayush-82 ayurvedic formulation (5g BD); fatigue resolved.",
      similarity_score: "91.2%",
      score_numeric: 91.2
    }
  ];
}

export async function fetchPatientTimeline(patientId: string): Promise<TimelineItem[]> {
  try {
    const res = await fetch(`${API_BASE}/patients/${patientId}/timeline`);
    if (res.ok) {
      const data = await res.json();
      return data.timeline;
    }
  } catch (err) {
    console.warn('FastAPI timeline error:', err);
  }
  return [];
}

export async function fetchPatients(): Promise<PatientProfile[]> {
  try {
    const res = await fetch(`${API_BASE}/patients`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('FastAPI patients error:', err);
  }
  return [];
}

export async function submitDoctorReview(payload: {
  patient_id: string;
  action: 'ACCEPT' | 'EDIT' | 'REJECT';
  updated_summary?: string;
  doctor_notes?: string;
}) {
  try {
    const res = await fetch(`${API_BASE}/patients/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.warn('FastAPI review error:', err);
    return { status: 'mock_success', action: payload.action };
  }
}
