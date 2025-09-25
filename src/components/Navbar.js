// src/components/Navbar.jsx
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  // อ่าน role จาก localStorage
  const [role, setRole] = useState(null);
  useEffect(() => {
    const readRole = () => {
      try {
        const raw = localStorage.getItem("user");
        if (raw) {
          const u = JSON.parse(raw);
          const r = u?.role ?? u?.user?.role ?? null;
          setRole(r);
        } else {
          setRole(null);
        }
      } catch {
        setRole(null);
      }
    };

    readRole();
    const onStorage = (e) => { if (e.key === "user") readRole(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const linkBase =
    "px-3 py-2 text-white text-xl hover:text-purple-400 transition";
  const linkActive =
    "text-purple-400 font-semibold border-b-2 border-purple-400";

  const isAdmin = isLoggedIn && String(role || "").toLowerCase() === "admin";

  return (
    <header>
      <nav className="container-page flex items-center justify-around h-14 px-6">

        {/* โลโก้:
            - ถ้า 'ยังไม่ล็อกอิน' = เป็น div เฉย ๆ (ไม่ลิงก์)
            - ถ้า 'ล็อกอินแล้ว'   = ลิงก์ไปหน้า Home ตามเดิม */}
        {isLoggedIn ? (
          <Link to="/home" className="font-saira text-xl text-white flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="h-8" />
            TIDWAEN CINEMA
          </Link>
        ) : (
          <div
            className="font-saira text-xl text-white flex items-center gap-2 select-none cursor-default"
            title="กรุณาเข้าสู่ระบบ"
            aria-label="Logo"
          >
            <img src="/logo.png" alt="logo" className="h-8" />
            TIDWAEN CINEMA
          </div>
        )}

        {/* เมนูซ้าย */}
        <div className="font-battambang flex gap-10">
          {isLoggedIn && (
            <>
              <NavLink
                to="/home"
                end
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : ""}`
                }
              >
                Home
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `${linkBase} ${isActive ? linkActive : ""}`
                }
              >
                History
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="admin"
                  className={({ isActive }) =>
                    `${linkBase} ${isActive ? linkActive : ""}`
                  }
                >
                  Admin
                </NavLink>
              )}
            </>
          )}
        </div>

        {/* ปุ่มขวา */}
        <div className="flex items-center gap-4">
          {isLoggedIn && (
            <Link
              to="/search"
              className="text-white text-xl hover:text-purple-400 transition"
              aria-label="Search"
              title="Search"
            >
              <FiSearch />
            </Link>
          )}

          <button
            type="button"
            className="font-battambang px-2 py-1 border border-gray-400 text-sm text-white rounded"
          >
            TH
          </button>

          {!isLoggedIn ? (
            <>
              <NavLink to="/register">
                <button className="font-battambang px-4 py-1 rounded-full text-white text-sm bg-gradient-to-r from-[#560081] via-[#5335FF] to-[#1091FB] hover:opacity-90 transition">
                  Register
                </button>
              </NavLink>
              <NavLink to="/login">
                <button className="font-battambang px-4 py-1 rounded-full text-white text-sm bg-gradient-to-r from-[#560081] via-[#5335FF] to-[#1091FB] hover:opacity-90 transition">
                  Login
                </button>
              </NavLink>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="px-4 py-1 rounded-full text-white text-sm bg-red-600 hover:bg-red-700 transition"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
