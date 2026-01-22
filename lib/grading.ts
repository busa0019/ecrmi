import Question from "@/models/Question";

/**
 * answers: number[]  -> index of selected option (0-based)
 * questions: Question[] -> each question has correctAnswer (0-based)
 */
export function gradeTest(
  answers: number[],
  questions: any[]
): number {
  if (!answers.length || !questions.length) return 0;

  let correct = 0;

  questions.forEach((q, index) => {
    if (answers[index] === q.correctAnswer) {
      correct++;
    }
  });

  const score = Math.round(
    (correct / questions.length) * 100
  );

  return score;
}