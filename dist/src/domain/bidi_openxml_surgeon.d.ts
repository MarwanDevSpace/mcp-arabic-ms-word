export interface BidiEnforcementOptions {
    fixHeadingsAlignment?: boolean;
    justifyBodyParagraphs?: boolean;
    preventVerseSplitting?: boolean;
    injectDynamicPageNumbering?: boolean;
    isolateEnglishSections?: boolean;
}
export interface BidiEnforcementResult {
    documentPath: string;
    headingsFixed: number;
    bodyParagraphsJustified: number;
    versesProtected: number;
    englishSectionsIsolated: number;
    pageNumbersInjected: boolean;
    totalParagraphsProcessed: number;
}
export declare class BidiOpenXmlSurgeon {
    /**
     * Performs deep OpenXML surgical repair on an Arabic DOCX file
     */
    enforceBidiAndTypography(filePath: string, options?: BidiEnforcementOptions, outputPath?: string): Promise<BidiEnforcementResult>;
    private setJc;
    private ensureRunRtl;
    private injectPageNumberingXml;
}
//# sourceMappingURL=bidi_openxml_surgeon.d.ts.map