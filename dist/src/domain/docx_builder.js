"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArabicDocxBuilder = void 0;
const docx_1 = require("docx");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const arabic_typography_js_1 = require("./arabic_typography.js");
const errors_js_1 = require("../core/errors.js");
class ArabicDocxBuilder {
    children = [];
    headers = [];
    footers = [];
    options;
    constructor(options = {}) {
        this.options = {
            pageSize: 'A4',
            orientation: 'portrait',
            marginTopCm: 2.54,
            marginBottomCm: 2.54,
            marginLeftCm: 2.54,
            marginRightCm: 2.54,
            defaultFont: 'Amiri',
            ...options,
        };
    }
    mapAlignment(align) {
        switch (align) {
            case 'left':
                return docx_1.AlignmentType.LEFT;
            case 'center':
                return docx_1.AlignmentType.CENTER;
            case 'justify':
                return docx_1.AlignmentType.BOTH;
            case 'kashida':
                return docx_1.AlignmentType.DISTRIBUTE;
            case 'right':
            default:
                return docx_1.AlignmentType.RIGHT;
        }
    }
    addParagraph(text, options = {}) {
        const opts = { ...arabic_typography_js_1.DEFAULT_ARABIC_TYPOGRAPHY, font: this.options.defaultFont, ...options };
        const font = opts.fontFamily || this.options.defaultFont || 'Amiri';
        const isRtl = opts.direction === 'rtl';
        const p = new docx_1.Paragraph({
            alignment: this.mapAlignment(opts.alignment),
            bidirectional: isRtl,
            spacing: {
                before: (0, arabic_typography_js_1.ptToDxa)(opts.spaceBeforePt ?? 0),
                after: (0, arabic_typography_js_1.ptToDxa)(opts.spaceAfterPt ?? 6),
                line: Math.round((opts.lineSpacingMultiplier ?? 1.25) * 240),
            },
            children: [
                new docx_1.TextRun({
                    text,
                    font: {
                        name: font,
                        hint: isRtl ? 'cs' : 'eastAsia',
                    },
                    size: (0, arabic_typography_js_1.ptToHalfPt)(opts.fontSizePt ?? 14),
                    color: opts.colorHex ? opts.colorHex.replace('#', '') : '000000',
                    bold: opts.bold,
                    italics: opts.italic,
                    underline: opts.underline ? {} : undefined,
                    rightToLeft: isRtl,
                }),
            ],
        });
        this.children.push(p);
        return this;
    }
    addHeading(text, level = 1, options = {}) {
        const headingLevels = {
            1: docx_1.HeadingLevel.HEADING_1,
            2: docx_1.HeadingLevel.HEADING_2,
            3: docx_1.HeadingLevel.HEADING_3,
            4: docx_1.HeadingLevel.HEADING_4,
            5: docx_1.HeadingLevel.HEADING_5,
            6: docx_1.HeadingLevel.HEADING_6,
        };
        const font = options.fontFamily || this.options.defaultFont || 'Amiri';
        const defaultSizes = { 1: 22, 2: 18, 3: 16, 4: 14, 5: 13, 6: 12 };
        const fontSize = options.fontSizePt ?? defaultSizes[level] ?? 16;
        const isRtl = (options.direction ?? 'rtl') === 'rtl';
        const p = new docx_1.Paragraph({
            heading: headingLevels[level],
            alignment: this.mapAlignment(options.alignment ?? 'right'),
            bidirectional: isRtl,
            spacing: {
                before: (0, arabic_typography_js_1.ptToDxa)(options.spaceBeforePt ?? 12),
                after: (0, arabic_typography_js_1.ptToDxa)(options.spaceAfterPt ?? 6),
            },
            children: [
                new docx_1.TextRun({
                    text,
                    font: { name: font },
                    size: (0, arabic_typography_js_1.ptToHalfPt)(fontSize),
                    color: options.colorHex ? options.colorHex.replace('#', '') : '1F4E78',
                    bold: options.bold ?? true,
                    italics: options.italic,
                    rightToLeft: isRtl,
                }),
            ],
        });
        this.children.push(p);
        return this;
    }
    addTable(columns, rows, isRtl = true) {
        const headerRow = new docx_1.TableRow({
            tableHeader: true,
            children: columns.map((col) => new docx_1.TableCell({
                width: col.widthPercent ? { size: col.widthPercent, type: docx_1.WidthType.PERCENTAGE } : undefined,
                shading: { fill: '1F4E78', type: docx_1.ShadingType.CLEAR },
                children: [
                    new docx_1.Paragraph({
                        alignment: docx_1.AlignmentType.CENTER,
                        bidirectional: isRtl,
                        children: [
                            new docx_1.TextRun({
                                text: col.header,
                                font: { name: this.options.defaultFont || 'Amiri' },
                                bold: true,
                                color: 'FFFFFF',
                                size: (0, arabic_typography_js_1.ptToHalfPt)(13),
                                rightToLeft: isRtl,
                            }),
                        ],
                    }),
                ],
            })),
        });
        const dataRows = rows.map((rowData, rIdx) => new docx_1.TableRow({
            children: rowData.cells.map((cellText) => new docx_1.TableCell({
                shading: {
                    fill: rowData.backgroundColor || (rIdx % 2 === 0 ? 'F9FAFB' : 'FFFFFF'),
                    type: docx_1.ShadingType.CLEAR,
                },
                children: [
                    new docx_1.Paragraph({
                        alignment: isRtl ? docx_1.AlignmentType.RIGHT : docx_1.AlignmentType.LEFT,
                        bidirectional: isRtl,
                        children: [
                            new docx_1.TextRun({
                                text: cellText,
                                font: { name: this.options.defaultFont || 'Amiri' },
                                size: (0, arabic_typography_js_1.ptToHalfPt)(12),
                                color: '333333',
                                rightToLeft: isRtl,
                            }),
                        ],
                    }),
                ],
            })),
        }));
        const table = new docx_1.Table({
            width: { size: 100, type: docx_1.WidthType.PERCENTAGE },
            visuallyRightToLeft: isRtl,
            borders: {
                top: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'D3D3D3' },
                bottom: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'D3D3D3' },
                left: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'D3D3D3' },
                right: { style: docx_1.BorderStyle.SINGLE, size: 4, color: 'D3D3D3' },
                insideHorizontal: { style: docx_1.BorderStyle.SINGLE, size: 2, color: 'E5E7EB' },
                insideVertical: { style: docx_1.BorderStyle.SINGLE, size: 2, color: 'E5E7EB' },
            },
            rows: [headerRow, ...dataRows],
        });
        this.children.push(table);
        return this;
    }
    addHeader(headerText, isRtl = true) {
        this.headers = [
            new docx_1.Header({
                children: [
                    new docx_1.Paragraph({
                        alignment: isRtl ? docx_1.AlignmentType.RIGHT : docx_1.AlignmentType.LEFT,
                        bidirectional: isRtl,
                        children: [
                            new docx_1.TextRun({
                                text: headerText,
                                font: { name: this.options.defaultFont || 'Amiri' },
                                size: (0, arabic_typography_js_1.ptToHalfPt)(10),
                                color: '777777',
                                rightToLeft: isRtl,
                            }),
                        ],
                    }),
                ],
            }),
        ];
        return this;
    }
    addFooter(footerText, includePageNumber = true, isRtl = true) {
        const childrenElements = [
            new docx_1.TextRun({
                text: footerText ? `${footerText} | ` : '',
                font: { name: this.options.defaultFont || 'Amiri' },
                size: (0, arabic_typography_js_1.ptToHalfPt)(10),
                color: '777777',
                rightToLeft: isRtl,
            }),
        ];
        if (includePageNumber) {
            childrenElements.push(new docx_1.TextRun({
                text: 'صفحة ',
                font: { name: this.options.defaultFont || 'Amiri' },
                size: (0, arabic_typography_js_1.ptToHalfPt)(10),
                color: '777777',
                rightToLeft: isRtl,
            }), new docx_1.TextRun({
                children: [docx_1.PageNumber.CURRENT],
                font: { name: this.options.defaultFont || 'Amiri' },
                size: (0, arabic_typography_js_1.ptToHalfPt)(10),
                color: '777777',
            }), new docx_1.TextRun({
                text: ' من ',
                font: { name: this.options.defaultFont || 'Amiri' },
                size: (0, arabic_typography_js_1.ptToHalfPt)(10),
                color: '777777',
                rightToLeft: isRtl,
            }), new docx_1.TextRun({
                children: [docx_1.PageNumber.TOTAL_PAGES],
                font: { name: this.options.defaultFont || 'Amiri' },
                size: (0, arabic_typography_js_1.ptToHalfPt)(10),
                color: '777777',
            }));
        }
        this.footers = [
            new docx_1.Footer({
                children: [
                    new docx_1.Paragraph({
                        alignment: docx_1.AlignmentType.CENTER,
                        bidirectional: isRtl,
                        children: childrenElements,
                    }),
                ],
            }),
        ];
        return this;
    }
    addImage(imagePath, widthPx = 300, heightPx = 200, align = 'center') {
        if (!node_fs_1.default.existsSync(imagePath)) {
            throw new errors_js_1.FileOperationError(`Image file not found: '${imagePath}'`);
        }
        const imageBuffer = node_fs_1.default.readFileSync(imagePath);
        const ext = node_path_1.default.extname(imagePath).toLowerCase();
        const type = ext === '.png' ? 'png' : ext === '.gif' ? 'gif' : 'jpg';
        const p = new docx_1.Paragraph({
            alignment: this.mapAlignment(align),
            children: [
                new docx_1.ImageRun({
                    data: imageBuffer,
                    type,
                    transformation: {
                        width: widthPx,
                        height: heightPx,
                    },
                }),
            ],
        });
        this.children.push(p);
        return this;
    }
    async saveToFile(outputPath) {
        const isLandscape = this.options.orientation === 'landscape';
        const doc = new docx_1.Document({
            title: this.options.title,
            creator: this.options.author || 'MarwanDevMCP Arabic Word Engine',
            description: this.options.subject,
            sections: [
                {
                    properties: {
                        page: {
                            margin: {
                                top: (0, arabic_typography_js_1.cmToDxa)(this.options.marginTopCm ?? 2.54),
                                bottom: (0, arabic_typography_js_1.cmToDxa)(this.options.marginBottomCm ?? 2.54),
                                left: (0, arabic_typography_js_1.cmToDxa)(this.options.marginLeftCm ?? 2.54),
                                right: (0, arabic_typography_js_1.cmToDxa)(this.options.marginRightCm ?? 2.54),
                            },
                            size: {
                                orientation: isLandscape ? docx_1.PageOrientation.LANDSCAPE : docx_1.PageOrientation.PORTRAIT,
                            },
                        },
                    },
                    headers: {
                        default: this.headers[0],
                    },
                    footers: {
                        default: this.footers[0],
                    },
                    children: this.children,
                },
            ],
        });
        const buffer = await docx_1.Packer.toBuffer(doc);
        const dir = node_path_1.default.dirname(outputPath);
        if (!node_fs_1.default.existsSync(dir)) {
            node_fs_1.default.mkdirSync(dir, { recursive: true });
        }
        node_fs_1.default.writeFileSync(outputPath, buffer);
        return outputPath;
    }
}
exports.ArabicDocxBuilder = ArabicDocxBuilder;
//# sourceMappingURL=docx_builder.js.map