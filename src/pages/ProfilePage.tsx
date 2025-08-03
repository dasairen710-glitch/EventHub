import React from 'react';
import { ProfileForm } from '../components/Profile/ProfileForm';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800 font-medium">Authentication Required</p>
          <p className="text-yellow-700 text-sm mt-1">
            Please{' '}
            <Link to="/auth/signin" className="underline">sign in</Link>
            {' '}to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Profile</h1>
        <p className="text-lg text-gray-600">
          Manage your profile information and preferences
        </p>
      </div>

      <ProfileForm />
    </div>
  );
};