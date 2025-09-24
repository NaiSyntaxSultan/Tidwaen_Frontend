// src/functions/adminShowtime.js
import api from "../api/axios";

// --- SHOWTIME (เอกพจน์) ---
export const listShowtimes = (params = {}) =>
  api.get("/showtime", { params });        // GET /api/showtime

export const readShowtime = (id) =>
  api.get(`/showtime/${id}`);               // GET /api/showtime/:id

export const updateShowtime = (id, payload) =>
  api.put(`/showtime/${id}`, payload);      // PUT /api/showtime/:id

export const removeShowtime = (id) =>
  api.delete(`/showtime/${id}`);            // DELETE /api/showtime/:id

// --- MOVIE (เอกพจน์) ---
export const updateMovie = (id, payload) =>
  api.put(`/movie/${id}`, payload);         // PUT /api/movie/:id

export const readMovie = (id) =>
  api.get(`/movie/${id}`);                  // GET /api/movie/:id
