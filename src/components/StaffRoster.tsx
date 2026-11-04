import React from 'react';
import { Sparkles, Calendar, Phone, Award, CheckCircle } from 'lucide-react';
import { STAFF_MEMBERS, StaffMember } from '../utils/salonData';

interface StaffRosterProps {
  onSelectStaffToBook: (staff: StaffMember) => void;
}

export const StaffRoster: React.FC<StaffRosterProps> = ({ onSelectStaffToBook }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-widest text-rose-600 font-semibold">
          Certified Artists & Experts
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 mt-1">
          Meet Our Beauty Specialists
        </h2>
        <p className="text-xs sm:text-sm text-stone-500 mt-2">
          If you prefer a specific artist for your appointment, Bella will verify their availability in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {STAFF_MEMBERS.map((staff) => (
          <div
            key={staff.id}
            className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between hover:border-rose-300 hover:shadow-md transition-all group"
          >
            <div>
              {/* Avatar circle with bespoke color */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-14 h-14 rounded-full bg-linear-to-tr ${staff.avatarColor} flex items-center justify-center text-white font-serif-luxury text-xl font-bold shadow-md`}
                >
                  {staff.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-stone-900 group-hover:text-rose-700 transition-colors">
                    {staff.name}
                  </h3>
                  <p className="text-xs font-semibold text-rose-600">
                    {staff.role}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {staff.experience}
                  </p>
                </div>
              </div>

              {/* Specialty */}
              <div className="mt-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-[11px] font-semibold text-stone-700 block uppercase tracking-wider mb-1">
                  Signature Specialty
                </span>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {staff.specialty}
                </p>
              </div>

              {/* Badges */}
              <div className="mt-4 flex items-center gap-2 text-xs text-stone-500">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Available for advance booking</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => onSelectStaffToBook(staff)}
                className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-rose-600 text-white text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Request {staff.name} with Bella</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
