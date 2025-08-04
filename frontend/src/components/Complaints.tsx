import React, { useEffect, useState, useRef, useCallback } from 'react';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiAlertCircle, FiCheckCircle, FiUser, FiCalendar, FiTag, FiFileText, FiSearch, FiInfo } from 'react-icons/fi';
import UniversalLoader from './UniversalLoader';
import { useDataLoading } from '../hooks/useLoading';
import { format } from 'date-fns';
import { API_BASE } from '../config';

interface Complaint {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  title: string;
  description: string;
  category: 'Academic' | 'Administrative' | 'Facilities' | 'IT' | 'Security' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  department: 'Academic Affairs' | 'Administration' | 'Facilities Management' | 'IT Services' | 'Security' | 'Student Services';
  assignedTo?: {
    _id: string;
    name: string;
  };
  estimatedResolutionTime?: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  statusHistory: Array<{
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    comment?: string;
    updatedBy: {
      _id: string;
      name: string;
    };
    timestamp: string;
  }>;
  createdAt: string;
  lastUpdated: string;
  images?: { url: string }[];
}

interface ModalImage {
  file?: File;
  previewUrl: string;
  existing?: { public_id: string; url: string };
  public_id?: string;
  url?: string;
}

const Complaints = () => {
  const { isLoading, error: loadingError, steps, startLoading, stopLoading, setError: setLoadingError } = useDataLoading();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();
  
  // Debug: Log user object
  console.log('Complaints component - User object:', user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    category: 'Other' as Complaint['category'],
    priority: 'Medium' as Complaint['priority'],
    department: 'Student Services' as Complaint['department'],
    status: 'Open' as Complaint['status'],
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [selectedComplaintForDetails, setSelectedComplaintForDetails] = useState<Complaint | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Open' | 'In Progress' | 'Resolved' | 'Closed'>('All');
  const [filterCategory, setFilterCategory] = useState<'all' | 'Academic' | 'Administrative' | 'Facilities' | 'IT' | 'Security' | 'Other'>('all');
  const [images, setImages] = useState<ModalImage[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 9;
  const observer = useRef<IntersectionObserver | null>(null);
  const lastComplaintRef = useCallback(
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

  const fetchComplaints = async () => {
    if (!token) return;
    try {
      if (currentPage === 1) {
        startLoading();
      }
      setError(null);
      const url = new URL(`${API_BASE}/api/complaints`);
      if (filterStatus !== 'All') {
        url.searchParams.append('status', filterStatus);
      }
      if (searchQuery.trim()) {
        url.searchParams.append('search', searchQuery.trim());
      }
      url.searchParams.append('page', currentPage.toString());
      url.searchParams.append('limit', itemsPerPage.toString());
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch complaints.');
      }
      if (currentPage === 1) {
        setComplaints(data.complaints);
      } else {
        setComplaints(prev => [...prev, ...data.complaints]);
      }
      setTotalPages(data.totalPages);
    } catch (err: any) {
      console.error('Error fetching complaints:', err);
      setError(err.message || 'Failed to fetch complaints.');
    } finally {
      if (currentPage === 1) {
        stopLoading();
      }
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery]);

  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line
  }, [token, filterStatus, searchQuery, currentPage]);

  const openAddComplaintModal = () => {
    setEditingComplaint(null);
    setNewComplaint({
      title: '',
      description: '',
      category: 'Other' as Complaint['category'],
      priority: 'Medium' as Complaint['priority'],
      department: 'Student Services' as Complaint['department'],
      status: 'Open' as Complaint['status'],
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditComplaintModal = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setNewComplaint({
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      priority: complaint.priority,
      department: complaint.department,
      status: complaint.status,
    });
    setImages(
      (complaint.images || []).map(img => ({
        existing: img,
        previewUrl: img.url,
        public_id: img.public_id,
        url: img.url,
      }))
    );
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeComplaintModal = () => {
    setIsModalOpen(false);
    setEditingComplaint(null);
    setNewComplaint({
      title: '',
      description: '',
      category: 'Other' as Complaint['category'],
      priority: 'Medium' as Complaint['priority'],
      department: 'Student Services' as Complaint['department'],
      status: 'Open' as Complaint['status'],
    });
    setFormError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewComplaint({ ...newComplaint, [name]: value });
  };

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOverItem.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newImages = [...images];
    const dragged = newImages.splice(dragItem.current, 1)[0];
    newImages.splice(dragOverItem.current, 0, dragged);
    setImages(newImages);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleSaveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    if (!newComplaint.title.trim() || !newComplaint.description.trim()) {
      setFormError('Title and description are required.');
      setIsSubmitting(false);
      return;
    }

    const method = editingComplaint ? 'PUT' : 'POST';
    const url = editingComplaint ? `${API_BASE}/api/complaints/${editingComplaint._id}` : `${API_BASE}/api/complaints`;

    try {
      const formData = new FormData();
      formData.append('title', newComplaint.title.trim());
      formData.append('description', newComplaint.description.trim());
      formData.append('category', newComplaint.category);
      formData.append('priority', newComplaint.priority);
      formData.append('department', newComplaint.department);
      formData.append('status', newComplaint.status);
      
      // Append new images
      images.forEach((image) => {
        if (image.file) {
          formData.append('images', image.file);
        }
      });
      
      // For edit: send public_ids of existing images to keep
      if (editingComplaint) {
        const keepPublicIds = images.filter(img => img.public_id).map(img => img.public_id);
        formData.append('keepImages', JSON.stringify(keepPublicIds));
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      const data = await response.json();
      if (response.ok) {
        if (editingComplaint) {
          setComplaints(complaints.map(comp => comp._id === editingComplaint._id ? data : comp));
        } else {
          setComplaints([data, ...complaints]);
        }
        closeComplaintModal();
        setImages([]);
      } else {
        setFormError(data.message || 'Failed to save complaint.');
      }
    } catch (err: any) {
      console.error('Error saving complaint:', err);
      setFormError('An error occurred while saving the complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComplaint = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        setIsSubmitting(true);
        setError(null);
        const response = await fetch(`${API_BASE}/api/complaints/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to delete complaint.');
        }
        setComplaints(complaints.filter(comp => comp._id !== id));
        setSelectedComplaintForDetails(null); // Close details modal if open
        // Optionally show a success message
      } catch (err: any) {
        console.error('Error deleting complaint:', err);
        setError(err.message || 'Failed to delete complaint.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderStatus = (status: Complaint['status']) => {
    switch (status) {
      case 'Open':
        return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">Open</span>;
      case 'In Progress':
        return <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">In Progress</span>;
      case 'Resolved':
        return <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">Resolved</span>;
      case 'Closed':
        return <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">Closed</span>;
      default:
        return null;
    }
  };

  const renderStatusHistory = (history: Complaint['statusHistory']) => {
    return (
      <div className="space-y-2">
        {history.map((update, index) => (
          <div key={index} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">{update.status}</span>
              <span className="text-sm text-gray-500">
                {format(new Date(update.timestamp), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            {update.comment && (
              <p className="text-sm text-gray-600 mt-1">{update.comment}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Updated by: {update.updatedBy.name}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderComplaintDetails = (complaint: Complaint) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{complaint.title}</h3>
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(complaint.status)}`}>
            {complaint.status}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{complaint.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Priority</p>
            <p className="font-medium">{complaint.priority}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="font-medium">{complaint.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Assigned To</p>
            <p className="font-medium">{complaint.assignedTo?.name || 'Not Assigned'}</p>
          </div>
        </div>

        {complaint.estimatedResolutionTime && (
          <div>
            <p className="text-sm text-gray-500">Estimated Resolution Time</p>
            <p className="font-medium">
              {format(new Date(complaint.estimatedResolutionTime), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500">Description</p>
          <p className="mt-1">{complaint.description}</p>
        </div>

        {complaint.images && complaint.images.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Images</p>
            <div className="grid grid-cols-2 gap-2">
              {complaint.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Complaint image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg cursor-pointer"
                  onClick={() => setZoomedImage(image.url)}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500 mb-2">Status History</p>
          {renderStatusHistory(complaint.statusHistory)}
        </div>
      </div>
    );
  };

  if (isLoading && complaints.length === 0) {
    return (
      <UniversalLoader
        variant="page"
        title="Loading Complaints"
        subtitle="Fetching complaint data..."
        showSteps={true}
        steps={steps}
        error={loadingError}
        onRetry={() => window.location.reload()}
        size="large"
      />
    );
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-white font-sans"><p className="text-red-500">Error: {error}</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[100px]">
        {/* Top Bar: Heading + Add Button */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-h2 font-extrabold text-black">College Complaints</h1>
          <button
            onClick={openAddComplaintModal}
            aria-label="Add Complaint"
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white font-bold text-lg shadow hover:bg-[#00C6A7] transition"
          >
            + Add Complaint
          </button>
        </div>
        {/* Filter/Search Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 px-4 md:px-0">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Filter by Category */}
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value as any)}
              // Enhanced styling for rounded corners and border
              className="px-4 py-2 rounded-md bg-gray-100 text-black font-medium border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            >
              <option value="Academic">Academic</option>
              <option value="Administrative">Administrative</option>
              <option value="Facilities">Facilities</option>
              <option value="IT">IT</option>
              <option value="Security">Security</option>
              <option value="Other">Other</option>
            </select>
            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as 'all' | 'Open' | 'InProgress' | 'Resolved' | 'Closed')}
              // Enhanced styling for rounded corners and border
              className="px-4 py-2 rounded-md bg-gray-100 text-black font-medium border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <form className="relative w-full md:w-[500px] flex rounded-full border border-gray-300 overflow-hidden shadow-sm focus-within:ring-1 focus-within:ring-black focus-within:border-black" onSubmit={e => { e.preventDefault(); setSearchQuery(searchInput); }}>
            <div className="relative flex items-center flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, description, or location..."
                className="w-full pl-10 pr-4 py-2 bg-white text-black outline-none text-lg border-none"
                aria-label="Search complaints"
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
          {complaints.map((complaint, idx) => (
            <div
              key={complaint._id}
              ref={idx === complaints.length - 1 ? lastComplaintRef : undefined}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group"
              onClick={() => setSelectedComplaintForDetails(complaint)}
            >
              {/* Image Section with Overlay */}
              <div className="relative h-60 sm:h-80 overflow-hidden">
                {complaint.images && complaint.images.length > 0 ? (
                  <>
                    <img
                      src={complaint.images[0].url}
                      alt={complaint.title}
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
                {/* Status and Priority Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm ${
                    complaint.status === 'Open' ? 'bg-red-100 text-red-800' :
                    complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {complaint.status}
                  </span>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm ${
                    complaint.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                    complaint.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                    complaint.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {complaint.priority} Priority
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{complaint.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{complaint.description}</p>

                {/* Meta Info Row */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <FiTag className="mr-2 flex-shrink-0" />
                    <span className="truncate">{complaint.category}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FiUser className="mr-2 flex-shrink-0" />
                    <span className="truncate">Posted by {complaint.user.name}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FiCalendar className="mr-2 flex-shrink-0" />
                    <span>{new Date(complaint.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {(() => {
                  // Check if user can edit/delete this complaint
                  const canEdit = user && complaint.user && (
                    // User owns the complaint OR user is admin
                    complaint.user._id === user._id || 
                    complaint.user._id === user.id || 
                    user.isAdmin
                  ) && !['Resolved', 'Closed'].includes(complaint.status);
                  
                  // Debug logging for admin functionality
                  console.log('Complaint authorization check:', {
                    user: user ? { _id: user._id, id: user.id, isAdmin: user.isAdmin, email: user.email } : null,
                    complaintUser: complaint.user ? { _id: complaint.user._id } : null,
                    status: complaint.status,
                    canEdit,
                    userOwns: complaint.user._id === user._id,
                    userOwnsAlt: user.id && complaint.user._id === user.id,
                    isAdmin: user.isAdmin,
                    statusOk: !['Resolved', 'Closed'].includes(complaint.status)
                  });
                  
                  return canEdit;
                })() && (
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditComplaintModal(complaint); }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm sm:text-base min-w-0"
                    >
                      <FiEdit2 className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Edit</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteComplaint(complaint._id); }}
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

        {/* Add/Edit Complaint Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingComplaint ? 'Edit Complaint' : 'Add New Complaint'}
                </h2>
                <button
                  onClick={closeComplaintModal}
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

              <form onSubmit={handleSaveComplaint} className="space-y-8">
                {/* Complaint Details Section */}
                <div className="border-b pb-6 mb-6 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">Complaint Details <FiInfo className="text-gray-400" title="Fill in the details of your complaint." /></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Title */}
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Title <FiTag className="inline text-gray-400" /></label>
                      <div className="relative">
                        <input
                          type="text"
                          name="title"
                          value={newComplaint.title}
                          onChange={handleInputChange}
                          className={`w-full px-10 py-2 border ${!newComplaint.title.trim() && formError ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                          placeholder="e.g. Mess Food Issue, Hostel Cleanliness"
                          required
                          aria-label="Complaint Title"
                        />
                        <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Give a short, descriptive title for the complaint.</p>
                      {!newComplaint.title.trim() && formError && <p className="text-xs text-red-500 mt-1">Title is required.</p>}
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Category <FiTag className="inline text-gray-400" /></label>
                      <select
                        name="category"
                        value={newComplaint.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                        aria-label="Complaint Category"
                      >
                        <option value="Academic">Academic</option>
                        <option value="Administrative">Administrative</option>
                        <option value="Facilities">Facilities</option>
                        <option value="IT">IT</option>
                        <option value="Security">Security</option>
                        <option value="Other">Other</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Select the category that best fits your complaint.</p>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Priority <FiTag className="inline text-gray-400" /></label>
                      <select
                        name="priority"
                        value={newComplaint.priority}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                        aria-label="Complaint Priority"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Indicate the urgency of the complaint.</p>
                    </div>

                    {/* Department (Admin Only - For now, just display/select) */}
                    {/* This would ideally be conditionally rendered/editable based on user role */}
                     <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Department <FiTag className="inline text-gray-400" /></label>
                      <select
                        name="department"
                        value={newComplaint.department}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                        aria-label="Assigned Department"
                      >
                        <option value="Academic Affairs">Academic Affairs</option>
                        <option value="Administration">Administration</option>
                        <option value="Facilities Management">Facilities Management</option>
                        <option value="IT Services">IT Services</option>
                        <option value="Security">Security</option>
                        <option value="Student Services">Student Services</option>
                      </select>
                       <p className="text-xs text-gray-500 mt-1">The department responsible for handling this complaint.</p>
                    </div>

                    {editingComplaint && ( // Only show status dropdown in edit mode
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          name="status"
                          value={newComplaint.status || editingComplaint.status}
                          onChange={(e) => setNewComplaint({ ...newComplaint, status: e.target.value as Complaint['status'] })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Update the status of the complaint.</p>
                      </div>
                    )}

                  </div>
                  {/* Description */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Description <FiFileText className="inline text-gray-400" /></label>
                    <div className="relative">
                      <textarea
                        name="description"
                        value={newComplaint.description}
                        onChange={handleInputChange}
                        className={`w-full px-10 py-2 border ${!newComplaint.description.trim() && formError ? 'border-red-400' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm`}
                        rows={4}
                        placeholder="Describe the issue, any relevant details, etc."
                        required
                        aria-label="Complaint Description"
                      ></textarea>
                      <FiFileText className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Provide details to help address the complaint.</p>
                    {!newComplaint.description.trim() && formError && <p className="text-xs text-red-500 mt-1">Description is required.</p>}
                  </div>
                </div>

                {/* Images Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Images (Optional, Max 5)</h3>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="complaint-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#3FA9F6] hover:text-blue-500 focus-within:outline-none">
                          <span>Upload files</span>
                          <input
                            id="complaint-file-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={e => {
                              if (e.target.files) {
                                const filesArray = Array.from(e.target.files).slice(0, 5 - images.length);
                                setImages([
                                  ...images,
                                  ...filesArray.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))
                                ]);
                              }
                            }}
                            disabled={images.length >= 5}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each. Add clear images to help illustrate the complaint.</p>
                    </div>
                  </div>
                  {images.length > 0 && (
                    <div className="mt-2 grid grid-cols-5 gap-2">
                      {images.map((image, index) => (
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
                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
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
                    onClick={closeComplaintModal}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#181818] hover:bg-[#00C6A7] transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      editingComplaint ? 'Save Changes' : 'Add Complaint'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

         {/* Complaint Details Modal */}
         {selectedComplaintForDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl p-8 max-w-3xl w-full mx-auto max-h-[90vh] overflow-y-auto relative">
                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedComplaintForDetails(null)}
                        aria-label="Close"
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-200 text-black absolute top-4 right-4 z-50 transition-all duration-150 focus:outline-none"
                    >
                        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 pr-8">{selectedComplaintForDetails.title}</h2>

                    {/* Images Section - Moved Up */}
                    {selectedComplaintForDetails.images && selectedComplaintForDetails.images.length > 0 && (
                      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedComplaintForDetails.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={`${selectedComplaintForDetails.title} image ${index + 1}`}
                            className="w-full h-64 object-cover rounded-md cursor-zoom-in hover:opacity-90 transition-opacity duration-200"
                            onClick={() => setZoomedImage(image.url)}
                          />
                        ))}
                      </div>
                    )}

                    <div className="space-y-6 text-gray-700">
                        {/* Status Badge */}
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                            {renderStatus(selectedComplaintForDetails.status)}
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                            <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaintForDetails.description}</p>
                        </div>
                        {/* Meta Info - Posted By, Posted At */}
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            {/* Posted By and Posted At Combined */}
                            <div className="flex items-center text-sm text-gray-500">
                                      <FiUser className="w-5 h-5 mr-2 text-gray-500"/>
                                     <span className="truncate">
                                       Posted by {selectedComplaintForDetails.user.name} on {selectedComplaintForDetails.createdAt ? new Date(selectedComplaintForDetails.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }) : ''}
                                     </span>
                            </div>
                        </div>
                    </div>

                     {user && selectedComplaintForDetails.user && (
                        // Check if user can edit/delete this complaint
                        (selectedComplaintForDetails.user._id === user._id || 
                         selectedComplaintForDetails.user._id === user.id || 
                         user.isAdmin) && 
                        !['Resolved', 'Closed'].includes(selectedComplaintForDetails.status)
                     ) && (
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setSelectedComplaintForDetails(null); openEditComplaintModal(selectedComplaintForDetails); }}
                                className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 flex items-center"
                            >
                                <FiEdit2 className="mr-1" /> Edit
                            </button>
                            <button
                                onClick={() => handleDeleteComplaint(selectedComplaintForDetails._id)}
                                className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#F05A25] hover:bg-red-600 flex items-center"
                            >
                                <FiTrash2 className="mr-1" /> Delete
                            </button>
                        </div>
                     )}

                    {/* Close button at the bottom for larger screens/better UX */}
                    <div className="mt-6 text-right">
                        <button
                            onClick={() => setSelectedComplaintForDetails(null)}
                            className="px-6 py-3 rounded-full font-bold text-white bg-[#181818] hover:bg-[#00C6A7] transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
         )}

         {/* Zoomed Image Modal */}
         {zoomedImage && selectedComplaintForDetails && selectedComplaintForDetails.images && selectedComplaintForDetails.images.length > 0 && (
           <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={() => setZoomedImage(null)}>
             {/* Image */}
             <img 
               src={zoomedImage} 
               alt="Zoomed"
               className="max-h-[90vh] max-w-full lg:max-w-[80vw] rounded-lg shadow-2xl object-contain"
               onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
             />
             
             {/* Navigation Buttons */}
             {selectedComplaintForDetails.images.length > 1 && (
               <>
                 {/* Previous Button */}
                 <button
                   className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 backdrop-blur-sm rounded-full p-3 text-white hover:bg-white/50 transition-colors duration-200 z-50"
                   onClick={(e) => {
                     e.stopPropagation();
                     const currentIndex = selectedComplaintForDetails.images.findIndex(img => img.url === zoomedImage);
                     const prevIndex = (currentIndex - 1 + selectedComplaintForDetails.images.length) % selectedComplaintForDetails.images.length;
                     setZoomedImage(selectedComplaintForDetails.images[prevIndex].url);
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
                     const currentIndex = selectedComplaintForDetails.images.findIndex(img => img.url === zoomedImage);
                     const nextIndex = (currentIndex + 1) % selectedComplaintForDetails.images.length;
                     setZoomedImage(selectedComplaintForDetails.images[nextIndex].url);
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

         {/* Loading Spinner */}
         {isFetchingMore && (
           <div className="flex justify-center items-center mt-8">
             <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
           </div>
         )}
      </main>
    </div>
  );
};

export default Complaints; 