'use client';

import { useEffect, useState, useCallback } from 'react';
import { getQuestions, type Question } from '@/lib/api';

type VerificationStatus =
  | 'ALL'
  | 'RAW'
  | 'PARSED'
  | 'NORMALIZED'
  | 'CONFLICT'
  | 'REVIEW_REQUIRED'
  | 'VERIFIED'
  | 'PUBLISHED'
  | 'ARCHIVED';

const statusColors: Record<string, string> = {
  RAW: 'bg-gray-100 text-gray-700',
  PARSED: 'bg-blue-100 text-blue-700',
  NORMALIZED: 'bg-indigo-100 text-indigo-700',
  CONFLICT: 'bg-red-100 text-red-700',
  REVIEW_REQUIRED: 'bg-amber-100 text-amber-700',
  VERIFIED: 'bg-green-100 text-green-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

const allStatuses: VerificationStatus[] = [
  'ALL', 'RAW', 'PARSED', 'NORMALIZED', 'CONFLICT',
  'REVIEW_REQUIRED', 'VERIFIED', 'PUBLISHED', 'ARCHIVED',
];

export default function QuestionsPage() {
  const [statusFilter, setStatusFilter] = useState<VerificationStatus>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const perPage = 20;

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: Record<string, unknown> = { page: currentPage, limit: perPage };
      if (statusFilter !== 'ALL') {
        filters.verificationStatus = statusFilter;
      }
      const response = await getQuestions(filters);
      setQuestions(response.questions);
      setTotal(response.total);
    } catch {
      setError('Unable to load questions. Check that the API is running.');
      setQuestions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const getQuestionText = (q: Question): string => {
    const translation = q.translations?.find(t => t.language === 'ro') ?? q.translations?.[0];
    return translation?.questionText ?? `Question #${q.ticketNumber}`;
  };

  if (error && questions.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-16 shadow-sm">
          <span className="text-4xl">⚠️</span>
          <p className="mt-4 text-lg font-medium text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
        <span className="text-sm text-gray-500">{total} results</span>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <label className="text-sm font-medium text-gray-600">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as VerificationStatus);
            setCurrentPage(1);
          }}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {allStatuses.map((s) => (
            <option key={s} value={s}>
              {s === 'ALL' ? 'All Statuses' : s.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Loading…</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-600">ID</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Question Text</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Ticket</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Topic</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {q.id.slice(0, 8)}…
                  </td>
                  <td className="max-w-md truncate px-4 py-3 text-gray-800" title={getQuestionText(q)}>
                    {getQuestionText(q)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      #{q.ticketNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {q.topic?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[q.verificationStatus] ?? 'bg-gray-100 text-gray-700'}`}>
                      {q.verificationStatus.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No questions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
