"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArabicTextRepairEngine = void 0;
class ArabicTextRepairEngine {
    static repairText(text, options = {}) {
        let current = text;
        const applied = [];
        const opts = {
            normalizeAlef: options.normalizeAlef ?? false,
            normalizeYeh: options.normalizeYeh ?? false,
            standardizeDigits: options.standardizeDigits ?? 'none',
            fixInvertedPunctuation: options.fixInvertedPunctuation ?? true,
            trimExtraSpaces: options.trimExtraSpaces ?? true,
            removeKashida: options.removeKashida ?? false,
        };
        // 1. Remove Kashida if requested
        if (opts.removeKashida && current.includes('ـ')) {
            current = current.replace(/ـ+/g, '');
            applied.push('Removed Kashida (tatweel) characters');
        }
        // 2. Normalize Alef (أ, إ, آ -> ا)
        if (opts.normalizeAlef) {
            const before = current;
            current = current.replace(/[أإآ]/g, 'ا');
            if (before !== current)
                applied.push('Normalized Alef forms (أ, إ, آ -> ا)');
        }
        // 3. Normalize Yeh (ى -> ي)
        if (opts.normalizeYeh) {
            const before = current;
            current = current.replace(/ى/g, 'ي');
            if (before !== current)
                applied.push('Normalized Dotless Yeh (ى -> ي)');
        }
        // 4. Standardize Digits
        if (opts.standardizeDigits === 'eastern') {
            const easternDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
            const before = current;
            current = current.replace(/[0-9]/g, (w) => easternDigits[parseInt(w, 10)]);
            if (before !== current)
                applied.push('Converted Western digits to Eastern Arabic (٠-٩)');
        }
        else if (opts.standardizeDigits === 'western') {
            const westernMap = {
                '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
                '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
            };
            const before = current;
            current = current.replace(/[٠-٩]/g, (w) => westernMap[w] || w);
            if (before !== current)
                applied.push('Converted Eastern digits to Western Arabic (0-9)');
        }
        // 5. Fix Inverted Punctuation in RTL contexts
        if (opts.fixInvertedPunctuation) {
            const before = current;
            // Fix standalone inverted brackets when misplaced at line boundaries
            current = current
                .replace(/([ا-ي])\s*\(/g, '$1 (')
                .replace(/\)\s*([ا-ي])/g, ') $1');
            if (before !== current)
                applied.push('Fixed RTL punctuation & parenthesis spacing');
        }
        // 6. Trim Extra Whitespaces
        if (opts.trimExtraSpaces) {
            const before = current;
            current = current.replace(/[ \t]+/g, ' ').replace(/\n\s+/g, '\n').trim();
            if (before !== current)
                applied.push('Trimmed redundant whitespace and tabs');
        }
        return {
            originalText: text,
            repairedText: current,
            transformationsApplied: applied,
        };
    }
}
exports.ArabicTextRepairEngine = ArabicTextRepairEngine;
//# sourceMappingURL=text_repair_engine.js.map