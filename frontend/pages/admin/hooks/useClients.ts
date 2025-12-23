import { useCallback, useRef, useState } from "react";
import { api } from "../../../services/api";
import { AdminClient } from "../../../types";

export type ClientFilter = "all" | "active" | "inactive";

type AdminMessage = { type: "success" | "error"; text: string };

type ClientFormState = {
  id: string | number | null;
  companyName: string;
  billingAddress: string;
  gstin: string;
  businessEmail: string;
  businessPhone: string;
  whatsappUpdates: boolean;
  contactPerson: {
    salutation: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
};

export function useClients(params: {
  clientSearch: string;
  clientFilter: ClientFilter;
  setAdminMessage: (m: AdminMessage) => void;
}) {
  const { clientSearch, clientFilter, setAdminMessage } = params;

  // Full client list for Pipeline tab (CustomUser ids)
  const [clients, setClients] = useState<AdminClient[]>([]);

  // Paginated list for Clients tab (Client profile ids)
  const [clientsList, setClientsList] = useState<AdminClient[]>([]);
  const [clientsListPage, setClientsListPage] = useState(1);
  const [clientsListHasNext, setClientsListHasNext] = useState(false);
  const [clientsListLoading, setClientsListLoading] = useState(false);
  const clientsListSentinelRef = useRef<HTMLDivElement | null>(null);

  // Modals/forms
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [clientForm, setClientForm] = useState<ClientFormState>({
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

  const formatPhoneWithCountry = useCallback(
    (countryCode?: string, phone?: string) => {
      const p = (phone || "").toString().trim();
      if (!p) return "";
      if (p.startsWith("+")) return p;
      const cc = (countryCode || "").toString().trim().replace(/^\+/, "");
      if (!cc) return p;
      if (p.startsWith(cc)) return `+${p}`;
      return `+${cc}${p}`;
    },
    []
  );

  const fetchClients = useCallback(async () => {
    try {
      // Full client list for Pipeline tab (and any non-paginated needs)
      const res: any = await api.clients.list({ page: 1, page_size: 1000 });
      const data = Array.isArray(res) ? res : res?.results || [];
      const mapped = data.map((c: any) => {
        const u = c.user_detail || {};
        const userId = u.id ?? c.user_id ?? c.user;
        const contactName = `${u.salutation || ""} ${u.first_name || ""} ${
          u.last_name || ""
        }`.trim();
        const contactPhone = formatPhoneWithCountry(u.country_code, u.phone);
        const businessPhone = formatPhoneWithCountry(
          c.business_phone_country_code,
          c.business_phone
        );

        return {
          // IMPORTANT: pipeline selection must use CustomUser id
          id: userId ?? c.id,
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
        } as AdminClient;
      });
      setClients(mapped);
    } catch (e) {
      console.error("Failed to fetch clients", e);
    }
  }, [formatPhoneWithCountry]);

  const resetClientsList = useCallback(async () => {
    setClientsListLoading(true);
    try {
      const res: any = await api.clients.list({
        page: 1,
        page_size: 20,
        search: clientSearch || undefined,
        status: clientFilter,
      });
      const data = Array.isArray(res) ? res : res?.results || [];

      const mapped = data.map((c: any) => {
        const u = c.user_detail || {};
        const contactName = `${u.salutation || ""} ${u.first_name || ""} ${
          u.last_name || ""
        }`.trim();
        const contactPhone = formatPhoneWithCountry(u.country_code, u.phone);
        const businessPhone = formatPhoneWithCountry(
          c.business_phone_country_code,
          c.business_phone
        );

        return {
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
        } as AdminClient;
      });

      setClientsList(mapped);
      setClientsListPage(1);
      setClientsListHasNext(!!res?.next);
    } catch (e) {
      console.error("Failed to fetch clients list", e);
    } finally {
      setClientsListLoading(false);
    }
  }, [clientFilter, clientSearch, formatPhoneWithCountry]);

  const fetchMoreClientsList = useCallback(async () => {
    if (clientsListLoading || !clientsListHasNext) return;
    const nextPage = clientsListPage + 1;
    setClientsListLoading(true);
    try {
      const res: any = await api.clients.list({
        page: nextPage,
        page_size: 20,
        search: clientSearch || undefined,
        status: clientFilter,
      });
      const data = Array.isArray(res) ? res : res?.results || [];

      const mapped = data.map((c: any) => {
        const u = c.user_detail || {};
        const contactName = `${u.salutation || ""} ${u.first_name || ""} ${
          u.last_name || ""
        }`.trim();
        const contactPhone = formatPhoneWithCountry(u.country_code, u.phone);
        const businessPhone = formatPhoneWithCountry(
          c.business_phone_country_code,
          c.business_phone
        );

        return {
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
        } as AdminClient;
      });

      setClientsList((prev) => [...prev, ...mapped]);
      setClientsListPage(nextPage);
      setClientsListHasNext(!!res?.next);
    } catch (e) {
      console.error("Failed to fetch more clients", e);
    } finally {
      setClientsListLoading(false);
    }
  }, [
    clientFilter,
    clientSearch,
    clientsListHasNext,
    clientsListLoading,
    clientsListPage,
    formatPhoneWithCountry,
  ]);

  const openCreateClientModal = useCallback(() => {
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
  }, []);

  const openEditClientModal = useCallback((c: AdminClient) => {
    setEditingClientId(String(c.id));
    setClientForm({
      id: (c.id as any) ?? null,
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
  }, []);

  const handleSaveClient = useCallback(async () => {
    try {
      const payload: any = {
        company_name: clientForm.companyName,
        billing_address: clientForm.billingAddress,
        gstin: clientForm.gstin,
        business_email: clientForm.businessEmail,
        business_phone: clientForm.businessPhone,
        whatsapp_updates: !!clientForm.whatsappUpdates,
        user_detail: {
          salutation: clientForm.contactPerson.salutation,
          first_name: clientForm.contactPerson.firstName,
          last_name: clientForm.contactPerson.lastName,
          email: clientForm.contactPerson.email,
          phone: clientForm.contactPerson.phone,
        },
      };

      if (editingClientId) {
        await api.clients.update(editingClientId, payload);
      } else {
        await api.clients.create(payload);
      }

      setIsClientModalOpen(false);
      setEditingClientId(null);
      setAdminMessage({
        type: "success",
        text: editingClientId ? "Client updated." : "Client created.",
      });
      await fetchClients();
      await resetClientsList();
    } catch (e: any) {
      setAdminMessage({ type: "error", text: e?.message || "Failed." });
    }
  }, [clientForm, editingClientId, fetchClients, resetClientsList, setAdminMessage]);

  const handleDeleteClient = useCallback(
    async (id: string) => {
      if (!window.confirm("Delete this client?")) return;
      try {
        await api.clients.delete(id);
        setAdminMessage({ type: "success", text: "Client deleted." });
        await fetchClients();
        await resetClientsList();
      } catch (e: any) {
        setAdminMessage({ type: "error", text: e?.message || "Failed." });
      }
    },
    [fetchClients, resetClientsList, setAdminMessage]
  );

  return {
    // state
    clients,
    clientsList,
    clientsListPage,
    clientsListHasNext,
    clientsListLoading,
    clientsListSentinelRef,

    isClientModalOpen,
    setIsClientModalOpen,
    clientForm,
    setClientForm,
    editingClientId,
    setEditingClientId,

    // actions
    fetchClients,
    resetClientsList,
    fetchMoreClientsList,

    openCreateClientModal,
    openEditClientModal,

    handleSaveClient,
    handleDeleteClient,

    formatPhoneWithCountry,
  };
}
