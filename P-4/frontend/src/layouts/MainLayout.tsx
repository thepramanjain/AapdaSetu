import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-800 relative">
      <Navbar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <Footer />
    </div>
  );
};
