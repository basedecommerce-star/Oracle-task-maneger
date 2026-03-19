'use client';

import { useState } from 'react';

type QuestionStatus =
  | 'RAW'
  | 'PARSED'
  | 'NORMALIZED'
  | 'CONFLICT'
  | 'REVIEW_REQUIRED'
  | 'VERIFIED'
  | 'PUBLISHED'
  | 'ARCHIVED';

interface Question {
  id: string;
  text: string;
  category: string;
  status: QuestionStatus;
  confidence: number;
}

const statusColors: Record<QuestionStatus, string> = {
  RAW: 'bg-gray-100 text-gray-700',
  PARSED: 'bg-blue-100 text-blue-700',
  NORMALIZED: 'bg-indigo-100 text-indigo-700',
  CONFLICT: 'bg-red-100 text-red-700',
  REVIEW_REQUIRED: 'bg-amber-100 text-amber-700',
  VERIFIED: 'bg-green-100 text-green-700',
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

const allStatuses: QuestionStatus[] = [
  'RAW', 'PARSED', 'NORMALIZED', 'CONFLICT',
  'REVIEW_REQUIRED', 'VERIFIED', 'PUBLISHED', 'ARCHIVED',
];

const placeholderQuestions: Question[] = [
  { id: 'Q-0001', text: 'Care este viteza maximă admisă în localități pentru autoturisme?', category: 'B', status: 'VERIFIED', confidence: 0.98 },
  { id: 'Q-0002', text: 'Ce semnifică indicatorul de circulație prezentat în imagine?', category: 'B', status: 'REVIEW_REQUIRED', confidence: 0.72 },
  { id: 'Q-0003', text: 'În ce situații este interzisă depășirea?', category: 'A', status: 'CONFLICT', confidence: 0.45 },
  { id: 'Q-0004', text: 'Câte categorii de permise de conducere există în Republica Moldova?', category: 'AM', status: 'PUBLISHED', confidence: 0.95 },
  { id: 'Q-0005', text: 'Ce trebuie să facă conducătorul auto la intersecția prezentată?', category: 'C', status: 'PARSED', confidence: 0.81 },
  { id: 'Q-0006', text: 'Cine are prioritate la intersecția nedirijată?', category: 'B', status: 'NORMALIZED', confidence: 0.88 },
  { id: 'Q-0007', text: 'Ce semnifică marcajul rutier din imaginea prezentată?', category: 'D', status: 'RAW', confidence: 0.33 },
  { id: 'Q-0008', text: 'Distanța minimă de siguranță în afara localităților este…', category: 'B', status: 'ARCHIVED', confidence: 0.91 },
];

export default function QuestionsPage() {
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const filtered =
    statusFilter === 'ALL'
      ? placeholderQuestions
      : placeholderQuestions.filter((q) => q.status === statusFilter);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
        <span className="text-sm text-gray-500">{filtered.length} results</span>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <label className="text-sm font-medium text-gray-600">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as QuestionStatus | 'ALL');
            setCurrentPage(1);
          }}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="ALL">All Statuses</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-600">ID</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Question Text</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Confidence</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{q.id}</td>
                <td className="max-w-md truncate px-4 py-3 text-gray-800" title={q.text}>
                  {q.text}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                    {q.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[q.status]}`}>
                    {q.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 rounded-full bg-gray-200">
                      <div
                        className={`h-1.5 rounded-full ${
                          q.confidence >= 0.8
                            ? 'bg-green-500'
                            : q.confidence >= 0.5
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        }`}
                        style={{ width: `${q.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{(q.confidence * 100).toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button className="text-xs font-medium text-primary-600 hover:text-primary-800">
                      View
                    </button>
                    <button className="text-xs font-medium text-gray-500 hover:text-gray-700">
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
