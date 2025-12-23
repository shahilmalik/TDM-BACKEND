import { useCallback, useState } from "react";
import { api } from "../../../services/api";
import type { AdminCompanyDetails } from "../../../types";

type AdminMessage = { type: "success" | "error"; text: string };

type Params = {
  setAdminMessage: (m: AdminMessage) => void;
};

export function useCompanyProfile({ setAdminMessage }: Params) {
  const [companyDetails, setCompanyDetails] = useState<AdminCompanyDetails>({
    name: "",
    address: "",
    phone: "",
    email: "",
    secondaryEmail: "",
    gstin: "",
    bankDetails: {
      accountName: "",
      bankName: "",
      accountNumber: "",
      ifsc: "",
    },
    paymentModes: [],
    paymentTerms: [],
  });

  const fetchCompanyProfile = useCallback(async () => {
    try {
      const data = await api.invoice.getSenderInfo();

      const mapped = {
        name: data?.name ?? "",
        address: data?.address ?? "",
        phone: data?.phone ?? "",
        email: data?.email ?? "",
        secondaryEmail: data?.secondary_email ?? "",
        gstin: data?.gstin ?? "",
        bankDetails: {
          accountName: data?.bank_account_name ?? "",
          bankName: data?.bank_name ?? "",
          accountNumber: data?.bank_account_number ?? "",
          ifsc: data?.ifsc ?? "",
        },
      };

      setCompanyDetails((prev) => ({
        ...prev,
        ...mapped,
        bankDetails: {
          ...prev.bankDetails,
          ...mapped.bankDetails,
        },
      }));
    } catch (e: any) {
      setAdminMessage({
        type: "error",
        text: e?.message || "Failed to load company profile.",
      });
    }
  }, [setAdminMessage]);

  const handleSaveCompanyProfile = useCallback(async () => {
    try {
      const payload = {
        name: companyDetails.name,
        address: companyDetails.address,
        phone: companyDetails.phone,
        email: companyDetails.email,
        secondary_email: companyDetails.secondaryEmail,
        gstin: companyDetails.gstin,
        bank_account_name: companyDetails.bankDetails.accountName,
        bank_account_number: companyDetails.bankDetails.accountNumber,
        bank_name: companyDetails.bankDetails.bankName,
        ifsc: companyDetails.bankDetails.ifsc,
      };
      await api.invoice.updateSenderInfo(payload);
      setAdminMessage({
        type: "success",
        text: "Company profile updated successfully.",
      });
      fetchCompanyProfile();
    } catch (e: any) {
      setAdminMessage({
        type: "error",
        text: e?.message || "Failed to update company profile.",
      });
    }
  }, [companyDetails, fetchCompanyProfile, setAdminMessage]);

  return {
    companyDetails,
    setCompanyDetails,
    fetchCompanyProfile,
    handleSaveCompanyProfile,
  };
}
