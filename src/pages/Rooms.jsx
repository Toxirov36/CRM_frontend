import { useState, useEffect } from 'react';

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

/* ───────── Room Drawer ───────── */
function RoomDrawer({ room, onClose, onSave }) {
  const [name, setName] = useState(room?.name || "");
  const [capacity, setCapacity] = useState(room?.capacity ?? 0);

  const handle = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), capacity: Number(capacity) });
  };

  return (
    <DrawerShell title={room ? "Xonani tahrirlash" : "Xonani qo'shish"} onClose={onClose} onSave={handle}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Nomi</label>
          <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" placeholder="Xona nomi" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-2">Sig'imi (o'rin soni)</label>
          <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" placeholder="Sig'imi (masalan: 15)" value={capacity} onChange={e => setCapacity(e.target.value)} />
        </div>
      </div>
    </DrawerShell>
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

/* ───────── Xonalar Tab ───────── */
export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [forceRefresh, setForceRefresh] = useState(0);

  // Guruhga biriktirilgan xonalar ID lari
  const [assignedRoomIds, setAssignedRoomIds] = useState(new Set());

  // Arxiv (inactive) rooms
  const [arxivOpen, setArxivOpen] = useState(false);
  const [arxivRooms, setArxivRooms] = useState([]);
  const [arxivLoading, setArxivLoading] = useState(false);

  const fetchArxiv = async () => {
    setArxivLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/rooms/InactiveRooms", {
        headers: { "accept": "*/*", "Authorization": `Bearer ${token}` },
      });
      const data = await res.json();
      setArxivRooms(Array.isArray(data) ? data : data.data || []);
    } catch {
      setArxivRooms([]);
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
      const res = await fetch(`/api/v1/rooms/${id}`, {
        method: "PUT",
        headers: { "accept": "*/*", "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Aktivlashtirishda xatolik");
        return;
      }
      setArxivRooms(prev => prev.filter(r => r.id !== id));
      setForceRefresh(r => r + 1);
    } catch {
      alert("Server bilan bog'lanishda xatolik");
    }
  };

  // ✅ Backend dan xonalarni olish
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("token");
        const [roomsRes, groupsRes] = await Promise.all([
          fetch("/api/v1/rooms", {
            headers: { "accept": "*/*", "Authorization": `Bearer ${token}` },
          }),
          fetch("/api/v1/groups", {
            headers: { "accept": "*/*", "Authorization": `Bearer ${token}` },
          })
        ]);
        const roomsData = await roomsRes.json();
        const list = Array.isArray(roomsData) ? roomsData
          : Array.isArray(roomsData.data) ? roomsData.data
            : Array.isArray(roomsData.rooms) ? roomsData.rooms
              : [];
        setRooms(list);

        // Guruhlardan biriktirilgan room_id larni aniqlash
        const groupsData = await groupsRes.json();
        const groups = Array.isArray(groupsData) ? groupsData
          : Array.isArray(groupsData.data) ? groupsData.data : [];
        const usedIds = new Set(groups.map(g => g.rooms?.id || g.room_id).filter(Boolean));
        setAssignedRoomIds(usedIds);
      } catch (err) {
        setError("Xonalarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [forceRefresh]);

  const handleSave = async ({ name, capacity }) => {
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
          body: JSON.stringify({ name, capacity }),
        });

        const data = await res.json();
        console.log("Room POST:", data);

        if (!res.ok) {
          alert(data.message || "Xatolik yuz berdi");
          return;
        }

      } else {
        // ✅ PATCH
        const res = await fetch(`/api/v1/rooms/update/${drawer.id}`, {
          method: "PATCH",
          headers: {
            "accept": "*/*",
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({ name, capacity }),
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
        <h2 className="font-bold text-slate-800 text-base">Xonalar ro'yxati</h2>
        <div className="flex items-center gap-2">
          <button onClick={openArxiv} className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-slate-700 text-sm font-semibold rounded-xl transition-all">
            Arxiv <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 8v13H3V8M1 3h22v5H1V3zM10 12h4" /></svg>
          </button>
          <button onClick={() => setDrawer("add")} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95">
            + Xonani qo'shish
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {rooms.slice((currentPage - 1) * 12, currentPage * 12).map(room => {
          const isAssigned = assignedRoomIds.has(room.id);
          return (
          <div key={room.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all group ${isAssigned ? 'border-emerald-100 bg-emerald-50/10' : 'border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/20'}`}>
            <div>
              <p className="text-sm font-semibold text-slate-800">{room.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">Sig'imi: {room.capacity ?? 0} ta</p>
              {isAssigned && (
                <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
                  Guruhga biriktirilgan
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isAssigned ? (
                <button
                  disabled
                  title="Bu xona guruhga biriktirilgan, o'chirib bo'lmaydi"
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-50 text-gray-300 cursor-not-allowed"
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                </button>
              ) : (
                <button onClick={() => setDeleteId(room.id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                </button>
              )}
              <button onClick={() => setDrawer(room)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-orange-50 text-slate-400 hover:text-orange-500 transition-colors">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
              </button>
            </div>
          </div>
          );
        })}
      </div>
      
      {Math.ceil(rooms.length / 12) > 1 && (
        <div className="flex items-center justify-between w-full mt-6 px-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-[13px] font-bold text-slate-400 hover:bg-gray-50 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.ceil(rooms.length / 12) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-9 h-9 rounded-xl text-[13px] font-extrabold transition-all ${
                  currentPage === p 
                    ? "bg-indigo-50 text-indigo-600" 
                    : "text-slate-400 hover:bg-gray-50 hover:text-slate-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(Math.ceil(rooms.length / 12), p + 1))}
            disabled={currentPage === Math.ceil(rooms.length / 12)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-[13px] font-bold text-slate-400 hover:bg-gray-50 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>
      )}

      {drawer && <RoomDrawer room={drawer === "add" ? null : drawer} onClose={() => setDrawer(null)} onSave={handleSave} />}
      {deleteId && (
        <DeleteConfirm 
          onClose={() => setDeleteId(null)} 
          onConfirm={async () => {
            try {
              const token = localStorage.getItem("token");
              const res = await fetch(`/api/v1/rooms/${deleteId}`, {
                method: "DELETE",
                headers: { "accept": "*/*", "Authorization": `Bearer ${token}` },
              });
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data.message || "O'chirishda xatolik");
                return;
              }
              setRooms(r => r.filter(x => x.id !== deleteId));
              setDeleteId(null);
            } catch {
              alert("O'chirishda xatolik");
            }
          }} 
        />
      )}

      {/* Arxiv Modal */}
      {arxivOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-[60]" onClick={() => setArxivOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] max-w-[95vw] max-h-[80vh] bg-white rounded-3xl shadow-2xl z-[70] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                  <svg width="18" height="18" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 8v13H3V8M1 3h22v5H1V3zM10 12h4" /></svg>
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Arxiv xonalar</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Nofaol (inactive) xonalar ro'yxati</p>
                </div>
              </div>
              <button onClick={() => setArxivOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-8 py-4">
              {arxivLoading ? (
                <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Yuklanmoqda...</div>
              ) : arxivRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3"><path d="M21 8v13H3V8M1 3h22v5H1V3zM10 12h4" /></svg>
                  <p className="text-sm">Arxiv bo'sh</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {arxivRooms.map(r => (
                    <div key={r.id} className="p-4 rounded-2xl border border-gray-100 bg-slate-50/40 flex items-start justify-between gap-3">
                      <div>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center mb-2">
                          <svg width="17" height="17" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm">{r.name}</h3>
                      </div>
                      <button
                        onClick={() => handleActivate(r.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[11px] font-bold transition-all active:scale-95 shrink-0"
                      >
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
                        Aktivlashtirish
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setArxivOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-slate-600 hover:bg-gray-50 transition-colors">
                Yopish
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}