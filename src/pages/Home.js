// src/pages/Home.js
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { FaPlay, FaPlus } from "react-icons/fa";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

/* ---------- Small helpers ---------- */
const Badge = ({ children }) => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/15 text-white/90 backdrop-blur">
    {children}
  </span>
);

function PosterSkeleton({ className = "" }) {
  return (
    <div
      className={
        "rounded-2xl overflow-hidden bg-white/10 animate-pulse " + className
      }
      style={{ aspectRatio: "2 / 3" }}
    />
  );
}

/* ---------- HERO (สไลด์ขยายใหญ่ขึ้น + Thumbs ไปซ้าย) ---------- */
function HeroCarousel({ items = [] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const stripRef = useRef(null);

  const next = () =>
    setCurrent((i) => (i === items.length - 1 ? 0 : i + 1));
  const goTo = (i) => setCurrent(i);

  useEffect(() => {
    if (!items.length || paused) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [paused, current, items.length]);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const active = el.querySelector(`[data-index="${current}"]`);
    if (active) {
      const offset =
        active.offsetLeft - (el.clientWidth - active.clientWidth) / 2;
      el.scrollTo({ left: offset, behavior: "smooth" });
    }
  }, [current]);

  if (!items.length) return null;

  return (
    <section
      className="font-battambang relative w-screen h-[650px] md:h-[750px] text-white select-none overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {items.map((m, i) => (
        <div
          key={m.movie_id || i}
          className={`absolute inset-0 transition-opacity duration-[1200ms]
                     ${i === current ? "opacity-100 z-20" : "opacity-0 z-10"}`}
        >
          <img
            src={m.poster}
            alt={m.title}
            className={`w-full h-full object-cover transition-transform duration-[2000ms]
                        ${i === current ? "scale-100" : "scale-[1.08]"}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        </div>
      ))}

      {/* เนื้อหาตัวหนัง */}
      <div className="absolute z-30 left-8 md:left-16 top-[30%] max-w-[52rem]">
        <h1 className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight drop-shadow-[0_6px_18px_rgba(0,0,0,0.9)]">
          {items[current].title}
        </h1>
        <div className="flex gap-4">
          <button className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 hover:to-red-700 text-lg font-semibold shadow-xl transition">
            <FaPlay className="transition-transform group-hover:scale-110" />
            Watch Now
          </button>
          <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur text-lg font-semibold shadow-md transition">
            <FaPlus /> Add to List
          </button>
        </div>
      </div>

      {/* 🟣 Thumbs ย้ายไปซ้าย */}
      <div className="absolute z-30 bottom-10 left-8 flex justify-start">
        <div className="w-full max-w-[700px]">
          <div className="relative p-[2px] rounded-[20px] bg-gradient-to-r from-white/20 via-white/10 to-transparent shadow-[0_15px_40px_rgba(0,0,0,.45)]">
            <div
              ref={stripRef}
              className="relative flex gap-3 h-20 md:h-24 w-full overflow-x-auto rounded-[18px] px-3 py-2 bg-black/45 backdrop-blur-xl scrollbar-none"
            >
              {items.map((m, i) => (
                <button
                  key={m.movie_id || i}
                  data-index={i}
                  onClick={() => goTo(i)}
                  title={m.title}
                  className={`group relative shrink-0 overflow-hidden rounded-2xl w-[120px] h-full transition-all duration-500
                             ${
                               i === current
                                 ? "ring-[3px] ring-red-500/90 shadow-[0_10px_30px_rgba(0,0,0,.55)] scale-[1.02]"
                                 : "opacity-85 hover:opacity-100 hover:scale-[1.02]"
                             }`}
                >
                  <img
                    src={m.poster}
                    alt={m.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-1 right-1 px-2 py-0.5 text-[10px] font-bold rounded-md
                                   bg-black/70 text-white/90 ring-1 ring-white/40 backdrop-blur-sm">
                    {i + 1} / {items.length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- AUTO-SCROLL + MANUAL CONTROL ---------- */
function HorizontalRow({ title, items = [] }) {
  const rowRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // ✅ Auto-scroll
  useEffect(() => {
    if (!rowRef.current) return;
    const el = rowRef.current;

    const interval = setInterval(() => {
      if (!isPaused) {
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth) {
          el.scrollLeft = 0; // วนกลับไปเริ่มใหม่
        } else {
          el.scrollLeft += 2;
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isPaused]);

  const scroll = (dir) => {
    if (!rowRef.current) return;
    const { clientWidth } = rowRef.current;
    setIsPaused(true);
    rowRef.current.scrollTo({
      left:
        rowRef.current.scrollLeft +
        (dir === "left" ? -clientWidth : clientWidth),
      behavior: "smooth",
    });
    setTimeout(() => setIsPaused(false), 5000);
  };

  return (
    <section className="relative w-screen text-white px-6 md:px-10 mt-12">
      {/* หัวข้อ */}
        <div className="flex items-center justify-center mb-8 relative">
        <h1
          className="text-4xl md:text-5xl font-extrabold font-goldman tracking-wide text-transparent bg-clip-text"
          style={{
            backgroundImage: "linear-gradient(90deg, #ff00ff, #00ffff, #ff00ff)",
            backgroundSize: "300% 300%",
            animation: "neonGradient 6s linear infinite",
          }}
        >
          {title}
        </h1>
        <style>{`
          @keyframes neonGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes borderMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-borderMove {
            background-size: 200% 200%;
            animation: borderMove 4s linear infinite;
          }
        `}</style>
    </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute -left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full
                     bg-black/70 hover:bg-black/90 text-white shadow-lg hover:scale-110 transition"
        >
          <FaChevronLeft />
        </button>

        {/* ✅ การ์ดมีไฟวิ่ง */}
        <div
          ref={rowRef}
          className="flex gap-6 overflow-x-hidden scroll-smooth py-2 select-none"
        >
          {items.concat(items).map((m, i) => (
            <Link
              key={m.movie_id + "-" + i}
              to={`/detail/${m.movie_id}`}
              className="relative shrink-0 w-[220px] rounded-2xl overflow-hidden group"
            >
              {/* ✅ กรอบไฟวิ่งครอบทั้งการ์ด */}
              <span className="absolute inset-0 rounded-2xl p-[3px] bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 animate-borderMove">
                <span className="block w-full h-full rounded-2xl bg-black/90"></span>
              </span>

              {/* ✅ เนื้อหา: poster + title */}
              <div className="relative z-10 flex flex-col items-center p-3">
                <img
                  src={m.poster}
                  alt={m.title}
                  className="w-full aspect-[2/3] object-cover rounded-lg"
                />
                <p className="mt-3 text-sm font-medium text-center">{m.title}</p>
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute -right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full
                     bg-black/70 hover:bg-black/90 text-white shadow-lg hover:scale-110 transition"
        >
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
}

/* ---------- RECOMMENDED (Grid + Neon Border per Card) ---------- */
function GridSection({ title, items = [] }) {
  return (
    <section className="w-screen text-white px-6 md:px-10 py-16">
      <h1 className="font-goldman text-3xl md:text-4xl font-bold mb-10">{title}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10">
        {items.map((m) => (
          <Link
            key={m.movie_id}
            to={`/detail/${m.movie_id}`}
            className="relative group rounded-2xl overflow-hidden shadow-lg"
          >
            {/* ✅ กรอบนีออน */}
            <div className="">
              <div className="w-full h-full bg-black rounded-2xl"></div>
            </div>

            {/* ✅ เนื้อหาการ์ด */}
            <div className="font-battambang relative z-10 flex flex-col items-center p-3">
              <img
                src={m.poster}
                alt={m.title}
                className="w-full aspect-[2/3] object-cover rounded-lg"
              />
              <p className="mt-3 text-sm font-semibold text-center">
                {m.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------- HOME (API) ---------- */
export default function Home() {
  const [hero, setHero] = useState([]);
  const [popular, setPopular] = useState([]);
  const [grid, setGrid] = useState([]);

  const loadAll = async () => {
    const { data } = await api.get("/movie");
    const list = data?.movies || [];
    setHero(list.slice(0, 5));
    setPopular(list.slice(0, 12));
    setGrid(list.slice(12, 37));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const heroItems = useMemo(() => hero, [hero]);

  return (
    <div className="min-h-screen overflow-x-hidden text-white relative">
      {/* ✅ พื้นหลัง Home (ใช้ 2 สี: #560081 และ #0A22FA) */}
      <div className="absolute inset-0 z-0">
        {/* วงกลมม่วงเข้มด้านซ้ายบน */}
        <div className="absolute top-10 left-20 w-96 h-96 bg-[#560081] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-float"></div>

        {/* วงกลมน้ำเงินด้านขวาบน */}
        <div className="absolute top-20 right-32 w-[28rem] h-[28rem] bg-[#0A22FA] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-floatX"></div>

        {/* วงกลมม่วงเข้มตรงกลางด้านล่าง */}
        <div className="absolute bottom-24 left-1/3 w-[22rem] h-[22rem] bg-[#560081] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-float"></div>

        {/* วงกลมน้ำเงินใหญ่ด้านล่างขวา */}
        <div className="absolute bottom-10 right-40 w-[26rem] h-[26rem] bg-[#0A22FA] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-floatX"></div>

        {/* วงกลมม่วงเข้มเล็กกระจายด้านซ้ายล่าง */}
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#560081] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-floatX"></div>

        {/* วงกลมน้ำเงินเล็กกระจายด้านขวาบน */}
        <div className="absolute top-1/4 right-10 w-56 h-56 bg-[#0A22FA] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-float"></div>
      </div>

      {/* เนื้อหา */}
      <div className="relative z-10">
        <HeroCarousel items={heroItems} />
        <HorizontalRow title="Popular This Week" items={popular} />
        <GridSection title="Recommended" items={grid} />
      </div>
    </div>
  );
}
