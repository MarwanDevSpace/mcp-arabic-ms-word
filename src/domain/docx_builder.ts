import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  HeadingLevel,
  Header,
  Footer,
  PageNumber,
  Packer,
  WidthType,
  BorderStyle,
  ImageRun,
  ShadingType,
  PageOrientation,
} from 'docx';
import fs from 'node:fs';
import path from 'node:path';
import {
  TypographyOptions,
  DEFAULT_ARABIC_TYPOGRAPHY,
  cmToDxa,
  ptToDxa,
  ptToHalfPt,
} from './arabic_typography.js';
import { FileOperationError } from '../core/errors.js';

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

export class ArabicDocxBuilder {
  private children: Array<Paragraph | Table> = [];
  private headers: Header[] = [];
  private footers: Footer[] = [];
  private options: CreateDocumentOptions;

  constructor(options: CreateDocumentOptions = {}) {
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

  private mapAlignment(align?: string): (typeof AlignmentType)[keyof typeof AlignmentType] {
    switch (align) {
      case 'left':
        return AlignmentType.LEFT;
      case 'center':
        return AlignmentType.CENTER;
      case 'justify':
        return AlignmentType.BOTH;
      case 'kashida':
        return AlignmentType.DISTRIBUTE;
      case 'right':
      default:
        return AlignmentType.RIGHT;
    }
  }

  public addParagraph(text: string, options: TypographyOptions = {}): this {
    const opts = { ...DEFAULT_ARABIC_TYPOGRAPHY, font: this.options.defaultFont, ...options };
    const font = opts.fontFamily || this.options.defaultFont || 'Amiri';
    const isRtl = opts.direction === 'rtl';

    const p = new Paragraph({
      alignment: this.mapAlignment(opts.alignment),
      bidirectional: isRtl,
      spacing: {
        before: ptToDxa(opts.spaceBeforePt ?? 0),
        after: ptToDxa(opts.spaceAfterPt ?? 6),
        line: Math.round((opts.lineSpacingMultiplier ?? 1.25) * 240),
      },
      children: [
        new TextRun({
          text,
          font: {
            name: font,
            hint: isRtl ? 'cs' : 'eastAsia',
          },
          size: ptToHalfPt(opts.fontSizePt ?? 14),
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

  public addHeading(text: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 1, options: TypographyOptions = {}): this {
    const headingLevels: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
      1: HeadingLevel.HEADING_1,
      2: HeadingLevel.HEADING_2,
      3: HeadingLevel.HEADING_3,
      4: HeadingLevel.HEADING_4,
      5: HeadingLevel.HEADING_5,
      6: HeadingLevel.HEADING_6,
    };

    const font = options.fontFamily || this.options.defaultFont || 'Amiri';
    const defaultSizes: Record<number, number> = { 1: 22, 2: 18, 3: 16, 4: 14, 5: 13, 6: 12 };
    const fontSize = options.fontSizePt ?? defaultSizes[level] ?? 16;
    const isRtl = (options.direction ?? 'rtl') === 'rtl';

    const p = new Paragraph({
      heading: headingLevels[level],
      alignment: this.mapAlignment(options.alignment ?? 'right'),
      bidirectional: isRtl,
      spacing: {
        before: ptToDxa(options.spaceBeforePt ?? 12),
        after: ptToDxa(options.spaceAfterPt ?? 6),
      },
      children: [
        new TextRun({
          text,
          font: { name: font },
          size: ptToHalfPt(fontSize),
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

  public addTable(columns: TableColumnDef[], rows: TableRowData[], isRtl: boolean = true): this {
    const headerRow = new TableRow({
      tableHeader: true,
      children: columns.map(
        (col) =>
          new TableCell({
            width: col.widthPercent ? { size: col.widthPercent, type: WidthType.PERCENTAGE } : undefined,
            shading: { fill: '1F4E78', type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                bidirectional: isRtl,
                children: [
                  new TextRun({
                    text: col.header,
                    font: { name: this.options.defaultFont || 'Amiri' },
                    bold: true,
                    color: 'FFFFFF',
                    size: ptToHalfPt(13),
                    rightToLeft: isRtl,
                  }),
                ],
              }),
            ],
          })
      ),
    });

    const dataRows = rows.map(
      (rowData, rIdx) =>
        new TableRow({
          children: rowData.cells.map(
            (cellText) =>
              new TableCell({
                shading: {
                  fill: rowData.backgroundColor || (rIdx % 2 === 0 ? 'F9FAFB' : 'FFFFFF'),
                  type: ShadingType.CLEAR,
                },
                children: [
                  new Paragraph({
                    alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
                    bidirectional: isRtl,
                    children: [
                      new TextRun({
                        text: cellText,
                        font: { name: this.options.defaultFont || 'Amiri' },
                        size: ptToHalfPt(12),
                        color: '333333',
                        rightToLeft: isRtl,
                      }),
                    ],
                  }),
                ],
              })
          ),
        })
    );

    const table = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      visuallyRightToLeft: isRtl,
      borders: {
        top: { style: BorderStyle.SINGLE, size: 4, color: 'D3D3D3' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D3D3D3' },
        left: { style: BorderStyle.SINGLE, size: 4, color: 'D3D3D3' },
        right: { style: BorderStyle.SINGLE, size: 4, color: 'D3D3D3' },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB' },
        insideVertical: { style: BorderStyle.SINGLE, size: 2, color: 'E5E7EB' },
      },
      rows: [headerRow, ...dataRows],
    });

    this.children.push(table);
    return this;
  }

  public addHeader(headerText: string, isRtl: boolean = true): this {
    this.headers = [
      new Header({
        children: [
          new Paragraph({
            alignment: isRtl ? AlignmentType.RIGHT : AlignmentType.LEFT,
            bidirectional: isRtl,
            children: [
              new TextRun({
                text: headerText,
                font: { name: this.options.defaultFont || 'Amiri' },
                size: ptToHalfPt(10),
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

  public addFooter(footerText: string, includePageNumber: boolean = true, isRtl: boolean = true): this {
    const childrenElements: TextRun[] = [
      new TextRun({
        text: footerText ? `${footerText} | ` : '',
        font: { name: this.options.defaultFont || 'Amiri' },
        size: ptToHalfPt(10),
        color: '777777',
        rightToLeft: isRtl,
      }),
    ];

    if (includePageNumber) {
      childrenElements.push(
        new TextRun({
          text: 'صفحة ',
          font: { name: this.options.defaultFont || 'Amiri' },
          size: ptToHalfPt(10),
          color: '777777',
          rightToLeft: isRtl,
        }),
        new TextRun({
          children: [PageNumber.CURRENT],
          font: { name: this.options.defaultFont || 'Amiri' },
          size: ptToHalfPt(10),
          color: '777777',
        }),
        new TextRun({
          text: ' من ',
          font: { name: this.options.defaultFont || 'Amiri' },
          size: ptToHalfPt(10),
          color: '777777',
          rightToLeft: isRtl,
        }),
        new TextRun({
          children: [PageNumber.TOTAL_PAGES],
          font: { name: this.options.defaultFont || 'Amiri' },
          size: ptToHalfPt(10),
          color: '777777',
        })
      );
    }

    this.footers = [
      new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            bidirectional: isRtl,
            children: childrenElements,
          }),
        ],
      }),
    ];
    return this;
  }

  public addImage(imagePath: string, widthPx: number = 300, heightPx: number = 200, align: 'right' | 'center' | 'left' = 'center'): this {
    if (!fs.existsSync(imagePath)) {
      throw new FileOperationError(`Image file not found: '${imagePath}'`);
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const type = ext === '.png' ? 'png' : ext === '.gif' ? 'gif' : 'jpg';

    const p = new Paragraph({
      alignment: this.mapAlignment(align),
      children: [
        new ImageRun({
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

  public async saveToFile(outputPath: string): Promise<string> {
    const isLandscape = this.options.orientation === 'landscape';

    const doc = new Document({
      title: this.options.title,
      creator: this.options.author || 'MarwanDevMCP Arabic Word Engine',
      description: this.options.subject,
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: cmToDxa(this.options.marginTopCm ?? 2.54),
                bottom: cmToDxa(this.options.marginBottomCm ?? 2.54),
                left: cmToDxa(this.options.marginLeftCm ?? 2.54),
                right: cmToDxa(this.options.marginRightCm ?? 2.54),
              },
              size: {
                orientation: isLandscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
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

    const buffer = await Packer.toBuffer(doc);
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outputPath, buffer);
    return outputPath;
  }
}
