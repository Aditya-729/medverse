import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const patientId = params.id;
  
  if (patientId === 'P-102') {
    return NextResponse.json({
      patient_id: 'P-102',
      name: 'Sunita Devi Patel',
      has_red_flag: true,
      timeline: [
        {
          date: '2024-03-14',
          title: 'Emergency Kiosk Intake',
          category: 'Emergency Triage',
          summary: 'Crushing chest pain (VAS 9/10), diaphoresis, hypertension crisis.',
          is_abnormal: true
        },
        {
          date: '2023-09-15',
          title: 'Cardiology Clinic Consultation',
          category: 'Clinical Note',
          summary: 'Borderline ischemia noted on TMT; advised angiography.',
          is_abnormal: true
        }
      ]
    });
  }

  return NextResponse.json({
    patient_id: 'P-101',
    name: 'Ramesh Kumar Sharma',
    has_red_flag: false,
    timeline: [
      {
        date: '2024-03-12',
        title: 'Central Pathology Lab (AIIMS)',
        category: 'Lab Report',
        summary: 'HbA1c: 8.2% (High), Fasting Glucose: 168 mg/dL, PP Glucose: 245 mg/dL',
        is_abnormal: true
      },
      {
        date: '2024-01-18',
        title: 'District Hospital OPD Consultation',
        category: 'Prescription',
        summary: 'Metformin 500mg BD + Telmisartan 40mg OD prescribed by Dr. Ananya Sen.',
        is_abnormal: false
      },
      {
        date: '2023-11-05',
        title: 'National Institute of Ayurveda Visit',
        category: 'AYUSH Consultation',
        summary: 'Diagnosed with Mandagni & Vata-Pitta vitiation; prescribed Yogaraj Guggulu & Nishamalaki.',
        is_abnormal: false
      },
      {
        date: '2023-06-20',
        title: 'Annual Health Checkup',
        category: 'Lab Report',
        summary: 'HbA1c: 7.4%, Lipid Profile: Total Cholesterol 210 mg/dL.',
        is_abnormal: true
      }
    ]
  });
}
