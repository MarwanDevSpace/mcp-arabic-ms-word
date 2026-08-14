export interface PageAuditOptions {
    outputFolderName?: string;
    dpi?: number;
    detectLayoutDefects?: boolean;
}
export interface RenderedPageInfo {
    pageNumber: number;
    imagePath: string;
    uri: string;
    status: 'rendered' | 'inspected';
}
export interface DocumentPageAuditResult {
    documentPath: string;
    pdfPath?: string;
    pagesDirectory: string;
    pageCount: number;
    renderedPages: RenderedPageInfo[];
    diagnostics: {
        orphanHeadingsDetected: number;
        splitVersesDetected: number;
        trailingBlankLines: number;
        layoutIntegrityScore: number;
        recommendations: string[];
    };
}
export declare class DocumentPageRenderer {
    /**
     * Converts a Word document to PDF, renders pages as high-resolution PNGs in Pages/ folder,
     * and runs automated layout defect diagnostics.
     */
    auditAndRenderPages(docxPath: string, options?: PageAuditOptions): Promise<DocumentPageAuditResult>;
    private renderViaWindowsWordAndPdf;
    private estimatePageCountFromXml;
    private generatePageCardPlaceholder;
    private analyzeLayoutDefects;
}
//# sourceMappingURL=page_renderer.d.ts.map