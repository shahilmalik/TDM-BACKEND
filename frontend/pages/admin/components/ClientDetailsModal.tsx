import React from "react";
import {
  CheckCircle2,
  Edit2,
  Eye,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Trash2,
  UserCircle,
  X,
} from "lucide-react";

export type ClientDetailsModalProps = {
  selectedClientDetail: any;
  onClose: () => void;
  openEditClientModal: (c: any) => void;
  handleDeleteClient: (id: string) => Promise<void> | void;
  formatPhoneWithCountry: (countryCode?: string, phone?: string) => string;
  metaPages: any[];
  selectedClientMetaPageId: string;
  setSelectedClientMetaPageId: (value: string) => void;
  handleSyncClientMetaPage: () => void;
  isMetaSyncLoading: boolean;
};

const ClientDetailsModal: React.FC<ClientDetailsModalProps> = ({
  selectedClientDetail,
  onClose,
  openEditClientModal,
  handleDeleteClient,
  formatPhoneWithCountry,
  metaPages,
  selectedClientMetaPageId,
  setSelectedClientMetaPageId,
  handleSyncClientMetaPage,
  isMetaSyncLoading,
}) => {
  if (!selectedClientDetail) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Eye size={20} className="text-[#6C5CE7]" /> Client Details
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                openEditClientModal(selectedClientDetail);
                onClose();
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1"
            >
              <Edit2 size={16} /> Edit
            </button>
            <button
              onClick={async () => {
                const ok = window.confirm("Delete client?");
                if (!ok) return;
                await handleDeleteClient(selectedClientDetail.id);
                onClose();
              }}
              className="px-3 py-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 font-bold text-xs flex items-center gap-1"
            >
              <Trash2 size={16} /> Delete
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          <div>
            <div className="font-bold text-slate-900 text-lg">
              {selectedClientDetail.businessName}
            </div>
            <div className="mt-1 text-sm text-slate-500 flex items-center gap-2">
              <ShieldCheck size={14} />
              {selectedClientDetail.isActive ? "Active" : "Inactive"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Business
              </div>
              <div className="space-y-2 text-slate-700">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5" />
                  <span className="whitespace-pre-line">
                    {selectedClientDetail.businessDetails?.address ||
                      selectedClientDetail.address ||
                      "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  <span>GSTIN: {selectedClientDetail.gstin || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  <span>
                    Business Email: {selectedClientDetail.businessDetails?.email || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  <span>
                    Business Phone: {selectedClientDetail.businessDetails?.phone || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  <span>
                    WhatsApp Updates: {selectedClientDetail.businessDetails?.whatsappConsent ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Responsible Person
              </div>
              <div className="font-bold text-slate-800">
                {selectedClientDetail.contactName || "—"}
              </div>
              <div className="mt-2 space-y-2 text-slate-700">
                <div className="flex items-center gap-2">
                  <Mail size={14} />
                  <span>Email: {selectedClientDetail.email || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} />
                  <span>Phone: {selectedClientDetail.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCircle size={14} />
                  <span>Role: client</span>
                </div>
              </div>
            </div>
          </div>

          {((selectedClientDetail as any).__backend?.profile ||
            (selectedClientDetail as any).__backend?.user) && (
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Additional Details
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="text-slate-700">
                  <span className="text-slate-500">Client Code:</span>{" "}
                  {(selectedClientDetail as any).__backend?.profile?.client_code || "—"}
                </div>
                <div className="text-slate-700">
                  <span className="text-slate-500">Business Email (raw):</span>{" "}
                  {(selectedClientDetail as any).__backend?.profile?.business_email || "—"}
                </div>
                <div className="text-slate-700">
                  <span className="text-slate-500">Business Phone (raw):</span>{" "}
                  {formatPhoneWithCountry(
                    (selectedClientDetail as any).__backend?.profile?.business_phone_country_code,
                    (selectedClientDetail as any).__backend?.profile?.business_phone
                  ) || "—"}
                </div>
                <div className="text-slate-700">
                  <span className="text-slate-500">Profile Created:</span>{" "}
                  {(selectedClientDetail as any).__backend?.profile?.created_at
                    ? new Date(
                        (selectedClientDetail as any).__backend.profile.created_at
                      ).toLocaleString()
                    : "—"}
                </div>
                <div className="text-slate-700">
                  <span className="text-slate-500">Contact Created:</span>{" "}
                  {(selectedClientDetail as any).__backend?.user?.created_at
                    ? new Date((selectedClientDetail as any).__backend.user.created_at).toLocaleString()
                    : "—"}
                </div>
                <div className="text-slate-700">
                  <span className="text-slate-500">Pending Email:</span>{" "}
                  {(selectedClientDetail as any).__backend?.profile?.pending_contact_email || "—"}
                </div>
                <div className="text-slate-700">
                  <span className="text-slate-500">Pending Email Verified:</span>{" "}
                  {(selectedClientDetail as any).__backend?.profile?.pending_contact_email_verified
                    ? "Yes"
                    : "No"}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-2xl p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
              Meta Sync
            </div>
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <select
                value={selectedClientMetaPageId}
                onChange={(e) => setSelectedClientMetaPageId(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="">-- Select Account/Page --</option>
                {metaPages.map((p) => (
                  <option key={`${p.token_id}-${p.fb_page_id}`} value={p.fb_page_id}>
                    {p.fb_page_name} — {p.account_label}
                  </option>
                ))}
              </select>

              <button
                onClick={handleSyncClientMetaPage}
                disabled={isMetaSyncLoading}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-[#6C5CE7] hover:bg-[#5a4ad1] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isMetaSyncLoading ? "Syncing..." : "Sync"}
              </button>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Select a Meta page/account and click Sync to link it to this client.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsModal;
