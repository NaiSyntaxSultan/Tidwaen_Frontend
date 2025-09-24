// src/api/booking.js
import api from "./axios";

// ดึงรายการ booking พร้อม filter (optional): user_id, showtime_id, status
export const listBookings = (params = {}) => api.get("/booking", { params });

// อ่านใบจองตาม id
export const readBooking = (booking_id) => api.get(`/booking/${booking_id}`);

// สร้างใบจอง (เริ่มสถานะ pending) { user_id, showtime_id, seats, seat_labels }
export const createBooking = ({ user_id, showtime_id, seats, seat_labels }) =>
  api.post("/booking", { user_id, showtime_id, seats, seat_labels });

// ยืนยันการจอง
export const confirmBooking = (booking_id) =>
  api.post(`/booking/${booking_id}/confirm`);

// ยกเลิกการจอง (คืนที่นั่ง)
export const cancelBooking = (booking_id) =>
  api.post(`/booking/${booking_id}/cancel`);

// ลบใบจอง
export const deleteBooking = (booking_id) =>
  api.delete(`/booking/${booking_id}`);

// ประวัติของฉัน (อ่านจาก JWT)
export const myBookingHistory = (params = {}) =>
  api.get("/me/booking", { params });

// ประวัติของผู้ใช้ตาม user_id
export const bookingHistoryByUser = (user_id, params = {}) =>
  api.get(`/users/${user_id}/booking`, { params });
