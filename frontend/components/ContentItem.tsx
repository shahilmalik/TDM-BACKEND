import React, { useState } from "react";
import {
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
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
  Plus,
} from "lucide-react";
import { PipelinePost, Comment, HistoryEntry } from "../types";

interface ContentItemProps {
  post: PipelinePost;
  isAdmin?: boolean;
  onApprove?: (id: string | number) => void;
  onRevise?: (id: string | number) => void;
  onDragStart?: (e: React.DragEvent, id: string | number) => void;
}

const ContentItem: React.FC<ContentItemProps> = ({
  post,
  isAdmin,
  onApprove,
  onRevise,
  onDragStart,
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [hashtags, setHashtags] = useState<string[]>(post.hashtags || []);
  const [newHashtag, setNewHashtag] = useState("");

  const seedComments: Comment[] =
    (post.discussions && Array.isArray(post.discussions)
      ? post.discussions
      : post.comments && Array.isArray(post.comments)
        ? post.comments
        : []) || [];

  const [comments, setComments] = useState<Comment[]>(
    seedComments.length
      ? seedComments
      : [
          {
            id: "1",
            author: "Sara Dev",
            role: "agency",
            text: "Does the color palette match the summer vibe?",
            date: "2 hours ago",
            replies: [
              {
                id: "2",
                author: "Ali Khan",
                role: "client",
                text: "Yes, but can we make the logo slightly larger?",
                date: "1 hour ago",
              },
            ],
          },
        ]
  );

  const [history] = useState<HistoryEntry[]>(
    post.history && post.history.length
      ? post.history
      : [
          {
            id: "h1",
            user: "John Writer",
            action: "Created the content draft",
            timestamp: "3 hours ago",
          },
          {
            id: "h2",
            user: "Sara Dev",
            action: "Updated status to Content Writing",
            timestamp: "2.5 hours ago",
          },
        ]
  );

  const [commentInput, setCommentInput] = useState("");

  const handleCopy = (text: string, field: string) => {
    try {
      navigator.clipboard.writeText(text);
    } catch {
      // ignore clipboard errors
    }
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const addHashtag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHashtag && !hashtags.includes(newHashtag)) {
      setHashtags([
        ...hashtags,
        newHashtag.startsWith("#") ? newHashtag : `#${newHashtag}`,
      ]);
      setNewHashtag("");
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    const newMsg: Comment = {
      id: Date.now().toString(),
      author: isAdmin ? "Agency Admin" : "Client User",
      role: isAdmin ? "agency" : "client",
      text: commentInput,
      date: "Just now",
    };
    setComments([...comments, newMsg]);
    setCommentInput("");
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
        return <Twitter size={14} className="text-sky-500" />;
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
    if (post.assigned_to?.first_name) return [toInitial(post.assigned_to.first_name)];
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
          <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-[#6C5CE7] transition-colors">
            <Reply size={12} /> REPLY
          </button>
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
    undefined;

  const platforms =
    post.platforms && post.platforms.length
      ? post.platforms
      : post.platform
        ? [post.platform]
        : [];

  const kanbanPlatforms = platforms.slice(0, 2);
  const extraPlatformsCount = Math.max(0, platforms.length - kanbanPlatforms.length);

  const visibleAssignees = assigneeInitials.slice(0, 2);
  const extraAssigneesCount = Math.max(0, assigneeInitials.length - visibleAssignees.length);

  const priority = post.priority || "low";

  const clientName = post.client
    ? `${post.client.first_name || ""} ${post.client.last_name || ""}`.trim()
    : "Client";

  const assignedName = post.assigned_to
    ? `${post.assigned_to.first_name || ""} ${post.assigned_to.last_name || ""}`.trim()
    : "Unassigned";

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
              priority
            )}`}
          >
            {priority}
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

                {/* History Log */}
                <div className="bg-white/50 backdrop-blur rounded-2xl p-4 border border-white/50">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <History size={12} className="text-[#6C5CE7]" /> Activity
                    History
                  </h5>
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

            {/* Content/Metadata Section (Right) */}
            <div className="w-full md:w-7/12 p-8 overflow-y-auto bg-white max-h-[90vh] custom-scrollbar">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getPriorityStyles(
                      priority
                    )}`}
                  >
                    {priority} Priority
                  </span>
                  <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                    ID: #{post.id}
                  </span>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                  {post.title}
                </h2>
              </div>

              <div className="space-y-8">
                {/* Description */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FileText size={12} className="text-[#6C5CE7]" />
                      Internal Brief
                    </h5>
                    <button
                      onClick={() => handleCopy(post.description || "", "desc")}
                      className="p-1.5 text-slate-400 hover:text-[#6C5CE7] hover:bg-violet-50 rounded-lg transition-all"
                      title="Copy Brief"
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
                      "{post.description || "No internal brief provided."}"
                    </p>
                  </div>
                </div>

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
                      <div className="w-8 h-8 rounded-lg bg-violet-50 text-[#6C5CE7] flex items-center justify-center font-bold text-xs">
                        {(post.assigned_to?.first_name?.[0] || "U") +
                          (post.assigned_to?.last_name?.[0] || "A")}
                      </div>
                      <p className="text-sm font-bold text-slate-800">
                        {assignedName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Caption */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Tag size={12} className="text-[#6C5CE7]" /> Caption &
                      Copy
                    </h5>
                    <button
                      onClick={() =>
                        handleCopy(post.caption || "", "caption")
                      }
                      className="p-1.5 text-slate-400 hover:text-[#6C5CE7] hover:bg-violet-50 rounded-lg transition-all"
                      title="Copy Caption"
                    >
                      {copiedField === "caption" ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-sm text-slate-600 font-medium whitespace-pre-line leading-relaxed min-h-[100px]">
                    {post.caption ||
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
                        <button
                          onClick={() => removeHashtag(tag)}
                          className="hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={addHashtag} className="flex gap-2">
                    <input
                      type="text"
                      value={newHashtag}
                      onChange={(e) => setNewHashtag(e.target.value)}
                      placeholder="Add new hashtag..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:border-[#6C5CE7] transition-all"
                    />
                    <button
                      type="submit"
                      className="bg-[#6C5CE7] text-white p-2 rounded-xl hover:bg-violet-700 transition-all"
                    >
                      <Plus size={16} />
                    </button>
                  </form>
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

                  <div className="mb-8">
                    {comments.map((c) => (
                      <React.Fragment key={c.id}>
                        <CommentCard comment={c} />
                      </React.Fragment>
                    ))}
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
                    onClick={() => onRevise && onRevise(post.id)}
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContentItem;
