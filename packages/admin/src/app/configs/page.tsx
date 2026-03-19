'use client';

import { useState } from 'react';

interface ExamConfig {
  id: string;
  categoryCode: string;
  totalQuestions: number;
  durationSeconds: number;
  passThreshold: number;
  maxErrors: number;
  group: 'light' | 'heavy';
}

const placeholderConfigs: ExamConfig[] = [
  // Light categories
  { id: 'CFG-AM', categoryCode: 'AM', totalQuestions: 20, durationSeconds: 1200, passThreshold: 0.9, maxErrors: 2, group: 'light' },
  { id: 'CFG-A1', categoryCode: 'A1', totalQuestions: 20, durationSeconds: 1200, passThreshold: 0.9, maxErrors: 2, group: 'light' },
  { id: 'CFG-A2', categoryCode: 'A2', totalQuestions: 20, durationSeconds: 1200, passThreshold: 0.9, maxErrors: 2, group: 'light' },
  { id: 'CFG-A', categoryCode: 'A', totalQuestions: 20, durationSeconds: 1200, passThreshold: 0.9, maxErrors: 2, group: 'light' },
  { id: 'CFG-B1', categoryCode: 'B1', totalQuestions: 20, durationSeconds: 1200, passThreshold: 0.85, maxErrors: 3, group: 'light' },
  { id: 'CFG-B', categoryCode: 'B', totalQuestions: 20, durationSeconds: 1200, passThreshold: 0.85, maxErrors: 3, group: 'light' },
  // Heavy categories
  { id: 'CFG-C1', categoryCode: 'C1', totalQuestions: 30, durationSeconds: 1800, passThreshold: 0.9, maxErrors: 3, group: 'heavy' },
  { id: 'CFG-C', categoryCode: 'C', totalQuestions: 30, durationSeconds: 1800, passThreshold: 0.9, maxErrors: 3, group: 'heavy' },
  { id: 'CFG-D1', categoryCode: 'D1', totalQuestions: 30, durationSeconds: 1800, passThreshold: 0.9, maxErrors: 3, group: 'heavy' },
  { id: 'CFG-D', categoryCode: 'D', totalQuestions: 30, durationSeconds: 1800, passThreshold: 0.9, maxErrors: 3, group: 'heavy' },
  { id: 'CFG-BE', categoryCode: 'BE', totalQuestions: 25, durationSeconds: 1500, passThreshold: 0.88, maxErrors: 3, group: 'heavy' },
  { id: 'CFG-CE', categoryCode: 'CE', totalQuestions: 25, durationSeconds: 1500, passThreshold: 0.88, maxErrors: 3, group: 'heavy' },
  { id: 'CFG-DE', categoryCode: 'DE', totalQuestions: 25, durationSeconds: 1500, passThreshold: 0.88, maxErrors: 3, group: 'heavy' },
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ConfigsPage() {
  const [configs, setConfigs] = useState(placeholderConfigs);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ExamConfig>>({});

  const lightConfigs = configs.filter((c) => c.group === 'light');
  const heavyConfigs = configs.filter((c) => c.group === 'heavy');

  const startEditing = (config: ExamConfig) => {
    setEditingId(config.id);
    setEditValues({
      totalQuestions: config.totalQuestions,
      durationSeconds: config.durationSeconds,
      passThreshold: config.passThreshold,
      maxErrors: config.maxErrors,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEditing = (id: string) => {
    setConfigs((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              totalQuestions: editValues.totalQuestions ?? c.totalQuestions,
              durationSeconds: editValues.durationSeconds ?? c.durationSeconds,
              passThreshold: editValues.passThreshold ?? c.passThreshold,
              maxErrors: editValues.maxErrors ?? c.maxErrors,
            }
          : c,
      ),
    );
    setEditingId(null);
    setEditValues({});
    // TODO: call API to persist changes
  };

  const renderGroup = (title: string, groupConfigs: ExamConfig[], icon: string) => (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-800">
        <span>{icon}</span> {title}
      </h3>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Questions</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Duration</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Pass Threshold</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Max Errors</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {groupConfigs.map((config) => {
              const isEditing = editingId === config.id;

              return (
                <tr key={config.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="rounded bg-primary-100 px-2.5 py-1 text-sm font-bold text-primary-700">
                      {config.categoryCode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues.totalQuestions ?? ''}
                        onChange={(e) =>
                          setEditValues((v) => ({
                            ...v,
                            totalQuestions: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
                      />
                    ) : (
                      <span className="text-gray-700">{config.totalQuestions}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues.durationSeconds ?? ''}
                        onChange={(e) =>
                          setEditValues((v) => ({
                            ...v,
                            durationSeconds: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-24 rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
                        placeholder="seconds"
                      />
                    ) : (
                      <span className="font-mono text-gray-700">
                        {formatDuration(config.durationSeconds)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        value={editValues.passThreshold ?? ''}
                        onChange={(e) =>
                          setEditValues((v) => ({
                            ...v,
                            passThreshold: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
                      />
                    ) : (
                      <span className="text-gray-700">
                        {(config.passThreshold * 100).toFixed(0)}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editValues.maxErrors ?? ''}
                        onChange={(e) =>
                          setEditValues((v) => ({
                            ...v,
                            maxErrors: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-16 rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none"
                      />
                    ) : (
                      <span className="text-gray-700">{config.maxErrors}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEditing(config.id)}
                          className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(config)}
                        className="text-xs font-medium text-primary-600 hover:text-primary-800"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Exam Configurations</h2>
      {renderGroup('Light Vehicle Categories (A/B/AM)', lightConfigs, '🏍️')}
      {renderGroup('Heavy Vehicle Categories (C/D/E)', heavyConfigs, '🚛')}
    </div>
  );
}
