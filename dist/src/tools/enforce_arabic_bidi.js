"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceArabicBidiSchema = void 0;
exports.handleEnforceArabicBidi = handleEnforceArabicBidi;
const zod_1 = require("zod");
const workspace_js_1 = require("../security/workspace.js");
const bidi_openxml_surgeon_js_1 = require("../domain/bidi_openxml_surgeon.js");
const index_js_1 = require("../contracts/index.js");
const logger_js_1 = require("../core/logger.js");
exports.enforceArabicBidiSchema = zod_1.z.object({
    document_path: zod_1.z.string().describe('The absolute or workspace path to the target .docx file to inspect and surgically repair'),
    fix_headings_alignment: zod_1.z
        .boolean()
        .optional()
        .default(true)
        .describe('If true, enforces strict physical right alignment (w:jc=\'right\') and keepNext on all Heading 1..6 and metadata lines'),
    justify_body_paragraphs: zod_1.z
        .boolean()
        .optional()
        .default(true)
        .describe('If true, enforces w:bidi and w:jc=\'both\' on all Arabic body paragraphs for clean margin-to-margin alignment'),
    prevent_verse_splitting: zod_1.z
        .boolean()
        .optional()
        .default(true)
        .describe('If true, wraps Quranic verses and Hadiths with w:keepLines to prevent them from splitting across page breaks'),
    inject_dynamic_page_numbering: zod_1.z
        .boolean()
        .optional()
        .default(true)
        .describe('If true, injects dynamic Arabic page numbers (- PAGE -) into document section footers'),
    isolate_english_sections: zod_1.z
        .boolean()
        .optional()
        .default(true)
        .describe('If true, ensures English titles, abstracts, and Romanized references are set to strict left alignment without BiDi corruption'),
});
async function handleEnforceArabicBidi(input) {
    try {
        const validated = exports.enforceArabicBidiSchema.parse(input);
        const resolvedPath = (0, workspace_js_1.resolveWorkspacePath)(validated.document_path);
        logger_js_1.Logger.info(`Enforcing Arabic BiDi and OpenXML typography on '${resolvedPath}'`);
        const surgeon = new bidi_openxml_surgeon_js_1.BidiOpenXmlSurgeon();
        const result = await surgeon.enforceBidiAndTypography(resolvedPath, {
            fixHeadingsAlignment: validated.fix_headings_alignment,
            justifyBodyParagraphs: validated.justify_body_paragraphs,
            preventVerseSplitting: validated.prevent_verse_splitting,
            injectDynamicPageNumbering: validated.inject_dynamic_page_numbering,
            isolateEnglishSections: validated.isolate_english_sections,
        });
        return (0, index_js_1.createSuccessEnvelope)(`Enforced Arabic BiDi alignment & typography: ${result.headingsFixed} headings fixed, ${result.bodyParagraphsJustified} paragraphs justified, ${result.versesProtected} verses protected`, result, [{ label: 'Repaired Arabic Document', uri: `file:///${result.documentPath.replace(/\\/g, '/')}` }], [`Use 'audit_and_render_document_pages' to visually inspect rendered pages in 'Pages/' folder.`]);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger_js_1.Logger.error(`Failed to enforce Arabic BiDi: ${msg}`);
        return (0, index_js_1.createErrorEnvelope)(`Error enforcing Arabic BiDi: ${msg}`);
    }
}
//# sourceMappingURL=enforce_arabic_bidi.js.map