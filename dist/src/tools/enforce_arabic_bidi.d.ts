import { z } from 'zod';
import { BidiEnforcementResult } from '../domain/bidi_openxml_surgeon.js';
import { StandardResultEnvelope } from '../contracts/index.js';
export declare const enforceArabicBidiSchema: z.ZodObject<{
    document_path: z.ZodString;
    fix_headings_alignment: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    justify_body_paragraphs: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    prevent_verse_splitting: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    inject_dynamic_page_numbering: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    isolate_english_sections: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    document_path: string;
    fix_headings_alignment: boolean;
    justify_body_paragraphs: boolean;
    prevent_verse_splitting: boolean;
    inject_dynamic_page_numbering: boolean;
    isolate_english_sections: boolean;
}, {
    document_path: string;
    fix_headings_alignment?: boolean | undefined;
    justify_body_paragraphs?: boolean | undefined;
    prevent_verse_splitting?: boolean | undefined;
    inject_dynamic_page_numbering?: boolean | undefined;
    isolate_english_sections?: boolean | undefined;
}>;
export type EnforceArabicBidiInput = z.input<typeof enforceArabicBidiSchema>;
export declare function handleEnforceArabicBidi(input: EnforceArabicBidiInput): Promise<StandardResultEnvelope<BidiEnforcementResult>>;
//# sourceMappingURL=enforce_arabic_bidi.d.ts.map