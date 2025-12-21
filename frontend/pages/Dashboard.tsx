import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  CreditCard,
  Layers,
  ArrowUpRight,
  Kanban,
  Calendar,
  CheckCircle2,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  RotateCcw,
  Check,
  UserCircle,
  Save,
  Building,
  User,
  MoreHorizontal,
  Loader2,
  Download,
  MessageCircle,
  X,
  Plus,
  Edit2,
  LogOut,
  Heart,
  Eye,
  AlertCircle,
  RefreshCw,
  BarChart2,
  MousePointer2,
  TrendingUp,
  Info,
  Clock,
  Mail,
  Phone,
  MapPin,
  Smartphone,
  Square,
  CheckSquare,
} from "lucide-react";
import {
  UserSubscription,
  Invoice,
  PipelinePost,
  PipelineStatus,
  UserProfile,
} from "../types";
import ContentItem from "../components/ContentItem";
import {
  api,
  mapBackendColumnToStatus,
  mapStatusToBackendColumn,
} from "../services/api";

// --- MOCK DATA (simplified, valid placeholders) ---
const MOCK_META_INSIGHTS = {
  success: true,
  client_id: "1",
  month: "2025-12",
  pages: [{ insights: [] }],
};
const MOCK_META_MEDIA = {
  success: true,
  client_id: "1",
  media: { most_liked: [], recent: [] },
};
const INSTAGRAM_MOCK_DATA = { profile: {}, media: [] };
const MOCK_POST_DETAIL = (baseItem: any) => ({ success: true, post: baseItem });

const MOCK_PIPELINE_POSTS: PipelinePost[] = [
  {
    id: "mock-backlog",
    title: "idea-01 | New Year Campaign Theme",
    platform: "all",
    platforms: ["instagram", "facebook", "linkedin", "twitter"],
    status: "backlog",
    dueDate: "2025-12-24",
    priority: "medium",
    description:
      "Brainstorm 3 creative directions + hooks for New Year campaign posts.",
    location: "Dubai, UAE",
    hashtags: ["#NewYear", "#Campaign"],
    client: { first_name: "Demo", last_name: "Client" },
    assigned_to: { first_name: "Ayesha", last_name: "Strategist" },
  },
  {
    id: "mock-writing",
    title: "poster-08 | Winter Sale Announcement",
    platform: "instagram",
    platforms: ["instagram", "facebook"],
    status: "writing",
    dueDate: "2025-12-26",
    priority: "high",
    description:
      "Create a winter sale post highlighting 30% off. Keep copy short and bold.",
    caption:
      "Winter Sale is live! Get up to 30% off on selected services. Limited time only.",
    hashtags: ["#WinterSale", "#LimitedTime", "#BrandName"],
    location: "Karachi, PK",
    client: { first_name: "Demo", last_name: "Client" },
    assigned_to: { first_name: "John", last_name: "Writer" },
  },
  {
    id: "mock-design",
    title: "carousel-02 | Before/After Results",
    platform: "linkedin",
    platforms: ["linkedin"],
    status: "design",
    dueDate: "2025-12-27",
    priority: "medium",
    description:
      "Design a 4-slide carousel showing before/after impact and a short CTA.",
    location: "Lahore, PK",
    hashtags: ["#CaseStudy", "#Growth", "#Marketing"],
    client: { first_name: "Demo", last_name: "Client" },
    assigned_to: { first_name: "Sara", last_name: "Dev" },
  },
  {
    id: "mock-review",
    title: "review-01 | Copy & CTA Final Check",
    platform: "facebook",
    platforms: ["facebook"],
    status: "review",
    dueDate: "2025-12-28",
    priority: "low",
    description:
      "Internal review: tone, grammar, CTA strength, and brand consistency.",
    location: "Islamabad, PK",
    hashtags: ["#BrandVoice"],
    client: { first_name: "Demo", last_name: "Client" },
    assigned_to: { first_name: "Bilal", last_name: "Editor" },
  },
  {
    id: "mock-approval",
    title: "reel-01 | Behind the scenes",
    platform: "instagram",
    platforms: ["instagram"],
    status: "approval",
    dueDate: "2025-12-29",
    priority: "low",
    description:
      "Client approval needed for the final caption and CTA.",
    location: "Abu Dhabi, UAE",
    client: { first_name: "Demo", last_name: "Client" },
    assigned_to: { first_name: "Sara", last_name: "Dev" },
  },
  {
    id: "mock-finalized",
    title: "final-01 | Export + Upload Assets",
    platform: "instagram",
    platforms: ["instagram"],
    status: "finalized",
    dueDate: "2025-12-30",
    priority: "medium",
    description:
      "Finalize exports (1080x1350, 1080x1920) and attach captions.",
    location: "Sharjah, UAE",
    hashtags: ["#ReadyToPost"],
    client: { first_name: "Demo", last_name: "Client" },
    assigned_to: { first_name: "Hira", last_name: "Designer" },
  },
  {
    id: "mock-scheduled",
    title: "schedule-01 | Queue in Meta Business Suite",
    platform: "facebook",
    platforms: ["facebook", "instagram"],
    status: "scheduled",
    dueDate: "2025-12-31",
    priority: "low",
    description:
      "Schedule for 6:30 PM local time. Verify link tracking.",
    location: "Doha, QA",
    hashtags: ["#Scheduled"],
    client: { first_name: "Demo", last_name: "Client" },
    assigned_to: { first_name: "Nida", last_name: "Manager" },
  },
  {
    id: "mock-posted",
    title: "posted-01 | Engagement Monitoring",
    platform: "twitter",
    platforms: ["twitter"],
    status: "posted",
    dueDate: "2026-01-01",
    priority: "low",
    description:
      "Monitor comments for 24h and respond to FAQs.",
    location: "Riyadh, SA",
    hashtags: ["#Community"],
    client: { first_name: "Demo", last_name: "Client" },
    assigned_to: { first_name: "Umar", last_name: "Support" },
  },
];

// Minimal mock profile used for demo mode fallback
const MOCK_PROFILE_CLIENT = {
  id: "demo-client",
  company_name: "Demo Company",
  billing_address: "Demo Address",
  gstin: "",
  business_email: "demo@example.com",
  business_phone: "",
  whatsapp_updates: false,
  contact_person: {
    salutation: "Mr",
    first_name: "Demo",
    last_name: "Client",
    email: "demo@example.com",
    phone: "",
  },
};

const PIPELINE_COLUMNS: { id: PipelineStatus; label: string; color: string }[] =
  [
    { id: "backlog", label: "Backlog", color: "border-slate-300" },
    { id: "writing", label: "Content Writing", color: "border-blue-400" },
    { id: "design", label: "Design / Creative", color: "border-purple-400" },
    { id: "review", label: "Internal Review", color: "border-yellow-400" },
    { id: "approval", label: "Client Approval", color: "border-orange-500" },
    { id: "finalized", label: "Finalized", color: "border-teal-500" },
    { id: "scheduled", label: "Scheduled", color: "border-emerald-500" },
    { id: "posted", label: "Posted", color: "border-slate-800" },
  ];

interface DashboardProps {
  onLogout: () => void;
  onNavigate?: (page: string, subPage?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "billing" | "pipeline" | "profile" | "instagram"
  >("overview");

  // Data State
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pipelinePosts, setPipelinePosts] = useState<PipelinePost[]>(
    MOCK_PIPELINE_POSTS
  );

  // UI State
  const [draggedPostId, setDraggedPostId] = useState<string | number | null>(
    null
  );
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const originalEmailRef = React.useRef<string | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpForEmail, setOtpForEmail] = useState(["", "", "", "", "", ""]);
  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [selectedPost, setSelectedPost] = useState<PipelinePost | null>(null);
  const [selectedInstaPost, setSelectedInstaPost] = useState<any>(null);

  // Meta / Instagram Data
  const [metaInsights, setMetaInsights] = useState<any>(MOCK_META_INSIGHTS);
  const [metaTopPosts, setMetaTopPosts] = useState<any>(MOCK_META_MEDIA);
  const [instagramData, setInstagramData] = useState<any>(INSTAGRAM_MOCK_DATA);
  const [isMetaLoading, setIsMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [isInstagramLoading, setIsInstagramLoading] = useState(false);
  const [instagramError, setInstagramError] = useState<string | null>(null);

  // Billing / Invoices UI state
  const [billingDateRange, setBillingDateRange] = useState({
    start: "",
    end: "",
  });
  const [billingSelectedInvoiceIds, setBillingSelectedInvoiceIds] = useState<
    string[]
  >([]);
  const [billingInvoicesLoading, setBillingInvoicesLoading] = useState(false);

  const [billingPreviewData, setBillingPreviewData] = useState<{
    id: number | string;
    html: string;
  } | null>(null);
  const [isBillingPreviewOpen, setIsBillingPreviewOpen] = useState(false);

  // Filters for Insights
  const [insightMonth, setInsightMonth] = useState("12");
  const [insightYear, setInsightYear] = useState("2025");

  const resolveClientId = () => {
    const idFromProfile = (userProfile as any)?.id;
    return idFromProfile || localStorage.getItem("client_id");
  };

  const loadClientDashboardMeta = async () => {
    const demoMode = localStorage.getItem("demoMode");
    if (demoMode) {
      setMetaInsights(MOCK_META_INSIGHTS);
      setMetaTopPosts(MOCK_META_MEDIA);
      setMetaError(null);
      return;
    }

    const clientId = resolveClientId();
    const accessToken = localStorage.getItem("accessToken");
    if (!clientId || !accessToken) return;

    const month = `${insightYear}-${insightMonth}`;
    setIsMetaLoading(true);
    setMetaError(null);
    try {
      const [insightsRes, topPostsRes] = await Promise.all([
        api.meta.dashboardInsights({ client_id: clientId, month }),
        api.meta.topPosts(clientId),
      ]);
      setMetaInsights(insightsRes);
      setMetaTopPosts(topPostsRes);
    } catch (e: any) {
      setMetaError(e?.message || "Failed to load Meta insights.");
    } finally {
      setIsMetaLoading(false);
    }
  };

  const loadInstagramInsights = async () => {
    const demoMode = localStorage.getItem("demoMode");
    if (demoMode) {
      setInstagramData(INSTAGRAM_MOCK_DATA);
      setInstagramError(null);
      return;
    }

    const clientId = resolveClientId();
    const accessToken = localStorage.getItem("accessToken");
    if (!clientId || !accessToken) return;

    setIsInstagramLoading(true);
    setInstagramError(null);
    try {
      const res = await api.meta.getInstagram(clientId);
      setInstagramData(res);
    } catch (e: any) {
      setInstagramError(e?.message || "Failed to load Instagram insights.");
    } finally {
      setIsInstagramLoading(false);
    }
  };

  const openInstagramPost = async (item: any) => {
    const demoMode = localStorage.getItem("demoMode");
    if (demoMode) {
      setSelectedInstaPost(MOCK_POST_DETAIL(item).post);
      return;
    }

    // Optimistic open to keep UX responsive; hydrate with real detail when loaded.
    setSelectedInstaPost({
      ...item,
      caption: item.caption || "",
      comments: Array.isArray(item.comments) ? item.comments : [],
      insights: Array.isArray(item.insights) ? item.insights : [],
    });

    try {
      const detail = await api.meta.getPostDetail(item.id);
      const post = detail?.post || detail;
      if (post) setSelectedInstaPost(post);
    } catch (e) {
      // Keep the optimistic view if detail fetch fails.
    }
  };

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const demoMode = localStorage.getItem("demoMode");
      const storedClientId = localStorage.getItem("client_id");

      try {
        if (demoMode) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          setUserProfile(MOCK_PROFILE_CLIENT);
          setPipelinePosts(MOCK_PIPELINE_POSTS);
        } else {
          let backendProfile: any = null;
          if (storedClientId) {
            // Prefer mapped profile helper when available
            if ((api.clients as any).getProfileMapped) {
              try {
                backendProfile = await (api.clients as any).getProfileMapped(
                  storedClientId
                );
              } catch (e) {
                // fallback
                backendProfile = await api.clients.get(storedClientId);
              }
            } else {
              backendProfile = await api.clients.get(storedClientId);
            }
          } else {
            // Fallback: try fetching profiles tied to the logged-in user
            try {
              const profiles: any = await api.core.getProfile();
              // api.core.getProfile returns an array; take the first
              if (Array.isArray(profiles) && profiles.length > 0) {
                backendProfile = profiles[0];
                try {
                  if (backendProfile.id)
                    localStorage.setItem(
                      "client_id",
                      backendProfile.id.toString()
                    );
                } catch (e) {
                  // ignore
                }
              }
            } catch (e) {
              // ignore - we'll continue without profile
            }
          }

          if (backendProfile) {
            // If api returned an already-mapped UserProfile (from getProfileMapped), accept it directly
            if (backendProfile.business && backendProfile.contactPerson) {
              setUserProfile(backendProfile as UserProfile);
            } else {
              setProfileFromBackend(backendProfile);
            }
          }

          // If there's no access token, avoid calling protected endpoints
          const accessToken = localStorage.getItem("accessToken");
          if (!accessToken) {
            console.warn(
              "No access token found - skipping protected backend calls"
            );
            setIsLoading(false);
            return;
          }

          // Initial invoices load (Billing tab can re-fetch with date range)
          try {
            const response: any = await api.invoice.list({
              page: 1,
              page_size: 1000,
            });
            const fetchedInvoices =
              (response?.results || response?.invoices || response) ?? [];
            const list = Array.isArray(fetchedInvoices) ? fetchedInvoices : [];

            setInvoices(
              list.map((inv: any) => {
                let amount = inv.total_amount ? parseFloat(inv.total_amount) : 0;
                if ((!amount || amount === 0) && Array.isArray(inv.items)) {
                  amount = inv.items.reduce(
                    (acc: number, it: any) =>
                      acc + parseFloat(it?.line_total || 0),
                    0
                  );
                }

                return {
                  id: inv.id,
                  invoice_id: inv.invoice_id,
                  date: inv.date,
                  amount,
                  // IMPORTANT: use backend status code (choice tuple first value)
                  status: inv.status || "unknown",
                  service:
                    inv.items && inv.items.length > 0
                      ? inv.items[0].service_name
                      : "General Service",
                };
              })
            );
          } catch (e) {
            // keep dashboard usable even if invoices fail
          }

          const kanbanItems = await api.kanban.list();
          const mapped = (kanbanItems || []).map((item: any) => ({
            id: item.id,
            title: item.title,
            platform: item.platforms?.[0] || "instagram",
            platforms: Array.isArray(item.platforms) ? item.platforms : undefined,
            priority: item.priority || undefined,
            status: mapBackendColumnToStatus(item.column),
            dueDate: item.due_date,
            description: item.description,
            thumbnail: item.thumbnail,
          }));

          setPipelinePosts(mapped.length ? mapped : MOCK_PIPELINE_POSTS);
        }
      } catch (error) {
        console.error("Dashboard Load Error", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchBillingInvoices = async () => {
    if (localStorage.getItem("demoMode")) return;
    setBillingInvoicesLoading(true);
    try {
      const response: any = await api.invoice.list({
        page: 1,
        page_size: 1000,
        start_date: billingDateRange.start || undefined,
        end_date: billingDateRange.end || undefined,
      });

      const fetchedInvoices =
        (response?.results || response?.invoices || response) ?? [];
      const list = Array.isArray(fetchedInvoices) ? fetchedInvoices : [];

      setInvoices(
        list.map((inv: any) => {
          let amount = inv.total_amount ? parseFloat(inv.total_amount) : 0;
          if ((!amount || amount === 0) && Array.isArray(inv.items)) {
            amount = inv.items.reduce(
              (acc: number, it: any) => acc + parseFloat(it?.line_total || 0),
              0
            );
          }
          return {
            id: inv.id,
            invoice_id: inv.invoice_id,
            date: inv.date,
            amount,
            status: inv.status || "unknown",
            service:
              inv.items && inv.items.length > 0
                ? inv.items[0].service_name
                : "General Service",
          };
        })
      );

      // keep selection consistent with visible list
      setBillingSelectedInvoiceIds([]);
    } catch (e) {
      console.error("Failed to fetch billing invoices", e);
    } finally {
      setBillingInvoicesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== "billing") return;
    fetchBillingInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "billing") return;
    const t = window.setTimeout(() => {
      fetchBillingInvoices();
    }, 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingDateRange.start, billingDateRange.end]);

  const toggleBillingInvoiceSelection = (id: string) => {
    setBillingSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const billingVisibleInvoiceIds = invoices.map((inv) => String(inv.id));
  const billingAllVisibleSelected =
    billingVisibleInvoiceIds.length > 0 &&
    billingVisibleInvoiceIds.every((id) => billingSelectedInvoiceIds.includes(id));

  const toggleSelectAllBillingInvoices = () => {
    setBillingSelectedInvoiceIds((prev) => {
      if (billingAllVisibleSelected) {
        return prev.filter((id) => !billingVisibleInvoiceIds.includes(id));
      }
      return Array.from(new Set([...prev, ...billingVisibleInvoiceIds]));
    });
  };

  const downloadInvoicePdf = async (id: string | number, invoiceNo?: string) => {
    try {
      const blob = await api.invoice.downloadPdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoiceNo || `invoice-${id}`}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
    }
  };

  const getClientInvoiceStatusLabel = (statusCode: string) => {
    const v = String(statusCode || "").toLowerCase();
    if (v === "partially_paid") return "Partially Paid";
    if (v === "paid") return "Paid";
    if (v === "cancelled") return "Cancelled";
    if (v === "unpaid") return "Pending Payment";
    return statusCode || "Unknown";
  };

  const openBillingInvoicePreview = async (id: string | number) => {
    try {
      const data = await api.invoice.preview(id);
      setBillingPreviewData(data);
      setIsBillingPreviewOpen(true);
    } catch (e) {
      console.error("Failed to preview invoice", e);
    }
  };

  const bulkDownloadBillingInvoices = async () => {
    if (billingSelectedInvoiceIds.length === 0) return;
    const selected = invoices.filter((inv) =>
      billingSelectedInvoiceIds.includes(String(inv.id))
    );
    for (const inv of selected) {
      // download sequentially to avoid browser throttling
      // eslint-disable-next-line no-await-in-loop
      await downloadInvoicePdf(inv.id, inv.invoice_id);
    }
  };

  // When the Profile tab is selected, refresh profile data from the server
  useEffect(() => {
    if (activeTab === "profile") {
      refreshProfile();
    }
  }, [activeTab]);

  // Load client dashboard Meta data
  useEffect(() => {
    if (activeTab !== "overview") return;
    loadClientDashboardMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, (userProfile as any)?.id, insightMonth, insightYear]);

  // Load Instagram data when tab is opened
  useEffect(() => {
    if (activeTab !== "instagram") return;
    loadInstagramInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, (userProfile as any)?.id]);

  // Helper to map backend profile shape to frontend `UserProfile`
  const setProfileFromBackend = (backendProfile: any) => {
    if (!backendProfile) return;
    setUserProfile({
      id: backendProfile.id,
      business: {
        name: backendProfile.company_name,
        address: backendProfile.billing_address,
        gstin: backendProfile.gstin,
        hsn: "",
        email: backendProfile.business_email,
        phone: backendProfile.business_phone,
        whatsappConsent: backendProfile.whatsapp_updates,
      },
      contactPerson: {
        salutation: backendProfile.contact_person?.salutation || "Mr",
        firstName: backendProfile.contact_person?.first_name || "",
        lastName: backendProfile.contact_person?.last_name || "",
        email: backendProfile.contact_person?.email || "",
        phone: backendProfile.contact_person?.phone || "",
        whatsappConsent: backendProfile.whatsapp_updates,
      },
    });
  };

  const refreshProfile = async () => {
    setIsLoading(true);
    try {
      const storedClientId = localStorage.getItem("client_id");
      let backendProfile: any = null;
      if (storedClientId) {
        if ((api.clients as any).getProfileMapped) {
          try {
            backendProfile = await (api.clients as any).getProfileMapped(
              storedClientId
            );
          } catch (e) {
            backendProfile = await api.clients.get(storedClientId);
          }
        } else {
          backendProfile = await api.clients.get(storedClientId);
        }
      } else {
        const profiles: any = await api.core.getProfile();
        if (Array.isArray(profiles) && profiles.length > 0) {
          backendProfile = profiles[0];
          if (backendProfile.id)
            localStorage.setItem("client_id", backendProfile.id.toString());
        }
      }
      if (backendProfile) {
        if (backendProfile.business && backendProfile.contactPerson) {
          setUserProfile(backendProfile as UserProfile);
        } else {
          setProfileFromBackend(backendProfile);
        }
      }
    } catch (e) {
      console.error("Profile refresh failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, postId: string | number) => {
    const post = pipelinePosts.find((p) => p.id === postId);
    if (post && post.status === "approval") {
      setDraggedPostId(postId);
      e.dataTransfer.effectAllowed = "move";
    } else {
      e.preventDefault();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: PipelineStatus) => {
    e.preventDefault();
    if (!draggedPostId) return;
    if (status !== "review") return;

    setPipelinePosts((prev) =>
      prev.map((post) =>
        post.id === draggedPostId ? { ...post, status } : post
      )
    );

    if (!localStorage.getItem("demoMode")) {
      try {
        await api.kanban.move(
          draggedPostId as number,
          mapStatusToBackendColumn(status)
        );
      } catch (e) {
        console.error(e);
      }
    }
    setDraggedPostId(null);
  };

  const handleApprovePostById = async (postId: string | number) => {
    setPipelinePosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, status: "scheduled" } : post
      )
    );
    if (selectedPost?.id === postId)
      setSelectedPost((prev) =>
        prev ? { ...prev, status: "scheduled" } : null
      );
    if (!localStorage.getItem("demoMode")) {
      try {
        await api.kanban.approve(postId as number, "approve");
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleApprovePost = async (
    e: React.MouseEvent,
    postId: string | number
  ) => {
    e.stopPropagation();
    await handleApprovePostById(postId);
  };

  const handleRequestChangesById = async (postId: string | number) => {
    const reason = prompt("Feedback for the team:");
    if (reason) {
      setPipelinePosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, status: "review" } : post
        )
      );
      if (selectedPost?.id === postId)
        setSelectedPost((prev) =>
          prev ? { ...prev, status: "review" } : null
        );
      if (!localStorage.getItem("demoMode")) {
        try {
          await api.kanban.approve(postId as number, "revise");
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleRequestChanges = async (
    e: React.MouseEvent,
    postId: string | number
  ) => {
    e.stopPropagation();
    await handleRequestChangesById(postId);
  };

  const handleProfileChange = (
    section: "business" | "contactPerson",
    field: string,
    value: any
  ) => {
    if (!userProfile) return;
    setUserProfile((prev) => {
      if (!prev) return null;
      return { ...prev, [section]: { ...prev[section], [field]: value } };
    });
  };

  const openEditWithPassword = () => {
    setPasswordInput("");
    setPasswordError(null);
    setShowPasswordPrompt(true);
  };

  const verifyPasswordAndOpen = async () => {
    setPasswordError(null);
    setProfileError(null);
    try {
      await api.auth.verifyPassword({ password: passwordInput });
      originalEmailRef.current = userProfile?.contactPerson?.email || null;
      setShowPasswordPrompt(false);
      setIsEditingProfile(true);
    } catch (e: any) {
      setPasswordError(e.message || "Invalid password");
    }
  };

  const saveProfile = async () => {
    if (!userProfile?.id) return;
    if (localStorage.getItem("demoMode")) {
      setIsEditingProfile(false);
      return;
    }
    try {
      const payload: any = {
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
          phone: userProfile.contactPerson.phone,
        },
        current_password: passwordInput,
      };

      const newEmail = userProfile.contactPerson.email;
      const originalEmail = originalEmailRef.current;

      if (newEmail && originalEmail && newEmail !== originalEmail) {
        try {
          await api.clients.initiateContactEmailChange(userProfile.id, {
            contact_email: newEmail,
          });
          setShowOtpModal(true);
          return;
        } catch (e: any) {
          const msg = (e as any)?.message || String(e);
          setProfileError(msg);
          console.error(`Error initiating email change: ${msg}`);
          return;
        }
      }

      payload.contact_person.email = newEmail;
      await api.clients.replace(userProfile.id, payload);
      setProfileError(null);
      setIsEditingProfile(false);
      console.log("Profile Updated Successfully");
    } catch (error: any) {
      const msg =
        (error as any)?.response?.data?.contact_person ||
        (error as any)?.response?.data?.detail ||
        (error as any)?.message ||
        String(error);
      setProfileError(msg);
      console.error("Error updating profile:", msg);
    }
  };

  const handleOtpChangeForEmail = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpForEmail];
    newOtp[index] = value.substring(value.length - 1);
    setOtpForEmail(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const submitEmailOtp = async () => {
    const enteredOtp = otpForEmail.join("");
    if (enteredOtp.length !== 6) {
      console.error("Please enter a 6-digit OTP");
      return;
    }
    const newEmail = userProfile?.contactPerson?.email;
    if (!newEmail) return;
    try {
      await api.clients.verifyContactEmailChange(userProfile.id, {
        contact_email: newEmail,
        otp: enteredOtp,
      });
      const payload: any = {
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
          phone: userProfile.contactPerson.phone,
        },
        current_password: passwordInput,
      };
      await api.clients.replace(userProfile.id, payload);
      setShowOtpModal(false);
      setIsEditingProfile(false);
      console.log("Profile Updated Successfully");
    } catch (e: any) {
      const msg =
        (e as any)?.response?.data?.contact_person ||
        (e as any)?.response?.data?.detail ||
        (e as any)?.message ||
        String(e);
      setProfileError(msg);
      console.error(`OTP verify failed: ${msg}`);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram size={14} className="text-pink-600" />;
      case "linkedin":
        return <Linkedin size={14} className="text-blue-700" />;
      default:
        return <UserCircle size={14} />;
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="animate-spin text-[#6C5CE7]" size={48} />
      </div>
    );

  if (!userProfile)
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500 px-4">
        <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-md border">
          <div className="flex items-start gap-4">
            <div className="text-3xl text-slate-400">
              <UserCircle />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-800">
                No profile found
              </h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                We couldn't find a client profile for this account. This may
                happen if your account wasn't linked to a client profile yet.
              </p>

              {(() => {
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                  try {
                    const u = JSON.parse(storedUser);
                    return (
                      <div className="mb-4 text-sm text-slate-600">
                        <div>
                          <strong>Name:</strong>{" "}
                          {u.name || u.first_name || u.username || "-"}
                        </div>
                        <div>
                          <strong>Email:</strong>{" "}
                          {u.email || u.contact_email || "-"}
                        </div>
                      </div>
                    );
                  } catch (e) {
                    /* ignore */
                  }
                }
                return null;
              })()}

              <div className="flex gap-2">
                <button
                  onClick={refreshProfile}
                  className="px-4 py-2 bg-[#6C5CE7] text-white rounded-lg shadow-sm hover:opacity-95"
                >
                  Retry loading profile
                </button>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-white border rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  // Pipeline Stats
  const inPipelineCount = pipelinePosts.filter(
    (p) => !["scheduled", "posted"].includes(p.status)
  ).length;
  const scheduledCount = pipelinePosts.filter(
    (p) => p.status === "scheduled"
  ).length;
  const postedCount = pipelinePosts.filter((p) => p.status === "posted").length;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
      <aside className="w-full md:w-64 bg-white shadow-lg z-10 border-r flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-slate-800">Client Hub</h2>
          <p className="text-xs font-semibold text-[#FF6B6B] tracking-wider uppercase mt-1">
            Tarviz Digimart
          </p>
        </div>
        <nav className="p-4 space-y-2 flex-1">
          {[
            { id: "overview", icon: Layers, label: "Overview" },
            { id: "pipeline", icon: Kanban, label: "Content Pipeline" },
            { id: "billing", icon: CreditCard, label: "Billing & Invoices" },
            { id: "instagram", icon: Instagram, label: "Instagram Insights" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? "bg-gradient-brand text-white shadow-lg shadow-orange-200"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t space-y-2">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === "profile"
                ? "bg-slate-800 text-white shadow-lg"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <UserCircle size={20} />
            <span className="font-medium">My Profile</span>
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-slate-500 hover:bg-red-50 hover:text-red-500"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto h-screen relative bg-slate-50">
        {activeTab === "overview" && (
          <div className="space-y-12 animate-in fade-in duration-500 pb-12">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
                Welcome, {userProfile.contactPerson.firstName}
              </h1>
              <p className="text-slate-500">
                Here is what's happening with your brand today.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Layers size={64} className="text-[#6C5CE7]" />
                </div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Active Plan
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Standard SMM
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full border border-emerald-100">
                    Active
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 text-sm">
                  <span className="text-slate-500">
                    Renewal Date:{" "}
                    <span className="font-bold text-slate-900">
                      15 Jan 2024
                    </span>
                  </span>
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
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                    In Pipeline
                  </p>
                  <p className="text-3xl font-black text-slate-900">
                    {inPipelineCount}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                    Scheduled
                  </p>
                  <p className="text-3xl font-black text-[#6C5CE7]">
                    {scheduledCount}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">
                    Posted
                  </p>
                  <p className="text-3xl font-black text-emerald-500">
                    {postedCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Meta Insights Section */}
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <BarChart2 size={20} className="text-[#6C5CE7]" /> Meta
                  Insights
                </h2>
                <div className="flex gap-2">
                  <select
                    value={insightMonth}
                    onChange={(e) => setInsightMonth(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 outline-none focus:border-[#6C5CE7]"
                  >
                    {[
                      "January",
                      "February",
                      "March",
                      "April",
                      "May",
                      "June",
                      "July",
                      "August",
                      "September",
                      "October",
                      "November",
                      "December",
                    ].map((m, i) => (
                      <option key={m} value={String(i + 1).padStart(2, "0")}>
                        {m}
                      </option>
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

              {metaError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-3 text-sm font-medium">
                  {metaError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
                {(() => {
                  const all = (metaInsights?.pages || [])
                    .flatMap((p: any) => p?.insights || [])
                    .filter(Boolean);

                  if (isMetaLoading) {
                    return Array.from({ length: 5 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                      >
                        <div className="h-3 w-2/3 bg-slate-100 rounded mb-4" />
                        <div className="h-8 w-1/2 bg-slate-100 rounded" />
                      </div>
                    ));
                  }

                  if (all.length === 0) {
                    return (
                      <div className="col-span-full bg-white p-6 rounded-2xl border border-slate-100 text-slate-500">
                        No insights available.
                      </div>
                    );
                  }

                  return all.slice(0, 10).map((insight: any) => {
                    const rawValue = insight?.value;
                    const value =
                      typeof rawValue === "number"
                        ? rawValue
                        : Number.isFinite(Number(rawValue))
                          ? Number(rawValue)
                          : 0;

                    return (
                      <div
                        key={`${insight?.title || "insight"}-${insight?.description || ""}`}
                        className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative group"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                            {insight?.title || "Insight"}
                          </p>
                          <div
                            className="opacity-0 group-hover:opacity-100 transition-opacity cursor-help text-slate-300 hover:text-slate-400"
                            title={insight?.description || ""}
                          >
                            <Info size={14} />
                          </div>
                        </div>
                        <p className="text-2xl font-black text-slate-900">
                          {value.toLocaleString()}
                        </p>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Media Highlights */}
              <div className="grid md:grid-cols-2 gap-12">
                {/* Most Liked */}
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Heart size={16} className="text-[#FF6B6B]" /> Most Liked
                    Posts
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(metaTopPosts?.media?.most_liked || []).map((post: any) => (
                      <div
                        key={post.id}
                        className="group relative aspect-square bg-slate-200 rounded-2xl overflow-hidden shadow-sm"
                      >
                        <img
                          src={post.media_url}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          alt="Post"
                        />
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
                    <Clock size={16} className="text-[#6C5CE7]" /> Recent
                    Content
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {(metaTopPosts?.media?.recent || []).map((post: any) => (
                      <div
                        key={post.id}
                        className="group relative aspect-square bg-slate-200 rounded-2xl overflow-hidden shadow-sm"
                      >
                        <img
                          src={post.media_url}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          alt="Post"
                        />
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

        {activeTab === "pipeline" && (
          <div className="h-full flex flex-col animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-800">
                Content Pipeline
              </h1>
            </div>
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
              <div className="flex h-full gap-4 min-w-[1600px]">
                {PIPELINE_COLUMNS.map((column) => {
                  const posts = pipelinePosts.filter(
                    (p) => p.status === column.id
                  );
                  const isClientApproval = column.id === "approval";
                  return (
                    <div
                      key={column.id}
                      className={`flex flex-col w-72 shrink-0 h-full rounded-2xl ${
                        isClientApproval ? "bg-orange-50/50" : "bg-white"
                      } border-t-4 ${
                        column.color
                      } shadow-sm border-x border-b border-slate-200`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, column.id)}
                    >
                      <div className="p-3 border-b flex justify-between items-center">
                        <h3
                          className={`font-bold text-sm ${
                            isClientApproval
                              ? "text-orange-700"
                              : "text-slate-700"
                          }`}
                        >
                          {column.label}
                        </h3>
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full text-xs font-bold text-slate-400 border">
                          {posts.length}
                        </span>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                        {posts.length === 0 && (
                          <div className="h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-slate-400 text-xs italic">
                            <div>No items</div>
                            <div className="mt-3">
                              <button
                                onClick={() =>
                                  onNavigate?.("admin-dashboard", "pipeline")
                                }
                                className="px-3 py-1.5 bg-[#6C5CE7] text-white rounded-lg text-xs font-bold"
                              >
                                Add Task
                              </button>
                            </div>
                          </div>
                        )}
                        {posts.map((post) => (
                          <ContentItem
                            key={post.id}
                            post={post}
                            isAdmin={false}
                            onDragStart={handleDragStart}
                            onApprove={handleApprovePostById}
                            onRevise={handleRequestChangesById}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "billing" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-slate-800">
              Billing History
            </h1>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Calendar size={16} />
                <span>Date Range:</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="date"
                  value={billingDateRange.start}
                  onChange={(e) =>
                    setBillingDateRange((p) => ({ ...p, start: e.target.value }))
                  }
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <input
                  type="date"
                  value={billingDateRange.end}
                  onChange={(e) =>
                    setBillingDateRange((p) => ({ ...p, end: e.target.value }))
                  }
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />

                {billingSelectedInvoiceIds.length > 0 && (
                  <button
                    onClick={bulkDownloadBillingInvoices}
                    className="bg-[#0F172A] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2"
                  >
                    <Download size={16} /> Bulk Download (
                    {billingSelectedInvoiceIds.length})
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-600 w-[90px]">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectAllBillingInvoices();
                        }}
                        className="text-slate-500 hover:text-slate-700 font-bold text-sm inline-flex items-center gap-2"
                        aria-label={
                          billingAllVisibleSelected
                            ? "Unselect all invoices"
                            : "Select all invoices"
                        }
                        title={
                          billingAllVisibleSelected
                            ? "Unselect all"
                            : "Select all"
                        }
                      >
                        {billingAllVisibleSelected ? (
                          <CheckSquare size={18} />
                        ) : (
                          <Square size={18} />
                        )}
                        All
                      </button>
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-600">
                      Invoice ID
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-600">Date</th>
                    <th className="px-6 py-4 font-bold text-slate-600">
                      Service
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-600">
                      Amount
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-600">
                      Status
                    </th>
                    <th className="px-6 py-4 font-bold text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => openBillingInvoicePreview(inv.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openBillingInvoicePreview(inv.id);
                        }
                      }}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBillingInvoiceSelection(String(inv.id));
                          }}
                          className="text-slate-500 hover:text-slate-700"
                          title="Select"
                          aria-label="Select invoice"
                        >
                          {billingSelectedInvoiceIds.includes(String(inv.id)) ? (
                            <CheckSquare size={18} />
                          ) : (
                            <Square size={18} />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-slate-500">
                        {inv.invoice_id}
                      </td>
                      <td className="px-6 py-4 text-slate-800">{inv.date}</td>
                      <td className="px-6 py-4 text-slate-800 font-medium">
                        {inv.service}
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-bold">
                        ₹{inv.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const label = getClientInvoiceStatusLabel(inv.status);
                          const v = String(inv.status || "").toLowerCase();
                          const tone =
                            v === "paid"
                              ? "bg-green-50 text-green-600 border-green-200"
                              : v === "partially_paid"
                                ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                                : "bg-slate-50 text-slate-600 border-slate-200";
                          return (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold border ${tone}`}
                            >
                              {label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadInvoicePdf(inv.id, inv.invoice_id);
                          }}
                          className="font-bold text-sm text-[#6C5CE7] hover:underline"
                        >
                          <Download size={16} className="inline mr-1" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {billingInvoicesLoading && (
                <div className="p-4 text-center text-slate-500 font-medium">
                  <Loader2 className="inline animate-spin mr-2" size={16} />
                  Loading…
                </div>
              )}
              {invoices.length === 0 && (
                <div className="p-8 text-center text-slate-400">
                  <div>No invoices found.</div>
                  <div className="mt-4">
                    <button
                      onClick={() =>
                        onNavigate?.("admin-dashboard", "invoices")
                      }
                      className="px-4 py-2 bg-[#6C5CE7] text-white rounded-lg shadow-sm"
                    >
                      Create Invoice
                    </button>
                    <button
                      onClick={() =>
                        onNavigate?.("admin-dashboard", "services")
                      }
                      className="ml-3 px-4 py-2 bg-white border rounded-lg text-slate-700"
                    >
                      Manage Services
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isBillingPreviewOpen && billingPreviewData && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col">
                  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Eye size={18} className="text-[#6C5CE7]" /> Invoice Preview
                    </h3>
                    <button
                      onClick={() => setIsBillingPreviewOpen(false)}
                      className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
                      type="button"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-4 overflow-auto max-h-[80vh] bg-slate-50">
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                      <div
                        className="p-4"
                        dangerouslySetInnerHTML={{
                          __html: billingPreviewData.html,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "instagram" && (
          <div className="animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto">
              {instagramError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-3 text-sm font-medium">
                  {instagramError}
                </div>
              )}

              {/* Profile Header */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mb-12 pb-12 border-b border-slate-200">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 p-1 overflow-hidden bg-white shadow-sm flex-shrink-0">
                  <img
                    src={instagramData?.profile?.profile_picture_url || ""}
                    alt={instagramData?.profile?.username || "Instagram"}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
                    <h2 className="text-2xl font-normal text-slate-900 tracking-tight">
                      {isInstagramLoading
                        ? "Loading…"
                        : instagramData?.profile?.username || "Not linked"}
                    </h2>
                    <div className="flex gap-2">
                      <a
                        href={`https://instagram.com/${instagramData?.profile?.username || ""}`}
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
                      <span className="font-bold text-slate-900">
                        {instagramData?.profile?.media_count ?? 0}
                      </span>
                      <span className="ml-1 text-slate-500">posts</span>
                    </div>
                    <div className="text-center md:text-left">
                      <span className="font-bold text-slate-900">
                        {instagramData?.profile?.followers_count ?? 0}
                      </span>
                      <span className="ml-1 text-slate-500">followers</span>
                    </div>
                    <div className="text-center md:text-left">
                      <span className="font-bold text-slate-900">
                        {instagramData?.profile?.follows_count ?? 0}
                      </span>
                      <span className="ml-1 text-slate-500">following</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="font-bold text-slate-900 mb-1">
                      {instagramData?.profile?.name || ""}
                    </p>
                    <p className="text-slate-700 whitespace-pre-wrap font-medium">
                      {instagramData?.profile?.biography || ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Media Grid */}
              <div className="grid grid-cols-3 gap-1 md:gap-8">
                {(instagramData?.media || []).map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => openInstagramPost(item)}
                    className="relative aspect-square group overflow-hidden bg-slate-200 rounded-sm md:rounded-xl shadow-sm cursor-pointer"
                  >
                    <img
                      src={
                        item.media_type === "VIDEO" && item.thumbnail_url
                          ? item.thumbnail_url
                          : item.media_url
                      }
                      alt="Instagram content"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Interaction Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex flex-col items-center text-white font-bold">
                        <Heart size={24} fill="white" />
                        <span className="text-sm mt-1">
                          {item.like_count || 0}
                        </span>
                      </div>
                      <div className="flex flex-col items-center text-white font-bold">
                        <Eye size={24} />
                        <span className="text-sm mt-1">{item.reach || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!isInstagramLoading && (instagramData?.media || []).length === 0 && (
                <div className="mt-6 text-center text-slate-500">
                  No Instagram media found for this account.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl pb-12">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800">
                  My Profile
                </h1>
                <p className="text-slate-500">
                  Manage your business and contact information.
                </p>
                {profileError && (
                  <div className="mt-2 text-sm text-red-600">
                    {profileError}
                  </div>
                )}
              </div>
              {!isEditingProfile ? (
                <button
                  onClick={openEditWithPassword}
                  className="flex items-center gap-2 bg-white border border-slate-200 text-[#6C5CE7] font-bold hover:bg-violet-50 px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <Edit2 size={18} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProfile}
                    className="flex items-center gap-2 bg-[#6C5CE7] text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-violet-200 transition-all hover:bg-[#5a4ad1]"
                  >
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
                  <h3 className="font-bold text-slate-800">
                    Business Information
                  </h3>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Company Name
                      </label>
                      {isEditingProfile ? (
                        <input
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800"
                          value={userProfile.business.name}
                          onChange={(e) =>
                            handleProfileChange(
                              "business",
                              "name",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-3 px-1">
                          <div className="w-10 h-10 rounded-lg bg-red-50 text-[#FF6B6B] flex items-center justify-center flex-shrink-0">
                            <Building size={20} />
                          </div>
                          <p className="text-slate-800 font-bold text-lg">
                            {userProfile.business.name}
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        GSTIN
                      </label>
                      {isEditingProfile ? (
                        <input
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800"
                          value={userProfile.business.gstin}
                          onChange={(e) =>
                            handleProfileChange(
                              "business",
                              "gstin",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-3 px-1">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center flex-shrink-0 font-bold text-xs uppercase">
                            GST
                          </div>
                          <p className="text-slate-800 font-mono font-medium">
                            {userProfile.business.gstin || "-"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 pt-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Business Email
                      </label>
                      {isEditingProfile ? (
                        <input
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800"
                          value={userProfile.business.email}
                          onChange={(e) =>
                            handleProfileChange(
                              "business",
                              "email",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-3 px-1">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0">
                            <Mail size={20} />
                          </div>
                          <p className="text-slate-800 font-medium">
                            {userProfile.business.email || "-"}
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Business Phone
                      </label>
                      {isEditingProfile ? (
                        <input
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800"
                          value={userProfile.business.phone}
                          onChange={(e) =>
                            handleProfileChange(
                              "business",
                              "phone",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-3 px-1">
                          <div className="w-10 h-10 rounded-lg bg-green-50 text-green-500 flex items-center justify-center flex-shrink-0">
                            <Phone size={20} />
                          </div>
                          <p className="text-slate-800 font-medium">
                            {userProfile.business.phone || "-"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Billing Address
                    </label>
                    {isEditingProfile ? (
                      <textarea
                        rows={3}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800 resize-none"
                        value={userProfile.business.address}
                        onChange={(e) =>
                          handleProfileChange(
                            "business",
                            "address",
                            e.target.value
                          )
                        }
                      />
                    ) : (
                      <div className="flex items-start gap-3 px-1">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                          <MapPin size={20} />
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                          {userProfile.business.address || "-"}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-50">
                    <div className="flex items-center justify-between bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">
                            WhatsApp Updates
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Receive billing and project alerts on WhatsApp
                          </p>
                        </div>
                      </div>
                      {isEditingProfile ? (
                        <div
                          onClick={() =>
                            handleProfileChange(
                              "business",
                              "whatsappConsent",
                              !userProfile.business.whatsappConsent
                            )
                          }
                          className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-all duration-300 flex items-center ${
                            userProfile.business.whatsappConsent
                              ? "bg-[#6C5CE7]"
                              : "bg-slate-300"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${
                              userProfile.business.whatsappConsent
                                ? "translate-x-5"
                                : "translate-x-0"
                            }`}
                          />
                        </div>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            userProfile.business.whatsappConsent
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {userProfile.business.whatsappConsent
                            ? "Enabled"
                            : "Disabled"}
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
                  <h3 className="font-bold text-slate-800">
                    Primary Contact Person
                  </h3>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Salutation
                      </label>
                      {isEditingProfile ? (
                        <select
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800 appearance-none"
                          value={userProfile.contactPerson.salutation}
                          onChange={(e) =>
                            handleProfileChange(
                              "contactPerson",
                              "salutation",
                              e.target.value
                            )
                          }
                        >
                          <option>Mr</option>
                          <option>Ms</option>
                          <option>Mrs</option>
                          <option>Dr</option>
                        </select>
                      ) : (
                        <p className="px-4 py-2 bg-slate-50 rounded-lg text-slate-800 font-bold text-center w-fit min-w-[60px]">
                          {userProfile.contactPerson.salutation}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        First Name
                      </label>
                      {isEditingProfile ? (
                        <input
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800"
                          value={userProfile.contactPerson.firstName}
                          onChange={(e) =>
                            handleProfileChange(
                              "contactPerson",
                              "firstName",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <p className="text-slate-800 font-bold text-lg">
                          {userProfile.contactPerson.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Last Name
                      </label>
                      {isEditingProfile ? (
                        <input
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800"
                          value={userProfile.contactPerson.lastName}
                          onChange={(e) =>
                            handleProfileChange(
                              "contactPerson",
                              "lastName",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <p className="text-slate-800 font-bold text-lg">
                          {userProfile.contactPerson.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 pt-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Personal Email
                      </label>
                      {isEditingProfile ? (
                        <input
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800"
                          value={userProfile.contactPerson.email}
                          onChange={(e) =>
                            handleProfileChange(
                              "contactPerson",
                              "email",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-violet-50 text-[#6C5CE7] flex items-center justify-center flex-shrink-0">
                            <Mail size={18} />
                          </div>
                          <p className="text-slate-800 font-medium">
                            {userProfile.contactPerson.email}
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Mobile Number
                      </label>
                      {isEditingProfile ? (
                        <input
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#6C5CE7] font-medium text-slate-800"
                          value={userProfile.contactPerson.phone}
                          onChange={(e) =>
                            handleProfileChange(
                              "contactPerson",
                              "phone",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-violet-50 text-[#6C5CE7] flex items-center justify-center flex-shrink-0">
                            <Phone size={18} />
                          </div>
                          <p className="text-slate-800 font-medium">
                            {userProfile.contactPerson.phone}
                          </p>
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
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedPost(null)}
          ></div>
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col md:flex-row overflow-hidden">
            <div className="w-full md:w-1/2 bg-slate-100 p-8 flex items-center justify-center relative min-h-[300px]">
              {selectedPost.thumbnail ? (
                <img
                  src={selectedPost.thumbnail}
                  alt="Post Preview"
                  className="max-w-full max-h-[400px] object-contain rounded-xl shadow-lg"
                />
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
                  <span
                    className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-2 border ${
                      selectedPost.status === "posted"
                        ? "bg-slate-800 text-white border-slate-800"
                        : selectedPost.status === "scheduled"
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : selectedPost.status === "approval"
                        ? "bg-orange-100 text-orange-700 border-orange-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {selectedPost.status}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                    {selectedPost.title}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 hover:bg-slate-100 rounded-full"
                >
                  <X size={24} className="text-slate-400" />
                </button>
              </div>
              <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">
                    Caption / Copy
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-xl text-slate-700 text-sm leading-relaxed whitespace-pre-line border border-slate-100">
                    {selectedPost.caption ||
                      selectedPost.description ||
                      "No caption provided yet."}
                  </div>
                </div>
              </div>
              {selectedPost.status === "approval" && (
                <div className="mt-6 pt-6 border-t border-slate-100 flex gap-4">
                  <button
                    onClick={(e) => handleRequestChanges(e, selectedPost.id)}
                    className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw size={16} /> Request Changes
                  </button>
                  <button
                    onClick={(e) => handleApprovePost(e, selectedPost.id)}
                    className="flex-1 py-3 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-200"
                  >
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
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setSelectedInstaPost(null)}
          ></div>
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative z-10 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col md:flex-row">
            {/* Visual Column */}
            <div className="w-full md:w-[60%] bg-[#0F172A] flex items-center justify-center relative min-h-[300px]">
              {selectedInstaPost.media_type === "VIDEO" ? (
                <video
                  src={selectedInstaPost.media_url}
                  controls
                  className="max-w-full max-h-full"
                />
              ) : (
                <img
                  src={selectedInstaPost.media_url}
                  alt="Post"
                  className="w-full h-full object-contain"
                />
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
                    <img
                      src={INSTAGRAM_MOCK_DATA.profile.profile_picture_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {INSTAGRAM_MOCK_DATA.profile.username}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Instagram Post
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInstaPost(null)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
                >
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
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Likes
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        {selectedInstaPost.like_count}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Comments
                      </p>
                      <p className="text-xl font-bold text-slate-900">
                        {selectedInstaPost.comments_count}
                      </p>
                    </div>
                    {selectedInstaPost.insights.map((insight: any) => (
                      <div
                        key={insight.title}
                        className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
                      >
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                          {insight.title}
                        </p>
                        <p className="text-xl font-bold text-slate-900">
                          {insight.values[0].value}
                        </p>
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
                          <p className="text-xs font-bold text-slate-900 mb-1">
                            @{comment.from.username}
                          </p>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {comment.text}
                          </p>
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
      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setShowPasswordPrompt(false)}
          />
          <div className="bg-white rounded-2xl p-6 z-10 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-2">Confirm your password</h3>
            <p className="text-sm text-slate-500 mb-4">
              Enter your current password to edit profile.
            </p>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-xl mb-3"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
            />
            {passwordError && (
              <div className="text-red-600 text-sm mb-2">{passwordError}</div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPasswordPrompt(false)}
                className="px-4 py-2 rounded-lg bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={verifyPasswordAndOpen}
                className="px-4 py-2 rounded-lg bg-[#6C5CE7] text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal for contact email change */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setShowOtpModal(false)}
          />
          <div className="bg-white rounded-2xl p-6 z-10 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-2">Verify new email</h3>
            <p className="text-sm text-slate-500 mb-4">
              An OTP was sent to this email. This will be your new login ID.
            </p>
            <div className="flex gap-2 mb-4">
              {otpForEmail.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRefs.current[i] = el)}
                  value={d}
                  onChange={(e) => handleOtpChangeForEmail(i, e.target.value)}
                  className="w-12 h-12 text-center border rounded-lg"
                />
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowOtpModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={submitEmailOtp}
                className="px-4 py-2 rounded-lg bg-[#6C5CE7] text-white"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
