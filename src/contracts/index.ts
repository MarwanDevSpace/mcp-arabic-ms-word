export type ResultStatus = 'success' | 'partial' | 'blocked' | 'failed';

export interface ResultEvidence {
  inputsDigest?: string;
  sources?: Array<{ label: string; uri?: string; retrievedAt?: string }>;
  artifacts?: Array<{ label: string; uri?: string; sha256?: string }>;
}

export interface StandardResultEnvelope<T = unknown> {
  status: ResultStatus;
  summary: string;
  data?: T;
  warnings?: string[];
  evidence?: ResultEvidence;
  nextActions?: string[];
}

export function createSuccessEnvelope<T>(
  summary: string,
  data?: T,
  artifacts?: Array<{ label: string; uri?: string }>,
  nextActions?: string[]
): StandardResultEnvelope<T> {
  return {
    status: 'success',
    summary,
    data,
    warnings: [],
    evidence: artifacts ? { artifacts } : undefined,
    nextActions,
  };
}

export function createErrorEnvelope(
  summary: string,
  warnings: string[] = [],
  nextActions?: string[]
): StandardResultEnvelope {
  return {
    status: 'failed',
    summary,
    warnings,
    nextActions,
  };
}
