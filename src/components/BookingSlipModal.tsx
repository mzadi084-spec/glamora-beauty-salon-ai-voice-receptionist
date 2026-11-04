import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, MapPin, Phone, User, CheckCircle2, Copy, Check, X } from 'lucide-react';
import { Appointment, SALON_INFO } from '../utils/salonData';

interface BookingSlipModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

export const BookingSlipModal: React.FC<BookingSlipModalProps> = ({ appointment, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!appointment) return null;

  const smsText = `GLAMORA BEAUTY SALON APPOINTMENT CONFIRMATION
Ref: ${appointment.id}
Client: ${appointment.customerName}
Service: ${appointment.serviceName} (Rs. ${appointment.price.toLocaleString()})
Specialist: ${appointment.beauticianName}
Date: ${appointment.date} at ${appointment.time}
Address: ${SALON_INFO.address}
Helpline: ${SALON_INFO.phone}
Policy: Please arrive 10 mins early. Cancellations requested at least 4h prior.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(smsText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Slip Top Header */}
        <div className="bg-stone-900 text-white p-6 text-center relative">
          <div className="w-10 h-10 rounded-full bg-rose-600 mx-auto flex items-center justify-center text-white mb-2 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-serif-luxury text-xl font-bold tracking-tight">
            GLAMORA BEAUTY SALON
          </h3>
          <p className="text-xs text-rose-300 font-medium mt-0.5">
            Main Boulevard, Gulberg III, Lahore
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-stone-800 rounded-full text-xs font-mono text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Booking Confirmed: {appointment.id}</span>
          </div>
        </div>

        {/* Ticket Details */}
        <div className="p-6 space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-stone-100">
            <div>
              <span className="text-stone-400 text-xs block">Customer Name</span>
              <span className="font-semibold text-stone-900">{appointment.customerName}</span>
            </div>
            <div>
              <span className="text-stone-400 text-xs block">Contact Number</span>
              <span className="font-semibold text-stone-900">{appointment.phone}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-stone-100">
            <div>
              <span className="text-stone-400 text-xs block">Reserved Service</span>
              <span className="font-semibold text-stone-900">{appointment.serviceName}</span>
            </div>
            <div>
              <span className="text-stone-400 text-xs block">Assigned Specialist</span>
              <span className="font-semibold text-rose-700">{appointment.beauticianName}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-3 border-b border-stone-100">
            <div>
              <span className="text-stone-400 text-xs block">Appointment Date</span>
              <span className="font-semibold text-stone-900">{appointment.date}</span>
            </div>
            <div>
              <span className="text-stone-400 text-xs block">Time Slot</span>
              <span className="font-semibold text-stone-900">{appointment.time}</span>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-stone-50 p-3.5 rounded-xl flex items-center justify-between border border-stone-200">
            <span className="font-medium text-stone-700">Estimated Total (PKR)</span>
            <span className="text-base font-bold text-stone-900">
              Rs. {appointment.price.toLocaleString()}
            </span>
          </div>

          {/* Salon Terms */}
          <div className="text-[11px] text-stone-500 leading-relaxed bg-rose-50/50 p-3 rounded-xl border border-rose-100">
            <span className="font-semibold text-rose-800">Salon Notice:</span> Please arrive 10 minutes prior to your slot. In case of cancellation or rescheduling, please notify Bella at least 4 hours before your slot.
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied SMS Details' : 'Copy SMS / WhatsApp Text'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 border border-stone-200 text-stone-700 hover:bg-stone-100 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
