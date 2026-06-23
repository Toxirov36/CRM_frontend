import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "../components/theme-provider";
import logoImg from "../images/image copy.png";
import avatarNamuna from "../images/avatar_namuna.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const WEEK_DAYS_UZ = {
  MONDAY: "Du",
  TUESDAY: "Se",
  WEDNESDAY: "Cho",
  THURSDAY: "Pa",
  FRIDAY: "Ju",
  SATURDAY: "Sha",
  SUNDAY: "Ya",
};

const HOMEWORK_STATUS_MAP = {
  completed: { label: "Qabul qilingan", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  checked: { label: "Qabul qilingan", bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  submitted: { label: "Kutayotganlar", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  pending: { label: "Berilmagan", bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200" },
  rejected: { label: "Qaytarilgan", bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" },
  failed: { label: "Bajarilmagan", bg: "bg-red-50", text: "text-red-600", border: "border-red-200" },
  none: { label: "—", bg: "", text: "text-slate-400", border: "" },
};

const NAV_ITEMS = [
  {
    id: "bosh-sahifa",
    label: "Bosh sahifa",
    svg: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "tolovlarim",
    label: "To'lovlarim",
    svg: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    id: "guruhlarim",
    label: "Guruhlarim",
    svg: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "korsatkichlarim",
    label: "Ko'rsatkichlarim",
    svg: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: "reyting",
    label: "Reyting",
    svg: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: "dokon",
    label: "Do'kon",
    svg: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    id: "qoshimcha-darslar",
    label: "Qo'shimcha darslar",
    svg: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    id: "sozlamalar",
    label: "Sozlamalar",
    svg: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function StudentDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("guruhlarim");
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("faol");
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState("O'zbekcha");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);

  // Profile & settings states
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/students/my/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activePage === "sozlamalar") {
      fetchProfile();
    }
  }, [activePage, fetchProfile]);

  // Group detail state
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [hwStatusFilter, setHwStatusFilter] = useState("all");
  const [lessonSearch, setLessonSearch] = useState("");
  const [expandedLessons, setExpandedLessons] = useState({});
  const [lessonVideos, setLessonVideos] = useState({});
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoLoadError, setVideoLoadError] = useState(false);

  useEffect(() => {
    setVideoLoadError(false);
  }, [activeVideo]);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'video'
  const [activeHomeworkData, setActiveHomeworkData] = useState(null);
  const [homeworkLoading, setHomeworkLoading] = useState(false);

  useEffect(() => {
    if (activeHomeworkData?.homework?.file) {
      const file = activeHomeworkData.homework.file;
      if (isVideoFile(file)) {
        const activeLessonVideos = lessonVideos[activeLessonId] || [];
        if (activeLessonVideos.length === 0) {
          setActiveVideo({
            id: `homework-${activeHomeworkData.homework.id}`,
            name: `Vazifa videosi: ${activeHomeworkData.homework.title || file}`,
            file: file,
            isHomeworkVideo: true
          });
        }
      }
    }
  }, [activeHomeworkData, activeLessonId, lessonVideos]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const fetchGroups = useCallback(async () => {
    if (user?.role !== "STUDENT") return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/students/my/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setGroups(data.data || []);
    } catch {
      console.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === "STUDENT") {
      fetchGroups();
    }
  }, [fetchGroups, user?.role]);

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/notifications/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "STUDENT") {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, user?.role]);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.is_read).length;
  }, [notifications]);

  const fetchLessonVideos = useCallback(async (groupId, lessonId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/groups/${groupId}/lessons/${lessonId}/videos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setLessonVideos((prev) => ({
          ...prev,
          [lessonId]: data.data || [],
        }));
        return data.data || [];
      }
    } catch (err) {
    }
    return [];
  }, []);

  const fetchHomework = useCallback(async (groupId, lessonId) => {
    try {
      setHomeworkLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/groups/${groupId}/lesson/${lessonId}/homework`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setActiveHomeworkData(data.data || null);
      } else {
        setActiveHomeworkData(null);
      }
    } catch (err) {
      console.error("Failed to fetch homework", err);
      setActiveHomeworkData(null);
    } finally {
      setHomeworkLoading(false);
    }
  }, []);

  const fetchLessons = useCallback(async (groupId) => {
    try {
      setLessonsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/lessons/my/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        const lessonsData = data.data || [];
        setLessons(lessonsData);
        
        // Find the first lesson that has videos
        const firstLessonWithVideo = lessonsData.find(l => l.videoCount > 0);
        if (firstLessonWithVideo) {
          setExpandedLessons({ [firstLessonWithVideo.id]: true });
          setActiveLessonId(firstLessonWithVideo.id);
          fetchHomework(groupId, firstLessonWithVideo.id);
          const vids = await fetchLessonVideos(groupId, firstLessonWithVideo.id);
          if (vids && vids.length > 0) {
            setActiveVideo(vids[0]);
          }
        } else if (lessonsData.length > 0) {
          setExpandedLessons({ [lessonsData[0].id]: true });
          setActiveLessonId(lessonsData[0].id);
          fetchHomework(groupId, lessonsData[0].id);
        }
      }
    } catch {
      console.error("Failed to fetch lessons");
    } finally {
      setLessonsLoading(false);
    }
  }, [fetchLessonVideos, fetchHomework]);

  const openGroupDetail = (group) => {
    setSelectedGroup(group);
    setHwStatusFilter("all");
    setViewMode("table");
    const groupId = group.id || group.groupId;
    fetchLessons(groupId);
  };

  const goBackToGroups = () => {
    if (viewMode === "video") {
      setViewMode("table");
    } else {
      setSelectedGroup(null);
      setLessons([]);
      setLessonSearch("");
      setExpandedLessons({});
      setLessonVideos({});
      setActiveVideo(null);
      setActiveLessonId(null);
    }
  };

  const filteredGroups = useMemo(() => {
    let filtered = groups;

    if (filtered.some((g) => g.status)) {
      if (activeTab === "faol") {
        filtered = filtered.filter((g) => g.status === "active");
      } else {
        filtered = filtered.filter((g) => g.status !== "active");
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (g) =>
          (g.name || g.groupName)?.toLowerCase().includes(q) ||
          (g.courses?.name || g.course)?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [groups, activeTab, search]);

  const filteredLessons = useMemo(() => {
    let result = lessons;
    if (lessonSearch.trim()) {
      const q = lessonSearch.toLowerCase();
      result = result.filter((l) => l.topic?.toLowerCase().includes(q));
    }
    return result;
  }, [lessons, lessonSearch]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const months = [
      "Yanvar",
      "Fevral",
      "Mart",
      "Aprel",
      "May",
      "Iyun",
      "Iyul",
      "Avgust",
      "Sentabr",
      "Oktabr",
      "Noyabr",
      "Dekabr",
    ];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const renderContent = () => {
    if (activePage === "guruhlarim") {
      if (selectedGroup) return renderGroupDetail();
      return renderGroups();
    }
    if (activePage === "bosh-sahifa") return renderHomePage();
    if (activePage === "sozlamalar") return renderSettings();
    return renderComingSoon();
  };

  // Get topbar title
  const getTopbarTitle = () => {
    if (activePage === "guruhlarim" && selectedGroup) {
      return null; // We render custom topbar content
    }
    return NAV_ITEMS.find((n) => n.id === activePage)?.label || "Bosh sahifa";
  };

  const renderHomePage = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-[#ebd2b8] via-[#e8cbb0] to-[#dfbca0] rounded-3xl p-8 text-slate-800 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3" />
        <div className="relative">
          <h2 className="text-2xl font-bold mb-2">
            Assalomu alaykum, {user?.first_name}! 👋
          </h2>
          <p className="text-slate-700 text-sm">
            O'quv platformangizga xush kelibsiz. Bugun qanday darslar bor
            ekanligini tekshiring.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-11 h-11 bg-[#ebd2b8]/20 rounded-xl flex items-center justify-center mb-3">
            <svg width="20" height="20" fill="none" stroke="#be8b5b" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {groups.some((g) => g.status)
              ? groups.filter((g) => g.status === "active").length
              : groups.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Faol guruhlar</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
            <svg width="20" height="20" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {new Set(groups.map((g) => g.courses?.name || g.course).filter(Boolean)).size}
          </p>
          <p className="text-xs text-slate-500 mt-1">Kurslar</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
            <svg width="20" height="20" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-800">—</p>
          <p className="text-xs text-slate-500 mt-1">Reyting</p>
        </div>
      </div>
    </div>
  );

  const renderComingSoon = () => {
    const item = NAV_ITEMS.find((i) => i.id === activePage);
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-4">
        <div className="w-20 h-20 bg-[#ebd2b8]/20 rounded-2xl flex items-center justify-center shadow-sm">
          <span className="text-[#be8b5b] scale-150">{item?.svg || "📦"}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800">{item?.label || "Sahifa"}</h2>
        <p className="text-slate-500 text-sm">Bu sahifa hali ishlanmoqda...</p>
      </div>
    );
  };

  const renderLessonsTable = () => {
    // Filtered lessons based on hwStatusFilter and lessonSearch
    const tableLessons = lessons.filter(l => {
      // search
      if (lessonSearch.trim()) {
        const q = lessonSearch.toLowerCase();
        if (!l.topic?.toLowerCase().includes(q)) return false;
      }
      // homework status
      if (hwStatusFilter !== "all") {
        if (hwStatusFilter === "pending" && l.homeworkStatus !== "pending") return false;
        if (hwStatusFilter === "completed" && !(l.homeworkStatus === "completed" || l.homeworkStatus === "checked")) return false;
        if (hwStatusFilter === "rejected" && l.homeworkStatus !== "rejected") return false;
        if (hwStatusFilter === "failed" && l.homeworkStatus !== "failed") return false;
        if (hwStatusFilter === "submitted" && l.homeworkStatus !== "submitted") return false;
      }
      return true;
    });

    return (
      <div className="flex flex-col gap-6 h-full bg-[#fdfaf7] rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <label className="block text-slate-500 text-xs font-bold mb-2 uppercase tracking-wider">
              Uy vazifa statusi
            </label>
            <div>
              <Select value={hwStatusFilter} onValueChange={setHwStatusFilter}>
                <SelectTrigger className="w-[180px] h-10 bg-white border border-gray-200 rounded-xl px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#ebd2b8] focus:ring-2 focus:ring-[#ebd2b8]/20 data-[state=open]:border-[#ebd2b8] data-[state=open]:ring-2 data-[state=open]:ring-[#ebd2b8]/20 transition-all shadow-sm cursor-pointer">
                  <SelectValue placeholder="Barchasi" />
                </SelectTrigger>
                <SelectContent position="popper" className="bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-1">
                  <SelectItem value="all" className="hover:bg-slate-50 cursor-pointer py-2 px-3 rounded-lg">Barchasi</SelectItem>
                  <SelectItem value="completed" className="hover:bg-slate-50 cursor-pointer py-2 px-3 rounded-lg">Qabul qilingan</SelectItem>
                  <SelectItem value="pending" className="hover:bg-slate-50 cursor-pointer py-2 px-3 rounded-lg">Berilmagan</SelectItem>
                  <SelectItem value="rejected" className="hover:bg-slate-50 cursor-pointer py-2 px-3 rounded-lg">Qaytarilgan</SelectItem>
                  <SelectItem value="failed" className="hover:bg-slate-50 cursor-pointer py-2 px-3 rounded-lg">Bajarilmagan</SelectItem>
                  <SelectItem value="submitted" className="hover:bg-slate-50 cursor-pointer py-2 px-3 rounded-lg">Kutayotganlar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex-1 min-h-0 flex flex-col">
          <div className="overflow-x-auto overflow-y-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mavzular</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Video</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Uyga vazifa Holati</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Uyga vazifa tugash vaqti</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dars sanasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lessonsLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-3 border-slate-200 border-t-[#ebd2b8] rounded-full animate-spin" />
                        <span className="text-sm text-slate-400">Yuklanmoqda...</span>
                      </div>
                    </td>
                  </tr>
                ) : tableLessons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <p className="text-slate-400 text-sm font-medium">Darslar topilmadi</p>
                    </td>
                  </tr>
                ) : (
                  tableLessons.map((lesson) => {
                    let statusLabel = "Berilmagan";
                    let badgeClass = "bg-[#6c757d] text-white"; // default gray badge
                    
                    if (lesson.homeworkStatus === "completed" || lesson.homeworkStatus === "checked") {
                      statusLabel = "Qabul qilingan";
                      badgeClass = "bg-[#28a745] text-white"; // green badge
                    } else if (lesson.homeworkStatus === "submitted") {
                      statusLabel = "Kutayotganlar";
                      badgeClass = "bg-[#2196F3] text-white"; // blue badge
                    } else if (lesson.homeworkStatus === "rejected") {
                      statusLabel = "Qaytarilgan";
                      badgeClass = "bg-[#dc3545] text-white"; // red badge
                    } else if (lesson.homeworkStatus === "failed") {
                      statusLabel = "Bajarilmagan";
                      badgeClass = "bg-[#dc3545] text-white"; // red badge
                    } else if (lesson.homeworkStatus === "pending") {
                      statusLabel = "Berilmagan";
                      badgeClass = "bg-[#6c757d] text-white"; // default gray badge
                    } else if (lesson.homeworkStatus === "none") {
                      statusLabel = "—";
                      badgeClass = "bg-transparent text-slate-400";
                    }

                    const handleRowClick = async () => {
                      setActiveLessonId(lesson.id);
                      setExpandedLessons({ [lesson.id]: true });
                      setViewMode("video");
                      fetchHomework(selectedGroup.id || selectedGroup.groupId, lesson.id);

                      if (!lessonVideos[lesson.id]) {
                        const vids = await fetchLessonVideos(selectedGroup.id || selectedGroup.groupId, lesson.id);
                        if (vids && vids.length > 0) {
                          setActiveVideo(vids[0]);
                        } else {
                          setActiveVideo(null);
                        }
                      } else {
                        const vids = lessonVideos[lesson.id];
                        if (vids && vids.length > 0) {
                          setActiveVideo(vids[0]);
                        } else {
                          setActiveVideo(null);
                        }
                      }
                    };

                    return (
                      <tr
                        key={lesson.id}
                        onClick={handleRowClick}
                        className="hover:bg-[#fcf8f5] border-b border-gray-100 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {lesson.topic}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-[#3FA1DF] text-[#3FA1DF] font-bold text-xs">
                            {lesson.videoCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {lesson.homeworkStatus !== "none" ? (
                            <span className={`px-3 py-1 rounded-md text-xs font-bold inline-block shadow-sm ${badgeClass}`}>
                              {statusLabel}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 font-semibold">
                          {lesson.homeworkDeadline ? formatDate(lesson.homeworkDeadline) : "—"}
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-semibold">
                          {formatDate(lesson.created_at)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════ */
  const renderGroupDetail = () => {
    if (viewMode === "table") {
      return renderLessonsTable();
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0 overflow-hidden items-stretch">
        {/* Left Side: Video Player & Homework */}
        <div className="lg:col-span-8 h-full overflow-y-auto flex flex-col gap-5 pr-1 pb-6 min-h-0">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm aspect-video relative shrink-0 flex items-center justify-center">
            {activeVideo && !videoLoadError ? (
              <video
                key={activeVideo.id}
                src={activeVideo.isHomeworkVideo ? `/files/files/${activeVideo.file}` : `/files/videos/${activeVideo.file}`}
                controls
                className="w-full h-full object-contain bg-black"
                autoPlay
                onError={() => setVideoLoadError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 bg-white">
                <img
                  src={logoImg}
                  alt="ApexEdu Logo"
                  className="w-56 h-auto mb-5 object-contain no-revert-logo"
                />
                <h3 className="text-xl font-bold text-slate-800">Video mavjud emas</h3>
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm shrink-0">
            <h3 className="font-bold text-slate-800 text-sm">
              {(() => {
                const topic = lessons.find(l => l.id === activeLessonId)?.topic;
                const videoName = activeVideo ? (activeVideo.name || activeVideo.file) : "";
                return topic ? (videoName ? `${topic} (${videoName})` : topic) : videoName;
              })()}
            </h3>
          </div>

          {/* Homework Section (Only shown if homework is not null) */}
          {activeHomeworkData?.homework && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4">
              {/* Tab Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex gap-6">
                  <button className="text-sm font-bold text-[#be8b5b] border-b-2 border-[#be8b5b] pb-3 -mb-[14px]">
                    Vazifalar
                  </button>
                </div>
                {activeHomeworkData.result?.grade !== undefined && activeHomeworkData.result?.grade !== null && (
                  <span className="text-sm font-extrabold text-[#be8b5b]">
                    Ball: {activeHomeworkData.result.grade}
                  </span>
                )}
              </div>

              {/* Homework Cards Container */}
              <div className="space-y-4 mt-3">
                
                {/* 1. Uyga vazifa Card */}
                <div className="bg-[#fdf8f4] border border-[#f5eae1] rounded-2xl p-5 relative">
                  <div className="flex items-center justify-between gap-4 mb-3 w-full">
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-slate-800 text-sm">Uyga vazifa</h4>
                    </div>
                    <div className="flex-none bg-[#dc3545] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      Uyga vazifa muddati: {(() => {
                        const date = new Date(activeHomeworkData.homework.created_at);
                        date.setHours(date.getHours() + 20);
                        return formatHomeworkDate(date);
                      })()}
                    </div>
                    <div className="flex-1 text-right">
                      <span className="text-xs text-slate-500 font-bold">
                        Fayllar soni: {activeHomeworkData.homework.file ? 1 : 0}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-slate-600 text-sm font-semibold mb-4 leading-relaxed">
                    {activeHomeworkData.homework.title}
                  </p>

                  {activeHomeworkData.homework.file && (
                    <a
                      href={`/files/files/${activeHomeworkData.homework.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-white px-4 py-3 border border-gray-200 rounded-xl hover:border-[#ebd2b8] hover:shadow-sm transition-all text-slate-700 font-semibold text-xs"
                    >
                      <svg width="18" height="18" fill="none" stroke="#be8b5b" strokeWidth="2.2" viewBox="0 0 24 24" className="shrink-0">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                      </svg>
                      {activeHomeworkData.homework.file}
                    </a>
                  )}

                  <div className="text-right text-slate-400 text-xs font-semibold mt-2">
                    {formatHomeworkDate(activeHomeworkData.homework.created_at)}
                  </div>
                </div>

                {/* 2. Mening jo'natmalarim Card OR Submit Form */}
                {activeHomeworkData.answer ? (
                  <div className="bg-[#fbfbfb] border border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-sm">Mening jo'natmalarim</h4>
                      <span className="text-xs text-slate-500 font-bold ml-auto">
                        Fayllar soni: {activeHomeworkData.answer.file ? 1 : 0}
                      </span>
                    </div>

                    <p className="text-slate-600 text-sm font-semibold mb-4 leading-relaxed">
                      {activeHomeworkData.answer.title || "—"}
                    </p>

                    {activeHomeworkData.answer.file && (
                      <a
                        href={`/files/homeworkAnswers/${activeHomeworkData.answer.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-white px-4 py-3 border border-gray-200 rounded-xl hover:border-[#ebd2b8] hover:shadow-sm transition-all text-slate-700 font-semibold text-xs"
                      >
                        <svg width="18" height="18" fill="none" stroke="#be8b5b" strokeWidth="2.2" viewBox="0 0 24 24" className="shrink-0">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                        </svg>
                        {activeHomeworkData.answer.file}
                      </a>
                    )}

                    <div className="text-right text-slate-400 text-xs font-semibold mt-2">
                      {formatHomeworkDate(activeHomeworkData.answer.created_at)}
                    </div>
                  </div>
                ) : (
                  <HomeworkSubmitForm
                    homeworkId={activeHomeworkData.homework.id}
                    onSuccess={() => fetchHomework(selectedGroup.id || selectedGroup.groupId, activeLessonId)}
                  />
                )}

                {/* 3. O'qituvchi izohi Card */}
                {activeHomeworkData.result && (
                  <div className="bg-[#fbfcfb] border border-green-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                      <h4 className="font-bold text-slate-800 text-sm">O'qituvchi izohi</h4>
                      <span className={`text-xs font-extrabold ml-auto ${
                        activeHomeworkData.result.homeworkStatus === "completed" || activeHomeworkData.result.homeworkStatus === "checked"
                          ? "text-[#28a745]"
                          : activeHomeworkData.result.homeworkStatus === "rejected"
                          ? "text-[#dc3545]"
                          : activeHomeworkData.result.homeworkStatus === "failed"
                          ? "text-[#dc3545]"
                          : "text-[#2196F3]"
                      }`}>
                        {activeHomeworkData.result.homeworkStatus === "completed" || activeHomeworkData.result.homeworkStatus === "checked" 
                          ? "Qabul qilingan" 
                          : activeHomeworkData.result.homeworkStatus === "rejected"
                          ? "Qaytarilgan" 
                          : activeHomeworkData.result.homeworkStatus === "failed"
                          ? "Bajarilmagan"
                          : "Kutayotganlar"}
                      </span>
                    </div>

                    <p className="text-slate-600 text-sm font-semibold mb-4 leading-relaxed">
                      {activeHomeworkData.result.title}
                    </p>

                    {(activeHomeworkData.result.teachers || activeHomeworkData.result.users) && (
                      <p className="text-slate-500 text-xs font-bold mb-2">
                        Tekshiruvchi: {activeHomeworkData.result.teachers 
                          ? `${activeHomeworkData.result.teachers.first_name} ${activeHomeworkData.result.teachers.last_name}` 
                          : `${activeHomeworkData.result.users.first_name} ${activeHomeworkData.result.users.last_name}`}
                      </p>
                    )}

                    <div className="text-right text-slate-400 text-xs font-semibold mt-2">
                      {formatHomeworkDate(activeHomeworkData.result.created_at)}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>

        {/* Right Side: Accordion list */}
        <div className="lg:col-span-4 h-full overflow-y-auto flex flex-col gap-4 pr-1 pb-6 min-h-0">
          {lessonsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-slate-200 border-t-[#ebd2b8] rounded-full animate-spin mb-3" />
              <span className="text-sm text-slate-400">Yuklanmoqda...</span>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
              <p className="text-slate-400 text-sm font-medium">Darslar topilmadi</p>
            </div>
          ) : (
            filteredLessons.map((lesson) => {
              const isExpanded = !!expandedLessons[lesson.id];
              const isActive = activeLessonId === lesson.id;
              
              const hasHomeworkVideo = isActive && activeHomeworkData?.homework?.file && isVideoFile(activeHomeworkData.homework.file);
              const hasVideos = lesson.videoCount > 0 || hasHomeworkVideo;
              const videos = lessonVideos[lesson.id] || [];
              const toggleAccordion = async () => {
                setExpandedLessons(prev => {
                  const wasExpanded = !!prev[lesson.id];
                  return wasExpanded ? {} : { [lesson.id]: true };
                });
                setActiveLessonId(lesson.id);
                fetchHomework(selectedGroup.id || selectedGroup.groupId, lesson.id);

                if (hasVideos) {
                  if (!lessonVideos[lesson.id]) {
                    const vids = await fetchLessonVideos(selectedGroup.id || selectedGroup.groupId, lesson.id);
                    if (vids && vids.length > 0) {
                      setActiveVideo(vids[0]);
                    }
                  } else {
                    const vids = lessonVideos[lesson.id];
                    if (vids && vids.length > 0) {
                      setActiveVideo(vids[0]);
                    }
                  }
                } else {
                  setActiveVideo(null);
                }
              };

              return (
                <div
                  key={lesson.id}
                  className={`bg-[#f5efe9] border border-[#f5eae1] rounded-2xl p-4 shadow-sm transition-all duration-200 shrink-0 ${
                    isExpanded && hasVideos ? "flex flex-col gap-3" : ""
                  }`}
                >
                  {/* Header */}
                  <div
                    onClick={toggleAccordion}
                    className={`flex items-center justify-between transition-colors select-none cursor-pointer p-2 ${
                      isExpanded
                        ? "bg-[#ebd2b8] rounded-xl p-4 w-full"
                        : "hover:bg-black/5 rounded-xl p-2 w-full"
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug truncate">
                        {lesson.topic}
                      </h4>
                      <p className="text-slate-500 text-xs mt-1 font-medium">
                        Dars sanasi: {formatDate(lesson.created_at)}
                      </p>
                    </div>

                    {hasVideos && (
                      <div className="text-slate-600 shrink-0">
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                          className={`transform transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Accordion Content (Videos List) */}
                  {hasVideos && isExpanded && (
                    <div className="space-y-3 mt-1">
                      {lesson.videoCount > 0 && videos.length === 0 ? (
                        <div className="flex items-center justify-center py-4 bg-white/40 rounded-xl">
                          <div className="w-5 h-5 border-2 border-indigo-400 border-t-indigo-600 rounded-full animate-spin" />
                        </div>
                      ) : (
                        videos.map((video, idx) => {
                          const isVideoActive = activeVideo?.id === video.id;
                          return (
                            <button
                              key={video.id}
                              onClick={() => {
                                setActiveVideo(video);
                                setActiveLessonId(lesson.id);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left text-sm font-semibold transition-all shadow-sm ${
                                isVideoActive
                                  ? "bg-[#ebd2b8] text-slate-900"
                                  : "bg-[#ebd2b8]/40 hover:bg-[#ebd2b8]/60 text-slate-700"
                              }`}
                            >
                              {isVideoActive ? (
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="shrink-0 text-slate-900">
                                  <circle cx="12" cy="12" r="10" />
                                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                                </svg>
                              ) : (
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="shrink-0 text-slate-600">
                                  <circle cx="12" cy="12" r="10" />
                                </svg>
                              )}
                              <span className="truncate flex-1">
                                {idx + 1}-video: {video.name || video.file}
                              </span>
                            </button>
                          );
                        })
                      )}

                      {hasHomeworkVideo && (() => {
                        const hwFile = activeHomeworkData.homework.file;
                        const hwTitle = activeHomeworkData.homework.title || hwFile;
                        const hwVideoObj = {
                          id: `homework-${activeHomeworkData.homework.id}`,
                          name: `Vazifa videosi: ${hwTitle}`,
                          file: hwFile,
                          isHomeworkVideo: true
                        };
                        const isVideoActive = activeVideo?.id === hwVideoObj.id;
                        return (
                          <button
                            key={hwVideoObj.id}
                            onClick={() => {
                              setActiveVideo(hwVideoObj);
                              setActiveLessonId(lesson.id);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl text-left text-sm font-semibold transition-all shadow-sm ${
                              isVideoActive
                                ? "bg-[#ebd2b8] text-slate-900"
                                : "bg-[#ebd2b8]/40 hover:bg-[#ebd2b8]/60 text-slate-700"
                            }`}
                          >
                            {isVideoActive ? (
                              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="shrink-0 text-slate-900">
                                <circle cx="12" cy="12" r="10" />
                                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                              </svg>
                            ) : (
                              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" className="shrink-0 text-slate-600">
                                <circle cx="12" cy="12" r="10" />
                              </svg>
                            )}
                            <span className="truncate flex-1">
                              Vazifa videosi: {hwTitle}
                            </span>
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPassError("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("Yangi parol va tasdiqlash paroli bir-biriga mos kelmadi.");
      return;
    }

    if (newPassword.length < 4) {
      setPassError("Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    setPassLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/students/my/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPassSuccess("Parolingiz muvaffaqiyatli o'zgartirildi!");
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setPassSuccess("");
        }, 1500);
      } else {
        setPassError(data.message || "Parolni o'zgartirishda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error(err);
      setPassError("Server bilan bog'lanishda xatolik.");
    } finally {
      setPassLoading(false);
    }
  };

  const renderSettings = () => {
    if (profileLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-slate-200 border-t-[#ebd2b8] rounded-full animate-spin" />
          <span className="text-sm text-slate-400">Yuklanmoqda...</span>
        </div>
      );
    }

    const birthDateFormatted = profile?.birth_date ? formatDate(profile.birth_date) : "-";

    return (
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Shaxsiy ma'lumotlar Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-6">Shaxsiy ma'lumotlar</h3>
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Photos section */}
            <div className="flex gap-6 items-start flex-wrap shrink-0">
              {/* Namuna Photo */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-40 border border-gray-200 rounded-lg overflow-hidden flex flex-col justify-between p-1 bg-white shadow-sm">
                  <img src={avatarNamuna} alt="Namuna" className="w-full h-32 object-cover rounded" />
                  <span className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-wide">Namuna</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 text-center max-w-[140px] leading-tight">
                  500x500 o'lcham, JPEG, JPG, PNG format, maksimum 2MB
                </p>
              </div>

              {/* Student Photo */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#be8b5b] shadow-sm bg-gray-50 flex items-center justify-center">
                  {profile?.photo ? (
                    <img src={profile.photo} alt="Student avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-extrabold text-slate-400">
                      {profile?.first_name?.charAt(0).toUpperCase() || "S"}
                    </span>
                  )}
                </div>
                <span className="mt-4 px-3 py-1 rounded-full text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200">
                  Talabga mos
                </span>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 flex-1 w-full lg:border-l lg:pl-8 lg:border-gray-100">
              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-semibold">Ism</span>
                <p className="text-sm font-extrabold text-slate-800">{profile?.first_name || "—"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-semibold">Familiya</span>
                <p className="text-sm font-extrabold text-slate-800">{profile?.last_name || "—"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-semibold">Telefon raqam</span>
                <p className="text-sm font-extrabold text-slate-800">{profile?.phone || "—"}</p>
                {profile?.phone && (
                  <p className="text-sm font-extrabold text-slate-800">{profile.phone}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-semibold">Tug'ilgan sana</span>
                <p className="text-sm font-extrabold text-slate-800">{birthDateFormatted}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-semibold">Jinsi</span>
                <p className="text-sm font-extrabold text-slate-800">Male</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-gray-400 font-semibold">HH ID</span>
                <p className="text-sm font-extrabold text-slate-800">{profile?.id || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action cards row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Kirish card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3 min-h-[120px]">
            <h4 className="font-bold text-slate-800 text-sm">Kirish</h4>
            <p className="text-slate-500 font-bold text-sm mt-auto">{profile?.id || "—"}</p>
          </div>

          {/* Parol card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3 min-h-[120px] relative">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">Parol</h4>
              <button
                onClick={() => {
                  setIsPasswordModalOpen(true);
                  setPassError("");
                  setPassSuccess("");
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
            </div>
            <p className="text-slate-800 font-bold text-lg tracking-widest mt-auto">••••••••</p>
          </div>

          {/* Bildirishnoma sozlamalari card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3 min-h-[120px]">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-sm">Bildirishnoma sozlamalari</h4>
              <button className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPasswordModal = () => {
    if (!isPasswordModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black text-slate-800">Parolni o'zgartirish</h3>
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-slate-500 font-semibold mb-6">Quyidagi ma'lumotlarni to'ldiring</p>

          <form onSubmit={handlePasswordChange} className="space-y-5">
            {/* Amaldagi parol */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-500 font-bold">Amaldagi parol</label>
              <div className="relative">
                <input
                  type={showCurrentPass ? "text" : "password"}
                  placeholder="Parolingizni kiriting"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 text-sm font-semibold border border-gray-200 rounded-xl outline-none focus:border-[#be8b5b] focus:ring-2 focus:ring-[#be8b5b]/10 transition-all text-slate-700 placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPass ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Yangi parol */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-500 font-bold">Yangi parol</label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  placeholder="Parolingizni kiriting"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 text-sm font-semibold border border-gray-200 rounded-xl outline-none focus:border-[#be8b5b] focus:ring-2 focus:ring-[#be8b5b]/10 transition-all text-slate-700 placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Parolni tasdiqlash */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-slate-500 font-bold">Parolni tasdiqlash</label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="Parolingizni kiriting"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-11 py-3 text-sm font-semibold border border-gray-200 rounded-xl outline-none focus:border-[#be8b5b] focus:ring-2 focus:ring-[#be8b5b]/10 transition-all text-slate-700 placeholder-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error and Success messages */}
            {passError && (
              <p className="text-xs text-red-500 font-bold bg-red-50 border border-red-200 rounded-lg p-2.5">{passError}</p>
            )}
            {passSuccess && (
              <p className="text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">{passSuccess}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={passLoading}
              className="w-full bg-[#be8b5b] hover:bg-[#a97b4f] text-white font-extrabold text-sm py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-2"
            >
              {passLoading ? "Kutilmoqda..." : "Saqlash"}
            </button>
          </form>
        </div>
      </div>
    );
  };

  /* ═══════════════════════════════════════════════
   *  GROUPS LIST PAGE
   * ═══════════════════════════════════════════════ */
  const renderGroups = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Guruhlarim</h2>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <button
          onClick={() => setActiveTab("faol")}
          className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "faol"
              ? "border-[#ebd2b8] text-slate-800"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Faol
        </button>
        <button
          onClick={() => setActiveTab("tugagan")}
          className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "tugagan"
              ? "border-[#ebd2b8] text-slate-800"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Tugagan
        </button>
      </div>

      <div className="mb-5">
        <div className="relative max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Guruh qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-[#ebd2b8] focus:ring-2 focus:ring-[#ebd2b8]/20 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b border-gray-200 bg-white">
                <th className="text-left px-5 py-4 text-xs font-bold text-slate-800">#</th>
                <th className="text-left px-5 py-4 text-xs font-bold text-slate-800">Guruh nomi</th>
                <th className="text-left px-5 py-4 text-xs font-bold text-slate-800">Yo'nalishi</th>
                <th className="text-left px-5 py-4 text-xs font-bold text-slate-800">O'qituvchi</th>
                <th className="text-left px-5 py-4 text-xs font-bold text-slate-800">Boshlash vaqti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-slate-200 border-t-[#ebd2b8] rounded-full animate-spin" />
                      <span className="text-sm text-slate-400">Yuklanmoqda...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                        <svg width="28" height="28" fill="none" stroke="#94a3b8" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                      <p className="text-slate-500 text-sm font-medium">
                        {activeTab === "faol" ? "Faol guruhlar topilmadi" : "Tugagan guruhlar yo'q"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredGroups.map((g, i) => {
                  const groupId = g.id || g.groupId;
                  const groupName = g.name || g.groupName || "—";
                  const courseName = g.courses?.name || g.course || "—";
                  const startDate = g.start_date || g.startDate;

                  const teacherCount = g.teachersCount !== undefined 
                    ? g.teachersCount 
                    : (g.teachers ? g.teachers.length : 0);

                  return (
                    <tr
                      key={groupId}
                      onClick={() => openGroupDetail(g)}
                      className="hover:bg-slate-50/60 border-b border-gray-100 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4 text-slate-500 font-medium">{i + 1}</td>
                      <td className="px-5 py-4 font-medium text-slate-800">{groupName}</td>
                      <td className="px-5 py-4 font-medium text-slate-800">{courseName}</td>
                      <td className="px-5 py-4">
                        <span className="w-6 h-6 inline-flex items-center justify-center text-white text-xs font-extrabold rounded-full bg-[#be8b5b]">
                          {teacherCount}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800">{formatDate(startDate)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════════════
   *  MAIN LAYOUT
   * ═══════════════════════════════════════════════ */
  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-60 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-gray-100 shrink-0">
          <span className="font-black text-[22px] tracking-tight select-none">
            <span className="text-[#0E3563]">Apex</span>
            <span className="text-[#3FA1DF]">Edu</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setSelectedGroup(null);
                  setLessons([]);
                  setLessonSearch("");
                  setExpandedLessons({});
                  setLessonVideos({});
                  setActiveVideo(null);
                  setActiveLessonId(null);
                  setViewMode("table");
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#ebd2b8] text-slate-900 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <span className={isActive ? "text-slate-900" : "text-slate-400"}>{item.svg}</span>
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Profile card at bottom */}
        <div className="p-3 shrink-0 mt-auto border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-xl bg-[#ebd2b8] flex items-center justify-center text-slate-900 font-bold text-sm shadow-sm">
              {user?.first_name?.charAt(0).toUpperCase() ?? "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-slate-400">Talaba</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 shadow-sm relative shrink-0">
          {/* Back button + Group name OR page title */}
          {activePage === "guruhlarim" && selectedGroup ? (
            <div className="flex items-center gap-3">
              <button
                onClick={goBackToGroups}
                className="w-8 h-8 rounded-lg bg-orange-50 hover:bg-orange-100 flex items-center justify-center text-orange-600 transition-colors"
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            </div>
          ) : (
            <span className="font-semibold text-slate-700 text-sm">{getTopbarTitle()}</span>
          )}

          <div className="flex-1" />

          {/* Search (topbar) */}
          {activePage === "guruhlarim" && selectedGroup && (
            <div className="relative mr-4">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Qidirish..."
                value={lessonSearch}
                onChange={(e) => setLessonSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white outline-none focus:border-[#ebd2b8] focus:ring-2 focus:ring-[#ebd2b8]/20 transition-all w-48"
              />
            </div>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-1.5 text-sm text-slate-600 font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
              onClick={() => setLang((l) => (l === "O'zbekcha" ? "English" : "O'zbekcha"))}
            >
              {lang}
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotificationsMenu((s) => !s)}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 border border-gray-200 relative transition-colors cursor-pointer"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>

              {showNotificationsMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotificationsMenu(false)} />
                  <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm">Bildirishnomalar</h4>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} ta yangi
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-slate-400 text-xs font-semibold">
                          Bildirishnomalar yo'q
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (!n.is_read) handleMarkAsRead(n.id);
                            }}
                            className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer text-left relative flex gap-2.5 ${
                              !n.is_read ? "bg-blue-50/20" : ""
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                {n.title}
                                {!n.is_read && (
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                                )}
                              </p>
                              <p className="text-slate-500 text-[11px] font-semibold leading-relaxed mt-1">
                                {n.message}
                              </p>
                              <p className="text-slate-400 text-[9px] font-bold mt-1.5">
                                {formatHomeworkDate(n.created_at)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-50 border border-gray-200 transition-colors"
            >
              {theme === "dark" ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            <div className="relative">
              <div
                onClick={() => setShowUserMenu((s) => !s)}
                className="w-9 h-9 rounded-xl bg-[#ebd2b8] flex items-center justify-center text-slate-900 font-bold text-sm cursor-pointer hover:bg-[#ebd2b8]/95 transition-colors"
              >
                {user?.first_name?.charAt(0).toUpperCase() ?? "S"}
              </div>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-11 w-48 bg-white rounded-xl border border-gray-100 shadow-xl z-50 py-1">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-semibold text-slate-800">{user?.first_name} {user?.last_name}</p>
                      <p className="text-xs text-slate-400">{user?.role}</p>
                    </div>
                    <button
                      onClick={() => { setShowUserMenu(false); onLogout && onLogout(); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                      </svg>
                      Chiqish
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main area */}
        <main className={`flex-1 p-6 flex flex-col ${activePage === "guruhlarim" && selectedGroup ? "overflow-hidden" : "overflow-y-auto"}`}>
          {renderContent()}
        </main>
      </div>
      {renderPasswordModal()}
    </div>
  );
}

const formatHomeworkDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, "0");
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const day = pad(d.getDate());
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${hours}:${minutes} ${day} ${month}, ${year}`;
};

const isVideoFile = (filename) => {
  if (!filename) return false;
  const ext = filename.split('.').pop().toLowerCase();
  return ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv'].includes(ext);
};

function HomeworkSubmitForm({ homeworkId, onSuccess }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() && !file) {
      setError("Iltimos, izoh yozing yoki fayl biriktiring.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", title.trim());
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch(`/api/v1/students/${homeworkId}/answer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTitle("");
        setFile(null);
        onSuccess && onSuccess();
      } else {
        setError(data.message || "Vazifani jo'natishda xatolik yuz berdi.");
      }
    } catch (err) {
      console.error(err);
      setError("Server bilan bog'lanishda xatolik.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
      <h4 className="font-bold text-slate-800 text-sm">Vazifani topshirish</h4>
      
      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-500 font-bold">Tavsif yoki havola (URL):</label>
        <textarea
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full h-24 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#ebd2b8] focus:ring-2 focus:ring-[#ebd2b8]/20 transition-all resize-none font-semibold"
          placeholder="Vazifa havolasi yoki izoh..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs text-slate-500 font-bold">Fayl biriktirish (ixtiyoriy):</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#ebd2b8]/20 file:text-slate-800 hover:file:bg-[#ebd2b8]/30 file:cursor-pointer"
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 font-bold">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#ebd2b8] hover:bg-[#ebd2b8]/90 text-slate-900 font-extrabold text-sm py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {submitting ? "Yuklanmoqda..." : "Topshirish"}
      </button>
    </form>
  );
}
