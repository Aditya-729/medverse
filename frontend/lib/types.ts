export type TriagePriority = 'NORMAL' | 'URGENT' | 'EMERGENCY_RED_FLAG';

export type ClinicalMode = 'ALLOPATHIC' | 'AYUSH';

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  abhaId?: string;
  language: string;
  prakriti?: string;
  hasRedFlag: boolean;
  redFlagReason?: string;
  triagePriority: TriagePriority;
  chiefComplaint: string;
  aiSummary: string;
  reviewStatus: 'PENDING' | 'ACCEPTED' | 'EDITED' | 'REJECTED';
  doctorNotes?: string;
  token: string;
  vitals: {
    bp: string;
    pulse: string;
    temp: string;
    spo2: string;
  };
  historyTimeline: TimelineItem[];
  glucoseTrend: GlucoseTrendPoint[];
}

export interface TimelineItem {
  date: string;
  title: string;
  category: string;
  summary: string;
  is_abnormal: boolean;
}

export interface GlucoseTrendPoint {
  month: string;
  fasting: number;
  postPrandial: number;
  hba1c: number;
}

export interface ChatTurnResponse {
  reply_text: string;
  next_step: string;
  is_completed: boolean;
  quick_chips: string[];
  is_red_flag: boolean;
  red_flag_reason?: string;
  triage_level: TriagePriority;
  extracted_summary?: {
    chief_complaint: string;
    clinical_notes: string;
    structured_parameters: Record<string, string>;
    mode: string;
    is_red_flag: boolean;
    red_flag_reason?: string;
  };
}

export interface SimilarCase {
  case_id: string;
  title: string;
  keywords: string[];
  demographics: string;
  prakriti?: string;
  baseline_vitals: string;
  treatment_duration: string;
  interventions: string;
  outcome: string;
  ayush_adjuvant?: string;
  similarity_score: string;
  score_numeric: number;
}

export interface ExtractedEntity {
  name: string;
  value: string;
  unit?: string;
  reference_range?: string;
  is_abnormal: boolean;
  clinical_category: string;
}

export interface DocumentExtractionResult {
  document_id: string;
  doc_type: string;
  date: string;
  facility_name: string;
  doctor_name?: string;
  extracted_entities: ExtractedEntity[];
  ocr_raw_snippet: string;
  fhir_bundle: any;
}
