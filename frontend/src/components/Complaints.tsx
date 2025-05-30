import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiAlertCircle, FiCheckCircle, FiUser, FiCalendar, FiTag, FiFileText, FiSearch } from 'react-icons/fi';
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

  const fetchComplaints = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const url = new URL(`${API_BASE}/api/complaints`);
      if (filterStatus !== 'All') {
        url.searchParams.append('status', filterStatus);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch complaints.');
      }
      setComplaints(data);
    } catch (err: any) {
      console.error('Error fetching complaints:', err);
      setError(err.message || 'Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchComplaints();
    }
  }, [token, filterStatus]);

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

  const handleSaveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Use loading state for the button as well
    setFormError(null);

    if (!newComplaint.title.trim() || !newComplaint.description.trim()) {
      setFormError('Title and description are required.');
      setLoading(false);
      return;
    }

    const method = editingComplaint ? 'PUT' : 'POST';
    const url = editingComplaint ? `${API_BASE}/api/complaints/${editingComplaint._id}` : `${API_BASE}/api/complaints`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newComplaint),
      });

      const data = await response.json();

      if (response.ok) {
        if (editingComplaint) {
          setComplaints(complaints.map(comp => comp._id === editingComplaint._id ? data : comp));
        } else {
          setComplaints([data, ...complaints]);
        }
        closeComplaintModal();
        // Optionally show a success message
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
          <div className="flex justify-start mb-6">
             <div className="h-10 bg-gray-200 rounded-full w-40 animate-pulse"></div>
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
        <h1 className="text-h2 font-extrabold text-black mb-6">College Complaints</h1>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={openAddComplaintModal}
            className="px-6 py-3 rounded-full font-bold text-white bg-[#181818] shadow-lg hover:bg-[#00C6A7] transition flex items-center"
          >
             <FiPlus className="mr-2"/> Add New Complaint
          </button>

           {/* Filter Control */}
           <div className="flex flex-grow flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-end">
              {/* Status Filter */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 sr-only">Filter by Status</label>
                  <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as Complaint['status'] | 'All')}
                      className="mt-1 block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
                  >
                      <option value="All">All Statuses</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                  </select>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((complaint) => (
            <div 
              key={complaint._id} 
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer flex flex-col"
              onClick={() => setSelectedComplaintForDetails(complaint)}
            >
               <div className="p-4 flex-1">
                 <div className="flex justify-between items-center mb-2">
                   <h2 className="text-lg font-bold text-gray-900 truncate mr-2">{complaint.title}</h2>
                   {renderStatus(complaint.status)}
                 </div>
                 <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">{complaint.description}</p>
                 <div className="flex items-center space-x-4 text-sm text-gray-500 mt-auto">
                   <div className="flex items-center">
                     <FiUser className="mr-1"/>
                     <span>Posted by {complaint.user.name}</span>
                   </div>
                   <div className="flex items-center">
                      <FiCalendar className="mr-1"/>
                     <span>{format(new Date(complaint.createdAt), 'MMM d, yyyy')}</span>
                   </div>
                 </div>
               </div>
              {user && complaint.user && complaint.user._id === user._id && ( !['Resolved', 'Closed'].includes(complaint.status)) && (
                 <div className="flex gap-2 pt-3 px-4 pb-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditComplaintModal(complaint);
                      }}
                      className="flex-1 px-3 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                    >
                      <FiEdit2 className="mr-1"/> Edit
                    </button>
                     <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteComplaint(complaint._id);
                      }}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingComplaint ? 'Edit Complaint' : 'Add New Complaint'}
                </h2>
                <button
                  onClick={closeComplaintModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="w-6 h-6" />
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

              <form onSubmit={handleSaveComplaint} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newComplaint.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    placeholder="Enter complaint title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={newComplaint.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                    rows={4}
                    placeholder="Provide detailed description of the issue"
                    required
                  ></textarea>
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
                   </div>
                )}

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
                <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto relative">
                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedComplaintForDetails(null)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                    >
                        <FiX className="w-6 h-6" />
                    </button>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4 pr-8">{selectedComplaintForDetails.title}</h2>

                    <div className="space-y-4 text-gray-700">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
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
                                    <span>{format(new Date(selectedComplaintForDetails.createdAt), 'MMM d, yyyy h:mm a')}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                     {user && selectedComplaintForDetails.user && selectedComplaintForDetails.user._id === user._id && ( !['Resolved', 'Closed'].includes(selectedComplaintForDetails.status)) && (
                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 mt-6">
                            <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedComplaintForDetails(null); // Close details modal
                                  openEditComplaintModal(selectedComplaintForDetails);
                                }}
                                className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                              >
                                <FiEdit2 className="mr-1"/> Edit
                            </button>
                             <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteComplaint(selectedComplaintForDetails._id);
                                }}
                                className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#F05A25] hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                              >
                                <FiTrash2 className="mr-1"/> Delete
                            </button>
                         </div>
                     )}

                    {/* Close button at the bottom */}
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
      </main>
    </div>
  );
};

export default Complaints; 