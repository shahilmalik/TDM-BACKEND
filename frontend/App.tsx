import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ContactPage from "./pages/ContactPage";
import AuthPage from "./pages/AuthPage";
import AboutPage from "./pages/AboutPage";
import CareersPage from "./pages/CareersPage";
import BlogPage from "./pages/BlogPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import {
  ensureNotificationsRegistered,
  unregisterNotifications,
} from "./services/fcm";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentServiceId, setCurrentServiceId] = useState("smm");
  const [authStatus, setAuthStatus] = useState<{
    isLoggedIn: boolean;
    role: "client" | "admin";
  }>({
    isLoggedIn: false,
    role: "client",
  });
  const [notification, setNotification] = useState<string | null>(null);

  // Restore auth state from localStorage on app load so reloads keep session
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");
    if (token) {
      let role: "client" | "admin" = "client";
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const adminRoles = [
            "superadmin",
            "manager",
            "admin",
            "content_writer",
            "designer",
          ];
          if (adminRoles.includes(user.type)) role = "admin";
        } catch (e) {
          // ignore JSON parse errors
        }
      }
      setAuthStatus({ isLoggedIn: true, role });
      setCurrentPage(role === "admin" ? "admin-dashboard" : "dashboard");

      // Avoid prompting on reload; only auto-register if permission already granted.
      try {
        if (typeof Notification !== "undefined") {
          if (Notification.permission === "granted") {
            ensureNotificationsRegistered();
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleNavigate = (page: string, subPage?: string) => {
    setCurrentPage(page);
    if (page === "services" && subPage) {
      setCurrentServiceId(subPage);
    }
    window.scrollTo(0, 0);
  };

  const handleLoginSuccess = (role: "client" | "admin") => {
    setAuthStatus({ isLoggedIn: true, role });
    setNotification(
      role === "admin" ? "Welcome Admin!" : "Logged in successfully."
    );
    setTimeout(() => setNotification(null), 3000);
    setCurrentPage(role === "admin" ? "admin-dashboard" : "dashboard");

    // Register push notifications after login (will request permission if needed).
    ensureNotificationsRegistered();
  };

  const handleLogout = async () => {
    // Best-effort device token unregister BEFORE removing auth token.
    try {
      await unregisterNotifications();
    } catch (e) {
      // ignore
    }

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("demoMode");

    setAuthStatus({ isLoggedIn: false, role: "client" });
    setCurrentPage("home");
    setNotification("Logged out successfully.");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLoginRequestForQuote = () => {
    if (authStatus.isLoggedIn) {
      setNotification("Quote request sent! Check your dashboard.");
      setTimeout(() => setNotification(null), 3000);
    } else {
      const confirmLogin = window.confirm(
        "To save your quote and get a response, please Login or Sign Up."
      );
      if (confirmLogin) {
        setCurrentPage("auth");
      }
    }
  };

  // Render Page Logic
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={handleNavigate} />;
      case "services":
        return (
          <ServicesPage
            serviceId={currentServiceId}
            onLoginRequest={handleLoginRequestForQuote}
            onNavigate={handleNavigate}
          />
        );
      case "auth":
        return (
          <AuthPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateHome={() => handleNavigate("home")}
          />
        );
      case "dashboard":
        if (!authStatus.isLoggedIn) {
          setTimeout(() => setCurrentPage("auth"), 0);
          return null;
        }
        return (
          <Dashboard onLogout={handleLogout} onNavigate={handleNavigate} />
        );
      case "admin-dashboard":
        if (!authStatus.isLoggedIn || authStatus.role !== "admin") {
          setTimeout(() => setCurrentPage("auth"), 0);
          return null;
        }
        return (
          <AdminDashboard onLogout={handleLogout} onNavigate={handleNavigate} />
        );
      case "contact":
        return <ContactPage onLogin={() => setCurrentPage("auth")} />;
      case "about":
        return <AboutPage />;
      case "careers":
        return <CareersPage onNavigate={handleNavigate} />;
      case "blog":
        return <BlogPage onNavigate={handleNavigate} />;
      case "privacy":
        return <PrivacyPolicy onNavigate={handleNavigate} />;
      case "terms":
        return <TermsOfService onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Hide standard Navbar for Auth, Admin, and Client Dashboard pages for cleaner look */}
      {currentPage !== "auth" &&
        currentPage !== "admin-dashboard" &&
        currentPage !== "dashboard" && (
          <Navbar
            onNavigate={handleNavigate}
            currentPage={currentPage}
            isLoggedIn={authStatus.isLoggedIn}
            onLogin={() => setCurrentPage("auth")}
            onLogout={handleLogout}
          />
        )}

      {notification && (
        <div className="fixed top-24 right-4 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl z-[100] animate-bounce-slow border-l-4 border-[#6C5CE7] max-w-sm">
          <p className="font-bold mb-1">Notification</p>
          <p className="text-sm text-gray-300">{notification}</p>
        </div>
      )}

      <ErrorBoundary>{renderPage()}</ErrorBoundary>
    </div>
  );
}

export default App;
