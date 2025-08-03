import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Event, SearchFilters } from '../types';

export const useEvents = (filters?: SearchFilters) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setEvents(prev => [payload.new as Event, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setEvents(prev => prev.map(event => 
            event.id === payload.new.id ? payload.new as Event : event
          ));
        } else if (payload.eventType === 'DELETE') {
          setEvents(prev => prev.filter(event => event.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('events')
        .select(`
          *,
          organizer:users(id, full_name, avatar_url),
          rsvps:event_rsvps(count)
        `)
        .order('date', { ascending: true });

      if (filters?.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.date) {
        query = query.gte('date', filters.date);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const eventsWithCounts = data?.map(event => ({
        ...event,
        rsvp_count: event.rsvps?.[0]?.count || 0
      })) || [];

      if (filters?.sortBy === 'popularity') {
        eventsWithCounts.sort((a, b) => (b.rsvp_count || 0) - (a.rsvp_count || 0));
      }

      setEvents(eventsWithCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  return { events, loading, error, refetch: fetchEvents };
};

export const useEvent = (eventId: string) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    fetchEvent();

    // Set up real-time subscription for this specific event
    const subscription = supabase
      .channel(`event-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_comments', filter: `event_id=eq.${eventId}` }, () => {
        fetchEvent(); // Refetch to get updated comments
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_rsvps', filter: `event_id=eq.${eventId}` }, () => {
        fetchEvent(); // Refetch to get updated RSVPs
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:users(id, full_name, avatar_url, role),
          comments:event_comments(
            id,
            content,
            created_at,
            user:users(id, full_name, avatar_url)
          ),
          rsvps:event_rsvps(
            id,
            status,
            user:users(id, full_name, avatar_url)
          )
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event');
    } finally {
      setLoading(false);
    }
  };

  return { event, loading, error, refetch: fetchEvent };
};