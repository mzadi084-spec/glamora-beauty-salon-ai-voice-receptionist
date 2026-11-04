import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { PhoneCallScreen } from './components/PhoneCallScreen';
import { CalendarDashboard } from './components/CalendarDashboard';
import { ServicesMenu } from './components/ServicesMenu';
import { SpecialOffers } from './components/SpecialOffers';
import { StaffRoster } from './components/StaffRoster';
import { FaqSection } from './components/FaqSection';
import { BookingSlipModal } from './components/BookingSlipModal';
import {
  INITIAL_DEMO_APPOINTMENTS,
  Appointment,
  SALON_INFO,
  SalonService,
  StaffMember
} from './utils/salonData';
import {
  ActiveTab,
  ChatMessage,
  CallState
} from './types';
import {
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  detectLanguage,
  getGreeting,
  SupportedLanguage
} from './utils/salonLogic';
import {
  prepareSpokenText,
  selectBestVoice,
  phoneAudio,
  VOICE_PRESETS
} from './utils/speechUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('call');
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_DEMO_APPOINTMENTS);
  const [activeSlip, setActiveSlip] = useState<Appointment | null>(null);

  // Call state
  const [callState, setCallState] = useState<CallState>({
    isActive: false,
    status: 'idle',
    durationSeconds: 0,
    isMuted: false,
    isSpeakerOn: true,
    isBellaSpeaking: false,
    isListening: false,
    selectedLanguage: 'english',
    speechRate: 0.95,
    speechPitch: 1.06,
    voicePreset: 'warm-natural'
  });

  // Call transcript messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setAvailableVoices(v);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, []);

  // Call duration timer
  useEffect(() => {
    let timer: any = null;
    if (callState.isActive && callState.status === 'connected') {
      timer = setInterval(() => {
        setCallState((prev) => ({ ...prev, durationSeconds: prev.durationSeconds + 1 }));
      }, 1000);
    } else {
      if (timer) clearInterval(timer);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callState.isActive, callState.status]);

  // Natural Human-Like Text-To-Speech implementation
  const speakText = useCallback((text: string, lang: SupportedLanguage = 'english') => {
    if (!('speechSynthesis' in window)) return;
    if (!callState.isSpeakerOn) return;

    try {
      window.speechSynthesis.cancel();

      // Transform raw text into natural spoken phrasing with pauses and spelled-out currencies
      const spokenText = prepareSpokenText(text, lang);
      const utterance = new SpeechSynthesisUtterance(spokenText);

      // Apply natural pace & pitch
      utterance.rate = callState.speechRate;
      utterance.pitch = callState.speechPitch;

      // Select highest fidelity natural female voice
      const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      const bestVoice = selectBestVoice(voices, lang);
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      utterance.onstart = () => {
        setCallState((p) => ({ ...p, isBellaSpeaking: true }));
      };
      utterance.onend = () => {
        setCallState((p) => ({ ...p, isBellaSpeaking: false }));
      };
      utterance.onerror = () => {
        setCallState((p) => ({ ...p, isBellaSpeaking: false }));
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setCallState((p) => ({ ...p, isBellaSpeaking: false }));
    }
  }, [availableVoices, callState.isSpeakerOn, callState.speechPitch, callState.speechRate]);

  // Test / Preview Bella's natural voice
  const handlePreviewVoice = useCallback((customText?: string) => {
    const preview = customText || "Hello! Welcome to Glamora Beauty Salon. My name is Bella. I'm here to help you book appointments and answer any questions with warm hospitality.";
    speakText(preview, 'english');
  }, [speakText]);

  // Start Call with realistic telephone ring and connection chime
  const handleStartCall = useCallback((initialLang: SupportedLanguage = 'english') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Set calling state and start phone ringing
    setCallState((prev) => ({
      ...prev,
      isActive: true,
      status: 'calling',
      durationSeconds: 0,
      isBellaSpeaking: false,
      isListening: false,
      selectedLanguage: initialLang
    }));

    phoneAudio.startRinging();
    setActiveTab('call');

    // Simulate realistic pickup after 1.2 seconds
    setTimeout(() => {
      phoneAudio.playConnectedChime();

      const greeting = getGreeting(initialLang);
      const greetingMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: initialLang
      };

      setCallState((prev) => ({
        ...prev,
        status: 'connected',
        isBellaSpeaking: true
      }));

      setMessages([greetingMsg]);

      // Speak greeting in Bella's warm, natural voice
      setTimeout(() => {
        speakText(greeting, initialLang);
      }, 250);
    }, 1200);
  }, [speakText]);

  // End Call with gentle hangup tone
  const handleEndCall = useCallback(() => {
    phoneAudio.playHangupTone();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallState((prev) => ({
      ...prev,
      isActive: false,
      status: 'ended',
      isBellaSpeaking: false,
      isListening: false
    }));
  }, []);

  // Process customer message
  const handleSendMessage = useCallback(async (userText: string) => {
    if (!userText.trim()) return;

    // Detect language
    const lang = detectLanguage(userText);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: lang
    };

    setMessages((prev) => [...prev, userMessage]);

    // Send to backend /api/receptionist
    try {
      const response = await fetch('/api/receptionist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
          activeBookings: appointments
        })
      });

      let replyText = '';
      let replyLang = lang;
      let actionObj: any = null;

      if (response.ok) {
        const data = await response.json();
        replyText = data.reply;
        replyLang = data.language || lang;
        actionObj = data.action;
      } else {
        throw new Error('Server response not ok');
      }

      // Check if Bella decided to book, reschedule, or cancel
      let actionTakenData: ChatMessage['actionTaken'] = undefined;

      if (actionObj && actionObj.type === 'book' && actionObj.customerName && actionObj.serviceName) {
        const bookResult = createAppointment(appointments, {
          customerName: actionObj.customerName,
          phone: actionObj.phone || '03001234567',
          serviceName: actionObj.serviceName,
          date: actionObj.date || '2026-11-05',
          time: actionObj.time || '4:00 PM',
          beauticianName: actionObj.beauticianName
        });

        if (bookResult.success && bookResult.appointment) {
          setAppointments((prev) => [bookResult.appointment!, ...prev]);
          actionTakenData = {
            type: 'booked',
            details: `Appointment ${bookResult.appointment.id} (${bookResult.appointment.serviceName}) confirmed for ${bookResult.appointment.customerName}`,
            appointmentId: bookResult.appointment.id
          };
        }
      } else if (actionObj && actionObj.type === 'cancel' && actionObj.bookingId) {
        const cancelResult = cancelAppointment(appointments, actionObj.bookingId);
        if (cancelResult.success) {
          setAppointments(cancelResult.updatedBookings);
          actionTakenData = {
            type: 'cancelled',
            details: cancelResult.message,
            appointmentId: actionObj.bookingId
          };
        }
      } else if (actionObj && actionObj.type === 'reschedule' && actionObj.bookingId && actionObj.date && actionObj.time) {
        const reschedResult = rescheduleAppointment(appointments, actionObj.bookingId, actionObj.date, actionObj.time);
        if (reschedResult.success) {
          setAppointments(reschedResult.updatedBookings);
          actionTakenData = {
            type: 'rescheduled',
            details: reschedResult.message,
            appointmentId: actionObj.bookingId
          };
        }
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: replyLang,
        actionTaken: actionTakenData
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Speak reply out loud
      speakText(replyText, replyLang);
    } catch (err) {
      console.warn('Error handling receptionist query:', err);
      // Client fallback logic
      const fallbackReply = lang === 'roman_urdu'
        ? "Jee zaroor! Glamora Salon mein advance booking available hai. Aap kis service ke liye appointment lena chahein gi?"
        : "Certainly! I would be delighted to assist you with Glamora salon services and booking. Which treatment would you like?";

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: lang
      };

      setMessages((prev) => [...prev, assistantMessage]);
      speakText(fallbackReply, lang);
    }
  }, [appointments, messages, speakText]);

  // Quick book actions from other tabs
  const handleSelectServiceToBook = (service: SalonService) => {
    setActiveTab('call');
    if (!callState.isActive) {
      handleStartCall();
      setTimeout(() => {
        handleSendMessage(`I would like to book an appointment for ${service.name}.`);
      }, 500);
    } else {
      handleSendMessage(`I would like to book an appointment for ${service.name}.`);
    }
  };

  const handleAskAboutPackage = (packageName: string) => {
    setActiveTab('call');
    if (!callState.isActive) {
      handleStartCall();
      setTimeout(() => {
        handleSendMessage(`Could you explain the details and pricing for the ${packageName}?`);
      }, 500);
    } else {
      handleSendMessage(`Could you explain the details and pricing for the ${packageName}?`);
    }
  };

  const handleSelectStaffToBook = (staff: StaffMember) => {
    setActiveTab('call');
    if (!callState.isActive) {
      handleStartCall();
      setTimeout(() => {
        handleSendMessage(`I would like an appointment with ${staff.name} for ${staff.role}. What slots does she have available?`);
      }, 500);
    } else {
      handleSendMessage(`I would like an appointment with ${staff.name} for ${staff.role}. What slots does she have available?`);
    }
  };

  const handleAskQuestion = (question: string) => {
    setActiveTab('call');
    if (!callState.isActive) {
      handleStartCall();
      setTimeout(() => {
        handleSendMessage(question);
      }, 500);
    } else {
      handleSendMessage(question);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col selection:bg-rose-100 selection:text-rose-900">
      {/* Salon Header with navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCallActive={callState.isActive}
        onStartCall={() => handleStartCall('english')}
        bookingCount={appointments.filter((a) => a.status === 'confirmed').length}
      />

      {/* Main Content Sections */}
      <main className="flex-1 pb-16">
        {activeTab === 'call' && (
          <PhoneCallScreen
            callState={callState}
            setCallState={setCallState}
            messages={messages}
            onSendMessage={handleSendMessage}
            onEndCall={handleEndCall}
            onStartCall={() => handleStartCall('english')}
            onPreviewVoice={handlePreviewVoice}
            appointments={appointments}
            onOpenBookingSlip={(app) => setActiveSlip(app)}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarDashboard
            appointments={appointments}
            setAppointments={setAppointments}
            onOpenBookingSlip={(app) => setActiveSlip(app)}
          />
        )}

        {activeTab === 'services' && (
          <ServicesMenu onSelectServiceToBook={handleSelectServiceToBook} />
        )}

        {activeTab === 'packages' && (
          <SpecialOffers onAskBellaAboutPackage={handleAskAboutPackage} />
        )}

        {activeTab === 'staff' && (
          <StaffRoster onSelectStaffToBook={handleSelectStaffToBook} />
        )}

        {activeTab === 'faq' && (
          <FaqSection onAskQuestionOnCall={handleAskQuestion} />
        )}
      </main>

      {/* Digital Booking Receipt / Slip Modal */}
      <BookingSlipModal
        appointment={activeSlip}
        onClose={() => setActiveSlip(null)}
      />

      {/* Salon Footer */}
      <footer className="border-t border-stone-200 bg-white py-8 px-4 sm:px-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span className="font-serif-luxury font-bold text-stone-800 text-sm tracking-wide">
              GLAMORA BEAUTY SALON
            </span>
            <span className="hidden sm:inline text-stone-300">·</span>
            <span>Main Boulevard, Gulberg III, Lahore, Pakistan</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-stone-500">
            <span>Operating Hours: 10:00 AM – 9:00 PM</span>
            <span>·</span>
            <span>Lunch: 2:00 PM – 3:00 PM</span>
            <span>·</span>
            <a href={`tel:${SALON_INFO.rawPhone}`} className="text-rose-600 hover:underline font-medium">
              {SALON_INFO.phone}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
