import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import { FiMapPin, FiSearch, FiHome, FiWifi, FiBookOpen, FiCoffee, FiPlus, FiEdit2, FiTag, FiCalendar, FiUser } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import UniversalLoader from './UniversalLoader';
import { useDataLoading } from '../hooks/useLoading';

const Facilities = () => {
  const { token, user } = useAuth();
  const { isLoading, error: loadingError, steps, startLoading, stopLoading, setError: setLoadingError } = useDataLoading();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFacility, setNewFacility] = useState({
    name: '',
    description: '',
    location: '',
    type: 'Academic',
    icon: 'FiBookOpen',
  });
  const [facilities, setFacilities] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [facilityImages, setFacilityImages] = useState<{ file?: File; previewUrl: string }[]>([]);
  const dragImage = useRef<number | null>(null);
  const dragOverImage = useRef<number | null>(null);
  const [editingFacility, setEditingFacility] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFacility, setEditFacility] = useState<any | null>(null);
  const [editFacilityImages, setEditFacilityImages] = useState<{ file?: File; previewUrl: string; public_id?: string; url?: string }[]>([]);
  const editDragImage = useRef<number | null>(null);
  const editDragOverImage = useRef<number | null>(null);
  const iconOptions = [
    { value: 'FiBookOpen', label: 'Academic', icon: <FiBookOpen className="text-[#00C6A7] w-8 h-8" /> },
    { value: 'FiCoffee', label: 'Food', icon: <FiCoffee className="text-[#F05A25] w-8 h-8" /> },
    { value: 'FiWifi', label: 'Service', icon: <FiWifi className="text-blue-500 w-8 h-8" /> },
    { value: 'FiHome', label: 'Accommodation', icon: <FiHome className="text-purple-500 w-8 h-8" /> },
  ];
  const [selectedFacility, setSelectedFacility] = useState<any | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const filteredFacilities = facilities.filter(facility =>
    (filterType === 'All' || facility.type === filterType) &&
    (facility.name.toLowerCase().includes(searchQuery.toLowerCase()) || facility.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useEffect(() => {
    const fetchFacilities = async () => {
      startLoading();
      try {
        const res = await fetch('http://localhost:5000/api/facilities');
        const data = await res.json();
        setFacilities(data);
      } catch (err) {
        setError('Failed to load facilities');
      } finally {
        stopLoading();
      }
    };
    fetchFacilities();
  }, [startLoading, stopLoading]);

  if (isLoading) {
    return (
      <UniversalLoader
        variant="page"
        title="Loading Facilities"
        subtitle="Fetching campus facilities..."
        showSteps={true}
        steps={steps}
        error={loadingError}
        onRetry={() => window.location.reload()}
        size="large"
      />
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[100px]">
        {/* Top Bar: Heading + Add Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-h2 font-extrabold text-black">Campus Facilities</h1>
          {user?.email === 'gauravkhandelwal205@gmail.com' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white font-bold text-lg shadow hover:bg-[#00C6A7] transition"
            >
              + Add New Item
            </button>
          )}
        </div>
        {/* Filter/Search Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 px-4 md:px-0">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-md bg-gray-100 text-black font-medium border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            >
              <option value="All">All Types</option>
              <option value="Academic">Academic</option>
              <option value="Food">Food</option>
              <option value="Service">Service</option>
              <option value="Accommodation">Accommodation</option>
            </select>
          </div>
          {/* Search Bar */}
          <form className="relative w-full md:w-[500px] flex rounded-full border border-gray-300 overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-black focus-within:border-black" onSubmit={e => { e.preventDefault(); setSearchQuery(searchInput); }}>
            <div className="relative flex items-center flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, description, or location..."
                className="w-full pl-10 pr-4 py-2 bg-white text-black outline-none text-lg border-none"
                aria-label="Search facilities"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setSearchQuery(searchInput);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              aria-label="Search"
              className="px-6 py-2 bg-[#00C6A7] text-white font-semibold hover:bg-[#009e87] transition rounded-r-full flex items-center justify-center"
            >
              <FiSearch className="md:hidden" />
              <span className="hidden md:inline">Search</span>
            </button>
          </form>
        </div>
        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFacilities.map(facility => (
            <div
              key={facility._id || facility.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group"
              onClick={() => setSelectedFacility(facility)}
            >
              {/* Image Section with Overlay */}
              <div className="relative h-60 sm:h-80 overflow-hidden">
                {facility.images && facility.images.length > 0 ? (
                  <>
                    <img
                      src={facility.images[0].url}
                      alt={facility.name}
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      {iconOptions.find(opt => opt.value === facility.icon)?.icon || <FiHome className="w-16 h-16" />}
                      <span className="text-xs mt-2">No Image</span>
                    </div>
                  </div>
                )}
                {/* Type Badge */}
                <div className="absolute top-4 left-4">
                  <span className="text-xs px-3 py-1.5 rounded-full font-medium shadow-sm bg-white/90 backdrop-blur-sm text-gray-800 flex items-center gap-1">
                    <FiTag className="w-3 h-3" />
                    {facility.type}
                  </span>
                </div>
                {/* Location Badge */}
                <div className="absolute top-4 right-4">
                  <span className="text-xs px-3 py-1.5 rounded-full font-medium shadow-sm bg-white/90 backdrop-blur-sm text-gray-800 flex items-center gap-1">
                    <FiMapPin className="w-3 h-3" />
                    {facility.location}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{facility.name}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{facility.description}</p>

                {/* Meta Info Row */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  {facility.createdAt && (
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="mr-2 flex-shrink-0" />
                      <span>{new Date(facility.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  )}
                  {facility.createdBy && (
                    <div className="flex items-center text-sm text-gray-500">
                      <FiUser className="mr-2 flex-shrink-0" />
                      <span className="truncate">Posted by {facility.createdBy.name || facility.createdBy.email || 'User'}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {user?.email === 'gauravkhandelwal205@gmail.com' && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingFacility(facility); setIsEditModalOpen(true); }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm sm:text-base min-w-0"
                    >
                      <FiEdit2 className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Edit</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredFacilities.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-12">No facilities found.</div>
          )}
        </div>
        {/* Add Facility Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-200 text-black absolute top-4 right-4 z-50 transition-all duration-150 focus:outline-none"
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div className="flex items-center gap-3 mb-6">
                <FiPlus className="text-[#00C6A7] w-8 h-8" />
                <h2 className="text-2xl font-bold text-gray-900">Add New Facility</h2>
              </div>
              {formError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-700">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" /></svg>
                    <span>{formError}</span>
                  </div>
                </div>
              )}
              <form onSubmit={async e => {
                e.preventDefault();
                setAddLoading(true);
                setFormError(null);
                if (!token) return;
                if (!newFacility.name.trim()) { setFormError('Name is required'); setAddLoading(false); return; }
                if (!newFacility.description.trim()) { setFormError('Description is required'); setAddLoading(false); return; }
                if (!newFacility.location.trim()) { setFormError('Location is required'); setAddLoading(false); return; }
                const formData = new FormData();
                formData.append('name', newFacility.name);
                formData.append('description', newFacility.description);
                formData.append('location', newFacility.location);
                formData.append('type', newFacility.type);
                formData.append('icon', newFacility.icon);
                facilityImages.forEach(img => { if (img.file) formData.append('images', img.file); });
                try {
                  const res = await fetch('http://localhost:5000/api/facilities', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                  });
                  if (!res.ok) throw new Error('Failed to add facility');
                  const saved = await res.json();
                  setFacilities([saved, ...facilities]);
                  setNewFacility({ name: '', description: '', location: '', type: 'Academic', icon: 'FiBookOpen' });
                  setFacilityImages([]);
                  setIsModalOpen(false);
                } catch (err: any) {
                  setFormError(err.message || 'Failed to add facility');
                } finally {
                  setAddLoading(false);
                }
              }} className="space-y-8">
                <div className="border-b pb-6 mb-6 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">Facility Details <FiHome className="text-gray-400" /></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={newFacility.name}
                        onChange={e => setNewFacility({ ...newFacility, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                        placeholder="e.g. Main Library"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter the facility name.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={newFacility.location}
                        onChange={e => setNewFacility({ ...newFacility, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                        placeholder="e.g. Central Block"
                      />
                      <p className="text-xs text-gray-500 mt-1">Where is this facility located?</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newFacility.description}
                      onChange={e => setNewFacility({ ...newFacility, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      rows={3}
                      required
                      placeholder="Describe the facility, features, etc."
                    />
                    <p className="text-xs text-gray-500 mt-1">Describe the facility and its features.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={newFacility.type}
                        onChange={e => setNewFacility({ ...newFacility, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                      >
                        <option value="Academic">Academic</option>
                        <option value="Food">Food</option>
                        <option value="Service">Service</option>
                        <option value="Accommodation">Accommodation</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Select the facility type.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                      <select
                        value={newFacility.icon}
                        onChange={e => setNewFacility({ ...newFacility, icon: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                      >
                        {iconOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <div className="flex gap-4 mt-2">
                        {iconOptions.map(opt => (
                          <span key={opt.value} className={`p-2 rounded-full border ${newFacility.icon === opt.value ? 'border-[#00C6A7]' : 'border-gray-200'}`}>{opt.icon}</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Choose an icon for this facility.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">Images <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg></h3>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="facility-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#3FA9F6] hover:text-blue-500 focus-within:outline-none">
                          <span>Upload files</span>
                          <input
                            id="facility-file-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={e => {
                              if (e.target.files) {
                                const filesArray = Array.from(e.target.files).slice(0, 5 - facilityImages.length);
                                setFacilityImages([
                                  ...facilityImages,
                                  ...filesArray.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))
                                ]);
                              }
                            }}
                            disabled={facilityImages.length >= 5}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each. Add clear images to help illustrate the facility.</p>
                    </div>
                  </div>
                  {facilityImages.length > 0 && (
                    <div className="mt-2 grid grid-cols-5 gap-2">
                      {facilityImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative cursor-move"
                          draggable
                          onDragStart={() => { dragImage.current = index; }}
                          onDragEnter={() => { dragOverImage.current = index; }}
                          onDragEnd={() => {
                            if (dragImage.current === null || dragOverImage.current === null) return;
                            const newImages = [...facilityImages];
                            const dragged = newImages.splice(dragImage.current, 1)[0];
                            newImages.splice(dragOverImage.current, 0, dragged);
                            setFacilityImages(newImages);
                            dragImage.current = null;
                            dragOverImage.current = null;
                          }}
                          onDragOver={e => e.preventDefault()}
                        >
                          <img
                            src={image.previewUrl}
                            alt={`Preview ${index + 1}`}
                            className="h-28 w-28 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => setFacilityImages(facilityImages.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    disabled={addLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#181818] hover:bg-[#00C7A7] transition ${addLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={addLoading}
                  >
                    {addLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Adding...
                      </span>
                    ) : (
                      'Add Facility'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Edit Facility Modal */}
        {isEditModalOpen && editFacility && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setIsEditModalOpen(false)}
                aria-label="Close"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-200 text-black absolute top-4 right-4 z-50 transition-all duration-150 focus:outline-none"
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div className="flex items-center gap-3 mb-6">
                <FiEdit2 className="text-[#00C6A7] w-8 h-8" />
                <h2 className="text-2xl font-bold text-gray-900">Edit Facility</h2>
              </div>
              {formError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-700">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" /></svg>
                    <span>{formError}</span>
                  </div>
                </div>
              )}
              <form onSubmit={async e => {
                e.preventDefault();
                setEditLoading(true);
                setFormError(null);
                if (!token) return;
                if (!editFacility.name.trim()) { setFormError('Name is required'); setEditLoading(false); return; }
                if (!editFacility.description.trim()) { setFormError('Description is required'); setEditLoading(false); return; }
                if (!editFacility.location.trim()) { setFormError('Location is required'); setEditLoading(false); return; }
                const formData = new FormData();
                formData.append('name', editFacility.name);
                formData.append('description', editFacility.description);
                formData.append('location', editFacility.location);
                formData.append('type', editFacility.type);
                formData.append('icon', editFacility.icon);
                // Keep images
                const keepPublicIds = editFacilityImages.filter(img => img.public_id).map(img => img.public_id);
                formData.append('keepImages', JSON.stringify(keepPublicIds));
                // New images
                editFacilityImages.forEach(img => { if (img.file) formData.append('images', img.file); });
                try {
                  const res = await fetch(`http://localhost:5000/api/facilities/${editFacility._id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                  });
                  if (!res.ok) throw new Error('Failed to update facility');
                  const updated = await res.json();
                  setFacilities(facilities.map(f => f._id === updated._id ? updated : f));
                  setIsEditModalOpen(false);
                } catch (err: any) {
                  setFormError(err.message || 'Failed to update facility');
                } finally {
                  setEditLoading(false);
                }
              }} className="space-y-8">
                <div className="border-b pb-6 mb-6 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">Facility Details <FiHome className="text-gray-400" /></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={editFacility.name}
                        onChange={e => setEditFacility({ ...editFacility, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                        placeholder="e.g. Main Library"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter the facility name.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={editFacility.location}
                        onChange={e => setEditFacility({ ...editFacility, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                        placeholder="e.g. Central Block"
                      />
                      <p className="text-xs text-gray-500 mt-1">Where is this facility located?</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={editFacility.description}
                      onChange={e => setEditFacility({ ...editFacility, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      rows={3}
                      required
                      placeholder="Describe the facility, features, etc."
                    />
                    <p className="text-xs text-gray-500 mt-1">Describe the facility and its features.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={editFacility.type}
                        onChange={e => setEditFacility({ ...editFacility, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                      >
                        <option value="Academic">Academic</option>
                        <option value="Food">Food</option>
                        <option value="Service">Service</option>
                        <option value="Accommodation">Accommodation</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Select the facility type.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                      <select
                        value={editFacility.icon}
                        onChange={e => setEditFacility({ ...editFacility, icon: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                      >
                        {iconOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <div className="flex gap-4 mt-2">
                        {iconOptions.map(opt => (
                          <span key={opt.value} className={`p-2 rounded-full border ${editFacility.icon === opt.value ? 'border-[#00C6A7]' : 'border-gray-200'}`}>{opt.icon}</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Choose an icon for this facility.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">Images <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg></h3>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="edit-facility-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#3FA9F6] hover:text-blue-500 focus-within:outline-none">
                          <span>Upload files</span>
                          <input
                            id="edit-facility-file-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={e => {
                              if (e.target.files) {
                                const filesArray = Array.from(e.target.files).slice(0, 5 - editFacilityImages.length);
                                setEditFacilityImages([
                                  ...editFacilityImages,
                                  ...filesArray.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))
                                ]);
                              }
                            }}
                            disabled={editFacilityImages.length >= 5}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each. Add clear images to help illustrate the facility.</p>
                    </div>
                  </div>
                  {editFacilityImages.length > 0 && (
                    <div className="mt-2 grid grid-cols-5 gap-2">
                      {editFacilityImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative cursor-move"
                          draggable
                          onDragStart={() => { editDragImage.current = index; }}
                          onDragEnter={() => { editDragOverImage.current = index; }}
                          onDragEnd={() => {
                            if (editDragImage.current === null || editDragOverImage.current === null) return;
                            const newImages = [...editFacilityImages];
                            const dragged = newImages.splice(editDragImage.current, 1)[0];
                            newImages.splice(editDragOverImage.current, 0, dragged);
                            setEditFacilityImages(newImages);
                            editDragImage.current = null;
                            editDragOverImage.current = null;
                          }}
                          onDragOver={e => e.preventDefault()}
                        >
                          <img
                            src={image.previewUrl}
                            alt={`Preview ${index + 1}`}
                            className="h-28 w-28 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => setEditFacilityImages(editFacilityImages.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                            aria-label={`Remove image ${index + 1}`}
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    disabled={editLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#181818] hover:bg-[#00C7A7] transition ${editLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Facility Details Modal */}
        {selectedFacility && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-3xl w-full mx-auto max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setSelectedFacility(null)}
                aria-label="Close"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-200 text-black absolute top-4 right-4 z-50 transition-all duration-150 focus:outline-none"
              >
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div className="flex items-center gap-3 mb-4">
                {iconOptions.find(opt => opt.value === selectedFacility.icon)?.icon}
                <h2 className="text-2xl font-bold text-gray-900 pr-8">{selectedFacility.name}</h2>
              </div>
              {/* Images Gallery */}
              {selectedFacility.images && selectedFacility.images.length > 0 && (
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedFacility.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.url}
                      alt={`Facility image ${idx + 1}`}
                      className="w-full h-64 object-cover rounded-md cursor-zoom-in hover:opacity-90 transition-opacity duration-200"
                      onClick={() => setZoomedImage(img.url)}
                    />
                  ))}
                </div>
              )}
              {/* Details Section */}
              <div className="space-y-6 text-gray-700">
                {/* Description */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedFacility.description}</p>
                </div>
                {/* Meta Info - Location, Date, Posted By */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  {selectedFacility.location && (
                    <div className="flex items-center text-sm text-gray-500">
                      <FiMapPin className="w-5 h-5 mr-2 flex-shrink-0"/>
                      <span>{selectedFacility.location}</span>
                    </div>
                  )}
                  {selectedFacility.createdAt && (
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="w-5 h-5 mr-2 flex-shrink-0"/>
                      <span>{new Date(selectedFacility.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  )}
                  {selectedFacility.createdBy && selectedFacility.createdAt && (
                    <div className="flex items-center text-sm text-gray-500">
                      <FiUser className="w-5 h-5 mr-2 text-gray-500" />
                      <span className="truncate">Posted by {selectedFacility.createdBy.name || selectedFacility.createdBy.email || 'User'} on {new Date(selectedFacility.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                    </div>
                  )}
                </div>
              </div>
              {/* Owner/Admin Actions */}
              {user?.email === 'gauravkhandelwal205@gmail.com' && (
                <div className="flex gap-2 pt-6">
                  <button
                    onClick={() => {
                      setEditingFacility(selectedFacility);
                      setEditFacility({ ...selectedFacility });
                      setEditFacilityImages((selectedFacility.images || []).map(img => ({ ...img, previewUrl: img.url })));
                      setIsEditModalOpen(true);
                      setSelectedFacility(null);
                    }}
                    className="flex-1 px-3 py-3 sm:py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200 min-w-0"
                  ><span className="truncate">Edit</span></button>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Are you sure you want to delete this facility?')) return;
                      try {
                        const res = await fetch(`http://localhost:5000/api/facilities/${selectedFacility._id}`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${token}` },
                        });
                        if (!res.ok) throw new Error('Failed to delete facility');
                        setFacilities(facilities.filter(f => f._id !== selectedFacility._id));
                        setSelectedFacility(null);
                      } catch (err) {
                        setError('Failed to delete facility');
                      }
                    }}
                    className="flex-1 px-3 py-3 sm:py-2 rounded-full text-sm font-semibold text-white bg-[#F05A25] hover:bg-red-600 transition-colors duration-200 min-w-0"
                  ><span className="truncate">Delete</span></button>
                </div>
              )}
              {/* Bottom Close Button */}
              <div className="mt-6 text-right">
                <button
                  onClick={() => setSelectedFacility(null)}
                  className="px-6 py-3 rounded-full font-bold text-white bg-[#181818] hover:bg-[#00C6A7] transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Zoomed Image Modal */}
        {zoomedImage && selectedFacility && selectedFacility.images && selectedFacility.images.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={() => setZoomedImage(null)}>
            {/* Image */}
            <img 
              src={zoomedImage} 
              alt="Zoomed"
              className="max-h-[90vh] max-w-full lg:max-w-[80vw] rounded-lg shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
            />
            
            {/* Navigation Buttons */}
            {selectedFacility.images.length > 1 && (
              <>
                {/* Previous Button */}
                <button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/50 transition-colors duration-200 z-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = selectedFacility.images.findIndex(img => img.url === zoomedImage);
                    const prevIndex = (currentIndex - 1 + selectedFacility.images.length) % selectedFacility.images.length;
                    setZoomedImage(selectedFacility.images[prevIndex].url);
                  }}
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                {/* Next Button */}
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/50 transition-colors duration-200 z-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = selectedFacility.images.findIndex(img => img.url === zoomedImage);
                    const nextIndex = (currentIndex + 1) % selectedFacility.images.length;
                    setZoomedImage(selectedFacility.images[nextIndex].url);
                  }}
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}

            {/* Close Button */}
             <button
              onClick={() => setZoomedImage(null)}
              aria-label="Close zoomed image"
              className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/50 transition-colors duration-200 z-50"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

          </div>
        )}
      </main>
    </div>
  );
};

export default Facilities; 