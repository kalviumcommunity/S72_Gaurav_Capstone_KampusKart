import React from 'react';

const Header: React.FC = () => (
  <header className="w-full bg-white shadow-sm border-b border-deep-purple-100">
    <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
      <img src="/Logo.png" alt="KampusKart Logo" className="h-10 w-10 rounded-full shadow" />
      <span className="text-2xl font-bold text-deep-purple-700 tracking-tight">KampusKart</span>
    </div>
  </header>
);

export default Header; 