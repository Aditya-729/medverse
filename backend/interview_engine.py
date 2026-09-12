"""
Medverse Adaptive Conversational History Engine
Implements:
1. Allopathic Mode: SOCRATES framework state machine
2. AYUSH Mode: Ayurvedic Dashavidha Pariksha state machine
3. Red-Flag Detection Middleware for acute triage emergencies
"""

import re
from typing import Dict, List, Optional, Any, Tuple
from pydantic import BaseModel


class ChatTurnRequest(BaseModel):
    patient_id: Optional[str] = "P-101"
    mode: Optional[str] = "ALLOPATHIC" # "ALLOPATHIC" or "AYUSH"
    clinical_system: Optional[str] = None # Alias for mode
    language: Optional[str] = "en"
    current_step: Optional[str] = "INITIAL"
    user_message: Optional[str] = ""
    message: Optional[str] = None # Alias for user_message
    conversation_history: Optional[List[Dict[str, str]]] = []
    collected_data: Optional[Dict[str, Any]] = {}


class ChatTurnResponse(BaseModel):
    reply_text: str
    next_step: str
    is_completed: bool
    quick_chips: List[str]
    is_red_flag: bool
    red_flag_reason: Optional[str] = None
    triage_level: str # "NORMAL", "URGENT", "EMERGENCY_RED_FLAG"
    extracted_summary: Optional[Dict[str, Any]] = None


# Emergency Red-Flag Keywords & RegEx
RED_FLAG_PATTERNS = [
    (r"\b(chest pain|heart pain|pressure in chest|squeezing chest|angina)\b", "Acute Cardiovascular Emergency / Possible ACS"),
    (r"\b(breathless|breathing difficulty|cant breathe|shortness of breath|gasping|suffocating|stridor)\b", "Acute Respiratory Distress"),
    (r"\b(sudden weakness|slurred speech|facial droop|face drooping|cant move arm|hemiplegia|stroke)\b", "Possible Acute Stroke / Neurological Emergency"),
    (r"\b(unconscious|fainted|blackout|syncope|collapsed|unresponsive)\b", "Loss of Consciousness / Syncope"),
    (r"\b(vomiting blood|coughing blood|hemoptysis|hematemesis|profuse bleeding|uncontrolled bleeding)\b", "Acute Hemorrhage / Active Bleeding"),
    (r"\b(worst headache|thunderclap headache|sudden severe head pain)\b", "Suspected Subarachnoid Hemorrhage / Intracranial Event"),
    (r"\b(throat closing|swollen tongue|anaphylaxis|severe allergic)\b", "Severe Anaphylaxis")
]


def scan_for_red_flags(text: str) -> Tuple[bool, Optional[str]]:
    """Middleware scanner checking patient input for emergency keywords."""
    lowered = text.lower()
    for pattern, reason in RED_FLAG_PATTERNS:
        if re.search(pattern, lowered):
            return True, reason
    return False, None


# SOCRATES Framework Definition
SOCRATES_STEPS = [
    {
        "key": "SITE",
        "question": "Where exactly is your pain or main discomfort located? Tap a location or speak clearly.",
        "chips": ["Chest", "Abdomen / Stomach", "Head / Neck", "Lower Back", "Joints / Limbs"]
    },
    {
        "key": "ONSET",
        "question": "When did this symptom start, and did it come on suddenly or develop gradually?",
        "chips": ["Started Today", "Past 2-3 Days", "Sudden Onset (Minutes)", "Chronic (> 2 Weeks)"]
    },
    {
        "key": "CHARACTER",
        "question": "How would you describe the sensation? What does it feel like?",
        "chips": ["Sharp / Stabbing", "Dull Ache", "Throbbing / Pulsing", "Burning", "Pressure / Heaviness"]
    },
    {
        "key": "RADIATION",
        "question": "Does this sensation travel or spread to any other part of your body?",
        "chips": ["Spreads to Left Arm", "Spreads to Back", "Radiates to Jaw / Neck", "Radiates Down Leg", "Stays in One Spot"]
    },
    {
        "key": "ASSOCIATIONS",
        "question": "Are you noticing any other symptoms accompanying this?",
        "chips": ["Fever / Chills", "Nausea / Vomiting", "Dizziness / Vertigo", "Excessive Sweating", "None"]
    },
    {
        "key": "TIME_COURSE",
        "question": "How does it behave over time? Is it constant or does it come and go in waves?",
        "chips": ["Constant & Unchanging", "Comes & Goes in Waves", "Worse in Morning", "Worse at Night"]
    },
    {
        "key": "EXACERBATING",
        "question": "Does anything make the discomfort noticeably better or worse?",
        "chips": ["Worse with Walking/Effort", "Better with Rest", "Worse after Food", "Relieved by Antacids", "No Change"]
    },
    {
        "key": "SEVERITY",
        "question": "On a scale of 1 to 10, how severe is your discomfort right now?",
        "chips": ["Mild (1 - 3)", "Moderate (4 - 6)", "Severe (7 - 8)", "Extreme Emergency (9 - 10)"]
    }
]

# AYUSH Dashavidha Pariksha Framework Definition
AYUSH_STEPS = [
    {
        "key": "PRAKRITI",
        "question": "Ayurvedic Assessment: What is your predominant physical nature and body frame?",
        "chips": ["Vata (Lean, Dry Skin, Active)", "Pitta (Medium, Warm, Sharp Appetite)", "Kapha (Sturdy, Cool, Calm)"]
    },
    {
        "key": "VIKRITI",
        "question": "What is the primary imbalance or doshic disturbance you are experiencing today?",
        "chips": ["Vata (Joint Pain, Stiffness, Gas)", "Pitta (Acidity, Burning, Inflammation)", "Kapha (Heavy Chest, Cough, Lethargy)"]
    },
    {
        "key": "AGNI",
        "question": "How is your digestive fire (Jatharagni) functioning recently?",
        "chips": ["Mandagni (Sluggish, Low Hunger)", "Tikshnagni (Intense, Hyper-acidic)", "Vishamagni (Irregular/Bloating)", "Samagni (Balanced & Normal)"]
    },
    {
        "key": "KOSHTHA",
        "question": "How is your bowel movement habit (Koshtha Pariksha)?",
        "chips": ["Krura Koshtha (Hard/Constipated)", "Mridu Koshtha (Soft/Frequent stools)", "Madhya Koshtha (Regular/Normal)"]
    },
    {
        "key": "SARA_SAMHANANA",
        "question": "How do you evaluate your overall muscle stamina and bodily compactness?",
        "chips": ["Pravara (High Endurance)", "Madhyama (Moderate Strength)", "Avara (Low/Easily Fatigued)"]
    },
    {
        "key": "SATMYA_AHARA",
        "question": "What dietary habits or food tastes best agree with your body system?",
        "chips": ["Sweet / Cooling foods", "Warm / Spiced foods", "Light Soups & Gruel", "Difficult to digest heavy meals"]
    },
    {
        "key": "SATVA_VAYA",
        "question": "How is your mental resilience, stress tolerance, and sleep quality?",
        "chips": ["Sound Sleep & Calm", "Disturbed Sleep / Anxiety", "Frequent Stress & Irritability"]
    }
]


def process_chat_turn(request: ChatTurnRequest) -> ChatTurnResponse:
    """Processes a single conversational turn through the clinical state machine."""
    user_msg = (request.user_message or request.message or "").strip()
    history = request.conversation_history or []
    data = dict(request.collected_data or {})

    # 1. Red-Flag Safety Middleware
    is_red_flag, red_flag_reason = scan_for_red_flags(user_msg)
    triage_level = "EMERGENCY_RED_FLAG" if is_red_flag else "NORMAL"

    mode = (request.clinical_system or request.mode or "ALLOPATHIC").upper()
    active_steps = SOCRATES_STEPS if mode == "ALLOPATHIC" else AYUSH_STEPS

    # Map current step index
    step_keys = [s["key"] for s in active_steps]
    curr_key = (request.current_step or "INITIAL").upper()

    if curr_key == "INITIAL" or curr_key not in step_keys:
        curr_idx = 0
    else:
        # Save previous answer
        data[curr_key] = user_msg
        curr_idx = step_keys.index(curr_key) + 1

    # Check if we completed all clinical steps
    if curr_idx >= len(active_steps):
        # Generate summary
        if mode == "ALLOPATHIC":
            chief = data.get("SITE", "Discomfort")
            summary_text = (
                f"Patient presents with {data.get('CHARACTER', 'discomfort')} located in the {data.get('SITE', 'body')} "
                f"starting {data.get('ONSET', 'recently')}. Radiation: {data.get('RADIATION', 'none')}. "
                f"Associated symptoms: {data.get('ASSOCIATIONS', 'none')}. Course: {data.get('TIME_COURSE', 'intermittent')}. "
                f"Exacerbated by: {data.get('EXACERBATING', 'unspecified')}. Severity rated at {data.get('SEVERITY', 'Moderate')}."
            )
        else:
            summary_text = (
                f"Ayurvedic Intake: Assessed Prakriti as {data.get('PRAKRITI', 'Mixed')}, presenting with {data.get('VIKRITI', 'Doshic imbalance')}. "
                f"Agni evaluated as {data.get('AGNI', 'Mandagni')} with {data.get('KOSHTHA', 'Madhya')} Koshtha. "
                f"Physical strength: {data.get('SARA_SAMHANANA', 'Moderate')}. Mental resilience/sleep: {data.get('SATVA_VAYA', 'Variable')}."
            )

        if is_red_flag:
            summary_text = f"🚨 RED-FLAG TRIAGE ALERT: {red_flag_reason}. " + summary_text

        return ChatTurnResponse(
            reply_text="Thank you. Your intake responses have been recorded and structured for the physician. Please proceed to the document scanner or review your summary.",
            next_step="COMPLETED",
            is_completed=True,
            quick_chips=["Review Intake Slip", "Scan Past Records", "Consult Doctor"],
            is_red_flag=is_red_flag,
            red_flag_reason=red_flag_reason,
            triage_level=triage_level,
            extracted_summary={
                "chief_complaint": data.get("SITE" if mode == "ALLOPATHIC" else "VIKRITI", "Clinical Discomfort"),
                "clinical_notes": summary_text,
                "structured_parameters": data,
                "mode": mode,
                "is_red_flag": is_red_flag,
                "red_flag_reason": red_flag_reason
            }
        )

    # Next step in sequence
    next_step_data = active_steps[curr_idx]
    reply = next_step_data["question"]
    if is_red_flag:
        reply = f"⚠️ Notice: We detected an urgent symptom ('{red_flag_reason}'). Medical staff have been notified. Please answer the following to assist the triage doctor: " + reply

    return ChatTurnResponse(
        reply_text=reply,
        next_step=next_step_data["key"],
        is_completed=False,
        quick_chips=next_step_data["chips"],
        is_red_flag=is_red_flag,
        red_flag_reason=red_flag_reason,
        triage_level=triage_level,
        extracted_summary=None
    )
