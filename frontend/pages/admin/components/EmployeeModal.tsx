import React from "react";
import { Users, X } from "lucide-react";

export type EmployeeFormState = {
  salutation: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
};

export type EmployeeModalProps = {
  open: boolean;
  editingEmployeeId: string | number | null;
  employeeForm: EmployeeFormState;
  setEmployeeForm: React.Dispatch<React.SetStateAction<EmployeeFormState>>;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
};

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  open,
  editingEmployeeId,
  employeeForm,
  setEmployeeForm,
  onClose,
  onSave,
  onDelete,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Users size={20} className="text-[#6C5CE7]" />
            {editingEmployeeId ? "Edit Employee" : "Add Employee"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Salutation
              </label>
              <select
                value={employeeForm.salutation}
                onChange={(e) =>
                  setEmployeeForm((p) => ({
                    ...p,
                    salutation: e.target.value,
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

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                First Name
              </label>
              <input
                value={employeeForm.firstName}
                onChange={(e) =>
                  setEmployeeForm((p) => ({
                    ...p,
                    firstName: e.target.value,
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
                value={employeeForm.lastName}
                onChange={(e) =>
                  setEmployeeForm((p) => ({
                    ...p,
                    lastName: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Role
              </label>
              <select
                value={employeeForm.role}
                onChange={(e) =>
                  setEmployeeForm((p) => ({ ...p, role: e.target.value }))
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="superadmin">superadmin</option>
                <option value="manager">manager</option>
                <option value="content_writer">content_writer</option>
                <option value="designer">designer</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Phone
              </label>
              <input
                value={employeeForm.phone}
                onChange={(e) =>
                  setEmployeeForm((p) => ({
                    ...p,
                    phone: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
              Email
            </label>
            <input
              value={employeeForm.email}
              onChange={(e) =>
                setEmployeeForm((p) => ({
                  ...p,
                  email: e.target.value,
                }))
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          {editingEmployeeId && onDelete && (
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

export default EmployeeModal;
