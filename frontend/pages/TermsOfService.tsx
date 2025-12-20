import React from 'react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { Scale, FileText, DollarSign, AlertCircle } from 'lucide-react';

interface TermsOfServiceProps {
  onNavigate: (page: string, subPage?: string) => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onNavigate }) => {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <SEO 
        title="Terms of Service" 
        description="Terms of Service for Tarviz Digimart. Please read our conditions regarding services, payments, and usage." 
      />
      
      <div className="pt-24 pb-20 flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
           
           <div className="text-center mb-16">
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">Terms of Service</h1>
              <p className="text-slate-500">Effective Date: October 2023</p>
           </div>

           <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 space-y-12">
              
              <section>
                 <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Scale className="text-[#6C5CE7]" /> 1. Acceptance of Terms
                 </h2>
                 <p className="text-slate-600 leading-relaxed">
                    By accessing or using the services provided by Tarviz Digimart ("Agency," "we," "us"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
                 </p>
              </section>

              <section>
                 <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="text-[#FF6B6B]" /> 2. Services
                 </h2>
                 <p className="text-slate-600 leading-relaxed mb-4">
                    Tarviz Digimart provides digital marketing services including but not limited to Social Media Marketing, SEO, Web Development, and Graphic Design. 
                 </p>
                 <p className="text-slate-600 leading-relaxed">
                    We strive to provide the most accurate and effective strategies, but specific results (e.g., rankings, sales figures) cannot be guaranteed due to the dynamic nature of third-party platforms like Google, Facebook, and Instagram.
                 </p>
              </section>

              <section>
                 <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <DollarSign className="text-green-500" /> 3. Payment & Invoicing
                 </h2>
                 <ul className="list-disc pl-6 space-y-2 text-slate-600">
                    <li><strong>Quotations:</strong> All quotes are valid for 15 days from the date of issue.</li>
                    <li><strong>Advance Payment:</strong> A 50% advance payment is typically required to commence work on projects such as Web Design or Branding.</li>
                    <li><strong>Recurring Services:</strong> Retainer fees for Social Media or SEO are due at the beginning of the service month.</li>
                    <li><strong>Late Fees:</strong> We reserve the right to charge a late fee of 2% per month on overdue invoices.</li>
                 </ul>
              </section>

              <section>
                 <h2 className="text-xl font-bold text-slate-900 mb-4">4. Intellectual Property</h2>
                 <p className="text-slate-600 leading-relaxed">
                    Upon full payment, the client owns the rights to the final deliverables (e.g., logo files, website code). However, Tarviz Digimart retains the right to use the work in our portfolio and marketing materials unless a Non-Disclosure Agreement (NDA) is signed.
                 </p>
              </section>

              <section>
                 <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="text-red-500" /> 5. Limitation of Liability
                 </h2>
                 <p className="text-slate-600 leading-relaxed">
                    In no event shall Tarviz Digimart be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our services. Our total liability shall not exceed the amount paid by you for the specific service in dispute.
                 </p>
              </section>

              <section>
                 <h2 className="text-xl font-bold text-slate-900 mb-4">6. Termination</h2>
                 <p className="text-slate-600 leading-relaxed">
                    Either party may terminate a service agreement with 30 days' written notice. You are responsible for payment for all services rendered up to the date of termination.
                 </p>
              </section>

              <section>
                 <h2 className="text-xl font-bold text-slate-900 mb-4">7. Contact Information</h2>
                 <p className="text-slate-600 leading-relaxed">
                    Questions about the Terms of Service should be sent to us at legal@tarvizdigimart.com.
                 </p>
              </section>

           </div>
        </div>
      </div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default TermsOfService;