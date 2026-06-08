import { useCallback, useEffect, useMemo, useState } from "react";
import CreateVideo from "./CreateVideo";

const SUB_TABS = ["Uyga vazifa", "Videolar", "Imtihonlar", "Jurnal"];
const CHECK_TABS = ["Kutayotganlar", "Qaytarilganlar", "Qabul qilinganlar", "Bajarilmagan"];

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return { date: "-", time: "" };
  const date = new Date(value);
  return {
    date: formatDate(value),
    time: date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
  };
};

const addOneDay = (value) => {
  if (!value) return null;
  const date = new Date(value);
  date.setDate(date.getDate() + 1);
  return date.toISOString();
};

export default function HomeworkCreate({ groupId, students = [], studentsCount = 0 }) {
  const [activeSubTab, setActiveSubTab] = useState("Uyga vazifa");
  const [isCreating, setIsCreating] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [checkingTab, setCheckingTab] = useState("Kutayotganlar");
  const [score, setScore] = useState(60);
  const [teacherComment, setTeacherComment] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [lessons, setLessons] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ lesson_id: "", title: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => String(lesson.id) === String(form.lesson_id)),
    [form.lesson_id, lessons]
  );

  const [homeworkResults, setHomeworkResults] = useState({
    "Kutayotganlar": [],
    "Qaytarilganlar": [],
    "Qabul qilinganlar": [],
    "Bajarilmagan": []
  });
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    if (selectedHomework && groupId) {
      const loadResults = async () => {
        setLoadingResults(true);
        try {
          const token = localStorage.getItem("token");

          const fetchStatus = async (status) => {
            const url = status 
              ? `/api/v1/homework/group/${groupId}/homework/${selectedHomework.id}/results?status=${status}` 
              : `/api/v1/homework/group/${groupId}/homework/${selectedHomework.id}/results`;
              
            const res = await fetch(url, { headers: { "Authorization": `Bearer ${token}`, "accept": "*/*" } });
            const data = await res.json();
            return (data.success && data.data?.students) ? data.data.students : [];
          };

          const [pending, completed, rejected, notSubmitted] = await Promise.all([
            fetchStatus("pending"),
            fetchStatus("completed"),
            fetchStatus("rejected"),
            fetchStatus("")
          ]);

          const mapStudents = (studentsList, statusName) => studentsList.map(s => ({
            id: s.id,
            name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "O'quvchi",
            sentAt: statusName === "Bajarilmagan" ? null : (s.created_at || new Date().toISOString()),
            files: s.file ? 1 : 0,
            fileUrl: s.file ? `/files/homeworkAnswers/${s.file}` : null,
            status: statusName,
            answerNote: s.title || "",
            answerId: s.homework_answer_id
          }));

          setHomeworkResults({
            "Kutayotganlar": mapStudents(pending, "Kutayotganlar"),
            "Qaytarilganlar": mapStudents(rejected, "Qaytarilganlar"),
            "Qabul qilinganlar": mapStudents(completed, "Qabul qilinganlar"),
            "Bajarilmagan": mapStudents(notSubmitted, "Bajarilmagan")
          });
        } catch (err) {
          console.error("Error fetching results", err);
        } finally {
          setLoadingResults(false);
        }
      };
      loadResults();
    }
  }, [selectedHomework, groupId, refreshKey]);

  const currentStudents = homeworkResults[checkingTab] || [];

  const getCheckingCount = (tab) => {
    return homeworkResults[tab]?.length || 0;
  };

  const fetchHomeworkData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "accept": "*/*",
        "Authorization": `Bearer ${token}`,
      };

      const [lessonsRes, homeworkRes] = await Promise.all([
        fetch(`/api/v1/lessons/group/${groupId}`, { headers }),
        fetch(`/api/v1/homework/group/${groupId}`, { headers }),
      ]);

      const [lessonsData, homeworkData] = await Promise.all([
        lessonsRes.json(),
        homeworkRes.json(),
      ]);

      setLessons(Array.isArray(lessonsData.data) ? lessonsData.data : []);
      setHomeworks(Array.isArray(homeworkData.data) ? homeworkData.data : []);
    } catch (err) {
      console.error("Homework data fetch error:", err);
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;

    const loadTimer = window.setTimeout(fetchHomeworkData, 0);

    return () => window.clearTimeout(loadTimer);
  }, [fetchHomeworkData, groupId]);

  const resetCreateForm = () => {
    setForm({ lesson_id: "", title: "" });
    setFile(null);
    setError("");
    setMessage("");
  };

  const handleCancel = () => {
    resetCreateForm();
    setIsCreating(false);
  };

  const handleCreateHomework = async () => {
    setError("");
    setMessage("");

    if (!form.lesson_id) {
      setError("Mavzuni tanlang.");
      return;
    }

    if (!form.title.trim()) {
      setError("Izoh kiriting.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("lesson_id", form.lesson_id);
      formData.append("group_id", String(groupId));
      formData.append("title", form.title.trim());
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("/api/v1/homework", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || "Uyga vazifani e'lon qilishda xatolik yuz berdi.");
        return;
      }

      setMessage("Uyga vazifa e'lon qilindi.");
      resetCreateForm();
      setIsCreating(false);
      await fetchHomeworkData();
    } catch (err) {
      console.error("Homework create error:", err);
      setError("Server bilan bog'lanishda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const handleGrade = async () => {
    if (!selectedStudent || !selectedStudent.answerId) {
      alert("Xatolik: O'quvchining javobi topilmadi");
      return;
    }
    
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/homework/group/${groupId}/homework/${selectedHomework.id}/check`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "accept": "*/*"
        },
        body: JSON.stringify({
          grade: score,
          title: teacherComment || "Tekshirildi",
          homework_answer_id: selectedStudent.answerId
        })
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Baho muvaffaqiyatli saqlandi!");
        setSelectedStudent(null);
        setRefreshKey(prev => prev + 1);
        await fetchHomeworkData();
      } else {
        alert("Xatolik: " + (data.message || "Baho saqlashda xatolik"));
      }
    } catch (err) {
      console.error(err);
      alert("Tarmoq xatosi");
    } finally {
      setSaving(false);
    }
  };

  if (selectedStudent && selectedHomework) {
    const sentAt = formatDateTime(selectedStudent.sentAt);

    return (
      <div className="bg-white min-h-[620px]">
        <div className="flex items-center gap-3 mb-8 text-[16px] font-extrabold">
          <button
            type="button"
            onClick={() => setSelectedStudent(null)}
            className="text-slate-900 hover:text-emerald-600 transition-colors"
          >
            {checkingTab}
          </button>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400" viewBox="0 0 24 24">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="text-slate-500">Uyga vazifa</span>
        </div>

        <div className="max-w-[940px] space-y-7">
          <section className="bg-slate-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-[18px] font-extrabold text-slate-900 mb-5">Uy vazifasi</h3>
            <div className="bg-white rounded-lg p-6">
              <p className="text-sm text-slate-400 font-medium mb-4">Izoh:</p>
              <p className="text-base font-medium text-slate-900">{selectedHomework.title || selectedHomework.lesson?.topic || "-"}</p>
            </div>
          </section>

          <section className="bg-slate-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-[24px] font-extrabold text-slate-800 mb-7">{selectedStudent.name}</h3>

            <div className="bg-white border border-gray-100 rounded-xl p-7 grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-slate-400 font-medium mb-2">Vaqti:</p>
                <p className="text-base font-bold text-slate-900">{sentAt.date} {sentAt.time}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium mb-2">Fayllar soni:</p>
                <p className="text-base font-bold text-slate-900">{selectedStudent.files}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium mb-2">Status:</p>
                <span className="inline-flex px-3 py-1 rounded-md border border-yellow-200 bg-yellow-50 text-yellow-600 text-sm font-semibold">
                  {selectedStudent.status}
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-7">
              <p className="text-sm text-slate-500 mb-5">Fayl: <span className="font-extrabold text-slate-900">{selectedStudent.files}</span></p>
              <div className="flex gap-7 mb-8 overflow-x-auto">
                {Array.from({ length: selectedStudent.files }).map((_, index) => (
                  <a key={index} href={selectedStudent.fileUrl} target="_blank" rel="noopener noreferrer" className="w-44 h-28 shrink-0 bg-white border border-gray-200 shadow-sm overflow-hidden block hover:border-emerald-500 transition-colors">
                    <div className="h-5 bg-slate-100 border-b border-gray-200 flex items-center gap-1 px-2">
                      <span className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full ml-auto" />
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="h-2 bg-slate-200 rounded w-2/3" />
                      <div className="h-2 bg-slate-100 rounded w-full" />
                      <div className="h-2 bg-slate-100 rounded w-4/5" />
                      <div className="grid grid-cols-3 gap-1 pt-2">
                        <div className="h-8 bg-emerald-100 rounded" />
                        <div className="h-8 bg-slate-100 rounded" />
                        <div className="h-8 bg-blue-100 rounded" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="bg-slate-50 border-l-4 border-blue-500 rounded-lg p-6">
                <p className="text-sm text-slate-400 mb-3">Uyga vazifa izohi:</p>
                <p className="text-base font-bold text-slate-800 break-all">
                  {selectedStudent.answerNote || "Izoh qoldirilmagan"}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 border border-gray-200 rounded-lg p-6">
            <div className="border border-sky-300 bg-sky-50 rounded-xl p-5 flex gap-4 text-sky-700 mb-10">
              <span className="w-9 h-9 shrink-0 rounded-full bg-sky-600 text-white flex items-center justify-center text-base font-bold">i</span>
              <p className="text-base font-semibold leading-relaxed">
                60-100 oralig'ida ball qo'yilgan vazifa 'Qabul qilingan', 0-59 oralig'ida ball qo'yilgan vazifa 'Qaytarilgan' hisoblanadi.
              </p>
            </div>

            <h3 className="text-[18px] font-extrabold text-slate-900 mb-8">Ball</h3>
            <div className="flex items-center gap-8 mb-16">
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(event) => setScore(Number(event.target.value))}
                  className="w-full h-4 rounded-full appearance-none cursor-pointer"
                  style={{ background: `linear-gradient(to right, #22c55e 0%, #22c55e ${score}%, #e5e7eb ${score}%, #e5e7eb 100%)` }}
                />
                <p className="absolute top-8 left-[60%] -translate-x-1/2 text-sm font-bold text-slate-500">O'tish bali</p>
              </div>
              <div className="w-20 h-14 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-xl font-semibold text-slate-900">
                {score}
              </div>
            </div>

            <h3 className="text-[18px] font-extrabold text-slate-900 mb-6">Fayllar</h3>
            <label className="h-72 border border-dashed border-emerald-400 bg-emerald-50/20 rounded-2xl flex flex-col items-center justify-center text-center px-8 cursor-pointer hover:bg-emerald-50/50 transition-colors mb-10">
              <input type="file" className="hidden" />
              <svg width="72" height="72" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-500 mb-6" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m17 8-5-5-5 5" />
                <path d="M12 3v12" />
              </svg>
              <p className="text-base text-slate-900 mb-4">Faylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling</p>
              <p className="text-sm text-slate-400">.jpg, .png, .pdf, .mp4, .docs formatlaridan birida bo'lishi mumkin</p>
            </label>

            <div className="relative mb-8">
              <textarea value={teacherComment} onChange={(e) => setTeacherComment(e.target.value)} className="w-full h-32 rounded-xl border border-gray-200 bg-white p-6 pr-20 text-base outline-none resize-none focus:border-emerald-400" placeholder="Izohingiz" />
              <button type="button" className="absolute right-5 bottom-5 w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <path d="M12 19v3" />
                </svg>
              </button>
            </div>
          </section>

          <div className="flex justify-end gap-8 pb-4">
            <button type="button" onClick={() => setSelectedStudent(null)} className="px-8 py-4 rounded-xl border border-gray-200 text-base font-semibold text-slate-500 hover:bg-gray-50">
              Bekor qilish
            </button>
            <button type="button" disabled={saving} onClick={handleGrade} className="px-8 py-4 rounded-xl bg-emerald-500 text-white text-base font-bold hover:bg-emerald-600 disabled:opacity-50">
              {saving ? "Saqlanmoqda..." : "Yuborish"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedHomework) {
    const deadline = formatDateTime(addOneDay(selectedHomework.created_at));

    return (
      <div className="bg-white min-h-[520px]">
        <button
          type="button"
          onClick={() => {
            setSelectedHomework(null);
            setSelectedStudent(null);
            setCheckingTab("Kutayotganlar");
          }}
          className="flex items-center gap-4 text-lg font-extrabold text-slate-900 mb-7 hover:text-emerald-600 transition-colors"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="m15 18-6-6 6-6" />
          </svg>
          {selectedHomework.title || selectedHomework.lesson?.topic || "-"}
        </button>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-[13px] font-bold text-slate-500 mb-3">Mavzu</p>
              <p className="text-base font-extrabold text-slate-900">{selectedHomework.title || selectedHomework.lesson?.topic || "-"}</p>
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-500 mb-3">Tugash vaqti</p>
              <p className="text-base font-extrabold text-slate-900">{deadline.date} {deadline.time}</p>
            </div>
          </div>

          <div className="px-6 pt-8">
            <div className="flex gap-8 border-b border-gray-200">
              {CHECK_TABS.map((tab) => {
                const count = getCheckingCount(tab);
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setCheckingTab(tab)}
                    className={`relative pb-4 text-sm font-bold transition-colors flex items-center gap-2 ${
                      checkingTab === tab ? "text-slate-900" : "text-slate-700 hover:text-emerald-600"
                    }`}
                  >
                    {tab}
                    {count > 0 && (
                      <span className="w-6 h-6 rounded-full bg-yellow-400 text-slate-900 flex items-center justify-center text-[14px] font-extrabold">
                        {count}
                      </span>
                    )}
                    {checkingTab === tab && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-emerald-500" />}
                  </button>
                );
              })}
            </div>

            <table className="w-full text-left border-collapse mt-7">
              <thead>
                <tr className="border-b border-gray-200 text-sm font-bold text-slate-500">
                  <th className="py-4 px-3">O'quvchi ismi</th>
                  <th className="py-4 px-3">Uyga vazifa jo'natilgan vaqt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingResults ? (
                  <tr>
                    <td colSpan="2" className="py-10 text-center text-[14px] text-slate-500">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : currentStudents.length > 0 ? currentStudents.map((student) => {
                  const sentAt = formatDateTime(student.sentAt);
                  return (
                    <tr
                      key={student.id}
                      onClick={() => {
                        setSelectedStudent(student);
                        setScore(student.grade || 60);
                        setTeacherComment(student.answerNote && student.status !== "Kutayotganlar" ? "Tekshirildi" : "");
                      }}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 px-3 text-sm font-medium text-slate-900">{student.name}</td>
                      <td className="py-4 px-3 text-sm font-medium text-slate-900">{sentAt.date} {sentAt.time}</td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="2" className="py-10 text-center text-[14px] text-slate-500">
                      Bu bo'limda ma'lumot yo'q.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="bg-white min-h-[420px]">
        <button
          type="button"
          onClick={handleCancel}
          className="flex items-center gap-3 text-base font-extrabold text-slate-900 mb-7 hover:text-emerald-600 transition-colors"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Yangi uyga vazifa yaratish
        </button>

        <div className="max-w-[520px]">
          <label className="block text-[13px] font-bold text-slate-900 mb-2">
            <span className="text-red-500">*</span> Mavzu
          </label>
          <select
            value={form.lesson_id}
            onChange={(event) => setForm((prev) => ({ ...prev, lesson_id: event.target.value }))}
            className="w-full h-10 border border-gray-200 rounded-lg px-3 text-[13px] text-slate-600 outline-none focus:border-emerald-500 bg-white mb-8"
          >
            <option value="">Mavzulardan birini tanlang</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.topic || `Mavzu #${lesson.id}`}
              </option>
            ))}
          </select>

          <label className="block text-[13px] font-bold text-slate-900 mb-2">
            <span className="text-red-500">*</span> Izoh
          </label>
          <div className="border border-gray-200 rounded-t-lg bg-white">
            <div className="h-14 flex flex-wrap items-center gap-3 px-3 text-[13px] text-slate-800 border-b border-gray-200">
              <button type="button" className="font-extrabold">H1</button>
              <button type="button" className="font-extrabold">H2</button>
              <button type="button">Sans Serif</button>
              <button type="button" className="font-bold">Normal</button>
              <button type="button" className="font-extrabold">B</button>
              <button type="button" className="italic font-bold">I</button>
              <button type="button" className="underline font-bold">U</button>
              <button type="button" className="line-through font-bold">S</button>
              <button type="button" className="font-bold">"</button>
              <button type="button" className="font-bold">&lt;/&gt;</button>
              <button type="button" className="font-bold">=</button>
              <button type="button" className="font-bold">#</button>
              <button type="button" className="font-bold">@</button>
            </div>
            <textarea
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full h-[72px] resize-none px-3 py-2 text-[13px] text-slate-700 outline-none"
              placeholder={selectedLesson?.topic || "Uyga vazifa izohini kiriting"}
            />
          </div>

          <label className="mt-12 mb-7 h-9 border border-dashed border-gray-200 rounded-lg text-[13px] font-semibold text-slate-500 flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-300 hover:text-emerald-600 transition-colors">
            <input
              type="file"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="m17 8-5-5-5 5" />
              <path d="M12 3v12" />
            </svg>
            {file ? file.name : "Yuklash"}
          </label>

          {(error || message) && (
            <p className={`text-[13px] font-semibold mb-4 ${error ? "text-red-500" : "text-emerald-600"}`}>
              {error || message}
            </p>
          )}

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2 border border-gray-200 rounded-lg text-[13px] font-bold text-slate-500 hover:bg-gray-50 transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleCreateHomework}
              disabled={saving}
              className="px-5 py-2 bg-emerald-500 text-white rounded-lg text-[13px] font-bold hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "E'lon qilinmoqda..." : "E'lon qilish"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[420px]">
      <div className="flex items-center justify-between gap-4 mb-7">
        <div className="flex items-center gap-7">
          <h2 className="text-[15px] font-extrabold text-slate-900">Guruh darsliklari</h2>
          <div className="flex bg-slate-50 border border-gray-100 rounded-lg overflow-hidden">
            {SUB_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveSubTab(tab)}
                className={`min-w-[112px] px-5 py-2.5 text-[13px] font-semibold transition-colors ${
                  activeSubTab === tab
                    ? "bg-white text-slate-900 shadow-[0_1px_4px_rgba(15,23,42,0.08)]"
                    : "text-slate-600 hover:bg-white/70"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeSubTab === "Uyga vazifa" && (
          <button
            type="button"
            onClick={() => {
              setError("");
              setMessage("");
              setIsCreating(true);
            }}
            className="px-4 py-2.5 bg-emerald-500 text-white text-[13px] font-bold rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Uyga vazifa qo'shish
          </button>
        )}
      </div>

      {activeSubTab === "Videolar" ? (
        <CreateVideo groupId={groupId} />
      ) : activeSubTab !== "Uyga vazifa" ? (
        <div className="h-40 flex items-center justify-center text-[14px] text-slate-500 border-t border-gray-100">
          Tez kunda...
        </div>
      ) : (
        <div className="overflow-x-auto">
          {loading ? (
            <div className="h-40 flex items-center justify-center text-[14px] text-slate-500 border-t border-gray-100">
              Yuklanmoqda...
            </div>
          ) : homeworks.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-[14px] text-slate-500 border-t border-gray-100">
              Hozircha uyga vazifa mavjud emas.
            </div>
          ) : (
            <table className="w-full min-w-[980px] text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[12px] font-bold text-slate-500">
                  <th className="py-4 px-3 w-14">#</th>
                  <th className="py-4 px-3">Mavzu</th>
                  <th className="py-4 px-3 w-14 text-center">
                    <svg className="inline text-slate-500" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </th>
                  <th className="py-4 px-3 w-14 text-center">
                    <svg className="inline text-yellow-500" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </th>
                  <th className="py-4 px-3 w-14 text-center">
                    <svg className="inline text-emerald-500" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </th>
                  <th className="py-4 px-3 w-36">Berilgan vaqt</th>
                  <th className="py-4 px-3 w-36">Tugash vaqti</th>
                  <th className="py-4 px-3 w-36">Dars sanasi</th>
                  <th className="py-4 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {homeworks.map((homework, index) => {
                  const createdAt = formatDateTime(homework.created_at);
                  const deadline = formatDateTime(addOneDay(homework.created_at));

                  return (
                    <tr
                      key={homework.id}
                      onClick={() => {
                        setSelectedHomework(homework);
                        setCheckingTab("Kutayotganlar");
                      }}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-3 text-[13px] font-bold text-slate-900">{index + 1}</td>
                      <td className="py-4 px-3 text-[13px] font-bold text-slate-900 leading-snug">
                        {homework.title || homework.lesson?.topic || "-"}
                      </td>
                      <td className="py-4 px-3 text-[13px] font-bold text-slate-900 text-center">{homework.totalAnswers || 0}</td>
                      <td className="py-4 px-3 text-[13px] font-bold text-slate-900 text-center">{homework.pending || 0}</td>
                      <td className="py-4 px-3 text-[13px] font-bold text-slate-900 text-center">{homework.completed || 0}</td>
                      <td className="py-4 px-3 text-[13px] font-semibold text-slate-800">
                        {createdAt.date}
                        <br />
                        <span>{createdAt.time}</span>
                      </td>
                      <td className="py-4 px-3 text-[13px] font-semibold text-slate-800">
                        {deadline.date}
                        <br />
                        <span>{deadline.time}</span>
                      </td>
                      <td className="py-4 px-3 text-[13px] font-semibold text-slate-800">
                        {formatDate(homework.lesson?.created_at || homework.created_at)}
                      </td>
                      <td className="py-4 px-3 text-right text-slate-400">
                        <button type="button" className="p-1 hover:text-slate-700 transition-colors">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="1.7" />
                            <circle cx="12" cy="12" r="1.7" />
                            <circle cx="12" cy="19" r="1.7" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
