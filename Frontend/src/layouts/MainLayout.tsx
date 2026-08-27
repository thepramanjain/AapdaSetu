import React from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import DisasterBackgroundCarousel from '../components/DisasterBackgroundCarousel';
import CustomCursor from '../components/CustomCursor';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col text-slate-800 relative overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-900 bg-[#FAF7F2]">
      {/* Background was moved to Hero section */}

      {/* Custom Interactive 3D Cursor */}
      <CustomCursor />

      {/* Floating Navbar */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 pt-2 font-sans">
        {children}
      </main>

      {/* Footer */}
      <div className="relative z-20">
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
