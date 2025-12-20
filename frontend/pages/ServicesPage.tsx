import React, { useState } from 'react';
import { Check, Star, ShoppingBag, PenTool, Globe, Search, ArrowRight, Camera, Utensils, Box, Monitor, CheckCircle, Video, Smartphone, Image as ImageIcon, Zap, ChevronDown, ChevronUp, AlertCircle, Users, BarChart2, MousePointerClick, Heart } from 'lucide-react';
import { GraphicItems, EcomPlatforms } from '../constants';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

interface ServicesPageProps {
  serviceId: string;
  onLoginRequest: () => void;
  onNavigate?: (page: string, subPage?: string) => void;
}

const ServicesPage: React.FC<ServicesPageProps> = ({ serviceId, onLoginRequest, onNavigate }) => {
  const [selectedGraphics, setSelectedGraphics] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [existingAccounts, setExistingAccounts] = useState<Record<string, boolean>>({});
  
  // Web Design State
  const [businessNature, setBusinessNature] = useState('');
  const [websiteType, setWebsiteType] = useState('');

  const toggleGraphic = (id: string) => {
    setSelectedGraphics(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleExistingAccount = (id: string) => {
    setExistingAccounts(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleGetQuote = () => {
    onLoginRequest();
  };

  const getSEODetails = (id: string) => {
     const titles: Record<string, string> = {
        smm: 'Social Media Marketing',
        web: 'Web Design & Development',
        seo: 'SEO Services',
        graphic: 'Graphic Design',
        ecom: 'E-commerce Management',
        photography: 'Photography & Production'
     };
     return {
        title: titles[id] || 'Services',
        description: `Professional ${titles[id] || 'Digital Marketing'} services in Chennai by Tarviz Digimart. Boost your brand today.`
     };
  };

  const seoData = getSEODetails(serviceId);

  // ----------------------------------------------------------------------
  // VIEW: SOCIAL MEDIA MARKETING (Packages)
  // ----------------------------------------------------------------------
  if (serviceId === 'smm') {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col">
        <SEO title={seoData.title} description={seoData.description} />
        <div className="pt-20 pb-20 flex-grow">
          {/* Header Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
            <div className="text-center max-w-4xl mx-auto">
              <span className="text-[#FF6B6B] font-bold tracking-widest uppercase text-sm">Social Media Mastery</span>
              <h2 className="mt-3 text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
                Turn Followers into <br/>
                <span className="text-transparent bg-clip-text bg-gradient-brand">Loyal Customers</span>
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                We don't just post; we perform. In a noisy digital world, we help your brand find its voice, build a tribe, and drive tangible results through strategic social media management.
              </p>
            </div>
          </div>

          {/* Value Proposition Grid */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Users, color: 'text-blue-500', title: 'Community Building', desc: 'We foster genuine conversations that turn casual scrollers into brand advocates.' },
                  { icon: Zap, color: 'text-yellow-500', title: 'Viral Content', desc: 'From Reels to Carousels, we create thumb-stopping visuals that algorithms love.' },
                  { icon: MousePointerClick, color: 'text-[#FF6B6B]', title: 'Paid Ad Strategy', desc: 'Laser-targeted Meta & LinkedIn ads to maximize your ROAS and lead gen.' },
                  { icon: BarChart2, color: 'text-[#6C5CE7]', title: 'Deep Analytics', desc: 'Monthly reports that go beyond vanity metrics to show real business impact.' },
                ].map((item, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                     <div className={`w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 ${item.color}`}>
                        <item.icon size={24} />
                     </div>
                     <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                     <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
             </div>
          </div>

          {/* Process / Strategy Section */}
          <div className="bg-white py-20 mb-20 border-y border-slate-100">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                   <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B6B] to-[#6C5CE7] rounded-3xl transform rotate-3 opacity-20"></div>
                      <img 
                        src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800" 
                        alt="Social Media Strategy" 
                        className="relative rounded-3xl shadow-2xl"
                      />
                   </div>
                   <div>
                      <h3 className="text-3xl font-bold text-slate-900 mb-6">Our 4-Step Growth Framework</h3>
                      <div className="space-y-6">
                         <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                            <div>
                               <h4 className="font-bold text-slate-800 text-lg">Audit & Persona Mapping</h4>
                               <p className="text-slate-500">We analyze your current presence and define exactly who your ideal customer is.</p>
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                            <div>
                               <h4 className="font-bold text-slate-800 text-lg">Content Calendar Creation</h4>
                               <p className="text-slate-500">A strategic mix of educational, entertaining, and promotional content scheduled in advance.</p>
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#FF6B6B] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                            <div>
                               <h4 className="font-bold text-slate-800 text-lg">Execution & Engagement</h4>
                               <p className="text-slate-500">We post, we reply, we engage. We keep your account active and alive.</p>
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center font-bold flex-shrink-0">4</div>
                            <div>
                               <h4 className="font-bold text-slate-800 text-lg">Analyze & Optimize</h4>
                               <p className="text-slate-500">We double down on what works and pivot away from what doesn't.</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Pricing Packages */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
               <h3 className="text-3xl font-bold text-slate-900">Choose Your Growth Engine</h3>
               <p className="text-slate-500 mt-2">Transparent pricing for every stage of business.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Spark */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-6">
                    <Star size={24} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Spark</h3>
                  <p className="text-slate-500 mb-6">Perfect for startups establishing a digital footprint.</p>
                  <ul className="space-y-4 mb-8 flex-grow">
                    {['3 Posts Per Week', 'Basic Analytics Report', 'Community Management', '1 Platform'].map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                          <CheckCircle size={16} className="text-slate-400" /> {f}
                        </li>
                    ))}
                  </ul>
                  <button onClick={handleGetQuote} className="w-full py-3 border-2 border-slate-900 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-colors">
                    Get Quote
                  </button>
              </div>

              {/* Radiance */}
              <div className="bg-[#0F172A] text-white rounded-3xl p-8 border border-slate-800 shadow-2xl shadow-violet-500/20 transform md:-translate-y-4 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-[#FF6B6B] to-transparent w-32 h-32 opacity-20 rounded-bl-full"></div>
                  <div className="w-12 h-12 bg-gradient-to-r from-[#FF6B6B] to-[#6C5CE7] rounded-xl flex items-center justify-center text-white mb-6">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Radiance</h3>
                  <p className="text-slate-400 mb-6">Accelerated growth for expanding businesses.</p>
                  <ul className="space-y-4 mb-8 flex-grow">
                    {['5 Posts Per Week', '2 Reels / Shorts', 'Ad Campaign Setup', 'Advanced Analytics', '2 Platforms'].map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                          <CheckCircle size={16} className="text-[#FF6B6B]" /> {f}
                        </li>
                    ))}
                  </ul>
                  <button onClick={handleGetQuote} className="w-full py-3 bg-gradient-to-r from-[#FF6B6B] to-[#6C5CE7] rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/40 transition-all">
                    Get Quote
                  </button>
              </div>

              {/* Luminary */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 mb-6">
                    <Star size={24} fill="black" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Luminary</h3>
                  <p className="text-slate-500 mb-6">Full-scale brand dominance and aggressive scaling.</p>
                  <ul className="space-y-4 mb-8 flex-grow">
                    {['Daily Content Posting', '4 Reels / Shorts', 'Full Ad Management', 'Dedicated Account Manager', 'All Platforms'].map((f, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                          <CheckCircle size={16} className="text-[#6C5CE7]" /> {f}
                        </li>
                    ))}
                  </ul>
                  <button onClick={handleGetQuote} className="w-full py-3 border-2 border-slate-900 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-colors">
                    Get Quote
                  </button>
              </div>
            </div>
          </div>
        </div>
        <Footer onNavigate={onNavigate} />
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: PHOTOGRAPHY
  // ----------------------------------------------------------------------
  if (serviceId === 'photography') {
    return (
      <div className="bg-slate-900 min-h-screen text-white flex flex-col">
        <SEO title={seoData.title} description={seoData.description} />
        <div className="pt-20 pb-20 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-16">
                <span className="text-[#FF6B6B] font-bold tracking-widest uppercase text-sm">Visual Production</span>
                <h2 className="mt-3 text-4xl md:text-6xl font-extrabold mb-8 leading-tight">
                  Capture the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B6B] to-[#6C5CE7]">Perfect Moment</span>
                </h2>
                <p className="text-xl text-slate-400 leading-relaxed">
                  High-quality visuals are the cornerstone of modern digital marketing. Whether it's a 15-second viral reel or a high-end product catalog, we produce visuals that stop the scroll.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-[#6C5CE7] transition-all group">
                  <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center text-[#6C5CE7] mb-6 group-hover:bg-[#6C5CE7] group-hover:text-white transition-colors">
                      <Camera size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Photography</h3>
                  <p className="text-slate-400 mb-6">Crystal clear imagery for your products, food, or corporate events. We ensure every shot aligns with your brand aesthetic.</p>
                  <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2"><Check size={14} className="text-[#6C5CE7]" /> E-commerce Product Shoots</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-[#6C5CE7]" /> Food Styling & Photography</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-[#6C5CE7]" /> Corporate Headshots</li>
                  </ul>
                </div>

                <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-[#FF6B6B] transition-all group">
                  <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center text-[#FF6B6B] mb-6 group-hover:bg-[#FF6B6B] group-hover:text-white transition-colors">
                      <Video size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Videography</h3>
                  <p className="text-slate-400 mb-6">Cinematic storytelling that conveys your brand's message. From ad films to corporate walkthroughs.</p>
                  <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2"><Check size={14} className="text-[#FF6B6B]" /> Brand Commercials</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-[#FF6B6B]" /> Event Coverage</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-[#FF6B6B]" /> Testimonial Videos</li>
                  </ul>
                </div>

                <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 hover:border-pink-500 transition-all group">
                  <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center text-pink-500 mb-6 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                      <Smartphone size={28} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Instagram Reels</h3>
                  <p className="text-slate-400 mb-6">Trend-driven short-form content designed to go viral. We handle scripting, shooting, and editing.</p>
                  <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-center gap-2"><Check size={14} className="text-pink-500" /> Trending Audio Adaptation</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-pink-500" /> Transition-heavy Edits</li>
                      <li className="flex items-center gap-2"><Check size={14} className="text-pink-500" /> Behind-the-Scenes Content</li>
                  </ul>
                </div>
            </div>

            <div className="bg-gradient-to-r from-[#FF6B6B] to-[#6C5CE7] rounded-3xl p-12 text-center">
                <h3 className="text-3xl font-bold mb-4">Ready for your close-up?</h3>
                <p className="text-white/80 mb-8 max-w-2xl mx-auto">Book a session with our production team. We bring the equipment, the talent, and the vision.</p>
                <button 
                  onClick={handleGetQuote}
                  className="bg-white text-[#6C5CE7] px-10 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
                >
                  Book a Shoot
                </button>
            </div>
          </div>
        </div>
        <Footer onNavigate={onNavigate} />
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: GRAPHIC DESIGN
  // ----------------------------------------------------------------------
  if (serviceId === 'graphic') {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col">
        <SEO title={seoData.title} description={seoData.description} />
        <div className="pt-20 pb-20 flex-grow">
          {/* Marquee Portfolio */}
          <div className="w-full bg-[#0F172A] py-6 mb-12 overflow-hidden border-y border-slate-700">
            <div className="marquee-wrapper">
                <div className="marquee-content gap-8 px-4">
                  {[1,2,3,4,5,6,7,8].map(i => (
                      <div key={i} className="w-64 h-40 bg-slate-800 rounded-lg flex-shrink-0 flex items-center justify-center border border-slate-700">
                        <span className="text-slate-500 font-bold">Portfolio Item {i}</span>
                      </div>
                  ))}
                </div>
                <div className="marquee-content gap-8 px-4">
                  {[1,2,3,4,5,6,7,8].map(i => (
                      <div key={`dup-${i}`} className="w-64 h-40 bg-slate-800 rounded-lg flex-shrink-0 flex items-center justify-center border border-slate-700">
                        <span className="text-slate-500 font-bold">Portfolio Item {i}</span>
                      </div>
                  ))}
                </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
                Visuals That <span className="text-[#6C5CE7]">Speak Louder</span>
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Your brand's visual identity is its first impression. We combine artistic flair with marketing psychology to create designs that not only look stunning but also communicate your core values instantly. From a memorable logo to cohesive packaging, we ensure every pixel serves a purpose in building your brand legacy.
              </p>
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <PenTool className="text-[#FF6B6B]" /> Brand Essentials (Category 1)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {GraphicItems.filter(i => i.category === 'stationery').map(item => (
                  <div 
                    key={item.id}
                    onClick={() => toggleGraphic(item.id)}
                    className={`relative overflow-hidden rounded-2xl cursor-pointer group transition-all duration-300 border-2 ${selectedGraphics.includes(item.id) ? 'border-[#6C5CE7] shadow-xl' : 'border-transparent shadow-sm hover:shadow-md'}`}
                  >
                    <div className="h-40 bg-slate-200">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 bg-white h-full">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-800">{item.title}</h4>
                          {selectedGraphics.includes(item.id) && <CheckCircle size={20} className="text-[#6C5CE7]" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Box className="text-[#6C5CE7]" /> Packaging & Mockups (Category 2)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {GraphicItems.filter(i => i.category === 'packaging').map(item => (
                  <div 
                    key={item.id}
                    onClick={() => toggleGraphic(item.id)}
                    className={`relative overflow-hidden rounded-2xl cursor-pointer group transition-all duration-300 border-2 ${selectedGraphics.includes(item.id) ? 'border-[#6C5CE7] shadow-xl' : 'border-transparent shadow-sm hover:shadow-md'}`}
                  >
                    <div className="h-48 bg-slate-200">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 bg-white">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-800">{item.title}</h4>
                          {selectedGraphics.includes(item.id) && <CheckCircle size={20} className="text-[#6C5CE7]" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Branding Package */}
            <div 
              onClick={() => {
                // Logic to select all or toggle special state
                const allIds = GraphicItems.map(i => i.id);
                if (selectedGraphics.length === allIds.length) {
                  setSelectedGraphics([]);
                } else {
                  setSelectedGraphics(allIds);
                }
              }}
              className={`p-8 rounded-3xl border-2 cursor-pointer transition-all mb-12 ${
                selectedGraphics.length === GraphicItems.length 
                ? 'bg-[#6C5CE7] border-[#6C5CE7] text-white shadow-2xl' 
                : 'bg-white border-slate-200 hover:border-[#6C5CE7] text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Full Branding Package</h3>
                    <p className={selectedGraphics.length === GraphicItems.length ? 'text-white/80' : 'text-slate-500'}>
                      Includes everything: Logo, Stationery, Packaging, and Mockups. The complete identity kit.
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${selectedGraphics.length === GraphicItems.length ? 'bg-white border-white' : 'border-slate-300'}`}>
                    {selectedGraphics.length === GraphicItems.length && <Check size={20} className="text-[#6C5CE7]" />}
                  </div>
              </div>
            </div>

            <div className="sticky bottom-8 z-20">
              <div className="bg-slate-900/90 backdrop-blur text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between max-w-2xl mx-auto">
                  <div>
                    <p className="text-sm text-slate-400">Selected Items</p>
                    <p className="font-bold text-xl">{selectedGraphics.length} items</p>
                  </div>
                  <button 
                    onClick={handleGetQuote}
                    className="bg-gradient-brand px-8 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-violet-500/50 transition-all"
                  >
                    Request Quote
                  </button>
              </div>
            </div>
          </div>
        </div>
        <Footer onNavigate={onNavigate} />
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: E-COMMERCE
  // ----------------------------------------------------------------------
  if (serviceId === 'ecom') {
     return (
      <div className="bg-slate-50 min-h-screen flex flex-col">
        <SEO title={seoData.title} description={seoData.description} />
        <div className="pt-20 pb-20 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
                Scale Your <span className="text-[#FF6B6B]">Digital Storefront</span>
              </h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                E-commerce isn't just about listing products; it's about visibility and optimization. Whether you sell gadgets on Amazon or gourmet food on Swiggy, we handle the complexities of inventory management, listing optimization, and marketplace ads so you can focus on your product. We turn browsers into buyers across all major platforms.
              </p>
            </div>

            {/* Marketplaces */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <ShoppingBag className="text-[#6C5CE7]" /> Retail Marketplaces
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {EcomPlatforms.filter(p => p.type === 'marketplace').map(p => (
                    <div key={p.id} className={`bg-white p-6 rounded-2xl border transition-all ${selectedPlatforms.includes(p.id) ? 'border-[#6C5CE7] shadow-lg' : 'border-slate-100 hover:shadow-md'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white rounded-lg border border-slate-100 flex items-center justify-center p-1 overflow-hidden">
                                <img 
                                  src={`https://logo.clearbit.com/${p.domain}`} 
                                  alt={p.name} 
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                     (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                {/* Fallback if image hidden */}
                                <span className="font-bold text-slate-500 text-xs hidden only:block">{p.name[0]}</span>
                              </div>
                              <span className="font-bold text-lg text-slate-800">{p.name}</span>
                          </div>
                          <button 
                            onClick={() => togglePlatform(p.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlatforms.includes(p.id) ? 'bg-[#6C5CE7] border-[#6C5CE7]' : 'border-slate-300'}`}
                          >
                              {selectedPlatforms.includes(p.id) && <Check size={14} className="text-white" />}
                          </button>
                        </div>

                         {/* Description always visible */}
                        <div className="mb-4">
                           {!p.availableInIndia && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-wide mb-2">
                                <AlertCircle size={10} /> Not Available in India
                              </div>
                           )}
                           <p className="text-sm text-slate-600 leading-relaxed">
                                {p.description}
                           </p>
                        </div>
                        
                        {selectedPlatforms.includes(p.id) && (
                          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                              <span className="text-sm text-slate-500">I have an existing account</span>
                              <div 
                                onClick={() => toggleExistingAccount(p.id)}
                                className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${existingAccounts[p.id] ? 'bg-[#FF6B6B]' : 'bg-slate-200'}`}
                              >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${existingAccounts[p.id] ? 'translate-x-4' : 'translate-x-0'}`}></div>
                              </div>
                          </div>
                        )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Food Delivery */}
            <div className="mb-12">
              <div className="flex justify-between items-end mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Utensils className="text-[#FF6B6B]" /> Restaurant Platforms
                  </h3>
                  <span className="text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Are you a restaurant?</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {EcomPlatforms.filter(p => p.type === 'food').map(p => (
                    <div key={p.id} className={`bg-white p-6 rounded-2xl border transition-all ${selectedPlatforms.includes(p.id) ? 'border-[#FF6B6B] shadow-lg' : 'border-slate-100 hover:shadow-md'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white rounded-lg border border-slate-100 flex items-center justify-center p-1 overflow-hidden">
                                <img 
                                  src={`https://logo.clearbit.com/${p.domain}`} 
                                  alt={p.name} 
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                     (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                                <span className="font-bold text-slate-500 text-xs hidden only:block">{p.name[0]}</span>
                              </div>
                              <span className="font-bold text-lg text-slate-800">{p.name}</span>
                          </div>
                          <button 
                            onClick={() => togglePlatform(p.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlatforms.includes(p.id) ? 'bg-[#FF6B6B] border-[#FF6B6B]' : 'border-slate-300'}`}
                          >
                              {selectedPlatforms.includes(p.id) && <Check size={14} className="text-white" />}
                          </button>
                        </div>
                        
                         {/* Description always visible */}
                        <div className="mb-4">
                           {!p.availableInIndia && (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-wide mb-2">
                                <AlertCircle size={10} /> Not Available in India
                              </div>
                           )}
                           <p className="text-sm text-slate-600 leading-relaxed">
                                {p.description}
                           </p>
                        </div>

                        {selectedPlatforms.includes(p.id) && (
                          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                              <span className="text-sm text-slate-500">I have an existing account</span>
                              <div 
                                onClick={() => toggleExistingAccount(p.id)}
                                className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${existingAccounts[p.id] ? 'bg-[#6C5CE7]' : 'bg-slate-200'}`}
                              >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${existingAccounts[p.id] ? 'translate-x-4' : 'translate-x-0'}`}></div>
                              </div>
                          </div>
                        )}
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button 
                  onClick={handleGetQuote}
                  disabled={selectedPlatforms.length === 0}
                  className="bg-gradient-brand text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl shadow-violet-200 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  Request Management Quote
              </button>
            </div>
          </div>
        </div>
        <Footer onNavigate={onNavigate} />
      </div>
     )
  }

  // ----------------------------------------------------------------------
  // VIEW: SEO
  // ----------------------------------------------------------------------
  if (serviceId === 'seo') {
      const seoDetails = [
        { title: 'Keyword Research & Strategy', desc: 'Identifying high-volume, low-competition terms that your customers are actively searching for.' },
        { title: 'On-Page Optimization', desc: 'Optimizing titles, meta tags, headers, and content structure to ensure Google understands your relevance.' },
        { title: 'Technical SEO Audits', desc: 'Fixing crawl errors, broken links, site speed issues, and mobile usability to improve site health.' },
        { title: 'Link Building & PR', desc: 'Acquiring high-quality backlinks from reputable industry sites to boost your domain authority.' },
        { title: 'Local SEO Dominance', desc: 'Optimizing Google My Business and local citations to capture customers in your immediate vicinity.' }
      ];

      return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
          <SEO title={seoData.title} description={seoData.description} />
          <div className="pt-20 pb-20 flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
                        Dominate Search Results
                    </h2>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        Visibility is the new currency. Our data-centric SEO strategies ensure you aren't just found, but chosen. From technical audits to high-authority backlinking, we build the ladder to the #1 spot.
                    </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold text-slate-800">What we deliver</h3>
                        <div className="space-y-4">
                        {seoDetails.map((item, i) => (
                            <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-full bg-violet-50 text-[#6C5CE7] flex items-center justify-center flex-shrink-0 mt-1">
                                    <Check size={20} />
                                </div>
                                <div>
                                   <h4 className="font-bold text-slate-800 text-lg mb-1">{item.title}</h4>
                                   <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                        </div>
                        <button 
                        onClick={handleGetQuote}
                        className="w-full mt-8 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                        >
                        Start Your Project
                        </button>
                    </div>
                    <div className="h-96 bg-gradient-brand rounded-3xl opacity-10 flex items-center justify-center">
                        <Search size={120} className="text-[#6C5CE7]" />
                    </div>
                </div>
            </div>
          </div>
          <Footer onNavigate={onNavigate} />
        </div>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW: WEB DESIGN (Redesigned)
  // ----------------------------------------------------------------------
  if (serviceId === 'web') {
      return (
        <div className="bg-slate-50 min-h-screen flex flex-col">
          <SEO title={seoData.title} description={seoData.description} />
          <div className="pt-20 pb-20 flex-grow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-4xl mx-auto mb-16">
                  <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
                      Your Digital <span className="text-[#6C5CE7]">Headquarters</span>
                  </h2>
                  <p className="text-xl text-slate-600 leading-relaxed">
                      Tell us about your business, and we'll build the perfect platform for it. No technical jargon, just results.
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 max-w-4xl mx-auto">
                  {/* Step 1: Business Nature */}
                  <div className="mb-10">
                      <label className="block text-lg font-bold text-slate-800 mb-3">What is the nature of your business?</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Construction Company, Bakery, Consulting Firm"
                        className="w-full p-4 rounded-xl border border-slate-200 bg-white focus:border-[#6C5CE7] focus:ring-2 focus:ring-violet-100 outline-none text-lg"
                        value={businessNature}
                        onChange={(e) => setBusinessNature(e.target.value)}
                      />
                  </div>

                  {/* Step 2: Website Type */}
                  <div className="mb-12">
                      <label className="block text-lg font-bold text-slate-800 mb-6">What type of website do you need?</label>
                      <div className="grid md:grid-cols-3 gap-6">
                        <div 
                          onClick={() => setWebsiteType('single')}
                          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${websiteType === 'single' ? 'border-[#6C5CE7] bg-violet-50' : 'border-slate-100 hover:border-slate-300'}`}
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#6C5CE7] shadow-sm mb-4">
                              <ImageIcon size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Simple Single Page</h3>
                            <p className="text-sm text-slate-500">Perfect for portfolios or landing pages to showcase basic info.</p>
                        </div>

                        <div 
                          onClick={() => setWebsiteType('multi')}
                          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${websiteType === 'multi' ? 'border-[#6C5CE7] bg-violet-50' : 'border-slate-100 hover:border-slate-300'}`}
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#6C5CE7] shadow-sm mb-4">
                              <Globe size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">Medium Multi-Page</h3>
                            <p className="text-sm text-slate-500">Ideal for businesses needing Home, About, Services, and Contact pages.</p>
                        </div>

                        <div 
                          onClick={() => setWebsiteType('ecom')}
                          className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${websiteType === 'ecom' ? 'border-[#6C5CE7] bg-violet-50' : 'border-slate-100 hover:border-slate-300'}`}
                        >
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#6C5CE7] shadow-sm mb-4">
                              <ShoppingBag size={24} />
                            </div>
                            <h3 className="font-bold text-slate-900 mb-2">E-commerce Store</h3>
                            <p className="text-sm text-slate-500">Sell products online with a cart, checkout, and product catalog.</p>
                        </div>
                      </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-xl mb-8 flex items-start gap-3">
                      <CheckCircle className="text-[#6C5CE7] mt-1 flex-shrink-0" size={20} />
                      <p className="text-sm text-slate-600">
                        Note: Our representative will contact you to collect further details regarding integrations like <strong>Payment Gateways, WhatsApp Chat, SSL Certificates,</strong> and domain hosting preferences.
                      </p>
                  </div>

                  <button 
                      onClick={handleGetQuote}
                      disabled={!businessNature || !websiteType}
                      className="w-full py-4 bg-gradient-brand text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-violet-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      Get a Quote for this Website
                  </button>
                </div>
            </div>
          </div>
          <Footer onNavigate={onNavigate} />
        </div>
      );
  }

  return <div>Service Not Found</div>;
};

export default ServicesPage;