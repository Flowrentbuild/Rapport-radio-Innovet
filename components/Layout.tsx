
import React, { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  currentView: string;
  onNavigate: (view: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, title, currentView, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ) },
    { id: 'patients', label: 'Dossiers Patients', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9l-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ) },
    { id: 'clients', label: 'Gestion Clients', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ) },
    { id: 'settings', label: 'Paramètres', icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ) },
  ];

  return (
    <div className="min-h-screen flex bg-[#fff9e9] font-inter">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-[#0d0a0f] text-white sticky top-0 h-screen z-50">
        <div className="p-8 flex flex-col items-center">
          <div className="mb-12 text-center">
            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">
              INNOVET <span className="text-[#7A59E8]">TECH</span>
            </h1>
            <p className="text-[10px] font-black tracking-[0.4em] uppercase text-white/30 mt-1">EquiScribe AI</p>
          </div>

          <nav className="w-full space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all ${
                  currentView === item.id 
                    ? 'bg-[#7A59E8] text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8">
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Besoin d'aide ?</p>
            <button className="text-xs font-bold text-[#A38CF2] hover:underline">Support Technique</button>
          </div>
        </div>
      </aside>

      {/* Mobile Header & Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#0d0a0f] text-white h-16 flex items-center justify-between px-6 z-50">
        <h1 className="text-lg font-black italic tracking-tighter uppercase">
          INNOVET <span className="text-[#7A59E8]">TECH</span>
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-[#0d0a0f] z-40 pt-20 px-6">
          <nav className="space-y-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black uppercase tracking-widest text-sm ${
                  currentView === item.id ? 'bg-[#7A59E8] text-white' : 'text-white/40'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative pt-16 lg:pt-0 overflow-x-hidden">
        <div className="fixed inset-0 bg-halftone pointer-events-none -z-10"></div>
        
        <header className="hidden lg:flex items-center justify-between px-10 h-24 bg-transparent">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#0d0a0f]/30">{title}</h2>
          <div className="flex items-center gap-6">
            <div className="flex flex-col text-right">
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Dr. Christophe S.</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Clinique Bailly</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#7A59E8] flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">CS</div>
          </div>
        </header>

        <main className="px-6 lg:px-10 pb-20">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
