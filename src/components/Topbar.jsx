import { useState } from "react";
import { useTheme } from "./theme-provider";


export default function Topbar({ user, activePage, onLogout }) {
  const [lang, setLang] = useState("O'zbekcha");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 shadow-sm relative">


      <div className="flex-1" />

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Language */}
        <button
          className="flex items-center gap-1.5 text-sm text-slate-600 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
          onClick={() => setLang(l => l === "O'zbekcha" ? "English" : "O'zbekcha")}
        >
          {lang}
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {/* Bell */}
        <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 border border-gray-200 relative transition-colors">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Dark mode */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 border border-gray-200 transition-colors"
        >
          {theme === "dark" ? (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Avatar + dropdown */}
        <div className="relative">
          <div
            onClick={() => setShowUserMenu(s => !s)}
            className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:bg-indigo-700 transition-colors"
          >
            {user?.first_name?.charAt(0).toUpperCase() ?? "U"}
            {/* {user?.first_name} {user?.last_name} */}
          </div>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-11 w-44 bg-white rounded-xl border border-gray-100 shadow-xl z-50 py-1">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-slate-800">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-slate-400">{user?.role}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false); localStorage.removeItem("token"); // ✅
                    localStorage.removeItem("user"); onLogout && onLogout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                  </svg>
                  Chiqish
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}