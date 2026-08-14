import { z } from 'zod';
import { resolveWorkspacePath } from '../security/workspace.js';
import { DocumentPageRenderer, DocumentPageAuditResult } from '../domain/page_renderer.js';
import { createSuccessEnvelope, createErrorEnvelope, StandardResultEnvelope } from '../contracts/index.js';
import { Logger } from '../core/logger.js';

export const auditAndRenderPagesSchema = z.object({
  document_path: z.string().describe('Absolute or workspace path to the Word document (.docx)'),
  output_folder_name: z
    .string()
    .optional()
    .default('Pages')
    .describe('Name of the subfolder inside the workspace to store rendered page images (default: "Pages")'),
  dpi: z
    .number()
    .int()
    .optional()
    .default(150)
    .describe('Image rendering resolution in DPI (150 for fast visual audit, 300 for publication quality)'),
  detect_layout_defects: z
    .boolean()
    .optional()
    .default(true)
    .describe('Automatically inspect line counts and bounding boxes to flag orphan headings, split verses, and overflowing trailing lines'),
});

export type AuditAndRenderPagesInput = z.input<typeof auditAndRenderPagesSchema>;

export async function handleAuditAndRenderPages(
  input: AuditAndRenderPagesInput
): Promise<StandardResultEnvelope<DocumentPageAuditResult>> {
  try {
    const validated = auditAndRenderPagesSchema.parse(input);
    const resolvedPath = resolveWorkspacePath(validated.document_path);

    Logger.info(`Auditing and rendering pages for '${resolvedPath}'`);

    const renderer = new DocumentPageRenderer();
    const result = await renderer.auditAndRenderPages(resolvedPath, {
      outputFolderName: validated.output_folder_name,
      dpi: validated.dpi,
      detectLayoutDefects: validated.detect_layout_defects,
    });

    const artifacts = result.renderedPages.map((page) => ({
      label: `Page ${page.pageNumber}`,
      uri: page.uri,
    }));

    if (result.pdfPath) {
      artifacts.unshift({
        label: 'Generated PDF Document',
        uri: `file:///${result.pdfPath.replace(/\\/g, '/')}`,
      });
    }

    return createSuccessEnvelope(
      `Audited & rendered ${result.pageCount} page(s) into '${result.pagesDirectory}' (Integrity Score: ${result.diagnostics.layoutIntegrityScore}%)`,
      result,
      artifacts,
      result.diagnostics.recommendations
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    Logger.error(`Failed to audit and render pages: ${msg}`);
    return createErrorEnvelope(`Error auditing and rendering pages: ${msg}`) as StandardResultEnvelope<DocumentPageAuditResult>;
  }
}
