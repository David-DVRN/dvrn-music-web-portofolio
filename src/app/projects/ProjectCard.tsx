"use client";
import { motion } from "framer-motion";
import Image from "next/image";

interface ProjectCardProps {
  title: string;
  type: "video" | "blog" | "presentation";
  source: string; // URL YouTube embed atau ID video
}

export default function ProjectCard({ title, type, source }: ProjectCardProps) {
  // Ambil ID video YouTube dari URL
  const videoIdMatch = source.match(/(?:embed\/|v=)([^?&]+)/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-xl overflow-hidden group cursor-pointer"
    >
      {/* 🔹 Neon Border */}
      <div className="absolute inset-0 rounded-xl p-[2px] bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-border-glow">
        <div className="h-full w-full rounded-xl bg-black/90 group-hover:bg-black/70 transition"></div>
      </div>

      {/* 🔹 Isi Card */}
      <div className="relative z-10 p-4 text-white">
        {type === "video" && videoId ? (
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <Image
              src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
              alt={title}
              width={320}
              height={180}
              className="w-full h-full object-cover rounded-lg"
            />
            {/* Tombol play overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="red"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="white"
                className="w-12 h-12 drop-shadow-md"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.25 5.25v13.5l13.5-6.75L5.25 5.25z"
                />
              </svg>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-black/50 rounded-lg text-center">
            <p>{title}</p>
          </div>
        )}
        <h3 className="mt-3 text-lg font-semibold">{title}</h3>
      </div>
    </motion.div>
  );
}
