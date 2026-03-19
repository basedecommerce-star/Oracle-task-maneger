'use client';

import { useState } from 'react';

interface EvidenceBundle {
  id: string;
  sourceUrl: string;
  screenshotStatus: 'captured' | 'pending' | 'failed';
  extractedTextPreview: string;
  associatedQuestions: number;
  createdAt: string;
}

const placeholderBundles: EvidenceBundle[] = [
  {
    id: 'EV-001',
    sourceUrl: 'https://pdd.md/bilete/categoria-b/bilet-1',
    screenshotStatus: 'captured',
    extractedTextPreview:
      'Biletul nr. 1 — Categoria B. 1. Care este viteza maximă admisă în localități pentru autoturisme? a) 50 km/h b) 60 km/h c) 40 km/h …',
    associatedQuestions: 20,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'EV-002',
    sourceUrl: 'https://pdd.md/bilete/categoria-b/bilet-2',
    screenshotStatus: 'captured',
    extractedTextPreview:
      'Biletul nr. 2 — Categoria B. 1. Ce semnifică semnalul roșu intermitent al semaforului? a) Oprire obligatorie b) Atenție …',
    associatedQuestions: 20,
    createdAt: '2024-01-15T10:32:00Z',
  },
  {
    id: 'EV-003',
    sourceUrl: 'https://pdd.md/bilete/categoria-c/bilet-1',
    screenshotStatus: 'pending',
    extractedTextPreview:
      'Biletul nr. 1 — Categoria C. 1. Ce trebuie să verifice conducătorul înainte de plecarea în cursă? …',
    associatedQuestions: 18,
    createdAt: '2024-01-16T08:15:00Z',
  },
  {
    id: 'EV-004',
    sourceUrl: 'https://pdd.md/semne/avertizare',
    screenshotStatus: 'failed',
    extractedTextPreview:
      'Indicatoare de avertizare. 1.1 — Curbă periculoasă la dreapta. 1.2 — Curbă periculoasă la stânga …',
    associatedQuestions: 45,
    createdAt: '2024-01-16T09:00:00Z',
  },
];

const screenshotStatusConfig = {
  captured: { label: 'Captured', color: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700' },
};

export default function EvidencePage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Evidence Bundles</h2>
        <span className="text-sm text-gray-500">
          {placeholderBundles.length} bundles
        </span>
      </div>

      <div className="space-y-3">
        {placeholderBundles.map((bundle) => {
          const isExpanded = expandedId === bundle.id;
          const ssConfig = screenshotStatusConfig[bundle.screenshotStatus];

          return (
            <div
              key={bundle.id}
              className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Summary row */}
              <button
                onClick={() => toggleExpand(bundle.id)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-gray-400">
                    {bundle.id}
                  </span>
                  <span className="text-sm text-primary-600 underline decoration-primary-200">
                    {bundle.sourceUrl}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ssConfig.color}`}
                  >
                    📸 {ssConfig.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {bundle.associatedQuestions} questions
                  </span>
                  <span className="text-gray-400">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-6 py-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Source URL
                      </h4>
                      <a
                        href={bundle.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:underline"
                      >
                        {bundle.sourceUrl}
                      </a>
                    </div>
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Created At
                      </h4>
                      <span className="text-sm text-gray-700">
                        {new Date(bundle.createdAt).toLocaleString('ro-MD')}
                      </span>
                    </div>
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Screenshot
                      </h4>
                      <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
                        {bundle.screenshotStatus === 'captured'
                          ? 'Screenshot preview placeholder'
                          : bundle.screenshotStatus === 'pending'
                            ? 'Capture in progress…'
                            : 'Screenshot capture failed'}
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Extracted Text Preview
                      </h4>
                      <p className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
                        {bundle.extractedTextPreview}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                      View Full Text
                    </button>
                    <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                      View Questions
                    </button>
                    <button className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                      Re-capture Screenshot
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
