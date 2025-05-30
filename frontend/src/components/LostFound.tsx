import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { FiSearch, FiX, FiClock, FiMapPin, FiUser, FiCalendar, FiMessageSquare, FiEdit2, FiTrash2, FiCheckCircle } from 'react-icons/fi';

// Define API_BASE locally for now to avoid process.env issue
const API_BASE = 'http://localhost:5000';

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
  displayText?: string; // Add this for suggestions
  formattedDate?: string;
  timeAgo?: string;
  userName?: string;
}

// Define a type for images in the modal form state
interface ModalImage {
  file?: File; // For new uploads
  existing?: { public_id: string; url: string }; // For existing images
  previewUrl: string; // Temporary URL for preview
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
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearchQuery, setAppliedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 9; // Define how many items per page
  const [suggestions, setSuggestions] = useState<LostFoundItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found'>('all');
  const [filterResolved, setFilterResolved] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<LostFoundItem | null>(null);

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
      images: item.images.map(img => ({ existing: img, previewUrl: img.url })), // Populate with existing images as ModalImage type
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

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use the locally defined API_BASE
        const url = new URL(`${API_BASE}/api/lostfound`);
        url.searchParams.append('page', currentPage.toString());
        url.searchParams.append('limit', itemsPerPage.toString());
        if (appliedSearchQuery) {
            url.searchParams.append('search', appliedSearchQuery);
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
          // Use backend error message if available, otherwise a generic one
          const errorMessage = data.message || `Error fetching items: ${response.statusText}`;
          throw new Error(errorMessage);
        }
        
        setItems(data.items);
        setTotalPages(data.totalPages);
      } catch (err: any) {
        console.error('Error fetching lost and found items:', err);
        setError(err.message || 'Failed to fetch lost and found items.'); // Set error state with specific or generic message
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchItems();
    }
  }, [token, appliedSearchQuery, currentPage, filterType, filterResolved]); // Depend on appliedSearchQuery

  // Effect to fetch suggestions as search query changes (with a debounce)
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const url = new URL(`${API_BASE}/api/lostfound/suggestions`);
        url.searchParams.append('query', searchQuery);

        const response = await fetch(url.toString(), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error fetching suggestions: ${response.statusText}`);
        }

        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (token) {
        fetchSuggestions();
      }
    }, 300); // Debounce API call by 300ms

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, token]); // Refetch suggestions when searchQuery or token changes

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      // Show suggestions if there's a query
      if (e.target.value.trim()) {
          setShowSuggestions(true);
      } else {
          setShowSuggestions(false);
      }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault(); // Prevent default form submission refresh
      setAppliedSearchQuery(searchQuery); // Apply the search query to filter items
      setCurrentPage(1); // Reset to first page on search
  };

  const handleSuggestionClick = (suggestion: LostFoundItem) => {
      const selectedQuery = suggestion.title || suggestion.description || '';
      setSearchQuery(selectedQuery); // Update input field
      setAppliedSearchQuery(selectedQuery); // Apply the selected suggestion as the search query
      setSuggestions([]); // Clear suggestions
      setShowSuggestions(false);
      setCurrentPage(1); // Reset to first page on suggestion selection
  };

  // Add keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const currentIndex = suggestions.findIndex(s => s.title === searchQuery);
          let newIndex;
          
          if (e.key === 'ArrowDown') {
              newIndex = currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0;
          } else {
              newIndex = currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1;
          }
          
          if (suggestions[newIndex]) {
              setSearchQuery(suggestions[newIndex].title);
          }
      } else if (e.key === 'Enter') {
          e.preventDefault();
          if (suggestions.length > 0) {
              handleSuggestionClick(suggestions[0]);
          } else {
              handleSearchSubmit(e as any);
          }
      } else if (e.key === 'Escape') {
          setShowSuggestions(false);
      }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white font-sans"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-white font-sans"><p>Error: {error}</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      <main className="flex-1 container mx-auto px-12 py-8 pt-24">
        <h1 className="text-h2 font-extrabold text-black mb-6">Lost and Found</h1>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <button
            onClick={openAddItemModal}
            className="mb-4 sm:mb-0 px-6 py-3 rounded-full font-bold text-white bg-[#181818] shadow-lg hover:bg-[#00C6A7] transition"
          >
            Add New Item
          </button>
           <div className="w-full sm:w-1/3">
             <form onSubmit={handleSearchSubmit} className="relative">
                <div className="relative flex items-center">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, description, or location..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleKeyDown}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => searchQuery && suggestions.length > 0 && setShowSuggestions(true)}
                  />
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-96 overflow-auto">
                    {suggestions.map(suggestion => (
                      <li
                        key={suggestion._id}
                        className={`px-4 py-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                          suggestion.title === searchQuery ? 'bg-gray-50' : ''
                        }`}
                        onMouseDown={() => handleSuggestionClick(suggestion)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{suggestion.title}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                suggestion.type === 'lost' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {suggestion.type}
                              </span>
                              {suggestion.resolved && (
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                  Resolved
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{suggestion.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              {suggestion.location && (
                                <div className="flex items-center">
                                  <FiMapPin className="mr-1" />
                                  <span>{suggestion.location}</span>
                                </div>
                              )}
                              <div className="flex items-center">
                                <FiClock className="mr-1" />
                                <span>{suggestion.timeAgo}</span>
                              </div>
                              <span>Posted by {suggestion.userName}</span>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {showSuggestions && suggestions.length === 0 && searchQuery && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 p-4 text-center text-gray-500">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </form>
            </div>
        </div>
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">Type:</label>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'all' | 'lost' | 'found')}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
                >
                    <option value="all">All Types</option>
                    <option value="lost">Lost Items</option>
                    <option value="found">Found Items</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Status:</label>
                <select
                    value={filterResolved}
                    onChange={(e) => setFilterResolved(e.target.value as 'all' | 'resolved' | 'unresolved')}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
                >
                    <option value="all">All Statuses</option>
                    <option value="resolved">Resolved</option>
                    <option value="unresolved">Unresolved</option>
                </select>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div 
              key={item._id} 
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
              onClick={() => setSelectedItemForDetails(item)}
            >
              {/* Image Section */}
              {item.images && item.images.length > 0 ? (
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.images[0].url} 
                    alt={item.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {item.resolved && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                      <FiCheckCircle className="mr-1" /> Resolved
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}

              {/* Content Section */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-bold text-gray-900 truncate">{item.title}</h2>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.type === 'lost' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.type}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

                {/* Details Section */}
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  {item.location && (
                    <div className="flex items-center">
                      <FiMapPin className="mr-2 flex-shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <FiCalendar className="mr-2 flex-shrink-0" />
                    <span>{new Date(item.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center">
                    <FiUser className="mr-2 flex-shrink-0" />
                    <span>Posted by {item.user.name}</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="mr-2 flex-shrink-0" />
                    <span>{getTimeAgo(new Date(item.createdAt))}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {user && item.user && item.user._id === user.id && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                    {!item.resolved && (
                      <>
                        <button
                          onClick={() => {
                            const markAsResolved = async () => {
                              try {
                                const response = await fetch(`${API_BASE}/api/lostfound/${item._id}/resolve`, {
                                  method: 'PUT',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                  },
                                });
                                const data = await response.json();

                                if (!response.ok) {
                                  const errorMessage = data.message || `Error marking item as resolved: ${response.statusText}`;
                                  throw new Error(errorMessage);
                                }
                                setItems(items.map(i => i._id === item._id ? {...i, resolved: true} : i));
                                // Optionally show a success message here
                              } catch (err: any) {
                                console.error('Error marking item as resolved:', err);
                                setError(err.message || 'Failed to mark item as resolved.');
                              }
                            };
                            markAsResolved();
                          }}
                          className="flex-1 px-3 py-2 rounded-full text-sm font-semibold text-white bg-[#181818] hover:bg-[#00C6A7] transition-colors duration-200 flex items-center justify-center"
                        >
                          <FiCheckCircle className="mr-1" /> Mark Resolved
                        </button>
                        <button
                          onClick={() => openEditItemModal(item)}
                          className="flex-1 px-3 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                        >
                          <FiEdit2 className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => {
                            const deleteItem = async () => {
                              try {
                                const response = await fetch(`${API_BASE}/api/lostfound/${item._id}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                  },
                                });
                                const data = await response.json();

                                if (!response.ok) {
                                  const errorMessage = data.message || `Error deleting item: ${response.statusText}`;
                                  throw new Error(errorMessage);
                                }
                                setItems(items.filter(i => i._id !== item._id));
                                setSelectedItemForDetails(null); // Close details modal after deletion
                                // Optionally show a success message here
                              } catch (err: any) {
                                console.error('Error deleting item:', err);
                                setError(err.message || 'Failed to delete item.');
                              }
                            };
                            if (window.confirm('Are you sure you want to delete this item?')) {
                              deleteItem();
                            }
                          }}
                          className="flex-1 px-3 py-2 rounded-full text-sm font-semibold text-white bg-[#F05A25] hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                        >
                          <FiTrash2 className="mr-1" /> Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-full font-bold text-white bg-[#181818] hover:bg-[#00C6A7] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-black text-sm font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-full font-bold text-white bg-[#181818] hover:bg-[#00C6A7] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingItem ? 'Edit Item' : 'Add New Item'}
                </h2>
                <button
                  onClick={closeItemModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              {formError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-700">
                    <FiX className="w-5 h-5 mr-2" />
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
                  } else if (image.existing) {
                    formData.append('images', JSON.stringify(image.existing));
                  }
                });

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
                    // Optionally show a success message here
                  } else {
                    setFormError(data.message || 'Failed to save item.'); // Use backend message for form errors
                  }
                } catch (err: any) {
                  console.error('Error saving item:', err);
                  setFormError('An error occurred while saving the item.'); // Generic message for unexpected errors
                } finally {
                  setLoading(false);
                }
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newItem.type}
                      onChange={(e) => setNewItem({...newItem, type: e.target.value as 'lost' | 'found'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    >
                      <option value="lost">Lost Item</option>
                      <option value="found">Found Item</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={newItem.date}
                      onChange={(e) => setNewItem({...newItem, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newItem.title}
                    onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    placeholder="Enter a descriptive title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    rows={4}
                    placeholder="Provide detailed description of the item"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
                  <input
                    type="text"
                    value={newItem.location}
                    onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    placeholder="Where was the item lost/found?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                  <input
                    type="text"
                    value={newItem.contact}
                    onChange={(e) => setNewItem({...newItem, contact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    placeholder="Email or phone number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images (Optional, Max 5)
                  </label>
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
                                const filesArray = Array.from(e.target.files).slice(0, 5);
                                setNewItem({
                                  ...newItem,
                                  images: filesArray.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))
                                });
                              }
                            }}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB each
                      </p>
                    </div>
                  </div>
                  {newItem.images.length > 0 && (
                    <div className="mt-2 grid grid-cols-5 gap-2">
                      {newItem.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.previewUrl}
                            alt={`Preview ${index + 1}`}
                            className="h-20 w-20 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setNewItem({
                                ...newItem,
                                images: newItem.images.filter((_, i) => i !== index)
                              });
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <FiX className="w-3 h-3" />
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
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#181818] hover:bg-[#00C6A7] transition ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
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
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-3xl w-full mx-auto max-h-[90vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedItemForDetails(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 pr-8">{selectedItemForDetails.title}</h2>

            {/* Image Gallery */}
            {selectedItemForDetails.images && selectedItemForDetails.images.length > 0 && (
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedItemForDetails.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={`${selectedItemForDetails.title} image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-md"
                  />
                ))}
              </div>
            )}

            {/* Details Section */}
            <div className="space-y-4 text-gray-700">
              <div className="flex flex-wrap items-center gap-4">
                 <span className={`text-sm px-3 py-1 rounded-full ${
                    selectedItemForDetails.type === 'lost'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {selectedItemForDetails.type === 'lost' ? 'Lost Item' : 'Found Item'}
                  </span>
                   <span className={`text-sm px-3 py-1 rounded-full ${
                    selectedItemForDetails.resolved
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedItemForDetails.resolved ? 'Resolved' : 'Unresolved'}
                  </span>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                <p>{selectedItemForDetails.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedItemForDetails.location && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                    <p>{selectedItemForDetails.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Date</p>
                  <p>{new Date(selectedItemForDetails.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Contact Information</p>
                <p>{selectedItemForDetails.contact}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Posted By</p>
                  <p>{selectedItemForDetails.user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Posted At</p>
                  <p>{getTimeAgo(new Date(selectedItemForDetails.createdAt))}</p>
                </div>
              </div>
            </div>

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