import React from 'react';
import { Check, Clock, X, Users } from 'lucide-react';
import { EventRSVP } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useRSVP } from '../../hooks/useRSVP';

interface RSVPButtonProps {
  eventId: string;
  currentRSVP?: EventRSVP;
  eventDate: string;
}

export const RSVPButton: React.FC<RSVPButtonProps> = ({ eventId, currentRSVP, eventDate }) => {
  const { user } = useAuth();
  const { rsvpToEvent, removeRSVP, loading } = useRSVP();

  if (!user) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-600 mb-2">Sign in to RSVP to this event</p>
      </div>
    );
  }

  const isPastEvent = new Date(eventDate) < new Date();
  
  if (isPastEvent) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-gray-600">This event has already passed</p>
      </div>
    );
  }

  const handleRSVP = async (status: 'attending' | 'maybe' | 'not_attending') => {
    await rsvpToEvent(eventId, status);
  };

  const handleRemoveRSVP = async () => {
    await removeRSVP(eventId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Users className="h-5 w-5 mr-2" />
        RSVP Status
      </h3>

      {currentRSVP ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Your status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(currentRSVP.status)}`}>
              {getStatusIcon(currentRSVP.status)}
              {getStatusText(currentRSVP.status)}
            </span>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Change your RSVP:</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleRSVP('attending')}
                disabled={loading || currentRSVP.status === 'attending'}
                className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>Attending</span>
              </button>
              
              <button
                onClick={() => handleRSVP('maybe')}
                disabled={loading || currentRSVP.status === 'maybe'}
                className="flex items-center space-x-1 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50"
              >
                <Clock className="h-4 w-4" />
                <span>Maybe</span>
              </button>
              
              <button
                onClick={() => handleRSVP('not_attending')}
                disabled={loading || currentRSVP.status === 'not_attending'}
                className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                <span>Not Attending</span>
              </button>
            </div>
            
            <button
              onClick={handleRemoveRSVP}
              disabled={loading}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Remove RSVP
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">Will you be attending this event?</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleRSVP('attending')}
              disabled={loading}
              className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>Attending</span>
            </button>
            
            <button
              onClick={() => handleRSVP('maybe')}
              disabled={loading}
              className="flex items-center space-x-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              <Clock className="h-4 w-4" />
              <span>Maybe</span>
            </button>
            
            <button
              onClick={() => handleRSVP('not_attending')}
              disabled={loading}
              className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
              <span>Can't Attend</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const getStatusStyles = (status: string) => {
  const styles: Record<string, string> = {
    'attending': 'bg-green-100 text-green-800',
    'maybe': 'bg-yellow-100 text-yellow-800',
    'not_attending': 'bg-red-100 text-red-800',
  };
  return styles[status] || 'bg-gray-100 text-gray-800';
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, React.ReactElement> = {
    'attending': <Check className="h-4 w-4 inline mr-1" />,
    'maybe': <Clock className="h-4 w-4 inline mr-1" />,
    'not_attending': <X className="h-4 w-4 inline mr-1" />,
  };
  return icons[status] || null;
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'attending': 'Attending',
    'maybe': 'Maybe',
    'not_attending': 'Not Attending',
  };
  return texts[status] || status;
};