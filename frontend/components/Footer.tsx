import React from 'react';
import { MapPin, Mail, Phone, Instagram, Facebook, Linkedin, Twitter, Youtube } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string, subPage?: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (page: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="relative mt-24">
      {/* Wave SVG */}
      <div className="w-full leading-[0] overflow-hidden transform translate-y-[1px]">
        <svg className="w-full h-[100px]" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
          <g className="parallax">
            <use xlinkHref="#gentle-wave" x="48" y="0" fill="#0F172A" />
          </g>
        </svg>
      </div>

      {/* Footer Body */}
      <footer className="bg-[#0F172A] text-white pb-16 pt-0 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 pt-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl font-bold text-white font-outfit">Tarviz<span className="text-[#6C5CE7]">Digimart</span></span>
              </div>
              <p className="mb-6 max-w-sm text-slate-400 leading-relaxed font-medium">
                Empowering brands in Tamil Nadu and beyond. We don't just follow trends; we set the digital trajectory for your success.
              </p>
              
              <div className="mb-8">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Partner Firm</p>
                <div className="bg-white/5 inline-block px-4 py-2 rounded-lg border border-white/10 font-bold text-white hover:bg-white/10 transition-colors cursor-default backdrop-blur-sm">
                    GoodFirms
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 group cursor-pointer">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#FF6B6B] transition-colors text-white"><MapPin size={18} /></div>
                  <span className="mt-1 font-medium text-slate-300 group-hover:text-white transition-colors">Chennai, Tamil Nadu, India</span>
                </div>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#6C5CE7] transition-colors text-white"><Mail size={18} /></div>
                  <a href="mailto:info@tarvizdigimart.com" className="font-medium text-slate-300 group-hover:text-white transition-colors">info@tarvizdigimart.com</a>
                </div>
                <div className="flex items-center gap-3 group cursor-pointer">
                  <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#FF6B6B] transition-colors text-white"><Phone size={18} /></div>
                  <a href="tel:+917470067003" className="font-medium text-slate-300 group-hover:text-white transition-colors">+91 74 7006 7003</a>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Services</h4>
              <ul className="space-y-3 font-medium text-slate-400">
                {['Social Media Marketing', 'Web Development', 'SEO Optimization', 'Graphic Design', 'E-commerce'].map((item) => (
                  <li key={item} className="hover:text-[#6C5CE7] cursor-pointer hover:translate-x-1 transition-all flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-[#6C5CE7] rounded-full"></span> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Company</h4>
              <ul className="space-y-3 mb-8 font-medium text-slate-400">
                <li><a href="#" onClick={(e) => handleNav('about', e)} className="hover:text-[#6C5CE7] hover:translate-x-1 transition-all flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#6C5CE7] rounded-full"></span> About Us</a></li>
                <li><a href="#" onClick={(e) => handleNav('careers', e)} className="hover:text-[#6C5CE7] hover:translate-x-1 transition-all flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#6C5CE7] rounded-full"></span> Careers</a></li>
                <li><a href="#" onClick={(e) => handleNav('blog', e)} className="hover:text-[#6C5CE7] hover:translate-x-1 transition-all flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#6C5CE7] rounded-full"></span> Blog</a></li>
                <li><a href="#" onClick={(e) => handleNav('privacy', e)} className="hover:text-[#6C5CE7] hover:translate-x-1 cursor-pointer transition-all flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#6C5CE7] rounded-full"></span> Privacy Policy</a></li>
                <li><a href="#" onClick={(e) => handleNav('terms', e)} className="hover:text-[#6C5CE7] hover:translate-x-1 cursor-pointer transition-all flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[#6C5CE7] rounded-full"></span> Terms of Service</a></li>
              </ul>

              <h4 className="text-white font-bold mb-4 text-lg">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="p-3 bg-white/5 rounded-xl hover:bg-[#E1306C] text-white transition-colors hover:-translate-y-1"><Instagram size={20} /></a>
                <a href="#" className="p-3 bg-white/5 rounded-xl hover:bg-[#1877F2] text-white transition-colors hover:-translate-y-1"><Facebook size={20} /></a>
                <a href="#" className="p-3 bg-white/5 rounded-xl hover:bg-[#0077B5] text-white transition-colors hover:-translate-y-1"><Linkedin size={20} /></a>
                <a href="#" className="p-3 bg-white/5 rounded-xl hover:bg-black text-white transition-colors hover:-translate-y-1"><Twitter size={20} /></a>
                <a href="#" className="p-3 bg-white/5 rounded-xl hover:bg-[#FF0000] text-white transition-colors hover:-translate-y-1"><Youtube size={20} /></a>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/10 text-center text-sm text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Tarviz Digimart. The Upgrade You Seek.
          </div>
        </footer>
    </div>
  );
};

export default Footer;