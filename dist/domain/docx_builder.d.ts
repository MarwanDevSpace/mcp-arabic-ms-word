import { TypographyOptions } from './arabic_typography.js';
export interface CreateDocumentOptions {
    title?: string;
    author?: string;
    subject?: string;
    pageSize?: 'A4' | 'Letter' | 'A3';
    orientation?: 'portrait' | 'landscape';
    marginTopCm?: number;
    marginBottomCm?: number;
    marginLeftCm?: number;
    marginRightCm?: number;
    defaultFont?: string;
}
export interface TableColumnDef {
    header: string;
    widthPercent?: number;
}
export interface TableRowData {
    cells: string[];
    backgroundColor?: string;
}
export declare class ArabicDocxBuilder {
    private children;
    private headers;
    private footers;
    private options;
    constructor(options?: CreateDocumentOptions);
    private mapAlignment;
    addParagraph(text: string, options?: TypographyOptions): this;
    addHeading(text: string, level?: 1 | 2 | 3 | 4 | 5 | 6, options?: TypographyOptions): this;
    addTable(columns: TableColumnDef[], rows: TableRowData[], isRtl?: boolean): this;
    addHeader(headerText: string, isRtl?: boolean): this;
    addFooter(footerText: string, includePageNumber?: boolean, isRtl?: boolean): this;
    addImage(imagePath: string, widthPx?: number, heightPx?: number, align?: 'right' | 'center' | 'left'): this;
    saveToFile(outputPath: string): Promise<string>;
}
//# sourceMappingURL=docx_builder.d.ts.map