"""
Medverse Similar Patient Cases (Vector Search) Engine
Simulates pgvector cosine similarity search over clinical symptom & diagnosis embeddings.
Returns historically similar cases with matched treatment durations and clinical outcomes.
"""

from typing import List, Dict, Any, Optional
import math


# Historical Clinical Cohort Knowledgebase
HISTORICAL_CASES = [
    {
        "case_id": "CASE-IN-8821",
        "title": "Type 2 Diabetes Mellitus with Essential Hypertension",
        "keywords": ["diabetes", "hypertension", "high blood sugar", "bp", "hba1c", "metformin", "headache", "fatigue"],
        "demographics": "54-year-old Male, Non-smoker",
        "prakriti": "Pitta-Kapha",
        "baseline_vitals": "BP: 154/96 mmHg, Fasting: 172 mg/dL, HbA1c: 8.8%",
        "treatment_duration": "90 Days (3 Months)",
        "interventions": "Metformin 1000mg BD + Telmisartan 40mg OD + Low glycemic index Indian diet + 45 min brisk walking",
        "outcome": "HbA1c reduced to 6.7% (-2.1%); Blood pressure normalized to 122/80 mmHg; Weight reduced by 4.2 kg.",
        "ayush_adjuvant": "Added Nishamalaki Churna (Amla + Haldi 3g BD) with warm water; improvement in morning lethargy."
    },
    {
        "case_id": "CASE-IN-7419",
        "title": "Uncontrolled Diabetes with Microalbuminuria & Dyslipidemia",
        "keywords": ["diabetes", "hypertension", "albuminuria", "cholesterol", "tingling", "neuropathy", "hba1c"],
        "demographics": "49-year-old Female, Sedentary",
        "prakriti": "Kapha-Vata",
        "baseline_vitals": "BP: 148/92 mmHg, Fasting: 198 mg/dL, HbA1c: 9.4%",
        "treatment_duration": "120 Days (4 Months)",
        "interventions": "Empagliflozin 10mg + Metformin 1000mg + Atorvastatin 20mg + Dietary carbohydrate restriction",
        "outcome": "HbA1c normalized to 6.9%; Urine albumin-to-creatinine ratio stabilized; Peripheral burning sensation resolved.",
        "ayush_adjuvant": "Ayush-82 ayurvedic formulation (5g BD); reported significant relief in polyuria and fatigue."
    },
    {
        "case_id": "CASE-IN-6104",
        "title": "Metabolic Syndrome with Mild Fatty Liver & Borderline HTN",
        "keywords": ["diabetes", "hypertension", "fatty liver", "metabolic syndrome", "obesity", "triglycerides"],
        "demographics": "42-year-old Male, IT Professional",
        "prakriti": "Pitta-Vata",
        "baseline_vitals": "BP: 138/88 mmHg, Fasting: 142 mg/dL, HbA1c: 7.6%",
        "treatment_duration": "60 Days (8 Weeks)",
        "interventions": "Lifestyle modification + Metformin 500mg OD + Intermittent fasting (14/10)",
        "outcome": "HbA1c decreased to 6.1%; Triglycerides reduced by 35%; BP stabilized at 120/78 without antihypertensives.",
        "ayush_adjuvant": "Triphala Guggulu 2 tabs BD + Arogyavardhini Vati for liver enzymatic clearance."
    },
    {
        "case_id": "CASE-IN-9311",
        "title": "Acute Chest Discomfort with Diaphoresis (Emergency Protocol)",
        "keywords": ["chest pain", "breathing difficulty", "angina", "sweating", "radiating to left arm", "red flag"],
        "demographics": "58-year-old Male, Smoker",
        "prakriti": "Vata-Pitta",
        "baseline_vitals": "BP: 168/104 mmHg, Pulse: 108 bpm, SpO2: 94%",
        "treatment_duration": "Emergency Inpatient (5 Days) followed by 6-month Rehab",
        "interventions": "Immediate dual antiplatelet load (Aspirin 300mg + Clopidogrel 300mg) + Atorvastatin 80mg -> Primary PCI with DES to LAD",
        "outcome": "Successful revascularization; Left ventricular ejection fraction preserved at 52%; Discharged on cardiac rehab.",
        "ayush_adjuvant": "Post-stabilization: Arjuna Ksheerapaka (Terminalia arjuna milk decoction) under cardiology supervision."
    },
    {
        "case_id": "CASE-IN-4920",
        "title": "Amavata / Polyarthritis with Chronic Morning Stiffness",
        "keywords": ["joint pain", "swelling", "stiffness", "amavata", "rheumatoid", "arthritis", "mandagni"],
        "demographics": "46-year-old Female",
        "prakriti": "Vata-Kapha",
        "baseline_vitals": "ESR: 54 mm/hr, CRP: 22 mg/L, High RF positive",
        "treatment_duration": "90 Days (3 Months)",
        "interventions": "Valuka Sweda (dry heat fomentation) + Simhanada Guggulu 2 tabs TDS + Castor oil (Erandataila) at bedtime",
        "outcome": "Visual Analogue Pain Scale reduced from 8/10 to 2/10; Morning stiffness reduced from 90 mins to 15 mins; CRP normalized to 3.8 mg/L.",
        "ayush_adjuvant": "Deepana-Pachana therapy with Shunthi-Chitrakadi Vati to eradicate Ama (endotoxins)."
    }
]


def search_similar_cases(query_text: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Performs mock cosine vector similarity search.
    Scores cases based on semantic keyword and concept overlap.
    """
    query_tokens = set(query_text.lower().replace(",", " ").replace("+", " ").split())
    
    scored_cases = []
    for case in HISTORICAL_CASES:
        # Calculate semantic match score
        matches = 0
        for kw in case["keywords"]:
            if any(q in kw or kw in q for q in query_tokens if len(q) > 2):
                matches += 1.5
        
        # Base similarity calculation (normalized to 75% - 98%)
        if matches > 0:
            raw_score = 0.75 + min(0.23, (matches * 0.06))
        else:
            raw_score = 0.62

        sim_percentage = round(raw_score * 100, 1)
        scored_cases.append({
            **case,
            "similarity_score": f"{sim_percentage}%",
            "score_numeric": sim_percentage
        })

    # Sort by highest similarity
    scored_cases.sort(key=lambda x: x["score_numeric"], reverse=True)
    return scored_cases[:top_k]
