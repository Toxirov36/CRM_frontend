import { useState } from "react";
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

      localStorage.setItem("token", data.accessToken);

      const base64 = data.accessToken.split('.')[1];
      const decoded = JSON.parse(atob(base64));


      onLogin({
        ...decoded,
        fullName: decoded.first_name || decoded.phone || "Admin",
        role: decoded.role || decoded.roles?.[0] || "USER",
      });

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
            LOGIN
          </h1>

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
          <div className="flex items-center bg-indigo-50 rounded-xl px-4 py-3 mb-6 gap-3">
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
              type="password"
              placeholder="Password"
              className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-500 text-xs mb-3 text-center">{error}</p>
          )}

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
          <button className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl mb-3 hover:bg-gray-50 transition-colors duration-200 text-sm text-gray-700">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
              alt="Google"
            />
            Login with <span className="font-bold">Google</span>
          </button>

          {/* FACEBOOK */}
          <button className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-sm text-gray-700">
            <img
              src="https://www.svgrepo.com/show/475647/facebook-color.svg"
              className="w-5 h-5"
              alt="Facebook"
            />
            Login with <span className="font-bold">Facebook</span>
          </button>
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

// #6d28d9