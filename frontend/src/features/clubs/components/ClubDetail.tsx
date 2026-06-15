import React, { useState } from 'react';
import { FiCalendar, FiTag, FiUser, FiMail, FiPhone, FiEdit2, FiTrash2, FiFileText, FiUsers } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { Club } from '../types';
import { UI_PATTERNS } from '../../../theme/uiPatterns';

interface ClubDetailProps {
  club: Club;
  isAdmin?: boolean;
  onEdit: (club: Club) => void;
  onDelete: (id: string) => void;
}

export const ClubDetail: React.FC<ClubDetailProps> = ({
  club,
  isAdmin,
  onEdit,
  onDelete,
}) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const applicationsClosed = club.status === 'Closed' || !club.formUrl;

  const buildWhatsAppShareUrl = () => {
    const contactSegments = [club.contactInfo?.name, club.contactInfo?.email, club.contactInfo?.phone].filter(Boolean);
    const lines = [
      '🎓 *Join the Club Recruitment!* 🎓',
      '',
      `*Club:* ${club.clubName}`,
      `*Title:* ${club.title}`,
      `*Description:* ${club.description}`,
      `*Recruitment Period:* ${new Date(club.startDate).toLocaleDateString()} - ${new Date(club.endDate).toLocaleDateString()}`,
      ...(contactSegments.length > 0 ? [`*Contact:* ${contactSegments.join(' | ')}`] : []),
      '',
      'Apply now and be part of something amazing!',
      `🔗 ${club.formUrl}`,
      '',
      `See more details here: ${typeof window !== 'undefined' ? window.location.href : ''}`,
    ];

    const encodedMessage = lines.map((line) => encodeURIComponent(line)).join('%0A');
    return `https://wa.me/?text=${encodedMessage}`;
  };

  return (
    <div className="space-y-8 pb-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 flex-shrink-0">
          {club.image?.url ? (
            <div 
              className="relative aspect-video rounded-xl overflow-hidden border-2 border-gray-100 cursor-zoom-in group"
              onClick={() => setZoomedImage(club.image?.url || null)}
            >
              <img 
                src={club.image.url} 
                alt={club.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            </div>
          ) : (
            <div className="aspect-video bg-gray-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
              <FiUsers className="w-12 h-12 text-gray-200 mb-2" />
              <span className="text-gray-400 font-medium">No banner available</span>
            </div>
          )}
        </div>

        <div className="flex-grow space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                club.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {club.status}
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">{club.title}</h2>
            <div className="flex items-center text-[#00C6A7] font-bold text-lg">
              <FiTag className="mr-2" />
              <span>{club.clubName}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <div className="flex items-center text-gray-700 font-medium">
              <FiCalendar className="mr-3 text-gray-400" />
              <span>{new Date(club.startDate).toLocaleDateString()} - {new Date(club.endDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {applicationsClosed ? (
              <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-lg font-bold bg-gray-100 text-gray-400 cursor-not-allowed"
              >
                Applications Closed
              </button>
            ) : (
              <a
                href={club.formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full ${UI_PATTERNS.buttonPrimary} text-center py-4 rounded-xl text-lg`}
              >
                Apply Now
              </a>
            )}
            <a
              href={buildWhatsAppShareUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-bold text-[#128C7E] border-2 border-[#25D366] bg-white hover:bg-green-50 transition-all"
            >
              <FaWhatsapp className="w-5 h-5" /> Share on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <FiFileText className="text-[#00C6A7]" /> Recruitment Details
            </h3>
            <p className="text-gray-600 leading-relaxed bg-white p-6 rounded-2xl border-2 border-gray-100 whitespace-pre-wrap">
              {club.description}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
              <FiUser className="text-[#00C6A7]" /> Contact Information
            </h3>
            <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100 space-y-4">
              {club.contactInfo?.name && (
                <div className="flex items-center gap-3">
                  <FiUser className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Contact Name</p>
                    <p className="text-gray-900 font-bold">{club.contactInfo.name}</p>
                  </div>
                </div>
              )}
              {club.contactInfo?.email && (
                <div className="flex items-center gap-3">
                  <FiMail className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Email</p>
                    <a href={`mailto:${club.contactInfo.email}`} className="text-[#00C6A7] font-bold hover:underline">{club.contactInfo.email}</a>
                  </div>
                </div>
              )}
              {club.contactInfo?.phone && (
                <div className="flex items-center gap-3">
                  <FiPhone className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Phone</p>
                    <a href={`tel:${club.contactInfo.phone}`} className="text-[#00C6A7] font-bold hover:underline">{club.contactInfo.phone}</a>
                  </div>
                </div>
              )}
              {!club.contactInfo?.name && !club.contactInfo?.email && !club.contactInfo?.phone && (
                <p className="text-gray-400 italic text-center py-2">No contact info provided</p>
              )}
            </div>
          </div>

          {isAdmin && (
            <div className="pt-6 border-t-2 border-gray-100 flex flex-wrap gap-4">
              <button
                onClick={() => onEdit(club)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#181818] text-white rounded-xl font-bold hover:bg-[#00C6A7] transition-all shadow-lg shadow-gray-100"
              >
                <FiEdit2 /> Edit Recruitment
              </button>
              <button
                onClick={() => onDelete(club._id)}
                className="flex-none px-6 py-4 bg-white text-red-600 border-2 border-red-200 rounded-xl font-bold hover:bg-red-50 transition-all"
              >
                <FiTrash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

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
