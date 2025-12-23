import React from "react";
import { CreditCard, Trash2, X } from "lucide-react";

export type PaymentModeModalProps = {
  open: boolean;
  newPaymentModeName: string;
  setNewPaymentModeName: (value: string) => void;
  paymentModes: Array<{ id: number; name: string }>;
  onAdd: () => void;
  onDelete: (id: number) => void;
  onClose: () => void;
};

const PaymentModeModal: React.FC<PaymentModeModalProps> = ({
  open,
  newPaymentModeName,
  setNewPaymentModeName,
  paymentModes,
  onAdd,
  onDelete,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CreditCard size={20} className="text-[#6C5CE7]" /> Payment Modes
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            <input
              value={newPaymentModeName}
              onChange={(e) => setNewPaymentModeName(e.target.value)}
              placeholder="New payment mode"
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
            <button
              onClick={onAdd}
              className="bg-[#0F172A] text-white px-5 py-2.5 rounded-xl font-bold"
            >
              Add
            </button>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {paymentModes.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between">
                <div className="font-bold text-slate-800">{m.name}</div>
                <button
                  onClick={() => onDelete(m.id)}
                  className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {paymentModes.length === 0 && (
              <div className="p-6 text-center text-slate-400">No modes.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModeModal;
