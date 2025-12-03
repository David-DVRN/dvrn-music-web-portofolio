"use client";

import { useEffect, useState } from "react";

interface Theme {
  bg: string;
}

const getThemeByHour = (hour: number): Theme => {
  if (hour >= 6 && hour < 12) {
    // 🌅 Pagi
    return { bg: "linear-gradient(180deg, #0094ff, #ffb700)" };
  } else if (hour >= 12 && hour < 18) {
    // 🌤️ Siang
    return { bg: "linear-gradient(180deg, #2862f7, #28f758)" };
  } else if (hour >= 18 && hour < 21) {
    // 🌇 Sore
    return { bg: "linear-gradient(180deg, #f2a622, #020670)" };
  } else {
    // 🌙 Malam
    return { bg: "linear-gradient(180deg, #9800d9, #c7d900)" };
  }
};

export default function SidebarBackground() {
  const [theme, setTheme] = useState<Theme>({ bg: "linear-gradient(180deg, #0b0636, #1a103d)" });

  useEffect(() => {
    const updateTheme = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();

      // jam pergantian tema
      const transitionHours = [6, 12, 18, 21];
      const nextTransition = transitionHours.includes((hour + 1) % 24);

      if (minute === 59 && nextTransition) {
        setTheme(getThemeByHour((hour + 1) % 24));
      } else {
        setTheme(getThemeByHour(hour));
      }
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60 * 1000); // tiap 1 menit cek lagi
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="absolute inset-0 min-h-full -z-10 transition-all duration-[2000ms] ease-in-out"
      style={{
        backgroundImage: theme.bg,
      }}
   />
  );
}
