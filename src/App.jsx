import { useState, useMemo, useCallback, useEffect } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Teachers from "./pages/Teachers";
import Courses from "./pages/Courses";
import Students from "./pages/Students";
import Boshqarish from "./pages/Boshqarish";
import Guruhlar from "./pages/Guruhlar";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import GroupDetails from "./pages/GroupDetails";

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      if (!saved || saved === "undefined") return null;
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  // ✅ URL dan activePage olish:
  const pathParts = location.pathname.split("/").filter(Boolean);
  const activePage = pathParts[0] || "asosiy";
  const pathParam = pathParts[1];

  const handleSetActivePage = (page) => {
    navigate(page === "asosiy" ? "/" : `/${page}`);
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }, [navigate]);

  const getTokenExpirationTime = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) return 0;

    try {
      const payload = token.split(".")[1];
      if (!payload) return 0;

      const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(atob(normalizedPayload));

      if (!decoded.exp) return null;
      return decoded.exp * 1000;
    } catch {
      return 0;
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const expirationTime = getTokenExpirationTime();
    if (expirationTime === null) return;

    const delay = Math.max(expirationTime - Date.now(), 0);
    const logoutTimer = window.setTimeout(handleLogout, delay);

    return () => window.clearTimeout(logoutTimer);
  }, [getTokenExpirationTime, handleLogout, user]);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      if (localStorage.getItem("token") && response.status === 401) {
        handleLogout();
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [handleLogout]);

  const currentPage = useMemo(() => {
    if (!user) return null;
    switch (activePage) {
      case "asosiy":     return <Dashboard user={user} />;
      case "oqituvchi":  return <Teachers />;
      case "guruhlar":
        if (pathParam) {
          return <GroupDetails id={pathParam} />;
        }
        return <Guruhlar />;
      case "talabalar":  return <Students />;
      case "kurslar":    return <Courses />;
      case "sovgalar":   return <ComingSoon title="Sovg'alar" icon="🎁" />;
      case "moliya":     return <ComingSoon title="Moliya" icon="💰" />;
      case "boshqarish": return <Boshqarish />;
      default:           return <Dashboard user={user} />;
    }
  }, [activePage, pathParam, user]);

  if (!user) {
    return <Login onLogin={(userData) => {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      navigate("/");
    }} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={handleSetActivePage} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar user={user} activePage={activePage} onLogout={() => {
          handleLogout();
        }} />
        <main className="flex-1 overflow-y-auto p-6">
          {currentPage}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function ComingSoon({ title, icon }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
      <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center text-4xl shadow-sm">
        {icon}
      </div>
      <h2 className="text-2xl font-extrabold text-slate-800">{title}</h2>
      <p className="text-slate-500 text-sm">Bu sahifa hali ishlanmoqda...</p>
    </div>
  );
}
