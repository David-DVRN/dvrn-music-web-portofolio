"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

interface Theme {
  bg: string;
  particle: string[];
}

const getThemeByHour = (hour: number): Theme => {
  if (hour >= 6 && hour < 12) {
    return {
      bg: "#cce3f2",
      particle: ["#ff0000", "#0094ff", "#ffb700"],
    };
  } else if (hour >= 12 && hour < 18) {
    return {
      bg: "#87ceeb",
      particle: ["#f72828", "#2862f7", "#28f758"],
    };
  } else if (hour >= 18 && hour < 21) {
    return {
      bg: "#ff9966",
      particle: ["#111D5E", "#F37121", "#FFBD69"],
    };
  } else {
    return {
      bg: "#0b0636",
      particle: ["#ffffff", "#dbeafe", "#fef9c3", "#c7d2fe"],
    };
  }
};


export default function ParticlesBackground() {
  const [theme, setTheme] = useState<Theme>({
    bg: "#0b0636",
    particle: ["#5a189a", "#c77dff", "#e0aaff"],
  });
  const [engineReady, setEngineReady] = useState(false);

  // ✅ Inisialisasi engine (versi baru)
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setEngineReady(true));
  }, []);

  useEffect(() => {
    const updateTheme = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      // ubah hanya saat jam berubah atau tiap 1 menit terakhir sebelum jam baru
      const transitionHours = [6, 12, 18, 21];
      const nextTransition = transitionHours.includes((hour + 1) % 24);

      if (minute === 59 && nextTransition) {
        // transisi halus menjelang jam baru
        setTheme((prev) => ({
          ...prev,
          bg: getThemeByHour((hour + 1) % 24).bg,
          particle: getThemeByHour((hour + 1) % 24).particle,
        }));
      } else {
        // default theme tiap menit
        setTheme(getThemeByHour(hour));
      }
    };


    updateTheme();
    const interval = setInterval(updateTheme, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!engineReady) return null; // Tunggu sampai engine siap

  return (
    <div
      className="absolute inset-0 -z-10 transition-colors duration-[2000ms] ease-in-out"
      style={{ backgroundColor: theme.bg }}
    >
      <Particles
        id="tsparticles"
        options={{
          fpsLimit: 60,
          particles: {
            number: {
              value: 50,
              density: { enable: true, width: 800, height: 800 },
            },
            color: { value: theme.particle },
            links: {
              enable: true,
              color: theme.particle[0],
              distance: 150,
              opacity: 0.7,
              width: 1,
            },
            move: {
              enable: true,
              speed: 2,
              outModes: { default: "bounce" },
            },
            opacity: { value: 0.8 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 5 } },
          },
          interactivity: {
            events: {
              onHover: { enable: true, mode: "repulse" },
              resize: {enable:true},
            },
            modes: {
              repulse: { distance: 100, duration: 0.4 },
            },
          },
          detectRetina: true,
        }}
      />
    </div>
  );
}
