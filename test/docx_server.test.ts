import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { handleCreateDocument } from '../src/tools/create_document.js';
import { handleAddParagraph } from '../src/tools/add_paragraph.js';
import { handleAddHeading } from '../src/tools/add_heading.js';
import { handleAddTable } from '../src/tools/add_table.js';
import { handleInspectDocument } from '../src/tools/inspect_document.js';
import { handleConvertToMarkdown } from '../src/tools/convert_to_markdown.js';
import { handleResolveIntent } from '../src/tools/resolve_intent.js';
import { handleRepairText } from '../src/tools/repair_text.js';
import { handleDecompressXml } from '../src/tools/decompress_xml.js';
import { handleEnforceArabicBidi } from '../src/tools/enforce_arabic_bidi.js';
import { handleAuditAndRenderPages } from '../src/tools/audit_and_render_pages.js';

describe('mcp-arabic-ms-word Server Integration Tests', () => {
  const testDocPath = path.join(process.cwd(), 'test_output_arabic.docx');
  const autoDocPath = path.join(process.cwd(), 'test_auto_letter.docx');
  const testPagesDir = path.join(process.cwd(), 'Pages');

  after(() => {
    if (fs.existsSync(testDocPath)) fs.unlinkSync(testDocPath);
    if (fs.existsSync(autoDocPath)) fs.unlinkSync(autoDocPath);
    const autoPdf = path.join(process.cwd(), 'test_auto_letter.pdf');
    if (fs.existsSync(autoPdf)) fs.unlinkSync(autoPdf);
    if (fs.existsSync(testPagesDir)) fs.rmSync(testPagesDir, { recursive: true, force: true });
  });

  it('should create a new Arabic document with RTL setup', async () => {
    const res = await handleCreateDocument({
      filePath: testDocPath,
      title: 'تقرير اختبار اللغة العربية',
      defaultFont: 'Amiri',
      pageSize: 'A4',
    });

    assert.equal(res.status, 'success');
    assert.equal(fs.existsSync(testDocPath), true);
  });

  it('should append Arabic heading and paragraphs', async () => {
    const headingRes = await handleAddHeading({
      filePath: testDocPath,
      text: 'بسم الله الرحمن الرحيم',
      level: 1,
      alignment: 'center',
    });
    assert.equal(headingRes.status, 'success');

    const pRes = await handleAddParagraph({
      filePath: testDocPath,
      text: 'هذا النص تجريبي للاختبار والتحقق من التنسيق والاتجاه اليميني للمستند.',
      fontFamily: 'Amiri',
      fontSizePt: 14,
      direction: 'rtl',
      alignment: 'justify',
    });
    assert.equal(pRes.status, 'success');
  });

  it('should append an Arabic RTL table', async () => {
    const tableRes = await handleAddTable({
      filePath: testDocPath,
      columns: [
        { header: 'الرقم', widthPercent: 20 },
        { header: 'اسم المشروع', widthPercent: 50 },
        { header: 'الحالة', widthPercent: 30 },
      ],
      rows: [
        { cells: ['1', 'مشروع خادم MCP العربي', 'مكتمل'] },
        { cells: ['2', 'مكتبة WordprocessingML', 'قيد التنفيذ'] },
      ],
      isRtl: true,
    });

    assert.equal(tableRes.status, 'success');
  });

  it('should inspect created document and verify Arabic metadata & structure', async () => {
    const inspectRes = await handleInspectDocument({ filePath: testDocPath });
    assert.equal(inspectRes.status, 'success');
    assert.ok(inspectRes.data);
    assert.equal(inspectRes.data.structuralSummary.isRtlDocument, true);
    assert.ok(inspectRes.data.structuralSummary.paragraphCount >= 1);
  });

  it('should convert docx content into clean Markdown', async () => {
    const mdRes = await handleConvertToMarkdown({ filePath: testDocPath });
    assert.equal(mdRes.status, 'success');
    assert.ok(mdRes.data);
    assert.ok(mdRes.data.markdown.includes('بسم الله الرحمن الرحيم'));
  });

  it('should automatically resolve natural language intent and create a styled letter', async () => {
    const res = await handleResolveIntent({
      prompt: 'أنشئ لي خطاب رسمي موجه لوزارة التربية بشأن طلب توفير بيئة عمل ذكية',
      outputPath: autoDocPath,
      recipient: 'سعادة وزير التربية والتعليم المحترم',
    });

    assert.equal(res.status, 'success');
    assert.ok(res.data);
    assert.equal(res.data.archetype, 'official_letter');
    assert.equal(fs.existsSync(autoDocPath), true);
  });

  it('should enforce Arabic BiDi and OpenXML typography surgery without heading drift', async () => {
    const res = await handleEnforceArabicBidi({
      document_path: testDocPath,
      fix_headings_alignment: true,
      justify_body_paragraphs: true,
      prevent_verse_splitting: true,
      inject_dynamic_page_numbering: true,
      isolate_english_sections: true,
    });

    assert.equal(res.status, 'success');
    assert.ok(res.data);
    assert.equal(res.data.headingsFixed >= 1, true);
    assert.equal(res.data.pageNumbersInjected, true);
  });

  it('should audit and render document pages into dedicated Pages/ subfolder', async () => {
    const res = await handleAuditAndRenderPages({
      document_path: testDocPath,
      output_folder_name: 'Pages',
      dpi: 150,
      detect_layout_defects: true,
    });

    assert.equal(res.status, 'success');
    assert.ok(res.data);
    assert.ok(res.data.pageCount >= 1);
    assert.ok(res.data.renderedPages.length >= 1);
    assert.equal(fs.existsSync(res.data.pagesDirectory), true);
    assert.ok(res.data.diagnostics.layoutIntegrityScore > 80);
  });

  it('should repair Arabic text formatting and digits', async () => {
    const res = await handleRepairText({
      text: 'اختبار  النص   العربي (123) ـتـحـسينـ',
      standardizeDigits: 'eastern',
      removeKashida: true,
      trimExtraSpaces: true,
    });

    assert.equal(res.status, 'success');
    assert.ok(res.data);
    assert.ok(res.data.repairedText.includes('١٢٣'));
    assert.ok(!res.data.repairedText.includes('ـ'));
  });

  it('should decompress and modify WordprocessingML XML files in archive', async () => {
    const res = await handleDecompressXml({
      filePath: testDocPath,
      targetXmlPath: 'word/document.xml',
      searchPattern: 'بسم الله الرحمن الرحيم',
      replacementValue: 'بسم الله الرحمن الرحيم - معدل بالـ XML',
    });

    assert.equal(res.status, 'success');
    assert.ok(res.data);
    assert.ok(res.data.matchCount >= 1);
  });
});
