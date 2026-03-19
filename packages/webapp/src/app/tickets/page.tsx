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
  const { categoryCode } = useAppStore();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTickets() {
      try {
        const data = await api.tickets.list(categoryCode);
        setTickets(data);
      } catch {
        console.error("Failed to load tickets");
      } finally {
        setIsLoading(false);
      }
    }
    loadTickets();
  }, [categoryCode]);

  return (
    <>
      <Header title="Билеты" />
      <main className="px-4 pt-4 space-y-3">
        <p className="text-tg-hint text-sm">
          Категория {categoryCode} • {tickets.length} билетов
        </p>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <Link
                key={ticket.ticketNumber}
                href={`/training?ticket=${ticket.ticketNumber}`}
              >
                <Card hoverable className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg bg-tg-secondary-bg text-tg-hint">
                    {ticket.ticketNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-tg-text text-sm">
                        Билет №{ticket.ticketNumber}
                      </span>
                      <span className="text-xs text-tg-hint">
                        {ticket.questionCount} вопросов
                      </span>
                    </div>
                    <ProgressBar
                      current={0}
                      total={ticket.questionCount}
                      showLabel={false}
                    />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
