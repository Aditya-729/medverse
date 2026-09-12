import { NextResponse } from 'next/server';

const PATIENTS = [
  {
    id: 'P-102',
    name: 'Sunita Devi Patel',
    age: 58,
    gender: 'Female',
    phone: '+91 94250 88123',
    abhaId: '14-2201-9981-4411',
    language: 'hi',
    prakriti: 'Vata-Pitta',
    hasRedFlag: true,
    redFlagReason: 'Acute crushing chest pain radiating to left shoulder and jaw with cold sweats',
    triagePriority: 'EMERGENCY_RED_FLAG',
    chiefComplaint: 'Crushing Chest Pain & Breathlessness',
    aiSummary: 'EMERGENCY TRIAGE: 58-year-old female presenting with acute severe substernal chest pressure radiating to left arm and jaw, onset 45 minutes ago. Accompanied by diaphoresis and shortness of breath. Red-Flag safety protocol triggered.',
    reviewStatus: 'PENDING',
    token: 'EMERG-AIIMS-RED01',
    vitals: { bp: '168/102 mmHg', pulse: '104 bpm', temp: '98.2 F', spo2: '93%' },
    historyTimeline: [
      { date: '2024-03-14', title: 'Emergency Kiosk Intake', category: 'Emergency Triage', summary: 'Crushing chest pain (VAS 9/10), diaphoresis, hypertension crisis.', is_abnormal: true },
      { date: '2023-09-15', title: 'Cardiology Clinic Consultation', category: 'Clinical Note', summary: 'Borderline ischemia noted on TMT; advised angiography.', is_abnormal: true }
    ],
    glucoseTrend: [
      { month: 'Nov 2023', fasting: 110, postPrandial: 140, hba1c: 6.2 },
      { month: 'Dec 2023', fasting: 115, postPrandial: 145, hba1c: 6.3 },
      { month: 'Jan 2024', fasting: 122, postPrandial: 150, hba1c: 6.4 },
      { month: 'Feb 2024', fasting: 130, postPrandial: 160, hba1c: 6.6 }
    ]
  },
  {
    id: 'P-101',
    name: 'Ramesh Kumar Sharma',
    age: 52,
    gender: 'Male',
    phone: '+91 98765 43210',
    abhaId: '14-8921-7734-0192',
    language: 'hi',
    prakriti: 'Pitta-Kapha',
    hasRedFlag: false,
    triagePriority: 'NORMAL',
    chiefComplaint: 'Uncontrolled Blood Sugar & Fatigue',
    aiSummary: '52-year-old male with known Type 2 Diabetes and Hypertension presenting for routine quarterly evaluation. Reports persistent post-prandial fatigue and morning heaviness. Denies acute chest pain, shortness of breath, or palpitations.',
    reviewStatus: 'PENDING',
    token: 'OPD-AIIMS-A104',
    vitals: { bp: '142/88 mmHg', pulse: '76 bpm', temp: '98.4 F', spo2: '98%' },
    historyTimeline: [
      { date: '2024-03-12', title: 'Central Pathology Lab (AIIMS)', category: 'Lab Report', summary: 'HbA1c: 8.2% (High), Fasting Glucose: 168 mg/dL, PP Glucose: 245 mg/dL', is_abnormal: true },
      { date: '2024-01-18', title: 'District Hospital OPD Consultation', category: 'Prescription', summary: 'Metformin 500mg BD + Telmisartan 40mg OD prescribed by Dr. Ananya Sen.', is_abnormal: false },
      { date: '2023-11-05', title: 'National Institute of Ayurveda Visit', category: 'AYUSH Consultation', summary: 'Diagnosed with Mandagni & Vata-Pitta vitiation; prescribed Yogaraj Guggulu & Nishamalaki.', is_abnormal: false },
      { date: '2023-06-20', title: 'Annual Health Checkup', category: 'Lab Report', summary: 'HbA1c: 7.4%, Lipid Profile: Total Cholesterol 210 mg/dL.', is_abnormal: true }
    ],
    glucoseTrend: [
      { month: 'Dec 2023', fasting: 142, postPrandial: 195, hba1c: 7.4 },
      { month: 'Jan 2024', fasting: 155, postPrandial: 210, hba1c: 7.7 },
      { month: 'Feb 2024', fasting: 160, postPrandial: 230, hba1c: 7.9 },
      { month: 'Mar 2024', fasting: 168, postPrandial: 245, hba1c: 8.2 }
    ]
  }
];

export async function GET() {
  return NextResponse.json(PATIENTS);
}
