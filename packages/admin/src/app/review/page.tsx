'use client';

import { useEffect, useState, useCallback } from 'react';
import { getQuestions, approveQuestion, rejectQuestion, type Question } from '@/lib/api';

export default function ReviewPage() {
  const [items, setItems] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const loadReviewQueue = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getQuestions({ verificationStatus: 'REVIEW_REQUIRED' });
      setItems(response.questions);
      setError(null);
    } catch {
      setError('Unable to load review queue. Check that the API is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviewQueue();
  }, [loadReviewQueue]);

  const handleApprove = async (id: string) => {
    setActionInProgress(id);
    try {
      await approveQuestion(id, 'admin');
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError(`Failed to approve question ${id}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionInProgress(id);
    try {
      await rejectQuestion(id, 'admin');
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError(`Failed to reject question ${id}`);
    } finally {
      setActionInProgress(null);
    }
  };

  const getQuestionText = (q: Question): string => {
    const translation = q.translations?.find(t => t.language === 'ro') ?? q.translations?.[0];
    return translation?.questionText ?? `Question #${q.ticketNumber}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading review queue…</p>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Review Queue</h2>
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-16 shadow-sm">
          <span className="text-4xl">⚠️</span>
          <p className="mt-4 text-lg font-medium text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Review Queue</h2>
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 shadow-sm">
          <span className="text-5xl">✅</span>
          <p className="mt-4 text-lg font-medium text-gray-700">All caught up!</p>
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

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {items.map((item) => {
          const questionText = getQuestionText(item);
          const isProcessing = actionInProgress === item.id;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-gray-400">{item.id}</span>
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    Ticket #{item.ticketNumber}
                  </span>
                  {item.topic && (
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                      {item.topic.name}
                    </span>
                  )}
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  {item.verificationStatus}
                </span>
              </div>

              {/* Question content */}
              <div className="p-6">
                <h4 className="mb-3 text-sm font-medium text-gray-800">{questionText}</h4>
                {item.answers && item.answers.length > 0 && (
                  <div className="space-y-1">
                    {item.answers.map((answer) => (
                      <div
                        key={answer.id}
                        className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-700"
                      >
                        {answer.answerOrder}. {answer.answerText}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
                <button
                  onClick={() => handleReject(item.id)}
                  disabled={isProcessing}
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(item.id)}
                  disabled={isProcessing}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
