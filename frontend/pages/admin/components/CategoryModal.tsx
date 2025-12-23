import React from "react";
import { Tag, Trash2, X } from "lucide-react";

type CategoryLike = { id: string; name: string };

type Props = {
  open: boolean;
  categories: CategoryLike[];
  newCategoryName: string;
  setNewCategoryName: (v: string) => void;
  onAdd: () => void;
  onDelete: (categoryId: string) => void;
  onClose: () => void;
};

const CategoryModal: React.FC<Props> = ({
  open,
  categories,
  newCategoryName,
  setNewCategoryName,
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
            <Tag size={20} className="text-[#6C5CE7]" /> Categories
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
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="New category name"
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
            {categories.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between">
                <div className="font-bold text-slate-800">{c.name}</div>
                <button
                  onClick={() => onDelete(c.id)}
                  className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="p-6 text-center text-slate-400">No categories.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
