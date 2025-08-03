import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, User, ArrowLeft, Edit } from 'lucide-react';
import { useEvent } from '../hooks/useEvents';
import { useAuth } from '../contexts/AuthContext';
import { EventComments } from '../components/Events/EventComments';
import { RSVPButton } from '../components/Events/RSVPButton';
import { format, parseISO } from 'date-fns';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { event, loading, error } = useEvent(id!);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-64 bg-gray-300 rounded mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">Error loading event</p>
          <p className="text-red-600 text-sm mt-1">{error || 'Event not found'}</p>
          <Link 
            to="/events" 
            className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = parseISO(event.date);
  const isOrganizer = user?.id === event.organizer_id;
  const canModerate = isOrganizer || user?.role === 'organizer';
  const userRSVP = event.rsvps?.find(rsvp => rsvp.user?.id === user?.id);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back Navigation */}
      <Link 
        to="/events" 
        className="inline-flex items-center text-blue-600 hover:text-blue-500 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Events
      </Link>

      {/* Event Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {event.image_url && (
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-64 object-cover"
          />
        )}
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryStyles(event.category)}`}>
                {event.category}
              </span>
            </div>
            {isOrganizer && (
              <Link
                to={`/events/${event.id}/edit`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-medium">{format(eventDate, 'EEEE, MMMM dd, yyyy')}</div>
                  <div className="text-sm">{event.time}</div>
                </div>
              </div>
              
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-3" />
                <span>{event.location}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-3" />
                <span>
                  {event.rsvp_count || 0} attending
                  {event.max_attendees && ` / ${event.max_attendees} max`}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {event.organizer?.avatar_url ? (
                <img 
                  src={event.organizer.avatar_url} 
                  alt={event.organizer.full_name || 'Organizer'}
                  className="h-12 w-12 rounded-full"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Organized by</p>
                <p className="font-medium text-gray-900">
                  {event.organizer?.full_name || 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">About this event</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>
        </div>
      </div>

      {/* RSVP Section */}
      <RSVPButton 
        eventId={event.id} 
        currentRSVP={userRSVP} 
        eventDate={event.date}
      />

      {/* Attendees */}
      {event.rsvps && event.rsvps.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Attendees ({event.rsvps.filter(rsvp => rsvp.status === 'attending').length})
          </h3>
          <div className="flex flex-wrap gap-3">
            {event.rsvps
              .filter(rsvp => rsvp.status === 'attending')
              .map((rsvp) => (
                <div key={rsvp.id} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                  {rsvp.user?.avatar_url ? (
                    <img 
                      src={rsvp.user.avatar_url} 
                      alt={rsvp.user.full_name || 'User'}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {rsvp.user?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    {rsvp.user?.full_name || 'Unknown User'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <EventComments 
        eventId={event.id} 
        comments={event.comments || []} 
        canModerate={canModerate}
      />
    </div>
  );
};

const getCategoryStyles = (category: string) => {
  const styles: Record<string, string> = {
    'technology': 'bg-blue-100 text-blue-800',
    'business': 'bg-gray-100 text-gray-800',
    'social': 'bg-pink-100 text-pink-800',
    'education': 'bg-green-100 text-green-800',
    'sports': 'bg-orange-100 text-orange-800',
    'arts': 'bg-purple-100 text-purple-800',
    'food': 'bg-yellow-100 text-yellow-800',
    'music': 'bg-red-100 text-red-800',
  };
  
  return styles[category.toLowerCase()] || 'bg-gray-100 text-gray-800';
};