import JSZip from 'jszip';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import fs from 'node:fs';
import { FileOperationError, XmlManipulationError } from '../core/errors.js';

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
  headings: Array<{ level: string; text: string }>;
  tables: Array<{ rowCount: number; columnCount: number; isRtl: boolean }>;
  detectedFonts: string[];
  sampleText: string;
}

export class ArabicXmlEngine {
  private parser: XMLParser;
  private builder: XMLBuilder;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      preserveOrder: false,
      parseAttributeValue: true,
    });

    this.builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: false,
    });
  }

  public async inspectDocx(filePath: string): Promise<DocumentInspectionResult> {
    if (!fs.existsSync(filePath)) {
      throw new FileOperationError(`File not found: '${filePath}'`);
    }

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const zip = await JSZip.loadAsync(fileBuffer);

      // Read core metadata if exists
      const coreXml = zip.file('docProps/core.xml');
      let metadata = {};
      if (coreXml) {
        const coreText = await coreXml.async('text');
        const coreParsed = this.parser.parse(coreText);
        const prop = coreParsed['cp:coreProperties'] || {};
        metadata = {
          title: prop['dc:title'],
          creator: prop['dc:creator'],
          lastModifiedBy: prop['cp:lastModifiedBy'],
          created: prop['dcterms:created']?.['#text'] || prop['dcterms:created'],
          modified: prop['dcterms:modified']?.['#text'] || prop['dcterms:modified'],
        };
      }

      // Read document.xml
      const docXml = zip.file('word/document.xml');
      if (!docXml) {
        throw new FileOperationError(`Invalid docx: 'word/document.xml' missing`);
      }

      const docText = await docXml.async('text');
      const isRtlDocument = docText.includes('w:rtl') || docText.includes('w:bidi');

      // Extract fonts
      const fontMatches = docText.match(/w:name="([^"]+)"/g) || [];
      const fontSet = new Set<string>();
      fontMatches.forEach((m) => {
        const match = /w:name="([^"]+)"/.exec(m);
        if (match && match[1]) fontSet.add(match[1]);
      });

      // Count images in media folder
      const mediaFiles = Object.keys(zip.files).filter((f) => f.startsWith('word/media/'));

      // Count headings, paragraphs, tables
      const paragraphMatches = docText.match(/<w:p\b/g) || [];
      const tableMatches = docText.match(/<w:tbl\b/g) || [];

      // Extract text content cleanly
      const textMatches = docText.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
      const extractedTexts = textMatches.map((t) => t.replace(/<[^>]+>/g, '')).filter(Boolean);
      const sampleText = extractedTexts.slice(0, 10).join(' ');

      // Heading extraction
      const headings: Array<{ level: string; text: string }> = [];
      const pElements = docText.match(/<w:p\b[\s\S]*?<\/w:p>/g) || [];
      for (const p of pElements) {
        if (p.includes('w:val="Heading') || p.includes('w:val="heading')) {
          const levelMatch = /w:val="[Hh]eading\s*(\d)"/.exec(p);
          const level = levelMatch ? `H${levelMatch[1]}` : 'Heading';
          const pTexts = p.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
          const text = pTexts.map((t) => t.replace(/<[^>]+>/g, '')).join('');
          if (text.trim()) {
            headings.push({ level, text: text.trim() });
          }
        }
      }

      // Tables summary
      const tables: Array<{ rowCount: number; columnCount: number; isRtl: boolean }> = [];
      const tblElements = docText.match(/<w:tbl\b[\s\S]*?<\/w:tbl>/g) || [];
      for (const tbl of tblElements) {
        const trs = tbl.match(/<w:tr\b/g) || [];
        const firstTr = tbl.match(/<w:tr\b[\s\S]*?<\/w:tr>/);
        const tcs = firstTr ? firstTr[0].match(/<w:tc\b/g) || [] : [];
        const isTblRtl = tbl.includes('w:bidiVisual') || tbl.includes('w:rtl');
        tables.push({
          rowCount: trs.length,
          columnCount: tcs.length,
          isRtl: isTblRtl,
        });
      }

      return {
        filePath,
        metadata,
        structuralSummary: {
          paragraphCount: paragraphMatches.length,
          headingCount: headings.length,
          tableCount: tableMatches.length,
          imageCount: mediaFiles.length,
          isRtlDocument,
        },
        headings,
        tables,
        detectedFonts: Array.from(fontSet),
        sampleText,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new XmlManipulationError(`Failed to inspect DOCX file '${filePath}': ${msg}`);
    }
  }

  public async convertToMarkdown(filePath: string): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new FileOperationError(`File not found: '${filePath}'`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const zip = await JSZip.loadAsync(fileBuffer);
    const docXml = zip.file('word/document.xml');

    if (!docXml) {
      throw new FileOperationError(`Invalid docx: missing 'word/document.xml'`);
    }

    const docText = await docXml.async('text');
    const pElements = docText.match(/<w:p\b[\s\S]*?<\/w:p>/g) || [];

    const lines: string[] = [];
    for (const p of pElements) {
      const pTexts = p.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
      const text = pTexts.map((t) => t.replace(/<[^>]+>/g, '')).join('').trim();
      if (!text) continue;

      if (p.includes('w:val="Heading1"') || p.includes('w:val="heading 1"')) {
        lines.push(`# ${text}`);
      } else if (p.includes('w:val="Heading2"') || p.includes('w:val="heading 2"')) {
        lines.push(`## ${text}`);
      } else if (p.includes('w:val="Heading3"') || p.includes('w:val="heading 3"')) {
        lines.push(`### ${text}`);
      } else {
        lines.push(text);
      }
    }

    return lines.join('\n\n');
  }

  public async replaceTextInXml(
    filePath: string,
    targetText: string,
    replacementText: string,
    outputPath?: string
  ): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new FileOperationError(`File not found: '${filePath}'`);
    }

    const fileBuffer = fs.readFileSync(filePath);
    const zip = await JSZip.loadAsync(fileBuffer);
    const docXml = zip.file('word/document.xml');

    if (!docXml) {
      throw new FileOperationError(`Invalid docx: missing 'word/document.xml'`);
    }

    let docText = await docXml.async('text');
    if (!docText.includes(targetText)) {
      throw new XmlManipulationError(`Target text '${targetText}' not found in document.xml`);
    }

    docText = docText.replaceAll(targetText, replacementText);
    zip.file('word/document.xml', docText);

    const outPath = outputPath || filePath;
    const newBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    fs.writeFileSync(outPath, newBuffer);

    return outPath;
  }
}
