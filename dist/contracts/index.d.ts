export type ResultStatus = 'success' | 'partial' | 'blocked' | 'failed';
export interface ResultEvidence {
    inputsDigest?: string;
    sources?: Array<{
        label: string;
        uri?: string;
        retrievedAt?: string;
    }>;
    artifacts?: Array<{
        label: string;
        uri?: string;
        sha256?: string;
    }>;
}
export interface StandardResultEnvelope<T = unknown> {
    status: ResultStatus;
    summary: string;
    data?: T;
    warnings?: string[];
    evidence?: ResultEvidence;
    nextActions?: string[];
}
export declare function createSuccessEnvelope<T>(summary: string, data?: T, artifacts?: Array<{
    label: string;
    uri?: string;
}>, nextActions?: string[]): StandardResultEnvelope<T>;
export declare function createErrorEnvelope(summary: string, warnings?: string[], nextActions?: string[]): StandardResultEnvelope;
//# sourceMappingURL=index.d.ts.map