import React, { useEffect, useState, useRef, useCallback } from 'react';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiAlertCircle, FiCheckCircle, FiUser, FiCalendar, FiTag, FiFileText, FiSearch, FiInfo, FiMail } from 'react-icons/fi';
import SkeletonLoader from './SkeletonLoader';
import { format } from 'date-fns';

const API_BASE = 'http://localhost:5000';

interface Complaint {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
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
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [selectedComplaintForDetails, setSelectedComplaintForDetails] = useState<Complaint | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Open' | 'In Progress' | 'Resolved' | 'Closed'>('All');
  const [images, setImages] = useState<ModalImage[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
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
      setLoading(currentPage === 1);
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
      setLoading(false);
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
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditComplaintModal = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setNewComplaint({
      title: complaint.title,
      description: complaint.description,
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
    setLoading(true);
    setFormError(null);

    if (!newComplaint.title.trim() || !newComplaint.description.trim()) {
      setFormError('Title and description are required.');
      setLoading(false);
      return;
    }

    const method = editingComplaint ? 'PUT' : 'POST';
    const url = editingComplaint ? `${API_BASE}/api/complaints/${editingComplaint._id}` : `${API_BASE}/api/complaints`;

    try {
      const formData = new FormData();
      formData.append('title', newComplaint.title.trim());
      formData.append('description', newComplaint.description.trim());
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
      setLoading(false);
    }
  };

  const handleDeleteComplaint = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      try {
        setLoading(true);
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
        setLoading(false);
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

  if (loading && complaints.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-white font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-12 py-8 pt-[100px]">
          <h1 className="text-h2 font-extrabold text-black mb-6">College Complaints</h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <button
              onClick={openAddComplaintModal}
              aria-label="Add Complaint"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white font-bold text-lg shadow hover:bg-[#00C6A7] transition"
            >
              + Add Complaint
            </button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex gap-4 w-full md:w-auto">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 rounded bg-gray-100 text-black font-medium"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <form className="relative w-full md:w-[500px] flex" onSubmit={e => { e.preventDefault(); setSearchQuery(searchInput); }}>
              <div className="relative flex items-center flex-1">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search complaints..."
                  className="bg-gray-100 w-full pl-10 pr-4 py-2 rounded-l text-black outline-none text-lg"
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
                type="button"
                aria-label="Search"
                className="px-4 py-2 bg-[#00C6A7] text-white rounded-none rounded-r-md font-semibold hover:bg-[#009e87] transition border border-l-0 border-gray-300"
                onClick={() => setSearchQuery(searchInput)}
              >
                <FiSearch />
              </button>
            </form>
          </div>
          <SkeletonLoader variant="lostfound" /> {/* Can reuse lostfound skeleton for now */}
        </main>
      </div>
    );
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-white font-sans"><p className="text-red-500">Error: {error}</p></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      <main className="flex-1 container mx-auto px-12 py-8 pt-[100px]">
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex gap-4 w-full md:w-auto">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 rounded bg-gray-100 text-black font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <form className="relative w-full md:w-[500px] flex" onSubmit={e => { e.preventDefault(); setSearchQuery(searchInput); }}>
            <div className="relative flex items-center flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints..."
                className="bg-gray-100 w-full pl-10 pr-4 py-2 rounded-l text-black outline-none text-lg"
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
              type="button"
              aria-label="Search"
              className="px-4 py-2 bg-[#00C6A7] text-white rounded-none rounded-r-md font-semibold hover:bg-[#009e87] transition border border-l-0 border-gray-300"
              onClick={() => setSearchQuery(searchInput)}
            >
              <FiSearch />
            </button>
          </form>
        </div>
        {/* Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((complaint, idx) => (
            <div
              key={complaint._id}
              ref={idx === complaints.length - 1 ? lastComplaintRef : undefined}
              className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border cursor-pointer"
              onClick={() => setSelectedComplaintForDetails(complaint)}
            >
              {/* Image Section */}
              {complaint.images && complaint.images.length > 0 ? (
                <div className="relative h-64 overflow-hidden mb-2 rounded-md">
                  <img
                    src={complaint.images[0].url}
                    alt={complaint.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="relative h-64 overflow-hidden mb-2 rounded-md flex items-center justify-center bg-gray-100">
                  <span className="text-5xl text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v10.5A2.25 2.25 0 0113.5 21h-3a2.25 2.25 0 01-2.25-2.25V9m7.5 0H6.75m8.25 0H18m-12 0h2.25" />
                    </svg>
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-black truncate mr-2">{complaint.title}</h2>
                {renderStatus(complaint.status)}
              </div>
              <p className="text-gray-600 text-sm mb-2 line-clamp-3 flex-1">{complaint.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-auto">
                <div className="flex items-center">
                  <FiUser className="mr-1"/>
                  <span>Posted by {complaint.user.name}</span>
                </div>
                <div className="flex items-center">
                  <FiCalendar className="mr-1"/>
                  <span>{complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                </div>
              </div>
              {user && complaint.user && complaint.user._id === user._id && ( !['Resolved', 'Closed'].includes(complaint.status)) && (
                <div className="flex gap-2 pt-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEditComplaintModal(complaint); }}
                    className="flex-1 px-3 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                  >
                    <FiEdit2 className="mr-1"/> Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteComplaint(complaint._id); }}
                    className="flex-1 px-3 py-2 rounded-full text-sm font-semibold text-white bg-[#F05A25] hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                  >
                    <FiTrash2 className="mr-1"/> Delete
                  </button>
                </div>
              )}
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
                    {editingComplaint && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          name="status"
                          value={editingComplaint.status}
                          onChange={(e) => setEditingComplaint({...editingComplaint, status: e.target.value as Complaint['status']})}
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
                {/* Contact Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">Contact (Optional) <FiInfo className="text-gray-400" title="Contact is linked to your account." /></h3>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Contact Information <FiMail className="inline text-gray-400" /></label>
                  <div className="relative">
                    <input
                      type="text"
                      name="contact"
                      className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm bg-gray-100 cursor-not-allowed"
                      placeholder="Email or phone number (optional)"
                      disabled
                      aria-label="Contact Information"
                    />
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">(Contact is linked to your account and not editable.)</p>
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
                <div className="bg-white rounded-lg p-8 max-w-3xl w-full mx-auto max-h-[90vh] overflow-y-auto relative">
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

                    <div className="space-y-4 text-gray-700">
                        <div className="flex flex-wrap items-center gap-4 mb-2">
                            {renderStatus(selectedComplaintForDetails.status)}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
                            <p>{selectedComplaintForDetails.description}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Posted By</p>
                                <div className="flex items-center">
                                     <FiUser className="w-5 h-5 mr-2 text-gray-500"/>
                                    <span>{selectedComplaintForDetails.user.name}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Posted At</p>
                                <div className="flex items-center">
                                     <FiCalendar className="w-5 h-5 mr-2 text-gray-500"/>
                                    <span>{selectedComplaintForDetails.createdAt ? new Date(selectedComplaintForDetails.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                     {user && selectedComplaintForDetails.user && selectedComplaintForDetails.user._id === user._id && ( !['Resolved', 'Closed'].includes(selectedComplaintForDetails.status)) && (
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

                    {/* Images Section */}
                    {selectedComplaintForDetails.images && selectedComplaintForDetails.images.length > 0 && (
                      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedComplaintForDetails.images.map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={`${selectedComplaintForDetails.title} image ${index + 1}`}
                            className="w-full h-64 object-cover rounded-md cursor-zoom-in"
                            onClick={() => setZoomedImage(image.url)}
                          />
                        ))}
                      </div>
                    )}
                </div>
            </div>
         )}

         {/* Zoomed Image Modal */}
         {zoomedImage && (
           <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setZoomedImage(null)}>
             <img src={zoomedImage} alt="Zoomed" className="max-w-3xl max-h-[80vh] rounded-lg shadow-lg" />
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