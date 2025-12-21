import React, { useEffect, useMemo, useState } from "react";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Calendar,
  User,
  MapPin,
  Hash,
  Link as LinkIcon,
  MessageSquare,
  CheckCircle,
  RotateCcw,
  X,
  Tag,
  FileText,
  Image as ImageIcon,
  Copy,
  Check,
  Reply,
  History,
} from "lucide-react";
import { PipelinePost, Comment, HistoryEntry } from "../types";
import { api } from "../services/api";

interface ContentItemProps {
  post: PipelinePost;
  isAdmin?: boolean;
  onApprove?: (id: string | number) => void;
  onRevise?: (id: string | number, reviseNotes?: string) => void;
  onSchedule?: (id: string | number, scheduledAtIso: string) => void;
  onDragStart?: (e: React.DragEvent, id: string | number) => void;
  onRefresh?: () => void | Promise<void>;
}

const ContentItem: React.FC<ContentItemProps> = ({
  post,
  isAdmin,
  onApprove,
  onRevise,
  onSchedule,
  onDragStart,
  onRefresh,
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [hashtags, setHashtags] = useState<string[]>(post.hashtags || []);
  const [newHashtag, setNewHashtag] = useState("");

  const isClientUser = isAdmin === false;
  const canAgencyEdit = isAdmin === true;

  const seedComments: Comment[] =
    (post.discussions && Array.isArray(post.discussions)
      ? post.discussions
      : post.comments && Array.isArray(post.comments)
        ? post.comments
        : []) || [];

  const [comments, setComments] = useState<Comment[]>(seedComments);

  const [history, setHistory] = useState<HistoryEntry[]>(
    post.history && post.history.length ? post.history : []
  );
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [commentInput, setCommentInput] = useState("");
  const [isDiscussionLoading, setIsDiscussionLoading] = useState(false);
  const [discussionError, setDiscussionError] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState("");

  const unreadCommentsCount = useMemo(() => {
    const n = Number((post as any)?.unread_comments_count ?? 0);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }, [post]);

  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleInput, setScheduleInput] = useState("");

  const postIdForApi = useMemo(() => {
    // Only attempt API calls for numeric IDs (real backend items)
    const n = Number(post.id);
    return Number.isFinite(n) ? n : null;
  }, [post.id]);

  const normalizePlatform = (p: string) => {
    const v = String(p || "").trim().toLowerCase();
    if (v === "x") return "twitter";
    if (v === "linkedn") return "linkedin";
    return v;
  };

  const ALL_PLATFORMS = [
    "instagram",
    "facebook",
    "twitter",
    "youtube",
    "linkedin",
    "amazon",
    "flipkart",
    "meesho",
    "swiggy",
    "zomato",
    "zepto",
  ];

  const formatHistoryTimestamp = (raw: any) => {
    if (!raw) return "";
    try {
      const d = new Date(String(raw));
      if (!Number.isNaN(d.getTime())) return d.toLocaleString();
    } catch (e) {}
    return String(raw);
  };

  const normalizeComment = (raw: any): Comment => {
    const createdAt = raw?.date || raw?.created_at || raw?.createdAt;
    const dateStr = createdAt
      ? new Date(createdAt).toLocaleString()
      : raw?.date || "";

    const replies = Array.isArray(raw?.replies) ? raw.replies : [];
    return {
      id: String(raw?.id ?? ""),
      author: raw?.author || "Unknown",
      role: raw?.role === "client" ? "client" : "agency",
      text: raw?.text || "",
      date: dateStr,
      replies: replies.map((r: any) => ({
        id: String(r?.id ?? ""),
        author: r?.author || "Unknown",
        role: r?.role === "client" ? "client" : "agency",
        text: r?.text || "",
        date: r?.date || (r?.created_at ? new Date(r.created_at).toLocaleString() : ""),
      })),
    };
  };

  const loadDiscussion = async () => {
    if (!postIdForApi) return;
    setIsDiscussionLoading(true);
    setDiscussionError(null);
    try {
      const res = await api.kanban.comments.list(postIdForApi);
      const list = Array.isArray(res) ? res : [];
      setComments(list.map(normalizeComment));

      // Mark thread as read when opened/loaded.
      try {
        await api.kanban.comments.markRead(postIdForApi);
        if (onRefresh) await onRefresh();
      } catch {
        // ignore
      }
    } catch (e: any) {
      setDiscussionError(e?.message || "Failed to load discussion.");
    } finally {
      setIsDiscussionLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!postIdForApi) return;
    setIsHistoryLoading(true);
    setHistoryError(null);
    try {
      const res: any = await api.kanban.activity(postIdForApi);
      const list = Array.isArray(res?.history) ? res.history : [];
      if (list.length) {
        setHistory(
          list.map((h: any) => ({
            id: String(h?.id ?? ""),
            user: String(h?.user ?? "System"),
            action: String(h?.action ?? "Updated"),
            timestamp: formatHistoryTimestamp(h?.timestamp),
          }))
        );
      } else if (post.history && post.history.length) {
        setHistory(post.history);
      } else {
        setHistory([]);
      }
    } catch (e: any) {
      setHistoryError(e?.message || "Failed to load activity history.");
      if (post.history && post.history.length) setHistory(post.history);
      else setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!isDetailOpen) return;
    // Load from backend when opening details (for real items)
    loadDiscussion();
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetailOpen, postIdForApi]);

  const handleCopy = (text: string, field: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch {
      // ignore clipboard errors
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const addHashtagFromInput = () => {
    if (isClientUser) return;
    const raw = newHashtag.trim();
    if (!raw) return;

    const tokens = raw
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean);

    if (tokens.length === 0) return;

    setHashtags((prev) => {
      const next = [...prev];
      for (const token of tokens) {
        const cleaned = token.startsWith("#") ? token : `#${token}`;
        if (!next.includes(cleaned)) next.push(cleaned);
      }
      return next;
    });
    setNewHashtag("");
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const submit = async () => {
      if (!postIdForApi) return;
      setIsDiscussionLoading(true);
      setDiscussionError(null);
      try {
        await api.kanban.comments.create(postIdForApi, commentInput.trim());
        setCommentInput("");
        setReplyingToId(null);
        setReplyInput("");
        await loadDiscussion();
        return;
      } catch (e: any) {
        setDiscussionError(e?.message || "Failed to add comment.");
      } finally {
        setIsDiscussionLoading(false);
      }
    };

    // fire and forget
    void submit();
  };

  const handleReply = async (parentComment: Comment) => {
    if (!replyInput.trim()) return;
    if (parentComment.replies && parentComment.replies.length > 0) return;
    if (!postIdForApi) return;

    setIsDiscussionLoading(true);
    setDiscussionError(null);
    try {
      await api.kanban.comments.reply(parentComment.id, replyInput.trim());
      setReplyInput("");
      setReplyingToId(null);
      await loadDiscussion();
    } catch (e: any) {
      setDiscussionError(e?.message || "Failed to add reply.");
    } finally {
      setIsDiscussionLoading(false);
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch ((priority || "").toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-600 border-red-100";
      case "medium":
        return "bg-amber-50 text-amber-600 border-amber-100";
      default:
        return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch ((platform || "").toLowerCase()) {
      case "instagram":
        return <Instagram size={14} className="text-pink-600" />;
      case "facebook":
        return <Facebook size={14} className="text-blue-600" />;
      case "linkedin":
        return <Linkedin size={14} className="text-blue-700" />;
      case "twitter":
      case "x":
        return <Twitter size={14} className="text-sky-500" />;
      case "youtube":
        return <Youtube size={14} className="text-red-600" />;
      default:
        return <LinkIcon size={14} className="text-slate-400" />;
    }
  };

  const toInitial = (name: string) => {
    const v = String(name || "").trim();
    return v ? v[0].toUpperCase() : "U";
  };

  const assigneeInitials = (() => {
    if (Array.isArray(post.assignees) && post.assignees.length > 0) {
      return post.assignees
        .map((a) => toInitial(a))
        .filter((x) => Boolean(x));
    }
    if (post.assigned_to) {
      const name =
        post.assigned_to.first_name ||
        post.assigned_to.last_name ||
        (post.assigned_to as any)?.email ||
        "";
      const initial = toInitial(name);
      return initial ? [initial] : [];
    }
    return [];
  })();

  const CommentCard = ({
    comment,
    isReply = false,
  }: {
    comment: Comment;
    isReply?: boolean;
  }) => (
    <div
      className={`flex gap-3 ${
        isReply ? "ml-8 mt-3 border-l-2 border-slate-100 pl-4" : "mb-6"
      }`}
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
          comment.role === "agency"
            ? "bg-violet-100 text-[#6C5CE7]"
            : "bg-orange-100 text-[#FF6B6B]"
        }`}
      >
        {comment.author?.[0] || "U"}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-bold text-slate-800 text-sm">
            {comment.author}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {comment.date}
          </span>
          {comment.role === "agency" && (
            <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 rounded uppercase font-black">
              Agency
            </span>
          )}
        </div>
        <p className="text-slate-600 text-sm leading-relaxed mb-2">
          {comment.text}
        </p>
        {!isReply && (
          <button
            disabled={(comment.replies || []).length > 0}
            onClick={() => {
              if ((comment.replies || []).length > 0) return;
              setReplyingToId(String(comment.id));
              setReplyInput("");
            }}
            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-[#6C5CE7] disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
          >
            <Reply size={12} /> REPLY
          </button>
        )}

        {!isReply && replyingToId === String(comment.id) && (
          <div className="mt-3">
            <textarea
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder="Write a reply..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-[#6C5CE7] transition-all min-h-[70px]"
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setReplyingToId(null);
                  setReplyInput("");
                }}
                className="px-3 py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!replyInput.trim() || isDiscussionLoading}
                onClick={() => void handleReply(comment)}
                className="px-3 py-2 text-xs font-bold bg-[#6C5CE7] text-white rounded-lg disabled:opacity-50 hover:bg-violet-700 transition-colors"
              >
                Reply
              </button>
            </div>
          </div>
        )}
        {comment.replies?.map((reply) => (
          <React.Fragment key={reply.id}>
            <CommentCard comment={reply} isReply={true} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const displayThumbnail =
    post.thumbnail ||
    (post.media_assets && post.media_assets[0]?.file) ||
    (post.media_assets && post.media_assets[0]?.public_url) ||
    undefined;

  const initialPlatforms =
    post.platforms && post.platforms.length
      ? post.platforms
      : post.platform
        ? [post.platform]
        : [];

  const [editablePlatforms, setEditablePlatforms] = useState<string[]>(
    (initialPlatforms || []).map(normalizePlatform)
  );

  const platforms = editablePlatforms;
  const kanbanPlatforms = platforms.slice(0, 2);
  const extraPlatformsCount = Math.max(
    0,
    platforms.length - kanbanPlatforms.length
  );

  const visibleAssignees = assigneeInitials.slice(0, 2);
  const extraAssigneesCount = Math.max(0, assigneeInitials.length - visibleAssignees.length);

  const [editablePriority, setEditablePriority] = useState<string>(
    String(post.priority || "low")
  );

  const [employees, setEmployees] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);
  const [editableAssigneeId, setEditableAssigneeId] = useState<string>(
    String((post as any)?.assigned_to?.id ?? "")
  );

  useEffect(() => {
    // Sync local editable state when parent refreshes
    setEditablePriority(String(post.priority || "low"));
    const nextPlatforms =
      post.platforms && post.platforms.length
        ? post.platforms
        : post.platform
          ? [post.platform]
          : [];
    setEditablePlatforms((nextPlatforms || []).map(normalizePlatform));
    setEditableAssigneeId(String((post as any)?.assigned_to?.id ?? ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id, (post as any)?.updated_at]);

  const clientName = post.client
    ? `${post.client.first_name || ""} ${post.client.last_name || ""}`.trim()
    : "Client";

  const assignedName = post.assigned_to
    ? `${post.assigned_to.first_name || ""} ${post.assigned_to.last_name || ""}`.trim()
    : "Unassigned";

  const creativeCopyText =
    (post as any).creative_copy ?? post.description ?? "";
  const postCaptionText =
    (post as any).post_caption ?? post.caption ?? "";

  const canClientRequestRevision = isClientUser && post.status === "approval";
  const canAgencySchedule = isAdmin === true && postIdForApi !== null;

  const savePatch = async (data: any) => {
    if (!postIdForApi) return;
    try {
      await api.kanban.update(postIdForApi, data);
      if (onRefresh) await onRefresh();
    } catch (e) {
      // Keep UI responsive; parent refresh will reflect true state
    }
  };

  const togglePlatform = async (p: string) => {
    const v = normalizePlatform(p);
    const next = platforms.includes(v)
      ? platforms.filter((x) => x !== v)
      : [...platforms, v];
    setEditablePlatforms(next);
    await savePatch({ platforms: next });
  };

  const handleUploadImage = async (file: File) => {
    if (!postIdForApi) return;
    try {
      await api.kanban.uploadMedia(postIdForApi, file, "image");
      if (onRefresh) await onRefresh();
    } catch (e) {
      // ignore
    }
  };

  const loadEmployees = async () => {
    if (!canAgencyEdit) return;
    setIsEmployeesLoading(true);
    try {
      const res: any = await api.employee.list({ page: 1, page_size: 200 });
      const data = Array.isArray(res) ? res : res?.results || [];
      setEmployees(
        (data || []).map((e: any) => ({
          id: String(e.id),
          label: `${e.salutation || ""} ${e.first_name || ""} ${
            e.last_name || ""
          }`.trim() || String(e.email || `User #${e.id}`),
        }))
      );
    } catch (e) {
      setEmployees([]);
    } finally {
      setIsEmployeesLoading(false);
    }
  };

  useEffect(() => {
    if (!isDetailOpen) return;
    if (!canAgencyEdit) return;
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDetailOpen]);

  return (
    <>
      {/* List View Card */}
      <div
        draggable={!!isAdmin || post.status === "approval"}
        onDragStart={(e) => onDragStart && onDragStart(e, post.id)}
        onClick={() => setIsDetailOpen(true)}
        className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer group active:cursor-grabbing relative min-w-0"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex gap-1.5">
            {kanbanPlatforms.map((p) => (
              <div
                key={p}
                className="p-1.5 bg-slate-50 rounded-lg"
                title={p}
              >
                {getPlatformIcon(p)}
              </div>
            ))}
            {extraPlatformsCount > 0 && (
              <div
                className="px-2 py-1 bg-slate-50 rounded-lg border border-slate-100 text-[10px] font-black text-slate-500 flex items-center"
                title={`${extraPlatformsCount} more platform(s)`}
              >
                +{extraPlatformsCount}
              </div>
            )}
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityStyles(
              editablePriority
            )}`}
          >
            {editablePriority}
          </span>
        </div>

        <h4 className="font-bold text-slate-800 text-sm mb-3 leading-snug group-hover:text-[#6C5CE7] transition-colors break-words">
          {post.title}
        </h4>

        {displayThumbnail && (
          <div className="w-full h-24 mb-3 rounded-lg overflow-hidden bg-slate-100 relative">
            <img
              src={displayThumbnail}
              alt="preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
          </div>
        )}

        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-medium">
          <div className="flex items-center gap-1">
            <Calendar size={10} />
            <span>{post.dueDate}</span>
          </div>
          {unreadCommentsCount > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-100 font-black">
              <MessageSquare size={10} />
              <span>{unreadCommentsCount}</span>
            </div>
          )}
          {assigneeInitials.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {visibleAssignees.map((initial, idx) => (
                  <div
                    key={`${initial}-${idx}`}
                    className="w-6 h-6 rounded-lg bg-violet-50 text-[#6C5CE7] border border-violet-100 flex items-center justify-center text-[10px] font-black"
                    title="Assigned"
                  >
                    {initial}
                  </div>
                ))}
                {extraAssigneesCount > 0 && (
                  <div
                    className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[9px] font-black"
                    title={`${extraAssigneesCount} more assignee(s)`}
                  >
                    +{extraAssigneesCount}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isAdmin === false && post.status === "approval" && (
          <div className="mt-3 pt-3 border-t border-slate-50 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRevise && onRevise(post.id);
              }}
              className="flex-1 py-1.5 text-[9px] font-bold bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              REVISE
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onApprove && onApprove(post.id);
              }}
              className="flex-1 py-1.5 text-[9px] font-bold bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              APPROVE
            </button>
          </div>
        )}
      </div>

      {/* Detailed View Modal */}
      {isDetailOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setIsDetailOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-6xl my-8 overflow-hidden shadow-2xl flex flex-col md:flex-row relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-4 right-4 z-[110] p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white text-slate-400 hover:text-red-500 shadow-sm transition-all"
            >
              <X size={20} />
            </button>

            {/* Media/Visual Section (Left) */}
            <div className="w-full md:w-5/12 bg-slate-100 p-8 flex flex-col relative">
              <div className="flex-1 flex items-center justify-center">
                {displayThumbnail ? (
                  <img
                    src={displayThumbnail}
                    alt="Content"
                    className="max-w-full max-h-[400px] object-contain rounded-xl shadow-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-300">
                    <ImageIcon size={64} className="mb-4" />
                    <p className="font-bold uppercase tracking-widest text-xs">
                      No Visual Content
                    </p>
                  </div>
                )}
              </div>

              {canAgencyEdit && postIdForApi && (
                <div className="mt-4">
                  <label className="inline-block px-4 py-2 bg-white/90 border border-white rounded-xl text-xs font-black text-slate-700 cursor-pointer hover:bg-white transition-colors">
                    Add Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleUploadImage(f);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
              )}

              {/* Visual Metadata */}
              <div className="mt-8 space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {platforms.map((p) => (
                    <div
                      key={p}
                      className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-600 border border-white shadow-sm flex items-center gap-1.5"
                    >
                      {getPlatformIcon(p)} {String(p).toUpperCase()}
                    </div>
                  ))}
                </div>

                {canAgencyEdit && postIdForApi && (
                  <div className="bg-white/50 backdrop-blur rounded-2xl p-4 border border-white/50">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Tag size={12} className="text-[#6C5CE7]" /> Platforms
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {ALL_PLATFORMS.map((p) => {
                        const active = platforms.includes(normalizePlatform(p));
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => void togglePlatform(p)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${
                              active
                                ? "bg-violet-50 text-[#6C5CE7] border-violet-100"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {p === "twitter" ? "X" : p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* History Log */}
                <div className="bg-white/50 backdrop-blur rounded-2xl p-4 border border-white/50">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <History size={12} className="text-[#6C5CE7]" /> Activity
                    History
                  </h5>
                  {historyError && (
                    <div className="mb-2 text-[10px] font-bold text-red-600">
                      {historyError}
                    </div>
                  )}
                  <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {isHistoryLoading && (
                      <div className="text-[10px] text-slate-400 font-medium">
                        Loading activity...
                      </div>
                    )}
                    <div className="space-y-3">
                      {history.map((h) => (
                        <div key={h.id} className="flex gap-2">
                          <div className="w-1.5 h-1.5 bg-slate-300 rounded-full mt-1.5 shrink-0"></div>
                          <div className="text-[11px] leading-tight">
                            <span className="font-bold text-slate-700">
                              {h.user}
                            </span>{" "}
                            <span className="text-slate-500">{h.action}</span>
                            <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                              {h.timestamp}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content/Metadata Section (Right) */}
            <div className="w-full md:w-7/12 p-8 overflow-y-auto bg-white max-h-[90vh] custom-scrollbar">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  {canAgencyEdit && postIdForApi ? (
                    <select
                      value={editablePriority}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEditablePriority(v);
                        void savePatch({ priority: v });
                      }}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border outline-none ${getPriorityStyles(
                        editablePriority
                      )}`}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  ) : (
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getPriorityStyles(
                        editablePriority
                      )}`}
                    >
                      {editablePriority} Priority
                    </span>
                  )}
                  <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                    ID: #{post.id}
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                  {post.title}
                </h2>
              </div>

              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Client
                    </h5>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-[#FF6B6B] flex items-center justify-center font-bold text-xs">
                        {(post.client?.first_name?.[0] || "C") +
                          (post.client?.last_name?.[0] || "L")}
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        {clientName}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Assigned To
                    </h5>
                    <div className="flex items-center gap-2">
                      {assigneeInitials.length > 0 ? (
                        <div className="flex -space-x-2">
                          {visibleAssignees.map((initial, idx) => (
                            <div
                              key={`${initial}-${idx}`}
                              className="w-8 h-8 rounded-lg bg-violet-50 text-[#6C5CE7] border border-violet-100 flex items-center justify-center text-xs font-black"
                              title="Assigned"
                            >
                              {initial}
                            </div>
                          ))}
                          {extraAssigneesCount > 0 && (
                            <div
                              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center text-[10px] font-black"
                              title={`${extraAssigneesCount} more assignee(s)`}
                            >
                              +{extraAssigneesCount}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center text-xs font-black">
                          -
                        </div>
                      )}
                      <p className="text-sm font-bold text-slate-800">
                        {assignedName}
                      </p>
                    </div>

                    {canAgencyEdit && postIdForApi && (
                      <div className="mt-2">
                        <select
                          value={editableAssigneeId}
                          onChange={(e) => {
                            const v = e.target.value;
                            setEditableAssigneeId(v);
                            void savePatch({
                              assigned_to_id: v ? Number(v) : null,
                            });
                          }}
                          disabled={isEmployeesLoading}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#6C5CE7]"
                        >
                          <option value="">
                            {isEmployeesLoading
                              ? "Loading..."
                              : "Unassigned"}
                          </option>
                          {employees.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Creative Copy */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText size={12} className="text-[#6C5CE7]" />
                      Creative Copy
                    </h5>
                    <button
                      onClick={() => handleCopy(String(creativeCopyText || ""), "desc")}
                      className="p-1.5 text-slate-400 hover:text-[#6C5CE7] hover:bg-violet-50 rounded-lg transition-all"
                      title="Copy Creative Copy"
                    >
                      {copiedField === "desc" ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative group">
                    <p className="text-slate-700 text-sm leading-relaxed italic">
                      "{creativeCopyText || "No creative copy provided."}"
                    </p>
                  </div>
                </div>

                {/* Post Caption */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Tag size={12} className="text-[#6C5CE7]" /> Post Caption
                    </h5>
                    <button
                      onClick={() => handleCopy(String(postCaptionText || ""), "caption")}
                      className="p-1.5 text-slate-400 hover:text-[#6C5CE7] hover:bg-violet-50 rounded-lg transition-all"
                      title="Copy Post Caption"
                    >
                      {copiedField === "caption" ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 font-medium whitespace-pre-line leading-relaxed min-h-[100px]">
                    {postCaptionText ||
                      "Content copy will be updated here after writing phase."}
                  </div>
                </div>

                {/* Hashtags Section */}
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Hash size={12} className="text-[#6C5CE7]" /> Hashtags
                  </h5>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hashtags.map((tag) => (
                      <div
                        key={tag}
                        className="flex items-center gap-1 bg-violet-50 text-[#6C5CE7] px-3 py-1 rounded-lg text-xs font-bold border border-violet-100 hover:border-violet-300 transition-colors"
                      >
                        {tag}
                        {!isClientUser && (
                          <button
                            onClick={() => removeHashtag(tag)}
                            className="hover:text-red-500"
                            title="Remove hashtag"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {!isClientUser && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newHashtag}
                        onChange={(e) => setNewHashtag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter") return;
                          e.preventDefault();
                          addHashtagFromInput();
                        }}
                        placeholder="Type a hashtag and press Enter..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:border-[#6C5CE7] transition-all"
                      />
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#6C5CE7]" /> Location
                  </h5>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 font-medium">
                    {post.location || "No location specified."}
                  </div>
                </div>

                {/* Discussions Section */}
                <div className="pt-8 border-t border-slate-100">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <MessageSquare size={14} className="text-[#FF6B6B]" />
                    Discussion Thread
                  </h5>

                  {discussionError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
                      {discussionError}
                    </div>
                  )}

                  <div className="mb-8 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {isDiscussionLoading && comments.length === 0 ? (
                      <div className="text-sm text-slate-400">Loading…</div>
                    ) : (
                      comments.map((c) => (
                        <React.Fragment key={c.id}>
                          <CommentCard comment={c} />
                        </React.Fragment>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="relative">
                    <textarea
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Add to the discussion..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#6C5CE7] transition-all min-h-[80px] pr-12"
                    />
                    <button
                      type="submit"
                      disabled={!commentInput.trim()}
                      className="absolute bottom-4 right-4 p-2 bg-[#6C5CE7] text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all"
                    >
                      <Reply size={16} className="transform -rotate-90" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Action Bar */}
              {!isAdmin && post.status === "approval" && (
                <div className="mt-10 pt-8 border-t border-slate-100 flex gap-4">
                  <button
                    onClick={() => {
                      setRevisionNotes("");
                      setIsRevisionModalOpen(true);
                    }}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={18} /> REQUEST REVISION
                  </button>
                  <button
                    onClick={() => onApprove && onApprove(post.id)}
                    className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> APPROVE POST
                  </button>
                </div>
              )}

              {canAgencySchedule && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setScheduleInput("");
                      setIsScheduleModalOpen(true);
                    }}
                    className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar size={18} /> SCHEDULE
                  </button>
                </div>
              )}
            </div>

            {/* Revision Notes Modal (Client) */}
            {isRevisionModalOpen && (
              <div
                className="absolute inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40"
                onClick={() => setIsRevisionModalOpen(false)}
              >
                <div
                  className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                    Request Revision
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Please describe what needs to be changed.
                  </p>
                  <textarea
                    value={revisionNotes}
                    onChange={(e) => setRevisionNotes(e.target.value)}
                    placeholder="Enter revision notes..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-[#6C5CE7] transition-all min-h-[120px]"
                  />
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsRevisionModalOpen(false)}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!revisionNotes.trim()}
                      onClick={() => {
                        if (!revisionNotes.trim()) return;
                        onRevise && onRevise(post.id, revisionNotes.trim());
                        setIsRevisionModalOpen(false);
                      }}
                      className="flex-1 py-3 bg-[#6C5CE7] text-white rounded-xl font-bold disabled:opacity-50 hover:bg-violet-700 transition-all"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Modal (Agency) */}
            {isScheduleModalOpen && (
              <div
                className="absolute inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40"
                onClick={() => setIsScheduleModalOpen(false)}
              >
                <div
                  className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">
                    Schedule
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Pick a date and time to schedule this item.
                  </p>
                  <input
                    type="datetime-local"
                    value={scheduleInput}
                    onChange={(e) => setScheduleInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6C5CE7] transition-all"
                  />
                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsScheduleModalOpen(false)}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!scheduleInput}
                      onClick={() => {
                        if (!scheduleInput) return;
                        const iso = new Date(scheduleInput).toISOString();
                        onSchedule && onSchedule(post.id, iso);
                        setIsScheduleModalOpen(false);
                      }}
                      className="flex-1 py-3 bg-[#6C5CE7] text-white rounded-xl font-bold disabled:opacity-50 hover:bg-violet-700 transition-all"
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ContentItem;
