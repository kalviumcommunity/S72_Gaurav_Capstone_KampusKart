import React, { useState } from 'react';
import Navbar from './Navbar';
import { FiPlus, FiCalendar, FiMapPin, FiSearch } from 'react-icons/fi';

const mockEvents = [
  {
    id: '1',
    title: 'Tech Fest 2025',
    description: 'Annual technology festival with workshops, talks, and competitions.',
    date: '2025-06-10',
    location: 'Main Auditorium',
    status: 'Upcoming',
  },
  {
    id: '2',
    title: 'Cultural Night',
    description: 'An evening of music, dance, and drama performances.',
    date: '2025-06-15',
    location: 'Open Air Theatre',
    status: 'Upcoming',
  },
  {
    id: '3',
    title: 'Alumni Meet',
    description: 'Reconnect with alumni and expand your network.',
    date: '2025-05-30',
    location: 'Conference Hall',
    status: 'Past',
  },
];

const Events = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');

  const filteredEvents = mockEvents.filter(event =>
    (filterStatus === 'All' || event.status === filterStatus) &&
    (event.title.toLowerCase().includes(search.toLowerCase()) || event.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="container mx-auto px-12 py-8 pt-[100px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-h2 font-extrabold text-black">Campus Events</h1>
          <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white font-bold text-lg shadow hover:bg-[#00C6A7] transition">
            <FiPlus /> Add New Event
          </button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex gap-4">
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 rounded bg-gray-100 text-black font-medium">
              <option value="All">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Past">Past</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded">
            <FiSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-black"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <div key={event.id} className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border">
              <div className="flex items-center gap-2 mb-2">
                <FiCalendar className="text-[#00C6A7]" />
                <span className="font-semibold text-black">{new Date(event.date).toLocaleDateString()}</span>
                <span className={`ml-auto text-xs px-2 py-1 rounded-full ${event.status === 'Upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{event.status}</span>
              </div>
              <h2 className="text-lg font-bold text-black">{event.title}</h2>
              <p className="text-gray-600">{event.description}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <FiMapPin /> {event.location}
              </div>
            </div>
          ))}
          {filteredEvents.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-12">No events found.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Events; 