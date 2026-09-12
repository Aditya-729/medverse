"""
Medverse Document OCR & Timeline Engine
Handles:
1. Extraction of clinical entities from scanned prescriptions and lab reports
2. Outputting structured JSON conformant with HL7 FHIR R4
3. Sorting and merging unstructured documents into a linear chronological timeline
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class ExtractedEntity(BaseModel):
    name: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    is_abnormal: bool = False
    clinical_category: str # "LAB", "MEDICATION", "DIAGNOSIS", "VITAL"


class DocumentExtractionResponse(BaseModel):
    document_id: str
    doc_type: str # "Lab Report", "Prescription", "Discharge Summary"
    date: str # "YYYY-MM-DD"
    facility_name: str
    doctor_name: Optional[str] = None
    extracted_entities: List[Dict[str, Any]]
    ocr_raw_snippet: str
    fhir_bundle: Dict[str, Any]


# Presets for Mock OCR simulations
PRESET_DOCUMENTS = {
    "lab_glucose": {
        "doc_type": "Lab Report",
        "date": "2024-03-12",
        "facility_name": "AIIMS New Delhi Central Pathology Lab",
        "doctor_name": "Dr. R. K. Sharma, MD",
        "raw_text": "AIIMS Central Pathology Lab. Patient ID: AIIMS-98211. Date: 12-03-2024. Fasting Blood Sugar: 168 mg/dL (Normal: 70-100). Post-Prandial Blood Sugar: 245 mg/dL. Glycated Hemoglobin (HbA1c): 8.2 % (Normal < 5.7%, Diabetic >= 6.5%). Serum Creatinine: 1.1 mg/dL.",
        "entities": [
            {"name": "HbA1c", "value": "8.2", "unit": "%", "reference_range": "< 5.7", "is_abnormal": True, "clinical_category": "LAB"},
            {"name": "Fasting Blood Sugar", "value": "168", "unit": "mg/dL", "reference_range": "70-100", "is_abnormal": True, "clinical_category": "LAB"},
            {"name": "PP Blood Sugar", "value": "245", "unit": "mg/dL", "reference_range": "< 140", "is_abnormal": True, "clinical_category": "LAB"},
            {"name": "Serum Creatinine", "value": "1.1", "unit": "mg/dL", "reference_range": "0.7 - 1.3", "is_abnormal": False, "clinical_category": "LAB"}
        ]
    },
    "prescription_rx": {
        "doc_type": "Prescription",
        "date": "2024-01-18",
        "facility_name": "Civil District Hospital OPD",
        "doctor_name": "Dr. Ananya Sen, DNB (Internal Med)",
        "raw_text": "Rx: Tab Metformin 500mg - 1 tab twice daily after meals. Tab Telmisartan 40mg - 1 tab once daily morning. Tab Atorvastatin 10mg - 1 tab at bedtime. Advised low salt, low carbohydrate diabetic diet.",
        "entities": [
            {"name": "Metformin", "value": "500 mg", "unit": "BD", "reference_range": None, "is_abnormal": False, "clinical_category": "MEDICATION"},
            {"name": "Telmisartan", "value": "40 mg", "unit": "OD", "reference_range": None, "is_abnormal": False, "clinical_category": "MEDICATION"},
            {"name": "Atorvastatin", "value": "10 mg", "unit": "HS", "reference_range": None, "is_abnormal": False, "clinical_category": "MEDICATION"},
            {"name": "Type 2 Diabetes Mellitus", "value": "Diagnosed", "unit": None, "reference_range": None, "is_abnormal": True, "clinical_category": "DIAGNOSIS"}
        ]
    },
    "ayush_chikitsa": {
        "doc_type": "Ayurvedic Chikitsa Patra",
        "date": "2023-11-05",
        "facility_name": "National Institute of Ayurveda (NIA) Hospital",
        "doctor_name": "Vaidya Suresh Joshi, BAMS, MD (Ayu)",
        "raw_text": "Rogipatra: Sandhivata (Osteoarthritis/Vata vyadhi). Nadi: Vata-dominant. Agni: Mandagni. Rx: Yogaraj Guggulu 2 tabs twice daily with warm water. Dashamoola Kashayam 15ml with equal warm water morning and evening. Janu Basti with Mahanarayana Taila advised for 7 days.",
        "entities": [
            {"name": "Yogaraj Guggulu", "value": "2 tablets", "unit": "BD", "reference_range": None, "is_abnormal": False, "clinical_category": "MEDICATION"},
            {"name": "Dashamoola Kashayam", "value": "15 ml", "unit": "BD", "reference_range": None, "is_abnormal": False, "clinical_category": "MEDICATION"},
            {"name": "Sandhivata", "value": "Vata-Vyadhi", "unit": None, "reference_range": None, "is_abnormal": True, "clinical_category": "DIAGNOSIS"},
            {"name": "Agni Assessment", "value": "Mandagni", "unit": None, "reference_range": None, "is_abnormal": True, "clinical_category": "AYUSH"}
        ]
    }
}


def mock_ocr_extract(preset_key: str = "lab_glucose", custom_text: Optional[str] = None) -> DocumentExtractionResponse:
    """Simulates OCR extraction on an uploaded or camera-scanned clinical document."""
    preset = PRESET_DOCUMENTS.get(preset_key, PRESET_DOCUMENTS["lab_glucose"])
    doc_date = preset["date"]
    
    # Generate HL7 FHIR R4 Bundle
    fhir_entries = []
    for idx, ent in enumerate(preset["entities"]):
        if ent["clinical_category"] == "LAB":
            fhir_entries.append({
                "resource": {
                    "resourceType": "Observation",
                    "id": f"obs-{idx+1}",
                    "status": "final",
                    "code": {"text": ent["name"]},
                    "effectiveDateTime": doc_date,
                    "valueQuantity": {
                        "value": float(ent["value"]) if ent["value"].replace('.', '', 1).isdigit() else 0.0,
                        "unit": ent.get("unit", "") or "unit",
                        "system": "http://unitsofmeasure.org",
                        "code": ent.get("unit", "") or "unit"
                    }
                }
            })

    fhir_bundle = {
        "resourceType": "Bundle",
        "type": "document",
        "timestamp": f"{doc_date}T09:30:00Z",
        "entry": fhir_entries
    }

    return DocumentExtractionResponse(
        document_id=f"doc-{int(datetime.now().timestamp())}",
        doc_type=preset["doc_type"],
        date=doc_date,
        facility_name=preset["facility_name"],
        doctor_name=preset["doctor_name"],
        extracted_entities=preset["entities"],
        ocr_raw_snippet=preset["raw_text"],
        fhir_bundle=fhir_bundle
    )


def sort_clinical_timeline(records: List[Dict[str, Any]], ascending: bool = False) -> List[Dict[str, Any]]:
    """
    Takes multiple unstructured document JSONs, lab records, and encounter histories
    and sorts them into a linear chronological timeline.
    """
    def parse_record_date(item: Dict[str, Any]) -> datetime:
        raw_date = item.get("date") or item.get("scannedAt") or item.get("effectiveDateTime") or "2020-01-01"
        for fmt in ("%Y-%m-%d", "%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S", "%d-%m-%Y"):
            try:
                return datetime.strptime(str(raw_date)[:19], fmt)
            except ValueError:
                continue
        return datetime(2020, 1, 1)

    return sorted(records, key=parse_record_date, reverse=not ascending)
