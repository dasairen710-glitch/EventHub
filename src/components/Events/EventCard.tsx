import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, User } from 'lucide-react';
import { Event } from '../../types';
import { format, parseISO } from 'date-fns';

interface EventCardProps {
  event: Event;
  showActions?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, showActions = false }) => {
  const eventDate = parseISO(event.date);
  
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {event.image_url && (
        <img 
          src={event.image_url} 
          alt={event.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {event.title}
          </h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryStyles(event.category)}`}>
            {event.category}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{event.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            {format(eventDate, 'MMM dd, yyyy')}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="h-4 w-4 mr-2" />
            {event.time}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-2" />
            {event.location}
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-4 w-4 mr-2" />
            {event.rsvp_count || 0} attending
            {event.max_attendees && ` / ${event.max_attendees} max`}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {event.organizer?.avatar_url ? (
              <img 
                src={event.organizer.avatar_url} 
                alt={event.organizer.full_name}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-500" />
              </div>
            )}
            <span className="text-sm text-gray-600">
              by {event.organizer?.full_name || 'Unknown'}
            </span>
          </div>
          
          <Link 
            to={`/events/${event.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
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