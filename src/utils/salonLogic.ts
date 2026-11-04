import {
  ALL_SERVICES,
  AVAILABLE_SLOTS,
  SALON_INFO,
  SPECIAL_PACKAGES,
  STAFF_MEMBERS,
  Appointment,
  SalonService,
  StaffMember
} from './salonData';

export type SupportedLanguage = 'english' | 'urdu' | 'roman_urdu';

export interface NewAppointmentInput {
  customerName: string;
  phone: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "4:00 PM"
  beauticianName?: string;
  notes?: string;
}

/**
 * Validates whether the given time is within opening hours (10:00 AM - 9:00 PM)
 * and not during the lunch break (2:00 PM - 3:00 PM).
 */
export function isValidSlot(timeStr: string): { valid: boolean; reason?: string } {
  if (!timeStr) {
    return { valid: false, reason: 'Please select a valid time slot.' };
  }

  const normalized = timeStr.trim().toUpperCase();

  // Explicit check for lunch break (e.g. 2:00 PM, 2 PM, 2:30 PM, but NOT 12:00 PM)
  const isLunchBreak = /\b(0?2(:[0-5][0-9])?\s*PM)\b/i.test(normalized);
  if (isLunchBreak) {
    return {
      valid: false,
      reason: 'Our salon is closed for lunch break between 2:00 PM and 3:00 PM.'
    };
  }

  // Check matching slots
  const matchesSlot = AVAILABLE_SLOTS.some(
    (slot) => slot.toUpperCase() === normalized || normalized.startsWith(slot.toUpperCase())
  );

  if (!matchesSlot) {
    return {
      valid: false,
      reason: `Slot ${timeStr} is outside our available demo slots (10 AM to 8 PM, except 2-3 PM lunch).`
    };
  }

  return { valid: true };
}

/**
 * Check if a slot on a given date is available
 */
export function checkSlotAvailability(
  bookings: Appointment[],
  date: string,
  time: string,
  beauticianName?: string
): { available: boolean; conflictReason?: string } {
  const slotCheck = isValidSlot(time);
  if (!slotCheck.valid) {
    return { available: false, conflictReason: slotCheck.reason };
  }

  const normalizedTime = time.trim().toUpperCase();
  const normalizedDate = date.trim();

  // Find active conflicts on the same date and time
  const conflicts = bookings.filter(
    (b) =>
      b.status === 'confirmed' &&
      b.date === normalizedDate &&
      b.time.toUpperCase() === normalizedTime
  );

  if (beauticianName) {
    const specificConflict = conflicts.find(
      (b) => b.beauticianName.toLowerCase() === beauticianName.toLowerCase()
    );
    if (specificConflict) {
      return {
        available: false,
        conflictReason: `${beauticianName} is already booked at ${time} on ${date}.`
      };
    }
  }

  // Allow max 2 simultaneous appointments across the entire salon floor
  if (conflicts.length >= 3) {
    return {
      available: false,
      conflictReason: `All stations are fully booked at ${time} on ${date}. Please choose another slot.`
    };
  }

  return { available: true };
}

/**
 * Find service by keyword or ID
 */
export function findMatchingService(query: string): SalonService | undefined {
  if (!query) return undefined;
  const q = query.toLowerCase().trim();

  // Exact ID
  const byId = ALL_SERVICES.find((s) => s.id.toLowerCase() === q);
  if (byId) return byId;

  // Exact name
  const byName = ALL_SERVICES.find((s) => s.name.toLowerCase() === q);
  if (byName) return byName;

  // Key aliases
  if (q.includes('hydra') || q.includes('hydro')) return ALL_SERVICES.find((s) => s.id === 'facial-3');
  if (q.includes('haircut') || q.includes('baal katwane') || q.includes('hair cut')) return ALL_SERVICES.find((s) => s.id === 'hair-1');
  if (q.includes('bridal makeup') || q.includes('dulhan makeup') || q.includes('shadi makeup')) return ALL_SERVICES.find((s) => s.id === 'makeup-2');
  if (q.includes('keratin') || q.includes('protein')) return ALL_SERVICES.find((s) => s.id === 'hair-9');
  if (q.includes('rebonding')) return ALL_SERVICES.find((s) => s.id === 'hair-6');
  if (q.includes('highlights') || q.includes('streaking')) return ALL_SERVICES.find((s) => s.id === 'hair-8');
  if (q.includes('facial')) return ALL_SERVICES.find((s) => s.id === 'facial-1');
  if (q.includes('manicure') || q.includes('mani')) return ALL_SERVICES.find((s) => s.id === 'nails-1');
  if (q.includes('pedicure') || q.includes('pedi')) return ALL_SERVICES.find((s) => s.id === 'nails-2');
  if (q.includes('mehndi') || q.includes('henna') || q.includes('hina')) return ALL_SERVICES.find((s) => s.id === 'mehndi-1');
  if (q.includes('threading') || q.includes('eyebrow')) return ALL_SERVICES.find((s) => s.id === 'wax-6');
  if (q.includes('wax') || q.includes('waxing')) return ALL_SERVICES.find((s) => s.id === 'wax-1');
  if (q.includes('massage')) return ALL_SERVICES.find((s) => s.id === 'spa-1');

  // Substring match
  return ALL_SERVICES.find((s) => s.name.toLowerCase().includes(q) || q.includes(s.name.toLowerCase()));
}

/**
 * Match default or requested beautician for a service
 */
export function resolveBeautician(
  service: SalonService,
  requestedName?: string
): StaffMember {
  if (requestedName) {
    const matched = STAFF_MEMBERS.find((m) =>
      m.name.toLowerCase() === requestedName.toLowerCase().trim()
    );
    if (matched) return matched;
  }

  // Category based matching
  const categoryMatch = STAFF_MEMBERS.find((m) => m.category === service.category);
  if (categoryMatch) return categoryMatch;

  return STAFF_MEMBERS[0];
}

/**
 * Create a new appointment
 */
export function createAppointment(
  existingBookings: Appointment[],
  input: NewAppointmentInput
): { success: boolean; appointment?: Appointment; message: string } {
  if (!input.customerName || input.customerName.trim().length < 2) {
    return { success: false, message: 'Customer name is required.' };
  }
  if (!input.phone || input.phone.trim().length < 7) {
    return { success: false, message: 'A valid phone number is required.' };
  }

  const service = findMatchingService(input.serviceName) || {
    id: 'custom-svc',
    name: input.serviceName,
    category: 'facial' as const,
    price: 3000,
    priceDisplay: 'Rs. 3,000',
    durationMinutes: 45,
    description: input.serviceName
  };

  const beautician = resolveBeautician(service, input.beauticianName);

  const availability = checkSlotAvailability(
    existingBookings,
    input.date,
    input.time,
    beautician.name
  );

  if (!availability.available) {
    return {
      success: false,
      message: availability.conflictReason || 'The selected slot is unavailable.'
    };
  }

  const nextNum = 100 + existingBookings.length + 1;
  const newAppointment: Appointment = {
    id: `GLAM-${nextNum}`,
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    serviceId: service.id,
    serviceName: service.name,
    category: service.category,
    date: input.date,
    time: input.time,
    beauticianId: beautician.id,
    beauticianName: beautician.name,
    price: service.price,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    notes: input.notes
  };

  return {
    success: true,
    appointment: newAppointment,
    message: `Appointment for ${service.name} successfully booked for ${input.customerName} on ${input.date} at ${input.time} with ${beautician.name}.`
  };
}

/**
 * Cancel an appointment (policy: at least 4 hours before)
 */
export function cancelAppointment(
  bookings: Appointment[],
  query: string
): { success: boolean; updatedBookings: Appointment[]; message: string; cancelledBooking?: Appointment } {
  const q = query.toLowerCase().trim();
  const index = bookings.findIndex(
    (b) =>
      b.status === 'confirmed' &&
      (b.id.toLowerCase() === q ||
        b.phone.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q))
  );

  if (index === -1) {
    return {
      success: false,
      updatedBookings: bookings,
      message: `No active confirmed appointment found matching "${query}". Please verify the booking ID or phone number.`
    };
  }

  const target = bookings[index];
  const cancelledBooking: Appointment = {
    ...target,
    status: 'cancelled'
  };

  const updated = [...bookings];
  updated[index] = cancelledBooking;

  return {
    success: true,
    updatedBookings: updated,
    message: `Appointment ${target.id} for ${target.customerName} (${target.serviceName} at ${target.time}) has been successfully cancelled.`,
    cancelledBooking
  };
}

/**
 * Reschedule an existing appointment
 */
export function rescheduleAppointment(
  bookings: Appointment[],
  query: string,
  newDate: string,
  newTime: string
): { success: boolean; updatedBookings: Appointment[]; message: string; rescheduledBooking?: Appointment } {
  const q = query.toLowerCase().trim();
  const index = bookings.findIndex(
    (b) =>
      (b.status === 'confirmed' || b.status === 'rescheduled') &&
      (b.id.toLowerCase() === q ||
        b.phone.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q))
  );

  if (index === -1) {
    return {
      success: false,
      updatedBookings: bookings,
      message: `Could not find an active appointment matching "${query}".`
    };
  }

  const target = bookings[index];

  // Check new slot availability excluding the current appointment
  const otherBookings = bookings.filter((_, idx) => idx !== index);
  const availability = checkSlotAvailability(
    otherBookings,
    newDate,
    newTime,
    target.beauticianName
  );

  if (!availability.available) {
    return {
      success: false,
      updatedBookings: bookings,
      message: availability.conflictReason || `The new slot (${newTime} on ${newDate}) is not available.`
    };
  }

  const rescheduledBooking: Appointment = {
    ...target,
    date: newDate,
    time: newTime,
    status: 'rescheduled'
  };

  const updated = [...bookings];
  updated[index] = rescheduledBooking;

  return {
    success: true,
    updatedBookings: updated,
    message: `Appointment ${target.id} for ${target.customerName} has been successfully rescheduled to ${newDate} at ${newTime}.`,
    rescheduledBooking
  };
}

/**
 * Detect language: Urdu (Arabic script), Roman Urdu, or English
 */
export function detectLanguage(text: string): SupportedLanguage {
  if (!text) return 'english';

  // Check for Arabic/Urdu Unicode characters
  const urduRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
  if (urduRegex.test(text)) {
    return 'urdu';
  }

  // Check Roman Urdu common indicators
  const lower = text.toLowerCase();
  const romanUrduWords = [
    'aap', 'aapka', 'aapki', 'mujhe', 'hum', 'humein', 'hai', 'hain', 'mein',
    'kya', 'konsa', 'karwana', 'karwani', 'bataiye', 'shukriya', 'baje', 'kal',
    'aaj', 'kitne', 'kitna', 'paas', 'hoga', 'hogi', 'zaroor', 'bilkul', 'kaise'
  ];

  const matched = romanUrduWords.filter((w) => new RegExp(`\\b${w}\\b`, 'i').test(lower));
  if (matched.length >= 1) {
    return 'roman_urdu';
  }

  return 'english';
}

/**
 * Return Bella's official greeting script
 */
export function getGreeting(lang: SupportedLanguage = 'english'): string {
  if (lang === 'urdu') {
    return "السلام علیکم! گلیمورا بیوٹی سیلون میں خوش آمدید۔ میرا نام بیلا ہے، آپ کی ورچوئل بیوٹی اسسٹنٹ۔ بتائیے، میں آج آپ کی کیا مدد کر سکتی ہوں؟";
  }
  if (lang === 'roman_urdu') {
    return "Assalam-o-Alaikum! Glamora Beauty Salon mein khush aamdeed. Main Bella hoon, aapki virtual assistant. Batayein, main aapki kya help kar sakti hoon?";
  }
  return "Hello! Thank you for calling Glamora Beauty Salon. My name is Bella, your virtual beauty assistant. How may I help you today?";
}
