import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UniversalLoader from './UniversalLoader';
import { useDataLoading } from '../hooks/useLoading';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiXCircle, FiUpload, FiAlertCircle, FiCheckCircle, FiCalendar, FiTag, FiBriefcase } from 'react-icons/fi'; // Importing icons including new ones
import { API_BASE } from '../config';

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

// Helper function to calculate profile completion percentage
const calculateCompletion = (profileData: any) => {
    const fields = ['name', 'email', 'phone', 'gender', 'dateOfBirth', 'major', 'program', 'yearOfStudy'];
    const filledFields = fields.filter(field => profileData[field] && profileData[field].trim() !== '');
    return Math.round((filledFields.length / fields.length) * 100);
};

const Profile = () => {
  const { user, token } = useAuth();
  const { isLoading, error: loadingError, steps, startLoading, stopLoading, setError: setLoadingError } = useDataLoading();
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
      startLoading();

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
        stopLoading();
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

  if (isLoading || pageLoading || !user) {
    return (
      <UniversalLoader
        variant="page"
        title="Loading Profile"
        subtitle="Fetching your profile data..."
        showSteps={true}
        steps={steps}
        error={loadingError}
        onRetry={() => window.location.reload()}
        size="large"
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fafbfc] font-sans">
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[100px]">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 flex flex-col items-center">
            <div className="w-full flex flex-col items-center">
              <div className="bg-white rounded-2xl shadow-md p-0 w-full flex flex-col items-center relative mt-24" style={{ minHeight: 220 }}>
                {/* Profile Picture Card */}
                <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-[#e5e7eb] shadow-md absolute left-1/2 -translate-x-1/2 -top-20 z-10">
                  {profileData.profilePicture?.url || previewUrl ? (
                    <img 
                      src={previewUrl || profileData.profilePicture?.url}
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-16 h-16 text-gray-300"/>
                  )}
                  {isEditing && (
                    <label 
                      htmlFor="profilePicture-upload"
                      className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity rounded-xl"
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
                <div className="pt-24 pb-8 px-6 w-full flex flex-col items-center">
                  <h1 className="text-2xl font-extrabold text-black mb-2 mt-8">My Profile</h1>
                  {/* Profile Completion Meter */}
                  <div className="mb-6 w-full max-w-xs">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-700">Profile Completion</span>
                      <span className="text-xs text-gray-500">{calculateCompletion(profileData)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[#00C6A7] h-2 rounded-full transition-all duration-300" style={{ width: `${calculateCompletion(profileData)}%` }}></div>
                    </div>
                  </div>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center w-full max-w-xs">
                      <FiAlertCircle className="mr-2 w-5 h-5" />
                      <span className="text-xs">{error}</span>
                    </div>
                  )}
                  {successMessage && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center w-full max-w-xs">
                      <FiCheckCircle className="mr-2 w-5 h-5" />
                      <span className="text-xs">{successMessage}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-8 w-full mt-0">
            {isEditing ? (
              <div className="space-y-12">
                {/* Personal Info Section Header */}
                <div className="flex items-center gap-2 mb-2 ml-1">
                  <span className="bg-[#00C6A7] text-white rounded-full p-1.5"><FiUser className="w-6 h-6" /></span>
                  <h2 className="text-xl font-extrabold text-black">Personal Information</h2>
                </div>
                {/* Personal Info Card */}
                <div className="bg-white rounded-lg p-6 border-b border-gray-200 shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="flex flex-col">
                      <label htmlFor="name" className="block text-xs font-semibold text-gray-800 mb-1">Full Name</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"><FiUser className="w-5 h-5"/></span>
                        <input
                          id="name"
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          className="w-full px-10 py-2 bg-[#232323] text-white border-none rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#444] placeholder-gray-400"
                          placeholder="Your full name"
                          disabled={!isEditing}
                          aria-label="Full Name"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Enter your full name as per records.</p>
                      {!profileData.name.trim() && error && <p className="text-xs text-red-400 mt-1">Name is required.</p>}
                    </div>
                    {/* Email */}
                    <div className="flex flex-col">
                      <label htmlFor="email" className="block text-xs font-semibold text-gray-800 mb-1">Email</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"><FiMail className="w-5 h-5"/></span>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          className="w-full px-10 py-2 bg-[#232323] text-white border-none rounded-md shadow-sm cursor-not-allowed placeholder-gray-400 sm:text-sm"
                          placeholder="Your email address"
                          disabled
                          aria-label="Email"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">This is your registered email and cannot be changed.</p>
                    </div>
                    {/* Phone */}
                    <div className="flex flex-col">
                      <label htmlFor="phone" className="block text-xs font-semibold text-gray-800 mb-1">Phone</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"><FiPhone className="w-5 h-5"/></span>
                        <input
                          id="phone"
                          type="text"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          className="w-full px-10 py-2 bg-[#232323] text-white border-none rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#444] placeholder-gray-400"
                          placeholder="Your phone number"
                          disabled={!isEditing}
                          aria-label="Phone"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Add a phone number for contact (optional).</p>
                    </div>
                    {/* Gender */}
                    <div className="flex flex-col">
                      <label htmlFor="gender" className="block text-xs font-semibold text-gray-800 mb-1">Gender</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"><FiUser className="w-5 h-5"/></span>
                        <select
                          id="gender"
                          name="gender"
                          value={profileData.gender}
                          onChange={handleSelectChange}
                          className="w-full px-10 py-2 bg-[#232323] text-white border-none rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#444]"
                          disabled={!isEditing}
                          aria-label="Gender"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Select your gender (optional).</p>
                    </div>
                    {/* Date of Birth */}
                    <div className="flex flex-col">
                      <label htmlFor="dateOfBirth" className="block text-xs font-semibold text-gray-800 mb-1">Date of Birth</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"><FiCalendar className="w-5 h-5"/></span>
                        <input
                          id="dateOfBirth"
                          type="date"
                          name="dateOfBirth"
                          value={profileData.dateOfBirth}
                          onChange={handleInputChange}
                          className="w-full px-10 py-2 bg-[#232323] text-white border-none rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#444] placeholder-gray-400"
                          disabled={!isEditing}
                          aria-label="Date of Birth"
                          style={{ colorScheme: 'dark' }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Format: YYYY-MM-DD</p>
                    </div>
                  </div>
                </div>
                {/* Academic Info Section Header */}
                <div className="flex items-center gap-2 mb-2 mt-8 ml-1">
                  <span className="bg-[#00C6A7] text-white rounded-full p-1.5"><FiBriefcase className="w-6 h-6" /></span>
                  <h2 className="text-xl font-extrabold text-black">Academic Information</h2>
                </div>
                {/* Academic Info Card */}
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Major/Department */}
                    <div className="flex flex-col">
                      <label htmlFor="major" className="block text-xs font-semibold text-gray-800 mb-1">Major/Department</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"><FiMail className="w-5 h-5"/></span>
                        <input
                          id="major"
                          type="text"
                          name="major"
                          value={profileData.major}
                          onChange={handleInputChange}
                          className="w-full px-10 py-2 bg-[#232323] text-white border-none rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#444] placeholder-gray-400"
                          placeholder="e.g., Computer Science"
                          disabled={!isEditing}
                          aria-label="Major/Department"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Your department or major (optional).</p>
                    </div>
                    {/* Program */}
                    <div className="flex flex-col">
                      <label htmlFor="program" className="block text-xs font-semibold text-gray-800 mb-1">Program</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"><FiBriefcase className="w-5 h-5"/></span>
                        <input
                          id="program"
                          type="text"
                          name="program"
                          value={profileData.program}
                          onChange={handleInputChange}
                          className="w-full px-10 py-2 bg-[#232323] text-white border-none rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#444] placeholder-gray-400"
                          placeholder="e.g., Bachelor of Science"
                          disabled={!isEditing}
                          aria-label="Program"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">e.g., BSc, MSc, BTech, etc.</p>
                    </div>
                    {/* Year Interval */}
                    <div className="flex flex-col">
                      <label htmlFor="yearOfStudy" className="block text-xs font-semibold text-gray-800 mb-1">Year Interval</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"><FiCalendar className="w-5 h-5"/></span>
                        <input
                          id="yearOfStudy"
                          type="text"
                          name="yearOfStudy"
                          value={profileData.yearOfStudy}
                          onChange={handleInputChange}
                          className="w-full px-10 py-2 bg-[#232323] text-white border-none rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#444] placeholder-gray-400"
                          placeholder="e.g., 2024 - 2028"
                          disabled={!isEditing}
                          aria-label="Year Interval"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">e.g., 2022 - 2026</p>
                    </div>
                  </div>
                </div>
                {/* Buttons */}
                <div className="flex flex-col md:flex-row justify-end gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 rounded-full text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saveLoading}
                    className={`px-6 py-2 rounded-full text-sm font-semibold text-white bg-[#181818] hover:bg-[#00C6A7] transition ${saveLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Display Name */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Name</p>
                      <div className="flex items-center text-gray-900">
                        <FiUser className="w-5 h-5 mr-2 text-gray-500"/>
                        <span>{profileData.name || 'N/A'}</span>
                      </div>
                    </div>
                    {/* Display Email */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Email</p>
                      <div className="flex items-center text-gray-900">
                        <FiMail className="w-5 h-5 mr-2 text-gray-500"/>
                        <span>{profileData.email || 'N/A'}</span>
                      </div>
                    </div>
                    {/* Display Phone */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Phone</p>
                      <div className="flex items-center text-gray-900">
                        <FiPhone className="w-5 h-5 mr-2 text-gray-500"/>
                        <span>{profileData.phone || 'N/A'}</span>
                      </div>
                    </div>
                    {/* Display Gender */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Gender</p>
                      <div className="flex items-center text-gray-900">
                        <FiUser className="w-5 h-5 mr-2 text-gray-500"/>
                        <span>{profileData.gender || 'N/A'}</span>
                      </div>
                    </div>
                    {/* Display Date of Birth */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Date of Birth</p>
                      <div className="flex items-center text-gray-900">
                        <FiCalendar className="w-5 h-5 mr-2 text-gray-500"/>
                        <span>{formatDate(profileData.dateOfBirth)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Academic Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Display Major/Department */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Major/Department</p>
                      <div className="flex items-center text-gray-900">
                        <FiMail className="w-5 h-5 mr-2 text-gray-500"/>
                        <span>{profileData.major || 'N/A'}</span>
                      </div>
                    </div>
                    {/* Display Program */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Program</p>
                      <div className="flex items-center text-gray-900">
                        <FiBriefcase className="w-5 h-5 mr-2 text-gray-500"/>
                        <span>{profileData.program || 'N/A'}</span>
                      </div>
                    </div>
                    {/* Display Year Interval */}
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">Year Interval</p>
                      <div className="flex items-center text-gray-900">
                        <FiCalendar className="w-5 h-5 mr-2 text-gray-500"/>
                        <span>{profileData.yearOfStudy || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 rounded-full text-sm font-semibold text-white bg-[#181818] hover:bg-[#00C6A7] transition"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile; 