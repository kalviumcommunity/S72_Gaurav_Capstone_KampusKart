import React from 'react';
import Navbar from './Navbar';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <main className="flex-grow"> {/* flex-grow makes it take remaining height, allow children to manage their own overflow */}
        {children}
      </main>
    </div>
  );
};

export default AuthenticatedLayout; 