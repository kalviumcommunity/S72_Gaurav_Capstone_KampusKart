import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import { useAuth } from '../contexts/AuthContext';
import SkeletonLoader from './SkeletonLoader';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiXCircle, FiUpload, FiAlertCircle, FiCheckCircle, FiCalendar, FiTag, FiBriefcase } from 'react-icons/fi'; // Importing icons including new ones

// Define API_BASE locally for now to avoid process.env issue
const API_BASE = 'http://localhost:5000';

// Helper function to format date for display
const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return 'N/A';
        }
        return date.toLocaleDateString(); // Format as per local conventions
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'N/A';
    }
};

const Profile = () => {
  const { user, token, loading } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    major: user?.major || '',
    yearOfStudy: user?.yearOfStudy || '',
    profilePicture: user?.profilePicture || null,
    gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    program: user?.program || '',
  });
  
  const [initialProfileData, setInitialProfileData] = useState(profileData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const initialData = {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        major: user.major || '',
        yearOfStudy: user.yearOfStudy || '',
        profilePicture: user.profilePicture || null,
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        program: user.program || '',
      };
      setProfileData(initialData);
      setInitialProfileData(initialData);
    }
  }, [user]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !user) {
         setPageLoading(false);
         return;
      }
      if (!pageLoading) setPageLoading(true);

      try {
        const response = await fetch(`${API_BASE}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          const fetchedData = {
             name: data.name || '',
             email: data.email || '',
             phone: data.phone || '',
             major: data.major || '',
             yearOfStudy: data.yearOfStudy || '',
             profilePicture: data.profilePicture || null,
             gender: data.gender || '',
             dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
             program: data.program || '',
          };
          setProfileData(fetchedData);
          setInitialProfileData(fetchedData);
        } else {
          setError(data.message || 'Failed to fetch profile data.');
        }
      } catch (err: any) {
        console.error('Error fetching profile data:', err);
        setError('An error occurred while fetching profile data.');
      } finally {
        setPageLoading(false);
      }
    };
    
    if (user && token) {
       fetchProfile();
    } else {
        setPageLoading(false);
    }

  }, [token, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    setSuccessMessage(null);
  };
  
   const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
    setSuccessMessage(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setError(null);
      setSuccessMessage(null);
    }
  };

  const handleSave = async () => {
     if (!profileData.name.trim()) {
         setError('Name cannot be empty.');
         return;
     }

    setSaveLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('name', profileData.name.trim());
    formData.append('phone', profileData.phone.trim());
    formData.append('major', profileData.major.trim());
    formData.append('yearOfStudy', profileData.yearOfStudy.trim());
    formData.append('gender', profileData.gender.trim());
    formData.append('dateOfBirth', profileData.dateOfBirth.trim());
    formData.append('program', profileData.program.trim());

    if (selectedFile) {
        formData.append('profilePicture', selectedFile);
    }

    try {
        const response = await fetch(`${API_BASE}/api/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });
        const data = await response.json();

        if (response.ok) {
            const updatedData = {
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                major: data.major || '',
                yearOfStudy: data.yearOfStudy || '',
                profilePicture: data.profilePicture || null,
                gender: data.gender || '',
                dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
                program: data.program || '',
            };
            setProfileData(updatedData);
            setInitialProfileData(updatedData);
            setSelectedFile(null);
            setPreviewUrl(null);
            setSuccessMessage('Profile updated successfully!');
            setIsEditing(false);
        } else {
            setError(data.message || 'Failed to save profile.');
        }
    } catch (err: any) {
        console.error('Error saving profile:', err);
        setError('An error occurred while saving the profile.');
    } finally {
        setSaveLoading(false);
    }
  };

   const handleCancelEdit = () => {
        setProfileData({
            ...initialProfileData,
            dateOfBirth: initialProfileData.dateOfBirth ? initialProfileData.dateOfBirth.split('T')[0] : '',
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        setSuccessMessage(null);
        setIsEditing(false);
    };

  if (loading || pageLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-white font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-12 py-8 pt-24">
          <SkeletonLoader variant="profile" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />
      <main className="flex-1 container mx-auto px-12 py-8 pt-24">
        <h1 className="text-h2 font-extrabold text-black mb-8 text-center">My Profile</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
             <FiAlertCircle className="mr-2 w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center">
            <FiCheckCircle className="mr-2 w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 max-w-md mx-auto">
          {/* Profile Picture Section */}
           <div className="flex flex-col items-center mb-6">
               <div className="relative w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 shadow-inner">
                   {/* Display current profile picture or placeholder */}
                   {profileData.profilePicture?.url || previewUrl ? (
                       <img 
                           src={previewUrl || profileData.profilePicture?.url}
                           alt="Profile" 
                           className="w-full h-full object-cover"
                       />
                   ) : (
                       <FiUser className="w-16 h-16 text-gray-500"/>
                   )}
                   {isEditing && (
                       <label 
                           htmlFor="profilePicture-upload"
                           className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                       >
                           <FiUpload className="w-6 h-6 mr-2"/> Upload
                       </label>
                   )}
                   <input
                       id="profilePicture-upload"
                       type="file"
                       accept="image/*"
                       className="sr-only"
                       onChange={handleFileChange}
                       disabled={!isEditing}
                   />
               </div>
               {selectedFile && isEditing && (
                   <button 
                       type="button"
                       onClick={() => setSelectedFile(null)} 
                       className="mt-2 text-sm text-red-600 hover:underline flex items-center"
                   >
                       <FiXCircle className="mr-1"/> Remove Selected Image
                   </button>
               )}
           </div>

          {isEditing ? (
            // Editing mode form
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                 <div className="relative">
                   <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><FiUser className="w-5 h-5"/></span>
                   <input
                    id="name"
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Your full name"
                    disabled={!isEditing}
                  />
                 </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                   <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><FiMail className="w-5 h-5"/></span>
                   <input
                    id="email"
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-gray-100 cursor-not-allowed text-gray-900 placeholder-gray-500"
                    placeholder="Your email address"
                    disabled
                  />
                 </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                 <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><FiPhone className="w-5 h-5"/></span>
                   <input
                    id="phone"
                    type="text"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Your phone number"
                    disabled={!isEditing}
                  />
                 </div>
              </div>

              {/* Gender */}
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                 <div className="relative">
                   <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><FiUser className="w-5 h-5"/></span>{/* Using user icon for now, can change if needed */}
                   <select
                    id="gender"
                    name="gender"
                    value={profileData.gender}
                    onChange={handleSelectChange}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isEditing}
                   >
                       <option value="">Select Gender</option>
                       <option value="Male">Male</option>
                       <option value="Female">Female</option>
                       <option value="Other">Other</option>
                       <option value="Prefer not to say">Prefer not to say</option>
                   </select>
                 </div>
              </div>

               {/* Date of Birth */}
               <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                 <div className="relative">
                   <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><FiCalendar className="w-5 h-5"/></span>
                   <input
                    id="dateOfBirth"
                    type="date"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isEditing}
                  />
                 </div>
              </div>

              {/* Major/Department */}
               <div>
                <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-1">Major/Department</label>
                 <div className="relative">
                   <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><FiMail className="w-5 h-5"/></span>
                   <input
                    id="major"
                    type="text"
                    name="major"
                    value={profileData.major}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="e.g., Computer Science"
                    disabled={!isEditing}
                  />
                 </div>
              </div>

               {/* Program */}
                <div>
                <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                 <div className="relative">
                   <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><FiBriefcase className="w-5 h-5"/></span>
                   <input
                    id="program"
                    type="text"
                    name="program"
                    value={profileData.program}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="e.g., Bachelor of Science"
                    disabled={!isEditing}
                  />
                 </div>
              </div>

               {/* Year Interval */}
               <div>
                <label htmlFor="yearOfStudy" className="block text-sm font-medium text-gray-700 mb-1">Year Interval</label>
                 <div className="relative">
                   <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><FiCalendar className="w-5 h-5"/></span> {/* Using calendar icon for interval */}
                   <input
                    id="yearOfStudy"
                    type="text"
                    name="yearOfStudy"
                    value={profileData.yearOfStudy}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="e.g., 2024 - 2028"
                    disabled={!isEditing}
                  />
                 </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saveLoading}
                    className={`px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#181818] hover:bg-[#00C6A7] transition ${saveLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                     {saveLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
              </div>
            </div>
          ) : (
            // Viewing mode display
            <div className="space-y-6">
                {/* Display Name */}
                <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Name</p>
                    <div className="flex items-center text-gray-900">
                         <FiUser className="w-5 h-5 mr-2 text-gray-500"/>
                         <span>{profileData.name || 'N/A'}</span>
                    </div>
                </div>

                {/* Display Email */}
                 <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Email</p>
                    <div className="flex items-center text-gray-900">
                         <FiMail className="w-5 h-5 mr-2 text-gray-500"/>
                         <span>{profileData.email || 'N/A'}</span>
                    </div>
                </div>

                {/* Display Phone */}
                 <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Phone</p>
                    <div className="flex items-center text-gray-900">
                         <FiPhone className="w-5 h-5 mr-2 text-gray-500"/>
                         <span>{profileData.phone || 'N/A'}</span>
                    </div>
                 </div>

                {/* Display Gender */}
                 <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Gender</p>
                    <div className="flex items-center text-gray-900">
                         <FiUser className="w-5 h-5 mr-2 text-gray-500"/>
                         <span>{profileData.gender || 'N/A'}</span>
                    </div>
                 </div>

               {/* Display Date of Birth */}
                 <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Date of Birth</p>
                    <div className="flex items-center text-gray-900">
                         <FiCalendar className="w-5 h-5 mr-2 text-gray-500"/>
                         <span>{formatDate(profileData.dateOfBirth)}</span>
                    </div>
                 </div>

                {/* Display Major/Department */}
                 <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Major/Department</p>
                    <div className="flex items-center text-gray-900">
                         <FiMail className="w-5 h-5 mr-2 text-gray-500"/>
                         <span>{profileData.major || 'N/A'}</span>
                    </div>
                 </div>

                {/* Display Program */}
                 <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Program</p>
                    <div className="flex items-center text-gray-900">
                         <FiBriefcase className="w-5 h-5 mr-2 text-gray-500"/>
                         <span>{profileData.program || 'N/A'}</span>
                    </div>
                 </div>

                  {/* Display Year Interval */}
                   <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Year Interval</p>
                    <div className="flex items-center text-gray-900">
                         <FiCalendar className="w-5 h-5 mr-2 text-gray-500"/>
                         <span>{profileData.yearOfStudy || 'N/A'}</span>
                    </div>
                 </div>

                 <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-[#181818] hover:bg-[#00C6A7] transition"
                    >
                      Edit Profile
                    </button>
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile; 