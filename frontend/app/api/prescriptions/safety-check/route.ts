import { NextResponse } from 'next/server';

const HERB_DRUG_DATABASE = [
  {
    allopathic_drug: "Metformin",
    ayush_formulation: "Shilajatu (Shilajit)",
    severity: "MONITOR",
    mechanism: "Shilajit contains fulvic acid and trace minerals that enhance insulin sensitivity and glucose uptake via GLUT-4 translocation.",
    clinical_risk: "Enhanced glycemic reduction. Slight potential for hypoglycemia if patient misses meals.",
    recommendation: "Advise regular home blood glucose tracking. Beneficial synergy may allow Metformin dose optimization."
  },
  {
    allopathic_drug: "Metformin",
    ayush_formulation: "Ayush-82",
    severity: "MONITOR",
    mechanism: "Ayush-82 (Amra, Jambu, Karela, Gudmar) stimulates pancreatic beta-cell insulin secretion additively with Metformin's hepatic gluconeogenesis inhibition.",
    clinical_risk: "Synergistic fasting blood sugar reduction.",
    recommendation: "Highly effective integrative regimen. Check HbA1c at 90 days."
  },
  {
    allopathic_drug: "Aspirin",
    ayush_formulation: "Yogaraj Guggulu",
    severity: "CAUTION",
    mechanism: "Guggulsterones exhibit modest antiplatelet and fibrinolytic properties, which may compound cyclooxygenase-1 (COX-1) inhibition by Aspirin.",
    clinical_risk: "Increased bleeding tendency or minor epistaxis / mucosal bleeding in elderly patients.",
    recommendation: "Space administration by 2 hours. Monitor for signs of easy bruising or melena."
  },
  {
    allopathic_drug: "Telmisartan",
    ayush_formulation: "Punarnavadi Kashayam",
    severity: "MONITOR",
    mechanism: "Punarnava (Boerhavia diffusa) acts as a natural potassium-sparing diuretic, while Telmisartan reduces aldosterone secretion via Angiotensin II type 1 receptor blockade.",
    clinical_risk: "Mild risk of hyperkalemia and additive blood pressure reduction.",
    recommendation: "Monitor serum electrolytes (potassium) and blood pressure at 3-4 weeks."
  },
  {
    allopathic_drug: "Atorvastatin",
    ayush_formulation: "Triphala Guggulu",
    severity: "BENEFICIAL",
    mechanism: "Triphala tannins stimulate hepatic LDL receptor clearance and reduce lipid peroxidation synergistically with HMG-CoA reductase inhibition.",
    clinical_risk: "No negative interaction; supports reverse cholesterol transport.",
    recommendation: "Favorable complementary therapy. Routine annual liver function test (LFT) advised."
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const allo = (body.allopathic_drugs || []).map((d: string) => d.toLowerCase());
    const ayush = (body.ayush_formulations || []).map((a: string) => a.toLowerCase());

    const interactions: any[] = [];
    let hasCaution = false;

    for (const item of HERB_DRUG_DATABASE) {
      const matchAllo = allo.some((d: string) => d.includes(item.allopathic_drug.toLowerCase()));
      const matchAyush = ayush.some((a: string) => a.includes('guggulu') || a.includes('shilajit') || a.includes('punarnava') || a.includes('ayush-82'));

      if (matchAllo && matchAyush) {
        if (item.severity === 'CAUTION' || item.severity === 'CONTRAINDICATED') {
          hasCaution = true;
        }
        interactions.push(item);
      }
    }

    return NextResponse.json({
      total_analyzed: allo.length + ayush.length,
      has_caution: hasCaution,
      interactions_found: interactions,
      integrative_guidance: hasCaution 
        ? "⚠️ Herb-Drug Caution: Co-administration requires spacing dosage and monitoring coagulopathy / electrolytes."
        : interactions.length > 0
        ? "Synergistic response observed. Continue integrative protocol with periodic glycemic monitoring."
        : "No adverse herb-drug interactions detected."
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
