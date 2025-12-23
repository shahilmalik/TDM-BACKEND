import React from "react";
import { Plus, Search, UserCircle } from "lucide-react";

export type ClientsTabProps = {
  clientSearch: string;
  setClientSearch: (value: string) => void;
  clientFilter: any;
  setClientFilter: (value: any) => void;

  clientsList: Array<{
    id: string;
    businessName: string;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
    isActive: boolean;
  }>;

  openCreateClientModal: () => void;
  openClientDetail: (clientId: string) => void;

  clientsListSentinelRef: React.RefObject<HTMLDivElement>;
};

const ClientsTab: React.FC<ClientsTabProps> = ({
  clientSearch,
  setClientSearch,
  clientFilter,
  setClientFilter,
  clientsList,
  openCreateClientModal,
  openClientDetail,
  clientsListSentinelRef,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Clients</h2>
          <p className="text-slate-500">Create and manage client accounts.</p>
        </div>
        <button
          onClick={openCreateClientModal}
          className="bg-[#0F172A] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 font-bold shadow-lg transition-all"
        >
          <Plus size={20} /> Add Client
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value as any)}
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600">Business</th>
              <th className="px-6 py-4 font-bold text-slate-600">Contact</th>
              <th className="px-6 py-4 font-bold text-slate-600">Email</th>
              <th className="px-6 py-4 font-bold text-slate-600">Phone</th>
              <th className="px-6 py-4 font-bold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clientsList.map((c) => (
              <tr
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => openClientDetail(c.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openClientDetail(c.id);
                  }
                }}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-bold text-slate-800">{c.businessName}</td>
                <td className="px-6 py-4 text-slate-800">{c.contactName || "—"}</td>
                <td className="px-6 py-4 text-slate-800">{c.email || "—"}</td>
                <td className="px-6 py-4 text-slate-800">{c.phone || "—"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      c.isActive
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-slate-50 text-slate-600 border-slate-200"
                    }`}
                  >
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {clientsList.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <UserCircle size={44} className="mx-auto mb-3 opacity-40" />
            No clients yet.
          </div>
        )}

        <div ref={clientsListSentinelRef} />
      </div>
    </div>
  );
};

export default ClientsTab;
