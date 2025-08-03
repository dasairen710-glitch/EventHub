import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useRSVP = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const rsvpToEvent = async (eventId: string, status: 'attending' | 'maybe' | 'not_attending') => {
    if (!user) {
      toast.error('Please sign in to RSVP');
      return { error: new Error('Not authenticated') };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`RSVP updated to ${status.replace('_', ' ')}`);
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to RSVP');
      toast.error(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const removeRSVP = async (eventId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    setLoading(true);
    try {
      const { error } = await supabase
        .from('event_rsvps')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('RSVP removed');
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove RSVP');
      toast.error(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return { rsvpToEvent, removeRSVP, loading };
};