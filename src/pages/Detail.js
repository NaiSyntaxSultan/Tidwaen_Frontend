import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { read } from "../functions/product";

// ดาวรีวิว (รองรับครึ่งดาว)
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

function formatDuration(mins = 0) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h} hour ${m} minute`;
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

  // กดแล้วพาไปหน้า /cinema พร้อมส่ง movie_id + ข้อมูลที่จำเป็น
  const goToCinema = () => {
    navigate("/cinema", {
      state: {
        movie_id: movie?.movie_id,
        movie: {
          title: movie?.title,
          poster: movie?.poster,
        },
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
          <div className="flex items-center">
            {movie.poster && (
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-[280px] ml-14"
              />
            )}
          </div>
          <div className="space-y-4 ml-20 mt-32">
            <p className="text-white text-3xl">{movie.title}</p>
            <div className="flex items-center gap-3 text-white text-2xl">
              <span>Review :</span>
              <Stars value={Number(movie?.review) || 0} />
            </div>
            <p className="text-white text-2xl">Genre : {movie.genre}</p>
            <div className="flex items-center gap-2 text-white text-2xl">
              <span>Duration :</span>
              <span className="inline-flex items-center gap-2">
                <span className="opacity-90">🕒</span>
                {movie?.duration ? formatDuration(Number(movie.duration)) : "—"}
              </span>
            </div>
          </div>

          <div className="ml-40 flex flex-col justify-center items-end space-y-6">
            <video
              className="rounded-xl shadow-lg"
              width="640"
              height="360"
              controls
            >
              <source src="/videos/sample.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <button
              onClick={goToCinema}
              className="rounded-full px-6 py-2 font-semibold text-xl text-white bg-gradient-to-r from-[#560081] via-[#5335FF] to-[#1091FB] shadow-lg hover:opacity-90 active:scale-95 transition"
            >
              See Showtimes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
