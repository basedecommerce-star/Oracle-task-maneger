"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { QuestionCard } from "@/components/ui/QuestionCard";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store/app.store";
import { api } from "@/lib/api";
import { hapticFeedback } from "@/lib/telegram";
import type { Question, VehicleCategory } from "@/types";

const categories: { value: VehicleCategory; label: string }[] = [
  { value: "A", label: "A — Мотоциклы" },
  { value: "B", label: "B — Легковые" },
  { value: "C", label: "C — Грузовые" },
  { value: "D", label: "D — Автобусы" },
  { value: "E", label: "E — Прицепы" },
];

export default function TrainingPage() {
  const { category } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>(category);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [answered, setAnswered] = useState(false);

  const startTraining = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.questions.getRandom(selectedCategory, 20);
      setQuestions(data);
      setCurrentIndex(0);
      setCorrectCount(0);
      setAnsweredCount(0);
      setIsStarted(true);
      setAnswered(false);
    } catch (error) {
      console.error("Failed to load questions:", error instanceof Error ? error.message : error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory]);

  const handleAnswer = useCallback(
    async (optionId: string) => {
      if (answered) return;
      setAnswered(true);

      const question = questions[currentIndex];
      const isCorrect = optionId === question.correctOptionId;

      if (isCorrect) {
        setCorrectCount((prev) => prev + 1);
        hapticFeedback("notification", "success");
      } else {
        hapticFeedback("notification", "error");
      }
      setAnsweredCount((prev) => prev + 1);

      try {
        await api.training.answer(question.id, optionId);
      } catch {
        // Continue even if API fails
      }
    },
    [answered, questions, currentIndex]
  );

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setAnswered(false);
      hapticFeedback("selection");
    }
  }, [currentIndex, questions.length]);

  const handleReport = useCallback(async (questionId: string) => {
    try {
      await api.questions.report(questionId, "Ошибка в вопросе");
      hapticFeedback("notification", "success");
    } catch {
      // Ignore
    }
  }, []);

  if (!isStarted) {
    return (
      <>
        <Header title="Обучение" />
        <main className="px-4 pt-4 space-y-4">
          <Card>
            <h2 className="font-semibold text-tg-text mb-3">Выберите категорию</h2>
            <div className="space-y-2">
              {categories.map((cat) => (
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

  const currentQuestion = questions[currentIndex];
  const isComplete = currentIndex === questions.length - 1 && answered;

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
          <Button fullWidth onClick={() => setIsStarted(false)}>
            Начать заново
          </Button>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title={`Вопрос ${currentIndex + 1} / ${questions.length}`} />
      <main className="px-4 pt-4 space-y-4">
        <ProgressBar current={currentIndex + 1} total={questions.length} showLabel={false} />

        <Card>
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
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
