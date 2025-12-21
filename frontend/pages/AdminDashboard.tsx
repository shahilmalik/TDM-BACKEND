import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Building,
  Plus,
  Search,
  Trash2,
  Edit2,
  Save,
  X,
  Landmark,
  CreditCard,
  FileText,
  Users,
  FileSpreadsheet,
  ChevronRight,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  LogOut,
  Kanban,
  UserCircle,
  Phone,
  Mail,
  MapPin,
  Eye,
  CheckCircle2,
  RotateCcw,
  Check,
  Image as ImageIcon,
  Instagram,
  Linkedin,
  Facebook,
  Twitter,
  Calendar,
  Download,
  Filter,
  Square,
  CheckSquare,
  MessageSquare,
  Tag,
  ListPlus,
  Settings,
  Smartphone,
  CreditCard as PaymentIcon,
  ShieldCheck,
  Share2,
  Key,
  Facebook as FbIcon,
  // Fix: Added missing Loader2 import from lucide-react
  Loader2,
} from "lucide-react";
import {
  AdminServiceItem,
  AdminCompanyDetails,
  AdminEmployee,
  AdminInvoice,
  AdminClient,
  AdminInvoiceItem,
  PipelinePost,
  PipelineStatus,
  UserSubscription,
  BackendService,
  BackendCategory,
  PipelineConfigItem,
  MetaToken,
  MetaPage,
} from "../types";
import {
  api,
  mapBackendColumnToStatus,
  mapStatusToBackendColumn,
} from "../services/api";

const PIPELINE_COLUMNS: { id: PipelineStatus; label: string; color: string }[] =
  [
    { id: "backlog", label: "Backlog", color: "border-slate-300" },
    { id: "writing", label: "Content Writing", color: "border-blue-400" },
    { id: "design", label: "Design / Creative", color: "border-purple-400" },
    { id: "review", label: "Internal Review", color: "border-yellow-400" },
    { id: "approval", label: "Client Approval", color: "border-orange-500" },
    { id: "scheduled", label: "Scheduled", color: "border-emerald-500" },
    { id: "posted", label: "Posted", color: "border-slate-800" },
  ];

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigate?: (page: string, subPage?: string) => void;
}

// Extended interface for invoice creation items to hold backend IDs
interface CreateInvoiceItem extends AdminInvoiceItem {
  servicePk?: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<
    | "pipeline"
    | "clients"
    | "invoices"
    | "services"
    | "employees"
    | "settings"
    | "meta"
  >("pipeline");
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [adminMessage, setAdminMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!adminMessage) return;
    const t = window.setTimeout(() => setAdminMessage(null), 5000);
    return () => window.clearTimeout(t);
  }, [adminMessage]);

  // --- DATA INITIALIZATION ---

  // Services State
  const [services, setServices] = useState<BackendService[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);

  // Category UI State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Company Profile State (Using Provided Data)
  const [companyDetails, setCompanyDetails] = useState<AdminCompanyDetails>({
    name: "TarvizDigimart",
    address: "12th street, Nungambakkam,\r\nChennai - 234234",
    phone: "7470067003",
    email: "info@tarvizdigimart.com",
    secondaryEmail: "shahilmalikfn@gmail.com",
    gstin: "SDFLKJHSDOF908",
    bankDetails: {
      accountName: "accountname",
      bankName: "indusland",
      accountNumber: "23432432423",
      ifsc: "234ljkl",
    },
    paymentModes: [],
    paymentTerms: [],
  });

  // Employees
  const [employees, setEmployees] = useState<AdminEmployee[]>([]);

  // Invoices
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [invoiceDropdowns, setInvoiceDropdowns] = useState({
    clients: [] as { id: number; name: string }[],
    paymentModes: [] as { id: number; name: string }[],
    paymentTerms: [] as { id: number; name: string }[],
  });
  const [previewData, setPreviewData] = useState<{
    id: number | string;
    html: string;
  } | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Meta State
  const [metaTokens, setMetaTokens] = useState<MetaToken[]>([]);
  const [metaPages, setMetaPages] = useState<MetaPage[]>([]);
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false);
  const [metaStep, setMetaStep] = useState<1 | 2>(1);
  const [metaForm, setMetaForm] = useState({
    account_label: "",
    access_token: "",
    otp: "",
  });
  const [metaLoading, setMetaLoading] = useState(false);

  // Management Modals for Invoices
  const [isPaymentModeModalOpen, setIsPaymentModeModalOpen] = useState(false);
  const [newPaymentModeName, setNewPaymentModeName] = useState("");
  const [isPaymentTermModalOpen, setIsPaymentTermModalOpen] = useState(false);
  const [newPaymentTermName, setNewPaymentTermName] = useState("");

  // Clients
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [clientFilter, setClientFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Pipeline Data
  const [pipelineData, setPipelineData] = useState<
    Record<string, PipelinePost[]>
  >({});

  // --- STATE MANAGEMENT ---

  // Service Modal
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [newService, setNewService] = useState<{
    service_id: string;
    name: string;
    description: string;
    price: number | string;
    categoryId: string;
    hsn: string;
    isPipeline: boolean;
    pipelineConfig: PipelineConfigItem[];
  }>({
    service_id: "",
    name: "",
    description: "",
    price: "",
    categoryId: "",
    hsn: "",
    isPipeline: false,
    pipelineConfig: [{ prefix: "", count: 0 }],
  });
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);

  // Client Modal
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState({
    id: null as string | number | null,
    companyName: "",
    billingAddress: "",
    gstin: "",
    businessEmail: "",
    businessPhone: "",
    whatsappUpdates: true,
    contactPerson: {
      salutation: "Mr",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
  });
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // Employee Modal
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    salutation: "Mr",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "viewer",
  });
  const [editingEmployeeId, setEditingEmployeeId] = useState<
    string | number | null
  >(null);

  // Invoice State
  const [invoiceView, setInvoiceView] = useState<"list" | "create">("list");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("All");
  const [invoiceDateRange, setInvoiceDateRange] = useState({
    start: "",
    end: "",
  });
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  // Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(
    null
  );
  const [paymentAmountInput, setPaymentAmountInput] = useState<number>(0);

  // Client Details Modal
  const [selectedClientDetail, setSelectedClientDetail] =
    useState<AdminClient | null>(null);

  // Pipeline State
  const [selectedPipelineClient, setSelectedPipelineClient] =
    useState<string>("");
  const [draggedPostId, setDraggedPostId] = useState<string | number | null>(
    null
  );
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState<Partial<PipelinePost>>({
    title: "",
    platform: "instagram",
    dueDate: "",
    description: "",
    assignees: [],
  });

  // Post Detail / Edit Modal
  const [selectedPost, setSelectedPost] = useState<PipelinePost | null>(null);

  // Invoice Form State
  const emptyInvoiceState = {
    clientId: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    paymentMode: "",
    paymentTerms: "",
    gstPercentage: 0,
    items: [] as CreateInvoiceItem[],
  };
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoiceState);

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setCurrentUser(JSON.parse(userStr));
      }
    };
    fetchData();
  }, []);

  // Fetch Data when tabs active
  useEffect(() => {
    if (activeTab === "services") {
      fetchServicesAndCategories();
    } else if (activeTab === "employees") {
      fetchEmployees();
    } else if (activeTab === "clients") {
      fetchClients();
    } else if (activeTab === "invoices") {
      fetchInvoices();
      fetchInvoiceDropdowns();
      fetchServicesAndCategories();
    } else if (activeTab === "pipeline") {
      fetchClients();
      fetchPipeline();
    } else if (activeTab === "meta") {
      fetchMeta();
    }
  }, [activeTab]);

  const fetchServicesAndCategories = async () => {
    try {
      const [fetchedServices, fetchedCategories] = await Promise.all([
        api.services.list(),
        api.categories.list(),
      ]);
      setServices(fetchedServices);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("Failed to fetch services", error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await api.employee.list();
      const mapped = data.map((e: any) => ({
        id: e.id,
        name: `${e.salutation} ${e.first_name} ${e.last_name}`.trim(),
        email: e.email,
        phone: e.phone,
        role: e.type,
      }));
      setEmployees(mapped);
    } catch (e) {
      console.error("Failed to fetch employees", e);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await api.clients.list();
      const mapped = data.map((c: any) => ({
        id: c.id,
        businessName: c.company_name,
        contactName: `${c.contact_person?.salutation || ""} ${
          c.contact_person?.first_name
        } ${c.contact_person?.last_name}`.trim(),
        email: c.contact_person?.email,
        phone: c.contact_person?.phone,
        address: c.billing_address,
        gstin: c.gstin,
        isActive: true,
        pendingPayment: 0,
        businessDetails: {
          name: c.company_name,
          address: c.billing_address,
          gstin: c.gstin,
          hsn: "",
          email: c.business_email,
          phone: c.business_phone,
          whatsappConsent: c.whatsapp_updates,
        },
        contactDetails: {
          salutation: c.contact_person?.salutation,
          firstName: c.contact_person?.first_name,
          lastName: c.contact_person?.last_name,
          email: c.contact_person?.email,
          phone: c.contact_person?.phone,
          whatsappConsent: c.whatsapp_updates,
        },
      }));
      setClients(mapped);
    } catch (e) {
      console.error("Failed to fetch clients", e);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response: any = await api.invoice.list();
      const invoiceList = response.invoices || [];

      const mapped = invoiceList.map((inv: any) => {
        let total = inv.total_amount ? parseFloat(inv.total_amount) : 0;
        if ((!total || total === 0) && inv.items && inv.items.length > 0) {
          total = inv.items.reduce(
            (sum: number, item: any) => sum + parseFloat(item.line_total || 0),
            0
          );
        }

        return {
          id: inv.id,
          invoiceNumber: inv.invoice_id,
          date: inv.date,
          dueDate: inv.due_date || inv.date,
          clientId: inv.client?.id || "",
          clientName: inv.client
            ? `${inv.client.first_name || ""} ${
                inv.client.last_name || ""
              }`.trim()
            : "Unknown",
          clientAddress: "",
          items: inv.items || [],
          subTotal: total,
          taxTotal: parseFloat(inv.gst_amount || "0"),
          grandTotal: total,
          paidAmount: parseFloat(inv.paid_amount || "0"),
          status: inv.status
            ? inv.status.charAt(0).toUpperCase() + inv.status.slice(1)
            : "Unknown",
          authorizedBy: inv.authorized_by || "System",
        };
      });
      setInvoices(mapped);
    } catch (e) {
      console.error("Failed to fetch invoices", e);
    }
  };

  const fetchInvoiceDropdowns = async () => {
    try {
      const [clients, modes, terms] = await Promise.all([
        api.invoice.getDropdownClients(),
        api.invoice.getDropdownPaymentModes(),
        api.invoice.getDropdownPaymentTerms(),
      ]);
      setInvoiceDropdowns({
        clients: clients,
        paymentModes: modes,
        paymentTerms: terms,
      });
    } catch (e) {
      console.error("Failed to fetch dropdowns", e);
    }
  };

  const fetchPipeline = async () => {
    try {
      const items = await api.kanban.list();
      const grouped: Record<string, PipelinePost[]> = {};

      items.forEach((item: any) => {
        const cId =
          typeof item.client === "object" ? item.client.id : item.client;
        if (!cId) return;

        if (!grouped[cId]) grouped[cId] = [];
        grouped[cId].push({
          id: item.id,
          title: item.title,
          platform: item.platforms?.[0] || "instagram",
          status: mapBackendColumnToStatus(item.column),
          dueDate: item.due_date,
          description: item.description,
          assignees: item.assignees || [],
          thumbnail: item.thumbnail,
        });
      });
      setPipelineData(grouped);
    } catch (e) {
      console.error("Failed to fetch pipeline", e);
    }
  };

  const fetchMeta = async () => {
    try {
      const demoMode = localStorage.getItem("demoMode");
      if (demoMode) {
        setMetaTokens([
          {
            id: 2,
            account_label: "TDM tarviz 1",
            user_name: "Tdm Work",
            profile_picture:
              "https://scontent.fmaa3-2.fna.fbcdn.net/v/t1.30497-1/84628273_176159830277856_972693363922829312_nXg5HEK2noZSem5OML1ttCMySW2WHCGl061zhst2TgmS8aNvaL7Y_C71NGoYCgY4bmtrtuzpUTwJ=696BC419",
            status: "active",
            expires_at: "2026-02-16T23:11:56.487056Z",
            created_at: "2025-12-18T17:41:56.500800Z",
          },
        ]);
        setMetaPages([
          {
            account_label: "TDM tarviz 1",
            token_id: 2,
            fb_page_id: "906055075920800",
            fb_page_name: "Hotel Raaj Bhaavan",
            fb_page_picture:
              "https://scontent.fmaa3-3.fna.fbcdn.net/v/t39.30808-1/587104605_122164363166749862_POqL-0vA&_nc_tpa=Q5bMBQHvp-xn4dRCr869fI_iqS2Hsb-rrrRJA1-HbnrtvPjRp_aQkhrfomah15tSXYsIUU2_L1cLTj4FVw&oh=00_AflBQk_XyQEP9s8KmxfSYSTauyGXuUUdURgB0Piuf_VM9Q&oe=694A204E",
            ig_account_id: "17841478686508287",
          },
          {
            account_label: "TDM tarviz 1",
            token_id: 2,
            fb_page_id: "793090860558655",
            fb_page_name: "Sai Mayura TVS",
            fb_page_picture:
              "https://scontent.fmaa3-3.fna.fbcdn.net/v/t39.30808-1/549327586_122154197150749862_899594056",
            ig_account_id: "17841462826367548",
          },
        ]);
      } else {
        const [tokenRes, pageRes] = await Promise.all([
          api.meta.listTokens(),
          api.meta.listPages(),
        ]);
        setMetaTokens(tokenRes.tokens);
        setMetaPages(pageRes.pages);
      }
    } catch (e) {
      console.error("Meta fetch error", e);
    }
  };

  // --- ROLE HELPERS ---
  const isSuperOrManager = () =>
    ["superadmin", "manager", "admin"].includes(
      currentUser?.type || currentUser?.role
    );

  // --- HANDLERS: SERVICES & CATEGORIES ---

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const slug = newCategoryName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      await api.categories.create({ name: newCategoryName, slug });
      fetchServicesAndCategories();
      setNewCategoryName("");
    } catch (error: any) {
      setAdminMessage({ type: "error", text: error?.message || "Failed." });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm("Delete category?")) return;
    try {
      await api.categories.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (error: any) {
      setAdminMessage({ type: "error", text: error?.message || "Failed." });
    }
  };

  const handleAddService = async () => {
    if (!newService.categoryId) return;
    try {
      const payload = {
        service_id: newService.service_id,
        name: newService.name,
        description: newService.description,
        price: Number(newService.price),
        category: parseInt(newService.categoryId),
        hsn: newService.hsn,
        is_active: true,
        is_pipeline: newService.isPipeline,
        pipeline_config: newService.isPipeline ? newService.pipelineConfig : [],
      };
      if (editingServiceId)
        await api.services.update(editingServiceId, payload);
      else await api.services.create(payload);
      fetchServicesAndCategories();
      setIsServiceModalOpen(false);
      setNewService({
        service_id: "",
        name: "",
        description: "",
        price: "",
        categoryId: "",
        hsn: "",
        isPipeline: false,
        pipelineConfig: [{ prefix: "", count: 0 }],
      });
      setEditingServiceId(null);
    } catch (error: any) {
      setAdminMessage({ type: "error", text: error?.message || "Failed." });
    }
  };

  const handleEditService = (srv: BackendService) => {
    setNewService({
      service_id: srv.service_id,
      name: srv.name,
      description: srv.description || "",
      price: srv.price,
      categoryId: srv.category.id.toString(),
      hsn: srv.hsn || "",
      isPipeline: !!srv.is_pipeline,
      pipelineConfig:
        srv.pipeline_config && srv.pipeline_config.length > 0
          ? srv.pipeline_config
          : [{ prefix: "", count: 1 }],
    });
    setEditingServiceId(srv.id);
    setIsServiceModalOpen(true);
  };

  const deleteService = async (id: number) => {
    if (window.confirm("Delete service?")) {
      try {
        await api.services.delete(id);
        fetchServicesAndCategories();
      } catch (error: any) {
        setAdminMessage({ type: "error", text: error?.message || "Failed." });
      }
    }
  };

  const addPipelineRow = () => {
    setNewService((prev) => ({
      ...prev,
      pipelineConfig: [...prev.pipelineConfig, { prefix: "", count: 1 }],
    }));
  };

  const removePipelineRow = (index: number) => {
    setNewService((prev) => {
      const newCfg = [...prev.pipelineConfig];
      newCfg.splice(index, 1);
      return { ...prev, pipelineConfig: newCfg };
    });
  };

  const updatePipelineRow = (
    index: number,
    field: "prefix" | "count",
    value: string | number
  ) => {
    setNewService((prev) => {
      const newCfg = [...prev.pipelineConfig];
      newCfg[index] = { ...newCfg[index], [field]: value };
      return { ...prev, pipelineConfig: newCfg };
    });
  };

  // --- HANDLERS: PAYMENT MODES & TERMS ---

  const handleAddPaymentMode = async () => {
    if (!newPaymentModeName.trim()) return;
    try {
      await api.invoice.createPaymentMode({ name: newPaymentModeName });
      setNewPaymentModeName("");
      fetchInvoiceDropdowns();
    } catch (e: any) {
      setAdminMessage({ type: "error", text: e?.message || "Failed." });
    }
  };

  const handleDeletePaymentMode = async (id: number) => {
    if (!window.confirm("Delete mode?")) return;
    try {
      await api.invoice.deletePaymentMode(id);
      fetchInvoiceDropdowns();
    } catch (e: any) {
      setAdminMessage({ type: "error", text: e?.message || "Failed." });
    }
  };

  const handleAddPaymentTerm = async () => {
    if (!newPaymentTermName.trim()) return;
    try {
      await api.invoice.createPaymentTerm({ name: newPaymentTermName });
      setNewPaymentTermName("");
      fetchInvoiceDropdowns();
    } catch (e: any) {
      setAdminMessage({ type: "error", text: e?.message || "Failed." });
    }
  };

  const handleDeletePaymentTerm = async (id: number) => {
    if (!window.confirm("Delete term?")) return;
    try {
      await api.invoice.deletePaymentTerm(id);
      fetchInvoiceDropdowns();
    } catch (e: any) {
      setAdminMessage({ type: "error", text: e?.message || "Failed." });
    }
  };

  // --- HANDLERS: META INTEGRATION ---

  const handleStartAddToken = async () => {
    setMetaLoading(true);
    try {
      await api.meta.sendTokenOtp();
      setMetaStep(2);
    } catch (e: any) {
      setAdminMessage({
        type: "error",
        text: `Error sending OTP: ${e?.message || "Failed."}`,
      });
    } finally {
      setMetaLoading(false);
    }
  };

  const handleConfirmAddToken = async () => {
    if (!metaForm.access_token || !metaForm.otp || !metaForm.account_label) {
      setAdminMessage({ type: "error", text: "All fields are required." });
      return;
    }
    setMetaLoading(true);
    try {
      await api.meta.createToken(metaForm);
      setAdminMessage({
        type: "success",
        text: "Meta Token integrated successfully!",
      });
      setIsMetaModalOpen(false);
      setMetaStep(1);
      setMetaForm({ account_label: "", access_token: "", otp: "" });
      fetchMeta();
    } catch (e: any) {
      setAdminMessage({
        type: "error",
        text: `Error adding token: ${e?.message || "Failed."}`,
      });
    } finally {
      setMetaLoading(false);
    }
  };

  // --- HANDLERS: CLIENTS ---

  const openCreateClientModal = () => {
    setEditingClientId(null);
    setClientForm({
      id: null,
      companyName: "",
      billingAddress: "",
      gstin: "",
      businessEmail: "",
      businessPhone: "",
      whatsappUpdates: true,
      contactPerson: {
        salutation: "Mr",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      },
    });
    setIsClientModalOpen(true);
  };

  const openEditClientModal = (c: AdminClient) => {
    setEditingClientId(c.id);
    setClientForm({
      id: c.id,
      companyName: c.businessDetails?.name || c.businessName || "",
      billingAddress: c.businessDetails?.address || c.address || "",
      gstin: c.businessDetails?.gstin || c.gstin || "",
      businessEmail: c.businessDetails?.email || "",
      businessPhone: c.businessDetails?.phone || "",
      whatsappUpdates: !!c.businessDetails?.whatsappConsent,
      contactPerson: {
        salutation: c.contactDetails?.salutation || "Mr",
        firstName: c.contactDetails?.firstName || "",
        lastName: c.contactDetails?.lastName || "",
        email: c.contactDetails?.email || c.email || "",
        phone: c.contactDetails?.phone || c.phone || "",
      },
    });
    setIsClientModalOpen(true);
  };

  const handleSaveClient = async () => {
    if (!clientForm.companyName.trim()) {
      setAdminMessage({ type: "error", text: "Company name is required." });
      return;
    }
    if (
      !clientForm.contactPerson.firstName ||
      !clientForm.contactPerson.lastName
    ) {
      setAdminMessage({
        type: "error",
        text: "Contact first/last name is required.",
      });
      return;
    }
    if (!clientForm.contactPerson.email) {
      setAdminMessage({ type: "error", text: "Contact email is required." });
      return;
    }

    const payload: any = {
      company_name: clientForm.companyName,
      billing_address: clientForm.billingAddress,
      gstin: clientForm.gstin,
      business_email: clientForm.businessEmail,
      business_phone: clientForm.businessPhone,
      whatsapp_updates: clientForm.whatsappUpdates,
      contact_person: {
        salutation: clientForm.contactPerson.salutation,
        first_name: clientForm.contactPerson.firstName,
        last_name: clientForm.contactPerson.lastName,
        email: clientForm.contactPerson.email,
        phone: clientForm.contactPerson.phone,
      },
    };

    try {
      if (editingClientId) {
        await api.clients.update(editingClientId, payload);
      } else {
        await api.clients.create(payload);
      }
      setIsClientModalOpen(false);
      fetchClients();
      setAdminMessage({ type: "success", text: "Client saved." });
    } catch (e: any) {
      setAdminMessage({
        type: "error",
        text: e?.message || "Failed to save client.",
      });
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm("Delete client?")) return;
    try {
      await api.clients.delete(id);
      fetchClients();
      setAdminMessage({ type: "success", text: "Client deleted." });
    } catch (e: any) {
      setAdminMessage({
        type: "error",
        text: e?.message || "Failed to delete client.",
      });
    }
  };

  // --- HANDLERS: EMPLOYEES ---

  const openCreateEmployeeModal = () => {
    setEditingEmployeeId(null);
    setEmployeeForm({
      salutation: "Mr",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "viewer",
    });
    setIsEmployeeModalOpen(true);
  };

  const openEditEmployeeModal = (emp: AdminEmployee) => {
    setEditingEmployeeId(emp.id);
    // best-effort split name
    const parts = (emp.name || "").trim().split(/\s+/);
    const salutation = ["Mr", "Mrs", "Ms", "Dr"].includes(parts[0])
      ? parts[0]
      : "Mr";
    const firstName = salutation === parts[0] ? parts[1] || "" : parts[0] || "";
    const lastName =
      salutation === parts[0]
        ? parts.slice(2).join(" ")
        : parts.slice(1).join(" ");
    setEmployeeForm({
      salutation,
      firstName,
      lastName,
      email: emp.email,
      phone: emp.phone,
      role: emp.role,
    });
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async () => {
    if (
      !employeeForm.firstName ||
      !employeeForm.lastName ||
      !employeeForm.email
    ) {
      setAdminMessage({ type: "error", text: "Name and email are required." });
      return;
    }
    const payload: any = {
      salutation: employeeForm.salutation,
      first_name: employeeForm.firstName,
      last_name: employeeForm.lastName,
      email: employeeForm.email,
      phone: employeeForm.phone,
      type: employeeForm.role,
    };
    try {
      if (editingEmployeeId) {
        await api.employee.update(editingEmployeeId, payload);
      } else {
        await api.employee.create(payload);
      }
      setIsEmployeeModalOpen(false);
      fetchEmployees();
      setAdminMessage({ type: "success", text: "Employee saved." });
    } catch (e: any) {
      setAdminMessage({
        type: "error",
        text: e?.message || "Failed to save employee.",
      });
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm("Delete employee?")) return;
    try {
      await api.employee.delete(id);
      fetchEmployees();
      setAdminMessage({ type: "success", text: "Employee deleted." });
    } catch (e: any) {
      setAdminMessage({
        type: "error",
        text: e?.message || "Failed to delete employee.",
      });
    }
  };

  const handleCreateInvoice = async () => {
    if (
      !invoiceForm.clientId ||
      !invoiceForm.paymentMode ||
      !invoiceForm.paymentTerms ||
      invoiceForm.items.length === 0
    ) {
      setAdminMessage({ type: "error", text: "Fill all required fields." });
      return;
    }
    const payload = {
      client: parseInt(invoiceForm.clientId),
      payment_mode: parseInt(invoiceForm.paymentMode),
      payment_term: parseInt(invoiceForm.paymentTerms),
      gst_percentage: invoiceForm.gstPercentage,
      items: invoiceForm.items.map((item) => ({
        service: item.servicePk,
        description: item.description || item.name,
        unit_price: item.price.toString(),
        quantity: item.quantity,
      })),
    };
    try {
      await api.invoice.create(payload);
      setInvoiceView("list");
      setInvoiceForm(emptyInvoiceState);
      fetchInvoices();
    } catch (e: any) {
      setAdminMessage({ type: "error", text: e?.message || "Failed." });
    }
  };

  const handlePreviewInvoice = async (id: number | string) => {
    try {
      const data = await api.invoice.preview(id);
      setPreviewData(data);
      setIsPreviewModalOpen(true);
    } catch (e: any) {
      setAdminMessage({
        type: "error",
        text: `Failed to preview: ${e?.message || "Failed."}`,
      });
    }
  };

  const handleDownloadInvoice = async (
    id: number | string,
    invoiceNo?: string
  ) => {
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
      setAdminMessage({
        type: "error",
        text: e?.message || "Failed to download.",
      });
    }
  };

  const calculateInvoiceTotals = () => {
    const subTotal = invoiceForm.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const taxTotal = subTotal * (invoiceForm.gstPercentage / 100);
    const grandTotal = subTotal + taxTotal;
    return { subTotal, taxTotal, grandTotal };
  };

  const updateInvoiceItem = (
    index: number,
    field: keyof CreateInvoiceItem,
    value: any
  ) => {
    const newItems = [...invoiceForm.items];
    const item = { ...newItems[index] };
    if (field === "servicePk") {
      const service = services.find((s) => s.id === parseInt(value));
      if (service) {
        item.servicePk = service.id;
        item.serviceId = service.service_id;
        item.name = service.name;
        item.description = service.description || "";
        item.hsn = service.hsn || "";
        item.price = Number(service.price);
      }
    } else {
      (item as any)[field] = value;
    }
    const basePrice = Number(item.price) * Number(item.quantity);
    item.total =
      basePrice + basePrice * (Number(invoiceForm.gstPercentage) / 100);
    newItems[index] = item;
    setInvoiceForm((prev) => ({ ...prev, items: newItems }));
  };

  const handleLogoutAction = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-100 text-emerald-700";
      case "Partially Paid":
        return "bg-amber-100 text-amber-700";
      case "Overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
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

  const filteredInvoices = invoices.filter((inv) =>
    inv.clientName.toLowerCase().includes(invoiceSearch.toLowerCase())
  );
  const filteredServices = services.filter(
    (srv) => categoryFilter === "All" || srv.category?.name === categoryFilter
  );

  const toggleInvoiceSelection = (id: string) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDownload = () => {
    if (selectedInvoiceIds.length === 0) return;
    setAdminMessage({
      type: "success",
      text: `Selected ${selectedInvoiceIds.length} invoices. Bulk ZIP download is not implemented yet.`,
    });
  };

  const handlePipelineDragStart = (
    e: React.DragEvent,
    postId: string | number
  ) => {
    setDraggedPostId(postId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handlePipelineDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handlePipelineDrop = async (
    e: React.DragEvent,
    status: PipelineStatus
  ) => {
    e.preventDefault();
    if (!draggedPostId || !selectedPipelineClient) return;

    setPipelineData((prev) => ({
      ...prev,
      [selectedPipelineClient]: prev[selectedPipelineClient].map((post) =>
        post.id === draggedPostId ? { ...post, status } : post
      ),
    }));

    try {
      await api.kanban.move(
        Number(draggedPostId),
        mapStatusToBackendColumn(status)
      );
    } catch (e) {
      console.error("Failed to move item", e);
    }

    setDraggedPostId(null);
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col fixed h-full z-10 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white">
            Tarviz<span className="text-[#FF6B6B]">Admin</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Internal Dashboard</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 pb-4">
          <button
            onClick={() => setActiveTab("pipeline")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === "pipeline"
                ? "bg-[#FF6B6B] text-white"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            <Kanban size={20} /> Content Pipeline
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === "clients"
                ? "bg-[#FF6B6B] text-white"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            <UserCircle size={20} /> Clients
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === "invoices"
                ? "bg-[#FF6B6B] text-white"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            <FileSpreadsheet size={20} /> Invoices
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === "services"
                ? "bg-[#FF6B6B] text-white"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            <Briefcase size={20} /> Services
          </button>
          <button
            onClick={() => setActiveTab("employees")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === "employees"
                ? "bg-[#FF6B6B] text-white"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            <Users size={20} /> Employees
          </button>
          <button
            onClick={() => setActiveTab("meta")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === "meta"
                ? "bg-[#FF6B6B] text-white"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            <Share2 size={20} /> Integrate Meta
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === "settings"
                ? "bg-[#FF6B6B] text-white"
                : "text-slate-400 hover:bg-white/5"
            }`}
          >
            <Building size={20} /> Company Profile
          </button>
        </nav>
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogoutAction}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-64 p-8 overflow-y-auto min-h-screen">
        {adminMessage && (
          <div
            className={`mb-6 rounded-2xl px-5 py-3 border text-sm font-medium ${
              adminMessage.type === "error"
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            {adminMessage.text}
          </div>
        )}
        {/* PIPELINE TAB */}
        {activeTab === "pipeline" && (
          <div className="h-full flex flex-col animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Content Pipeline
                </h2>
                <p className="text-slate-500 text-sm">
                  Manage client social media workflows
                </p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  className="p-2 border border-gray-300 bg-white rounded-lg outline-none min-w-[250px] focus:border-[#6C5CE7]"
                  value={selectedPipelineClient}
                  onChange={(e) => setSelectedPipelineClient(e.target.value)}
                >
                  <option value="">-- Select Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.businessName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedPipelineClient ? (
              <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
                <div className="flex h-full gap-4 min-w-[1600px]">
                  {PIPELINE_COLUMNS.map((column) => {
                    let posts =
                      pipelineData[selectedPipelineClient]?.filter(
                        (p) => p.status === column.id
                      ) || [];
                    return (
                      <div
                        key={column.id}
                        className={`flex flex-col w-72 min-h-[500px] rounded-2xl bg-white border-t-4 ${column.color} shadow-sm border-x border-b border-gray-200`}
                        onDragOver={handlePipelineDragOver}
                        onDrop={(e) => handlePipelineDrop(e, column.id)}
                      >
                        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                          <h3 className="font-bold text-sm text-slate-700">
                            {column.label}
                          </h3>
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full text-xs font-bold text-slate-500">
                            {posts.length}
                          </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                          {posts.map((post) => (
                            <div
                              key={post.id}
                              draggable
                              onDragStart={(e) =>
                                handlePipelineDragStart(e, post.id)
                              }
                              onClick={() => setSelectedPost(post)}
                              className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer active:cursor-grabbing group relative"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-600">
                                  {getPlatformIcon(post.platform)}
                                </div>
                                {post.status === "scheduled" && (
                                  <CheckCircle2
                                    size={16}
                                    className="text-emerald-500"
                                  />
                                )}
                              </div>
                              <h4 className="font-bold text-slate-800 text-sm mb-3 leading-snug">
                                {post.title}
                              </h4>
                              {post.thumbnail && (
                                <div className="w-full h-24 mb-3 rounded-lg overflow-hidden bg-slate-100 relative">
                                  <img
                                    src={post.thumbnail}
                                    alt="preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  <span>{post.dueDate}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                <Kanban size={48} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  Select a client to view their content pipeline
                </p>
              </div>
            )}
          </div>
        )}

        {/* CLIENTS TAB */}
        {activeTab === "clients" && (
          <div className="space-y-6 animate-in fade-in duration-300 pb-12">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800">
                  Clients
                </h2>
                <p className="text-slate-500">
                  Create and manage client accounts.
                </p>
              </div>
              <button
                onClick={openCreateClientModal}
                className="bg-[#0F172A] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 font-bold shadow-lg transition-all"
              >
                <Plus size={20} /> Add Client
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
              <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search clients..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value as any)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {clients
                  .filter(
                    (c) =>
                      (clientFilter === "all" ||
                        (clientFilter === "active"
                          ? c.isActive
                          : !c.isActive)) &&
                      `${c.businessName} ${c.contactName} ${c.email}`
                        .toLowerCase()
                        .includes(clientSearch.toLowerCase())
                  )
                  .map((c) => (
                    <div
                      key={c.id}
                      className="p-5 flex items-start justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {c.businessName}
                        </div>
                        <div className="text-sm text-slate-500 truncate">
                          {c.contactName}
                        </div>
                        <div className="mt-2 text-xs text-slate-500 flex flex-wrap gap-3">
                          <span className="inline-flex items-center gap-1">
                            <Mail size={14} /> {c.email || "—"}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Phone size={14} /> {c.phone || "—"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => setSelectedClientDetail(c)}
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1"
                        >
                          <Eye size={16} /> View
                        </button>
                        <button
                          onClick={() => openEditClientModal(c)}
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1"
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClient(c.id)}
                          className="px-3 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs flex items-center gap-1"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                {clients.length === 0 && (
                  <div className="p-12 text-center text-slate-400">
                    <UserCircle size={44} className="mx-auto mb-3 opacity-40" />
                    No clients yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === "services" && (
          <div className="space-y-6 animate-in fade-in duration-300 pb-12">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800">
                  Services
                </h2>
                <p className="text-slate-500">
                  Manage service catalog and categories.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-50"
                >
                  Manage Categories
                </button>
                <button
                  onClick={() => {
                    setEditingServiceId(null);
                    setNewService({
                      service_id: "",
                      name: "",
                      description: "",
                      price: "",
                      categoryId: "",
                      hsn: "",
                      isPipeline: false,
                      pipelineConfig: [{ prefix: "", count: 0 }],
                    });
                    setIsServiceModalOpen(true);
                  }}
                  className="bg-[#0F172A] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 font-bold shadow-lg transition-all"
                >
                  <Plus size={20} /> Add Service
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <Filter size={16} />
                <span>Category:</span>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="All">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {filteredServices.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-5 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {srv.name}
                      </div>
                      <div className="text-sm text-slate-500 truncate">
                        {srv.category?.name || "—"}
                      </div>
                      <div className="mt-2 text-xs text-slate-500 flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Tag size={14} /> {srv.service_id}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <DollarSign size={14} /> {srv.price}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditService(srv)}
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1"
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                      <button
                        onClick={() => deleteService(srv.id)}
                        className="px-3 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs flex items-center gap-1"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
                {services.length === 0 && (
                  <div className="p-12 text-center text-slate-400">
                    <Briefcase size={44} className="mx-auto mb-3 opacity-40" />
                    No services yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EMPLOYEES TAB */}
        {activeTab === "employees" && (
          <div className="space-y-6 animate-in fade-in duration-300 pb-12">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800">
                  Employees
                </h2>
                <p className="text-slate-500">Manage internal team accounts.</p>
              </div>
              <button
                onClick={openCreateEmployeeModal}
                className="bg-[#0F172A] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 font-bold shadow-lg transition-all"
              >
                <Plus size={20} /> Add Employee
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {employees.map((e) => (
                  <div
                    key={e.id}
                    className="p-5 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {e.name}
                      </div>
                      <div className="text-sm text-slate-500 truncate">
                        {e.role}
                      </div>
                      <div className="mt-2 text-xs text-slate-500 flex flex-wrap gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Mail size={14} /> {e.email || "—"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone size={14} /> {e.phone || "—"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openEditEmployeeModal(e)}
                        className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1"
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(e.id)}
                        className="px-3 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs flex items-center gap-1"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
                {employees.length === 0 && (
                  <div className="p-12 text-center text-slate-400">
                    <Users size={44} className="mx-auto mb-3 opacity-40" />
                    No employees yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === "invoices" && (
          <div className="space-y-6 animate-in fade-in duration-300 pb-12">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800">
                  Invoices
                </h2>
                <p className="text-slate-500">
                  Create invoices and track payments.
                </p>
              </div>
              {invoiceView === "list" ? (
                <button
                  onClick={() => setInvoiceView("create")}
                  className="bg-[#0F172A] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 font-bold shadow-lg transition-all"
                >
                  <Plus size={20} /> Create Invoice
                </button>
              ) : (
                <button
                  onClick={() => setInvoiceView("list")}
                  className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50"
                >
                  Back to List
                </button>
              )}
            </div>

            {invoiceView === "list" ? (
              <>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                  <div className="relative flex-1">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <input
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      placeholder="Search by client name..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <button
                    onClick={handleBulkDownload}
                    className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Download size={18} /> Bulk Download
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="divide-y divide-slate-100">
                    {filteredInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-5 flex items-start justify-between gap-4"
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => toggleInvoiceSelection(inv.id)}
                            className="mt-1 text-slate-500 hover:text-slate-700"
                            title="Select"
                          >
                            {selectedInvoiceIds.includes(inv.id) ? (
                              <CheckSquare size={20} />
                            ) : (
                              <Square size={20} />
                            )}
                          </button>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {inv.invoiceNumber} — {inv.clientName}
                            </div>
                            <div className="mt-1 text-xs text-slate-500 flex flex-wrap gap-3">
                              <span className="inline-flex items-center gap-1">
                                <Calendar size={14} /> {inv.date}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(
                                  inv.status
                                )}`}
                              >
                                {inv.status}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <DollarSign size={14} /> {inv.grandTotal}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handlePreviewInvoice(Number(inv.id))}
                            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1"
                          >
                            <Eye size={16} /> Preview
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadInvoice(
                                Number(inv.id),
                                inv.invoiceNumber
                              )
                            }
                            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1"
                          >
                            <Download size={16} /> PDF
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredInvoices.length === 0 && (
                      <div className="p-12 text-center text-slate-400">
                        <FileSpreadsheet
                          size={44}
                          className="mx-auto mb-3 opacity-40"
                        />
                        No invoices.
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Client
                    </label>
                    <select
                      value={invoiceForm.clientId}
                      onChange={(e) =>
                        setInvoiceForm((p) => ({
                          ...p,
                          clientId: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="">-- Select Client --</option>
                      {invoiceDropdowns.clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      GST %
                    </label>
                    <input
                      type="number"
                      value={invoiceForm.gstPercentage}
                      onChange={(e) =>
                        setInvoiceForm((p) => ({
                          ...p,
                          gstPercentage: Number(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Payment Mode
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={invoiceForm.paymentMode}
                        onChange={(e) =>
                          setInvoiceForm((p) => ({
                            ...p,
                            paymentMode: e.target.value,
                          }))
                        }
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      >
                        <option value="">-- Select --</option>
                        {invoiceDropdowns.paymentModes.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setIsPaymentModeModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold"
                        type="button"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Payment Terms
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={invoiceForm.paymentTerms}
                        onChange={(e) =>
                          setInvoiceForm((p) => ({
                            ...p,
                            paymentTerms: e.target.value,
                          }))
                        }
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      >
                        <option value="">-- Select --</option>
                        {invoiceDropdowns.paymentTerms.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setIsPaymentTermModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold"
                        type="button"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-slate-800">Items</h3>
                    <button
                      onClick={() =>
                        setInvoiceForm((p) => ({
                          ...p,
                          items: [
                            ...p.items,
                            {
                              serviceId: "",
                              name: "",
                              description: "",
                              hsn: "",
                              quantity: 1,
                              price: 0,
                              taxRate: 0,
                              total: 0,
                            } as CreateInvoiceItem,
                          ],
                        }))
                      }
                      className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 flex items-center gap-2"
                      type="button"
                    >
                      <Plus size={16} /> Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {invoiceForm.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="grid md:grid-cols-5 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4"
                      >
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            Service
                          </label>
                          <select
                            value={(item as any).servicePk || ""}
                            onChange={(e) =>
                              updateInvoiceItem(
                                idx,
                                "servicePk" as any,
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                          >
                            <option value="">-- Select Service --</option>
                            {services.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            Qty
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateInvoiceItem(
                                idx,
                                "quantity",
                                Number(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                            Unit Price
                          </label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                              updateInvoiceItem(
                                idx,
                                "price",
                                Number(e.target.value)
                              )
                            }
                            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                          />
                        </div>
                        <div className="flex items-end justify-between gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                              Total
                            </label>
                            <div className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">
                              {Number(item.total || 0).toFixed(2)}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setInvoiceForm((p) => ({
                                ...p,
                                items: p.items.filter((_, i) => i !== idx),
                              }))
                            }
                            className="p-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                            title="Remove"
                            type="button"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleCreateInvoice}
                      className="bg-[#6C5CE7] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#5a4ad1] shadow-lg shadow-violet-200 flex items-center gap-2"
                    >
                      <Save size={18} /> Create Invoice
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* META INTEGRATION TAB */}
        {activeTab === "meta" && (
          <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-800">
                  Meta Integration
                </h2>
                <p className="text-slate-500">
                  Manage Facebook & Instagram account access tokens.
                </p>
              </div>
              <button
                onClick={() => setIsMetaModalOpen(true)}
                className="bg-[#0F172A] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 font-bold shadow-lg transition-all"
              >
                <Plus size={20} /> Add Access Token
              </button>
            </div>

            {/* Tokens Section */}
            <section>
              <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                <Key size={18} className="text-[#6C5CE7]" /> Integrated Tokens
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metaTokens.map((token) => (
                  <div
                    key={token.id}
                    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          token.status === "active"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-red-50 text-red-600 border border-red-100"
                        }`}
                      >
                        {token.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-50 shadow-inner bg-slate-100 flex-shrink-0">
                        <img
                          src={token.profile_picture}
                          alt={token.user_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 leading-tight">
                          {token.account_label}
                        </h4>
                        <p className="text-xs text-slate-400 font-medium">
                          User: {token.user_name}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-slate-50">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span>Created At</span>
                        <span className="text-slate-600">
                          {new Date(token.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span>Expires At</span>
                        <span className="text-slate-600">
                          {new Date(token.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {metaTokens.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <Key
                      size={48}
                      className="mx-auto mb-4 text-slate-300 opacity-50"
                    />
                    <p className="text-slate-400 font-medium">
                      No tokens integrated yet.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Pages Section */}
            <section>
              <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
                <FbIcon size={18} className="text-blue-600" /> Linked Pages & IG
                Accounts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metaPages.map((page) => (
                  <div
                    key={page.fb_page_id}
                    className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-50">
                        <img
                          src={page.fb_page_picture}
                          alt={page.fb_page_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate">
                          {page.fb_page_name}
                        </h4>
                        <p className="text-[10px] font-bold text-[#6C5CE7] uppercase tracking-widest">
                          {page.account_label}
                        </p>
                      </div>
                      <div className="flex -space-x-1">
                        <div
                          className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-white"
                          title="Facebook Page"
                        >
                          <FbIcon size={12} />
                        </div>
                        {page.ig_account_id && (
                          <div
                            className="w-6 h-6 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center border border-white"
                            title="Instagram Linked"
                          >
                            <Instagram size={12} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl pb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-800">
                Company Profile
              </h2>
              <p className="text-slate-500">
                Master settings for Tarviz Digimart agency details.
              </p>
            </div>
            <div className="grid gap-8">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Building size={20} className="text-[#FF6B6B]" />
                  <h3 className="font-bold text-slate-800">
                    General Information
                  </h3>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Agency Name
                      </label>
                      <input
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        value={companyDetails.name}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        GSTIN
                      </label>
                      <input
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        value={companyDetails.gstin}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            gstin: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Primary Email
                      </label>
                      <input
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        value={companyDetails.email}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Secondary Email
                      </label>
                      <input
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        value={companyDetails.secondaryEmail}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            secondaryEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Contact Phone
                      </label>
                      <input
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        value={companyDetails.phone}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Address
                      </label>
                      <textarea
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                        rows={2}
                        value={companyDetails.address}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Landmark size={20} className="text-blue-500" />
                  <h3 className="font-bold text-slate-800">
                    Bank Account Details
                  </h3>
                </div>
                <div className="p-8 space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Account Name
                      </label>
                      <input
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        value={companyDetails.bankDetails.accountName}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            bankDetails: {
                              ...companyDetails.bankDetails,
                              accountName: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Bank Name
                      </label>
                      <input
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        value={companyDetails.bankDetails.bankName}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            bankDetails: {
                              ...companyDetails.bankDetails,
                              bankName: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Account Number
                      </label>
                      <input
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        value={companyDetails.bankDetails.accountNumber}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            bankDetails: {
                              ...companyDetails.bankDetails,
                              accountNumber: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        IFSC Code
                      </label>
                      <input
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        value={companyDetails.bankDetails.ifsc}
                        onChange={(e) =>
                          setCompanyDetails({
                            ...companyDetails,
                            bankDetails: {
                              ...companyDetails.bankDetails,
                              ifsc: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button className="bg-[#6C5CE7] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#5a4ad1] shadow-lg shadow-violet-200 flex items-center gap-2">
                  <Save size={18} /> Update Company Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CLIENT MODAL */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <UserCircle size={20} className="text-[#6C5CE7]" />
                {editingClientId ? "Edit Client" : "Add Client"}
              </h3>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Company Name
                  </label>
                  <input
                    value={clientForm.companyName}
                    onChange={(e) =>
                      setClientForm((p) => ({
                        ...p,
                        companyName: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    GSTIN
                  </label>
                  <input
                    value={clientForm.gstin}
                    onChange={(e) =>
                      setClientForm((p) => ({ ...p, gstin: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Billing Address
                  </label>
                  <textarea
                    rows={2}
                    value={clientForm.billingAddress}
                    onChange={(e) =>
                      setClientForm((p) => ({
                        ...p,
                        billingAddress: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Business Email
                  </label>
                  <input
                    value={clientForm.businessEmail}
                    onChange={(e) =>
                      setClientForm((p) => ({
                        ...p,
                        businessEmail: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Business Phone
                  </label>
                  <input
                    value={clientForm.businessPhone}
                    onChange={(e) =>
                      setClientForm((p) => ({
                        ...p,
                        businessPhone: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <h4 className="font-bold text-slate-800 mb-4">
                  Contact Person
                </h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Salutation
                    </label>
                    <select
                      value={clientForm.contactPerson.salutation}
                      onChange={(e) =>
                        setClientForm((p) => ({
                          ...p,
                          contactPerson: {
                            ...p.contactPerson,
                            salutation: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="Mr">Mr</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Dr">Dr</option>
                    </select>
                  </div>
                  <div />
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      First Name
                    </label>
                    <input
                      value={clientForm.contactPerson.firstName}
                      onChange={(e) =>
                        setClientForm((p) => ({
                          ...p,
                          contactPerson: {
                            ...p.contactPerson,
                            firstName: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Last Name
                    </label>
                    <input
                      value={clientForm.contactPerson.lastName}
                      onChange={(e) =>
                        setClientForm((p) => ({
                          ...p,
                          contactPerson: {
                            ...p.contactPerson,
                            lastName: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Email
                    </label>
                    <input
                      value={clientForm.contactPerson.email}
                      onChange={(e) =>
                        setClientForm((p) => ({
                          ...p,
                          contactPerson: {
                            ...p.contactPerson,
                            email: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Phone
                    </label>
                    <input
                      value={clientForm.contactPerson.phone}
                      onChange={(e) =>
                        setClientForm((p) => ({
                          ...p,
                          contactPerson: {
                            ...p.contactPerson,
                            phone: e.target.value,
                          },
                        }))
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClient}
                className="bg-[#6C5CE7] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5a4ad1]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLIENT DETAILS MODAL */}
      {selectedClientDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Eye size={20} className="text-[#6C5CE7]" /> Client Details
              </h3>
              <button
                onClick={() => setSelectedClientDetail(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="font-bold text-slate-900 text-lg">
                {selectedClientDetail.businessName}
              </div>
              <div className="text-sm text-slate-500">
                {selectedClientDetail.address || ""}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Contact
                  </div>
                  <div className="font-bold text-slate-800">
                    {selectedClientDetail.contactName}
                  </div>
                  <div className="mt-2 text-slate-600 flex items-center gap-2">
                    <Mail size={14} /> {selectedClientDetail.email || "—"}
                  </div>
                  <div className="mt-1 text-slate-600 flex items-center gap-2">
                    <Phone size={14} /> {selectedClientDetail.phone || "—"}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Business
                  </div>
                  <div className="mt-1 text-slate-600 flex items-center gap-2">
                    <MapPin size={14} /> {selectedClientDetail.address || "—"}
                  </div>
                  <div className="mt-1 text-slate-600 flex items-center gap-2">
                    <FileText size={14} /> {selectedClientDetail.gstin || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYEE MODAL */}
      {isEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Users size={20} className="text-[#6C5CE7]" />
                {editingEmployeeId ? "Edit Employee" : "Add Employee"}
              </h3>
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Salutation
                  </label>
                  <select
                    value={employeeForm.salutation}
                    onChange={(e) =>
                      setEmployeeForm((p) => ({
                        ...p,
                        salutation: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="Mr">Mr</option>
                    <option value="Mrs">Mrs</option>
                    <option value="Ms">Ms</option>
                    <option value="Dr">Dr</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Role
                  </label>
                  <select
                    value={employeeForm.role}
                    onChange={(e) =>
                      setEmployeeForm((p) => ({ ...p, role: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="superadmin">superadmin</option>
                    <option value="manager">manager</option>
                    <option value="admin">admin</option>
                    <option value="content_writer">content_writer</option>
                    <option value="designer">designer</option>
                    <option value="viewer">viewer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    First Name
                  </label>
                  <input
                    value={employeeForm.firstName}
                    onChange={(e) =>
                      setEmployeeForm((p) => ({
                        ...p,
                        firstName: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Last Name
                  </label>
                  <input
                    value={employeeForm.lastName}
                    onChange={(e) =>
                      setEmployeeForm((p) => ({
                        ...p,
                        lastName: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Email
                  </label>
                  <input
                    value={employeeForm.email}
                    onChange={(e) =>
                      setEmployeeForm((p) => ({ ...p, email: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Phone
                  </label>
                  <input
                    value={employeeForm.phone}
                    onChange={(e) =>
                      setEmployeeForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button
                onClick={() => setIsEmployeeModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEmployee}
                className="bg-[#6C5CE7] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5a4ad1]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Briefcase size={20} className="text-[#6C5CE7]" />
                {editingServiceId ? "Edit Service" : "Add Service"}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Service ID
                  </label>
                  <input
                    value={newService.service_id}
                    onChange={(e) =>
                      setNewService((p) => ({
                        ...p,
                        service_id: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Category
                  </label>
                  <select
                    value={newService.categoryId}
                    onChange={(e) =>
                      setNewService((p) => ({
                        ...p,
                        categoryId: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="">-- Select --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Name
                  </label>
                  <input
                    value={newService.name}
                    onChange={(e) =>
                      setNewService((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={newService.price}
                    onChange={(e) =>
                      setNewService((p) => ({ ...p, price: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={newService.description}
                    onChange={(e) =>
                      setNewService((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    HSN
                  </label>
                  <input
                    value={newService.hsn}
                    onChange={(e) =>
                      setNewService((p) => ({ ...p, hsn: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
                <div className="flex items-end gap-3">
                  <label className="flex items-center gap-2 font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={newService.isPipeline}
                      onChange={(e) =>
                        setNewService((p) => ({
                          ...p,
                          isPipeline: e.target.checked,
                        }))
                      }
                    />
                    Pipeline Service
                  </label>
                </div>
              </div>

              {newService.isPipeline && (
                <div className="border-t border-slate-100 pt-5">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-800">
                      Pipeline Config
                    </h4>
                    <button
                      onClick={addPipelineRow}
                      className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 flex items-center gap-2"
                      type="button"
                    >
                      <Plus size={16} /> Add Row
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newService.pipelineConfig.map((row, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-5 gap-2 items-center"
                      >
                        <input
                          value={row.prefix}
                          onChange={(e) =>
                            updatePipelineRow(idx, "prefix", e.target.value)
                          }
                          placeholder="Prefix"
                          className="col-span-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        />
                        <input
                          type="number"
                          value={row.count}
                          onChange={(e) =>
                            updatePipelineRow(
                              idx,
                              "count",
                              Number(e.target.value)
                            )
                          }
                          placeholder="Count"
                          className="col-span-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        />
                        <button
                          onClick={() => removePipelineRow(idx)}
                          className="col-span-1 p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                          type="button"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddService}
                className="bg-[#6C5CE7] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5a4ad1]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Tag size={20} className="text-[#6C5CE7]" /> Categories
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="New category name"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <button
                  onClick={handleAddCategory}
                  className="bg-[#0F172A] text-white px-5 py-2.5 rounded-xl font-bold"
                >
                  Add
                </button>
              </div>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="font-bold text-slate-800">{c.name}</div>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <div className="p-6 text-center text-slate-400">
                    No categories.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODE MODAL */}
      {isPaymentModeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CreditCard size={20} className="text-[#6C5CE7]" /> Payment
                Modes
              </h3>
              <button
                onClick={() => setIsPaymentModeModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <input
                  value={newPaymentModeName}
                  onChange={(e) => setNewPaymentModeName(e.target.value)}
                  placeholder="New payment mode"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <button
                  onClick={handleAddPaymentMode}
                  className="bg-[#0F172A] text-white px-5 py-2.5 rounded-xl font-bold"
                >
                  Add
                </button>
              </div>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {invoiceDropdowns.paymentModes.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="font-bold text-slate-800">{m.name}</div>
                    <button
                      onClick={() => handleDeletePaymentMode(m.id)}
                      className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {invoiceDropdowns.paymentModes.length === 0 && (
                  <div className="p-6 text-center text-slate-400">
                    No modes.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT TERM MODAL */}
      {isPaymentTermModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Clock size={20} className="text-[#6C5CE7]" /> Payment Terms
              </h3>
              <button
                onClick={() => setIsPaymentTermModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                <input
                  value={newPaymentTermName}
                  onChange={(e) => setNewPaymentTermName(e.target.value)}
                  placeholder="New payment term"
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
                <button
                  onClick={handleAddPaymentTerm}
                  className="bg-[#0F172A] text-white px-5 py-2.5 rounded-xl font-bold"
                >
                  Add
                </button>
              </div>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {invoiceDropdowns.paymentTerms.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="font-bold text-slate-800">{t.name}</div>
                    <button
                      onClick={() => handleDeletePaymentTerm(t.id)}
                      className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {invoiceDropdowns.paymentTerms.length === 0 && (
                  <div className="p-6 text-center text-slate-400">
                    No terms.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE PREVIEW MODAL */}
      {isPreviewModalOpen && previewData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-[#6C5CE7]" /> Invoice
                Preview
              </h3>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[80vh] bg-slate-100">
              <div
                className="bg-white rounded-2xl p-4"
                dangerouslySetInnerHTML={{ __html: previewData.html }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Meta Token Addition Modal */}
      {isMetaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Share2 size={20} className="text-[#6C5CE7]" /> Meta Access
                Token
              </h3>
              <button
                onClick={() => {
                  setIsMetaModalOpen(false);
                  setMetaStep(1);
                }}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {metaStep === 1 ? (
                <div className="space-y-6 text-center">
                  <div className="w-16 h-16 bg-violet-100 text-[#6C5CE7] rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">
                      Verification Required
                    </h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      To add a new Meta token, we need to verify your
                      administrative access. Click below to receive an OTP on
                      your registered email.
                    </p>
                  </div>
                  <button
                    onClick={handleStartAddToken}
                    disabled={metaLoading}
                    className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    {metaLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Send Verification OTP"
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Account Label
                    </label>
                    <input
                      placeholder="e.g. Tarviz Primary"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#6C5CE7] outline-none font-medium"
                      value={metaForm.account_label}
                      onChange={(e) =>
                        setMetaForm({
                          ...metaForm,
                          account_label: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Meta Access Token
                    </label>
                    <textarea
                      placeholder="Paste the Graph API long-lived token here..."
                      rows={3}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#6C5CE7] outline-none text-xs font-mono resize-none"
                      value={metaForm.access_token}
                      onChange={(e) =>
                        setMetaForm({
                          ...metaForm,
                          access_token: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      6-Digit OTP
                    </label>
                    <input
                      maxLength={6}
                      placeholder="000000"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#6C5CE7] outline-none text-center font-bold tracking-[0.5em] text-xl"
                      value={metaForm.otp}
                      onChange={(e) =>
                        setMetaForm({ ...metaForm, otp: e.target.value })
                      }
                    />
                  </div>
                  <button
                    onClick={handleConfirmAddToken}
                    disabled={metaLoading}
                    className="w-full bg-[#6C5CE7] text-white py-4 rounded-xl font-bold hover:bg-[#5a4ad1] transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200"
                  >
                    {metaLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Confirm & Integrate"
                    )}
                  </button>
                  <button
                    onClick={() => setMetaStep(1)}
                    className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Back to Step 1
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
