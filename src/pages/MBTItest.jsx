import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

 

  
const questions = [
  {
    question: "At a party, you usually...",
    options: [
      { text: "Talk with lots of people", trait: "E" },
      { text: "Stay with a few close people", trait: "I" },
    ],
  },

  {
    question: "You trust more...",
    options: [
      { text: "Facts and experience", trait: "S" },
      { text: "Ideas and possibilities", trait: "N" },
    ],
  },

  {
    question: "When making decisions...",
    options: [
      { text: "You follow logic", trait: "T" },
      { text: "You follow your heart", trait: "F" },
    ],
  },

  {
    question: "Your lifestyle is more...",
    options: [
      { text: "Planned and organized", trait: "J" },
      { text: "Flexible and spontaneous", trait: "P" },
    ],
  },

  {
    question: "Your ideal weekend is...",
    options: [
      { text: "Going out and socializing", trait: "E" },
      { text: "Relaxing alone or with close friends", trait: "I" },
    ],
  },

  {
    question: "You notice first...",
    options: [
      { text: "What’s happening now", trait: "S" },
      { text: "What could happen next", trait: "N" },
    ],
  },

  {
    question: "Friends describe you as...",
    options: [
      { text: "Rational and objective", trait: "T" },
      { text: "Warm and understanding", trait: "F" },
    ],
  },

  {
    question: "When traveling, you prefer...",
    options: [
      { text: "A planned itinerary", trait: "J" },
      { text: "Exploring freely", trait: "P" },
    ],
  },
];


export default function MBTITest() {
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleAnswer = (trait) => {
    const updated = { ...scores, [trait]: scores[trait] + 1 };
    setScores(updated);

    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      const mbti =
        (updated.E >= updated.I ? "E" : "I") +
        (updated.S >= updated.N ? "S" : "N") +
        (updated.T >= updated.F ? "T" : "F") +
        (updated.J >= updated.P ? "J" : "P");
      setResult(mbti);
    }
  };
  const handleSave = () => {
    console.log("Saving MBTI to localStorage:", result);
    localStorage.setItem("mbtiResult", result);
    navigate("/edit-profile");
  };

  return (
  <div
    className="
      min-h-screen
      bg-[#0b1120]
      text-white
      relative
      overflow-hidden
      flex
      items-center
      justify-center
      px-4
      py-10
    "
  >

    {/* Glow */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      <div
        className="
          absolute
          top-[-120px]
          left-[-100px]
          w-[320px]
          h-[320px]
          bg-pink-500/20
          blur-3xl
          rounded-full
        "
      />

      <div
        className="
          absolute
          bottom-[-120px]
          right-[-100px]
          w-[320px]
          h-[320px]
          bg-violet-500/20
          blur-3xl
          rounded-full
        "
      />
    </div>

    {/* Card */}
    <div
      className="
        relative
        z-10
        w-full
        max-w-2xl
        rounded-3xl
        border
        border-white/10
        bg-white/[0.05]
        backdrop-blur-2xl
        p-8
        shadow-2xl
        shadow-pink-500/10
      "
    >

      {!result ? (
        <>
          {/* Header */}
          <div className="mb-8">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">
                MBTI Soul Test ✨
              </h2>

              <span className="text-sm text-gray-400">
                {currentQ + 1}/{questions.length}
              </span>
            </div>

            {/* Progress */}
            <div
              className="
                w-full
                h-2
                rounded-full
                bg-white/10
                overflow-hidden
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-pink-500
                  to-violet-500
                  transition-all
                  duration-500
                "
                style={{
                  width: `${
                    ((currentQ + 1) /
                      questions.length) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">

            <h3
              className="
                text-3xl
                font-bold
                leading-snug
              "
            >
              {questions[currentQ].question}
            </h3>
          </div>

          {/* Options */}
          <div className="grid gap-4">

            {questions[currentQ].options.map(
              (opt, index) => (
                <button
                  key={index}
                  onClick={() =>
                    handleAnswer(opt.trait)
                  }
                  className="
                    group
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.05]
                    p-5
                    text-left
                    transition-all
                    duration-300
                    hover:border-pink-500/30
                    hover:bg-white/[0.08]
                  "
                >
                  <div
                    className="
                      absolute
                      inset-0
                      opacity-0
                      group-hover:opacity-100
                      transition
                      bg-gradient-to-r
                      from-pink-500/10
                      to-violet-500/10
                    "
                  />

                  <span
                    className="
                      relative
                      text-lg
                      font-medium
                    "
                  >
                    {opt.text}
                  </span>
                </button>
              )
            )}
          </div>
        </>
      ) : (
        <div className="text-center">

          {/* Result */}
          <div
            className="
              inline-flex
              items-center
              justify-center
              w-28
              h-28
              rounded-full
              bg-gradient-to-r
              from-pink-500
              to-violet-500
              text-4xl
              font-bold
              mb-6
              shadow-2xl
              shadow-pink-500/20
            "
          >
            {result}
          </div>

          <h2 className="text-4xl font-bold mb-4">
            You are an{" "}
            <span
              className="
                bg-gradient-to-r
                from-pink-400
                to-violet-400
                bg-clip-text
                text-transparent
              "
            >
              {result}
            </span>
          </h2>

          <p
            className="
              text-gray-300
              max-w-md
              mx-auto
              leading-relaxed
              mb-8
            "
          >
            Your vibe reflects your personality,
            emotions, decisions, and the way you
            connect with souls around you.
          </p>

          {/* Save */}
          <button
            onClick={handleSave}
            className="
              px-8
              py-4
              rounded-2xl
              bg-gradient-to-r
              from-pink-500
              to-violet-500
              font-semibold
              text-lg
              hover:opacity-90
              transition
              shadow-xl
              shadow-pink-500/20
            "
          >
            Save Personality ✨
          </button>
        </div>
      )}
    </div>
  </div>
);
}
