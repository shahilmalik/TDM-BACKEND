import React from "react";
import { Plus, Users } from "lucide-react";

export type EmployeesTabProps = {
  employees: Array<{
    id: string;
    name: string;
    role?: string | null;
    email?: string | null;
    phone?: string | null;
  }>;

  openCreateEmployeeModal: () => void;
  openEditEmployeeModal: (employee: any) => void;

  employeesSentinelRef: React.RefObject<HTMLDivElement>;
};

const EmployeesTab: React.FC<EmployeesTabProps> = ({
  employees,
  openCreateEmployeeModal,
  openEditEmployeeModal,
  employeesSentinelRef,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Employees</h2>
          <p className="text-slate-500">Manage internal team accounts.</p>
        </div>
        <button
          onClick={openCreateEmployeeModal}
          className="bg-[#0F172A] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 font-bold shadow-lg transition-all"
        >
          <Plus size={20} /> Add Employee
        </button>
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600">Name</th>
              <th className="px-6 py-4 font-bold text-slate-600">Role</th>
              <th className="px-6 py-4 font-bold text-slate-600">Email</th>
              <th className="px-6 py-4 font-bold text-slate-600">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {employees.map((e) => (
              <tr
                key={e.id}
                role="button"
                tabIndex={0}
                onClick={() => openEditEmployeeModal(e)}
                onKeyDown={(evt) => {
                  if (evt.key === "Enter" || evt.key === " ") {
                    evt.preventDefault();
                    openEditEmployeeModal(e);
                  }
                }}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-bold text-slate-800">{e.name}</td>
                <td className="px-6 py-4 text-slate-800">{e.role || "—"}</td>
                <td className="px-6 py-4 text-slate-800">{e.email || "—"}</td>
                <td className="px-6 py-4 text-slate-800">{e.phone || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {employees.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Users size={44} className="mx-auto mb-3 opacity-40" />
            No employees yet.
          </div>
        )}

        <div ref={employeesSentinelRef} />
      </div>
    </div>
  );
};

export default EmployeesTab;
