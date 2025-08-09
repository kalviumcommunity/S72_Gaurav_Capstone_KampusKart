import React, { useState, useEffect, useRef, useMemo } from 'react';
import Navbar from './Navbar';
import { FiPlus, FiCalendar, FiFileText, FiSearch, FiAlertCircle, FiInfo, FiTag, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import UniversalLoader from './UniversalLoader';
import { useDataLoading } from '../hooks/useLoading';
import { API_BASE } from '../config';
import AIAutocomplete from './AIAutocomplete';
import { useAIAutocomplete } from '../hooks/useAIAutocomplete';

interface NewsItem {
  _id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  images?: { url: string }[];
}

const News = () => {
  const { user, token } = useAuth();
  const { isLoading, error: loadingError, steps, startLoading, stopLoading, setError: setLoadingError } = useDataLoading();
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newNews, setNewNews] = useState({
    title: '',
    description: '',
    date: '',
    category: 'Campus'
  });
  const [error, setError] = useState<string | null>(null);
  const [newsImages, setNewsImages] = useState<{ file?: File; previewUrl: string }[]>([]);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const dragImage = useRef<number | null>(null);
  const dragOverImage = useRef<number | null>(null);

  // AI Autocomplete hook
  const preExistingStrings = useMemo(() => {
    const pool: string[] = [];
    news.forEach(n => {
      if (n.title) pool.push(n.title);
      if (n.description) pool.push(n.description);
      if (n.category) pool.push(n.category);
    });
    return Array.from(new Set(pool.map(s => s.trim()).filter(Boolean)));
  }, [news]);

  const {
    suggestions,
    isLoading: aiLoading,
    error: aiError,
    handleInputChange: handleAISearchInput,
    handleSuggestionSelect,
    clearSuggestions
  } = useAIAutocomplete({
    context: { section: 'news' },
    debounceMs: 300,
    preExistingStrings
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      startLoading();
      const response = await fetch(`${API_BASE}/api/news`);
      if (!response.ok) throw new Error('Failed to fetch news');
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Failed to load news');
    } finally {
      stopLoading();
    }
  };

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newNews)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add news');
      }

      const savedNews = await response.json();
      setNews([savedNews, ...news]);
      setIsModalOpen(false);
      setNewNews({
        title: '',
        description: '',
        date: '',
        category: 'Campus'
      });
    } catch (error) {
      console.error('Error adding news:', error);
      setError(error instanceof Error ? error.message : 'Failed to add news');
    }
  };

  const handleEditNews = (item: NewsItem) => {
    setEditingNews(item);
    setNewNews({
      title: item.title,
      description: item.description,
      date: item.date.split('T')[0],
      category: item.category
    });
    setIsModalOpen(true);
  };

  const handleDeleteNews = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this news item?')) return;
    try {
      const response = await fetch(`${API_BASE}/api/news/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete news');
      }
      setNews(news.filter(n => n._id !== id));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete news');
    }
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const method = editingNews ? 'PUT' : 'POST';
      const url = editingNews ? `${API_BASE}/api/news/${editingNews._id}` : `${API_BASE}/api/news`;
      const formData = new FormData();
      formData.append('title', newNews.title);
      formData.append('description', newNews.description);
      formData.append('date', newNews.date);
      formData.append('category', newNews.category);
      newsImages.forEach((img) => {
        if (img.file) formData.append('images', img.file);
      });
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save news');
      }
      const savedNews = await response.json();
      if (editingNews) {
        setNews(news.map(n => n._id === savedNews._id ? savedNews : n));
      } else {
        setNews([savedNews, ...news]);
      }
      setIsModalOpen(false);
      setEditingNews(null);
      setNewNews({ title: '', description: '', date: '', category: 'Campus' });
      setNewsImages([]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save news');
    }
  };

  const filteredNews = news.filter(item =>
    (filterCategory === 'All' || item.category === filterCategory) &&
    (item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <UniversalLoader
        variant="page"
        title="Loading News"
        subtitle="Fetching latest campus news..."
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
          <h1 className="text-h2 font-extrabold text-black">Campus News</h1>
          {user?.email === "gauravkhandelwal205@gmail.com" && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white font-bold text-lg shadow hover:bg-[#00C6A7] transition"
            >
              + Add News
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 px-4 md:px-0">
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value as 'all' | 'Announcements' | 'Campus News' | 'Events' | 'Achievements')}
              className="px-4 py-2 rounded-md bg-gray-100 text-black font-medium border border-gray-300 shadow-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
            >
              <option value="All">All Categories</option>
              <option value="Campus">Campus</option>
              <option value="Food">Food</option>
              <option value="Academics">Academics</option>
            </select>
          </div>
          {/* AI-Powered Search Bar */}
          <div className="relative w-full md:w-[500px]">
            <AIAutocomplete
              value={searchInput}
              onChange={(value) => {
                setSearchInput(value);
                handleAISearchInput(value);
              }}
              onSelect={(suggestion) => {
                setSearchInput(suggestion.text);
                setSearchQuery(suggestion.text);
                handleSuggestionSelect(suggestion);
              }}
              placeholder="Search news"
              className="w-full md:w-[500px]"
              suggestions={suggestions}
              isLoading={aiLoading}
              disabled={false}
              showSubmitButton
              submitLabel="Search"
              onSubmit={() => setSearchQuery(searchInput)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map(item => (
            <div key={item._id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
              {/* Image Section with Overlay */}
              <div className="relative h-60 sm:h-80 overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <>
                    <img
                      src={item.images[0].url}
                      alt={item.title}
                      className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-300"
                      onClick={() => setZoomedImage(item.images[0].url)}
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
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="text-xs px-3 py-1.5 rounded-full font-medium shadow-sm bg-white/90 backdrop-blur-sm text-gray-800 flex items-center gap-1">
                    <FiTag className="w-3 h-3" />
                    {item.category}
                  </span>
                </div>
                {/* Date Badge */}
                <div className="absolute top-4 right-4">
                  <span className="text-xs px-3 py-1.5 rounded-full font-medium shadow-sm bg-white/90 backdrop-blur-sm text-gray-800 flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    {new Date(item.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{item.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>

                {/* Action Buttons */}
                {user && user.isAdmin && (
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEditNews(item)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-sm sm:text-base min-w-0"
                    >
                      <FiEdit2 className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteNews(item._id)}
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
          {filteredNews.length === 0 && (
            <div className="col-span-full text-center text-gray-400 py-12">No news found.</div>
          )}
        </div>

        {/* Add/Edit News Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
                {/* Close Button */}
                <button
                  onClick={() => { setIsModalOpen(false); setEditingNews(null); setNewNews({ title: '', description: '', date: '', category: 'Campus' }); setNewsImages([]); }}
                  aria-label="Close"
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingNews ? 'Edit News' : 'Add News'}
                </h2>
              </div>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center text-red-700">
                    <FiAlertCircle className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              <form onSubmit={handleSaveNews} className="space-y-8">
                {/* News Details Section */}
                <div className="border-b pb-6 mb-6 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">News Details <FiInfo className="text-gray-400" title="Fill in the details of your news item." /></h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Title <FiTag className="inline text-gray-400" /></label>
                      <div className="relative">
                        <input
                          type="text"
                          value={newNews.title}
                          onChange={e => setNewNews({...newNews, title: e.target.value})}
                          className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                          placeholder="e.g. New Library Opening"
                          required
                          aria-label="News Title"
                        />
                        <FiTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Give a short, descriptive title for the news item.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Date <FiCalendar className="inline text-gray-400" /></label>
                      <input
                        type="date"
                        value={newNews.date}
                        onChange={e => setNewNews({...newNews, date: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        required
                        aria-label="News Date"
                      />
                      <p className="text-xs text-gray-500 mt-1">When is this news relevant?</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Description <FiFileText className="inline text-gray-400" /></label>
                    <div className="relative">
                      <textarea
                        value={newNews.description}
                        onChange={e => setNewNews({...newNews, description: e.target.value})}
                        className="w-full px-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                        rows={4}
                        placeholder="Describe the news, any important details, etc."
                        required
                        aria-label="News Description"
                      ></textarea>
                      <FiFileText className="absolute left-3 top-3 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Provide details to help users understand the news.</p>
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">Category <FiTag className="inline text-gray-400" /></label>
                    <select
                      value={newNews.category}
                      onChange={e => setNewNews({...newNews, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                      required
                      aria-label="News Category"
                    >
                      <option value="Campus">Campus</option>
                      <option value="Food">Food</option>
                      <option value="Academics">Academics</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Select the category for this news item.</p>
                  </div>
                </div>
                {/* Images Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Images (Optional, Max 5)</h3>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="news-file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#3FA9F6] hover:text-blue-500 focus-within:outline-none">
                          <span>Upload files</span>
                          <input
                            id="news-file-upload"
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={e => {
                              if (e.target.files) {
                                const filesArray = Array.from(e.target.files).slice(0, 5 - newsImages.length);
                                setNewsImages([
                                  ...newsImages,
                                  ...filesArray.map(file => ({ file, previewUrl: URL.createObjectURL(file) }))
                                ]);
                              }
                            }}
                            disabled={newsImages.length >= 5}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each. Add clear images to help illustrate the news.</p>
                    </div>
                  </div>
                  {newsImages.length > 0 && (
                    <div className="mt-2 grid grid-cols-5 gap-2">
                      {newsImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative cursor-move"
                          draggable
                          onDragStart={() => { dragImage.current = index; }}
                          onDragEnter={() => { dragOverImage.current = index; }}
                          onDragEnd={() => {
                            if (dragImage.current === null || dragOverImage.current === null) return;
                            const newImages = [...newsImages];
                            const dragged = newImages.splice(dragImage.current, 1)[0];
                            newImages.splice(dragOverImage.current, 0, dragged);
                            setNewsImages(newImages);
                            dragImage.current = null;
                            dragOverImage.current = null;
                          }}
                          onDragOver={e => e.preventDefault()}
                        >
                          <img
                            src={image.previewUrl}
                            alt={`Preview ${index + 1}`}
                            className="h-28 w-28 object-cover rounded-md cursor-zoom-in hover:opacity-90 transition-opacity duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => setNewsImages(newsImages.filter((_, i) => i !== index))}
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
                    onClick={() => { setIsModalOpen(false); setEditingNews(null); setNewNews({ title: '', description: '', date: '', category: 'Campus' }); setNewsImages([]); }}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#181818] hover:bg-[#00C7A7] transition"
                  >
                    {editingNews ? 'Save Changes' : 'Add News'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Zoomed Image Modal */}
        {zoomedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setZoomedImage(null)}>
            <img src={zoomedImage} alt="Zoomed" className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl" />
          </div>
        )}
      </main>
    </div>
  );
};

export default News; 