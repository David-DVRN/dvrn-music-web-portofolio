"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// 🔹 Types
type Question = {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

type Answer = {
  answer: string;
  isCorrect: boolean;
};

type Difficulty = "easy" | "medium" | "hard";

// 🔹 Daftar kategori kuis
const categories = [
  { id: 17, name: "Science", color: "from-green-400 to-green-600" },
  { id: 22, name: "Geography", color: "from-blue-400 to-blue-600" },
  { id: 21, name: "Sports", color: "from-orange-400 to-orange-600" },
  { id: 15, name: "Video Games", color: "from-purple-400 to-purple-600" },
  { id: 31, name: "Anime & Manga", color: "from-pink-500 to-red-600" },
  { id: 12, name: "Music", color: "from-yellow-400 to-amber-500" },
  { id: 9, name: "General Knowledge", color: "from-indigo-400 to-indigo-600" },
  { id: 19, name: "Mathematics", color: "from-teal-400 to-cyan-500" },
];

// 🔹 Daftar difficulty
const difficulties = [
  { value: "easy", name: "Easy", color: "from-green-500 to-green-700", icon: "😊" },
  { value: "medium", name: "Medium", color: "from-yellow-500 to-orange-600", icon: "🤔" },
  { value: "hard", name: "Hard", color: "from-red-500 to-red-700", icon: "😰" },
];

export default function QuizPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  // 💡 State ini sekarang akan menyimpan jawaban yang SUDAH di-decode.
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([]); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Answer[]>([]);
  // 💡 State ini juga akan menyimpan jawaban yang SUDAH di-decode.
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null); 
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedQuestion, setTranslatedQuestion] = useState<string>("");
  const [translatedAnswers, setTranslatedAnswers] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<Record<string, string>>({});

  // 🔹 Decode HTML entities dan hapus sisa tag
  const cleanText = (html: string) => {
    // Pastikan input adalah string sebelum pembersihan
    if (!html || typeof html !== 'string') return '';
    
    // 1. Decode HTML entities (e.g., &quot; -> ", &lt; -> <)
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    let decodedText = txt.value;

    // 2. Strip any residual HTML/XML tags (e.g., <primary> -> empty)
    decodedText = decodedText.replace(/<[^>]*>?/gm, '');

    return decodedText;
  };

  // 🔹 Shuffle answers helper
  const shuffleArray = (array: string[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  /**
   * 🔹 FUNGSI TERJEMAHAN BARU: Menerjemahkan Pertanyaan dan Opsi Jawaban
   */
  const translateQuestionAndAnswers = async (questionText: string, answerTexts: string[]) => {
    const allTexts = [questionText, ...answerTexts];
    const textsToTranslate: string[] = [];
    const cacheHits: Record<string, string> = {};

    // 1. Cek Cache untuk semua teks
    allTexts.forEach(text => {
      if (translationCache[text]) {
        cacheHits[text] = translationCache[text];
      } else {
        textsToTranslate.push(text);
      }
    });

    // Jika semua sudah di-cache, update state dan keluar
    if (textsToTranslate.length === 0) {
      setTranslatedQuestion(cacheHits[questionText] || "");
      const translatedAnswersMap: Record<string, string> = {};
      answerTexts.forEach(original => {
        translatedAnswersMap[original] = cacheHits[original] || original;
      });
      setTranslatedAnswers(translatedAnswersMap);
      return;
    }

    setTranslating(true);
    try {
      // 2. Terjemahkan teks yang belum di-cache secara paralel
      const translationPromises = textsToTranslate.map(text =>
        fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        })
          .then(res => res.json())
          .then(data => ({
            original: text,
            translated: data.translation || "Translation unavailable"
          }))
      );

      const results = await Promise.all(translationPromises);

      const newTranslations: Record<string, string> = {};
      results.forEach(r => newTranslations[r.original] = r.translated);
      const allTranslations = { ...cacheHits, ...newTranslations };

      // 3. Update State Pertanyaan dan Jawaban
      setTranslatedQuestion(allTranslations[questionText] || "Translation unavailable");

      const translatedAnswersMap: Record<string, string> = {};
      answerTexts.forEach(original => {
        translatedAnswersMap[original] = allTranslations[original] || original;
      });
      setTranslatedAnswers(translatedAnswersMap);

      // 4. Update Cache
      setTranslationCache(prev => ({ ...prev, ...newTranslations }));

    } catch (error) {
      console.error("Translation error:", error);
      setTranslatedQuestion("Translation failed");
      setTranslatedAnswers({});
    } finally {
      setTranslating(false);
    }
  };

  // 🔹 Handle translation toggle
  const handleTranslationToggle = () => {
    if (!showTranslation && currentQuestion) {
      // 💡 Gunakan cleanText untuk pertanyaan
      const questionText = cleanText(currentQuestion.question);
      const answerTexts = shuffledAnswers; // Ini sudah di-clean/decode sekarang

      // Panggil fungsi terjemahan
      translateQuestionAndAnswers(questionText, answerTexts);
    } else if (showTranslation) {
      // Jika toggle dimatikan, hapus terjemahan jawaban
      setTranslatedAnswers({});
    }
    setShowTranslation(!showTranslation);
  };

  // 🔹 Get current question data
  const currentQuestion = questions[currentQuestionIndex];

  // 🔹 Shuffle and CLEAN answers ONCE when question changes
  useEffect(() => {
    if (currentQuestion) {
      // 🚀 PERBAIKAN: Gunakan cleanText untuk semua jawaban
      const allDecodedAnswers = [
        cleanText(currentQuestion.correct_answer),
        ...currentQuestion.incorrect_answers.map(cleanText),
      ];
      
      const shuffledDecodedAnswers = shuffleArray(allDecodedAnswers);
      setShuffledAnswers(shuffledDecodedAnswers); // Simpan yang sudah di-clean

      // Reset translation when question changes
      setShowTranslation(false);
      setTranslatedQuestion("");
      setTranslatedAnswers({}); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, questions]);

  // 🔹 Fetch questions from API (TIDAK BERUBAH)
  const fetchQuestions = async (categoryId: number, difficulty: Difficulty) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://opentdb.com/api.php?amount=10&category=${categoryId}&type=multiple&difficulty=${difficulty}`
      );
      const data = await response.json();

      if (data.response_code === 0) {
        setQuestions(data.results);
        setSelectedDifficulty(difficulty);
      } else {
        console.error("Failed to load questions. Please try again.");
        setSelectedCategory(null);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setSelectedCategory(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle answer selection
  const handleAnswerClick = (answer: string) => {
    if (selectedAnswer) return;

    // 💡 PERBAIKAN: Gunakan `cleanText(currentQuestion.correct_answer)` untuk perbandingan
    const currentCorrectAnswer = cleanText(currentQuestion.correct_answer);
    const isCorrect = answer === currentCorrectAnswer;

    setSelectedAnswer(answer);
    setUserAnswers([...userAnswers, { answer, isCorrect }]);

    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  // 🔹 Reset quiz (TIDAK BERUBAH)
  const resetQuiz = () => {
    setSelectedCategory(null);
    setSelectedDifficulty(null);
    setQuestions([]);
    setShuffledAnswers([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowTranslation(false);
    setTranslatedQuestion("");
    setTranslatedAnswers({}); 
    setTranslationCache({});
  };

  // 🔹 Back to difficulty selection (TIDAK BERUBAH)
  const backToDifficulty = () => {
    setSelectedDifficulty(null);
    setQuestions([]);
    setShuffledAnswers([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers([]);
    setSelectedAnswer(null);
    setShowResult(false);
    setShowTranslation(false);
    setTranslatedQuestion("");
    setTranslatedAnswers({}); 
    setTranslationCache({});
  };

  const selectedCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white p-6 pt-24 relative">
      {/* 🔙 Back Button - Dynamic based on current step */}
      {!selectedCategory && (
        <motion.a
          href="/"
          className="absolute top-8 left-8 px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-white font-semibold shadow-lg transition flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          ⬅️ Back to Projects
        </motion.a>
      )}

      {selectedCategory && !selectedDifficulty && !showResult && (
        <motion.button
          onClick={() => setSelectedCategory(null)}
          className="absolute top-8 left-8 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold shadow-lg transition flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          ⬅️ Back to Categories
        </motion.button>
      )}

      {selectedDifficulty && !showResult && (
        <motion.button
          onClick={backToDifficulty}
          className="absolute top-8 left-8 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-semibold shadow-lg transition flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          ⬅️ Back to Difficulty
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        {/* 🔹 STEP 1: Category Selection (TIDAK BERUBAH) */}
        {!selectedCategory && (
          <motion.div
            key="category"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-3xl font-bold mb-8 text-center">
              🎯 Pilih Kategori Kuis
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg w-full">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-6 rounded-xl bg-gradient-to-br ${cat.color} hover:opacity-90 text-lg font-semibold shadow-lg transition-transform`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {cat.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 🔹 STEP 2: Difficulty Selection (TIDAK BERUBAH) */}
        {selectedCategory && !selectedDifficulty && !showResult && (
          <motion.div
            key="difficulty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-3xl font-bold mb-2 text-center">
              {selectedCategoryData?.name}
            </h1>
            <p className="text-gray-300 mb-8">Pilih Tingkat Kesulitan</p>

            <div className="grid grid-cols-1 gap-4 max-w-md w-full">
              {difficulties.map((diff) => (
                <motion.button
                  key={diff.value}
                  onClick={() => fetchQuestions(selectedCategory, diff.value as Difficulty)}
                  disabled={loading}
                  className={`p-6 rounded-xl bg-gradient-to-br ${diff.color} hover:opacity-90 text-lg font-semibold shadow-lg transition-transform flex items-center justify-between ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  whileHover={!loading ? { scale: 1.03 } : {}}
                  whileTap={!loading ? { scale: 0.97 } : {}}
                >
                  <span>{diff.icon} {diff.name}</span>
                  {loading && <span className="text-sm">Loading...</span>}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 🔹 STEP 3: Quiz Questions */}
        {selectedCategory && selectedDifficulty && !showResult && currentQuestion && (
          <motion.div
            key={`question-${currentQuestionIndex}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="max-w-2xl w-full"
          >
            {/* Progress Bar (TIDAK BERUBAH) */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>
                  Question {currentQuestionIndex + 1} / {questions.length}
                </span>
                <span>Score: {score}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10 mb-6">
              <div className="mb-2 text-sm text-gray-400 flex justify-between items-center">
                <span>{cleanText(currentQuestion.category)}</span>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-white/10 rounded-full capitalize">
                    {currentQuestion.difficulty}
                  </span>
                  {/* Translation Toggle Button (TIDAK BERUBAH) */}
                  <button
                    onClick={handleTranslationToggle}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-full text-xs font-semibold transition flex items-center gap-1"
                    disabled={translating}
                  >
                    {translating ? (
                      "⏳"
                    ) : showTranslation ? (
                      <>🇬🇧 EN</>
                    ) : (
                      <>🇮🇩 ID</>
                    )}
                  </button>
                </div>
              </div>

              {/* English Question */}
              <h2 className="text-2xl font-semibold mb-2">
                {cleanText(currentQuestion.question)}
              </h2>

              {/* Indonesian Translation (Toggle) (TIDAK BERUBAH) */}
              {showTranslation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 text-sm font-semibold mt-1">🇮🇩</span>
                    <p className="text-lg text-blue-100 flex-1">
                      {translating ? (
                        <span className="animate-pulse">Menerjemahkan...</span>
                      ) : (
                        translatedQuestion
                      )}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Answers */}
              <div className="space-y-3">
                {shuffledAnswers.map((answer, index) => {
                  // 💡 answer sekarang sudah di-clean, tidak perlu cleanText(answer) lagi.
                  const cleanedAnswer = answer; 
                  const isSelected = selectedAnswer === answer;
                  // 💡 Bandingkan dengan jawaban benar yang sudah di-clean.
                  const isCorrect = answer === cleanText(currentQuestion.correct_answer); 
                  const shouldShowResult = selectedAnswer !== null;
                  
                  const displayAnswer = showTranslation && translatedAnswers[cleanedAnswer]
                    ? translatedAnswers[cleanedAnswer]
                    : cleanedAnswer;

                  let buttonClass = "bg-gray-700 hover:bg-gray-600";

                  if (shouldShowResult) {
                    if (isCorrect) {
                      buttonClass = "bg-green-600";
                    } else if (isSelected && !isCorrect) {
                      buttonClass = "bg-red-600";
                    }
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerClick(answer)}
                      disabled={selectedAnswer !== null}
                      className={`w-full p-4 rounded-lg text-left font-medium transition ${buttonClass} ${
                        selectedAnswer ? "cursor-not-allowed" : "cursor-pointer"
                      }`}
                      whileHover={!selectedAnswer ? { scale: 1.02 } : {}}
                      whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                    >
                      {displayAnswer}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* 🔹 STEP 4: Results (TIDAK BERUBAH) */}
        {showResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-2xl w-full text-center"
          >
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <h2 className="text-4xl font-bold mb-4">🎉 Quiz Selesai!</h2>
              <p className="text-6xl font-bold text-pink-400 mb-2">
                {score} / {questions.length}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                {selectedCategoryData?.name} • {selectedDifficulty}
              </p>
              <p className="text-xl mb-8">
                {score === questions.length
                  ? "Perfect! 🏆"
                  : score >= questions.length * 0.7
                  ? "Great job! 👏"
                  : score >= questions.length * 0.5
                  ? "Good effort! 💪"
                  : "Keep practicing! 📚"}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetQuiz}
                  className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg font-semibold transition"
                >
                  Try Another Category
                </button>
                <button
                  onClick={backToDifficulty}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition"
                >
                  Change Difficulty
                </button>
                <button
                  onClick={() => {
                    setShowResult(false);
                    setCurrentQuestionIndex(0);
                    setScore(0);
                    setUserAnswers([]);
                    setSelectedAnswer(null);
                    setShuffledAnswers([]);
                    fetchQuestions(selectedCategory!, selectedDifficulty!);
                  }}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
                >
                  Retry
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
