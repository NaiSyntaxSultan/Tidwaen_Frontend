import api from "../api/axios";

// ========== Movies ==========
export const remove = async (id) => {
  await api.delete(`/movie/${id}`);
};

export const create = async (movie) => {
  await api.post(`/movie`, movie);
};

export const getdata = async () => {
  return await api.get(`/movie`);
};

export const read = async (id) => {
  return await api.get(`/movie/${id}`);
};

export const update = async (id, movie) => {
  await api.put(`/movie/${id}`, movie);
};

// ========== Auth ==========
export const login = async (username, password) => {
  // backend: POST /api/login { username, password }
  return await api.post(`/login`, { username, password });
};

export const register = async (payload) => {
  // payload: { nickname, username, email, password }
  return await api.post(`/register`, payload);
};

// helper เพิ่มเติม
export const saveAuth = ({ token, payload }) => {
  if (token) localStorage.setItem("token", token);
  if (payload) localStorage.setItem("user", JSON.stringify(payload.user || payload));
};

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

// ========== Movies Search ==========
export const searchMovies = async ({ title, genre } = {}) => {
  const params = {};
  if (title) params.title = title;
  if (genre) params.genre = genre;
  return await api.get(`/movie/search`, { params });
};
