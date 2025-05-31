import React, { useState } from 'react';
import Navbar from './Navbar';
import { FiPlus, FiCalendar, FiFileText, FiSearch } from 'react-icons/fi';

const mockNews = [
  {
    id: '1',
    title: 'Library Renovation Completed',
    description: 'The main library has reopened after extensive renovations. Enjoy the new study spaces!',
    date: '2025-06-01',
    category: 'Campus',
  },
  {
    id: '2',
    title: 'New Cafeteria Menu',
    description: 'The cafeteria now offers a wider variety of healthy meal options.',
    date: '2025-05-28',
    category: 'Food',
  },
  {
    id: '3',
    title: 'Exam Schedule Released',
    description: 'Check the portal for the latest exam timetable for all departments.',
    date: '2025-05-25',
    category: 'Academics',
  },
];

const News = () => {
  const [filterCategory, setFilterCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filteredNews = mockNews.filter(news =>
    (filterCategory === 'All' || news.category === filterCategory) &&
    (news.title.toLowerCase().includes(search.toLowerCase()) || news.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <main className="container mx-auto px-12 py-8 pt-[100px]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <h1 className="text-h2 font-extrabold text-black">Campus News</h1>
          <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white font-bold text-lg shadow hover:bg-[#00C6A7] transition">
            <FiPlus /> Add News
          </button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div className="flex gap-4">
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-2 rounded bg-gray-100 text-black font-medium">
              <option value="All">All Categories</option>
              <option value="Campus">Campus</option>
              <option value="Food">Food</option>
              <option value="Academics">Academics</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded">
            <FiSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search news..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-black"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map(news => (
            <div key={news.id} className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 border">
              <div className="flex items-center gap-2 mb-2">
                <FiCalendar className="text-[#00C6A7]" />
                <span className="font-semibold text-black">{new Date(news.date).toLocaleDateString()}</span>
                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">{news.category}</span>
              </div>
              <h2 className="text-lg font-bold text-black">{news.title}</h2>
              <p className="text-gray-600">{news.description}</p>
            </div>
          ))}
          {filteredNews.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-12">No news found.</div>
          )}
        </div>
      </main>
    </div>
  );
};

export default News; 