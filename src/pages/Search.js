// src/pages/Search.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Search() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [time, setTime] = useState("All"); // ไม่มีเวลาใน /movie ต้องไปดูจาก /showtime
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ป้องกัน response เก่าทับใหม่
  const reqId = useRef(0);

  // เวลาทุก 30 นาที (10:00–23:00)
  const showTimes = useMemo(() => {
    const times = [];
    for (let m = 600; m <= 1380; m += 30) {
      const h = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      times.push(`${h}:${mm}`);
    }
    return times;
  }, []);

  // ---- ฟังก์ชันยิงค้นหา (ใช้ทั้งออโต้และตอนกดปุ่ม) ----
  const fetchSearch = async (q, g, t, currentReq) => {
    const noFilters = q.trim() === "" && g === "All";

    try {
      setLoading(true);
      setErr("");

      // 1) ดึงรายการหนังตามชื่อ/หมวด
      let result = [];
      if (noFilters) {
        const res = await api.get("/movie");
        result = res.data?.movies || [];
      } else {
        const params = {};
        if (q.trim() !== "") params.title = q.trim();
        if (g !== "All") params.genre = g;

        const res = await api.get("/movie/search", { params });
        result = res.data?.movies || [];
      }

      // 2) ถ้าเลือกเวลา -> ไปดึง /showtime แล้วกรองด้วยเวลา จากนั้นแมตช์ movie_id
      if (t !== "All") {
        // ดึงทุก showtime (backend ไม่มีพารามิเตอร์ time ให้กรองที่ฝั่ง client)
        const stRes = await api.get("/showtime");
        const showtimes = stRes?.data?.showtimes || [];

        // เก็บ movie_id ของรอบที่มีเวลาเท่ากับ t (เปรียบเทียบ HH:MM)
        const movieIdsAtTime = new Set(
          showtimes
            .filter((s) => (s?.show_time || "").slice(0, 5) === t)
            .map((s) => s.movie_id)
        );

        result = result.filter((m) => movieIdsAtTime.has(m.movie_id ?? m.id));
      }

      // อัปเดตเฉพาะถ้าเป็นคำขอรอบล่าสุด
      if (currentReq === reqId.current) {
        setMovies(result);
      }
    } catch (e) {
      if (currentReq === reqId.current) {
        setErr(e?.response?.data?.error || "Search failed");
      }
    } finally {
      if (currentReq === reqId.current) setLoading(false);
    }
  };

  // ✅ ออโต้ค้นหาด้วย debounce เมื่อพิมพ์/เปลี่ยนตัวกรอง
  useEffect(() => {
    const current = ++reqId.current;
    const handle = setTimeout(() => {
      fetchSearch(query, genre, time, current);
    }, 300);
    return () => clearTimeout(handle);
  }, [query, genre, time]);

  // ✅ ปุ่ม Search (ยิงทันที)
  const handleManualSearch = () => {
    const current = ++reqId.current;
    fetchSearch(query, genre, time, current);
  };

  return (
    <div className="text-white font-battambang items-center flex flex-col pb-10">
      {/* Title */}
      <div className="px-44 pt-12 w-full">
        <h2 className="font-goldman text-4xl font-bold text-[#8F00D7] drop-shadow-[0_0_15px_rgba(143,0,215,0.9)]">
          Search
        </h2>
      </div>

      {/* Form */}
      <div className="mt-8 flex gap-4 flex-wrap justify-center">
        <input
          type="text"
          placeholder="Movie Name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-gradient-to-r from-purple-900 to-indigo-900 px-4 py-2 rounded-lg w-72 focus:outline-none text-white"
        />

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="bg-gradient-to-r from-purple-900 to-indigo-900 px-4 py-2 rounded-lg w-48 focus:outline-none"
        >
          <option value="All" className="bg-black text-white">Genre</option>
          <option value="Action" className="bg-black text-white">Action</option>
          <option value="Drama" className="bg-black text-white">Drama</option>
          <option value="Comedy" className="bg-black text-white">Comedy</option>
          <option value="Sci-Fi" className="bg-black text-white">Sci-Fi</option>
          <option value="Romance" className="bg-black text-white">Romance</option>
          <option value="Thriller" className="bg-black text-white">Thriller</option>
          <option value="Horror" className="bg-black text-white">Horror</option>
          <option value="Animation" className="bg-black text-white">Animation</option>
          <option value="Fantasy" className="bg-black text-white">Fantasy</option>
        </select>

        {/* ShowTime (ฟิลเตอร์ด้วย /showtime) */}
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="bg-gradient-to-r from-purple-900 to-indigo-900 px-4 py-2 rounded-lg w-48 focus:outline-none"
        >
          <option value="All" className="bg-black text-white">ShowTime</option>
          {showTimes.map((t) => (
            <option key={t} value={t} className="bg-black text-white">
              {t}
            </option>
          ))}
        </select>

        {/* ปุ่ม Search กลับมาแล้ว */}
        <button
          onClick={handleManualSearch}
          className="bg-purple-600 px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Error */}
      {err && <div className="mt-4 text-red-400 text-sm">{err}</div>}

      {/* Results */}
      <div className="px-10 mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-44 h-64 rounded-lg bg-white/10 animate-pulse" />
          ))
        ) : movies.length > 0 ? (
          movies.map((movie) => {
            const id = movie.movie_id ?? movie.id;
            return (
              <Link
                to={`/detail/${id}`}
                key={id}
                className="flex flex-col items-center group"
                title={movie.title}
              >
                <img
                  src={movie.poster || "/no-poster.png"}
                  alt={movie.title}
                  className="w-44 h-64 object-cover rounded-lg shadow-lg group-hover:scale-105 transition"
                />
                <p className="mt-2 text-sm text-center line-clamp-2">{movie.title}</p>
              </Link>
            );
          })
        ) : (
          <p className="text-gray-400 col-span-4 text-center">No movies found</p>
        )}
      </div>
    </div>
  );
}
