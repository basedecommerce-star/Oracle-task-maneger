'use client';

import { useEffect, useState } from 'react';
import { getStatsOverview, getConflicts, getQuestions, type StatsOverview } from '@/lib/api';

interface StatCard {
  label: string;
  value: string;
  detail: string;
  color: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [overview, conflicts, reviewQueue] = await Promise.allSettled([
          getStatsOverview(),
          getConflicts(),
          getQuestions({ verificationStatus: 'REVIEW_REQUIRED' }),
        ]);

        const cards: StatCard[] = [];

        if (overview.status === 'fulfilled') {
          const o = overview.value as StatsOverview;
          const examSessions = o.recentSessions.filter(s => s.sessionType === 'EXAM');
          const trainingSessions = o.recentSessions.filter(s => s.sessionType === 'TRAINING');
          cards.push({
            label: 'Total Sessions',
            value: String(o.recentSessions.length),
            detail: `${examSessions.length} exams, ${trainingSessions.length} training`,
            color: 'bg-blue-500',
          });
          cards.push({
            label: 'Questions Answered',
            value: String(o.totalAnswered),
            detail: `${o.correctRate}% correct rate`,
            color: 'bg-green-500',
          });
        }

        if (conflicts.status === 'fulfilled') {
          const c = conflicts.value;
          const unresolved = Array.isArray(c) ? c.filter(x => !x.resolvedAt).length : 0;
          cards.push({
            label: 'Active Conflicts',
            value: String(unresolved),
            detail: `${Array.isArray(c) ? c.length : 0} total`,
            color: 'bg-amber-500',
          });
        }

        if (reviewQueue.status === 'fulfilled') {
          const r = reviewQueue.value;
          cards.push({
            label: 'Pending Review',
            value: String(r.total),
            detail: `${r.questions.length} shown on first page`,
            color: 'bg-red-500',
          });
        }

        if (cards.length === 0) {
          setError('Unable to load data from the API.');
        } else {
          setStats(cards);
        }
      } catch {
        setError('Unable to load data. Check that the API is running.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-16 shadow-sm">
          <span className="text-4xl">⚠️</span>
          <p className="mt-4 text-lg font-medium text-red-700">{error}</p>
          <p className="mt-1 text-sm text-red-500">
            Ensure the backend API is running and accessible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats?.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${stat.color}`} />
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-400">{stat.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
