import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import RootLayout from "./layouts/RootLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cinema from "./pages/Cinema";
import Detail from "./pages/Detail";
import Search from "./pages/Search";
import BookingConfirm from "./pages/BookingConfirm";
import AdminManagement from "./pages/AdminManagement";
import History from "./pages/History";
import ProtectedRoute from "./layouts/ProtectedRoute";
import AdminMovieDetail from "./pages/AdminMovieDetail";
import AdminDashboard from "./pages/AdminDashboard";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route element={<RootLayout />}>
            <Route index element={<Login />} />
            <Route index path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="Home" element={<Home />} />
              <Route path="detail/:id" element={<Detail />} />
              <Route path="cinema" element={<Cinema />} />
              <Route path="booking/:id" element={<BookingConfirm />} />
              <Route path="history" element={<History />} />
              <Route path="search" element={<Search />} />
              <Route path="admin" element={<Admin />} />
              <Route path="adminmanagement" element={<AdminManagement />} />
              <Route path="moviedetails" element={<AdminMovieDetail />} />
              <Route path="dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="container-page py-10">
                <h1 className="text-3xl font-bold">404 Not Found</h1>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
