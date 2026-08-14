import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { BidiOpenXmlSurgeon, BidiEnforcementResult } from '../domain/bidi_openxml_surgeon.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const enforceArabicBidiSchema = z.object({
  document_path: z.string().describe('The absolute or workspace path to the target .docx file to inspect and surgically repair'),
  fix_headings_alignment: z
    .boolean()
    .optional()
    .default(true)
    .describe('If true, enforces strict physical right alignment (w:jc=\'right\') and keepNext on all Heading 1..6 and metadata lines'),
  justify_body_paragraphs: z
    .boolean()
    .optional()
    .default(true)
    .describe('If true, enforces w:bidi and w:jc=\'both\' on all Arabic body paragraphs for clean margin-to-margin alignment'),
  prevent_verse_splitting: z
    .boolean()
    .optional()
    .default(true)
    .describe('If true, wraps Quranic verses and Hadiths with w:keepLines to prevent them from splitting across page breaks'),
  inject_dynamic_page_numbering: z
    .boolean()
    .optional()
    .default(true)
    .describe('If true, injects dynamic Arabic page numbers (- PAGE -) into document section footers'),
  isolate_english_sections: z
    .boolean()
    .optional()
    .default(true)
    .describe('If true, ensures English titles, abstracts, and Romanized references are set to strict left alignment without BiDi corruption'),
});

export type EnforceArabicBidiInput = z.input<typeof enforceArabicBidiSchema>;

export async function handleEnforceArabicBidi(
  input: EnforceArabicBidiInput
): Promise<StandardResultEnvelope<BidiEnforcementResult>> {
  try {
    const validated = enforceArabicBidiSchema.parse(input);
    const resolvedPath = resolveWorkspacePath(validated.document_path);

    Logger.info(`Enforcing Arabic BiDi and OpenXML typography on '${resolvedPath}'`);

    const surgeon = new BidiOpenXmlSurgeon();
    const result = await surgeon.enforceBidiAndTypography(resolvedPath, {
      fixHeadingsAlignment: validated.fix_headings_alignment,
      justifyBodyParagraphs: validated.justify_body_paragraphs,
      preventVerseSplitting: validated.prevent_verse_splitting,
      injectDynamicPageNumbering: validated.inject_dynamic_page_numbering,
      isolateEnglishSections: validated.isolate_english_sections,
    });

    return createSuccessEnvelope(
      `Enforced Arabic BiDi alignment & typography: ${result.headingsFixed} headings fixed, ${result.bodyParagraphsJustified} paragraphs justified, ${result.versesProtected} verses protected`,
      result,
      [{ label: 'Repaired Arabic Document', uri: `file:///${result.documentPath.replace(/\\/g, '/')}` }],
      [`Use 'audit_and_render_document_pages' to visually inspect rendered pages in 'Pages/' folder.`]
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to enforce Arabic BiDi: ${msg}`);
    return createErrorEnvelope(`Error enforcing Arabic BiDi: ${msg}`) as StandardResultEnvelope<BidiEnforcementResult>;
  }
}
