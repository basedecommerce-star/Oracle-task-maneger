'use client';

import { useState } from 'react';

type ReportStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';

interface QuestionReport {
  id: string;
  complaintType: string;
  userName: string;
  userEmail: string;
  questionId: string;
  questionText: string;
  status: ReportStatus;
  comment: string;
  createdAt: string;
}

const statusColors: Record<ReportStatus, string> = {
  OPEN: 'bg-red-100 text-red-700',
  IN_REVIEW: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-green-100 text-green-700',
  DISMISSED: 'bg-gray-100 text-gray-500',
};

const allStatuses: ReportStatus[] = ['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'];

const placeholderReports: QuestionReport[] = [
  {
    id: 'RPT-001',
    complaintType: 'Incorrect Answer',
    userName: 'Ion Popescu',
    userEmail: 'ion.p@mail.md',
    questionId: 'Q-0451',
    questionText: 'Care este viteza maximă admisă pe autostradă?',
    status: 'OPEN',
    comment: 'Răspunsul corect ar trebui să fie 130 km/h, nu 110 km/h.',
    createdAt: '2024-01-16T09:15:00Z',
  },
  {
    id: 'RPT-002',
    complaintType: 'Wrong Image',
    userName: 'Maria Rusu',
    userEmail: 'maria.r@mail.md',
    questionId: 'Q-0892',
    questionText: 'Ce semnifică indicatorul prezentat?',
    status: 'IN_REVIEW',
    comment: 'Imaginea nu corespunde întrebării. Este afișat un indicator de prioritate în loc de unul de interdicție.',
    createdAt: '2024-01-15T14:30:00Z',
  },
  {
    id: 'RPT-003',
    complaintType: 'Duplicate Question',
    userName: 'Andrei Moraru',
    userEmail: 'andrei.m@mail.md',
    questionId: 'Q-1203',
    questionText: 'Cine are prioritate la intersecția nedirijată?',
    status: 'RESOLVED',
    comment: 'Această întrebare este identică cu Q-0567.',
    createdAt: '2024-01-14T11:00:00Z',
  },
  {
    id: 'RPT-004',
    complaintType: 'Typo',
    userName: 'Elena Codreanu',
    userEmail: 'elena.c@mail.md',
    questionId: 'Q-0234',
    questionText: 'Ce obligații are pietonul la trecerea de pietoni?',
    status: 'DISMISSED',
    comment: 'Greșeală de scriere în varianta B.',
    createdAt: '2024-01-13T16:45:00Z',
  },
  {
    id: 'RPT-005',
    complaintType: 'Outdated Content',
    userName: 'Vasile Grosu',
    userEmail: 'vasile.g@mail.md',
    questionId: 'Q-0078',
    questionText: 'Ce documente trebuie să aibă conducătorul auto?',
    status: 'OPEN',
    comment: 'Legea s-a modificat în 2024, răspunsul nu mai este actual.',
    createdAt: '2024-01-16T08:00:00Z',
  },
];

export default function ReportsPage() {
  const [statusFilter, setStatusFilter] = useState<ReportStatus | 'ALL'>('ALL');
  const [reports, setReports] = useState(placeholderReports);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const filtered =
    statusFilter === 'ALL'
      ? reports
      : reports.filter((r) => r.status === statusFilter);

  const updateStatus = (id: string, newStatus: ReportStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
    );
    // TODO: call API to persist status change
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Reports</h2>
        <span className="text-sm text-gray-500">{filtered.length} reports</span>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <label className="text-sm font-medium text-gray-600">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as ReportStatus | 'ALL')
          }
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="ALL">All Statuses</option>
          {allStatuses.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-600">Type</th>
              <th className="px-4 py-3 font-semibold text-gray-600">User</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Question</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((report) => (
              <tr
                key={report.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gray-800">
                    {report.complaintType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm text-gray-800">{report.userName}</p>
                    <p className="text-xs text-gray-400">{report.userEmail}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <span className="font-mono text-xs text-primary-600">
                      {report.questionId}
                    </span>
                    <p className="mt-0.5 max-w-xs truncate text-xs text-gray-500">
                      {report.questionText}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[report.status]}`}
                  >
                    {report.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString('ro-MD')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setSelectedReport(
                          selectedReport === report.id ? null : report.id,
                        )
                      }
                      className="text-xs font-medium text-primary-600 hover:text-primary-800"
                    >
                      {selectedReport === report.id ? 'Hide' : 'View'}
                    </button>
                    {report.status !== 'RESOLVED' && (
                      <button
                        onClick={() => updateStatus(report.id, 'RESOLVED')}
                        className="text-xs font-medium text-green-600 hover:text-green-800"
                      >
                        Resolve
                      </button>
                    )}
                    {report.status !== 'DISMISSED' && (
                      <button
                        onClick={() => updateStatus(report.id, 'DISMISSED')}
                        className="text-xs font-medium text-gray-500 hover:text-gray-700"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail panel for selected report */}
      {selectedReport && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          {(() => {
            const report = reports.find((r) => r.id === selectedReport);
            if (!report) return null;
            return (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Report {report.id} — {report.complaintType}
                  </h3>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusColors[report.status]}`}
                  >
                    {report.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Reporter
                    </h4>
                    <p className="text-sm text-gray-700">
                      {report.userName} ({report.userEmail})
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Question
                    </h4>
                    <p className="text-sm text-gray-700">
                      <span className="font-mono text-primary-600">
                        {report.questionId}
                      </span>{' '}
                      — {report.questionText}
                    </p>
                  </div>
                  <div className="lg:col-span-2">
                    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Comment
                    </h4>
                    <p className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
                      {report.comment}
                    </p>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
