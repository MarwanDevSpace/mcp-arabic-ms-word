export interface DocumentInspectionResult {
    filePath: string;
    metadata: {
        title?: string;
        creator?: string;
        lastModifiedBy?: string;
        created?: string;
        modified?: string;
    };
    structuralSummary: {
        paragraphCount: number;
        headingCount: number;
        tableCount: number;
        imageCount: number;
        isRtlDocument: boolean;
    };
    headings: Array<{
        level: string;
        text: string;
    }>;
    tables: Array<{
        rowCount: number;
        columnCount: number;
        isRtl: boolean;
    }>;
    detectedFonts: string[];
    sampleText: string;
}
export declare class ArabicXmlEngine {
    private parser;
    private builder;
    constructor();
    inspectDocx(filePath: string): Promise<DocumentInspectionResult>;
    convertToMarkdown(filePath: string): Promise<string>;
    replaceTextInXml(filePath: string, targetText: string, replacementText: string, outputPath?: string): Promise<string>;
}
//# sourceMappingURL=xml_engine.d.ts.map