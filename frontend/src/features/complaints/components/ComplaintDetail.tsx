import React, { useState } from 'react';
import { FiTag, FiUser, FiCalendar, FiClock, FiEdit2, FiTrash2, FiFileText, FiActivity } from 'react-icons/fi';
import { Complaint } from '../types';

interface ComplaintDetailProps {
  complaint: Complaint;
  currentUser: any;
  onEdit: (complaint: Complaint) => void;
  onDelete: (id: string) => void;
}

export const ComplaintDetail: React.FC<ComplaintDetailProps> = ({
  complaint,
  currentUser,
  onEdit,
  onDelete,
}) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const submittedBy = complaint.stayAnonymous ? 'Anonymous' : complaint.user?.name || 'Anonymous';
  const canManage = currentUser && complaint.user && (
    complaint.user._id === currentUser._id || 
    complaint.user._id === currentUser.id || 
    currentUser.isAdmin
  );

  return (
    <div className="space-y-8 pb-4">
      {/* Images Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {complaint.images && complaint.images.length > 0 ? (
          complaint.images.map((img, idx) => (
            <div 
              key={idx} 
              className={`relative overflow-hidden rounded-xl border-2 border-gray-100 cursor-zoom-in group ${
                complaint.images?.length === 1 ? 'md:col-span-2 aspect-video' : 'aspect-square'
              }`}
              onClick={() => setZoomedImage(img.url)}
            >
              <img 
                src={img.url} 
                alt={`${complaint.title} - ${idx + 1}`} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            </div>
          ))
        ) : (
          <div className="md:col-span-2 aspect-video bg-gray-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
            <FiTag className="w-12 h-12 text-gray-200 mb-2" />
            <span className="text-gray-400 font-medium">No images provided</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              complaint.status === 'Open' ? 'bg-red-100 text-red-700' :
              complaint.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
              complaint.status === 'Resolved' ? 'bg-green-100 text-green-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {complaint.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              complaint.priority === 'Urgent' ? 'bg-red-600 text-white' :
              complaint.priority === 'High' ? 'bg-orange-100 text-orange-700' :
              complaint.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {complaint.priority} Priority
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">{complaint.title}</h2>
          <div className="flex items-center text-gray-500 text-sm font-medium">
            <FiCalendar className="mr-2" />
            <span>Submitted on {new Date(complaint.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mt-1 p-2 bg-white rounded-lg border-2 border-gray-100 mr-3 text-[#00C6A7]">
                <FiTag />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</p>
                <p className="text-gray-900 font-bold">{complaint.category}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mt-1 p-2 bg-white rounded-lg border-2 border-gray-100 mr-3 text-[#00C6A7]">
                <FiActivity />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Department</p>
                <p className="text-gray-900 font-bold">{complaint.department}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="mt-1 p-2 bg-white rounded-lg border-2 border-gray-100 mr-3 text-[#00C6A7]">
                <FiUser />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Submitted By</p>
                <p className="text-gray-900 font-bold">{submittedBy}</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mt-1 p-2 bg-white rounded-lg border-2 border-gray-100 mr-3 text-[#00C6A7]">
                <FiClock />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Updated</p>
                <p className="text-gray-900 font-bold">{new Date(complaint.lastUpdated).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FiFileText className="text-[#00C6A7]" /> Description
          </h3>
          <p className="text-gray-600 leading-relaxed text-lg bg-white p-6 rounded-2xl border-2 border-gray-100 whitespace-pre-wrap">
            {complaint.description}
          </p>
        </div>

        {/* Status History Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FiActivity className="text-[#00C6A7]" /> Status History
          </h3>
          <div className="relative pl-8 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
            {complaint.statusHistory.slice().reverse().map((history, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-10 top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm ${
                  history.status === 'Resolved' ? 'bg-green-500' :
                  history.status === 'In Progress' ? 'bg-yellow-500' :
                  history.status === 'Open' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} />
                <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm">
                  <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                    <span className="font-bold text-gray-900">{history.status}</span>
                    <span className="text-xs text-gray-400 font-medium">{new Date(history.timestamp).toLocaleString()}</span>
                  </div>
                  {history.comment && (
                    <p className="text-gray-600 text-sm italic">"{history.comment}"</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Updated by {typeof history.updatedBy === 'object' ? history.updatedBy.name : 'System'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {canManage && (
        <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-gray-100">
          {!['Resolved', 'Closed'].includes(complaint.status) && (
            <button
              onClick={() => onEdit(complaint)}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <FiEdit2 /> Edit Complaint
            </button>
          )}
          <button
            onClick={() => onDelete(complaint._id)}
            className="flex-none px-6 py-4 bg-white text-red-600 border-2 border-red-200 rounded-xl font-bold hover:bg-red-50 transition-all"
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
