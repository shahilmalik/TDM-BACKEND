import { useCallback, useRef, useState } from "react";
import { api } from "../../../services/api";
import { AdminInvoice } from "../../../types";

type AdminMessage = { type: "success" | "error"; text: string };

export function useInvoices(params: {
  invoiceSearch: string;
  invoiceStatusFilter: string;
  invoiceClientFilter: string;
  invoiceDateRange: { start: string; end: string };
  setAdminMessage: (m: AdminMessage) => void;
}) {
  const {
    invoiceSearch,
    invoiceStatusFilter,
    invoiceClientFilter,
    invoiceDateRange,
    setAdminMessage,
  } = params;

  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [invoicesPage, setInvoicesPage] = useState(1);
  const [invoicesHasNext, setInvoicesHasNext] = useState(false);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const invoicesSentinelRef = useRef<HTMLDivElement | null>(null);

  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);

  const [invoiceDropdowns, setInvoiceDropdowns] = useState({
    clients: [] as { id: number; name: string }[],
    paymentModes: [] as { id: number; name: string }[],
    paymentTerms: [] as { id: number; name: string }[],
  });

  const [invoiceStatusOptions, setInvoiceStatusOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [invoiceClientOptions, setInvoiceClientOptions] = useState<
    { id: number; name: string }[]
  >([]);

  const [previewData, setPreviewData] = useState<{
    id: number | string;
    html: string;
  } | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);
  const [invoiceHistoryById, setInvoiceHistoryById] = useState<
    Record<
      string,
      {
        loading: boolean;
        error: string | null;
        events: Array<{
          type: string;
          title: string;
          ts: string | null;
          meta?: Record<string, any>;
        }>;
      }
    >
  >({});

  // Payment modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState<number>(0);
  const [paymentModeIdInput, setPaymentModeIdInput] = useState<string>("");
  const [paymentReferenceInput, setPaymentReferenceInput] = useState<string>("");

  const resetInvoicesList = useCallback(async () => {
    setInvoicesLoading(true);
    try {
      const response: any = await api.invoice.list({
        page: 1,
        page_size: 20,
        search: invoiceSearch || undefined,
        status:
          invoiceStatusFilter && invoiceStatusFilter !== "All"
            ? invoiceStatusFilter
            : undefined,
        client_id:
          invoiceClientFilter && invoiceClientFilter !== "All"
            ? invoiceClientFilter
            : undefined,
        start_date: invoiceDateRange.start || undefined,
        end_date: invoiceDateRange.end || undefined,
      });
      const invoiceList = response?.results || response?.invoices || [];

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
          startDate: inv.start_date ?? null,
          startedAt: inv.started_at ?? null,
          dueDate: inv.due_date || inv.date,
          clientId: inv.client?.id || "",
          clientName: inv.client
            ? `${inv.client.first_name || ""} ${inv.client.last_name || ""}`.trim()
            : "Unknown",
          clientAddress: "",
          items: inv.items || [],
          subTotal: total,
          taxTotal: parseFloat(inv.gst_amount || "0"),
          grandTotal: total,
          paidAmount: parseFloat(inv.paid_amount || "0"),
          status: inv.status_label || inv.status || "Unknown",
          statusValue: inv.status || "",
          authorizedBy: inv.authorized_by || "System",
          hasPipeline: !!inv.has_pipeline,
        } as AdminInvoice;
      });

      setInvoices(mapped);
      setInvoicesPage(1);
      setInvoicesHasNext(!!response?.next);
      setSelectedInvoiceIds([]);
    } catch (e) {
      console.error("Failed to fetch invoices", e);
    } finally {
      setInvoicesLoading(false);
    }
  }, [invoiceClientFilter, invoiceDateRange.end, invoiceDateRange.start, invoiceSearch, invoiceStatusFilter]);

  const fetchMoreInvoices = useCallback(async () => {
    if (invoicesLoading || !invoicesHasNext) return;
    const nextPage = invoicesPage + 1;
    setInvoicesLoading(true);
    try {
      const response: any = await api.invoice.list({
        page: nextPage,
        page_size: 20,
        search: invoiceSearch || undefined,
        status:
          invoiceStatusFilter && invoiceStatusFilter !== "All"
            ? invoiceStatusFilter
            : undefined,
        client_id:
          invoiceClientFilter && invoiceClientFilter !== "All"
            ? invoiceClientFilter
            : undefined,
        start_date: invoiceDateRange.start || undefined,
        end_date: invoiceDateRange.end || undefined,
      });
      const invoiceList = response?.results || response?.invoices || [];

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
          startDate: inv.start_date ?? null,
          startedAt: inv.started_at ?? null,
          dueDate: inv.due_date || inv.date,
          clientId: inv.client?.id || "",
          clientName: inv.client
            ? `${inv.client.first_name || ""} ${inv.client.last_name || ""}`.trim()
            : "Unknown",
          clientAddress: "",
          items: inv.items || [],
          subTotal: total,
          taxTotal: parseFloat(inv.gst_amount || "0"),
          grandTotal: total,
          paidAmount: parseFloat(inv.paid_amount || "0"),
          status: inv.status_label || inv.status || "Unknown",
          statusValue: inv.status || "",
          authorizedBy: inv.authorized_by || "System",
          hasPipeline: !!inv.has_pipeline,
        } as AdminInvoice;
      });

      setInvoices((prev) => [...prev, ...mapped]);
      setInvoicesPage(nextPage);
      setInvoicesHasNext(!!response?.next);
    } catch (e) {
      console.error("Failed to fetch more invoices", e);
    } finally {
      setInvoicesLoading(false);
    }
  }, [invoiceClientFilter, invoiceDateRange.end, invoiceDateRange.start, invoiceSearch, invoiceStatusFilter, invoicesHasNext, invoicesLoading, invoicesPage]);

  const fetchInvoiceFilterOptions = useCallback(async () => {
    try {
      const [clientsRes, statusesRes] = await Promise.all([
        api.invoice.getDropdownClients(),
        api.invoice.getDropdownInvoiceStatuses(),
      ]);
      const normalizedClients = (Array.isArray(clientsRes) ? clientsRes : []).map(
        (c: any) => ({
          ...c,
          id: String(c?.id ?? ""),
        })
      );
      setInvoiceClientOptions(normalizedClients);
      setInvoiceStatusOptions(Array.isArray(statusesRes) ? statusesRes : []);
    } catch (e) {
      console.error("Failed to fetch invoice filter options", e);
    }
  }, []);

  const fetchInvoiceDropdowns = useCallback(async () => {
    try {
      const [clientsRes, paymentModesRes, paymentTermsRes] = await Promise.all([
        api.invoice.getDropdownClients(),
        api.invoice.getDropdownPaymentModes(),
        api.invoice.getDropdownPaymentTerms(),
      ]);
      const normalizedClients = (clientsRes || []).map((c: any) => ({
        ...c,
        id: String(c?.id ?? ""),
      }));
      setInvoiceDropdowns({
        clients: normalizedClients || [],
        paymentModes: paymentModesRes || [],
        paymentTerms: paymentTermsRes || [],
      });
    } catch (e) {
      console.error("Failed to fetch invoice dropdowns", e);
    }
  }, []);

  const openRecordPaymentModal = useCallback(
    (inv: AdminInvoice) => {
      setSelectedInvoice(inv);
      const pending = Math.max((inv.grandTotal || 0) - (inv.paidAmount || 0), 0);
      setPaymentAmountInput(pending);
      setPaymentModeIdInput("");
      setPaymentReferenceInput("");
      setIsPaymentModalOpen(true);
    },
    []
  );

  const handleRecordPayment = useCallback(async () => {
    if (!selectedInvoice) return;
    const invoiceId = Number(selectedInvoice.id);
    if (!invoiceId || Number.isNaN(invoiceId)) {
      setAdminMessage({ type: "error", text: "Invalid invoice." });
      return;
    }
    if (!paymentAmountInput || paymentAmountInput <= 0) {
      setAdminMessage({ type: "error", text: "Enter a valid amount." });
      return;
    }

    try {
      await api.invoice.recordPayment({
        invoice: invoiceId,
        amount: Number(paymentAmountInput),
        payment_mode: paymentModeIdInput ? Number(paymentModeIdInput) : null,
        reference: paymentReferenceInput || undefined,
      });
      setIsPaymentModalOpen(false);
      setSelectedInvoice(null);
      await resetInvoicesList();
      setAdminMessage({ type: "success", text: "Payment recorded." });
    } catch (e: any) {
      setAdminMessage({ type: "error", text: e?.message || "Failed." });
    }
  }, [paymentAmountInput, paymentModeIdInput, paymentReferenceInput, resetInvoicesList, selectedInvoice, setAdminMessage]);

  const handlePreviewInvoice = useCallback(async (id: number | string) => {
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
  }, [setAdminMessage]);

  const toggleInvoiceExpanded = useCallback(
    async (inv: AdminInvoice) => {
      const id = String(inv.id);
      const next = expandedInvoiceId === id ? null : id;
      setExpandedInvoiceId(next);

      if (!next) return;
      if (invoiceHistoryById[next]?.loading) return;
      if (invoiceHistoryById[next]?.events?.length) return;

      setInvoiceHistoryById((prev) => ({
        ...prev,
        [next]: { loading: true, error: null, events: [] },
      }));

      try {
        const res = await api.invoice.history(next);
        const events = Array.isArray((res as any)?.events)
          ? (res as any).events
          : [];
        setInvoiceHistoryById((prev) => ({
          ...prev,
          [next]: { loading: false, error: null, events },
        }));
      } catch (e: any) {
        setInvoiceHistoryById((prev) => ({
          ...prev,
          [next]: {
            loading: false,
            error: e?.message || "Failed to load history.",
            events: [],
          },
        }));
      }
    },
    [expandedInvoiceId, invoiceHistoryById]
  );

  const handleDownloadInvoice = useCallback(
    async (id: number | string, invoiceNo?: string) => {
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
    },
    [setAdminMessage]
  );

  const toggleInvoiceSelection = useCallback((id: string) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const toggleSelectAllVisibleInvoices = useCallback(
    (visibleInvoiceIds: string[]) => {
      setSelectedInvoiceIds((prev) => {
        const allVisibleSelected =
          visibleInvoiceIds.length > 0 &&
          visibleInvoiceIds.every((id) => prev.includes(id));
        if (allVisibleSelected) {
          return prev.filter((id) => !visibleInvoiceIds.includes(id));
        }
        return Array.from(new Set([...prev, ...visibleInvoiceIds]));
      });
    },
    []
  );

  const handleBulkDownload = useCallback(() => {
    if (selectedInvoiceIds.length === 0) return;
    setAdminMessage({
      type: "success",
      text: `Selected ${selectedInvoiceIds.length} invoices. Bulk ZIP download is not implemented yet.`,
    });
  }, [selectedInvoiceIds.length, setAdminMessage]);

  return {
    invoices,
    invoicesPage,
    invoicesHasNext,
    invoicesLoading,
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
  };
}
