"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { QuestionCard } from "@/components/ui/QuestionCard";
import { Button } from "@/components/ui/Button";
import { Timer } from "@/components/ui/Timer";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store/app.store";
import { api } from "@/lib/api";
import { hapticFeedback } from "@/lib/telegram";
import type { ExamSession, ExamAnswer } from "@/types";

const EXAM_TIME_SECONDS = 20 * 60; // 20 minutes

export default function ExamPage() {
  const { category } = useAppStore();
  const [exam, setExam] = useState<ExamSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ExamAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ExamSession | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const startExam = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = await api.exam.start(category);
      setExam(session);
      setCurrentIndex(0);
      setAnswers([]);
      setResult(null);
      setIsTimerRunning(true);
    } catch {
      console.error("Failed to start exam");
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  const handleAnswer = useCallback(
    (optionId: string) => {
      if (!exam) return;
      const question = exam.questions[currentIndex];
      const isCorrect = optionId === question.correctOptionId;

      setAnswers((prev) => [
        ...prev,
        { questionId: question.id, selectedOptionId: optionId, isCorrect },
      ]);

      hapticFeedback("selection");
    },
    [exam, currentIndex]
  );

  const nextQuestion = useCallback(() => {
    if (!exam) return;
    if (currentIndex < exam.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [exam, currentIndex]);

  const prevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const submitExam = useCallback(async () => {
    if (!exam) return;
    setIsSubmitting(true);
    setIsTimerRunning(false);

    try {
      const submittedAnswers = answers.map((a) => ({
        questionId: a.questionId,
        selectedOptionId: a.selectedOptionId,
      }));
      const res = await api.exam.submit(exam.id, submittedAnswers);
      setResult(res);
      hapticFeedback("notification", res.passed ? "success" : "error");
    } catch {
      console.error("Failed to submit exam");
    } finally {
      setIsSubmitting(false);
    }
  }, [exam, answers]);

  const handleTimeUp = useCallback(() => {
    setIsTimerRunning(false);
    submitExam();
  }, [submitExam]);

  // Not started
  if (!exam && !result) {
    return (
      <>
        <Header title="Экзамен" />
        <main className="px-4 pt-6 space-y-4">
          <Card className="text-center">
            <div className="text-5xl mb-3">📝</div>
            <h2 className="text-xl font-bold text-tg-text mb-2">
              Пробный экзамен
            </h2>
            <p className="text-tg-hint text-sm mb-2">
              20 вопросов за 20 минут
            </p>
            <p className="text-tg-hint text-xs">
              Категория: {category} • Без подсказок • Максимум 2 ошибки
            </p>
          </Card>

          <Card>
            <h3 className="font-semibold text-tg-text mb-2 text-sm">Правила экзамена:</h3>
            <ul className="text-tg-hint text-sm space-y-1.5">
              <li>• 20 вопросов из билетов категории {category}</li>
              <li>• Время на экзамен — 20 минут</li>
              <li>• Допустимо не более 2 ошибок</li>
              <li>• Подсказки и пояснения недоступны</li>
            </ul>
          </Card>

          <Button fullWidth onClick={startExam} loading={isLoading} size="lg">
            Начать экзамен
          </Button>
        </main>
      </>
    );
  }

  // Result screen
  if (result) {
    const correct = answers.filter((a) => a.isCorrect).length;
    const passed = result.passed;

    return (
      <>
        <Header title="Результат экзамена" />
        <main className="px-4 pt-6 space-y-4">
          <Card className="text-center">
            <div className="text-5xl mb-3">{passed ? "✅" : "❌"}</div>
            <h2 className="text-xl font-bold text-tg-text mb-2">
              {passed ? "Экзамен сдан!" : "Экзамен не сдан"}
            </h2>
            <p className="text-tg-hint text-sm mb-4">
              Правильных ответов: {correct} из {answers.length}
            </p>
            <ProgressBar
              current={correct}
              total={answers.length}
              colorClass={passed ? "bg-green-500" : "bg-red-500"}
            />
          </Card>

          <div className="flex gap-3">
            <Button
              fullWidth
              variant="secondary"
              onClick={() => {
                setExam(null);
                setResult(null);
              }}
            >
              На главную
            </Button>
            <Button fullWidth onClick={startExam} loading={isLoading}>
              Ещё раз
            </Button>
          </div>
        </main>
      </>
    );
  }

  // Exam in progress
  const currentQuestion = exam!.questions[currentIndex];
  const currentAnswer = answers.find(
    (a) => a.questionId === currentQuestion.id
  );
  const allAnswered = answers.length === exam!.questions.length;

  return (
    <>
      <Header title="Экзамен" />
      <main className="px-4 pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-tg-hint font-medium">
            {currentIndex + 1} / {exam!.questions.length}
          </span>
          <Timer
            initialSeconds={EXAM_TIME_SECONDS}
            onComplete={handleTimeUp}
            isRunning={isTimerRunning}
            className="text-base"
          />
        </div>

        {/* Question indicator dots */}
        <div className="flex gap-1 flex-wrap">
          {exam!.questions.map((q, i) => {
            const answer = answers.find((a) => a.questionId === q.id);
            let dotColor = "bg-tg-secondary-bg";
            if (answer) {
              dotColor = answer.isCorrect ? "bg-green-500" : "bg-red-500";
            }
            if (i === currentIndex) {
              dotColor += " ring-2 ring-tg-button";
            }
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${dotColor} ${
                  answer ? "text-white" : "text-tg-hint"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <Card>
          <QuestionCard
            question={currentQuestion}
            onAnswer={handleAnswer}
            showExplanation={false}
            disabled={!!currentAnswer}
            selectedOptionId={currentAnswer?.selectedOptionId}
          />
        </Card>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="flex-1"
          >
            ←
          </Button>
          {allAnswered ? (
            <Button
              onClick={submitExam}
              loading={isSubmitting}
              className="flex-[3]"
            >
              Завершить экзамен
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={nextQuestion}
              disabled={currentIndex === exam!.questions.length - 1}
              className="flex-1"
            >
              →
            </Button>
          )}
        </div>
      </main>
    </>
  );
}
