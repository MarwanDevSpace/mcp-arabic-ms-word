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

export const ARABIC_FONTS = {
  AMIRI: 'Amiri',
  TRADITIONAL_ARABIC: 'Traditional Arabic',
  SIMPLIFIED_ARABIC: 'Simplified Arabic',
  SAKKAL_MAJALLA: 'Sakkal Majalla',
  CAIRO: 'Cairo',
  ALEXANDRIA: 'Alexandria',
  TIMES_NEW_ROMAN: 'Times New Roman',
  CALIBRI: 'Calibri',
  ARIAL: 'Arial',
};

export const DEFAULT_ARABIC_TYPOGRAPHY: Required<TypographyOptions> = {
  fontFamily: ARABIC_FONTS.AMIRI,
  fontSizePt: 14,
  direction: 'rtl',
  alignment: 'right',
  lineSpacingMultiplier: 1.25,
  spaceBeforePt: 0,
  spaceAfterPt: 6,
  colorHex: '000000',
  bold: false,
  italic: false,
  underline: false,
};

/**
 * Converts Western Arabic digits (0-9) to Eastern Arabic / Indic digits (٠-٩) if required.
 */
export function toEasternArabicDigits(text: string): string {
  const easternDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return text.replace(/[0-9]/g, (w) => easternDigits[parseInt(w, 10)]);
}

/**
 * Converts Points to Word Dxa (1 pt = 20 dxa).
 */
export function ptToDxa(pt: number): number {
  return Math.round(pt * 20);
}

/**
 * Converts Centimeters to Word Dxa (1 cm = 567 dxa).
 */
export function cmToDxa(cm: number): number {
  return Math.round(cm * 567);
}

/**
 * Converts Half-Points for docx font sizes (1 pt = 2 half-pts).
 */
export function ptToHalfPt(pt: number): number {
  return Math.round(pt * 2);
}
