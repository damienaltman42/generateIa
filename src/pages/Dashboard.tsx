import React, { useEffect, useState } from 'react';
import { MarketingForm } from '../components/marketing-form';
import { Sparkles, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../lib/api';

interface User {
  name: string;
  email: string;
  company?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
    // TODO: Add API call to get user data
  }, [navigate]);

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">AI Marketing Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Bienvenue, {user?.name}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-700 hover:text-purple-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Générer du contenu</h1>
          <MarketingForm />
        </div>
      </main>
    </div>
  );
}