import { useCallback, useMemo, useState } from "react";
import { api } from "../../../services/api";

type AdminMessage = { type: "success" | "error"; text: string };

type InvoiceNumberInput = number | "";

type CreateInvoiceItem = {
  id: string;
  serviceId?: string;
  servicePk?: number;
  name: string;
  description: string;
  hsn: string;
  quantity: InvoiceNumberInput;
  price: InvoiceNumberInput;
  total: number;
};

export type InvoiceCreateFormState = {
  clientId: string;
  paymentMode: string;
  paymentTerms: string;
  date: string;
  gstPercentage: string;
  items: CreateInvoiceItem[];
  notes: string;
};

type ServiceLike = {
  id: number;
  service_id: string;
  name: string;
  description?: string;
  hsn?: string;
  price: string | number;
};

type Params = {
  services: ServiceLike[];
  setAdminMessage: (m: AdminMessage) => void;
  onCreated: () => void | Promise<void>;
};

export function useInvoiceCreateForm({ services, setAdminMessage, onCreated }: Params) {
  const emptyInvoiceState: InvoiceCreateFormState = useMemo(
    () => ({
      clientId: "",
      paymentMode: "",
      paymentTerms: "",
      date: new Date().toISOString().slice(0, 10),
      gstPercentage: "0",
      items: [],
      notes: "",
    }),
    []
  );

  const [invoiceForm, setInvoiceForm] = useState<InvoiceCreateFormState>(emptyInvoiceState);

  const updateInvoiceItem = useCallback(
    (index: number, field: keyof CreateInvoiceItem, value: any) => {
      setInvoiceForm((prev) => {
        const newItems = [...prev.items];
        const item = { ...newItems[index] };

        if (field === "servicePk") {
          const service = services.find((s) => s.id === parseInt(String(value)));
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

        const gst = Number(prev.gstPercentage || 0);
        const basePrice = Number(item.price || 0) * Number(item.quantity || 0);
        item.total = basePrice + basePrice * (gst / 100);

        newItems[index] = item;
        return { ...prev, items: newItems };
      });
    },
    [services]
  );

  const handleCreateInvoice = useCallback(async () => {
    if (!invoiceForm.clientId || !invoiceForm.paymentMode || !invoiceForm.paymentTerms || invoiceForm.items.length === 0) {
      setAdminMessage({ type: "error", text: "Fill all required fields." });
      return;
    }

    const payload = {
      client: parseInt(invoiceForm.clientId),
      payment_mode: parseInt(invoiceForm.paymentMode),
      payment_term: parseInt(invoiceForm.paymentTerms),
      start_date: invoiceForm.date,
      gst_percentage: Number(invoiceForm.gstPercentage || 0),
      items: invoiceForm.items.map((item) => ({
        service: item.servicePk,
        description: item.description || item.name,
        unit_price: String(item.price || 0),
        quantity: Number(item.quantity || 0),
      })),
    };

    try {
      await api.invoice.create(payload);
      setInvoiceForm(emptyInvoiceState);
      await onCreated();
    } catch (e: any) {
      setAdminMessage({ type: "error", text: e?.message || "Failed." });
    }
  }, [emptyInvoiceState, invoiceForm, onCreated, setAdminMessage]);

  return {
    emptyInvoiceState,
    invoiceForm,
    setInvoiceForm,
    updateInvoiceItem,
    handleCreateInvoice,
  };
}
