'use client';

import { useState } from 'react';
import { getEvidence, type EvidenceBundle } from '@/lib/api';

export default function EvidencePage() {
  const [evidenceId, setEvidenceId] = useState('');
  const [bundle, setBundle] = useState<EvidenceBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!evidenceId.trim()) return;
    setLoading(true);
    setError(null);
    setBundle(null);

    try {
      const data = await getEvidence(evidenceId.trim());
      setBundle(data);
    } catch {
      setError(`Unable to load evidence bundle "${evidenceId}". Check the ID and ensure the API is running.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Evidence Bundles</h2>

      {/* Search form */}
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <label className="text-sm font-medium text-gray-600">Evidence ID:</label>
        <input
          type="text"
          value={evidenceId}
          onChange={(e) => setEvidenceId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter evidence bundle ID…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !evidenceId.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading…' : 'Fetch'}
        </button>
      </div>

      {error && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-12 shadow-sm">
          <span className="text-4xl">⚠️</span>
          <p className="mt-4 text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {bundle && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Evidence Bundle: {bundle.id}
            </h3>
          </div>
          <div className="p-6">
            <pre className="rounded-lg bg-gray-50 p-4 text-xs text-gray-700 overflow-x-auto border border-gray-100">
              {JSON.stringify(bundle, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {!bundle && !error && !loading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 shadow-sm">
          <span className="text-5xl">🔍</span>
          <p className="mt-4 text-lg font-medium text-gray-700">
            Search for an evidence bundle
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Enter an evidence bundle ID above to view its details.
          </p>
        </div>
      )}
    </div>
  );
}
