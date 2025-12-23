import { useCallback, useState } from "react";
import { api } from "../../../services/api";

type AdminMessage = { type: "success" | "error"; text: string };

type Params = {
  fetchInvoiceDropdowns: () => Promise<void> | void;
  setAdminMessage: (m: AdminMessage) => void;
};

export function useInvoicePaymentOptions({
  fetchInvoiceDropdowns,
  setAdminMessage,
}: Params) {
  const [isPaymentModeModalOpen, setIsPaymentModeModalOpen] = useState(false);
  const [newPaymentModeName, setNewPaymentModeName] = useState("");

  const [isPaymentTermModalOpen, setIsPaymentTermModalOpen] = useState(false);
  const [newPaymentTermName, setNewPaymentTermName] = useState("");

  const handleAddPaymentMode = useCallback(async () => {
    if (!newPaymentModeName.trim()) return;
    try {
      await api.invoice.createPaymentMode({ name: newPaymentModeName.trim() });
      setNewPaymentModeName("");
      await fetchInvoiceDropdowns();
      setAdminMessage({ type: "success", text: "Payment mode added." });
    } catch (e: any) {
      setAdminMessage({ type: "error", text: e?.message || "Failed." });
    }
  }, [fetchInvoiceDropdowns, newPaymentModeName, setAdminMessage]);

  const handleDeletePaymentMode = useCallback(
    async (id: number) => {
      if (!window.confirm("Delete mode?")) return;
      try {
        await api.invoice.deletePaymentMode(id);
        await fetchInvoiceDropdowns();
        setAdminMessage({ type: "success", text: "Payment mode deleted." });
      } catch (e: any) {
        setAdminMessage({ type: "error", text: e?.message || "Failed." });
      }
    },
    [fetchInvoiceDropdowns, setAdminMessage]
  );

  const handleAddPaymentTerm = useCallback(async () => {
    if (!newPaymentTermName.trim()) return;
    try {
      await api.invoice.createPaymentTerm({ name: newPaymentTermName.trim() });
      setNewPaymentTermName("");
      await fetchInvoiceDropdowns();
      setAdminMessage({ type: "success", text: "Payment term added." });
    } catch (e: any) {
      setAdminMessage({ type: "error", text: e?.message || "Failed." });
    }
  }, [fetchInvoiceDropdowns, newPaymentTermName, setAdminMessage]);

  const handleDeletePaymentTerm = useCallback(
    async (id: number) => {
      if (!window.confirm("Delete term?")) return;
      try {
        await api.invoice.deletePaymentTerm(id);
        await fetchInvoiceDropdowns();
        setAdminMessage({ type: "success", text: "Payment term deleted." });
      } catch (e: any) {
        setAdminMessage({ type: "error", text: e?.message || "Failed." });
      }
    },
    [fetchInvoiceDropdowns, setAdminMessage]
  );

  return {
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
  };
}
