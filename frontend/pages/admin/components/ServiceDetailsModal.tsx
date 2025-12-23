import React from "react";
import { Briefcase, Loader2, X } from "lucide-react";

type ServiceDetail = {
  id: number;
  service_id?: string;
  name?: string;
  price?: number | string;
  hsn?: string;
  description?: string;
  is_pipeline?: boolean;
  is_active?: boolean;
  category?: { name?: string };
  pipeline_config?: Array<{ prefix?: string; count?: number }>;
};

interface ServiceDetailsModalProps {
  open: boolean;
  service: ServiceDetail | null;
  isLoading: boolean;
  onClose: () => void;
  onEdit: (service: ServiceDetail) => void;
  onDelete: (serviceId: number) => void | Promise<void>;
}

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  open,
  service,
  isLoading,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!open || !service) return null;

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
            <Briefcase size={20} className="text-[#6C5CE7]" /> Service Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Loader2 className="animate-spin" size={18} /> Loading…
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Service ID
              </div>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                {service.service_id || "—"}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Category
              </div>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                {service.category?.name || "—"}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Name
              </div>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                {service.name || "—"}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Price
              </div>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                {typeof service.price === "number"
                  ? service.price.toFixed(2)
                  : (service.price as any) ?? "—"}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                HSN
              </div>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                {service.hsn || "—"}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Pipeline
              </div>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                {service.is_pipeline ? "Yes" : "No"}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Status
              </div>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                {service.is_active ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">
                Description
              </div>
              <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 whitespace-pre-wrap">
                {service.description || "—"}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <div className="font-bold text-slate-800 mb-3">
              Pipeline Prefixes / Config
            </div>

            {!service.is_pipeline && (
              <div className="text-slate-500">Not a pipeline service.</div>
            )}

            {service.is_pipeline && (
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-5 bg-slate-50 px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="col-span-3">Prefix</div>
                  <div className="col-span-2">Count</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {(service.pipeline_config || []).length === 0 && (
                    <div className="px-4 py-4 text-slate-500">
                      No pipeline config.
                    </div>
                  )}
                  {(service.pipeline_config || []).map((row, idx) => (
                    <div key={idx} className="grid grid-cols-5 px-4 py-3">
                      <div className="col-span-3 font-bold text-slate-800">
                        {row.prefix || "—"}
                      </div>
                      <div className="col-span-2 font-bold text-slate-800">
                        {row.count ?? "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(service)}
            className="bg-[#0F172A] text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(service.id)}
            className="px-6 py-3 rounded-xl font-bold text-red-600 border border-red-200 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
