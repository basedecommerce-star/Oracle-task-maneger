'use client';

import { useState } from 'react';

interface ReviewItem {
  id: string;
  questionText: string;
  rawSourceSnippet: string;
  extractedText: string;
  screenshotUrl: string | null;
  parserAResult: string | null;
  parserBResult: string | null;
  confidenceA: number;
  confidenceB: number;
  category: string;
}

const placeholderItems: ReviewItem[] = [
  {
    id: 'RV-001',
    questionText: 'Ce semnifică indicatorul de circulație prezentat în imagine?',
    rawSourceSnippet: '<div class="question">Ce semnifică indicatorul de circulație prezentat în imagine?</div>',
    extractedText: 'Ce semnifică indicatorul de circulație prezentat în imagine?',
    screenshotUrl: null,
    parserAResult: 'Ce semnifica indicatorul de circulatie prezentat in imagine?',
    parserBResult: 'Ce semnifică indicatorul de circulație prezentat în imagine?',
    confidenceA: 0.82,
    confidenceB: 0.91,
    category: 'B',
  },
  {
    id: 'RV-002',
    questionText: 'În ce situații este permisă oprirea pe pod?',
    rawSourceSnippet: '<div class="question">In ce situatii este permisa oprirea pe pod?</div>',
    extractedText: 'În ce situații este permisă oprirea pe pod?',
    screenshotUrl: null,
    parserAResult: null,
    parserBResult: null,
    confidenceA: 0.67,
    confidenceB: 0.71,
    category: 'C',
  },
];

export default function ReviewPage() {
  const [items, setItems] = useState(placeholderItems);

  const handleAction = (id: string, action: 'approve' | 'reject' | 'needs-fix') => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    // TODO: call API to submit review decision
  };

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Review Queue</h2>
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 shadow-sm">
          <span className="text-5xl">✅</span>
          <p className="mt-4 text-lg font-medium text-gray-700">
            All caught up!
          </p>
          <p className="mt-1 text-sm text-gray-500">
            No questions pending review at the moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Review Queue</h2>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
          {items.length} pending
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-gray-400">{item.id}</span>
                <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Confidence: A={(item.confidenceA * 100).toFixed(0)}%</span>
                <span className="text-gray-300">|</span>
                <span>B={(item.confidenceB * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div className="grid gap-4 p-6 lg:grid-cols-2">
              {/* Raw source */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Raw Source Snippet
                </h4>
                <pre className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600 overflow-x-auto border border-gray-100">
                  {item.rawSourceSnippet}
                </pre>
              </div>

              {/* Screenshot placeholder */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Screenshot
                </h4>
                {item.screenshotUrl ? (
                  <img
                    src={item.screenshotUrl}
                    alt="Question screenshot"
                    className="rounded-lg border border-gray-200"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                    No screenshot available
                  </div>
                )}
              </div>

              {/* Extracted text */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Extracted Text
                </h4>
                <div className="rounded-lg border border-gray-100 bg-blue-50 p-3 text-sm text-gray-800">
                  {item.extractedText}
                </div>
              </div>

              {/* Parser diff */}
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Parser Comparison
                </h4>
                {item.parserAResult && item.parserBResult ? (
                  <div className="space-y-2">
                    <div className="rounded-lg border border-gray-100 bg-red-50 p-2 text-xs">
                      <span className="font-medium text-red-600">Parser A:</span>{' '}
                      <span className="text-gray-700">{item.parserAResult}</span>
                    </div>
                    <div className="rounded-lg border border-gray-100 bg-green-50 p-2 text-xs">
                      <span className="font-medium text-green-600">Parser B:</span>{' '}
                      <span className="text-gray-700">{item.parserBResult}</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-400">
                    Single parser — no diff available
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => handleAction(item.id, 'reject')}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
              >
                Reject
              </button>
              <button
                onClick={() => handleAction(item.id, 'needs-fix')}
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
              >
                Needs Fix
              </button>
              <button
                onClick={() => handleAction(item.id, 'approve')}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
