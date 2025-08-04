import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { FiPlus, FiCalendar, FiSearch, FiAlertCircle, FiFileText, FiTag, FiMail, FiInfo, FiUser, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import UniversalLoader from './UniversalLoader';
import { useDataLoading } from '../hooks/useLoading';
import { API_BASE } from '../config';

interface ClubRecruitment {
  _id: string;
  title: string;
  description: string;
  clubName: string;
  startDate: string;
  endDate: string;
  formUrl: string;
  image?: { public_id?: string; url?: string };
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  status: 'Open' | 'Closed';
}

interface ClubDetailsProps {
  club: ClubRecruitment;
  onClose: () => void;
  onEdit?: (club: ClubRecruitment) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

const ClubDetails: React.FC<ClubDetailsProps> = ({ club, onClose, onEdit, onDelete, isAdmin }) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const handleImageClick = (imageUrl: string) => {
    setZoomedImage(imageUrl);
  };

  const closeZoomedImageModal = () => {
    setZoomedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-3xl w-full mx-auto max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 pr-8">{club.title}</h2>
        <div className="flex flex-col md:flex-row gap-8">
          {club.image?.url ? (
            <div 
              className="relative group mb-6 md:mb-0 rounded-lg overflow-hidden shadow-sm w-full md:w-1/2 lg:w-1/2 h-128 flex-shrink-0 mx-auto md:mx-0 max-w-xl cursor-pointer"
              onClick={() => handleImageClick(club.image?.url || '')}
            >
              <img 
                src={club.image.url} 
                alt={club.title} 
                className="block w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8" x2="11" y2="14" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full md:w-1/2 lg:w-1/2 h-128 bg-gray-100 rounded-lg mb-6 md:mb-0 flex flex-col items-center justify-center text-gray-400 flex-shrink-0 mx-auto md:mx-0 max-w-xl">
              <FiCalendar className="w-16 h-16 mb-2" />
              <span className="text-sm font-medium">No Image Available</span>
            </div>
          )}
          <div className="space-y-6 text-gray-700 flex-grow">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${club.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{club.status}</span>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap text-sm">{club.description}</p>
            </div>
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-500">
                <FiTag className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" />
                <span className="font-medium text-gray-900">{club.clubName}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <FiCalendar className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" />
                <span>{new Date(club.startDate).toLocaleDateString()} - {new Date(club.endDate).toLocaleDateString()}</span>
              </div>
              {club.contactInfo?.name && (
                <div className="flex items-center text-sm text-gray-500">
                  <FiUser className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" />
                  <span>{club.contactInfo.name}</span>
                </div>
              )}
              {club.contactInfo?.email && (
                <div className="flex items-center text-sm text-gray-500">
                  <FiMail className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" />
                  <a href={`mailto:${club.contactInfo.email}`} className="text-[#00C6A7] hover:underline">{club.contactInfo.email}</a>
                </div>
              )}
              {club.contactInfo?.phone && (
                <div className="flex items-center text-sm text-gray-500">
                  <FiPhone className="w-5 h-5 mr-2 flex-shrink-0 text-gray-500" />
                  <a href={`tel:${club.contactInfo.phone}`} className="text-[#00C6A7] hover:underline">{club.contactInfo.phone}</a>
                </div>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              {club.formUrl && (
                <>
                  <a
                    href={club.formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block w-full text-center px-6 py-3 rounded-lg font-bold text-white bg-[#00C6A7] hover:bg-[#009e87] transition mb-2"
                  >
                    Apply Now
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `🚀 *Join the Club Recruitment!* 🚀\n\n*Club:* ${club.clubName}\n*Title:* ${club.title}\n*Description:* ${club.description}\n*Recruitment Period:* ${new Date(club.startDate).toLocaleDateString()} - ${new Date(club.endDate).toLocaleDateString()}\n${club.contactInfo?.name ? `*Contact:* ${club.contactInfo.name}` : ''}${club.contactInfo?.email ? ` | ${club.contactInfo.email}` : ''}${club.contactInfo?.phone ? ` | ${club.contactInfo.phone}` : ''}\n\nApply now and be part of something amazing!\n👉 ${club.formUrl}\n\nSee more details here: ${typeof window !== 'undefined' ? window.location.href : ''}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full text-center px-6 py-3 rounded-lg font-bold text-white bg-[#25D366] hover:bg-[#128C7E] transition mb-4 gap-2"
                    style={{ textDecoration: 'none' }}
                  >
                    <FaWhatsapp className="w-6 h-6" /> Share on WhatsApp
                  </a>
                </>
              )}
              {isAdmin && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => onEdit?.(club)}
                    className="flex-1 px-3 py-3 sm:py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200 min-w-0"
                  >
                    <span className="truncate">Edit</span>
                  </button>
                  <button
                    onClick={() => onDelete?.(club._id)}
                    className="flex-1 px-3 py-3 sm:py-2 rounded-full text-sm font-semibold text-white bg-[#F05A25] hover:bg-red-600 transition-colors duration-200 min-w-0"
                  >
                    <span className="truncate">Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Zoomed Image Modal */}
        {zoomedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={closeZoomedImageModal}>
            <img src={zoomedImage} alt="Zoomed" className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg" />
          </div>
        )}
      </div>
    </div>
  );
};

const ClubsRecruitment = () => {
  const { user, token } = useAuth();
  const { isLoading, error: loadingError, steps, startLoading, stopLoading, setError: setLoadingError } = useDataLoading();
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [clubs, setClubs] = useState<ClubRecruitment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<ClubRecruitment | null>(null);
  const [newClub, setNewClub] = useState({
    title: '',
    description: '',
    clubName: '',
    startDate: '',
    endDate: '',
    formUrl: '',
    image: undefined as File | undefined,
    imagePreview: '',
    contactInfo: { name: '', email: '', phone: '' },
    status: 'Open' as 'Open' | 'Closed',
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedClubForDetails, setSelectedClubForDetails] = useState<ClubRecruitment | null>(null);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      startLoading();
      const response = await fetch(`${API_BASE}/api/clubs`);
      if (!response.ok) throw new Error('Failed to fetch club recruitments');
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      setError('Failed to load club recruitments');
    } finally {
      stopLoading();
    }
  };

  const handleAddClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append('title', newClub.title);
      formData.append('description', newClub.description);
      formData.append('clubName', newClub.clubName);
      formData.append('startDate', newClub.startDate);
      formData.append('endDate', newClub.endDate);
      formData.append('formUrl', newClub.formUrl);
      formData.append('status', newClub.status);
      formData.append('contactInfo', JSON.stringify(newClub.contactInfo));
      if (newClub.image) {
        formData.append('image', newClub.image);
      }
      const response = await fetch(`${API_BASE}/api/clubs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add club recruitment');
      }
      const savedClub = await response.json();
      setClubs([savedClub, ...clubs]);
      setIsModalOpen(false);
      setNewClub({ 
        title: '', 
        description: '', 
        clubName: '',
        startDate: '',
        endDate: '',
        formUrl: '',
        image: undefined, 
        imagePreview: '',
        contactInfo: { name: '', email: '', phone: '' },
        status: 'Open',
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add club recruitment');
    }
  };

  const handleEditClub = (club: ClubRecruitment) => {
    setEditingClub(club);
    setNewClub({
      title: club.title,
      description: club.description,
      clubName: club.clubName,
      startDate: club.startDate.split('T')[0],
      endDate: club.endDate.split('T')[0],
      formUrl: club.formUrl,
      image: undefined,
      imagePreview: club.image?.url || '',
      contactInfo: club.contactInfo || { name: '', email: '', phone: '' },
      status: club.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClub = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this club recruitment?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/clubs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete club recruitment');
      }
      setClubs(clubs.filter(c => c._id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete club recruitment');
    }
  };

  const handleSaveClub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !editingClub) return;
    try {
      const formData = new FormData();
      formData.append('title', newClub.title);
      formData.append('description', newClub.description);
      formData.append('clubName', newClub.clubName);
      formData.append('startDate', newClub.startDate);
      formData.append('endDate', newClub.endDate);
      formData.append('formUrl', newClub.formUrl);
      formData.append('status', newClub.status);
      formData.append('contactInfo', JSON.stringify(newClub.contactInfo));
      if (newClub.image) {
        formData.append('image', newClub.image);
      }
      const response = await fetch(`${API_BASE}/api/clubs/${editingClub._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save club recruitment');
      }
      const savedClub = await response.json();
      setClubs(clubs.map(c => c._id === savedClub._id ? savedClub : c));
      setIsModalOpen(false);
      setEditingClub(null);
      setNewClub({ 
        title: '', 
        description: '', 
        clubName: '',
        startDate: '',
        endDate: '',
        formUrl: '',
        image: undefined, 
        imagePreview: '',
        contactInfo: { name: '', email: '', phone: '' },
        status: 'Open',
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save club recruitment');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewClub(prev => ({ ...prev, image: file, imagePreview: URL.createObjectURL(file) }));
    }
  };

  const openClubDetailsModal = (club: ClubRecruitment) => {
    setSelectedClubForDetails(club);
  };

  const closeClubDetailsModal = () => {
    setSelectedClubForDetails(null);
  };

  const filteredClubs = clubs.filter(club =>
    club.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    club.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.clubName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <UniversalLoader
        variant="page"
        title="Loading Club Recruitment"
        subtitle="Fetching club recruitment data..."
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-h2 font-extrabold text-black">Clubs Recruitment</h1>
          {user?.email === "gauravkhandelwal205@gmail.com" && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white font-bold text-lg shadow hover:bg-[#00C6A7] transition"
            >
              + Add New Recruitment
            </button>
          )}
        </div>
        <form className="relative w-full md:w-[500px] flex rounded-full border border-gray-300 overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-black focus-within:border-black mb-6" onSubmit={e => { e.preventDefault(); setSearchQuery(searchInput); }}>
          <div className="relative flex items-center flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, description, or club name..."
              className="bg-white w-full pl-10 pr-4 py-2 text-black outline-none text-lg border-none"
              aria-label="Search clubs"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map(club => (
            <div 
              key={club._id} 
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group"
              onClick={() => openClubDetailsModal(club)}
            >
              <div className="relative h-60 sm:h-80 overflow-hidden">
                {club.image?.url ? (
                  <>
                    <img 
                      src={club.image.url} 
                      alt={club.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <FiCalendar className="w-16 h-16" />
                      <span className="text-xs mt-2">No Image Available</span>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${club.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{club.status}</span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{club.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{club.description}</p>
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <FiTag className="mr-2 flex-shrink-0 text-gray-400" />
                    <span className="font-medium text-gray-900">{club.clubName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FiCalendar className="mr-2 flex-shrink-0 text-gray-400" />
                    <span>{new Date(club.startDate).toLocaleDateString()} - {new Date(club.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      club.formUrl 
                        ? 'bg-[#00C6A7] text-white hover:bg-[#009e87]' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!club.formUrl}
                    onClick={e => { e.stopPropagation(); if (club.formUrl) window.open(club.formUrl, '_blank'); }}
                  >
                    {club.formUrl ? 'Apply Now' : 'Applications Closed'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredClubs.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-12">No club recruitments found.</div>
          )}
        </div>
        {/* Add/Edit Club Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
                              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingClub ? 'Edit Recruitment' : 'Add New Recruitment'}
                  </h2>
                  <button
                    onClick={() => { setIsModalOpen(false); setEditingClub(null); setNewClub({ title: '', description: '', clubName: '', startDate: '', endDate: '', formUrl: '', image: undefined, imagePreview: '', contactInfo: { name: '', email: '', phone: '' }, status: 'Open' }); }}
                    aria-label="Close"
                    className="text-red-500 hover:text-red-700 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-700">
                    <FiAlertCircle className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              <form onSubmit={editingClub ? handleSaveClub : handleAddClub} className="space-y-8">
                <div className="border-b pb-6 mb-6 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">Recruitment Details <FiInfo className="text-gray-400" title="Fill in the details of your club recruitment." /></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Title <FiTag className="inline text-gray-400" /></label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newClub.title}
                          onChange={e => setNewClub({...newClub, title: e.target.value})}
                          className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                          placeholder="Enter recruitment title (e.g., Drama Club 2024 Intake)"
                          required
                          aria-label="Recruitment Title"
                        />
                        <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Give a short, descriptive title for the recruitment.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Club Name <FiTag className="inline text-gray-400" /></label>
                      <input
                        type="text"
                        value={newClub.clubName}
                        onChange={e => setNewClub({...newClub, clubName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                        aria-label="Club Name"
                      />
                      <p className="text-xs text-gray-500 mt-1">Which club is recruiting?</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Start Date <FiCalendar className="inline text-gray-400" /></label>
                      <input
                        type="date"
                        value={newClub.startDate}
                        onChange={e => setNewClub({...newClub, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                        aria-label="Start Date"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">End Date <FiCalendar className="inline text-gray-400" /></label>
                      <input
                        type="date"
                        value={newClub.endDate}
                        onChange={e => setNewClub({...newClub, endDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                        aria-label="End Date"
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Description <FiFileText className="inline text-gray-400" /></label>
                    <div className="relative">
                      <textarea
                        value={newClub.description}
                        onChange={e => setNewClub({...newClub, description: e.target.value})}
                        className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        rows={4}
                        placeholder="Provide a detailed description of the recruitment. Include requirements, process, and highlights."
                        required
                        aria-label="Recruitment Description"
                      ></textarea>
                      <FiFileText className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Provide details to help users understand the recruitment.</p>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Form URL <FiMail className="inline text-gray-400" /></label>
                    <div className="relative">
                      <input
                        type="url"
                        value={newClub.formUrl}
                        onChange={e => setNewClub({...newClub, formUrl: e.target.value})}
                        className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        placeholder="https://forms.google.com/..."
                        required
                        aria-label="Form URL"
                      />
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Add a recruitment form link.</p>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Status <FiTag className="inline text-gray-400" /></label>
                    <select
                      value={newClub.status}
                      onChange={e => setNewClub({...newClub, status: e.target.value as 'Open' | 'Closed'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      required
                      aria-label="Recruitment Status"
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select the current status of the recruitment.</p>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Contact Info</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={newClub.contactInfo.name}
                        onChange={e => setNewClub({...newClub, contactInfo: {...newClub.contactInfo, name: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        placeholder="Contact Name"
                        aria-label="Contact Name"
                      />
                      <input
                        type="email"
                        value={newClub.contactInfo.email}
                        onChange={e => setNewClub({...newClub, contactInfo: {...newClub.contactInfo, email: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        placeholder="Contact Email"
                        aria-label="Contact Email"
                      />
                      <input
                        type="tel"
                        value={newClub.contactInfo.phone}
                        onChange={e => setNewClub({...newClub, contactInfo: {...newClub.contactInfo, phone: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        placeholder="Contact Phone"
                        aria-label="Contact Phone"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Image (Optional)</h3>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recruitment Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="club-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#3FA9F6] hover:text-blue-500 focus-within:outline-none">
                          <span>Upload file</span>
                          <input
                            id="club-file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                            disabled={!!newClub.image}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB. Recommended size: 1200x800px. Add a high-quality image that represents your club.</p>
                    </div>
                  </div>
                  {newClub.imagePreview && (
                    <div className="mt-2 flex gap-2">
                      <div className="relative">
                        <img src={newClub.imagePreview} alt="Club Preview" className="h-28 w-28 object-cover rounded-md" />
                        <button
                          type="button"
                          onClick={() => setNewClub({ ...newClub, image: undefined, imagePreview: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          aria-label="Remove image"
                        >
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setEditingClub(null); setNewClub({ title: '', description: '', clubName: '', startDate: '', endDate: '', formUrl: '', image: undefined, imagePreview: '', contactInfo: { name: '', email: '', phone: '' }, status: 'Open' }); }}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#181818] hover:bg-[#00C7A7] transition"
                  >
                    {editingClub ? 'Save Changes' : 'Add Recruitment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Club Details Modal */}
        {selectedClubForDetails && (
          <ClubDetails
            club={selectedClubForDetails}
            onClose={closeClubDetailsModal}
            onEdit={handleEditClub}
            onDelete={handleDeleteClub}
            isAdmin={user?.isAdmin}
          />
        )}
      </main>
    </div>
  );
};

export default ClubsRecruitment; 