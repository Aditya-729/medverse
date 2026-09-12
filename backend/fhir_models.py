"""
Medverse HL7 FHIR R4 Schema & Helper Models
Conforms to HL7 FHIR R4 specifications for Indian Health Data Interoperability (ABDM compatible).
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class FHIRCoding(BaseModel):
    system: str
    code: str
    display: str


class FHIRCodeableConcept(BaseModel):
    coding: List[FHIRCoding]
    text: Optional[str] = None


class FHIRReference(BaseModel):
    reference: str
    display: Optional[str] = None


class FHIRQuantity(BaseModel):
    value: float
    unit: str
    system: str = "http://unitsofmeasure.org"
    code: str


class FHIRPatient(BaseModel):
    resourceType: str = "Patient"
    id: str
    identifier: List[Dict[str, Any]] = Field(default_factory=list)
    active: bool = True
    name: List[Dict[str, Any]] = Field(default_factory=list)
    telecom: List[Dict[str, Any]] = Field(default_factory=list)
    gender: str
    birthDate: Optional[str] = None


class FHIRObservation(BaseModel):
    resourceType: str = "Observation"
    id: str
    status: str = "final"
    category: List[FHIRCodeableConcept] = Field(default_factory=list)
    code: FHIRCodeableConcept
    subject: FHIRReference
    effectiveDateTime: str
    valueQuantity: Optional[FHIRQuantity] = None
    valueString: Optional[str] = None
    interpretation: Optional[List[FHIRCodeableConcept]] = None


class FHIRCondition(BaseModel):
    resourceType: str = "Condition"
    id: str
    clinicalStatus: FHIRCodeableConcept
    verificationStatus: FHIRCodeableConcept
    category: List[FHIRCodeableConcept] = Field(default_factory=list)
    code: FHIRCodeableConcept
    subject: FHIRReference
    onsetDateTime: Optional[str] = None


class FHIRDiagnosticReport(BaseModel):
    resourceType: str = "DiagnosticReport"
    id: str
    status: str = "final"
    category: List[FHIRCodeableConcept] = Field(default_factory=list)
    code: FHIRCodeableConcept
    subject: FHIRReference
    effectiveDateTime: str
    result: List[FHIRReference] = Field(default_factory=list)
    conclusion: Optional[str] = None


class FHIRBundle(BaseModel):
    resourceType: str = "Bundle"
    type: str = "collection"
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    entry: List[Dict[str, Any]] = Field(default_factory=list)


def create_fhir_observation(
    obs_id: str,
    patient_id: str,
    name: str,
    value: float,
    unit: str,
    date_str: str,
    loinc_code: str = "4548-4"
) -> Dict[str, Any]:
    """Helper to generate a valid FHIR R4 Observation JSON dictionary."""
    return {
        "resourceType": "Observation",
        "id": obs_id,
        "status": "final",
        "category": [
            {
                "coding": [
                    {
                        "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                        "code": "laboratory",
                        "display": "Laboratory"
                    }
                ]
            }
        ],
        "code": {
            "coding": [
                {
                    "system": "http://loinc.org",
                    "code": loinc_code,
                    "display": name
                }
            ],
            "text": name
        },
        "subject": {
            "reference": f"Patient/{patient_id}"
        },
        "effectiveDateTime": date_str,
        "valueQuantity": {
            "value": value,
            "unit": unit,
            "system": "http://unitsofmeasure.org",
            "code": unit
        }
    }
