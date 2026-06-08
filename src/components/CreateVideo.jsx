import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const VIDEO_ACCEPT = ".mp4,.webm,.mpeg,.avi,.mkv,.m4v,.ogm,.mov,.mpg,video/*";

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatSize = (bytes) => {
  if (!bytes) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let size = Number(bytes);
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
};

export default function CreateVideo({ groupId }) {
  const [lessons, setLessons] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ lesson_id: "", name: "" });
  const fileInputRef = useRef(null);

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => String(lesson.id) === String(form.lesson_id)),
    [form.lesson_id, lessons]
  );

  const fetchVideoData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "accept": "*/*",
        "Authorization": `Bearer ${token}`,
      };

      const [lessonsRes, videosRes] = await Promise.all([
        fetch(`/api/v1/lessons/group/${groupId}`, { headers }),
        fetch(`/api/v1/videos/group/${groupId}`, { headers }),
      ]);

      const [lessonsData, videosData] = await Promise.all([
        lessonsRes.json(),
        videosRes.json(),
      ]);

      setLessons(Array.isArray(lessonsData.data) ? lessonsData.data : []);
      setVideos(Array.isArray(videosData.data) ? videosData.data : []);
    } catch (err) {
      console.error("Video data fetch error:", err);
      setError("Videolarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;

    const loadTimer = window.setTimeout(fetchVideoData, 0);

    return () => window.clearTimeout(loadTimer);
  }, [fetchVideoData, groupId]);

  const resetModal = () => {
    setEditingVideo(null);
    setFile(null);
    setForm({ lesson_id: "", name: "" });
    setError("");
    setSaving(false);
  };

  const openCreateModal = () => {
    resetModal();
    setIsModalOpen(true);
  };

  const openEditModal = (video) => {
    setEditingVideo(video);
    setFile(null);
    setForm({
      lesson_id: String(video.lesson?.id || ""),
      name: video.name || "",
    });
    setError("");
    setActiveMenu(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetModal();
  };

  const handleFileChange = (nextFile) => {
    if (!nextFile) return;

    setFile(nextFile);
    setForm((prev) => ({
      ...prev,
      name: prev.name || nextFile.name,
    }));
  };

  const handleSave = async () => {
    setError("");

    if (!editingVideo && !file) {
      setError("Videofaylni tanlang.");
      return;
    }

    if (!form.lesson_id) {
      setError("Darsni tanlang.");
      return;
    }

    if (!form.name.trim()) {
      setError("Video nomini kiriting.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("lesson_id", form.lesson_id);
      formData.append("name", form.name.trim());

      if (!editingVideo) {
        formData.append("group_id", String(groupId));
      }

      if (file) {
        formData.append("file", file);
      }

      const res = await fetch(editingVideo ? `/api/v1/videos/${editingVideo.id}` : "/api/v1/videos", {
        method: editingVideo ? "PATCH" : "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Videoni saqlashda xatolik yuz berdi.");
        return;
      }

      closeModal();
      await fetchVideoData();
    } catch (err) {
      console.error("Video save error:", err);
      setError("Server bilan bog'lanishda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (videoId) => {
    setActiveMenu(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/videos/${videoId}`, {
        method: "DELETE",
        headers: {
          "accept": "*/*",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Videoni o'chirishda xatolik yuz berdi.");
        return;
      }

      await fetchVideoData();
    } catch (err) {
      console.error("Video delete error:", err);
      setError("Server bilan bog'lanishda xatolik yuz berdi.");
    }
  };

  const toggleActionsMenu = (event, videoId) => {
    const rect = event.currentTarget.getBoundingClientRect();

    setActiveMenu((current) => {
      if (current?.id === videoId) return null;

      return {
        id: videoId,
        top: rect.bottom + 8,
        left: Math.max(rect.right - 176, 12),
      };
    });
  };

  return (
    <div className="bg-white min-h-[420px]">
      <div className="flex justify-end mb-7">
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-emerald-500 text-white text-[13px] font-bold rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Qo'shish
        </button>
      </div>

      {error && (
        <p className="mb-4 text-[13px] font-semibold text-red-500">{error}</p>
      )}

      <div className="overflow-x-auto">
        {loading ? (
          <div className="h-40 flex items-center justify-center text-[14px] text-slate-500 border-t border-gray-100">
            Yuklanmoqda...
          </div>
        ) : videos.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-[14px] text-slate-500 border-t border-gray-100">
            Hozircha videolar mavjud emas.
          </div>
        ) : (
          <table className="w-full min-w-[980px] text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[12px] font-bold text-slate-500">
                <th className="py-4 px-3">Video nomi</th>
                <th className="py-4 px-3">Dars nomi</th>
                <th className="py-4 px-3 w-28 text-center">Status</th>
                <th className="py-4 px-3 w-36">Dars sanasi</th>
                <th className="py-4 px-3 w-28">Hajmi</th>
                <th className="py-4 px-3 w-36">Qo'shilgan vaqti</th>
                <th className="py-4 px-3 w-24 text-center">Harakatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {videos.map((video) => (
                <tr key={video.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-3 text-[13px] font-semibold text-slate-900">
                    <button
                      type="button"
                      onClick={() => setPreviewVideo(video)}
                      className="inline-flex items-center gap-2 hover:text-emerald-600 hover:underline decoration-dotted underline-offset-2"
                    >
                      <span className="w-5 h-5 rounded-full border-2 border-emerald-500 text-emerald-500 flex items-center justify-center">
                        <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                      {video.name}
                    </button>
                  </td>
                  <td className="py-4 px-3 text-[13px] font-medium text-slate-900">{video.lesson?.topic || "-"}</td>
                  <td className="py-4 px-3 text-center">
                    <span className="inline-flex px-3 py-1 rounded-md border border-green-200 bg-green-50 text-green-600 text-[12px] font-semibold">
                      Tayyor
                    </span>
                  </td>
                  <td className="py-4 px-3 text-[13px] font-medium text-slate-900">{formatDate(video.lesson?.created_at)}</td>
                  <td className="py-4 px-3 text-[13px] font-medium text-slate-900">{formatSize(video.size)}</td>
                  <td className="py-4 px-3 text-[13px] font-medium text-slate-900">{formatDate(video.created_at)}</td>
                  <td className="py-4 px-3 text-center relative">
                    <button
                      type="button"
                      onClick={(event) => toggleActionsMenu(event, video.id)}
                      className="w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors inline-flex items-center justify-center"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.7" />
                        <circle cx="12" cy="12" r="1.7" />
                        <circle cx="12" cy="19" r="1.7" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {activeMenu && (
        <div className="fixed inset-0 z-[60]" onClick={() => setActiveMenu(null)}>
          <div
            className="absolute w-44 bg-white border border-gray-100 rounded-xl shadow-xl p-2"
            style={{ top: activeMenu.top, left: activeMenu.left }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                const video = videos.find((item) => item.id === activeMenu.id);
                if (video) openEditModal(video);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              Tahrirlash
            </button>
            <button
              type="button"
              onClick={() => handleDelete(activeMenu.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold text-red-500 hover:bg-red-50 border border-red-100"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6l-1 14H6L5 6" />
              </svg>
              O'chirish
            </button>
          </div>
        </div>
      )}

      {previewVideo && (
        <div className="fixed inset-0 z-[80] bg-black/45 flex items-center justify-center p-6" onClick={() => setPreviewVideo(null)}>
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-2xl p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">{previewVideo.lesson?.topic || previewVideo.name}</h3>
              <button type="button" onClick={() => setPreviewVideo(null)} className="text-slate-400 hover:text-slate-700">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <video
              controls
              className="w-full max-h-[520px] bg-black rounded-lg"
              src={`/files/videos/${previewVideo.file}`}
            />
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/45 flex items-center justify-center p-6" onClick={closeModal}>
          <div className="w-full max-w-5xl bg-white rounded-xl shadow-2xl p-5" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900">{editingVideo ? "Tahrirlash" : "Qo'shish"}</h3>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-slate-700">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDrop={(event) => {
                event.preventDefault();
                handleFileChange(event.dataTransfer.files?.[0]);
              }}
              onDragOver={(event) => event.preventDefault()}
              className="w-full min-h-36 border border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-center px-5 hover:border-emerald-300 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={VIDEO_ACCEPT}
                className="hidden"
                onChange={(event) => handleFileChange(event.target.files?.[0])}
              />
              <svg width="42" height="42" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500 mb-4" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m17 8-5-5-5 5" />
                <path d="M12 3v12" />
              </svg>
              <p className="text-sm font-semibold text-slate-800">Videofaylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling</p>
              <p className="text-[13px] text-slate-400 mt-2">Videofayl .mp4, .webm, .mpeg, .avi, .mkv, .m4v, .ogm, .mov, .mpg formatlaridan birida bo'lishi kerak</p>
            </button>

            {(file || editingVideo) && (
              <div className="mt-4 border border-gray-100 rounded-lg overflow-hidden">
                <div className="grid grid-cols-[1fr_1.2fr_1.2fr_80px] bg-slate-50 text-[13px] font-bold text-slate-800">
                  <div className="px-4 py-3">File name</div>
                  <div className="px-4 py-3"><span className="text-red-500">*</span> Dars</div>
                  <div className="px-4 py-3"><span className="text-red-500">*</span> Video nomi</div>
                  <div className="px-4 py-3">Actions</div>
                </div>
                <div className="grid grid-cols-[1fr_1.2fr_1.2fr_80px] items-center text-[13px]">
                  <div className="px-4 py-4 text-slate-800">{file?.name || editingVideo?.file}</div>
                  <div className="px-4 py-4">
                    <select
                      value={form.lesson_id}
                      onChange={(event) => setForm((prev) => ({ ...prev, lesson_id: event.target.value }))}
                      className="w-full h-9 border border-gray-200 rounded-lg px-3 outline-none focus:border-emerald-500"
                    >
                      <option value="">Darsni tanlang</option>
                      {lessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.topic || `Dars #${lesson.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="px-4 py-4">
                    <input
                      value={form.name}
                      onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                      className="w-full h-9 border border-gray-200 rounded-lg px-3 outline-none focus:border-emerald-500"
                      placeholder={selectedLesson?.topic || "Video nomi"}
                    />
                  </div>
                  <div className="px-4 py-4">
                    <button type="button" onClick={() => setFile(null)} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-slate-500 hover:text-red-500">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 14H6L5 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && <p className="mt-4 text-[13px] font-semibold text-red-500">{error}</p>}

            <div className="flex justify-end gap-3 mt-7">
              <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-200 rounded-lg text-[13px] font-bold text-slate-500 hover:bg-gray-50">
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-[13px] font-bold hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Yuklanmoqda..." : editingVideo ? "Saqlash" : "Fayllarni yuklash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
