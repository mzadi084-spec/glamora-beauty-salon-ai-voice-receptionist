import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Eye,
  Filter,
  Lock
} from 'lucide-react';
import {
  AVAILABLE_SLOTS,
  Appointment,
  STAFF_MEMBERS,
  ALL_SERVICES
} from '../utils/salonData';
import {
  checkSlotAvailability,
  createAppointment,
  cancelAppointment,
  rescheduleAppointment
} from '../utils/salonLogic';

interface CalendarDashboardProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  onOpenBookingSlip: (appointment: Appointment) => void;
}

export const CalendarDashboard: React.FC<CalendarDashboardProps> = ({
  appointments,
  setAppointments,
  onOpenBookingSlip
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-11-04');
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'rescheduled' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states for manual booking / reschedule
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [newRescheduleTime, setNewRescheduleTime] = useState('5:00 PM');
  const [newRescheduleDate, setNewRescheduleDate] = useState('2026-11-04');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Manual booking form state
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newServiceId, setNewServiceId] = useState(ALL_SERVICES[0].id);
  const [newSlotTime, setNewSlotTime] = useState('11:00 AM');
  const [newBeautician, setNewBeautician] = useState(STAFF_MEMBERS[0].name);

  // Filtered appointments
  const filteredAppointments = appointments.filter((app) => {
    if (selectedStaff !== 'all' && app.beauticianName.toLowerCase() !== selectedStaff.toLowerCase()) {
      return false;
    }
    if (statusFilter !== 'all' && app.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.customerName.toLowerCase().includes(q);
      const matchPhone = app.phone.toLowerCase().includes(q);
      const matchId = app.id.toLowerCase().includes(q);
      const matchService = app.serviceName.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchId && !matchService) return false;
    }
    return true;
  });

  // Calculate day-specific appointments for slot timeline
  const dayAppointments = appointments.filter(
    (app) => app.date === selectedDate && app.status !== 'cancelled'
  );

  const handleManualBook = (e: React.FormEvent) => {
    e.preventDefault();
    const svc = ALL_SERVICES.find((s) => s.id === newServiceId) || ALL_SERVICES[0];

    const result = createAppointment(appointments, {
      customerName: newCustomerName,
      phone: newCustomerPhone,
      serviceName: svc.name,
      date: selectedDate,
      time: newSlotTime,
      beauticianName: newBeautician
    });

    if (result.success && result.appointment) {
      setAppointments((prev) => [result.appointment!, ...prev]);
      setActionNotice(`Successfully booked ${result.appointment.id} for ${newCustomerName}!`);
      setIsManualBookingOpen(false);
      setNewCustomerName('');
      setNewCustomerPhone('');
      setTimeout(() => setActionNotice(null), 4000);
    } else {
      setActionNotice(result.message);
    }
  };

  const handleCancel = (bookingId: string) => {
    const res = cancelAppointment(appointments, bookingId);
    if (res.success) {
      setAppointments(res.updatedBookings);
      setActionNotice(`Appointment ${bookingId} has been cancelled.`);
      setTimeout(() => setActionNotice(null), 4000);
    } else {
      setActionNotice(res.message);
    }
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget) return;

    const res = rescheduleAppointment(
      appointments,
      rescheduleTarget.id,
      newRescheduleDate,
      newRescheduleTime
    );

    if (res.success) {
      setAppointments(res.updatedBookings);
      setActionNotice(res.message);
      setRescheduleTarget(null);
      setTimeout(() => setActionNotice(null), 4000);
    } else {
      setActionNotice(res.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
      {/* Action Notice banner */}
      {actionNotice && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-center justify-between">
          <span>{actionNotice}</span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-amber-700 hover:text-amber-900 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header controls & date picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-serif-luxury font-bold text-stone-900">
            Salon Calendar & Live Bookings
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Real-time synchronization with Bella AI Receptionist calls · Opening hours: 10:00 AM – 9:00 PM
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-200 text-sm">
            <CalendarIcon className="w-4 h-4 text-rose-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-stone-800 bg-transparent focus:outline-none text-xs sm:text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsManualBookingOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* Day Slot Timeline Grid (10 AM to 8 PM with 2 PM Lunch Break indicator) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 mb-8 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-600" />
            <span>Daily Schedule Timeline ({selectedDate})</span>
          </h3>
          <span className="text-xs text-stone-500">
            {dayAppointments.length} slot(s) currently reserved
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* 10 AM to 1 PM slots */}
          {AVAILABLE_SLOTS.slice(0, 4).map((slot) => {
            const bookedInSlot = dayAppointments.filter((a) => a.time === slot);
            const isFull = bookedInSlot.length >= 2;
            return (
              <div
                key={slot}
                className={`p-3 rounded-xl border text-xs flex flex-col justify-between min-h-[90px] transition-all ${
                  isFull
                    ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                    : bookedInSlot.length > 0
                    ? 'bg-amber-50/60 border-amber-200 text-stone-800'
                    : 'bg-stone-50/50 border-stone-200 text-stone-600'
                }`}
              >
                <div className="flex items-center justify-between font-medium">
                  <span>{slot}</span>
                  <span className="text-[10px] text-stone-400">
                    {bookedInSlot.length}/2 booked
                  </span>
                </div>
                {bookedInSlot.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {bookedInSlot.map((b) => (
                      <div key={b.id} className="text-[11px] truncate">
                        <span className="font-semibold text-stone-900">{b.customerName}</span>
                        <span className="text-stone-500"> ({b.serviceName})</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-emerald-700 text-[11px] mt-2 font-medium">Available</span>
                )}
              </div>
            );
          })}

          {/* 2:00 PM - 3:00 PM Lunch Break (Strictly Locked) */}
          <div className="p-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 text-xs flex flex-col justify-between min-h-[90px]">
            <div className="flex items-center justify-between font-medium text-stone-700">
              <span>2:00 PM</span>
              <Lock className="w-3.5 h-3.5 text-stone-400" />
            </div>
            <div className="text-[11px] text-stone-600 font-medium">
              Lunch Break
              <p className="text-[10px] text-stone-400 font-normal">Closed for staff</p>
            </div>
            <span className="text-[10px] text-stone-400">2:00 – 3:00 PM</span>
          </div>

          {/* 3 PM to 8 PM slots */}
          {AVAILABLE_SLOTS.slice(4).map((slot) => {
            const bookedInSlot = dayAppointments.filter((a) => a.time === slot);
            const isFull = bookedInSlot.length >= 2;
            return (
              <div
                key={slot}
                className={`p-3 rounded-xl border text-xs flex flex-col justify-between min-h-[90px] transition-all ${
                  isFull
                    ? 'bg-rose-50/60 border-rose-200 text-rose-950'
                    : bookedInSlot.length > 0
                    ? 'bg-amber-50/60 border-amber-200 text-stone-800'
                    : 'bg-stone-50/50 border-stone-200 text-stone-600'
                }`}
              >
                <div className="flex items-center justify-between font-medium">
                  <span>{slot}</span>
                  <span className="text-[10px] text-stone-400">
                    {bookedInSlot.length}/2 booked
                  </span>
                </div>
                {bookedInSlot.length > 0 ? (
                  <div className="mt-1 space-y-1">
                    {bookedInSlot.map((b) => (
                      <div key={b.id} className="text-[11px] truncate">
                        <span className="font-semibold text-stone-900">{b.customerName}</span>
                        <span className="text-stone-500"> ({b.serviceName})</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-emerald-700 text-[11px] mt-2 font-medium">Available</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client, ID, or phone..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Filter by specialist */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Specialists</option>
            {STAFF_MEMBERS.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name} ({s.role})
              </option>
            ))}
          </select>

          {/* Filter by status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-medium">
              <tr>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Service & Price</th>
                <th className="py-3 px-4">Date & Slot</th>
                <th className="py-3 px-4">Specialist</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No appointments found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-stone-900">
                      {app.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">{app.customerName}</div>
                      <div className="text-stone-400 text-xs flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{app.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-stone-900 font-medium">{app.serviceName}</div>
                      <div className="text-rose-700 font-semibold text-xs mt-0.5">
                        Rs. {app.price.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-stone-800">{app.date}</div>
                      <div className="text-stone-500 text-xs flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-stone-400" />
                        <span>{app.time}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-stone-800">{app.beauticianName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {/* Zero-pill clean text metadata per design constitution */}
                      <span
                        className={`font-medium ${
                          app.status === 'confirmed'
                            ? 'text-emerald-700'
                            : app.status === 'rescheduled'
                            ? 'text-amber-700'
                            : 'text-rose-700 line-through'
                        }`}
                      >
                        {app.status === 'confirmed'
                          ? '● Confirmed'
                          : app.status === 'rescheduled'
                          ? '● Rescheduled'
                          : '● Cancelled'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenBookingSlip(app)}
                          className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors cursor-pointer"
                          title="View Digital Receipt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {app.status !== 'cancelled' && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setRescheduleTarget(app);
                                setNewRescheduleDate(app.date);
                                setNewRescheduleTime(app.time);
                              }}
                              className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                              title="Reschedule Appointment"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCancel(app.id)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                              title="Cancel Appointment (4h policy applies)"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Booking Modal */}
      {isManualBookingOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-serif-luxury font-bold text-stone-900 mb-1">
              Add New Appointment
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Direct booking entry for Glamora Beauty Salon desk
            </p>

            <form onSubmit={handleManualBook} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="e.g. Fatima Noor"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="e.g. 03001234567"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Select Service</label>
                <select
                  value={newServiceId}
                  onChange={(e) => setNewServiceId(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  {ALL_SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.priceDisplay})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Slot</label>
                  <select
                    value={newSlotTime}
                    onChange={(e) => setNewSlotTime(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    {AVAILABLE_SLOTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Preferred Specialist</label>
                <select
                  value={newBeautician}
                  onChange={(e) => setNewBeautician(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  {STAFF_MEMBERS.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name} – {st.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsManualBookingOpen(false)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium cursor-pointer"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-serif-luxury font-bold text-stone-900 mb-1">
              Reschedule Appointment {rescheduleTarget.id}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Current: {rescheduleTarget.customerName} · {rescheduleTarget.serviceName} on {rescheduleTarget.date} at {rescheduleTarget.time}
            </p>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Select New Date</label>
                <input
                  type="date"
                  required
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Select New Time Slot</label>
                <select
                  value={newRescheduleTime}
                  onChange={(e) => setNewRescheduleTime(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  {AVAILABLE_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Note: 2:00 PM to 3:00 PM is reserved for staff lunch break.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setRescheduleTarget(null)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium cursor-pointer"
                >
                  Save Rescheduled Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
