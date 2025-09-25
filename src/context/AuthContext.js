import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // อ่าน token จาก localStorage ตั้งแต่ตอนสร้าง state (ไม่รอ useEffect)
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));

  // เรียกเมื่อ login สำเร็จ (รับ token จริงจาก API)
  const login = (token) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
  };

  // เรียกเมื่อ logout
  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
