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
        const data = await api.stats.getOverview();
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
    { label: "Правильных", value: stats.totalCorrect, icon: "✅" },
    { label: "Неправильных", value: stats.totalWrong, icon: "❌" },
    { label: "Точность", value: `${Math.round(stats.correctRate * 100)}%`, icon: "🎯" },
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

        {stats.byTopic.length > 0 && (
          <div>
            <h3 className="font-semibold text-tg-text mb-3 text-sm">
              Прогресс по темам
            </h3>
            <div className="space-y-3">
              {stats.byTopic.map((topic) => (
                <Card key={topic.topicId}>
                  <h4 className="text-sm font-medium text-tg-text mb-2">
                    {topic.topicName}
                  </h4>
                  <ProgressBar
                    current={topic.correct}
                    total={topic.answered}
                  />
                </Card>
              ))}
            </div>
          </div>
        )}

        {stats.recentSessions.length > 0 && (
          <div>
            <h3 className="font-semibold text-tg-text mb-3 text-sm">
              Последние сессии
            </h3>
            <div className="space-y-3">
              {stats.recentSessions.map((session) => (
                <Card key={session.sessionId}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-tg-text">
                      {session.sessionType === "EXAM" ? "📝 Экзамен" : "📚 Тренировка"}
                    </span>
                    {session.isPassed !== null && (
                      <span className={`text-xs ${session.isPassed ? "text-green-600" : "text-red-600"}`}>
                        {session.isPassed ? "Сдан" : "Не сдан"}
                      </span>
                    )}
                  </div>
                  <ProgressBar
                    current={session.correctAnswers}
                    total={session.totalQuestions}
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
