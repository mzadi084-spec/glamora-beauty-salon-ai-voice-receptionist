import React, { useState } from 'react';
import { HelpCircle, Phone, Languages } from 'lucide-react';
import { FREQUENT_QUESTIONS } from '../utils/salonData';

interface FaqSectionProps {
  onAskQuestionOnCall: (question: string) => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onAskQuestionOnCall }) => {
  const [showUrdu, setShowUrdu] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-rose-600 font-semibold">
            Common Customer Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 mt-1">
            Salon Help & Information
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Bella answers these inquiries instantly on every phone call.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUrdu((v) => !v)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-200 hover:border-rose-300 rounded-lg text-xs font-medium text-stone-700 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Languages className="w-4 h-4 text-rose-600" />
          <span>{showUrdu ? 'Switch to English' : 'اردو میں دیکھیں (Show Urdu)'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {FREQUENT_QUESTIONS.map((faq, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-stone-200 p-5 hover:border-rose-200 transition-all shadow-xs"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className={`font-semibold text-stone-900 ${showUrdu ? 'font-urdu text-lg leading-relaxed text-right' : 'text-sm sm:text-base'}`}>
                  {showUrdu ? faq.urduQ : faq.q}
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 mt-2 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
                  <span className="font-semibold text-rose-700 mr-1.5">Bella:</span>
                  {faq.a}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onAskQuestionOnCall(faq.q)}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                title="Simulate asking Bella this question on call"
              >
                <Phone className="w-3 h-3" />
                <span className="hidden sm:inline">Ask Bella</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
