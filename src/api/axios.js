// src/api/axios.js
import axios from "axios";

function getToken() {
  // ลองอ่านได้หลายรูปแบบตามที่คุณเก็บ
  const t1 = localStorage.getItem("token");
  if (t1) return t1;
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    if (u?.token) return u.token;
  } catch {}
  return null;
}

const api = axios.create({
  baseURL: process.env.REACT_APP_API || "http://localhost:5000/api",
});

// แนบ authtoken ทุกคำขอ
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers["authtoken"] = token; // ← สำคัญ! backend รอ header นี้
  return config;
});

// handle 401 ทั่วแอป (ถ้ามีหน้า login ให้เปลี่ยนเป็น redirect)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      console.warn("Unauthorized: missing/expired token");
    }
    return Promise.reject(err);
  }
);

export default api;
