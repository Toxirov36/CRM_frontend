import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { BrowserRouter, useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
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
import StudentDashboard from "./pages/StudentDashboard";

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

  const pathParts = location.pathname.split("/").filter(Boolean);
  
  let activePage = pathParts[0] || (user?.role === "TEACHER" ? "guruhlar" : "asosiy");
  let pathParam = null;
  let urlLessonId = null;
  let urlStaffId = null;
  let urlHomeworkId = null;

  if (activePage === "my-groups") {
    activePage = "guruhlar";
    if (pathParts[1] === "chapters") {
      pathParam = pathParts[2] || null;
      
      // Parse nested URL parameters
      for (let i = 3; i < pathParts.length; i += 2) {
        const key = pathParts[i];
        const val = pathParts[i + 1];
        if (key === "lesson" && val) urlLessonId = val;
        if (key === "staff" && val) urlStaffId = val;
        if (key === "homeworkId" && val) urlHomeworkId = val;
      }
    }
  } else {
    pathParam = pathParts[1] || null;
  }

  const handleSetActivePage = (page) => {
    if (page === "guruhlar") {
      navigate("/my-groups/chapters");
    } else {
      navigate(page === "asosiy" ? "/" : `/${page}`);
    }
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  }, [navigate]);

  const handleLogoutRef = useRef(handleLogout);
  useEffect(() => {
    handleLogoutRef.current = handleLogout;
  }, [handleLogout]);

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
    if (user?.role === "TEACHER" && (location.pathname === "/" || location.pathname === "/guruhlar")) {
      navigate("/my-groups/chapters", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname === "/auth/callback") {
      const params = new URLSearchParams(location.search);
      const token = params.get("token");
      if (token) {
        try {
          const base64 = token.split('.')[1];
          const base64Fixed = base64.replace(/-/g, '+').replace(/_/g, '/');
          const decoded = JSON.parse(atob(base64Fixed));
          const userData = {
            ...decoded,
            fullName: decoded.first_name || decoded.phone || "Admin",
            role: decoded.role || "USER",
          };
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
          navigate("/", { replace: true });
        } catch (err) {
          console.error("Token decoding error", err);
        }
      }
    }
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      if (localStorage.getItem("token") && response.status === 401) {
        handleLogoutRef.current();
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const currentPage = useMemo(() => {
    if (!user) return null;
    switch (activePage) {
      case "asosiy":     return <Dashboard user={user} />;
      case "oqituvchi":  return <Teachers />;
      case "guruhlar":
      case "yigilayotgan-guruhlar":
        if (pathParam) {
          return (
            <GroupDetails 
              id={pathParam} 
              user={user} 
              urlHomeworkId={urlHomeworkId}
              urlLessonId={urlLessonId}
              urlStaffId={urlStaffId}
            />
          );
        }
        return <Guruhlar user={user} isTeacher={user.role === "TEACHER"} type={activePage} />;
      case "talabalar":  return <Students />;
      case "kurslar":    return <Courses />;
      case "sovgalar":   return <ComingSoon title="Sovg'alar" icon="🎁" />;
      case "moliya":     return <ComingSoon title="Moliya" icon="💰" />;
      case "boshqarish": return <Boshqarish />;
      case "profil":     return <ComingSoon title="Profil" icon="👤" />;
      default:           return <Dashboard user={user} />;
    }
  }, [activePage, pathParam, user, urlHomeworkId, urlLessonId, urlStaffId]);

  if (!user) {
    return <Login onLogin={(userData) => {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      navigate("/");
    }} />;
  }

  // Student gets a completely separate portal
  if (user.role === "STUDENT") {
    return <StudentDashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={handleSetActivePage} user={user} />
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
    <ThemeProvider defaultTheme="light" storageKey="theme">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
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
