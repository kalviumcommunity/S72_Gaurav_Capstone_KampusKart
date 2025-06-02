import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HiMenu, HiX } from "react-icons/hi";
import { IoIosArrowDropup, IoIosArrowDropdown } from "react-icons/io";

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);
  const featuresRef = useRef<HTMLDivElement>(null);

  // Responsive isMobile state
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    // Initial check
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdowns when clicking outside features area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (featuresRef.current && !featuresRef.current.contains(event.target as Node)) {
        setIsFeaturesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [featuresRef]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsFeaturesDropdownOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
    if (isMobileMenuOpen) {
      setIsFeaturesDropdownOpen(false);
    }
  };

  const handleFeaturesButtonClick = () => {
    setIsFeaturesDropdownOpen(prev => !prev);
  };

  const NavLinks = () => (
    <>
      {user && (
        <>
          <Link to="/home" className="px-5 py-3 md:py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base w-full md:w-auto text-center">Home</Link>
          <Link to="/campus-map" className="px-5 py-3 md:py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base w-full md:w-auto text-center">Campus Map</Link>
          <div
            ref={featuresRef}
            className="relative group flex items-center w-full md:w-auto"
          >
            <button
              onClick={handleFeaturesButtonClick}
              className="px-5 py-3 md:py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base flex items-center justify-center w-full md:w-auto"
              aria-expanded={isFeaturesDropdownOpen}
              aria-controls="features-menu"
              aria-haspopup="true"
              tabIndex={0}
            >
              Features {isFeaturesDropdownOpen ? <IoIosArrowDropup className="ml-1" /> : <IoIosArrowDropdown className="ml-1" />}
            </button>
            <div
              id="features-menu"
              className={`${
                isFeaturesDropdownOpen ? 'block' : 'hidden'
              } md:absolute md:top-full md:left-0 bg-white shadow-lg rounded-md w-full md:w-48 z-[100] mt-2 md:mt-0 overflow-hidden transition-all duration-200 ease-in-out`}
              style={{ pointerEvents: isFeaturesDropdownOpen ? 'auto' : 'none' }}
            >
              <Link 
                to="/lostfound" 
                className="block px-4 py-3 md:py-2 text-black hover:bg-[#FFD166] text-center md:text-left active:bg-[#FFD166]" 
                onClick={() => setIsFeaturesDropdownOpen(false)}
              >
                Lost and Found
              </Link>
              <Link 
                to="/complaints" 
                className="block px-4 py-3 md:py-2 text-black hover:bg-[#FFD166] text-center md:text-left active:bg-[#FFD166]" 
                onClick={() => setIsFeaturesDropdownOpen(false)}
              >
                Complaints
              </Link>
              <Link 
                to="/events" 
                className="block px-4 py-3 md:py-2 text-black hover:bg-[#FFD166] text-center md:text-left active:bg-[#FFD166]" 
                onClick={() => setIsFeaturesDropdownOpen(false)}
              >
                Events
              </Link>
              <Link 
                to="/news" 
                className="block px-4 py-3 md:py-2 text-black hover:bg-[#FFD166] text-center md:text-left active:bg-[#FFD166]" 
                onClick={() => setIsFeaturesDropdownOpen(false)}
              >
                News
              </Link>
              <Link 
                to="/facilities" 
                className="block px-4 py-3 md:py-2 text-black hover:bg-[#FFD166] text-center md:text-left active:bg-[#FFD166]" 
                onClick={() => setIsFeaturesDropdownOpen(false)}
              >
                Facilities
              </Link>
            </div>
          </div>
          <Link to="/chat" className="px-5 py-3 md:py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base w-full md:w-auto text-center">Chat</Link>
        </>
      )}
    </>
  );

  const AuthButtons = () => (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
      {!user && (
        <>
          {location.pathname !== '/login' && (
            <Link to="/login" className="px-5 py-3 md:py-2 rounded-full font-bold text-black bg-white border border-[#E0E0E0] hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base w-full md:w-auto text-center">Login</Link>
          )}
          {location.pathname !== '/signup' && (
            <Link to="/signup" className="px-5 py-3 md:py-2 rounded-full font-bold text-white bg-[#181818] hover:bg-[#00C6A7] hover:text-white transition-colors duration-200 text-base w-full md:w-auto text-center">Sign up</Link>
          )}
        </>
      )}
      {user && (
        <>
          <Link to="/profile" className="px-5 py-3 md:py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base w-full md:w-auto text-center">Profile</Link>
          <button
            onClick={logout}
            className="px-5 py-3 md:py-2 rounded-full font-bold text-white bg-[#181818] hover:bg-[#00C6A7] hover:text-white transition-colors duration-200 text-base w-full md:w-auto"
          >
            Logout
          </button>
        </>
      )}
    </div>
  );

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 py-3">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex items-center">
            <NavLinks />
          </div>
          <div className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
            <img src='/Logo.png' alt='KampusKart Logo' className='h-10 w-10 object-contain' style={{ background: 'none', border: 'none', borderRadius: 0, boxShadow: 'none' }} />
            <span className='text-xl font-extrabold text-black font-sans' style={{ fontFamily: 'Work Sans, sans-serif' }}>Kampuskart</span>
          </div>
          <AuthButtons />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src='/Logo.png' alt='KampusKart Logo' className='h-8 w-8 object-contain' style={{ background: 'none', border: 'none', borderRadius: 0, boxShadow: 'none' }} />
            <span className='text-lg font-extrabold text-black font-sans' style={{ fontFamily: 'Work Sans, sans-serif' }}>Kampuskart</span>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none transition-colors duration-200"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <HiX className="h-6 w-6 text-gray-600" />
            ) : (
              <HiMenu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden absolute top-full left-0 w-full bg-white shadow-lg transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          <div className="flex flex-col space-y-4 p-4">
            <NavLinks />
            <AuthButtons />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 