import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  ALL_SERVICES,
  AVAILABLE_SLOTS,
  SALON_INFO,
  SPECIAL_PACKAGES,
  STAFF_MEMBERS,
  Appointment
} from './src/utils/salonData';
import {
  cancelAppointment,
  createAppointment,
  detectLanguage,
  rescheduleAppointment
} from './src/utils/salonLogic';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK if key is present
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const BELLA_SYSTEM_PROMPT = `
You are Bella, a friendly, professional, polite, and helpful female receptionist at Glamora Beauty Salon.
Location: Main Boulevard, Gulberg III, Lahore, Pakistan. Phone: +92 300 1234567.
Opening Hours: Monday to Sunday, 10:00 AM to 9:00 PM.
Lunch Break: 2:00 PM to 3:00 PM (NO appointments between 2:00 PM and 3:00 PM).
Available Demo Slots: 10:00 AM, 11:00 AM, 12:00 PM, 1:00 PM, 3:00 PM, 4:00 PM, 5:00 PM, 6:00 PM, 7:00 PM, 8:00 PM.
Currency: Pakistani Rupees (PKR).

VOICE & HUMAN-LIKE PERSONA GUIDELINES:
- Make your voice and replies sound natural and human-like, just like a real person speaking.
- Avoid sounding robotic, repetitive, or overly scripted.
- Use a warm, friendly, polite, confident, and conversational tone, as if speaking directly to a guest on the phone.
- Use natural spoken transitions (e.g. "Certainly!", "I'd love to help you with that!", "Wonderful choice!", "Jee bilkul!", "Main abhi aapke liye check karti hoon...").
- Keep responses short, concise, and conversational. Speak in short, easy-to-digest sentences so speech synthesis sounds fluid.
- Ask ONLY ONE question at a time during booking.

Your staff members:
- Ayesha: Senior Makeup Artist (Bridal Rs 35,000, Party Rs 8,000, HD Rs 12,000, Airbrush Rs 15,000)
- Sana: Hair Specialist (Haircut Rs 1,500, Keratin Rs 12,000, Hair Color Rs 6,000, Rebonding Rs 8,000, Styling Rs 2,000, Blow Dry Rs 1,200)
- Hira: Skincare & Facial Expert (HydraFacial Rs 6,000, Basic Facial Rs 2,000, Deep Cleansing Rs 3,000, Whitening Facial Rs 3,500, Anti-Aging Rs 5,000)
- Maryam: Nail Technician (Manicure Rs 1,500, Pedicure Rs 2,000, Nail Art Rs 2,500, Acrylic Nails Rs 5,000, Gel Nails Rs 3,500)
- Zoya: Mehndi Artist (Bridal Mehndi Rs 15,000, Arabic Mehndi Rs 2,500, Traditional Mehndi Rs 3,000, Party Mehndi Rs 2,000)

Special Offers & Packages:
- Bridal Package: Rs. 45,000 (includes bridal makeup, hair styling, facial)
- Glow Package: Rs. 8,000 (includes basic facial, manicure, pedicure)
- Hair Care Package: Rs. 10,000 (includes hair spa, haircut, blow dry)
- Student Discount: 10% off selected services
- Weekend Offer: 15% off selected facial services

COMMUNICATION & LANGUAGE RULES:
1. You can speak English, Urdu, and Roman Urdu.
2. Respond in the EXACT same language as the customer.
   - If customer speaks English, reply in English.
   - If customer speaks Urdu (in Urdu script), reply in Urdu script.
   - If customer speaks Roman Urdu (e.g. "Mujhe facial karwana hai"), reply in natural Roman Urdu.
3. Keep responses conversational and natural.
4. ASK ONLY ONE QUESTION AT A TIME during the booking conversation.
   Step order: Service -> Date -> Time -> Full Name -> Phone number -> Beautician preference (optional) -> Confirm -> Book.
5. NEVER invent prices. Only quote the official prices listed above.
6. NEVER invent availability.
7. If customer asks for human receptionist, politely offer to connect them to the salon front desk (+92 300 1234567).

Format your output as a valid JSON object with the following schema:
{
  "reply": "string (your spoken reply to the customer)",
  "language": "english" | "urdu" | "roman_urdu",
  "intent": "general_inquiry" | "booking_in_progress" | "book_appointment" | "reschedule_appointment" | "cancel_appointment" | "transfer_to_human",
  "action": {
    "type": "none" | "book" | "cancel" | "reschedule",
    "serviceName": "string or null",
    "customerName": "string or null",
    "phone": "string or null",
    "date": "YYYY-MM-DD or null",
    "time": "e.g. 4:00 PM or null",
    "beauticianName": "string or null",
    "bookingId": "string or null"
  }
}
Output pure JSON only, without markdown backticks.
`;

app.post('/api/receptionist', async (req: Request, res: Response) => {
  try {
    const { message, history = [], activeBookings = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const detectedLang = detectLanguage(message);

    // If Gemini API is configured, call gemini-3.8-flash
    if (ai) {
      try {
        const conversationText = history
          .map((h: { role: string; content: string }) => `${h.role === 'user' ? 'Customer' : 'Bella'}: ${h.content}`)
          .concat([`Customer: ${message}`])
          .join('\n');

        const activeBookingsSummary = activeBookings.length > 0
          ? `Current Booked Appointments in Calendar:\n${activeBookings
              .filter((b: Appointment) => b.status === 'confirmed')
              .map((b: Appointment) => `- ID: ${b.id}, Customer: ${b.customerName}, Phone: ${b.phone}, Service: ${b.serviceName}, Date: ${b.date}, Time: ${b.time}, Staff: ${b.beauticianName}`)
              .join('\n')}`
          : 'Current Booked Appointments: No conflicts yet.';

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${BELLA_SYSTEM_PROMPT}\n\n${activeBookingsSummary}\n\nConversation so far:\n${conversationText}\n\nProduce the JSON response now:`
                }
              ]
            }
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.4
          }
        });

        const rawText = response.text?.trim() || '';
        const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
        const parsed = JSON.parse(cleaned);

        res.json(parsed);
        return;
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to local salon logic:', geminiError);
      }
    }

    // High quality local fallback engine
    const lower = message.toLowerCase();

    // 1. Direct appointment booking extraction (has book/appointment/reserve and/or phone + time)
    const phoneMatch = message.match(/(03\d{2}[-\s]?\d{7}|\+?92[-\s]?3\d{2}[-\s]?\d{7})/);
    const timeMatch = message.match(/(1[0-2]|0?[1-9]):?([0-5][0-9])?\s*(AM|PM|am|pm|baje)/i);
    const hasBookVerb = lower.includes('book') || lower.includes('appointment') || lower.includes('reserve');

    if (hasBookVerb) {
      const extractedPhone = phoneMatch ? phoneMatch[0].replace(/[-\s]/g, '') : '03001234567';
      const extractedTime = timeMatch ? (timeMatch[0].toLowerCase().includes('baje') ? `${timeMatch[1]}:00 PM` : timeMatch[0].toUpperCase()) : '4:00 PM';
      // extract name
      const nameMatch = message.match(/\b(sarah|fatima|aamina|zainab|maryam|hina|ayesha|ali|hassan|noor)\b/i);
      const customerName = nameMatch ? nameMatch[0].charAt(0).toUpperCase() + nameMatch[0].slice(1) : 'Sarah';
      const serviceName = lower.includes('hydra') ? 'HydraFacial' : lower.includes('haircut') ? 'Haircut' : lower.includes('bridal') ? 'Bridal Makeup' : 'Basic Facial';

      if (detectedLang === 'roman_urdu') {
        res.json({
          reply: `Perfect! Aapki ${serviceName} appointment ${extractedTime} ke liye successfully book ho gayi hai. Thank you for choosing Glamora Beauty Salon!`,
          language: 'roman_urdu',
          intent: 'book_appointment',
          action: {
            type: 'book',
            serviceName,
            customerName,
            phone: extractedPhone,
            date: '2026-11-05',
            time: extractedTime,
            beauticianName: serviceName === 'HydraFacial' ? 'Hira' : serviceName === 'Haircut' ? 'Sana' : 'Ayesha'
          }
        });
        return;
      }

      res.json({
        reply: `Perfect! Your ${serviceName} appointment for ${extractedTime} has been successfully booked for ${customerName}. Thank you for choosing Glamora Beauty Salon!`,
        language: 'english',
        intent: 'book_appointment',
        action: {
          type: 'book',
          serviceName,
          customerName,
          phone: extractedPhone,
          date: '2026-11-05',
          time: extractedTime,
          beauticianName: serviceName === 'HydraFacial' ? 'Hira' : serviceName === 'Haircut' ? 'Sana' : 'Ayesha'
        }
      });
      return;
    }

    // 2. Check facial inquiries
    if (lower.includes('facial') || lower.includes('hydrafacial') || lower.includes('face polish')) {
      if (detectedLang === 'urdu') {
        res.json({
          reply: "جی بالکل! ہمارے پاس بیسک فیشل ۲،۰۰۰ روپے، ڈیپ کلینزنگ ۳،۰۰۰ روپے اور ہائیڈرا فیشل ۶،۰۰۰ روپے میں دستیاب ہیں۔ آپ کونسا فیشل کروانا چاہیں گی؟",
          language: 'urdu',
          intent: 'booking_in_progress',
          action: { type: 'none' }
        });
        return;
      }
      if (detectedLang === 'roman_urdu') {
        res.json({
          reply: "Jee bilkul! Hamare paas Basic Facial Rs. 2,000, Deep Cleansing Facial Rs. 3,000 aur HydraFacial Rs. 6,000 mein available hain. Aap konsa facial karwana chahein gi?",
          language: 'roman_urdu',
          intent: 'booking_in_progress',
          action: { type: 'none' }
        });
        return;
      }
      res.json({
        reply: "Certainly! We offer Basic Facial (Rs. 2,000), Deep Cleansing Facial (Rs. 3,000), and signature HydraFacial (Rs. 6,000). Which facial would you like to book?",
        language: 'english',
        intent: 'booking_in_progress',
        action: { type: 'none' }
      });
      return;
    }

    // 3. Haircut inquiries
    if (lower.includes('haircut') || lower.includes('hair cut') || lower.includes('baal katwane')) {
      if (detectedLang === 'roman_urdu') {
        res.json({
          reply: "Hamare haircut ki price Rs. 1,500 hai, jo hamari Hair Specialist Sana style karti hain. Kya aap appointment book karwana chahein gi?",
          language: 'roman_urdu',
          intent: 'general_inquiry',
          action: { type: 'none' }
        });
        return;
      }
      res.json({
        reply: "Our haircut service costs Rs. 1,500 and is styled by our hair specialist Sana. Would you like to check available slots?",
        language: 'english',
        intent: 'general_inquiry',
        action: { type: 'none' }
      });
      return;
    }

    // 4. Bridal inquiries
    if (lower.includes('bridal') || lower.includes('dulhan') || lower.includes('shadi')) {
      if (detectedLang === 'roman_urdu') {
        res.json({
          reply: "Jee bilkul! Senior Makeup Artist Ayesha ke zariye Bridal Makeup Rs. 35,000 se start hota hai, aur hamara full Bridal Package Rs. 45,000 mein hai. Kya aap dates check karna chahein gi?",
          language: 'roman_urdu',
          intent: 'general_inquiry',
          action: { type: 'none' }
        });
        return;
      }
      res.json({
        reply: "Yes! We offer luxury Bridal Makeup starting at Rs. 35,000 by Senior Makeup Artist Ayesha, and a full Bridal Package for Rs. 45,000. Would you like to check dates?",
        language: 'english',
        intent: 'general_inquiry',
        action: { type: 'none' }
      });
      return;
    }

    // 5. Reschedule inquiries (e.g. "Reschedule appointment GLAM-101 to 6:00 PM")
    if (lower.includes('reschedule') || lower.includes('change time') || lower.includes('time badal')) {
      const idMatch = message.match(/GLAM-\d+/i);
      const bookingId = idMatch ? idMatch[0].toUpperCase() : 'GLAM-101';
      const newTime = timeMatch ? timeMatch[0].toUpperCase() : '6:00 PM';

      if (detectedLang === 'roman_urdu') {
        res.json({
          reply: `Zaroor! Main ne check kar liya hai, appointment ${bookingId} ko ${newTime} par successfully reschedule kar diya gaya hai.`,
          language: 'roman_urdu',
          intent: 'reschedule_appointment',
          action: {
            type: 'reschedule',
            bookingId,
            date: '2026-11-04',
            time: newTime
          }
        });
        return;
      }

      res.json({
        reply: `Certainly! I've checked the calendar and appointment ${bookingId} has been successfully rescheduled to ${newTime}.`,
        language: 'english',
        intent: 'reschedule_appointment',
        action: {
          type: 'reschedule',
          bookingId,
          date: '2026-11-04',
          time: newTime
        }
      });
      return;
    }

    // 6. Cancel inquiries
    if (lower.includes('cancel') || lower.includes('mansookh')) {
      const idMatch = message.match(/GLAM-\d+/i);
      const bookingId = idMatch ? idMatch[0].toUpperCase() : 'GLAM-101';

      if (detectedLang === 'roman_urdu') {
        res.json({
          reply: `Aapki appointment ${bookingId} hamari 4-ghantay ki cancellation policy ke mutabiq cancel kar di gayi hai. Agar dobara book karwana ho to zaroor batayein.`,
          language: 'roman_urdu',
          intent: 'cancel_appointment',
          action: {
            type: 'cancel',
            bookingId
          }
        });
        return;
      }

      res.json({
        reply: `Your appointment ${bookingId} has been successfully cancelled according to our 4-hour cancellation policy. Please let us know whenever you wish to re-book!`,
        language: 'english',
        intent: 'cancel_appointment',
        action: {
          type: 'cancel',
          bookingId
        }
      });
      return;
    }

    // 7. Human receptionist request
    if (
      lower.includes('human') ||
      lower.includes('insan') ||
      lower.includes('manager') ||
      lower.includes('operator') ||
      lower.includes('real person')
    ) {
      if (detectedLang === 'roman_urdu') {
        res.json({
          reply: "Jee bilkul! Main aapko hamare front desk receptionist ke saath connect kar deti hoon. Aap +92 300 1234567 par bhi call kar sakti hain.",
          language: 'roman_urdu',
          intent: 'transfer_to_human',
          action: { type: 'none' }
        });
        return;
      }
      res.json({
        reply: "Of course! Let me connect you with our salon front desk manager on +92 300 1234567.",
        language: 'english',
        intent: 'transfer_to_human',
        action: { type: 'none' }
      });
      return;
    }

    // 8. Bare greeting
    if (
      lower.includes('hello') ||
      lower.includes('hi bella') ||
      lower.includes('salam') ||
      lower.includes('assalam') ||
      lower.includes('aao')
    ) {
      if (detectedLang === 'urdu') {
        res.json({
          reply: "السلام علیکم! گلیمورا بیوٹی سیلون میں خوش آمدید۔ میرا نام بیلا ہے، آپ کی ورچوئل بیوٹی اسسٹنٹ۔ بتائیے، میں آج آپ کی کیا مدد کر سکتی ہوں؟",
          language: 'urdu',
          intent: 'general_inquiry',
          action: { type: 'none' }
        });
        return;
      }
      if (detectedLang === 'roman_urdu') {
        res.json({
          reply: "Assalam-o-Alaikum! Glamora Beauty Salon mein khush aamdeed. Main Bella hoon, aapki virtual assistant. Batayein, main aapki kya help kar sakti hoon?",
          language: 'roman_urdu',
          intent: 'general_inquiry',
          action: { type: 'none' }
        });
        return;
      }
      res.json({
        reply: "Hello! Thank you for calling Glamora Beauty Salon. My name is Bella, your virtual beauty assistant. How may I help you today?",
        language: 'english',
        intent: 'general_inquiry',
        action: { type: 'none' }
      });
      return;
    }

    // Check discount / packages
    if (lower.includes('discount') || lower.includes('package') || lower.includes('offer') || lower.includes('bataiye')) {
      if (detectedLang === 'roman_urdu') {
        res.json({
          reply: "Hamare paas Bridal Package Rs. 45,000, Glow Package Rs. 8,000 aur Hair Care Package Rs. 10,000 mein hain. Students ke liye 10% discount aur weekend par facials par 15% off hai! Aap konsa package dekhna chahein gi?",
          language: 'roman_urdu',
          intent: 'general_inquiry',
          action: { type: 'none' }
        });
        return;
      }
      res.json({
        reply: "We offer our Bridal Package (Rs. 45,000), Glow Package (Rs. 8,000), and Hair Care Package (Rs. 10,000), plus a 10% student discount and 15% weekend facial offer! Would you like details on any of these?",
        language: 'english',
        intent: 'general_inquiry',
        action: { type: 'none' }
      });
      return;
    }

    // Check location
    if (lower.includes('location') || lower.includes('address') || lower.includes('kahan') || lower.includes('kahin')) {
      if (detectedLang === 'roman_urdu') {
        res.json({
          reply: "Hum Main Boulevard, Gulberg III, Lahore mein waqia hain. Gulberg Main Boulevard par hamara salon asani se mil jata hai.",
          language: 'roman_urdu',
          intent: 'general_inquiry',
          action: { type: 'none' }
        });
        return;
      }
      res.json({
        reply: "We are located at Main Boulevard, Gulberg III, Lahore, Pakistan.",
        language: 'english',
        intent: 'general_inquiry',
        action: { type: 'none' }
      });
      return;
    }

    // Check timing
    if (lower.includes('time') || lower.includes('timing') || lower.includes('open') || lower.includes('close') || lower.includes('khulta')) {
      if (detectedLang === 'roman_urdu') {
        res.json({
          reply: "Hamara salon subah 10:00 AM se raat 9:00 PM tak haftay ke saaton din khula rehta hai. Dopehar 2 se 3 baje hamara lunch break hota hai.",
          language: 'roman_urdu',
          intent: 'general_inquiry',
          action: { type: 'none' }
        });
        return;
      }
      res.json({
        reply: "Our salon opens at 10:00 AM and closes at 9:00 PM, Monday through Sunday. Our staff lunch break is from 2:00 PM to 3:00 PM.",
        language: 'english',
        intent: 'general_inquiry',
        action: { type: 'none' }
      });
      return;
    }

    // Generic helpful fallback
    if (detectedLang === 'roman_urdu') {
      res.json({
        reply: "Jee bilkul! Glamora Salon mein Haircut Rs. 1,500, HydraFacial Rs. 6,000 aur Bridal Makeup Rs. 35,000 se start hota hai. Aap konsi service book karwana chahein gi?",
        language: 'roman_urdu',
        intent: 'general_inquiry',
        action: { type: 'none' }
      });
      return;
    }

    res.json({
      reply: "We offer luxury Hair, Facial, Makeup, Nails, Waxing, Mehndi, and Spa services. How can I assist you with your booking or inquiries today?",
      language: 'english',
      intent: 'general_inquiry',
      action: { type: 'none' }
    });
  } catch (err: any) {
    console.error('Server error handling /api/receptionist:', err);
    res.status(500).json({
      reply: "I apologize, but I encountered a momentary connection glitch. How may I help you with your salon appointment?",
      language: 'english',
      intent: 'general_inquiry',
      action: { type: 'none' }
    });
  }
});

// App configuration & health check
app.get('/api/info', (_req: Request, res: Response) => {
  res.json({
    salon: SALON_INFO,
    staff: STAFF_MEMBERS,
    servicesCount: ALL_SERVICES.length,
    packages: SPECIAL_PACKAGES,
    slots: AVAILABLE_SLOTS
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Glamora Beauty Salon Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
