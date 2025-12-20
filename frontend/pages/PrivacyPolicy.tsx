import React from 'react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Shield, Lock, Eye } from 'lucide-react';

interface PrivacyPolicyProps {
  onNavigate: (page: string, subPage?: string) => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <SEO 
        title="Privacy Policy" 
        description="Privacy Policy for Tarviz Digimart. Learn how we collect, use, and protect your data." 
      />
      
      <div className="pt-24 pb-20 flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           
           <div className="text-center mb-16">
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">Privacy Policy</h1>
              <p className="text-slate-500">Last Updated: October 2023</p>
           </div>

           <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 space-y-12">
              
              <section>
                 <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Shield className="text-[#6C5CE7]" /> 1. Introduction
                 </h2>
                 <p className="text-slate-600 leading-relaxed">
                    Welcome to Tarviz Digimart ("we," "our," or "us"). We are committed to protecting your privacy and ensuring your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and protect your data when you visit our website or use our services.
                 </p>
              </section>

              <section>
                 <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Eye className="text-[#FF6B6B]" /> 2. Information We Collect
                 </h2>
                 <p className="text-slate-600 leading-relaxed mb-4">
                    We may collect the following types of information:
                 </p>
                 <ul className="list-disc pl-6 space-y-2 text-slate-600">
                    <li><strong>Personal Information:</strong> Name, email address, phone number, and company details when you fill out forms or request quotes.</li>
                    <li><strong>Usage Data:</strong> Information on how you interact with our website, including IP address, browser type, and pages visited (via cookies).</li>
                    <li><strong>Service Data:</strong> Details related to the projects or campaigns we manage for you.</li>
                 </ul>
              </section>

              <section>
                 <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Lock className="text-blue-500" /> 3. How We Use Your Information
                 </h2>
                 <p className="text-slate-600 leading-relaxed mb-4">
                    We use your data to:
                 </p>
                 <ul className="list-disc pl-6 space-y-2 text-slate-600">
                    <li>Provide and maintain our digital marketing services.</li>
                    <li>Communicate with you regarding updates, quotes, and support.</li>
                    <li>Improve our website functionality and user experience.</li>
                    <li>Send marketing communications (only if you have opted in).</li>
                 </ul>
              </section>

              <section>
                 <h2 className="text-xl font-bold text-slate-900 mb-4">4. Data Sharing</h2>
                 <p className="text-slate-600 leading-relaxed">
                    We do not sell or rent your personal information to third parties. We may share data with trusted third-party service providers (e.g., payment processors, analytics tools) who assist us in operating our business, provided they agree to keep this information confidential.
                 </p>
              </section>

              <section>
                 <h2 className="text-xl font-bold text-slate-900 mb-4">5. Your Rights</h2>
                 <p className="text-slate-600 leading-relaxed">
                    You have the right to request access to the personal data we hold about you, to request corrections, or to request deletion. To exercise these rights, please contact us at <a href="mailto:privacy@tarvizdigimart.com" className="text-[#6C5CE7] hover:underline">privacy@tarvizdigimart.com</a>.
                 </p>
              </section>

              <section>
                 <h2 className="text-xl font-bold text-slate-900 mb-4">6. Contact Us</h2>
                 <p className="text-slate-600 leading-relaxed">
                    If you have any questions about this Privacy Policy, please contact us:<br/>
                    <strong>Email:</strong> privacy@tarvizdigimart.com<br/>
                    <strong>Address:</strong> 123 Digital Avenue, Anna Nagar, Chennai, Tamil Nadu 600040.
                 </p>
              </section>

           </div>
        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default PrivacyPolicy;