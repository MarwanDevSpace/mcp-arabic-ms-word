export interface AutomatedIntentRequest {
    prompt: string;
    outputPath?: string;
    recipient?: string;
    subject?: string;
    author?: string;
    fontFamily?: string;
}
export interface AutomatedIntentResult {
    outputPath: string;
    archetype: string;
    elementsCreated: string[];
}
export declare function resolveAndExecuteIntent(request: AutomatedIntentRequest): Promise<AutomatedIntentResult>;
//# sourceMappingURL=intent_resolver.d.ts.map