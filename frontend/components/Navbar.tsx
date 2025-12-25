import React, { useState, useEffect } from 'react';
import { Menu, X, User, ChevronRight, ChevronDown, Pencil } from 'lucide-react';
import { api, BASE_URL, getAdminBaseUrl } from '../services/api';

interface NavbarProps {
  onNavigate: (page: string, subPage?: string) => void;
  currentPage: string;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  isEditor?: boolean;
  brandLogoUrl?: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, isLoggedIn, onLogin, onLogout, isEditor = false, brandLogoUrl: propBrandLogoUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(propBrandLogoUrl || null);

  useEffect(() => {
    if (!propBrandLogoUrl) {
      (async () => {
        try {
          const data: any = await api.home.getHomePageFull();
          const logos = Array.isArray(data?.brand_logos) ? data.brand_logos : [];
          const url = logos?.[0]?.logo || null;
          // avoid caching old logo in some browsers
          setBrandLogoUrl(url ? `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}` : null);
        } catch {
          setBrandLogoUrl(null);
        }
      })();
    }
  }, [propBrandLogoUrl]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const serviceLinks = [
    { name: 'Social Media Marketing', id: 'smm' },
    { name: 'Graphic Designing', id: 'graphic' },
    { name: 'E-commerce Management', id: 'ecom' },
    { name: 'Web Design & Dev', id: 'web' },
    { name: 'SEO Optimization', id: 'seo' },
    { name: 'Photography & Reels', id: 'photography' },
  ];

  const getTextColorClass = (isActive: boolean) => {
    if (currentPage !== 'home') {
       return isActive ? 'text-[#6C5CE7]' : 'text-slate-700 hover:text-[#6C5CE7]';
    }
    
    if (scrolled) {
      return isActive ? 'text-[#6C5CE7]' : 'text-slate-700 hover:text-[#6C5CE7]';
    } else {
      return isActive ? 'text-[#FF6B6B]' : 'text-white hover:text-[#FF6B6B]';
    }
  };

  const menuIconColor = currentPage === 'home' && !scrolled ? 'text-white' : 'text-slate-800';

  const openAdmin = (path: string) => {
    window.open(`${getAdminBaseUrl()}${path}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
             <div className="w-10 h-10 relative drop-shadow-sm transition-transform group-hover:scale-105 duration-300">
               {brandLogoUrl ? (
                 <img
                   src={brandLogoUrl}
                   alt="Tarviz Digimart"
                   className="w-10 h-10 object-contain"
                 />
               ) : (
                 <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                   {/* Top Orange Triangle */}
                   <path d="M10 50 L90 10 L50 50 Z" fill="#FF6B6B" />
                   <path d="M90 10 L50 50 L90 50 Z" fill="#FF8E53" />
                   
                   {/* Bottom Purple Triangle */}
                   <path d="M10 50 L50 50 L60 90 Z" fill="#6C5CE7" />
                   <path d="M50 50 L90 50 L60 90 Z" fill="#8075E8" />
                 </svg>
               )}
             </div>
             
             <div className="flex flex-col justify-center">
                <div className={`text-xl font-bold leading-none tracking-tight font-outfit flex items-center gap-1 ${currentPage === 'home' && !scrolled ? 'text-white' : 'text-slate-900'}`}>
                  <span>Tarviz</span>
                  <span className="text-[#6C5CE7]">Digimart</span>
                </div>
                <span className={`text-[0.6rem] font-medium tracking-wider uppercase mt-1 ${currentPage === 'home' && !scrolled ? 'text-white/70' : 'text-slate-500'}`}>
                  The Upgrade You Seek
                </span>
             </div>
          </div>

          {isEditor && (
            <button
              type="button"
              onClick={() => openAdmin('/home/brandlogo/')}
              className="ml-3 inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 bg-white/80 hover:bg-white text-slate-700"
              title="Edit logo"
            >
              <Pencil size={16} />
            </button>
          )}

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${getTextColorClass(currentPage === 'home')}`}
            >
              Home
            </button>

            {/* Services Dropdown */}
            <div 
              className="relative group"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                className={`flex items-center gap-1 text-sm font-medium transition-all duration-300 ${getTextColorClass(currentPage === 'services')}`}
              >
                Services <ChevronDown size={14} />
              </button>
              
              {servicesOpen && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-4 w-64">
                   <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                      {serviceLinks.map((service) => (
                        <button
                          key={service.id}
                          onClick={() => {
                            onNavigate('services', service.id);
                            setServicesOpen(false);
                          }}
                          className="block w-full text-left px-6 py-3 text-sm font-medium text-gray-600 hover:bg-slate-50 hover:text-[#6C5CE7] transition-colors"
                        >
                          {service.name}
                        </button>
                      ))}
                   </div>
                </div>
              )}
            </div>

            <button
              onClick={() => onNavigate('about')}
              className={`text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${getTextColorClass(currentPage === 'about')}`}
            >
              About
            </button>

            <button
              onClick={() => onNavigate('contact')}
              className={`text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 ${getTextColorClass(currentPage === 'contact')}`}
            >
              Contact
            </button>

            {isLoggedIn ? (
               <div className={`flex items-center gap-4 pl-4 border-l ${scrolled ? 'border-gray-200' : 'border-gray-700'}`}>
                 <button 
                  onClick={() => onNavigate('dashboard')}
                  className="px-5 py-2 rounded-full bg-[#6C5CE7] text-white font-medium hover:bg-[#5a4ad1] shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-sm"
                >
                  Dashboard
                </button>
                <button 
                  onClick={onLogout}
                  className={`text-sm font-medium ${scrolled ? 'text-slate-500 hover:text-red-500' : 'text-slate-300 hover:text-white'}`}
                >
                  Sign Out
                </button>
               </div>
            ) : (
              <button
                onClick={onLogin}
                className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all shadow-md hover:shadow-xl transform hover:-translate-y-0.5 text-sm font-bold group ${
                   scrolled 
                    ? 'bg-slate-900 text-white hover:bg-slate-800' 
                    : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
              >
                <User size={16} className={`transition-colors ${scrolled ? 'group-hover:text-[#FF6B6B]' : 'text-[#6C5CE7]'}`} />
                Client Portal
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsOpen(!isOpen)} className={menuIconColor}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 absolute w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="px-4 pt-4 pb-6 space-y-2">
            <button onClick={() => { onNavigate('home'); setIsOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-slate-50">Home</button>
            
            <div className="px-4 py-2">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Services</p>
              {serviceLinks.map(s => (
                <button 
                  key={s.id}
                  onClick={() => { onNavigate('services', s.id); setIsOpen(false); }} 
                  className="block w-full text-left py-2 text-base font-medium text-gray-600 hover:text-[#6C5CE7]"
                >
                  {s.name}
                </button>
              ))}
            </div>

            <button onClick={() => { onNavigate('about'); setIsOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-slate-50">About</button>
            <button onClick={() => { onNavigate('contact'); setIsOpen(false); }} className="block w-full text-left px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:bg-slate-50">Contact</button>
            
             <button
                onClick={() => {
                  isLoggedIn ? onNavigate('dashboard') : onLogin();
                  setIsOpen(false);
                }}
                className="w-full text-left mt-4 px-4 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-between"
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Client Login'}
                <ChevronRight size={16} />
              </button>
          </div>
        </div>
      )}
    </nav>
    </>
  );
};

export default Navbar;