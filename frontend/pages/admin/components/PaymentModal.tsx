import React from "react";
import { CreditCard as PaymentIcon, X } from "lucide-react";

type PaymentModeOption = { id: string | number; name: string };

interface PaymentModalProps {
  open: boolean;
  selectedInvoice: { invoiceNumber: string; clientName: string } | null;
  paymentAmountInput: number;
  setPaymentAmountInput: (v: number) => void;
  paymentModeIdInput: string;
  setPaymentModeIdInput: (v: string) => void;
  paymentReferenceInput: string;
  setPaymentReferenceInput: (v: string) => void;
  paymentModes: PaymentModeOption[];
  onClose: () => void;
  onSave: () => void | Promise<void>;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  selectedInvoice,
  paymentAmountInput,
  setPaymentAmountInput,
  paymentModeIdInput,
  setPaymentModeIdInput,
  paymentReferenceInput,
  setPaymentReferenceInput,
  paymentModes,
  onClose,
  onSave,
}) => {
  if (!open || !selectedInvoice) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <PaymentIcon size={20} className="text-[#6C5CE7]" /> Record Payment
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-sm text-slate-600 font-medium">
            {selectedInvoice.invoiceNumber} — {selectedInvoice.clientName}
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Amount
              </label>
              <input
                type="number"
                min={0}
                value={paymentAmountInput}
                onChange={(e) => setPaymentAmountInput(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Payment Mode (optional)
              </label>
              <select
                value={paymentModeIdInput}
                onChange={(e) => setPaymentModeIdInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="">-- Select --</option>
                {paymentModes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Reference (optional)
              </label>
              <input
                value={paymentReferenceInput}
                onChange={(e) => setPaymentReferenceInput(e.target.value)}
                placeholder="e.g. UPI txn id"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
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
            className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
