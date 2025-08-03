export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  role: 'organizer' | 'participant';
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  max_attendees?: number;
  image_url?: string;
  organizer_id: string;
  organizer?: User;
  created_at: string;
  updated_at: string;
  rsvp_count?: number;
  user_rsvp?: EventRSVP;
  comments?: EventComment[];
}

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: 'attending' | 'maybe' | 'not_attending';
  created_at: string;
  user?: User;
}

export interface EventComment {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  date?: string;
  location?: string;
  sortBy?: 'date' | 'popularity' | 'created_at';
}