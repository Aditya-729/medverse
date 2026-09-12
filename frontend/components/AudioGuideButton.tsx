'use client';

import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

interface AudioGuideButtonProps {
  textToSpeak: string;
  label?: string;
  lang?: 'en' | 'hi';
}

export default function AudioGuideButton({
  textToSpeak,
  label = 'Audio Guide / ऑडियो गाइड',
  lang = 'en',
}: AudioGuideButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleSpeech = () => {
    if (typeof window === 'undefined') return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is simulated in your browser: ' + textToSpeak);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={toggleSpeech}
      className={`touch-btn px-4 py-2.5 rounded-xl border flex items-center space-x-2 font-bold text-sm transition-all shadow-sm ${
        isPlaying
          ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400'
          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
      }`}
      aria-label="Play audio instructions"
    >
      {isPlaying ? (
        <>
          <VolumeX className="h-5 w-5 text-amber-700 animate-pulse" />
          <span className="text-amber-800">Playing... (Tap to stop)</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        </>
      ) : (
        <>
          <Volume2 className="h-5 w-5 text-sky-600" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
