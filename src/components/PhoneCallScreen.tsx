import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
  RotateCcw,
  Languages,
  Headphones
} from 'lucide-react';
import { SALON_INFO, Appointment } from '../utils/salonData';
import { ChatMessage, CallState } from '../types';
import { getGreeting, SupportedLanguage } from '../utils/salonLogic';

interface PhoneCallScreenProps {
  callState: CallState;
  setCallState: React.Dispatch<React.SetStateAction<CallState>>;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onEndCall: () => void;
  onStartCall: () => void;
  onPreviewVoice: (customText?: string) => void;
  appointments: Appointment[];
  onOpenBookingSlip: (appointment: Appointment) => void;
}

export const PhoneCallScreen: React.FC<PhoneCallScreenProps> = ({
  callState,
  setCallState,
  messages,
  onSendMessage,
  onEndCall,
  onStartCall,
  onPreviewVoice,
  appointments,
  onOpenBookingSlip
}) => {
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [activeSpeechLanguage, setActiveSpeechLanguage] = useState<SupportedLanguage>('english');
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = activeSpeechLanguage === 'urdu' ? 'ur-PK' : 'en-US';

        recognition.onstart = () => {
          setCallState((prev) => ({ ...prev, isListening: true }));
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(transcript);
            onSendMessage(transcript);
          }
          setCallState((prev) => ({ ...prev, isListening: false }));
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setCallState((prev) => ({ ...prev, isListening: false }));
        };

        recognition.onend = () => {
          setCallState((prev) => ({ ...prev, isListening: false }));
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Could not initialize SpeechRecognition:', e);
      }
    }
  }, [activeSpeechLanguage, onSendMessage, setCallState]);

  // Auto-scroll chat transcript to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, callState.isBellaSpeaking]);

  // Format call timer
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleMic = () => {
    if (!callState.isActive) return;

    if (callState.isListening) {
      recognitionRef.current?.stop();
      setCallState((prev) => ({ ...prev, isListening: false }));
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Mic start error:', e);
        // Toggle simulated listening if browser blocks audio
        setCallState((prev) => ({ ...prev, isListening: !prev.isListening }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSubmitting) return;

    const message = inputText.trim();
    setInputText('');
    setIsSubmitting(true);
    try {
      await onSendMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    if (!callState.isActive) {
      onStartCall();
      setTimeout(() => {
        onSendMessage(prompt);
      }, 400);
    } else {
      onSendMessage(prompt);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Phone Screen / Call Console (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden flex flex-col">
          {/* Phone Shell Header */}
          <div className="bg-stone-900 text-white p-5 text-center relative overflow-hidden">
            {/* Subtle luxury glow effect */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-rose-500/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col items-center">
              {/* Salon info */}
              <span className="text-xs uppercase tracking-widest text-rose-300 font-semibold mb-1">
                Glamora Beauty Salon
              </span>
              <h2 className="text-lg font-serif-luxury text-stone-100 font-medium">
                Gulberg III, Lahore
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                {SALON_INFO.phone}
              </p>

              {/* Call Status Badge */}
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-stone-800/90 rounded-full border border-stone-700/60 text-xs">
                {callState.isActive ? (
                  callState.status === 'calling' ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      <span className="text-amber-300 font-medium">Ringing Reception...</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-emerald-300 font-medium">In Call</span>
                      <span className="text-stone-500">·</span>
                      <span className="font-mono text-stone-200">{formatTimer(callState.durationSeconds)}</span>
                    </>
                  )
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-stone-400" />
                    <span className="text-stone-300">Ready to Call</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Central Visualizer & Avatar Area */}
          <div className="p-6 bg-linear-to-b from-stone-50/50 to-rose-50/30 flex flex-col items-center justify-center min-h-[220px] text-center border-b border-stone-100">
            {/* Bella Avatar with Animated Soundwaves */}
            <div className="relative mb-4">
              {/* Pulsing ring when speaking */}
              {callState.isBellaSpeaking && (
                <div className="absolute -inset-3 rounded-full bg-rose-400/30 animate-ping opacity-75" />
              )}
              {callState.isListening && (
                <div className="absolute -inset-3 rounded-full bg-emerald-400/30 animate-pulse opacity-75" />
              )}
              {callState.status === 'calling' && (
                <div className="absolute -inset-3 rounded-full bg-amber-400/30 animate-ping opacity-60" />
              )}

              <div className="w-24 h-24 rounded-full bg-linear-to-tr from-rose-600 via-rose-500 to-amber-500 p-1 shadow-lg shadow-rose-200 relative z-10">
                <div className="w-full h-full rounded-full bg-stone-900 flex flex-col items-center justify-center text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-tr from-rose-950/60 to-transparent" />
                  <Sparkles className="w-8 h-8 text-rose-300 mb-0.5 relative z-10" />
                  <span className="text-xs font-semibold tracking-wider relative z-10">BELLA</span>
                </div>
              </div>

              {/* Online indicator */}
              <div className="absolute bottom-0 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full z-20" title="Bella is online 24/7" />
            </div>

            <h3 className="font-serif-luxury text-xl font-semibold text-stone-900">
              Bella
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Virtual AI Receptionist · Speaks English, Urdu, Roman Urdu
            </p>

            {/* Dynamic Status / Sound Waves */}
            <div className="mt-4 flex items-center justify-center gap-1.5 h-8">
              {callState.isActive ? (
                callState.status === 'calling' ? (
                  <span className="text-xs text-amber-700 font-medium flex items-center gap-1.5 animate-pulse">
                    <Phone className="w-3.5 h-3.5" />
                    Connecting call to reception desk...
                  </span>
                ) : callState.isBellaSpeaking ? (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 bg-rose-600 rounded-full animate-wave-1" />
                    <span className="w-1.5 bg-rose-600 rounded-full animate-wave-2" />
                    <span className="w-1.5 bg-rose-600 rounded-full animate-wave-3" />
                    <span className="w-1.5 bg-rose-600 rounded-full animate-wave-4" />
                    <span className="w-1.5 bg-rose-600 rounded-full animate-wave-2" />
                    <span className="text-xs font-medium text-rose-700 ml-2">Bella is speaking naturally...</span>
                  </div>
                ) : callState.isListening ? (
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 bg-emerald-600 rounded-full animate-wave-2" />
                    <span className="w-1.5 bg-emerald-600 rounded-full animate-wave-4" />
                    <span className="w-1.5 bg-emerald-600 rounded-full animate-wave-1" />
                    <span className="text-xs font-medium text-emerald-700 ml-2">Listening to your voice...</span>
                  </div>
                ) : (
                  <span className="text-xs text-stone-500 flex items-center gap-1">
                    <Headphones className="w-3.5 h-3.5 text-stone-400" />
                    Connected · Speak or type below
                  </span>
                )
              ) : (
                <span className="text-xs text-stone-400">
                  Tap "Call Bella" below to start speaking
                </span>
              )}
            </div>
          </div>

          {/* Call Control Buttons */}
          <div className="p-5 bg-white flex items-center justify-around border-t border-stone-100">
            {callState.isActive ? (
              <>
                {/* Mute Mic */}
                <button
                  type="button"
                  onClick={() => setCallState((p) => ({ ...p, isMuted: !p.isMuted }))}
                  className={`p-3 rounded-full border transition-all cursor-pointer ${
                    callState.isMuted
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                  title={callState.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                  aria-label={callState.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {callState.isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Hang up call */}
                <button
                  type="button"
                  onClick={onEndCall}
                  className="p-4 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200 transition-all hover:scale-105 cursor-pointer"
                  title="End Call"
                  aria-label="End Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>

                {/* Speaker on/off */}
                <button
                  type="button"
                  onClick={() => setCallState((p) => ({ ...p, isSpeakerOn: !p.isSpeakerOn }))}
                  className={`p-3 rounded-full border transition-all cursor-pointer ${
                    !callState.isSpeakerOn
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                  title={callState.isSpeakerOn ? 'Turn Off Audio Output' : 'Turn On Audio Output'}
                  aria-label={callState.isSpeakerOn ? 'Turn Off Audio Output' : 'Turn On Audio Output'}
                >
                  {callState.isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <div className="w-full flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={onStartCall}
                  className="w-full py-3.5 px-6 rounded-xl bg-linear-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-medium shadow-md shadow-rose-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call Bella at Glamora Salon</span>
                </button>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onPreviewVoice()}
                    className="flex-1 py-2 px-3 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Preview Bella's Voice</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowVoiceSettings((v) => !v)}
                    className="py-2 px-3 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    {showVoiceSettings ? 'Hide Tone' : 'Voice Tone'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Voice Persona Tuning Panel */}
          {showVoiceSettings && (
            <div className="p-4 bg-stone-50/80 border-t border-stone-200 text-xs space-y-3">
              <div className="flex items-center justify-between font-semibold text-stone-800">
                <span>Human Voice Persona & Tone</span>
                <span className="text-[11px] text-rose-600 font-normal">Natural Conversational</span>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setCallState((p) => ({ ...p, voicePreset: 'warm-natural', speechRate: 0.95, speechPitch: 1.06 }))}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    callState.voicePreset === 'warm-natural'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div className="font-semibold text-[11px]">Warm & Natural</div>
                  <div className="text-[9px] opacity-80 mt-0.5">Balanced human</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCallState((p) => ({ ...p, voicePreset: 'soft-luxury', speechRate: 0.90, speechPitch: 1.02 }))}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    callState.voicePreset === 'soft-luxury'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div className="font-semibold text-[11px]">Soft Concierge</div>
                  <div className="text-[9px] opacity-80 mt-0.5">Calm & elegant</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCallState((p) => ({ ...p, voicePreset: 'cheerful-friendly', speechRate: 1.02, speechPitch: 1.12 }))}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    callState.voicePreset === 'cheerful-friendly'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <div className="font-semibold text-[11px]">Cheerful Desk</div>
                  <div className="text-[9px] opacity-80 mt-0.5">Upbeat & sunny</div>
                </button>
              </div>

              {/* Sliders */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Speech Pace (Rate): {callState.speechRate.toFixed(2)}x</span>
                  <span>Pitch: {callState.speechPitch.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="range"
                    min="0.80"
                    max="1.25"
                    step="0.05"
                    value={callState.speechRate}
                    onChange={(e) => setCallState((p) => ({ ...p, speechRate: parseFloat(e.target.value) }))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <input
                    type="range"
                    min="0.85"
                    max="1.30"
                    step="0.05"
                    value={callState.speechPitch}
                    onChange={(e) => setCallState((p) => ({ ...p, speechPitch: parseFloat(e.target.value) }))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Quick Voice Prompt / Input Bar for Call */}
          <div className="p-4 bg-stone-50 border-t border-stone-200">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMic}
                disabled={!callState.isActive}
                className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                  callState.isListening
                    ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100 disabled:opacity-50'
                }`}
                title="Hold or tap to speak using microphone"
                aria-label="Voice input"
              >
                <Mic className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  callState.isActive
                    ? 'Speak or type your message here...'
                    : 'Start call above to speak with Bella...'
                }
                disabled={!callState.isActive}
                className="flex-1 text-sm bg-white border border-stone-300 rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 disabled:bg-stone-100 disabled:text-stone-400"
              />

              <button
                type="submit"
                disabled={!callState.isActive || !inputText.trim() || isSubmitting}
                className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Send message"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Live Conversation Transcript & Quick Scenarios (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Transcript Panel */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[480px]">
            {/* Header */}
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-stone-900">Live Call Transcript</span>
                <span className="text-xs text-stone-500">({messages.length} messages)</span>
              </div>

              {/* Language badges / quick info */}
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Languages className="w-3.5 h-3.5 text-rose-500" />
                <span>Multilingual: EN · UR · Roman UR</span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div
              ref={chatScrollRef}
              className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50/30"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                  <Phone className="w-10 h-10 text-stone-300 mb-2" />
                  <p className="text-sm font-medium text-stone-600">No active conversation</p>
                  <p className="text-xs text-stone-400 mt-1 max-w-sm">
                    Press "Call Bella" or tap any example below to simulate a live customer phone call to Glamora Beauty Salon.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-xs text-stone-400">
                      <span>{msg.role === 'user' ? 'You (Customer)' : 'Bella (Receptionist)'}</span>
                      <span>·</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-rose-600 text-white rounded-tr-none'
                          : 'bg-white text-stone-800 border border-stone-200 shadow-xs rounded-tl-none'
                      }`}
                    >
                      <p className={msg.language === 'urdu' ? 'font-urdu text-base leading-loose text-right' : ''}>
                        {msg.content}
                      </p>

                      {/* If Bella booked/rescheduled/cancelled an appointment */}
                      {msg.actionTaken && (
                        <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-col gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>System Action: {msg.actionTaken.details}</span>
                          </div>

                          {msg.actionTaken.appointmentId && (
                            <button
                              type="button"
                              onClick={() => {
                                const found = appointments.find((a) => a.id === msg.actionTaken?.appointmentId);
                                if (found) onOpenBookingSlip(found);
                              }}
                              className="text-xs text-rose-700 hover:text-rose-900 font-medium underline text-left cursor-pointer"
                            >
                              View digital appointment confirmation slip ({msg.actionTaken.appointmentId}) →
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Bella Thinking indicator */}
              {isSubmitting && (
                <div className="flex items-center gap-2 text-xs text-stone-500 bg-white border border-stone-200 px-3 py-2 rounded-xl w-fit">
                  <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  <span>Bella is checking salon schedule & responding...</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Realistic Customer Test Prompts (1-click call) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span>Simulated Customer Voice Queries (Tap to speak to Bella)</span>
              </h4>
              <span className="text-xs text-stone-400">Official Demo Scenarios</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSuggestedPrompt("Hello, mujhe facial karwana hai.")}
                className="text-left p-3 rounded-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50/40 transition-colors cursor-pointer group"
              >
                <div className="font-medium text-stone-800 group-hover:text-rose-700">
                  "Hello, mujhe facial karwana hai."
                </div>
                <div className="text-stone-400 text-[11px] mt-0.5">
                  Roman Urdu · Inquiry for facial options & HydraFacial
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSuggestedPrompt("HydraFacial kal 4 baje Sarah 03001234567 ke naam se book karein")}
                className="text-left p-3 rounded-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50/40 transition-colors cursor-pointer group"
              >
                <div className="font-medium text-stone-800 group-hover:text-rose-700">
                  "HydraFacial kal 4 baje Sarah 03001234567..."
                </div>
                <div className="text-stone-400 text-[11px] mt-0.5">
                  Direct appointment booking with Hira (Skincare)
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSuggestedPrompt("How much is a haircut and who is the specialist?")}
                className="text-left p-3 rounded-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50/40 transition-colors cursor-pointer group"
              >
                <div className="font-medium text-stone-800 group-hover:text-rose-700">
                  "How much is a haircut and who is the specialist?"
                </div>
                <div className="text-stone-400 text-[11px] mt-0.5">
                  English · Sana Hair Specialist & pricing (Rs. 1,500)
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSuggestedPrompt("Can you tell me about your Bridal Package and special discounts?")}
                className="text-left p-3 rounded-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50/40 transition-colors cursor-pointer group"
              >
                <div className="font-medium text-stone-800 group-hover:text-rose-700">
                  "Can you tell me about the Bridal Package?"
                </div>
                <div className="text-stone-400 text-[11px] mt-0.5">
                  Bridal Package Rs. 45,000 + 10% student discount
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSuggestedPrompt("I want to reschedule my appointment GLAM-101 to 6:00 PM")}
                className="text-left p-3 rounded-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50/40 transition-colors cursor-pointer group"
              >
                <div className="font-medium text-stone-800 group-hover:text-rose-700">
                  "Reschedule appointment GLAM-101 to 6:00 PM"
                </div>
                <div className="text-stone-400 text-[11px] mt-0.5">
                  Reschedule policy & slot availability verification
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSuggestedPrompt("Can I speak to a human receptionist please?")}
                className="text-left p-3 rounded-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50/40 transition-colors cursor-pointer group"
              >
                <div className="font-medium text-stone-800 group-hover:text-rose-700">
                  "Can I speak to a human receptionist?"
                </div>
                <div className="text-stone-400 text-[11px] mt-0.5">
                  Transfer policy to front desk manager (+92 300 1234567)
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
