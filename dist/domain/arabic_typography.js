"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ARABIC_TYPOGRAPHY = exports.ARABIC_FONTS = void 0;
exports.toEasternArabicDigits = toEasternArabicDigits;
exports.ptToDxa = ptToDxa;
exports.cmToDxa = cmToDxa;
exports.ptToHalfPt = ptToHalfPt;
exports.ARABIC_FONTS = {
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
exports.DEFAULT_ARABIC_TYPOGRAPHY = {
    fontFamily: exports.ARABIC_FONTS.AMIRI,
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
function toEasternArabicDigits(text) {
    const easternDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return text.replace(/[0-9]/g, (w) => easternDigits[parseInt(w, 10)]);
}
/**
 * Converts Points to Word Dxa (1 pt = 20 dxa).
 */
function ptToDxa(pt) {
    return Math.round(pt * 20);
}
/**
 * Converts Centimeters to Word Dxa (1 cm = 567 dxa).
 */
function cmToDxa(cm) {
    return Math.round(cm * 567);
}
/**
 * Converts Half-Points for docx font sizes (1 pt = 2 half-pts).
 */
function ptToHalfPt(pt) {
    return Math.round(pt * 2);
}
//# sourceMappingURL=arabic_typography.js.map