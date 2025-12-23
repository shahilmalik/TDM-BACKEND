import React from "react";
import { Loader2, Share2, ShieldCheck, X } from "lucide-react";

export type MetaTokenModalProps = {
  open: boolean;
  metaStep: 1 | 2;
  setMetaStep: (value: 1 | 2) => void;
  metaForm: { account_label: string; access_token: string; otp: string };
  setMetaForm: (value: { account_label: string; access_token: string; otp: string }) => void;
  metaLoading: boolean;
  onStart: () => void;
  onConfirm: () => void;
  onClose: () => void;
};

const MetaTokenModal: React.FC<MetaTokenModalProps> = ({
  open,
  metaStep,
  setMetaStep,
  metaForm,
  setMetaForm,
  metaLoading,
  onStart,
  onConfirm,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Share2 size={20} className="text-[#6C5CE7]" /> Meta Access Token
          </h3>
          <button
            onClick={() => {
              onClose();
              setMetaStep(1);
            }}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {metaStep === 1 ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-violet-100 text-[#6C5CE7] rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">
                  Verification Required
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  To add a new Meta token, we need to verify your administrative access.
                  Click below to receive an OTP on your registered email.
                </p>
              </div>
              <button
                onClick={onStart}
                disabled={metaLoading}
                className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                {metaLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Send Verification OTP"
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Account Label
                </label>
                <input
                  placeholder="e.g. Tarviz Primary"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#6C5CE7] outline-none font-medium"
                  value={metaForm.account_label}
                  onChange={(e) =>
                    setMetaForm({
                      ...metaForm,
                      account_label: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Meta Access Token
                </label>
                <textarea
                  placeholder="Paste the Graph API long-lived token here..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#6C5CE7] outline-none text-xs font-mono resize-none"
                  value={metaForm.access_token}
                  onChange={(e) =>
                    setMetaForm({
                      ...metaForm,
                      access_token: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  6-Digit OTP
                </label>
                <input
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#6C5CE7] outline-none text-center font-bold tracking-[0.5em] text-xl"
                  value={metaForm.otp}
                  onChange={(e) => setMetaForm({ ...metaForm, otp: e.target.value })}
                />
              </div>
              <button
                onClick={onConfirm}
                disabled={metaLoading}
                className="w-full bg-[#6C5CE7] text-white py-4 rounded-xl font-bold hover:bg-[#5a4ad1] transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200"
              >
                {metaLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Confirm & Integrate"
                )}
              </button>
              <button
                onClick={() => setMetaStep(1)}
                className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Back to Step 1
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetaTokenModal;
