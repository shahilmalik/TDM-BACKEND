import React from "react";
import {
  CheckSquare,
  Download,
  FileSpreadsheet,
  Play,
  Plus,
  Save,
  Search,
  Square,
  Trash2,
  CreditCard as PaymentIcon,
} from "lucide-react";

export type InvoicesTabProps = {
  invoiceView: "list" | "create";
  setInvoiceView: (view: "list" | "create") => void;

  invoiceSearch: string;
  setInvoiceSearch: (value: string) => void;

  invoiceStatusFilter: string;
  setInvoiceStatusFilter: (value: string) => void;
  invoiceStatusOptions: Array<{ value: string; label: string }>;

  invoiceClientFilter: string;
  setInvoiceClientFilter: (value: string) => void;
  invoiceClientOptions: Array<{ id: string; name: string }>;

  invoiceDateRange: { start: string; end: string };
  setInvoiceDateRange: (updater: any) => void;

  selectedInvoiceIds: any[];
  toggleSelectAllVisibleInvoices: () => void;
  allVisibleSelected: boolean;
  handleBulkDownload: () => void;
  toggleInvoiceSelection: (invoiceId: any) => void;

  visibleInvoices: any[];
  expandedInvoiceId: string | null;
  invoiceHistoryById: Record<string, any>;

  toggleInvoiceExpanded: (inv: any) => void;
  getStatusColor: (statusValue: string) => string;

  openRecordPaymentModal: (inv: any) => void;
  handleStartPipeline: (inv: any) => void;
  handleDownloadInvoice: (invoiceId: number, invoiceNumber: string) => void;
  handlePreviewInvoice: (invoiceId: number) => void;

  invoicesSentinelRef: React.RefObject<HTMLDivElement>;

  // Create invoice section props
  invoiceForm: any;
  setInvoiceForm: (updater: any) => void;
  invoiceDropdowns: any;
  updateInvoiceItem: (...args: any[]) => void;
  handleCreateInvoice: () => void;
  services: any[];

  // No runtime prop needed for CreateInvoiceItem; it is a type in the parent.

  setIsPaymentModeModalOpen: (open: boolean) => void;
  setIsPaymentTermModalOpen: (open: boolean) => void;
};

const InvoicesTab: React.FC<InvoicesTabProps> = ({
  invoiceView,
  setInvoiceView,
  invoiceSearch,
  setInvoiceSearch,
  invoiceStatusFilter,
  setInvoiceStatusFilter,
  invoiceStatusOptions,
  invoiceClientFilter,
  setInvoiceClientFilter,
  invoiceClientOptions,
  invoiceDateRange,
  setInvoiceDateRange,
  selectedInvoiceIds,
  toggleSelectAllVisibleInvoices,
  allVisibleSelected,
  handleBulkDownload,
  toggleInvoiceSelection,
  visibleInvoices,
  expandedInvoiceId,
  invoiceHistoryById,
  toggleInvoiceExpanded,
  getStatusColor,
  openRecordPaymentModal,
  handleStartPipeline,
  handleDownloadInvoice,
  handlePreviewInvoice,
  invoicesSentinelRef,
  invoiceForm,
  setInvoiceForm,
  invoiceDropdowns,
  updateInvoiceItem,
  handleCreateInvoice,
  services,
  setIsPaymentModeModalOpen,
  setIsPaymentTermModalOpen,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Invoices</h2>
          <p className="text-slate-500">Create invoices and track payments.</p>
        </div>
        {invoiceView === "list" ? (
          <button
            onClick={() => setInvoiceView("create")}
            className="bg-[#0F172A] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 font-bold shadow-lg transition-all"
          >
            <Plus size={20} /> Create Invoice
          </button>
        ) : (
          <button
            onClick={() => setInvoiceView("list")}
            className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-50"
          >
            Back to List
          </button>
        )}
      </div>

      {invoiceView === "list" ? (
        <>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 space-y-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                placeholder="Search by client name or invoice ID..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
              <div className="flex flex-col md:flex-row md:items-center gap-3 flex-1">
                <select
                  value={invoiceStatusFilter}
                  onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="All">All Status</option>
                  {invoiceStatusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>

                <select
                  value={invoiceClientFilter}
                  onChange={(e) => setInvoiceClientFilter(e.target.value)}
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="All">All Clients</option>
                  {invoiceClientOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={invoiceDateRange.start}
                    onChange={(e) =>
                      setInvoiceDateRange((p: any) => ({
                        ...p,
                        start: e.target.value,
                      }))
                    }
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                  <span className="text-slate-400 text-sm">to</span>
                  <input
                    type="date"
                    value={invoiceDateRange.end}
                    onChange={(e) =>
                      setInvoiceDateRange((p: any) => ({
                        ...p,
                        end: e.target.value,
                      }))
                    }
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>
              </div>

              {selectedInvoiceIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleSelectAllVisibleInvoices}
                    className="bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-bold hover:bg-slate-50 flex items-center gap-2"
                    title={
                      allVisibleSelected
                        ? "Unselect all visible"
                        : "Select all visible"
                    }
                  >
                    {allVisibleSelected ? (
                      <CheckSquare size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                    Select All
                  </button>

                  <button
                    onClick={handleBulkDownload}
                    className="bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Download size={18} /> Bulk Download ({selectedInvoiceIds.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl border overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-600">Select</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Invoice ID</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Client</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Date</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-right">Amount</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visibleInvoices.map((inv) => {
                  const rowId = String(inv.id);
                  const isExpanded = expandedInvoiceId === rowId;
                  const historyState = invoiceHistoryById[rowId];
                  const canStartPipeline =
                    inv.status === "Paid" || inv.status === "Partially Paid";

                  return (
                    <React.Fragment key={inv.id}>
                      <tr
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleInvoiceExpanded(inv)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleInvoiceExpanded(inv);
                          }
                        }}
                        className={
                          "transition-colors cursor-pointer " +
                          (isExpanded ? "bg-slate-50" : "hover:bg-slate-50")
                        }
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleInvoiceSelection(inv.id);
                            }}
                            className="text-slate-500 hover:text-slate-700"
                            title="Select"
                          >
                            {selectedInvoiceIds.includes(inv.id) ? (
                              <CheckSquare size={18} />
                            ) : (
                              <Square size={18} />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-500">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 text-slate-800 font-medium">
                          {inv.clientName}
                        </td>
                        <td className="px-6 py-4 text-slate-800">{inv.date}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                              (inv as any).statusValue
                            )}`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-800 font-bold text-right">
                          ₹{Number(inv.grandTotal || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {(inv as any).statusValue !== "paid" &&
                            (inv as any).statusValue !== "cancelled" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openRecordPaymentModal(inv);
                                }}
                                className="font-bold text-sm text-slate-700 hover:underline mr-4"
                              >
                                <PaymentIcon size={16} className="inline mr-1" />
                                Pay
                              </button>
                            )}

                          {(inv as any).statusValue === "paid" && inv.hasPipeline && (
                            <>
                              {/* keep variable to avoid behavior drift even if currently unused */}
                              {canStartPipeline ? null : null}
                              {inv.startedAt ? (
                                <span
                                  className="font-bold text-sm text-slate-400 mr-4"
                                  title={
                                    inv.startedAt
                                      ? `Started at ${new Date(inv.startedAt).toLocaleString()}`
                                      : "Started"
                                  }
                                >
                                  Started
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartPipeline(inv);
                                  }}
                                  title="Start pipeline"
                                  className="font-bold text-sm text-slate-700 hover:underline mr-4"
                                >
                                  <Play size={16} className="inline mr-1" /> Start
                                </button>
                              )}
                            </>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadInvoice(Number(inv.id), inv.invoiceNumber);
                            }}
                            className="font-bold text-sm text-[#6C5CE7] hover:underline"
                          >
                            <Download size={16} className="inline mr-1" /> PDF
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-white">
                          <td colSpan={7} className="px-6 pb-6">
                            <div className="mt-3 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h4 className="font-extrabold text-slate-800">
                                    Invoice History
                                  </h4>
                                  <p className="text-xs text-slate-500">
                                    {inv.invoiceNumber} • {inv.clientName}
                                  </p>
                                  {historyState?.events?.[0]?.type === "created" &&
                                    historyState.events[0].meta?.created_by && (
                                      <p className="mt-1 text-xs text-slate-500">
                                        Created by {historyState.events[0].meta.created_by}
                                      </p>
                                    )}
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePreviewInvoice(Number(inv.id));
                                  }}
                                  className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50"
                                  type="button"
                                >
                                  Preview
                                </button>
                              </div>

                              {historyState?.loading && (
                                <div className="text-sm text-slate-500">Loading history...</div>
                              )}

                              {historyState?.error && (
                                <div className="text-sm text-red-600">{historyState.error}</div>
                              )}

                              {!historyState?.loading && !historyState?.error && (
                                <div className="space-y-3">
                                  {(historyState?.events || []).length === 0 ? (
                                    <div className="text-sm text-slate-500">No history yet.</div>
                                  ) : (
                                    <div className="space-y-3">
                                      {(historyState?.events || []).map((ev: any, idx: number) => {
                                        const when = ev.ts
                                          ? new Date(ev.ts).toLocaleString()
                                          : "—";
                                        const isPayment = ev.type === "payment";
                                        const isPipeline = ev.type === "pipeline_started";

                                        const dotClass = isPayment
                                          ? "bg-emerald-500"
                                          : isPipeline
                                          ? "bg-[#6C5CE7]"
                                          : "bg-slate-400";

                                        const amount =
                                          isPayment && ev.meta?.amount
                                            ? `₹${Number(ev.meta.amount).toLocaleString()}`
                                            : null;

                                        return (
                                          <div key={`${ev.type}-${idx}`} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                              <div className={`w-3 h-3 rounded-full ${dotClass}`} />
                                              {idx !== (historyState?.events || []).length - 1 && (
                                                <div className="w-px flex-1 bg-slate-200" />
                                              )}
                                            </div>
                                            <div className="flex-1">
                                              <div className="flex items-center justify-between gap-4">
                                                <div className="font-bold text-slate-800 text-sm">
                                                  {ev.title}
                                                  {amount ? (
                                                    <span className="ml-2 text-emerald-600">
                                                      {amount}
                                                    </span>
                                                  ) : null}
                                                </div>
                                                <div className="text-xs text-slate-400 font-medium">
                                                  {when}
                                                </div>
                                              </div>
                                              {isPayment && (
                                                <div className="text-xs text-slate-500 mt-1">
                                                  {(ev.meta?.payment_mode &&
                                                    `Mode: ${ev.meta.payment_mode}`) ||
                                                    ""}
                                                  {ev.meta?.reference
                                                    ? ` • Ref: ${ev.meta.reference}`
                                                    : ""}
                                                  {ev.meta?.received_by
                                                    ? ` • By: ${ev.meta.received_by}`
                                                    : ""}
                                                </div>
                                              )}
                                              {isPipeline &&
                                                typeof ev.meta?.created_items === "number" && (
                                                  <div className="text-xs text-slate-500 mt-1">
                                                    Created items: {ev.meta.created_items}
                                                  </div>
                                                )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {visibleInvoices.length === 0 && (
              <div className="p-12 text-center text-slate-400">
                <FileSpreadsheet size={44} className="mx-auto mb-3 opacity-40" />
                No invoices.
              </div>
            )}

            <div ref={invoicesSentinelRef} />
          </div>
        </>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Client
              </label>
              <select
                value={invoiceForm.clientId}
                onChange={(e) =>
                  setInvoiceForm((p: any) => ({
                    ...p,
                    clientId: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="">-- Select Client --</option>
                {invoiceDropdowns.clients.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Start Date
              </label>
              <input
                type="date"
                value={invoiceForm.date}
                onChange={(e) =>
                  setInvoiceForm((p: any) => ({
                    ...p,
                    date: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                GST %
              </label>
              <input
                type="number"
                value={invoiceForm.gstPercentage}
                onChange={(e) =>
                  setInvoiceForm((p: any) => ({
                    ...p,
                    gstPercentage: e.target.value === "" ? "" : Number(e.target.value),
                  }))
                }
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Payment Mode
              </label>
              <div className="flex gap-2">
                <select
                  value={invoiceForm.paymentMode}
                  onChange={(e) =>
                    setInvoiceForm((p: any) => ({
                      ...p,
                      paymentMode: e.target.value,
                    }))
                  }
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="">-- Select --</option>
                  {invoiceDropdowns.paymentModes.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setIsPaymentModeModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold"
                  type="button"
                >
                  Manage
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                Payment Terms
              </label>
              <div className="flex gap-2">
                <select
                  value={invoiceForm.paymentTerms}
                  onChange={(e) =>
                    setInvoiceForm((p: any) => ({
                      ...p,
                      paymentTerms: e.target.value,
                    }))
                  }
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                >
                  <option value="">-- Select --</option>
                  {invoiceDropdowns.paymentTerms.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setIsPaymentTermModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold"
                  type="button"
                >
                  Manage
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-slate-800">Items</h3>
              <button
                onClick={() =>
                  setInvoiceForm((p: any) => ({
                    ...p,
                    items: [
                      ...p.items,
                      {
                        serviceId: "",
                        name: "",
                        description: "",
                        hsn: "",
                        quantity: 1,
                        price: 0,
                        taxRate: 0,
                        total: 0,
                      } as any,
                    ],
                  }))
                }
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 flex items-center gap-2"
                type="button"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {invoiceForm.items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="grid md:grid-cols-5 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4"
                >
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Service
                    </label>
                    <select
                      value={(item as any).servicePk || ""}
                      onChange={(e) => updateInvoiceItem(idx, "servicePk" as any, e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="">-- Select Service --</option>
                      {services.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateInvoiceItem(
                          idx,
                          "quantity",
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      Unit Price
                    </label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        updateInvoiceItem(
                          idx,
                          "price",
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none"
                    />
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                        Total
                      </label>
                      <div className="px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-800">
                        {Number(item.total || 0).toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setInvoiceForm((p: any) => ({
                          ...p,
                          items: p.items.filter((_: any, i: number) => i !== idx),
                        }))
                      }
                      className="p-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50"
                      title="Remove"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCreateInvoice}
                className="bg-[#6C5CE7] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#5a4ad1] shadow-lg shadow-violet-200 flex items-center gap-2"
              >
                <Save size={18} /> Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesTab;
