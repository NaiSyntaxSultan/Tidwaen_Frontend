import api from "../api/axios";


// SHOWTIME
export const listShowtimes = (params = {}) => api.get("/showtime", { params });
export const updateShowtime = (id, payload) => api.put(`/showtime/${id}`, payload);
export const removeShowtime = (id) => api.delete(`/showtime/${id}`);

// MOVIE
export const updateMovie = (id, payload) => api.put(`/movie/${id}`, payload);
export const removeMovie = (id) => api.delete(`/movie/${id}`);
