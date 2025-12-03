"use client";

import React from "react";
import { User, Briefcase, Code, HelpCircle, MessageCircle, Heart, Contact } from "lucide-react";
import SidebarProfile from "./SidebarProfile";
import { motion } from "framer-motion";

interface SidebarContentProps {
  openMenu: string | null;
  toggleMenu: (menu: string) => void;
  showCV: boolean;
  setShowCV: (show: boolean) => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  openMenu,
  toggleMenu,
  showCV,
  setShowCV,
}) => (
  <>
    {/* Profile */}
    <div>
      <button
        onClick={() => toggleMenu("profile")}
        className="flex items-center gap-2 p-2 w-full text-left font-medium hover:bg-gray-700/60 rounded-md"
      >
        <User size={20} /> Profile
      </button>
      {openMenu === "profile" && (
        <div className="ml-6 mt-2 text-sm text-gray-300 space-y-3">
          <div className="flex justify-center mb-4">
            <SidebarProfile />
          </div>
          <div className="p-4 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 shadow-md text-sm text-gray-100">
            <p>Nama: David Darmawan</p>
            <p>Kampus: Universitas Mercu Buana</p>
            <p>Jurusan: Teknik Informatika</p>
          </div>
          <button
            onClick={() => setShowCV(!showCV)}
            className="px-3 py-1 bg-pink-500/70 hover:bg-pink-600 text-white rounded-md transition text-sm w-full"
          >
            {showCV ? "Hide CV" : "Show CV"}
          </button>
        </div>
      )}
    </div>

    {/* Experience */}
    <div>
      <button
        onClick={() => toggleMenu("experience")}
        className="flex items-center gap-2 p-2 w-full text-left font-medium hover:bg-gray-700/60 rounded-md"
      >
        <Briefcase size={20} /> Experience
      </button>
      {openMenu === "experience" && (
        <div className="ml-6 mt-2 text-sm text-gray-200 space-y-4">
          <div className="p-4 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 shadow-md text-sm text-gray-100">
            <div className="mb-3">
              <p className="font-semibold">Telkomsel</p>
              <p className="italic">CVM Tester & Operation | Nov 2024 – Feb 2025</p>
              <ul className="list-disc ml-4">
                <li>Campaign testing & documentation</li>
                <li>Campaign validation & error prevention</li>
                <li>Monthly data recap & analysis</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">Data Academy</p>
              <p className="italic">MSIB Data Science Academy | Feb 2023 – Jun 2023</p>
              <ul className="list-disc ml-4">
                <li>Dashboard development (Excel, Tableau)</li>
                <li>Applied ML algorithms (K-Means, Decision Tree, etc.)</li>
                <li>Final project: K-Means clustering + Tableau</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Technology */}
    <div>
      <button
        onClick={() => toggleMenu("technology")}
        className="flex items-center gap-2 p-2 w-full text-left font-medium hover:bg-gray-700/60 rounded-md"
      >
        <Code size={20} /> Technology
      </button>

      {openMenu === "technology" && (
        <div className="ml-6 mt-2">
          <div className="p-4 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 shadow-md text-sm text-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { name: "Python", file: "python.png" },
                { name: "Excel", file: "excel.png" },
                { name: "Tableau", file: "tableau.png" },
                { name: "FL Studio", file: "flstudio.png" },
                { name: "Adobe After Effect", file: "aftereffectlogo.png" },
                { name: "Canva", file: "canvalogo.png" },
                { name: "Adobe Illustrator", file: "illustratorlogo.png" },
                { name: "Laragon", file: "laragonlogo.png" },
                { name: "Adobe Media Encoder", file: "melogo.png" },
                { name: "Next JS", file: "nextjslogo.png" },
                { name: "Powerpoint", file: "powerpointlogo.png" },
                { name: "React", file: "reactlogo.png" },
                { name: "Typescript", file: "typescriptlogo.png" },
                { name: "VSCode", file: "vscodelogo.png" },
                { name: "ChatGPT", file: "chatgptlogo.png" },
              ].map((tech) => (
                <div key={tech.name} className="flex flex-col items-center">
                  <motion.img
                    src={`/tech/${tech.file}`}
                    alt={tech.name}
                    className="w-12 h-12 object-contain"
                    whileHover={{ scale: 1.1 }}
                  />
                  <span className="mt-1 text-xs text-gray-200">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Quiz */}
    <div>
      <button
        onClick={() => toggleMenu("quiz")}
        className="flex items-center gap-2 p-2 w-full text-left font-medium hover:bg-gray-700/60 rounded-md"
      >
        <HelpCircle size={20} /> Quiz
      </button>

      {openMenu === "quiz" && (
        <div className="ml-6 mt-2 text-sm text-gray-200 space-y-4">
          <div className="p-4 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 shadow-md text-sm text-gray-100 text-center">
            <p className="mb-2">🎯 Ayo uji pengetahuanmu!</p>
            <a
              href="/quiz"
              className="inline-block px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white transition"
            >
              Mulai Kuis
            </a>
          </div>
        </div>
      )}
    </div>

    {/* Games */}
    <div>
      <a
        href="/games"
        className="flex items-center gap-2 p-2 w-full text-left font-medium hover:bg-gray-700/60 rounded-md transition"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Games
      </a>
    </div>
    <a href="/feedback" className="flex items-center gap-2 p-2 w-full text-left font-medium hover:bg-gray-700/60 rounded-md transition">
     <MessageCircle size={20} /> Feedback
    </a>
    {/*support me*/}
    <div>
      <button
        onClick={() => toggleMenu("support")}
        className="flex items-center gap-2 p-2 w-full text-left font-medium hover:bg-gray-700/60 rounded-md"
      >
        <Heart size={20} /> Support Me
      </button>

      {openMenu === "support" && (
        <div className="ml-6 mt-2 text-sm text-gray-200 space-y-4">
          <div className="p-4 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 shadow-md text-sm text-gray-100">
            <div className="text-center space-y-3">
              <div className="text-2xl">💖</div>
              <p className="font-medium">Dukung Karya Saya!</p>
              <p className="text-xs text-gray-300">
                Dukunganmu sangat berarti untuk terus membuat konten yang lebih baik
              </p>
              
              <a
                href="https://tako.id/Dvrn_Music"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg text-white transition font-medium"
              >
                🎁 Donasi via Tako
              </a>
            </div>
          </div>
        </div>
      )}
    </div>

    {/*Contact Me*/}
    <div>
      <button
        onClick={() => toggleMenu("contact")}
        className="flex items-center gap-2 p-2 w-full text-left font-medium hover:bg-gray-700/60 rounded-md"
      >
        <Contact size={20} /> Contact Me
      </button>

      {openMenu === "contact" && (
        <div className="ml-6 mt-2 text-sm text-gray-200 space-y-4">
          <div className="p-4 rounded-xl bg-black/30 backdrop-blur-md border border-white/20 shadow-md text-sm text-gray-100">
            <div className="text-center space-y-3">
              <p className="font-medium">Terhubung Dengan Saya!</p>
              <p className="text-xs text-gray-300">
                Untuk terhubung dengan saya di platform lain
              </p>
              
              <a
                href="https://linktr.ee/dvrn_"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full px-4 py-2.5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg text-white transition font-medium"
              >
                Connect with me
              </a>
              
            </div>
          </div>
        </div>
      )}
    </div>
   
  </>
);

export default SidebarContent;