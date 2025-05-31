import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow, Libraries } from '@react-google-maps/api';

// Define libraries outside the component to prevent unnecessary reloads
const libraries: Libraries = ["marker", "places"];

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

interface PlaceDetails {
  photos: string[];
  loading: boolean;
  error: boolean;
  errorMessage?: string;
}

const CampusMap: React.FC<CampusMapProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [placeDetails, setPlaceDetails] = useState<{ [key: string]: PlaceDetails }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // MIT ADT University locations with coordinates and additional details
  const locations: Location[] = [
    { 
      id: 1, 
      name: "MIT-ADT Entrance", 
      lat: 18.49, 
      lng: 74.02,
      description: "Main entrance of MIT-ADT University",
      category: "Entrance",
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4" // MIT-ADT University
    },
    { 
      id: 2, 
      name: "MANET ADMIN, Vice President Office, Vice Chancellor Office, Registrar Office, School of Law", 
      lat: 18.491, 
      lng: 74.021,
      description: "Administrative block housing key offices and School of Law",
      category: "Administration",
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
    },
    { 
      id: 3, 
      name: "Cricket Ground", 
      lat: 18.492, 
      lng: 74.022,
      description: "Main cricket ground for sports activities",
      category: "Sports",
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
    },
    { 
      id: 4, 
      name: "Sports Complex", 
      lat: 18.493, 
      lng: 74.023,
      description: "Multi-sport facility with indoor and outdoor sports",
      category: "Sports",
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
    },
    { 
      id: 5, 
      name: "World Peace Dome", 
      lat: 18.49262365645109,
      lng: 74.02565779888813,
      description: "Iconic dome structure for major events and ceremonies",
      category: "Landmark",
      placeId: "ChIJt5kbMzPpwjsR1YYS0iXIPfk"
    },
    { 
      id: 6, 
      name: "School of Education & Research", 
      lat: 18.495, 
      lng: 74.025,
      description: "Dedicated to education and research programs",
      category: "Academic",
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
    },
    { 
      id: 7, 
      name: "School of Humanities, School of Vedic Sciences", 
      lat: 18.496, 
      lng: 74.026,
      description: "Houses humanities and Vedic studies departments",
      category: "Academic",
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
    },
    { 
      id: 8, 
      name: "School of Vishwashanti Sangeetkala Academy", 
      lat: 18.497, 
      lng: 74.027,
      description: "Center for performing arts and music education",
      category: "Arts",
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
    },
    { 
      id: 9, 
      name: "Account Department, Guest House", 
      lat: 18.498, 
      lng: 74.028,
      description: "Financial services and guest accommodation",
      category: "Administration",
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
    },
    { 
      id: 10, 
      name: "Raj Bungalow", 
      lat: 18.499, 
      lng: 74.029,
      description: "Heritage building and official residence",
      category: "Landmark",
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
    },
    { 
      id: 11, 
      name: "School of Food Technology, MANET Hostel", 
      lat: 18.50, 
      lng: 74.03,
      description: "Food technology studies and student accommodation",
      category: "Academic",
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
    },
    { 
      id: 12, 
      name: "School of Architecture", 
      lat: 18.501, 
      lng: 74.031,
      description: "Architecture and design education center",
      category: "Academic",
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
    },
    { 
      id: 13, 
      name: "School of Film & Theatre, School of Bioengineering Sciences & Research, School of Corporate Innovation & Leadership, Atal Incubation Center (AIC), School of Indian Civil Services", 
      lat: 18.502, 
      lng: 74.032,
      description: "Multi-disciplinary complex for various schools and research centers",
      category: "Academic",
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
    },
    { 
      id: 14, 
      name: "Institute of Design", 
      lat: 18.503, 
      lng: 74.033,
      description: "Design education and research institute",
      category: "Academic",
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
    },
    { 
      id: 15, 
      name: "School of Fine Arts & Applied Arts, Urmilatai Karad Auditorium", 
      lat: 18.504, 
      lng: 74.034,
      description: "Arts education and performance venue",
      category: "Arts",
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
    },
    { 
      id: 16, 
      name: "IT Building, School of Computing, School of Engineering & Sciences, School of Holistic Development, College of Management (MITCOM), CRIEYA", 
      lat: 18.505, 
      lng: 74.035,
      description: "Technology and management education complex",
      category: "Academic",
      placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4"
    }
  ];

  const universityLocation = {
    lat: 18.49, 
    lng: 74.02
  };

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: true,
    scaleControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBeuVPCsXTvznBfbPplXLTm46WNXK6PiT4",
    libraries
  });

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedLocation(null);
  }, []);

  const handleLocationClick = useCallback((location: Location) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
    
    if (location.placeId && !placeDetails[location.placeId]) {
      setPlaceDetails(prev => ({
        ...prev,
        [location.placeId!]: {
          photos: [],
          loading: true,
          error: false
        }
      }));

      const place = new google.maps.places.Place({
        id: location.placeId,
        requestedLanguage: 'en'
      });

      place.fetchFields({
        fields: ['photos']
      }).then((result) => {
        console.log('API result:', result);
        const photos = result.place.photos;
        if (photos && photos.length > 0) {
          console.log('Photos found:', photos.length);
          const photoUrls = photos.slice(0, 3).map(photo => 
            photo.getURI({ maxWidth: 800, maxHeight: 600 })
          );
          console.log('Generated photo URLs:', photoUrls);
          setPlaceDetails(prev => ({
            ...prev,
            [location.placeId!]: {
              photos: photoUrls,
              loading: false,
              error: false
            }
          }));
        } else {
          console.log('No photos returned or photos array is empty.');
          setPlaceDetails(prev => ({
            ...prev,
            [location.placeId!]: {
              photos: [],
              loading: false,
              error: true,
              errorMessage: 'No photos available for this location'
            }
          }));
        }
      }).catch((error) => {
        console.error('Error fetching place details:', error);
        setPlaceDetails(prev => ({
          ...prev,
          [location.placeId!]: {
            photos: [],
            loading: false,
            error: true,
            errorMessage: error.message || 'Failed to load place details'
          }
        }));
      });
    }
  }, [placeDetails]);

  const handleMapClick = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  const filteredLocations = useMemo(() => {
    return locations.filter(location =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }, []);

  // Add handler to recenter map
  const handleRecenter = () => {
    if (mapRef && userLocation) {
      mapRef.panTo(userLocation);
      mapRef.setZoom(17);
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-100 relative">
      <div className="p-4">
         <h1 className="text-3xl font-bold text-gray-800">Campus Map</h1>
      </div>
      <div className="flex flex-grow h-0">
        <div className="w-2/3 h-full relative">
          <div className="bg-white shadow-lg overflow-hidden h-full relative">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : universityLocation}
              zoom={15}
              options={mapOptions}
              onClick={handleMapClick}
              onLoad={onMapLoad}
            >
              {locations.map((location) => (
                <Marker
                  key={location.id}
                  position={{ lat: location.lat, lng: location.lng }}
                  onClick={() => handleLocationClick(location)}
                  title={location.name}
                />
              ))}
              {userLocation && (
                <Marker
                  position={userLocation}
                  icon={{
                    url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                  title="Your Location"
                />
              )}
            </GoogleMap>
            {/* Recenter Button */}
            <button
              onClick={handleRecenter}
              disabled={!userLocation}
              className="absolute bottom-6 left-6 z-10 bg-white border border-gray-300 shadow-lg rounded-full p-3 flex items-center justify-center hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Re-center map on your location"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" />
                <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2" />
                <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>

        <div className="w-1/3 flex flex-col h-full">
          <div className="bg-white shadow-lg p-4 flex-grow overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Campus Locations</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search locations, categories, or descriptions..."
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ul>
              {filteredLocations.map((location) => (
                <li
                  key={location.id}
                  className={`mb-2 pb-2 border-b border-gray-200 text-gray-800 cursor-pointer hover:bg-gray-100 p-2 rounded ${
                    selectedLocation?.id === location.id ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => handleLocationClick(location)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold">{location.id}. {location.name}</span>
                      <p className="text-sm text-gray-600 mt-1">{location.description}</p>
                    </div>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                      {location.category}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Custom Modal Dialog */}
      {isModalOpen && selectedLocation && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full relative">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 bg-gray-200 hover:bg-gray-300 rounded-full p-1 leading-none flex items-center justify-center"
              onClick={closeModal}
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            {/* Modal Content - Moved from InfoWindow */}
            <h3 className="font-bold text-lg mb-2">{selectedLocation.name}</h3>
            {selectedLocation.placeId && (
              <div className="relative w-full mt-2 max-h-60 overflow-y-auto">
                {placeDetails[selectedLocation.placeId]?.loading ? (
                  <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-md">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : placeDetails[selectedLocation.placeId]?.error ? (
                  <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-md">
                    <p className="text-gray-500 text-sm">
                      {placeDetails[selectedLocation.placeId]?.errorMessage || 'Image not available'}
                    </p>
                  </div>
                ) : placeDetails[selectedLocation.placeId]?.photos && placeDetails[selectedLocation.placeId].photos.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {placeDetails[selectedLocation.placeId].photos.map((photoUrl, index) => (
                      <img
                        key={index}
                        src={photoUrl}
                        alt={`${selectedLocation.name} - Photo ${index + 1}`}
                        className="w-full object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://placehold.co/400x300/e2e8f0/64748b?text=Image+Not+Available';
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-40 flex items-center justify-center bg-gray-100 rounded-md">
                    <p className="text-gray-500 text-sm">No images available</p>
                  </div>
                )}
              </div>
            )}
            <p className="text-sm text-gray-600 mt-1">{selectedLocation.description}</p>
            <p className="text-xs text-gray-500 mt-1">Category: {selectedLocation.category}</p>
            <div className="flex gap-2 mt-4">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.lat},${selectedLocation.lng}`;
                  window.open(url, '_blank');
                }}
              >
                Navigate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export { CampusMap };
export default CampusMap; 