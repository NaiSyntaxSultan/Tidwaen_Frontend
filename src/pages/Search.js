// src/pages/Search.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Search() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [time, setTime] = useState("All"); // backend ปัจจุบันยังไม่มี showtime ในตาราง movies
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // โหลดทั้งหมดเมื่อเข้าเพจครั้งแรก
  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await api.get("/movie");
        if (!mounted) return;
        setMovies(res.data?.movies || []);
      } catch (e) {
        setErr(e?.response?.data?.error || "Load movies failed");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
    return () => (mounted = false);
  }, []);

  // ค้นหา
  const handleSearch = async () => {
    const noFilters = query.trim() === "" && genre === "All";
    try {
      setLoading(true);
      setErr("");

      if (noFilters) {
        const res = await api.get("/movie");
        setMovies(res.data?.movies || []);
        return;
      }

      const params = {};
      if (query.trim() !== "") params.title = query.trim();
      if (genre !== "All") params.genre = genre;

      const res = await api.get("/movie/search", { params });
      let result = res.data?.movies || [];

      // หมายเหตุ: ถ้าในอนาคต backend ส่ง showtime: string[] มากับหนัง จะกรองเวลาที่นี่ได้เลย
      if (time !== "All") {
        result = result.filter(
          (m) => Array.isArray(m.showtime) && m.showtime.includes(time)
        );
      }

      setMovies(result);
    } catch (e) {
      setErr(e?.response?.data?.error || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Enter เพื่อค้นหา
  const onKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

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
          onKeyDown={onKeyDown}
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

        {/* ShowTime (UI พร้อม แต่ยังไม่ผูกกับ backend ตอนนี้) */}
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

        <button
          onClick={handleSearch}
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
