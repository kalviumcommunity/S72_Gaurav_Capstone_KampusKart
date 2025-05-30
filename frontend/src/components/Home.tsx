import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import SkeletonLoader from './SkeletonLoader';

const Home = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-12 py-8 pt-24">
          <SkeletonLoader variant="home" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pt-[100px]">
        <h1 className="text-h1 font-extrabold text-black">Welcome Home!</h1>
      </main>
    </div>
  );
};

export default Home; 