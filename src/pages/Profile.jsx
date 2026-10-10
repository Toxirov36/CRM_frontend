import { useState } from "react";
import { User, Lock, Settings, ShieldCheck, Mail, Phone, MapPin, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { useTheme } from "../components/theme-provider";
import { useLanguage } from "../context/language-context";

export default function Profile({ user, setUser }) {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("info"); // 'info', 'security', 'preferences'
  
  // Profile form states
  const [firstName, setFirstName] = useState(user?.first_name || user?.fullName?.split(" ")[0] || "Jamshid");
  const [lastName, setLastName] = useState(user?.last_name || user?.fullName?.split(" ")[1] || "Tolipov");
  const [email, setEmail] = useState(user?.email || "jamshid@apexedu.uz");
  const [phone, setPhone] = useState(user?.phone || "+998 90 123 45 67");
  const [address, setAddress] = useState(user?.address || "Toshkent shahri, Chilonzor tumani");
  
  // Security form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  // Preferences states
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [browserNotif, setBrowserNotif] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    // Simulate API call
    setTimeout(() => {
      try {
        const updatedUser = {
          ...user,
          first_name: firstName,
          last_name: lastName,
          fullName: `${firstName} ${lastName}`,
          email,
          phone,
          address
        };
        
        localStorage.setItem("user", JSON.stringify(updatedUser));
        if (setUser) {
          setUser(updatedUser);
        }
        setSuccessMsg("Profil ma'lumotlari muvaffaqiyatli saqlandi!");
      } catch (err) {
        setErrorMsg("Ma'lumotlarni saqlashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg("Barcha parollarni kiriting");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Yangi parollar bir-biriga mos kelmadi");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    
    // Simulate API call for password reset
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg("Parol muvaffaqiyatli yangilandi!");
      setCurrentPassword("");
      setNewPassword("");
      confirmPassword("");
    }, 1000);
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg("Bildirishnoma sozlamalari saqlandi!");
    }, 500);
  };

  return (
    <div className="pb-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Header Banner Section */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-6 md:p-8 text-white shadow-xl overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-xl" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-lg" />
        
        <div className="relative flex flex-col md:flex-row items-center gap-6 z-10">
          {/* Avatar Ring */}
          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white font-extrabold text-3xl md:text-4xl shadow-inner">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-md" title="Faol">
              <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
            </span>
          </div>
          
          {/* Profile Quick Title */}
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">{firstName} {lastName}</h1>
              <span className="px-2.5 py-0.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/20 text-[10px] font-bold tracking-widest uppercase">
                {user?.role || "TEACHER"}
              </span>
            </div>
            <p className="text-white/80 text-sm font-medium mb-3 flex items-center justify-center md:justify-start gap-1.5">
              <Mail className="w-4 h-4 text-white/60" /> {email}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-xs text-white/90 font-bold bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/10 w-fit">
              <div>
                <span className="text-white/60 font-semibold block mb-0.5">{t("profile.branch", "Filial")}</span>
                Toshkent Filiali
              </div>
              <div className="border-r border-white/20" />
              <div>
                <span className="text-white/60 font-semibold block mb-0.5">{t("profile.status", "Status")}</span>
                <span className="text-emerald-300">{t("common.active", "Faol")}</span>
              </div>
              <div className="border-r border-white/20" />
              <div>
                <span className="text-white/60 font-semibold block mb-0.5">{t("common.group", "Guruh")}</span>
                5 {t("profile.groups_count", "ta faol guruh")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-3">{t("profile.settings", "Sozlamalar")}</h3>
            
            <button
              onClick={() => setActiveTab("info")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "info"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <User className="w-4 h-4" />
              {t("profile.personal_info", "Shaxsiy ma'lumotlar")}
            </button>
            
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Lock className="w-4 h-4" />
              {t("profile.security", "Xavfsizlik & Parol")}
            </button>
            
            <button
              onClick={() => setActiveTab("preferences")}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === "preferences"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Settings className="w-4 h-4" />
              {t("profile.notifications", "Bildirishnomalar")}
            </button>
            
            <div className="border-t border-gray-100 my-4 pt-4 px-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                {t("profile.account_secured", "Hisob himoyalangan")}
              </div>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
            {/* Status alerts */}
            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <Check className="w-4 h-4 shrink-0 bg-emerald-500 text-white rounded-full p-0.5" />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-500 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
                {errorMsg}
              </div>
            )}

            {/* TAB 1: PROFILE INFO */}
            {activeTab === "info" && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-800 mb-1">{t("profile.personal_info", "Shaxsiy ma'lumotlar")}</h2>
                  <p className="text-slate-400 text-xs font-semibold">{t("profile.personal_sub", "Tizimdagi profilingiz ma'lumotlarini tahrirlang.")}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">{t("profile.first_name", "Ism")}</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">{t("profile.last_name", "Familiya")}</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {t("profile.phone", "Telefon raqam")}
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> {t("profile.email", "Elektron pochta")}
                    </label>
                    <input
                      type="email"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t("profile.address", "Yashash manzili")}
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="pt-4 border-t border-gray-50 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("profile.saving", "Saqlanmoqda...")}
                      </>
                    ) : (
                      t("profile.save_changes", "O'zgarishlarni saqlash")
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: SECURITY */}
            {activeTab === "security" && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-800 mb-1">{t("profile.security_settings", "Xavfsizlik sozlamalari")}</h2>
                  <p className="text-slate-400 text-xs font-semibold">{t("profile.security_sub", "Tizimga kirish parolini yangilang.")}</p>
                </div>

                {/* CURRENT PASSWORD */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">{t("profile.current_pass", "Joriy parol")}</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      className="w-full border border-gray-200 rounded-xl pl-4 pr-11 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* NEW PASSWORD */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">{t("profile.new_pass", "Yangi parol")}</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      className="w-full border border-gray-200 rounded-xl pl-4 pr-11 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t("profile.min_6_chars", "Kamida 6 ta belgi")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">{t("profile.confirm_pass", "Yangi parolni tasdiqlang")}</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      className="w-full border border-gray-200 rounded-xl pl-4 pr-11 py-3 text-sm font-semibold outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t("profile.updating", "Yangilanmoqda...")}
                      </>
                    ) : (
                      t("profile.update_pass", "Parolni yangilash")
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 3: PREFERENCES */}
            {activeTab === "preferences" && (
              <form onSubmit={handleSavePreferences} className="space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-800 mb-1">{t("profile.preferences_title", "Tizim sozlamalari")}</h2>
                  <p className="text-slate-400 text-xs font-semibold">{t("profile.preferences_sub", "Tizim ko'rinishi va bildirishnomalarini sozlang.")}</p>
                </div>

                <div className="space-y-4">
                  {/* Theme Selector */}
                  <div className="flex flex-col gap-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700">{t("profile.theme_title", "Tizim mavzusi")}</h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{t("profile.theme_sub", "Ilova interfeysining ko'rinishini sozlang.")}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setTheme("light")}
                        className={`py-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                          theme === "light"
                            ? "bg-white border-indigo-500 text-indigo-600 shadow-sm"
                            : "bg-white/50 border-gray-200 text-slate-600 hover:bg-white"
                        }`}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                        </svg>
                        {t("profile.theme_light", "Yorug'")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme("dark")}
                        className={`py-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                          theme === "dark"
                            ? "bg-white border-indigo-500 text-indigo-600 shadow-sm"
                            : "bg-white/50 border-gray-200 text-slate-600 hover:bg-white"
                        }`}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                        {t("profile.theme_dark", "Qorong'u")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheme("system")}
                        className={`py-3 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-2 cursor-pointer ${
                          theme === "system"
                            ? "bg-white border-indigo-500 text-indigo-600 shadow-sm"
                            : "bg-white/50 border-gray-200 text-slate-600 hover:bg-white"
                        }`}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        {t("profile.theme_system", "Tizim")}
                      </button>
                    </div>
                  </div>

                  {/* Email Notif */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex-1 pr-4">
                      <h4 className="text-sm font-bold text-slate-700">{t("profile.email_notifs", "Elektron pochta xabarlari")}</h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{t("profile.email_notifs_desc", "Yangi topshiriqlar, xabarlar yoki tizim yangilanishlari haqida pochtangizga xat yuborish.")}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={emailNotif}
                        onChange={() => setEmailNotif(!emailNotif)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* SMS Notif */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex-1 pr-4">
                      <h4 className="text-sm font-bold text-slate-700">{t("profile.sms_notifs", "SMS bildirishnomalar")}</h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{t("profile.sms_notifs_desc", "Darslar o'zgarishi, yangi dars jadvallari va muhim bildirishnomalar haqida telefoningizga SMS yuborish.")}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={smsNotif}
                        onChange={() => setSmsNotif(!smsNotif)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {/* Browser Notif */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex-1 pr-4">
                      <h4 className="text-sm font-bold text-slate-700">{t("profile.browser_notifs", "Brauzer bildirishnomalari")}</h4>
                      <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{t("profile.browser_notifs_desc", "Tizim ochiq bo'lgan vaqtda push bildirishnomalari orqali xabardor qilish.")}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={browserNotif}
                        onChange={() => setBrowserNotif(!browserNotif)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
                  >
                    {t("profile.save_preferences", "Sozlamalarni saqlash")}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
