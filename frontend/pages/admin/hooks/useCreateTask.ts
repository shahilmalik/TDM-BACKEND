import { useCallback, useState } from "react";
import { api } from "../../../services/api";

type AdminMessage = { type: "success" | "error"; text: string };

type Option = { id: string; label: string };

type Params = {
  selectedPipelineClient: string;
  fetchPipeline: () => Promise<void> | void;
  setAdminMessage: (m: AdminMessage) => void;
};

export function useCreateTask({
  selectedPipelineClient,
  fetchPipeline,
  setAdminMessage,
}: Params) {
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [createTaskTitle, setCreateTaskTitle] = useState("");
  const [createTaskServiceId, setCreateTaskServiceId] = useState<string>("");
  const [createTaskInvoiceId, setCreateTaskInvoiceId] = useState<string>("");
  const [createTaskServices, setCreateTaskServices] = useState<Option[]>([]);
  const [createTaskInvoices, setCreateTaskInvoices] = useState<Option[]>([]);
  const [createTaskLoading, setCreateTaskLoading] = useState(false);
  const [createTaskError, setCreateTaskError] = useState<string | null>(null);

  const openCreateTaskModal = useCallback(async () => {
    if (!selectedPipelineClient) return;

    setCreateTaskTitle("");
    setCreateTaskServiceId("");
    setCreateTaskInvoiceId("");
    setCreateTaskError(null);

    setIsCreateTaskModalOpen(true);
    setCreateTaskLoading(true);

    try {
      const [invoiceRes, servicesRes]: any = await Promise.all([
        api.invoice.getDropdownPaidInvoices(selectedPipelineClient),
        api.services.list({ page: 1, page_size: 1000, is_active: "active" }),
      ]);

      const invoiceArr = Array.isArray(invoiceRes?.invoices)
        ? invoiceRes.invoices
        : [];
      setCreateTaskInvoices(
        invoiceArr.map((inv: any) => ({
          id: String(inv.id),
          label: inv.invoice_id
            ? `${String(inv.invoice_id)} (${String(inv.date)})`
            : `Invoice #${inv.id}`,
        }))
      );

      const servicesData = Array.isArray(servicesRes)
        ? servicesRes
        : servicesRes?.results || [];
      setCreateTaskServices(
        (servicesData || []).map((s: any) => ({
          id: String(s.id),
          label: String(s.name ?? `Service #${s.id}`),
        }))
      );
    } catch (e: any) {
      setCreateTaskError(e?.message || "Failed to load invoices/services.");
      setCreateTaskServices([]);
      setCreateTaskInvoices([]);
    } finally {
      setCreateTaskLoading(false);
    }
  }, [selectedPipelineClient]);

  const submitCreateTask = useCallback(async () => {
    if (!selectedPipelineClient) return;
    if (!createTaskTitle.trim() || !createTaskInvoiceId || !createTaskServiceId) {
      return;
    }

    setCreateTaskLoading(true);
    setCreateTaskError(null);

    try {
      await api.kanban.create({
        title: createTaskTitle.trim(),
        client_id: Number(selectedPipelineClient),
        invoice_id: Number(createTaskInvoiceId),
        service_id: Number(createTaskServiceId),
      });
      setIsCreateTaskModalOpen(false);
      await fetchPipeline();
      setAdminMessage({ type: "success", text: "Task created." });
    } catch (e: any) {
      setCreateTaskError(e?.message || "Failed to create task.");
      setAdminMessage({ type: "error", text: e?.message || "Failed to create task." });
    } finally {
      setCreateTaskLoading(false);
    }
  }, [createTaskInvoiceId, createTaskServiceId, createTaskTitle, fetchPipeline, selectedPipelineClient, setAdminMessage]);

  return {
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
  };
}
