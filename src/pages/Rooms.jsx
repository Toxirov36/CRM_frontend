import { useState } from "react";
import Modal from "../components/Modal";

const INITIAL_ROOMS = [
  { id: 1, name: "genious room",        sigim: 15 },
  { id: 2, name: "Impact room",         sigim: 12 },
  { id: 3, name: "1A",                  sigim: 25 },
  { id: 4, name: "205-xona",            sigim: 32 },
  { id: 5, name: "16-xona",             sigim: 18 },
  { id: 6, name: "5 xona",              sigim: 30 },
  { id: 7, name: "IELTS with islombok", sigim: 20 },
  { id: 8, name: "Beginner",            sigim: 18 },
  { id: 9, name: "99",                  sigim: 25 },
];

const TABS = ["Kurslar", "Xonalar", "Filiallar", "Hodimlar"];

export default function Xonalar() {
  const [rooms, setRooms]           = useState(INITIAL_ROOMS);
  const [activeTab, setActiveTab]   = useState("Xonalar");
  const [showModal, setShowModal]   = useState(false);
  const [editRoom, setEditRoom]     = useState(null);
  const [form, setForm]             = useState({ name: "", sigim: "" });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openAdd = () => {
    setEditRoom(null);
    setForm({ name: "", sigim: "" });
    setShowModal(true);
  };

  const openEdit = (room) => {
    setEditRoom(room);
    setForm({ name: room.name, sigim: String(room.sigim) });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.sigim) return;
    if (editRoom) {
      setRooms(r => r.map(x => x.id === editRoom.id ? { ...x, name: form.name, sigim: Number(form.sigim) } : x));
    } else {
      setRooms(r => [...r, { id: Date.now(), name: form.name, sigim: Number(form.sigim) }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setRooms(r => r.filter(x => x.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Boshqarish</h1>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-slate-600 border border-gray-200 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors">
          Menu ▾
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-6">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === tab ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"/>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-slate-800 text-base">Xonalar</h2>
            <button className="text-indigo-500 hover:text-indigo-700 transition-colors">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9z"/>
                <path d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>
              </svg>
            </button>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
          >
            + Xonani qo'shish
          </button>
        </div>

        {/* Rooms grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {rooms.map(room => (
            <div key={room.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
              <div>
                <p className="text-sm font-semibold text-slate-800">{room.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">Sig'im: {room.sigim}</p>
              </div>
              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setDeleteConfirm(room.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
                  </svg>
                </button>
                <button
                  onClick={() => openEdit(room)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-400 hover:text-orange-600 transition-colors"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <p className="text-4xl mb-3">🚪</p>
            <p className="text-sm">Hozircha xona qo'shilmagan</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editRoom ? "Xonani tahrirlash" : "Xonani qo'shish"}
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nomi <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                placeholder="Xona nomi"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Sig'imi <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                placeholder="Masalan: 20"
                type="number"
                value={form.sigim}
                onChange={e => setForm(f => ({ ...f, sigim: e.target.value }))}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <Modal
          title="Xonani o'chirish"
          onClose={() => setDeleteConfirm(null)}
          footer={
            <>
              <button onClick={() => setDeleteConfirm(null)} className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-gray-100 transition-colors">
                Bekor qilish
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all active:scale-95">
                O'chirish
              </button>
            </>
          }
        >
          <p className="text-slate-600 text-sm">Haqiqatan ham bu xonani o'chirmoqchimisiz?</p>
        </Modal>
      )}
    </div>
  );
}