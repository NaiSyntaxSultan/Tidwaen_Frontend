// src/pages/BookingConfirm.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { readBooking, confirmBooking, cancelBooking } from "../api/booking";
import { read as readMovie } from "../functions/product";

// helper: วันที่/เวลาไทย
const toThaiDate = (val) => {
  if (!val) return "—";
  let s = String(val);
  if (s.includes("T")) s = s.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "—";
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
const toThaiTime = (t) => {
  if (!t) return "—";
  const [hh = "00", mm = "00"] = String(t).split(":");
  return `${hh.padStart(2, "0")}:${mm.padStart(2, "0")} น.`;
};

export default function BookingConfirm() {
  const { id: bookingId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(false);

  const [poster, setPoster] = useState(state?.movie?.poster || "/poster.jpg");
  const [title, setTitle] = useState(state?.movie?.title || "—");
  const [reviewStars] = useState("☆ ☆ ☆ ☆ ☆");

  const [seatsLabel, setSeatsLabel] = useState(state?.seats || "—");
  const [tickets, setTickets] = useState(state?.seats_count || 0);
  const [total, setTotal] = useState(state?.total || 0);
  const [showDate, setShowDate] = useState(state?.show_date || "—");
  const [showTime, setShowTime] = useState(state?.show_time || "—");

  useEffect(() => {
    const boot = async () => {
      try {
        if (state) {
          setShowDate(toThaiDate(state?.show_date) || state?.show_date || "—");
          setShowTime(state?.show_time || "—");
        }
        if (bookingId) {
          const r = await readBooking(bookingId);
          const b = r.data?.booking;
          if (b) {
            setTitle((prev) =>
              prev === "—" ? b.title || prev : prev
            );
            setTickets((prev) =>
              prev > 0 ? prev : Number(b.seats || 0)
            );
            setTotal((prev) =>
              prev > 0 ? prev : Number(b.seats || 0) * 650
            );
            setShowDate((prev) =>
              prev !== "—" ? prev : toThaiDate(b.show_date)
            );
            setShowTime((prev) =>
              prev !== "—" ? prev : toThaiTime(b.show_time)
            );

            const ls = localStorage.getItem(`booking:${bookingId}:seats`);
            const labels = state?.seats || ls || b.seat_labels || "—";
            setSeatsLabel(labels);

            if (!state?.movie?.poster && (b.poster || b.movie_id)) {
              if (b.poster) setPoster(b.poster);
              else {
                try {
                  const m = await readMovie(b.movie_id);
                  const p = m.data?.movie?.poster;
                  if (p) setPoster(p);
                } catch {}
              }
            }
          }
        }
      } catch {}
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const onConfirm = async () => {
    if (!payment) {
      alert("กรุณาเลือกวิธีชำระเงิน");
      return;
    }
    try {
      setLoading(true);
      await confirmBooking(bookingId);
      navigate("/history");
    } catch (e) {
      alert(e?.response?.data?.error || "ยืนยันการจองไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const onCancel = async () => {
    if (!window.confirm("ต้องการยกเลิกการจองนี้หรือไม่?")) return;
    try {
      setLoading(true);
      await cancelBooking(bookingId);
      navigate("/history");
    } catch (e) {
      alert(e?.response?.data?.error || "ยกเลิกการจองไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white">
      {/* 🟣 Title */}
      <div className="relative z-10 px-44 pt-10 w-full">
        <h1 className="font-goldman text-4xl font-bold text-[#8F00D7] drop-shadow-[0_0_20px_rgba(143,0,215,0.9)]">
          Summary
        </h1>
      </div>

      {/* 🟣 Booking Card Wrapper */}
      <div className="relative z-10 max-w-6xl mx-auto mt-12 bg-black/60 rounded-3xl p-14 shadow-2xl scale-105">
        <div className="font-battambang grid grid-cols-1 md:grid-cols-2 gap-12 min-h-[500px]">
          {/* 🟣 Left Section */}
          <div className="flex flex-col justify-between border-r border-gray-500 pr-10">
            {/* Booking Summary */}
            <div>
              <h3 className="text-2xl font-bold mb-8">Booking Summary</h3>
              <div className="flex gap-8 items-start">
                <img
                  src={poster}
                  alt={title}
                  className="w-50 h-64 object-cover rounded-xl shadow-2xl"
                />
                <div className="text-xl">
                  <p>{title}</p>
                  <p className="mt-4 flex items-center">
                    Review :
                    <span className="ml-3 text-yellow-400 text-2xl">
                      {reviewStars}
                    </span>
                  </p>
                  <p className="mt-4">Seats : {seatsLabel}</p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="mt-10 border-t border-gray-500 pt-8 text-xl">
              <h3 className="text-2xl font-bold mb-6">Payment Details</h3>
              <div className="flex justify-between">
                <span>Ticket : {tickets}</span>
                <span>{Number(total).toLocaleString()} B</span>
              </div>
              <div className="flex justify-between">
                <span>Promotion :</span>
                <span>-0 B</span>
              </div>
              <div className="flex justify-between mt-6 font-bold text-3xl">
                <span>Total</span>
                <span className="text-white">
                  {Number(total).toLocaleString()} Bath
                </span>
              </div>
            </div>
          </div>

          {/* 🟣 Right Section */}
          <div className="flex flex-col justify-between pl-12 text-xl">
            {/* Payment Method */}
            <div>
              <h3 className="text-2xl font-bold mb-8">Payment Method</h3>
              <div className="flex flex-col gap-6">
                {["QR Code", "True Money", "PayPal", "Credit Card"].map(
                  (method, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-4 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method}
                        checked={payment === method}
                        onChange={(e) => setPayment(e.target.value)}
                        className="w-6 h-6 accent-purple-600"
                      />
                      {method}
                    </label>
                  )
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-8 mt-12">
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 px-12 py-3 text-xl rounded-full bg-gradient-to-r from-[#560081] via-[#5335FF] to-[#1091FB] hover:opacity-90 disabled:opacity-60"
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
              <button
                onClick={onCancel}
                disabled={loading}
                className="flex-1 px-12 py-3 text-xl rounded-full bg-gray-600 hover:bg-gray-700 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
