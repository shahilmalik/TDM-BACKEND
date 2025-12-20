import React from 'react';
import { Target, Lightbulb, Users, Award } from 'lucide-react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

interface AboutPageProps {}

const AboutPage: React.FC<AboutPageProps> = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO 
        title="About Us" 
        description="Learn about Tarviz Digimart, Chennai's premier digital marketing agency. Our mission is to bridge the gap between creative ambition and technological execution." 
        keywords={['Digital Marketing Agency Chennai', 'About Tarviz Digimart', 'Marketing Team', 'Brand Story']}
      />
      
      {/* Hero */}
      <div className="relative bg-[#0F172A] text-white py-24">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            We Are <span className="text-[#FF6B6B]">Tarviz</span><span className="text-[#6C5CE7]">Digimart</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Chennai's premier digital marketing agency, bridging the gap between creative ambition and technological execution.
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
             <img 
               src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800" 
               alt="Team working" 
               className="rounded-3xl shadow-2xl"
             />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Our Story</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Founded in the vibrant heart of Tamil Nadu, Tarviz Digimart began with a simple yet powerful idea: to bring enterprise-level digital strategies to businesses of all sizes. What started as a small team of passionate creatives has grown into a full-service agency.
            </p>
            <p className="text-slate-600 leading-relaxed">
              We understand the local market nuances of Chennai while leveraging global digital trends. From helping traditional businesses go online to scaling e-commerce startups, our journey is defined by the success stories of our clients.
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-slate-50 py-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow shadow-sm">
                  <div className="w-12 h-12 bg-red-100 text-[#FF6B6B] rounded-xl flex items-center justify-center mb-6">
                     <Target size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Our Mission</h3>
                  <p className="text-slate-600">To empower brands with innovative digital solutions that drive measurable growth and foster authentic connections.</p>
               </div>
               <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow shadow-sm">
                  <div className="w-12 h-12 bg-violet-100 text-[#6C5CE7] rounded-xl flex items-center justify-center mb-6">
                     <Lightbulb size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Our Vision</h3>
                  <p className="text-slate-600">To be the most trusted digital transformation partner in South India, known for creativity, integrity, and results.</p>
               </div>
               <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center mb-6">
                     <Award size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Our Values</h3>
                  <p className="text-slate-600">We believe in transparency, continuous innovation, and putting the client's ROI at the center of everything we do.</p>
               </div>
            </div>
         </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;