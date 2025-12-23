import React from "react";
import { Building, Landmark, Save } from "lucide-react";

export type SettingsTabProps = {
  handleSaveCompanyProfile: () => void;
  companyDetails: any;
  setCompanyDetails: (value: any) => void;
};

const SettingsTab: React.FC<SettingsTabProps> = ({
  handleSaveCompanyProfile,
  companyDetails,
  setCompanyDetails,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Company Profile</h2>
          <p className="text-slate-500">Master settings for Tarviz Digimart agency details.</p>
        </div>
        <button
          onClick={handleSaveCompanyProfile}
          className="flex items-center gap-2 bg-[#6C5CE7] text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-violet-200 transition-all hover:bg-[#5a4ad1]"
        >
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div className="grid gap-8">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
            <Building size={20} className="text-[#FF6B6B]" />
            <h3 className="font-bold text-slate-800">General Information</h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Agency Name
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={companyDetails.name}
                  onChange={(e) =>
                    setCompanyDetails({
                      ...companyDetails,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  GSTIN
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={companyDetails.gstin}
                  onChange={(e) =>
                    setCompanyDetails({
                      ...companyDetails,
                      gstin: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Primary Email
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={companyDetails.email}
                  onChange={(e) =>
                    setCompanyDetails({
                      ...companyDetails,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Secondary Email
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={companyDetails.secondaryEmail}
                  onChange={(e) =>
                    setCompanyDetails({
                      ...companyDetails,
                      secondaryEmail: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Contact Phone
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={companyDetails.phone}
                  onChange={(e) =>
                    setCompanyDetails({
                      ...companyDetails,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Address
                </label>
                <textarea
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                  rows={2}
                  value={companyDetails.address}
                  onChange={(e) =>
                    setCompanyDetails({
                      ...companyDetails,
                      address: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex items-center gap-2">
            <Landmark size={20} className="text-blue-500" />
            <h3 className="font-bold text-slate-800">Bank Account Details</h3>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Account Name
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={companyDetails.bankDetails.accountName}
                  onChange={(e) =>
                    setCompanyDetails({
                      ...companyDetails,
                      bankDetails: {
                        ...companyDetails.bankDetails,
                        accountName: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Bank Name
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={companyDetails.bankDetails.bankName}
                  onChange={(e) =>
                    setCompanyDetails({
                      ...companyDetails,
                      bankDetails: {
                        ...companyDetails.bankDetails,
                        bankName: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Account Number
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={companyDetails.bankDetails.accountNumber}
                  onChange={(e) =>
                    setCompanyDetails({
                      ...companyDetails,
                      bankDetails: {
                        ...companyDetails.bankDetails,
                        accountNumber: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  IFSC Code
                </label>
                <input
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={companyDetails.bankDetails.ifsc}
                  onChange={(e) =>
                    setCompanyDetails({
                      ...companyDetails,
                      bankDetails: {
                        ...companyDetails.bankDetails,
                        ifsc: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
