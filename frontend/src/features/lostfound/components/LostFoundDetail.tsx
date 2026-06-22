import React, { useState } from 'react';
import { FiMapPin, FiCalendar, FiUser, FiMail, FiCheckCircle, FiEdit2, FiTrash2, FiTag, FiFileText } from 'react-icons/fi';
import { LostFoundItem } from '../types';

interface LostFoundDetailProps {
  item: LostFoundItem;
  currentUser: any;
  token: string | null;
  onResolve: (id: string) => void;
  onEdit: (item: LostFoundItem) => void;
  onDelete: (id: string) => void;
}

export const LostFoundDetail: React.FC<LostFoundDetailProps> = ({
  item,
  currentUser,
  token,
  onResolve,
  onEdit,
  onDelete,
}) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const canManage = token && currentUser && item.user && (currentUser._id === item.user._id || currentUser.isAdmin);

  return (
    <div className="space-y-8 pb-4">
      {/* Images Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {item.images && item.images.length > 0 ? (
          item.images.map((img, idx) => (
            <div 
              key={idx} 
              className={`relative overflow-hidden rounded-xl border-2 border-gray-100 dark:border-gray-800 cursor-zoom-in group ${
                item.images.length === 1 ? 'md:col-span-2 aspect-video' : 'aspect-square'
              }`}
              onClick={() => setZoomedImage(img.url)}
            >
              <img 
                src={img.url} 
                alt={`${item.title} - ${idx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            </div>
          ))
        ) : (
          <div className="md:col-span-2 aspect-video bg-gray-50 dark:bg-gray-900 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800">
            <FiTag className="w-12 h-12 text-gray-200 dark:text-gray-700 mb-2" />
            <span className="text-gray-400 dark:text-gray-500 font-medium">No images provided</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              item.type === 'lost' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            }`}>
              {item.type} Item
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              item.resolved ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
            }`}>
              {item.resolved ? 'Resolved' : 'Unresolved'}
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2">{item.title}</h2>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium">
            <FiCalendar className="mr-2" />
            <span>Posted on {new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-800">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-100 dark:border-gray-700 mr-3 text-[#00C6A7]">
                <FiMapPin />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Location</p>
                <p className="text-gray-900 dark:text-white font-bold">{item.location || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-100 dark:border-gray-700 mr-3 text-[#00C6A7]">
                <FiCalendar />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Date of {item.type === 'lost' ? 'Loss' : 'Finding'}</p>
                <p className="text-gray-900 dark:text-white font-bold">{new Date(item.date).toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-100 dark:border-gray-700 mr-3 text-[#00C6A7]">
                <FiUser />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Posted By</p>
                <p className="text-gray-900 dark:text-white font-bold">{item.user.name}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-100 dark:border-gray-700 mr-3 text-[#00C6A7]">
                <FiMail />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Contact Info</p>
                <p className="text-gray-900 dark:text-white font-bold">{item.contact}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiFileText className="text-[#00C6A7]" /> Description
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg bg-white dark:bg-gray-900 p-6 rounded-2xl border-2 border-gray-100 dark:border-gray-800">
            {item.description}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      {canManage && (
        <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-gray-100 dark:border-gray-800">
          {!item.resolved && (
            <button
              onClick={() => onResolve(item._id)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
            >
              <FiCheckCircle className="w-5 h-5" /> Mark as Resolved
            </button>
          )}
          {!item.resolved && (
            <button
              onClick={() => onEdit(item)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <FiEdit2 className="w-5 h-5" /> Edit Post
            </button>
          )}
          <button
            onClick={() => onDelete(item._id)}
            className="flex-none px-6 py-4 bg-white dark:bg-gray-900 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <FiTrash2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 cursor-zoom-out"
          onClick={() => setZoomedImage(null)}
        >
          <img src={zoomedImage} alt="Zoomed" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
};
