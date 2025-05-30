import React from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

// Define libraries outside the component to prevent unnecessary reloads
const libraries: ("marker")[] = ["marker"];

interface CampusMapProps {}

const CampusMap: React.FC<CampusMapProps> = () => {
  // MIT ADT University Entrance Gate coordinates (from Green Audit Report)
  const universityLocation = {
    lat: 18.49, 
    lng: 74.02
  };

  const mapContainerStyle = {
    width: '100%',
    height: '100%', // Use 100% height of its parent container
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: true,
    scaleControl: true,
    mapTypeControl: true,
    fullscreenControl: true,
  };

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBeuVPCsXTvznBfbPplXLTm46WNXK6PiT4",
    libraries
  });

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-full flex flex-col bg-gray-100"> {/* This div takes full height from AuthenticatedLayout, removed padding */}
      <div className="p-4">{/* Add padding around the title */}
         <h1 className="text-3xl font-bold text-gray-800">Campus Map</h1>
      </div>
      <div className="flex flex-grow h-0"> {/* flex-grow to fill remaining height, h-0 allows flex items to shrink, removed px-4 */}
        {/* Left side: Map */}
        <div className="w-2/3 h-full"> {/* 2/3 width for map, removed padding right, full height */} 
          <div className="bg-white shadow-lg overflow-hidden h-full"> {/* Map container takes full height, removed rounded-lg */} 
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={universityLocation}
              zoom={15}
              options={mapOptions}
            >
              {/* Removed custom marker */}
            </GoogleMap>
          </div>
        </div>

        {/* Right side: List Panel */}
        <div className="w-1/3 flex flex-col h-full"> {/* 1/3 width for panel, removed padding left, flex column, full height */} 
          <div className="bg-white shadow-lg p-4 flex-grow overflow-y-auto"> {/* Panel content takes remaining height, add padding, allow vertical scrolling */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">Campus Locations</h2>
            <ul>
              <li className="mb-2 pb-2 border-b border-gray-200 text-gray-800">1. MIT-ADT Entrance</li>
              <li className="mb-2 pb-2 border-b border-gray-200 text-gray-800">2. MANET ADMIN, Vice President Office, Vice Chancellor Office, Registrar Office, School of Law</li>
              <li className="mb-2 pb-2 border-b border-gray-200 text-gray-800">3. Cricket Ground</li>
              <li className="mb-2 pb-2 border-b border-gray-200 text-gray-800">4. Sports Complex</li>
              <li className="mb-2 pb-2 border-b border-gray-200 text-gray-800">5. World Peace Dome</li>
              <li className="mb-2 pb-2 border-b border-gray-200 text-gray-800">6. School of Education & Research</li>
              <li className="mb-2 pb-2 border-b border-gray-200 text-gray-800">7. School of Humanities, School of Vedic Sciences</li>
              <li className="mb-2 pb-2 border-b border-gray-200 text-gray-800">8. School of Vishwashanti Sangeetkala Academy</li>
              <li className="mb-2 pb-2 border-b border-gray-200 text-gray-800">9. Account Department, Guest House</li>
              <li className="mb-2 pb-2 border-b border-gray-200 text-gray-800">10. Raj Bungalow</li>
              <li className="mb-2 pb-2 border-b border-gray-200 text-gray-800">11. School of Food Technology, MANET Hostel</li>
              <li className="mb-2 pb-2 border-b border-gray-200 text-gray-800">12. School of Architecture</li>
              <li className="mb-2 pb-2 border-b border-gray-200 text-gray-800">13. School of Film & Theatre, School of Bioengineering Sciences & Research, School of Corporate Innovation & Leadership, Atal Incubation Center (AIC), School of Indian Civil Services</li>
              <li className="mb-2 pb-2 border-b border-gray-200 text-gray-800">14. Institute of Design</li>
              <li className="mb-2 pb-2 border-b border-gray-200 text-gray-800">15. School of Fine Arts & Applied Arts, Urmilatai Karad Auditorium</li>
              <li className="mb-2 pb-2 text-gray-800">16. IT Building, School of Computing, School of Engineering & Sciences, School of Holistic Development, College of Management (MITCOM), CRIEYA</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export { CampusMap };
export default CampusMap; 