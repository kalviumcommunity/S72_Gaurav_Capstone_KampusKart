import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { token } = useAuth();
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm flex items-center justify-between px-8 py-4">
      {/* Left-aligned content */}
      <div className="flex items-center">
        {token && (
          <Link to="/home" className="px-5 py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base">Home</Link>
        )}
      </div>
      {/* Centered branding */}
      <div className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
        <img src='/Logo.png' alt='KampusKart Logo' className='h-10 w-10 object-contain' style={{ background: 'none', border: 'none', borderRadius: 0, boxShadow: 'none' }} />
        <span className='text-xl font-extrabold text-black font-sans' style={{ fontFamily: 'Work Sans, sans-serif' }}>Kampuskart</span>
      </div>
      {/* Right-aligned buttons */}
      <div className="flex gap-2">
        {!token && (
          <>
            {location.pathname !== '/login' && (
              <Link to="/login" className="px-5 py-2 rounded-full font-bold text-black bg-white border border-[#E0E0E0] hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base">Login</Link>
            )}
            {location.pathname !== '/signup' && (
              <Link to="/signup" className="px-5 py-2 rounded-full font-bold text-white bg-[#181818] hover:bg-[#00C6A7] hover:text-white transition-colors duration-200 text-base">Sign up</Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 