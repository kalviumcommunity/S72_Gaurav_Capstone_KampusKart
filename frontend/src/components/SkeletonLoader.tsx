import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'lostfound' | 'login' | 'signup' | 'home' | 'profile';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant = 'lostfound' }) => {
  const LostFoundSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <div className="h-48 bg-gray-200 animate-pulse"></div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const AuthSkeleton = () => (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
      <div className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-10 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  );

  const HomeSkeleton = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-[60vh] bg-gray-200 animate-pulse rounded-lg"></div>
      
      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="p-6 bg-white rounded-lg shadow-md">
            <div className="h-12 w-12 bg-gray-200 rounded-full animate-pulse mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse mb-2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="p-4 bg-white rounded-lg shadow-md">
            <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const ProfileSkeleton = () => (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <div className="fixed top-0 left-0 w-full z-50 bg-gray-200 h-16 animate-pulse"></div> {/* Navbar Placeholder */}
      <main className="flex-1 container mx-auto px-12 py-8 pt-24">
        <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse mx-auto"></div> {/* Title Placeholder */}

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 max-w-md mx-auto">
          {/* Profile Picture Section */}
           <div className="flex flex-col items-center mb-6">
               <div className="relative w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 shadow-inner animate-pulse">
                   {/* Placeholder icon */}
                   <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
               </div>
            </div>

          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div> {/* Label */}
              <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div> {/* Input */}
            </div>
            {/* Email Field */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div> {/* Label */}
              <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div> {/* Input */}
            </div>
             {/* Phone Field */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div> {/* Label */}
              <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div> {/* Input */}
            </div>
            {/* Gender Field */}
             <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div> {/* Label */}
              <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div> {/* Input */}
            </div>
             {/* Date of Birth Field */}
             <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div> {/* Label */}
              <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div> {/* Input */}
            </div>
             {/* Major Field */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div> {/* Label */}
              <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div> {/* Input */}
            </div>
             {/* Program Field */}
             <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div> {/* Label */}
              <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div> {/* Input */}
            </div>
             {/* Year Interval Field */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div> {/* Label */}
              <div className="h-10 bg-gray-200 rounded-md animate-pulse"></div> {/* Input */}
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
               <div className="h-10 bg-gray-200 rounded-full w-24 animate-pulse"></div> {/* Cancel/Edit Button */}
               <div className="h-10 bg-gray-200 rounded-full w-32 animate-pulse"></div> {/* Save Button */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  switch (variant) {
    case 'lostfound':
      return <LostFoundSkeleton />;
    case 'login':
    case 'signup':
      return <AuthSkeleton />;
    case 'home':
      return <HomeSkeleton />;
    case 'profile':
      return <ProfileSkeleton />;
    default:
      return <LostFoundSkeleton />;
  }
};

export default SkeletonLoader; 