import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon, PhoneIcon, MapPinIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const accent = 'from-deep-purple-500 to-hot-pink-500';
const accentText = 'text-deep-purple-600';
const accentBtn = 'bg-gradient-to-r from-deep-purple-500 to-hot-pink-500';
const accentBtnHover = 'hover:from-hot-pink-500 hover:to-deep-purple-500';
const accentFocus = 'focus:ring-deep-purple-400';

function getInitials(name: string) {
  return name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '';
}

const Dashboard: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await updateProfile(formData);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-deep-purple-50 font-sans">
      <nav className="bg-white shadow-sm border-b border-deep-purple-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center justify-center gap-3 w-full">
              <img src="/Logo.png" alt="KampusKart Logo" className="w-10 h-10 rounded-lg" />
              <span className="text-2xl font-extrabold text-deep-purple-700 tracking-tight">KAMPUSKART</span>
            </div>
            <button
              onClick={handleLogout}
              className={`ml-4 px-4 py-2 rounded-full text-sm font-semibold text-white bg-deep-purple-500 hover:bg-deep-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-purple-400 transition`}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-0 mx-2 border border-deep-purple-100 overflow-hidden">
          {/* Profile Card Header */}
          <div className="flex flex-col items-center justify-center py-8 px-8 bg-gradient-to-r from-deep-purple-50 to-hot-pink-50 border-b border-deep-purple-100">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-deep-purple-500 to-hot-pink-500 flex items-center justify-center text-white font-bold text-3xl mb-2">
              {getInitials(user?.name || 'U')}
            </div>
            <div className="text-xl font-bold text-deep-purple-700 mb-1">{user?.name || 'User Name'}</div>
            <div className="flex items-center gap-1 text-deep-purple-400 text-sm">
              <EnvelopeIcon className="h-4 w-4" />
              <span>{user?.email || 'user@email.com'}</span>
            </div>
          </div>
          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-deep-purple-100 via-hot-pink-100 to-deep-purple-100" />
          {/* Editable Form */}
          <div className="py-8 px-8">
            <h2 className="text-lg font-bold mb-6 text-center text-deep-purple-700">Edit Profile</h2>
            {error && (
              <div className="mb-4 rounded-md bg-hot-pink-100 p-4 animate-fade-in">
                <div className="text-sm text-hot-pink-700">{error}</div>
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-4 animate-fade-in">
                <div className="text-sm text-green-700">{success}</div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-deep-purple-300">
                  <UserIcon className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-3 w-full border-b border-deep-purple-200 focus:border-deep-purple-500 rounded-none focus:outline-none focus:ring-0 sm:text-base text-deep-purple-700 placeholder-deep-purple-300 bg-transparent"
                  placeholder="Full Name"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-deep-purple-300">
                  <PhoneIcon className="h-5 w-5" />
                </span>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-3 w-full border-b border-deep-purple-200 focus:border-deep-purple-500 rounded-none focus:outline-none focus:ring-0 sm:text-base text-deep-purple-700 placeholder-deep-purple-300 bg-transparent"
                  placeholder="Phone Number"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-deep-purple-300">
                  <MapPinIcon className="h-5 w-5" />
                </span>
                <textarea
                  name="address"
                  id="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="pl-10 pr-3 py-3 w-full border-b border-deep-purple-200 focus:border-deep-purple-500 rounded-none focus:outline-none focus:ring-0 sm:text-base text-deep-purple-700 placeholder-deep-purple-300 bg-transparent"
                  placeholder="Address"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 rounded-full text-lg font-semibold text-white bg-deep-purple-500 shadow-lg hover:bg-deep-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-purple-400 transition`}
                style={{ boxShadow: '0 4px 24px 0 rgba(123,2,29,0.10)' }}
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                ) : null}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.5s; }
      `}</style>
    </div>
  );
};

export default Dashboard; 