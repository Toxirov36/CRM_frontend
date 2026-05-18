import { useState, useEffect } from "react";

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

/* ───────── Common Drawer Shell ───────── */
function DrawerShell({ title, subtitle, onClose, onSave, children }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100 animate-in slide-in-from-right duration-300">
        <div className="flex items-start justify-between px-8 pt-8 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors mt-1">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 px-8 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
        <div className="px-8 py-6 border-t border-gray-50 flex gap-3 justify-end bg-gray-50/30">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-slate-600 hover:bg-gray-50 transition-colors">
            Bekor qilish
          </button>
          <button onClick={onSave} className="px-8 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6b4de6] text-white text-sm font-semibold shadow-lg shadow-indigo-100 transition-all active:scale-95">
            Saqlash
          </button>
        </div>
      </div>
    </>
  );
}

/* ───────── Course Drawer ───────── */
function CourseDrawer({ course, onClose, onSave }) {
  const [name, setName] = useState(course?.name || "");
  const [filiallar, setFiliallar] = useState(course?.filiallar || ["Filial 1"]);
  const [duration_hours, setDurationHours] = useState(course?.duration_hours || "");
  const [duration_month, setDurationMonth] = useState(course?.duration_month || "");
  const [price, setPrice] = useState(course?.price || "");
  const [description, setDescription] = useState(course?.description || "");
  const [level, setLevel] = useState(course?.level || "beginner");

  const handle = () => {
    if (!name.trim() || !price) return;
    onSave({
      name: name.trim(),
      description: description,
      price: price,
      duration_month: duration_month,
      duration_hours: duration_hours,
      level: level,
      filiallar,
    });
  };

  const toggleFilial = (f) => {
    setFiliallar(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  return (
    <DrawerShell
      title={course ? "Kursni tahrirlash" : "Kurs qoshish"}
      subtitle={course ? "Kurs ma'lumotlarini o'zgartiring" : "Bu yerda siz yangi Kurs qo'shishingiz mumkin."}
      onClose={onClose}
      onSave={handle}
    >
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Nomi</label>
        <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="HR Manager..." value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-bold text-slate-800">Kurs mavjud boledigon filiallar</label>
          <button onClick={() => setFiliallar(["Filial 1", "Filial 2"])} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Hammasini tanlash</button>
        </div>
        <div className="space-y-3">
          {["Filial 1", "Filial 2"].map(f => (
            <label key={f} className="flex items-center gap-3 cursor-pointer group">
              <div onClick={() => toggleFilial(f)} className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${filiallar.includes(f) ? "bg-indigo-600 border-indigo-600" : "border-gray-300 group-hover:border-indigo-400"}`}>
                {filiallar.includes(f) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <span className="text-sm font-medium text-slate-700">{f}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Dars davomiyligi (soatda)</label>
        <input
          type="number"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
          placeholder="Masalan: 2"
          value={duration_hours}
          onChange={e => setDurationHours(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Kurs davomiyligi (oyda)</label>
        <input
          type="number"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all"
          placeholder="Masalan: 6"
          value={duration_month}
          onChange={e => setDurationMonth(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Narx</label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="12" cy="12" r="3" /></svg></div>
          <input type="number" className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-indigo-400 transition-all" placeholder="Narxini kiriting" value={price} onChange={e => setPrice(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Daraja (Level)</label>
        <div className="relative">
          <select
            className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 bg-white cursor-pointer"
            value={level}
            onChange={e => setLevel(e.target.value)}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Description</label>
        <textarea className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 h-28 resize-none transition-all" placeholder="Kurs haqida qisqacha ma'lumot..." value={description} onChange={e => setDescription(e.target.value)} />
        <p className="text-[11px] text-slate-400 mt-1.5">Bu kurs haqida qo'shimcha ma'lumot.</p>
      </div>


    </DrawerShell>
  );
}

/* ───────── Room Drawer ───────── */
function RoomDrawer({ room, onClose, onSave }) {
  const [name, setName] = useState(room?.name || "");
  const [sigim, setSigim] = useState(room?.sigim ? String(room.sigim) : "");

  const handle = () => {
    if (!name.trim() || !sigim) return;
    onSave({ name: name.trim(), sigim: Number(sigim) });
  };

  return (
    <DrawerShell title={room ? "Xonani tahrirlash" : "Xonani qo'shish"} onClose={onClose} onSave={handle}>
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Nomi</label>
        <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" placeholder="Xona nomi" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-800 mb-2">Sig'imi</label>
        <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" placeholder="Masalan: 20" value={sigim} onChange={e => setSigim(e.target.value)} />
      </div>
    </DrawerShell>
  );
}

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

/* ───────── Kurslar Tab ───────── */
function KurslarTab() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/courses", {
        headers: { "accept": "*/*", "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      setCourses(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError("Kurslarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem("token");

      if (drawer === "add") {
        const res = await fetch("/api/v1/courses", {
          method: "POST",
          headers: {
            "accept": "*/*",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description || "",
            price: Number(formData.price) || 0,
            duration_month: Number(formData.duration_month) || 0,
            duration_hours: Number(formData.duration_hours) || 0,
            level: formData.level || "beginner",
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Xatolik yuz berdi");
          return;
        }

        await fetchCourses(); // backend {success, message} qaytargani uchun qayta fetch

      } else {
        const res = await fetch(`/api/v1/courses/${drawer.id}`, {
          method: "PUT",
          headers: {
            "accept": "*/*",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description || "",
            price: Number(formData.price) || 0,
            duration_month: Number(formData.duration_month) || 0,
            duration_hours: Number(formData.duration_hours) || 0,
            level: formData.level || "beginner",
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Xatolik yuz berdi");
          return;
        }

        await fetchCourses(); // yangilangandan keyin ham qayta fetch
      }

      setDrawer(null);
    } catch (err) {
      console.error("Saqlashda xatolik:", err);
      alert("Server bilan bog'lanishda xatolik");
    }
  };


  if (loading) return <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Yuklanmoqda...</div>;
  if (error) return <div className="flex items-center justify-center h-40 text-red-400 text-sm">{error}</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-slate-800 text-base">Kurslar ro'yxati</h2>
        <button onClick={() => setDrawer("add")} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95">
          + Kurs qo'shish
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {courses.map(c => (
          <div key={c.id} className="p-4 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all group relative">
            <div className="mb-3 w-10 h-10 rounded-xl flex items-center justify-center" style={{ color: c.color || '#4F46E5', backgroundColor: (c.color || '#4F46E5') + '15' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
            </div>
            <h3 className="font-bold text-slate-800 mb-1">{c.name}</h3>
            <p className="text-xs text-slate-400 font-medium mb-2">
              Davomiyligi: {c.duration_month || "—"} oy
            </p>
            <p className="text-sm font-bold text-indigo-600">
              {Number(c.price || c.narx || 0).toLocaleString()} so'm
            </p>
            <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setDeleteId(c.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
              </button>
              <button onClick={() => setDrawer(c)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-500 transition-colors">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {drawer && <CourseDrawer course={drawer === "add" ? null : drawer} onClose={() => setDrawer(null)} onSave={handleSave} />}

      {deleteId && (
        <DeleteConfirm
          onClose={() => setDeleteId(null)}
          onConfirm={async () => {
            try {
              const token = localStorage.getItem("token");
              await fetch(`/api/v1/courses/${deleteId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` },
              });
              setCourses(c => c.filter(x => x.id !== deleteId));
              setDeleteId(null);
            } catch (err) {
              alert("O'chirishda xatolik");
            }
          }}
        />
      )}
    </div>
  );
}


/* ───────── Xonalar Tab ───────── */
function XonalarTab() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [forceRefresh, setForceRefresh] = useState(0);

  // ✅ Backend dan xonalarni olish
  useEffect(() => {
    const fetchRooms = async () => {
      // fetchRooms(); ← bu qatorni O'CHIRING
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/v1/rooms", {
          headers: {
            "accept": "*/*",
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const list = Array.isArray(data) ? data
          : Array.isArray(data.data) ? data.data
            : Array.isArray(data.rooms) ? data.rooms
              : [];
        setRooms(list);
      } catch (err) {
        setError("Xonalarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms(); // ← faqat shu qolsin
  }, [forceRefresh]);

  const handleSave = async ({ name, sigim }) => {
    try {
      const token = localStorage.getItem("token");

      if (drawer === "add") {
        // ✅ POST
        const res = await fetch("/api/v1/rooms", {
          method: "POST",
          headers: {
            "accept": "*/*",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ name, capacity: sigim }), // backend "capacity" kutishi mumkin
        });

        const data = await res.json();
        console.log("Room POST:", data);

        if (!res.ok) {
          alert(data.message || "Xatolik yuz berdi");
          return;
        }

      } else {
        // ✅ PUT
        const res = await fetch(`/api/v1/rooms/${drawer.id}`, {
          method: "PUT",
          headers: {
            "accept": "*/*",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ name, capacity: sigim }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.message || "Xatolik yuz berdi");
          return;
        }
      }

      setDrawer(null);
      setForceRefresh(r => r + 1); // ✅ ro'yxatni yangilash

    } catch (err) {
      alert("Server bilan bog'lanishda xatolik");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-40 text-slate-400 text-sm">Yuklanmoqda...</div>;
  if (error) return <div className="flex items-center justify-center h-40 text-red-400 text-sm">{error}</div>;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-slate-800 text-base">Xonalar</h2>
        <button onClick={() => setDrawer("add")} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95">
          + Xonani qo'shish
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.map(room => (
          <div key={room.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all group">
            <div>
              <p className="text-sm font-semibold text-slate-800">{room.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">Qoshildi: {room.created_at?.slice(0, 10) ?? "—"}</p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setDeleteId(room.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
              </button>
              <button onClick={() => setDrawer(room)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-500 transition-colors">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      {drawer && <RoomDrawer room={drawer === "add" ? null : drawer} onClose={() => setDrawer(null)} onSave={handleSave} />}
      {deleteId && <DeleteConfirm onClose={() => setDeleteId(null)} onConfirm={() => { setRooms(r => r.filter(x => x.id !== deleteId)); setDeleteId(null); }} />}
    </div>
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

/* ───────── Helpers ───────── */
function DeleteConfirm({ onClose, onConfirm }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-6 animate-in zoom-in-95 duration-200">
          <h3 className="font-bold text-slate-900 text-lg mb-2">O'chirishni tasdiqlaysizmi?</h3>
          <p className="text-sm text-slate-500 mb-6">Ushbu ma'lumot o'chiriladi va uni qayta tiklab bo'lmaydi.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-slate-600">Yo'q</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-100">Ha, o'chirilsin</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ───────── Main Page ───────── */
export default function Boshqarish({ activeTab, setActiveTab }) {

  return (
    <div className="pb-10">
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Boshqarish</h1>
      <div className="flex gap-2 border-b border-gray-100 mb-8 overflow-x-auto custom-scrollbar scrollbar-hide">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`whitespace-nowrap pb-4 px-4 text-sm font-bold transition-all relative shrink-0 ${activeTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}>
            {tab}
            {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />}
          </button>
        ))}
      </div>
      {activeTab === "Kurslar" && <KurslarTab />}
      {activeTab === "Xonalar" && <XonalarTab />}
      {activeTab === "Filiallar" && <FiliallarTab />}
      {activeTab === "Hodimlar" && <HodimlarTab />}
    </div>
  );
}
