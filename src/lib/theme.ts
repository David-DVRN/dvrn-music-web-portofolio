// lib/theme.ts
export interface SidebarTheme {
  gradient: string;
  text: string;
}

export const getSidebarGradientByHour = (hour: number): SidebarTheme => {
  if (hour >= 6 && hour < 12) {
    // 🌅 Pagi — lembut tapi agak biru muda
    return {
      gradient: "from-[#b5d5e5] via-[#a8c8e1] to-[#8db9d8]", // sedikit lebih dalam dari bg utama
      text: "text-gray-800",
    };
  } else if (hour >= 12 && hour < 18) {
    // ☀️ Siang — cerah tapi sedikit lebih dalam
    return {
      gradient: "from-[#6eb5d9] via-[#4aa3d1] to-[#2c82c9]",
      text: "text-white",
    };
  } else if (hour >= 18 && hour < 21) {
    // 🌇 Sore — nuansa hangat tapi agak kemerahan
    return {
      gradient: "from-[#ff8350] via-[#ff7043] to-[#ff9966]",
      text: "text-gray-900",
    };
  } else {
    // 🌌 Malam — tetap gelap tapi sedikit lebih ke ungu kebiruan
    return {
      gradient: "from-[#1a1045] via-[#301b75] to-[#4b2f91]",
      text: "text-gray-100",
    };
  }
};
