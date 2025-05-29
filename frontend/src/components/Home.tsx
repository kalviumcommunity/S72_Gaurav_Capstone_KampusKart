import React from 'react';
import Navbar from './Navbar';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <h1 className="text-h1 font-extrabold text-black">Welcome Home!</h1>
      </main>
    </div>
  );
};

export default Home; 