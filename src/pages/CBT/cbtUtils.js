export const CBT_DURATION = 2 * 60 * 60; // 2 hours

export const shuffleArray = (arr) => {
  return [...arr].sort(() => Math.random() - 0.5);
};

export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return `${h}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
};

export const calculateScore = (answers, questions) => {
  let score = 0;

  questions.forEach((q, i) => {
    if (answers[i] === q.answer) score++;
  });

  return score;
};