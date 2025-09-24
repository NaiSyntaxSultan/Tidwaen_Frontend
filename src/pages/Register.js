import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as registerApi } from "../functions/product"; // ← ใช้ฟังก์ชันแยกไฟล์
import { FaApple, FaFacebookF } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    confirm: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");    // ข้อผิดพลาดรวม (server/client)
  const [fieldErr, setFieldErr] = useState({}); // error ราย field (client)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const fe = {};
    if (!form.firstname.trim()) fe.firstname = "Required";
    if (!form.lastname.trim()) fe.lastname = "Required";
    if (!form.username.trim()) fe.username = "Required";
    if (!form.email.trim()) fe.email = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) fe.email = "Invalid email";
    if (!form.password) fe.password = "Required";
    if (form.password.length < 6) fe.password = "At least 6 characters";
    if (form.password !== form.confirm) fe.confirm = "Passwords do not match";
    if (!form.agree) fe.agree = "Please accept Terms";
    setFieldErr(fe);
    return Object.keys(fe).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        nickname: `${form.firstname.trim()} ${form.lastname.trim()}`.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      };
      const res = await registerApi(payload);
      // สำเร็จ -> ไปหน้า login
      // res.data: { success, message, user: { id, nickname, username, email } }
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full px-4 py-3 rounded-full bg-gray-900 text-white focus:outline-none transition duration-300 ease-in-out focus:scale-105";
  const errText = "text-xs text-red-400 mt-1 px-2";

  return (
    <div className="flex text-white h-[880px]">
      {/* 🟣 Form ซ้าย */}
      <div className="flex w-full md:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-4xl font-bold mb-2 text-center font-battambang">
            Create Account
          </h2>
          <p className="text-center text-gray-300 mb-8">
            <span className="font-saira text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-300 text-2xl md:text-3xl lg:text-4xl">
              TIDWAEN CINEMA
            </span>
          </p>

          {error && (
            <div className="mb-4 text-sm bg-red-950/40 border border-red-500/30 rounded-md px-3 py-2 text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="font-battambang space-y-3">
            {/* First + Last name */}
            <div className="flex gap-4">
              <div className="w-1/2">
                <input
                  type="text"
                  name="firstname"
                  value={form.firstname}
                  onChange={handleChange}
                  placeholder="First name"
                  className={`${inputBase} focus:ring-2 focus:ring-purple-500`}
                />
                {fieldErr.firstname && (
                  <div className={errText}>{fieldErr.firstname}</div>
                )}
              </div>

              <div className="w-1/2">
                <input
                  type="text"
                  name="lastname"
                  value={form.lastname}
                  onChange={handleChange}
                  placeholder="Last name"
                  className={`${inputBase} focus:ring-2 focus:ring-purple-500`}
                />
                {fieldErr.lastname && (
                  <div className={errText}>{fieldErr.lastname}</div>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className={`${inputBase} focus:ring-2 focus:ring-purple-500`}
              />
              {fieldErr.email && <div className={errText}>{fieldErr.email}</div>}
            </div>

            {/* Username */}
            <div>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                className={`${inputBase} focus:ring-2 focus:ring-purple-500`}
              />
              {fieldErr.username && <div className={errText}>{fieldErr.username}</div>}
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password (min 6)"
                className={`${inputBase} focus:ring-2 focus:ring-purple-500`}
                minLength={6}
              />
              {fieldErr.password && <div className={errText}>{fieldErr.password}</div>}
            </div>

            {/* Confirm Password */}
            <div>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Confirm password"
                className={`${inputBase} focus:ring-2 focus:ring-purple-500`}
              />
              {fieldErr.confirm && <div className={errText}>{fieldErr.confirm}</div>}
            </div>

            {/* Checkbox */}
            <label className="flex items-center gap-3 text-sm text-gray-300">
              <input
                type="checkbox"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                className="accent-purple-600"
              />
              I agree to the Terms & Privacy Policy
            </label>
            {fieldErr.agree && <div className={errText}>{fieldErr.agree}</div>}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-lg text-white bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="font-battambang text-gray-300 text-sm">
              or continue with
            </span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <div className="flex gap-6 justify-center">
            <button className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-lg shadow hover:scale-105 transition">
              <FcGoogle size={22} />
            </button>
            <button className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-lg shadow hover:scale-105 transition">
              <FaApple size={24} />
            </button>
            <button className="w-12 h-12 flex items-center justify-center bg-white text-blue-600 rounded-lg shadow hover:scale-105 transition">
              <FaFacebookF size={22} />
            </button>
          </div>

          <p className="font-battambang text-center text-sm text-gray-300 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="underline decoration-purple-500">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* 🟣 รูปอยู่ขวา */}
      <div className="hidden md:flex w-1/2 items-end justify-center">
        <img
          src="/pic1.png"
          alt="Cinema Robot"
          className="w-[90%] max-w-[650px] max-h-[90%] drop-shadow-2xl rounded-xl transform scale-x-[-1]"
        />
      </div>
    </div>

  );
};

export default Register;
