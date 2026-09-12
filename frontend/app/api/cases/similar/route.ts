import { NextResponse } from 'next/server';

const HISTORICAL_CASES = [
  {
    case_id: "CASE-IN-8821",
    title: "Type 2 Diabetes Mellitus with Essential Hypertension",
    keywords: ["diabetes", "hypertension", "high blood sugar", "bp", "hba1c", "metformin", "headache", "fatigue"],
    demographics: "54-year-old Male, Non-smoker",
    prakriti: "Pitta-Kapha",
    baseline_vitals: "BP: 154/96 mmHg, Fasting: 172 mg/dL, HbA1c: 8.8%",
    treatment_duration: "90 Days (3 Months)",
    interventions: "Metformin 1000mg BD + Telmisartan 40mg OD + Low glycemic index Indian diet + 45 min brisk walking",
    outcome: "HbA1c reduced to 6.7% (-2.1%); Blood pressure normalized to 122/80 mmHg; Weight reduced by 4.2 kg.",
    ayush_adjuvant: "Added Nishamalaki Churna (Amla + Haldi 3g BD) with warm water; improvement in morning lethargy."
  },
  {
    case_id: "CASE-IN-7419",
    title: "Uncontrolled Diabetes with Microalbuminuria & Dyslipidemia",
    keywords: ["diabetes", "hypertension", "albuminuria", "cholesterol", "tingling", "neuropathy", "hba1c"],
    demographics: "49-year-old Female, Sedentary",
    prakriti: "Kapha-Vata",
    baseline_vitals: "BP: 148/92 mmHg, Fasting: 198 mg/dL, HbA1c: 9.4%",
    treatment_duration: "120 Days (4 Months)",
    interventions: "Empagliflozin 10mg + Metformin 1000mg + Atorvastatin 20mg + Dietary carbohydrate restriction",
    outcome: "HbA1c normalized to 6.9%; Urine albumin-to-creatinine ratio stabilized; Peripheral burning sensation resolved.",
    ayush_adjuvant: "Ayush-82 ayurvedic formulation (5g BD); reported significant relief in polyuria and fatigue."
  },
  {
    case_id: "CASE-IN-9311",
    title: "Acute Chest Discomfort with Diaphoresis (Emergency Protocol)",
    keywords: ["chest pain", "breathing difficulty", "angina", "sweating", "radiating to left arm", "red flag"],
    demographics: "58-year-old Male, Smoker",
    prakriti: "Vata-Pitta",
    baseline_vitals: "BP: 168/104 mmHg, Pulse: 108 bpm, SpO2: 94%",
    treatment_duration: "Emergency Inpatient (5 Days) followed by 6-month Rehab",
    interventions: "Immediate dual antiplatelet load (Aspirin 300mg + Clopidogrel 300mg) + Atorvastatin 80mg -> Primary PCI",
    outcome: "Successful revascularization; Left ventricular ejection fraction preserved at 52%; Discharged on cardiac rehab.",
    ayush_adjuvant: "Post-stabilization: Arjuna Ksheerapaka (Terminalia arjuna milk decoction) under cardiology supervision."
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = (body.patient_context || '').toLowerCase();

    const scored = HISTORICAL_CASES.map((c) => {
      let score = 75;
      if (query.includes('chest') || query.includes('emergency')) {
        if (c.keywords.includes('chest pain')) score = 96;
      } else if (query.includes('diabetes') || query.includes('sugar') || query.includes('fatigue')) {
        if (c.keywords.includes('diabetes')) score = 94;
      }
      return {
        ...c,
        similarity_score: `${score}%`,
        score_numeric: score
      };
    }).sort((a, b) => b.score_numeric - a.score_numeric);

    return NextResponse.json({
      query,
      matched_cases: scored.slice(0, 3)
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
