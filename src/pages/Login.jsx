import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import studyImg from "../images/studyguy.png";

export default function Login({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {

    if (!username.trim()) {
      setError("Telefon raqamni kiriting");
      return;
    }
    if (!password.trim()) {
      setError("Parolni kiriting");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: username.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login yoki parol noto'g'ri");
        return;
      }

      const base64 = data.accessToken.split('.')[1];
      const base64Fixed = base64.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64Fixed));

      const userData = {
        ...decoded,
        fullName: decoded.first_name || decoded.phone || "Admin",
        role: decoded.role || "USER",
      };
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("user", JSON.stringify(userData));
      onLogin(userData);


    } catch (err) {
      setError("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const [view, setView] = useState("login"); // 'login' or 'forgot'
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSwitchView = (newView) => {
    setView(newView);
    setStep(1);
    setError("");
    setPhone("");
    setOtpValues(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-slot-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      const newOtpValues = [...otpValues];
      if (!otpValues[index] && index > 0) {
        newOtpValues[index - 1] = "";
        setOtpValues(newOtpValues);
        const prevInput = document.getElementById(`otp-slot-${index - 1}`);
        if (prevInput) prevInput.focus();
      } else {
        newOtpValues[index] = "";
        setOtpValues(newOtpValues);
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const newOtpValues = pastedData.split("");
    setOtpValues(newOtpValues);
    const lastInput = document.getElementById("otp-slot-5");
    if (lastInput) lastInput.focus();
  };

  const handleSendCode = async () => {
    if (!phone.trim()) {
      setError("Telefon raqamni kiriting");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Kod yuborishda xatolik yuz berdi");
        return;
      }
      if (data.phone) {
        setPhone(data.phone);
      }
      setStep(2);
    } catch (err) {
      setError("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    const finalCode = otpValues.join("");
    if (finalCode.length < 6) {
      setError("Tasdiqlash kodini to'liq kiriting");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code: finalCode })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Kod noto'g'ri yoki muddati tugagan");
        return;
      }
      setStep(3);
    } catch (err) {
      setError("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim()) {
      setError("Yangi parolni kiriting");
      return;
    }
    if (newPassword.trim().length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      setError("Parollar bir-biriga mos kelmadi");
      return;
    }
    const finalCode = otpValues.join("");
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), code: finalCode, newPassword: newPassword.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Parolni o'zgartirishda xatolik yuz berdi");
        return;
      }
      alert("Parol muvaffaqiyatli o'zgartirildi!");
      handleSwitchView("login");
    } catch (err) {
      setError("Server bilan bog'lanishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* LEFT SIDE */}
      <div className="flex-1 flex items-center justify-center bg-white px-10 py-12">
        <div className="w-full max-w-sm">
          {/* Title */}
          <h1 className="text-3xl font-black text-gray-900 tracking-widest mb-8 text-center">
            {view === "login" ? "LOGIN" : "RESET PASSWORD"}
          </h1>

          {view === "login" ? (
            <>
              <p className="text-center text-sm text-gray-500 mb-4">Welcome Back!</p>

              {/* USERNAME */}
              <div className="flex items-center bg-indigo-50 rounded-xl px-4 py-3 mb-4 gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-gray-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Username"
                  className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              {/* PASSWORD */}
              <div className="flex items-center bg-indigo-50 rounded-xl px-4 py-3 mb-6 gap-3 relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-gray-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.8}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* ERROR */}
              {error && (
                <p className="text-red-500 text-xs mb-3 text-center">{error}</p>
              )}

              {/* FORGOT PASSWORD LINK */}
              <div className="text-right mb-4">
                <button
                  type="button"
                  onClick={() => handleSwitchView("forgot")}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors duration-200 cursor-pointer"
                >
                  Parolni unutdingizmi?
                </button>
              </div>

              {/* LOGIN BUTTON */}
              <button
                onClick={handleLogin}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm
                  bg-gradient-to-r from-violet-500 to-indigo-500
                  hover:from-violet-600 hover:to-indigo-600
                  shadow-md hover:shadow-lg transition-all duration-200 mb-6"
              >
                Login Now
              </button>

              {/* DIVIDER */}
              <p className="text-center text-sm text-gray-500 mb-4">
                <span className="font-bold text-gray-800">Login</span> with Others
              </p>

              {/* GOOGLE */}
              <button
                onClick={() => window.location.href = "http://localhost:3000/api/v1/auth/google"}
                className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl mb-3 hover:bg-gray-50 transition-colors duration-200 text-sm text-gray-700 cursor-pointer"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5 h-5"
                  alt="Google"
                />
                Login with <span className="font-bold">Google</span>
              </button>
            </>
          ) : (
            <>
              {/* FORGOT PASSWORD FORM */}
              {step === 1 && (
                <>
                  <p className="text-center text-sm text-gray-500 mb-4">
                    Telefon raqamingizni kiriting. Biz sizga tasdiqlash kodini yuboramiz.
                  </p>
                  
                  {/* PHONE INPUT */}
                  <div className="flex items-center bg-indigo-50 rounded-xl px-4 py-3 mb-4 gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-400 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Telefon (masalan: 998901234567)"
                      className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs mb-3 text-center">{error}</p>
                  )}

                  <button
                    onClick={handleSendCode}
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm
                      bg-gradient-to-r from-violet-500 to-indigo-500
                      hover:from-violet-600 hover:to-indigo-600
                      shadow-md hover:shadow-lg transition-all duration-200 mb-4 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Yuborilmoqda..." : "Kod yuborish"}
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <p className="text-center text-sm text-gray-500 mb-6">
                    Sizning <b>{phone}</b> raqamingizga yuborilgan 6 xonali kodni kiriting.
                  </p>
                  
                  {/* 6-DIGIT OTP SLOTS */}
                  <div className="flex justify-between gap-2 mb-6">
                    {otpValues.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-slot-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        className="w-12 h-12 text-center text-lg font-bold border border-gray-200 rounded-xl bg-indigo-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all duration-200 text-gray-800"
                      />
                    ))}
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs mb-3 text-center">{error}</p>
                  )}

                  <button
                    onClick={handleVerifyCode}
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm
                      bg-gradient-to-r from-violet-500 to-indigo-500
                      hover:from-violet-600 hover:to-indigo-600
                      shadow-md hover:shadow-lg transition-all duration-200 mb-4 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Tekshirilmoqda..." : "Kodni tasdiqlash"}
                  </button>
                </>
              )}

              {step === 3 && (
                <>
                  <p className="text-center text-sm text-gray-500 mb-4">
                    Yangi parolingizni kiriting va uni tasdiqlang.
                  </p>
                  
                  {/* NEW PASSWORD INPUT */}
                  <div className="flex items-center bg-indigo-50 rounded-xl px-4 py-3 mb-4 gap-3 relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-400 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Yangi parol"
                      className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* CONFIRM PASSWORD INPUT */}
                  <div className="flex items-center bg-indigo-50 rounded-xl px-4 py-3 mb-4 gap-3 relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-400 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                      />
                    </svg>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Parolni tasdiqlash"
                      className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 pr-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs mb-3 text-center">{error}</p>
                  )}

                  <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm
                      bg-gradient-to-r from-violet-500 to-indigo-500
                      hover:from-violet-600 hover:to-indigo-600
                      shadow-md hover:shadow-lg transition-all duration-200 mb-4 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? "Saqlanmoqda..." : "Parolni yangilash"}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => handleSwitchView("login")}
                className="w-full py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-sm text-gray-600 font-semibold cursor-pointer"
              >
                Orqaga (Kirish sahifasi)
              </button>
            </>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div
        className="flex-1 hidden md:flex items-center justify-center relative overflow-hidden"
        style={{
          background: "#6d28d9",
        }}
      >
        <div>
          <img src={studyImg} alt="studyImg" />
        </div>
      </div>
    </div>
  );
}

