import React from 'react';

const MobileTest: React.FC = () => {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Mobile Button Test</h2>
      
      {/* Test buttons with different hover effects */}
      <div className="space-y-2">
        <button className="w-full py-3 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 mobile-touch-friendly mobile-no-hover mobile-active-feedback">
          Test Button 1 (Blue)
        </button>
        
        <button className="w-full py-3 px-4 bg-green-500 text-white rounded hover:bg-green-600 hover:scale-105 mobile-touch-friendly mobile-no-hover mobile-active-feedback">
          Test Button 2 (Green with scale)
        </button>
        
        <button className="w-full py-3 px-4 bg-red-500 text-white rounded hover:bg-red-600 hover:shadow-lg mobile-touch-friendly mobile-no-hover mobile-active-feedback">
          Test Button 3 (Red with shadow)
        </button>
        
        <button className="w-full py-3 px-4 bg-purple-500 text-white rounded hover:bg-purple-600 hover:opacity-90 mobile-touch-friendly mobile-no-hover mobile-active-feedback">
          Test Button 4 (Purple with opacity)
        </button>
      </div>
      
      {/* Test links */}
      <div className="space-y-2">
        <a href="#" className="block w-full py-3 px-4 bg-gray-500 text-white rounded text-center hover:bg-gray-600 mobile-touch-friendly mobile-no-hover mobile-active-feedback">
          Test Link 1
        </a>
        
        <a href="#" className="block w-full py-3 px-4 bg-yellow-500 text-black rounded text-center hover:bg-yellow-600 hover:scale-105 mobile-touch-friendly mobile-no-hover mobile-active-feedback">
          Test Link 2 (with scale)
        </a>
      </div>
      
      {/* Test with existing project styles */}
      <div className="space-y-2">
        <button className="w-full py-3 px-4 rounded-full text-lg font-semibold text-white bg-[#181818] shadow-lg hover:bg-[#00C6A7] hover:text-white transition mobile-touch-friendly mobile-no-hover mobile-active-feedback">
          Project Style Button
        </button>
        
        <button className="w-full py-3 px-4 rounded-full text-lg font-semibold text-black bg-white border border-[#E0E0E0] hover:bg-[#FFD166] hover:text-black transition mobile-touch-friendly mobile-no-hover mobile-active-feedback">
          Project Style Button 2
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Instructions:</h3>
        <ul className="text-sm space-y-1">
          <li>• On mobile: Hover effects should be disabled</li>
          <li>• On mobile: Buttons should respond immediately to touch</li>
          <li>• On mobile: Active state should show scale(0.98)</li>
          <li>• On desktop: Hover effects should work normally</li>
          <li>• All buttons should have minimum 44px touch target</li>
        </ul>
      </div>
    </div>
  );
};

export default MobileTest; 