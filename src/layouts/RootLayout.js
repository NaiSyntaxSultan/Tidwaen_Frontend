import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

const RootLayout = () => {
  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-black/95">
      {/* 🟣 ดวงไฟฟุ้งลอย (พื้นหลังฟิกทุกหน้า) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/5 left-44 w-96 h-96 bg-[#0A22FA] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-float"></div>

        <div className="absolute top-32 right-32 w-96 h-96 bg-[#560081] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-floatX"></div>

        <div className="absolute bottom-2 left-1 w-80 h-80 bg-[#560081] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-float"></div>

        <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-[#0A22FA] rounded-full mix-blend-screen filter blur-3xl opacity-40 animate-floatX"></div>
      </div>

      {/* 🟣 Navbar */}
      <header className="bg-black/30 backdrop-blur-xl fixed w-full z-50">
        <Navbar />
      </header>

      {/* 🟣 Content */}
      <main className="relative z-10 pt-16">
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout
