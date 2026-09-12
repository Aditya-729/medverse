"""
Medverse FastAPI Application
Core Clinical AI & Interoperability API Service for Indian Hospitals & AYUSH Institutions.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

from interview_engine import (
    ChatTurnRequest,
    ChatTurnResponse,
    process_chat_turn,
    scan_for_red_flags
)
from ocr_engine import (
    mock_ocr_extract,
    sort_clinical_timeline,
    DocumentExtractionResponse
)
from vector_search import search_similar_cases
from fhir_models import create_fhir_observation
from drug_interaction_engine import (
    SafetyCheckRequest,
    SafetyCheckResponse,
    check_drug_safety
)

app = FastAPI(
    title="Medverse Clinical AI Engine",
    description="High-throughput Intake, OCR Timeline, and Vector Search API for Indian Healthcare",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory mock patient database for the session
PATIENT_STORE: Dict[str, Dict[str, Any]] = {
    "P-101": {
        "id": "P-101",
        "name": "Ramesh Kumar Sharma",
        "age": 52,
        "gender": "Male",
        "phone": "+91 98765 43210",
        "abhaId": "14-8921-7734-0192",
        "language": "hi",
        "prakriti": "Pitta-Kapha",
        "hasRedFlag": False,
        "triagePriority": "NORMAL",
        "chiefComplaint": "Uncontrolled Blood Sugar & Fatigue",
        "aiSummary": "52-year-old male with known Type 2 Diabetes and Hypertension presenting for routine quarterly evaluation. Reports persistent post-prandial fatigue and morning heaviness. Denies acute chest pain, shortness of breath, or palpitations.",
        "reviewStatus": "PENDING",
        "token": "OPD-AIIMS-A104",
        "vitals": {"bp": "142/88 mmHg", "pulse": "76 bpm", "temp": "98.4 F", "spo2": "98%"},
        "historyTimeline": [
            {
                "date": "2024-03-12",
                "title": "Central Pathology Lab (AIIMS)",
                "category": "Lab Report",
                "summary": "HbA1c: 8.2% (High), Fasting Glucose: 168 mg/dL, PP Glucose: 245 mg/dL",
                "is_abnormal": True
            },
            {
                "date": "2024-01-18",
                "title": "District Hospital OPD Consultation",
                "category": "Prescription",
                "summary": "Metformin 500mg BD + Telmisartan 40mg OD prescribed by Dr. Ananya Sen.",
                "is_abnormal": False
            },
            {
                "date": "2023-11-05",
                "title": "National Institute of Ayurveda Visit",
                "category": "AYUSH Consultation",
                "summary": "Diagnosed with Mandagni & Vata-Pitta vitiation; prescribed Yogaraj Guggulu & Nishamalaki.",
                "is_abnormal": False
            },
            {
                "date": "2023-06-20",
                "title": "Annual Health Checkup",
                "category": "Lab Report",
                "summary": "HbA1c: 7.4%, Lipid Profile: Total Cholesterol 210 mg/dL.",
                "is_abnormal": True
            }
        ],
        "glucoseTrend": [
            {"month": "Dec 2023", "fasting": 142, "postPrandial": 195, "hba1c": 7.4},
            {"month": "Jan 2024", "fasting": 155, "postPrandial": 210, "hba1c": 7.7},
            {"month": "Feb 2024", "fasting": 160, "postPrandial": 230, "hba1c": 7.9},
            {"month": "Mar 2024", "fasting": 168, "postPrandial": 245, "hba1c": 8.2}
        ]
    },
    "P-102": {
        "id": "P-102",
        "name": "Sunita Devi Patel",
        "age": 58,
        "gender": "Female",
        "phone": "+91 94250 88123",
        "abhaId": "14-2201-9981-4411",
        "language": "hi",
        "prakriti": "Vata-Pitta",
        "hasRedFlag": True,
        "triagePriority": "EMERGENCY_RED_FLAG",
        "redFlagReason": "Acute crushing chest pain radiating to left shoulder and jaw with cold sweats",
        "chiefComplaint": "Crushing Chest Pain & Breathlessness",
        "aiSummary": "EMERGENCY TRIAGE: 58-year-old female presenting with acute severe substernal chest pressure radiating to left arm and jaw, onset 45 minutes ago. Accompanied by diaphoresis and shortness of breath. Red-Flag safety protocol triggered.",
        "reviewStatus": "PENDING",
        "token": "EMERG-AIIMS-RED01",
        "vitals": {"bp": "168/102 mmHg", "pulse": "104 bpm", "temp": "98.2 F", "spo2": "93%"},
        "historyTimeline": [
            {
                "date": "2024-03-14",
                "title": "Emergency Kiosk Intake",
                "category": "Emergency Triage",
                "summary": "Crushing chest pain (VAS 9/10), diaphoresis, hypertension crisis.",
                "is_abnormal": True
            },
            {
                "date": "2023-09-15",
                "title": "Cardiology Clinic Consultation",
                "category": "Clinical Note",
                "summary": "Borderline ischemia noted on TMT; advised angiography which patient deferred.",
                "is_abnormal": True
            }
        ],
        "glucoseTrend": [
            {"month": "Nov 2023", "fasting": 110, "postPrandial": 140, "hba1c": 6.2},
            {"month": "Dec 2023", "fasting": 115, "postPrandial": 145, "hba1c": 6.3},
            {"month": "Jan 2024", "fasting": 122, "postPrandial": 150, "hba1c": 6.4},
            {"month": "Feb 2024", "fasting": 130, "postPrandial": 160, "hba1c": 6.6}
        ]
    }
}


class SimilarCasesRequest(BaseModel):
    patient_context: Optional[str] = None
    chief_complaint: Optional[str] = None
    top_k: Optional[int] = 3


class DoctorReviewRequest(BaseModel):
    patient_id: str
    action: str # "ACCEPT", "EDIT", "REJECT"
    updated_summary: Optional[str] = None
    doctor_notes: Optional[str] = None


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Medverse Clinical AI Engine",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@app.post("/api/intake/chat", response_model=ChatTurnResponse)
def handle_chat_turn(request: ChatTurnRequest):
    """
    Handles LLM dialogue turn:
    - Adaptive state machine (SOCRATES or Dashavidha Pariksha)
    - Red-Flag detection middleware
    - Follow-up questions and dynamic touch chips
    """
    response = process_chat_turn(request)
    return response


@app.post("/api/documents/extract", response_model=DocumentExtractionResponse)
async def handle_document_extract(request: Request):
    """
    Accepts uploaded/scanned image preset via JSON, FormData, or Query parameters.
    """
    preset_key = "lab_glucose"
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            preset_key = body.get("preset_key", "lab_glucose")
        except Exception:
            pass
    elif "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        try:
            form = await request.form()
            preset_key = str(form.get("preset_key", "lab_glucose"))
        except Exception:
            pass
    elif request.query_params.get("preset_key"):
        preset_key = str(request.query_params.get("preset_key"))

    return mock_ocr_extract(preset_key)


@app.get("/api/patients/{id}/timeline")
def get_patient_timeline(id: str):
    """
    Returns aggregated chronological medical history for the patient.
    """
    patient = PATIENT_STORE.get(id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    sorted_history = sort_clinical_timeline(patient["historyTimeline"], ascending=False)
    return {
        "patient_id": id,
        "name": patient["name"],
        "has_red_flag": patient.get("hasRedFlag", False),
        "timeline": sorted_history
    }


@app.post("/api/cases/similar")
def get_similar_cases(request: SimilarCasesRequest):
    """
    Accepts patient context (e.g. 'Diabetes + Hypertension' or 'Chest Pain')
    and returns 2-3 matched past cases with Treatment Duration and Outcome.
    """
    context = request.patient_context or request.chief_complaint or ""
    results = search_similar_cases(context, top_k=request.top_k or 3)
    return {
        "query": context,
        "matched_cases": results,
        "matches": results
    }


@app.get("/api/patients/{id}")
def get_patient_profile(id: str):
    patient = PATIENT_STORE.get(id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient


@app.get("/api/patients")
def list_patients():
    return list(PATIENT_STORE.values())


@app.post("/api/patients/review")
def review_patient_summary(payload: DoctorReviewRequest):
    patient = PATIENT_STORE.get(payload.patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    patient["reviewStatus"] = payload.action
    if payload.updated_summary:
        patient["aiSummary"] = payload.updated_summary
    if payload.doctor_notes:
        patient["doctorNotes"] = payload.doctor_notes
        
    return {
        "status": "success",
        "action": payload.action,
        "patient_id": payload.patient_id,
        "reviewStatus": patient["reviewStatus"]
    }


@app.get("/api/patients/{id}/fhir")
def export_patient_fhir(id: str):
    """Generates an HL7 FHIR R4 Bundle for the patient."""
    patient = PATIENT_STORE.get(id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    bundle = {
        "resourceType": "Bundle",
        "type": "collection",
        "entry": [
            {
                "resource": {
                    "resourceType": "Patient",
                    "id": patient["id"],
                    "identifier": [{"system": "https://abdm.gov.in/abha", "value": patient["abhaId"]}],
                    "name": [{"text": patient["name"]}],
                    "telecom": [{"system": "phone", "value": patient["phone"]}],
                    "gender": patient["gender"].lower()
                }
            },
            {
                "resource": {
                    "resourceType": "Condition",
                    "id": f"cond-{patient['id']}",
                    "clinicalStatus": {"coding": [{"system": "http://terminology.hl7.org/CodeSystem/condition-clinical", "code": "active"}]},
                    "code": {"text": patient["chiefComplaint"]},
                    "subject": {"reference": f"Patient/{patient['id']}"}
                }
            }
        ]
    }
    return bundle


@app.post("/api/prescriptions/safety-check", response_model=SafetyCheckResponse)
def handle_drug_safety_check(request: SafetyCheckRequest):
    """
    Analyzes co-prescribed pharmaceuticals (Allopathic) and Ayurvedic formulations (AYUSH)
    for pharmacokinetic and pharmacodynamic interactions.
    """
    return check_drug_safety(request)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
