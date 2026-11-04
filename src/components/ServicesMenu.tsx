import React, { useState } from 'react';
import { Search, Phone, Sparkles, Clock, Check } from 'lucide-react';
import { ALL_SERVICES, CATEGORIES, ServiceCategory, SalonService } from '../utils/salonData';

interface ServicesMenuProps {
  onSelectServiceToBook: (service: SalonService) => void;
}

export const ServicesMenu: React.FC<ServicesMenuProps> = ({ onSelectServiceToBook }) => {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = ALL_SERVICES.filter((svc) => {
    if (selectedCategory !== 'all' && svc.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        svc.name.toLowerCase().includes(q) ||
        svc.description.toLowerCase().includes(q) ||
        svc.priceDisplay.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
      {/* Title & Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-rose-600 font-semibold">
            Glamora Beauty Salon · Gulberg III, Lahore
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 mt-1">
            Complete Services & Price Catalog
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            All prices are in Pakistani Rupees (PKR). Transparent pricing with advance booking recommended.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hair, facial, bridal..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Category Segmented Controls */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6" aria-label="Service Category Filters">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          All Categories ({ALL_SERVICES.length})
        </button>

        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <span>{cat.title}</span>
          </button>
        ))}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl border border-stone-200 p-5 flex flex-col justify-between hover:border-rose-300 hover:shadow-md transition-all group"
          >
            <div>
              {/* Category indicator & duration */}
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="capitalize text-stone-500 font-medium">
                  {service.category} service
                </span>
                <span className="flex items-center gap-1 text-stone-400">
                  <Clock className="w-3 h-3" />
                  <span>{service.durationMinutes} mins</span>
                </span>
              </div>

              {/* Service Name */}
              <h3 className="font-serif-luxury text-lg font-semibold text-stone-900 group-hover:text-rose-700 transition-colors">
                {service.name}
              </h3>

              {/* Description */}
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Price & Action */}
            <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-400 block uppercase tracking-wider">
                  Price (PKR)
                </span>
                <span className="text-base sm:text-lg font-bold text-stone-900">
                  {service.priceDisplay}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onSelectServiceToBook(service)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <Phone className="w-3 h-3" />
                <span>Ask Bella to Book</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
