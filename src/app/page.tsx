"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProjectCard from "./projects/ProjectCard";

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
};

const linkify = (text: string) => {
  if (!text) return text;

  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const newlineRegex = /\r\n|\r|\n/g;
  const lines = text.split(newlineRegex);

  return lines.map((line, lineIndex) => {
    const parts = line.split(urlRegex);
    const hasContent = line.trim().length > 0;

    const elements = parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-400 hover:text-pink-300 underline transition"
          >
            {part}
          </a>
        );
      }
      return part;
    });

    return (
      <span key={lineIndex}>
        {elements}
        {lineIndex < lines.length - 1 && hasContent && <br />}
      </span>
    );
  });
};

export default function HomePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("/api/videos");
        const data = await res.json();
        setVideos(data);
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    }
    fetchVideos();
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        alert("✅ Link copied to clipboard!");
      } else {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        alert("✅ Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Copy failed", err);
      alert("Failed to copy link.");
    }
  };

  return (
    <div className="p-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1
          className="text-4xl font-bold text-white drop-shadow-[0_0_6px_rgba(0,0,0,0.6)] mt-2 mb-6"
          style={{
            WebkitTextStroke: "0.6px rgba(0,0,0,0.25)",
          }}
        >
          Projects
        </h1>

        {selectedVideo ? (
          <motion.div
            key={selectedVideo.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col lg:flex-row items-start gap-8"
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex-1 w-full"
            >
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg border border-white/10">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                  title={selectedVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedVideo(null)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  ⬅️ Back to Projects
                </motion.button>

                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={`https://www.youtube.com/channel/UCy4yQVU_kWnGFktKFYMWYKQ?sub_confirmation=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-semibold text-white transition flex items-center gap-1"
                >
                  🔔 Subscribe
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsShareOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-semibold text-white transition flex items-center gap-1"
                >
                  🔗 Share
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    window.open(
                      `https://www.youtube.com/watch?v=${selectedVideo.id}`,
                      "_blank"
                    )
                  }
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-md text-sm font-semibold text-white transition flex items-center gap-1"
                >
                  👍 Like
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-1 w-full bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-white"
            >
              <h2 className="text-2xl font-semibold mb-4">
                {selectedVideo.title}
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed mb-6 break-all">
                {linkify(
                  selectedVideo.description || "No description available."
                )}
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-6"
          >
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => setSelectedVideo(video)}
                className="cursor-pointer"
              >
                <ProjectCard
                  title={video.title}
                  type="video"
                  source={`https://www.youtube-nocookie.com/embed/${video.id}`}
                />
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {isShareOpen && selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setIsShareOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-80 text-center text-white shadow-lg"
            >
              <h3 className="text-lg font-semibold mb-4">Share this video</h3>

              <div className="flex flex-col gap-3">
                <button
                  onClick={async () => {
                    await copyToClipboard(
                      `https://www.youtube.com/watch?v=${selectedVideo.id}`
                    );
                    setIsShareOpen(false);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-md text-sm font-semibold"
                >
                  📋 Copy Link
                </button>

                <a
                  href={`https://twitter.com/intent/tweet?url=https://www.youtube.com/watch?v=${selectedVideo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-md text-sm font-semibold"
                >
                  🐦 Share to X (Twitter)
                </a>

                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=https://www.youtube.com/watch?v=${selectedVideo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 rounded-md text-sm font-semibold"
                >
                  📘 Share to Facebook
                </a>

                <a
                  href={`https://api.whatsapp.com/send?text=https://www.youtube.com/watch?v=${selectedVideo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-semibold"
                >
                  💬 Share to WhatsApp
                </a>

                <button
                  onClick={async () => {
                    await copyToClipboard(
                      `https://www.youtube.com/watch?v=${selectedVideo.id}`
                    );
                    alert("📋 Link copied! Paste it on Instagram bio or story.");
                    window.open("https://www.instagram.com/", "_blank");
                    setIsShareOpen(false);
                  }}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-md text-sm font-semibold"
                >
                  📸 Share to Instagram
                </button>

                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    `https://www.youtube.com/watch?v=${selectedVideo.id}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-md text-sm font-semibold"
                >
                  💼 Share to LinkedIn
                </a>
              </div>

              <button
                onClick={() => setIsShareOpen(false)}
                className="mt-5 text-gray-400 hover:text-white text-sm"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}