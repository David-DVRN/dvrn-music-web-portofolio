"use client"
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle, User, Users, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 🤖 Ganti dengan Token Bot & Chat ID Telegram kamu
  const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

  const handleSubmit = async () => {
    if (!feedback.trim() || feedback.length < 10) {
      alert("Feedback harus minimal 10 karakter!");
      return;
    }

    setIsSubmitting(true);

    // Format pesan Telegram dengan emoji
    const timestamp = new Date().toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "short"
    });

    const message = `
🌟 *FEEDBACK BARU*

👤 *Nama:* ${name || "Anonim"}
${gender === "Laki-laki" ? "👨" : gender === "Perempuan" ? "👩" : "⚧️"} *Gender:* ${gender || "Tidak disebutkan"}

📝 *Pesan:*
${feedback}

⏰ *Waktu:* ${timestamp}

━━━━━━━━━━━━━━━
_📨 Dikirim dari Dvrn Music Official Website_
    `.trim();

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: "Markdown",
          }),
        }
      );

      if (response.ok) {
        setIsSuccess(true);
        // Reset form setelah 2 detik
        setTimeout(() => {
          setName("");
          setGender("");
          setFeedback("");
          setIsSuccess(false);
        }, 2000);
      } else {
        throw new Error("Gagal mengirim feedback");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengirim feedback. Silakan coba lagi!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4"
          >
            <MessageCircle size={40} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Feedback Corner
          </h1>
          <p className="text-gray-300">
            Berikan kritik dan saran atau mau tanya juga boleh untuk website ini! 💬
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full">
            <span className="text-blue-300 text-sm">🤖 Powered by</span>
            <span className="text-blue-200 font-semibold text-sm">Dvrn Music Feedback</span>
          </div>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-center gap-3"
          >
            <CheckCircle size={24} className="text-green-400" />
            <div>
              <p className="text-green-300 font-semibold">Feedback Terkirim! 🎉</p>
              <p className="text-green-200 text-sm">Terima kasih atas masukan Anda!</p>
            </div>
          </motion.div>
        )}

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl"
        >
          <div className="space-y-6">
            {/* Nama (Optional) */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                <User size={16} />
                Nama <span className="text-gray-400 text-xs">(opsional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama Anda atau biarkan kosong"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                disabled={isSubmitting}
              />
            </div>

            {/* Gender */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-3">
                <Users size={16} />
                Gender
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setGender("Laki-laki")}
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition ${
                    gender === "Laki-laki"
                      ? "bg-blue-500/30 border-blue-500"
                      : "bg-white/10 border-white/20 hover:bg-white/20"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="text-2xl">👨</span>
                  <span className="text-white font-medium">Laki-laki</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGender("Perempuan")}
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 rounded-lg transition ${
                    gender === "Perempuan"
                      ? "bg-pink-500/30 border-pink-500"
                      : "bg-white/10 border-white/20 hover:bg-white/20"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="text-2xl">👩</span>
                  <span className="text-white font-medium">Perempuan</span>
                </button>
              </div>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-200 mb-2">
                <MessageCircle size={16} />
                Feedback <span className="text-red-400">*</span>
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tulis kritik, saran, atau pesan Anda di sini..."
                rows={6}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition resize-none disabled:opacity-50"
              />
              <p className="text-xs text-gray-400 mt-1">
                Minimal 10 karakter • {feedback.length}/500
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || feedback.length < 10}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-pink-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Mengirim ke Bot...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Kirim ke Dvrn Music Feedback
                </>
              )}
            </motion.button>
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-200 flex items-start gap-2">
              <span className="text-lg">🤖</span>
              <span>
                Feedback akan dikirim langsung ke <strong>Dvrn Music Feedback</strong> secara otomatis dan anonim.
              </span>
            </p>
          </div>
        </motion.div>

        {/* Back to Home */}
        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-6 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-semibold transition flex items-center gap-2"
          >
            ⬅️ Back to Projects
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}