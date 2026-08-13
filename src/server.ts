import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { createDocumentSchema, handleCreateDocument } from './tools/create_document.js';
import { inspectDocumentSchema, handleInspectDocument } from './tools/inspect_document.js';
import { addParagraphSchema, handleAddParagraph } from './tools/add_paragraph.js';
import { addHeadingSchema, handleAddHeading } from './tools/add_heading.js';
import { addTableSchema, handleAddTable } from './tools/add_table.js';
import { addImageSchema, handleAddImage } from './tools/add_image.js';
import { addHeaderFooterSchema, handleAddHeaderFooter } from './tools/add_header_footer.js';
import { modifyXmlElementSchema, handleModifyXmlElement } from './tools/modify_xml_element.js';
import { injectTemplateSchema, handleInjectTemplate } from './tools/inject_template.js';
import { convertToMarkdownSchema, handleConvertToMarkdown } from './tools/convert_to_markdown.js';
import { resolveIntentSchema, handleResolveIntent } from './tools/resolve_intent.js';
import { repairTextSchema, handleRepairText } from './tools/repair_text.js';
import { decompressXmlSchema, handleDecompressXml } from './tools/decompress_xml.js';

import { getResources } from './resources/index.js';
import { getPrompts } from './prompts/index.js';
import { Logger } from './core/logger.js';

export function createWordMcpServer(): Server {
  const server = new Server(
    {
      name: 'mcp-arabic-ms-word',
      version: '1.1.3',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  // Define tools metadata with full Glama & MCP Protocol 2026 specifications
  const tools = [
    {
      name: 'create_word_document',
      title: 'Create Arabic MS Word Document',
      description:
        'Creates a new empty Microsoft Word (.docx) document with custom page setup, margins, metadata, and default Arabic typography (Amiri/Cairo font, RTL direction). Mutating file-creation tool. Overwrites target file at `filePath` if it already exists and creates parent directories if needed. Returns a structured result envelope with file URI. WHEN TO USE: Use at the start of a document generation workflow to establish page boundaries and defaults. WHEN NOT TO USE: Do not use to modify existing documents—use `add_paragraph_to_document`, `add_heading_to_document`, or `add_table_to_document` instead. ALTERNATIVES: `resolve_and_execute_document_intent` for single-shot automated generation.',
      annotations: {
        readOnly: false,
        destructive: true,
        idempotent: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Output .docx file path relative to workspace or absolute. Must end in .docx.' },
          title: { type: 'string', description: 'Document title metadata stored in core properties.' },
          author: { type: 'string', description: 'Document author metadata stored in core properties.' },
          subject: { type: 'string', description: 'Document subject/topic metadata.' },
          pageSize: { type: 'string', enum: ['A4', 'Letter', 'A3'], default: 'A4', description: 'Paper size standard. Controls page width and height dimensions.' },
          orientation: { type: 'string', enum: ['portrait', 'landscape'], default: 'portrait', description: 'Page layout orientation (portrait or landscape).' },
          defaultFont: { type: 'string', default: 'Amiri', description: 'Default Arabic font family applied to all normal text (e.g. Amiri, Cairo, Traditional Arabic).' },
          marginTopCm: { type: 'number', default: 2.54, description: 'Top page margin in centimeters (default 2.54 cm / 1 inch).' },
          marginBottomCm: { type: 'number', default: 2.54, description: 'Bottom page margin in centimeters (default 2.54 cm / 1 inch).' },
          marginLeftCm: { type: 'number', default: 2.54, description: 'Left page margin in centimeters (default 2.54 cm / 1 inch).' },
          marginRightCm: { type: 'number', default: 2.54, description: 'Right page margin in centimeters (default 2.54 cm / 1 inch).' },
        },
        required: ['filePath'],
      },
    },
    {
      name: 'inspect_word_document',
      title: 'Inspect Word Document Architecture',
      description:
        'Parses an existing .docx file and returns a comprehensive structural analysis (paragraph count, heading levels, table dimensions, detected font set, RTL direction flags, and core metadata). Read-only tool with zero side effects on the target file. Fails with an error if the file path is invalid or corrupted. Returns structured JSON inspection data. WHEN TO USE: Use before editing or modifying a document to inspect existing structure, font choices, or layout. WHEN NOT TO USE: Do not use to convert text into readable Markdown—use `convert_word_to_markdown` instead. ALTERNATIVES: `convert_word_to_markdown` for text extraction.',
      annotations: {
        readOnly: true,
        destructive: false,
        idempotent: true,
      },
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to existing .docx file to parse and inspect.' },
        },
        required: ['filePath'],
      },
    },
    {
      name: 'add_paragraph_to_document',
      title: 'Add Styled Paragraph to Document',
      description:
        'Appends a styled Arabic or English body paragraph to an existing Word document. Mutating tool that modifies `filePath` in-place. Requires an existing `.docx` document created via `create_word_document`. Supports font selection (Amiri, Cairo), pt size, hex colors (e.g. 000000), line spacing multiplier (1.25x), Kashida justification (`kashida` or `distribute`), and RTL flags. Returns a structured result envelope with updated paragraph count. WHEN TO USE: Use for adding standard body text, notes, or formatted paragraphs. WHEN NOT TO USE: Do not use for headings—use `add_heading_to_document` instead. Do not use for tabular data—use `add_table_to_document`. ALTERNATIVES: `add_heading_to_document` for section headers, `inject_template_data` for placeholder merging.',
      annotations: {
        readOnly: false,
        destructive: false,
        idempotent: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to target .docx file to modify in-place.' },
          text: { type: 'string', description: 'Paragraph text content string.' },
          fontFamily: { type: 'string', description: 'Font family name (e.g. Amiri, Cairo, Traditional Arabic).' },
          fontSizePt: { type: 'number', default: 14, description: 'Font size in points (default 14 pt).' },
          direction: { type: 'string', enum: ['rtl', 'ltr'], default: 'rtl', description: 'Text direction (rtl for Right-to-Left Arabic, ltr for English).' },
          alignment: { type: 'string', enum: ['right', 'left', 'center', 'justify', 'kashida'], default: 'right', description: 'Text alignment (right, left, center, justify, or kashida for Arabic justification).' },
          lineSpacingMultiplier: { type: 'number', default: 1.25, description: 'Line spacing height multiplier (default 1.25 for Arabic diacritics readability).' },
          spaceBeforePt: { type: 'number', default: 0, description: 'Spacing before paragraph in points.' },
          spaceAfterPt: { type: 'number', default: 6, description: 'Spacing after paragraph in points (default 6 pt).' },
          colorHex: { type: 'string', default: '000000', description: 'Six-character hex color code without leading # (default 000000).' },
          bold: { type: 'boolean', default: false, description: 'Set to true for bold text weight.' },
          italic: { type: 'boolean', default: false, description: 'Set to true for italic style.' },
          underline: { type: 'boolean', default: false, description: 'Set to true for underlined text.' },
        },
        required: ['filePath', 'text'],
      },
    },
    {
      name: 'add_heading_to_document',
      title: 'Add Heading to Document',
      description:
        'Appends a styled Heading (H1-H6) to an existing Word document. Mutating tool that modifies `filePath` in-place. Requires an existing `.docx` document. Configures heading level (1-6), font size, brand hex color (e.g. 1F4E78), alignment, and RTL direction. Returns a structured result envelope. WHEN TO USE: Use to create section titles, document headings, and subheadings. WHEN NOT TO USE: Do not use for regular body paragraphs—use `add_paragraph_to_document` instead. ALTERNATIVES: `add_paragraph_to_document` with bold styling.',
      annotations: {
        readOnly: false,
        destructive: false,
        idempotent: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to target .docx file to modify in-place.' },
          text: { type: 'string', description: 'Heading text content string.' },
          level: { type: 'number', minimum: 1, maximum: 6, default: 1, description: 'Heading structural level 1 to 6 (1 for main H1 title, 2 for section H2, etc.).' },
          fontFamily: { type: 'string', description: 'Font family name (e.g. Amiri, Cairo). Defaults to document default font if omitted.' },
          fontSizePt: { type: 'number', description: 'Font size in points (e.g. 22 for H1, 18 for H2). Calculated automatically if omitted.' },
          colorHex: { type: 'string', default: '1F4E78', description: 'Six-character hex color code without leading # (e.g. 1F4E78 for executive dark blue).' },
          alignment: { type: 'string', enum: ['right', 'left', 'center', 'justify'], default: 'right', description: 'Horizontal alignment (right, left, center, justify).' },
          direction: { type: 'string', enum: ['rtl', 'ltr'], default: 'rtl', description: 'Text direction flag (rtl for Right-to-Left Arabic, ltr for English).' },
        },
        required: ['filePath', 'text'],
      },
    },
    {
      name: 'add_table_to_document',
      title: 'Add RTL Table to Document',
      description:
        'Appends a structured table with Right-to-Left layout (`w:bidiVisual`), styled header row, custom cell background shading, and borders to an existing Word document. Mutating tool that modifies `filePath` in-place. Requires an existing `.docx` document. Accepts header definitions with width percentages and row cell data arrays. Returns a structured result envelope. WHEN TO USE: Use to present tabular data, financial figures, schedules, or key-value matrices in Arabic documents. WHEN NOT TO USE: Do not use for single-line text or headers—use `add_paragraph_to_document` or `add_heading_to_document`. ALTERNATIVES: `inject_template_data` for template-driven table rendering.',
      annotations: {
        readOnly: false,
        destructive: false,
        idempotent: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to target .docx file to modify in-place.' },
          columns: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                header: { type: 'string', description: 'Column header text label.' },
                widthPercent: { type: 'number', description: 'Column width percentage relative to table width.' },
              },
              required: ['header'],
            },
            description: 'Array of column definitions with header label and width percentage.',
          },
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                cells: { type: 'array', items: { type: 'string' }, description: 'Cell text values matching column count.' },
                backgroundColor: { type: 'string', description: 'Optional six-character hex color code for row background shading.' },
              },
              required: ['cells'],
            },
            description: 'Array of row objects containing cell values array and optional background color hex.',
          },
          isRtl: { type: 'boolean', default: true, description: 'Set to true to apply Right-to-Left visual column order (w:bidiVisual).' },
        },
        required: ['filePath', 'columns', 'rows'],
      },
    },
    {
      name: 'add_image_to_document',
      title: 'Add Image to Document',
      description:
        'Embeds a local PNG/JPEG image file into an existing Word document with specified display width (px), height (px), and alignment (right, center, left). Mutating tool that modifies `filePath` in-place. Requires both `filePath` (.docx) and `imagePath` (valid image file) to exist. Returns a structured result envelope. WHEN TO USE: Use to insert logos, figures, diagrams, signatures, or photos into a document. WHEN NOT TO USE: Do not use for vector drawing or raw XML shapes—use `modify_word_xml_element`. ALTERNATIVES: `add_paragraph_to_document` for text-only content.',
      annotations: {
        readOnly: false,
        destructive: false,
        idempotent: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to target .docx file to modify in-place.' },
          imagePath: { type: 'string', description: 'Absolute or workspace path to valid input image file (PNG, JPEG, GIF).' },
          widthPx: { type: 'number', default: 300, description: 'Display width in pixels inside document layout.' },
          heightPx: { type: 'number', default: 200, description: 'Display height in pixels inside document layout.' },
          align: { type: 'string', enum: ['right', 'center', 'left'], default: 'center', description: 'Horizontal image positioning relative to text margins (right, center, left).' },
        },
        required: ['filePath', 'imagePath'],
      },
    },
    {
      name: 'add_header_footer_to_document',
      title: 'Configure Header and Footer',
      description:
        'Configures document header and footer sections with custom text and Arabic page numbering (e.g., \'صفحة X من Y\'). Mutating tool that modifies `filePath` in-place. Overwrites existing headers/footers in the target document. Requires an existing `.docx` file. Supports RTL direction flags. Returns a structured result envelope. WHEN TO USE: Use to set up document-wide running headers, footers, confidentiality labels, or page numbers. WHEN NOT TO USE: Do not use to add body text or paragraphs—use `add_paragraph_to_document` instead. ALTERNATIVES: `modify_word_xml_element` for low-level header XML editing.',
      annotations: {
        readOnly: false,
        destructive: false,
        idempotent: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to target .docx file to configure in-place.' },
          headerText: { type: 'string', description: 'Text string to place in running document header.' },
          footerText: { type: 'string', description: 'Text string to place in running document footer.' },
          includePageNumbers: { type: 'boolean', default: true, description: 'If true, appends Arabic formatted page numbers (صفحة X من Y) to footer.' },
          isRtl: { type: 'boolean', default: true, description: 'Set to true for Right-to-Left layout in header and footer sections.' },
        },
        required: ['filePath'],
      },
    },
    {
      name: 'modify_word_xml_element',
      title: 'Modify WordprocessingML XML Element',
      description:
        'Performs direct string or tag replacement inside `word/document.xml` of a Word document for low-level custom modifications. Mutating tool that saves to `outputPath` if provided, or modifies `filePath` in-place. Disclosures: Incorrect or malformed XML injections can corrupt the `.docx` archive. Requires `filePath` to exist and contain `targetText`. Returns structured status and match count. WHEN TO USE: Use for precise low-level XML surgery, custom WordprocessingML tags, or replacing text fragments not reachable via high-level tools. WHEN NOT TO USE: Do not use for standard text additions—use `add_paragraph_to_document`. Do not use for multi-file XML archive surgery (styles, numbering)—use `decompress_and_modify_word_xml`. ALTERNATIVES: `decompress_and_modify_word_xml` for multi-file XML surgery, `inject_template_data` for template placeholders.',
      annotations: {
        readOnly: false,
        destructive: true,
        idempotent: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to target .docx file to inspect and modify.' },
          targetText: { type: 'string', description: 'Exact text string or XML snippet to search for inside word/document.xml.' },
          replacementText: { type: 'string', description: 'Replacement text string or WordprocessingML XML payload to inject.' },
          outputPath: { type: 'string', description: 'Optional output .docx file path. If omitted, filePath is modified in-place.' },
        },
        required: ['filePath', 'targetText', 'replacementText'],
      },
    },
    {
      name: 'decompress_and_modify_word_xml',
      title: 'Decompress & Modify WordprocessingML XML',
      description:
        'Decompresses `.docx` ZIP archive and performs regex/pattern replacements inside any inner XML file (`word/document.xml`, `word/styles.xml`, `word/numbering.xml`, `word/settings.xml`, `docProps/core.xml`). Mutating tool that saves to `outputPath` or overwrites `filePath` in-place. Disclosures: Modifying schema tags requires XML knowledge; invalid XML syntax will corrupt document rendering. Returns output path and match count. WHEN TO USE: Use for deep archive surgery, altering document styles, font definitions, numbering rules, or settings across any inner XML file. WHEN NOT TO USE: Do not use for basic text insertion—use `add_paragraph_to_document`. ALTERNATIVES: `modify_word_xml_element` for single `document.xml` text replacements.',
      annotations: {
        readOnly: false,
        destructive: true,
        idempotent: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to target .docx archive file.' },
          targetXmlPath: { type: 'string', default: 'word/document.xml', description: 'Path to inner XML file inside docx archive (e.g. word/document.xml, word/styles.xml, word/numbering.xml).' },
          searchPattern: { type: 'string', description: 'String or regex pattern to search for inside target XML file.' },
          replacementValue: { type: 'string', description: 'Replacement string or XML payload to inject.' },
          outputPath: { type: 'string', description: 'Optional output .docx path. If omitted, filePath is overwritten in-place.' },
        },
        required: ['filePath', 'searchPattern', 'replacementValue'],
      },
    },
    {
      name: 'repair_arabic_text_formatting',
      title: 'Repair Arabic Text Formatting & Punctuation',
      description:
        'Pure computational text engine that inspects Arabic text strings and fixes typography defects: normalizes Alef forms (أ, إ, آ -> ا), Dotless Yeh (ى -> ي), converts Western (0-9) or Eastern (٠-٩) digits, fixes inverted parentheses/brackets in RTL contexts, trims extra whitespace, and strips tatweel/kashida characters. Non-mutating in-memory tool with zero side effects on filesystem. Returns detailed transformation list and repaired text string. WHEN TO USE: Use before adding Arabic text to documents to ensure clean typography, correct digit formatting, and un-inverted brackets. WHEN NOT TO USE: Do not use to edit .docx files directly—pass the repaired text output to `add_paragraph_to_document` or `add_heading_to_document`. ALTERNATIVES: `add_paragraph_to_document` for direct document insertion.',
      annotations: {
        readOnly: true,
        destructive: false,
        idempotent: true,
      },
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Arabic text string to inspect and repair.' },
          normalizeAlef: { type: 'boolean', default: false, description: 'If true, normalizes Alef variants (أ, إ, آ -> ا).' },
          normalizeYeh: { type: 'boolean', default: false, description: 'If true, converts Dotless Yeh (ى -> ي).' },
          standardizeDigits: { type: 'string', enum: ['eastern', 'western', 'none'], default: 'none', description: 'Digit conversion mode: \'eastern\' (٠-٩), \'western\' (0-9), or \'none\'.' },
          fixInvertedPunctuation: { type: 'boolean', default: true, description: 'If true, fixes inverted parentheses, brackets, and punctuation spacing in RTL.' },
          trimExtraSpaces: { type: 'boolean', default: true, description: 'If true, removes redundant consecutive spaces and tab characters.' },
          removeKashida: { type: 'boolean', default: false, description: 'If true, strips tatweel/kashida characters (ـ).' },
        },
        required: ['text'],
      },
    },
    {
      name: 'inject_template_data',
      title: 'Inject Data into Docx Template',
      description:
        'Merges JSON key-value data object into a `.docx` template file containing placeholders (e.g. `{name}`, `{#items}`). Mutating tool that writes the generated document to `outputPath` (does NOT overwrite the input `templatePath`). Requires `templatePath` to exist and `outputPath` to be specified. Disclosures: Missing template tags are left unreplaced; invalid JSON payload causes merge failure. Returns a structured result envelope with output file URI. WHEN TO USE: Use for automated batch document generation, contract filling, invoice generation, or report generation from pre-designed `.docx` templates. WHEN NOT TO USE: Do not use to build documents from scratch—use `create_word_document` and content tools. ALTERNATIVES: `resolve_and_execute_document_intent` for AI-driven generation.',
      annotations: {
        readOnly: false,
        destructive: false,
        idempotent: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          templatePath: { type: 'string', description: 'Path to existing template .docx file containing placeholders.' },
          data: { type: 'object', description: 'JSON key-value object matching template tags (e.g. { name: \'علي\', items: [...] }).' },
          outputPath: { type: 'string', description: 'Path where generated output .docx file will be saved. Will overwrite if existing.' },
        },
        required: ['templatePath', 'data', 'outputPath'],
      },
    },
    {
      name: 'convert_word_to_markdown',
      title: 'Convert Docx to Markdown',
      description:
        'Extracts formatted headings (H1-H3) and body paragraph text from a `.docx` document and converts them into structured Markdown text. Read-only tool with zero side effects on target file. Fails if the file does not exist or is corrupted. Disclosures: Extracts plain text and heading hierarchy; images and complex table borders are omitted in Markdown representation. Returns structured envelope containing full Markdown string. WHEN TO USE: Use when reading, summarizing, or analyzing the textual contents of a Word document within an AI chat session. WHEN NOT TO USE: Do not use to inspect document metadata, table counts, or font sets—use `inspect_word_document` instead. ALTERNATIVES: `inspect_word_document` for structural metadata.',
      annotations: {
        readOnly: true,
        destructive: false,
        idempotent: true,
      },
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to target .docx file to read and convert.' },
        },
        required: ['filePath'],
      },
    },
    {
      name: 'resolve_and_execute_document_intent',
      title: 'Auto-Resolve Natural Language Intent & Build Document',
      description:
        'Single-shot automated document builder that parses high-level natural language prompts (e.g. \'أنشئ خطاب رسمي موجه لـ...\') and generates a complete, professionally formatted Arabic Word document. Mutating tool that creates or overwrites `outputPath` (or generates a timestamped filename). Returns document archetype, metadata, and output file URI. WHEN TO USE: Use when the user requests an entire document in natural language without specifying step-by-step formatting commands. WHEN NOT TO USE: Do not use for granular, step-by-step edits to an existing document—use specific tools like `add_paragraph_to_document` or `add_table_to_document`. ALTERNATIVES: `create_word_document` followed by manual content addition tools.',
      annotations: {
        readOnly: false,
        destructive: true,
        idempotent: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          prompt: { type: 'string', description: 'High-level natural language description of desired document.' },
          outputPath: { type: 'string', description: 'Optional output .docx file path. Generated automatically if omitted.' },
          recipient: { type: 'string', description: 'Optional recipient title or entity name for letters/memos.' },
          subject: { type: 'string', description: 'Optional document subject or title.' },
          author: { type: 'string', description: 'Optional author name for metadata.' },
          fontFamily: { type: 'string', description: 'Optional font family preference.' },
        },
        required: ['prompt'],
      },
    },
  ];

  // Tool Handlers
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    Logger.info(`Tool called: '${name}'`);

    let result;
    switch (name) {
      case 'create_word_document':
        result = await handleCreateDocument(args as any);
        break;
      case 'inspect_word_document':
        result = await handleInspectDocument(args as any);
        break;
      case 'add_paragraph_to_document':
        result = await handleAddParagraph(args as any);
        break;
      case 'add_heading_to_document':
        result = await handleAddHeading(args as any);
        break;
      case 'add_table_to_document':
        result = await handleAddTable(args as any);
        break;
      case 'add_image_to_document':
        result = await handleAddImage(args as any);
        break;
      case 'add_header_footer_to_document':
        result = await handleAddHeaderFooter(args as any);
        break;
      case 'modify_word_xml_element':
        result = await handleModifyXmlElement(args as any);
        break;
      case 'inject_template_data':
        result = await handleInjectTemplate(args as any);
        break;
      case 'convert_word_to_markdown':
        result = await handleConvertToMarkdown(args as any);
        break;
      case 'resolve_and_execute_document_intent':
        result = await handleResolveIntent(args as any);
        break;
      case 'repair_arabic_text_formatting':
        result = await handleRepairText(args as any);
        break;
      case 'decompress_and_modify_word_xml':
        result = await handleDecompressXml(args as any);
        break;
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
      structuredContent: result as any,
    } as any;
  });

  // Resource Handlers
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: getResources(),
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    const resources = getResources();
    const resource = resources.find((r) => r.uri === uri);
    if (!resource) {
      throw new McpError(ErrorCode.InvalidRequest, `Resource not found: ${uri}`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: resource.mimeType,
          text: `Sample content for ${resource.name}`,
        },
      ],
    };
  });

  // Prompt Handlers
  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: getPrompts(),
  }));

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name } = request.params;
    const prompts = getPrompts();
    const prompt = prompts.find((p) => p.name === name);
    if (!prompt) {
      throw new McpError(ErrorCode.InvalidRequest, `Prompt not found: ${name}`);
    }

    return {
      description: prompt.description,
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Execute template prompt: ${prompt.name}`,
          },
        },
      ],
    };
  });

  return server;
}
