import { Appointment, SalonService, ServiceCategory, SpecialPackage, StaffMember } from './utils/salonData';

export type ActiveTab = 'call' | 'calendar' | 'services' | 'packages' | 'staff' | 'faq';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language?: 'english' | 'urdu' | 'roman_urdu';
  actionTaken?: {
    type: 'booked' | 'rescheduled' | 'cancelled' | 'transferred';
    details: string;
    appointmentId?: string;
  };
}

export interface CallState {
  isActive: boolean;
  status: 'idle' | 'calling' | 'connected' | 'ended';
  durationSeconds: number;
  isMuted: boolean;
  isSpeakerOn: boolean;
  isBellaSpeaking: boolean;
  isListening: boolean;
  selectedLanguage: 'english' | 'urdu' | 'roman_urdu';
  speechRate: number;
  speechPitch: number;
  voicePreset: string;
}

export type { Appointment, SalonService, ServiceCategory, SpecialPackage, StaffMember };
