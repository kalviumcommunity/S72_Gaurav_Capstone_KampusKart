import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { HiMenu, HiX } from "react-icons/hi";
import { IoIosArrowDropup, IoIosArrowDropdown } from "react-icons/io";
import { FaComments } from "react-icons/fa";
import { AuthContextType } from '../contexts/AuthContext';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import ChatIcon from '@mui/icons-material/Chat';
import StarIcon from '@mui/icons-material/Star';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

// Refactored NavLinks Component
interface NavLinksProps {
  user: AuthContextType['user'];
  location: ReturnType<typeof useLocation>;
  isFeaturesDropdownOpen: boolean;
  setIsFeaturesDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleFeaturesButtonClick: () => void;
  handleFeaturesAreaMouseEnter: () => void;
  handleFeaturesAreaMouseLeave: () => void;
  featuresRef: React.RefObject<HTMLDivElement | null>;
}

const NavLinks: React.FC<NavLinksProps> = ({
  user,
  location,
  isFeaturesDropdownOpen,
  setIsFeaturesDropdownOpen,
  handleFeaturesButtonClick,
  handleFeaturesAreaMouseEnter,
  handleFeaturesAreaMouseLeave,
  featuresRef,
}) => (
  <>
    {user && (
      <>
        <Link to="/home" className="px-1.5 lg:px-2 xl:px-3 py-1 lg:py-1.5 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-xs lg:text-sm xl:text-base whitespace-nowrap flex items-center justify-center min-w-0">
          <HomeIcon sx={{ mr: 0.5, fontSize: '0.75rem', lg: { fontSize: '0.875rem' } }} />
          <span className="hidden lg:inline">Home</span>
        </Link>
        <Link to="/campus-map" className="px-1.5 lg:px-2 xl:px-3 py-1 lg:py-1.5 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-xs lg:text-sm xl:text-base whitespace-nowrap flex items-center justify-center min-w-0">
          <MapIcon sx={{ mr: 0.5, fontSize: '0.75rem', lg: { fontSize: '0.875rem' } }} />
          <span className="hidden lg:inline">Campus Map</span>
        </Link>
        <Link to="/chat" className="px-1.5 lg:px-2 xl:px-3 py-1 lg:py-1.5 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-xs lg:text-sm xl:text-base whitespace-nowrap flex items-center justify-center min-w-0">
          <ChatIcon sx={{ mr: 0.5, fontSize: '0.75rem', lg: { fontSize: '0.875rem' } }} />
          <span className="hidden lg:inline">Chat</span>
        </Link>
        {/* Desktop Features Dropdown */}
        <div className="hidden md:block">
          <div
            ref={featuresRef}
            className="relative group flex items-center"
            onMouseEnter={handleFeaturesAreaMouseEnter}
            onMouseLeave={handleFeaturesAreaMouseLeave}
          >
            <button
              id="features-button"
              onClick={handleFeaturesButtonClick}
              className="px-1.5 lg:px-2 xl:px-3 py-1 lg:py-1.5 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-xs lg:text-sm xl:text-base whitespace-nowrap flex items-center justify-center min-w-0"
              aria-expanded={isFeaturesDropdownOpen}
              aria-controls="features-menu"
              aria-haspopup="true"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsFeaturesDropdownOpen((prev) => !prev);
                } else if (e.key === 'Escape') {
                  setIsFeaturesDropdownOpen(false);
                }
              }}
            >
              <StarIcon sx={{ mr: 0.5, fontSize: '0.75rem', lg: { fontSize: '0.875rem' } }} />
              <span className="hidden lg:inline">Features</span> {isFeaturesDropdownOpen ? <IoIosArrowDropup className="ml-0.5" /> : <IoIosArrowDropdown className="ml-0.5" />}
            </button>
            <div
              id="features-menu"
              className={`${isFeaturesDropdownOpen ? 'block' : 'hidden'} md:absolute md:top-full md:left-0 bg-white shadow-lg rounded-md w-full md:w-48 z-[100] mt-2 md:mt-0 overflow-hidden transition-all duration-200 ease-in-out`}
              style={{ pointerEvents: isFeaturesDropdownOpen ? 'auto' : 'none' }}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="features-button"
            >
              <Link to="/lostfound" className="block px-4 py-3 md:py-2 text-black hover:bg-[#FFD166] text-center md:text-left" onClick={() => setIsFeaturesDropdownOpen(false)} role="menuitem" tabIndex={-1}>Lost and Found</Link>
              <Link to="/complaints" className="block px-4 py-3 md:py-2 text-black hover:bg-[#FFD166] text-center md:text-left" onClick={() => setIsFeaturesDropdownOpen(false)} role="menuitem" tabIndex={-1}>Complaints</Link>
              <Link to="/events" className="block px-4 py-3 md:py-2 text-black hover:bg-[#FFD166] text-center md:text-left" onClick={() => setIsFeaturesDropdownOpen(false)} role="menuitem" tabIndex={-1}>Events</Link>
              <Link to="/clubs-recruitment" className="block px-4 py-3 md:py-2 text-black hover:bg-[#FFD166] text-center md:text-left" onClick={() => setIsFeaturesDropdownOpen(false)} role="menuitem" tabIndex={-1}>Clubs Recruitment</Link>
              <Link to="/news" className="block px-4 py-3 md:py-2 text-black hover:bg-[#FFD166] text-center md:text-left" onClick={() => setIsFeaturesDropdownOpen(false)} role="menuitem" tabIndex={-1}>News</Link>
              <Link to="/facilities" className="block px-4 py-3 md:py-2 text-black hover:bg-[#FFD166] text-center md:text-left" onClick={() => setIsFeaturesDropdownOpen(false)} role="menuitem" tabIndex={-1}>Facilities</Link>
            </div>
          </div>
        </div>
      </>
    )}
  </>
);

// Refactored AuthButtons Component
interface AuthButtonsProps {
  user: AuthContextType['user'];
  location: ReturnType<typeof useLocation>;
  logout: () => void;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ user, location, logout }) => (
  <div className="flex flex-col md:flex-row gap-1 lg:gap-2 w-full md:w-auto">
    {!user && (
      <>
        {location.pathname !== '/login' && (
          <Link to="/login" className="px-4 py-4 md:px-1.5 md:py-1 lg:px-2 xl:px-3 lg:py-1.5 rounded-full font-bold text-black bg-white border border-[#E0E0E0] hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-lg md:text-xs lg:text-sm xl:text-base whitespace-nowrap w-full md:w-auto text-center min-w-0">Login</Link>
        )}
        {location.pathname !== '/signup' && (
          <Link to="/signup" className="px-4 py-4 md:px-1.5 md:py-1 lg:px-2 xl:px-3 lg:py-1.5 rounded-full font-bold text-white bg-[#181818] hover:bg-[#00C6A7] hover:text-white transition-colors duration-200 text-lg md:text-xs lg:text-sm xl:text-base whitespace-nowrap w-full md:w-auto text-center min-w-0">Sign up</Link>
        )}
      </>
    )}
    {user && (
      <>
        <Link to="/profile" className="px-4 py-4 md:px-1.5 md:py-1 lg:px-2 xl:px-3 lg:py-1.5 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-lg md:text-xs lg:text-sm xl:text-base whitespace-nowrap w-full md:w-auto text-center flex items-center justify-center min-w-0">
          <AccountCircleIcon sx={{ mr: 2, fontSize: '1.25rem', '@media (min-width: 768px)': { mr: 0.5, fontSize: '0.75rem' }, '@media (min-width: 1024px)': { fontSize: '0.875rem' } }} />
          <span className="md:hidden">Profile</span>
          <span className="hidden lg:inline">Profile</span>
        </Link>
        <button
          onClick={logout}
          className="px-4 py-4 md:px-1.5 md:py-1 lg:px-2 xl:px-3 lg:py-1.5 rounded-full font-bold text-white bg-[#181818] hover:bg-[#00C6A7] hover:text-white transition-colors duration-200 text-lg md:text-xs lg:text-sm xl:text-base whitespace-nowrap w-full md:w-auto flex items-center justify-center min-w-0"
        >
          <LogoutIcon sx={{ mr: 2, fontSize: '1.25rem', '@media (min-width: 768px)': { mr: 0.5, fontSize: '0.75rem' }, '@media (min-width: 1024px)': { fontSize: '0.875rem' } }} />
          <span className="md:hidden">Logout</span>
          <span className="hidden lg:inline">Logout</span>
        </button>
      </>
    )}
  </div>
);

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFeaturesDropdownOpen, setIsFeaturesDropdownOpen] = useState(false);
  const featuresRef = React.useRef<HTMLDivElement | null>(null);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsFeaturesDropdownOpen(false);
  }, [location]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('nav') && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        setIsFeaturesDropdownOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
    if (isMobileMenuOpen) {
      setIsFeaturesDropdownOpen(false);
    }
  };

  const handleFeaturesAreaMouseEnter = () => {
    // Only open dropdown on hover for desktop
    if (window.innerWidth >= 768) {
      setIsFeaturesDropdownOpen(true);
    }
  };

  const handleFeaturesAreaMouseLeave = () => {
    // Only close dropdown on hover out for desktop
    if (window.innerWidth >= 768) {
      setIsFeaturesDropdownOpen(false);
    }
  };

  const handleFeaturesButtonClick = () => {
    setIsFeaturesDropdownOpen((prev) => !prev);
  };

  const handleMobileNavClick = () => {
    setIsMobileMenuOpen(false);
    setIsFeaturesDropdownOpen(false);
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-2 sm:px-4 py-1.5 sm:py-2">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center relative min-h-[50px] max-w-full">
          {/* Left Section - Navigation Links */}
          <div className="flex items-center space-x-1 lg:space-x-2 xl:space-x-4 flex-shrink-0 min-w-0 max-w-[40%]">
            <NavLinks
              user={user}
              location={location}
              isFeaturesDropdownOpen={isFeaturesDropdownOpen}
              setIsFeaturesDropdownOpen={setIsFeaturesDropdownOpen}
              handleFeaturesButtonClick={handleFeaturesButtonClick}
              handleFeaturesAreaMouseEnter={handleFeaturesAreaMouseEnter}
              handleFeaturesAreaMouseLeave={handleFeaturesAreaMouseLeave}
              featuresRef={featuresRef}
            />
          </div>
          
          {/* Center Section - Branding */}
          <Link to="/home" className="flex items-center gap-1 lg:gap-2 absolute left-1/2 transform -translate-x-1/2 flex-shrink-0 z-10 cursor-pointer hover:opacity-80 transition-opacity duration-200">
            <img src='/Logo.png' alt='KampusKart Logo' className='h-6 w-6 lg:h-8 lg:w-8 object-contain transition-transform duration-300 hover:scale-110' style={{ background: 'none', border: 'none', borderRadius: 0, boxShadow: 'none' }} />
            <span className='text-sm lg:text-lg font-extrabold text-black font-sans whitespace-nowrap' style={{ fontFamily: 'Work Sans, sans-serif' }}>Kampuskart</span>
          </Link>
          
          {/* Right Section - Auth Buttons */}
          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0 min-w-0 max-w-[40%]">
            <AuthButtons user={user} location={location} logout={logout} />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-between items-center">
          <Link to="/home" className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity duration-200">
            <img src='/Logo.png' alt='KampusKart Logo' className='h-8 w-8 object-contain transition-transform duration-300 hover:scale-110' style={{ background: 'none', border: 'none', borderRadius: 0, boxShadow: 'none' }} />
            <span className='text-lg font-extrabold text-black font-sans' style={{ fontFamily: 'Work Sans, sans-serif' }}>Kampuskart</span>
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md bg-white hover:bg-gray-100 focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-110 shadow-none border-none mobile-touch-friendly mobile-no-hover mobile-active-feedback"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <HiX className="h-6 w-6 text-[#00C6A7]" />
            ) : (
              <HiMenu className="h-6 w-6 text-[#00C6A7]" />
            )}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed top-[60px] left-0 w-full bg-white shadow-lg z-50 transition-all duration-300 ease-in-out transform ${
            isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
          style={{
            maxHeight: isMobileMenuOpen ? 'calc(100vh - 60px)' : '0',
            overflow: 'auto'
          }}
        >
          <div className="flex flex-col space-y-3 p-4">
            {user && (
              <>
                {/* Main Navigation Links */}
                <Link 
                  to="/home" 
                  className="px-4 py-4 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-all duration-300 ease-in-out text-lg w-full text-center transform hover:scale-105 flex items-center justify-center mobile-touch-friendly mobile-no-hover mobile-active-feedback"
                  onClick={handleMobileNavClick}
                >
                  <HomeIcon sx={{ mr: 2, fontSize: '1.25rem' }} />
                  Home
                </Link>
                <Link 
                  to="/campus-map" 
                  className="px-4 py-4 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-all duration-300 ease-in-out text-lg w-full text-center transform hover:scale-105 flex items-center justify-center mobile-touch-friendly mobile-no-hover mobile-active-feedback"
                  onClick={handleMobileNavClick}
                >
                  <MapIcon sx={{ mr: 2, fontSize: '1.25rem' }} />
                  Campus Map
                </Link>
                <Link 
                  to="/chat" 
                  className="px-4 py-4 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-all duration-300 ease-in-out text-lg w-full text-center transform hover:scale-105 flex items-center justify-center mobile-touch-friendly mobile-no-hover mobile-active-feedback"
                  onClick={handleMobileNavClick}
                >
                  <ChatIcon sx={{ mr: 2, fontSize: '1.25rem' }} />
                  Chat
                </Link>

                {/* Mobile Features Section */}
                <div className="space-y-2">
                  <div className="text-base font-semibold text-gray-600 px-3 mb-3">Features</div>
                  <Link 
                    to="/lostfound" 
                    className="block px-4 py-4 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-all duration-300 ease-in-out text-lg w-full text-center transform hover:scale-105"
                    onClick={handleMobileNavClick}
                  >
                    Lost and Found
                  </Link>
                  <Link 
                    to="/complaints" 
                    className="block px-4 py-4 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-all duration-300 ease-in-out text-lg w-full text-center transform hover:scale-105"
                    onClick={handleMobileNavClick}
                  >
                    Complaints
                  </Link>
                  <Link 
                    to="/events" 
                    className="block px-4 py-4 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-all duration-300 ease-in-out text-lg w-full text-center transform hover:scale-105"
                    onClick={handleMobileNavClick}
                  >
                    Events
                  </Link>
                  <Link 
                    to="/clubs-recruitment" 
                    className="block px-4 py-4 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-all duration-300 ease-in-out text-lg w-full text-center transform hover:scale-105"
                    onClick={handleMobileNavClick}
                  >
                    Clubs Recruitment
                  </Link>
                  <Link 
                    to="/news" 
                    className="block px-4 py-4 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-all duration-300 ease-in-out text-lg w-full text-center transform hover:scale-105"
                    onClick={handleMobileNavClick}
                  >
                    News
                  </Link>
                  <Link 
                    to="/facilities" 
                    className="block px-4 py-4 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-all duration-300 ease-in-out text-lg w-full text-center transform hover:scale-105"
                    onClick={handleMobileNavClick}
                  >
                    Facilities
                  </Link>
                </div>

                {/* User Actions */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="text-base font-semibold text-gray-600 px-3 mb-3">Account</div>
                  <Link 
                    to="/profile" 
                    className="block px-4 py-4 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-all duration-300 ease-in-out text-lg w-full text-center transform hover:scale-105 flex items-center justify-center"
                    onClick={handleMobileNavClick}
                  >
                    <AccountCircleIcon sx={{ mr: 2, fontSize: '1.25rem' }} />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      handleMobileNavClick();
                    }}
                    className="w-full px-4 py-4 rounded-full font-bold text-white bg-[#181818] hover:bg-[#00C6A7] hover:text-white transition-all duration-300 ease-in-out text-lg transform hover:scale-105 flex items-center justify-center"
                  >
                    <LogoutIcon sx={{ mr: 2, fontSize: '1.25rem' }} />
                    Logout
                  </button>
                </div>
              </>
            )}
            
            {/* Show AuthButtons for unauthenticated users */}
            {!user && (
              <div className="space-y-2">
                <div className="text-base font-semibold text-gray-600 px-3 mb-3">Authentication</div>
                <AuthButtons user={user} location={location} logout={logout} />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 