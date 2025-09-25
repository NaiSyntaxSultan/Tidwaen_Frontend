// src/pages/Admin.js
import React from "react";
import { Link } from "react-router-dom";
import { FaCog, FaFilm, FaTachometerAlt } from "react-icons/fa";

export default function Admin() {
  const cards = [
    {
      title: "Management",
      desc: "จัดการภาพยนตร์/รอบฉาย/ที่นั่ง และงานหลังบ้าน",
      to: "/adminmanagement",
      icon: <FaCog className="text-3xl" />,
      accent: "from-[#0E2AAE] to-[#1a1a2e]",
    },
    {
      title: "Details",
      desc: "ดู/แก้ไขรายละเอียดหนังในระบบ",
      to: "/moviedetails",
      icon: <FaFilm className="text-3xl" />,
      accent: "from-[#7A1CC0] to-[#1a1a2e]",
    },
    {
      title: "Dashboard",
      desc: "ภาพรวมสถิติการขาย ตั๋วคงเหลือ และรอบวันนี้",
      to: "/dashboard",
      icon: <FaTachometerAlt className="text-3xl" />,
      accent: "from-[#A000FF] to-[#1a1a2e]",
    },
  ];

  return (
    <div className="text-white">
      <header className="px-44 pt-12 w-full">
        <h1 className="text-4xl font-goldman font-bold text-[#8F00D7] mb-3 drop-shadow-[0_0_20px_rgba(143,0,215,0.85)]">
          Admin Panel
        </h1>
        <p className="text-white/70 text-lg">เลือกเมนูที่ต้องการจัดการ</p>
      </header>

      <div className="px-10 md:px-20 mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.title}
            className={`relative rounded-3xl p-6 border border-white/10
                        bg-gradient-to-b ${c.accent} 
                        shadow-[0_12px_40px_rgba(0,0,0,0.6)] 
                        hover:scale-105 hover:shadow-[0_15px_50px_rgba(143,0,215,0.6)] 
                        transition duration-300 ease-in-out flex flex-col justify-between`}
          >
            {/* ส่วนบน: ไอคอน + ชื่อ + คำอธิบาย */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-black/70 grid place-items-center text-purple-400">
                {c.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{c.title}</h3>
                <p className="text-sm text-white/70">{c.desc}</p>
              </div>
            </div>

            {/* ปุ่ม Open ด้านขวาล่าง */}
            <div className="mt-8 flex justify-end">
              <Link
                to={c.to}
                className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 
                           shadow-md hover:shadow-lg transition text-white font-medium"
              >
                Open
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
