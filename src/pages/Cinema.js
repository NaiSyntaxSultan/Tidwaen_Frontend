import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, Clock, MapPin, Armchair, Sofa } from "lucide-react";
import { createBooking, listBookings } from "../api/booking";
import { listShowtimes, readShowtime } from "../api/showtime";

/* ---------- CONFIG (default ถ้า state ไม่มี) ---------- */
const MOVIE_DEFAULT = {
  title: "Movie",
  date: "—",
  time: "—",
  location: "TIDWAEN Cinema MBK Center",
  theater: "",
  poster: "/poster.jpg",
};

const ROWS = "ABCDEFGHIJ".split("");
const COLS = 14;
const AISLES = new Set([5, 10]);

/* ---------- TYPES ---------- */
const TYPES = {
  DELUXE:  { label: "Event Deluxe", price: 650, color: "bg-slate-700",  glow: "shadow-slate-400/30",  icon: Armchair },
  PREMIUM: { label: "Event Premium", price: 650, color: "bg-violet-700", glow: "shadow-violet-400/30", icon: Armchair },
  SOFA:    { label: "Event Sofa Sweet (Pair)", price: 1300, color: "bg-pink-700",   glow: "shadow-pink-400/30",   icon: Sofa },
};

/* ---------- HELPERS ---------- */
const seatTypeResolver = (rowChar) => {
  if (["A","B","C","D","E"].includes(rowChar)) return "DELUXE";
  if (["F","G","H","I"].includes(rowChar))     return "PREMIUM";
  if (rowChar === "J")                         return "SOFA";
  return "DELUXE";
};
const seatId = (r, c) => `${r}${c}`;

// ฟอร์แมตวันที่ไทย
const toThaiDate = (val) => {
  if (!val) return "—";
  const s = String(val);
  if (s.includes("T")) {
    const d = new Date(s);
    if (!isNaN(d)) {
      return d.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
    }
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y,m,d] = s.split("-").map(Number);
    const dt = new Date(y, m-1, d);
    return dt.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });
  }
  return "—";
};

// ฟอร์แมตเวลาไทย
const toThaiTime = (t) => {
  if (!t) return "—";
  const s = String(t);
  if (s.includes("T")) {
    const d = new Date(s);
    if (!isNaN(d)) {
      const hh = String(d.getHours()).padStart(2,"0");
      const mm = String(d.getMinutes()).padStart(2,"0");
      return `${hh}:${mm} น.`;
    }
  }
  const [hh="00", mm="00"] = s.split(":");
  return `${hh.padStart(2,"0")}:${mm.padStart(2,"0")} น.`;
};

// แปลง seat_labels string -> array ที่สะอาด
const parseSeatLabels = (s) => {
  if (!s) return [];
  return String(s)
    .split(",")
    .map(x => x.trim().toUpperCase())
    .filter(Boolean);
};

export default function Cinema() {
  const navigate = useNavigate();
  const { state } = useLocation(); // { movie_id?, showtime_id?, movie? }

  const [showtimeId, setShowtimeId] = useState(state?.showtime_id ?? null);
  const [showMeta, setShowMeta] = useState({ date: "", time: "", theater: "" });

  const MOVIE = state?.movie ? {
    title: state.movie.title ?? MOVIE_DEFAULT.title,
    date:  showMeta.date     || MOVIE_DEFAULT.date,
    time:  showMeta.time     || MOVIE_DEFAULT.time,
    location: state.movie.location ?? MOVIE_DEFAULT.location,
    theater:  showMeta.theater || state.movie.theater || MOVIE_DEFAULT.theater,
    poster:   state.movie.poster   || MOVIE_DEFAULT.poster,
  } : {
    ...MOVIE_DEFAULT,
    date: showMeta.date || MOVIE_DEFAULT.date,
    time: showMeta.time || MOVIE_DEFAULT.time,
    theater: showMeta.theater || MOVIE_DEFAULT.theater,
  };

  const [booked, setBooked] = useState([]); // รายการที่นั่งจาก booking.seat_labels
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // โหลดรายละเอียด showtime (เอา date/time/theater)
  useEffect(() => {
    const loadByShowtimeId = async () => {
      if (!showtimeId) return;
      try {
        const resp = await readShowtime(showtimeId);
        const row = resp.data?.movie || resp.data?.showtime;
        if (row) {
          setShowMeta({
            date: toThaiDate(row.show_date),
            time: toThaiTime(row.show_time),
            theater: row.theater || "",
          });
        }
      } catch (e) {
        console.error("readShowtime failed", e?.response?.data || e.message);
      }
    };
    loadByShowtimeId();
  }, [showtimeId]);

  // ถ้าไม่มี showtime_id ให้ดึงรายการรอบของหนังด้วย movie_id
  useEffect(() => {
    const bootstrap = async () => {
      if (showtimeId || !state?.movie_id) return;
      try {
        const res = await listShowtimes({ movie_id: state.movie_id });
        const rows = res.data?.showtimes || [];
        if (!rows.length) {
          setErr("หนังเรื่องนี้ยังไม่มีรอบฉาย");
          return;
        }
        const st = rows[0];
        setShowtimeId(st.showtime_id);
        setShowMeta({
          date: toThaiDate(st.show_date),
          time: toThaiTime(st.show_time),
          theater: st.theater || "",
        });
      } catch (e) {
        setErr(e?.response?.data?.error || "โหลดรอบฉายไม่สำเร็จ");
      }
    };
    bootstrap();
  }, [showtimeId, state?.movie_id]);

  // โหลดที่นั่งที่ถูกจอง (pending/confirmed) ของรอบนี้จาก booking.seat_labels
  useEffect(() => {
    const loadBookedSeats = async () => {
      if (!showtimeId) return;
      try {
        // วิธี 1: ดึงทั้งหมดแล้วกรองสถานะฝั่ง client
        const res = await listBookings({ showtime_id: showtimeId });
        const all = res.data?.bookings || [];
        const use = all.filter(b => b.status !== "cancelled"); // กันเฉพาะ pending + confirmed
        const seats = new Set();
        for (const b of use) {
          parseSeatLabels(b.seat_labels).forEach(s => seats.add(s));
        }
        setBooked(Array.from(seats));
      } catch (e) {
        console.error("loadBookedSeats failed", e?.response?.data || e.message);
      }
    };
    loadBookedSeats();
  }, [showtimeId]);

  const seats = useMemo(() => {
    const map = {};
    ROWS.forEach((r) => {
      for (let c = 1; c <= COLS; c++) map[seatId(r, c)] = seatTypeResolver(r);
    });
    return map;
  }, []);

  const total = useMemo(
    () => selected.reduce((sum, id) => sum + (TYPES[seats[id]]?.price || 0), 0),
    [selected, seats]
  );

  // จำนวนที่นั่งส่งให้ backend (SOFA = 2)
  const seatsCountForBackend = useMemo(() => {
    let normal = 0, sofa = 0;
    for (const id of selected) {
      const type = seats[id];
      if (type === "SOFA") sofa += 1; else normal += 1;
    }
    const sofaPairs = Math.ceil(sofa / 2);
    return normal + sofaPairs * 2;
  }, [selected, seats]);

  const toggleSeat = (id) => {
    if (booked.includes(id)) return;  // ห้ามเลือกถ้าถูกจองแล้ว
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelected([]);

  const confirm = async () => {
    if (!selected.length) return;
    if (!showtimeId) { setErr("ไม่พบ showtime_id กรุณากลับไปเลือกเวลา"); return; }

    // ดึง user_id จาก localStorage
    let userId = null;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      userId = u?.id ?? u?.user_id ?? null;
    } catch {}

    if (!userId) { setErr("ยังไม่ได้เข้าสู่ระบบ หรือไม่พบ user_id"); return; }

    try {
      setLoading(true); setErr("");

      // รวมเป็น "A1, A2, B10"
      const seatLabelsStr = selected.slice().sort((a,b)=>a.localeCompare(b)).join(", ");

      const res = await createBooking({
        user_id: userId,
        showtime_id: showtimeId,
        seats: seatsCountForBackend,
        seat_labels: seatLabelsStr,
      });

      const bookingId = res.data?.booking?.booking_id;
      if (!bookingId) throw new Error("No booking_id returned");

      localStorage.setItem(`booking:${bookingId}:seats`, seatLabelsStr);

      navigate(`/booking/${bookingId}`, {
        state: {
          movie: { title: MOVIE.title, poster: MOVIE.poster },
          seats: seatLabelsStr,
          seats_count: seatsCountForBackend,
          total,
          show_date: showMeta.date || MOVIE.date,
          show_time: showMeta.time || MOVIE.time,
        },
      });
    } catch (e) {
      setErr(e?.response?.data?.error || e.message || "Create booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white">
      {/* Header */}
      <div className="mx-auto max-w-[1500px] pt-12 pb-4">
        <MovieHeader MOVIE={MOVIE} />
      </div>

      {/* Seat Type Bar */}
      <div className="mx-auto max-w-6xl py-8">
        <SeatTypeBar />
      </div>

      {/* Main */}
      <div className="mx-auto max-w-6xl pb-24">
        {err && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/40 border border-red-500/40 text-sm">
            {err}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
          {/* Seat grid */}
          <div className="rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 shadow-2xl shadow-black/30">
            {/* Screen */}
            <div className="relative h-28 mb-12">
              <div
                className="absolute inset-x-0 top-6 mx-auto w-[90%] h-20 rounded-b-[120px]
                           bg-gradient-to-b from-white/70 to-white/5 border-t-2 border-white/20
                           shadow-[0_8px_50px_rgba(255,255,255,0.15)]"
              />
              <p className="relative z-10 text-center pt-2 text-sm tracking-[0.4em] text-white/90 font-medium">
                SCREEN
              </p>
            </div>

            <Legend />

            <div className="mt-8 space-y-4">
              {ROWS.map((r) => (
                <div key={r} className="flex items-center justify-center gap-4">
                  <div className="w-8 text-right pr-2 text-base text-white/80 font-medium">{r}</div>
                  <div className="flex items-center">
                    {Array.from({ length: COLS }).map((_, i) => {
                      const c = i + 1;
                      const id = seatId(r, c);
                      const typeKey = seats[id];
                      const typeConf = TYPES[typeKey];
                      const isBooked = booked.includes(id);
                      const isSelected = selected.includes(id);
                      const after = AISLES.has(c) ? <div key={`a-${r}-${c}`} className="w-6" /> : null;
                      const Icon = typeConf.icon;

                      return (
                        <React.Fragment key={id}>
                          <button
                            onClick={() => toggleSeat(id)}
                            title={`${id} • ${typeConf.label} • ${typeConf.price} THB`}
                            className={[
                              "relative group w-10 h-10 rounded-lg transition-all duration-200",
                              "flex items-center justify-center select-none mr-2",
                              "outline-none focus:ring-2 ring-white/40 focus:scale-105",
                              typeConf.color, typeConf.glow, 
                              isBooked && "bg-gray-600 cursor-not-allowed opacity-50 !shadow-none",
                              isSelected && "ring-2 ring-yellow-300 scale-110 shadow-lg",
                              !isBooked && "hover:-translate-y-1 hover:brightness-110 hover:scale-105 hover:shadow-lg",
                            ].filter(Boolean).join(" ")}
                            disabled={isBooked || loading}
                          >
                            <Icon className="w-5 h-5" />
                          </button>
                          {after}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <div className="w-8 pl-2 text-base text-white/80 font-medium">{r}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-8 h-max rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-8 shadow-2xl shadow-black/30">
            <h3 className="text-2xl font-bold mb-6">Order Summary</h3>

            <div className="space-y-3 max-h-64 overflow-auto pr-2 mb-6">
              {selected.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-white/40 text-4xl mb-3">🎬</div>
                  <p className="text-white/60 text-base">ยังไม่ได้เลือกที่นั่ง</p>
                  <p className="text-white/40 text-sm mt-1">เลือกที่นั่งที่คุณต้องการ</p>
                </div>
              ) : (
                selected
                  .sort((a, b) => a.localeCompare(b))
                  .map((id) => (
                    <div key={id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                      <div>
                        <div className="font-bold text-lg">{id}</div>
                        <div className="text-white/60 text-sm">{TYPES[seats[id]].label}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{TYPES[seats[id]].price.toLocaleString()}</div>
                        <div className="text-white/60 text-sm">THB</div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="border-t border-white/20 pt-6 mt-6">
              <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-gradient-to-r from-white/5 to-white/10 border border-white/10">
                <span className="text-xl text-white/90">Total</span>
                <div className="text-right">
                  <div className="text-3xl font-extrabold">{total.toLocaleString()}</div>
                  <div className="text-white/60 text-sm">THB</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={clearSelection} 
                  disabled={loading}
                  className="py-4 rounded-xl text-base font-semibold bg-white/10 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-200 disabled:opacity-60"
                >
                  Reset
                </button>
                <button
                  onClick={confirm}
                  disabled={!selected.length || loading}
                  className="py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-fuchsia-500 to-sky-500 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-95 transition-all duration-200 shadow-lg"
                >
                  {loading ? "Processing..." : "Confirm"}
                </button>
              </div>
              <p className="mt-3 text-xs text-white/50">
                จะสร้างใบจองสถานะ <span className="font-semibold">pending</span> และกันที่นั่งรวม {seatsCountForBackend} ที่
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center text-white/50 text-sm pb-8 pt-4 border-t border-white/10">
        © {new Date().getFullYear()} TIDWAEN CINEMA
      </div>
    </div>
  );
}

/* ---------- Sub Components ---------- */
const MovieHeader = ({ MOVIE }) => (
  <div className="rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl shadow-black/30 overflow-hidden">
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
      {/* Poster */}
      <div className="relative">
        {MOVIE.poster ? (
          <img
            src={MOVIE.poster}
            alt={MOVIE.title}
            className="w-full h-80 md:h-full object-cover"
          />
        ) : (
          <div className="w-full h-80 md:h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <div className="text-center text-white/80">
              <div className="text-6xl mb-4">🎬</div>
              <div className="text-sm">Movie Poster</div>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden" />
      </div>

      {/* Header info */}
      <div className="p-8 md:p-10">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight">{MOVIE.title}</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-white/85">
            <Info icon={<Calendar className="text-lg" />} text={MOVIE.date} />
            <Info icon={<Clock className="text-lg" />} text={MOVIE.time} />
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3 text-white/80">
            <Info icon={<MapPin className="text-lg" />} text={MOVIE.location} />
            <Info icon={<Armchair className="text-lg" />} text={`Theater: ${MOVIE.theater || "—"}`} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Info = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-base">
    <span className="opacity-90">{icon}</span>
    <span>{text}</span>
  </div>
);

const SeatTypeBar = () => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
    {Object.entries(TYPES).map(([k, v]) => {
      const Icon = v.icon;
      return (
        <div key={k} className="flex items-center gap-4 px-6 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all duration-200">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/10 border border-white/10">
            <Icon className="text-xl" />
          </div>
          <div className="leading-relaxed">
            <div className="font-semibold text-lg">{v.label}</div>
            <div className="text-white/70 text-base">{v.price.toLocaleString()} บาท</div>
          </div>
        </div>
      );
    })}
  </div>
);

const Legend = () => (
  <div className="flex items-center gap-8 text-base mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
    <LegendItem color="bg-slate-700" label="Available" />
    <LegendItem color="bg-gray-600" label="Booked" className="opacity-60" />
    <LegendItem color="bg-yellow-400" label="Selected" ring />
  </div>
);

const LegendItem = ({ color, label, ring = false, className = "" }) => (
  <div className="flex items-center gap-3">
    <span className={["inline-block w-5 h-5 rounded-lg", ring ? "ring-2 ring-yellow-300" : "", color, className].join(" ")} />
    <span className="text-white/80 font-medium">{label}</span>
  </div>
);
