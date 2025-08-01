import React, { useEffect, useState, useRef, useCallback } from 'react';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { FiSearch, FiX, FiClock, FiMapPin, FiUser, FiCalendar, FiMessageSquare, FiEdit2, FiTrash2, FiCheckCircle, FiInfo, FiTag, FiFileText, FiMail, FiAlertCircle } from 'react-icons/fi';
import SkeletonLoader from './SkeletonLoader';
import { API_BASE } from '../config';

interface LostFoundItem {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  type: 'lost' | 'found';
  title: string;
  description: string;
  location?: string;
  date: string;
  images: { public_id: string; url: string }[];
  resolved: boolean;
  contact?: string;
  createdAt: string;
  displayText?: string;
  formattedDate?: string;
  timeAgo?: string;
  userName?: string;
}

// Define a type for images in the modal form state
interface ModalImage {
  file?: File;
  previewUrl: string;
  existing?: { public_id: string; url: string };
  public_id?: string;
  url?: string;
}

const LostFound = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    type: 'lost',
    title: '',
    description: '',
    location: '',
    date: '',
    contact: '',
    images: [] as ModalImage[], // Update type to handle both new and existing images
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<LostFoundItem | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const itemsPerPage = 9; // Define how many items per page
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [filterResolved, setFilterResolved] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<LostFoundItem | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver(entries => {
        if (entries[0].isIntersecting && currentPage < totalPages) {
          setIsFetchingMore(true);
          setCurrentPage(prev => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    }, [isFetchingMore, currentPage, totalPages]);
  const [dragItem, setDragItem] = useState<number | null>(null);
  const [dragOverItem, setDragOverItem] = useState<number | null>(null);

  const openAddItemModal = () => {
    setEditingItem(null);
    setNewItem({
      type: 'lost',
      title: '',
      description: '',
      location: '',
      date: '',
      contact: '',
      images: [], // No images when adding
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditItemModal = (item: LostFoundItem) => {
    setEditingItem(item);
    const formattedDate = item.date ? new Date(item.date).toISOString().split('T')[0] : '';
    setNewItem({
      type: item.type,
      title: item.title,
      description: item.description,
      location: item.location || '',
      date: formattedDate,
      contact: item.contact || '',
      images: (item.images || []).map(img => ({
        existing: img,
        previewUrl: img.url,
        public_id: img.public_id,
        url: img.url,
      })),
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeItemModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setNewItem({
      type: 'lost',
      title: '',
      description: '',
      location: '',
      date: '',
      contact: '',
      images: [],
    });
    setFormError(null);
  };

  const fetchItems = async () => {
    try {
      setLoading(currentPage === 1);
      setError(null);
      const url = new URL(`${API_BASE}/api/lostfound`);
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', itemsPerPage.toString());
      if (searchQuery) {
        url.searchParams.append('search', searchQuery);
      }
      if (filterType !== 'all') {
        url.searchParams.append('type', filterType);
      }
      if (filterResolved !== 'all') {
        url.searchParams.append('resolved', filterResolved === 'resolved' ? 'true' : 'false');
      }
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMessage = data.message || `Error fetching items: ${response.statusText}`;
        throw new Error(errorMessage);
      }
      if (currentPage === 1) {
        setItems(data.items);
      } else {
        setItems(prev => [...prev, ...data.items]);
      }
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error('Error fetching lost and found items:', err);
      setError(err.message || 'Failed to fetch lost and found items.');
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchItems();
    }
    // eslint-disable-next-line
  }, [token, searchQuery, currentPage, filterType, filterResolved]);

  const handleDeleteItem = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/lostfound/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete item');
      }
      setItems(items.filter(i => i._id !== id));
      setSelectedItemForDetails(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete item');
    }
  };

  const handleMarkResolved = async (id: string) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/api/lostfound/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to mark as resolved');
      }
      const updated = await response.json();
      setItems(items.map(i => i._id === id ? { ...i, resolved: true } : i));
      setSelectedItemForDetails(prev => prev ? { ...prev, resolved: true } : prev);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to mark as resolved');
    }
  };

  // Drag-and-drop logic for images
  const handleDragStart = (index: number) => setDragItem(index);
  const handleDragEnter = (index: number) => setDragOverItem(index);
  const handleDragEnd = () => {
    if (dragItem === null || dragOverItem === null) return;
    const newImages = [...newItem.images];
    const dragged = newImages.splice(dragItem, 1)[0];
    newImages.splice(dragOverItem, 0, dragged);
    setNewItem({ ...newItem, images: newImages });
    setDragItem(null);
    setDragOverItem(null);
  };

  const renderStatus = (type: 'lost' | 'found', resolved: boolean) => {
    return (
      <div className="flex gap-2">
        <span className={`text-xs px-2 py-1 rounded-full ${
          type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}>
          {type === 'lost' ? 'Lost Item' : 'Found Item'}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          resolved ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {resolved ? 'Resolved' : 'Unresolved'}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-12 py-8 pt-24">
          <h1 className="text-h2 font-extrabold text-black mb-6">Lost and Found</h1>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <div className="h-10 bg-gray-200 rounded-full w-32 animate-pulse mb-4 sm:mb-0"></div>
            <div className="w-full sm:w-1/3">
              <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div className="h-10 bg-gray-200 rounded-md w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded-md w-32 animate-pulse"></div>
          </div>
          <SkeletonLoader variant="lostfound" />
        </main>
      </div>
    );
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-white font-sans"><p>Error: {error}</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[100px]">
        {/* Top Bar: Heading + Add Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-h2 font-extrabold text-black">Lost and Found</h1>
          <button
            onClick={openAddItemModal}
            aria-label="Add New Item"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white font-bold text-lg shadow hover:bg-[#00C6A7] transition"
          >
            + Add New Item
          </button>
        </div>
        {/* Filter/Search Row - Enhanced Responsiveness */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 px-4 md:px-0">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as 'all' | 'lost' | 'found')}
              // Enhanced styling for rounded corners and border
              className="px-4 py-2 rounded-md bg-gray-100 text-black font-medium border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            >
              <option value="all">All Types</option>
              <option value="lost">Lost Items</option>
              <option value="found">Found Items</option>
            </select>
            <select
              value={filterResolved}
              onChange={e => setFilterResolved(e.target.value as 'all' | 'resolved' | 'unresolved')}
              // Enhanced styling for rounded corners and border
              className="px-4 py-2 rounded-md bg-gray-100 text-black font-medium border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            >
              <option value="all">All Statuses</option>
              <option value="unresolved">Unresolved</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          {/* Search Bar */}
          <form className="relative w-full md:w-[500px] flex rounded-full border border-gray-300 overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-black focus-within:border-black" onSubmit={e => { e.preventDefault(); setSearchQuery(searchInput); }}>
            <div className="relative flex items-center flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, description, or location..."
                className="w-full pl-10 pr-4 py-2 bg-white text-black outline-none text-lg border-none"
                aria-label="Search lost and found items"
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
          {items.map((item, idx) => (
            <div
              key={item._id}
              ref={idx === items.length - 1 ? lastItemRef : undefined}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group"
              onClick={() => setSelectedItemForDetails(item)}
            >
              {/* Image Section with Overlay */}
              <div className="relative h-60 sm:h-80 overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <>
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50">
                    <span className="text-5xl text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v10.5A2.25 2.25 0 0113.5 21h-3a2.25 2.25 0 01-2.25-2.25V9m7.5 0H6.75m8.25 0H18m-12 0h2.25" />
                      </svg>
                    </span>
                  </div>
                )}
                {/* Status Badges - Now positioned over the image */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm ${
                    item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
                  </span>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm ${
                    item.resolved ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {item.resolved ? 'Resolved' : 'Unresolved'}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{item.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>

                {/* Meta Info Row - Location, Date, User */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  {item.location && (
                    <div className="flex items-center text-sm text-gray-500">
                      <FiMapPin className="mr-2 flex-shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}
                  {item.date && (
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="mr-2 flex-shrink-0" />
                      <span>{new Date(item.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                  )}
                  {item.user?.name && (
                    <div className="flex items-center text-sm text-gray-500">
                      <FiUser className="mr-2 flex-shrink-0" />
                      <span className="truncate">Posted by {item.user.name}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {token && (user?.email === item.user?.email || user?.email === 'gauravkhandelwal205@gmail.com') && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-100">
                    {!item.resolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkResolved(item._id);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200 text-sm sm:text-base min-w-0"
                      >
                        <FiCheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">Mark Resolved</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditItemModal(item);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm sm:text-base min-w-0"
                    >
                      <FiEdit2 className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Edit</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem(item._id);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors duration-200 text-sm sm:text-base min-w-0"
                    >
                      <FiTrash2 className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {isFetchingMore && (
          <div className="flex justify-center items-center mt-8">
            <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h2>
                <button
                  onClick={closeItemModal}
                  aria-label="Close"
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-200 text-black absolute top-4 right-4 z-50 transition-all duration-150 focus:outline-none"
                >
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {formError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-700">
                    <FiAlertCircle className="w-5 h-5 mr-2" />
                    <span>{formError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setFormError(null);

                // Validate required fields
                if (!newItem.title.trim()) {
                  setFormError('Title is required');
                  setLoading(false);
                  return;
                }
                if (!newItem.description.trim()) {
                  setFormError('Description is required');
                  setLoading(false);
                  return;
                }
                if (!newItem.date) {
                  setFormError('Date is required');
                  setLoading(false);
                  return;
                }
                if (!newItem.contact.trim()) {
                  setFormError('Contact information is required');
                  setLoading(false);
                  return;
                }

                const formData = new FormData();
                formData.append('type', newItem.type);
                formData.append('title', newItem.title.trim());
                formData.append('description', newItem.description.trim());
                formData.append('location', newItem.location.trim());
                formData.append('date', newItem.date);
                formData.append('contact', newItem.contact.trim());
                newItem.images.forEach((image) => {
                  if (image.file) {
                    formData.append('images', image.file);
                  }
                });
                if (editingItem) {
                  const keepPublicIds = newItem.images.filter(img => img.public_id).map(img => img.public_id);
                  formData.append('keepImages', JSON.stringify(keepPublicIds));
                }

                try {
                  const response = await fetch(`${API_BASE}/api/lostfound${editingItem ? '/' + editingItem._id : ''}`, {
                    method: editingItem ? 'PUT' : 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                    body: formData,
                  });

                  const data = await response.json();

                  if (response.ok) {
                    if (editingItem) {
                      setItems(items.map(i => i._id === editingItem._id ? data : i));
                    } else {
                      setItems([data, ...items]);
                    }
                    closeItemModal();
                  } else {
                    setFormError(data.message || 'Failed to save item.');
                  }
                } catch (err: any) {
                  console.error('Error saving item:', err);
                  setFormError('An error occurred while saving the item.');
                } finally {
                  setLoading(false);
                }
              }} className="space-y-8">
                {/* Item Details Section */}
                <div className="border-b pb-6 mb-6 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">Item Details <FiInfo className="text-gray-400" title="Fill in the details of your lost or found item." /></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Type <FiTag className="inline text-gray-400" /></label>
                      <select
                        value={newItem.type}
                        onChange={(e) => setNewItem({...newItem, type: e.target.value as 'lost' | 'found'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                        aria-label="Item Type"
                      >
                        <option value="lost">Lost Item</option>
                        <option value="found">Found Item</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Select whether you lost or found the item.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Date <FiCalendar className="inline text-gray-400" /></label>
                      <input
                        type="date"
                        value={newItem.date}
                        onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                        className={`w-full px-3 py-2 border ${!newItem.date && formError ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                        required
                        aria-label="Item Date"
                      />
                      <p className="text-xs text-gray-500 mt-1">When was the item lost or found?</p>
                      {!newItem.date && formError && <p className="text-xs text-red-500 mt-1">Date is required.</p>}
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Title <FiTag className="inline text-gray-400" /></label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newItem.title}
                        onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                        className={`w-full px-10 py-2 border ${!newItem.title.trim() && formError ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                        placeholder="e.g. Black Wallet, Red Backpack"
                        required
                        aria-label="Item Title"
                      />
                      <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Give a short, descriptive title for the item.</p>
                    {!newItem.title.trim() && formError && <p className="text-xs text-red-500 mt-1">Title is required.</p>}
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Description <FiFileText className="inline text-gray-400" /></label>
                    <div className="relative">
                      <textarea
                        value={newItem.description}
                        onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                        className={`w-full px-10 py-2 border ${!newItem.description.trim() && formError ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                        rows={4}
                        placeholder="Describe the item, any unique features, etc."
                        required
                        aria-label="Item Description"
                      ></textarea>
                      <FiFileText className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Provide details to help identify the item.</p>
                    {!newItem.description.trim() && formError && <p className="text-xs text-red-500 mt-1">Description is required.</p>}
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Location (Optional) <FiMapPin className="inline text-gray-400" /></label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newItem.location}
                        onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                        className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        placeholder="Where was the item lost/found?"
                        aria-label="Item Location"
                      />
                      <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Be as specific as possible (e.g. Library, Canteen, Room 101).</p>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">Contact <FiInfo className="text-gray-400" title="Contact is linked to your account." /></h3>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Contact Information <FiMail className="inline text-gray-400" /></label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newItem.contact}
                      onChange={(e) => setNewItem({...newItem, contact: e.target.value})}
                      className={`w-full px-10 py-2 border ${!newItem.contact.trim() && formError ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                      placeholder="Email or phone number"
                      required
                      aria-label="Contact Information"
                    />
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">How can someone reach you if they have information?</p>
                  {!newItem.contact.trim() && formError && <p className="text-xs text-red-500 mt-1">Contact information is required.</p>}
                </div>

                {/* Images Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Images (Optional, Max 5)</h3>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-[#3FA9F6] hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={(e) => {
                              if (e.target.files) {
                                const filesArray = Array.from(e.target.files).slice(0, 5 - newItem.images.length);
                                setNewItem({
                                  ...newItem,
                                  images: [
                                    ...newItem.images,
                                    ...filesArray.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))
                                  ]
                                });
                              }
                            }}
                            disabled={newItem.images.length >= 5}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each. Add clear images to help identify the item.</p>
                    </div>
                  </div>
                  {newItem.images.length > 0 && (
                    <div className="mt-2 grid grid-cols-5 gap-2">
                      {newItem.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative cursor-move"
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragEnter={() => handleDragEnter(index)}
                          onDragEnd={handleDragEnd}
                          onDragOver={e => e.preventDefault()}
                        >
                          <img
                            src={image.previewUrl}
                            alt={`Preview ${index + 1}`}
                            className="h-28 w-28 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => setNewItem({ ...newItem, images: newItem.images.filter((_, i) => i !== index) })}
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
                    onClick={closeItemModal}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#181818] hover:bg-[#00C6A7] transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editingItem ? 'Saving...' : 'Adding...'}
                      </span>
                    ) : (
                      editingItem ? 'Save Changes' : 'Add Item'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Item Details Modal */}
      {selectedItemForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-3xl w-full mx-auto max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedItemForDetails(null)}
              aria-label="Close"
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-200 text-black absolute top-4 right-4 z-50 transition-all duration-150 focus:outline-none"
            >
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 pr-8">{selectedItemForDetails.title}</h2>

            {/* Image Gallery with zoom */}
            {selectedItemForDetails.images && selectedItemForDetails.images.length > 0 && (
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedItemForDetails.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`${selectedItemForDetails.title} image ${index + 1}`}
                    className="w-full h-64 object-cover rounded-md cursor-zoom-in hover:opacity-90 transition-opacity duration-200"
                    onClick={() => setZoomedImage(image.url)}
                  />
                ))}
              </div>
            )}

            {/* Details Section */}
            <div className="space-y-6 text-gray-700">
              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-2">
                {renderStatus(selectedItemForDetails.type, selectedItemForDetails.resolved)}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedItemForDetails.description}</p>
              </div>

              {/* Meta Info - Location, Date, Posted By */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                {selectedItemForDetails.location && (
                  <div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiMapPin className="w-5 h-5 mr-2 text-gray-500"/>
                      <span>{selectedItemForDetails.location}</span>
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FiCalendar className="w-5 h-5 mr-2 text-gray-500"/>
                    <span>{new Date(selectedItemForDetails.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
                {selectedItemForDetails.user?.name && selectedItemForDetails.createdAt && (
                  <div className="flex items-center text-sm text-gray-500">
                    <FiUser className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="truncate">Posted by {selectedItemForDetails.user.name} on {new Date(selectedItemForDetails.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Contact Information</p>
                <div className="flex items-center">
                  <FiMail className="w-5 h-5 mr-2 text-gray-500"/>
                  {selectedItemForDetails.contact && (selectedItemForDetails.contact.includes('@') ? (
                    <a href={`mailto:${selectedItemForDetails.contact}`} className="text-[#00C6A7] hover:underline">{selectedItemForDetails.contact}</a>
                  ) : (
                    <a href={`tel:${selectedItemForDetails.contact}`} className="text-[#00C6A7] hover:underline">{selectedItemForDetails.contact}</a>
                  ))}
                </div>
              </div>
            </div>

            {/* Owner/Admin Actions */}
            {(user && (user._id === selectedItemForDetails.user._id || user.email === 'gauravkhandelwal205@gmail.com')) && (
              <div className="flex gap-3 mt-6">
                {!selectedItemForDetails.resolved && (
                  <button
                    onClick={() => { setSelectedItemForDetails(null); openEditItemModal(selectedItemForDetails); }}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 flex items-center"
                  >
                    <FiEdit2 className="mr-1" /> Edit
                  </button>
                )}
                <button
                  onClick={() => handleDeleteItem(selectedItemForDetails._id)}
                  className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#F05A25] hover:bg-red-600 flex items-center"
                >
                  <FiTrash2 className="mr-1" /> Delete
                </button>
                {!selectedItemForDetails.resolved && (
                  <button
                    onClick={() => handleMarkResolved(selectedItemForDetails._id)}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#00C6A7] hover:bg-[#009e86] flex items-center"
                  >
                    <FiCheckCircle className="mr-1" /> Mark as Resolved
                  </button>
                )}
              </div>
            )}

            {/* Close button at the bottom for larger screens/better UX */}
            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedItemForDetails(null)}
                className="px-6 py-3 rounded-full font-bold text-white bg-[#181818] hover:bg-[#00C6A7] transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoomed Image Modal */}
      {zoomedImage && selectedItemForDetails && selectedItemForDetails.images && selectedItemForDetails.images.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={() => setZoomedImage(null)}>
          {/* Image */}
          <img 
            src={zoomedImage} 
            alt="Zoomed"
            className="max-h-[90vh] max-w-full lg:max-w-[80vw] rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
          />
          
          {/* Navigation Buttons */}
          {selectedItemForDetails.images.length > 1 && (
            <>
              {/* Previous Button */}
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/50 transition-colors duration-200 z-50"
                onClick={(e) => {
                  e.stopPropagation();
                  const currentIndex = selectedItemForDetails.images.findIndex(img => img.url === zoomedImage);
                  const prevIndex = (currentIndex - 1 + selectedItemForDetails.images.length) % selectedItemForDetails.images.length;
                  setZoomedImage(selectedItemForDetails.images[prevIndex].url);
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
                  const currentIndex = selectedItemForDetails.images.findIndex(img => img.url === zoomedImage);
                  const nextIndex = (currentIndex + 1) % selectedItemForDetails.images.length;
                  setZoomedImage(selectedItemForDetails.images[nextIndex].url);
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
    </div>
  );
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  
  return Math.floor(seconds) + ' seconds ago';
}

export default LostFound; 