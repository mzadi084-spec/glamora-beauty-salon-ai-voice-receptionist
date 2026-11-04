export interface SalonService {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  priceDisplay: string;
  durationMinutes: number;
  description: string;
  suitableStaffId?: string;
}

export type ServiceCategory =
  | 'hair'
  | 'facial'
  | 'makeup'
  | 'nails'
  | 'waxing'
  | 'mehndi'
  | 'spa'
  | 'eye';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  category: ServiceCategory;
  specialty: string;
  experience: string;
  avatarColor: string;
}

export interface SpecialPackage {
  id: string;
  name: string;
  price: number;
  priceDisplay: string;
  description: string;
  includes: string[];
  terms: string;
}

export interface Appointment {
  id: string;
  customerName: string;
  phone: string;
  serviceId: string;
  serviceName: string;
  category: ServiceCategory;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "11:00 AM"
  beauticianId?: string;
  beauticianName: string;
  price: number;
  status: 'confirmed' | 'rescheduled' | 'cancelled';
  createdAt: string;
  notes?: string;
}

export const SALON_INFO = {
  name: "Glamora Beauty Salon",
  receptionist: "Bella",
  address: "Main Boulevard, Gulberg III, Lahore, Pakistan",
  city: "Lahore",
  phone: "+92 300 1234567",
  rawPhone: "+923001234567",
  email: "hello@glamorabeauty.example",
  days: "Monday to Sunday (Open 7 Days)",
  openTime: "10:00 AM",
  closeTime: "9:00 PM",
  lunchBreak: "2:00 PM to 3:00 PM",
  currency: "PKR",
  currencySymbol: "Rs.",
  walkIns: "Accepted, subject to availability",
  policy: "Advance booking is recommended. Cancellation requested at least 4 hours before slot."
};

export const STAFF_MEMBERS: StaffMember[] = [
  {
    id: "ayesha",
    name: "Ayesha",
    role: "Senior Makeup Artist",
    category: "makeup",
    specialty: "Bridal, HD & Airbrush Glow Artistry",
    experience: "8+ years experience",
    avatarColor: "from-amber-600 to-rose-600"
  },
  {
    id: "sana",
    name: "Sana",
    role: "Hair Specialist",
    category: "hair",
    specialty: "Keratin, Hair Color Transformations & Styling",
    experience: "7+ years experience",
    avatarColor: "from-stone-700 to-amber-700"
  },
  {
    id: "hira",
    name: "Hira",
    role: "Skincare & Facial Expert",
    category: "facial",
    specialty: "HydraFacials, Whitening & Anti-Aging Treatments",
    experience: "6+ years experience",
    avatarColor: "from-rose-500 to-teal-700"
  },
  {
    id: "maryam",
    name: "Maryam",
    role: "Nail Technician",
    category: "nails",
    specialty: "Acrylic, Gel Extensions & Russian Nail Art",
    experience: "5+ years experience",
    avatarColor: "from-pink-600 to-purple-600"
  },
  {
    id: "zoya",
    name: "Zoya",
    role: "Mehndi Artist",
    category: "mehndi",
    specialty: "Intricate Bridal, Arabic & Contemporary Mehndi",
    experience: "6+ years experience",
    avatarColor: "from-emerald-700 to-amber-800"
  }
];

export const CATEGORIES: { id: ServiceCategory; title: string; urduTitle: string; icon: string }[] = [
  { id: 'hair', title: 'Hair Services', urduTitle: 'ہیئر سروسز', icon: 'Scissors' },
  { id: 'facial', title: 'Facial & Skincare', urduTitle: 'فیشل اور اسکن کیئر', icon: 'Sparkles' },
  { id: 'makeup', title: 'Makeup Services', urduTitle: 'میک اپ سروسز', icon: 'Heart' },
  { id: 'nails', title: 'Nails Services', urduTitle: 'نیلز سروسز', icon: 'Hand' },
  { id: 'waxing', title: 'Waxing & Threading', urduTitle: 'ویکسنگ اور تھریڈنگ', icon: 'Flame' },
  { id: 'mehndi', title: 'Mehndi Services', urduTitle: 'مہندی سروسز', icon: 'Flower2' },
  { id: 'spa', title: 'Spa & Body Treatments', urduTitle: 'اسپا اور باڈی ٹریٹمنٹ', icon: 'Droplets' },
  { id: 'eye', title: 'Eye Beauty Services', urduTitle: 'آئی بیوٹی سروسز', icon: 'Eye' },
];

export const ALL_SERVICES: SalonService[] = [
  // A. Hair Services
  { id: 'hair-1', name: 'Haircut', category: 'hair', price: 1500, priceDisplay: 'Rs. 1,500', durationMinutes: 45, description: 'Precision styling tailored to your face shape by Sana' },
  { id: 'hair-2', name: 'Hair Styling', category: 'hair', price: 2000, priceDisplay: 'Rs. 2,000', durationMinutes: 60, description: 'Curling, party waves, tongs or sleek styling' },
  { id: 'hair-3', name: 'Hair Wash', category: 'hair', price: 800, priceDisplay: 'Rs. 800', durationMinutes: 20, description: 'Deep scalp wash with nourishing professional conditioner' },
  { id: 'hair-4', name: 'Blow Dry', category: 'hair', price: 1200, priceDisplay: 'Rs. 1,200', durationMinutes: 30, description: 'Volumizing blow out with lasting shine' },
  { id: 'hair-5', name: 'Hair Straightening', category: 'hair', price: 5000, priceDisplay: 'Rs. 5,000', durationMinutes: 90, description: 'Thermal deep straightening finish' },
  { id: 'hair-6', name: 'Hair Rebonding', category: 'hair', price: 8000, priceDisplay: 'Rs. 8,000', durationMinutes: 180, description: 'Permanent silky poker-straight chemical rebonding' },
  { id: 'hair-7', name: 'Hair Coloring', category: 'hair', price: 6000, priceDisplay: 'Rs. 6,000', durationMinutes: 120, description: 'Full root-to-tip global premium color formulation' },
  { id: 'hair-8', name: 'Hair Highlights', category: 'hair', price: 7000, priceDisplay: 'Rs. 7,000', durationMinutes: 150, description: 'Dimensional foils, balayage, or face-framing baby lights' },
  { id: 'hair-9', name: 'Keratin Treatment', category: 'hair', price: 12000, priceDisplay: 'Rs. 12,000', durationMinutes: 180, description: 'Frizz-free protein restoration and lasting gloss' },
  { id: 'hair-10', name: 'Hair Spa', category: 'hair', price: 3000, priceDisplay: 'Rs. 3,000', durationMinutes: 60, description: 'Intense botanical scalp and hair hydrating mask with steam' },
  { id: 'hair-11', name: 'Hair Extensions', category: 'hair', price: 10000, priceDisplay: 'Starting from Rs. 10,000', durationMinutes: 120, description: '100% human hair wefts with custom tape or clip fitting' },

  // B. Facial & Skincare
  { id: 'facial-1', name: 'Basic Facial', category: 'facial', price: 2000, priceDisplay: 'Rs. 2,000', durationMinutes: 45, description: 'Gentle cleansing, scrub, and hydrating soothing mask' },
  { id: 'facial-2', name: 'Deep Cleansing Facial', category: 'facial', price: 3000, priceDisplay: 'Rs. 3,000', durationMinutes: 60, description: 'Pore extraction, steam, and sebum balancing serum' },
  { id: 'facial-3', name: 'HydraFacial', category: 'facial', price: 6000, priceDisplay: 'Rs. 6,000', durationMinutes: 75, description: 'Signature vortex suction with deep hydration and vitamin infusion' },
  { id: 'facial-4', name: 'Whitening Facial', category: 'facial', price: 3500, priceDisplay: 'Rs. 3,500', durationMinutes: 60, description: 'Brightening treatment for sun-damage and hyperpigmentation' },
  { id: 'facial-5', name: 'Acne Facial', category: 'facial', price: 4000, priceDisplay: 'Rs. 4,000', durationMinutes: 60, description: 'Salicylic and antibacterial calm treatment for breakout-prone skin' },
  { id: 'facial-6', name: 'Anti-Aging Facial', category: 'facial', price: 5000, priceDisplay: 'Rs. 5,000', durationMinutes: 75, description: 'Collagen-boosting massage, firming serum, and peptide therapy' },
  { id: 'facial-7', name: 'Face Polish', category: 'facial', price: 1500, priceDisplay: 'Rs. 1,500', durationMinutes: 30, description: 'Gentle micro-crystal smoothing glow treatment' },
  { id: 'facial-8', name: 'Face Cleanup', category: 'facial', price: 1200, priceDisplay: 'Rs. 1,200', durationMinutes: 30, description: 'Quick refresh with cleanse, gentle exfoliation, and toner' },
  { id: 'facial-9', name: 'Face Mask', category: 'facial', price: 800, priceDisplay: 'Rs. 800', durationMinutes: 20, description: 'Soothing organic clay or moisture-lock sheet mask' },

  // C. Makeup Services
  { id: 'makeup-1', name: 'Party Makeup', category: 'makeup', price: 8000, priceDisplay: 'Rs. 8,000', durationMinutes: 75, description: 'Glamorous evening makeup with premium lashes by Ayesha' },
  { id: 'makeup-2', name: 'Bridal Makeup', category: 'makeup', price: 35000, priceDisplay: 'Rs. 35,000', durationMinutes: 180, description: 'Luxurious full bridal makeup with jewelry setting and dupatta drape' },
  { id: 'makeup-3', name: 'Engagement Makeup', category: 'makeup', price: 15000, priceDisplay: 'Rs. 15,000', durationMinutes: 120, description: 'Soft radiant glow tailored for ring ceremonies and photography' },
  { id: 'makeup-4', name: 'HD Makeup', category: 'makeup', price: 12000, priceDisplay: 'Rs. 12,000', durationMinutes: 90, description: 'High definition light-reflecting base for high-res cameras' },
  { id: 'makeup-5', name: 'Airbrush Makeup', category: 'makeup', price: 15000, priceDisplay: 'Rs. 15,000', durationMinutes: 90, description: 'Flawless water-resistant air mist application with 16h wear' },
  { id: 'makeup-6', name: 'Natural Makeup', category: 'makeup', price: 5000, priceDisplay: 'Rs. 5,000', durationMinutes: 50, description: 'Subtle no-makeup dewy finish for daylight gatherings' },
  { id: 'makeup-7', name: 'Reception Makeup', category: 'makeup', price: 20000, priceDisplay: 'Rs. 20,000', durationMinutes: 120, description: 'Regal look for Valima and reception celebrations' },
  { id: 'makeup-8', name: 'Eye Makeup', category: 'makeup', price: 3000, priceDisplay: 'Rs. 3,000', durationMinutes: 35, description: 'Cut crease, smokey or shimmer eyes with lash application' },

  // D. Nails Services
  { id: 'nails-1', name: 'Manicure', category: 'nails', price: 1500, priceDisplay: 'Rs. 1,500', durationMinutes: 45, description: 'Cuticle care, gentle scrub, hand massage, and polish by Maryam' },
  { id: 'nails-2', name: 'Pedicure', category: 'nails', price: 2000, priceDisplay: 'Rs. 2,000', durationMinutes: 50, description: 'Aromatic foot soak, heel buffing, nail shaping, and polish' },
  { id: 'nails-3', name: 'Nail Art', category: 'nails', price: 2500, priceDisplay: 'Rs. 2,500', durationMinutes: 40, description: 'French tips, ombre, chrome foil, or custom hand-painted art' },
  { id: 'nails-4', name: 'Gel Nails', category: 'nails', price: 3500, priceDisplay: 'Rs. 3,500', durationMinutes: 60, description: 'UV cured chip-resistant high gloss lasting 3+ weeks' },
  { id: 'nails-5', name: 'Acrylic Nails', category: 'nails', price: 5000, priceDisplay: 'Rs. 5,000', durationMinutes: 90, description: 'Full acrylic sculpting set with length and shape customization' },
  { id: 'nails-6', name: 'Nail Extensions', category: 'nails', price: 6000, priceDisplay: 'Rs. 6,000', durationMinutes: 100, description: 'Sculpted gel or acrylic nail extensions' },
  { id: 'nails-7', name: 'Nail Polish', category: 'nails', price: 5000 / 10, priceDisplay: 'Rs. 500', durationMinutes: 15, description: 'Quick classic or quick-dry regular polish coat' },
  { id: 'nails-8', name: 'Nail Removal', category: 'nails', price: 1000, priceDisplay: 'Rs. 1,000', durationMinutes: 30, description: 'Safe acetone soak-off for acrylic or gel extensions' },

  // E. Waxing & Threading
  { id: 'wax-1', name: 'Full Body Wax', category: 'waxing', price: 6000, priceDisplay: 'Rs. 6,000', durationMinutes: 90, description: 'Gentle fruit wax for arms, legs, back, and underarms' },
  { id: 'wax-2', name: 'Arms Wax', category: 'waxing', price: 1000, priceDisplay: 'Rs. 1,000', durationMinutes: 25, description: 'Full arms hair removal with soothing post-wax oil' },
  { id: 'wax-3', name: 'Legs Wax', category: 'waxing', price: 1500, priceDisplay: 'Rs. 1,500', durationMinutes: 35, description: 'Full legs smooth waxing' },
  { id: 'wax-4', name: 'Underarms Wax', category: 'waxing', price: 500, priceDisplay: 'Rs. 500', durationMinutes: 15, description: 'Quick and hygienic hot wax application' },
  { id: 'wax-5', name: 'Face Wax', category: 'waxing', price: 800, priceDisplay: 'Rs. 800', durationMinutes: 20, description: 'Sensitive skin hypoallergenic face waxing' },
  { id: 'wax-6', name: 'Eyebrow Threading', category: 'waxing', price: 300, priceDisplay: 'Rs. 300', durationMinutes: 15, description: 'Clean arch definition and shaping with organic thread' },
  { id: 'wax-7', name: 'Upper Lip Threading', category: 'waxing', price: 200, priceDisplay: 'Rs. 200', durationMinutes: 10, description: 'Quick precision hair removal' },
  { id: 'wax-8', name: 'Full Face Threading', category: 'waxing', price: 700, priceDisplay: 'Rs. 700', durationMinutes: 30, description: 'Forehead, chin, cheeks, upper lip, and brow neatening' },

  // F. Mehndi Services
  { id: 'mehndi-1', name: 'Bridal Mehndi', category: 'mehndi', price: 15000, priceDisplay: 'Rs. 15,000', durationMinutes: 180, description: 'Extravagant full arms and feet dark stain henna by Zoya' },
  { id: 'mehndi-2', name: 'Arabic Mehndi', category: 'mehndi', price: 2500, priceDisplay: 'Rs. 2,500', durationMinutes: 45, description: 'Bold floral trails and shaded leaves pattern' },
  { id: 'mehndi-3', name: 'Traditional Mehndi', category: 'mehndi', price: 3000, priceDisplay: 'Rs. 3,000', durationMinutes: 60, description: 'Classic peacock, paisley, and geometric jaal motifs' },
  { id: 'mehndi-4', name: 'Party Mehndi', category: 'mehndi', price: 2000, priceDisplay: 'Rs. 2,000', durationMinutes: 40, description: 'Single side both hands elegant party design' },
  { id: 'mehndi-5', name: 'Hand Mehndi', category: 'mehndi', price: 1500, priceDisplay: 'Rs. 1,500', durationMinutes: 30, description: 'One palm or back delicate artistic pattern' },
  { id: 'mehndi-6', name: 'Feet Mehndi', category: 'mehndi', price: 2000, priceDisplay: 'Rs. 2,000', durationMinutes: 40, description: 'Ankle borders and feet mandala motifs' },

  // G. Spa & Body Treatments
  { id: 'spa-1', name: 'Body Massage', category: 'spa', price: 4000, priceDisplay: 'Rs. 4,000', durationMinutes: 60, description: 'Full body restorative massage with heated herbal essential oils' },
  { id: 'spa-2', name: 'Body Scrub', category: 'spa', price: 3500, priceDisplay: 'Rs. 3,500', durationMinutes: 45, description: 'Dead skin exfoliation with sea salt and rose petals' },
  { id: 'spa-3', name: 'Body Polish', category: 'spa', price: 5000, priceDisplay: 'Rs. 5,000', durationMinutes: 60, description: 'Glow wrap, thorough scrub, and velvety body milk' },
  { id: 'spa-4', name: 'Relaxation Massage', category: 'spa', price: 4500, priceDisplay: 'Rs. 4,500', durationMinutes: 60, description: 'Swedish gentle pressure technique for stress relief' },
  { id: 'spa-5', name: 'Head Massage', category: 'spa', price: 1500, priceDisplay: 'Rs. 1,500', durationMinutes: 30, description: 'Scalp acupressure with warm almond and coconut oil' },

  // H. Eye Beauty Services
  { id: 'eye-1', name: 'Eyelash Extensions', category: 'eye', price: 4000, priceDisplay: 'Rs. 4,000', durationMinutes: 90, description: 'Classic or volume lash extensions for fluttery dramatic eyes' },
  { id: 'eye-2', name: 'Lash Lifting', category: 'eye', price: 3000, priceDisplay: 'Rs. 3,000', durationMinutes: 50, description: 'Semi-permanent curl and tint lasting 6 to 8 weeks' },
  { id: 'eye-3', name: 'Eyebrow Tinting', category: 'eye', price: 1500, priceDisplay: 'Rs. 1,500', durationMinutes: 25, description: 'Custom pigment tinting for naturally fuller brows' },
  { id: 'eye-4', name: 'Eyebrow Shaping', category: 'eye', price: 500, priceDisplay: 'Rs. 500', durationMinutes: 20, description: 'Tweezing, trimming, and precision pencil outline' },
  { id: 'eye-5', name: 'Eyebrow Lamination', category: 'eye', price: 3500, priceDisplay: 'Rs. 3,500', durationMinutes: 45, description: 'Keratin perm for feathery, brushed-up model brows' },
];

export const SPECIAL_PACKAGES: SpecialPackage[] = [
  {
    id: 'pkg-bridal',
    name: 'Bridal Package',
    price: 45000,
    priceDisplay: 'Rs. 45,000',
    description: 'Complete luxury bridal preparation for your most special day.',
    includes: ['Bridal Makeup by Ayesha', 'Hair Styling & Dupatta Setting', 'Luxury Facial (HydraFacial)'],
    terms: 'Advance booking required. Total savings of Rs. 3,000 compared to individual services.'
  },
  {
    id: 'pkg-glow',
    name: 'Glow Package',
    price: 8000,
    priceDisplay: 'Rs. 8,000',
    description: 'The all-in-one head-to-toe weekend refresher for radiant glow.',
    includes: ['Basic Facial / Face Polish', 'Deluxe Manicure', 'Aromatic Pedicure'],
    terms: 'Valid all week. Saves over Rs. 1,500.'
  },
  {
    id: 'pkg-hair-care',
    name: 'Hair Care Package',
    price: 10000,
    priceDisplay: 'Rs. 10,000',
    description: 'Nourishing repair therapy to restore damaged, dry, or chemically treated locks.',
    includes: ['Hair Spa Treatment', 'Designer Haircut by Sana', 'Glam Blow Dry Finish'],
    terms: 'Applicable for any hair length.'
  },
  {
    id: 'promo-student',
    name: 'Student Discount',
    price: 0,
    priceDisplay: '10% OFF',
    description: '10% discount on selected services with valid student ID card presentation.',
    includes: ['Haircut & Blow Dry', 'Manicure & Pedicure', 'Face Cleanup'],
    terms: 'Show student ID during checkout.'
  },
  {
    id: 'promo-weekend',
    name: 'Weekend Offer',
    price: 0,
    priceDisplay: '15% OFF',
    description: '15% discount on selected facial services every Saturday & Sunday.',
    includes: ['HydraFacial', 'Deep Cleansing Facial', 'Anti-Aging Facial'],
    terms: 'Applicable for Saturday & Sunday bookings.'
  }
];

export const AVAILABLE_SLOTS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  // 2:00 PM is Lunch Break
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
  '7:00 PM',
  '8:00 PM'
];

export const INITIAL_DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 'GLAM-101',
    customerName: 'Sarah Khan',
    phone: '03001234567',
    serviceId: 'facial-3',
    serviceName: 'HydraFacial',
    category: 'facial',
    date: '2026-11-04',
    time: '4:00 PM',
    beauticianId: 'hira',
    beauticianName: 'Hira',
    price: 6000,
    status: 'confirmed',
    createdAt: '2026-11-03T14:30:00Z',
    notes: 'Preferred Skincare expert Hira'
  },
  {
    id: 'GLAM-102',
    customerName: 'Aamina Malik',
    phone: '03219876543',
    serviceId: 'makeup-2',
    serviceName: 'Bridal Makeup',
    category: 'makeup',
    date: '2026-11-05',
    time: '11:00 AM',
    beauticianId: 'ayesha',
    beauticianName: 'Ayesha',
    price: 35000,
    status: 'confirmed',
    createdAt: '2026-11-02T10:15:00Z',
    notes: 'Valima bride consultation completed'
  },
  {
    id: 'GLAM-103',
    customerName: 'Zainab Tariq',
    phone: '03335551234',
    serviceId: 'hair-9',
    serviceName: 'Keratin Treatment',
    category: 'hair',
    date: '2026-11-04',
    time: '1:00 PM',
    beauticianId: 'sana',
    beauticianName: 'Sana',
    price: 12000,
    status: 'confirmed',
    createdAt: '2026-11-04T08:00:00Z',
    notes: 'Keratin protein treatment'
  }
];

export const FREQUENT_QUESTIONS = [
  {
    q: "What time does your salon open?",
    urduQ: "آپ کا سیلون کس وقت کھلتا ہے؟",
    a: "Our salon opens at 10 AM and closes at 9 PM, Monday through Sunday. We take a lunch break from 2:00 PM to 3:00 PM."
  },
  {
    q: "Where is your salon located?",
    urduQ: "سیلون کہاں واقع ہے؟",
    a: "We are located at Main Boulevard, Gulberg III, Lahore, Pakistan."
  },
  {
    q: "How much is a haircut?",
    urduQ: "ہئیر کٹ کی کیا قیمت ہے؟",
    a: "Our haircut service costs Rs. 1,500 and is styled by our hair specialist Sana."
  },
  {
    q: "Do you offer bridal makeup?",
    urduQ: "کیا آپ برائیڈل میک اپ کرتے ہیں؟",
    a: "Yes! We offer bridal makeup starting at Rs. 35,000 by Senior Makeup Artist Ayesha, as well as a full Bridal Package for Rs. 45,000."
  },
  {
    q: "Do you offer HydraFacial?",
    urduQ: "کیا آپ کے پاس ہائیڈرا فیشل ہے؟",
    a: "Yes! Our HydraFacial service costs Rs. 6,000 by our skincare expert Hira."
  },
  {
    q: "Do you have any discounts?",
    urduQ: "کیا کوئی ڈسکاؤنٹ یا آفر ہے؟",
    a: "Yes! We have our Bridal Package (Rs. 45,000), Glow Package (Rs. 8,000), Hair Care Package (Rs. 10,000), a 10% Student Discount, and a 15% Weekend Offer on selected facials."
  },
  {
    q: "Can I book an appointment?",
    urduQ: "کیا میں اپوائنٹمنٹ بک کر سکتی ہوں؟",
    a: "Absolutely! I would be delighted to help you book an appointment right now. Which service would you like?"
  },
  {
    q: "Can I speak to a human receptionist?",
    urduQ: "کیا میں انسانی ریسیپشنسٹ سے بات کر سکتی ہوں؟",
    a: "Of course! Let me connect you with our salon front desk manager on +92 300 1234567."
  }
];
