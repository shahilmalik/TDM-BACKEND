import React from "react";
import { Briefcase, Plus, Trash2, X } from "lucide-react";

type PipelineRow = { prefix: string; count: number };

type NewServiceLike = {
  categoryId: string;
  service_id: string;
  name: string;
  price: any;
  description: string;
  hsn: string;
  isPipeline: boolean;
  pipelineConfig: PipelineRow[];
  platforms?: string[];
  otherPlatform?: string;
};

type CategoryLike = { id: string; name: string };

export type PlatformOption = { value: string; label: string };

type Props = {
  open: boolean;
  editingServiceId: string | null;
  newService: NewServiceLike;
  setNewService: React.Dispatch<React.SetStateAction<any>>;
  categories: CategoryLike[];
  platformOptions: PlatformOption[];
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
  onCategoryChange: (categoryId: string) => void;
  addPipelineRow: () => void;
  removePipelineRow: (idx: number) => void;
  updatePipelineRow: (idx: number, field: string, value: any) => void;
  onDeleteServiceConfirm?: () => Promise<void> | void;
};

const ServiceModal: React.FC<Props> = ({
  open,
  editingServiceId,
  newService,
  setNewService,
  categories,
  platformOptions,
  onClose,
  onSave,
  onDelete,
  onCategoryChange,
  addPipelineRow,
  removePipelineRow,
  updatePipelineRow,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Briefcase size={20} className="text-[#6C5CE7]" />
            {editingServiceId ? "Edit Service" : "Add Service"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={newService.categoryId}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Service ID {!editingServiceId && "(Auto-generated)"}
              </label>
              <input
                value={newService.service_id}
                readOnly
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl outline-none text-slate-600 cursor-not-allowed"
                placeholder={
                  newService.categoryId
                    ? "Will be auto-generated"
                    : "Select category first"
                }
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Name
              </label>
              <input
                value={newService.name}
                onChange={(e) =>
                  setNewService((p: any) => ({ ...p, name: e.target.value }))
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Price
              </label>
              <input
                type="number"
                value={newService.price}
                onChange={(e) =>
                  setNewService((p: any) => ({ ...p, price: e.target.value }))
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Description
              </label>
              <textarea
                rows={2}
                value={newService.description}
                onChange={(e) =>
                  setNewService((p: any) => ({
                    ...p,
                    description: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                HSN
              </label>
              <input
                value={newService.hsn}
                onChange={(e) =>
                  setNewService((p: any) => ({ ...p, hsn: e.target.value }))
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div className="flex items-end gap-3">
              <label className="flex items-center gap-2 font-bold text-slate-700">
                <input
                  type="checkbox"
                  checked={newService.isPipeline}
                  onChange={(e) =>
                    setNewService((p: any) => ({
                      ...p,
                      isPipeline: e.target.checked,
                    }))
                  }
                />
                Pipeline Service
              </label>
            </div>
          </div>

          {newService.isPipeline && (
            <div className="border-t border-slate-100 pt-5">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-slate-800">Pipeline Config</h4>
                <button
                  onClick={addPipelineRow}
                  className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 flex items-center gap-2"
                  type="button"
                >
                  <Plus size={16} /> Add Row
                </button>
              </div>

              <div className="space-y-2">
                {newService.pipelineConfig.map((row, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-5 gap-2 items-center"
                  >
                    <input
                      value={row.prefix}
                      onChange={(e) =>
                        updatePipelineRow(idx, "prefix", e.target.value)
                      }
                      placeholder="Prefix"
                      className="col-span-3 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                    <input
                      type="number"
                      value={row.count}
                      onChange={(e) =>
                        updatePipelineRow(idx, "count", Number(e.target.value))
                      }
                      placeholder="Count"
                      className="col-span-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                    <button
                      onClick={() => removePipelineRow(idx)}
                      className="col-span-1 p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Platforms
                </label>
                <div className="flex flex-wrap gap-2">
                  {platformOptions.map((opt) => {
                    const checked = (newService.platforms || []).includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className={
                          "px-3 py-2 rounded-xl border text-sm font-bold cursor-pointer select-none flex items-center gap-2 " +
                          (checked
                            ? "bg-[#6C5CE7] text-white border-[#6C5CE7]"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")
                        }
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set(newService.platforms || []);
                            if (e.target.checked) next.add(opt.value);
                            else next.delete(opt.value);
                            setNewService((p: any) => ({
                              ...p,
                              platforms: Array.from(next),
                            }));
                          }}
                        />
                        {opt.value === "other" ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-current text-xs">
                            +
                          </span>
                        ) : null}
                        {opt.label}
                      </label>
                    );
                  })}
                </div>

                {(newService.platforms || []).includes("other") && (
                  <div className="mt-2">
                    <input
                      value={newService.otherPlatform || ""}
                      onChange={(e) =>
                        setNewService((p: any) => ({
                          ...p,
                          otherPlatform: e.target.value,
                        }))
                      }
                      placeholder="Type platform name"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                )}

                {newService.isPipeline && (newService.platforms || []).length === 0 && (
                  <div className="mt-2 text-xs text-red-600 font-semibold">
                    Select at least one platform.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          {editingServiceId && onDelete && (
            <button
              onClick={onDelete}
              className="px-6 py-3 rounded-xl font-bold text-red-600 border border-red-200 hover:bg-red-50"
            >
              Delete
            </button>
          )}
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

export default ServiceModal;
