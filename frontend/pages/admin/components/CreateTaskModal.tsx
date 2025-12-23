import React from "react";
import { X } from "lucide-react";

export type CreateTaskModalProps = {
  open: boolean;
  loading: boolean;
  error: string | null;
  title: string;
  onTitleChange: (value: string) => void;
  serviceId: string;
  onServiceIdChange: (value: string) => void;
  invoiceId: string;
  onInvoiceIdChange: (value: string) => void;
  services: Array<{ id: string; label: string }>;
  invoices: Array<{ id: string; label: string }>;
  onClose: () => void;
  onSubmit: () => void;
};

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  open,
  loading,
  error,
  title,
  onTitleChange,
  serviceId,
  onServiceIdChange,
  invoiceId,
  onInvoiceIdChange,
  services,
  invoices,
  onClose,
  onSubmit,
}) => {
  if (!open) return null;

  const isDisabled = !title.trim() || !serviceId || !invoiceId || Boolean(loading);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Add Task</h3>
            <p className="text-sm text-slate-500">
              Tasks must be linked to an invoice and start in Backlog.
            </p>
          </div>
          <button
            type="button"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
            onClick={onClose}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6C5CE7]"
              placeholder="Enter title..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
              Service
            </label>
            <select
              value={serviceId}
              onChange={(e) => onServiceIdChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6C5CE7]"
              disabled={loading}
            >
              <option value="">
                {loading ? "Loading services..." : "Select a service"}
              </option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
              Invoice
            </label>
            <select
              value={invoiceId}
              onChange={(e) => onInvoiceIdChange(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6C5CE7]"
              disabled={loading}
            >
              <option value="">
                {loading ? "Loading invoices..." : "Select an invoice"}
              </option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDisabled}
            onClick={onSubmit}
            className="flex-1 py-3 bg-[#6C5CE7] text-white rounded-xl font-bold disabled:opacity-50 hover:bg-violet-700 transition-all"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
