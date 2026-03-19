'use client';

import { useEffect, useState } from 'react';
import { getCategories, type Category, type ExamConfig } from '@/lib/api';

interface CategoryWithConfig {
  categoryCode: string;
  categoryName: string;
  configs: ExamConfig[];
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ConfigsPage() {
  const [categories, setCategories] = useState<CategoryWithConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data: Category[] = await getCategories();
        const mapped = data.map((cat) => ({
          categoryCode: cat.code,
          categoryName: cat.name,
          configs: cat.examConfigs ?? [],
        }));
        setCategories(mapped);
      } catch {
        setError('Unable to load exam configurations. Check that the API is running.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Loading configurations…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Exam Configurations</h2>
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-16 shadow-sm">
          <span className="text-4xl">⚠️</span>
          <p className="mt-4 text-lg font-medium text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Exam Configurations</h2>
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
          <span className="text-5xl">📝</span>
          <p className="mt-4 text-lg font-medium text-gray-700">No categories found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Exam Configurations</h2>

      {categories.map((cat) => (
        <div key={cat.categoryCode}>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <span className="rounded bg-blue-100 px-2.5 py-1 text-sm font-bold text-blue-700">
              {cat.categoryCode}
            </span>
            {cat.categoryName}
          </h3>

          {cat.configs.length === 0 ? (
            <p className="text-sm text-gray-500">No exam configs for this category.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-600">Config ID</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Questions</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Time Limit</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Passing Score</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Active Until</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cat.configs.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {config.id.slice(0, 8)}…
                      </td>
                      <td className="px-4 py-3 text-gray-700">{config.totalQuestions}</td>
                      <td className="px-4 py-3 font-mono text-gray-700">
                        {formatDuration(config.timeLimit)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{config.passingScore}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {config.activeTo
                          ? new Date(config.activeTo).toLocaleDateString()
                          : 'No expiry'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
