"use client";

import { useState } from "react";
import Image from "next/image";


export default function SidebarProfile() {


  // 🔄 Efek flip foto profil
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* 🖼️ Foto Profil (tanpa card tambahan) */}
      <div className="relative w-32 h-32 [perspective:1000px]">
        <div
          className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] ${
            isFlipped ? "[transform:rotateY(180deg)]" : ""
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <Image
              src="/profile/Foto_David_Darmawan.jpeg"
              alt="Profile Front"
              width={128}
              height={128}
              className="rounded-full object-cover border-2 border-white/30"
            />
          </div>

          {/* Back */}
          <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <Image
              src="/profile/Shape_of_eye_no_border.png"
              alt="Profile Back"
              width={128}
              height={128}
              className="rounded-full object-cover border-2 border-white/30"
            />
          </div>
        </div>
      </div>

      {/* 🔘 Tombol Switch */}
      <button
        onClick={() => setIsFlipped((prev) => !prev)}
        className="px-3 py-1 text-sm rounded-md bg-white/10 hover:bg-white/20 transition text-white"
      >
        🔄 Switch
      </button>
    </div>
  );
}
