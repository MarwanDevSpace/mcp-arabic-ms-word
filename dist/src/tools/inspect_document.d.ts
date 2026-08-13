import { z } from 'zod';
import { DocumentInspectionResult } from '../domain/xml_engine.js';
import { StandardResultEnvelope } from '../contracts/index.js';
export declare const inspectDocumentSchema: z.ZodObject<{
    filePath: z.ZodString;
}, "strip", z.ZodTypeAny, {
    filePath: string;
}, {
    filePath: string;
}>;
export type InspectDocumentInput = z.input<typeof inspectDocumentSchema>;
export declare function handleInspectDocument(input: InspectDocumentInput): Promise<StandardResultEnvelope<DocumentInspectionResult>>;
//# sourceMappingURL=inspect_document.d.ts.map