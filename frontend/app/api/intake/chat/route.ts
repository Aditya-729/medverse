import { NextResponse } from 'next/server';

const RED_FLAG_REGEX = /\b(chest pain|heart pain|pressure in chest|squeezing chest|angina|breathless|breathing difficulty|cant breathe|shortness of breath|gasping|suffocating|sudden weakness|slurred speech|facial droop|unconscious|fainted|blackout|syncope|vomiting blood|coughing blood|hemoptysis|profuse bleeding|worst headache|throat closing)\b/i;

const SOCRATES_STEPS = [
  {
    key: 'SITE',
    question: 'Where exactly is your pain or main discomfort located? Tap a location or speak clearly.',
    chips: ['Chest', 'Abdomen / Stomach', 'Head / Neck', 'Lower Back', 'Joints / Limbs']
  },
  {
    key: 'ONSET',
    question: 'When did this symptom start, and did it come on suddenly or develop gradually?',
    chips: ['Started Today', 'Past 2-3 Days', 'Sudden Onset (Minutes)', 'Chronic (> 2 Weeks)']
  },
  {
    key: 'CHARACTER',
    question: 'How would you describe the sensation? What does it feel like?',
    chips: ['Sharp / Stabbing', 'Dull Ache', 'Throbbing / Pulsing', 'Burning', 'Pressure / Heaviness']
  },
  {
    key: 'RADIATION',
    question: 'Does this sensation travel or spread to any other part of your body?',
    chips: ['Spreads to Left Arm', 'Spreads to Back', 'Radiates to Jaw / Neck', 'Radiates Down Leg', 'Stays in One Spot']
  },
  {
    key: 'ASSOCIATIONS',
    question: 'Are you noticing any other symptoms accompanying this?',
    chips: ['Fever / Chills', 'Nausea / Vomiting', 'Dizziness / Vertigo', 'Excessive Sweating', 'None']
  },
  {
    key: 'TIME_COURSE',
    question: 'How does it behave over time? Is it constant or does it come and go in waves?',
    chips: ['Constant & Unchanging', 'Comes & Goes in Waves', 'Worse in Morning', 'Worse at Night']
  },
  {
    key: 'EXACERBATING',
    question: 'Does anything make the discomfort noticeably better or worse?',
    chips: ['Worse with Walking/Effort', 'Better with Rest', 'Worse after Food', 'Relieved by Antacids', 'No Change']
  },
  {
    key: 'SEVERITY',
    question: 'On a scale of 1 to 10, how severe is your discomfort right now?',
    chips: ['Mild (1 - 3)', 'Moderate (4 - 6)', 'Severe (7 - 8)', 'Extreme Emergency (9 - 10)']
  }
];

const AYUSH_STEPS = [
  {
    key: 'PRAKRITI',
    question: 'Ayurvedic Assessment: What is your predominant physical nature and body frame?',
    chips: ['Vata (Lean, Dry Skin, Active)', 'Pitta (Medium, Warm, Sharp Appetite)', 'Kapha (Sturdy, Cool, Calm)']
  },
  {
    key: 'VIKRITI',
    question: 'What is the primary imbalance or doshic disturbance you are experiencing today?',
    chips: ['Vata (Joint Pain, Stiffness, Gas)', 'Pitta (Acidity, Burning, Inflammation)', 'Kapha (Heavy Chest, Cough, Lethargy)']
  },
  {
    key: 'AGNI',
    question: 'How is your digestive fire (Jatharagni) functioning recently?',
    chips: ['Mandagni (Sluggish, Low Hunger)', 'Tikshnagni (Intense, Hyper-acidic)', 'Vishamagni (Irregular/Bloating)', 'Samagni (Balanced & Normal)']
  },
  {
    key: 'KOSHTHA',
    question: 'How is your bowel movement habit (Koshtha Pariksha)?',
    chips: ['Krura Koshtha (Hard/Constipated)', 'Mridu Koshtha (Soft/Frequent stools)', 'Madhya Koshtha (Regular/Normal)']
  },
  {
    key: 'SARA_SAMHANANA',
    question: 'How do you evaluate your overall muscle stamina and bodily compactness?',
    chips: ['Pravara (High Endurance)', 'Madhyama (Moderate Strength)', 'Avara (Low/Easily Fatigued)']
  },
  {
    key: 'SATMYA_AHARA',
    question: 'What dietary habits or food tastes best agree with your body system?',
    chips: ['Sweet / Cooling foods', 'Warm / Spiced foods', 'Light Soups & Gruel', 'Difficult to digest heavy meals']
  },
  {
    key: 'SATVA_VAYA',
    question: 'How is your mental resilience, stress tolerance, and sleep quality?',
    chips: ['Sound Sleep & Calm', 'Disturbed Sleep / Anxiety', 'Frequent Stress & Irritability']
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMsg = (body.user_message || '').trim();
    const mode = (body.mode || 'ALLOPATHIC').toUpperCase();
    const currentStep = (body.current_step || 'INITIAL').toUpperCase();
    const collectedData = { ...(body.collected_data || {}) };

    const isRedFlag = RED_FLAG_REGEX.test(userMsg);
    const redFlagReason = isRedFlag ? 'Acute Emergency Symptom (Possible ACS / Severe Distress)' : undefined;
    const triageLevel = isRedFlag ? 'EMERGENCY_RED_FLAG' : 'NORMAL';

    const activeSteps = mode === 'ALLOPATHIC' ? SOCRATES_STEPS : AYUSH_STEPS;
    const stepKeys = activeSteps.map((s) => s.key);

    let currIdx = 0;
    if (currentStep !== 'INITIAL' && stepKeys.includes(currentStep)) {
      collectedData[currentStep] = userMsg;
      currIdx = stepKeys.indexOf(currentStep) + 1;
    }

    if (currIdx >= activeSteps.length) {
      const summaryText = mode === 'ALLOPATHIC'
        ? `Patient presents with ${collectedData['CHARACTER'] || 'discomfort'} located in ${collectedData['SITE'] || 'unspecified region'} onset ${collectedData['ONSET'] || 'recently'}. Severity: ${collectedData['SEVERITY'] || 'Moderate'}.`
        : `AYUSH Intake: Assessed Prakriti as ${collectedData['PRAKRITI'] || 'Mixed'}, presenting with ${collectedData['VIKRITI'] || 'imbalance'}, Agni: ${collectedData['AGNI'] || 'Mandagni'}, Koshtha: ${collectedData['KOSHTHA'] || 'Madhya'}.`;

      return NextResponse.json({
        reply_text: 'Thank you. Your intake responses have been recorded and structured for the physician.',
        next_step: 'COMPLETED',
        is_completed: true,
        quick_chips: ['Review Intake Slip', 'Scan Past Records', 'Consult Doctor'],
        is_red_flag: isRedFlag,
        red_flag_reason: redFlagReason,
        triage_level: triageLevel,
        extracted_summary: {
          chief_complaint: collectedData['SITE'] || collectedData['VIKRITI'] || 'Clinical Discomfort',
          clinical_notes: summaryText,
          structured_parameters: collectedData,
          mode,
          is_red_flag: isRedFlag,
          red_flag_reason: redFlagReason
        }
      });
    }

    const nextStepData = activeSteps[currIdx];
    let reply = nextStepData.question;
    if (isRedFlag) {
      reply = `⚠️ Priority Alert: Emergency symptom detected. Medical team alerted. Please answer: ${reply}`;
    }

    return NextResponse.json({
      reply_text: reply,
      next_step: nextStepData.key,
      is_completed: false,
      quick_chips: nextStepData.chips,
      is_red_flag: isRedFlag,
      red_flag_reason: redFlagReason,
      triage_level: triageLevel,
      extracted_summary: null
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
