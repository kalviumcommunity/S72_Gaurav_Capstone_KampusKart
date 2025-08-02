/// <reference types="vite/client" />
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { GoogleMap, useLoadScript, InfoWindow, Marker, Libraries } from '@react-google-maps/api';
import { FiSearch } from 'react-icons/fi';
import debounce from 'lodash/debounce';

// Define libraries as a proper static constant with correct type
const GOOGLE_MAPS_LIBRARIES: Libraries = ["places"];

// Memoize map options to prevent unnecessary re-renders
const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  scaleControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  mapId: '7b1615000ef5c43e3005d9c9'
} as const;

// Memoize map container style
const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
} as const;

// Move useLoadScript outside component and memoize it
const useGoogleMaps = () => {
  return useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES
  });
};

interface CampusMapProps {}

interface Location {
  id: number;
  name: string;
  lat: number;
  lng: number;
  description?: string;
  category?: string;
  placeId?: string;
}

const CampusMap: React.FC<CampusMapProps> = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState<google.maps.LatLng | null>(null);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);
  const animationInProgress = useRef(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { isLoaded, loadError } = useGoogleMaps();

  // Memoize locations array to prevent unnecessary re-renders
  const locations = useMemo(() => [
    {
      id: 1,
      name: "MIT-ADT Entrance",
      lat: 18.490173753843422,
      lng: 74.0254303116109,
      description: "Main entrance of MIT-ADT University",
      category: "Entrance",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 2,
      name: "MANET ADMIN, Vice President Office, Vice Chancellor Office, Registrar Office, School of Law",
      lat: 18.490946453598095,
      lng: 74.02419055616282,
      description: "Administrative block housing key offices and School of Law",
      category: "Administration",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 3,
      name: "Cricket Ground",
      lat: 18.490748499095503,
      lng: 74.02836838570158,
      description: "Main cricket ground for sports activities",
      category: "Sports",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 4,
      name: "Sports Complex",
      lat: 18.491807509791,
      lng: 74.0284366873852,
      description: "Multi-sport facility with indoor and outdoor sports",
      category: "Sports",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 5,
      name: "World Peace Dome",
      lat: 18.49262365645109,
      lng: 74.02565779888813,
      description: "Iconic dome structure for major events and ceremonies",
      category: "Landmark",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 6,
      name: "School of Education & Research",
      lat: 18.493802098401595,
      lng: 74.02568599386356,
      description: "Dedicated to education and research programs",
      category: "Academic",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 7,
      name: "School of Humanities, School of Vedic Sciences",
      lat: 18.493614169153485,
      lng: 74.02490749767114,
      description: "Houses humanities and Vedic studies departments",
      category: "Academic",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 8,
      name: "School of Vishwashanti Sangeetkala Academy",
      lat: 18.494201447370067,
      lng: 74.02342835489087,
      description: "Center for performing arts and music education",
      category: "Arts",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 9,
      name: "Account Department, Guest House",
      lat: 18.493397060315154,
      lng: 74.02325704813967,
      description: "Financial services and guest accommodation",
      category: "Administration",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 10,
      name: "Raj Bungalow",
      lat: 18.493343843257275,
      lng: 74.02357135415613,
      description: "Heritage building and official residence",
      category: "Landmark",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 11,
      name: "School of Food Technology, MANET Hostel",
      lat: 18.491843937146296,
      lng: 74.02292535777815,
      description: "Food technology studies and student accommodation",
      category: "Academic",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 12,
      name: "School of Architecture",
      lat: 18.494528998144798,
      lng: 74.02184922136568,
      description: "Architecture and design education center",
      category: "Academic",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 13,
      name: "School of Film & Theatre, School of Bioengineering Sciences & Research, School of Corporate Innovation & Leadership, Atal Incubation Center (AIC), School of Indian Civil Services",
      lat: 18.495302450375288,
      lng: 74.02196302037389,
      description: "Multi-disciplinary complex for various schools and research centers",
      category: "Academic",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 14,
      name: "Institute of Design",
      lat: 18.49468368348241,
      lng: 74.021723522408,
      description: "Design education and research institute",
      category: "Academic",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 15,
      name: "School of Fine Arts & Applied Arts, Urmilatai Karad Auditorium",
      lat: 18.495094204174062,
      lng: 74.02049618226005,
      description: "Arts education and performance venue",
      category: "Arts",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 16,
      name: "IT Building, School of Computing, School of Engineering & Sciences, School of Holistic Development, College of Management (MITCOM), CRIEYA",
      lat: 18.493930153250627,
      lng: 74.01912736815999,
      description: "Technology and management education complex",
      category: "Academic",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 17,
      name: "Tuck Shop",
      lat: 18.493523886263336,
      lng: 74.02291451273722,
      description: "Tuck Shop – Quick bites, chill vibes, heart of MIT ADT.",
      category: "Landmark",
      // placeId retained in data for future use, but not used in UI or logic
    },
    {
      id: 18,
      name: "MANET Canteen",
      lat: 18.491564033859877,
      lng: 74.02410194039003,
      description: "MANET Canteen – Grab-and-go meals for busy campus days.",
      category: "Landmark",
      // placeId retained in data for future use, but not used in UI or logic
    }
  ], []);

  // Set Raj Bungalow as the default map center
  const universityLocation = useMemo(() => ({
    lat: 18.493343843257275,
    lng: 74.02357135415613
  }), []);

  // Add state for map center and zoom
  const [mapCenter, setMapCenter] = useState(universityLocation);
  const [mapZoom, setMapZoom] = useState(16);

  // Debounced search handler
  const debouncedSetSearchQuery = useMemo(
    () => {
      const debouncedFn = debounce((value: string) => {
        setSearchQuery(value);
      }, 300);
      return debouncedFn;
    },
    []
  );

  // Memoize filtered locations
  const filteredLocations = useMemo(() => {
    return locations.filter(location =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [locations, searchQuery]);

  // Handle search input change
  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    debouncedSetSearchQuery(e.target.value);
    // setIsPanelOpen(true); // Panel logic is changing
  }, [debouncedSetSearchQuery]);

  // Handle search focus
  const handleSearchFocus = useCallback(() => {
    setIsSearchFocused(true);
  }, []);

  // Handle search blur
  const handleSearchBlur = useCallback(() => {
    // Delay to allow click on list items before setting focused to false
    setTimeout(() => {
      setIsSearchFocused(false);
    }, 200);
  }, []);

  // Optimize marker click handler
  const handleMarkerClick = useCallback((location: Location) => {
    // InfoWindow open handler
    setSelectedLocation(location);
    setInfoWindowPosition(new google.maps.LatLng(location.lat, location.lng));
  }, []);

  // Optimize location click handler
  const handleLocationClick = useCallback((location: Location) => {
    if (!mapRef) return;
    if (animationInProgress.current) return; // Prevent overlapping animations
    animationInProgress.current = true;

    const currentZoom = mapRef.getZoom() || 15;
    const targetZoom = 18;
    const zoomSteps = 10;
    const zoomInterval = 50;

    let currentStep = 0;
    const zoomIntervalId = setInterval(() => {
      if (currentStep >= zoomSteps) {
        clearInterval(zoomIntervalId);
        setTimeout(() => {
          handleMarkerClick(location);
          setMapCenter({ lat: location.lat, lng: location.lng });
          setMapZoom(targetZoom);
          animationInProgress.current = false;
        }, 100);
        return;
      }
      const progress = currentStep / zoomSteps;
      const newZoom = currentZoom + (targetZoom - currentZoom) * progress;
      mapRef.setZoom(newZoom);
      mapRef.panTo({ lat: location.lat, lng: location.lng });
      currentStep++;
    }, zoomInterval);
  }, [mapRef, handleMarkerClick]);

  // Optimize map click handler
  const handleMapClick = useCallback(() => {
    setInfoWindowPosition(null);
    setSelectedLocation(null);
  }, []);

  // Optimize map load handler
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  // Optimize recenter handler
  const handleRecenter = useCallback(() => {
    if (!hasRequestedLocation) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
            const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            };
            setUserLocation(newLocation);
            setHasRequestedLocation(true);
            if (mapRef) {
              mapRef.panTo(newLocation);
              mapRef.setZoom(17);
            }
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
    } else if (mapRef && userLocation) {
      mapRef.panTo(userLocation);
      mapRef.setZoom(17);
    }
  }, [hasRequestedLocation, mapRef, userLocation]);

  // Panel is always open on desktop, hidden on mobile
  const isPanelOpen = window.innerWidth >= 768;


  // Cleanup debounced function on unmount
  useEffect(() => {
    const fn = debouncedSetSearchQuery;
    return () => {
      if (fn && typeof (fn as any).cancel === 'function') {
        (fn as any).cancel();
      }
    };
  }, [debouncedSetSearchQuery]);

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100 relative overflow-hidden">
      {/* Mobile Header - Only visible on mobile */}
      <div className="md:hidden p-3 bg-white shadow-sm border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800 text-center">Campus Map</h1>
      </div>
      
      {/* Desktop Header - Only visible on desktop */}
      <div className="hidden md:block p-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Campus Map</h1>
      </div>
      
      {/* Main flex container for map and panel */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        {/* Map Container - Full width on mobile, 2/3 on desktop */}
        <div className="w-full md:w-2/3 h-full relative">
          <div className="bg-white shadow-lg overflow-hidden h-full relative">
            {/* Mobile Search Bar and Dropdown - Visible on mobile only, positioned over map */}
            <div className="md:hidden absolute top-2 left-1/2 transform -translate-x-1/2 z-10 w-[95%] max-w-sm">
              <form
                className="relative w-full flex border border-gray-300 overflow-hidden shadow-lg focus-within:ring-2 focus-within:ring-[#00C6A7] focus-within:border-[#00C6A7] transition-all duration-300 rounded-full bg-white"
                onSubmit={e => { e.preventDefault(); setSearchQuery(searchInput); }}
              >
                <div className="relative flex items-center flex-1">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search campus locations..."
                    className="block w-full pl-10 pr-4 py-2.5 bg-white text-black outline-none text-base border-none rounded-l-full"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    aria-label="Search locations"
                    onClick={() => setIsSearchFocused(true)}
                  />
                </div>
                <button
                  type="submit"
                  aria-label="Search"
                  className="px-4 py-2.5 bg-[#00C6A7] text-white font-semibold hover:bg-[#009e87] transition-all duration-300 ease-in-out rounded-r-full flex items-center justify-center"
                >
                  <FiSearch className="h-4 w-4" />
                </button>
              </form>

              {/* Mobile Locations Dropdown */}
              {isSearchFocused && filteredLocations.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 shadow-xl rounded-lg mt-1 max-h-48 overflow-y-auto z-20">
                  <ul className="space-y-1 p-2">
                    {filteredLocations.map((location) => (
                      <li
                        key={location.id}
                        className={`border-b border-gray-100 text-gray-800 cursor-pointer hover:bg-gray-50 p-2 rounded transition-all duration-200 ${
                          selectedLocation?.id === location.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => {
                          handleLocationClick(location);
                          setIsSearchFocused(false);
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-sm block truncate">{location.id}. {location.name}</span>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-1">{location.description}</p>
                          </div>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
                            {location.category}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={animationInProgress.current ? undefined : mapCenter}
              zoom={animationInProgress.current ? undefined : mapZoom}
              options={{
                ...MAP_OPTIONS,
                // Adjust controls for mobile and desktop
                zoomControl: true,
                mapTypeControl: window.innerWidth >= 768,
                streetViewControl: window.innerWidth >= 768,
                fullscreenControl: window.innerWidth >= 768,
              }}
              onClick={handleMapClick}
              onLoad={onMapLoad}
            >
              {/* Markers for all filtered locations */}
              {isLoaded && filteredLocations.map(location => (
                <Marker
                  key={location.id}
                  position={{ lat: location.lat, lng: location.lng }}
                  title={location.name}
                  onClick={() => handleMarkerClick(location)}
                  animation={google.maps.Animation.DROP}
                />
              ))}
              {/* Marker for user location */}
              {isLoaded && userLocation && (
                <Marker
                  position={userLocation}
                  icon={'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'}
                  title="Your Location"
                  animation={google.maps.Animation.BOUNCE}
                />
              )}
              {/* InfoWindow for location details */}
              {selectedLocation && infoWindowPosition && (
                <InfoWindow
                  position={infoWindowPosition}
                  onCloseClick={() => {
                    setInfoWindowPosition(null);
                    setSelectedLocation(null);
                  }}
                  options={{
                    pixelOffset: new window.google.maps.Size(0, -30),
                    maxWidth: window.innerWidth < 768 ? 280 : 380,
                    disableAutoPan: false
                  }}
                >
                  <div className="p-2 max-w-xs">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-3 border-b border-gray-100 pb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2">{selectedLocation.name}</h3>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                          {selectedLocation.category}
                        </span>
                      </div>
                    </div>

                    {/* Description Section */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">About this location</h4>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{selectedLocation.description}</p>
                    </div>

                    {/* Location Details Section */}
                    <div className="space-y-1 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Location ID: {selectedLocation.id}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 font-medium text-sm"
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`;
                          window.open(url, '_blank');
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                        </svg>
                        Get Directions
                      </button>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
            {/* Recenter Button - Optimized for mobile */}
            <button
              onClick={handleRecenter}
              className="absolute bottom-3 left-3 z-10 bg-white border border-gray-300 shadow-lg rounded-full p-2.5 flex items-center justify-center hover:bg-blue-50 transition-all duration-200"
              title="Re-center map on your location"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} fill="none" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={2} fill="none" />
                <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth={2} />
                <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth={2} />
                <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth={2} />
                <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth={2} />
              </svg>
            </button>
          </div>
        </div>

        {/* Locations List Panel Container - Full width on mobile, 1/3 on desktop */}
        {/* Added hidden class for mobile, removed mobile toggle button */}
        <div className={`hidden md:flex w-full md:w-1/3 flex-col md:h-full relative transition-all duration-300 ease-in-out md:opacity-100 md:h-full`}>
          {/* Toggle Panel Button - Mobile Only, positioned at the top center */}
          {/* Removed this button as the panel is now hidden on mobile */}

          {/* Inner container with padding, shadow, and overflow for list */}
          {/* Added pt-4 to prevent button overlap */}
          {/* Adjusted opacity and height based on panel state */}
          {/* Removed mobile specific height/opacity classes */}
          <div className={`bg-white shadow-lg p-3 md:p-4 md:flex-grow transition-all duration-300 ease-in-out opacity-100 h-full overflow-y-auto`}>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4">Campus Locations</h2>
            {/* Desktop Search Bar - Visible on desktop only */}
            <form className="hidden md:flex relative mb-6 w-full border border-gray-300 overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-black focus-within:border-black transition-all duration-300 rounded-full" onSubmit={e => { e.preventDefault(); setSearchQuery(searchInput); }}>
              <div className="relative flex items-center flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search locations..."
                  className="block w-full pl-10 pr-4 py-2 bg-white text-black outline-none text-lg border-none rounded-l-full"
                  value={searchInput}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  aria-label="Search locations"
                />
              </div>
              <button
                type="submit"
                aria-label="Search"
                className="px-6 py-2 bg-[#00C6A7] text-white font-semibold hover:bg-[#009e87] transition-all duration-300 ease-in-out rounded-r-full transform hover:scale-105"
              >
                Search
              </button>
            </form>
            {/* Locations List - Always in panel on desktop, hidden on mobile */}
            <div className="hidden md:block transition-all duration-300 ease-in-out opacity-100">
              <ul className="space-y-2">
                {filteredLocations.map((location) => (
                  <li
                    key={location.id}
                    className={`mb-2 pb-2 border-b border-gray-200 text-gray-800 cursor-pointer hover:bg-gray-100 p-2 rounded transition-all duration-300 ease-in-out transform hover:scale-105 ${
                      selectedLocation?.id === location.id ? 'bg-blue-100' : ''
                    }`}
                    onClick={() => {
                      handleLocationClick(location);
                      // On desktop, clicking a list item doesn't close the panel
                    }}
                  >
                    <div className="flex flex-wrap items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm md:text-base block truncate">{location.id}. {location.name}</span>
                        <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">{location.description}</p>
                      </div>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap">
                        {location.category}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CampusMap };
export default CampusMap;