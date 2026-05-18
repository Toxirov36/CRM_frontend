import { useState } from "react";

const MENU_ITEMS = [
  {
    label: "Kurslar", tab: "kurslar",
    svg: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
  },
  {
    label: "Xonalar", tab: "xonalar",
    svg: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  },
  {
    label: "Filiallar", tab: "filiallar",
    svg: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
  },
  {
    label: "Hodimlar", tab: "hodimlar",
    svg: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
];

const NAV = [
  {
    id: "asosiy", label: "Asosiy",
    svg: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  },
  {
    id: "oqituvchi", label: "O'qituvchilar",
    svg: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  },
  {
    id: "guruhlar", label: "Guruhlar",
    svg: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    id: "talabalar", label: "Talabalar",
    svg: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
  },
  {
    id: "sovgalar", label: "Sovg'alar",
    svg: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><path d="M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>,
  },
  {
    id: "moliya", label: "Moliya", badge: "100",
    svg: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>,
  },
  {
    id: "boshqarish", label: "Boshqarish",
    svg: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" /></svg>,
  },
];

export default function Sidebar({ activePage, setActivePage, setActiveTab }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="w-56 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm relative">

      {/* Logo + Menu button */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">S</div>
          <span className="font-bold text-slate-800 text-sm">Study</span>
        </div>

        {/* Menu trigger button */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(s => !s)}
            className="w-7 h-7 rounded-xl bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center text-white transition-colors shadow-md shadow-indigo-100"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {/* Dropdown */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
              <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-2xl z-40 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menu</p>
                </div>
                <div className="py-1">
                  {MENU_ITEMS.map(m => (
                    <button
                      key={m.label}
                      onClick={() => {
                        setActivePage("boshqarish");
                        setActiveTab(m.label); // ✅ "Kurslar", "Xonalar", ...
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-left group"
                    >
                      <span className="text-slate-400 group-hover:text-indigo-500 transition-colors">{m.svg}</span>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${activePage === item.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
          >
            <span className={activePage === item.id ? "text-white" : "text-slate-400"}>
              {item.svg}
            </span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span className="text-xs bg-orange-400 text-white rounded-full px-1.5 py-0.5 font-semibold leading-none">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}