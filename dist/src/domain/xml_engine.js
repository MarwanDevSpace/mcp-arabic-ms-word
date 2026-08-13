"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArabicXmlEngine = void 0;
const jszip_1 = __importDefault(require("jszip"));
const fast_xml_parser_1 = require("fast-xml-parser");
const node_fs_1 = __importDefault(require("node:fs"));
const errors_js_1 = require("../core/errors.js");
class ArabicXmlEngine {
    parser;
    builder;
    constructor() {
        this.parser = new fast_xml_parser_1.XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            preserveOrder: false,
            parseAttributeValue: true,
        });
        this.builder = new fast_xml_parser_1.XMLBuilder({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            format: false,
        });
    }
    async inspectDocx(filePath) {
        if (!node_fs_1.default.existsSync(filePath)) {
            throw new errors_js_1.FileOperationError(`File not found: '${filePath}'`);
        }
        try {
            const fileBuffer = node_fs_1.default.readFileSync(filePath);
            const zip = await jszip_1.default.loadAsync(fileBuffer);
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
                throw new errors_js_1.FileOperationError(`Invalid docx: 'word/document.xml' missing`);
            }
            const docText = await docXml.async('text');
            const isRtlDocument = docText.includes('w:rtl') || docText.includes('w:bidi');
            // Extract fonts
            const fontMatches = docText.match(/w:name="([^"]+)"/g) || [];
            const fontSet = new Set();
            fontMatches.forEach((m) => {
                const match = /w:name="([^"]+)"/.exec(m);
                if (match && match[1])
                    fontSet.add(match[1]);
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
            const headings = [];
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
            const tables = [];
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
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            throw new errors_js_1.XmlManipulationError(`Failed to inspect DOCX file '${filePath}': ${msg}`);
        }
    }
    async convertToMarkdown(filePath) {
        if (!node_fs_1.default.existsSync(filePath)) {
            throw new errors_js_1.FileOperationError(`File not found: '${filePath}'`);
        }
        const fileBuffer = node_fs_1.default.readFileSync(filePath);
        const zip = await jszip_1.default.loadAsync(fileBuffer);
        const docXml = zip.file('word/document.xml');
        if (!docXml) {
            throw new errors_js_1.FileOperationError(`Invalid docx: missing 'word/document.xml'`);
        }
        const docText = await docXml.async('text');
        const pElements = docText.match(/<w:p\b[\s\S]*?<\/w:p>/g) || [];
        const lines = [];
        for (const p of pElements) {
            const pTexts = p.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
            const text = pTexts.map((t) => t.replace(/<[^>]+>/g, '')).join('').trim();
            if (!text)
                continue;
            if (p.includes('w:val="Heading1"') || p.includes('w:val="heading 1"')) {
                lines.push(`# ${text}`);
            }
            else if (p.includes('w:val="Heading2"') || p.includes('w:val="heading 2"')) {
                lines.push(`## ${text}`);
            }
            else if (p.includes('w:val="Heading3"') || p.includes('w:val="heading 3"')) {
                lines.push(`### ${text}`);
            }
            else {
                lines.push(text);
            }
        }
        return lines.join('\n\n');
    }
    async replaceTextInXml(filePath, targetText, replacementText, outputPath) {
        if (!node_fs_1.default.existsSync(filePath)) {
            throw new errors_js_1.FileOperationError(`File not found: '${filePath}'`);
        }
        const fileBuffer = node_fs_1.default.readFileSync(filePath);
        const zip = await jszip_1.default.loadAsync(fileBuffer);
        const docXml = zip.file('word/document.xml');
        if (!docXml) {
            throw new errors_js_1.FileOperationError(`Invalid docx: missing 'word/document.xml'`);
        }
        let docText = await docXml.async('text');
        if (!docText.includes(targetText)) {
            throw new errors_js_1.XmlManipulationError(`Target text '${targetText}' not found in document.xml`);
        }
        docText = docText.replaceAll(targetText, replacementText);
        zip.file('word/document.xml', docText);
        const outPath = outputPath || filePath;
        const newBuffer = await zip.generateAsync({ type: 'nodebuffer' });
        node_fs_1.default.writeFileSync(outPath, newBuffer);
        return outPath;
    }
    async decompressAndModifyXmlFile(filePath, targetXmlPath = 'word/document.xml', searchPattern, replacementValue, outputPath) {
        if (!node_fs_1.default.existsSync(filePath)) {
            throw new errors_js_1.FileOperationError(`File not found: '${filePath}'`);
        }
        const fileBuffer = node_fs_1.default.readFileSync(filePath);
        const zip = await jszip_1.default.loadAsync(fileBuffer);
        const targetFile = zip.file(targetXmlPath);
        if (!targetFile) {
            const availableFiles = Object.keys(zip.files).join(', ');
            throw new errors_js_1.XmlManipulationError(`File '${targetXmlPath}' not found in docx archive. Available files: ${availableFiles}`);
        }
        let xmlContent = await targetFile.async('text');
        const regex = new RegExp(searchPattern, 'g');
        const matches = xmlContent.match(regex);
        const matchCount = matches ? matches.length : 0;
        if (matchCount === 0) {
            throw new errors_js_1.XmlManipulationError(`Pattern '${searchPattern}' not found inside '${targetXmlPath}'`);
        }
        xmlContent = xmlContent.replace(regex, replacementValue);
        zip.file(targetXmlPath, xmlContent);
        const outPath = outputPath || filePath;
        const newBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
        node_fs_1.default.writeFileSync(outPath, newBuffer);
        return {
            outputPath: outPath,
            modifiedXmlPath: targetXmlPath,
            matchCount,
        };
    }
}
exports.ArabicXmlEngine = ArabicXmlEngine;
//# sourceMappingURL=xml_engine.js.map