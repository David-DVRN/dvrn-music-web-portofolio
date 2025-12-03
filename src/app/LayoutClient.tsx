"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

import ParticlesBackground from "./components/ParticlesBackground";
import SidebarContent from "./components/SidebarContent";
import SidebarBackground from "./components/SidebarBackground";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showCV, setShowCV] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleMenu = (menu: string) =>
    setOpenMenu(openMenu === menu ? null : menu);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full text-gray-900 relative">
      <ParticlesBackground />

      {/* === SIDEBAR MOBILE === */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 lg:hidden w-full h-full bg-black/70 backdrop-blur-sm"
            onClick={toggleSidebar}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="w-64 h-full text-gray-100 backdrop-blur-md shadow-xl overflow-y-auto relative"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              <div className="absolute inset-0 -z-10">
                <SidebarBackground />
              </div>

              <div className="p-4 flex flex-col space-y-4 w-full">
                <button
                  onClick={toggleSidebar}
                  className="absolute top-4 right-4 p-2 text-white hover:text-gray-200 z-50"
                  aria-label="Tutup Menu"
                >
                  <X size={24} />
                </button>

                <SidebarContent
                  openMenu={openMenu}
                  toggleMenu={toggleMenu}
                  showCV={showCV}
                  setShowCV={setShowCV}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === SIDEBAR DESKTOP === */}
      <div className="hidden lg:block lg:w-64 lg:h-screen lg:fixed lg:left-0 lg:top-0 text-gray-100 backdrop-blur-md shadow-xl overflow-y-auto z-10">
        <div className="absolute inset-0 -z-10">
          <SidebarBackground />
        </div>
        <div className="p-4 flex flex-col space-y-4 w-full min-h-full">
          <SidebarContent
            openMenu={openMenu}
            toggleMenu={toggleMenu}
            showCV={showCV}
            setShowCV={setShowCV}
          />
        </div>
      </div>

      {/* === MAIN CONTENT AREA === */}
      <main className="flex-1 relative z-0 overflow-y-auto min-h-screen lg:ml-64">
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 right-4 z-40 p-3 bg-pink-600 text-white rounded-full shadow-lg"
          aria-label="Toggle Menu"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* 🔹 CV Display */}
        {showCV ? (
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10"
            >
              <h2 className="text-2xl font-semibold text-white mb-3">Curriculum Vitae</h2>
              <a
                href="/cv/David_Darmawan_resume_New_Update.pdf"
                download
                className="inline-block mb-4 px-4 py-2 rounded-md bg-pink-600 hover:bg-pink-700 transition text-white text-sm"
              >
                📥 Download CV
              </a>
              <iframe
                src="/cv/David_Darmawan_resume_New_Update.pdf"
                className="w-full h-96 lg:h-[800px] rounded-lg border border-white/10"
                title="CV Preview"
              />
            </motion.div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}