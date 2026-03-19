"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAppStore } from "@/store/app.store";
import { api } from "@/lib/api";
import type { Ticket } from "@/types";

export default function TicketsPage() {
  const { category } = useAppStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      try {
        const data = await api.tickets.list(category);
        setTickets(data);
      } catch {
        console.error("Failed to load tickets");
      } finally {
        setIsLoading(false);
      }
    }
    loadTickets();
  }, [category]);

  return (
    <>
      <Header title="Билеты" />
      <main className="px-4 pt-4 space-y-3">
        <p className="text-tg-hint text-sm">
          Категория {category} • {tickets.length} билетов
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const completed = ticket.completedCount || 0;
              const correct = ticket.correctCount || 0;
              const isComplete = completed === ticket.questionCount;

              return (
                <Link
                  key={ticket.id}
                  href={`/training?ticket=${ticket.number}`}
                >
                  <Card hoverable className="flex items-center gap-4">
                    <div
                      className={`
                        w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
                        ${isComplete
                          ? correct === ticket.questionCount
                            ? "bg-green-500/20 text-green-600"
                            : "bg-yellow-500/20 text-yellow-600"
                          : "bg-tg-secondary-bg text-tg-hint"
                        }
                      `}
                    >
                      {ticket.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-tg-text text-sm">
                          Билет №{ticket.number}
                        </span>
                        {isComplete && (
                          <span className="text-xs text-tg-hint">
                            {correct}/{ticket.questionCount}
                          </span>
                        )}
                      </div>
                      <ProgressBar
                        current={completed}
                        total={ticket.questionCount}
                        showLabel={false}
                      />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
