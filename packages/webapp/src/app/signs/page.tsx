"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import type { RoadSign } from "@/types";

const signCategories: { value: string; label: string; icon: string }[] = [
  { value: "all", label: "Все", icon: "🚗" },
  { value: "warning", label: "Предупреждающие", icon: "⚠️" },
  { value: "priority", label: "Приоритета", icon: "🔺" },
  { value: "prohibition", label: "Запрещающие", icon: "🚫" },
  { value: "mandatory", label: "Предписывающие", icon: "🔵" },
  { value: "informational", label: "Информационные", icon: "ℹ️" },
  { value: "service", label: "Сервиса", icon: "🅿️" },
  { value: "additional", label: "Доп. информации", icon: "📋" },
];

export default function SignsPage() {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [signs, setSigns] = useState<RoadSign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadSigns() {
      setIsLoading(true);
      try {
        const type = selectedType === "all" ? undefined : selectedType;
        const data = await api.signs.getAll(type);
        setSigns(data);
      } catch {
        console.error("Failed to load signs");
      } finally {
        setIsLoading(false);
      }
    }
    loadSigns();
  }, [selectedType]);

  return (
    <>
      <Header title="Дорожные знаки" />
      <main className="px-4 pt-4 space-y-4">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {signCategories.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedType === cat.value ? "primary" : "secondary"}
              size="sm"
              onClick={() => setSelectedType(cat.value)}
              className="whitespace-nowrap shrink-0"
            >
              {cat.icon} {cat.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-40 rounded-xl" />
            ))}
          </div>
        ) : signs.length === 0 ? (
          <div className="text-center pt-8">
            <div className="text-4xl mb-3">🚸</div>
            <p className="text-tg-hint text-sm">Знаки не найдены</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {signs.map((sign) => (
              <Card
                key={sign.id}
                hoverable
                onClick={() =>
                  setExpandedId(expandedId === sign.id ? null : sign.id)
                }
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-lg bg-tg-secondary-bg flex items-center justify-center mb-2 overflow-hidden">
                    {sign.imageKey ? (
                      <img
                        src={sign.imageKey}
                        alt={sign.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-2xl">🚸</span>
                    )}
                  </div>
                  <h4 className="text-xs font-medium text-tg-text leading-tight">
                    {sign.name}
                  </h4>
                  {expandedId === sign.id && sign.description && (
                    <p className="text-xs text-tg-hint mt-2 leading-relaxed">
                      {sign.description}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
