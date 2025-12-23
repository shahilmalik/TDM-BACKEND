import React from "react";
import { Facebook as FbIcon, Instagram, Key, Plus } from "lucide-react";

export type MetaTabProps = {
  setIsMetaModalOpen: (open: boolean) => void;
  metaTokens: any[];
  metaPages: any[];
};

const MetaTab: React.FC<MetaTabProps> = ({ setIsMetaModalOpen, metaTokens, metaPages }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Meta Integration</h2>
          <p className="text-slate-500">
            Manage Facebook & Instagram account access tokens.
          </p>
        </div>
        <button
          onClick={() => setIsMetaModalOpen(true)}
          className="bg-[#0F172A] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-slate-800 font-bold shadow-lg transition-all"
        >
          <Plus size={20} /> Add Access Token
        </button>
      </div>

      {/* Tokens Section */}
      <section>
        <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
          <Key size={18} className="text-[#6C5CE7]" /> Integrated Tokens
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metaTokens.map((token) => (
            <div
              key={token.id}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    token.status === "active"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-red-50 text-red-600 border border-red-100"
                  }`}
                >
                  {token.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-50 shadow-inner bg-slate-100 flex-shrink-0">
                  <img
                    src={token.profile_picture}
                    alt={token.user_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 leading-tight">
                    {token.account_label}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">User: {token.user_name}</p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-50">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>Created At</span>
                  <span className="text-slate-600">
                    {new Date(token.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>Expires At</span>
                  <span className="text-slate-600">
                    {new Date(token.expires_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {metaTokens.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <Key size={48} className="mx-auto mb-4 text-slate-300 opacity-50" />
              <p className="text-slate-400 font-medium">No tokens integrated yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Pages Section */}
      <section>
        <h3 className="text-lg font-bold text-slate-700 mb-6 flex items-center gap-2">
          <FbIcon size={18} className="text-blue-600" /> Linked Pages & IG Accounts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metaPages.map((page) => (
            <div
              key={`${page.token_id}-${page.fb_page_id}`}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-slate-50">
                  <img
                    src={page.fb_page_picture}
                    alt={page.fb_page_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 truncate">{page.fb_page_name}</h4>
                  <p className="text-[10px] font-bold text-[#6C5CE7] uppercase tracking-widest">
                    {page.account_label}
                  </p>
                </div>
                <div className="flex -space-x-1">
                  <div
                    className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-white"
                    title="Facebook Page"
                  >
                    <FbIcon size={12} />
                  </div>
                  {page.ig_account_id && (
                    <div
                      className="w-6 h-6 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center border border-white"
                      title="Instagram Linked"
                    >
                      <Instagram size={12} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MetaTab;
