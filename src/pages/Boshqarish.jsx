import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Courses from './Courses';
import Rooms from './Rooms';


/* ───────── Data ───────── */
const TABS = [
  "Kurslar", "Xonalar", "Filiallar", "Hodimlar",
];

const FILTERS = [
  "AiCoder markazi",
];


const INITIAL_BRANCHES = [
  { id: 1, name: "Chilonzor filiali", address: "Qatortol ko'chasi, 24-uy", phone: "+998 90 123 45 67" },
  { id: 2, name: "Yunusobod filiali", address: "Amir Temur ko'chasi, 10-uy", phone: "+998 90 987 65 43" },
];

const INITIAL_STAFF = [
  { id: 1, name: "Ali Valiyev", role: "Mentor", phone: "+998 99 000 11 22", status: "Faol" },
  { id: 2, name: "Olima Akramova", role: "Administrator", phone: "+998 99 111 22 33", status: "Faol" },
  { id: 3, name: "Jasur Hamroyev", role: "Mentor", phone: "+998 99 222 33 44", status: "Ta'tilda" },
];

/* ───────── Branch Drawer ───────── */
function BranchDrawer({ branch, onClose, onSave }) {
  const [name, setName] = useState(branch?.name || "");
  const [address, setAddress] = useState(branch?.address || "");
  const [phone, setPhone] = useState(branch?.phone || "");

  const handle = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), address, phone });
  };

  return (
    <DrawerShell title={branch ? "Filialni tahrirlash" : "Filial qo'shish"} onClose={onClose} onSave={handle}>
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Nomi</label>
        <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="Filial nomi" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Manzil</label>
        <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="Manzilni kiriting" value={address} onChange={e => setAddress(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Telefon</label>
        <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="+998" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
    </DrawerShell>
  );
}

/* ───────── Staff Drawer ───────── */
function StaffDrawer({ staff, onClose, onSave }) {
  const [name, setName] = useState(staff?.name || "");
  const [role, setRole] = useState(staff?.role || "");
  const [phone, setPhone] = useState(staff?.phone || "");

  const handle = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), role, phone, status: staff?.status || "Faol" });
  };

  return (
    <DrawerShell title={staff ? "Xodimni tahrirlash" : "Xodim qo'shish"} onClose={onClose} onSave={handle}>
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Ism-familiya</label>
        <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="F.I.O" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Lavozim</label>
        <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="Masalan: Mentor" value={role} onChange={e => setRole(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Telefon</label>
        <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400" placeholder="+998" value={phone} onChange={e => setPhone(e.target.value)} />
      </div>
    </DrawerShell>
  );
}

/* ───────── Filiallar Tab ───────── */
function FiliallarTab() {
  const [branches, setBranches] = useState(INITIAL_BRANCHES);
  const [drawer, setDrawer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleSave = (data) => {
    if (drawer === "add") {
      setBranches(b => [...b, { id: Date.now(), ...data }]);
    } else {
      setBranches(b => b.map(x => x.id === drawer.id ? { ...x, ...data } : x));
    }
    setDrawer(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-slate-800 text-base">Filiallar</h2>
        <button onClick={() => setDrawer("add")} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95">
          + Filial qo'shish
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {branches.map(b => (
          <div key={b.id} className="p-5 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all group relative flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a3 3 0 0 1 6 0v4" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{b.name}</h3>
              <p className="text-sm text-slate-500 mt-1">{b.address}</p>
              <p className="text-xs font-semibold text-indigo-600 mt-2">{b.phone}</p>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setDeleteId(b.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg></button>
              <button onClick={() => setDrawer(b)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-500 transition-colors"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg></button>
            </div>
          </div>
        ))}
      </div>
      {drawer && <BranchDrawer branch={drawer === "add" ? null : drawer} onClose={() => setDrawer(null)} onSave={handleSave} />}
      {deleteId && <DeleteConfirm onClose={() => setDeleteId(null)} onConfirm={() => { setBranches(b => b.filter(x => x.id !== deleteId)); setDeleteId(null); }} />}
    </div>
  );
}

/* ───────── Hodimlar Tab ───────── */
function HodimlarTab() {
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [drawer, setDrawer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const handleSave = (data) => {
    if (drawer === "add") {
      setStaff(s => [...s, { id: Date.now(), ...data }]);
    } else {
      setStaff(s => s.map(x => x.id === drawer.id ? { ...x, ...data } : x));
    }
    setDrawer(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="font-bold text-slate-800 text-base">Xodimlar</h2>
        <button onClick={() => setDrawer("add")} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95">
          + Xodim qo'shish
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-gray-50">
              <th className="pb-4 px-4">Xodim</th>
              <th className="pb-4 px-4">Lavozim</th>
              <th className="pb-4 px-4">Telefon</th>
              <th className="pb-4 px-4">Status</th>
              <th className="pb-4 px-4 text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {staff.map(s => (
              <tr key={s.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">{s.name.charAt(0)}</div>
                    <span className="text-sm font-bold text-slate-800">{s.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-slate-600">{s.role}</td>
                <td className="py-4 px-4 text-sm font-medium text-slate-500">{s.phone}</td>
                <td className="py-4 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.status === 'Faol' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{s.status}</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => setDrawer(s)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg></button>
                    <button onClick={() => setDeleteId(s.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {drawer && <StaffDrawer staff={drawer === "add" ? null : drawer} onClose={() => setDrawer(null)} onSave={handleSave} />}
      {deleteId && <DeleteConfirm onClose={() => setDeleteId(null)} onConfirm={() => { setStaff(s => s.filter(x => x.id !== deleteId)); setDeleteId(null); }} />}
    </div>
  );
}

/* ───────── Main Page ───────── */
export default function Boshqarish() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathParts = location.pathname.split("/").filter(Boolean);
  
  // pathParts[1] is the tab, e.g., 'kurslar'
  const tabParam = pathParts[1] || "kurslar";
  // Find matching tab from TABS ignoring case, or default to first tab
  const activeTabMatch = TABS.find(t => t.toLowerCase() === tabParam.toLowerCase());
  const activeTab = activeTabMatch || TABS[0];

  const handleSetTab = (tab) => {
    navigate(`/boshqarish/${tab.toLowerCase()}`);
  };

  return (
    <div className="pb-10">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Boshqarish</h1>
      <div className="flex gap-2 border-b border-gray-100 mb-8 overflow-x-auto custom-scrollbar scrollbar-hide">
        {TABS.map(tab => (
          <button key={tab} onClick={() => handleSetTab(tab)} className={`whitespace-nowrap pb-4 px-4 text-sm font-bold transition-all relative shrink-0 ${activeTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
            {tab}
            {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />}
          </button>
        ))}
      </div>
      {activeTab === "Kurslar" && <Courses />}
      {activeTab === "Xonalar" && <Rooms />}
      {activeTab === "Filiallar" && <FiliallarTab />}
      {activeTab === "Hodimlar" && <HodimlarTab />}
    </div>
  );
}
