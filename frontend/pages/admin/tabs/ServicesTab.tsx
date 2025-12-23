import React from "react";
import { Briefcase, Filter, Plus } from "lucide-react";

export type ServicesTabProps = {
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  serviceActiveFilter: any;
  setServiceActiveFilter: (value: any) => void;
  serviceCategoryFilterOptions: Array<{ value: string; label: string }>;
  serviceActiveFilterOptions: Array<{ value: any; label: string }>;

  filteredServices: Array<{
    id: string;
    service_id: string;
    name: string;
    price?: string | number | null;
    is_active: boolean;
    category?: { name?: string | null } | null;
  }>;
  servicesList: any[];
  servicesListSentinelRef: React.RefObject<HTMLDivElement>;

  openServiceDetail: (serviceId: string) => void;

  // Modal wiring
  setIsCategoryModalOpen: (open: boolean) => void;
  setEditingServiceId: (id: string | null) => void;
  setNewService: (value: any) => void;
  setIsServiceModalOpen: (open: boolean) => void;
};

const ServicesTab: React.FC<ServicesTabProps> = ({
  categoryFilter,
  setCategoryFilter,
  serviceActiveFilter,
  setServiceActiveFilter,
  serviceCategoryFilterOptions,
  serviceActiveFilterOptions,
  filteredServices,
  servicesList,
  servicesListSentinelRef,
  openServiceDetail,
  setIsCategoryModalOpen,
  setEditingServiceId,
  setNewService,
  setIsServiceModalOpen,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Services</h2>
          <p className="text-slate-500">Manage service catalog and categories.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-50"
          >
            Manage Categories
          </button>
          <button
            onClick={() => {
              setEditingServiceId(null);
              setNewService({
                service_id: "",
                name: "",
                description: "",
                price: "",
                categoryId: "",
                hsn: "",
                isPipeline: false,
                pipelineConfig: [{ prefix: "", count: 0 }],
                platforms: [],
                otherPlatform: "",
              });
              setIsServiceModalOpen(true);
            }}
            className="bg-[#0F172A] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 font-bold shadow-lg transition-all"
          >
            <Plus size={20} /> Add Service
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
          <Filter size={16} />
          <span>Filters:</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm font-medium">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              {(serviceCategoryFilterOptions.length
                ? serviceCategoryFilterOptions
                : [{ value: "All", label: "All" }]
              ).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm font-medium">Status</span>
            <select
              value={serviceActiveFilter}
              onChange={(e) => setServiceActiveFilter(e.target.value as any)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            >
              {(serviceActiveFilterOptions.length
                ? serviceActiveFilterOptions
                : [
                    { value: "all", label: "All" },
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]
              ).map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600">Service ID</th>
              <th className="px-6 py-4 font-bold text-slate-600">Service</th>
              <th className="px-6 py-4 font-bold text-slate-600">Category</th>
              <th className="px-6 py-4 font-bold text-slate-600">Status</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-right">Price</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredServices.map((srv) => (
              <tr
                key={srv.id}
                role="button"
                tabIndex={0}
                onClick={() => openServiceDetail(srv.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openServiceDetail(srv.id);
                  }
                }}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-mono text-sm text-slate-500">{srv.service_id}</td>
                <td className="px-6 py-4 font-bold text-slate-800">{srv.name}</td>
                <td className="px-6 py-4 text-slate-800">{srv.category?.name || "—"}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                      srv.is_active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {srv.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-slate-800 font-bold">
                  ₹{Number(srv.price || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {servicesList.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            <Briefcase size={44} className="mx-auto mb-3 opacity-40" />
            No services yet.
          </div>
        )}

        <div ref={servicesListSentinelRef} />
      </div>
    </div>
  );
};

export default ServicesTab;
