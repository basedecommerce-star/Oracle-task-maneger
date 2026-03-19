"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { QuestionCard } from "@/components/ui/QuestionCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import type { MistakeEntry } from "@/types";

export default function MistakesPage() {
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    async function loadMistakes() {
      try {
        const data = await api.mistakes.list();
        setMistakes(data);
      } catch {
        console.error("Failed to load mistakes");
      } finally {
        setIsLoading(false);
      }
    }
    loadMistakes();
  }, []);

  const clearMistakes = useCallback(async () => {
    try {
      await api.mistakes.clear();
      setMistakes([]);
    } catch {
      console.error("Failed to clear mistakes");
    }
  }, []);

  if (isLoading) {
    return (
      <>
        <Header title="Мои ошибки" />
        <main className="px-4 pt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </main>
      </>
    );
  }

  if (mistakes.length === 0) {
    return (
      <>
        <Header title="Мои ошибки" />
        <main className="px-4 pt-12 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-lg font-bold text-tg-text mb-2">
            Ошибок нет!
          </h2>
          <p className="text-tg-hint text-sm">
            Продолжайте в том же духе. Все ваши ошибки будут сохраняться здесь для повторения.
          </p>
        </main>
      </>
    );
  }

  if (isReviewing) {
    const mistake = mistakes[currentIndex];
    const isLast = currentIndex === mistakes.length - 1;

    return (
      <>
        <Header title={`Ошибка ${currentIndex + 1} / ${mistakes.length}`} />
        <main className="px-4 pt-4 space-y-4">
          <Card>
            <QuestionCard
              question={mistake.question}
              onAnswer={() => {}}
              showExplanation
            />
          </Card>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex-1"
            >
              ←
            </Button>
            {isLast ? (
              <Button onClick={() => setIsReviewing(false)} className="flex-[3]">
                Завершить
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="flex-[3]"
              >
                Следующая →
              </Button>
            )}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Мои ошибки" />
      <main className="px-4 pt-4 space-y-4">
        <Card className="text-center">
          <div className="text-4xl mb-2">❌</div>
          <h2 className="font-bold text-tg-text mb-1">
            {mistakes.length} {mistakes.length === 1 ? "ошибка" : "ошибок"}
          </h2>
          <p className="text-tg-hint text-sm">
            Повторите вопросы, в которых допустили ошибки
          </p>
        </Card>

        <Button fullWidth onClick={() => { setCurrentIndex(0); setIsReviewing(true); }}>
          Начать повторение
        </Button>

        <Button fullWidth variant="outline" onClick={clearMistakes}>
          Очистить все ошибки
        </Button>
      </main>
    </>
  );
}
