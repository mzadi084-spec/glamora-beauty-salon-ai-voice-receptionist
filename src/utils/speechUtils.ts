/**
 * Utilities to prepare text for natural human-like speech synthesis
 * and realistic telephone audio effects.
 */

export interface VoicePreset {
  id: string;
  name: string;
  description: string;
  rate: number;
  pitch: number;
}

export const VOICE_PRESETS: VoicePreset[] = [
  {
    id: 'warm-natural',
    name: 'Warm & Natural (Recommended)',
    description: 'Polite, conversational rhythm with gentle warmth like a human receptionist',
    rate: 0.95,
    pitch: 1.06
  },
  {
    id: 'soft-luxury',
    name: 'Soft Concierge',
    description: 'Calm, soothing pace tailored for a luxury beauty salon atmosphere',
    rate: 0.90,
    pitch: 1.02
  },
  {
    id: 'cheerful-friendly',
    name: 'Cheerful Front Desk',
    description: 'Bright, energetic, and engaging phone manner',
    rate: 1.02,
    pitch: 1.12
  }
];

/**
 * Transforms written text into natural, spoken human dialogue.
 * Expands abbreviations, inserts conversational rhythm pauses,
 * and formats numbers/prices so they don't sound like a robot reading code.
 */
export function prepareSpokenText(text: string, lang: 'english' | 'urdu' | 'roman_urdu' = 'english'): string {
  if (!text) return '';

  let spoken = text;

  // Remove markdown bold, italic, code ticks
  spoken = spoken.replace(/\*\*(.*?)\*\*/g, '$1');
  spoken = spoken.replace(/\*(.*?)\*/g, '$1');
  spoken = spoken.replace(/`([^`]+)`/g, '$1');

  // Remove system bullets or decorative symbols
  spoken = spoken.replace(/[●•·|→←]/g, ' ');

  // Clean URLs or emails if any
  spoken = spoken.replace(/https?:\/\/\S+/gi, '');

  if (lang === 'roman_urdu') {
    // Expand currency in Roman Urdu for natural speech
    spoken = spoken.replace(/Rs\.?\s*([0-9,]+)/gi, (_match, p1) => {
      const cleanNum = p1.replace(/,/g, '');
      return `${cleanNum} rupay`;
    });

    // Expand time notation
    spoken = spoken.replace(/(\d{1,2}):00\s*PM/gi, '$1 baje dopehar');
    spoken = spoken.replace(/(\d{1,2}):00\s*AM/gi, '$1 baje subah');
  } else if (lang === 'urdu') {
    // In Urdu script, ensure natural pauses
    spoken = spoken.replace(/([۔،؟!])/g, '$1 ');
  } else {
    // English Naturalization
    // Expand currency: "Rs. 1,500" -> "1,500 Rupees"
    spoken = spoken.replace(/Rs\.?\s*([0-9,]+)/gi, '$1 Pakistani Rupees');

    // Expand time: "4:00 PM" -> "4 PM"
    spoken = spoken.replace(/(\d{1,2}):00\s*(AM|PM)/gi, '$1 $2');

    // Expand duration: "45 mins" -> "45 minutes"
    spoken = spoken.replace(/\b(\d+)\s*mins?\b/gi, '$1 minutes');

    // Natural phone number cadence (e.g. 0300 1234567 -> "0300, 123, 45, 67")
    spoken = spoken.replace(/\b03(\d{2})[-\s]?(\d{3})[-\s]?(\d{4})\b/g, '03$1, $2, $3');
  }

  // Insert natural breathing micro-pauses at punctuation
  spoken = spoken.replace(/([!?.])\s+/g, '$1, ');

  // Remove excessive whitespace
  spoken = spoken.replace(/\s+/g, ' ').trim();

  return spoken;
}

/**
 * Select best natural-sounding female voice from browser's speechSynthesis voices
 */
export function selectBestVoice(
  voices: SpeechSynthesisVoice[],
  lang: 'english' | 'urdu' | 'roman_urdu' = 'english'
): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // If Urdu script
  if (lang === 'urdu') {
    const urduVoice = voices.find(
      (v) => v.lang.startsWith('ur') || v.name.toLowerCase().includes('urdu')
    );
    if (urduVoice) return urduVoice;
  }

  // If Roman Urdu, South Asian English voices sound exceptionally authentic
  if (lang === 'roman_urdu') {
    const southAsianVoice = voices.find(
      (v) =>
        (v.lang.includes('en-IN') || v.lang.includes('en-PK') || v.name.includes('India')) &&
        (v.name.includes('Female') || v.name.includes('Natural') || v.name.includes('Neerja') || v.name.includes('Heera'))
    );
    if (southAsianVoice) return southAsianVoice;
  }

  // Premium natural / neural female voices in Edge, Chrome, Safari
  const preferredFemaleVoices = [
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Sonia Online (Natural) - English (United Kingdom)',
    'Google UK English Female',
    'Google US English',
    'Samantha (Enhanced)',
    'Samantha',
    'Victoria',
    'Zoe (Enhanced)',
    'Karen',
    'en-US-Neural2-F'
  ];

  for (const preferred of preferredFemaleVoices) {
    const match = voices.find((v) => v.name.toLowerCase().includes(preferred.toLowerCase()));
    if (match) return match;
  }

  // Fallback: any English female voice
  const anyFemale = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      (v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('woman') ||
        v.name.toLowerCase().includes('girl'))
  );
  if (anyFemale) return anyFemale;

  // Fallback: any English voice
  const anyEnglish = voices.find((v) => v.lang.startsWith('en'));
  if (anyEnglish) return anyEnglish;

  return voices[0] || null;
}

/**
 * Web Audio API synthesizer for realistic phone call sound effects:
 * - Ringing tone (realistic telephone US/UK dual frequency 440Hz + 480Hz)
 * - Pickup chime
 * - Hangup disconnect beep
 */
class PhoneSoundSynthesizer {
  private ctx: AudioContext | null = null;
  private ringOsc1: OscillatorNode | null = null;
  private ringOsc2: OscillatorNode | null = null;
  private ringGain: GainNode | null = null;
  private isRinging: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Play realistic phone ringing tone
   */
  startRinging() {
    const ctx = this.getContext();
    if (!ctx || this.isRinging) return;

    try {
      this.isRinging = true;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);

      // Standard telephone ring frequency: 440Hz + 480Hz
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 440;
      osc2.frequency.value = 480;

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      this.ringOsc1 = osc1;
      this.ringOsc2 = osc2;
      this.ringGain = gain;

      // Realistic ring cadence: ring for 1.6s, silence for 2s
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.setValueAtTime(0, now + 1.6);
      gain.gain.setValueAtTime(0.08, now + 3.6);
      gain.gain.setValueAtTime(0, now + 5.2);
    } catch (e) {
      console.warn('Audio ring synthesis failed:', e);
    }
  }

  stopRinging() {
    this.isRinging = false;
    try {
      if (this.ringOsc1) {
        this.ringOsc1.stop();
        this.ringOsc1.disconnect();
        this.ringOsc1 = null;
      }
      if (this.ringOsc2) {
        this.ringOsc2.stop();
        this.ringOsc2.disconnect();
        this.ringOsc2 = null;
      }
      if (this.ringGain) {
        this.ringGain.disconnect();
        this.ringGain = null;
      }
    } catch (e) {
      // ignore
    }
  }

  /**
   * Play friendly connection chime when Bella answers
   */
  playConnectedChime() {
    this.stopRinging();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // 2-tone melodic chime: C5 (523Hz) -> G5 (784Hz)
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.12);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Play gentle hangup disconnect tone
   */
  playHangupTone() {
    this.stopRinging();
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(425, now);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.setValueAtTime(0, now + 0.2);
      gain.gain.setValueAtTime(0.07, now + 0.35);
      gain.gain.setValueAtTime(0, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      // ignore
    }
  }
}

export const phoneAudio = new PhoneSoundSynthesizer();
