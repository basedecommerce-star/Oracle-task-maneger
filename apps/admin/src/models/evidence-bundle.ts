export interface EvidenceBundleModel {
  questionId: string;
  sourceUrl: string;
  sourceSnapshotId: string;
  parserOutputIds: string[];
  parserDiffId?: string;
  approvalEventId?: string;
}

export interface EvidenceBundleScreenModel {
  title: string;
  subtitle: string;
  bundle: EvidenceBundleModel;
}

export function buildEvidenceBundleScreenModel(bundle: EvidenceBundleModel): EvidenceBundleScreenModel {
  return {
    title: 'Evidence bundle',
    subtitle: 'Trace every published question back to source material and verification evidence.',
    bundle,
  };
}
