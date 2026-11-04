import React from 'react';
import { Sparkles, Check, Phone, Tag, Calendar, HeartHandshake } from 'lucide-react';
import { SPECIAL_PACKAGES } from '../utils/salonData';

interface SpecialOffersProps {
  onAskBellaAboutPackage: (packageName: string) => void;
}

export const SpecialOffers: React.FC<SpecialOffersProps> = ({ onAskBellaAboutPackage }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-widest text-rose-600 font-semibold">
          Exclusive Glamora Promotions
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 mt-1">
          Special Salon Packages & Discounts
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-2">
          Curated combinations designed for special occasions, weekly self-care, and students. Ask Bella on call to apply your package.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SPECIAL_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            className={`rounded-2xl border p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
              pkg.id === 'pkg-bridal'
                ? 'bg-linear-to-b from-rose-50/70 via-white to-amber-50/30 border-rose-300 shadow-md ring-1 ring-rose-200'
                : 'bg-white border-stone-200 shadow-xs hover:border-rose-200'
            }`}
          >
            {pkg.id === 'pkg-bridal' && (
              <div className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-bl-lg">
                Most Popular
              </div>
            )}

            <div>
              <div className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold mb-2">
                <Tag className="w-3.5 h-3.5" />
                <span>{pkg.id.startsWith('promo') ? 'Special Promotional Offer' : 'Beauty Package'}</span>
              </div>

              <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
                {pkg.name}
              </h3>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-bold text-stone-900">
                  {pkg.priceDisplay}
                </span>
                {pkg.price > 0 && (
                  <span className="text-xs text-stone-400">/ package bundle</span>
                )}
              </div>

              <p className="text-xs text-stone-600 mt-3 leading-relaxed">
                {pkg.description}
              </p>

              <div className="mt-4 pt-4 border-t border-stone-100">
                <span className="text-xs font-semibold text-stone-800 block mb-2">
                  What's included:
                </span>
                <ul className="space-y-1.5 text-xs text-stone-600">
                  {pkg.includes.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 text-[11px] text-stone-400 bg-stone-50 p-2.5 rounded-lg">
                <span className="font-medium text-stone-600">Conditions:</span> {pkg.terms}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => onAskBellaAboutPackage(pkg.name)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  pkg.id === 'pkg-bridal'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>Ask Bella to Apply Offer</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
