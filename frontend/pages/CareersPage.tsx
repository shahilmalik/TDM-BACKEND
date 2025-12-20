import React, { useState } from 'react';
import { Search, Briefcase, X, Upload, CheckCircle, Linkedin, Link as LinkIcon, Send } from 'lucide-react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

interface CareersPageProps {
  onNavigate: (page: string, subPage?: string) => void;
}

const CareersPage: React.FC<CareersPageProps> = ({ onNavigate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
    }, 1000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setIsSubmitted(false), 300); // Reset after close
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
       <SEO 
         title="Careers" 
         description="Join the team at Tarviz Digimart. Explore open positions for creative designers, developers, and marketing strategists in Chennai." 
         keywords={['Jobs in Chennai', 'Digital Marketing Jobs', 'Creative Careers', 'Web Developer Jobs']}
       />
       <div className="pt-24 pb-20 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-[#6C5CE7] font-bold tracking-widest uppercase text-sm">Join the Team</span>
                <h1 className="mt-3 text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Build the Future of Digital</h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                   At Tarviz Digimart, we are always looking for creative minds and strategic thinkers. Check out our open positions below.
                </p>
             </div>

             <div className="max-w-2xl mx-auto mb-16">
                <div className="relative">
                   <Search className="absolute left-4 top-4 text-slate-400" size={20} />
                   <input 
                     type="text" 
                     placeholder="Search for roles (e.g. Designer, Developer)" 
                     className="w-full pl-12 pr-6 py-4 rounded-xl bg-white border border-slate-200 focus:border-[#6C5CE7] focus:ring-2 focus:ring-violet-100 outline-none text-lg shadow-sm"
                   />
                </div>
             </div>

             <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Briefcase size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Open Roles</h3>
                <p className="text-slate-500 mb-6">There are no open positions available at the moment. However, we are always interested in meeting great talent.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-[#6C5CE7] font-bold hover:text-[#FF6B6B] transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                   Send us your resume anyway <Send size={16} />
                </button>
             </div>
          </div>
       </div>

       {/* Application Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closeModal}></div>
          <div className="bg-white rounded-3xl w-full max-w-lg relative z-10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <button onClick={closeModal} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500">
              <X size={20} />
            </button>

            {!isSubmitted ? (
              <div className="p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">General Application</h3>
                <p className="text-slate-500 mb-6 text-sm">Tell us about yourself and we'll keep you in mind for future openings.</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">First Name</label>
                      <input required type="text" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#6C5CE7] outline-none" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Last Name</label>
                      <input required type="text" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#6C5CE7] outline-none" placeholder="Doe" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                    <input required type="email" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#6C5CE7] outline-none" placeholder="john@example.com" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone</label>
                    <input required type="tel" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#6C5CE7] outline-none" placeholder="+91 98765 43210" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1"><Linkedin size={12} /> LinkedIn</label>
                      <input type="url" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#6C5CE7] outline-none" placeholder="linkedin.com/in/..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1"><LinkIcon size={12} /> Portfolio</label>
                      <input type="url" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#6C5CE7] outline-none" placeholder="dribbble.com/..." />
                    </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Resume / CV</label>
                     <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 hover:border-[#6C5CE7] transition-colors cursor-pointer relative">
                        <Upload size={24} className="mb-2" />
                        <span className="text-sm font-medium">Click to upload PDF</span>
                        <input type="file" accept=".pdf,.doc,.docx" className="absolute inset-0 opacity-0 cursor-pointer" required />
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Why Tarviz Digimart?</label>
                     <textarea rows={3} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#6C5CE7] outline-none resize-none" placeholder="Tell us what drives you..."></textarea>
                  </div>

                  <button type="submit" className="w-full py-4 bg-[#6C5CE7] text-white font-bold rounded-xl shadow-lg hover:shadow-violet-200 transition-all mt-2">
                    Submit Application
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center text-center">
                 <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                    <CheckCircle size={40} />
                 </div>
                 <h3 className="text-2xl font-bold text-slate-900 mb-2">Application Received!</h3>
                 <p className="text-slate-500 mb-8">Thank you for your interest. Our HR team will review your profile and get in touch if a suitable role opens up.</p>
                 <button onClick={closeModal} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors">
                    Close
                 </button>
              </div>
            )}
          </div>
        </div>
       )}

       <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default CareersPage;