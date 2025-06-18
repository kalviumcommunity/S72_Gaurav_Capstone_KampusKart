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
        <Link to="/home" className="px-5 py-3 md:py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base w-full md:w-auto text-center">
          <HomeIcon sx={{ mr: 1 }} />
          Home
        </Link>
        <Link to="/campus-map" className="px-5 py-3 md:py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base w-full md:w-auto text-center">
          <MapIcon sx={{ mr: 1 }} />
          Campus Map
        </Link>
        <Link to="/chat" className="px-5 py-3 md:py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base w-full md:w-auto text-center flex items-center justify-center gap-2">
          <ChatIcon sx={{ mr: 1 }} />
          Chat
        </Link>
        {/* Desktop Features Dropdown */}
        <div className="hidden md:block">
          <div
            ref={featuresRef}
            className="relative group flex items-center w-full md:w-auto"
            onMouseEnter={handleFeaturesAreaMouseEnter}
            onMouseLeave={handleFeaturesAreaMouseLeave}
          >
            <button
              id="features-button"
              onClick={handleFeaturesButtonClick}
              className="px-5 py-3 md:py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base flex items-center justify-center w-full md:w-auto"
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
              <StarIcon sx={{ mr: 1 }} />
              Features {isFeaturesDropdownOpen ? <IoIosArrowDropup className="ml-1" /> : <IoIosArrowDropdown className="ml-1" />}
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
        {/* Mobile Features Links - Not used in mobile menu anymore, handled in main mobile menu rendering */}
        {/* <div className="md:hidden flex flex-col w-full space-y-2">
          <Link to="/lostfound" className="px-5 py-3 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base w-full text-center">Lost and Found</Link>
          <Link to="/complaints" className="px-5 py-3 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base w-full text-center">Complaints</Link>
          <Link to="/events" className="px-5 py-3 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base w-full text-center">Events</Link>
          <Link to="/news" className="px-5 py-3 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base w-full text-center">News</Link>
          <Link to="/facilities" className="px-5 py-3 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base w-full text-center">Facilities</Link>
        </div> */}

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
        <Link to="/profile" className="px-5 py-3 md:py-2 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-200 text-base w-full md:w-auto text-center">
          <AccountCircleIcon sx={{ mr: 1 }} />
          Profile
        </Link>
        <button
          onClick={logout}
          className="px-5 py-3 md:py-2 rounded-full font-bold text-white bg-[#181818] hover:bg-[#00C6A7] hover:text-white transition-colors duration-200 text-base w-full md:w-auto"
        >
          <LogoutIcon sx={{ mr: 1 }} />
          Logout
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
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleFeaturesAreaMouseEnter = () => {
    // Only open dropdown on hover for non-mobile (handled by CSS md: prefix)
    setIsFeaturesDropdownOpen(true);
  };

  const handleFeaturesAreaMouseLeave = () => {
    // Only close dropdown on hover out for non-mobile (handled by CSS md: prefix)
    setIsFeaturesDropdownOpen(false);
  };

  const handleFeaturesButtonClick = () => {
    // Toggle for both desktop (click) and mobile (click in menu)
    setIsFeaturesDropdownOpen((prev) => !prev);
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="container mx-auto px-4 py-3">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center">
          <div className="flex items-center space-x-6">
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
          <div className="flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
            <img src='/Logo.png' alt='KampusKart Logo' className='h-10 w-10 object-contain transition-transform duration-300 hover:scale-110' style={{ background: 'none', border: 'none', borderRadius: 0, boxShadow: 'none' }} />
            <span className='text-xl font-extrabold text-black font-sans' style={{ fontFamily: 'Work Sans, sans-serif' }}>Kampuskart</span>
          </div>
          <AuthButtons user={user} location={location} logout={logout} />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src='/Logo.png' alt='KampusKart Logo' className='h-8 w-8 object-contain transition-transform duration-300 hover:scale-110' style={{ background: 'none', border: 'none', borderRadius: 0, boxShadow: 'none' }} />
            <span className='text-lg font-extrabold text-black font-sans' style={{ fontFamily: 'Work Sans, sans-serif' }}>Kampuskart</span>
          </div>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none transition-all duration-300 ease-in-out transform hover:scale-110"
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

        {/* Mobile Menu */}
        <div
          className={`md:hidden fixed top-[60px] left-0 w-full bg-white shadow-lg z-[100] transition-all duration-300 ease-in-out transform ${
            isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
          style={{
            maxHeight: isMobileMenuOpen ? 'calc(100vh - 60px)' : '0',
            overflow: 'auto'
          }}
        >
          <div className="flex flex-col space-y-4 p-6">
            {user && (
              <>
                <Link 
                  to="/home" 
                  className="px-5 py-3 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-all duration-300 ease-in-out text-base w-full text-center transform hover:scale-105"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <HomeIcon sx={{ mr: 1 }} />
                  Home
                </Link>
                <Link 
                  to="/campus-map" 
                  className="px-5 py-3 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-all duration-300 ease-in-out text-base w-full text-center transform hover:scale-105"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <MapIcon sx={{ mr: 1 }} />
                  Campus Map
                </Link>
                <Link 
                  to="/chat" 
                  className="px-5 py-3 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-all duration-300 ease-in-out text-base w-full text-center transform hover:scale-105"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ChatIcon sx={{ mr: 1 }} />
                  Chat
                </Link>
                {/* Mobile Features Dropdown (simplified) */}
                <div className="w-full">
                  <button
                    onClick={handleFeaturesButtonClick}
                    className="px-5 py-3 rounded-full font-bold text-black bg-white hover:bg-[#FFD166] hover:text-black transition-colors duration-300 ease-in-out text-base flex items-center justify-center w-full transform hover:scale-105"
                    aria-expanded={isFeaturesDropdownOpen}
                    aria-controls="mobile-features-menu"
                    aria-haspopup="true"
                    tabIndex={0}
                  >
                    <StarIcon sx={{ mr: 1 }} />
                    Features {isFeaturesDropdownOpen ? <IoIosArrowDropup className="ml-1" /> : <IoIosArrowDropdown className="ml-1" />}
                  </button>
                  <div
                    id="mobile-features-menu"
                    className={`${isFeaturesDropdownOpen ? 'block' : 'hidden'} bg-gray-50 shadow-inner rounded-md w-full mt-2 overflow-hidden transition-all duration-300 ease-in-out`}
                    style={{ pointerEvents: isFeaturesDropdownOpen ? 'auto' : 'none' }}
                  >
                    <Link 
                      to="/lostfound" 
                      className="block px-4 py-3 text-black hover:bg-[#FFD166] text-center transition-colors duration-300"
                      onClick={() => { setIsFeaturesDropdownOpen(false); setIsMobileMenuOpen(false); }}
                    >
                      Lost and Found
                    </Link>
                    <Link 
                      to="/complaints" 
                      className="block px-4 py-3 text-black hover:bg-[#FFD166] text-center transition-colors duration-300"
                      onClick={() => { setIsFeaturesDropdownOpen(false); setIsMobileMenuOpen(false); }}
                    >
                      Complaints
                    </Link>
                    <Link 
                      to="/events" 
                      className="block px-4 py-3 text-black hover:bg-[#FFD166] text-center transition-colors duration-300"
                      onClick={() => { setIsFeaturesDropdownOpen(false); setIsMobileMenuOpen(false); }}
                    >
                      Events
                    </Link>
                    <Link 
                      to="/clubs-recruitment" 
                      className="block px-4 py-3 text-black hover:bg-[#FFD166] text-center transition-colors duration-300"
                      onClick={() => { setIsFeaturesDropdownOpen(false); setIsMobileMenuOpen(false); }}
                    >
                      Clubs Recruitment
                    </Link>
                    <Link 
                      to="/news" 
                      className="block px-4 py-3 text-black hover:bg-[#FFD166] text-center transition-colors duration-300"
                      onClick={() => { setIsFeaturesDropdownOpen(false); setIsMobileMenuOpen(false); }}
                    >
                      News
                    </Link>
                    <Link 
                      to="/facilities" 
                      className="block px-4 py-3 text-black hover:bg-[#FFD166] text-center transition-colors duration-300"
                      onClick={() => { setIsFeaturesDropdownOpen(false); setIsMobileMenuOpen(false); }}
                    >
                      Facilities
                    </Link>
                  </div>
                </div>
                <AuthButtons user={user} location={location} logout={logout} />
              </>
            )}
            {/* Show AuthButtons for unauthenticated users as well */}
            {!user && (
              <AuthButtons user={user} location={location} logout={logout} />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 