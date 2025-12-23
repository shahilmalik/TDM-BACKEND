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
  Loader2,
  Play,
  Instagram,
  Linkedin,
  Share2,
} from "lucide-react";
import ContentItem from "../components/ContentItem";
import CreateTaskModal from "./admin/components/CreateTaskModal";
import PipelineTab from "./admin/tabs/PipelineTab";
import ClientsTab from "./admin/tabs/ClientsTab";
import ServicesTab from "./admin/tabs/ServicesTab";
import EmployeesTab from "./admin/tabs/EmployeesTab";
import InvoicesTab from "./admin/tabs/InvoicesTab";
import MetaTab from "./admin/tabs/MetaTab";
import SettingsTab from "./admin/tabs/SettingsTab";
import ClientModal from "./admin/components/ClientModal";
import ClientDetailsModal from "./admin/components/ClientDetailsModal";
import EmployeeModal from "./admin/components/EmployeeModal";
import PaymentModeModal from "./admin/components/PaymentModeModal";
import PaymentTermModal from "./admin/components/PaymentTermModal";
import InvoicePreviewModal from "./admin/components/InvoicePreviewModal";
import MetaTokenModal from "./admin/components/MetaTokenModal";
import PaymentModal from "./admin/components/PaymentModal";
import ServiceDetailsModal from "./admin/components/ServiceDetailsModal";
import ServiceModal from "./admin/components/ServiceModal";
import CategoryModal from "./admin/components/CategoryModal";
import {
  AdminServiceItem,
  AdminEmployee,
  AdminInvoice,
  AdminClient,
  AdminInvoiceItem,
  PipelinePost,
  PipelineStatus,
  UserSubscription,
  PipelineConfigItem,
  MetaToken,
  BackendService,
  BackendCategory,
} from "../types";
import {
  api,
  mapStatusToBackendColumn,
} from "../services/api";
import { useAdminMessage } from "./admin/hooks/useAdminMessage";
import { useServicesAndCategories } from "./admin/hooks/useServicesAndCategories";
import { useClients } from "./admin/hooks/useClients";
import { useEmployees } from "./admin/hooks/useEmployees";
import { useInvoices } from "./admin/hooks/useInvoices";
import { useClientMetaSync } from "./admin/hooks/useClientMetaSync";
import { useMetaIntegration } from "./admin/hooks/useMetaIntegration";
import { useCompanyProfile } from "./admin/hooks/useCompanyProfile";
import { usePipeline } from "./admin/hooks/usePipeline";
import { useCreateTask } from "./admin/hooks/useCreateTask";
import { useInvoicePaymentOptions } from "./admin/hooks/useInvoicePaymentOptions";
import { useInvoiceCreateForm } from "./admin/hooks/useInvoiceCreateForm";

// NOTE:
// This file is currently very large. A gradual refactor is planned where the implementation
// will be moved into `frontend/pages/admin/*` (tabs, modals, hooks) without changing UI.
// Do not change exports in this file until the split is complete.

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

const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "other", label: "Other" },
] as const;

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigate?: (page: string, subPage?: string) => void;
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

  const { adminMessage, setAdminMessage } = useAdminMessage();

  // Clients query state (used by `useClients`)
  const [clientSearch, setClientSearch] = useState("");
  const [clientFilter, setClientFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Services filters (used by `useServicesAndCategories`)
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [serviceActiveFilter, setServiceActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Invoices query state (used by `useInvoices`)
  const [invoiceView, setInvoiceView] = useState<"list" | "create">("list");
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("All");
  const [invoiceClientFilter, setInvoiceClientFilter] = useState<string>("All");
  const [invoiceDateRange, setInvoiceDateRange] = useState({ start: "", end: "" });

  // ---------------------------------------------------------------------------
  // Restored local state that is still referenced by tabs/components.
  // These were removed during an incomplete invoices-hook wiring pass.

  // Pipeline selection + DnD state (used by <PipelineTab /> and pipeline handlers)
  const [selectedPipelineClient, setSelectedPipelineClient] = useState<string>("");
  // draggedPostId/openContentItemId now live in `usePipeline`

  // Client details modal selection
  const [selectedClientDetail, setSelectedClientDetail] = useState<AdminClient | null>(null);

  // ---------------------------------------------------------------------------

  // Pipeline domain (moved into hook)
  const pipelineDomain = usePipeline({
    activeTab,
    selectedPipelineClient,
    setAdminMessage,
  });
  const {
    pipelineData,
    fetchPipeline,
    handleScheduleById,
    handlePipelineDragStart,
    handlePipelineDragOver,
    handlePipelineDrop,
    openContentItemId,
    setOpenContentItemId,
  } = pipelineDomain;

  const createTaskDomain = useCreateTask({
    selectedPipelineClient,
    fetchPipeline,
    setAdminMessage,
  });
  const {
    isCreateTaskModalOpen,
    setIsCreateTaskModalOpen,
    createTaskTitle,
    setCreateTaskTitle,
    createTaskServiceId,
    setCreateTaskServiceId,
    createTaskInvoiceId,
    setCreateTaskInvoiceId,
    createTaskServices,
    createTaskInvoices,
    createTaskLoading,
    createTaskError,
    openCreateTaskModal,
    submitCreateTask,
  } = createTaskDomain;

  const isManagerOrAbove =
    (currentUser?.type ?? currentUser?.role ?? "").toString() === "manager" ||
    (currentUser?.type ?? currentUser?.role ?? "").toString() === "superadmin";

  // Meta integration domain (moved into hook)
  const metaIntegration = useMetaIntegration({ setAdminMessage });
  const {
    metaTokens,
    metaPages: metaIntegrationPages,
    fetchMeta,
    isMetaModalOpen,
    setIsMetaModalOpen,
    metaStep,
    setMetaStep,
    metaForm,
    setMetaForm,
    metaLoading,
    handleStartAddToken,
    handleConfirmAddToken,
  } = metaIntegration;

  // --- HANDLERS (temporarily kept in AdminDashboard; next batches will move into hooks) ---

  // Company profile domain (moved into hook)
  const companyProfile = useCompanyProfile({ setAdminMessage });
  const {
    companyDetails,
    setCompanyDetails,
    fetchCompanyProfile,
    handleSaveCompanyProfile,
  } = companyProfile;

  // clients domain (moved into hook)
  const clientsDomain = useClients({
    clientSearch,
    clientFilter,
    setAdminMessage,
  });
  const {
    clients,
    clientsList,
    clientsListSentinelRef,
    isClientModalOpen,
    setIsClientModalOpen,
    clientForm,
    setClientForm,
    editingClientId,
    setEditingClientId,
    fetchClients,
    resetClientsList,
    fetchMoreClientsList,
    openCreateClientModal,
    openEditClientModal,
    handleSaveClient,
    handleDeleteClient,
    formatPhoneWithCountry,
  } = clientsDomain;

  // employees domain (moved into hook)
  const employeesDomain = useEmployees({ setAdminMessage });
  const {
    employees,
    employeesSentinelRef,
    isEmployeeModalOpen,
    setIsEmployeeModalOpen,
    employeeForm,
    setEmployeeForm,
    editingEmployeeId,
    setEditingEmployeeId,
    fetchEmployees,
    fetchMoreEmployees,
    openCreateEmployeeModal,
    openEditEmployeeModal,
    handleSaveEmployee,
    handleDeleteEmployee,
  } = employeesDomain;

  // invoices domain (moved into hook)
  const invoicesDomain = useInvoices({
    invoiceSearch,
    invoiceStatusFilter,
    invoiceClientFilter,
    invoiceDateRange,
    setAdminMessage,
  });
  const {
    invoices,
    invoicesSentinelRef,

    selectedInvoiceIds,
    setSelectedInvoiceIds,

    invoiceDropdowns,
    invoiceStatusOptions,
    invoiceClientOptions,

    previewData,
    isPreviewModalOpen,
    setIsPreviewModalOpen,

    expandedInvoiceId,
    invoiceHistoryById,

    isPaymentModalOpen,
    setIsPaymentModalOpen,
    selectedInvoice,
    setSelectedInvoice,
    paymentAmountInput,
    setPaymentAmountInput,
    paymentModeIdInput,
    setPaymentModeIdInput,
    paymentReferenceInput,
    setPaymentReferenceInput,

    resetInvoicesList,
    fetchMoreInvoices,
    fetchInvoiceFilterOptions,
    fetchInvoiceDropdowns,
    openRecordPaymentModal,
    handleRecordPayment,
    handlePreviewInvoice,
    toggleInvoiceExpanded,
    handleDownloadInvoice,
    toggleInvoiceSelection,
    toggleSelectAllVisibleInvoices,
    handleBulkDownload,
  } = invoicesDomain;

  // client-details Meta sync (moved into hook)
  const clientMetaSync = useClientMetaSync({ setAdminMessage });
  const {
    metaPages,
    setMetaPages,
    loadMetaPages,
    selectedClientMetaPageId,
    setSelectedClientMetaPageId,
    isMetaSyncLoading,
    syncClientMetaPage,
    resetSelectedClientMetaPageId,
  } = clientMetaSync;

  // services domain (moved into hook)
  const servicesDomain = useServicesAndCategories({
    categoryFilter,
    serviceActiveFilter,
    setAdminMessage,
  });
  const {
    services,
    categories,
    servicesList,
    servicesListSentinelRef,
    serviceCategoryFilterOptions,
    serviceActiveFilterOptions,
    filteredServices,

    isCategoryModalOpen,
    setIsCategoryModalOpen,
    newCategoryName,
    setNewCategoryName,

    isServiceModalOpen,
    setIsServiceModalOpen,
    selectedServiceDetail,
    setSelectedServiceDetail,
    isServiceDetailLoading,

    newService,
    setNewService,
    editingServiceId,
    setEditingServiceId,

    openServiceDetail,
    deleteService,
    handleAddCategory,
    handleDeleteCategory,
    handleCategoryChange,
    handleAddService,
    handleEditService,
    addPipelineRow,
    removePipelineRow,
    updatePipelineRow,
    fetchServicesAndCategories,
    resetServicesList,
    fetchMoreServicesList,
  } = servicesDomain;

  const invoicePaymentOptions = useInvoicePaymentOptions({
    fetchInvoiceDropdowns,
    setAdminMessage,
  });
  const {
    isPaymentModeModalOpen,
    setIsPaymentModeModalOpen,
    newPaymentModeName,
    setNewPaymentModeName,
    handleAddPaymentMode,
    handleDeletePaymentMode,

    isPaymentTermModalOpen,
    setIsPaymentTermModalOpen,
    newPaymentTermName,
    setNewPaymentTermName,
    handleAddPaymentTerm,
    handleDeletePaymentTerm,
  } = invoicePaymentOptions;

  const invoiceCreateForm = useInvoiceCreateForm({
    services,
    setAdminMessage,
    onCreated: async () => {
      setInvoiceView("list");
      resetInvoicesList();
    },
  });
  const { invoiceForm, setInvoiceForm, updateInvoiceItem, handleCreateInvoice } =
    invoiceCreateForm;

  const handleLogoutAction = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout();
    }
  };

  const getStatusColor = (statusValue: string) => {
    switch (statusValue) {
      case "paid":
        return "bg-green-50 text-green-600 border-green-200";
      case "partially_paid":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "cancelled":
        return "bg-slate-50 text-slate-600 border-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
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

  const visibleInvoices = invoices;
  const visibleInvoiceIds = visibleInvoices.map((inv) => String(inv.id));
  const allVisibleSelected =
    visibleInvoiceIds.length > 0 &&
    visibleInvoiceIds.every((id) => selectedInvoiceIds.includes(id));
  const toggleSelectAllVisibleInvoicesLocal = () =>
    toggleSelectAllVisibleInvoices(visibleInvoiceIds);

  const openClientDetail = async (clientId: string | number) => {
    try {
      resetSelectedClientMetaPageId();
      // Load available Meta pages for the Sync dropdown (used in Client Details).
      // Keep this independent from the Meta tab so clients->detail always has data.
      await loadMetaPages();

      // show existing basic info immediately if available
      const existing =
        clientsList.find((c) => String(c.id) === String(clientId)) ||
        clients.find((c) => String(c.id) === String(clientId));
      if (existing) setSelectedClientDetail(existing);

      const c = await api.clients.get(clientId);
      const u = c.user_detail || {};
      const contactName = `${u.salutation || ""} ${u.first_name || ""} ${
        u.last_name || ""
      }`.trim();
      const contactPhone = formatPhoneWithCountry(u.country_code, u.phone);
      const businessPhone = formatPhoneWithCountry(
        c.business_phone_country_code,
        c.business_phone
      );

      const full: AdminClient = {
        id: c.id,
        businessName: c.company_name,
        contactName,
        email: u.email || c.business_email,
        phone: contactPhone || businessPhone,
        address: c.billing_address,
        gstin: c.gstin,
        isActive: !!u.is_active,
        pendingPayment: 0,
        businessDetails: {
          name: c.company_name,
          address: c.billing_address,
          gstin: c.gstin,
          hsn: "",
          email: c.business_email,
          phone: businessPhone,
          whatsappConsent: !!c.whatsapp_updates,
        },
        contactDetails: {
          salutation: u.salutation,
          firstName: u.first_name,
          lastName: u.last_name,
          email: u.email,
          phone: contactPhone,
          whatsappConsent: !!c.whatsapp_updates,
        },
        subscriptions: undefined,
      };

      // keep raw backend around for the detail page (exclude updated_at/archived in UI)
      (full as any).__backend = { profile: c, user: u };
      setSelectedClientDetail(full);
    } catch (e: any) {
      setAdminMessage({
        type: "error",
        text: e?.message || "Failed to load client details.",
      });
    }
  };

  // Initial bootstrap
  useEffect(() => {
    (async () => {
      try {
        const profiles = await api.core.getProfile();
        const me = Array.isArray(profiles) ? profiles[0] : profiles;
        setCurrentUser(me);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // Initial data loads (so API calls happen even after splitting into hooks)
  useEffect(() => {
    // Pipeline needs the client list for the dropdown
    fetchClients();

    // Employees tab list
    fetchEmployees();

    // Services tab list + categories
    fetchServicesAndCategories();
    resetServicesList();

    // Invoices tab list + dropdowns
    resetInvoicesList();
    fetchInvoiceFilterOptions();
    fetchInvoiceDropdowns();
  }, [
    fetchClients,
    fetchEmployees,
    fetchServicesAndCategories,
    resetServicesList,
    resetInvoicesList,
    fetchInvoiceFilterOptions,
    fetchInvoiceDropdowns,
  ]);

  // Refresh clients list when changing Clients tab filters/search
  useEffect(() => {
    if (activeTab !== "clients") return;
    resetClientsList();
  }, [activeTab, clientSearch, clientFilter, resetClientsList]);

  // Refresh services list when changing Services tab filters
  useEffect(() => {
    if (activeTab !== "services") return;
    resetServicesList();
  }, [activeTab, categoryFilter, serviceActiveFilter, resetServicesList]);

  // Refresh invoices list when changing Invoices tab filters/search
  useEffect(() => {
    if (activeTab !== "invoices") return;
    resetInvoicesList();
  }, [
    activeTab,
    invoiceSearch,
    invoiceStatusFilter,
    invoiceClientFilter,
    invoiceDateRange,
    resetInvoicesList,
  ]);

  // Pipeline refresh when client changes
  useEffect(() => {
    if (!selectedPipelineClient) return;
    fetchPipeline();
  }, [selectedPipelineClient, fetchPipeline]);

  // Meta refresh when tab becomes active
  useEffect(() => {
    if (activeTab !== "meta") return;
    fetchMeta();
  }, [activeTab, fetchMeta]);

  // Company profile refresh when tab becomes active
  useEffect(() => {
    if (activeTab !== "settings") return;
    fetchCompanyProfile();
  }, [activeTab, fetchCompanyProfile]);

  const handleStartPipeline = async (inv: any) => {
    try {
      const invoiceId = inv?.id;
      if (!invoiceId) return;
      await api.invoice.startPipeline(Number(invoiceId));
      setAdminMessage({ type: "success", text: "Pipeline started." });
      resetInvoicesList();
      await fetchPipeline();
    } catch (e: any) {
      setAdminMessage({
        type: "error",
        text: e?.message || "Failed to start pipeline.",
      });
    }
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
          {currentUser?.name && (
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <div className="text-sm font-bold text-white leading-tight">
                {currentUser.name}
              </div>
              {currentUser?.role && (
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                  {currentUser.role}
                </div>
              )}
            </div>
          )}
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
          <PipelineTab
            clients={clients}
            selectedPipelineClient={selectedPipelineClient}
            setSelectedPipelineClient={setSelectedPipelineClient}
            PIPELINE_COLUMNS={PIPELINE_COLUMNS}
            pipelineData={pipelineData}
            isManagerOrAbove={isManagerOrAbove}
            handlePipelineDragOver={handlePipelineDragOver}
            handlePipelineDrop={handlePipelineDrop}
            handlePipelineDragStart={handlePipelineDragStart}
            openCreateTaskModal={openCreateTaskModal}
            fetchPipeline={fetchPipeline}
            handleScheduleById={handleScheduleById}
            openContentItemId={openContentItemId}
            setOpenContentItemId={setOpenContentItemId}
            isCreateTaskModalOpen={isCreateTaskModalOpen}
            setIsCreateTaskModalOpen={setIsCreateTaskModalOpen}
            createTaskTitle={createTaskTitle}
            setCreateTaskTitle={setCreateTaskTitle}
            createTaskServiceId={createTaskServiceId}
            setCreateTaskServiceId={setCreateTaskServiceId}
            createTaskInvoiceId={createTaskInvoiceId}
            setCreateTaskInvoiceId={setCreateTaskInvoiceId}
            createTaskServices={createTaskServices}
            createTaskInvoices={createTaskInvoices}
            createTaskLoading={createTaskLoading}
            createTaskError={createTaskError}
            submitCreateTask={submitCreateTask}
          />
        )}

        {/* CLIENTS TAB */}
        {activeTab === "clients" && (
          <ClientsTab
            clientSearch={clientSearch}
            setClientSearch={setClientSearch}
            clientFilter={clientFilter}
            setClientFilter={setClientFilter}
            clientsList={clientsList}
            openCreateClientModal={openCreateClientModal}
            openClientDetail={openClientDetail}
            clientsListSentinelRef={clientsListSentinelRef}
          />
        )}

        {/* SERVICES TAB */}
        {activeTab === "services" && (
          <ServicesTab
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            serviceActiveFilter={serviceActiveFilter}
            setServiceActiveFilter={setServiceActiveFilter}
            serviceCategoryFilterOptions={serviceCategoryFilterOptions}
            serviceActiveFilterOptions={serviceActiveFilterOptions}
            filteredServices={filteredServices}
            servicesList={servicesList}
            servicesListSentinelRef={servicesListSentinelRef}
            openServiceDetail={openServiceDetail}
            setIsCategoryModalOpen={setIsCategoryModalOpen}
            setEditingServiceId={setEditingServiceId}
            setNewService={setNewService}
            setIsServiceModalOpen={setIsServiceModalOpen}
          />
        )}

        {/* EMPLOYEES TAB */}
        {activeTab === "employees" && (
          <EmployeesTab
            employees={employees}
            openCreateEmployeeModal={openCreateEmployeeModal}
            openEditEmployeeModal={openEditEmployeeModal}
            employeesSentinelRef={employeesSentinelRef}
          />
        )}

        {/* INVOICES TAB */}
        {activeTab === "invoices" && (
          <InvoicesTab
            invoiceView={invoiceView}
            setInvoiceView={setInvoiceView}
            invoiceSearch={invoiceSearch}
            setInvoiceSearch={setInvoiceSearch}
            invoiceStatusFilter={invoiceStatusFilter}
            setInvoiceStatusFilter={setInvoiceStatusFilter}
            invoiceStatusOptions={invoiceStatusOptions}
            invoiceClientFilter={invoiceClientFilter}
            setInvoiceClientFilter={setInvoiceClientFilter}
            invoiceClientOptions={invoiceClientOptions}
            invoiceDateRange={invoiceDateRange}
            setInvoiceDateRange={setInvoiceDateRange}
            selectedInvoiceIds={selectedInvoiceIds}
            toggleSelectAllVisibleInvoices={toggleSelectAllVisibleInvoicesLocal}
            allVisibleSelected={allVisibleSelected}
            handleBulkDownload={handleBulkDownload}
            toggleInvoiceSelection={toggleInvoiceSelection}
            visibleInvoices={visibleInvoices}
            expandedInvoiceId={expandedInvoiceId}
            invoiceHistoryById={invoiceHistoryById}
            toggleInvoiceExpanded={toggleInvoiceExpanded}
            getStatusColor={getStatusColor}
            openRecordPaymentModal={openRecordPaymentModal}
            handleDownloadInvoice={handleDownloadInvoice}
            handlePreviewInvoice={handlePreviewInvoice}
            invoicesSentinelRef={invoicesSentinelRef}
            invoiceForm={invoiceForm}
            setInvoiceForm={setInvoiceForm}
            invoiceDropdowns={invoiceDropdowns}
            updateInvoiceItem={updateInvoiceItem}
            handleCreateInvoice={handleCreateInvoice}
            services={services}
            setIsPaymentModeModalOpen={setIsPaymentModeModalOpen}
            setIsPaymentTermModalOpen={setIsPaymentTermModalOpen}
            handleStartPipeline={handleStartPipeline}
          />
        )}

        {/* META INTEGRATION TAB */}
        {activeTab === "meta" && (
          <MetaTab
            setIsMetaModalOpen={setIsMetaModalOpen}
            metaTokens={metaTokens}
            metaPages={metaIntegrationPages}
          />
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <SettingsTab
            handleSaveCompanyProfile={handleSaveCompanyProfile}
            companyDetails={companyDetails}
            setCompanyDetails={setCompanyDetails}
          />
        )}

      </main>

      {/* CLIENT MODAL */}
      <ClientModal
        open={isClientModalOpen}
        editingClientId={editingClientId}
        clientForm={clientForm as any}
        setClientForm={setClientForm as any}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
      />

      {/* CLIENT DETAILS MODAL */}
      <ClientDetailsModal
        selectedClientDetail={selectedClientDetail}
        onClose={() => setSelectedClientDetail(null)}
        openEditClientModal={openEditClientModal as any}
        handleDeleteClient={handleDeleteClient as any}
        formatPhoneWithCountry={formatPhoneWithCountry}
        metaPages={metaPages as any}
        selectedClientMetaPageId={selectedClientMetaPageId}
        setSelectedClientMetaPageId={setSelectedClientMetaPageId}
        handleSyncClientMetaPage={syncClientMetaPage}
        isMetaSyncLoading={isMetaSyncLoading}
      />

      {/* EMPLOYEE MODAL */}
      <EmployeeModal
        open={isEmployeeModalOpen}
        editingEmployeeId={editingEmployeeId}
        employeeForm={employeeForm as any}
        setEmployeeForm={setEmployeeForm as any}
        onClose={() => setIsEmployeeModalOpen(false)}
        onSave={handleSaveEmployee}
        onDelete={
          editingEmployeeId
            ? async () => {
                const ok = window.confirm("Delete employee?");
                if (!ok) return;
                await handleDeleteEmployee(String(editingEmployeeId));
                setIsEmployeeModalOpen(false);
              }
            : undefined
        }
      />

      {/* SERVICE DETAILS MODAL */}
      <ServiceDetailsModal
        open={!!selectedServiceDetail && !isServiceModalOpen}
        service={selectedServiceDetail as any}
        isLoading={isServiceDetailLoading}
        onClose={() => setSelectedServiceDetail(null)}
        onEdit={(svc) => {
          handleEditService(svc as any);
        }}
        onDelete={async (serviceId) => {
          const ok = window.confirm("Delete service?");
          if (!ok) return;
          await deleteService(serviceId);
          setSelectedServiceDetail(null);
        }}
      />

      {/* SERVICE MODAL */}
      <ServiceModal
        open={isServiceModalOpen}
        editingServiceId={editingServiceId}
        newService={newService as any}
        setNewService={setNewService as any}
        categories={categories as any}
        platformOptions={PLATFORM_OPTIONS as any}
        onClose={() => setIsServiceModalOpen(false)}
        onSave={handleAddService}
        onDelete={
          editingServiceId
            ? async () => {
                const ok = window.confirm("Delete service?");
                if (!ok) return;
                await deleteService(editingServiceId);
                setIsServiceModalOpen(false);
              }
            : undefined
        }
        onCategoryChange={handleCategoryChange}
        addPipelineRow={addPipelineRow}
        removePipelineRow={removePipelineRow}
        updatePipelineRow={updatePipelineRow}
      />

      {/* CATEGORY MODAL */}
      <CategoryModal
        open={isCategoryModalOpen}
        categories={categories as any}
        newCategoryName={newCategoryName}
        setNewCategoryName={setNewCategoryName}
        onAdd={handleAddCategory}
        onDelete={handleDeleteCategory}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* RECORD PAYMENT MODAL */}
      <PaymentModal
        open={isPaymentModalOpen}
        selectedInvoice={selectedInvoice as any}
        paymentAmountInput={paymentAmountInput}
        setPaymentAmountInput={setPaymentAmountInput}
        paymentModeIdInput={paymentModeIdInput}
        setPaymentModeIdInput={setPaymentModeIdInput}
        paymentReferenceInput={paymentReferenceInput}
        setPaymentReferenceInput={setPaymentReferenceInput}
        paymentModes={invoiceDropdowns.paymentModes as any}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handleRecordPayment}
      />

      {/* PAYMENT MODE MODAL */}
      <PaymentModeModal
        open={isPaymentModeModalOpen}
        newPaymentModeName={newPaymentModeName}
        setNewPaymentModeName={setNewPaymentModeName}
        paymentModes={invoiceDropdowns.paymentModes}
        onAdd={handleAddPaymentMode}
        onDelete={handleDeletePaymentMode}
        onClose={() => setIsPaymentModeModalOpen(false)}
      />

      {/* PAYMENT TERM MODAL */}
      <PaymentTermModal
        open={isPaymentTermModalOpen}
        newPaymentTermName={newPaymentTermName}
        setNewPaymentTermName={setNewPaymentTermName}
        paymentTerms={invoiceDropdowns.paymentTerms}
        onAdd={handleAddPaymentTerm}
        onDelete={handleDeletePaymentTerm}
        onClose={() => setIsPaymentTermModalOpen(false)}
      />

      {/* INVOICE PREVIEW MODAL */}
      <InvoicePreviewModal
        open={isPreviewModalOpen}
        previewData={previewData}
        onClose={() => setIsPreviewModalOpen(false)}
      />

      {/* Meta Token Addition Modal */}
      <MetaTokenModal
        open={isMetaModalOpen}
        metaStep={metaStep}
        setMetaStep={setMetaStep}
        metaForm={metaForm}
        setMetaForm={setMetaForm}
        metaLoading={metaLoading}
        onStart={handleStartAddToken}
        onConfirm={handleConfirmAddToken}
        onClose={() => setIsMetaModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;

// Optional new import path for the refactor (no behavior change):
// `import AdminDashboardPage from "./admin/AdminDashboardPage";`
// This will be used once we fully split tabs/modals/hooks.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export { default as AdminDashboardPage } from "./admin/AdminDashboardPage";
