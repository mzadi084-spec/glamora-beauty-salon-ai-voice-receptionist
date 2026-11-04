import React from 'react';
import { Phone, Clock, MapPin, Sparkles, Calendar, List, Award, Users, HelpCircle } from 'lucide-react';
import { SALON_INFO } from '../utils/salonData';
import { ActiveTab } from '../types';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isCallActive: boolean;
  onStartCall: () => void;
  bookingCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isCallActive,
  onStartCall,
  bookingCount
}) => {
  return (
    <header className="border-b border-stone-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      {/* Top Salon Notification & Location Ribbon */}
      <div className="bg-stone-900 text-stone-200 text-xs py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{SALON_INFO.address}</span>
            </span>
            <span className="hidden md:inline text-stone-600">|</span>
            <span className="flex items-center gap-1.5 text-stone-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>10:00 AM – 9:00 PM (Mon–Sun) · Lunch: 2–3 PM</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-stone-400 hidden sm:inline">Reception Helpline:</span>
            <a
              href={`tel:${SALON_INFO.rawPhone}`}
              className="text-amber-300 hover:text-amber-200 font-medium flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              <span>{SALON_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Brand & Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-linear-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-200/50">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-serif-luxury font-semibold tracking-tight text-stone-900">
                  GLAMORA
                </h1>
                <span className="text-xs uppercase tracking-widest text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-sm">
                  Beauty Salon
                </span>
              </div>
              <p className="text-xs text-stone-500 font-normal">
                Gulberg III, Lahore · AI Voice Receptionist: <span className="text-stone-800 font-medium">Bella</span>
              </p>
            </div>
          </div>

          {/* Call Bella Action Button */}
          <div className="flex items-center gap-3">
            {!isCallActive ? (
              <button
                type="button"
                onClick={onStartCall}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow-md cursor-pointer"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <Phone className="w-4 h-4" />
                <span>Call Bella (Reception)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('call')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm animate-pulse cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-300" />
                <span>Call in Progress</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 mt-4 overflow-x-auto border-t border-stone-100 pt-2 pb-0.5" aria-label="Salon Sections">
          <button
            type="button"
            onClick={() => setActiveTab('call')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'call'
                ? 'bg-rose-50 text-rose-700 font-semibold border-b-2 border-rose-600'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Voice Receptionist</span>
            {isCallActive && (
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-rose-50 text-rose-700 font-semibold border-b-2 border-rose-600'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Salon Calendar</span>
            <span className="text-xs bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded-full ml-1">
              {bookingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'services'
                ? 'bg-rose-50 text-rose-700 font-semibold border-b-2 border-rose-600'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Services & Prices</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'packages'
                ? 'bg-rose-50 text-rose-700 font-semibold border-b-2 border-rose-600'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Special Packages</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('staff')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'staff'
                ? 'bg-rose-50 text-rose-700 font-semibold border-b-2 border-rose-600'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Beauty Specialists</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'faq'
                ? 'bg-rose-50 text-rose-700 font-semibold border-b-2 border-rose-600'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Salon Q&A</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
