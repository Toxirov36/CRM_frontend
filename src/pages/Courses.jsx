import { useState, useEffect  } from "react";
import Modal from "../components/Modal";

const COLORS = ["#1e3a5f", "#7c3aed", "#dc2626", "#c2410c", "#15803d", "#0369a1", "#1d4ed8", "#6d28d9", "#be185d"];

const DURATIONS = ["1 oy", "2 oy", "3 oy", "4 oy", "6 oy", "8 oy", "12 oy", "18 oy"];
const LESSON_DURATIONS = ["30 daqiqa", "45 daqiqa", "60 daqiqa", "90 daqiqa", "120 daqiqa"];


const FILIALS = ["Filial 1", "Filial 2", "Filial 3"];

export default function Kurslar() {
  const [courses, setCourses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [deleteId, setDeleteId]   = useState(null);
  const [form, setForm] = useState({
    name: "", filials: [], lessonDur: "", courseDur: "", narx: "", desc: "", color: COLORS[0],
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/courses", {
          headers: {
            "accept": "*/*",
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log("Courses:", data);
        setCourses(data);
      } catch (err) {
        setError("Kurslarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // const openAdd = () => {  };
  // const openEdit = (c) => { };
  // const toggleFilial = (f) => {  };
  // const handleSave = () => {  };

  // ✅ if(loading) va if(error) — funksiyalardan KEYIN, return dan OLDIN
  if (loading) return <div className="flex items-center justify-center h-40 text-slate-400">Yuklanmoqda...</div>;
  if (error)   return <div className="flex items-center justify-center h-40 text-red-400">{error}</div>;


  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Kurslar</h1>
          <p className="text-slate-500 text-sm mt-1">Barcha kurslarni boshqaring</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
        >
          + Kurs qo'shish
        </button>
      </div>

      {/* Courses grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map(c => (
          <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
            {/* Color band */}
            <div className="h-2 w-full" style={{ background: c.color }} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setDeleteId(c.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-400 transition-colors">
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                  </button>
                  <button onClick={() => openEdit(c)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-400 transition-colors">
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {c.filial.map((f, i) => (
                  <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-xs font-medium">{f}</span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full" style={{ background: c.color }} />
                  <span className="text-xs text-slate-500">Rang</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{c.narx.toLocaleString()} so'm</span>
              </div>
            </div>
          </div>
        ))}

        {/* Empty add card */}
        <button
          onClick={openAdd}
          className="bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all flex flex-col items-center justify-center py-12 gap-2 group min-h-[160px]"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 flex items-center justify-center text-indigo-600 text-xl transition-colors">+</div>
          <span className="text-sm font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">Yangi kurs qo'shish</span>
        </button>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editCourse ? "Kursni tahrirlash" : "Kurs qoshish"}
          subtitle="Bu yerda siz yangi kurs qo'shishingiz mumkin."
          onClose={() => setShowModal(false)}
          footer={
            <>
              <button onClick={() => setShowModal(false)} className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-gray-100 transition-colors">
                Bekor qilish
              </button>
              <button onClick={handleSave} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-200 transition-all active:scale-95">
                Saqlash
              </button>
            </>
          }
        >
          <div className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nomi</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                placeholder="HR Manager..."
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Filials */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-slate-700">Kurs mavjud boledigon filiallar</label>
                <button
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                  onClick={() => setForm(f => ({ ...f, filials: FILIALS }))}
                >
                  Hammasini tanlash
                </button>
              </div>
              <div className="space-y-2">
                {FILIALS.map(fil => (
                  <label key={fil} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.filials.includes(fil)}
                      onChange={() => toggleFilial(fil)}
                      className="accent-indigo-600 w-4 h-4 rounded"
                    />
                    <span className="text-sm text-slate-700">{fil}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Lesson duration */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dars davomiyligi</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                value={form.lessonDur}
                onChange={e => setForm(f => ({ ...f, lessonDur: e.target.value }))}
              >
                <option value="">Tanlang</option>
                {LESSON_DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Course duration */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kurs davomiyligi (oylarda)</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white"
                value={form.courseDur}
                onChange={e => setForm(f => ({ ...f, courseDur: e.target.value }))}
              >
                <option value="">Tanlang</option>
                {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Narx</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
                </span>
                <input
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="Narxini kiriting"
                  type="number"
                  value={form.narx}
                  onChange={e => setForm(f => ({ ...f, narx: e.target.value }))}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                placeholder="A little about the course..."
                value={form.desc}
                onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              />
              <p className="text-xs text-slate-400 mt-1">This is a hint text to help user.</p>
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Rangi</label>
              <p className="text-xs text-slate-400 mb-3">The color you choose will be displayed to users and in the list of roles.</p>
              <div className="flex items-center gap-2 flex-wrap">
                {COLORS.map(col => (
                  <button
                    key={col}
                    onClick={() => setForm(f => ({ ...f, color: col }))}
                    className="w-8 h-8 rounded-full transition-all border-2"
                    style={{
                      background: col,
                      borderColor: form.color === col ? "#fff" : col,
                      outline: form.color === col ? `2px solid ${col}` : "none",
                      outlineOffset: "2px",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <Modal
          title="Kursni o'chirish"
          onClose={() => setDeleteId(null)}
          footer={
            <>
              <button onClick={() => setDeleteId(null)} className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-gray-100 transition-colors">
                Bekor qilish
              </button>
              <button
                onClick={() => { setCourses(c => c.filter(x => x.id !== deleteId)); setDeleteId(null); }}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all active:scale-95"
              >
                O'chirish
              </button>
            </>
          }
        >
          <p className="text-slate-600 text-sm">Haqiqatan ham bu kursni o'chirmoqchimisiz?</p>
        </Modal>
      )}
    </div>
  );
}