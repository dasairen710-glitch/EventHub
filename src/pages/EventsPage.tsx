import React, { useState } from 'react';
import { SearchFiltersComponent } from '../components/Events/SearchFilters';
import { EventList } from '../components/Events/EventList';
import { useEvents } from '../hooks/useEvents';
import { SearchFilters } from '../types';

export const EventsPage: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({});
  const { events, loading, error } = useEvents(filters);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Community Events</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover and join amazing events happening in your community. Connect with like-minded people and make lasting memories.
        </p>
      </div>

      <SearchFiltersComponent filters={filters} onFiltersChange={setFilters} />
      
      <EventList events={events} loading={loading} error={error} />
    </div>
  );
};