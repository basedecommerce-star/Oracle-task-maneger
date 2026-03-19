'use client';

import { useState, useEffect } from 'react';

type ImportStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

interface ImportRecord {
  id: string;
  source: string;
  status: ImportStatus;
  totalItems: number;
  processedItems: number;
  createdAt: string;
  completedAt: string | null;
  errorMessage: string | null;
}

const statusConfig: Record<ImportStatus, { color: string; icon: string }> = {
  PENDING: { color: 'bg-gray-100 text-gray-700', icon: '⏳' },
  RUNNING: { color: 'bg-blue-100 text-blue-700', icon: '🔄' },
  COMPLETED: { color: 'bg-green-100 text-green-700', icon: '✅' },
  FAILED: { color: 'bg-red-100 text-red-700', icon: '❌' },
};

const placeholderImports: ImportRecord[] = [
  {
    id: 'IMP-047',
    source: 'pdd.md/bilete/categoria-b',
    status: 'COMPLETED',
    totalItems: 156,
    processedItems: 156,
    createdAt: '2024-01-16T10:00:00Z',
    completedAt: '2024-01-16T10:12:00Z',
    errorMessage: null,
  },
  {
    id: 'IMP-048',
    source: 'pdd.md/bilete/categoria-c',
    status: 'RUNNING',
    totalItems: 120,
    processedItems: 73,
    createdAt: '2024-01-16T11:30:00Z',
    completedAt: null,
    errorMessage: null,
  },
  {
    id: 'IMP-049',
    source: 'pdd.md/semne/interzicere',
    status: 'PENDING',
    totalItems: 0,
    processedItems: 0,
    createdAt: '2024-01-16T11:45:00Z',
    completedAt: null,
    errorMessage: null,
  },
  {
    id: 'IMP-046',
    source: 'pdd.md/bilete/categoria-a',
    status: 'COMPLETED',
    totalItems: 89,
    processedItems: 89,
    createdAt: '2024-01-15T14:00:00Z',
    completedAt: '2024-01-15T14:08:00Z',
    errorMessage: null,
  },
  {
    id: 'IMP-045',
    source: 'pdd.md/bilete/categoria-d',
    status: 'FAILED',
    totalItems: 95,
    processedItems: 42,
    createdAt: '2024-01-15T12:00:00Z',
    completedAt: '2024-01-15T12:05:00Z',
    errorMessage: 'Connection timeout after 30s while fetching page 5/10',
  },
];

export default function ImportsPage() {
  const [imports] = useState(placeholderImports);
  const [animatedProgress, setAnimatedProgress] = useState<Record<string, number>>({});

  // Simulate progress animation for running imports
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedProgress((prev) => {
        const next = { ...prev };
        imports
          .filter((imp) => imp.status === 'RUNNING')
          .forEach((imp) => {
            const current = next[imp.id] ?? imp.processedItems;
            if (current < imp.totalItems) {
              next[imp.id] = Math.min(current + 1, imp.totalItems);
            }
          });
        return next;
      });
    }, 500);
    return () => clearInterval(interval);
  }, [imports]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Imports</h2>
        <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700">
          + New Import
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-600">ID</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Source</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Progress</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Created</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Completed</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {imports.map((imp) => {
              const cfg = statusConfig[imp.status];
              const processed =
                imp.status === 'RUNNING'
                  ? animatedProgress[imp.id] ?? imp.processedItems
                  : imp.processedItems;
              const progressPct =
                imp.totalItems > 0
                  ? Math.round((processed / imp.totalItems) * 100)
                  : 0;

              return (
                <tr key={imp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {imp.id}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{imp.source}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.color}`}
                    >
                      {cfg.icon} {imp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 rounded-full bg-gray-200">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            imp.status === 'FAILED'
                              ? 'bg-red-400'
                              : imp.status === 'COMPLETED'
                                ? 'bg-green-500'
                                : 'bg-blue-500'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {processed}/{imp.totalItems}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(imp.createdAt).toLocaleString('ro-MD')}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {imp.completedAt
                      ? new Date(imp.completedAt).toLocaleString('ro-MD')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-xs font-medium text-primary-600 hover:text-primary-800">
                        Details
                      </button>
                      {imp.status === 'FAILED' && (
                        <button className="text-xs font-medium text-amber-600 hover:text-amber-800">
                          Retry
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Error details for failed imports */}
      {imports
        .filter((imp) => imp.status === 'FAILED' && imp.errorMessage)
        .map((imp) => (
          <div
            key={imp.id}
            className="rounded-lg border border-red-200 bg-red-50 p-4"
          >
            <p className="text-sm font-medium text-red-700">
              {imp.id} — Error Details
            </p>
            <p className="mt-1 text-sm text-red-600">{imp.errorMessage}</p>
          </div>
        ))}
    </div>
  );
}
