"""
Medverse AYUSH-Allopathy Herb-Drug Interaction & Clinical Safety Engine
Analyzes co-prescribed pharmaceuticals (Allopathic) and Ayurvedic formulations (AYUSH)
for pharmacokinetic and pharmacodynamic interactions.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class DrugInteractionItem(BaseModel):
    allopathic_drug: str
    ayush_formulation: str
    severity: str # "BENEFICIAL", "MONITOR", "CAUTION", "CONTRAINDICATED"
    mechanism: str
    clinical_risk: str
    recommendation: str


# Knowledgebase of verified Herb-Drug interactions
HERB_DRUG_DATABASE: List[DrugInteractionItem] = [
    DrugInteractionItem(
        allopathic_drug="Metformin",
        ayush_formulation="Shilajatu (Shilajit)",
        severity="MONITOR",
        mechanism="Shilajit contains fulvic acid and trace minerals that enhance insulin sensitivity and glucose uptake via GLUT-4 translocation.",
        clinical_risk="Enhanced glycemic reduction. Slight potential for hypoglycemia if patient misses meals.",
        recommendation="Advise regular home blood glucose tracking. Beneficial synergy may allow Metformin dose optimization."
    ),
    DrugInteractionItem(
        allopathic_drug="Metformin",
        ayush_formulation="Ayush-82",
        severity="MONITOR",
        mechanism="Ayush-82 (Amra, Jambu, Karela, Gudmar) stimulates pancreatic beta-cell insulin secretion additively with Metformin's hepatic gluconeogenesis inhibition.",
        clinical_risk="Synergistic fasting blood sugar reduction.",
        recommendation="Highly effective integrative regimen. Check HbA1c at 90 days."
    ),
    DrugInteractionItem(
        allopathic_drug="Aspirin",
        ayush_formulation="Yogaraj Guggulu",
        severity="CAUTION",
        mechanism="Guggulsterones exhibit modest antiplatelet and fibrinolytic properties, which may compound cyclooxygenase-1 (COX-1) inhibition by Aspirin.",
        clinical_risk="Increased bleeding tendency or minor epistaxis / mucosal bleeding in elderly patients.",
        recommendation="Space administration by 2 hours. Monitor for signs of easy bruising or melena."
    ),
    DrugInteractionItem(
        allopathic_drug="Telmisartan",
        ayush_formulation="Punarnavadi Kashayam",
        severity="MONITOR",
        mechanism="Punarnava (Boerhavia diffusa) acts as a natural potassium-sparing diuretic, while Telmisartan reduces aldosterone secretion via Angiotensin II type 1 receptor blockade.",
        clinical_risk="Mild risk of hyperkalemia and additive blood pressure reduction.",
        recommendation="Monitor serum electrolytes (potassium) and blood pressure at 3-4 weeks."
    ),
    DrugInteractionItem(
        allopathic_drug="Atorvastatin",
        ayush_formulation="Triphala Guggulu",
        severity="BENEFICIAL",
        mechanism="Triphala tannins stimulate hepatic LDL receptor clearance and reduce lipid peroxidation synergistically with HMG-CoA reductase inhibition.",
        clinical_risk="No negative interaction; supports reverse cholesterol transport.",
        recommendation="Favorable complementary therapy. Routine annual liver function test (LFT) advised."
    ),
    DrugInteractionItem(
        allopathic_drug="Warfarin",
        ayush_formulation="Lashuna (Garlic Vati)",
        severity="CAUTION",
        mechanism="Garlic compounds (ajoene, allicin) inhibit platelet aggregation and thromboxane synthesis.",
        clinical_risk="Elevated international normalized ratio (INR) and bleeding risk.",
        recommendation="Avoid high-dose garlic extracts while on oral anticoagulants without INR supervision."
    )
]


class SafetyCheckRequest(BaseModel):
    allopathic_drugs: Optional[List[str]] = []
    ayush_formulations: Optional[List[str]] = []
    medications: Optional[List[str]] = []


class SafetyCheckResponse(BaseModel):
    total_analyzed: int
    has_caution: bool
    interactions_found: List[Dict[str, Any]]
    integrative_guidance: str


def check_drug_safety(request: SafetyCheckRequest) -> SafetyCheckResponse:
    """Scans lists of co-prescribed drugs for known herb-drug interactions."""
    interactions = []
    has_caution = False

    allo_input = list(request.allopathic_drugs or [])
    ayush_input = list(request.ayush_formulations or [])

    # If unified medications list is provided, intelligently classify
    if request.medications:
        ayush_keywords = ["karela", "momordica", "shilajit", "guggulu", "triphala", "punarnava", "ayush", "vati", "churna", "kashayam", "asava", "bhasma", "arjuna", "ashwagandha", "neem", "haldi", "amla"]
        for med in request.medications:
            med_clean = med.strip()
            if any(k in med_clean.lower() for k in ayush_keywords):
                if med_clean not in ayush_input:
                    ayush_input.append(med_clean)
            else:
                if med_clean not in allo_input:
                    allo_input.append(med_clean)

    allo_lower = [d.lower() for d in allo_input]
    ayush_lower = [a.lower() for a in ayush_input]

    for item in HERB_DRUG_DATABASE:
        matches_allo = any(item.allopathic_drug.lower() in d for d in allo_lower)
        matches_ayush = any(
            any(token in a for token in item.ayush_formulation.lower().replace("(", "").replace(")", "").split() if len(token) > 3)
            for a in ayush_lower
        )

        if matches_allo and matches_ayush:
            if item.severity in ("CAUTION", "CONTRAINDICATED"):
                has_caution = True
            interactions.append(item.model_dump())

    if not interactions:
        guidance = "No adverse pharmacokinetic herb-drug interactions detected between selected regimens. Standard clinical monitoring applies."
    elif has_caution:
        guidance = "⚠️ Moderate-to-high herb-drug caution identified. Please review bleeding/potassium parameters and adjust dosing intervals."
    else:
        guidance = "Synergistic and beneficial interactions identified. Monitor response for potential dosage down-titration."

    return SafetyCheckResponse(
        total_analyzed=len(allo_input) + len(ayush_input),
        has_caution=has_caution,
        interactions_found=interactions,
        integrative_guidance=guidance
    )
