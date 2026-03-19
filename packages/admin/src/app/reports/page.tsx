'use client';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">User Reports</h2>

      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
        <span className="text-5xl">📋</span>
        <p className="mt-4 text-lg font-medium text-gray-700">
          Reports endpoint not available
        </p>
        <p className="mt-2 max-w-md text-center text-sm text-gray-500">
          A dedicated reports listing endpoint is not yet implemented in the backend.
          Individual question reports can be submitted via{' '}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">
            POST /api/questions/:id/report
          </code>{' '}
          but there is no admin endpoint to list all reports.
        </p>
        <p className="mt-4 text-xs text-gray-400">
          This page will be functional once a GET /api/admin/reports endpoint is added to the backend.
        </p>
      </div>
    </div>
  );
}
