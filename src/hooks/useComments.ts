import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export const useComments = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const addComment = async (eventId: string, content: string) => {
    if (!user) {
      toast.error('Please sign in to comment');
      return { error: new Error('Not authenticated') };
    }

    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return { error: new Error('Empty content') };
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_comments')
        .insert({
          event_id: eventId,
          user_id: user.id,
          content: content.trim(),
        })
        .select(`
          id,
          content,
          created_at,
          user:users(id, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;

      toast.success('Comment added');
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add comment');
      toast.error(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    setLoading(true);
    try {
      const { error } = await supabase
        .from('event_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Comment deleted');
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete comment');
      toast.error(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return { addComment, deleteComment, loading };
};