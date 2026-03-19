"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { QuestionCard } from "@/components/ui/QuestionCard";
import type { DisplayQuestion } from "@/components/ui/QuestionCard";
import { Button } from "@/components/ui/Button";
import { Timer } from "@/components/ui/Timer";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store/app.store";
import { api } from "@/lib/api";
import { hapticFeedback } from "@/lib/telegram";
import type { ExamSession, ExamResult } from "@/types";

interface ExamAnswerRecord {
  sessionQuestionId: string;
  selectedAnswerId: string;
}

export default function ExamPage() {
  const { categoryCode } = useAppStore();
  const [exam, setExam] = useState<ExamSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ExamAnswerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const startExam = useCallback(async () => {
    setIsLoading(true);
    try {
      const session = await api.exams.start(categoryCode);
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
  }, [categoryCode]);

  const handleAnswer = useCallback(
    async (answerId: string) => {
      if (!exam) return;
      const question = exam.questions[currentIndex];

      setAnswers((prev) => [
        ...prev,
        { sessionQuestionId: question.sessionQuestionId, selectedAnswerId: answerId },
      ]);

      hapticFeedback("selection");

      try {
        await api.exams.answer(exam.sessionId, question.sessionQuestionId, [answerId]);
      } catch {
        // Continue even if API call fails
      }
    },
    [exam, currentIndex],
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

  const finishExam = useCallback(async () => {
    if (!exam) return;
    setIsSubmitting(true);
    setIsTimerRunning(false);

    try {
      const res = await api.exams.finish(exam.sessionId);
      setResult(res);
      hapticFeedback("notification", res.isPassed ? "success" : "error");
    } catch {
      console.error("Failed to finish exam");
    } finally {
      setIsSubmitting(false);
    }
  }, [exam]);

  const handleTimeUp = useCallback(() => {
    setIsTimerRunning(false);
    finishExam();
  }, [finishExam]);

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
              Категория: {categoryCode}
            </p>
            <p className="text-tg-hint text-xs">
              Без подсказок • Время ограничено сервером
            </p>
          </Card>

          <Card>
            <h3 className="font-semibold text-tg-text mb-2 text-sm">Правила экзамена:</h3>
            <ul className="text-tg-hint text-sm space-y-1.5">
              <li>• Вопросы из билетов категории {categoryCode}</li>
              <li>• Время на экзамен ограничено</li>
              <li>• Подсказки и пояснения недоступны</li>
              <li>• Результат определяет сервер</li>
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
    return (
      <>
        <Header title="Результат экзамена" />
        <main className="px-4 pt-6 space-y-4">
          <Card className="text-center">
            <div className="text-5xl mb-3">{result.isPassed ? "✅" : "❌"}</div>
            <h2 className="text-xl font-bold text-tg-text mb-2">
              {result.isPassed ? "Экзамен сдан!" : "Экзамен не сдан"}
            </h2>
            <p className="text-tg-hint text-sm mb-4">
              Правильных ответов: {result.correctAnswers} из {result.totalQuestions}
            </p>
            <ProgressBar
              current={result.correctAnswers}
              total={result.totalQuestions}
              colorClass={result.isPassed ? "bg-green-500" : "bg-red-500"}
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
    (a) => a.sessionQuestionId === currentQuestion.sessionQuestionId,
  );
  const allAnswered = answers.length === exam!.questions.length;

  const displayQuestion: DisplayQuestion = {
    id: currentQuestion.sessionQuestionId,
    questionText: currentQuestion.questionText,
    imageAssetKey: currentQuestion.imageAssetKey,
    answers: currentQuestion.answers,
  };

  return (
    <>
      <Header title="Экзамен" />
      <main className="px-4 pt-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-tg-hint font-medium">
            {currentIndex + 1} / {exam!.questions.length}
          </span>
          <Timer
            initialSeconds={exam!.durationLimit}
            onComplete={handleTimeUp}
            isRunning={isTimerRunning}
            className="text-base"
          />
        </div>

        {/* Question indicator dots */}
        <div className="flex gap-1 flex-wrap">
          {exam!.questions.map((q, i) => {
            const answer = answers.find(
              (a) => a.sessionQuestionId === q.sessionQuestionId,
            );
            let dotColor = "bg-tg-secondary-bg";
            if (answer) {
              dotColor = "bg-tg-button/60";
            }
            if (i === currentIndex) {
              dotColor += " ring-2 ring-tg-button";
            }
            return (
              <button
                key={q.sessionQuestionId}
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
            question={displayQuestion}
            onAnswer={handleAnswer}
            showExplanation={false}
            disabled={!!currentAnswer}
            selectedAnswerId={currentAnswer?.selectedAnswerId}
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
              onClick={finishExam}
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
