/*
# Initial Database Schema for Community Events Platform

## Overview
This migration creates the foundational database schema for a community events platform with advanced social features.

## 1. New Tables

### users
Extended user profiles with social features:
- `id` (uuid, primary key) - Links to auth.users
- `email` (text, unique) - User email address
- `full_name` (text) - User's display name
- `avatar_url` (text) - Profile picture URL
- `bio` (text) - User biography
- `skills` (text array) - User skills/expertise
- `interests` (text array) - User interests
- `role` (enum) - Either 'organizer' or 'participant'
- Timestamps for created_at and updated_at

### events
Core events table:
- `id` (uuid, primary key)
- `title` (text) - Event name
- `description` (text) - Event details
- `date` (date) - Event date
- `time` (text) - Event time
- `location` (text) - Event location
- `category` (text) - Event category
- `max_attendees` (integer, optional) - Maximum capacity
- `image_url` (text, optional) - Event banner image
- `organizer_id` (uuid, foreign key) - References users table
- Timestamps for created_at and updated_at

### event_rsvps
RSVP tracking system:
- `id` (uuid, primary key)
- `event_id` (uuid, foreign key) - References events table
- `user_id` (uuid, foreign key) - References users table
- `status` (enum) - 'attending', 'maybe', or 'not_attending'
- `created_at` (timestamp)
- Unique constraint on (event_id, user_id)

### event_comments
Real-time commenting system:
- `id` (uuid, primary key)
- `event_id` (uuid, foreign key) - References events table
- `user_id` (uuid, foreign key) - References users table
- `content` (text) - Comment content
- Timestamps for created_at and updated_at

## 2. Security
- Row Level Security (RLS) enabled on all tables
- Comprehensive policies for authenticated users
- Role-based access controls for organizers

## 3. Features Enabled
- Real-time subscriptions for live updates
- User authentication and profiles
- Event management and RSVPs
- Comment system with moderation
- Role-based permissions
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('organizer', 'participant');
CREATE TYPE rsvp_status AS ENUM ('attending', 'maybe', 'not_attending');

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  avatar_url text,
  bio text DEFAULT '',
  skills text[] DEFAULT '{}',
  interests text[] DEFAULT '{}',
  role user_role DEFAULT 'participant',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  max_attendees integer,
  image_url text,
  organizer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Event RSVPs table
CREATE TABLE IF NOT EXISTS event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status rsvp_status NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Event comments table
CREATE TABLE IF NOT EXISTS event_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Events policies
CREATE POLICY "Anyone can read events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their events"
  ON events FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their events"
  ON events FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- Event RSVPs policies
CREATE POLICY "Anyone can read RSVPs"
  ON event_rsvps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own RSVPs"
  ON event_rsvps FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Event comments policies
CREATE POLICY "Anyone can read comments"
  ON event_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON event_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON event_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments or organizers can moderate"
  ON event_comments FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT organizer_id FROM events WHERE id = event_id
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON event_rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_event ON event_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_user ON event_comments(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_event_comments_updated_at
  BEFORE UPDATE ON event_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();