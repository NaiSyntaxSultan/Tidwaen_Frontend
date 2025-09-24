import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as apiLogin, saveAuth } from "../functions/product";
import { useAuth } from "../context/AuthContext";
import { FaApple, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuthLogin } = useAuth(); // ✅ ดึง login จาก Context
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiLogin(form.username, form.password);
      // สมมติรูปแบบ: res.data = { success, token, payload }
      saveAuth(res.data);                    // เก็บลง localStorage (ของคุณเดิม)
      setAuthLogin(res.data?.token);        // ✅ แจ้ง Context เพื่อให้ Navbar อัปเดตทันที
      navigate("/");                        // ไปหน้า Home หรือที่ต้องการ
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "เข้าสู่ระบบไม่สำเร็จ";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex text-white h-[880px]">
      {/* Left side - Image */}
      <div className="hidden md:flex w-1/2 items-end justify-center">
        <img
          src="/pic1.png"
          alt="Cinema Robot"
          className="w-[90%] max-w-[650px] max-h-[90%] drop-shadow-2xl rounded-xl"
        />
      </div>

      {/* Right side - Login Form */}
      <div className="font-battambang flex flex-col w-full md:w-1/2 justify-center items-center p-10">
        <h2 className="text-2xl font-bold md:text-4xl mb-6 text-center">
          Welcome To <br />
          <span className="font-saira text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-300">
            TIDWAEN CINEMA
          </span>
        </h2>

        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
          <input
            name="username"
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-full bg-gray-900 text-white 
                       focus:outline-none focus:ring-2 focus:ring-purple-500 
                       transition duration-300 ease-in-out focus:scale-105"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-full bg-gray-900 text-white 
                       focus:outline-none focus:ring-2 focus:ring-purple-500 
                       transition duration-300 ease-in-out focus:scale-105"
          />

          {error && (
            <div className="text-red-400 text-sm bg-red-950/40 border border-red-500/30 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-300 hover:underline hover:text-blue-400 transition"
            >
              Forget Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full text-lg text-white
                       bg-gradient-to-r from-purple-600 to-blue-500
                       hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Social login (placeholder) */}
        <div className="flex gap-6 mt-8">
          <button className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow hover:scale-105 transition">
            <FcGoogle size={22} />
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow hover:scale-105 transition">
            <FaApple size={24} className="text-black" />
          </button>
          <button className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow hover:scale-105 transition">
            <FaFacebookF size={22} className="text-[#1877F2]" />
          </button>
        </div>
      </div>
    </div>
  );
}
