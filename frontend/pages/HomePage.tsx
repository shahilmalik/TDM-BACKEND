import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Zap, TrendingUp, Cpu, Quote, MessageSquare, CheckCircle2, Search, Activity, BarChart, AlertTriangle, Check, Pencil } from 'lucide-react';
import * as Icons from 'lucide-react';
import { ServicesList } from '../constants';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { api } from '../services/api';
import { analyzeSiteSEO, SEOAuditResult } from "../services/geminiService";

interface HomePageProps {
  onNavigate: (page: string, subPage?: string) => void;
  isEditor?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate, isEditor = false }) => {
  const [auditUrl, setAuditUrl] = useState('');
  const [auditResult, setAuditResult] = useState<SEOAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);

  const [dbTestimonials, setDbTestimonials] = useState<
    Array<{ id: number; client_name: string; role?: string; company?: string; content?: string }>
  >([]);

  const [homeFull, setHomeFull] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.home.getHomePageFull();
        setHomeFull(data);
        const t = Array.isArray(data?.testimonials) ? data.testimonials : [];
        setDbTestimonials(t);
      } catch (e) {
        setHomeFull(null);
        setDbTestimonials([]);
      }
    })();
  }, []);

  const heroSlide = useMemo(() => {
    const s = homeFull?.slides;
    if (Array.isArray(s) && s.length > 0) return s[0];
    return null;
  }, [homeFull]);

  const testimonialsToRender = useMemo(() => {
    if (dbTestimonials.length > 0) {
      return dbTestimonials.slice(0, 3).map((t) => ({
        name: t.client_name,
        role: t.role || t.company || '',
        text: t.content || '',
      }));
    }

    return [
      { name: "Anita Raj", role: "CEO, Glow Cosmetics", text: "Tarviz Digimart completely revamped our social media strategy. Our engagement has tripled in 3 months!" },
      { name: "Senthil Kumar", role: "Founder, Green Eatz", text: "The team is incredibly creative. The branding package they delivered gave our startup a world-class look." },
      { name: "Priya Menon", role: "Marketing Head, TechFlow", text: "Professional, timely, and data-driven. Their SEO services helped us rank on the first page for our key terms." }
    ];
  }, [dbTestimonials]);

  const openAdmin = (path: string) => {
    window.open(`http://127.0.0.1:8001${path}`, "_blank", "noopener,noreferrer");
  };

  const renderGradientTitle = (text: string) => {
    const parts = String(text || '').split('#');
    return parts.map((part, idx) => {
      const isGradient = idx % 2 === 1;
      if (!part) return null;
      return isGradient ? (
        <span
          key={idx}
          className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B6B] to-[#6C5CE7]"
        >
          {part}
        </span>
      ) : (
        <span key={idx}>{part}</span>
      );
    });
  };

  const renderBoldDescription = (text: string) => {
    const parts = String(text || '').split('*');
    return parts.map((part, idx) => {
      const isBold = idx % 2 === 1;
      if (!part) return null;
      return isBold ? (
        <strong key={idx} className="text-white font-semibold">
          {part}
        </strong>
      ) : (
        <span key={idx}>{part}</span>
      );
    });
  };

  const EditPencilButton: React.FC<{ label: string; onClick: () => void }> = ({
    label,
    onClick,
  }) => {
    if (!isEditor) return null;
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold"
        title={label}
      >
        <Pencil size={16} />
        <span className="hidden sm:inline">Edit</span>
      </button>
    );
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditUrl) return;
    setIsAuditing(true);
    setAuditResult(null);
    setAuditError(null);
    try {
      const result = await analyzeSiteSEO(auditUrl);
      setAuditResult(result);
      if (!result) setAuditError("No audit result returned. Try again later.");
    } catch (err: any) {
      setAuditError("Error running SEO audit. Please try again.");
    }
    setIsAuditing(false);
  };

  return (
    <div className="bg-slate-50 overflow-x-hidden">
      <SEO 
        title="Home"
        description="Tarviz Digimart is Chennai's leading digital marketing agency offering SEO, SMM, Web Design, and E-commerce solutions to boost your ROI."
        keywords={['Digital Marketing Chennai', 'SEO Services', 'Social Media Marketing', 'Web Design India', 'E-commerce Management']}
      />

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center bg-[#0F172A] text-white overflow-hidden">
        {isEditor && (
          <div className="absolute top-24 right-4 z-50">
            <EditPencilButton
              label="Edit hero slide"
              onClick={() => openAdmin('/admin/home/homeslide/')}
            />
          </div>
        )}
        
        {/* Animated Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FF6B6B] rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#6C5CE7] rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse delay-700"></div>
        <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-purple-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>

        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#FF6B6B] animate-ping"></span>
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-300">{heroSlide?.tag || 'Digital Evolution Agency'}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight font-outfit">
              {renderGradientTitle(heroSlide?.title || 'Ignite Your #Digital Future#')}
            </h1>
            <p className="max-w-xl text-lg md:text-xl text-slate-400 mb-8 leading-relaxed">
              {renderBoldDescription(heroSlide?.description || 'We are *Tarviz Digimart*. A next-gen agency in Chennai merging creativity with AI-driven strategies to elevate your brand beyond the noise.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
               <a 
                href="https://wa.me/917470067003?text=Hi%20Tarviz%20Digimart%2C%20I%20am%20interested%20in%20your%20services." 
                target="_blank" 
                rel="noreferrer"
                className="px-8 py-4 bg-green-500 hover:bg-green-600 rounded-full font-bold transition-all shadow-lg shadow-green-900/50 flex items-center justify-center gap-2 text-white group"
              >
                <MessageSquare size={20} className="fill-current" /> WhatsApp Us
              </a>
              <button 
                onClick={() => onNavigate('contact')}
                className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-[#6C5CE7] rounded-full font-bold transition-all text-white backdrop-blur-md"
              >
                Start a Project
              </button>
            </div>
          </div>

          {/* Abstract Visual */}
          <div className="relative hidden md:block z-10">
             <div className="relative w-full aspect-square rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl p-6 flex flex-col justify-between overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/10 to-[#6C5CE7]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Simulated Dashboard UI */}
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="h-32 w-1/2 rounded-2xl bg-slate-800/80 p-4 border border-slate-700 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-2"><TrendingUp size={20} className="text-[#FF6B6B]" /></div>
                       <div className="mt-8 h-1 w-12 bg-slate-600 rounded mb-2"></div>
                       <div className="h-8 w-24 bg-slate-600/50 rounded animate-pulse"></div>
                    </div>
                    <div className="h-32 w-1/2 rounded-2xl bg-gradient-to-br from-[#6C5CE7] to-[#8075e8] p-4 text-white shadow-lg shadow-violet-900/30">
                       <div className="text-3xl font-bold mb-1">+145%</div>
                       <div className="text-xs opacity-80">ROI Increase</div>
                       <div className="mt-4 h-1 bg-white/30 rounded-full overflow-hidden">
                          <div className="h-full w-[70%] bg-white rounded-full"></div>
                       </div>
                    </div>
                  </div>
                  
                  {/* Added Details Section */}
                  <div className="grid grid-cols-3 gap-2">
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-1">Growth</div>
                        <div className="text-lg font-bold text-green-400">4.5x</div>
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-1">Retention</div>
                        <div className="text-lg font-bold text-blue-400">85%</div>
                     </div>
                     <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-1">Churn</div>
                        <div className="text-lg font-bold text-red-400">1.2%</div>
                     </div>
                  </div>

                  <div className="h-40 w-full rounded-2xl bg-slate-800/80 border border-slate-700 p-4 flex items-end justify-between gap-2">
                     {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                       <div key={i} className="w-full bg-[#FF6B6B] rounded-t-sm opacity-80 hover:opacity-100 transition-opacity" style={{height: `${h}%`}}></div>
                     ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-slate-400 text-sm">
                   <div className="flex items-center gap-2"><Cpu size={16} /> AI Optimization Active</div>
                   <div className="font-mono text-[#6C5CE7]">TRVZ-SYS-01</div>
                </div>
             </div>
             
             {/* Floating Badge */}
             <div className="absolute -bottom-6 -left-6 bg-white text-slate-900 p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce-slow">
                <div className="bg-green-100 p-2 rounded-full text-green-600"><Zap size={20} fill="currentColor" /></div>
                <div>
                  <div className="text-xs text-gray-500 font-bold uppercase">Efficiency</div>
                  <div className="font-bold text-lg">Unmatched</div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Services Overview */}
      <div className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-lg font-bold text-[#6C5CE7] tracking-widest uppercase mb-2">What We Do</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900">
              Futuristic Solutions for <span className="text-[#FF6B6B]">Modern Brands</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ServicesList.map((service, index) => {
              const IconComponent = (Icons as any)[service.icon] || Icons.HelpCircle;
              
              return (
                <div 
                  key={service.id}
                  onClick={() => onNavigate('services', service.id)}
                  className="group relative bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-transparent transition-all duration-300 hover:shadow-2xl hover:shadow-violet-200 hover:-translate-y-2 overflow-hidden cursor-pointer"
                >
                  {/* Hover Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B] to-[#6C5CE7] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#6C5CE7] mb-6 shadow-sm group-hover:text-[#FF6B6B] transition-colors">
                    <IconComponent size={28} strokeWidth={1.5} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-white transition-colors">{service.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-6 group-hover:text-white/90 transition-colors">{service.description}</p>
                  
                  <div className="space-y-2">
                     {service.details.slice(0, 3).map((d, i) => (
                       <div key={i} className="flex items-center text-sm font-medium text-slate-500 group-hover:text-white/80">
                         <div className="w-1.5 h-1.5 bg-[#FF6B6B] group-hover:bg-white rounded-full mr-2"></div> {d}
                       </div>
                     ))}
                  </div>

                  <div className="absolute bottom-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                     <ArrowRight className="text-white" size={24} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SEO Audit Section */}
      <section className="max-w-2xl mx-auto my-12 p-6 bg-white rounded-xl shadow">
        <h2 className="font-bold text-2xl mb-4 text-[#6C5CE7]">AI SEO Audit</h2>
        <form onSubmit={handleAudit} className="my-8 flex gap-4">
          <input
            type="url"
            value={auditUrl}
            onChange={e => setAuditUrl(e.target.value)}
            placeholder="Enter your website URL"
            className="px-4 py-2 rounded border w-full"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-[#6C5CE7] text-white rounded font-bold"
            disabled={isAuditing}
          >
            {isAuditing ? "Auditing..." : "Run SEO Audit"}
          </button>
        </form>
        {isAuditing && (
          <div className="text-center text-[#6C5CE7] font-semibold">Running audit...</div>
        )}
        {auditError && (
          <div className="text-red-500 font-medium mt-2">{auditError}</div>
        )}
        {auditResult && (
          <div className="bg-white rounded-xl shadow p-6 mt-4">
            <h3 className="font-bold text-lg mb-2">SEO Audit Result</h3>
            <pre className="text-sm text-slate-700">{JSON.stringify(auditResult, null, 2)}</pre>
          </div>
        )}
      </section>

      {/* NEW SECTION: Creative Process */}
      <div className="py-24 bg-slate-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-2">ONE STEP AHEAD</h2>
               <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Explore the creative process</h3>
               <p className="text-lg text-slate-600 italic">"We sculpt your brand with the chisel called digital media marketing."</p>
            </div>

            <div className="grid md:grid-cols-2 gap-16 items-center">
               <div className="order-2 md:order-1 relative">
                  <div className="absolute inset-0 bg-gradient-brand opacity-10 rounded-full blur-3xl"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800" 
                    alt="Creative Process" 
                    className="relative rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  />
               </div>
               <div className="order-1 md:order-2 space-y-12">
                  <div className="flex gap-6 group">
                     <div className="text-6xl font-black text-slate-200 group-hover:text-[#FF6B6B] transition-colors">01</div>
                     <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Understand your requirements and the constrains.</h4>
                        <div className="h-1 w-12 bg-slate-200 group-hover:bg-[#FF6B6B] transition-colors rounded"></div>
                     </div>
                  </div>
                  <div className="flex gap-6 group">
                     <div className="text-6xl font-black text-slate-200 group-hover:text-[#6C5CE7] transition-colors">02</div>
                     <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Gather data and analyse the rivalry among competitors.</h4>
                         <div className="h-1 w-12 bg-slate-200 group-hover:bg-[#6C5CE7] transition-colors rounded"></div>
                     </div>
                  </div>
                  <div className="flex gap-6 group">
                     <div className="text-6xl font-black text-slate-200 group-hover:text-[#FF6B6B] transition-colors">03</div>
                     <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-2">Customizations to keep you ahead of them.</h4>
                         <div className="h-1 w-12 bg-slate-200 group-hover:bg-[#FF6B6B] transition-colors rounded"></div>
                     </div>
                  </div>
               </div>
            </div>
            {isEditor && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="flex items-center justify-end">
                  <EditPencilButton
                    label="Edit creative process image"
                    onClick={() => openAdmin('/admin/home/creativeprocessimage/')}
                  />
                </div>
              </div>
            )}
         </div>
      </div>

      {/* NEW SECTION: Case Studies & Stats */}
      <div className="py-24 bg-white">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-sm font-bold text-slate-400 tracking-widest uppercase mb-2">SELECTED PROJECTS</h2>
               <h3 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">Digital Case Studies</h3>
               <p className="text-lg text-slate-600 max-w-2xl mx-auto">Passionate about solving problems through creative communications.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
               <div className="relative">
                  <div className="grid grid-cols-2 gap-4">
                     <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=400" className="rounded-2xl shadow-lg mt-8" alt="Case Study 1" />
                     <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=400" className="rounded-2xl shadow-lg" alt="Case Study 2" />
                     <img src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=400" className="rounded-2xl shadow-lg" alt="Case Study 3" />
                  </div>
               </div>
               <div className="grid gap-6">
                  <div className="p-8 border border-slate-100 rounded-3xl hover:shadow-xl transition-shadow">
                     <div className="text-5xl font-extrabold text-[#6C5CE7] mb-2">7+</div>
                     <div className="font-bold text-slate-900 mb-4">Years of Operation</div>
                     <p className="text-slate-600 text-sm">Creating brands that inspire and leaving indelible marks since 2018.</p>
                  </div>
                  <div className="p-8 border border-slate-100 rounded-3xl hover:shadow-xl transition-shadow">
                     <div className="text-5xl font-extrabold text-[#FF6B6B] mb-2">98%</div>
                     <div className="font-bold text-slate-900 mb-4">Positive Feedback</div>
                     <p className="text-slate-600 text-sm">Based on our happy clients about the quality of our services.</p>
                  </div>
                  <div className="p-8 border border-slate-100 rounded-3xl hover:shadow-xl transition-shadow">
                     <div className="text-5xl font-extrabold text-[#6C5CE7] mb-2">326+</div>
                     <div className="font-bold text-slate-900 mb-4">Projects Completed</div>
                     <p className="text-slate-600 text-sm">All projects were promptly completed with dedication.</p>
                  </div>
               </div>
            </div>
            {isEditor && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="flex items-center justify-end">
                  <EditPencilButton
                    label="Edit case studies"
                    onClick={() => openAdmin('/admin/home/casestudyimage/')}
                  />
                </div>
              </div>
            )}
         </div>
      </div>

      {/* Our Clients (Marquee) */}
      <div className="py-20 bg-slate-50 border-y border-slate-200 overflow-hidden">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Trusted by Innovative Brands</h2>
         </div>
         
         <div className="marquee-wrapper">
            <div className="marquee-content flex gap-12 items-center px-4">
               {/* Original Set */}
               {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 hover:scale-110">
                     <img 
                       src={`https://logo.clearbit.com/${['google.com', 'airbnb.com', 'spotify.com', 'stripe.com', 'uber.com', 'slack.com', 'netflix.com', 'amazon.com'][i-1]}`} 
                       alt="Client Logo"
                       className="h-10 md:h-12 object-contain"
                       onError={(e) => { 
                         const target = e.target as HTMLImageElement;
                         target.style.display = 'none';
                         const parent = target.parentElement;
                         if(parent) {
                            parent.innerText = ['Google', 'Airbnb', 'Spotify', 'Stripe', 'Uber', 'Slack', 'Netflix', 'Amazon'][i-1];
                            parent.className = "flex-shrink-0 font-bold text-xl text-slate-400 uppercase tracking-widest";
                         }
                       }}
                     />
                  </div>
               ))}
            </div>
            {/* Duplicate Set for infinite loop */}
            <div className="marquee-content flex gap-12 items-center px-4">
               {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={`dup-${i}`} className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100 hover:scale-110">
                     <img 
                       src={`https://logo.clearbit.com/${['google.com', 'airbnb.com', 'spotify.com', 'stripe.com', 'uber.com', 'slack.com', 'netflix.com', 'amazon.com'][i-1]}`} 
                       alt="Client Logo"
                       className="h-10 md:h-12 object-contain"
                       onError={(e) => { 
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if(parent) {
                             parent.innerText = ['Google', 'Airbnb', 'Spotify', 'Stripe', 'Uber', 'Slack', 'Netflix', 'Amazon'][i-1];
                             parent.className = "flex-shrink-0 font-bold text-xl text-slate-400 uppercase tracking-widest";
                          }
                       }}
                     />
                  </div>
               ))}
            </div>
         </div>
         {isEditor && (
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
             <div className="flex items-center justify-end">
               <EditPencilButton
                 label="Edit client logos"
                 onClick={() => openAdmin('/admin/home/clientlogo/')}
               />
             </div>
           </div>
         )}
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-slate-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
               <h2 className="text-lg font-bold text-[#FF6B6B] tracking-widest uppercase mb-2">Testimonials</h2>
               <h3 className="text-4xl font-extrabold text-slate-900">What People Say</h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
               {testimonialsToRender.map((t, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-shadow relative shadow-sm">
                     <Quote className="text-[#6C5CE7] mb-4 opacity-20" size={40} />
                     <p className="text-slate-600 mb-6 italic leading-relaxed">"{t.text}"</p>
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden">
                           <img src={`https://i.pravatar.cc/150?img=${i + 25}`} alt={t.name} />
                        </div>
                        <div>
                           <div className="font-bold text-slate-900">{t.name}</div>
                           <div className="text-xs text-slate-500 font-medium uppercase">{t.role}</div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
            {isEditor && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="flex items-center justify-end">
                  <EditPencilButton
                    label="Edit testimonials"
                    onClick={() => openAdmin('/admin/home/testimonial/')}
                  />
                </div>
              </div>
            )}
         </div>
      </div>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
      {isEditor && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex items-center justify-end gap-2">
            <EditPencilButton
              label="Edit footer contact"
              onClick={() => openAdmin('/admin/home/footercontactinfo/')}
            />
            <EditPencilButton
              label="Edit footer text"
              onClick={() => openAdmin('/admin/home/footer/')}
            />
            <EditPencilButton
              label="Edit footer content blocks"
              onClick={() => openAdmin('/admin/home/footercontent/')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;