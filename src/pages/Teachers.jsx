import { useState, useEffect, useRef } from "react";

/* ───────── Add Teacher Drawer ───────── */
function AddTeacherDrawer({ onClose, onSave }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const { first_name, last_name, email, password, phone } = form;
    if (!first_name.trim() || !last_name.trim() || !email.trim() || !password || !phone.trim()) {
      alert("Iltimos, barcha majburiy (*) maydonlarni to'ldiring");
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const fd = new FormData();
      fd.append("first_name", first_name.trim());
      fd.append("last_name", last_name.trim());
      fd.append("email", email.trim());
      fd.append("password", password);
      fd.append("phone", phone.trim());
      if (form.address.trim()) fd.append("address", form.address.trim());
      if (photo) fd.append("photo", photo);

      const res = await fetch("/api/v1/teachers", {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.message || "Xatolik yuz berdi");
        return;
      }
      onSave();
    } catch (err) {
      alert("Server bilan bog'lanishda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[60]" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-[440px] bg-white shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">O'qituvchi qo'shish</h2>
            <p className="text-sm text-slate-500 mt-1">Bu yerda siz yangi o'qituvchi qo'shishingiz mumkin.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">Ism <span className="text-red-500">*</span></label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 transition-all" placeholder="Ali" value={form.first_name} onChange={set("first_name")} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-2">Familiya <span className="text-red-500">*</span></label>
              <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 transition-all" placeholder="Valiyev" value={form.last_name} onChange={set("last_name")} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Email <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <input type="email" className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-indigo-400 transition-all" placeholder="ali@example.com" value={form.email} onChange={set("email")} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Parol <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </div>
              <input type="password" className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-indigo-400 transition-all" placeholder="••••••••" value={form.password} onChange={set("password")} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Telefon <span className="text-red-500">*</span></label>
            <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 transition-all" placeholder="+998901234567" value={form.phone} onChange={set("phone")} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Manzil <span className="text-xs font-normal text-slate-400">(ixtiyoriy)</span></label>
            <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 transition-all" placeholder="Toshkent, Chilonzor" value={form.address} onChange={set("address")} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Rasm <span className="text-xs font-normal text-slate-400">(ixtiyoriy)</span></label>
            <div
              onClick={() => fileRef.current.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl py-8 flex flex-col items-center justify-center bg-gray-50/30 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="preview" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200" />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-indigo-600 mb-3 border border-gray-100">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-800"><span className="text-indigo-600">Yuklash uchun bosing</span></p>
                  <p className="text-[11px] text-slate-400 mt-1">JPG yoki PNG (max. 2 MB)</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>

        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3 justify-end bg-gray-50/20">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-slate-600 hover:bg-gray-50 transition-colors">
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-2.5 rounded-xl bg-[#7C5CFC] hover:bg-[#6b4de6] disabled:opacity-60 text-white text-sm font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function Teachers() {
  const [drawer, setDrawer] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [forceRefresh, setForceRefresh] = useState(0);
  const LIMIT = 10;

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/v1/teachers?page=${page}&limit=${LIMIT}`, {
          headers: {
            "accept": "*/*",
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log("Teachers:", data);

        const list = Array.isArray(data) ? data
          : Array.isArray(data.data) ? data.data
            : Array.isArray(data.teachers) ? data.teachers
              : [];

        const total = data.total || data.totalCount || list.length;
        setTeachers(list);
        setTotalPages(Math.ceil(total / LIMIT) || 1);
      } catch (err) {
        setError("O'qituvchilarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, [page, forceRefresh]);

  const handleDelete = async (id) => {
    if (!confirm("Haqiqatan ham ushbu o'qituvchini o'chirmoqchimisiz?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/teachers/${id}?id=${id}`, {
        method: "DELETE",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "O'chirishda xatolik yuz berdi");
      }

      setForceRefresh(r => r + 1);
    } catch (err) {
      alert(err.message || "Server bilan bog'lanishda xatolik");
    }
  };

  const [search, setSearch] = useState("");

  const filteredTeachers = teachers.filter(t => {
    const fullName = `${t.first_name || ""} ${t.last_name || ""}`.toLowerCase();
    const phone = t.phone?.toLowerCase() || "";
    const q = search.toLowerCase();
    return fullName.includes(q) || phone.includes(q);
  });

  if (loading) return <div className="flex items-center justify-center h-60 text-slate-400 text-sm">Yuklanmoqda...</div>;
  if (error) return <div className="flex items-center justify-center h-60 text-red-400 text-sm">{error}</div>;

  const toggleAll = () => {
    setSelected(selected.length === filteredTeachers.length ? [] : filteredTeachers.map(t => t.id));
  };

  const toggleOne = (id) => {
    setSelected(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">O'qituvchilar</h1>
          <p className="text-slate-500 text-[13px] mt-1.5 max-w-2xl leading-relaxed">
            Ushbu sahifada siz o'qituvchilar ro'yxatini va ularning ma'lumotlarini topasiz. Har bir o'qituvchining ismi, fanlari va aloqa ma'lumotlari keltirilgan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-gray-50 transition-all">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            Export
          </button>
          <button onClick={() => setDrawer(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95">
            + O'qituvchi qoshish
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-gray-50 transition-all">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
            Filters
          </button> */}
          {selected.length > 0 && (
            <button className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl text-sm font-bold hover:bg-red-100 transition-all">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
              O'chirish ({selected.length})
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-md md:justify-end">
          <div className="relative flex-1 max-w-xs">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            </div>
            <input
              className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-indigo-400"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-gray-50 transition-all">
            Arxiv <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 8v13H3V8M1 3h22v5H1V3zM10 12h4" /></svg>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-gray-50 bg-slate-50/20">
                <th className="py-4 px-6 w-12 text-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-indigo-600" checked={filteredTeachers.length > 0 && selected.length === filteredTeachers.length} onChange={toggleAll} />
                </th>
                <th className="py-4 px-6">Nomi <span className="text-[10px] ml-1">↓</span></th>
                <th className="py-4 px-6">Guruhlar</th>
                <th className="py-4 px-6">Telefon raqamlari</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Qoshilgan sana</th>
                <th className="py-4 px-6">Coin</th>
                <th className="py-4 px-6"></th>
                <th className="py-4 px-6 text-right pr-8"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filteredTeachers.map(t => (
                <tr key={t.id} className={`group hover:bg-slate-50/30 transition-colors ${selected.includes(t.id) ? "bg-indigo-50/10" : ""}`}>
                  <td className="py-4 px-6 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-indigo-600" checked={selected.includes(t.id)} onChange={() => toggleOne(t.id)} />
                  </td>

                  {/* ✅ Ism */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-gray-100 shrink-0">
                        <img src={t.photo || `https://ui-avatars.com/api/?name=${t.first_name || t.name}&background=random`} alt="" />
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        {t.first_name && t.last_name ? `${t.first_name} ${t.last_name}` : t.name || "—"}
                      </span>
                    </div>
                  </td>

                  {/* ✅ Guruhlar */}
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      {(t.groups || t.courses || []).map((g, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md border border-gray-100 bg-gray-50 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                          {g?.name || g}
                        </span>
                      ))}
                      {!(t.groups || t.courses)?.length && <span className="text-xs text-slate-300">—</span>}
                    </div>
                  </td>

                  {/* ✅ Telefon */}
                  <td className="py-4 px-6 text-[11px] font-bold text-slate-500 whitespace-pre-line leading-relaxed">
                    {t.phone || "—"}
                  </td>

                  {/* ✅ Tug'ilgan sana */}
                  <td className="py-4 px-6 text-[11px] font-bold text-slate-500">
                    {t.email || "—"}
                  </td>

                  {/* ✅ Yaratilgan sana */}
                  <td className="py-4 px-6 text-[11px] font-bold text-slate-500">
                    {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                  </td>

                  {/* ✅ Coin */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-orange-400">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                      <span className="text-xs font-extrabold text-slate-600">
                        {(t.coin || t.coins || 0).toLocaleString()}
                      </span>
                    </div>
                  </td>

                  {/* Amallar */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-slate-400 hover:bg-gray-100 transition-all shadow-sm active:scale-90">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14" /></svg>
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-green-500 hover:bg-green-50 transition-all shadow-sm active:scale-90">
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right pr-8">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button>
                      <button onClick={() => handleDelete(t.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg></button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-600"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-8 py-5 border-t border-gray-50 flex items-center justify-between">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-gray-50 transition-all disabled:opacity-40"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg> Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${n === page ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-400 hover:bg-gray-50"}`}>
                {n}
              </button>
            ))}

          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-gray-50 transition-all disabled:opacity-40"
          >
            Next <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      {drawer && (
        <AddTeacherDrawer
          onClose={() => setDrawer(false)}
          onSave={() => {
            setDrawer(false);
            setPage(1);
            setForceRefresh(r => r + 1);
          }}
        />
      )}
    </div>
  );
}