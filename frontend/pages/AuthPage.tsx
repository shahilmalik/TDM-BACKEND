import React, { useState, useRef } from "react";
import {
  User,
  Lock,
  Mail,
  Building,
  ChevronRight,
  ArrowLeft,
  Unlock,
  Loader2,
  RefreshCw,
  ShieldCheck,
  PenTool,
  Palette,
} from "lucide-react";
import { UserProfile } from "../types";
import { api } from "../services/api";

interface AuthPageProps {
  onLoginSuccess: (role: "client" | "admin" | "editor") => void;
  onNavigateHome: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  // Views: login | signup | otp-signup | forgot-email | reset-final
  const [view, setView] = useState<
    "login" | "signup" | "otp-signup" | "forgot-email" | "reset-final"
  >("login");

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup State
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmSignupPassword, setConfirmSignupPassword] = useState("");
  const [businessCountryCode, setBusinessCountryCode] = useState("+91");
  const [contactCountryCode, setContactCountryCode] = useState("+91");

  const [formData, setFormData] = useState<UserProfile>({
    business: {
      name: "",
      address: "",
      gstin: "",
      hsn: "",
      email: "",
      phone: "",
      whatsappConsent: false,
    },
    contactPerson: {
      salutation: "Mr",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      whatsappConsent: false,
    },
  });

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // OTP State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Shared Styles
  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#6C5CE7] focus:ring-[#6C5CE7] outline-none transition-all text-slate-900";

  const countryCodes = [
    { code: "+91", label: "IN +91" },
    { code: "+1", label: "US +1" },
    { code: "+44", label: "UK +44" },
    { code: "+971", label: "UAE +971" },
    { code: "+65", label: "SG +65" },
    { code: "+61", label: "AU +61" },
    { code: "+49", label: "DE +49" },
  ];

  // --- Handlers ---

  const handleGuestBypass = () => {
    localStorage.setItem("demoMode", "client");
    localStorage.setItem(
      "user",
      JSON.stringify({ type: "client", id: "demo-client" })
    );
    onLoginSuccess("client");
  };

  const handleAdminBypass = (
    role: "superadmin" | "content_writer" | "designer" = "superadmin"
  ) => {
    localStorage.setItem("demoMode", role);
    localStorage.setItem(
      "user",
      JSON.stringify({ type: role, id: `demo-${role}`, name: `Demo ${role}` })
    );
    onLoginSuccess("admin");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.auth.login({
        email: loginEmail,
        password: loginPassword,
      });

      if (data) {
        // Save Tokens
        if (data.token) {
          localStorage.setItem("accessToken", data.token);
          if (data.refresh) localStorage.setItem("refreshToken", data.refresh);
        } else if (data.access) {
          localStorage.setItem("accessToken", data.access);
          if (data.refresh) localStorage.setItem("refreshToken", data.refresh);
        }

        // Save Client ID
        if (data.client_id) {
          localStorage.setItem("client_id", data.client_id.toString());
        }

        // Handle User Session
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
          const adminRoles = [
            "superadmin",
            "manager",
            "admin",
            "content_writer",
            "designer",
          ];
          if (data.user.type === "editor") {
            onLoginSuccess("editor");
          } else if (adminRoles.includes(data.user.type)) {
            onLoginSuccess("admin");
          } else {
            onLoginSuccess("client");
          }
        } else {
          onLoginSuccess("client");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (signupPassword !== confirmSignupPassword) {
      setError("Passwords do not match");
      return;
    }

    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload = {
      company_name: formData.business.name,
      billing_address: formData.business.address,
      gstin: formData.business.gstin,
      business_email: formData.business.email,
      business_phone: formData.business.phone,
      business_phone_country_code: businessCountryCode,
      whatsapp_updates: formData.business.whatsappConsent,
      contact_person: {
        salutation: formData.contactPerson.salutation,
        first_name: formData.contactPerson.firstName,
        last_name: formData.contactPerson.lastName,
        email: formData.contactPerson.email,
        phone: formData.contactPerson.phone,
        country_code: contactCountryCode,
        password: signupPassword,
      },
    };

    try {
      const data = await api.auth.signupClientInitiate(payload);

      if (data) {
        setSuccessMsg(data.detail || "OTP Sent Successfully");
        setView("otp-signup");
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySignupOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.auth.signupClientVerify({
        contact_email: formData.contactPerson.email,
        otp: enteredOtp,
      });

      // Response may be standardized as { success: true, detail: '', data: { ...profile... } }
      const profile = data?.data ?? data;

      // client id may be under data.id or client_id
      const clientId = data?.client_id ?? profile?.id;
      if (clientId) localStorage.setItem("client_id", clientId.toString());

      // user may be nested under profile.user_detail or returned separately
      const userObj = data?.user ?? profile?.user_detail ?? profile?.user;

      // tokens (if provided) -- keep existing compatibility
      const token = data?.token || data?.access;
      if (token) {
        localStorage.setItem("accessToken", token);
        if (data.refresh) localStorage.setItem("refreshToken", data.refresh);
        if (userObj) {
          localStorage.setItem("user", JSON.stringify(userObj));
          onLoginSuccess("client");
        } else {
          setView("login");
          setLoginEmail(formData.contactPerson.email);
        }
      } else {
        // No tokens; persist user/profile and navigate to client hub
        if (userObj) {
          localStorage.setItem("user", JSON.stringify(userObj));
        }
        if (clientId) {
          localStorage.setItem("client_id", clientId.toString());
        }
        // navigate to client area
        onLoginSuccess("client");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.auth.resetPasswordInitiate({
        email: forgotEmail,
      });
      setSuccessMsg(data.detail || "OTP Sent");
      setView("reset-final");
      setOtp(["", "", "", "", "", ""]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
    setIsLoading(true);
    setError(null);
    try {
      await api.auth.resetPasswordVerify({
        email: forgotEmail,
        otp: enteredOtp,
        new_password: newPassword,
      });
      alert("Password reset successful. Please log in.");
      setView("login");
      setLoginEmail(forgotEmail);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (purpose: "signup" | "reset") => {
    setIsLoading(true);
    setSuccessMsg(null);
    setError(null);
    try {
      if (purpose === "signup") {
        await api.auth.signupClientResend({
          contact_email: formData.contactPerson.email,
        });
        setSuccessMsg("OTP resent to contact email");
      } else {
        await api.auth.resetPasswordResend({
          email: forgotEmail,
        });
        setSuccessMsg("OTP resent to email");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBusinessChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      business: {
        ...prev.business,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      contactPerson: {
        ...prev.contactPerson,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const ErrorDisplay = () =>
    error ? (
      <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> {error}
      </div>
    ) : null;

  const SuccessDisplay = () =>
    successMsg ? (
      <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>{" "}
        {successMsg}
      </div>
    ) : null;

  if (view === "login") {
    return (
      <div className="min-h-screen flex bg-white">
        <div className="hidden lg:flex w-1/2 bg-[#0F172A] relative overflow-hidden items-center justify-center text-white p-12">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#FF6B6B] rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#6C5CE7] rounded-full mix-blend-screen filter blur-[128px] opacity-20 animate-pulse delay-700"></div>
          <div className="relative z-10 max-w-lg">
            <h1 className="text-5xl font-extrabold mb-6">
              Welcome Back to <br />
              <span className="text-[#FF6B6B]">Tarviz</span>{" "}
              <span className="text-[#6C5CE7]">Digimart</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Access your dashboard to manage campaigns, invoices, and your
              digital growth strategy.
            </p>
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 bg-slate-50">
          <div className="w-full max-w-md mx-auto">
            <button
              onClick={onNavigateHome}
              className="flex items-center text-slate-500 hover:text-[#6C5CE7] mb-8 font-medium transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Home
            </button>
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Sign In
              </h2>
              <p className="text-slate-500">
                New here?{" "}
                <button
                  onClick={() => {
                    setView("signup");
                    setError(null);
                  }}
                  className="text-[#6C5CE7] font-bold hover:underline"
                >
                  Create an account
                </button>
              </p>
            </div>
            <ErrorDisplay />
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-3.5 text-slate-400"
                    size={20}
                  />
                  <input
                    required
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={`pl-12 ${inputClass}`}
                    placeholder="you@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-3.5 text-slate-400"
                    size={20}
                  />
                  <input
                    required
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`pl-12 ${inputClass}`}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setView("forgot-email");
                    setError(null);
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-[#FF6B6B]"
                >
                  Forgot password?
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
              </button>
            </form>
            <div className="mt-8 pt-8 border-t border-slate-200">
              <p className="text-xs text-center text-slate-400 mb-4 font-bold uppercase tracking-widest">
                Demo Access
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleGuestBypass}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-[#6C5CE7] hover:bg-violet-50 transition-all group"
                >
                  <Unlock
                    size={20}
                    className="text-slate-400 group-hover:text-[#6C5CE7] mb-2"
                  />
                  <span className="text-sm font-bold text-slate-600 group-hover:text-[#6C5CE7]">
                    Client View
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAdminBypass("superadmin")}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-[#FF6B6B] hover:bg-orange-50 transition-all group"
                >
                  <ShieldCheck
                    size={20}
                    className="text-slate-400 group-hover:text-[#FF6B6B] mb-2"
                  />
                  <span className="text-sm font-bold text-slate-600 group-hover:text-[#FF6B6B]">
                    Admin View
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAdminBypass("content_writer")}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <PenTool
                    size={20}
                    className="text-slate-400 group-hover:text-blue-500 mb-2"
                  />
                  <span className="text-sm font-bold text-slate-600 group-hover:text-blue-500">
                    Writer View
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAdminBypass("designer")}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-pink-500 hover:bg-pink-50 transition-all group"
                >
                  <Palette
                    size={20}
                    className="text-slate-400 group-hover:text-pink-500 mb-2"
                  />
                  <span className="text-sm font-bold text-slate-600 group-hover:text-pink-500">
                    Designer View
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "forgot-email") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full">
          <button
            onClick={() => setView("login")}
            className="flex items-center text-slate-500 hover:text-[#6C5CE7] mb-6 font-medium transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Login
          </button>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Reset Password
          </h2>
          <p className="text-slate-500 mb-8">
            Enter your registered email address. We'll send you an OTP to reset
            your password.
          </p>
          <ErrorDisplay />
          <form onSubmit={handleSendResetOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                required
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className={inputClass}
                placeholder="you@company.com"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Send OTP"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === "reset-final") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Secure your account
          </h2>
          <p className="text-slate-500 mb-8">
            Enter the code sent to <b>{forgotEmail}</b> and your new password.
          </p>
          <SuccessDisplay />
          <ErrorDisplay />
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Verification Code (OTP)
              </label>
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-slate-200 rounded-xl focus:border-[#6C5CE7] focus:ring-2 focus:ring-violet-100 outline-none text-slate-800"
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-3.5 text-slate-400"
                  size={20}
                />
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`pl-12 ${inputClass}`}
                  placeholder="New strong password"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || otp.join("").length !== 6 || !newPassword}
              className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
          <button
            onClick={() => handleResendOtp("reset")}
            className="mt-6 w-full text-sm text-slate-500 hover:text-[#6C5CE7] font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> Resend OTP
          </button>
        </div>
      </div>
    );
  }

  if (view === "signup") {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={() => setView("login")}
              className="flex items-center text-slate-500 hover:text-[#6C5CE7] font-medium transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" /> Back to Login
            </button>
            <h2 className="text-2xl font-bold text-slate-900">
              Create Client Account
            </h2>
          </div>
          <ErrorDisplay />
          <form
            onSubmit={handleSignupSubmit}
            className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
          >
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-violet-50 text-[#6C5CE7] rounded-lg">
                    <Building size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Business Details
                  </h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="name"
                      value={formData.business.name}
                      onChange={handleBusinessChange}
                      className={inputClass}
                      placeholder="Tarviz Digimart"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Address (For Invoice)
                    </label>
                    <textarea
                      name="address"
                      value={formData.business.address}
                      onChange={handleBusinessChange}
                      rows={3}
                      className={`${inputClass} resize-none`}
                      placeholder="Street, City, Zip"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      GSTIN
                    </label>
                    <input
                      name="gstin"
                      value={formData.business.gstin}
                      onChange={handleBusinessChange}
                      className={inputClass}
                      placeholder="22AAAAA0000A1Z5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Business Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.business.email}
                      onChange={handleBusinessChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Business Phone
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={businessCountryCode}
                        onChange={(e) => setBusinessCountryCode(e.target.value)}
                        className="w-24 px-2 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#6C5CE7] outline-none text-xs"
                      >
                        {countryCodes.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.business.phone}
                        onChange={handleBusinessChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-50 text-[#FF6B6B] rounded-lg">
                    <User size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Contact Person
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-24">
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        Salutation
                      </label>
                      <select
                        name="salutation"
                        value={formData.contactPerson.salutation}
                        onChange={handleContactChange}
                        className={`${inputClass} bg-white`}
                      >
                        <option>Mr</option>
                        <option>Ms</option>
                        <option>Mrs</option>
                        <option>Dr</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        name="firstName"
                        value={formData.contactPerson.firstName}
                        onChange={handleContactChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      name="lastName"
                      value={formData.contactPerson.lastName}
                      onChange={handleContactChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Email (Login ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.contactPerson.email}
                      onChange={handleContactChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={contactCountryCode}
                        onChange={(e) => setContactCountryCode(e.target.value)}
                        className="w-24 px-2 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-[#6C5CE7] outline-none text-xs"
                      >
                        {countryCodes.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        required
                        type="tel"
                        name="phone"
                        value={formData.contactPerson.phone}
                        onChange={handleContactChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="password"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className={inputClass}
                        placeholder="Create password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="password"
                        value={confirmSignupPassword}
                        onChange={(e) =>
                          setConfirmSignupPassword(e.target.value)
                        }
                        className={inputClass}
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 p-6 flex justify-between items-center border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setView("login");
                  handleGuestBypass();
                }}
                className="text-slate-400 hover:text-[#6C5CE7] text-sm font-bold flex items-center gap-2 transition-colors"
              >
                <Unlock size={16} /> Guest Bypass
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-[#FF6B6B] to-[#6C5CE7] text-white px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    <span className="whitespace-nowrap">Verify & Create</span>{" "}
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (view === "otp-signup") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-violet-100 text-[#6C5CE7] rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Verify Account
          </h2>
          <p className="text-slate-500 mb-8">
            We've sent a code to{" "}
            <span className="font-bold text-slate-800">
              {formData.contactPerson.email}
            </span>
          </p>
          <SuccessDisplay />
          <ErrorDisplay />
          <div className="flex justify-center gap-2 mb-8">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  otpRefs.current[idx] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-slate-200 rounded-xl focus:border-[#6C5CE7] focus:ring-2 focus:ring-violet-100 outline-none transition-all text-slate-800"
              />
            ))}
          </div>
          <button
            onClick={handleVerifySignupOtp}
            disabled={otp.join("").length !== 6 || isLoading}
            className="w-full bg-[#0F172A] text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Confirm OTP"}
          </button>
          <button
            onClick={() => handleResendOtp("signup")}
            className="mt-6 text-sm text-slate-500 hover:text-[#6C5CE7] font-medium flex items-center justify-center gap-1 w-full"
          >
            <RefreshCw size={14} /> Resend OTP
          </button>
          <button
            onClick={() => setView("signup")}
            className="mt-2 text-sm text-slate-400 hover:text-slate-600"
          >
            Change Email Address
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthPage;
