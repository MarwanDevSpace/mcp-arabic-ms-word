"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrompts = getPrompts;
function getPrompts() {
    return [
        {
            name: 'generate-arabic-official-letter',
            description: 'Generates a formal Arabic official letter (خطاب رسمي) with proper RTL headers, recipient, salutation, body, and signature block.',
            arguments: [
                { name: 'recipient', description: 'Recipient name/title (e.g., السيد المدير العام / المحترم)', required: true },
                { name: 'subject', description: 'Letter subject (الموضوع)', required: true },
                { name: 'outputPath', description: 'Target .docx file path', required: true },
            ],
            getMessages: (args) => [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Please construct an official Arabic letter in Word format using 'mcp-arabic-ms-word' tools.
Target file: ${args.outputPath || 'arabic_official_letter.docx'}
Recipient: ${args.recipient || 'السيد المحترم'}
Subject: ${args.subject || 'موضوع الخطاب'}

Steps to execute:
1. Call 'create_word_document' with filePath: '${args.outputPath || 'arabic_official_letter.docx'}', title: '${args.subject}', defaultFont: 'Amiri'.
2. Call 'add_header_footer_to_document' to set top header and page footer.
3. Call 'add_heading_to_document' level 1 for the main letter title: "بسم الله الرحمن الرحيم".
4. Call 'add_paragraph_to_document' for date, recipient name, formal greeting ("السلام عليكم ورحمة الله وبركاته، وبعد:").
5. Call 'add_paragraph_to_document' for the body text with lineSpacingMultiplier: 1.25, alignment: 'justify'.
6. Call 'add_paragraph_to_document' for formal signoff ("وتفضلوا بقبول فائق الاحترام والتقدير،،") and sender signature block.`,
                    },
                },
            ],
        },
        {
            name: 'generate-arabic-report',
            description: 'Creates a multi-page structured Arabic executive/academic report with cover page, headings, data table, and styled conclusion.',
            arguments: [
                { name: 'reportTitle', description: 'Report title (عنوان التقرير)', required: true },
                { name: 'author', description: 'Author name (إعداد)', required: true },
                { name: 'outputPath', description: 'Target .docx file path', required: true },
            ],
            getMessages: (args) => [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Create a professional Arabic report using 'mcp-arabic-ms-word' tools.
Target file: ${args.outputPath || 'arabic_executive_report.docx'}
Title: ${args.reportTitle || 'تقرير إداري شامل'}
Author: ${args.author || 'إعداد الفريق الفني'}

Steps to execute:
1. Call 'create_word_document' with title: '${args.reportTitle}', author: '${args.author}', defaultFont: 'Traditional Arabic'.
2. Add Title Heading (H1) and Subtitle.
3. Add Section 1 (H2): "المقدمة والملخص التنفيذي" with styled paragraphs.
4. Add Section 2 (H2): "النتائج والمؤشرات الرئيسية" with an Arabic RTL table using 'add_table_to_document'.
5. Add Section 3 (H2): "التوصيات والخطوات القادمة" with bulleted/numbered paragraphs.
6. Configure headers & footers with page numbers using 'add_header_footer_to_document'.`,
                    },
                },
            ],
        },
        {
            name: 'audit-arabic-doc-typography',
            description: 'Audits an existing Word document for Arabic typography standards, RTL flags, font consistency, and margin setup.',
            arguments: [
                { name: 'filePath', description: 'Path to .docx file to audit', required: true },
            ],
            getMessages: (args) => [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Inspect and audit the document '${args.filePath}' using 'mcp-arabic-ms-word'.
Execute:
1. Call 'inspect_word_document' for structural summary and font detection.
2. Call 'convert_word_to_markdown' to review textual content flow.
3. Evaluate RTL compliance, heading hierarchy, and table orientation.
4. Output a summary report of findings and improvement recommendations.`,
                    },
                },
            ],
        },
    ];
}
//# sourceMappingURL=index.js.map