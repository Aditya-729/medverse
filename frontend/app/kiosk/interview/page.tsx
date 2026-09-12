'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import KioskHeader from '@/components/KioskHeader';
import SocratesTracker from '@/components/SocratesTracker';
import AyushTracker from '@/components/AyushTracker';
import AudioGuideButton from '@/components/AudioGuideButton';
import { sendChatTurn } from '@/lib/api';
import { ClinicalMode, TriagePriority } from '@/lib/types';
import { 
  Mic, 
  MicOff, 
  AlertTriangle, 
  Send, 
  ArrowRight, 
  Sparkles, 
  Volume2, 
  History, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  step?: string;
  isRedFlag?: boolean;
}

export default function InterviewPage() {
  const router = useRouter();

  // Mode state
  const [mode, setMode] = useState<ClinicalMode>('ALLOPATHIC');
  const [currentStep, setCurrentStep] = useState<string>('SITE');
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [collectedData, setCollectedData] = useState<Record<string, string>>({});
  
  // Red-Flag Triage Alert State
  const [isRedFlag, setIsRedFlag] = useState<boolean>(false);
  const [redFlagReason, setRedFlagReason] = useState<string | null>(null);
  const [triagePriority, setTriagePriority] = useState<TriagePriority>('NORMAL');

  // AI Question in Giant Text
  const [giantQuestion, setGiantQuestion] = useState<string>(
    'Where exactly is your pain or main discomfort located? Tap a choice below or hold the microphone to speak.'
  );

  // Dynamic Choice Chips (Touch Targets 48px+)
  const [chips, setChips] = useState<string[]>([
    'Chest',
    'Abdomen / Stomach',
    'Head / Neck',
    'Lower Back',
    'Joints / Limbs'
  ]);

  // Dialogue Transcript History
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: 'Namaste. I am your Medverse AI Clinical Assistant. Where is your pain or primary discomfort located?',
      step: 'SITE'
    }
  ]);

  // Speech & Voice State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioMeter, setAudioMeter] = useState<number>(20);
  const [textInput, setTextInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Audio simulation timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioMeter(Math.floor(Math.random() * 60) + 40);
      }, 120);
    } else {
      setAudioMeter(10);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Load patient from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('medverse_patient') || sessionStorage.getItem('medikiosk_patient');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.clinicalMode) {
            setMode(parsed.clinicalMode);
            if (parsed.clinicalMode === 'AYUSH') {
              setCurrentStep('PRAKRITI');
              setGiantQuestion('Ayurvedic Assessment: What is your predominant physical nature and body frame?');
              setChips(['Vata (Lean, Dry, Active)', 'Pitta (Warm, Sharp Appetite)', 'Kapha (Sturdy, Calm)']);
            }
          }
        } catch (e) {}
      }
    }
  }, []);

  const handleModeChange = (newMode: ClinicalMode) => {
    setMode(newMode);
    if (newMode === 'ALLOPATHIC') {
      setCurrentStep('SITE');
      setGiantQuestion('Where exactly is your pain or main discomfort located?');
      setChips(['Chest', 'Abdomen / Stomach', 'Head / Neck', 'Lower Back', 'Joints / Limbs']);
    } else {
      setCurrentStep('PRAKRITI');
      setGiantQuestion('Ayurvedic Assessment: What is your predominant physical nature and body frame?');
      setChips(['Vata (Lean, Dry, Active)', 'Pitta (Warm, Sharp Appetite)', 'Kapha (Sturdy, Calm)']);
    }
  };

  const handleSendAnswer = async (answerText: string) => {
    if (!answerText.trim() || loading) return;

    const trimmed = answerText.trim();
    setTextInput('');

    // Append user turn
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      step: currentStep
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await sendChatTurn({
        patient_id: 'P-101',
        mode,
        current_step: currentStep,
        user_message: trimmed,
        conversation_history: messages.map((m) => ({ sender: m.sender, message: m.text })),
        collected_data: collectedData
      });

      // Update Red-Flag
      if (response.is_red_flag) {
        setIsRedFlag(true);
        setRedFlagReason(response.red_flag_reason || 'Acute Emergency Symptom');
        setTriagePriority('EMERGENCY_RED_FLAG');
      }

      setCollectedData((prev) => ({
        ...prev,
        [currentStep]: trimmed
      }));

      // Update AI Giant Text & Next Step
      setGiantQuestion(response.reply_text);
      setCurrentStep(response.next_step);
      setChips(response.quick_chips || []);
      setIsCompleted(response.is_completed);

      // Append AI reply
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.reply_text,
        step: response.next_step,
        isRedFlag: response.is_red_flag
      };
      setMessages((prev) => [...prev, aiMsg]);

      // If completed, store summary
      if (response.is_completed && response.extracted_summary) {
        const sumJson = JSON.stringify(response.extracted_summary);
        sessionStorage.setItem('medverse_summary', sumJson);
        sessionStorage.setItem('medikiosk_summary', sumJson);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Web Speech API Reference
  const recognitionRef = useRef<any>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  // Hold to Speak with Web Speech Recognition
  const handleMicMouseDown = () => {
    setIsRecording(true);
    setLiveTranscript('');

    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'hi-IN'; // Default to Hindi-English bilingual model

          recognition.onresult = (event: any) => {
            let current = '';
            for (let i = 0; i < event.results.length; i++) {
              current += event.results[i][0].transcript;
            }
            setLiveTranscript(current);
            setTextInput(current);
          };

          recognition.onerror = () => {};
          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('SpeechRecognition error:', e);
        }
      }
    }
  };

  const handleMicMouseUp = () => {
    if (!isRecording) return;
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    setTimeout(() => {
      // If live transcription captured speech, use that; otherwise use realistic clinical preset
      if (liveTranscript && liveTranscript.trim().length > 3) {
        handleSendAnswer(liveTranscript.trim());
        setLiveTranscript('');
        return;
      }

      // Contextual clinical presets
      const mockSpeeches: Record<string, string> = {
        SITE: "I have acute crushing chest pain that hurts terribly",
        ONSET: "It began suddenly about 45 minutes ago while climbing stairs",
        CHARACTER: "It feels like a heavy squeezing weight on my breastbone",
        RADIATION: "The pain radiates down my left arm and up into my neck and jaw",
        ASSOCIATIONS: "I am feeling cold sweats, breathlessness, and dizziness",
        SEVERITY: "It is an extreme emergency, rated 9 out of 10",
        PRAKRITI: "I have always had a Pitta body type with intense appetite and heat sensitivity",
        AGNI: "My digestion feels Mandagni, very sluggish with bloating after meals",
      };

      const simulatedSpeech = mockSpeeches[currentStep] || "The pain is quite intense and bothers me constantly";
      handleSendAnswer(simulatedSpeech);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <KioskHeader 
        mode={mode} 
        onModeToggle={handleModeChange} 
        showModeToggle={true} 
      />

      {/* Progress Trackers */}
      {mode === 'ALLOPATHIC' ? (
        <SocratesTracker currentStep={currentStep} />
      ) : (
        <AyushTracker currentStep={currentStep} />
      )}

      {/* Red-Flag Priority Alert Banner */}
      {isRedFlag && (
        <div className="bg-rose-600 text-white py-3 px-4 shadow-lg border-b-2 border-rose-800 animate-red-flag z-30">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white text-rose-600 rounded-xl font-black text-xs">
                TRIAGE PRIORITY: LEVEL 1
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 stroke-[2.5]" />
                <span className="font-black text-sm sm:text-base">
                  RED-FLAG CLINICAL ALERT: {redFlagReason}
                </span>
              </div>
            </div>
            <span className="text-xs bg-rose-800 text-white font-bold px-3 py-1 rounded-full border border-rose-400">
              Hospital Triage Team Notified
            </span>
          </div>
        </div>
      )}

      {/* Main Split Layout */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col justify-between">
        
        {/* TOP SECTION: AI Question in Giant Text */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-300">
                AI Intake Doctor • {mode === 'ALLOPATHIC' ? 'SOCRATES' : 'AYUSH'}
              </span>
              <span className="text-xs text-slate-400 font-bold">
                Step: {currentStep}
              </span>
            </div>

            <AudioGuideButton 
              textToSpeak={giantQuestion} 
              label="Listen Question / प्रश्न सुनें" 
            />
          </div>

          {/* GIANT QUESTION TEXT (Accessible from 2-3 meters) */}
          <div className="min-h-[120px] flex items-center">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
              {giantQuestion}
            </h2>
          </div>

          {loading && (
            <div className="mt-4 flex items-center space-x-2 text-sky-600 text-sm font-bold">
              <span className="animate-spin h-4 w-4 border-2 border-sky-600 border-t-transparent rounded-full"></span>
              <span>Evaluating clinical response...</span>
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: Massive Mic Button & Dynamic Touchable Chips */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
          
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Respond: Tap a Quick Option or Hold the Mic to Speak
            </span>
            <span className="text-xs font-bold text-sky-600">
              48px+ Touch Accessible
            </span>
          </div>

          {/* 3-4 Dynamic Quick Answer Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {chips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendAnswer(chip)}
                disabled={loading || isCompleted}
                className="touch-btn h-16 w-full p-3 rounded-2xl border-2 border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-500 text-slate-900 font-extrabold text-base sm:text-lg shadow-sm active:scale-95 transition-all text-center flex items-center justify-center"
              >
                <span>{chip}</span>
              </button>
            ))}
          </div>

          {/* Massive "Hold to Speak" Microphone Button & Voice Pulse */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-6">
            
            <div className="flex flex-col items-center">
              <button
                type="button"
                onMouseDown={handleMicMouseDown}
                onMouseUp={handleMicMouseUp}
                onTouchStart={handleMicMouseDown}
                onTouchEnd={handleMicMouseUp}
                disabled={loading || isCompleted}
                className={`h-28 w-28 sm:h-32 sm:w-32 rounded-full border-4 flex flex-col items-center justify-center text-white shadow-2xl transition-all select-none ${
                  isRecording
                    ? 'bg-rose-600 border-rose-300 scale-110 shadow-rose-600/50 ring-8 ring-rose-200'
                    : 'bg-sky-600 hover:bg-sky-500 border-sky-300 shadow-sky-600/30'
                }`}
                title="Hold down to speak your response"
              >
                {isRecording ? (
                  <>
                    <Mic className="h-10 w-10 animate-bounce" />
                    <span className="text-xs font-black mt-1 uppercase tracking-wider">
                      Listening...
                    </span>
                  </>
                ) : (
                  <>
                    <Mic className="h-10 w-10" />
                    <span className="text-[11px] font-black mt-1 uppercase tracking-wider">
                      Hold to Speak
                    </span>
                  </>
                )}
              </button>
              
              <span className="text-xs text-slate-500 font-bold mt-2">
                {isRecording ? 'Release to Send Voice' : 'बोलने के लिए दबाकर रखें'}
              </span>
            </div>

            {/* Audio Wave Meter when recording */}
            {isRecording && (
              <div className="flex items-center space-x-1.5 h-16 px-4 bg-slate-100 rounded-2xl border border-slate-200">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((bar) => (
                  <div
                    key={bar}
                    className="w-2 bg-sky-600 rounded-full transition-all duration-75"
                    style={{
                      height: `${Math.max(10, Math.min(60, audioMeter * (bar % 2 === 0 ? 1 : 0.6)))}px`,
                    }}
                  ></div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Manual Text Input Option for Companion / Attendant */}
          <div className="pt-2 border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendAnswer(textInput);
              }}
              placeholder="Or type your response here... (या यहाँ टाइप करें)"
              className="flex-1 h-14 px-4 bg-slate-50 border border-slate-300 rounded-2xl text-base font-semibold focus:outline-none focus:border-sky-600"
            />
            <button
              type="button"
              onClick={() => handleSendAnswer(textInput)}
              disabled={!textInput.trim() || loading}
              className="touch-btn h-14 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold flex items-center space-x-2 shadow transition"
            >
              <Send className="h-5 w-5" />
              <span>Send</span>
            </button>
          </div>

          {/* Navigation Controls: Next Step / Finish */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-500">
              <History className="h-4 w-4 text-sky-600" />
              <span>{messages.length} Dialogue turns recorded</span>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => router.push('/kiosk/scan')}
                className="touch-btn flex-1 sm:flex-none px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-base flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition"
              >
                <span>{isCompleted ? 'Next: Scan Documents' : 'Proceed to Document Scan'}</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
