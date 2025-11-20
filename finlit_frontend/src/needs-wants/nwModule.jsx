import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";

export default function NeedsWants() {
  function getRandomItem(list, count) {
    return [...list].sort(() => Math.random() - 0.5).slice(0, count);
  }

  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState([]);
  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [items, setItems] = useState([]);
  const [items2, setItems2] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState("");
  const [showGray, setShowGray] = useState(false);
  const [finished, setFinished] = useState(false); // NEW state for “🎉 done” message

  // Load JSON data once
  useEffect(() => {
    fetch("/data/items.json")
      .then((res) => res.json())
      .then((data) => {
        setItems(getRandomItem(data, 10));
        setItems2(getRandomItem(data, 15));
      })
      .catch((err) => console.error("Error loading JSON:", err));
  }, []);

  // Ensure the `handlers` object is created inside the functional component body
  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  // toggle item
  function toggleItem(id) {
    if (selected.includes(id))
      setSelected(selected.filter((x) => x !== id));
    else if (selected.length < 5)
      setSelected([...selected, id]);
  }

  // swipe logic
  function handleSwipe(direction) {
    const item = items2[current];
    if (!item) return;

    const msg =
      direction === "right"
        ? `${item.name} is a ${item.type}`
        : `${item.name} is a ${item.type}!`;

    setFeedback(msg);

    setTimeout(() => {
      setFeedback("");
      const nextIndex = current + 1;
      setCurrent(nextIndex);

      // Automatically trigger quiz after final item
      if (nextIndex >= items2.length) {
        setFinished(true);
        setTimeout(() => {
          setShowQuiz(true);
        }, 1500); // small delay so “🎉” message shows first
      }
    }, 1000);
  }

  // quiz data
  const quiz = [ // test change by hsun
    {
      q: "Which expense is a need?",
      options: [
        { text: "Concert tickets", correct: false },
        { text: "Rent", correct: true },
        { text: "Designer shoes", correct: false },
        { text: "Streaming service", correct: false },
      ],
    },
    {
      q: "Needs are always more important than wants.",
      options: [
        { text: "True", correct: true },
        { text: "False", correct: false },
      ],
    },
    {
      q: "Which expense can you most easily cut if money is tight?",
      options: [
        { text: "Rent", correct: false },
        { text: "Car insurance", correct: false },
        { text: "Streaming subscription", correct: true },
        { text: "Electricity", correct: false },
      ],
    },
    {
      q: "Are electronic devices neccesary in a circumstance where you are stranded?",
      options: [
        { text: "Yes", correct: false },
        { text: "No", correct: true },
      ],
    },
    {
      q: "Which of the following is not a question to consider when defining needs and wants?",
      options: [
        { text: "If I had less money, would I still get this", correct: false },
        { text: "Is there a cheaper or simpler way to meet the same need", correct: false},
        { text: "Does this item make me impressive or appear cool?", correct: true},
        { text: "Am I choosing this because of peer pressure or trends rather than actual necessity", correct: false}
      ]
    }
  ];

  function handleQuizAnswer(correct) {
    setQuizFeedback(correct ? "✅ Correct!" : "❌ Try again!");
    setTimeout(() => {
      setQuizFeedback("");
      if (quizIndex < quiz.length - 1) setQuizIndex(quizIndex + 1);
      else {
        setShowGray(true);
        setShowQuiz(false);
      }
    }, 1000);
  }

  return (
    <div
      style={{
        fontFamily: "Poppins, sans-serif",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #cce5ff, #e0e7ff)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          width: "90%",
          maxWidth: "500px",
          textAlign: "center",
        }}
      >
        {/* STEP 1 */}
        {step === 1 && (
          <>
            <h1>🏝️ Stranded on an Island</h1>
            <p>
              Pick <b>5 essential items</b> to take with you:
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              {items.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleItem(item.id)}
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    border: "none",
                    background: selected.includes(item.id)
                      ? item.type === "need"
                        ? "#E53E3E"
                        : "#805AD5"
                      : "#edf2f7",
                    color: selected.includes(item.id) ? "white" : "#2d3748",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {item.name}
                </motion.button>
              ))}
            </div>
            {selected.length === 5 && (
              <motion.button
                onClick={() => setStep(2)}
                whileHover={{ scale: 1.1 }}
                style={{
                  marginTop: "30px",
                  padding: "12px 25px",
                  background: "#48bb78",
                  color: "white",
                  fontWeight: "600",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                }}
              >
                Continue →
              </motion.button>
            )}
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && !showQuiz && !showGray && (
          <div {...handlers}>
            <h1>🤔 The Big Question</h1>
            <p>
              Can you survive <b>one month</b> without this item?
            </p>
            <p style={{ fontSize: "0.9rem", color: "#555" }}>
              Swipe RIGHT = WANT | Swipe LEFT = NEED
            </p>

            <AnimatePresence mode="wait">
              {items2[current] && !finished ? (
                <motion.h2
                  key={items2[current].id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ margin: "40px 0", fontSize: "2rem" }}
                >
                  {items2[current].name}
                </motion.h2>
              ) : (
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ margin: "40px 0", fontSize: "1.5rem" }}
                >
                  🎉 All done! Time for a quick quiz.
                </motion.h2>
              )}
            </AnimatePresence>

            {feedback && (
              <motion.p
                key={feedback}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ fontWeight: "bold", color: "#2d3748" }}
              >
                {feedback}
              </motion.p>
            )}
          </div>
        )}

        {/* QUIZ */}
        {showQuiz && !showGray && (
          <div>
            <h1>🧠 Quick Quiz</h1>
            <p>{quiz[quizIndex].q}</p>
            <div
              style={{
                display: "grid",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              {quiz[quizIndex].options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuizAnswer(opt.correct)}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#edf2f7",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  {opt.text}
                </motion.button>
              ))}
            </div>
            {quizFeedback && (
              <motion.p
                key={quizFeedback}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ marginTop: "20px", fontWeight: "bold" }}
              >
                {quizFeedback}
              </motion.p>
            )}
          </div>
        )}

        {/* GRAY AREA SECTION */}
        {showGray && (
          <div>
            <h1>⚖️ Context Matters</h1>
            <p>Some items change meaning based on situation:</p>
            <ul style={{ textAlign: "left", marginTop: "15px" }}>
              <li>📱 Phone → Need for work, Want for entertainment</li>
              <li>🚗 Car → Need in rural areas, Want in cities</li>
              <li>🌐 Internet → Need for remote work, Want for streaming</li>
            </ul>

            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => {
                setStep(1);
                setSelected([]);
                setCurrent(0);
                setShowQuiz(false);
                setShowGray(false);
                setFinished(false);
                setQuizIndex(0);
              }}
              style={{
                marginTop: "25px",
                padding: "10px 20px",
                background: "#4299e1",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ↩ Restart Module
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
