import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HomeworkCreate from "../components/HomeworkCreate";

export default function GroupDetails({ id }) {
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Ma'lumotlar");
  const [isMentorsExpanded, setIsMentorsExpanded] = useState(false);
  const [isParamsExpanded, setIsParamsExpanded] = useState(false);
  const [schedulesData, setSchedulesData] = useState({});
  const [currentMonthKey, setCurrentMonthKey] = useState(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [showAllMonths, setShowAllMonths] = useState(false);
  const [students, setStudents] = useState([]);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);
  const [savedLessonId, setSavedLessonId] = useState(null);
  const [attendanceState, setAttendanceState] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch groups
        const resGroup = await fetch("/api/v1/groups/all", {
          headers: {
            "accept": "*/*",
            "Authorization": `Bearer ${token}`
          }
        });
        const dataGroup = await resGroup.json();
        const list = Array.isArray(dataGroup) ? dataGroup : Array.isArray(dataGroup.data) ? dataGroup.data : Array.isArray(dataGroup.groups) ? dataGroup.groups : [];
        const found = list.find(g => g.id === Number(id) || g.id === id);
        setGroup(found);
        setStudents(Array.isArray(found?.students) ? found.students : []);

        // Fetch schedules
        const resSchedules = await fetch(`/api/v1/groups/${id}/schedules`, {
          headers: {
            "accept": "*/*",
            "Authorization": `Bearer ${token}`
          }
        });
        const dataSchedules = await resSchedules.json();
        const sData = dataSchedules.data || dataSchedules;
        setSchedulesData(sData || {});
        
        if (sData && Object.keys(sData).length > 0) {
          setCurrentMonthKey(Object.keys(sData)[0]);
        }

      } catch (err) {
        console.error("Xatolik:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Yuklanmoqda...</div>;
  }

  if (!group) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 mb-4">Guruh topilmadi.</p>
        <button onClick={() => navigate("/guruhlar")} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold">
          Ortga qaytish
        </button>
      </div>
    );
  }

  const handleSaveTopic = async () => {
    if (!topic || isSubmittingTopic || savedLessonId) return;
    setIsSubmittingTopic(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "accept": "*/*",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          group_id: Number(id),
          topic,
          description
        })
      });
      if (res.ok) {
        const data = await res.json();
        const lessonId = data?.data?.id || null;

        if (!lessonId) {
          alert("Mavzu saqlandi, lekin lesson_id topilmadi.");
          return;
        }

        setSavedLessonId(lessonId);

        const attendanceEntries = students
          .filter(student => attendanceState[student.id])
          .map(student => ({
            lesson_id: lessonId,
            student_id: Number(student.id),
            isPresent: true
          }));

        if (lessonId && attendanceEntries.length > 0) {
          const attendanceResults = await Promise.allSettled(
            attendanceEntries.map(entry =>
              fetch("/api/v1/attendance", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "accept": "*/*",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(entry)
              })
            )
          );

          const failedAttendance = attendanceResults.some(result => result.status === "rejected" || !result.value.ok);
          if (failedAttendance) {
            alert("Mavzu saqlandi, lekin davomatni saqlashda xatolik yuz berdi.");
            return;
          }
        }

        alert("Muvaffaqiyatli saqlandi!");
        // We do not clear the topic and description so they know what they are marking attendance for
      } else {
        const data = await res.json();
        alert("Xatolik: " + (data.message || "Xatolik yuz berdi"));
      }
    } catch (err) {
      console.error(err);
      alert("Tarmoq xatosi yuz berdi");
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  const handleToggleAttendance = (studentId) => {
    if (savedLessonId) return;
    const currentState = attendanceState[studentId] || false;
    setAttendanceState(prev => ({ ...prev, [studentId]: !currentState }));
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

  const getNextLessonDate = () => {
    let nextLessonDate = null;
    for (const monthKey of Object.keys(schedulesData)) {
      for (const dateObj of (schedulesData[monthKey] || [])) {
        const date = convertToDate(dateObj);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (date && date.getTime() > today.getTime()) {
          if (!nextLessonDate || date.getTime() < nextLessonDate.getTime()) {
            nextLessonDate = date;
          }
        }
      }
    }
    return nextLessonDate;
  };

  const getTodayLessonDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const monthKey of Object.keys(schedulesData)) {
      for (const dateObj of (schedulesData[monthKey] || [])) {
        const date = convertToDate(dateObj);
        if (date && date.getTime() === today.getTime()) {
          return date;
        }
      }
    }
    return null;
  };

  const getDateStatus = (dateObj) => {
    if (!dateObj) return null;
    
    const dateToCompare = convertToDate(dateObj);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLessonDate = getTodayLessonDate();
    const nextLessonDate = getNextLessonDate();
    
    if (dateToCompare.getTime() < today.getTime()) {
      return 'past';
    } else if (todayLessonDate && dateToCompare.getTime() === today.getTime()) {
      return 'today-lesson';
    } else if (!todayLessonDate && nextLessonDate && dateToCompare.getTime() === nextLessonDate.getTime()) {
      return 'next-lesson';
    } else {
      return 'future';
    }
  };

  return (
    <div className="pb-10 max-w-6xl mx-auto">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/guruhlar")} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-slate-500 transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
            {group.name}
            <span className="px-2.5 py-0.5 rounded-[6px] bg-green-50 text-green-500 text-[10px] font-bold uppercase tracking-wider border border-green-100">
              {group.status === "ACTIVE" || group.isActive ? "AKTIV" : "NOFAOL"}
            </span>
          </h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-gray-50 transition-colors">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          Statistika
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-gray-100 mb-6 px-2">
        {["Ma'lumotlar", "Guruh darsliklari", "Akademik davomati"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[13px] font-extrabold transition-all relative ${
              activeTab === tab ? "text-emerald-500" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab}
            {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-md" />}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Ma'lumotlar" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Guruh mentorlari Card */}
              <div className="bg-white rounded-[12px] border border-gray-200 shadow-sm overflow-hidden">
                <div 
                  className="bg-[#2A72D6] px-5 py-3 flex items-center justify-between cursor-pointer"
                  onClick={() => setIsMentorsExpanded(!isMentorsExpanded)}
                >
                  <h3 className="text-white text-[15px] font-bold">Guruh mentorlari</h3>
                  <button className="text-white hover:bg-white/20 p-1 rounded transition-colors">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform duration-300 ${isMentorsExpanded ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                </div>
                
                <div className={`transition-all duration-300 overflow-hidden ${isMentorsExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-6 flex flex-wrap items-start gap-8">
                    {(Array.isArray(group.teachers) ? group.teachers : group.teachers ? [group.teachers] : []).map((t, index) => (
                      <div key={t.id || index} className="flex flex-col items-center text-center group cursor-pointer">
                        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-2xl font-bold border-2 border-emerald-100 mb-3 group-hover:scale-105 transition-transform overflow-hidden relative">
                           <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="opacity-40"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                        </div>
                        <p className="text-[12px] font-bold text-emerald-500 mb-1">{t.role || "Teacher"}</p>
                        <p className="text-[13px] font-bold text-slate-800 leading-tight">{t.first_name}<br/>{t.last_name || ""}</p>
                      </div>
                    ))}
                    {(!group.teachers || (Array.isArray(group.teachers) && group.teachers.length === 0)) && (
                      <p className="text-sm text-slate-500">O'qituvchilar biriktirilmagan</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Akademiklar Card Removed */}
            </div>

            {/* Right Column (Parametrlar) */}
            <div className="bg-white rounded-[12px] border border-gray-200 shadow-sm overflow-hidden h-fit">
              <div 
                className="bg-[#2A72D6] px-5 py-3 flex items-center justify-between cursor-pointer"
                onClick={() => setIsParamsExpanded(!isParamsExpanded)}
              >
                <h3 className="text-white text-[15px] font-bold">Parametrlar</h3>
                <button className="text-white hover:bg-white/20 p-1 rounded transition-colors">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className={`transition-transform duration-300 ${isParamsExpanded ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
              <div className={`transition-all duration-300 overflow-hidden ${isParamsExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6">
                  <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-[13px] font-medium text-slate-500">Filial:</span>
                    <span className="text-[13px] font-bold text-[#2A72D6]">{group.branch?.name || group.rooms?.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-[13px] font-medium text-slate-500">Kurs:</span>
                    <span className="text-[13px] font-bold text-slate-800">{group.courses?.name || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-[13px] font-medium text-slate-500">Turi:</span>
                    <span className="text-[13px] font-bold text-slate-800">{group.type || "BOOTCAMP"}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-[13px] font-medium text-slate-500">Kategoriya:</span>
                    <span className="text-[13px] font-bold text-slate-800">{group.category || "Programming"}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-[13px] font-medium text-slate-500">To'lov turi:</span>
                    <span className="text-[13px] font-bold text-slate-800">{group.payment_type || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-[13px] font-medium text-slate-500">O'rta yosh:</span>
                    <span className="text-[13px] font-bold text-slate-800">{group.average_age || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-[13px] font-medium text-slate-500">O'quvchilar sig'imi:</span>
                    <span className="text-[13px] font-bold text-slate-800">{group.max_student || group.capacity || 20}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-[13px] font-medium text-slate-500">Mavjud o'quvchilar:</span>
                    <span className="text-[13px] font-bold text-slate-800">
                      {Array.isArray(group.students) ? group.students.length : group.students_count || group.studentCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-[13px] font-medium text-slate-500">Shartnomalar:</span>
                    <span className="text-[13px] font-bold text-slate-800">{group.contracts_count || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-[13px] font-medium text-slate-500">O'quv oyidagi darslar soni:</span>
                    <span className="text-[13px] font-bold text-slate-800">{group.lessons_per_month || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-[13px] font-medium text-slate-500">Kurs davomiyligi (oy):</span>
                    <span className="text-[13px] font-bold text-slate-800">{group.courses?.duration_month || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-slate-500">Jami darslar soni:</span>
                    <span className="text-[13px] font-bold text-slate-800">{group.total_lessons || "—"}</span>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Dars Jadvali */}
          <div className="bg-white rounded-[12px] border border-gray-200 shadow-sm p-6">
            <h3 className="text-[16px] font-bold text-slate-900 mb-4">Dars jadvali</h3>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#F8FAFC] border border-gray-100">
                <span className="text-[#00A1D6] font-bold text-[13px] w-1/4">Sultonqulov Abduxoshim</span>
                <span className="text-slate-600 font-medium text-[13px] w-1/4">Du/Se/Ch/Pa/Ju</span>
                <span className="text-slate-800 font-bold text-[13px] w-1/4">09:30 dan - 12:30 gacha</span>
                <span className="text-slate-600 font-medium text-[13px] w-1/4">15 Yan, 2026 - 27 Iyun, 2026</span>
                <span className="text-slate-600 font-medium text-[13px] text-right">F2 Autodesk // 18</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-[#F8FAFC] border border-gray-100">
                <span className="text-[#00A1D6] font-bold text-[13px] w-1/4">+++Yusupova Barchinoy</span>
                <span className="text-slate-600 font-medium text-[13px] w-1/4">Du/Se/Ch/Pa/Ju</span>
                <span className="text-slate-800 font-bold text-[13px] w-1/4">08:00 dan - 09:30 gacha</span>
                <span className="text-slate-600 font-medium text-[13px] w-1/4">15 Yan, 2026 - 27 Iyun, 2026</span>
                <span className="text-slate-600 font-medium text-[13px] text-right">F2 Autodesk // 18</span>
              </div>
            </div>
            <div className="flex justify-center mb-8">
              <button className="px-4 py-1.5 border border-gray-200 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-gray-50 transition-colors">
                Yana ko'rsatish (9)
              </button>
            </div>

            {/* Date Slider */}
            <div className="mb-6">
              {!showAllMonths && (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <button 
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-slate-400 hover:bg-gray-50 disabled:opacity-50"
                      disabled={!schedulesData || Object.keys(schedulesData).indexOf(currentMonthKey) <= 0}
                      onClick={() => {
                        const keys = Object.keys(schedulesData);
                        const currentIndex = keys.indexOf(currentMonthKey);
                        if (currentIndex > 0) {
                          setCurrentMonthKey(keys[currentIndex - 1]);
                          setSelectedDateIndex(0);
                        }
                      }}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
                    </button>
                    <span className="text-[14px] font-bold text-slate-700">{currentMonthKey || "1"}-o'quv oyi</span>
                    <button 
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-slate-400 hover:bg-gray-50 disabled:opacity-50"
                      disabled={!schedulesData || Object.keys(schedulesData).indexOf(currentMonthKey) === Object.keys(schedulesData).length - 1}
                      onClick={() => {
                        const keys = Object.keys(schedulesData);
                        const currentIndex = keys.indexOf(currentMonthKey);
                        if (currentIndex < keys.length - 1) {
                          setCurrentMonthKey(keys[currentIndex + 1]);
                          setSelectedDateIndex(0);
                        }
                      }}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar">
                    {(schedulesData[currentMonthKey] || []).map((d, i) => {
                      const isActive = i === selectedDateIndex;
                      const dateStatus = getDateStatus(d);
                      
                      let buttonClass = '';
                      if (isActive && (dateStatus === 'today-lesson' || dateStatus === 'next-lesson')) {
                        buttonClass = "bg-emerald-500 text-white";
                      } else if (isActive) {
                        buttonClass = "bg-emerald-500 text-white";
                      } else if (dateStatus === 'past') {
                        buttonClass = "bg-gray-400 text-white";
                      } else if (dateStatus === 'today-lesson' || dateStatus === 'next-lesson') {
                        buttonClass = "bg-emerald-500 text-white";
                      } else {
                        buttonClass = "bg-white text-slate-600 border border-gray-200 hover:bg-gray-50";
                      }
                      
                      return (
                        <button 
                          key={i} 
                          onClick={() => setSelectedDateIndex(i)}
                          className={`flex flex-col items-center justify-center min-w-[50px] h-12 rounded-[8px] transition-colors ${buttonClass}`}
                        >
                          <span className="text-[9px] font-bold">{d.month}</span>
                          <span className="text-[14px] font-bold">{d.day}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-center mt-2">
                    <button 
                      className="px-4 py-1.5 border border-gray-200 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowAllMonths(true)}
                    >
                      Barchasini ko'rish
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* All Months View */}
            {showAllMonths && (
              <div className="space-y-6 mt-6 transition-all duration-300">
                {Object.keys(schedulesData).map(monthKey => (
                  <div key={monthKey}>
                    <h4 className="text-[14px] font-bold text-slate-700 mb-3">{monthKey}-o'quv oyi</h4>
                    <div className="flex gap-2 flex-wrap">
                      {(schedulesData[monthKey] || []).map((d, i) => {
                        const dateStatus = getDateStatus(d);
                        
                        let buttonClass = '';
                        if (dateStatus === 'past') {
                          buttonClass = "bg-gray-400 text-white";
                        } else if (dateStatus === 'today-lesson' || dateStatus === 'next-lesson') {
                          buttonClass = "bg-emerald-500 text-white";
                        } else {
                          buttonClass = "bg-white text-slate-600 border border-gray-200 hover:bg-gray-50";
                        }
                        
                        return (
                          <button 
                            key={i}
                            onClick={() => {
                              setCurrentMonthKey(monthKey);
                              setSelectedDateIndex(i);
                              setShowAllMonths(false);
                            }}
                            className={`flex flex-col items-center justify-center min-w-[50px] h-12 rounded-[8px] transition-colors ${buttonClass}`}
                          >
                            <span className="text-[9px] font-bold">{d.month}</span>
                            <span className="text-[14px] font-bold">{d.day}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex justify-center mt-4">
                  <button 
                    className="px-4 py-1.5 border border-gray-200 rounded-lg text-[13px] font-medium text-slate-600 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowAllMonths(false)}
                  >
                    Yopish
                  </button>
                </div>
              </div>
            )}

            <hr className="border-gray-100 my-8" />

            {/* Attendance & Topic Entry (Yo'qlama) */}
            <div>
              <div className="flex gap-6 border-b border-gray-100 mb-6">
                <button className="pb-3 text-[14px] font-bold text-slate-400 hover:text-slate-600 transition-colors">
                  Assistant
                </button>
                <button className="pb-3 text-[14px] font-bold text-emerald-500 border-b-2 border-emerald-500">
                  Teacher
                </button>
              </div>

              {/* Ma'lumot Card */}
              <div className="bg-[#F8FAFC] rounded-[16px] p-3 mb-4 inline-block min-w-[400px]">
                <h4 className="text-[14px] font-bold text-slate-900 mb-2">Ma'lumot</h4>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 rounded-full bg-slate-300 text-white flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-slate-900 leading-tight">
                      {group.teachers?.first_name || ""} {group.teachers?.last_name || ""}
                    </p>
                    <p className="text-[13px] text-slate-500">Teacher</p>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white rounded-lg p-2">
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Dars kuni</p>
                    <p className="text-[12px] font-bold text-slate-800">
                      {group.start_date ? new Date(group.start_date).toLocaleDateString("uz-UZ", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Dars vaqti</p>
                    <p className="text-[12px] font-bold text-slate-800">{group.start_time || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Kunlar</p>
                    <p className="text-[12px] font-bold text-slate-800">
                      {(group.week_day || []).map(d => d.substring(0, 2)).join("/") || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Xona</p>
                    <p className="text-[12px] font-bold text-slate-800">{group.rooms?.name || "—"}</p>
                  </div>
                </div>
              </div>

              <h2 className="text-[16px] font-bold text-slate-900 mb-3">{group.courses?.name || ""} {group.name} {group.start_date ? new Date(group.start_date).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" }) : ""}</h2>
              
              <div className="mb-6">
                <h3 className="text-[16px] font-bold text-slate-900 mb-4">Yo'qlama va mavzu kiritish</h3>
                <div className="flex items-center gap-6 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer opacity-50">
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                    <span className="text-[14px] text-slate-600 font-medium">O'quv reja bo'yicha</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="w-4 h-4 rounded-full border-4 border-emerald-500 bg-white"></div>
                    <span className="text-[14px] text-emerald-500 font-bold">Boshqa</span>
                  </label>
                </div>
                <div className="mb-4 max-w-md">
                  <label className="block text-[12px] font-bold text-slate-700 mb-2"><span className="text-red-500">*</span> Mavzu</label>
                  <input 
                    type="text" 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={Boolean(savedLessonId)}
                    placeholder="Mavzu nomini kiriting"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-slate-600 font-medium focus:outline-none focus:border-emerald-500 transition-colors disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed" 
                  />
                </div>
                <div className="mb-6 max-w-md">
                  <label className="block text-[12px] font-bold text-slate-700 mb-2">Tavsif</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={Boolean(savedLessonId)}
                    placeholder="Mavzu tavsifini kiriting"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-[14px] text-slate-600 font-medium focus:outline-none focus:border-emerald-500 transition-colors min-h-[100px] disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed" 
                  ></textarea>
                </div>
              </div>

              {/* Students Attendance Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-3 px-4 text-[13px] font-bold text-slate-600 w-16">#</th>
                      <th className="py-3 px-4 text-[13px] font-bold text-slate-600">O'quvchi ismi</th>
                      <th className="py-3 px-4 text-[13px] font-bold text-slate-600 w-32 text-center">Vaqti</th>
                      <th className="py-3 px-4 text-[13px] font-bold text-slate-600 w-24 text-center">Keldi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length > 0 ? students.map((st, idx) => {
                      const isPresent = attendanceState[st.id] || false;
                      return (
                      <tr key={st.id || idx} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-4 text-[13px] font-medium text-slate-900">{idx + 1}</td>
                        <td className="py-4 px-4 text-[13px] font-bold text-slate-900">
                          {st.first_name} {st.last_name || ""}
                        </td>
                        <td className="py-4 px-4 text-[13px] font-medium text-slate-600 text-center">{group.start_time || "09:30"}</td>
                        <td className="py-4 px-4">
                          <div className="flex justify-center">
                            <div 
                              onClick={() => handleToggleAttendance(st.id)}
                              className={`w-10 h-5 rounded-full p-0.5 flex items-center transition-all ${
                                savedLessonId ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                              } ${isPresent ? "bg-emerald-500 justify-end" : "bg-gray-200 justify-start"}`}
                            >
                              <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}) : (
                      <tr>
                        <td colSpan="4" className="py-6 text-center text-sm text-slate-500">
                          Bu guruhda o'quvchilar yo'q.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                <button 
                  onClick={handleSaveTopic}
                  disabled={isSubmittingTopic || !topic || Boolean(savedLessonId)}
                  className="px-8 py-2.5 bg-emerald-500 text-white rounded-lg text-[14px] font-bold hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savedLessonId ? "Dars allaqachon saqlangan" : isSubmittingTopic ? "Saqlanmoqda..." : "Saqlash"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === "Guruh darsliklari" && (
        <div className="bg-white p-6 rounded-[12px] border border-gray-200 shadow-sm">
          <HomeworkCreate
            groupId={Number(id)}
            students={students}
            studentsCount={students.length}
          />
        </div>
      )}

      {activeTab === "Akademik davomati" && (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center text-slate-500 text-sm">
          Tez kunda...
        </div>
      )}
    </div>
  );
}
