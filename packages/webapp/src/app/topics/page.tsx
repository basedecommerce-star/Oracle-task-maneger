"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import type { Topic } from "@/types";
import { useAppStore } from "@/store/app.store";

export default function TopicsPage() {
  const { language } = useAppStore();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTopics() {
      try {
        const data = await api.topics.getAll();
        setTopics(data);
      } catch {
        console.error("Failed to load topics");
      } finally {
        setIsLoading(false);
      }
    }
    loadTopics();
  }, []);

  return (
    <>
      <Header title="Темы" />
      <main className="px-4 pt-4 space-y-3">
        <p className="text-tg-hint text-sm">
          Изучайте вопросы по темам
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/training?topic=${topic.id}`}
              >
                <Card hoverable>
                  <h3 className="font-medium text-tg-text text-sm mb-1">
                    {language === "ro" ? topic.nameRo : topic.nameRu}
                  </h3>
                  {topic.questionCount !== undefined && (
                    <p className="text-xs text-tg-hint">
                      {topic.questionCount} вопросов
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
