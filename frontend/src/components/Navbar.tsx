import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IoIosArrowDropdown, IoIosArrowDropup } from "react-icons/io";

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);

  const handleFeaturesMouseEnter = () => {
    setIsFeaturesDropdownOpen(true);
  };

  const handleFeaturesMouseLeave = () => {
    setIsFeaturesDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left-aligned content */}
        <div className="flex items-center">
          {user && (
            <>
              <Link to="/home" className="px-5 py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base">Home</Link>
              <Link to="/campus-map" className="px-5 py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base">Campus Map</Link>
              {/* Features Dropdown */}
              <div
                className="relative group flex items-center"
                onMouseEnter={handleFeaturesMouseEnter}
                onMouseLeave={handleFeaturesMouseLeave}
              >
                <button className="px-5 py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base flex items-center">
                  Features {isFeaturesDropdownOpen ? <IoIosArrowDropup className="ml-1" /> : <IoIosArrowDropdown className="ml-1" />}
                </button>
                {isFeaturesDropdownOpen && (
                  <div className="absolute top-full left-0 bg-white shadow-lg rounded-md w-48 z-50">
                    <Link to="/lostfound" className="block px-4 py-2 text-black hover:bg-[#FFD166]">Lost and Found</Link>
                    <Link to="/complaints" className="block px-4 py-2 text-black hover:bg-[#FFD166]">Complaints</Link>
                    <Link to="/events" className="block px-4 py-2 text-black hover:bg-[#FFD166]">Events</Link>
                    <Link to="/news" className="block px-4 py-2 text-black hover:bg-[#FFD166]">News</Link>
                    <Link to="/facilities" className="block px-4 py-2 text-black hover:bg-[#FFD166]">Facilities</Link>
                    {/* Add other feature links here */}
                  </div>
                )}
              </div>
              <Link to="/chat" className="px-5 py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base">Chat</Link>
            </>
          )}
        </div>
        {/* Centered branding */}
        <div className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
          <img src='/Logo.png' alt='KampusKart Logo' className='h-10 w-10 object-contain' style={{ background: 'none', border: 'none', borderRadius: 0, boxShadow: 'none' }} />
          <span className='text-xl font-extrabold text-black font-sans' style={{ fontFamily: 'Work Sans, sans-serif' }}>Kampuskart</span>
        </div>
        {/* Right-aligned buttons */}
        <div className="flex gap-2">
          {!user && (
            <>
              {location.pathname !== '/login' && (
                <Link to="/login" className="px-5 py-2 rounded-full font-bold text-black bg-white border border-[#E0E0E0] hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base">Login</Link>
              )}
              {location.pathname !== '/signup' && (
                <Link to="/signup" className="px-5 py-2 rounded-full font-bold text-white bg-[#181818] hover:bg-[#00C6A7] hover:text-white transition-colors duration-200 text-base">Sign up</Link>
              )}
            </>
          )}
          {user && (
            <>
              <Link to="/profile" className="px-5 py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base">Profile</Link>
              <button
                onClick={logout}
                className="px-5 py-2 rounded-full font-bold text-white bg-[#181818] hover:bg-[#00C6A7] hover:text-white transition-colors duration-200 text-base"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 