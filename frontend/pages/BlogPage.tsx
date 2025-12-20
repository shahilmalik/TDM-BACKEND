import React from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

interface BlogPageProps {
  onNavigate: (page: string, subPage?: string) => void;
}

const mockPosts = [
  {
    id: '1',
    title: '5 Social Media Trends Dominating 2024',
    excerpt: 'From AI-generated content to the rise of authentic storytelling, here is what your brand needs to know to stay ahead.',
    category: 'Social Media',
    date: 'Oct 12, 2023',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: '2',
    title: 'SEO vs SEM: What Does Your Business Need?',
    excerpt: 'Understanding the difference between organic growth and paid advertising is key to allocating your marketing budget effectively.',
    category: 'Marketing Strategy',
    date: 'Sep 28, 2023',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1571677246347-5040039b3e64?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: '3',
    title: 'The Psychology of Color in Branding',
    excerpt: 'Why does Coca-Cola use red? Why is Facebook blue? Dive into the science of color psychology in brand identity.',
    category: 'Branding',
    date: 'Sep 15, 2023',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=600'
  }
];

const BlogPage: React.FC<BlogPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
       <SEO 
         title="Blog" 
         description="Read the latest insights on digital marketing trends, SEO tips, and social media strategies from the experts at Tarviz Digimart." 
         keywords={['Marketing Blog', 'SEO Tips', 'Social Media Trends', 'Digital Strategy Articles']}
       />
       <div className="pt-24 pb-20 flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-[#FF6B6B] font-bold tracking-widest uppercase text-sm">Our Blog</span>
                <h1 className="mt-3 text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">Insights & Updates</h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                   Expert advice, industry trends, and deep dives into the world of digital marketing.
                </p>
             </div>

             <div className="grid md:grid-cols-3 gap-8">
                {mockPosts.map((post) => (
                   <div key={post.id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer">
                      <div className="h-48 overflow-hidden">
                         <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="p-8">
                         <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 font-bold uppercase tracking-wider">
                            <span className="text-[#6C5CE7]">{post.category}</span>
                            <span>•</span>
                            <span>{post.readTime}</span>
                         </div>
                         <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#6C5CE7] transition-colors">{post.title}</h3>
                         <p className="text-slate-500 mb-6 line-clamp-3 leading-relaxed">{post.excerpt}</p>
                         <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                               <Calendar size={14} /> {post.date}
                            </div>
                            <span className="text-[#6C5CE7] font-bold flex items-center gap-1 text-sm group-hover:translate-x-1 transition-transform">
                               Read More <ArrowRight size={16} />
                            </span>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>
       <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default BlogPage;