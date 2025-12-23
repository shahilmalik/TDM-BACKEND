import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { api } from '../services/api';

interface ContactPageProps {
  onLogin: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    orgName: '',
    email: '',
    phone: '',
    whatsapp: false,
    subject: '',
    body: ''
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I get started with Tarviz Digimart?",
      a: "Simply browse our services, select the package that suits your needs, and request a quote. Our team will contact you within 24 hours to onboard you."
    },
    {
      q: "Do you offer custom packages?",
      a: "Yes! While we have standard tiers (Spark, Radiance, Luminary), we understand every business is unique. Contact us for a tailored proposal."
    },
    {
      q: "What is included in the website design service?",
      a: "We provide end-to-end design and development. Based on your selection, this includes UI design, mobile responsiveness, and setup. Domains and hosting are discussed separately."
    },
    {
      q: "Can I upgrade my Social Media plan later?",
      a: "Absolutely. You can scale up from Spark to Radiance or Luminary at any time as your business grows."
    },
    {
      q: "Do you handle ad budgets?",
      a: "Our management fee covers the strategy and execution. The actual ad spend is paid directly by you to the platform (Facebook/Google) to ensure transparency."
    },
    {
      q: "Is photography included in E-commerce management?",
      a: "Photography is a separate service, but we highly recommend bundling it. High-quality visuals significantly boost conversion rates on platforms like Amazon and Swiggy."
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, whatsapp: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.home.contactSubmissions.create({
        name: formData.name,
        organization: formData.orgName,
        email: formData.email,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        subject: formData.subject,
        body: formData.body,
      });
      alert("Thank you! We've received your inquiry. A representative will contact you shortly.");
      setFormData({
        name: '',
        orgName: '',
        email: '',
        phone: '',
        whatsapp: false,
        subject: '',
        body: ''
      });
    } catch (err: any) {
      alert(err?.message || 'Failed to submit. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-0 flex flex-col">
      <SEO 
        title="Contact Us" 
        description="Get in touch with Tarviz Digimart in Chennai. Call us, email us, or visit our Anna Nagar office for your digital marketing needs." 
        keywords={['Contact Digital Agency', 'Chennai Marketing Office', 'Get Quote']}
      />
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Let's Build Something <span className="text-[#6C5CE7]">Great</span></h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">Have a project in mind? We'd love to hear about it. Fill out the form below and we'll get back to you within 24 hours.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Contact Info */}
            <div className="space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h3>
                  <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-violet-50 text-[#6C5CE7] rounded-xl"><MapPin size={24} /></div>
                        <div>
                            <p className="font-bold text-slate-900">Our Office</p>
                            <p className="text-slate-500">123 Digital Avenue, Anna Nagar,<br/>Chennai, Tamil Nadu 600040</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-orange-50 text-[#FF6B6B] rounded-xl"><Mail size={24} /></div>
                        <div>
                            <p className="font-bold text-slate-900">Email Us</p>
                            <a href="mailto:info@tarvizdigimart.com" className="text-slate-500 hover:text-[#6C5CE7]">info@tarvizdigimart.com</a>
                            <br/>
                            <a href="mailto:info@tarviz.com" className="text-slate-500 hover:text-[#6C5CE7]">info@tarviz.com</a>
                        </div>
                      </div>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><Phone size={24} /></div>
                        <div>
                            <p className="font-bold text-slate-900">Call Us</p>
                            <a href="tel:+917470067003" className="text-slate-500 hover:text-[#6C5CE7]">+91 74 7006 7003</a>
                        </div>
                      </div>
                  </div>
                </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
                <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Contact Person Name</label>
                        <input 
                          required
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          type="text" 
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#6C5CE7] focus:ring-[#6C5CE7] outline-none transition-all"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Organization Name</label>
                        <input 
                          name="orgName"
                          value={formData.orgName}
                          onChange={handleChange}
                          type="text" 
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#6C5CE7] focus:ring-[#6C5CE7] outline-none transition-all"
                          placeholder="Company Ltd."
                        />
                      </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                        <input 
                          required
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          type="email" 
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#6C5CE7] focus:ring-[#6C5CE7] outline-none transition-all"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                        <input 
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          type="tel" 
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#6C5CE7] focus:ring-[#6C5CE7] outline-none transition-all"
                          placeholder="+91 90000 00000"
                        />
                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              name="whatsapp"
                              checked={formData.whatsapp}
                              onChange={handleCheckbox}
                              className="w-4 h-4 text-[#6C5CE7] rounded focus:ring-[#6C5CE7]"
                            />
                            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                              <MessageSquare size={12} className="text-green-500" /> I'd like to be contacted via WhatsApp
                            </span>
                        </label>
                      </div>
                  </div>

                  <div className="mb-6">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                      <input 
                        required
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        type="text" 
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#6C5CE7] focus:ring-[#6C5CE7] outline-none transition-all"
                        placeholder="Project Inquiry: Social Media Marketing"
                      />
                  </div>

                  <div className="mb-8">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                      <textarea 
                        required
                        name="body"
                        value={formData.body}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#6C5CE7] focus:ring-[#6C5CE7] outline-none transition-all resize-none"
                        placeholder="Tell us about your project requirements..."
                      ></textarea>
                  </div>

                  <button type="submit" className="w-full py-4 bg-gradient-brand text-white font-bold rounded-xl shadow-lg shadow-violet-200 hover:shadow-violet-400 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                      Send Message <Send size={20} />
                  </button>
                </form>
            </div>
          </div>

          {/* FAQs */}
          <div className="max-w-3xl mx-auto mb-20">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                      <button 
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                      >
                        <span className="font-bold text-slate-800">{faq.q}</span>
                        {openFaq === index ? <ChevronUp size={20} className="text-[#6C5CE7]" /> : <ChevronDown size={20} className="text-slate-400" />}
                      </button>
                      {openFaq === index && (
                        <div className="px-6 pb-6 text-slate-600 leading-relaxed text-sm animate-in slide-in-from-top-2">
                            {faq.a}
                        </div>
                      )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;