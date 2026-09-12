"""
Medverse Clinical Engines Unit & Regression Tests
Tests:
1. Red-Flag Emergency Triage Scanner
2. SOCRATES Framework Conversational State Transitions
3. AYUSH Dashavidha Pariksha State Transitions
4. Mock OCR Extraction & FHIR R4 Bundle Validation
5. Chronological Medical Timeline Sorting
6. Vector Similarity Search for Cohort Cases
7. AYUSH-Allopathy Herb-Drug Interaction & Clinical Safety Engine
"""

import pytest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from interview_engine import (
    scan_for_red_flags,
    process_chat_turn,
    ChatTurnRequest,
    SOCRATES_STEPS,
    AYUSH_STEPS,
)
from ocr_engine import mock_ocr_extract, sort_clinical_timeline
from vector_search import search_similar_cases
from drug_interaction_engine import (
    check_drug_safety,
    SafetyCheckRequest,
)


def test_red_flag_emergency_detection():
    """Verify that acute life-threatening symptoms trigger red flags."""
    test_cases = [
        ("I have severe crushing chest pain radiating to my left arm", True),
        ("Patient is gasping for air and has sudden breathing difficulty", True),
        ("She fainted and was unconscious for 2 minutes", True),
        ("He is coughing blood and feels very weak", True),
        ("Sudden weakness on one side and slurred speech", True),
        ("Routine quarterly sugar checkup, feeling slightly tired", False),
        ("Mild knee pain when climbing stairs", False),
    ]

    for text, expected in test_cases:
        is_red, reason = scan_for_red_flags(text)
        assert is_red == expected, f"Failed on '{text}': got {is_red}, expected {expected}"
        if expected:
            assert reason is not None


def test_socrates_progression():
    """Verify SOCRATES sequential step transitions in Allopathic mode."""
    req = ChatTurnRequest(
        patient_id="P-TEST",
        mode="ALLOPATHIC",
        current_step="INITIAL",
        user_message="My upper abdomen hurts",
        conversation_history=[],
        collected_data={}
    )
    res = process_chat_turn(req)
    assert res.next_step == "SITE"
    assert not res.is_completed
    assert len(res.quick_chips) > 0

    # Advance through ONSET
    req2 = ChatTurnRequest(
        patient_id="P-TEST",
        mode="ALLOPATHIC",
        current_step="SITE",
        user_message="Abdomen / Stomach",
        conversation_history=[],
        collected_data={"SITE": "Abdomen"}
    )
    res2 = process_chat_turn(req2)
    assert res2.next_step == "ONSET"


def test_ayush_dashavidha_pariksha():
    """Verify Ayurvedic Pariksha assessment steps."""
    req = ChatTurnRequest(
        patient_id="P-TEST",
        mode="AYUSH",
        current_step="INITIAL",
        user_message="Seeking Ayurvedic consultation",
        conversation_history=[],
        collected_data={}
    )
    res = process_chat_turn(req)
    assert res.next_step == "PRAKRITI"
    assert any("Vata" in chip for chip in res.quick_chips)


def test_ocr_entity_extraction():
    """Verify OCR entity parsing into structured FHIR format."""
    res = mock_ocr_extract("lab_glucose")
    assert res.doc_type == "Lab Report"
    assert res.facility_name == "AIIMS New Delhi Central Pathology Lab"
    
    # Check HbA1c entity
    hba1c = next((e for e in res.extracted_entities if e["name"] == "HbA1c"), None)
    assert hba1c is not None
    assert hba1c["value"] == "8.2"
    assert hba1c["is_abnormal"] is True

    # Check FHIR Bundle
    bundle = res.fhir_bundle
    assert bundle["resourceType"] == "Bundle"
    assert len(bundle["entry"]) > 0


def test_chronological_timeline_sorting():
    """Verify multi-source documents and records sort in descending chronological order."""
    unsorted = [
        {"date": "2023-05-10", "title": "Old Visit"},
        {"date": "2024-03-12", "title": "Latest AIIMS Lab"},
        {"date": "2023-11-05", "title": "Ayurveda Visit"},
    ]
    sorted_records = sort_clinical_timeline(unsorted, ascending=False)
    assert sorted_records[0]["title"] == "Latest AIIMS Lab"
    assert sorted_records[1]["title"] == "Ayurveda Visit"
    assert sorted_records[2]["title"] == "Old Visit"


def test_vector_similarity_search():
    """Verify vector search returns 2-3 matched cases with duration and outcome."""
    query = "Diabetes + Hypertension"
    results = search_similar_cases(query, top_k=3)
    assert len(results) >= 2
    top = results[0]
    assert "treatment_duration" in top
    assert "outcome" in top
    assert top["score_numeric"] >= 75.0


def test_herb_drug_safety_check():
    """Verify Herb-Drug Interaction engine detects cautions and synergies."""
    # Test 1: Aspirin + Yogaraj Guggulu (Caution: bleeding risk)
    req_caution = SafetyCheckRequest(
        allopathic_drugs=["Aspirin 75mg"],
        ayush_formulations=["Yogaraj Guggulu 2 tabs"]
    )
    res_caution = check_drug_safety(req_caution)
    assert res_caution.has_caution is True
    assert any("bleeding" in str(inter).lower() for inter in res_caution.interactions_found)

    # Test 2: Metformin + Shilajit (Synergistic glycemic response)
    req_synergy = SafetyCheckRequest(
        allopathic_drugs=["Metformin 500mg"],
        ayush_formulations=["Shilajatu (Shilajit)"]
    )
    res_synergy = check_drug_safety(req_synergy)
    assert res_synergy.has_caution is False
    assert len(res_synergy.interactions_found) > 0
    assert any("insulin" in str(inter).lower() for inter in res_synergy.interactions_found)
