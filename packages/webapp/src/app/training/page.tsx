"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { QuestionCard } from "@/components/ui/QuestionCard";
import type { DisplayQuestion } from "@/components/ui/QuestionCard";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store/app.store";
import { api } from "@/lib/api";
import { hapticFeedback } from "@/lib/telegram";
import type { TrainingSession, TrainingCategory } from "@/types";
import { TRAINING_CATEGORIES } from "@/types";

const categoryOptions: { value: TrainingCategory; label: string }[] = [
  { value: "AB", label: "AB — Легковые / мотоциклы" },
  { value: "C", label: "C — Грузовые" },
  { value: "D", label: "D — Автобусы" },
  { value: "E", label: "E — Прицепы (общий)" },
  { value: "F", label: "F — Трамваи / троллейбусы" },
];

export default function TrainingPage() {
  const { categoryCode } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<TrainingCategory>(
    (TRAINING_CATEGORIES as readonly string[]).includes(categoryCode) ? categoryCode as TrainingCategory : 'AB'
  );
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [correctAnswerIds, setCorrectAnswerIds] = useState<string[]>([]);
  const [explanationText, setExplanationText] = useState<string | null>(null);

  const startTraining = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.training.start({
        categoryCode: selectedCategory,
        questionCount: 20,
      });
      setSession(data);
      setCurrentIndex(0);
      setCorrectCount(0);
      setAnsweredCount(0);
      setIsStarted(true);
      setAnswered(false);
      setCorrectAnswerIds([]);
      setExplanationText(null);
    } catch (error) {
      console.error("Failed to load questions:", error instanceof Error ? error.message : error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  const handleAnswer = useCallback(
    async (answerId: string) => {
      if (answered || !session) return;
      setAnswered(true);

      const question = session.questions[currentIndex];

      try {
        const response = await api.training.answer(
          session.sessionId,
          question.sessionQuestionId,
          [answerId],
        );

        setCorrectAnswerIds(response.correctAnswerIds);
        setExplanationText(response.explanationText);

        if (response.isCorrect) {
          setCorrectCount((prev) => prev + 1);
          hapticFeedback("notification", "success");
        } else {
          hapticFeedback("notification", "error");
        }
        setAnsweredCount((prev) => prev + 1);
      } catch {
        // If API fails, still mark as answered but without feedback
        setAnsweredCount((prev) => prev + 1);
      }
    },
    [answered, session, currentIndex],
  );

  const nextQuestion = useCallback(() => {
    if (!session) return;
    if (currentIndex < session.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAnswered(false);
      setCorrectAnswerIds([]);
      setExplanationText(null);
      hapticFeedback("selection");
    }
  }, [currentIndex, session]);

  const handleReport = useCallback(async (questionId: string) => {
    try {
      await api.questions.report(questionId, "WRONG_TEXT");
      hapticFeedback("notification", "success");
    } catch {
      // Ignore
    }
  }, []);

  if (!isStarted || !session) {
    return (
      <>
        <Header title="Обучение" />
        <main className="px-4 pt-4 space-y-4">
          <Card>
            <h2 className="font-semibold text-tg-text mb-3">Выберите категорию</h2>
            <div className="space-y-2">
              {categoryOptions.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`
                    w-full text-left p-3 rounded-xl transition-colors text-sm
                    ${selectedCategory === cat.value
                      ? "bg-tg-button text-tg-button-text"
                      : "bg-tg-secondary-bg text-tg-text"
                    }
                  `}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </Card>

          <Button fullWidth onClick={startTraining} loading={isLoading}>
            Начать обучение
          </Button>
        </main>
      </>
    );
  }

  const currentQuestion = session.questions[currentIndex];
  const isComplete = currentIndex === session.questions.length - 1 && answered;

  if (isComplete) {
    return (
      <>
        <Header title="Результат" />
        <main className="px-4 pt-6 space-y-4">
          <Card className="text-center">
            <div className="text-5xl mb-3">
              {correctCount >= answeredCount * 0.8 ? "🎉" : "📖"}
            </div>
            <h2 className="text-xl font-bold text-tg-text mb-2">
              Тренировка завершена!
            </h2>
            <p className="text-tg-hint text-sm mb-4">
              Правильных ответов: {correctCount} из {answeredCount}
            </p>
            <ProgressBar current={correctCount} total={answeredCount} />
          </Card>
          <Button fullWidth onClick={() => { setIsStarted(false); setSession(null); }}>
            Начать заново
          </Button>
        </main>
      </>
    );
  }

  const displayQuestion: DisplayQuestion = {
    id: currentQuestion.sessionQuestionId,
    questionText: currentQuestion.questionText,
    imageAssetKey: currentQuestion.imageAssetKey,
    answers: currentQuestion.answers,
  };

  return (
    <>
      <Header title={`Вопрос ${currentIndex + 1} / ${session.questions.length}`} />
      <main className="px-4 pt-4 space-y-4">
        <ProgressBar current={currentIndex + 1} total={session.questions.length} showLabel={false} />

        <Card>
          <QuestionCard
            question={displayQuestion}
            onAnswer={handleAnswer}
            correctAnswerIds={correctAnswerIds.length > 0 ? correctAnswerIds : undefined}
            explanationText={explanationText}
            showExplanation
            onReport={handleReport}
          />
        </Card>

        {answered && (
          <Button fullWidth onClick={nextQuestion}>
            Следующий вопрос →
          </Button>
        )}
      </main>
    </>
  );
}
