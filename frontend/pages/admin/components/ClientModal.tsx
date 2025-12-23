import React from "react";
import { UserCircle, X } from "lucide-react";

export type ClientFormState = {
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

export type ClientModalProps = {
  open: boolean;
  editingClientId: string | null;
  clientForm: ClientFormState;
  setClientForm: React.Dispatch<React.SetStateAction<ClientFormState>>;
  onClose: () => void;
  onSave: () => void;
};

const ClientModal: React.FC<ClientModalProps> = ({
  open,
  editingClientId,
  clientForm,
  setClientForm,
  onClose,
  onSave,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <UserCircle size={20} className="text-[#6C5CE7]" />
            {editingClientId ? "Edit Client" : "Add Client"}
          </h3>
          <button
            onClick={onClose}
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
            <h4 className="font-bold text-slate-800 mb-4">Contact Person</h4>
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
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="bg-[#6C5CE7] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5a4ad1]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientModal;
