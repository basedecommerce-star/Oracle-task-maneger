"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { api } from "@/lib/api";
import type { UserStats } from "@/types";

export default function StatsPage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await api.stats.get();
        setStats(data);
      } catch {
        console.error("Failed to load stats");
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <>
        <Header title="Статистика" />
        <main className="px-4 pt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </main>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <Header title="Статистика" />
        <main className="px-4 pt-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <p className="text-tg-hint text-sm">
            Начните решать задания, чтобы увидеть статистику
          </p>
        </main>
      </>
    );
  }

  const statCards = [
    { label: "Всего ответов", value: stats.totalAnswered, icon: "📝" },
    { label: "Правильных", value: stats.correctAnswers, icon: "✅" },
    { label: "Неправильных", value: stats.incorrectAnswers, icon: "❌" },
    { label: "Точность", value: `${stats.accuracy}%`, icon: "🎯" },
    { label: "Экзамены сданы", value: stats.examsPassed, icon: "🏆" },
    { label: "Экзамены не сданы", value: stats.examsFailed, icon: "📉" },
    { label: "Серия дней", value: stats.streakDays, icon: "🔥" },
  ];

  return (
    <>
      <Header title="Статистика" />
      <main className="px-4 pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-bold text-tg-text">{stat.value}</div>
              <div className="text-xs text-tg-hint">{stat.label}</div>
            </Card>
          ))}
        </div>

        {stats.topicProgress.length > 0 && (
          <div>
            <h3 className="font-semibold text-tg-text mb-3 text-sm">
              Прогресс по темам
            </h3>
            <div className="space-y-3">
              {stats.topicProgress.map((topic) => (
                <Card key={topic.topicId}>
                  <h4 className="text-sm font-medium text-tg-text mb-2">
                    {topic.topicName}
                  </h4>
                  <ProgressBar
                    current={topic.answeredCorrectly}
                    total={topic.totalQuestions}
                  />
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
