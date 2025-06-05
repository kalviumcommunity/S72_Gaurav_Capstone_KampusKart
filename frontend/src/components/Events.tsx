import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { FiPlus, FiCalendar, FiMapPin, FiSearch, FiAlertCircle, FiFileText, FiTag, FiMail, FiInfo, FiUser } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE } from '../config';
import SkeletonLoader from './SkeletonLoader';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  registerUrl?: string;
  image?: { public_id?: string; url?: string };
  operatingHours?: string;
  contactInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  mapLocation?: {
    building?: string;
    floor?: string;
    room?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  user?: {
    name: string;
  };
  createdAt?: string;
}

const Events = () => {
  const { user, token } = useAuth();
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    status: 'Upcoming' as const,
    registerUrl: '',
    image: undefined as File | undefined,
    imagePreview: '',
    operatingHours: '',
    contactInfo: {
      name: '',
      email: '',
      phone: ''
    },
    mapLocation: {
      building: '',
      floor: '',
      room: '',
      coordinates: undefined as { lat: number; lng: number } | undefined
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('date', newEvent.date);
      formData.append('location', newEvent.location);
      formData.append('status', newEvent.status);
      formData.append('registerUrl', newEvent.registerUrl);
      formData.append('operatingHours', newEvent.operatingHours);
      formData.append('contactInfo', JSON.stringify(newEvent.contactInfo));
      formData.append('mapLocation', JSON.stringify(newEvent.mapLocation));
      if (newEvent.image) {
        formData.append('image', newEvent.image);
      }
      const response = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add event');
      }
      const savedEvent = await response.json();
      setEvents([savedEvent, ...events]);
      setIsModalOpen(false);
      setNewEvent({ 
        title: '', 
        description: '', 
        date: '', 
        location: '', 
        status: 'Upcoming', 
        registerUrl: '', 
        image: undefined, 
        imagePreview: '',
        operatingHours: '',
        contactInfo: { name: '', email: '', phone: '' },
        mapLocation: { building: '', floor: '', room: '', coordinates: undefined }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add event');
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      date: event.date.split('T')[0],
      location: event.location,
      status: event.status,
      registerUrl: event.registerUrl || '',
      image: undefined,
      imagePreview: event.image?.url || '',
      operatingHours: event.operatingHours || '',
      contactInfo: event.contactInfo || { name: '', email: '', phone: '' },
      mapLocation: event.mapLocation || { building: '', floor: '', room: '', coordinates: undefined }
    });
    setIsModalOpen(true);
  };

  const handleDeleteEvent = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete event');
      }
      setEvents(events.filter(e => e._id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete event');
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append('title', newEvent.title);
      formData.append('description', newEvent.description);
      formData.append('date', newEvent.date);
      formData.append('location', newEvent.location);
      formData.append('status', newEvent.status);
      formData.append('registerUrl', newEvent.registerUrl);
      formData.append('operatingHours', newEvent.operatingHours);
      formData.append('contactInfo', JSON.stringify(newEvent.contactInfo));
      formData.append('mapLocation', JSON.stringify(newEvent.mapLocation));
      if (newEvent.image) {
        formData.append('image', newEvent.image);
      }
      const method = editingEvent ? 'PUT' : 'POST';
      const url = editingEvent ? `${API_BASE}/api/events/${editingEvent._id}` : `${API_BASE}/api/events`;
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save event');
      }
      const savedEvent = await response.json();
      if (editingEvent) {
        setEvents(events.map(e => e._id === savedEvent._id ? savedEvent : e));
      } else {
        setEvents([savedEvent, ...events]);
      }
      setIsModalOpen(false);
      setEditingEvent(null);
      setNewEvent({ 
        title: '', 
        description: '', 
        date: '', 
        location: '', 
        status: 'Upcoming', 
        registerUrl: '', 
        image: undefined, 
        imagePreview: '',
        operatingHours: '',
        contactInfo: { name: '', email: '', phone: '' },
        mapLocation: { building: '', floor: '', room: '', coordinates: undefined }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save event');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewEvent(prev => ({ ...prev, image: file, imagePreview: URL.createObjectURL(file) }));
    }
  };

  const filteredEvents = events.filter(event =>
    (filterStatus === 'All' || event.status === filterStatus) &&
    (event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     event.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-12 py-8 pt-[100px]">
          <SkeletonLoader variant="events" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="container mx-auto px-12 py-8 pt-[100px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-h2 font-extrabold text-black">Campus Events</h1>
          {user?.email === "gauravkhandelwal205@gmail.com" && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white font-bold text-lg shadow hover:bg-[#00C6A7] transition"
            >
              + Add New Event
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex gap-4 w-full md:w-auto">
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)} 
              className="px-4 py-2 rounded bg-gray-100 text-black font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <form className="relative w-full md:w-[500px] flex" onSubmit={e => { e.preventDefault(); setSearchQuery(searchInput); }}>
            <div className="relative flex items-center flex-1">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by event title or description..."
                className="bg-gray-100 w-full pl-10 pr-4 py-2 rounded-l text-black outline-none text-lg"
                aria-label="Search events"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div 
              key={event._id} 
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group"
              onClick={() => setSelectedEvent(event)}
            >
              {/* Image Section with Overlay */}
              <div className="relative h-64 overflow-hidden">
                {event.image?.url ? (
                  <>
                    <img 
                      src={event.image.url} 
                      alt={event.title} 
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
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm bg-white/90 backdrop-blur-sm flex items-center gap-1 ${
                    event.status === 'Upcoming' ? 'text-blue-800' :
                    event.status === 'Ongoing' ? 'text-green-800' :
                    event.status === 'Completed' ? 'text-gray-800' :
                    'text-red-800'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{event.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>

                {/* Meta Info Row */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-gray-500">
                    <FiCalendar className="mr-2 flex-shrink-0 text-gray-400" />
                    <span className="font-medium text-gray-900">
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FiMapPin className="mr-2 flex-shrink-0 text-gray-400" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      event.registerUrl 
                        ? 'bg-[#00C6A7] text-white hover:bg-[#009e87]' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!event.registerUrl}
                    onClick={(e) => { 
                      e.stopPropagation();
                      if (event.registerUrl) window.open(event.registerUrl, '_blank'); 
                    }}
                  >
                    {event.registerUrl ? 'Register Now' : 'Registration Closed'}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredEvents.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-12">No events found.</div>
          )}
        </div>

        {/* Add/Edit Event Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h2>
                <button
                  onClick={() => { setIsModalOpen(false); setEditingEvent(null); setNewEvent({ title: '', description: '', date: '', location: '', status: 'Upcoming', registerUrl: '', image: undefined, imagePreview: '', operatingHours: '', contactInfo: { name: '', email: '', phone: '' }, mapLocation: { building: '', floor: '', room: '', coordinates: undefined } }); }}
                  aria-label="Close"
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-200 text-black absolute top-4 right-4 z-50 transition-all duration-150 focus:outline-none"
                >
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
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
              <form onSubmit={editingEvent ? handleSaveEvent : handleAddEvent} className="space-y-8">
                {/* Event Details Section */}
                <div className="border-b pb-6 mb-6 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">Event Details <FiInfo className="text-gray-400" title="Fill in the details of your event." /></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Title <FiTag className="inline text-gray-400" /></label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newEvent.title}
                          onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                          className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                          placeholder="Enter event title (e.g., Annual Tech Symposium 2024)"
                          required
                          aria-label="Event Title"
                        />
                        <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Give a short, descriptive title for the event.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Date <FiCalendar className="inline text-gray-400" /></label>
                      <input
                        type="date"
                        value={newEvent.date}
                        onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                        aria-label="Event Date"
                      />
                      <p className="text-xs text-gray-500 mt-1">When will the event take place?</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Description <FiFileText className="inline text-gray-400" /></label>
                    <div className="relative">
                      <textarea
                        value={newEvent.description}
                        onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                        className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        rows={4}
                        placeholder="Provide a detailed description of the event. Include key highlights, agenda, target audience, and any special requirements."
                        required
                        aria-label="Event Description"
                      ></textarea>
                      <FiFileText className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Provide details to help users understand the event.</p>
                  </div>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Location <FiMapPin className="inline text-gray-400" /></label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newEvent.location}
                          onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                          className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                          placeholder="Enter venue details (e.g., Main Auditorium, Block A, Floor 3)"
                          required
                          aria-label="Event Location"
                        />
                        <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Where will the event be held?</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Status <FiTag className="inline text-gray-400" /></label>
                      <select
                        value={newEvent.status}
                        onChange={e => setNewEvent({...newEvent, status: e.target.value as Event['status']})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                        aria-label="Event Status"
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Select the current status of the event.</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Register URL (optional) <FiMail className="inline text-gray-400" /></label>
                    <div className="relative">
                      <input
                        type="url"
                        value={newEvent.registerUrl}
                        onChange={e => setNewEvent({...newEvent, registerUrl: e.target.value})}
                        className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        placeholder="https://forms.google.com/..."
                        aria-label="Register URL"
                      />
                      <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Add a registration link if available.</p>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Operating Hours <FiCalendar className="inline text-gray-400" /></label>
                    <div className="relative">
                      <input
                        type="text"
                        value={newEvent.operatingHours}
                        onChange={e => setNewEvent({...newEvent, operatingHours: e.target.value})}
                        className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        placeholder="e.g., 9:00 AM - 5:00 PM"
                        aria-label="Operating Hours"
                      />
                      <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Specify the event's operating hours.</p>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={newEvent.contactInfo.name}
                          onChange={e => setNewEvent({...newEvent, contactInfo: {...newEvent.contactInfo, name: e.target.value}})}
                          className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                          placeholder="Contact Person Name"
                          aria-label="Contact Name"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="email"
                          value={newEvent.contactInfo.email}
                          onChange={e => setNewEvent({...newEvent, contactInfo: {...newEvent.contactInfo, email: e.target.value}})}
                          className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                          placeholder="contact@example.com"
                          aria-label="Contact Email"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="tel"
                          value={newEvent.contactInfo.phone}
                          onChange={e => setNewEvent({...newEvent, contactInfo: {...newEvent.contactInfo, phone: e.target.value}})}
                          className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                          placeholder="+1 (555) 123-4567"
                          aria-label="Contact Phone"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Map Location</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          value={newEvent.mapLocation.building}
                          onChange={e => setNewEvent({...newEvent, mapLocation: {...newEvent.mapLocation, building: e.target.value}})}
                          className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                          placeholder="Building Name"
                          aria-label="Building"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={newEvent.mapLocation.floor}
                          onChange={e => setNewEvent({...newEvent, mapLocation: {...newEvent.mapLocation, floor: e.target.value}})}
                          className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                          placeholder="Floor"
                          aria-label="Floor"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={newEvent.mapLocation.room}
                          onChange={e => setNewEvent({...newEvent, mapLocation: {...newEvent.mapLocation, room: e.target.value}})}
                          className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                          placeholder="Room Number"
                          aria-label="Room"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Add detailed location information to help attendees find the venue.</p>
                  </div>
                </div>
                {/* Images Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Image (Optional)</h3>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="event-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#3FA9F6] hover:text-blue-500 focus-within:outline-none">
                          <span>Upload file</span>
                          <input
                            id="event-file-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                            disabled={!!newEvent.image}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB. Recommended size: 1200x800px. Add a high-quality image that represents your event.</p>
                    </div>
                  </div>
                  {newEvent.imagePreview && (
                    <div className="mt-2 flex gap-2">
                      <div className="relative">
                        <img src={newEvent.imagePreview} alt="Event Preview" className="h-28 w-28 object-cover rounded-md" />
                        <button
                          type="button"
                          onClick={() => setNewEvent({ ...newEvent, image: undefined, imagePreview: '' })}
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
                    onClick={() => { setIsModalOpen(false); setEditingEvent(null); setNewEvent({ title: '', description: '', date: '', location: '', status: 'Upcoming', registerUrl: '', image: undefined, imagePreview: '', operatingHours: '', contactInfo: { name: '', email: '', phone: '' }, mapLocation: { building: '', floor: '', room: '', coordinates: undefined } }); }}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#181818] hover:bg-[#00C7A7] transition"
                  >
                    {editingEvent ? 'Save Changes' : 'Add Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-3xl w-full mx-auto max-h-[90vh] overflow-y-auto relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  aria-label="Close"
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-200 text-black absolute top-4 right-4 z-50 transition-all duration-150 focus:outline-none"
                >
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              
              {selectedEvent.image?.url ? (
                <img src={selectedEvent.image.url} alt={selectedEvent.title} className="w-full h-64 object-cover rounded-lg mb-6" />
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg mb-6 flex flex-col items-center justify-center text-gray-400">
                  <FiCalendar className="w-16 h-16 mb-2" />
                  <span className="text-sm font-medium">No Image Available</span>
                </div>
              )}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
                  {/* Date, Location, Status Badges */}
                  <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <FiCalendar className="text-gray-400" />
                      <span className="font-medium text-gray-900 text-sm">{new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <FiMapPin className="text-gray-400" />
                      <span className="font-medium text-gray-900 text-sm truncate">{selectedEvent.location}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedEvent.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                      selectedEvent.status === 'Ongoing' ? 'bg-green-100 text-green-800' :
                      selectedEvent.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedEvent.status}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm">{selectedEvent.description}</p>
                </div>

                {/* Posted By and Posted At Combined */}
                {selectedEvent.user?.name && (selectedEvent as any).createdAt && (
                  <div className="flex items-center text-sm text-gray-500">
                    <FiUser className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="truncate">
                      Posted by {(selectedEvent as any).user.name} on {new Date((selectedEvent as any).createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                    </span>
                  </div>
                )}

                {selectedEvent.operatingHours && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Operating Hours</h4>
                    <p className="text-gray-700 text-sm">{selectedEvent.operatingHours}</p>
                  </div>
                )}

                {selectedEvent.contactInfo && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      {selectedEvent.contactInfo.name && (
                        <p className="text-gray-600"><span className="font-medium">Contact Person:</span> {selectedEvent.contactInfo.name}</p>
                      )}
                      {selectedEvent.contactInfo.email && (
                        <p className="text-gray-600"><span className="font-medium">Email:</span> {selectedEvent.contactInfo.email}</p>
                      )}
                      {selectedEvent.contactInfo.phone && (
                        <p className="text-gray-600"><span className="font-medium">Phone:</span> {selectedEvent.contactInfo.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedEvent.mapLocation && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Location Details</h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      {selectedEvent.mapLocation.building && (
                        <p className="text-gray-600"><span className="font-medium">Building:</span> {selectedEvent.mapLocation.building}</p>
                      )}
                      {selectedEvent.mapLocation.floor && (
                        <p className="text-gray-600"><span className="font-medium">Floor:</span> {selectedEvent.mapLocation.floor}</p>
                      )}
                      {selectedEvent.mapLocation.room && (
                        <p className="text-gray-600"><span className="font-medium">Room:</span> {selectedEvent.mapLocation.room}</p>
                      )}
                      {selectedEvent.mapLocation.coordinates && (
                        <a
                          href={`https://www.google.com/maps?q=${selectedEvent.mapLocation.coordinates.lat},${selectedEvent.mapLocation.coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#00C6A7] hover:text-[#009e87]"
                        >
                          <FiMapPin />
                          <span>View on Map</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {selectedEvent.registerUrl && (
                  <div className="pt-4">
                    <a
                      href={selectedEvent.registerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 rounded-full bg-[#00C6A7] text-white font-semibold hover:bg-[#009e87] transition"
                    >
                      Register Now
                    </a>
                  </div>
                )}

                {user?.email === "gauravkhandelwal205@gmail.com" && (
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedEvent(null);
                        handleEditEvent(selectedEvent);
                      }}
                      className="flex-1 px-4 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    >
                      Edit Event
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEvent(null);
                        handleDeleteEvent(selectedEvent._id);
                      }}
                      className="flex-1 px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#F05A25] hover:bg-red-600"
                    >
                      Delete Event
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Zoomed Image Modal */}
        {zoomedImage && selectedEvent && selectedEvent.image && selectedEvent.image.url && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={() => setZoomedImage(null)}>
            {/* Image */}
            <img 
              src={zoomedImage} 
              alt="Zoomed"
              className="max-h-[90vh] max-w-full lg:max-w-[80vw] rounded-lg shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
            />
            
            {/* Note: Events only have one main image, so no navigation needed */}

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
        {loading && (
          <div className="flex justify-center items-center mt-8">
            <SkeletonLoader variant="events" />
          </div>
        )}
      </main>
    </div>
  );
};

export default Events; 