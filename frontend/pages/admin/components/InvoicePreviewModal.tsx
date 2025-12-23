import React from "react";
import { FileText, X } from "lucide-react";

export type InvoicePreviewModalProps = {
  open: boolean;
  previewData: { id: number | string; html: string } | null;
  onClose: () => void;
};

const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  open,
  previewData,
  onClose,
}) => {
  if (!open || !previewData) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <FileText size={20} className="text-[#6C5CE7]" /> Invoice Preview
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[80vh] bg-slate-100">
          <div
            className="bg-white rounded-2xl p-4"
            dangerouslySetInnerHTML={{ __html: previewData.html }}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewModal;
