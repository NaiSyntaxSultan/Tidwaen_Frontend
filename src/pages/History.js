// src/pages/History.jsx
import React, { useEffect, useState } from "react";
import { myBookingHistory } from "../api/booking";

const toThaiDate = (v) => {
  if (!v) return "—";
  let s = String(v);
  if (s.includes("T")) s = s.slice(0,10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "—";
  const [y,m,d] = s.split("-").map(Number);
  const dt = new Date(y, m-1, d);
  return dt.toLocaleDateString("th-TH", { day:"numeric", month:"long", year:"numeric" });
};
const toThaiTime = (t) => {
  if (!t) return "—";
  const [hh="00", mm="00"] = String(t).split(":");
  return `${hh.padStart(2,"0")}:${mm.padStart(2,"0")} น.`;
};

export default function History() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await myBookingHistory(); // /me/booking (ต้องมี token)
        const rows = r.data?.bookings || [];
        setBookings(rows);
      } catch {
        setBookings([]);
      }
    };
    load();
  }, []);

  const mapStatus = (s) => {
    if (s === "confirmed") return { text: "Complete", color: "bg-green-600" };
    if (s === "cancelled") return { text: "Cancel", color: "bg-red-600" };
    return { text: "Pending", color: "bg-yellow-600" };
  };

  // เลือกแสดงเลขที่นั่ง: API seat_labels > localStorage สำรอง > จำนวนที่นั่ง
  const seatText = (b) =>
    b.seat_labels ||
    localStorage.getItem(`booking:${b.booking_id}:seats`) ||
    (b.seats ? `${b.seats} ที่นั่ง` : "—");

  return (
    <div className="text-white">
      {/* 🟣 Title */}
      <div className="px-44 pt-12 w-full">
        <h1 className="font-goldman text-4xl font-bold text-[#8F00D7] drop-shadow-[0_0_20px_rgba(143,0,215,0.9)]">
          History & Cancel
        </h1>
      </div>

      {/* 🟣 Container Box */}
      <div className="max-w-7xl mx-auto mt-12 bg-black/50 font-battambang rounded-3xl shadow-2xl p-10">
        <div className="border-2 border-white rounded-xl overflow-hidden">
          <table className="w-full border-collapse text-center text-xl">
            <thead className="bg-black/60 text-xl">
              <tr>
                <th className="border border-white px-4 py-2 whitespace-nowrap">
                  Booking ID
                </th>
                <th className="border border-white px-4 py-2 whitespace-nowrap">
                  Movie
                </th>
                <th className="border border-white px-4 py-2 whitespace-nowrap">
                  ShowTime
                </th>
                <th className="border border-white px-4 py-2 whitespace-nowrap">
                  Theater
                </th>
                <th className="border border-white px-4 py-2 whitespace-nowrap">
                  Seats
                </th>
                <th className="border border-white px-4 py-2 whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => {
                const st = mapStatus(b.status);
                return (
                  <tr key={i} className="hover:bg-white/10">
                    <td className="border border-white px-4 py-2">{b.booking_id}</td>
                    <td className="border border-white px-4 py-2 flex items-center gap-3 justify-start">
                      <img
                        src={b.poster || "/poster.jpg"}
                        alt={b.title}
                        className="w-40 h-56 object-cover rounded-md"
                      />
                      <span className="truncate max-w-[150px]">{b.title}</span>
                    </td>
                    <td className="border border-white px-4 py-2 whitespace-nowrap">
                      {toThaiDate(b.show_date)} {toThaiTime(b.show_time)}
                    </td>
                    <td className="border border-white px-4 py-2">Theater 1</td>
                    {/* ✅ แสดงเลขที่นั่งจริง */}
                    <td className="border border-white px-4 py-2">{seatText(b)}</td>
                    <td className="border border-white px-4 py-2">
                      <span className={`px-3 py-1 rounded text-base ${st.color}`}>
                        {st.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="border border-white px-4 py-6 text-white/70">
                    ไม่พบประวัติการจอง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🟣 Action Box (นอกตาราง) — ตามโครงเดิม */}
        <div className="mt-6 px-6 py-4 flex justify-between items-center text-white text-2xl">
          <div className="flex items-center gap-28">
            <span className="font-semibold">{bookings[0]?.booking_id || "—"}</span>
            <span className="font-semibold">{bookings[0]?.title || "—"}</span>
            <button className="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700">
              Cancel
            </button>
            <span className="font-bold">
              {bookings[0]?.seats ? (bookings[0].seats * 650).toLocaleString() : "0"} B
            </span>
          </div>
          <div className="flex items-center gap-4 ">
            <button className="px-6 py-2 rounded-full bg-green-600 hover:bg-green-700">
              OK
            </button>
            <button className="px-6 py-2 rounded-full bg-gray-500 hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
