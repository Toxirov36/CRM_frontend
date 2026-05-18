import { useState } from "react";

export default function Dashboard({ user }) {
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  const [selectedDayId, setSelectedDayId] = useState(null);
  const [attendanceTab, setAttendanceTab] = useState("Teacher");
  const [topicType, setTopicType] = useState("Boshqa");
  const [topicName, setTopicName] = useState("CRM groupinner full");
  const [studentsAttendance, setStudentsAttendance] = useState({ 1: true, 2: false });

  const toggleAttendance = (id) => {
    setStudentsAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const stats = [
    { label: "Sinflar", value: "0", icon: (
      <svg width="20" height="20" fill="none" stroke="#7C5CFC" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    )},
    { label: "Fanlar", value: "0", icon: (
      <svg width="20" height="20" fill="none" stroke="#7C5CFC" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    )},
    { label: "Talabalar", value: "1", icon: (
      <svg width="20" height="20" fill="none" stroke="#7C5CFC" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
    )},
    { label: "Sovg'alar", value: "3", icon: (
      <svg width="20" height="20" fill="none" stroke="#7C5CFC" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
    )},
    { label: "O'qituvchilar", value: "0", icon: (
      <svg width="20" height="20" fill="none" stroke="#7C5CFC" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87"/></svg>
    )},
  ];

  const schedules = [
    { id: 1, name: "Sultonqulov Abduxoshim", days: "Du/Se/Ch/Pa/Ju", time: "09:30 dan - 12:30 gacha", dateRange: "15 Yan, 2026 - 27 Iyun, 2026", group: "F2 Autodesk // 18" },
    { id: 2, name: "+++Yusupova Barchinoy", days: "Du/Se/Ch/Pa/Ju", time: "08:00 dan - 09:30 gacha", dateRange: "15 Yan, 2026 - 27 Iyun, 2026", group: "F2 Autodesk // 18" },
  ];

  const calendarDays = [
    { id: 1, month: "Apr", day: "28", active: true },
    { id: 2, month: "Apr", day: "29", active: true },
    { id: 3, month: "Apr", day: "30", active: true },
    { id: 4, month: "May", day: "01", active: true },
    { id: 5, month: "May", day: "04", active: true },
    { id: 6, month: "May", day: "05", active: true },
    { id: 7, month: "May", day: "06", active: true },
    { id: 8, month: "May", day: "07", active: true },
    { id: 9, month: "May", day: "08", active: true },
    { id: 10, month: "May", day: "11", active: true },
    { id: 11, month: "May", day: "12", active: false },
    { id: 12, month: "May", day: "13", active: false },
    { id: 13, month: "May", day: "14", active: false },
    { id: 14, month: "May", day: "15", active: false },
    { id: 15, month: "May", day: "18", active: false },
    { id: 16, month: "May", day: "19", active: false },
    { id: 17, month: "May", day: "20", active: false },
    { id: 18, month: "May", day: "21", active: false },
    { id: 19, month: "May", day: "22", active: false },
    { id: 20, month: "May", day: "25", active: false },
  ];

  return (
    <div className="pb-10">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900">Salom, {user.fullName} 👋</h1>
        <p className="text-slate-500 text-sm mt-1">Study platformasiga xush kelibsiz!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="mb-3">
              {s.icon}
            </div>
            <p className="text-xs font-medium text-slate-500 mb-1">{s.label}</p>
            <h3 className="text-2xl font-extrabold text-slate-900">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Dars Jadvali Accordion */}
      <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
        <div 
          onClick={() => setIsScheduleOpen(!isScheduleOpen)}
          className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors select-none"
        >
          <h2 className="text-[15px] font-extrabold text-slate-800">Dars Jadvali</h2>
          <svg 
            width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" 
            className={`text-slate-400 transition-transform duration-300 ${isScheduleOpen ? "rotate-180" : ""}`}
          >
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isScheduleOpen ? "max-h-[1200px] border-t border-gray-50 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="p-6">
            {/* Calendar Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-slate-500 hover:bg-gray-50 transition-colors active:scale-95">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <span className="text-[13px] font-extrabold text-slate-700">7-o'quv oyi</span>
                <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-slate-500 hover:bg-gray-50 transition-colors active:scale-95">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </div>

              {/* Calendar Days */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
                {calendarDays.map(day => (
                  <div 
                    key={day.id} 
                    onClick={() => setSelectedDayId(day.id)}
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
                 <div className="space-y-3">
                   {schedules.map(item => (
                     <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50/70 rounded-xl border border-gray-100/60 hover:bg-slate-50 transition-colors gap-4">
                       <div className="text-[13px] font-bold text-[#00B2FF] flex-1">{item.name}</div>
                       <div className="text-[13px] font-semibold text-slate-700 flex-1 md:text-center">{item.days}</div>
                       <div className="text-[13px] font-semibold text-slate-700 flex-1 md:text-center whitespace-nowrap">{item.time}</div>
                       <div className="text-[13px] font-semibold text-slate-700 flex-1 md:text-center whitespace-nowrap">{item.dateRange}</div>
                       <div className="text-[13px] font-bold text-slate-700 flex-1 md:text-right">{item.group}</div>
                     </div>
                   ))}
                 </div>
                 <div className="mt-5 flex justify-center">
                   <button className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-slate-400 hover:bg-gray-50 transition-colors">
                     Yana ko'rsatish (9)
                   </button>
                 </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 border-t border-gray-100 pt-6">
                  {/* Tabs: Assistant / Teacher */}
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

                  {/* Ma'lumot Card */}
                  <div className="bg-slate-50 rounded-2xl p-6 mb-8 w-fit min-w-[400px]">
                    <h4 className="font-extrabold text-sm text-slate-800 mb-4">Ma'lumot</h4>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white">
                        <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">Sultonqulov Abduxoshim</p>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">Teacher</p>
                      </div>
                    </div>
                    <div className="flex gap-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm overflow-x-auto custom-scrollbar">
                      <div className="shrink-0">
                        <p className="text-[10px] text-slate-400 font-bold mb-1">Dars kuni</p>
                        <p className="text-xs font-bold text-slate-700">11 May, 2026</p>
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
                        <p className="text-xs font-bold text-slate-700">F2 Autodesk // 18</p>
                      </div>
                    </div>
                  </div>

                  {/* Group Title */}
                  <h3 className="text-[15px] font-extrabold text-slate-800 mb-6">Bootcamp Full Stack N26 11.05.2026</h3>

                  {/* Yo'qlama va mavzu kiritish */}
                  <div className="mb-6">
                    <h4 className="font-extrabold text-[15px] text-slate-800 mb-5">Yo'qlama va mavzu kiritish</h4>
                    
                    <div className="flex items-center gap-6 mb-6">
                      <label className={`flex items-center gap-2 cursor-pointer text-sm font-semibold transition-colors ${topicType === "O'quv reja" ? "text-emerald-500" : "text-slate-400 hover:text-slate-600"}`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${topicType === "O'quv reja" ? "border-emerald-500" : "border-gray-300"}`}>
                          {topicType === "O'quv reja" && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                        </div>
                        <input type="radio" className="hidden" checked={topicType === "O'quv reja"} onChange={() => setTopicType("O'quv reja")} />
                        O'quv reja bo'yicha
                      </label>
                      <label className={`flex items-center gap-2 cursor-pointer text-sm font-semibold transition-colors ${topicType === "Boshqa" ? "text-emerald-500" : "text-slate-400 hover:text-slate-600"}`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${topicType === "Boshqa" ? "border-emerald-500" : "border-gray-300"}`}>
                          {topicType === "Boshqa" && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                        </div>
                        <input type="radio" className="hidden" checked={topicType === "Boshqa"} onChange={() => setTopicType("Boshqa")} />
                        Boshqa
                      </label>
                    </div>

                    <div className="mb-8 w-full max-w-md">
                      <label className="block text-xs font-bold text-slate-700 mb-2"><span className="text-red-500">*</span> Mavzu</label>
                      <input 
                        type="text" 
                        className="w-full bg-slate-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none text-slate-700 focus:border-emerald-400 transition-colors font-semibold"
                        value={topicName}
                        onChange={e => setTopicName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Students Table */}
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
      </div>
    </div>
  );
}