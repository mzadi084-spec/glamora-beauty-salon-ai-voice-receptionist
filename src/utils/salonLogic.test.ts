import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidSlot,
  checkSlotAvailability,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment,
  detectLanguage,
  getGreeting,
  findMatchingService
} from './salonLogic';
import { INITIAL_DEMO_APPOINTMENTS } from './salonData';

test('isValidSlot rejects 2:00 PM lunch break', () => {
  const result = isValidSlot('2:00 PM');
  assert.equal(result.valid, false);
  assert.match(result.reason || '', /lunch break/i);

  const result2 = isValidSlot('2 PM');
  assert.equal(result2.valid, false);
});

test('isValidSlot accepts demo opening hours slots', () => {
  assert.equal(isValidSlot('10:00 AM').valid, true);
  assert.equal(isValidSlot('11:00 AM').valid, true);
  assert.equal(isValidSlot('4:00 PM').valid, true);
  assert.equal(isValidSlot('8:00 PM').valid, true);
});

test('findMatchingService resolves common queries', () => {
  const hydra = findMatchingService('HydraFacial');
  assert.equal(hydra?.id, 'facial-3');
  assert.equal(hydra?.price, 6000);

  const haircut = findMatchingService('haircut');
  assert.equal(haircut?.id, 'hair-1');
  assert.equal(haircut?.price, 1500);

  const bridal = findMatchingService('bridal makeup');
  assert.equal(bridal?.id, 'makeup-2');
  assert.equal(bridal?.price, 35000);
});

test('checkSlotAvailability detects conflict with existing booking', () => {
  // GLAM-101 has Sarah Khan with Hira on 2026-11-04 at 4:00 PM
  const conflict = checkSlotAvailability(
    INITIAL_DEMO_APPOINTMENTS,
    '2026-11-04',
    '4:00 PM',
    'Hira'
  );
  assert.equal(conflict.available, false);
  assert.match(conflict.conflictReason || '', /Hira is already booked/);

  // But another slot is available
  const available = checkSlotAvailability(
    INITIAL_DEMO_APPOINTMENTS,
    '2026-11-04',
    '5:00 PM',
    'Hira'
  );
  assert.equal(available.available, true);
});

test('createAppointment creates confirmed booking with assigned ID', () => {
  const result = createAppointment(INITIAL_DEMO_APPOINTMENTS, {
    customerName: 'Fatima Noor',
    phone: '03009998877',
    serviceName: 'Hair Styling',
    date: '2026-11-06',
    time: '12:00 PM'
  });

  assert.equal(result.success, true);
  assert.ok(result.appointment);
  assert.equal(result.appointment?.status, 'confirmed');
  assert.equal(result.appointment?.customerName, 'Fatima Noor');
  assert.equal(result.appointment?.price, 2000);
});

test('cancelAppointment cancels active booking', () => {
  const result = cancelAppointment(INITIAL_DEMO_APPOINTMENTS, 'GLAM-101');
  assert.equal(result.success, true);
  assert.equal(result.cancelledBooking?.status, 'cancelled');
});

test('rescheduleAppointment moves booking to new available time', () => {
  const result = rescheduleAppointment(
    INITIAL_DEMO_APPOINTMENTS,
    'GLAM-101',
    '2026-11-04',
    '6:00 PM'
  );
  assert.equal(result.success, true);
  assert.equal(result.rescheduledBooking?.time, '6:00 PM');
  assert.equal(result.rescheduledBooking?.status, 'rescheduled');
});

test('detectLanguage classifies Urdu, Roman Urdu, and English', () => {
  assert.equal(detectLanguage('Hello, what time do you open?'), 'english');
  assert.equal(detectLanguage('السلام علیکم! مجھے ہائیڈرا فیشل کروانا ہے'), 'urdu');
  assert.equal(detectLanguage('Mujhe kal 4 baje haircut book karwana hai'), 'roman_urdu');
  assert.equal(detectLanguage('Aapka salon kahan par hai?'), 'roman_urdu');
});

test('getGreeting provides proper scripts for Bella', () => {
  const enGreeting = getGreeting('english');
  assert.match(enGreeting, /Glamora Beauty Salon/);
  assert.match(enGreeting, /Bella/);

  const urduGreeting = getGreeting('roman_urdu');
  assert.match(urduGreeting, /Assalam-o-Alaikum/);
  assert.match(urduGreeting, /Glamora Beauty Salon/);
});
