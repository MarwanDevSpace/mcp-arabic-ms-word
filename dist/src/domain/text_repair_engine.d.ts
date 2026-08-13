export interface TextRepairOptions {
    normalizeAlef?: boolean;
    normalizeYeh?: boolean;
    standardizeDigits?: 'eastern' | 'western' | 'none';
    fixInvertedPunctuation?: boolean;
    trimExtraSpaces?: boolean;
    removeKashida?: boolean;
}
export interface TextRepairResult {
    originalText: string;
    repairedText: string;
    transformationsApplied: string[];
}
export declare class ArabicTextRepairEngine {
    static repairText(text: string, options?: TextRepairOptions): TextRepairResult;
}
//# sourceMappingURL=text_repair_engine.d.ts.map