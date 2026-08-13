export interface TypographyOptions {
    fontFamily?: string;
    fontSizePt?: number;
    direction?: 'rtl' | 'ltr';
    alignment?: 'right' | 'left' | 'center' | 'justify' | 'kashida';
    lineSpacingMultiplier?: number;
    spaceBeforePt?: number;
    spaceAfterPt?: number;
    colorHex?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
}
export declare const ARABIC_FONTS: {
    AMIRI: string;
    TRADITIONAL_ARABIC: string;
    SIMPLIFIED_ARABIC: string;
    SAKKAL_MAJALLA: string;
    CAIRO: string;
    ALEXANDRIA: string;
    TIMES_NEW_ROMAN: string;
    CALIBRI: string;
    ARIAL: string;
};
export declare const DEFAULT_ARABIC_TYPOGRAPHY: Required<TypographyOptions>;
/**
 * Converts Western Arabic digits (0-9) to Eastern Arabic / Indic digits (٠-٩) if required.
 */
export declare function toEasternArabicDigits(text: string): string;
/**
 * Converts Points to Word Dxa (1 pt = 20 dxa).
 */
export declare function ptToDxa(pt: number): number;
/**
 * Converts Centimeters to Word Dxa (1 cm = 567 dxa).
 */
export declare function cmToDxa(cm: number): number;
/**
 * Converts Half-Points for docx font sizes (1 pt = 2 half-pts).
 */
export declare function ptToHalfPt(pt: number): number;
//# sourceMappingURL=arabic_typography.d.ts.map