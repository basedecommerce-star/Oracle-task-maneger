'use client';

import { useEffect, useState } from 'react';
import { getConflicts, type Conflict } from '@/lib/api';

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getConflicts();
        setConflicts(Array.isArray(data) ? data : []);
      } catch {
        setError('Unable to load conflicts. Check that the API is running.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading conflicts…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Conflicts</h2>
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-16 shadow-sm">
          <span className="text-4xl">⚠️</span>
          <p className="mt-4 text-lg font-medium text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const unresolvedConflicts = conflicts.filter((c) => !c.resolvedAt);
  const resolvedConflicts = conflicts.filter((c) => c.resolvedAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Conflicts</h2>
        <div className="flex gap-3 text-sm">
          <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-700">
            {unresolvedConflicts.length} unresolved
          </span>
          <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-700">
            {resolvedConflicts.length} resolved
          </span>
        </div>
      </div>

      {unresolvedConflicts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
          <span className="text-5xl">🎉</span>
          <p className="mt-4 text-lg font-medium text-gray-700">
            No unresolved conflicts
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {unresolvedConflicts.map((conflict) => (
            <div
              key={conflict.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                <span className="font-mono text-xs text-gray-400">{conflict.id}</span>
                <span className="text-xs text-gray-500">
                  Created: {new Date(conflict.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="grid gap-4 p-6 lg:grid-cols-2">
                {/* Output A */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Parser A — {conflict.outputA.parserRun.parserType}
                  </h4>
                  <div className="rounded-lg border border-gray-100 bg-blue-50 p-3 text-xs text-gray-700">
                    <p>Run ID: {conflict.outputA.parserRun.id}</p>
                    <p>Version: {conflict.outputA.parserRun.parserVersion}</p>
                    <p>Status: {conflict.outputA.parserRun.status}</p>
                  </div>
                </div>

                {/* Output B */}
                <div>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-purple-600">
                    Parser B — {conflict.outputB.parserRun.parserType}
                  </h4>
                  <div className="rounded-lg border border-gray-100 bg-purple-50 p-3 text-xs text-gray-700">
                    <p>Run ID: {conflict.outputB.parserRun.id}</p>
                    <p>Version: {conflict.outputB.parserRun.parserVersion}</p>
                    <p>Status: {conflict.outputB.parserRun.status}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
