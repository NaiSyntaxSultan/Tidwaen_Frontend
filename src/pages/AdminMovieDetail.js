// src/pages/AdminMovieDetail.js
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiEdit, FiTrash2, FiSearch } from "react-icons/fi";
import {
  listShowtimes,
  updateShowtime,
  removeShowtime,
  updateMovie,
  removeMovie,
} from "../functions/adminShowtime";

/* ===================== DatePickerLite (portal overlay) ===================== */
function DatePickerLite({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => value || new Date());
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const headFmt = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  });

  // calendar grid
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
      if (
        btnRef.current &&
        !btnRef.current.contains(e.target) &&
        !document.getElementById("datepicker-portal")?.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleToggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
    setOpen((o) => !o);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        className="w-full text-left px-4 py-2 rounded-lg bg-[#1b0033] text-white focus:outline-none"
      >
        {value ? fmt.format(value) : "Select a date"}
      </button>

      {open &&
        createPortal(
          <div
            id="datepicker-portal"
            className="absolute z-[9999] w-72 rounded-xl bg-[#151515] text-white shadow-xl border border-white/10 p-3"
            style={{ top: pos.top, left: pos.left }}
          >
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

            <div className="grid grid-cols-7 text-center text-xs text-gray-300 mb-1">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

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
          </div>,
          document.body
        )}
    </>
  );
}

/* ---------- Helpers ---------- */
const toHM = (minutes) => {
  const m = Number(minutes) || 0;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
};
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
const clampSeats = (n) => {
  const v = Number(n);
  if (Number.isNaN(v) || v < 0) return 0;
  if (v > 999) return 999;
  return v;
};
const normalizeTime = (s) => {
  if (!s) return "";
  const m = String(s).trim();
  if (/^\d{2}:\d{2}$/.test(m)) return m + ":00";
  if (/^\d{2}:\d{2}:\d{2}$/.test(m)) return m;
  return m;
};
const toOneDecimalOrNull = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(9.9, Math.round(n * 10) / 10));
};
// วันที่แบบปลอดภัย (กัน "0000-00-00", "", null)
const safeParseDate = (s) => {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s));
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

/* ===================== AdminMovieDetail ===================== */
export default function AdminMovieDetail() {
  const DEFAULT_POSTER =
    "https://i.pinimg.com/736x/ef/c7/63/efc763050c4c3a5bc4ed05ab2851b091.jpg";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // {showtime_id,movie_id,title,alsoDeleteMovie}
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    showtime_id: null,
    movie_id: null,
    title: "",
    genre: "",
    duration: "",
    theater: "",
    date: null,
    time: "",
    seats: "",
    posterURL: DEFAULT_POSTER,
    review: "",
  });

  const fmtDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const fmtTime = (t) => (t ? String(t).slice(0, 5) : "");

  // ===== Load =====
  const load = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await listShowtimes(); // GET /api/showtime
      const list = (res.data?.showtimes || []).map((s) => ({
        ...s,
        posterURL: s.poster || DEFAULT_POSTER,
        dateObj: safeParseDate(s.show_date),
      }));
      setRows(list);
    } catch (e) {
      const status = e?.response?.status;
      const body = e?.response?.data;
      const msg =
        (body && (body.error || body.message)) ||
        (status ? `HTTP ${status}` : "") ||
        e?.message ||
        "Failed to load showtimes";
      setLoadError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((r) =>
    String(r.title).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ===== Edit =====
  const openEdit = (row) => {
    setEditForm({
      showtime_id: row.showtime_id,
      movie_id: row.movie_id,
      title: row.title || "",
      genre: row.genre || "",
      duration: String(row.duration || ""),
      theater: row.theater || "",
      date: row.dateObj || null,
      time: row.show_time || "",
      seats: String(row.available_seats ?? ""),
      posterURL: row.posterURL || DEFAULT_POSTER,
      review: row.review ?? "",
    });
    setShowEditModal(true);
  };
  const cancelEdit = () => {
    if (saving) return;
    setShowEditModal(false);
  };

  const saveEdit = async () => {
    if (!editForm.title || !editForm.duration) {
      alert("Title และ Duration ห้ามว่าง");
      return;
    }
    if (Number.isNaN(Number(editForm.duration))) {
      alert("Duration ต้องเป็นตัวเลข (นาที)");
      return;
    }
    if (!(editForm.date instanceof Date)) {
      alert("กรุณาเลือก Date ของรอบฉาย");
      return;
    }

    const timePayload = normalizeTime(editForm.time || "00:00");

    const moviePayload = {
      title: editForm.title,
      genre: editForm.genre || null,
      duration: Number(editForm.duration || 0),
      poster: editForm.posterURL || null,
      review: toOneDecimalOrNull(editForm.review),
      release_date: null,
    };
    const showtimePayload = {
      theater: editForm.theater || null,
      show_date: ymd(editForm.date),
      show_time: timePayload,
      available_seats:
        editForm.seats === "" ? undefined : clampSeats(editForm.seats),
    };

    try {
      setSaving(true);
      if (editForm.movie_id) await updateMovie(editForm.movie_id, moviePayload);
      if (editForm.showtime_id)
        await updateShowtime(editForm.showtime_id, showtimePayload);
      setShowEditModal(false);
      await load();
    } catch (e) {
      alert(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          "Update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // ===== Delete =====
  const askDelete = (row) => {
    setShowDeleteConfirm({
      showtime_id: row.showtime_id,
      movie_id: row.movie_id,
      title: row.title,
      alsoDeleteMovie: false,
    });
  };

  const handleDelete = async () => {
    const { showtime_id, movie_id, alsoDeleteMovie } = showDeleteConfirm || {};
    if (!showtime_id) return;
    try {
      await removeShowtime(showtime_id); // ลบรอบฉายก่อน

      if (alsoDeleteMovie) {
        const stillHas = rows.some(
          (r) => r.movie_id === movie_id && r.showtime_id !== showtime_id
        );
        if (stillHas) {
          const ok = window.confirm(
            "ยังมีรอบฉายอื่นของหนังเรื่องนี้อยู่ คุณยังต้องการลบหนังในตาราง movies ด้วยหรือไม่?"
          );
          if (!ok) {
            setShowDeleteConfirm(null);
            await load();
            return;
          }
        }
        await removeMovie(movie_id); // ลบหนัง
      }

      setShowDeleteConfirm(null);
      await load();
    } catch (e) {
      alert(
        e?.response?.data?.error ||
          e?.response?.data?.message ||
          "Delete failed"
      );
    }
  };

  return (
    <div className="text-white font-saira">
      {/* Title */}
      <div className="px-44 pt-12 w-full">
        <h1 className="text-4xl font-bold font-goldman text-[#8F00D7] drop-shadow-[0_0_15px_rgba(143,0,215,0.9)]">
          Movie Detail
        </h1>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6 w-[520px] ml-[990px]">
        <input
          placeholder="Search by Movie Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-[#1b0033] focus:outline-none"
        />
        <button className="p-3 rounded-lg bg-[#8F00D7] hover:bg-[#7000aa]">
          <FiSearch />
        </button>
      </div>

      {/* Error */}
      {loadError && (
        <div className="max-w-6xl mx-auto mb-4 rounded-lg bg-red-600/15 border border-red-500/30 text-red-200 px-4 py-3">
          {loadError}
        </div>
      )}

      {/* Table */}
      <div className="bg-black/40 rounded-2xl overflow-hidden max-w-6xl mx-auto w-full">
        <table className="w-full text-left border-collapse table-fixed">
          <colgroup>
            <col style={{ width: "50px" }} />
            <col style={{ width: "300px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "110px" }} />
            <col />
          </colgroup>
          <thead>
            <tr className="bg-[#8F00D7] text-white">
              <th className="px-3 py-3">No.</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Genre</th>
              <th className="px-6 py-3">Duration</th>
              <th className="px-6 py-3">Theater</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {loading && (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-400">
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((row, index) => (
                <tr key={row.showtime_id}>
                  <td className="px-3 py-2">{index + 1}</td>
                  <td className="px-6 py-4">{row.title}</td>
                  <td className="px-6 py-4">{row.genre || "-"}</td>
                  <td className="px-6 py-4">
                    {row.duration ? `${row.duration} min` : "-"}
                  </td>
                  <td className="px-6 py-4">{row.theater || "-"}</td>
                  <td className="px-6 py-4">
                    {row.show_date
                      ? new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(safeParseDate(row.show_date) || new Date())
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    {row.show_time ? fmtTime(row.show_time) : "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(row)}
                        className="p-2 rounded-md bg-blue-600 hover:bg-blue-700"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => askDelete(row)}
                        className="p-2 rounded-md bg-red-600 hover:bg-red-700"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-400">
                  No movies found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[9998] bg-black/60 flex items-center justify-center">
          <div className="bg-[#0f0a1a] w-[920px] max-w-[95vw] rounded-2xl p-8 shadow-2xl border border-white/10">
            <h3 className="text-2xl font-goldman text-[#8F00D7] mb-6">
              Edit Movie / Showtime
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Poster */}
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  placeholder="Poster URL"
                  value={editForm.posterURL}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, posterURL: e.target.value }))
                  }
                  className="w-64 px-3 py-2 mb-4 rounded-lg bg-[#1b0033] text-white outline-none ring-1 ring-white/10"
                />
                <div className="w-64 h-96 bg-gray-800 rounded-xl overflow-hidden">
                  <img
                    src={editForm.posterURL || DEFAULT_POSTER}
                    alt="Poster Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = DEFAULT_POSTER)}
                  />
                </div>
              </div>

              {/* Right: Form fields */}
              <div className="space-y-5">
                <div>
                  <label className="block mb-2">Title</label>
                  <input
                    className="w-full px-4 py-2 rounded-lg bg-[#1b0033] text-white outline-none ring-1 ring-white/10"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, title: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block mb-2">Genre</label>
                  <input
                    className="w-full px-4 py-2 rounded-lg bg-[#1b0033] text-white outline-none ring-1 ring-white/10"
                    value={editForm.genre}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, genre: e.target.value }))
                    }
                  />
                </div>

                {/* Duration + Theater */}
                <div className="w-96 grid grid-cols-2 gap-3 items-start">
                  <div className="flex flex-col">
                    <label className="mb-1">Duration</label>
                    <input
                      name="duration"
                      placeholder="e.g. 120"
                      value={editForm.duration}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          duration: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      className="w-full px-4 py-2 rounded-lg bg-[#1b0033] text-white outline-none ring-1 ring-white/10"
                      inputMode="numeric"
                      autoComplete="off"
                    />
                    <div className="h-5 mt-1 text-sm text-white/70">
                      {editForm.duration && <>≈ {toHM(editForm.duration)}</>}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1">Theater</label>
                    <input
                      name="theater"
                      placeholder="e.g. Theater 3"
                      value={editForm.theater}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, theater: e.target.value }))
                      }
                      className="w-full px-4 py-2 rounded-lg bg-[#1b0033] text-white outline-none ring-1 ring-white/10"
                      autoComplete="off"
                    />
                    <div className="h-5 mt-1"></div>
                  </div>
                </div>

                {/* Date + Time + Seats + Review */}
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block mb-2">Date</label>
                    <DatePickerLite
                      value={editForm.date}
                      onChange={(d) => setEditForm((p) => ({ ...p, date: d }))}
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Time</label>
                    <input
                      name="time"
                      placeholder="14:30"
                      value={editForm.time}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, time: e.target.value }))
                      }
                      className="w-full px-4 py-2 rounded-lg bg-[#1b0033] text-white outline-none ring-1 ring-white/10"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Seats</label>
                    <input
                      name="seats"
                      placeholder="50"
                      value={editForm.seats}
                      onChange={(e) =>
                        setEditForm((p) => ({
                          ...p,
                          seats: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      className="w-full px-4 py-2 rounded-lg bg-[#1b0033] text-white outline-none ring-1 ring-white/10"
                      inputMode="numeric"
                      autoComplete="off"
                    />
                  </div>

                  <div>
                    <label className="block mb-2">Review</label>
                    <input
                      name="review"
                      placeholder="8.5"
                      value={editForm.review}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, review: e.target.value }))
                      }
                      className="w-full px-4 py-2 rounded-lg bg-[#1b0033] text-white outline-none ring-1 ring-white/10"
                      inputMode="decimal"
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button
                disabled={saving}
                onClick={saveEdit}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-[#560081] via-[#5335FF] to-[#1091FB] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                disabled={saving}
                onClick={cancelEdit}
                className="px-6 py-2 rounded-full bg-gray-600 hover:bg-gray-700 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Popup */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-[#1b0033] p-6 rounded-xl text-center max-w-sm">
            <h2 className="text-xl mb-4">Confirm Delete</h2>
            <p className="mb-4">
              ต้องการลบรอบฉายของ{" "}
              <span className="font-semibold">{showDeleteConfirm.title}</span>{" "}
              ใช่ไหม?
            </p>

            <label className="flex items-center justify-center gap-2 mb-6 select-none">
              <input
                type="checkbox"
                className="accent-[#8F00D7]"
                checked={!!showDeleteConfirm.alsoDeleteMovie}
                onChange={(e) =>
                  setShowDeleteConfirm((p) => ({
                    ...p,
                    alsoDeleteMovie: e.target.checked,
                  }))
                }
              />
              <span>
                ลบข้อมูลหนังในตาราง <code>movies</code> ด้วย
              </span>
            </label>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
