'use client';

import { useState } from 'react';

type EntityType = 'question' | 'import' | 'report' | 'config' | 'evidence';
type ActionType = 'create' | 'update' | 'delete' | 'verify' | 'publish' | 'resolve' | 'dismiss' | 'approve' | 'reject';

interface ModerationEvent {
  id: string;
  date: string;
  moderator: string;
  entityType: EntityType;
  entityId: string;
  action: ActionType;
  comment: string;
}

const entityTypeColors: Record<EntityType, string> = {
  question: 'bg-blue-100 text-blue-700',
  import: 'bg-purple-100 text-purple-700',
  report: 'bg-amber-100 text-amber-700',
  config: 'bg-indigo-100 text-indigo-700',
  evidence: 'bg-teal-100 text-teal-700',
};

const actionColors: Record<ActionType, string> = {
  create: 'text-green-600',
  update: 'text-blue-600',
  delete: 'text-red-600',
  verify: 'text-emerald-600',
  publish: 'text-indigo-600',
  resolve: 'text-green-600',
  dismiss: 'text-gray-500',
  approve: 'text-green-600',
  reject: 'text-red-600',
};

const allEntityTypes: EntityType[] = ['question', 'import', 'report', 'config', 'evidence'];
const allActions: ActionType[] = ['create', 'update', 'delete', 'verify', 'publish', 'resolve', 'dismiss', 'approve', 'reject'];

const placeholderEvents: ModerationEvent[] = [
  { id: 'AUD-001', date: '2024-01-16T11:45:00Z', moderator: 'moderator_1', entityType: 'question', entityId: 'Q-1842', action: 'verify', comment: 'Verified after manual review of source material.' },
  { id: 'AUD-002', date: '2024-01-16T11:30:00Z', moderator: 'system', entityType: 'import', entityId: 'IMP-048', action: 'create', comment: 'Import batch started from pdd.md/bilete/categoria-c.' },
  { id: 'AUD-003', date: '2024-01-16T10:12:00Z', moderator: 'system', entityType: 'import', entityId: 'IMP-047', action: 'update', comment: 'Import completed. 156/156 items processed.' },
  { id: 'AUD-004', date: '2024-01-16T09:30:00Z', moderator: 'moderator_2', entityType: 'question', entityId: 'Q-0923', action: 'update', comment: 'Conflict resolved — picked Parser B values.' },
  { id: 'AUD-005', date: '2024-01-16T09:15:00Z', moderator: 'moderator_1', entityType: 'report', entityId: 'RPT-312', action: 'dismiss', comment: 'Report invalid — question text is correct per current regulation.' },
  { id: 'AUD-006', date: '2024-01-16T08:00:00Z', moderator: 'admin', entityType: 'config', entityId: 'CFG-B', action: 'update', comment: 'Updated pass threshold from 90% to 85%.' },
  { id: 'AUD-007', date: '2024-01-15T16:00:00Z', moderator: 'moderator_1', entityType: 'question', entityId: 'Q-1500', action: 'publish', comment: 'Published to production question bank.' },
  { id: 'AUD-008', date: '2024-01-15T15:00:00Z', moderator: 'moderator_2', entityType: 'evidence', entityId: 'EV-003', action: 'create', comment: 'Evidence bundle created from pdd.md/bilete/categoria-c/bilet-1.' },
  { id: 'AUD-009', date: '2024-01-15T14:30:00Z', moderator: 'moderator_1', entityType: 'question', entityId: 'Q-0892', action: 'reject', comment: 'Image does not match question. Sent back for re-processing.' },
  { id: 'AUD-010', date: '2024-01-15T12:00:00Z', moderator: 'moderator_2', entityType: 'report', entityId: 'RPT-310', action: 'resolve', comment: 'Fixed the answer per user report.' },
];

export default function AuditPage() {
  const [entityFilter, setEntityFilter] = useState<EntityType | 'ALL'>('ALL');
  const [actionFilter, setActionFilter] = useState<ActionType | 'ALL'>('ALL');

  const filtered = placeholderEvents.filter((e) => {
    if (entityFilter !== 'ALL' && e.entityType !== entityFilter) return false;
    if (actionFilter !== 'ALL' && e.action !== actionFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Entity:</label>
          <select
            value={entityFilter}
            onChange={(e) =>
              setEntityFilter(e.target.value as EntityType | 'ALL')
            }
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">All Types</option>
            {allEntityTypes.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Action:</label>
          <select
            value={actionFilter}
            onChange={(e) =>
              setActionFilter(e.target.value as ActionType | 'ALL')
            }
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="ALL">All Actions</option>
            {allActions.map((a) => (
              <option key={a} value={a}>
                {a.charAt(0).toUpperCase() + a.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <span className="ml-auto text-sm text-gray-500">
          {filtered.length} events
        </span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Moderator</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Entity Type</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Entity ID</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Action</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Comment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((event) => (
              <tr
                key={event.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                  {new Date(event.date).toLocaleString('ro-MD')}
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">
                    {event.moderator}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${entityTypeColors[event.entityType]}`}
                  >
                    {event.entityType}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-primary-600">
                  {event.entityId}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`text-sm font-medium ${actionColors[event.action]}`}
                  >
                    {event.action}
                  </span>
                </td>
                <td className="max-w-sm px-4 py-3 text-xs text-gray-600">
                  {event.comment}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
