'use client';

import { useState } from 'react';

interface StatCard {
  label: string;
  value: number;
  change: string;
  color: string;
}

const stats: StatCard[] = [
  { label: 'Total Questions', value: 2847, change: '+124 this week', color: 'bg-blue-500' },
  { label: 'Verified', value: 2103, change: '73.8% of total', color: 'bg-green-500' },
  { label: 'Conflicts', value: 89, change: '12 new today', color: 'bg-amber-500' },
  { label: 'Pending Review', value: 214, change: '38 high priority', color: 'bg-red-500' },
];

const recentActivity = [
  { id: 1, action: 'Question Q-1842 verified', user: 'moderator_1', time: '5 min ago' },
  { id: 2, action: 'Import batch #47 completed (156 items)', user: 'system', time: '23 min ago' },
  { id: 3, action: 'Conflict resolved for Q-0923', user: 'moderator_2', time: '1 hour ago' },
  { id: 4, action: 'Report #312 dismissed', user: 'moderator_1', time: '2 hours ago' },
  { id: 5, action: 'Exam config updated for category B', user: 'admin', time: '3 hours ago' },
  { id: 6, action: 'Import batch #46 completed (89 items)', user: 'system', time: '5 hours ago' },
];

export default function DashboardPage() {
  const [period] = useState<'day' | 'week' | 'month'>('week');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${stat.color}`} />
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-900">
              {stat.value.toLocaleString()}
            </p>
            <p className="mt-1 text-sm text-gray-400">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary-400" />
                <span className="text-sm text-gray-700">{item.action}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-gray-500">{item.user}</span>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
