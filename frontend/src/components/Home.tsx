import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SkeletonLoader from './SkeletonLoader';

const Home = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white font-sans">
        <main className="flex-1 container mx-auto px-12 py-8 pt-24">
          <SkeletonLoader variant="home" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <main className="flex-1 container mx-auto px-4 py-8 pt-[100px]">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center min-h-[50vh] pt-8 pb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-center text-black mb-4 leading-tight" style={{ fontWeight: 900, letterSpacing: '-0.02em', lineHeight: '1.05' }}>
            Welcome to <span className="text-[#00C6A7]">KampusKart</span>!
          </h1>
          <p className="text-lg text-center text-gray-600 mb-8 max-w-2xl">
            Your all-in-one platform for campus life. Discover features, connect with your peers, and make the most of your university experience.
          </p>
        </section>

        {/* Features Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-black mb-6 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition">
              <div className="w-16 h-16 rounded-full bg-[#FFD166] flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-[#181818]">🔍</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Lost & Found</h3>
              <p className="text-gray-500 text-center">Report and find lost items easily within your campus community.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition">
              <div className="w-16 h-16 rounded-full bg-[#EB5CAF] flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-white">💬</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Chat</h3>
              <p className="text-gray-500 text-center">Connect and communicate with friends and groups in real time.</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition">
              <div className="w-16 h-16 rounded-full bg-[#00C6A7] flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-white">🗺️</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Campus Map</h3>
              <p className="text-gray-500 text-center">Navigate your campus with ease and discover key locations.</p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-6 text-center">KampusKart at a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-[#FFD166] mb-2">🎓</span>
              <div className="text-2xl font-bold text-black">10,000+</div>
              <div className="text-gray-500">Students</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-[#EB5CAF] mb-2">🏫</span>
              <div className="text-2xl font-bold text-black">50+</div>
              <div className="text-gray-500">Departments</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-[#00C6A7] mb-2">📍</span>
              <div className="text-2xl font-bold text-black">100+</div>
              <div className="text-gray-500">Campus Locations</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-[#181818] mb-2">⭐</span>
              <div className="text-2xl font-bold text-black">4.8/5</div>
              <div className="text-gray-500">User Rating</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home; 