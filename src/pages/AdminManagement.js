// src/pages/AdminManagement.jsx
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

/* ---------- DatePicker (no libs) ---------- */
function DatePickerLite({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => value || new Date());
  const ref = useRef(null);

  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const headFmt = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  });

  const startOfMonth = new Date(view.getFullYear(), view.getMonth(), 1);
  const endOfMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0);
  const startWeekday = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const weeks = [];
  let day = 1 - startWeekday;
  while (day <= daysInMonth) {
    const row = [];
    for (let i = 0; i < 7; i++, day++) {
      row.push(new Date(view.getFullYear(), view.getMonth(), day));
    }
    weeks.push(row);
  }

  const isSameDate = (a, b) =>
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* display input */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-4 py-2 rounded-lg bg-[#1b0033] text-white focus:outline-none font-battambang"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {value ? fmt.format(value) : "Select a date"}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-72 rounded-xl bg-[#151515] text-white shadow-xl border border-white/10 p-3 font-battambang">
          {/* header */}
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() =>
                setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))
              }
              className="px-2 py-1 rounded hover:bg-white/10"
            >
              ‹
            </button>
            <div className="font-semibold">{headFmt.format(view)}</div>
            <button
              type="button"
              onClick={() =>
                setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))
              }
              className="px-2 py-1 rounded hover:bg-white/10"
            >
              ›
            </button>
          </div>

          {/* weekdays */}
          <div className="grid grid-cols-7 text-center text-xs text-gray-300 mb-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* days */}
          <div className="grid grid-cols-7 gap-1">
            {weeks.flat().map((d, idx) => {
              const inMonth = d.getMonth() === view.getMonth();
              const selected = value && isSameDate(d, value);
              const today = isSameDate(d, new Date());

              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    onChange(d);
                    setOpen(false);
                  }}
                  className={[
                    "h-9 rounded-md text-sm",
                    inMonth ? "text-white" : "text-gray-500",
                    selected
                      ? "bg-blue-600"
                      : today
                      ? "ring-1 ring-red-500/70"
                      : "hover:bg-white/10",
                  ].join(" ")}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Helpers for Duration in minutes ---------- */
const isPositiveInt = (v) => /^\d+$/.test(v) && Number(v) > 0;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const toHM = (minutes) => {
  const m = Number(minutes) || 0;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
};

export default function AdminManagement() {
  const navigate = useNavigate();

  // guard: admin only
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u?.role !== "admin") {
        navigate("/");
      }
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const DEFAULT_POSTER =
    "https://i.pinimg.com/736x/ef/c7/63/efc763050c4c3a5bc4ed05ab2851b091.jpg";

  const [preview, setPreview] = useState(DEFAULT_POSTER);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    duration: "", // minutes
    date: null, // Date object
    posterURL: "",
    theater: "",
  });

  const isValidUrl = (str) => {
    try {
      const u = new URL(str);
      return ["http:", "https:"].includes(u.protocol);
    } catch {
      return false;
    }
  };

  const validate = (fd = formData) => {
    const needTitle = !!fd.title.trim();
    const needGenre = !!fd.genre.trim();

    const durOk =
      isPositiveInt(fd.duration.trim()) &&
      clamp(Number(fd.duration.trim()), 1, 1440) === Number(fd.duration.trim());

    const needDate = !!fd.date;

    let needPosterOk = true;
    if (showUrlInput) {
      needPosterOk = !!fd.posterURL.trim() && isValidUrl(fd.posterURL.trim());
    }

    return {
      ok: needTitle && needGenre && durOk && needDate && needPosterOk,
    };
  };

  const canSubmit = useMemo(() => validate().ok, [formData, showUrlInput]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setPreview(DEFAULT_POSTER);
    setShowUrlInput(false);
    setFormData({
      title: "",
      genre: "",
      duration: "",
      date: null,
      posterURL: "",
      theater: "",
    });
  };

  // yyyy-MM-dd (normalize timezone)
  const dateISO = formData.date
    ? new Date(
        formData.date.getTime() - formData.date.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 10)
    : "";

  const DEFAULT_SHOW_TIME = "11:00";

  // HH:MM -> HH:MM:SS
  const normalizeTime = (t) =>
    /^\d{2}:\d{2}$/.test(String(t)) ? `${t}:00` : String(t);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate().ok || saving) return;

    const durationMinutes = Number(formData.duration.trim());

    try {
      setSaving(true);

      // 1) create movie
      const payloadMovie = {
        title: formData.title.trim(),
        genre: formData.genre.trim(),
        duration: durationMinutes,
        poster:
          showUrlInput && formData.posterURL.trim()
            ? formData.posterURL.trim()
            : preview,
        review: null,
        release_date: dateISO || null,
      };

      const movieRes = await api.post("/movie", payloadMovie);
      const movieId =
        movieRes?.data?.movie?.id ??
        movieRes?.data?.movie?.movie_id ??
        movieRes?.data?.id;
      if (!movieId) throw new Error("Create movie failed: no movie id");

      // 2) create showtime (send theater if provided)
      const payloadShow = {
        movie_id: movieId,
        show_date: dateISO, // YYYY-MM-DD
        show_time: normalizeTime(DEFAULT_SHOW_TIME),
        available_seats: 50,
      };
      if (formData.theater.trim()) {
        payloadShow.theater = formData.theater.trim();
      }

      await api.post("/showtime", payloadShow);

      alert("บันทึกสำเร็จ: สร้างหนังและรอบฉายแล้ว");
      handleCancel();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          err.message ||
          "บันทึกไม่สำเร็จ กรุณาลองใหม่"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className=" text-white font-battambang">
      <div className="px-44 pt-12 w-full">
        <h1 className="text-4xl font-bold font-goldman text-[#8F00D7] mb-10 drop-shadow-[0_0_15px_rgba(143,0,215,0.9)]">
          Management
        </h1>
      </div>
      <div className="w-full ">
        <div className="bg-black/40 rounded-2xl p-12 grid grid-cols-1 md:grid-cols-2 gap-12 w-[1150px] mx-auto">
          {/* Left */}
          <div className="flex flex-col items-center">
            {!showUrlInput ? (
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="mb-6 w-40 py-2 rounded-xl bg-[#8F00D7] hover:opacity-90 font-saira"
              >
                Upload
              </button>
            ) : (
              <div className="w-64 mb-2">
                <input
                  type="text"
                  placeholder="Enter image URL"
                  name="posterURL"
                  value={formData.posterURL}
                  onChange={(e) => {
                    const url = e.target.value;
                    setFormData((p) => ({ ...p, posterURL: url }));
                    setPreview(url.trim() ? url.trim() : DEFAULT_POSTER);
                  }}
                  className="w-64 px-4 py-2 rounded-lg bg-[#1b0033] text-white font-battambang outline-none ring-1 ring-white/10"
                />
              </div>
            )}

            <div className="w-64 h-96 mx-auto">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-xl"
                onError={() => setPreview(DEFAULT_POSTER)}
              />
            </div>
          </div>

          {/* Right */}
          <div>
            <form className="space-y-6 font-battambang" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-2">Title</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-96 px-4 py-2 rounded-lg bg-[#1b0033] text-white font-battambang outline-none ring-1 ring-white/10"
                />
              </div>

              <div>
                <label className="block mb-2">Genre</label>
                <input
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-96 px-4 py-2 rounded-lg bg-[#1b0033] text-white font-battambang outline-none ring-1 ring-white/10"
                />
              </div>

              {/* Duration + Theater (fixed row height; won't jump) */}
              <div className="w-96 grid grid-cols-2 gap-3 items-start">
                {/* Duration */}
                <div className="flex flex-col">
                  <label className="mb-1">Duration</label>
                  <input
                    name="duration"
                    placeholder="e.g. 120"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        duration: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    className="w-full px-4 py-2 rounded-lg bg-[#1b0033] text-white outline-none ring-1 ring-white/10"
                    inputMode="numeric"
                    autoComplete="off"
                  />
                  {/* พื้นที่สำหรับข้อความ ≈ ชั่วโมง (คงที่เสมอ) */}
                  <div className="h-5 mt-1 text-sm text-white/70">
                    {formData.duration && <>≈ {toHM(formData.duration)}</>}
                  </div>
                </div>

                {/* Theater */}
                <div className="flex flex-col">
                  <label className="mb-1">Theater</label>
                  <input
                    name="theater"
                    placeholder="e.g. Theater 3"
                    value={formData.theater}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, theater: e.target.value }))
                    }
                    className="w-full px-4 py-2 rounded-lg bg-[#1b0033] text-white outline-none ring-1 ring-white/10"
                    autoComplete="off"
                  />
                  {/* เว้นที่ว่างเท่ากับ Duration เพื่อไม่ให้แถวสูง-ต่ำ */}
                  <div className="h-5 mt-1"></div>
                </div>
              </div>

              <div>
                <label className="block mb-2">Date</label>
                <div className="w-96">
                  <DatePickerLite
                    value={formData.date}
                    onChange={(d) => {
                      setFormData((p) => ({ ...p, date: d }));
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <button
                  type="submit"
                  disabled={!canSubmit || saving}
                  className={`px-8 py-2 rounded-full font-saira transition ${
                    canSubmit && !saving
                      ? "bg-gradient-to-r from-[#560081] via-[#5335FF] to-[#1091FB]"
                      : "bg-gray-600 cursor-not-allowed"
                  }`}
                  aria-disabled={!canSubmit || saving}
                  title={
                    canSubmit ? (saving ? "Saving..." : "Save") : "กรอกข้อมูลให้ครบก่อนบันทึก"
                  }
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-2 rounded-full bg-gray-600 hover:bg-gray-700 font-saira"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* tips */}
            <div className="mt-4 text-sm text-white/60">
              * ระบบจะเปิดรอบฉายวันที่ที่เลือก เวลา {DEFAULT_SHOW_TIME}. หากต้องการเลือกเวลาเอง ค่อยเพิ่มฟิลด์เวลาในภายหลังได้
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
