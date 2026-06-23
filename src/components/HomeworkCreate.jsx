import { useCallback, useEffect, useMemo, useState } from "react";
import CreateVideo from "./CreateVideo";
import { Snackbar, Alert } from "@mui/material";
import { DatePicker } from "./ui/date-picker";

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

const getStatusBadgeClasses = (status) => {
  if (!status) return "border-gray-200 bg-gray-50 text-gray-600";
  const normalized = status.toLowerCase();
  if (normalized.includes("qabul")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-600";
  }
  if (normalized.includes("qaytar")) {
    return "border-red-200 bg-red-50 text-red-600";
  }
  if (normalized.includes("kutayotgan") || normalized.includes("kutilayotgan") || normalized.includes("pending")) {
    return "border-sky-200 bg-sky-50 text-sky-600";
  }
  return "border-gray-200 bg-gray-50 text-gray-600";
};

export default function HomeworkCreate({ groupId, students = [], studentsCount = 0, urlHomeworkId, user }) {
  const currentUser = user || (() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const isAllowedToRecheck = currentUser?.role === "ADMIN" || currentUser?.role === "SUPERADMIN";

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

  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const showNotification = (message, severity = "success") => {
    setNotification({ open: true, message, severity });
  };

  // Exam states
  const [isCreatingExam, setIsCreatingExam] = useState(false);
  const [examActionMenu, setExamActionMenu] = useState(null);
  const [examForm, setExamForm] = useState({ lesson_id: "", title: "", deadline_date: "", deadline_time: "" });
  const [examFile, setExamFile] = useState(null);

  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedExamStudent, setSelectedExamStudent] = useState(null);
  const [examCheckingTab, setExamCheckingTab] = useState("Kutayotganlar");
  const [examScore, setExamScore] = useState(60);
  const [examTeacherComment, setExamTeacherComment] = useState("");

  const [examsList, setExamsList] = useState([
    { 
      id: 7, 
      title: "Examination", 
      studentsCount: 18, 
      failed: 2, 
      status: "Faol", 
      darsVaqti: "30 Yan, 2026 12:21 - 30 Yan, 2026 23:59", 
      berilganVaqt: "30 Yan, 2026 12:20", 
      elonVaqti: "-",
      students: {
        "Kutayotganlar": [],
        "Qaytarilganlar": [
          { id: 102, name: "Hojiakabar Nosir o'g'li Yarashov", sentAt: "02 Fev, 2026 22:38", checkedAt: "04 Fev, 2026 09:13", deadline: "11 Fev, 2026 12:00", status: "Qaytarilganlar", grade: 45, comment: "Qayta ishlang", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" },
          { id: 103, name: "Farrux Nishonaliyev", sentAt: "02 Fev, 2026 17:46", checkedAt: "04 Fev, 2026 09:11", deadline: "02 Fev, 2026 23:30", status: "Qaytarilganlar", grade: 50, comment: "Xatolarni to'g'rilang", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" }
        ],
        "Qabul qilinganlar": [
          { id: 104, name: "Asilbek Olimov", sentAt: "30 Yan, 2026 13:02", checkedAt: "30 Yan, 2026 14:00", deadline: "30 Yan, 2026 23:59", status: "Qabul qilinganlar", grade: 80, comment: "Yaxshi topshirildi", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" },
          { id: 105, name: "Shahzod Toshmatov", sentAt: "30 Yan, 2026 13:10", checkedAt: "30 Yan, 2026 14:05", deadline: "30 Yan, 2026 23:59", status: "Qabul qilinganlar", grade: 90, comment: "Zo'r", files: 2, fileUrl: "/files/homeworkAnswers/mock.pdf" },
          { id: 106, name: "Durdona Saidova", sentAt: "30 Yan, 2026 13:20", checkedAt: "30 Yan, 2026 14:06", deadline: "30 Yan, 2026 23:59", status: "Qabul qilinganlar", grade: 85, comment: "Mukammal", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" },
          { id: 107, name: "Javohir Ziyodullayev", sentAt: "30 Yan, 2026 13:30", checkedAt: "30 Yan, 2026 14:07", deadline: "30 Yan, 2026 23:59", status: "Qabul qilinganlar", grade: 75, comment: "", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" },
          { id: 108, name: "Madina Karimova", sentAt: "30 Yan, 2026 13:40", checkedAt: "30 Yan, 2026 14:08", deadline: "30 Yan, 2026 23:59", status: "Qabul qilinganlar", grade: 95, comment: "", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" },
          { id: 109, name: "Diyorbek Rustamov", sentAt: "30 Yan, 2026 13:50", checkedAt: "30 Yan, 2026 14:09", deadline: "30 Yan, 2026 23:59", status: "Qabul qilinganlar", grade: 70, comment: "", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" },
          { id: 110, name: "Zuhra Aliyeva", sentAt: "30 Yan, 2026 14:00", checkedAt: "30 Yan, 2026 14:10", deadline: "30 Yan, 2026 23:59", status: "Qabul qilinganlar", grade: 88, comment: "", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" },
          { id: 111, name: "Sirojiddin Faxriddinov", sentAt: "30 Yan, 2026 14:10", checkedAt: "30 Yan, 2026 14:11", deadline: "30 Yan, 2026 23:59", status: "Qabul qilinganlar", grade: 65, comment: "", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" },
          { id: 112, name: "Bobur Tursunov", sentAt: "30 Yan, 2026 14:20", checkedAt: "30 Yan, 2026 14:30", deadline: "30 Yan, 2026 23:59", status: "Qabul qilinganlar", grade: 92, comment: "", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" },
          { id: 113, name: "Laylo Qodirova", sentAt: "30 Yan, 2026 14:30", checkedAt: "30 Yan, 2026 14:40", deadline: "30 Yan, 2026 23:59", status: "Qabul qilinganlar", grade: 87, comment: "", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" },
          { id: 114, name: "Mirsaid Yo'ldoshev", sentAt: "30 Yan, 2026 14:40", checkedAt: "30 Yan, 2026 14:50", deadline: "30 Yan, 2026 23:59", status: "Qabul qilinganlar", grade: 78, comment: "", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" },
          { id: 115, name: "Nilufar Ahmedova", sentAt: "30 Yan, 2026 14:50", checkedAt: "30 Yan, 2026 15:00", deadline: "30 Yan, 2026 23:59", status: "Qabul qilinganlar", grade: 83, comment: "", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" },
          { id: 116, name: "Shohrux G'ofurov", sentAt: "30 Yan, 2026 15:00", checkedAt: "30 Yan, 2026 15:10", deadline: "30 Yan, 2026 23:59", status: "Qabul qilinganlar", grade: 81, comment: "", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" },
          { id: 117, name: "Muattar To'rayeva", sentAt: "30 Yan, 2026 15:10", checkedAt: "30 Yan, 2026 15:20", deadline: "30 Yan, 2026 23:59", status: "Qabul qilinganlar", grade: 89, comment: "", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" },
          { id: 118, name: "Otabek Qosimov", sentAt: "30 Yan, 2026 15:20", checkedAt: "30 Yan, 2026 15:30", deadline: "30 Yan, 2026 23:59", status: "Qabul qilinganlar", grade: 74, comment: "", files: 1, fileUrl: "/files/homeworkAnswers/mock.pdf" }
        ],
        "Bajarilmagan": [
          { id: 119, name: "Jasur Hamrayev", sentAt: "-", checkedAt: "-", deadline: "30 Yan, 2026 23:59", status: "Bajarilmagan", grade: null, comment: "", files: 0, fileUrl: null }
        ]
      }
    },
    { 
      id: 6, 
      title: "Examination", 
      studentsCount: 12, 
      failed: 0, 
      status: "Tugagan", 
      darsVaqti: "24 Apr, 2026 09:30 - 24 Apr, 2026 23:59", 
      berilganVaqt: "24 Apr, 2026 09:25", 
      elonVaqti: "27 Apr, 2026 10:30",
      students: { "Kutayotganlar": [], "Qaytarilganlar": [], "Qabul qilinganlar": [], "Bajarilmagan": [] }
    },
    { 
      id: 5, 
      title: "Examination", 
      studentsCount: 14, 
      failed: 0, 
      status: "Tugagan", 
      darsVaqti: "26 Mart, 2026 09:30 - 26 Mart, 2026 23:59", 
      berilganVaqt: "26 Mart, 2026 09:23", 
      elonVaqti: "30 Mart, 2026 14:34",
      students: { "Kutayotganlar": [], "Qaytarilganlar": [], "Qabul qilinganlar": [], "Bajarilmagan": [] }
    },
    { 
      id: 4, 
      title: "Examination", 
      studentsCount: 16, 
      failed: 0, 
      status: "Tugagan", 
      darsVaqti: "26 Fev, 2026 09:30 - 26 Fev, 2026 23:59", 
      berilganVaqt: "26 Fev, 2026 09:28", 
      elonVaqti: "02 Mart, 2026 13:32",
      students: { "Kutayotganlar": [], "Qaytarilganlar": [], "Qabul qilinganlar": [], "Bajarilmagan": [] }
    }
  ]);

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

  useEffect(() => {
    if (urlHomeworkId && homeworks.length > 0) {
      const found = homeworks.find(h => String(h.id) === String(urlHomeworkId));
      if (found) {
        setSelectedHomework(found);
        setActiveSubTab("Uyga vazifa");
      }
    }
  }, [urlHomeworkId, homeworks]);

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

    const hasExisting = homeworks.some(hw => String(hw.lesson?.id || hw.lesson_id) === String(form.lesson_id));
    if (hasExisting) {
      setError("Bu dars uchun allaqachon uyga vazifa yaratilgan.");
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

      showNotification("Uyga vazifa muvaffaqiyatli e'lon qilindi!", "success");
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
      showNotification("Xatolik: O'quvchining javobi topilmadi", "error");
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
        showNotification("Muvaffaqiyatli saqlandi!", "success");
        setSelectedStudent(null);
        setRefreshKey(prev => prev + 1);
        await fetchHomeworkData();
      } else {
        showNotification("Xatolik: " + (data.message || "Baho saqlashda xatolik"), "error");
      }
    } catch (err) {
      console.error(err);
      showNotification("Tarmoq xatosi", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveExamGrade = () => {
    if (!selectedExam || !selectedExamStudent) return;
    
    const newStatus = examScore >= 60 ? "Qabul qilinganlar" : "Qaytarilganlar";
    const now = new Date();
    const checkedAtStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + now.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
    
    const updatedStudent = {
      ...selectedExamStudent,
      grade: examScore,
      comment: examTeacherComment,
      checkedAt: checkedAtStr,
      status: newStatus
    };
    
    setExamsList(prev => prev.map(ex => {
      if (ex.id === selectedExam.id) {
        const currentTabList = ex.students[selectedExamStudent.status].filter(s => s.id !== selectedExamStudent.id);
        const targetTabList = [...ex.students[newStatus], updatedStudent];
        return {
          ...ex,
          failed: newStatus === "Qaytarilganlar" ? ex.failed + 1 : (selectedExamStudent.status === "Qaytarilganlar" ? ex.failed - 1 : ex.failed),
          students: {
            ...ex.students,
            [selectedExamStudent.status]: currentTabList,
            [newStatus]: targetTabList
          }
        };
      }
      return ex;
    }));
    
    setSelectedExam(prev => {
      const currentTabList = prev.students[selectedExamStudent.status].filter(s => s.id !== selectedExamStudent.id);
      const targetTabList = [...prev.students[newStatus], updatedStudent];
      return {
        ...prev,
        failed: newStatus === "Qaytarilganlar" ? prev.failed + 1 : (selectedExamStudent.status === "Qaytarilganlar" ? prev.failed - 1 : prev.failed),
        students: {
          ...prev.students,
          [selectedExamStudent.status]: currentTabList,
          [newStatus]: targetTabList
        }
      };
    });
    
    showNotification("Muvaffaqiyatli saqlandi!", "success");
    setSelectedExamStudent(null);
  };

  const handleCreateExamSubmit = () => {
    if (!examForm.lesson_id) {
      showNotification("Iltimos, mavzuni tanlang!", "warning");
      return;
    }
    const targetLesson = lessons.find(l => String(l.id) === String(examForm.lesson_id));
    const title = targetLesson ? targetLesson.topic : (examForm.title || "Examination");
    
    const newExam = {
      id: examsList.length > 0 ? Math.max(...examsList.map(e => e.id)) + 1 : 1,
      title: title || "Examination",
      studentsCount: studentsCount || 0,
      failed: 0,
      status: "Faol",
      darsVaqti: `${examForm.deadline_date || "Bugun"} ${examForm.deadline_time || "18:00"}`,
      berilganVaqt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + " " + new Date().toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" }),
      elonVaqti: "-",
      students: {
        "Kutayotganlar": [],
        "Qaytarilganlar": [],
        "Qabul qilinganlar": [],
        "Bajarilmagan": students.map((s, index) => ({
          id: 200 + index,
          name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || "O'quvchi",
          sentAt: "-",
          checkedAt: "-",
          deadline: `${examForm.deadline_date || "Bugun"} ${examForm.deadline_time || "18:00"}`,
          status: "Bajarilmagan",
          grade: null,
          comment: "",
          files: 0,
          fileUrl: null
        }))
      }
    };
    
    setExamsList(prev => [newExam, ...prev]);
    setIsCreatingExam(false);
    setExamForm({ lesson_id: "", title: "", deadline_date: "", deadline_time: "" });
    setExamFile(null);
  };

  if (selectedExamStudent && selectedExam) {
    const isExamChecked = (selectedExamStudent.status === "Qabul qilinganlar" || selectedExamStudent.status === "Qaytarilganlar" || selectedExamStudent.status === "Qabul qilingan" || selectedExamStudent.status === "Qaytarilgan");
    const isExamRecheckDisabled = isExamChecked && !isAllowedToRecheck;

    return (
      <div className="bg-white p-6 rounded-[12px] border border-gray-200 shadow-sm min-h-[620px] max-w-[748px]">
        <div className="flex items-center gap-3 mb-8 text-[16px] font-extrabold">
          <button
            type="button"
            onClick={() => setSelectedExamStudent(null)}
            className="text-slate-900 hover:text-emerald-600 transition-colors"
          >
            {examCheckingTab}
          </button>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400" viewBox="0 0 24 24">
            <path d="m9 18 6-6-6-6" />
          </svg>
          <span className="text-slate-500">Imtihon</span>
        </div>

        <div className="space-y-4">
          <section className="bg-slate-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">Imtihon mavzusi</h3>
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <p className="text-xs text-slate-400 font-medium mb-2">Mavzu:</p>
              <p className="text-sm font-medium text-slate-900">{selectedExam.title}</p>
            </div>
          </section>

          <section className="bg-slate-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-base font-extrabold text-slate-800 mb-4">{selectedExamStudent.name}</h3>

            <div className="bg-white border border-gray-100 rounded-lg p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Topshirilgan vaqti:</p>
                <p className="text-sm font-bold text-slate-900">{selectedExamStudent.sentAt}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Tekshirilgan vaqti:</p>
                <p className="text-sm font-bold text-slate-900">{selectedExamStudent.checkedAt}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Fayllar soni:</p>
                <p className="text-sm font-bold text-slate-900">{selectedExamStudent.files}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Status:</p>
                <span className={`inline-flex px-2 py-0.5 rounded-md border text-xs font-semibold ${getStatusBadgeClasses(selectedExamStudent.status)}`}>
                  {selectedExamStudent.status}
                </span>
              </div>
            </div>

            {selectedExamStudent.files > 0 && (
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <p className="text-xs text-slate-500 mb-3">Fayl: <span className="font-extrabold text-slate-900">{selectedExamStudent.files}</span></p>
                <div className="flex gap-4 mb-4 overflow-x-auto">
                  {Array.from({ length: selectedExamStudent.files }).map((_, index) => (
                    <a key={index} href={selectedExamStudent.fileUrl} target="_blank" rel="noopener noreferrer" className="w-32 h-20 shrink-0 bg-white border border-gray-200 shadow-sm overflow-hidden block hover:border-emerald-500 transition-colors">
                      <div className="h-4 bg-slate-100 border-b border-gray-200 flex items-center gap-1 px-2">
                        <span className="w-1 h-1 bg-violet-500 rounded-full" />
                        <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                        <span className="w-1 h-1 bg-red-500 rounded-full ml-auto" />
                      </div>
                      <div className="p-2 space-y-1.5">
                        <div className="h-1.5 bg-slate-200 rounded w-2/3" />
                        <div className="h-1.5 bg-slate-100 rounded w-full" />
                        <div className="h-1.5 bg-slate-100 rounded w-4/5" />
                        <div className="grid grid-cols-3 gap-1 pt-1">
                          <div className="h-4 bg-emerald-100 rounded" />
                          <div className="h-4 bg-slate-100 rounded" />
                          <div className="h-4 bg-blue-100 rounded" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>

          {selectedExamStudent.status !== "Bajarilmagan" && (
            <section className="bg-slate-50 border border-gray-200 rounded-lg p-4">
              <div className="border border-sky-300 bg-sky-50 rounded-lg p-3 flex gap-3 text-sky-700 mb-6">
                <span className="w-6 h-6 shrink-0 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold">i</span>
                <p className="text-xs font-semibold leading-normal">
                  60-100 oralig'ida ball qo'yilgan imtihon 'Qabul qilingan', 0-59 oralig'ida ball qo'yilgan imtihon 'Qaytarilgan' hisoblanadi.
                </p>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-4">Ball</h3>
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={examScore}
                    disabled={isExamRecheckDisabled}
                    onChange={(event) => setExamScore(Number(event.target.value))}
                    className={`w-full h-2 rounded-full appearance-none ${isExamRecheckDisabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
                    style={{ background: isExamRecheckDisabled ? `linear-gradient(to right, #94a3b8 0%, #94a3b8 ${examScore}%, #e5e7eb ${examScore}%, #e5e7eb 100%)` : `linear-gradient(to right, #22c55e 0%, #22c55e ${examScore}%, #e5e7eb ${examScore}%, #e5e7eb 100%)` }}
                  />
                  <p className="absolute top-6 left-[60%] -translate-x-1/2 text-[10px] font-bold text-slate-500">O'tish bali</p>
                </div>
                <div className="w-12 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-base font-semibold text-slate-900">
                  {examScore}
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-3">Fayllar</h3>
              <label className={`h-32 border border-dashed rounded-lg flex flex-col items-center justify-center text-center px-4 mb-6 ${isExamRecheckDisabled ? "border-gray-300 bg-gray-55/50 cursor-not-allowed opacity-60" : "border-emerald-400 bg-emerald-50/20 cursor-pointer hover:bg-emerald-50/50 transition-colors"}`}>
                <input type="file" className="hidden" disabled={isExamRecheckDisabled} />
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" className={`${isExamRecheckDisabled ? "text-gray-400" : "text-emerald-500"} mb-2`} viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="m17 8-5-5-5 5" />
                  <path d="M12 3v12" />
                </svg>
                <p className="text-xs text-slate-900 mb-1">Faylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling</p>
                <p className="text-[10px] text-slate-400">.jpg, .png, .pdf, .mp4, .docs formatlaridan birida bo'lishi mumkin</p>
              </label>

              <div className="relative mb-4">
                <textarea 
                  value={examTeacherComment} 
                  disabled={isExamRecheckDisabled} 
                  onChange={(e) => setExamTeacherComment(e.target.value)} 
                  className={`w-full h-20 rounded-lg border border-gray-200 p-3 text-sm outline-none resize-none focus:border-emerald-400 ${isExamRecheckDisabled ? "bg-slate-50 cursor-not-allowed text-slate-500" : "bg-white"}`} 
                  placeholder={isExamRecheckDisabled ? "" : "Izohingiz"} 
                />
              </div>
            </section>
          )}

          <div className="flex justify-end gap-4 pb-2">
            <button type="button" onClick={() => setSelectedExamStudent(null)} className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-slate-500 hover:bg-gray-50">
              Bekor qilish
            </button>
            {selectedExamStudent.status !== "Bajarilmagan" && (
              <button 
                type="button" 
                disabled={isExamRecheckDisabled} 
                onClick={handleSaveExamGrade} 
                className={`px-5 py-2 rounded-lg text-white text-sm font-bold transition-colors ${isExamRecheckDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600"}`}
              >
                {isExamRecheckDisabled ? "Tekshirilgan" : "Saqlash"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (selectedExam) {
    const activeExamTabList = selectedExam.students?.[examCheckingTab] || [];
    
    return (
      <div className="bg-white p-6 rounded-[12px] border border-gray-200 shadow-sm min-h-[520px]">
        <button
          type="button"
          onClick={() => {
            setSelectedExam(null);
            setSelectedExamStudent(null);
            setExamCheckingTab("Kutayotganlar");
          }}
          className="flex items-center gap-4 text-lg font-extrabold text-slate-900 mb-7 hover:text-emerald-600 transition-colors"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="m15 18-6-6 6-6" />
          </svg>
          {selectedExam.title}
        </button>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <p className="text-[13px] font-bold text-slate-500 mb-2">Mavzu</p>
                <p className="text-base font-extrabold text-slate-900">{selectedExam.title}</p>
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-500 mb-2">Imtihon vaqti</p>
                <p className="text-base font-extrabold text-slate-900">{selectedExam.darsVaqti}</p>
              </div>
            </div>
            <div>
              <button
                type="button"
                className="px-5 py-2 border border-gray-200 bg-gray-100 text-gray-400 rounded-lg text-[13px] font-bold cursor-not-allowed"
                disabled
              >
                E'lon qilish
              </button>
            </div>
          </div>

          <div className="px-6 pt-8">
            <div className="flex gap-8 border-b border-gray-200">
              {["Kutayotganlar", "Qaytarilganlar", "Qabul qilinganlar", "Bajarilmagan"].map((tab) => {
                const count = selectedExam.students?.[tab]?.length || 0;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setExamCheckingTab(tab)}
                    className={`relative pb-4 text-sm font-bold transition-colors flex items-center gap-2 ${
                      examCheckingTab === tab ? "text-slate-900" : "text-slate-700 hover:text-emerald-600"
                    }`}
                  >
                    {tab}
                    {count > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#f59e0b] text-white text-[11px] font-extrabold min-w-[18px] inline-flex items-center justify-center">
                        {count}
                      </span>
                    )}
                    {examCheckingTab === tab && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-emerald-500" />}
                  </button>
                );
              })}
            </div>

            <div className="overflow-x-auto mt-7">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-sm font-bold text-slate-500">
                    <th className="py-4 px-3">O'quvchi ismi</th>
                    <th className="py-4 px-3">Topshirilgan vaqti</th>
                    <th className="py-4 px-3">Tekshirilgan vaqti</th>
                    <th className="py-4 px-3">Tugash vaqti</th>
                    <th className="py-4 px-3 text-right">Harakatlar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activeExamTabList.length > 0 ? (
                    activeExamTabList.map((student) => (
                      <tr
                        key={student.id}
                        onClick={() => {
                          setSelectedExamStudent(student);
                          setExamScore(student.grade || 60);
                          setExamTeacherComment(student.comment || "");
                        }}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-3 text-sm font-medium text-slate-900">{student.name}</td>
                        <td className="py-4 px-3 text-sm font-medium text-slate-900">{student.sentAt}</td>
                        <td className="py-4 px-3 text-sm font-medium text-slate-900">{student.checkedAt}</td>
                        <td className="py-4 px-3 text-sm font-medium text-slate-900">{student.deadline}</td>
                        <td className="py-4 px-3 text-right relative" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedExamStudent(student);
                              setExamScore(student.grade || 60);
                              setExamTeacherComment(student.comment || "");
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="5" r="1.7" />
                              <circle cx="12" cy="12" r="1.7" />
                              <circle cx="12" cy="19" r="1.7" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-10 text-center text-[14px] text-slate-500">
                        Bu bo'limda ma'lumot yo'q.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedStudent && selectedHomework) {
    const sentAt = formatDateTime(selectedStudent.sentAt);
    const isHomeworkChecked = (selectedStudent.status === "Qabul qilinganlar" || selectedStudent.status === "Qaytarilganlar" || selectedStudent.status === "Qabul qilingan" || selectedStudent.status === "Qaytarilgan");
    const isHomeworkRecheckDisabled = isHomeworkChecked && !isAllowedToRecheck;

    return (
      <div className="bg-white p-6 rounded-[12px] border border-gray-200 shadow-sm min-h-[620px] max-w-[748px]">
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

        <div className="space-y-4">
          <section className="bg-slate-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">Uy vazifasi</h3>
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <p className="text-xs text-slate-400 font-medium mb-2">Izoh:</p>
              <p className="text-sm font-medium text-slate-900">{selectedHomework.title || selectedHomework.lesson?.topic || "-"}</p>
            </div>
          </section>

          <section className="bg-slate-50 border border-gray-200 rounded-lg p-4">
            <h3 className="text-base font-extrabold text-slate-800 mb-4">{selectedStudent.name}</h3>

            <div className="bg-white border border-gray-100 rounded-lg p-4 grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Vaqti:</p>
                <p className="text-sm font-bold text-slate-900">{sentAt.date} {sentAt.time}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Fayllar soni:</p>
                <p className="text-sm font-bold text-slate-900">{selectedStudent.files}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Status:</p>
                <span className={`inline-flex px-2 py-0.5 rounded-md border text-xs font-semibold ${getStatusBadgeClasses(selectedStudent.status)}`}>
                  {selectedStudent.status}
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <p className="text-xs text-slate-500 mb-3">Fayl: <span className="font-extrabold text-slate-900">{selectedStudent.files}</span></p>
              <div className="flex gap-4 mb-4 overflow-x-auto">
                {Array.from({ length: selectedStudent.files }).map((_, index) => (
                  <a key={index} href={selectedStudent.fileUrl} target="_blank" rel="noopener noreferrer" className="w-32 h-20 shrink-0 bg-white border border-gray-200 shadow-sm overflow-hidden block hover:border-emerald-500 transition-colors">
                    <div className="h-4 bg-slate-100 border-b border-gray-200 flex items-center gap-1 px-2">
                      <span className="w-1 h-1 bg-violet-500 rounded-full" />
                      <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                      <span className="w-1 h-1 bg-red-500 rounded-full ml-auto" />
                    </div>
                    <div className="p-2 space-y-1.5">
                      <div className="h-1.5 bg-slate-200 rounded w-2/3" />
                      <div className="h-1.5 bg-slate-100 rounded w-full" />
                      <div className="h-1.5 bg-slate-100 rounded w-4/5" />
                      <div className="grid grid-cols-3 gap-1 pt-1">
                        <div className="h-4 bg-emerald-100 rounded" />
                        <div className="h-4 bg-slate-100 rounded" />
                        <div className="h-4 bg-blue-100 rounded" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="bg-slate-50 border-l-4 border-blue-500 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Uyga vazifa izohi:</p>
                <p className="text-sm font-bold text-slate-800 break-all">
                  {selectedStudent.answerNote || "Izoh qoldirilmagan"}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 border border-gray-200 rounded-lg p-4">
            <div className="border border-sky-300 bg-sky-50 rounded-lg p-3 flex gap-3 text-sky-700 mb-6">
              <span className="w-6 h-6 shrink-0 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold">i</span>
              <p className="text-xs font-semibold leading-normal">
                60-100 oralig'ida ball qo'yilgan vazifa 'Qabul qilingan', 0-59 oralig'ida ball qo'yilgan vazifa 'Qaytarilgan' hisoblanadi.
              </p>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mb-4">Ball</h3>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={score}
                  disabled={isHomeworkRecheckDisabled}
                  onChange={(event) => setScore(Number(event.target.value))}
                  className={`w-full h-2 rounded-full appearance-none ${isHomeworkRecheckDisabled ? "cursor-not-allowed opacity-75" : "cursor-pointer"}`}
                  style={{ background: isHomeworkRecheckDisabled ? `linear-gradient(to right, #94a3b8 0%, #94a3b8 ${score}%, #e5e7eb ${score}%, #e5e7eb 100%)` : `linear-gradient(to right, #22c55e 0%, #22c55e ${score}%, #e5e7eb ${score}%, #e5e7eb 100%)` }}
                />
                <p className="absolute top-6 left-[60%] -translate-x-1/2 text-[10px] font-bold text-slate-500">O'tish bali</p>
              </div>
              <div className="w-12 h-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-base font-semibold text-slate-900">
                {score}
              </div>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mb-3">Fayllar</h3>
            <label className={`h-32 border border-dashed rounded-lg flex flex-col items-center justify-center text-center px-4 mb-6 ${isHomeworkRecheckDisabled ? "border-gray-300 bg-gray-50/50 cursor-not-allowed opacity-60" : "border-emerald-400 bg-emerald-50/20 cursor-pointer hover:bg-emerald-50/50 transition-colors"}`}>
              <input type="file" className="hidden" disabled={isHomeworkRecheckDisabled} />
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3" className={`${isHomeworkRecheckDisabled ? "text-gray-400" : "text-emerald-500"} mb-2`} viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <path d="m17 8-5-5-5 5" />
                <path d="M12 3v12" />
              </svg>
              <p className="text-xs text-slate-900 mb-1">Faylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling</p>
              <p className="text-[10px] text-slate-400">.jpg, .png, .pdf, .mp4, .docs formatlaridan birida bo'lishi mumkin</p>
            </label>

            <div className="relative mb-4">
              <textarea 
                value={teacherComment} 
                disabled={isHomeworkRecheckDisabled} 
                onChange={(e) => setTeacherComment(e.target.value)} 
                className={`w-full h-20 rounded-lg border border-gray-200 p-3 text-sm outline-none resize-none focus:border-emerald-400 ${isHomeworkRecheckDisabled ? "bg-slate-50 cursor-not-allowed text-slate-500" : "bg-white"}`} 
                placeholder={isHomeworkRecheckDisabled ? "" : "Izohingiz"} 
              />
            </div>
          </section>

          <div className="flex justify-end gap-4 pb-2">
            <button type="button" onClick={() => setSelectedStudent(null)} className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-slate-500 hover:bg-gray-50">
              Bekor qilish
            </button>
            <button 
              type="button" 
              disabled={saving || isHomeworkRecheckDisabled} 
              onClick={handleGrade} 
              className={`px-5 py-2 rounded-lg text-white text-sm font-bold transition-colors ${isHomeworkRecheckDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50"}`}
            >
              {isHomeworkRecheckDisabled ? "Tekshirilgan" : (saving ? "Saqlanmoqda..." : "Saqlash")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedHomework) {
    const deadline = formatDateTime(addOneDay(selectedHomework.created_at));

    return (
      <div className="bg-white p-6 rounded-[12px] border border-gray-200 shadow-sm min-h-[520px]">
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
                      onClick={async () => {
                        setSelectedStudent(student);
                        setScore(student.grade || 60);
                        setTeacherComment("");
                        
                        try {
                          const token = localStorage.getItem("token");
                          const lessonId = selectedHomework.lesson?.id || selectedHomework.lesson_id;
                          const res = await fetch(`/api/v1/homework/group/${groupId}/lesson/${lessonId}/homework/${selectedHomework.id}/result/${student.id}`, {
                            headers: { "Authorization": `Bearer ${token}`, "accept": "*/*" }
                          });
                          const json = await res.json();
                          if (json.success && json.data) {
                            const d = json.data;
                            setSelectedStudent({
                              id: student.id,
                              name: student.name,
                              sentAt: d.created_at || student.sentAt,
                              files: d.file ? 1 : 0,
                              fileUrl: d.file ? `/files/homeworkAnswers/${d.file}` : null,
                              status: d.status || student.status,
                              answerNote: d.title || "",
                              answerId: d.id || student.answerId
                            });
                            if (d.grade !== null && d.grade !== undefined) {
                              setScore(d.grade);
                            }
                            if (d.comment !== null && d.comment !== undefined) {
                              setTeacherComment(d.comment);
                            }
                          }
                        } catch (err) {
                          console.error("Error loading student result detail:", err);
                        }
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
      <div className="bg-white p-6 rounded-[12px] border border-gray-200 shadow-sm min-h-[420px] max-w-[748px]">
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
            {lessons.filter(lesson => !homeworks.some(hw => (hw.lesson?.id || hw.lesson_id) === lesson.id)).map((lesson) => (
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
    <div className="bg-white p-6 rounded-[12px] border border-gray-200 shadow-sm min-h-[420px]">
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

        {activeSubTab === "Imtihonlar" && !isCreatingExam && (
          <button
            type="button"
            onClick={() => setIsCreatingExam(true)}
            className="px-4 py-2.5 bg-emerald-500 text-white text-[13px] font-bold rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Yangi imtihon
          </button>
        )}
      </div>

      {activeSubTab === "Videolar" ? (
        <CreateVideo groupId={groupId} />
      ) : activeSubTab === "Imtihonlar" ? (
        isCreatingExam ? (
          <div className="min-h-[420px]">
            <button
              type="button"
              onClick={() => { setIsCreatingExam(false); setExamForm({ lesson_id: "", title: "", deadline_date: "", deadline_time: "" }); setExamFile(null); }}
              className="flex items-center gap-3 text-base font-extrabold text-slate-900 mb-7 hover:text-emerald-600 transition-colors"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
              Imtihon yaratish
            </button>

            <div className="border border-sky-300 bg-sky-50 rounded-xl p-4 flex gap-3 text-sky-700 mb-8 max-w-[520px]">
              <span className="w-7 h-7 shrink-0 rounded-full bg-sky-600 text-white flex items-center justify-center text-sm font-bold">i</span>
              <p className="text-[13px] font-semibold leading-relaxed">Oxirgi 7 kundagi uyga vazifa berilmagan mavzularni tanlay olasiz!</p>
            </div>

            <div className="max-w-[520px]">
              <label className="block text-[13px] font-bold text-slate-900 mb-2">
                <span className="text-red-500">*</span> Mavzu
              </label>
              <select
                value={examForm.lesson_id}
                onChange={(e) => setExamForm(prev => ({ ...prev, lesson_id: e.target.value }))}
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
                  value={examForm.title}
                  onChange={(e) => setExamForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full h-[72px] resize-none px-3 py-2 text-[13px] text-slate-700 outline-none"
                  placeholder="Imtihon izohini kiriting"
                />
              </div>

              <label className="mt-12 mb-7 h-9 border border-dashed border-gray-200 rounded-lg text-[13px] font-semibold text-slate-500 flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-300 hover:text-emerald-600 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setExamFile(e.target.files?.[0] || null)}
                />
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <path d="m17 8-5-5-5 5" />
                  <path d="M12 3v12" />
                </svg>
                {examFile ? examFile.name : "Yuklash"}
              </label>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-[13px] font-bold text-slate-900 mb-2"><span className="text-red-500">*</span> Tugash sanasi</label>
                  <DatePicker
                    value={examForm.deadline_date}
                    onChange={(val) => setExamForm(prev => ({ ...prev, deadline_date: val }))}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-slate-900 mb-2"><span className="text-red-500">*</span> Tugash vaqti</label>
                  <input
                    type="time"
                    value={examForm.deadline_time}
                    onChange={(e) => setExamForm(prev => ({ ...prev, deadline_time: e.target.value }))}
                    className="w-full h-10 border border-gray-200 rounded-lg px-3 text-[13px] text-slate-600 outline-none focus:border-emerald-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => { setIsCreatingExam(false); setExamForm({ lesson_id: "", title: "", deadline_date: "", deadline_time: "" }); setExamFile(null); }}
                  className="px-5 py-2 border border-gray-200 rounded-lg text-[13px] font-bold text-slate-500 hover:bg-gray-50 transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleCreateExamSubmit}
                  className="px-5 py-2 bg-emerald-500 text-white rounded-lg text-[13px] font-bold hover:bg-emerald-600 transition-colors"
                >
                  E'lon qilish
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                    <svg className="inline text-red-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </th>
                  <th className="py-4 px-3 w-24 text-center">Status</th>
                  <th className="py-4 px-3 w-36">Dars vaqti</th>
                  <th className="py-4 px-3 w-36">Berilgan vaqt</th>
                  <th className="py-4 px-3 w-36">E'lon qilingan vaqti</th>
                  <th className="py-4 px-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {examsList.map((exam) => (
                  <tr
                    key={exam.id}
                    onClick={() => {
                      setSelectedExam(exam);
                      setExamCheckingTab("Kutayotganlar");
                    }}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  >
                    <td className="py-4 px-3 text-[13px] font-bold text-slate-900">{exam.id}</td>
                    <td className="py-4 px-3 text-[13px] font-bold text-emerald-600 hover:underline">{exam.title}</td>
                    <td className="py-4 px-3 text-[13px] font-bold text-slate-900 text-center">{exam.studentsCount || (exam.students ? Object.values(exam.students).flat().length : 0)}</td>
                    <td className="py-4 px-3 text-[13px] font-bold text-slate-900 text-center">
                      {exam.students ? exam.students.Qaytarilganlar.length : exam.failed}
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${
                        exam.status === "Faol"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {exam.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-[13px] font-semibold text-slate-800">
                      {exam.darsVaqti.includes("-") ? exam.darsVaqti.split(" - ")[0] : exam.darsVaqti}
                    </td>
                    <td className="py-4 px-3 text-[13px] font-semibold text-slate-800">
                      {exam.berilganVaqt}
                    </td>
                    <td className="py-4 px-3 text-[13px] font-semibold text-slate-800">
                      {exam.elonVaqti}
                    </td>
                    <td className="py-4 px-3 text-right relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setExamActionMenu(examActionMenu === exam.id ? null : exam.id); }}
                        className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="5" r="1.7" />
                          <circle cx="12" cy="12" r="1.7" />
                          <circle cx="12" cy="19" r="1.7" />
                        </svg>
                      </button>
                      {examActionMenu === exam.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 min-w-[150px]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert("Imtihon tahrirlash (Mock)");
                              setExamActionMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            Tahrirlash
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExamsList(prev => prev.filter(ex => ex.id !== exam.id));
                              setExamActionMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
                          >
                            O'chirish
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
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
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert 
          onClose={() => setNotification(prev => ({ ...prev, open: false }))} 
          severity={notification.severity} 
          variant="filled" 
          sx={{ 
            width: "100%", 
            bgcolor: notification.severity === "success" ? "#2e7d32" : undefined, 
            color: "#ffffff", 
            fontWeight: "bold",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            "& .MuiAlert-icon": {
              color: "#ffffff",
              fontSize: "22px"
            },
            "& .MuiIconButton-root": {
              color: "#ffffff"
            }
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
