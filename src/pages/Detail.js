import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { read } from "../functions/product";

/* ---------- Stars (รองรับครึ่งดาว) ---------- */
function Stars({ value = 0, outOf = 5 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: outOf }).map((_, i) => {
        const isFull = i < full;
        const isHalf = i === full && half;
        return (
          <svg key={i} viewBox="0 0 24 24" className="h-5 w-5">
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" />
                <stop offset="50%" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M12 2l2.9 5.9 6.1.9-4.4 4.2 1 6.1L12 16.9 6.4 19.1l1-6.1-4.4-4.2 6.1-.9L12 2z"
              className={
                isFull
                  ? "fill-yellow-400"
                  : isHalf
                  ? "fill-yellow-400"
                  : "fill-gray-300/60 dark:fill-gray-600"
              }
              {...(isHalf ? { fill: `url(#half-${i})` } : {})}
            />
            {!isFull && !isHalf && (
              <path
                d="M12 2l2.9 5.9 6.1.9-4.4 4.2 1 6.1L12 16.9 6.4 19.1l1-6.1-4.4-4.2 6.1-.9L12 2z"
                className="fill-none stroke-gray-300/70 dark:stroke-gray-600"
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}

/* ---------- Helpers ---------- */
function formatDuration(mins = 0) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} hour ${m} minute`;
}

/** ดึง YouTube ID จากหลายรูปแบบลิงก์ */
function getYouTubeId(url = "") {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return u.pathname.split("/")[1] || null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const parts = u.pathname.split("/");
      if (parts.includes("embed") || parts.includes("shorts")) {
        return parts.pop() || null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** ตัวเล่นวิดีโอจาก trailer_url: รองรับ YouTube/MP4 */
function TrailerPlayer({ trailerUrl }) {
  if (!trailerUrl) return null;

  const isMp4 = /\.mp4(\?.*)?$/i.test(trailerUrl);
  const ytId = getYouTubeId(trailerUrl);

  if (ytId) {
    return (
      <div className="rounded-xl overflow-hidden shadow-lg">
        <iframe
          width="640"
          height="360"
          src={`https://www.youtube.com/embed/${ytId}?rel=0`}
          title="Trailer"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="block"
        />
      </div>
    );
  }

  if (isMp4) {
    return (
      <video className="rounded-xl shadow-lg" width="640" height="360" controls>
        <source src={trailerUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }

  return null;
}

export default function Detail() {
  const params = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState({});

  useEffect(() => {
    if (params.id) loadData(params.id);
  }, [params.id]);

  const loadData = async (id) => {
    read(id)
      .then((res) => setMovie(res.data.movie || {}))
      .catch((err) => console.log(err));
  };

  // ไปหน้า /cinema พร้อมส่งข้อมูล
  const goToCinema = () => {
    navigate("/cinema", {
      state: {
        movie_id: movie?.movie_id,
        movie: { title: movie?.title, poster: movie?.poster },
      },
    });
  };


  return (
    <div>
      {/* Title */}
      <div className="h-32 flex items-center pl-44">
        <h1 className="text-4xl font-bold text-[#8F00D7] drop-shadow-[0_0_15px_rgba(143,0,215,0.9)]">
          Movie Detail
        </h1>
      </div>

      {/* Content */}
      <div className="h-[650px] flex items-center justify-center">
        <div className="h-[550px] w-[1600px] bg-black/50 rounded-3xl shadow-lg flex">
          {/* Poster */}
          <div className="flex items-center">
            {movie.poster && (
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-[280px] ml-14 rounded-xl shadow-md"
              />
            )}
          </div>

          {/* Text info */}
          <div className="space-y-4 ml-20 mt-32">
            <p className="text-white text-3xl">{movie.title}</p>

            <div className="flex items-center gap-3 text-white text-2xl">
              <span>Review :</span>
              <Stars value={Number(movie?.review) || 0} />
            </div>

            <p className="text-white text-2xl">Genre : {movie.genre || "—"}</p>

            <div className="flex items-center gap-2 text-white text-2xl">
              <span>Duration :</span>
              <span className="inline-flex items-center gap-2">
                <span className="opacity-90">🕒</span>
                {movie?.duration ? formatDuration(Number(movie.duration)) : "—"}
              </span>
            </div>

            {/* แสดงลิงก์ดิบ (ถ้ามี) เพื่อเปิดดูบน YouTube แท็บใหม่ได้ */}
            {movie?.trailer_url && (
              <a
                href={movie.trailer_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white underline decoration-white/30"
              >
                View Raw Trailer Link
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path
                    d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3z"
                    className="fill-current"
                  />
                  <path
                    d="M5 5h6v2H7v10h10v-4h2v6H5V5z"
                    className="fill-current opacity-60"
                  />
                </svg>
              </a>
            )}
          </div>

          {/* Trailer + CTA */}
          <div className="ml-40 flex flex-col justify-center items-end space-y-6">
            {/* ✅ Player จาก trailer_url */}
            <TrailerPlayer trailerUrl={movie?.trailer_url} />

            <button
              onClick={goToCinema}
              className="rounded-full px-6 py-2 font-semibold text-xl text-white bg-gradient-to-r from-[#560081] via-[#5335FF] to-[#1091FB] shadow-lg hover:opacity-90 active:scale-95 transition"
            >
              See Showtimes
            </button>

            {/* กรณีไม่มี trailer_url ให้บอกผู้ใช้สั้น ๆ */}
            {!movie?.trailer_url && (
              <p className="text-white/80 text-sm">
                * ยังไม่มีลิงก์ตัวอย่างหนัง (Trailer)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
