import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareSpokenText, VOICE_PRESETS } from './speechUtils';

test('prepareSpokenText naturalizes English prices, times and phone numbers', () => {
  const input = "Your appointment for **HydraFacial** at 4:00 PM costs Rs. 6,000. Call 03001234567.";
  const spoken = prepareSpokenText(input, 'english');

  // Should expand Rs. into Rupees
  assert.match(spoken, /6,000 Pakistani Rupees/i);
  // Should clean bold asterisks
  assert.doesNotMatch(spoken, /\*\*/);
  // Should convert 4:00 PM to 4 PM
  assert.match(spoken, /4 PM/);
  // Should group phone digits naturally
  assert.match(spoken, /0300,\s*123,\s*4567/);
});

test('prepareSpokenText handles Roman Urdu natural phrases', () => {
  const input = "Jee bilkul! Basic Facial Rs. 2,000 aur HydraFacial Rs. 6,000 mein available hai.";
  const spoken = prepareSpokenText(input, 'roman_urdu');

  assert.match(spoken, /2000 rupay/i);
  assert.match(spoken, /6000 rupay/i);
});

test('VOICE_PRESETS contains human-like configuration presets', () => {
  assert.equal(VOICE_PRESETS.length, 3);
  const warm = VOICE_PRESETS.find((p) => p.id === 'warm-natural');
  assert.ok(warm);
  assert.ok(warm.rate <= 1.0 && warm.rate >= 0.9);
  assert.ok(warm.pitch >= 1.0);
});
