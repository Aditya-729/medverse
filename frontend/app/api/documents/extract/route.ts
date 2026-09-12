import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    let presetKey = 'lab_glucose';
    try {
      const formData = await req.formData();
      presetKey = (formData.get('preset_key') as string) || 'lab_glucose';
    } catch {
      // json fallback
    }

    if (presetKey === 'prescription_rx') {
      return NextResponse.json({
        document_id: `doc-${Date.now()}`,
        doc_type: 'Prescription',
        date: '2024-01-18',
        facility_name: 'Civil District Hospital OPD',
        doctor_name: 'Dr. Ananya Sen, DNB (Internal Med)',
        ocr_raw_snippet: 'Rx: Tab Metformin 500mg BD. Tab Telmisartan 40mg OD. Tab Atorvastatin 10mg HS.',
        extracted_entities: [
          { name: 'Metformin', value: '500 mg', unit: 'BD', reference_range: null, is_abnormal: false, clinical_category: 'MEDICATION' },
          { name: 'Telmisartan', value: '40 mg', unit: 'OD', reference_range: null, is_abnormal: false, clinical_category: 'MEDICATION' },
          { name: 'Atorvastatin', value: '10 mg', unit: 'HS', reference_range: null, is_abnormal: false, clinical_category: 'MEDICATION' },
          { name: 'Type 2 Diabetes Mellitus', value: 'Diagnosed', unit: null, reference_range: null, is_abnormal: true, clinical_category: 'DIAGNOSIS' }
        ],
        fhir_bundle: { resourceType: 'Bundle', type: 'document', entry: [] }
      });
    }

    if (presetKey === 'ayush_chikitsa') {
      return NextResponse.json({
        document_id: `doc-${Date.now()}`,
        doc_type: 'Ayurvedic Chikitsa Patra',
        date: '2023-11-05',
        facility_name: 'National Institute of Ayurveda (NIA) Hospital',
        doctor_name: 'Vaidya Suresh Joshi, BAMS, MD',
        ocr_raw_snippet: 'Rogipatra: Sandhivata. Nadi: Vata-dominant. Agni: Mandagni. Yogaraj Guggulu 2 tabs BD.',
        extracted_entities: [
          { name: 'Yogaraj Guggulu', value: '2 tablets', unit: 'BD', reference_range: null, is_abnormal: false, clinical_category: 'MEDICATION' },
          { name: 'Dashamoola Kashayam', value: '15 ml', unit: 'BD', reference_range: null, is_abnormal: false, clinical_category: 'MEDICATION' },
          { name: 'Sandhivata', value: 'Vata-Vyadhi', unit: null, reference_range: null, is_abnormal: true, clinical_category: 'DIAGNOSIS' },
          { name: 'Agni Assessment', value: 'Mandagni', unit: null, reference_range: null, is_abnormal: true, clinical_category: 'AYUSH' }
        ],
        fhir_bundle: { resourceType: 'Bundle', type: 'document', entry: [] }
      });
    }

    // Default lab glucose
    return NextResponse.json({
      document_id: `doc-${Date.now()}`,
      doc_type: 'Lab Report',
      date: '2024-03-12',
      facility_name: 'AIIMS New Delhi Central Pathology Lab',
      doctor_name: 'Dr. R. K. Sharma, MD',
      ocr_raw_snippet: 'HbA1c: 8.2 %. Fasting Blood Sugar: 168 mg/dL. PP Sugar: 245 mg/dL. Serum Creatinine: 1.1 mg/dL.',
      extracted_entities: [
        { name: 'HbA1c', value: '8.2', unit: '%', reference_range: '< 5.7', is_abnormal: true, clinical_category: 'LAB' },
        { name: 'Fasting Blood Sugar', value: '168', unit: 'mg/dL', reference_range: '70-100', is_abnormal: true, clinical_category: 'LAB' },
        { name: 'PP Blood Sugar', value: '245', unit: 'mg/dL', reference_range: '< 140', is_abnormal: true, clinical_category: 'LAB' },
        { name: 'Serum Creatinine', value: '1.1', unit: 'mg/dL', reference_range: '0.7 - 1.3', is_abnormal: false, clinical_category: 'LAB' }
      ],
      fhir_bundle: { resourceType: 'Bundle', type: 'document', entry: [] }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
