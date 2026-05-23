import { useState, useMemo } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Teachers from "./pages/Teachers";
import Courses from "./pages/Courses";
import Students from "./pages/Students";
import Boshqarish from "./pages/Boshqarish";
import Guruhlar from "./pages/Guruhlar";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("asosiy");
  const [activeTab, setActiveTab] = useState("Kurslar");

  const currentPage = useMemo(() => {
    if (!user) return null;
    switch (activePage) {
      case "asosiy": return <Dashboard user={user} />;
      case "oqituvchi": return <Teachers />;
      case "guruhlar": return <Guruhlar />;
      case "talabalar": return <Students />;
      case "kurslar": return <Courses />;
      case "sovgalar": return <ComingSoon title="Sovg'alar" icon="🎁" />;
      case "moliya": return <ComingSoon title="Moliya" icon="💰" />;
      case "boshqarish": return <Boshqarish activeTab={activeTab} setActiveTab={setActiveTab} />;
      default: return <Dashboard user={user} />;
    }
  }, [activePage, user, activeTab]);


  if (!user) {
    return <Login onLogin={(userData) => setUser(userData)} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar activePage={activePage} setActivePage={setActivePage} setActiveTab={setActiveTab} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar user={user} activePage={activePage} onLogout={() => setUser(null)} />
        <main className="flex-1 overflow-y-auto p-6">
          {currentPage}
        </main>
      </div>
    </div>
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