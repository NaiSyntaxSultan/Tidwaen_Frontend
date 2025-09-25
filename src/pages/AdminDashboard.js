// src/pages/AdminDashboard.js
import React, { useEffect, useMemo, useState } from "react";
import { FiClock } from "react-icons/fi";
import { FaTicketAlt, FaPercent } from "react-icons/fa";
import api from "../api/axios"; // ถ้าไม่มี ใช้ axios ปกติแล้วปรับให้ชี้ BASE_URL

/* ---------- helpers ---------- */
const TICKET_PRICE = 200; // ถ้าไม่มีราคาใน DB ให้ตั้งค่าคงที่ไว้ก่อน

const pad2 = (n) => String(n).padStart(2, "0");
const toYMD = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
};
const todayYMD = () => toYMD(new Date());

function getToken() {
  // พยายามอ่าน token จากหลายแหล่งที่คุณใช้
  const rawAuth = localStorage.getItem("auth");
  if (rawAuth) {
    try {
      const a = JSON.parse(rawAuth);
      if (a?.token) return a.token;
    } catch { }
  }
  return localStorage.getItem("token") || "";
}

/* ---------- Mini Chart Component (เดิม) ---------- */
function ChartLite({ yMax = 1000, width = 600, height = 260, data }) {
  const seriesPurple = data?.ticketsSold || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const seriesBlue = data?.ticketsAvailable || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const seriesGreen = data?.totalSale || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  const chart = { left: 50, right: 560, top: 20, bottom: 220 };
  const xTicks = useMemo(() => Array.from({ length: 10 }, (_, i) => i), []);
  const yTicks = useMemo(
    () => [0, Math.round(yMax * 0.25), Math.round(yMax * 0.5), Math.round(yMax * 0.75), yMax],
    [yMax]
  );

  const scaleX = (i) =>
    chart.left + (i / (xTicks.length - 1)) * (chart.right - chart.left);
  const scaleY = (v) =>
    chart.bottom - (v / yMax) * (chart.bottom - chart.top);

  const toPolyline = (arr) =>
    arr.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block">
      {/* axes & grid */}
      <g stroke="#ffffff22" strokeWidth="1">
        <line x1={chart.left} y1={chart.top} x2={chart.left} y2={chart.bottom} />
        <line x1={chart.left} y1={chart.bottom} x2={chart.right} y2={chart.bottom} />

        {yTicks.map((t, idx) => (
          <g key={`yt-${idx}`}>
            <line x1={chart.left} x2={chart.right} y1={scaleY(t)} y2={scaleY(t)} stroke="#ffffff14" />
            <text x={chart.left - 12} y={scaleY(t) + 4} fill="#9ca3af" fontSize="10" textAnchor="end">
              {t}
            </text>
          </g>
        ))}

        {xTicks.map((t, idx) => (
          <g key={`xt-${idx}`}>
            <line x1={scaleX(t)} x2={scaleX(t)} y1={chart.bottom} y2={chart.bottom + 4} stroke="#ffffff55" />
            <text x={scaleX(t)} y={chart.bottom + 16} fill="#9ca3af" fontSize="10" textAnchor="middle">
              {t}
            </text>
          </g>
        ))}
      </g>

      {/* lines */}
      <polyline points={toPolyline(seriesPurple)} fill="none" stroke="#A855F7" strokeWidth="3" />
      <polyline points={toPolyline(seriesBlue)} fill="none" stroke="#60A5FA" strokeWidth="3" />
      <polyline points={toPolyline(seriesGreen)} fill="none" stroke="#34D399" strokeWidth="3" />

      {/* dots */}
      {seriesPurple.map((v, i) => (
        <circle key={`p-${i}`} cx={scaleX(i)} cy={scaleY(v)} r="3" fill="#A855F7" />
      ))}
      {seriesBlue.map((v, i) => (
        <circle key={`b-${i}`} cx={scaleX(i)} cy={scaleY(v)} r="3" fill="#60A5FA" />
      ))}
      {seriesGreen.map((v, i) => (
        <circle key={`g-${i}`} cx={scaleX(i)} cy={scaleY(v)} r="3" fill="#34D399" />
      ))}
    </svg>
  );
}

/* ===================== AdminDashboard ===================== */
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // สถิติ 4 กล่อง
  const [statShowtimeToday, setStatShowtimeToday] = useState(0);
  const [statTicketsSold, setStatTicketsSold] = useState(0);
  const [statTicketsAvail, setStatTicketsAvail] = useState(0);
  const [statTotalSale, setStatTotalSale] = useState(0);

  // ตาราง Showtime (วันนี้)
  const [todayShowtimes, setTodayShowtimes] = useState([]);

  // ข้อมูลกราฟ 10 จุด (ย้อนหลัง 10 วัน)
  const [chartData, setChartData] = useState({
    ticketsSold: Array(10).fill(0),
    ticketsAvailable: Array(10).fill(0),
    totalSale: Array(10).fill(0),
  });

  // ปรับยอดแกน Y อัตโนมัติจากข้อมูล
  const yMax = useMemo(() => {
    const all = [
      ...chartData.ticketsSold,
      ...chartData.ticketsAvailable,
      ...chartData.totalSale,
      statTicketsSold,
      statTicketsAvail,
      statTotalSale,
    ];
    const max = Math.max(1000, ...all);
    // ปัดขึ้นให้ดูสวย ๆ
    const step = 100;
    return Math.ceil(max / step) * step;
  }, [chartData, statTicketsSold, statTicketsAvail, statTotalSale]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr("");

      try {
        const token = getToken();
        if (!token) throw new Error("No token found. Please login.");

        // ตั้ง header authtoken ให้ instance (ถ้ายังไม่ได้ตั้ง)
        if (api?.defaults?.headers) {
          api.defaults.headers.authtoken = token;
        }

        const today = todayYMD();

        // 1) ดึง showtimes ของ "วันนี้" (สำหรับสถิติ + ตาราง)
        const [stRes, bkRes] = await Promise.all([
          api.get("/showtime", { params: { date: today } }),             // GET /api/showtime?date=YYYY-MM-DD
          api.get("/booking", { params: { status: "confirmed" } }),      // GET /api/booking?status=confirmed
        ]);

        const todayST = stRes?.data?.showtimes || [];
        setTodayShowtimes(todayST);

        // Showtime Today
        setStatShowtimeToday(todayST.length);

        // Tickets Available (รวมของวันนี้)
        const availToday = todayST.reduce((sum, r) => sum + (Number(r.available_seats) || 0), 0);
        setStatTicketsAvail(availToday);

        // 2) คำนวณ Tickets Sold วันนี้ + Total Sale วันนี้
        const confirmedBookings = bkRes?.data?.bookings || [];
        const soldToday = confirmedBookings
          .filter((b) => b?.show_date && toYMD(b.show_date) === today)
          .reduce((sum, b) => sum + (Number(b.seats) || 0), 0);

        setStatTicketsSold(soldToday);
        setStatTotalSale(soldToday * TICKET_PRICE);

        // 3) เตรียมข้อมูลกราฟย้อนหลัง 10 วัน
        // - ticketsSold[i] : ยอดที่ขายได้ (confirmed) ของวันนั้น
        // - ticketsAvailable[i] : ที่นั่งรวมที่เหลือจาก showtimes ของวันนั้น (จะยิง /showtime?date=<d> เป็นรายวัน)
        // - totalSale[i] : ticketsSold[i] * TICKET_PRICE
        const days = Array.from({ length: 10 }, (_, i) => {
          const dt = new Date();
          dt.setDate(dt.getDate() - (9 - i)); // จากเก่ามาสด
          return toYMD(dt);
        });

        // group bookings (confirmed) by show_date
        const mapSoldByDate = {};
        for (const b of confirmedBookings) {
          const d = b?.show_date ? toYMD(b.show_date) : null;
          if (!d) continue;
          mapSoldByDate[d] = (mapSoldByDate[d] || 0) + (Number(b.seats) || 0);
        }

        // ดึง showtimes ของแต่ละวันที่จะขึ้นกราฟ (10 calls แบบขนาน)
        const showtimeRequests = days.map((d) =>
          api.get("/showtime", { params: { date: d } }).catch(() => ({ data: { showtimes: [] } }))
        );
        const showtimeResponses = await Promise.all(showtimeRequests);

        const ticketsSoldSeries = [];
        const ticketsAvailSeries = [];
        const totalSaleSeries = [];

        showtimeResponses.forEach((resp, idx) => {
          const dateStr = days[idx];
          const stRows = resp?.data?.showtimes || [];
          const avail = stRows.reduce((s, r) => s + (Number(r.available_seats) || 0), 0);
          const sold = mapSoldByDate[dateStr] || 0;

          ticketsSoldSeries.push(sold);
          ticketsAvailSeries.push(avail);
          totalSaleSeries.push(sold * TICKET_PRICE);
        });

        setChartData({
          ticketsSold: ticketsSoldSeries,
          ticketsAvailable: ticketsAvailSeries,
          totalSale: totalSaleSeries,
        });
      } catch (e) {
        console.error(e);
        setErr(e?.response?.data?.message || e?.message || "Load dashboard failed");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // การ์ดสถิติ (ค่า value มาจาก state)
  const stats = [
    {
      label: "ShowTime Today",
      value: statShowtimeToday,
      icon: <FiClock size={40} />,
      iconOuterSize: 50,
      iconInnerSize: 40,
      iconOuterColor: "rgba(0,0,0,0.92)",
      iconInnerColor: "#7A1CC0",
      iconColor: "#000000",
      iconOffset: { top: 18, left: 18 },
    },
    {
      label: "Tickets Sold",
      value: statTicketsSold,
      icon: <FaTicketAlt size={24} />,
      iconOuterSize: 50,
      iconInnerSize: 40,
      iconOuterColor: "rgba(0,0,0,0.92)",
      iconInnerColor: "#8F00D7",
      iconColor: "#000",
      iconOffset: { top: 20, left: 18 },
    },
    {
      label: "Tickets Available",
      value: statTicketsAvail,
      icon: <FaTicketAlt size={24} />,
      iconOuterSize: 50,
      iconInnerSize: 40,
      iconOuterColor: "rgba(0,0,0,0.92)",
      iconInnerColor: "#3B82F6",
      iconColor: "#000",
      iconOffset: { top: 22, left: 20 },
    },
    {
      label: "Total Sale",
      value: statTotalSale,
      icon: <FaPercent size={22} />,
      iconOuterSize: 50,
      iconInnerSize: 40,
      iconOuterColor: "rgba(0,0,0,0.92)",
      iconInnerColor: "#A000FF",
      iconColor: "#000",
      iconOffset: { top: 16, left: 22 },
    },
  ];

  return (
    <div className="text-white font-saira">
      {/* Title */}
      <div className="px-44 pt-12 w-full">
        <h1 className="text-4xl leading-none font-bold font-goldman text-[#8F00D7] mb-3 drop-shadow-[0_0_16px_rgba(143,0,215,0.85)]">
          Dashboard
        </h1>
      </div>


      {err && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-900/30 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      )}

      <div className="px-44 pb-16">
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 opacity-100">
          {stats.map((item, i) => (
            <div
              key={i}
              className="relative rounded-[28px] px-6 pt-6 pb-5 overflow-hidden
                       bg-gradient-to-b from-[#0E2AAE] to-[#0A0A12]
                       shadow-[0_12px_40px_rgba(0,0,0,0.45)]
                       min-h-[170px]"
            >
              {/* icon circles */}
              <div className="absolute" style={{ top: item.iconOffset.top, left: item.iconOffset.left }}>
                <div
                  className="rounded-full grid place-items-center"
                  style={{
                    width: item.iconOuterSize,
                    height: item.iconOuterSize,
                    background: item.iconOuterColor,
                  }}
                >
                  <div
                    className="rounded-full grid place-items-center"
                    style={{
                      width: item.iconInnerSize,
                      height: item.iconInnerSize,
                      background: item.iconInnerColor,
                      color: item.iconColor,
                    }}
                  >
                    {item.icon}
                  </div>
                </div>
              </div>

              {/* content */}
              <div className="pt-10 text-center">
                <p className="text-[25px] leading-snug font-battambang mb-2">{item.label}</p>
                <p className="text-[60px] md:text-[60px] font-bold tracking-tight">
                  {loading ? "…" : item.value}
                </p>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          ))}
        </div>

        {/* Chart & Table */}
        <div className="flex gap-8">
          {/* Chart card */}
          <div className="rounded-2xl p-6 bg-black/40 border border-white/10 w-[48%] h-[400px]">
            <div className="w-full h-full flex items-center justify-center">
              <ChartLite yMax={yMax} width={600} height={260} data={chartData} />
            </div>
          </div>

          {/* Showtime panel (ของวันนี้) */}
          <div className="w-[48%] min-h-[400px]">
            <div className="rounded-2xl bg-black/70 border border-white/30 p-4">
              <div className="text-center">
                <h3 className="text-[36px] font-goldman tracking-wide mb-2">Showtime</h3>
              </div>
              <div className="overflow-hidden rounded-xl border border-white/20">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="px-4 py-3 border-r border-white/20 w-[55%]">Movie</th>
                      <th className="px-4 py-3 border-r border-white/20 w-[25%]">Time</th>
                      <th className="px-4 py-3 w-[20%]">Theater</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(todayShowtimes || []).slice(0, 12).map((r, i) => (
                      <tr key={i} className="border-t border-white/10">
                        <td className="px-4 py-3">{r?.title || "-"}</td>
                        <td className="px-4 py-3">{r?.show_time?.slice(0, 5) || "-"}</td>
                        <td className="px-4 py-3">{r?.theater || "-"}</td>
                      </tr>
                    ))}
                    {!loading && todayShowtimes.length === 0 && (
                      <tr>
                        <td className="px-4 py-6 text-center text-white/60" colSpan={3}>
                          No showtime today.
                        </td>
                      </tr>
                    )}
                    {loading && (
                      <tr>
                        <td className="px-4 py-6 text-center text-white/60" colSpan={3}>
                          Loading…
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 text-xs text-white/60">
                แสดงข้อมูลวันที่: {todayYMD()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
