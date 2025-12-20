
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  CreditCard, Layers, ArrowUpRight,
  Kanban, Calendar, CheckCircle2, Image as ImageIcon,
  Instagram, Linkedin, Facebook, Twitter, RotateCcw, Check, UserCircle, Save, Building, User, MoreHorizontal, Loader2, Download, MessageCircle, X, Plus, Edit2, LogOut, Heart, Eye,
  AlertCircle, RefreshCw, BarChart2, MousePointer2, TrendingUp, Info, Clock, Mail, Phone, MapPin, Smartphone
} from 'lucide-react';
import { UserSubscription, Invoice, PipelinePost, PipelineStatus, UserProfile } from '../types';
import { api, mapBackendColumnToStatus, mapStatusToBackendColumn } from '../services/api';

// --- MOCK DATA ---

const MOCK_META_INSIGHTS = {
    "success": true,
    "client_id": "1",
    "month": "2025-12",
    "pages": [
        {
            "account_id": "17841478686508287",
            "insights": [
                {
                    "title": "Accounts reached",
                    "description": "The number of unique accounts that have seen your content, at least once, including in ads.",
                    "value": 123
                },
                {
                    "title": "Profile visits",
                    "description": "The number of times that your profile was visited.",
                    "value": 42
                },
                {
                    "title": "Website link taps",
                    "description": "The number of times that the link to your website was tapped.",
                    "value": 0
                },
                {
                    "title": "Accounts engaged",
                    "description": "The number of accounts that have interacted with your content, including in ads.",
                    "value": 8
                },
                {
                    "title": "Content interactions",
                    "description": "The total number of post interactions, story interactions, reels interactions, video interactions and live video interactions.",
                    "value": 28
                }
            ]
        }
    ]
};

const MOCK_META_MEDIA = {
    "success": true,
    "client_id": "1",
    "media": {
        "most_liked": [
            {
                "id": "17995882421853926",
                "media_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
                "media_type": "IMAGE",
                "thumbnail_url": null,
                "timestamp": "2025-12-14T06:08:10+0000",
                "permalink": "https://www.instagram.com/p/DSO7ZTxleX2/",
                "like_count": 4,
                "reach": 118
            },
            {
                "id": "18081832556329136",
                "media_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600",
                "media_type": "IMAGE",
                "thumbnail_url": null,
                "timestamp": "2025-12-15T15:11:07+0000",
                "permalink": "https://www.instagram.com/p/DSSeU4glWCL/",
                "like_count": 3,
                "reach": 5
            }
        ],
        "recent": [
            {
                "id": "17862295092550907",
                "media_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600",
                "media_type": "IMAGE",
                "thumbnail_url": null,
                "timestamp": "2025-12-18T08:50:09+0000",
                "permalink": "https://www.instagram.com/p/DSZhHKDitKp/",
                "like_count": 0,
                "reach": 4
            },
            {
                "id": "18090221713943245",
                "media_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600",
                "media_type": "IMAGE",
                "thumbnail_url": null,
                "timestamp": "2025-12-16T11:45:07+0000",
                "permalink": "https://www.instagram.com/p/DSUri4nCIGr/",
                "like_count": 1,
                "reach": 5
            }
        ]
    }
};

const INSTAGRAM_MOCK_DATA = {
  "profile": {
    "followers_count": 7,
    "follows_count": 4,
    "media_count": 11,
    "biography": "hi there",
    "username": "hotel_raaj_bhaavan",
    "profile_picture_url": "https://scontent.fmaa3-2.fna.fbcdn.net/v/t51.82787-15/588116711_17844328284622884_5431812011edm=AL-3X8kEAAAA&_nc_gid=M9YaKVyRRlhbqJfGoLae2w&oh=00_Afk1JrMS3rsLtP6YUUyEbq91S6ZYkDhzSNo2ncIU5TPXBQ&oe=694A1365",
    "id": "17841478686508287"
  },
  "media": [
    {
      "id": "17862295092550907",
      "media_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600",
      "media_type": "IMAGE",
      "thumbnail_url": null,
      "timestamp": "2025-12-18T08:50:09+0000",
      "permalink": "https://www.instagram.com/p/DSZhHKDitKp/",
      "like_count": 0,
      "reach": 4,
      "caption": "A fresh start to a delicious morning! ☕🥐 #Breakfast # raajbhaavan"
    },
    {
      "id": "18090221713943245",
      "media_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=600",
      "media_type": "IMAGE",
      "thumbnail_url": null,
      "timestamp": "2025-12-16T11:45:07+0000",
      "permalink": "https://www.instagram.com/p/DSUri4nCIGr/",
      "like_count": 1,
      "reach": 5,
      "caption": "Experience the authentic taste of Chennai. 🍲✨ #ChennaiFood #Authentic"
    },
    {
      "id": "18090221713943246",
      "media_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=600",
      "media_type": "IMAGE",
      "thumbnail_url": null,
      "timestamp": "2025-12-14T11:45:07+0000",
      "permalink": "https://www.instagram.com/",
      "like_count": 12,
      "reach": 45,
      "caption": "Pizza night at Raaj Bhaavan? Yes please! 🍕🔥"
    }
  ]
};

// Mock detailed post data based on the requested structure
const MOCK_POST_DETAIL = (baseItem: any) => ({
  "success": true,
  "post": {
    "id": baseItem.id,
    "caption": baseItem.caption || "Check this out!",
    "media_url": baseItem.media_url,
    "media_type": baseItem.media_type,
    "like_count": baseItem.like_count,
    "comments_count": 12,
    "insights": [
      {"title": "impressions", "values": [{"value": baseItem.reach * 1.5}]},
      {"title": "reach", "values": [{"value": baseItem.reach}]}
    ],
    "comments": [
      {"id": "123", "text": "Great post!", "timestamp": "2025-12-18T10:00:00Z", "from": {"username": "foodie_chennai"}},
      {"id": "124", "text": "Yum! Need to visit soon.", "timestamp": "2025-12-18T11:30:00Z", "from": {"username": "travel_tamilnadu"}}
    ]
  }
});

const MOCK_PROFILE_CLIENT: UserProfile = {
  id: 1,
  business: {
    name: "raaj bhavan",
    address: "xxxxx, yyyyy,\r\nchennai - 878787",
    gstin: "sdf98ff89sdf",
    hsn: "",
    email: "rah@gmail.com",
    phone: "98765454354",
    whatsappConsent: false
  },
  contactPerson: {
    salutation: "Mr",
    firstName: "shahil",
    lastName: "malik",
    email: "aak@aa.com",
    phone: "9328473244",
    whatsappConsent: false
  }
};

const PIPELINE_COLUMNS: { id: PipelineStatus; label: string; color: string }[] = [
  { id: 'backlog', label: 'Backlog', color: 'border-slate-300' },
  { id: 'writing', label: 'Content Writing', color: 'border-blue-400' },
  { id: 'design', label: 'Design / Creative', color: 'border-purple-400' },
  { id: 'review', label: 'Internal Review', color: 'border-yellow-400' },
  { id: 'approval', label: 'Client Approval', color: 'border-orange-500' },
  { id: 'scheduled', label: 'Scheduled', color: 'border-emerald-500' },
  { id: 'posted', label: 'Posted', color: 'border-slate-800' },
];

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'pipeline' | 'profile' | 'instagram'>('overview');
  
  // Data State
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pipelinePosts, setPipelinePosts] = useState<PipelinePost[]>([]);
  
  // UI State
  const [draggedPostId, setDraggedPostId] = useState<string | number | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PipelinePost | null>(null);
  const [selectedInstaPost, setSelectedInstaPost] = useState<any>(null);

  // Filters for Insights
  const [insightMonth, setInsightMonth] = useState("12");
  const [insightYear, setInsightYear] = useState("2025");

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        const demoMode = localStorage.getItem('demoMode');
        const storedClientId = localStorage.getItem('client_id');

        try {
            if (demoMode) {
               await new Promise(resolve => setTimeout(resolve, 800)); 
               setUserProfile(MOCK_PROFILE_CLIENT);
            } else {
                if (storedClientId) {
                    const backendProfile = await api.clients.get(storedClientId);
                    setUserProfile({
                        id: backendProfile.id,
                        business: {
                            name: backendProfile.company_name,
                            address: backendProfile.billing_address,
                            gstin: backendProfile.gstin,
                            hsn: '', 
                            email: backendProfile.business_email,
                            phone: backendProfile.business_phone,
                            whatsappConsent: backendProfile.whatsapp_updates
                        },
                        contactPerson: {
                            salutation: backendProfile.contact_person?.salutation || 'Mr',
                            firstName: backendProfile.contact_person?.first_name || '', 
                            lastName: backendProfile.contact_person?.last_name || '',
                            email: backendProfile.contact_person?.email || '',
                            phone: backendProfile.contact_person?.phone || '',
                            whatsappConsent: backendProfile.whatsapp_updates
                        }
                    });
                }

                const response: any = await api.invoice.list();
                const fetchedInvoices = response.invoices || [];
                setInvoices(fetchedInvoices.map((inv: any) => ({
                    id: inv.id,
                    invoice_id: inv.invoice_id,
                    date: inv.date,
                    amount: inv.total_amount ? parseFloat(inv.total_amount) : 0,
                    status: inv.status ? (inv.status.charAt(0).toUpperCase() + inv.status.slice(1)) : 'Pending',
                    service: inv.items && inv.items.length > 0 ? inv.items[0].service_name : 'General Service'
                })));

                const kanbanItems = await api.kanban.list();
                setPipelinePosts(kanbanItems.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    platform: item.platforms?.[0] || 'instagram',
                    status: mapBackendColumnToStatus(item.column),
                    dueDate: item.due_date,
                    description: item.description,
                    thumbnail: item.thumbnail
                })));
            }
        } catch (error) {
            console.error("Dashboard Load Error", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, []);

  const handleDragStart = (e: React.DragEvent, postId: string | number) => {
    const post = pipelinePosts.find(p => p.id === postId);
    if (post && post.status === 'approval') {
        setDraggedPostId(postId);
        e.dataTransfer.effectAllowed = 'move';
    } else {
        e.preventDefault();
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleDrop = async (e: React.DragEvent, status: PipelineStatus) => {
    e.preventDefault();
    if (!draggedPostId) return;
    if (status !== 'review') return;

    setPipelinePosts(prev => prev.map(post => post.id === draggedPostId ? { ...post, status } : post));

    if (!localStorage.getItem('demoMode')) {
        try { await api.kanban.move(draggedPostId as number, mapStatusToBackendColumn(status)); }
        catch (e) { console.error(e); }
    }
    setDraggedPostId(null);
  };

  const handleApprovePost = async (e: React.MouseEvent, postId: string | number) => {
    e.stopPropagation();
    setPipelinePosts(prev => prev.map(post => post.id === postId ? { ...post, status: 'scheduled' } : post));
    if (selectedPost?.id === postId) setSelectedPost(prev => prev ? {...prev, status: 'scheduled'} : null);
    if (!localStorage.getItem('demoMode')) {
        try { await api.kanban.approve(postId as number, 'approve'); } catch (e) { console.error(e); }
    }
  };

  const handleRequestChanges = async (e: React.MouseEvent, postId: string | number) => {
    e.stopPropagation();
    const reason = prompt("Feedback for the team:");
    if (reason) {
        setPipelinePosts(prev => prev.map(post => post.id === postId ? { ...post, status: 'review' } : post));
        if (selectedPost?.id === postId) setSelectedPost(prev => prev ? {...prev, status: 'review'} : null);
        if (!localStorage.getItem('demoMode')) {
            try { await api.kanban.approve(postId as number, 'revise'); } catch (e) { console.error(e); }
        }
    }
  };

  const handleProfileChange = (section: 'business' | 'contactPerson', field: string, value: any) => {
    if (!userProfile) return;
    setUserProfile(prev => {
        if (!prev) return null;
        return { ...prev, [section]: { ...prev[section], [field]: value } };
    });
  };

  const saveProfile = async () => {
    if (!userProfile?.id) return;
    if (localStorage.getItem('demoMode')) { setIsEditingProfile(false); return; }
    try {
        const payload = {
            company_name: userProfile.business.name,
            billing_address: userProfile.business.address,
            gstin: userProfile.business.gstin,
            business_email: userProfile.business.email,
            business_phone: userProfile.business.phone,
            whatsapp_updates: userProfile.business.whatsappConsent,
            contact_person: {
                salutation: userProfile.contactPerson.salutation,
                first_name: userProfile.contactPerson.firstName,
                last_name: userProfile.contactPerson.lastName,
                email: userProfile.contactPerson.email,
                phone: userProfile.contactPerson.phone
            }
        };
        await api.clients.replace(userProfile.id, payload);
        setIsEditingProfile(false);
        alert("Profile Updated Successfully!");
    } catch (error: any) {
        alert(`Error: ${error.message}`);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram size={14} className="text-pink-600" />;
      case 'linkedin': return <Linkedin size={14} className="text-blue-700" />;
      default: return <UserCircle size={14} />;
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen bg-slate-50"><Loader2 className="animate-spin text-[#6C5CE7]" size={48} /></div>;
  if (!userProfile) return <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500">No profile found.</div>;

  // Pipeline Stats
  const inPipelineCount = pipelinePosts.filter(p => !['scheduled', 'posted'].includes(p.status)).length;
  const scheduledCount = pipelinePosts.filter(p => p.status === 'scheduled').length;
  const postedCount = pipelinePosts.filter(p => p.status === 'posted').length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
      <aside className="w-full md:w-64 bg-white shadow-lg z-10 border-r flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-slate-800">Client Hub</h2>
          <p className="text-xs font-semibold text-[#FF6B6B] tracking-wider uppercase mt-1">Tarviz Digimart</p>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          {[
            { id: 'overview', icon: Layers, label: 'Overview' },
            { id: 'pipeline', icon: Kanban, label: 'Content Pipeline' },
            { id: 'billing', icon: CreditCard, label: 'Billing & Invoices' },
            { id: 'instagram', icon: Instagram, label: 'Instagram Insights' },
          ].map((item) => (
             <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-gradient-brand text-white shadow-lg shadow-orange-200' : 'text-slate-500 hover:bg-slate-50'}`}>
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
          ))}
        </nav>
        <div className="p-4 border-t space-y-2">
           <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}>
              <UserCircle size={20} />
              <span className="font-medium">My Profile</span>
           </button>
           <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-slate-500 hover:bg-red-50 hover:text-red-500"><LogOut size={20} /><span className="font-medium">Logout</span></button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto h-screen relative bg-slate-50">
        {activeTab === 'overview' && (
          <div className="space-y-12 animate-in fade-in duration-500 pb-12">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Welcome, {userProfile.contactPerson.firstName}</h1>
                <p className="text-slate-500">Here is what's happening with your brand today.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
               <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Layers size={64} className="text-[#6C5CE7]" /></div>
                  <div className="flex justify-between items-start mb-4">
                     <div><p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Active Plan</p><h3 className="text-2xl font-bold text-slate-900">Standard SMM</h3></div>
                     <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">Active</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 text-sm">
                     <span className="text-slate-500">Renewal Date: <span className="font-bold text-slate-900">15 Jan 2024</span></span>
                  </div>
               </div>
            </div>

            {/* Creatives Status */}
            <div>
               <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <ImageIcon size={20} className="text-[#FF6B6B]" /> Creatives
               </h2>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                     <p className="text-xs font-bold text-slate-400 uppercase mb-2">In Pipeline</p>
                     <p className="text-3xl font-black text-slate-900">{inPipelineCount}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                     <p className="text-xs font-bold text-slate-400 uppercase mb-2">Scheduled</p>
                     <p className="text-3xl font-black text-[#6C5CE7]">{scheduledCount}</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                     <p className="text-xs font-bold text-slate-400 uppercase mb-2">Posted</p>
                     <p className="text-3xl font-black text-emerald-500">{postedCount}</p>
                  </div>
               </div>
            </div>

            {/* Meta Insights Section */}
            <div>
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                     <BarChart2 size={20} className="text-[#6C5CE7]" /> Meta Insights
                  </h2>
                  <div className="flex gap-2">
                     <select 
                        value={insightMonth}
                        onChange={(e) => setInsightMonth(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 outline-none focus:border-[#6C5CE7]"
                     >
                        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                           <option key={m} value={String(i + 1).padStart(2, '0')}>{m}</option>
                        ))}
                     </select>
                     <select 
                        value={insightYear}
                        onChange={(e) => setInsightYear(e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 outline-none focus:border-[#6C5CE7]"
                     >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
                  {MOCK_META_INSIGHTS.pages[0].insights.map((insight) => (
                     <div key={insight.title} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="flex justify-between items-start mb-3">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{insight.title}</p>
                           <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-help text-slate-300 hover:text-slate-400" title={insight.description}>
                              <Info size={14} />
                           </div>
                        </div>
                        <p className="text-2xl font-black text-slate-900">{insight.value.toLocaleString()}</p>
                     </div>
                  ))}
               </div>

               {/* Media Highlights */}
               <div className="grid md:grid-cols-2 gap-12">
                  {/* Most Liked */}
                  <div>
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Heart size={16} className="text-[#FF6B6B]" /> Most Liked Posts
                     </h3>
                     <div className="grid grid-cols-2 gap-4">
                        {MOCK_META_MEDIA.media.most_liked.map((post) => (
                           <div key={post.id} className="group relative aspect-square bg-slate-200 rounded-2xl overflow-hidden shadow-sm">
                              <img src={post.media_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Post" />
                              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <div className="flex items-center gap-2 text-white font-bold">
                                    <Heart size={18} fill="white" /> {post.like_count}
                                 </div>
                                 <div className="flex items-center gap-2 text-white/80 text-xs mt-1">
                                    <Eye size={14} /> {post.reach} Reach
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Recent */}
                  <div>
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Clock size={16} className="text-[#6C5CE7]" /> Recent Content
                     </h3>
                     <div className="grid grid-cols-2 gap-4">
                        {MOCK_META_MEDIA.media.recent.map((post) => (
                           <div key={post.id} className="group relative aspect-square bg-slate-200 rounded-2xl overflow-hidden shadow-sm">
                              <img src={post.media_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Post" />
                              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <div className="flex items-center gap-2 text-white font-bold">
                                    <Heart size={18} fill="white" /> {post.like_count}
                                 </div>
                                 <div className="flex items-center gap-2 text-white/80 text-xs mt-1">
                                    <Eye size={14} /> {post.reach} Reach
                                 </div>
                                 <div className="text-[10px] text-white/60 mt-2 font-mono">
                                    {new Date(post.timestamp).toLocaleDateString()}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'pipeline' && (
           <div className="h-full flex flex-col animate-in fade-in duration-500">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Content Pipeline</h1>
             </div>
             <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex h-full gap-4 min-w-[1600px]">
                   {PIPELINE_COLUMNS.map(column => {
                      const posts = pipelinePosts.filter(p => p.status === column.id);
                      const isClientApproval = column.id === 'approval';
                      return (
                         <div key={column.id} className={`flex flex-col w-72 h-full rounded-2xl ${isClientApproval ? 'bg-orange-50/50' : 'bg-white'} border-t-4 ${column.color} shadow-sm border-x border-b border-slate-200`} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, column.id)}>
                            <div className="p-3 border-b flex justify-between items-center"><h3 className={`font-bold text-sm ${isClientApproval ? 'text-orange-700' : 'text-slate-700'}`}>{column.label}</h3><span className="bg-slate-100 px-2 py-0.5 rounded-full text-xs font-bold text-slate-400 border">{posts.length}</span></div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                               {posts.length === 0 && <div className="h-24 border-2 border-dashed rounded-xl flex items-center justify-center text-slate-400 text-xs italic">No items</div>}
                               {posts.map(post => (
                                  <div key={post.id} draggable={post.status === 'approval'} onDragStart={(e) => handleDragStart(e, post.id)} onClick={() => setSelectedPost(post)} className={`bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition-shadow group relative ${post.status === 'approval' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}>
                                     <div className="flex justify-between items-start mb-2"><div className="p-1.5 bg-slate-50 rounded-lg">{getPlatformIcon(post.platform)}</div>{post.status === 'scheduled' && <CheckCircle2 size={16} className="text-emerald-500" />}</div>
                                     <h4 className="font-bold text-slate-800 text-sm mb-3 leading-snug">{post.title}</h4>
                                     {post.thumbnail && <div className="w-full h-24 mb-3 rounded-lg overflow-hidden bg-slate-100"><img src={post.thumbnail} className="w-full h-full object-cover" /></div>}
                                     <div className="flex items-center gap-2 text-xs text-slate-500"><Calendar size={12} /><span>{post.dueDate}</span></div>
                                     {isClientApproval && (
                                        <div className="flex gap-2 mt-3 pt-3 border-t">
                                           <button onClick={(e) => handleRequestChanges(e, post.id)} className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg flex items-center justify-center gap-1"><RotateCcw size={12} /> Revise</button>
                                           <button onClick={(e) => handleApprovePost(e, post.id)} className="flex-1 py-1.5 text-xs font-bold text-white bg-orange-500 rounded-lg flex items-center justify-center gap-1"><Check size={12} /> Approve</button>
                                        </div>
                                     )}
                                  </div>
                               ))}
                            </div>
                         </div>
                      );
                   })}
                </div>
             </div>
           </div>
        )}

        {activeTab === 'billing' && (
           <div className="space-y-6 animate-in fade-in duration-500">
              <h1 className="text-2xl font-bold text-slate-800">Billing History</h1>
              <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                       <tr><th className="px-6 py-4 font-bold text-slate-600">Invoice ID</th><th className="px-6 py-4 font-bold text-slate-600">Date</th><th className="px-6 py-4 font-bold text-slate-600">Service</th><th className="px-6 py-4 font-bold text-slate-600">Amount</th><th className="px-6 py-4 font-bold text-slate-600">Status</th><th className="px-6 py-4 font-bold text-slate-600">Action</th></tr>
                    </thead>
                    <tbody className="divide-y">
                       {invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                             <td className="px-6 py-4 font-mono text-sm text-slate-500">{inv.invoice_id}</td>
                             <td className="px-6 py-4 text-slate-800">{inv.date}</td>
                             <td className="px-6 py-4 text-slate-800 font-medium">{inv.service}</td>
                             <td className="px-6 py-4 text-slate-800 font-bold">₹{inv.amount.toLocaleString()}</td>
                             <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${inv.status.toLowerCase() === 'paid' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>{inv.status}</span></td>
                             <td className="px-6 py-4 font-bold text-sm text-[#6C5CE7] hover:underline cursor-pointer"><Download size={16} className="inline mr-1" /> PDF</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 {invoices.length === 0 && <div className="p-8 text-center text-slate-400">No invoices found.</div>}
              </div>
           </div>
        )}

        {activeTab === 'instagram' && (
          <div className="animate-in fade-in duration-500">
             <div className="max-w-4xl mx-auto">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mb-12 pb-12 border-b border-slate-200">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 p-1 overflow-hidden bg-white shadow-sm flex-shrink-0">
                    <img 
                      src={INSTAGRAM_MOCK_DATA.profile.profile_picture_url} 
                      alt={INSTAGRAM_MOCK_DATA.profile.username}
                      className="w-full h-full object-cover rounded-full" 
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                      <h2 className="text-2xl font-normal text-slate-900 tracking-tight">{INSTAGRAM_MOCK_DATA.profile.username}</h2>
                      <div className="flex gap-2">
                        <a 
                          href={`https://instagram.com/${INSTAGRAM_MOCK_DATA.profile.username}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="px-6 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors"
                        >
                          View on Instagram
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex justify-center md:justify-start gap-8 md:gap-12 mb-6">
                      <div className="text-center md:text-left">
                        <span className="font-bold text-slate-900">{INSTAGRAM_MOCK_DATA.profile.media_count}</span>
                        <span className="ml-1 text-slate-500">posts</span>
                      </div>
                      <div className="text-center md:text-left">
                        <span className="font-bold text-slate-900">{INSTAGRAM_MOCK_DATA.profile.followers_count}</span>
                        <span className="ml-1 text-slate-500">followers</span>
                      </div>
                      <div className="text-center md:text-left">
                        <span className="font-bold text-slate-900">{INSTAGRAM_MOCK_DATA.profile.follows_count}</span>
                        <span className="ml-1 text-slate-500">following</span>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="font-bold text-slate-900 mb-1">Hotel Raaj Bhaavan</p>
                      <p className="text-slate-700 whitespace-pre-wrap font-medium">{INSTAGRAM_MOCK_DATA.profile.biography}</p>
                    </div>
                  </div>
                </div>

                {/* Media Grid */}
                <div className="grid grid-cols-3 gap-1 md:gap-8">
                  {INSTAGRAM_MOCK_DATA.media.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => setSelectedInstaPost(MOCK_POST_DETAIL(item).post)}
                      className="relative aspect-square group overflow-hidden bg-slate-200 rounded-sm md:rounded-xl shadow-sm cursor-pointer"
                    >
                      <img 
                        src={item.media_type === 'VIDEO' && item.thumbnail_url ? item.thumbnail_url : item.media_url} 
                        alt="Instagram content"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      {/* Interaction Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="flex flex-col items-center text-white font-bold">
                            <Heart size={24} fill="white" />
                            <span className="text-sm mt-1">{item.like_count || 0}</span>
                         </div>
                         <div className="flex flex-col items-center text-white font-bold">
                            <Eye size={24} />
                            <span className="text-sm mt-1">{item.reach || 0}</span>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        )}

        {activeTab === 'profile' && (
           <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl pb-12">
              <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-3xl font-extrabold text-slate-800">My Profile</h1>
                    <p className="text-slate-500">Manage your business and contact information.</p>
                 </div>
                 {!isEditingProfile ? (
                    <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 bg-white border border-slate-200 text-[#6C5CE7] font-bold hover:bg-violet-50 px-5 py-2.5 rounded-xl transition-all shadow-sm">
                       <Edit2 size={18} /> Edit Profile
                    </button>
                 ) : (
                    <div className="flex gap-3">
                       <button onClick={() => setIsEditingProfile(false)} className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                       <button onClick={saveProfile} className="flex items-center gap-2 bg-[#6C5CE7] text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-violet-200 transition-all hover:bg-[#5a4ad1]">
                          <Save size={18} /> Save Changes
                       </button>
                    </div>
                 )}
              </div>

              <div className="grid gap-8">
                 {/* Business Details Card */}
                 <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
                       <Building size={20} className="text-[#FF6B6B]" />
                       <h3 className="font-bold text-slate-800">Business Information</h3>
                    </div>
                    <div className="p-8 space-y-6">
                       <div className="grid md:grid-cols-2 gap-8">
                          <div>
                             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Company Name</label>
                             {isEditingProfile ? (
                                <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800" value={userProfile.business.name} onChange={(e) => handleProfileChange('business', 'name', e.target.value)} />
                             ) : (
                                <div className="flex items-center gap-3 px-1">
                                   <div className="w-10 h-10 rounded-lg bg-red-50 text-[#FF6B6B] flex items-center justify-center flex-shrink-0"><Building size={20} /></div>
                                   <p className="text-slate-800 font-bold text-lg">{userProfile.business.name}</p>
                                </div>
                             )}
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">GSTIN</label>
                             {isEditingProfile ? (
                                <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800" value={userProfile.business.gstin} onChange={(e) => handleProfileChange('business', 'gstin', e.target.value)} />
                             ) : (
                                <div className="flex items-center gap-3 px-1">
                                   <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center flex-shrink-0 font-bold text-xs uppercase">GST</div>
                                   <p className="text-slate-800 font-mono font-medium">{userProfile.business.gstin || '-'}</p>
                                </div>
                             )}
                          </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-8 pt-4">
                          <div>
                             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Business Email</label>
                             {isEditingProfile ? (
                                <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800" value={userProfile.business.email} onChange={(e) => handleProfileChange('business', 'email', e.target.value)} />
                             ) : (
                                <div className="flex items-center gap-3 px-1">
                                   <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0"><Mail size={20} /></div>
                                   <p className="text-slate-800 font-medium">{userProfile.business.email || '-'}</p>
                                </div>
                             )}
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Business Phone</label>
                             {isEditingProfile ? (
                                <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800" value={userProfile.business.phone} onChange={(e) => handleProfileChange('business', 'phone', e.target.value)} />
                             ) : (
                                <div className="flex items-center gap-3 px-1">
                                   <div className="w-10 h-10 rounded-lg bg-green-50 text-green-500 flex items-center justify-center flex-shrink-0"><Phone size={20} /></div>
                                   <p className="text-slate-800 font-medium">{userProfile.business.phone || '-'}</p>
                                </div>
                             )}
                          </div>
                       </div>

                       <div className="pt-4">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Billing Address</label>
                          {isEditingProfile ? (
                             <textarea rows={3} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800 resize-none" value={userProfile.business.address} onChange={(e) => handleProfileChange('business', 'address', e.target.value)} />
                          ) : (
                             <div className="flex items-start gap-3 px-1">
                                <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0"><MapPin size={20} /></div>
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{userProfile.business.address || '-'}</p>
                             </div>
                          )}
                       </div>

                       <div className="pt-6 border-t border-slate-50">
                           <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                              <div className="flex items-center gap-3">
                                 <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Smartphone size={20} /></div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-800">WhatsApp Updates</p>
                                    <p className="text-[10px] text-slate-500 font-medium">Receive billing and project alerts on WhatsApp</p>
                                 </div>
                              </div>
                              {isEditingProfile ? (
                                 <div 
                                    onClick={() => handleProfileChange('business', 'whatsappConsent', !userProfile.business.whatsappConsent)}
                                    className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 flex items-center ${userProfile.business.whatsappConsent ? 'bg-[#6C5CE7]' : 'bg-slate-300'}`}
                                 >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${userProfile.business.whatsappConsent ? 'translate-x-5' : 'translate-x-0'}`} />
                                 </div>
                              ) : (
                                 <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${userProfile.business.whatsappConsent ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                                    {userProfile.business.whatsappConsent ? 'Enabled' : 'Disabled'}
                                 </span>
                              )}
                           </div>
                       </div>
                    </div>
                 </div>

                 {/* Contact Person Card */}
                 <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
                       <User size={20} className="text-[#6C5CE7]" />
                       <h3 className="font-bold text-slate-800">Primary Contact Person</h3>
                    </div>
                    <div className="p-8 space-y-8">
                       <div className="grid md:grid-cols-3 gap-8">
                          <div>
                             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Salutation</label>
                             {isEditingProfile ? (
                                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800 appearance-none" value={userProfile.contactPerson.salutation} onChange={(e) => handleProfileChange('contactPerson', 'salutation', e.target.value)}>
                                   <option>Mr</option><option>Ms</option><option>Mrs</option><option>Dr</option>
                                </select>
                             ) : (
                                <p className="px-4 py-2 bg-slate-50 rounded-lg text-slate-800 font-bold text-center w-fit min-w-[60px]">{userProfile.contactPerson.salutation}</p>
                             )}
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">First Name</label>
                             {isEditingProfile ? (
                                <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800" value={userProfile.contactPerson.firstName} onChange={(e) => handleProfileChange('contactPerson', 'firstName', e.target.value)} />
                             ) : (
                                <p className="text-slate-800 font-bold text-lg">{userProfile.contactPerson.firstName}</p>
                             )}
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Last Name</label>
                             {isEditingProfile ? (
                                <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800" value={userProfile.contactPerson.lastName} onChange={(e) => handleProfileChange('contactPerson', 'lastName', e.target.value)} />
                             ) : (
                                <p className="text-slate-800 font-bold text-lg">{userProfile.contactPerson.lastName}</p>
                             )}
                          </div>
                       </div>

                       <div className="grid md:grid-cols-2 gap-8 pt-4">
                          <div>
                             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Personal Email</label>
                             {isEditingProfile ? (
                                <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800" value={userProfile.contactPerson.email} onChange={(e) => handleProfileChange('contactPerson', 'email', e.target.value)} />
                             ) : (
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-lg bg-violet-50 text-[#6C5CE7] flex items-center justify-center flex-shrink-0"><Mail size={18} /></div>
                                   <p className="text-slate-800 font-medium">{userProfile.contactPerson.email}</p>
                                </div>
                             )}
                          </div>
                          <div>
                             <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Mobile Number</label>
                             {isEditingProfile ? (
                                <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800" value={userProfile.contactPerson.phone} onChange={(e) => handleProfileChange('contactPerson', 'phone', e.target.value)} />
                             ) : (
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-lg bg-violet-50 text-[#6C5CE7] flex items-center justify-center flex-shrink-0"><Phone size={18} /></div>
                                   <p className="text-slate-800 font-medium">{userProfile.contactPerson.phone}</p>
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </main>

      {/* Kanban Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedPost(null)}></div>
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col md:flex-row overflow-hidden">
                <div className="w-full md:w-1/2 bg-slate-100 p-8 flex items-center justify-center relative min-h-[300px]">
                    {selectedPost.thumbnail ? (
                        <img src={selectedPost.thumbnail} alt="Post Preview" className="max-w-full max-h-[400px] object-contain rounded-xl shadow-lg" />
                    ) : (
                        <div className="flex flex-col items-center text-slate-400">
                             <ImageIcon size={64} className="mb-4 opacity-50" />
                             <p>No Visual Preview Available</p>
                        </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-600 border border-white">
                        {selectedPost.platform.toUpperCase()}
                    </div>
                </div>
                <div className="w-full md:w-1/2 p-8 flex flex-col h-full bg-white">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 border ${
                                selectedPost.status === 'posted' ? 'bg-slate-800 text-white border-slate-800' : 
                                selectedPost.status === 'scheduled' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                                selectedPost.status === 'approval' ? 'bg-orange-100 text-orange-700 border-orange-200' : 
                                'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                                {selectedPost.status}
                            </span>
                            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedPost.title}</h2>
                        </div>
                        <button onClick={() => setSelectedPost(null)} className="p-2 hover:bg-slate-100 rounded-full">
                            <X size={24} className="text-slate-400" />
                        </button>
                    </div>
                    <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Caption / Copy</h4>
                            <div className="p-4 bg-slate-50 rounded-xl text-slate-700 text-sm leading-relaxed whitespace-pre-line border border-slate-100">
                                {selectedPost.caption || selectedPost.description || "No caption provided yet."}
                            </div>
                        </div>
                    </div>
                    {selectedPost.status === 'approval' && (
                        <div className="mt-6 pt-6 border-t border-slate-100 flex gap-4">
                             <button onClick={(e) => handleRequestChanges(e, selectedPost.id)} className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-2 transition-colors">
                                <RotateCcw size={16} /> Request Changes
                            </button>
                            <button onClick={(e) => handleApprovePost(e, selectedPost.id)} className="flex-1 py-3 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-200">
                                <Check size={16} /> Approve Content
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Instagram Post Detail Modal */}
      {selectedInstaPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedInstaPost(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col md:flex-row">
            {/* Visual Column */}
            <div className="w-full md:w-[60%] bg-[#0F172A] flex items-center justify-center relative min-h-[300px]">
              {selectedInstaPost.media_type === 'VIDEO' ? (
                <video src={selectedInstaPost.media_url} controls className="max-w-full max-h-full" />
              ) : (
                <img src={selectedInstaPost.media_url} alt="Post" className="w-full h-full object-contain" />
              )}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/20">
                {selectedInstaPost.media_type}
              </div>
            </div>

            {/* Content Column */}
            <div className="w-full md:w-[40%] flex flex-col h-full bg-white border-l border-slate-100">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                    <img src={INSTAGRAM_MOCK_DATA.profile.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{INSTAGRAM_MOCK_DATA.profile.username}</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Instagram Post</p>
                  </div>
                </div>
                <button onClick={() => setSelectedInstaPost(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Caption Section */}
                <div className="p-6 border-b border-slate-50">
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">
                    {selectedInstaPost.caption}
                  </p>
                </div>

                {/* Insights Section */}
                <div className="p-6 bg-slate-50/30">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BarChart2 size={14} /> Post Insights
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Likes</p>
                      <p className="text-xl font-bold text-slate-900">{selectedInstaPost.like_count}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Comments</p>
                      <p className="text-xl font-bold text-slate-900">{selectedInstaPost.comments_count}</p>
                    </div>
                    {selectedInstaPost.insights.map((insight: any) => (
                      <div key={insight.title} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{insight.title}</p>
                        <p className="text-xl font-bold text-slate-900">{insight.values[0].value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="p-6">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MessageCircle size={14} /> Comments
                  </h4>
                  <div className="space-y-6">
                    {selectedInstaPost.comments.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-[10px] font-bold text-[#6C5CE7] flex-shrink-0 border border-violet-200">
                          {comment.from.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 mb-1">@{comment.from.username}</p>
                          <p className="text-xs text-slate-600 leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
