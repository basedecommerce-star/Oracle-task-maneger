"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { RuleArticle } from "@/types";

export default function RulesPage() {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<RuleArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await api.rules.search(query.trim());
      setArticles(data);
    } catch {
      console.error("Failed to search rules");
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const data = await api.rules.list();
      setArticles(data);
    } catch {
      console.error("Failed to load rules");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <>
      <Header title="Правила ПДД" />
      <main className="px-4 pt-4 space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Поиск по правилам..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-tg-secondary-bg text-tg-text placeholder-tg-hint text-sm outline-none focus:ring-2 focus:ring-tg-button"
          />
          <Button onClick={handleSearch} loading={isLoading} size="md">
            🔍
          </Button>
        </div>

        {!hasSearched && (
          <Button fullWidth variant="secondary" onClick={loadAll}>
            Показать все разделы
          </Button>
        )}

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && hasSearched && articles.length === 0 && (
          <div className="text-center pt-8">
            <div className="text-4xl mb-3">📖</div>
            <p className="text-tg-hint text-sm">Ничего не найдено</p>
          </div>
        )}

        {!isLoading && (
          <div className="space-y-3">
            {articles.map((article) => (
              <Card key={article.id}>
                <div className="text-xs text-tg-hint mb-1">
                  Глава {article.chapterCode}
                </div>
                <h3 className="font-semibold text-tg-text text-sm mb-2">
                  Статья {article.articleCode}. {article.title}
                </h3>
                <p className="text-tg-text text-sm leading-relaxed">
                  {article.content}
                </p>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
