/**
 * Shuffles the options for each quiz question while ensuring a balanced
 * distribution of correct answer positions across A, B, C, and D.
 *
 * Instead of pure random (which can cluster at certain positions),
 * this pre-assigns target positions so each position (0-3) gets roughly
 * an equal number of correct answers, then shuffles options accordingly.
 *
 * @param {Array} questions - Array of quiz question objects with { options, correctIndex, ... }
 * @returns {Array} New array with shuffled options and updated correctIndex
 */
export function shuffleQuizOptions(questions) {
  const numOptions = questions[0]?.options?.length || 4;

  // Build a balanced pool of target positions for the correct answer.
  // For 10 questions with 4 options: [0,1,2,3,0,1,2,3,0,1] — each position gets 2-3 hits.
  const targetPositions = [];
  for (let i = 0; i < questions.length; i++) {
    targetPositions.push(i % numOptions);
  }

  // Fisher-Yates shuffle the target positions so it's not sequential
  for (let i = targetPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [targetPositions[i], targetPositions[j]] = [targetPositions[j], targetPositions[i]];
  }

  return questions.map((q, qIdx) => {
    const correctOption = q.options[q.correctIndex];
    const wrongOptions = q.options.filter((_, i) => i !== q.correctIndex);

    // Shuffle the wrong options
    for (let i = wrongOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wrongOptions[i], wrongOptions[j]] = [wrongOptions[j], wrongOptions[i]];
    }

    // Place the correct answer at the target position
    const targetPos = targetPositions[qIdx];
    const newOptions = [...wrongOptions];
    newOptions.splice(targetPos, 0, correctOption);

    return {
      ...q,
      options: newOptions,
      correctIndex: targetPos,
    };
  });
}
