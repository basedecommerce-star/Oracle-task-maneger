'use client';

import { useState } from 'react';

interface ParserDiff {
  field: string;
  parserA: string;
  parserB: string;
}

interface ConflictItem {
  id: string;
  questionId: string;
  questionText: string;
  diffs: ParserDiff[];
  resolved: boolean;
}

const placeholderConflicts: ConflictItem[] = [
  {
    id: 'CF-001',
    questionId: 'Q-0923',
    questionText: 'Care este viteza maximă admisă în localități?',
    diffs: [
      { field: 'correctAnswer', parserA: 'A) 50 km/h', parserB: 'B) 60 km/h' },
      { field: 'category', parserA: 'B', parserB: 'B1' },
    ],
    resolved: false,
  },
  {
    id: 'CF-002',
    questionId: 'Q-1204',
    questionText: 'Semnificația indicatorului prezentat este:',
    diffs: [
      { field: 'questionText', parserA: 'Semnificatia indicatorului prezentat este:', parserB: 'Semnificația indicatorului prezentat este:' },
      { field: 'options', parserA: '["a","b","c"]', parserB: '["A)","B)","C)"]' },
      { field: 'imageRef', parserA: 'img_204.png', parserB: 'sign_204.jpg' },
    ],
    resolved: false,
  },
  {
    id: 'CF-003',
    questionId: 'Q-0587',
    questionText: 'Ce obligații are conducătorul auto la trecerea de pietoni?',
    diffs: [
      { field: 'explanation', parserA: 'Art. 45 din regulament', parserB: 'Conform art. 45 și 46' },
    ],
    resolved: false,
  },
];

export default function ConflictsPage() {
  const [conflicts, setConflicts] = useState(placeholderConflicts);
  const [resolutions, setResolutions] = useState<
    Record<string, Record<string, 'A' | 'B' | 'manual'>>
  >({});
  const [manualValues, setManualValues] = useState<
    Record<string, Record<string, string>>
  >({});

  const pickResolution = (
    conflictId: string,
    field: string,
    choice: 'A' | 'B' | 'manual',
  ) => {
    setResolutions((prev) => ({
      ...prev,
      [conflictId]: { ...prev[conflictId], [field]: choice },
    }));
  };

  const setManualValue = (conflictId: string, field: string, value: string) => {
    setManualValues((prev) => ({
      ...prev,
      [conflictId]: { ...prev[conflictId], [field]: value },
    }));
  };

  const resolveConflict = (conflictId: string) => {
    setConflicts((prev) =>
      prev.map((c) =>
        c.id === conflictId ? { ...c, resolved: true } : c,
      ),
    );
    // TODO: call API to persist resolution
  };

  const unresolvedConflicts = conflicts.filter((c) => !c.resolved);
  const resolvedConflicts = conflicts.filter((c) => c.resolved);

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
            No conflicts remaining
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {unresolvedConflicts.map((conflict) => (
            <div
              key={conflict.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
                <span className="font-mono text-xs text-gray-400">{conflict.id}</span>
                <span className="font-mono text-xs text-primary-600">{conflict.questionId}</span>
                <span className="text-sm text-gray-700">{conflict.questionText}</span>
              </div>

              {/* Diffs */}
              <div className="divide-y divide-gray-50 p-6">
                {conflict.diffs.map((diff) => {
                  const choice = resolutions[conflict.id]?.[diff.field];
                  return (
                    <div key={diff.field} className="py-4 first:pt-0 last:pb-0">
                      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {diff.field}
                      </div>

                      <div className="grid gap-3 lg:grid-cols-2">
                        {/* Parser A */}
                        <button
                          onClick={() => pickResolution(conflict.id, diff.field, 'A')}
                          className={`rounded-lg border-2 p-3 text-left text-sm transition-colors ${
                            choice === 'A'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <span className="mb-1 block text-xs font-semibold text-blue-600">
                            Parser A
                          </span>
                          <span className="text-gray-700">{diff.parserA}</span>
                        </button>

                        {/* Parser B */}
                        <button
                          onClick={() => pickResolution(conflict.id, diff.field, 'B')}
                          className={`rounded-lg border-2 p-3 text-left text-sm transition-colors ${
                            choice === 'B'
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <span className="mb-1 block text-xs font-semibold text-purple-600">
                            Parser B
                          </span>
                          <span className="text-gray-700">{diff.parserB}</span>
                        </button>
                      </div>

                      {/* Manual edit option */}
                      <div className="mt-2">
                        <button
                          onClick={() => pickResolution(conflict.id, diff.field, 'manual')}
                          className={`text-xs font-medium ${
                            choice === 'manual'
                              ? 'text-amber-700'
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          ✏️ Manual edit
                        </button>
                        {choice === 'manual' && (
                          <input
                            type="text"
                            value={manualValues[conflict.id]?.[diff.field] ?? ''}
                            onChange={(e) =>
                              setManualValue(conflict.id, diff.field, e.target.value)
                            }
                            placeholder="Enter manual value…"
                            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resolve button */}
              <div className="flex justify-end border-t border-gray-100 px-6 py-4">
                <button
                  onClick={() => resolveConflict(conflict.id)}
                  disabled={
                    !conflict.diffs.every(
                      (d) => resolutions[conflict.id]?.[d.field],
                    )
                  }
                  className="rounded-lg bg-primary-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Resolve Conflict
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
