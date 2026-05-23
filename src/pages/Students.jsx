import { useState, useEffect, useRef } from "react";

/* ───────── Add Student Drawer ───────── */
function AddStudentDrawer({ onClose, onSave, student }) {
  const [form, setForm] = useState({
    first_name: student?.first_name || "",
    last_name: student?.last_name || "",
    email: student?.email || "",
    password: "",
    phone: student?.phone || "",
    birth_date: student?.birth_date ? student.birth_date.split('T')[0] : "",
    address: student?.address || "",   // ixtiyoriy
    group_id: student?.group_id || "",
  });
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/v1/groups/all", {
          headers: { "accept": "*/*", "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        const list = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : Array.isArray(data.groups) ? data.groups : [];
        setGroups(list);
      } catch (err) {
        console.error("Guruhlarni yuklashda xatolik", err);
      }
    };
    fetchGroups();
  }, []);
  const [photo, setPhoto] = useState(null);       // ixtiyoriy - File object
  const [photoPreview, setPhotoPreview] = useState(student?.photo || null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (student?.photo) {
      const preview = student.photo.startsWith('http')
        ? student.photo
        : `/uploads/${student.photo}`;
      setPhotoPreview(preview);
    } else {
      setPhotoPreview(null);
    }
    setPhoto(null);
  }, [student]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    const { first_name, last_name, email, password, phone, birth_date } = form;

    // Validatsiya
    if (!first_name.trim() || !last_name.trim() || !email.trim() ||
      (!student && !password) || !phone.trim() || !birth_date) {
      alert("Iltimos, barcha majburiy (*) maydonlarni to'ldiring");
      return;
    }

    // Phone format tekshirish
    const phoneRegex = /^\+?[0-9]{9,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      alert("Telefon raqami noto'g'ri (masalan: +998901234567)");
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const fd = new FormData();
      fd.append("first_name", first_name.trim());
      fd.append("last_name", last_name.trim());
      fd.append("email", email.trim());
      if (password) fd.append("password", password);
      fd.append("phone", phone.trim());
      fd.append("birth_date", birth_date);
      if (form.address.trim()) fd.append("address", form.address.trim());
      if (form.group_id) fd.append("group_id", form.group_id);
      if (photo) fd.append("photo", photo);

      const url = student ? `/api/v1/students/${student.id}` : "/api/v1/students";
      const method = student ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`,
        },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Xatolik yuz berdi");
        return;
      }

      if (form.group_id) {
        const studentId = student ? student.id : (data.data?.id || data.id || data.student?.id);
        if (studentId) {
          const sgRes = await fetch("/api/v1/student-group", {
            method: "POST",
            headers: {
              "accept": "*/*",
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              student_id: Number(studentId),
              group_id: Number(form.group_id)
            })
          });
          const sgData = await sgRes.json();
          console.log("student-group response:", sgData);
        }
      }

      onSave(); // ro'yxatni yangilash
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
            <h2 className="text-xl font-bold text-slate-900">{student ? "Talabani tahrirlash" : "Talaba qo'shish"}</h2>
            <p className="text-sm text-slate-500 mt-1">{student ? "Talaba ma'lumotlarini o'zgartirish" : "Bu yerda siz yangi Talaba qo'shishingiz mumkin."}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">

          {/* Ism va Familiya */}
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

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Email <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <input type="email" className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-indigo-400 transition-all" placeholder="ali@example.com" value={form.email} onChange={set("email")} />
            </div>
          </div>

          {/* Parol */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Parol {!student && <span className="text-red-500">*</span>} {student && <span className="text-xs font-normal text-slate-400">(o'zgartirish uchun)</span>}</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
              </div>
              <input type="password" className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-indigo-400 transition-all" placeholder="••••••••" value={form.password} onChange={set("password")} />
            </div>
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Telefon <span className="text-red-500">*</span></label>
            <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 transition-all" placeholder="+998901234567" value={form.phone} onChange={set("phone")} />
          </div>

          {/* Tug'ilgan sana */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Tug'ilgan sana <span className="text-red-500">*</span></label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              </div>
              <input type="date" className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-indigo-400 transition-all" value={form.birth_date} onChange={set("birth_date")} />
            </div>
          </div>

          {/* Manzil — ixtiyoriy */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Manzil <span className="text-xs font-normal text-slate-400">(ixtiyoriy)</span></label>
            <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 transition-all" placeholder="Toshkent, Chilonzor" value={form.address} onChange={set("address")} />
          </div>

          {/* Guruhga biriktirish — ixtiyoriy */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Guruhga biriktirish <span className="text-xs font-normal text-slate-400">(ixtiyoriy)</span></label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <select 
                className="w-full border border-gray-200 rounded-xl pl-11 pr-10 py-3 text-sm outline-none focus:border-indigo-400 transition-all appearance-none bg-white" 
                value={form.group_id} 
                onChange={set("group_id")}
              >
                <option value="">Guruhni tanlang...</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          {/* Rasm — ixtiyoriy */}
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


export default function Students() {
  const [drawer, setDrawer] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const openAdd = () => {
    setEditingStudent(null);
    setDrawer(true);
  };

  const openEdit = (s) => {
    setEditingStudent(s);
    setDrawer(true);
  };
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [search, setSearch] = useState("");

  // Arxiv (inactive) students
  const [arxivOpen, setArxivOpen] = useState(false);
  const [arxivStudents, setArxivStudents] = useState([]);
  const [arxivLoading, setArxivLoading] = useState(false);

  const fetchArxiv = async () => {
    setArxivLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/students/inactive", {
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data
        : Array.isArray(data.data) ? data.data
        : Array.isArray(data.students) ? data.students
        : Array.isArray(data.items) ? data.items
        : [];

      // Talabalarning guruhlarini olish
      try {
        const studentGroupRes = await fetch("/api/v1/student-group/all", {
          headers: {
            "accept": "*/*",
            "Authorization": `Bearer ${token}`,
          },
        });
        const studentGroupData = await studentGroupRes.json();
        const studentGroups = Array.isArray(studentGroupData) ? studentGroupData
          : Array.isArray(studentGroupData.data) ? studentGroupData.data
            : Array.isArray(studentGroupData.student_groups) ? studentGroupData.student_groups
              : Array.isArray(studentGroupData.items) ? studentGroupData.items
                : [];

        // Talabalarning guruhlarini birlash
        const listWithGroups = list.map(student => {
          const studentGroupsForThisStudent = studentGroups
            .filter(sg => sg.student_id === student.id)
            .map(sg => sg.group_name || sg.group?.name || sg.name)
            .filter(Boolean);
          return {
            ...student,
            groups: studentGroupsForThisStudent
          };
        });

        setArxivStudents(listWithGroups);
      } catch (groupErr) {
        console.error("Arxiv talabalarning guruhlarini yuklashda xatolik:", groupErr);
        setArxivStudents(list);
      }
    } catch {
      setArxivStudents([]);
    } finally {
      setArxivLoading(false);
    }
  };

  const openArxiv = () => {
    setArxivOpen(true);
    fetchArxiv();
  };

  const handleActivate = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/students/${id}/activate`, {
        method: "PATCH",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Aktivlashtirishda xatolik");
        return;
      }
      // Ro'yxatdan olib tashla va asosiy ro'yxatni yangilay
      setArxivStudents(prev => prev.filter(s => s.id !== id));
      setForceRefresh(r => r + 1);
    } catch {
      alert("Server bilan bog'lanishda xatolik");
    }
  };

  const LIMIT = 5;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/v1/students?page=${page}&limit=${LIMIT}&search=${search}`, {
          headers: {
            "accept": "*/*",
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await res.json();

        const list = Array.isArray(data) ? data
          : Array.isArray(data.data) ? data.data
            : Array.isArray(data.students) ? data.students
              : Array.isArray(data.items) ? data.items
                : Array.isArray(data.content) ? data.content
                  : [];

        // Talabalarning guruhlarini olish
        try {
          const studentGroupRes = await fetch("/api/v1/student-group/all", {
            headers: {
              "accept": "*/*",
              "Authorization": `Bearer ${token}`,
            },
          });
          const studentGroupData = await studentGroupRes.json();
          console.log("student-group data:", studentGroupData);
          const studentGroups = Array.isArray(studentGroupData) ? studentGroupData
            : Array.isArray(studentGroupData.data) ? studentGroupData.data
              : Array.isArray(studentGroupData.student_groups) ? studentGroupData.student_groups
                : Array.isArray(studentGroupData.items) ? studentGroupData.items
                  : [];

          // Talabalarning guruhlarini birlash
          const listWithGroups = list.map(student => {
            const studentGroupsForThisStudent = studentGroups
              .filter(sg => sg.students?.id === student.id)
              .map(sg => sg.groups?.name)
              .filter(Boolean);
            return {
              ...student,
              groups: studentGroupsForThisStudent
            };
          });

          setStudents(listWithGroups);
        } catch (groupErr) {
          console.error("Guruhlarni yuklashda xatolik:", groupErr);
          setStudents(list);
        }

        const total = data.total || data.totalCount || data.totalElements || list.length;
        setTotalPages(Math.ceil(total / LIMIT) || 1);
      } catch (err) {
        setError("Talabalarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [page, forceRefresh, search]);

  const handleDelete = async (id) => {

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/students/${id}`, {
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
      setDeleteId(null);
    } catch (err) {
      alert(err.message || "Server bilan bog'lanishda xatolik");
    }
  };

  // Frontenda filter:
  const filteredStudents = students.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const phone = s.phone?.toLowerCase() || "";
    const q = search.toLowerCase();
    return fullName.includes(q) || phone.includes(q);
  });

  return (



    <div className="pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">Talabalar</h1>
          <p className="text-slate-500 text-[13px] mt-1.5 max-w-2xl leading-relaxed">
            Ushbu sahifada siz Talabalar ro'yxatini va ularning ma'lumotlarini topasiz. Har bir Talaba ismi, fanlari va aloqa ma'lumotlari keltirilgan.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-gray-50 transition-all">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
            Export
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95">
            + Talaba qoshish
          </button>
          {/* <button className="flex items-center gap-2 px-4 py-2.5 bg-[#10A37F] hover:bg-[#0e8a6c] text-white text-sm font-bold rounded-xl shadow-lg shadow-green-100 transition-all active:scale-95">
            + Talabani Excel dan qoshish
          </button> */}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-gray-50 transition-all w-fit">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
          Filters
        </button> */}
        <div className="flex items-center gap-3"></div>
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
          <button onClick={openArxiv} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-gray-50 transition-all">
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
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-indigo-600" />
                </th>
                <th className="py-4 px-6 whitespace-nowrap">Nomi <span className="text-[10px] ml-1">↓</span></th>
                <th className="py-4 px-6 whitespace-nowrap">Guruh</th>
                <th className="py-4 px-6 whitespace-nowrap">Telefon raqamlari</th>
                <th className="py-4 px-6 whitespace-nowrap">Email</th>
                <th className="py-4 px-6 whitespace-nowrap">Manzil</th>
                <th className="py-4 px-6 whitespace-nowrap">Yaratilgan sana</th>
                <th className="py-4 px-6 text-right pr-8 whitespace-nowrap">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-400">Yuklanmoqda...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-10 text-slate-300">Talabalar topilmadi</td></tr>
              ) : filteredStudents.map(s => (
                <tr key={s.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="py-4 px-6 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-indigo-600" />
                  </td>

                  {/* ✅ first_name + last_name */}
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden border border-gray-100 shrink-0">
                        <img src={s.photo || `https://ui-avatars.com/api/?name=${s.first_name}+${s.last_name}&background=random`} alt="" />
                      </div>
                      <span className="text-sm font-bold text-slate-800">{s.first_name} {s.last_name}</span>
                    </div>
                  </td>

                  {/* ✅ groups */}
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1.5 min-w-[80px]">
                      {(s.groups || []).map((g, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md border border-gray-100 bg-gray-50 text-[10px] font-bold text-slate-400 uppercase tracking-tighter whitespace-nowrap">
                          {g}
                        </span>
                      ))}
                      {!s.groups?.length && <span className="text-xs text-slate-300">—</span>}
                    </div>
                  </td>

                  {/* ✅ phone */}
                  <td className="py-4 px-6 text-[11px] font-bold text-slate-500 whitespace-nowrap">{s.phone || "—"}</td>

                  {/* ✅ email */}
                  <td className="py-4 px-6 text-[11px] font-bold text-slate-500 whitespace-nowrap">{s.email || "—"}</td>

                  {/* ✅ address */}
                  <td className="py-4 px-6 text-[11px] font-bold text-slate-500 whitespace-nowrap">{s.address || "—"}</td>

                  {/* ✅ created_at */}
                  <td className="py-4 px-6 text-[11px] font-bold text-slate-500 whitespace-nowrap">
                    {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                  </td>

                  <td className="py-4 px-6 text-right pr-8 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg></button>
                      <button onClick={() => setDeleteId(s.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg></button>
                      <button onClick={() => openEdit(s)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-600"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg></button>
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
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${n === page ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-400 hover:bg-gray-50"}`}
              >
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
        <AddStudentDrawer
          student={editingStudent}
          onClose={() => setDrawer(false)}
          onSave={() => {
            setDrawer(false);
            setPage(1);
            setForceRefresh(r => r + 1);
          }}
        />
      )}

      {/* Arxiv Modal */}
      {arxivOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setArxivOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] max-w-[95vw] max-h-[80vh] bg-white rounded-3xl shadow-2xl z-[70] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <svg width="18" height="18" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 8v13H3V8M1 3h22v5H1V3zM10 12h4" /></svg>
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Arxiv talabalar</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Nofaol (inactive) talabalar ro'yxati</p>
                </div>
              </div>
              <button onClick={() => setArxivOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-8 py-4">
              {arxivLoading ? (
                <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Yuklanmoqda...</div>
              ) : arxivStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3"><path d="M21 8v13H3V8M1 3h22v5H1V3zM10 12h4" /></svg>
                  <p className="text-sm">Arxiv bo'sh</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="py-3 pr-4">Talaba</th>
                      <th className="py-3 pr-4">Telefon</th>
                      <th className="py-3 pr-4">Email</th>
                      <th className="py-3 pr-4">Sana</th>
                      <th className="py-3 text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {arxivStudents.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={s.photo || `https://ui-avatars.com/api/?name=${s.first_name}+${s.last_name}&background=random`}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-gray-100"
                            />
                            <span className="text-sm font-bold text-slate-700">{s.first_name} {s.last_name}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-[11px] font-bold text-slate-500">{s.phone || "—"}</td>
                        <td className="py-3 pr-4 text-[11px] font-bold text-slate-500">{s.email || "—"}</td>
                        <td className="py-3 pr-4 text-[11px] font-bold text-slate-400">
                          {s.created_at ? new Date(s.created_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => handleActivate(s.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[11px] font-bold transition-all active:scale-95"
                          >
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            Aktivlashtirish
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-8 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setArxivOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-slate-600 hover:bg-gray-50 transition-colors">
                Yopish
              </button>
            </div>
          </div>
        </>
      )}

      {deleteId && (
        <DeleteConfirm
          onClose={() => setDeleteId(null)}
          onConfirm={() => handleDelete(deleteId)}
        />
      )}
    </div>
  );
}

function DeleteConfirm({ onClose, onConfirm }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[80]" onClick={onClose} />
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-6 animate-in zoom-in-95 duration-200">
          <h3 className="font-bold text-slate-900 text-lg mb-2">O'chirishni tasdiqlaysizmi?</h3>
          <p className="text-sm text-slate-500 mb-6">Ushbu ma'lumot o'chiriladi va uni qayta tiklab bo'lmaydi.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-slate-600 hover:bg-gray-50 transition-colors">Yo'q</button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-[#FF453A] hover:bg-red-600 text-white text-sm font-semibold shadow-lg shadow-red-100 transition-all active:scale-95">Ha, o'chirilsin</button>
          </div>
        </div>
      </div>
    </>
  );
}
