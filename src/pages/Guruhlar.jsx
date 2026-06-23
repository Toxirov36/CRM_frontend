import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";

const DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba", "Yakshanba"];

const DAY_MAP = {
  "Dushanba": "MONDAY",
  "Seshanba": "TUESDAY",
  "Chorshanba": "WEDNESDAY",
  "Payshanba": "THURSDAY",
  "Juma": "FRIDAY",
  "Shanba": "SATURDAY",
  "Yakshanba": "SUNDAY",
};

const getPhotoUrl = (photo) => {
  if (!photo || photo === "null" || photo === "undefined") return null;
  if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
  return `http://localhost:3000/uploads/${photo}`;
};

const convertToDate = (dateObj) => {
  if (!dateObj) return null;
  
  if (dateObj.date) {
    return new Date(dateObj.date);
  }
  
  const year = dateObj.year || new Date().getFullYear();
  let monthIndex = 0;
  
  if (dateObj.month) {
    if (typeof dateObj.month === 'number') {
      monthIndex = dateObj.month - 1;
    } else if (typeof dateObj.month === 'string') {
      const monthMap = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11,
        'yanv': 0, 'fevr': 1, 'mart': 2, 'apr': 3, 'may': 4, 'iyun': 5,
        'iyul': 6, 'avg': 7, 'sen': 8, 'okt': 9, 'noy': 10, 'dek': 11
      };
      monthIndex = monthMap[dateObj.month] !== undefined ? monthMap[dateObj.month] : parseInt(dateObj.month) - 1;
    }
  }
  
  const day = dateObj.day ? parseInt(dateObj.day) : 1;
  const date = new Date(year, monthIndex, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

const WEEKDAY_MAP_UZ = {
  'MONDAY': 'Du',
  'TUESDAY': 'Se',
  'WEDNESDAY': 'Ch',
  'THURSDAY': 'Pa',
  'FRIDAY': 'Ju',
  'SATURDAY': 'Sh',
  'SUNDAY': 'Ya',
  'Dushanba': 'Du',
  'Seshanba': 'Se',
  'Chorshanba': 'Ch',
  'Payshanba': 'Pa',
  'Juma': 'Ju',
  'Shanba': 'Sh',
  'Yakshanba': 'Ya'
};

const formatWeekdays = (days) => {
  if (!days || !Array.isArray(days)) return "—";
  return days.map(d => WEEKDAY_MAP_UZ[d] || WEEKDAY_MAP_UZ[d.toUpperCase()] || d.substring(0, 2)).join("/");
};

const formatSingleDate = (dateVal) => {
  if (!dateVal) return "";
  const date = new Date(dateVal);
  if (isNaN(date.getTime())) return "";
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();
  const monthsUz = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  return `${day} ${monthsUz[monthIndex]}, ${year}`;
};

const formatDateRange = (start, end) => {
  const s = formatSingleDate(start);
  const e = formatSingleDate(end);
  if (s && e) return `${s} - ${e}`;
  if (s) return s;
  return "—";
};

function ExpandedContent({ g, onClose }) {
  const [activeTab, setActiveTab] = useState("Ma'lumotlar");
  const [panels, setPanels] = useState({ mentors: true, academics: false, params: true });
  const groupTeachersList = g.groupTeachers?.map(gt => gt.teacher).filter(Boolean) || (g.teachers ? [g.teachers] : []);
  const [showAllLessons, setShowAllLessons] = useState(false);

  const [selectedDayId, setSelectedDayId] = useState(null);
  const [attendanceTab, setAttendanceTab] = useState("Teacher");
  const [topicType, setTopicType] = useState("Boshqa");
  const [topicName, setTopicName] = useState("CRM groupinner full");
  const [studentsAttendance, setStudentsAttendance] = useState({ 1: true, 2: false });

  const [subTab, setSubTab] = useState("Uyga vazifa");
  const [isAddingHomework, setIsAddingHomework] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [checkingTab, setCheckingTab] = useState("Kutayotganlar");
  const [homeworkScore, setHomeworkScore] = useState(60);

  // API states for homework results
  const [homeworkResults, setHomeworkResults] = useState({ pending: [], completed: [], rejected: [], notSubmitted: [] });
  const [resultCounts, setResultCounts] = useState({ pending: 0, completed: 0, rejected: 0, notSubmitted: 0 });
  const [loadingResults, setLoadingResults] = useState(false);
  const [studentsWithSubmission, setStudentsWithSubmission] = useState([]);

  // Exam states
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [examActionMenu, setExamActionMenu] = useState(null);

  const exams = [
    { id: 7, title: "Examination", students: 12, failed: 0, status: "Faol", darsVaqti: "22 May, 2026 09:30", berilganVaqt: "22 May, 2026 09:28", elonVaqti: "-" },
    { id: 6, title: "Examination", students: 12, failed: 0, status: "Tugagan", darsVaqti: "24 Apr, 2026 09:30", berilganVaqt: "24 Apr, 2026 09:25", elonVaqti: "27 Apr, 2026 10:30" },
    { id: 5, title: "Examination", students: 14, failed: 0, status: "Tugagan", darsVaqti: "26 Mart, 2026 09:30", berilganVaqt: "26 Mart, 2026 09:23", elonVaqti: "30 Mart, 2026 14:34" },
    { id: 4, title: "Examination", students: 16, failed: 0, status: "Tugagan", darsVaqti: "26 Fev, 2026 09:30", berilganVaqt: "26 Fev, 2026 09:28", elonVaqti: "02 Mart, 2026 13:32" },
  ];

  const homeworks = [
    { id: 41, lesson_id: 1, title: "Youtube project added chat with socket.io", users: 18, pending: 0, completed: 11, assigned: "19 Yan, 2026 17:20", deadline: "20 Yan, 2026 09:20", date: "19 Yan, 2026" },
    { id: 42, lesson_id: 1, title: "socket.io", users: 18, pending: 0, completed: 7, assigned: "16 Yan, 2026 13:33", deadline: "17 Yan, 2026 05:33", date: "16 Yan, 2026" },
    { id: 43, lesson_id: 1, title: "UncaughtException and UnhandledRejection Concepts. Logging Concepts. Winston Logger.", users: 18, pending: 0, completed: 10, assigned: "15 Yan, 2026 15:23", deadline: "16 Yan, 2026 07:23", date: "15 Yan, 2026" },
    { id: 44, lesson_id: 1, title: "Sending Emails in Node.js (Gmail Setup, Nodemailer). User Activation via Email Confirmation.", users: 18, pending: 0, completed: 8, assigned: "14 Yan, 2026 15:04", deadline: "15 Yan, 2026 07:04", date: "14 Yan, 2026" },
    { id: 45, lesson_id: 1, title: "Applying Access and Refresh Token, Bcrypt, Validator, Middleware, Router, and Other Concepts in a Real Project.", users: 18, pending: 0, completed: 9, assigned: "12 Yan, 2026 13:06", deadline: "13 Yan, 2026 05:06", date: "12 Yan, 2026" },
  ];

  const groupVideos = [
    { id: 1, name: "108.2.mov", dars_nomi: "crm homework cheking frontend", status: "Tayyor", sana: "15 May, 2026", hajmi: "436.08 MB", vaqt: "18 May, 2026" },
    { id: 2, name: "108.1.mov", dars_nomi: "crm homework cheking frontend", status: "Tayyor", sana: "15 May, 2026", hajmi: "1.9 GB", vaqt: "18 May, 2026" },
    { id: 3, name: "107.1.mov", dars_nomi: "crm backend homework checking", status: "Tayyor", sana: "14 May, 2026", hajmi: "1.77 GB", vaqt: "14 May, 2026" },
    { id: 4, name: "107.2.mov", dars_nomi: "crm backend homework checking", status: "Tayyor", sana: "14 May, 2026", hajmi: "975.08 MB", vaqt: "14 May, 2026" },
    { id: 5, name: "106.1.mov", dars_nomi: "crm homework, full backend, frontend qilish", status: "Tayyor", sana: "13 May, 2026", hajmi: "1.53 GB", vaqt: "13 May, 2026" },
    { id: 6, name: "106.2.mov", dars_nomi: "crm homework, full backend, frontend qilish", status: "Tayyor", sana: "13 May, 2026", hajmi: "1014.64 MB", vaqt: "13 May, 2026" },
    { id: 7, name: "105.2.mov", dars_nomi: "NajotEdu crm backend schedule and attendance", status: "Tayyor", sana: "12 May, 2026", hajmi: "36.73 MB", vaqt: "12 May, 2026" },
    { id: 8, name: "105.3.mov", dars_nomi: "NajotEdu crm backend schedule and attendance", status: "Tayyor", sana: "12 May, 2026", hajmi: "1.02 GB", vaqt: "12 May, 2026" },
    { id: 9, name: "105.1.mov", dars_nomi: "NajotEdu crm backend schedule and attendance", status: "Tayyor", sana: "12 May, 2026", hajmi: "1.4 GB", vaqt: "12 May, 2026" },
  ];

  const toggleAttendance = (id) => {
    setStudentsAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePanel = (panel) => {
    setPanels(p => ({ ...p, [panel]: !p[panel] }));
  };

  const schedules = [
    { id: 1, name: "Sultonqulov Abduxoshim", days: "Du/Se/Ch/Pa/Ju", time: "09:30 dan - 12:30 gacha", dateRange: "15 Yan, 2026 - 27 Iyun, 2026", group: "F2 Autodesk // 18" },
    { id: 2, name: "+++Yusupova Barchinoy", days: "Du/Se/Ch/Pa/Ju", time: "08:00 dan - 09:30 gacha", dateRange: "15 Yan, 2026 - 27 Iyun, 2026", group: "F2 Autodesk // 18" },
  ];

  const [courseMonth, setCourseMonth] = useState("1");
  const [schedulesData, setSchedulesData] = useState({});
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/v1/groups/${g.id}/schedules`, {
          headers: {
            "accept": "*/*",
            "Authorization": `Bearer ${token}`
          }
        });
        const json = await res.json();
        if (json.success && json.data) {
          const sData = json.data;
          setSchedulesData(sData);
          
          let defaultMonthKey = null;
          let defaultDayId = null;
          
          if (sData && Object.keys(sData).length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const allLessons = [];
            for (const monthKey of Object.keys(sData)) {
              const monthLessons = sData[monthKey] || [];
              monthLessons.forEach((lesson, index) => {
                const date = convertToDate(lesson);
                if (date) {
                  allLessons.push({
                    monthKey,
                    index,
                    date
                  });
                }
              });
            }
            
            allLessons.sort((a, b) => a.date.getTime() - b.date.getTime());
            
            const todayMatch = allLessons.find(item => item.date.getTime() === today.getTime());
            const nextMatch = allLessons.find(item => item.date.getTime() > today.getTime());
            
            if (todayMatch) {
              defaultMonthKey = todayMatch.monthKey;
              defaultDayId = todayMatch.index + 1;
            } else if (nextMatch) {
              defaultMonthKey = nextMatch.monthKey;
              defaultDayId = nextMatch.index + 1;
            } else {
              const months = Object.keys(sData).sort((a, b) => Number(a) - Number(b));
              defaultMonthKey = months.includes("1") ? "1" : months[0];
              defaultDayId = 1;
            }
          }
          
          if (defaultMonthKey) {
            setCourseMonth(defaultMonthKey);
          }
          if (defaultDayId) {
            setSelectedDayId(defaultDayId);
          }
        }
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };
    if (g && g.id) {
      fetchSchedules();
    }
  }, [g]);

  useEffect(() => {
    if (schedulesData[courseMonth]) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const formattedDays = schedulesData[courseMonth].map((d, i) => {
        const dayDate = convertToDate(d);
        const isPast = dayDate < today;

        return {
          id: i + 1,
          month: d.month,
          day: d.day,
          active: isPast // o'tgan kunlar kulrang, bugun va kelajak oq rangda
        };
      });
      setCalendarDays(formattedDays);
    } else {
      setCalendarDays([]);
    }
  }, [courseMonth, schedulesData]);

  // Load homework results when homework is selected
  useEffect(() => {
    if (selectedHomework && activeTab === "Guruh darsliklari") {
      const loadResults = async () => {
        setLoadingResults(true);
        try {
          const token = localStorage.getItem("token");

          // Fetch pending students
          const pendingRes = await fetch(`/api/v1/homework/group/${g.id}/homework/${selectedHomework.id}/results?status=pending`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const pendingData = await pendingRes.json();
          const pendingStudents = (pendingData.success && pendingData.data?.students)
            ? pendingData.data.students.map(s => ({
              id: s.id,
              name: `${s.first_name} ${s.last_name}`,
              time: new Date().toLocaleDateString("uz-UZ"),
              status: "pending",
              files: 0
            })) : [];

          // Fetch completed students
          const completedRes = await fetch(`/api/v1/homework/group/${g.id}/homework/${selectedHomework.id}/results?status=completed`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const completedData = await completedRes.json();
          const completedStudents = (completedData.success && completedData.data?.students)
            ? completedData.data.students.map(s => ({
              id: s.id,
              name: `${s.first_name} ${s.last_name}`,  // ✅ ...s emas
              time: new Date().toLocaleDateString("uz-UZ"),
              status: "completed",
              files: 0
            })) : [];

          // Fetch rejected students
          const rejectedRes = await fetch(`/api/v1/homework/group/${g.id}/homework/${selectedHomework.id}/results?status=rejected`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const rejectedData = await rejectedRes.json();
          const rejectedStudents = (rejectedData.success && rejectedData.data?.students)
            ? rejectedData.data.students.map(s => ({
              id: s.id,
              name: `${s.first_name} ${s.last_name}`,  // ✅ ...s emas
              time: new Date().toLocaleDateString("uz-UZ"),
              status: "rejected",
              files: 0
            })) : [];

          // Fetch not submitted students
          const notSubmittedRes = await fetch(`/api/v1/homework/group/${g.id}/homework/${selectedHomework.id}/results`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const notSubmittedData = await notSubmittedRes.json();
          const notSubmittedStudents = (notSubmittedData.success && notSubmittedData.data?.students)
            ? notSubmittedData.data.students.map(s => ({
              id: s.id,
              name: `${s.first_name} ${s.last_name}`,  // ✅ ...s emas
              time: new Date().toLocaleDateString("uz-UZ"),
              status: "notSubmitted",
              files: 0
            })) : [];
            
          setResultCounts({
            pending: pendingStudents.length,
            completed: completedStudents.length,
            rejected: rejectedStudents.length,
            notSubmitted: notSubmittedStudents.length
          });

          setHomeworkResults({
            pending: pendingStudents,
            completed: completedStudents,
            rejected: rejectedStudents,
            notSubmitted: notSubmittedStudents
          });

          // Set initial students for current tab
          const tabStatusMap = {
            "Kutayotganlar": pendingStudents,
            "Qaytarilganlar": rejectedStudents,
            "Qabul qilinganlar": completedStudents,
            "Bajarilmagan": notSubmittedStudents
          };
          setStudentsWithSubmission(tabStatusMap[checkingTab] || []);
        } catch (err) {
          console.error("Error loading homework results:", err);
        } finally {
          setLoadingResults(false);
        }
      };

      loadResults();
    }
  }, [selectedHomework, activeTab, g.id, checkingTab]);

  // Update displayed students when checking tab changes
  useEffect(() => {
    if (selectedHomework) {
      const tabStatusMap = {
        "Kutayotganlar": homeworkResults.pending,
        "Qaytarilganlar": homeworkResults.rejected,
        "Qabul qilinganlar": homeworkResults.completed,
        "Bajarilmagan": homeworkResults.notSubmitted
      };

      setStudentsWithSubmission(tabStatusMap[checkingTab] || []);
    }
  }, [checkingTab, selectedHomework, homeworkResults]);

  return (
    <div className="p-6 md:p-8 animate-in slide-in-from-top-2 duration-300 ease-out">
      {/* Accordion Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 mr-2 transition-colors">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <h3 className="text-xl font-extrabold text-slate-800">{g.name}</h3>
          {(g.isActive ?? g.status === "ACTIVE") && (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-green-50 text-green-500 border border-green-100 tracking-wide uppercase">
              Aktiv
            </span>
          )}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-white shadow-sm transition-all active:scale-95 bg-gray-50">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
          Statistika
        </button>
      </div>

      {/* Accordion Tabs */}
      <div className="flex gap-8 border-b border-gray-200/60 mb-6 overflow-x-auto custom-scrollbar">
        {["Ma'lumotlar", "Guruh darsliklari", "Akademik davomati"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold whitespace-nowrap relative transition-colors ${activeTab === tab ? "text-emerald-500" : "text-slate-400 hover:text-slate-600"}`}
          >
            {tab}
            {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-emerald-500 rounded-t-full" />}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Ma'lumotlar" && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Col - Mentors */}
            <div className="border border-[#2D78D2]/20 rounded-2xl overflow-hidden bg-white shadow-sm transition-all">
              <button
                onClick={() => togglePanel("mentors")}
                className="w-full bg-[#2D78D2] px-5 py-3 flex items-center justify-between text-white select-none hover:bg-[#2567c5] transition-colors"
              >
                <h4 className="font-bold text-sm">Guruh mentorlari</h4>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={`transition-transform duration-300 ${panels.mentors ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${panels.mentors ? "max-h-[500px]" : "max-h-0"}`}>
                <div className="p-6 space-y-4">
                  {(() => {
                    const groupTeachersList = g.groupTeachers?.map(gt => gt.teacher).filter(Boolean) || (g.teachers ? [g.teachers] : []);
                    if (groupTeachersList.length === 0) {
                      return <p className="text-sm text-slate-500 text-center py-4">O'qituvchi topilmadi</p>;
                    }
                    return groupTeachersList.map((t, index) => (
                      <div key={t.id || index} className="flex items-center gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-white font-bold text-lg overflow-hidden border-2 border-slate-300">
                          <img 
                            src={getPhotoUrl(t.photo) || `https://ui-avatars.com/api/?name=${t.first_name || ""} ${t.last_name || ""}&background=random`} 
                            alt="teacher" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${t.first_name || ""}+${t.last_name || ""}&background=random`;
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wide">
                            Teacher {groupTeachersList.length > 1 ? `#${index + 1}` : ""}
                          </p>
                          <p className="text-sm font-bold text-slate-800">{t.first_name || "—"} {t.last_name || ""}</p>
                          <p className="text-[11px] text-slate-400">{t.email || "—"}</p>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            {/* Right Col - Parameters */}
            <div className="border border-[#2D78D2]/20 rounded-2xl overflow-hidden bg-white shadow-sm transition-all">
              <button
                onClick={() => togglePanel("params")}
                className="w-full bg-[#2D78D2] px-5 py-3 flex items-center justify-between text-white select-none hover:bg-[#2567c5] transition-colors"
              >
                <h4 className="font-bold text-sm">Parametrlar</h4>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className={`transition-transform duration-300 ${panels.params ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${panels.params ? "max-h-[1000px]" : "max-h-0"}`}>
                <div className="p-5">
                  <table className="w-full text-[13px]">
                    <tbody className="divide-y divide-gray-100/60">
                      <tr><td className="py-2.5 text-slate-500 font-medium">Kurs:</td><td className="py-2.5 text-right font-bold text-slate-800">{g.courses?.name || "—"}</td></tr>
                      <tr><td className="py-2.5 text-slate-500 font-medium">O'rta yosh:</td><td className="py-2.5 text-right font-bold text-slate-800">—</td></tr>
                      <tr><td className="py-2.5 text-slate-500 font-medium">O'quvchilar sig'imi:</td><td className="py-2.5 text-right font-bold text-slate-800">{g.max_student || "—"}</td></tr>
                      <tr><td className="py-2.5 text-slate-500 font-medium">Mavjud o'quvchilar:</td><td className="py-2.5 text-right font-bold text-slate-800">{Array.isArray(g.students) ? g.students.length : (g.students || 0)}</td></tr>
                      <tr><td className="py-2.5 text-slate-500 font-medium">O'quv oyidagi darslar soni:</td><td className="py-2.5 text-right font-bold text-slate-800">{schedulesData[courseMonth]?.length || "—"}</td></tr>
                      <tr><td className="py-2.5 text-slate-500 font-medium">Kurs davomiyligi (oy):</td><td className="py-2.5 text-right font-bold text-slate-800">{g.courses?.duration_month || "—"} oy</td></tr>
                      <tr><td className="py-2.5 text-slate-500 font-medium border-b-0">Jami darslar soni:</td><td className="py-2.5 text-right font-bold text-slate-800 border-b-0">{Object.values(schedulesData).reduce((sum, arr) => sum + arr.length, 0) || "—"}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar + Dars jadvali section */}
          <div className="mt-8 animate-in fade-in duration-300">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={() => {
                    const months = Object.keys(schedulesData).sort((a, b) => Number(a) - Number(b));
                    const currentIndex = months.indexOf(courseMonth);
                    if (currentIndex > 0) setCourseMonth(months[currentIndex - 1]);
                  }}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-slate-500 hover:bg-gray-50 transition-colors active:scale-95"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <span className="text-[13px] font-extrabold text-slate-700">{courseMonth}-o'quv oyi</span>
                <button
                  onClick={() => {
                    const months = Object.keys(schedulesData).sort((a, b) => Number(a) - Number(b));
                    const currentIndex = months.indexOf(courseMonth);
                    if (currentIndex < months.length - 1 && currentIndex !== -1) setCourseMonth(months[currentIndex + 1]);
                  }}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-slate-500 hover:bg-gray-50 transition-colors active:scale-95"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
                {calendarDays.map(day => (
                  <div
                    key={day.id}
                    onClick={() => setSelectedDayId(selectedDayId === day.id ? null : day.id)}
                    className={`shrink-0 w-[52px] h-[60px] rounded-[14px] flex flex-col items-center justify-center transition-colors cursor-pointer select-none
                      ${selectedDayId === day.id
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                        : day.active
                          ? "bg-[#E6E8EA] text-slate-700 hover:bg-gray-300/60"
                          : "bg-white border border-gray-100 text-slate-500 hover:border-gray-200"}
                    `}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedDayId === day.id ? "text-emerald-50" : ""}`}>{day.month}</span>
                    <span className="text-[15px] font-extrabold mt-0.5">{day.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {!selectedDayId ? (
              <div className="animate-in fade-in duration-300">
                <h2 className="text-[15px] font-extrabold text-slate-800 mb-5">Dars jadvali</h2>
                <div className="space-y-3">
                  {(() => {
                    const allLessons = [];
                    let lessonCounter = 1;
                    const sortedMonths = Object.keys(schedulesData).sort((a, b) => Number(a) - Number(b));
                    for (const monthKey of sortedMonths) {
                      const monthLessons = schedulesData[monthKey] || [];
                      monthLessons.forEach((lesson) => {
                        allLessons.push({
                          ...lesson,
                          id: lessonCounter++,
                          dateObj: convertToDate(lesson)
                        });
                      });
                    }
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const upcomingLessons = allLessons.filter(l => l.dateObj && l.dateObj.getTime() >= today.getTime());

                    if (!showAllLessons) {
                      return groupTeachersList.length > 0 ? (
                        groupTeachersList.map((t, idx) => (
                          <div key={t.id || idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50/70 rounded-xl border border-gray-100/60 hover:bg-slate-50 transition-colors gap-4">
                            <div className="text-[13px] font-bold text-[#00B2FF] flex-1">
                              {`${t.first_name || ""} ${t.last_name || ""}`.trim() || "—"}
                            </div>
                            <div className="text-[13px] font-semibold text-slate-700 flex-1 md:text-center">
                              {formatWeekdays(g.week_day)}
                            </div>
                            <div className="text-[13px] font-semibold text-slate-700 flex-1 md:text-center whitespace-nowrap">
                              {g.start_time ? `${g.start_time} dan` : "—"} {g.end_time ? `- ${g.end_time} gacha` : ""}
                            </div>
                            <div className="text-[13px] font-semibold text-slate-700 flex-1 md:text-center whitespace-nowrap">
                              {formatDateRange(g.start_date, g.end_date)}
                            </div>
                            <div className="text-[13px] font-bold text-slate-700 flex-1 md:text-right">
                              {g.rooms?.name || "—"}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50/70 rounded-xl border border-gray-100/60 hover:bg-slate-50 transition-colors gap-4">
                          <div className="text-[13px] font-bold text-slate-400 flex-1">
                            O'qituvchi biriktirilmagan
                          </div>
                          <div className="text-[13px] font-semibold text-slate-700 flex-1 md:text-center">
                            {formatWeekdays(g.week_day)}
                          </div>
                          <div className="text-[13px] font-semibold text-slate-700 flex-1 md:text-center whitespace-nowrap">
                            {g.start_time ? `${g.start_time} dan` : "—"} {g.end_time ? `- ${g.end_time} gacha` : ""}
                          </div>
                          <div className="text-[13px] font-semibold text-slate-700 flex-1 md:text-center whitespace-nowrap">
                            {formatDateRange(g.start_date, g.end_date)}
                          </div>
                          <div className="text-[13px] font-bold text-slate-700 flex-1 md:text-right">
                            {g.rooms?.name || "—"}
                          </div>
                        </div>
                      );
                    } else {
                      return upcomingLessons.length > 0 ? (
                        upcomingLessons.map((l) => (
                          <div key={l.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-emerald-50/30 rounded-xl border border-emerald-100 hover:bg-emerald-50/50 transition-colors gap-4">
                            <div className="text-[13px] font-bold text-emerald-600 flex-1">
                              Dars #{l.id}
                            </div>
                            <div className="text-[13px] font-semibold text-slate-700 flex-1 md:text-center">
                              {l.dateObj ? ['Yak', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'][l.dateObj.getDay()] : "—"}
                            </div>
                            <div className="text-[13px] font-semibold text-slate-700 flex-1 md:text-center whitespace-nowrap">
                              {g.start_time ? `${g.start_time} dan` : "—"} {g.end_time ? `- ${g.end_time} gacha` : ""}
                            </div>
                            <div className="text-[13px] font-semibold text-slate-700 flex-1 md:text-center whitespace-nowrap">
                              {formatSingleDate(l.dateObj)}
                            </div>
                            <div className="text-[13px] font-bold text-slate-700 flex-1 md:text-right">
                              {g.rooms?.name || "—"}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-500 text-sm">
                          Kelajakda boladigan darslar mavjud emas
                        </div>
                      );
                    }
                  })()}
                </div>
                <div className="mt-5 flex justify-center">
                  {(() => {
                    const allLessons = [];
                    let lessonCounter = 1;
                    const sortedMonths = Object.keys(schedulesData).sort((a, b) => Number(a) - Number(b));
                    for (const monthKey of sortedMonths) {
                      const monthLessons = schedulesData[monthKey] || [];
                      monthLessons.forEach((lesson) => {
                        allLessons.push({
                          ...lesson,
                          id: lessonCounter++,
                          dateObj: convertToDate(lesson)
                        });
                      });
                    }
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const upcomingLessons = allLessons.filter(l => l.dateObj && l.dateObj.getTime() >= today.getTime());

                    return upcomingLessons.length > 0 ? (
                      <button 
                        onClick={() => setShowAllLessons(!showAllLessons)}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-slate-600 hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        {showAllLessons ? "Yopish" : `Yana ko'rsatish (${upcomingLessons.length})`}
                      </button>
                    ) : null;
                  })()}
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 border-t border-gray-100 pt-6">
                <div className="flex gap-6 border-b border-gray-100 mb-6">
                  {["Assistant", "Teacher"].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setAttendanceTab(tab)}
                      className={`pb-3 text-sm font-bold relative transition-colors ${attendanceTab === tab ? "text-emerald-500" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {tab}
                      {attendanceTab === tab && <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-emerald-500 rounded-t-full" />}
                    </button>
                  ))}
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 mb-8 w-fit min-w-[400px]">
                  <h4 className="font-extrabold text-sm text-slate-800 mb-4">Ma'lumot</h4>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white">
                      <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Sultonqulov Abduxoshim</p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">Teacher</p>
                    </div>
                  </div>
                  <div className="flex gap-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm overflow-x-auto custom-scrollbar">
                    <div className="shrink-0">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">Dars kuni</p>
                      <p className="text-xs font-bold text-slate-700">{calendarDays.find(d => d.id === selectedDayId)?.day} {calendarDays.find(d => d.id === selectedDayId)?.month}, 2026</p>
                    </div>
                    <div className="shrink-0">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">Dars vaqti</p>
                      <p className="text-xs font-bold text-slate-700">09:30 - 12:30</p>
                    </div>
                    <div className="shrink-0">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">Filial</p>
                      <p className="text-xs font-bold text-slate-700">Chilonzor</p>
                    </div>
                    <div className="shrink-0">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">Xona</p>
                      <p className="text-xs font-bold text-slate-700">{g.rooms?.name || "F2 Autodesk // 18"}</p>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="text-[10px] font-bold text-slate-400 uppercase border-b border-gray-100">
                        <th className="py-3 px-4 w-12">#</th>
                        <th className="py-3 px-4">O'quvchi ismi</th>
                        <th className="py-3 px-4 w-32">Vaqti</th>
                        <th className="py-3 px-4 w-24">Keldi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 text-xs font-bold text-slate-700">1</td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-700">Abdugapparova Nozima</td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-700">09:30</td>
                        <td className="py-4 px-4">
                          <div onClick={() => toggleAttendance(1)} className={`w-10 h-5 rounded-full p-0.5 cursor-pointer flex transition-colors ${studentsAttendance[1] ? "bg-emerald-400 justify-end" : "bg-gray-200 justify-start"}`}>
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                          </div>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 text-xs font-bold text-slate-700">2</td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-700">Abduqulov Mirsaid</td>
                        <td className="py-4 px-4 text-xs font-bold text-slate-700">09:30</td>
                        <td className="py-4 px-4">
                          <div onClick={() => toggleAttendance(2)} className={`w-10 h-5 rounded-full p-0.5 cursor-pointer flex transition-colors ${studentsAttendance[2] ? "bg-emerald-400 justify-end" : "bg-gray-200 justify-start"}`}>
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "Guruh darsliklari" && (
        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm p-6 mt-2">

          {/* Sub-tabs Header */}
          <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-6">
              <h2 className="text-[15px] font-extrabold text-slate-800">
                Guruh darsliklari
              </h2>

              <div className="flex bg-slate-50/80 p-1 rounded-[10px] border border-gray-100/50">
                {["Uyga vazifa", "Videolar", "Imtihonlar", "Jurnal"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setSubTab(tab);
                      setIsAddingHomework(false);
                      setSelectedHomework(null);
                      setSelectedSubmission(null);
                      setIsAddingExam(false);
                      setExamActionMenu(null);
                    }}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${subTab === tab ? "bg-white text-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)]" : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {subTab === "Uyga vazifa" && !isAddingHomework && !selectedHomework && (
              <button
                onClick={() => setIsAddingHomework(true)}
                className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
              >
                Uyga vazifa qo'shish
              </button>
            )}

            {subTab === "Videolar" && (
              <button
                className="px-5 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
              >
                Qo'shish
              </button>
            )}

            {subTab === "Imtihonlar" && !isAddingExam && (
              <button
                onClick={() => setIsAddingExam(true)}
                className="px-5 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors shadow-[0_2px_10px_rgba(16,185,129,0.3)]"
              >
                Yangi imtihon
              </button>
            )}
          </div>


          {/* Uyga Vazifa Tab (Asosiy ro'yxat) */}
          {subTab === "Uyga vazifa" && !isAddingHomework && !selectedHomework && (
            <div className="overflow-x-auto animate-in fade-in duration-300">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 border-b border-gray-100">
                    <th className="py-4 px-2 w-10">#</th>
                    <th className="py-4 px-2">Mavzu</th>
                    <th className="py-4 px-2 w-12 text-center text-slate-400">
                      <svg className="inline" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </th>
                    <th className="py-4 px-2 w-12 text-center text-yellow-500">
                      <svg className="inline" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    </th>
                    <th className="py-4 px-2 w-12 text-center text-emerald-500">
                      <svg className="inline" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
                    </th>
                    <th className="py-4 px-2 w-32">Berilgan vaqt</th>
                    <th className="py-4 px-2 w-32">Tugash vaqti</th>
                    <th className="py-4 px-2 w-28">Dars sanasi</th>
                    <th className="py-4 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {homeworks.map((hw, i) => (
                    <tr key={hw.id} onClick={() => setSelectedHomework(hw)} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                      <td className="py-4 px-2 text-[13px] font-bold text-slate-500">{hw.id}</td>
                      <td className="py-4 px-2 text-[13px] font-bold text-slate-800 pr-8 leading-snug">{hw.title}</td>
                      <td className="py-4 px-2 text-[13px] font-bold text-slate-700 text-center">{hw.users}</td>
                      <td className="py-4 px-2 text-[13px] font-bold text-slate-700 text-center">{hw.pending}</td>
                      <td className="py-4 px-2 text-[13px] font-bold text-slate-700 text-center">{hw.completed}</td>
                      <td className="py-4 px-2 text-[13px] font-semibold text-slate-600">
                        {hw.assigned.split(" ")[0]} {hw.assigned.split(" ")[1]} <br /> <span className="text-slate-400">{hw.assigned.split(" ")[2]}</span>
                      </td>
                      <td className="py-4 px-2 text-[13px] font-semibold text-slate-600">
                        {hw.deadline.split(" ")[0]} {hw.deadline.split(" ")[1]} <br /> <span className="text-slate-400">{hw.deadline.split(" ")[2]}</span>
                      </td>
                      <td className="py-4 px-2 text-[13px] font-semibold text-slate-600">{hw.date}</td>
                      <td className="py-4 px-2 text-right">
                        <button className="text-slate-400 hover:text-slate-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Homework Checking View (Image 1) */}
          {subTab === "Uyga vazifa" && selectedHomework && !selectedSubmission && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              <button
                onClick={() => setSelectedHomework(null)}
                className="flex items-center gap-2 text-slate-800 font-extrabold text-lg mb-8 transition-colors hover:text-emerald-600"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
                {selectedHomework.title}
              </button>

              <div className="bg-slate-50/50 rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="flex gap-16">
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">Mavzu</p>
                    <p className="text-[15px] font-extrabold text-slate-800">{selectedHomework.title}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1">Tugash vaqti</p>
                    <p className="text-[15px] font-bold text-slate-800">{selectedHomework.deadline}</p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-8 border-b border-gray-100 mb-6 px-2">
                {[
                  { name: "Kutayotganlar", countKey: "pending" },
                  { name: "Qaytarilganlar", countKey: "rejected" },
                  { name: "Qabul qilinganlar", countKey: "completed" },
                  { name: "Bajarilmagan", countKey: "notSubmitted" },
                ].map(tab => (
                  <button
                    key={tab.name}
                    onClick={() => setCheckingTab(tab.name)}
                    className={`pb-3 text-[13px] font-bold relative transition-colors flex items-center gap-2 ${checkingTab === tab.name ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {tab.name}
                    {tab.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${checkingTab === tab.name ? "bg-yellow-400 text-yellow-900" : "bg-yellow-100 text-yellow-700"}`}>
                        {resultCounts[tab.countKey]}
                      </span>
                    )}
                    {checkingTab === tab.name && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-500 rounded-t-full" />}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs font-bold text-slate-400 border-b border-gray-100">
                      <th className="py-4 px-4 w-1/2">O'quvchi ismi</th>
                      <th className="py-4 px-4 w-1/2">Uyga vazifa jo'natilgan vaqt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {studentsWithSubmission.map(student => (
                      <tr key={student.id} onClick={async () => {
                        setSelectedSubmission(student);
                        try {
                          const token = localStorage.getItem("token");
                          const lessonId = selectedHomework.lesson_id || selectedHomework.lesson?.id || 1;
                          const res = await fetch(`/api/v1/homework/group/${g.id}/lesson/${lessonId}/homework/${selectedHomework.id}/result/${student.id}`, {
                            headers: { "Authorization": `Bearer ${token}`, "accept": "*/*" }
                          });
                          const json = await res.json();
                          if (json.success && json.data) {
                            const d = json.data;
                            setSelectedSubmission({
                              id: student.id,
                              name: student.name,
                              time: d.created_at || student.time,
                              files: d.file ? 1 : 0,
                              fileUrl: d.file ? `/files/homeworkAnswers/${d.file}` : null,
                              status: d.status || student.status,
                              answerNote: d.title || ""
                            });
                            if (d.grade !== null && d.grade !== undefined) {
                              setHomeworkScore(d.grade);
                            }
                          }
                        } catch (err) {
                          console.error("Error loading submission details:", err);
                        }
                      }} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                        <td className="py-4 px-4 text-[13px] font-bold text-slate-700 group-hover:text-emerald-600 transition-colors">{student.name}</td>
                        <td className="py-4 px-4 text-[13px] font-semibold text-slate-600">{student.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Student Submission Grading View (Image 2 & 3) */}
          {subTab === "Uyga vazifa" && selectedHomework && selectedSubmission && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-[15px] mb-8">
                <button onClick={() => setSelectedSubmission(null)} className="hover:text-emerald-600 transition-colors">
                  {checkingTab}
                </button>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-400" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
                <span className="text-slate-500">Uyga vazifa</span>
              </div>
              <div className="max-w-2xl space-y-4">
                {/* Uy vazifasi */}
                <div className="bg-slate-50/50 rounded-2xl border border-gray-100 p-4">
                  <h3 className="text-[13px] font-extrabold text-slate-800 mb-2">Uy vazifasi</h3>
                  <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
                    <p className="text-[11px] font-semibold text-slate-400 mb-1">Izoh:</p>
                    <p className="text-[13px] font-semibold text-slate-800">{selectedHomework.title}</p>
                  </div>
                </div>

                {/* Student Info */}
                <div className="bg-slate-50/50 rounded-2xl border border-gray-100 p-4">
                  <h3 className="text-[15px] font-extrabold text-slate-800 mb-4">{selectedSubmission.name}</h3>

                  <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm flex items-center gap-8 mb-4">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 mb-0.5">Vaqti:</p>
                      <p className="text-[13px] font-extrabold text-slate-800">{selectedSubmission.time}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 mb-0.5">Fayllar soni:</p>
                      <p className="text-[13px] font-extrabold text-slate-800">{selectedSubmission.files}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 mb-0.5">Status:</p>
                      <span className="inline-block px-2.5 py-0.5 bg-yellow-50 border border-yellow-200 text-yellow-600 text-[10px] font-extrabold rounded-md">
                        {selectedSubmission.status}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm">
                    <p className="text-[13px] font-semibold text-slate-500 mb-3">Fayl: <span className="font-extrabold text-slate-800">{selectedSubmission.files}</span></p>
                    <div className="flex flex-wrap gap-3 mb-4">
                      {selectedSubmission.fileUrl ? (
                        <a
                          href={selectedSubmission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-[140px] rounded-xl border border-gray-200 overflow-hidden group cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200 block"
                        >
                          <div className="h-[90px] bg-gradient-to-br from-blue-400 via-indigo-300 to-purple-400 relative flex items-center justify-center">
                            <span className="text-3xl opacity-70">📁</span>
                          </div>
                          <div className="px-2.5 py-2 bg-white">
                            <p className="text-[11px] font-bold text-slate-700 truncate">
                              {selectedSubmission.fileUrl.split("/").pop()}
                            </p>
                          </div>
                        </a>
                      ) : (
                        <p className="text-xs text-slate-400">Fayl biriktirilmagan</p>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-gray-100 border-l-4 border-l-blue-500">
                      <p className="text-[11px] font-semibold text-slate-400 mb-0.5">Uyga vazifa izohi:</p>
                      <p className="text-[13px] font-bold text-slate-800 break-all">
                        {selectedSubmission.answerNote || "Izoh qoldirilmagan"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grading Box */}
                <div className="bg-slate-50/50 rounded-2xl border border-gray-100 p-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2.5 mb-4">
                    <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">i</div>
                    <p className="text-xs font-semibold text-blue-800">
                      60-100 oralig'ida ball qo'yilgan vazifa 'Qabul qilingan', 0-59 oralig'ida ball qo'yilgan vazifa 'Qaytarilgan' hisoblanadi.
                    </p>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-[13px] font-extrabold text-slate-800 mb-4">Ball</h4>
                    <div className="flex items-center gap-6">
                      <div className="flex-1 relative">
                        <input
                          type="range"
                          min="0" max="100"
                          value={homeworkScore}
                          onChange={e => setHomeworkScore(e.target.value)}
                          className="w-full h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer outline-none overflow-hidden"
                          style={{
                            background: `linear-gradient(to right, #10B981 0%, #10B981 ${homeworkScore}%, #E5E7EB ${homeworkScore}%, #E5E7EB 100%)`
                          }}
                        />
                        <div className="absolute top-1/2 left-[60%] w-2.5 h-2.5 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-sm pointer-events-none"></div>
                        <p className="absolute -bottom-5 left-[60%] -translate-x-1/2 text-[10px] font-bold text-slate-500">O'tish bali</p>
                      </div>
                      <div className="w-14 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center font-bold text-slate-800 text-[13px] shadow-sm">
                        {homeworkScore}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-[13px] font-extrabold text-slate-800 mb-3">Fayllar</h4>
                    <button className="w-full py-6 border border-dashed border-emerald-400 bg-emerald-50/30 rounded-2xl text-center hover:bg-emerald-50/60 transition-colors group">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 mx-auto mb-2 group-hover:scale-110 transition-transform">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                      </div>
                      <p className="text-[13px] font-extrabold text-slate-800 mb-1">Faylni yuklash uchun ushbu hudud ustiga bosing yoki faylni shu yerga olib keling</p>
                      <p className="text-[11px] font-semibold text-slate-400">.jpg, .png, .pdf, .mp4, .docs formatlaridan birida bo'lishi mumkin</p>
                    </button>
                  </div>

                  <div className="mb-6 relative">
                    <textarea
                      className="w-full h-20 p-3 pr-10 bg-slate-50 border border-gray-100 rounded-xl outline-none text-xs font-semibold text-slate-700 resize-none focus:border-emerald-400 transition-colors"
                      placeholder="Izohingiz"
                    ></textarea>
                    <button className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-200">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button className="px-5 py-2 rounded-xl border border-gray-200 text-[12px] font-bold text-slate-600 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                      Bekor qilish
                    </button>
                    <button className="px-5 py-2 rounded-xl bg-emerald-500 text-white text-[12px] font-bold hover:bg-emerald-600 active:bg-emerald-700 transition-colors shadow-[0_2px_10px_rgba(16,185,129,0.3)]">
                      Yuborish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Yangi Uyga Vazifa Form */}
          {subTab === "Uyga vazifa" && isAddingHomework && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              <button
                onClick={() => setIsAddingHomework(false)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-extrabold text-sm mb-8 transition-colors"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
                Yangi uyga vazifa yaratish
              </button>

              <div className="max-w-3xl">
                <div className="mb-6">
                  <label className="block text-[13px] font-bold text-slate-700 mb-2"><span className="text-red-500">*</span> Mavzu</label>
                  <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-colors appearance-none cursor-pointer">
                    <option>Mavzulardan birini tanlang</option>
                    <option>Youtube project added chat with socket.io</option>
                    <option>socket.io</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-[13px] font-bold text-slate-700 mb-2"><span className="text-red-500">*</span> Izoh</label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
                    {/* Editor Toolbar */}
                    <div className="flex items-center gap-4 p-3 border-b border-gray-100 bg-slate-50/50 flex-wrap">
                      <div className="flex gap-2 text-slate-500 font-bold text-sm">
                        <button className="px-1 hover:text-slate-900 transition-colors">H1</button>
                        <button className="px-1 hover:text-slate-900 transition-colors">H2</button>
                      </div>
                      <div className="h-4 w-px bg-gray-200"></div>
                      <button className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">Sans Serif <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg></button>
                      <button className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">Normal <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg></button>
                      <div className="h-4 w-px bg-gray-200"></div>
                      <div className="flex gap-3 text-slate-500">
                        <button className="font-bold hover:text-slate-900 transition-colors">B</button>
                        <button className="italic hover:text-slate-900 transition-colors font-serif">I</button>
                        <button className="underline hover:text-slate-900 transition-colors">U</button>
                        <button className="line-through hover:text-slate-900 transition-colors">S</button>
                        <button className="hover:text-slate-900 transition-colors">"</button>
                        <button className="hover:text-slate-900 transition-colors">&lt;/&gt;</button>
                      </div>
                      <div className="h-4 w-px bg-gray-200"></div>
                      <div className="flex gap-3 text-slate-500">
                        <button className="hover:text-slate-900 transition-colors"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" /></svg></button>
                        <button className="hover:text-slate-900 transition-colors"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M3 4h4v4H3zm6 1h12v2H9zm-6 5h4v4H3zm6 1h12v2H9zm-6 5h4v4H3zm6 1h12v2H9z" /></svg></button>
                        <button className="hover:text-slate-900 transition-colors"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg></button>
                      </div>
                    </div>
                    <textarea className="w-full p-4 h-40 outline-none text-[13px] font-medium resize-none text-slate-700" placeholder=""></textarea>
                  </div>
                </div>

                <div className="mb-8">
                  <button className="w-full py-4 border border-dashed border-gray-300 rounded-xl text-slate-400 font-bold text-sm hover:border-emerald-400 hover:bg-emerald-50/30 hover:text-emerald-500 transition-colors flex items-center justify-center gap-2">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    Yuklash
                  </button>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsAddingHomework(false)}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-slate-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 active:bg-emerald-700 transition-colors shadow-[0_2px_10px_rgba(16,185,129,0.3)]">
                    E'lon qilish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Imtihonlar Tab - Ro'yxat */}
          {subTab === "Imtihonlar" && !isAddingExam && (
            <div className="overflow-x-auto animate-in fade-in duration-300">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 border-b border-gray-100">
                    <th className="py-4 px-3 w-10">#</th>
                    <th className="py-4 px-3">Mavzu</th>
                    <th className="py-4 px-3 w-12 text-center text-slate-400">
                      <svg className="inline" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </th>
                    <th className="py-4 px-3 w-12 text-center text-red-400">
                      <svg className="inline" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </th>
                    <th className="py-4 px-3 w-24 text-center">Status</th>
                    <th className="py-4 px-3 w-36">Dars vaqti</th>
                    <th className="py-4 px-3 w-36">Berilgan vaqt</th>
                    <th className="py-4 px-3 w-36">E'lon qilingan vaqti</th>
                    <th className="py-4 px-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="py-4 px-3 text-[13px] font-bold text-slate-500">{exam.id}</td>
                      <td className="py-4 px-3 text-[13px] font-bold text-emerald-600 cursor-pointer hover:underline">{exam.title}</td>
                      <td className="py-4 px-3 text-[13px] font-bold text-slate-700 text-center">{exam.students}</td>
                      <td className="py-4 px-3 text-[13px] font-bold text-slate-700 text-center">{exam.failed}</td>
                      <td className="py-4 px-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${
                          exam.status === "Faol"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                        }`}>
                          {exam.status}
                        </span>
                      </td>
                      <td className="py-4 px-3 text-[13px] font-semibold text-slate-600">
                        {exam.darsVaqti.split(" ").slice(0, 3).join(" ")}<br />
                        <span className="text-slate-400">{exam.darsVaqti.split(" ").slice(3).join(" ")}</span>
                      </td>
                      <td className="py-4 px-3 text-[13px] font-semibold text-slate-600">
                        {exam.berilganVaqt.split(" ").slice(0, 3).join(" ")}<br />
                        <span className="text-slate-400">{exam.berilganVaqt.split(" ").slice(3).join(" ")}</span>
                      </td>
                      <td className="py-4 px-3 text-[13px] font-semibold text-slate-600">
                        {exam.elonVaqti === "-" ? "-" : (
                          <>{exam.elonVaqti.split(" ").slice(0, 3).join(" ")}<br /><span className="text-slate-400">{exam.elonVaqti.split(" ").slice(3).join(" ")}</span></>
                        )}
                      </td>
                      <td className="py-4 px-3 text-right relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setExamActionMenu(examActionMenu === exam.id ? null : exam.id); }}
                          className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
                        >
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                        </button>
                        {examActionMenu === exam.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 min-w-[160px] animate-in fade-in zoom-in-95 duration-150">
                            <button className="w-full px-4 py-2 text-left text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Tahrirlash</button>
                            <button className="w-full px-4 py-2 text-left text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors">O'chirish</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Yangi Imtihon Form */}
          {subTab === "Imtihonlar" && isAddingExam && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              <button
                onClick={() => setIsAddingExam(false)}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-extrabold text-sm mb-8 transition-colors"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
                Imtihon yaratish
              </button>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex gap-3 mb-8 max-w-3xl">
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">i</div>
                <p className="text-[13px] font-semibold text-blue-800">Oxirgi 7 kundagi uyga vazifa berilmagan mavzularni tanlay olasiz!</p>
              </div>

              <div className="max-w-3xl">
                <div className="mb-6">
                  <label className="block text-[13px] font-bold text-slate-700 mb-2"><span className="text-red-500">*</span> Mavzu</label>
                  <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-colors appearance-none cursor-pointer">
                    <option>Mavzulardan birini tanlang</option>
                    <option>Examination</option>
                    <option>Final Examination</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-[13px] font-bold text-slate-700 mb-2"><span className="text-red-500">*</span> Izoh</label>
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50 transition-all">
                    {/* Editor Toolbar */}
                    <div className="flex items-center gap-4 p-3 border-b border-gray-100 bg-slate-50/50 flex-wrap">
                      <div className="flex gap-2 text-slate-500 font-bold text-sm">
                        <button className="px-1 hover:text-slate-900 transition-colors">H1</button>
                        <button className="px-1 hover:text-slate-900 transition-colors">H2</button>
                      </div>
                      <div className="h-4 w-px bg-gray-200"></div>
                      <button className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">Sans Serif <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg></button>
                      <button className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1">Normal <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6" /></svg></button>
                      <div className="h-4 w-px bg-gray-200"></div>
                      <div className="flex gap-3 text-slate-500">
                        <button className="font-bold hover:text-slate-900 transition-colors">B</button>
                        <button className="italic hover:text-slate-900 transition-colors font-serif">I</button>
                        <button className="underline hover:text-slate-900 transition-colors">U</button>
                        <button className="line-through hover:text-slate-900 transition-colors">S</button>
                        <button className="hover:text-slate-900 transition-colors">"</button>
                        <button className="hover:text-slate-900 transition-colors">&lt;/&gt;</button>
                      </div>
                      <div className="h-4 w-px bg-gray-200"></div>
                      <div className="flex gap-3 text-slate-500">
                        <button className="hover:text-slate-900 transition-colors"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" /></svg></button>
                        <button className="hover:text-slate-900 transition-colors"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M3 4h4v4H3zm6 1h12v2H9zm-6 5h4v4H3zm6 1h12v2H9zm-6 5h4v4H3zm6 1h12v2H9z" /></svg></button>
                        <button className="hover:text-slate-900 transition-colors"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg></button>
                        <button className="hover:text-slate-900 transition-colors"><svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg></button>
                      </div>
                    </div>
                    <textarea className="w-full p-4 h-40 outline-none text-[13px] font-medium resize-none text-slate-700" placeholder=""></textarea>
                  </div>
                </div>

                <div className="mb-8">
                  <button className="w-full py-4 border border-dashed border-gray-300 rounded-xl text-slate-400 font-bold text-sm hover:border-emerald-400 hover:bg-emerald-50/30 hover:text-emerald-500 transition-colors flex items-center justify-center gap-2">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    Yuklash
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2"><span className="text-red-500">*</span> Tugash sanasi</label>
                    <input
                      type="date"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-colors"
                      placeholder="Sanani kiriting"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2"><span className="text-red-500">*</span> Tugash vaqti</label>
                    <input
                      type="time"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-colors"
                      placeholder="Vaqtni kiriting"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsAddingExam(false)}
                    className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-slate-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 active:bg-emerald-700 transition-colors shadow-[0_2px_10px_rgba(16,185,129,0.3)]">
                    E'lon qilish
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {activeTab === "Akademik davomati" && (
        <div className="p-8 text-center text-slate-400 text-sm bg-slate-50 rounded-2xl border border-gray-100 mt-4">
          Hozircha davomat ma'lumotlari mavjud emas.
        </div>
      )}
    </div>
  );
}

export default function Guruhlar({ isTeacher, user, type }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Guruhlar");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [showCourseSelector, setShowCourseSelector] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [showTeacherSelector, setShowTeacherSelector] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [roomSearch, setRoomSearch] = useState("");
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [form, setForm] = useState({
    name: "",
    course_id: "",
    teacher_id: "",
    room_id: "",
    start_date: "",
    week_day: [],
    start_time: "",
    max_student: "",
    student_id: "",
  });

  const [stats, setStats] = useState({ groups: 0, teachers: 0, students: 0 });
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);

  const filteredGroups = groups.filter(g => {
    const q = search.toLowerCase();
    const name = g.name?.toLowerCase() || "";
    const course = g.courses?.name?.toLowerCase() || "";
    
    const groupTeachersList = g.groupTeachers?.map(gt => gt.teacher).filter(Boolean) || (g.teachers ? [g.teachers] : []);
    const teacherName = groupTeachersList.map(t => {
      const first = t?.first_name || "";
      const last = t?.last_name || "";
      return `${first} ${last}`.trim();
    }).filter(Boolean).join(" ").toLowerCase();

    return name.includes(q) || course.includes(q) || teacherName.includes(q);
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const currentGroups = filteredGroups.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchGroups = async () => {
    const token = localStorage.getItem("token");
    const headers = { "accept": "*/*", "Authorization": `Bearer ${token}` };
    try {
      const endpoint = isTeacher ? "/api/v1/teachers/my/groups" : "/api/v1/groups/all";
      const res = await fetch(endpoint, { headers });
      const data = await res.json();
      const list = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : Array.isArray(data.groups) ? data.groups : [];
      setGroups(list);
      setStats(prev => ({ ...prev, groups: list.length }));
    } catch (err) {
      setError("Guruhlarni yuklashda xatolik");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { "accept": "*/*", "Authorization": `Bearer ${token}` };

    const fetchAll = async () => {
      try {
        const endpoint = isTeacher ? "/api/v1/teachers/my/groups" : "/api/v1/groups/all";
        
        if (isTeacher) {
          const res = await fetch(endpoint, { headers });
          const data = await res.json();
          const groupsList = Array.isArray(data) ? data
            : Array.isArray(data.data) ? data.data
            : Array.isArray(data.groups) ? data.groups : [];
          
          setGroups(groupsList);

          const uniqueTeachersMap = new Map();
          const uniqueStudentsMap = new Map();
          if (user) {
            uniqueTeachersMap.set(user.id, user);
          }
          groupsList.forEach(g => {
            const groupTeachersList = g.groupTeachers?.map(gt => gt.teacher).filter(Boolean) || (g.teachers ? [g.teachers] : []);
            groupTeachersList.forEach(t => {
              if (t && t.id) uniqueTeachersMap.set(t.id, t);
            });
            const groupStudentsList = g.students || [];
            if (Array.isArray(groupStudentsList)) {
              groupStudentsList.forEach(s => {
                if (s && s.id) uniqueStudentsMap.set(s.id, s);
              });
            }
          });

          const tList = Array.from(uniqueTeachersMap.values());
          const sList = Array.from(uniqueStudentsMap.values());
          setTeachers(tList);
          setStudents(sList);

          setStats({
            groups: groupsList.length,
            teachers: tList.length || 1,
            students: sList.length || groupsList.reduce((sum, g) => sum + (Array.isArray(g.students) ? g.students.length : (g.students || g.studentCount || 0)), 0),
          });
        } else {
          const [groupsRes, teachersRes, studentsRes, coursesRes, roomsRes] = await Promise.all([
            fetch(endpoint, { headers }),
            fetch("/api/v1/teachers", { headers }),
            fetch("/api/v1/students", { headers }),
            fetch("/api/v1/courses", { headers }),
            fetch("/api/v1/rooms", { headers }),
          ]);

          const [groupsData, teachersData, studentsData, coursesData, roomsData] = await Promise.all([
            groupsRes.json(),
            teachersRes.json(),
            studentsRes.json(),
            coursesRes.json(),
            roomsRes.json(),
          ]);

          const groupsList = Array.isArray(groupsData) ? groupsData
            : Array.isArray(groupsData.data) ? groupsData.data
              : Array.isArray(groupsData.groups) ? groupsData.groups
                : [];
          setGroups(groupsList);

          const teachersList = Array.isArray(teachersData) ? teachersData
            : Array.isArray(teachersData.data) ? teachersData.data
              : Array.isArray(teachersData.teachers) ? teachersData.teachers
                : [];
          setTeachers(teachersList);

          const coursesList = Array.isArray(coursesData) ? coursesData
            : Array.isArray(coursesData.data) ? coursesData.data
              : Array.isArray(coursesData.courses) ? coursesData.courses
                : [];
          setCourses(coursesList);

          const roomsList = Array.isArray(roomsData) ? roomsData
            : Array.isArray(roomsData.data) ? roomsData.data
              : Array.isArray(roomsData.rooms) ? roomsData.rooms
                : [];
          setRooms(roomsList);

          const studentsList = Array.isArray(studentsData) ? studentsData
            : Array.isArray(studentsData.data) ? studentsData.data
              : Array.isArray(studentsData.students) ? studentsData.students
                : [];
          setStudents(studentsList);

          setStats({
            groups: groupsList.length,
            teachers: teachersData.total || teachersList.length || 0,
            students: studentsData.total || studentsList.length || 0,
          });
        }

      } catch (err) {
        setError("Ma'lumotlarni yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const handleSave = async () => {
    if (!form.name.trim() || !form.course_id || !form.start_date || !form.start_time) {
      alert("Iltimos, barcha majburiy maydonlarni to'ldiring");
      return;
    }
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/groups", {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: "",
          course_id: Number(form.course_id),
          teacher_id: Number(form.teacher_id) || undefined,
          room_id: Number(form.room_id) || undefined,
          start_date: form.start_date,
          week_day: form.week_day,
          start_time: form.start_time,
          max_student: Number(form.max_student) || 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Xatolik yuz berdi");
        return;
      }
      const newGroupId = data.data?.id;
      if (newGroupId && selectedStudents.length > 0) {
        for (const studentId of selectedStudents) {
          try {
            await fetch("/api/v1/student-group", {
              method: "POST",
              headers: {
                "accept": "*/*",
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                student_id: Number(studentId),
                group_id: Number(newGroupId)
              })
            });
          } catch (err) {
            console.error("Talabani guruhga biriktirishda xatolik:", err);
          }
        }
      }
      await fetchGroups();
      setShowAdd(false);
      setForm({ name: "", course_id: "", teacher_id: "", room_id: "", start_date: "", week_day: [], start_time: "", max_student: "" });
      setSelectedStudents([]);
      setStudentSearch("");
      setCourseSearch("");
      setTeacherSearch("");
      setRoomSearch("");
      setShowCourseSelector(false);
      setShowTeacherSelector(false);
      setShowRoomSelector(false);
      setShowDaySelector(false);
    } catch (err) {
      alert("Server bilan bog'lanishda xatolik");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day) => {
    const eng = DAY_MAP[day];
    setForm(f => ({
      ...f,
      week_day: f.week_day.includes(eng)
        ? f.week_day.filter(d => d !== eng)
        : [...f.week_day, eng],
    }));
  };

  const toggleActive = (id) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, isActive: !g.isActive } : g));
  };

  return (
    <div className="pb-10">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-100 mb-8">
        <div className="flex gap-8">
          {["Guruhlar", "Arxiv"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                }`}
            >
              {tab}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />}
            </button>
          ))}
        </div>
        {!isTeacher && (
          <button
            onClick={() => {
              setSelectedStudents([]);
              setStudentSearch("");
              setCourseSearch("");
              setTeacherSearch("");
              setRoomSearch("");
              setShowCourseSelector(false);
              setShowTeacherSelector(false);
              setShowRoomSelector(false);
              setShowDaySelector(false);
              setShowAdd(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95 mb-2"
          >
            + Guruh qo'shish
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            type: "groups",
            label: "Jami guruhlar",
            value: `${stats.groups}`,
            icon: (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            ),
            color: "bg-slate-50 text-slate-400"
          },
          {
            type: "teachers",
            label: "O'qituvchilar",
            value: `${stats.teachers}`,
            icon: (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="7" cy="12" r="3" /><circle cx="17" cy="12" r="3" /><path d="M10 12h4" /><path d="M2 12a10 10 0 0 1 20 0" /></svg>
            ),
            color: "bg-slate-50 text-slate-400"
          },
          {
            type: "students",
            label: "O'quvchilar",
            value: `${stats.students}`,
            icon: (
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" /></svg>
            ),
            color: "bg-slate-50 text-slate-400"
          },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group flex flex-col justify-between min-h-[140px]">
            <div>
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-4 transition-colors`}>
                {stat.icon}
              </div>
              <p className="text-slate-400 text-[13px] font-medium mb-1">{stat.label}</p>
            </div>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-3xl font-extrabold text-slate-900 leading-tight">{stat.value}</h3>
              
              {stat.type === "groups" && groups.length > 0 && (
                <AvatarGroup>
                  {groups.slice(0, 3).map((g, idx) => {
                    const courseName = g.courses?.name || g.name || "";
                    const initials = courseName.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase() || "G";
                    const fallbackColors = [
                      "bg-blue-100 text-blue-600 font-bold text-xs",
                      "bg-purple-100 text-purple-600 font-bold text-xs",
                      "bg-pink-100 text-pink-600 font-bold text-xs",
                    ];
                    return (
                      <Avatar key={g.id || idx}>
                        <AvatarFallback className={fallbackColors[idx % fallbackColors.length]}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {groups.length > 3 && (
                    <AvatarGroupCount className="bg-slate-800 text-white font-bold text-xs">
                      +{groups.length - 3}
                    </AvatarGroupCount>
                  )}
                </AvatarGroup>
              )}

              {stat.type === "teachers" && teachers.length > 0 && (
                <AvatarGroup>
                  {teachers.slice(0, 3).map((t, idx) => {
                    const initials = `${t.first_name?.[0] || ""}${t.last_name?.[0] || ""}`.toUpperCase() || "T";
                    return (
                      <Avatar key={t.id || idx}>
                        <AvatarImage src={getPhotoUrl(t.photo)} alt={`${t.first_name} ${t.last_name}`} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {teachers.length > 3 && (
                    <AvatarGroupCount className="bg-slate-800 text-white font-bold text-xs">
                      +{teachers.length - 3}
                    </AvatarGroupCount>
                  )}
                </AvatarGroup>
              )}

              {stat.type === "students" && students.length > 0 && (
                <AvatarGroup>
                  {students.slice(0, 3).map((s, idx) => {
                    const initials = `${s.first_name?.[0] || ""}${s.last_name?.[0] || ""}`.toUpperCase() || "S";
                    return (
                      <Avatar key={s.id || idx}>
                        <AvatarImage src={getPhotoUrl(s.photo)} alt={`${s.first_name} ${s.last_name}`} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-600 font-bold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                  {students.length > 3 && (
                    <AvatarGroupCount className="bg-slate-800 text-white font-bold text-xs">
                      +{students.length - 3}
                    </AvatarGroupCount>
                  )}
                </AvatarGroup>
              )}
            </div>
            <div className="absolute top-4 right-4 text-slate-200">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><circle cx="8" cy="3" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="8" cy="13" r="1.5" /></svg>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3"></div>
        <div className="flex items-center gap-3 flex-1 max-w-md md:justify-end">
          <div className="relative flex-1 max-w-xs">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            </div>
            <input
              className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-all"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-gray-50">
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Guruh</th>
                <th className="py-4 px-6">Kurs</th>
                <th className="py-4 px-6">Davomiyligi</th>
                <th className="py-4 px-6">Dars vaqti</th>
                <th className="py-4 px-6">Xona</th>
                <th className="py-4 px-6">O'qituvchi</th>
                <th className="py-4 px-6">Talabalar</th>
                <th className="py-4 px-6 text-right pr-6">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentGroups.map(g => (
                <React.Fragment key={g.id}>
                  <tr
                    onClick={() => navigate(`/my-groups/chapters/${g.id}`)}
                    className={`group transition-colors cursor-pointer hover:bg-slate-50/50`}
                  >
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          onClick={(e) => { e.stopPropagation(); toggleActive(g.id); }}
                          className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors ${g.isActive ?? g.status === "ACTIVE" ? "bg-indigo-600" : "bg-gray-200"}`}
                        >
                          <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${g.isActive ?? g.status === "ACTIVE" ? "translate-x-4" : ""}`} />
                        </div>
                        <span className={`text-[10px] font-bold tracking-tight ${g.status === "ACTIVE" ? "text-green-500" : "text-slate-400"}`}>
                          {g.status || "ACTIVE"}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6 font-bold text-slate-800 text-sm">{g.name}</td>
                    <td className="py-5 px-6">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-purple-100 text-purple-400">
                        {g.courses?.name || "—"}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-slate-700">{g.courses.duration_month || "—"} oy</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1">
                          {g.start_date?.slice(0, 10) || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col leading-tight">
                        <span className="text-xs font-bold text-slate-700">{g.start_time || "—"}</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-1">{g.week_day?.join(", ") || g.days || g.lessonDays || "—"}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-xs text-slate-500 font-medium">
                      {g.rooms?.name || "—"}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        {(() => {
                          const teachersList = g.groupTeachers?.map(gt => gt.teacher).filter(Boolean) || (g.teachers ? [g.teachers] : []);
                          const hasTeacher = teachersList.length > 0 || g.mentor || g.teacher;
                          if (!hasTeacher) {
                            return (
                              <span className="text-xs font-medium text-slate-500">—</span>
                            );
                          }
                          
                          let displayName = "";
                          if (teachersList.length > 0) {
                            displayName = teachersList.map(t => `${t.first_name || ""} ${t.last_name || ""}`.trim()).filter(Boolean).join(", ");
                          }
                          if (!displayName) {
                            displayName = g.mentor || g.teacher || "";
                          }
                          if (!displayName || displayName.trim() === "") {
                            return <span className="text-xs font-medium text-slate-500">—</span>;
                          }
                          
                          const initial = displayName.charAt(0).toUpperCase();
                          return (
                            <>
                              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold border border-gray-200">
                                {initial}
                              </div>
                              <span className="text-xs font-medium text-slate-700">
                                {displayName}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="py-5 px-6 text-sm font-bold text-slate-800">
                      {Array.isArray(g.students) ? g.students.length : (g.students || g.studentCount || g.students_count || 0)}
                    </td>
                    <td className="py-5 px-6 text-right pr-6" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedRowId(expandedRowId === g.id ? null : g.id); }}
                        className="text-slate-300 hover:text-slate-600 transition-colors"
                      >
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><circle cx="8" cy="3" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="8" cy="13" r="1.5" /></svg>
                      </button>
                    </td>
                  </tr>

                  {/* Accordion Row */}
                  {expandedRowId === g.id && (
                    <tr>
                      <td colSpan="9" className="p-0 border-b border-gray-100 bg-slate-50/30">
                        <ExpandedContent g={g} onClose={() => setExpandedRowId(null)} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-6 border-t border-gray-100 bg-white">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-[13px] font-bold text-slate-400 hover:bg-gray-50 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-9 h-9 rounded-xl text-[13px] font-extrabold transition-all ${currentPage === p
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-400 hover:bg-gray-50 hover:text-slate-600"
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-[13px] font-bold text-slate-400 hover:bg-gray-50 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Add Group Modal */}
      {showAdd && (
        <>
          <Modal
            title="Guruh qo'shish"
            subtitle="Yangi guruh yaratish uchun quyidagi ma'lumotlarni kiriting."
            onClose={() => {
              setShowAdd(false);
              setSelectedStudents([]);
              setStudentSearch("");
              setCourseSearch("");
              setTeacherSearch("");
              setRoomSearch("");
              setShowCourseSelector(false);
              setShowTeacherSelector(false);
              setShowRoomSelector(false);
              setShowDaySelector(false);
            }}
            position="right"
            footer={
              <>
                <button
                  onClick={() => {
                    setShowAdd(false);
                    setSelectedStudents([]);
                    setStudentSearch("");
                    setCourseSearch("");
                    setTeacherSearch("");
                    setRoomSearch("");
                    setShowCourseSelector(false);
                    setShowTeacherSelector(false);
                    setShowRoomSelector(false);
                    setShowDaySelector(false);
                  }}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-gray-100 transition-colors"
                >
                  Bekor qilish
                </button>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold shadow-md shadow-indigo-200 transition-all active:scale-95">
                  {saving ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </>
            }
          >
            <div className="space-y-4">

              {/* Guruh nomi */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Guruh nomi <span className="text-red-500">*</span></label>
                <input
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-all"
                  placeholder="Masalan: Frontend-1"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>

              {/* Kurs */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-3">Kurs <span className="text-red-500">*</span></label>
                <div className="space-y-2.5">
                  {form.course_id && (
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const c = courses.find(item => item.id === Number(form.course_id));
                        return c ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <span className="text-xs font-semibold text-indigo-600">{c.name}</span>
                            <button
                              type="button"
                              onClick={() => setForm(f => ({ ...f, course_id: "" }))}
                              className="text-indigo-400 hover:text-indigo-600 transition-colors"
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setCourseSearch("");
                      setShowCourseSelector(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
                  >
                    + Qo'shish
                  </button>
                </div>
              </div>

              {/* O'qituvchi */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-3">O'qituvchi <span className="text-xs font-normal text-slate-400">(ixtiyoriy)</span></label>
                <div className="space-y-2.5">
                  {form.teacher_id && (
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const t = teachers.find(item => item.id === Number(form.teacher_id));
                        return t ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <span className="text-xs font-semibold text-indigo-600">{t.first_name} {t.last_name}</span>
                            <button
                              type="button"
                              onClick={() => setForm(f => ({ ...f, teacher_id: "" }))}
                              className="text-indigo-400 hover:text-indigo-600 transition-colors"
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherSearch("");
                      setShowTeacherSelector(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
                  >
                    + Qo'shish
                  </button>
                </div>
              </div>

              {/* Talaba */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-3">Talaba <span className="text-xs font-normal text-slate-400">(ixtiyoriy)</span></label>
                <div className="space-y-2.5">
                  {selectedStudents.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {students.filter(s => selectedStudents.includes(s.id)).map(s => (
                        <div key={s.id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                          <span className="text-xs font-semibold text-indigo-600">{s.first_name} {s.last_name}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedStudents(selectedStudents.filter(id => id !== s.id))}
                            className="text-indigo-400 hover:text-indigo-600 transition-colors"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowStudentSelector(!showStudentSelector)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
                  >
                    + Qo'shish
                  </button>
                </div>
              </div>

              {/* Xona */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-3">Xona <span className="text-xs font-normal text-slate-400">(ixtiyoriy)</span></label>
                <div className="space-y-2.5">
                  {form.room_id && (
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const r = rooms.find(item => item.id === Number(form.room_id));
                        return r ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <span className="text-xs font-semibold text-indigo-600">{r.name}</span>
                            <button
                              type="button"
                              onClick={() => setForm(f => ({ ...f, room_id: "" }))}
                              className="text-indigo-400 hover:text-indigo-600 transition-colors"
                            >
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setRoomSearch("");
                      setShowRoomSelector(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
                  >
                    + Qo'shish
                  </button>
                </div>
              </div>

              {/* Dars kunlari */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-3">Dars kunlari</label>
                <div className="space-y-2.5">
                  {form.week_day && form.week_day.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {DAYS.filter(day => form.week_day.includes(DAY_MAP[day])).map(day => (
                        <div key={day} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                          <span className="text-xs font-semibold text-indigo-600">{day}</span>
                          <button
                            type="button"
                            onClick={() => toggleDay(day)}
                            className="text-indigo-400 hover:text-indigo-600 transition-colors"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowDaySelector(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-indigo-300 rounded-xl text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
                  >
                    + Qo'shish
                  </button>
                </div>
              </div>

              {/* Boshlanish sanasi va vaqti */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Boshlanish sanasi <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-all"
                    value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Dars vaqti <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-all"
                    value={form.start_time}
                    onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                  />
                </div>
              </div>

              {/* Max talaba soni */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Maksimal talabalar soni</label>
                <input
                  type="number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-all"
                  placeholder="Masalan: 20"
                  value={form.max_student}
                  onChange={e => setForm(f => ({ ...f, max_student: e.target.value }))}
                />
              </div>
            </div>
          </Modal>

          {/* Centered Student Selector Modal */}
          {showStudentSelector && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-[75]"
                onClick={() => setShowStudentSelector(false)}
                style={{ pointerEvents: "auto" }}
              />
              <div
                className="fixed z-[80] flex flex-col bg-white shadow-2xl rounded-2xl animate-in fade-in duration-200"
                style={{
                  width: "420px",
                  maxHeight: "70vh",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                }}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-white rounded-t-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <svg width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Talabalar</h3>
                      <p className="text-[11px] text-slate-400">Talabani tanlang</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowStudentSelector(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Search */}
                <div className="px-4 py-3 border-b border-gray-50">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Talaba qidirish..."
                      value={studentSearch}
                      className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-400 transition-all bg-slate-50/50"
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Selected count badge */}
                {selectedStudents.length > 0 && (
                  <div className="px-4 py-2 bg-indigo-50/50 border-b border-indigo-100/50">
                    <span className="text-xs font-bold text-indigo-600">{selectedStudents.length} ta talaba tanlangan</span>
                  </div>
                )}

                {/* Students List */}
                <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
                  {students.filter(s => {
                    const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
                    return fullName.includes(studentSearch.toLowerCase());
                  }).length > 0 ? (
                    <div className="space-y-1">
                      {students.filter(s => {
                        const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
                        return fullName.includes(studentSearch.toLowerCase());
                      }).map(s => {
                        const isSelected = selectedStudents.includes(s.id);
                        return (
                          <label
                            key={s.id}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? "bg-indigo-50 border border-indigo-200 shadow-sm"
                                : "hover:bg-slate-50 border border-transparent"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setSelectedStudents(selectedStudents.filter(id => id !== s.id));
                                } else {
                                  setSelectedStudents([...selectedStudents, s.id]);
                                }
                              }}
                              className="accent-indigo-600 w-4 h-4 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold ${isSelected ? "text-indigo-700" : "text-slate-800"}`}>{s.first_name} {s.last_name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{s.phone || s.email || "—"}</p>
                            </div>
                            {isSelected && (
                              <svg width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                      <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      <p className="text-sm">Talabalar topilmadi</p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setShowStudentSelector(false)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                  >
                    Tasdiqlash ({selectedStudents.length})
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Centered Course Selector Modal */}
          {showCourseSelector && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-[75]"
                onClick={() => setShowCourseSelector(false)}
                style={{ pointerEvents: "auto" }}
              />
              <div
                className="fixed z-[80] flex flex-col bg-white shadow-2xl rounded-2xl animate-in fade-in duration-200"
                style={{
                  width: "420px",
                  maxHeight: "70vh",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                }}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-white rounded-t-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <svg width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Kurslar</h3>
                      <p className="text-[11px] text-slate-400">Kursni tanlang</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCourseSelector(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Search */}
                <div className="px-4 py-3 border-b border-gray-50">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Kurs qidirish..."
                      value={courseSearch}
                      className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-400 transition-all bg-slate-50/50"
                      onChange={(e) => setCourseSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Courses List */}
                <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
                  {courses.filter(c => c.name?.toLowerCase().includes(courseSearch.toLowerCase())).length > 0 ? (
                    <div className="space-y-1">
                      {courses.filter(c => c.name?.toLowerCase().includes(courseSearch.toLowerCase())).map(c => {
                        const isSelected = Number(form.course_id) === c.id;
                        return (
                          <label
                            key={c.id}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? "bg-indigo-50 border border-indigo-200 shadow-sm"
                                : "hover:bg-slate-50 border border-transparent"
                            }`}
                          >
                            <input
                              type="radio"
                              name="selectedCourse"
                              checked={isSelected}
                              onChange={() => {
                                setForm(f => ({ ...f, course_id: c.id.toString() }));
                              }}
                              className="accent-indigo-600 w-4 h-4 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold ${isSelected ? "text-indigo-700" : "text-slate-800"}`}>{c.name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{c.duration_month} oy davomiyligi</p>
                            </div>
                            {isSelected && (
                              <svg width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                      <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                      <p className="text-sm">Kurslar topilmadi</p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setShowCourseSelector(false)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                  >
                    Tasdiqlash
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Centered Teacher Selector Modal */}
          {showTeacherSelector && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-[75]"
                onClick={() => setShowTeacherSelector(false)}
                style={{ pointerEvents: "auto" }}
              />
              <div
                className="fixed z-[80] flex flex-col bg-white shadow-2xl rounded-2xl animate-in fade-in duration-200"
                style={{
                  width: "420px",
                  maxHeight: "70vh",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                }}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-white rounded-t-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <svg width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">O'qituvchilar</h3>
                      <p className="text-[11px] text-slate-400">O'qituvchini tanlang</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTeacherSelector(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Search */}
                <div className="px-4 py-3 border-b border-gray-50">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    </div>
                    <input
                      type="text"
                      placeholder="O'qituvchi qidirish..."
                      value={teacherSearch}
                      className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-400 transition-all bg-slate-50/50"
                      onChange={(e) => setTeacherSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Teachers List */}
                <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
                  {teachers.filter(t => `${t.first_name || ""} ${t.last_name || ""}`.toLowerCase().includes(teacherSearch.toLowerCase())).length > 0 ? (
                    <div className="space-y-1">
                      {teachers.filter(t => `${t.first_name || ""} ${t.last_name || ""}`.toLowerCase().includes(teacherSearch.toLowerCase())).map(t => {
                        const isSelected = Number(form.teacher_id) === t.id;
                        return (
                          <label
                            key={t.id}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? "bg-indigo-50 border border-indigo-200 shadow-sm"
                                : "hover:bg-slate-50 border border-transparent"
                            }`}
                          >
                            <input
                              type="radio"
                              name="selectedTeacher"
                              checked={isSelected}
                              onChange={() => {
                                setForm(f => ({ ...f, teacher_id: t.id.toString() }));
                              }}
                              className="accent-indigo-600 w-4 h-4 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold ${isSelected ? "text-indigo-700" : "text-slate-800"}`}>{t.first_name} {t.last_name}</p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{t.phone || t.email || "—"}</p>
                            </div>
                            {isSelected && (
                              <svg width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                      <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      <p className="text-sm">O'qituvchilar topilmadi</p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setShowTeacherSelector(false)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                  >
                    Tasdiqlash
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Centered Room Selector Modal */}
          {showRoomSelector && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-[75]"
                onClick={() => setShowRoomSelector(false)}
                style={{ pointerEvents: "auto" }}
              />
              <div
                className="fixed z-[80] flex flex-col bg-white shadow-2xl rounded-2xl animate-in fade-in duration-200"
                style={{
                  width: "420px",
                  maxHeight: "70vh",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                }}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-white rounded-t-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <svg width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" /></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Xonalar</h3>
                      <p className="text-[11px] text-slate-400">Xonani tanlang</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowRoomSelector(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Search */}
                <div className="px-4 py-3 border-b border-gray-50">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Xona qidirish..."
                      value={roomSearch}
                      className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:border-indigo-400 transition-all bg-slate-50/50"
                      onChange={(e) => setRoomSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Rooms List */}
                <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
                  {rooms.filter(r => r.name?.toLowerCase().includes(roomSearch.toLowerCase())).length > 0 ? (
                    <div className="space-y-1">
                      {rooms.filter(r => r.name?.toLowerCase().includes(roomSearch.toLowerCase())).map(r => {
                        const isSelected = Number(form.room_id) === r.id;
                        return (
                          <label
                            key={r.id}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
                              isSelected
                                ? "bg-indigo-50 border border-indigo-200 shadow-sm"
                                : "hover:bg-slate-50 border border-transparent"
                            }`}
                          >
                            <input
                              type="radio"
                              name="selectedRoom"
                              checked={isSelected}
                              onChange={() => {
                                setForm(f => ({ ...f, room_id: r.id.toString() }));
                              }}
                              className="accent-indigo-600 w-4 h-4 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-bold ${isSelected ? "text-indigo-700" : "text-slate-800"}`}>{r.name}</p>
                            </div>
                            {isSelected && (
                              <svg width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
                      <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mb-3"><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" /></svg>
                      <p className="text-sm">Xonalar topilmadi</p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setShowRoomSelector(false)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                  >
                    Tasdiqlash
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Centered Day Selector Modal */}
          {showDaySelector && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-[75]"
                onClick={() => setShowDaySelector(false)}
                style={{ pointerEvents: "auto" }}
              />
              <div
                className="fixed z-[80] flex flex-col bg-white shadow-2xl rounded-2xl animate-in fade-in duration-200"
                style={{
                  width: "420px",
                  maxHeight: "70vh",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
                }}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-white rounded-t-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <svg width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">Dars kunlari</h3>
                      <p className="text-[11px] text-slate-400">Dars kunlarini tanlang</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDaySelector(false)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Days List */}
                <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
                  <div className="space-y-1">
                    {DAYS.map(day => {
                      const isSelected = form.week_day.includes(DAY_MAP[day]);
                      return (
                        <label
                          key={day}
                          className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
                            isSelected
                              ? "bg-indigo-50 border border-indigo-200 shadow-sm"
                              : "hover:bg-slate-50 border border-transparent"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleDay(day)}
                            className="accent-indigo-600 w-4 h-4 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-bold ${isSelected ? "text-indigo-700" : "text-slate-800"}`}>{day}</p>
                          </div>
                          {isSelected && (
                            <svg width="16" height="16" fill="none" stroke="#6366f1" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5" /></svg>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30 rounded-b-2xl">
                  <button
                    type="button"
                    onClick={() => setShowDaySelector(false)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                  >
                    Tasdiqlash ({form.week_day.length})
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}


      {/* Delete confirm */}
      {deleteId && (
        <Modal
          title="Guruhni o'chirish"
          onClose={() => setDeleteId(null)}
          footer={
            <>
              <button onClick={() => setDeleteId(null)} className="px-5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-gray-100 transition-colors">
                Bekor qilish
              </button>
              <button
                onClick={() => { setGroups(g => g.filter(x => x.id !== deleteId)); setDeleteId(null); }}
                className="px-5 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all active:scale-95"
              >
                O'chirish
              </button>
            </>
          }
        >
          <p className="text-slate-600 text-sm">Haqiqatan ham bu guruhni o'chirmoqchimisiz?</p>
        </Modal>
      )}
    </div>
  );
}

