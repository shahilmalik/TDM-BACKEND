import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";

export type ContactSubmission = {
  id: number;
  name?: string | null;
  organization?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: boolean;
  subject?: string | null;
  body?: string | null;
  contacted?: boolean;
  contact_notes?: string | null;
  created_at?: string;
};

export type ContactSubmissionsTabProps = {
  submissions: ContactSubmission[];
  expandedId: number | null;
  toggleExpanded: (id: number) => void;
  markContacted: (id: number, notes: string) => void;
};

const formatDateTime = (iso?: string) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const ContactSubmissionsTab: React.FC<ContactSubmissionsTabProps> = ({
  submissions,
  expandedId,
  toggleExpanded,
  markContacted,
}) => {
  const [notesById, setNotesById] = useState<Record<number, string>>({});

  const ordered = useMemo(() => submissions, [submissions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-800">
          Contact Submissions
        </h2>
        <p className="text-slate-500">
          Leads from the website contact form. Expand a row to view details and
          mark as contacted with notes.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {ordered.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No submissions yet.
            </div>
          )}

          {ordered.map((s) => {
            const isExpanded = expandedId === s.id;
            const isContacted = !!s.contacted;

            return (
              <div
                key={s.id}
                className={
                  isContacted
                    ? "bg-slate-50/70"
                    : "bg-white hover:bg-slate-50 transition-colors"
                }
              >
                <button
                  type="button"
                  onClick={() => toggleExpanded(s.id)}
                  className="w-full text-left p-5 flex items-start gap-4"
                >
                  <div className="pt-1">
                    {isExpanded ? (
                      <ChevronDown size={18} className="text-slate-500" />
                    ) : (
                      <ChevronRight size={18} className="text-slate-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {!isContacted ? (
                            <Circle size={10} className="text-[#FF6B6B]" />
                          ) : (
                            <CheckCircle2 size={16} className="text-green-600" />
                          )}
                          <div className="font-extrabold text-slate-800 truncate">
                            {s.name || "(No name)"}
                          </div>
                          <span
                            className={
                              isContacted
                                ? "ml-2 text-xs font-extrabold px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200"
                                : "ml-2 text-xs font-extrabold px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200"
                            }
                          >
                            {isContacted ? "Contacted" : "Not contacted"}
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
                          <div className="inline-flex items-center gap-2">
                            <Building2 size={14} />
                            {s.organization || "-"}
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <Mail size={14} />
                            {s.email || "-"}
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <Phone size={14} />
                            {s.phone || "-"}
                          </div>
                          <div className="inline-flex items-center gap-2">
                            <MessageSquare size={14} className="text-green-600" />
                            {s.whatsapp ? "WhatsApp OK" : "No WhatsApp"}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-500">
                          <Clock size={14} />
                          {formatDateTime(s.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-6 pb-6 -mt-2">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                      <div>
                        <div className="text-slate-900 font-extrabold">
                          {s.subject || "-"}
                        </div>
                        <div className="text-slate-700 mt-2 whitespace-pre-wrap">
                          {s.body || "-"}
                        </div>
                      </div>

                      {!!s.contact_notes && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                          <div className="text-xs font-extrabold text-slate-600">
                            Notes
                          </div>
                          <div className="text-slate-800 whitespace-pre-wrap">
                            {s.contact_notes}
                          </div>
                        </div>
                      )}

                      {!isContacted && (
                        <div className="pt-2">
                          <div className="text-sm font-extrabold text-slate-800">
                            Mark as contacted
                          </div>
                          <textarea
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            rows={3}
                            placeholder="Add notes (required)..."
                            value={notesById[s.id] ?? ""}
                            onChange={(e) =>
                              setNotesById((prev) => ({
                                ...prev,
                                [s.id]: e.target.value,
                              }))
                            }
                          />
                          <div className="mt-3 flex items-center justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const notes = (notesById[s.id] ?? "").trim();
                                if (!notes) return;
                                markContacted(s.id, notes);
                              }}
                              disabled={!((notesById[s.id] ?? "").trim().length > 0)}
                              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-extrabold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800"
                            >
                              Save notes & mark contacted
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContactSubmissionsTab;
