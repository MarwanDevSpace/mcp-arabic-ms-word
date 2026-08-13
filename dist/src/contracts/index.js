"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSuccessEnvelope = createSuccessEnvelope;
exports.createErrorEnvelope = createErrorEnvelope;
function createSuccessEnvelope(summary, data, artifacts, nextActions) {
    return {
        status: 'success',
        summary,
        data,
        warnings: [],
        evidence: artifacts ? { artifacts } : undefined,
        nextActions,
    };
}
function createErrorEnvelope(summary, warnings = [], nextActions) {
    return {
        status: 'failed',
        summary,
        warnings,
        nextActions,
    };
}
//# sourceMappingURL=index.js.map