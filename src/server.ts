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
      version: '1.2.1',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  // Define tools metadata with full Glama 5.0/5.0 dimensions & MCP Protocol 2026 specifications
  const tools = [
    {
      name: 'create_word_document',
      title: 'Create Arabic MS Word Document',
      description:
        'Creates a new empty Microsoft Word (.docx) document on the filesystem with customized page dimensions, margins, document metadata, and default Arabic font and RTL settings. Mutating file-creation tool. Behavior & Side Effects: Creates the file at `filePath` (and creates parent directories automatically if they do not exist); silently overwrites existing file at `filePath` if already present; initializes document body with zero paragraphs. Parameter Relationships: `pageSize` (\'A4\', \'Letter\', \'A3\') sets physical page boundaries; `orientation` (\'portrait\'/\'landscape\') rotates layout; `defaultFont` (default: \'Amiri\') sets global typography style; margin parameters (`marginTopCm`, `marginBottomCm`, `marginLeftCm`, `marginRightCm`) accept centimeters (default 2.54 cm / 1 inch); metadata fields (`title`, `author`, `subject`) are written to `docProps/core.xml`. Returns a structured result envelope containing the created file URI and metadata. WHEN TO USE: Use as the required first step when building a new document from scratch to configure page size, margins, and Arabic typography foundation. WHEN NOT TO USE: Do not use to modify or append content to existing documents (use `add_paragraph_to_document`, `add_heading_to_document`, or `add_table_to_document`). Do not use if you want one-shot AI document generation (use `resolve_and_execute_document_intent`). ALTERNATIVES: `resolve_and_execute_document_intent` for single-step automated document creation, `inject_template_data` for pre-designed templates.',
      annotations: {
        readOnly: false,
        destructive: true,
        idempotent: false,
        openWorld: false,
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
      outputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'partial', 'blocked', 'failed'], description: 'Execution status' },
          summary: { type: 'string', description: 'Human-readable outcome description' },
          data: {
            type: 'object',
            properties: {
              filePath: { type: 'string', description: 'Absolute path to created .docx file' },
              title: { type: 'string', description: 'Document title metadata' },
              author: { type: 'string', description: 'Document author metadata' },
              pageSize: { type: 'string', description: 'Page paper size' },
              orientation: { type: 'string', description: 'Page orientation' },
              defaultFont: { type: 'string', description: 'Default typography font family' },
            },
            required: ['filePath'],
          },
          evidence: {
            type: 'object',
            properties: {
              artifacts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    label: { type: 'string' },
                    uri: { type: 'string' },
                  },
                  required: ['label', 'uri'],
                },
              },
            },
          },
          warnings: { type: 'array', items: { type: 'string' } },
        },
        required: ['status', 'summary', 'data'],
      },
    },
    {
      name: 'inspect_word_document',
      title: 'Inspect Word Document Architecture',
      description:
        'Parses an existing Microsoft Word (.docx) file archive and returns comprehensive structural inspection data (paragraph counts, heading hierarchy, table dimensions, embedded images, detected font families, RTL direction flags, and core metadata). Non-mutating read-only tool with zero side effects on the inspected file. Behavior & Error Handling: Opens the .docx ZIP package in read-only mode, inspects `word/document.xml`, `docProps/core.xml`, and media directories; fails with FileOperationError if file is missing or not a valid docx archive. Returns a structured result envelope with typed data containing structuralSummary, headings array, tables array, detectedFonts array, metadata object, and sampleText string. WHEN TO USE: Use before editing or auditing a document to understand its existing layout, font choices, heading structure, or RTL compliance. WHEN NOT TO USE: Do not use to extract plain readable Markdown text (use `convert_word_to_markdown` instead). Do not use to modify documents. ALTERNATIVES: `convert_word_to_markdown` for readable text conversion.',
      annotations: {
        readOnly: true,
        destructive: false,
        idempotent: true,
        openWorld: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to existing .docx file to parse and inspect.' },
        },
        required: ['filePath'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'partial', 'blocked', 'failed'] },
          summary: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
              metadata: { type: 'object' },
              structuralSummary: {
                type: 'object',
                properties: {
                  paragraphCount: { type: 'number' },
                  headingCount: { type: 'number' },
                  tableCount: { type: 'number' },
                  imageCount: { type: 'number' },
                  isRtlDocument: { type: 'boolean' },
                },
                required: ['paragraphCount', 'headingCount', 'tableCount', 'imageCount', 'isRtlDocument'],
              },
              headings: { type: 'array' },
              tables: { type: 'array' },
              detectedFonts: { type: 'array', items: { type: 'string' } },
              sampleText: { type: 'string' },
            },
            required: ['filePath', 'structuralSummary', 'detectedFonts'],
          },
        },
        required: ['status', 'summary', 'data'],
      },
    },
    {
      name: 'add_paragraph_to_document',
      title: 'Add Styled Paragraph to Document',
      description:
        'Appends a styled body paragraph with rich Arabic or English typography (font family, pt size, color, RTL bidi direction, Kashida justification, and line spacing) to an existing Microsoft Word (.docx) document. Mutating tool that modifies `filePath` in-place by appending a new paragraph element to the document body. Behavior & Prerequisites: Target document at `filePath` must already exist (create one first with `create_word_document`); fails with FileOperationError if file is missing; does not overwrite existing document content. Parameter Relationships: `fontFamily` (e.g. \'Amiri\', \'Cairo\', \'Traditional Arabic\') sets typeface; `fontSizePt` (default: 14pt) sets size in points; `direction` (\'rtl\'/\'ltr\') sets paragraph bidi flag; `alignment` (\'right\', \'left\', \'center\', \'justify\', \'kashida\') sets text alignment (\'kashida\' applies Arabic distributed justification); `lineSpacingMultiplier` (default: 1.25) optimizes line height for Arabic diacritics; `colorHex` (default: \'000000\') accepts 6-character hex color without \'#\'; `bold`, `italic`, `underline` toggle run styles. Returns a structured result envelope with updated paragraph count and file URI. WHEN TO USE: Use for adding standard body text, explanatory paragraphs, notes, quotes, or list items to an existing document. WHEN NOT TO USE: Do not use for headings or section titles (use `add_heading_to_document` instead). Do not use for tabular datasets (use `add_table_to_document`). ALTERNATIVES: `add_heading_to_document` for headings, `add_table_to_document` for tables.',
      annotations: {
        readOnly: false,
        destructive: false,
        idempotent: false,
        openWorld: false,
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
      outputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'partial', 'blocked', 'failed'] },
          summary: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
              text: { type: 'string' },
              fontFamily: { type: 'string' },
              fontSizePt: { type: 'number' },
              direction: { type: 'string' },
              alignment: { type: 'string' },
              paragraphCount: { type: 'number' },
            },
            required: ['filePath', 'paragraphCount'],
          },
        },
        required: ['status', 'summary', 'data'],
      },
    },
    {
      name: 'add_heading_to_document',
      title: 'Add Heading to Document',
      description:
        'Appends a styled Heading element (H1 to H6) to the end of an existing Microsoft Word (.docx) document. Mutating tool that modifies the target document in-place on the filesystem without overwriting existing content. Behavior & Prerequisites: Target document at `filePath` must already exist (create one first with `create_word_document`); appends heading to the document body; fails with FileOperationError if file is missing. Parameter Relationships: `level` (1-6) determines semantic heading hierarchy; `fontSizePt` defaults automatically based on level (H1=22pt, H2=18pt, H3=16pt, etc.) if omitted; `colorHex` accepts 6-character hex string without leading \'#\' (e.g. \'1F4E78\' for navy blue); `direction` (\'rtl\'/\'ltr\') controls text flow and bidi alignment. Returns a structured result envelope with file URI. WHEN TO USE: Use when adding document titles, section headers, or numbered chapter headings. WHEN NOT TO USE: Do not use for regular body text, bullet lists, or multiline content blocks (use `add_paragraph_to_document` instead). Do not use to start a new document from scratch (use `create_word_document` first). ALTERNATIVES: `add_paragraph_to_document` for body text, `resolve_and_execute_document_intent` for full automated document generation.',
      annotations: {
        readOnly: false,
        destructive: false,
        idempotent: false,
        openWorld: false,
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
      outputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'partial', 'blocked', 'failed'] },
          summary: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
              text: { type: 'string' },
              level: { type: 'number' },
              headingCount: { type: 'number' },
            },
            required: ['filePath', 'headingCount'],
          },
        },
        required: ['status', 'summary', 'data'],
      },
    },
    {
      name: 'add_table_to_document',
      title: 'Add RTL Table to Document',
      description:
        'Appends a structured data table with Right-to-Left visual column order (`w:bidiVisual`), styled header row, alternating cell background shading, and borders to an existing Microsoft Word (.docx) document. Mutating tool that modifies `filePath` in-place. Behavior & Prerequisites: Target document at `filePath` must already exist; appends the table after the last existing element in the document; fails with FileOperationError if file is missing. Parameter Relationships: `columns` is an array of objects specifying `header` text and `widthPercent` (summing to 100%); `rows` is an array of row objects with `cells` string arrays matching column count and optional `backgroundColor` hex for custom row highlights; `isRtl` (default: true) sets table flow from right to left so column 1 renders on the far right. Returns a structured result envelope with table row and column counts. WHEN TO USE: Use to present tabular records, financial tables, comparative matrices, agendas, or structured datasets in Arabic documents. WHEN NOT TO USE: Do not use for simple single-line text or headings (use `add_paragraph_to_document` or `add_heading_to_document`). ALTERNATIVES: `inject_template_data` for populating table rows dynamically from template loops ({#items}).',
      annotations: {
        readOnly: false,
        destructive: false,
        idempotent: false,
        openWorld: false,
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
      outputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'partial', 'blocked', 'failed'] },
          summary: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
              rowCount: { type: 'number' },
              columnCount: { type: 'number' },
              isRtl: { type: 'boolean' },
            },
            required: ['filePath', 'rowCount', 'columnCount'],
          },
        },
        required: ['status', 'summary', 'data'],
      },
    },
    {
      name: 'add_image_to_document',
      title: 'Add Image to Document',
      description:
        'Embeds a local raster image file (PNG, JPEG, GIF) into an existing Microsoft Word (.docx) document with custom dimensions and alignment. Mutating tool that modifies `filePath` in-place by appending an inline drawing run. Behavior & Prerequisites: Both `filePath` (.docx file) and `imagePath` (readable image file on disk) must exist; image data is converted into WordprocessingML media archive elements (`word/media/imageX.png`). Fails with FileOperationError if either path is not found. Parameter Relationships: `widthPx` and `heightPx` specify layout dimensions in pixels (default: 300x200 px); `align` (\'right\', \'center\', \'left\') positions the image container relative to paragraph margins. Returns a structured result envelope with embedded image confirmation. WHEN TO USE: Use for inserting institutional logos, stamps, signature scans, charts, or photo illustrations into documents. WHEN NOT TO USE: Do not use for text formatting or tables (use `add_paragraph_to_document` or `add_table_to_document`). Do not use for unsupported file formats like SVG or PDF. ALTERNATIVES: `add_paragraph_to_document` for textual content.',
      annotations: {
        readOnly: false,
        destructive: false,
        idempotent: false,
        openWorld: false,
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
      outputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'partial', 'blocked', 'failed'] },
          summary: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
              imagePath: { type: 'string' },
              widthPx: { type: 'number' },
              heightPx: { type: 'number' },
              align: { type: 'string' },
            },
            required: ['filePath', 'imagePath'],
          },
        },
        required: ['status', 'summary', 'data'],
      },
    },
    {
      name: 'add_header_footer_to_document',
      title: 'Configure Header and Footer',
      description:
        'Configures running header and footer sections on all pages of an existing Microsoft Word (.docx) document, with custom Arabic or English text and localized page numbering (\'صفحة X من Y\'). Mutating tool that modifies `filePath` in-place. Behavior & Side Effects: Overwrites any existing headers or footers in the target document section; requires `filePath` to already exist; fails with error if file is missing. Parameter Relationships: If `includePageNumbers` is true, footer automatically appends dynamic Arabic page fields (Current Page and Total Pages); `isRtl` sets Right-to-Left bidi text layout for both header and footer text runs. Returns a structured result envelope with updated document URI. WHEN TO USE: Use to apply organization letterheads, document classification labels (e.g. \'سري للغاية\'), document subject headers, or page number footers across pages. WHEN NOT TO USE: Do not use to insert body paragraphs or table content (use `add_paragraph_to_document` or `add_table_to_document`). ALTERNATIVES: `modify_word_xml_element` for raw XML header surgery.',
      annotations: {
        readOnly: false,
        destructive: false,
        idempotent: false,
        openWorld: false,
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
      outputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'partial', 'blocked', 'failed'] },
          summary: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
              headerText: { type: 'string' },
              footerText: { type: 'string' },
              includePageNumbers: { type: 'boolean' },
              isRtl: { type: 'boolean' },
            },
            required: ['filePath'],
          },
        },
        required: ['status', 'summary', 'data'],
      },
    },
    {
      name: 'modify_word_xml_element',
      title: 'Modify WordprocessingML XML Element',
      description:
        'Performs surgical string or WordprocessingML tag replacement inside `word/document.xml` of a Microsoft Word document for low-level customization. Mutating tool that modifies the input file in-place if `outputPath` is omitted, or writes to a new destination if `outputPath` is specified. Behavior & Side Effects: Directly modifies inner XML markup; requires target document to exist and contain `targetText`. Caution: injecting malformed or unclosed XML tags can corrupt the `.docx` archive. Parameter Relationships: `targetText` is matched verbatim across `word/document.xml`; `replacementText` can be plain text or valid XML tags (e.g. `<w:r>...</w:r>`). Returns a structured result envelope with output file URI and modified status. WHEN TO USE: Use for low-level XML patch operations, custom XML markup injection, or fixing text fragments not exposed by higher-level tools. WHEN NOT TO USE: Do not use for standard text additions (use `add_paragraph_to_document` or `add_heading_to_document`). Do not use for multi-file archive surgery across styles or numbering (use `decompress_and_modify_word_xml`). ALTERNATIVES: `add_paragraph_to_document` for regular text, `decompress_and_modify_word_xml` for multi-file XML surgery, `inject_template_data` for template placeholders.',
      annotations: {
        readOnly: false,
        destructive: true,
        idempotent: false,
        openWorld: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to target .docx file to inspect and modify in-place.' },
          targetText: { type: 'string', description: 'Exact text string or XML snippet to search for inside word/document.xml.' },
          replacementText: { type: 'string', description: 'Replacement text string or WordprocessingML XML payload to inject.' },
          outputPath: { type: 'string', description: 'Optional output .docx file path. If omitted, filePath is modified in-place.' },
        },
        required: ['filePath', 'targetText', 'replacementText'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'partial', 'blocked', 'failed'] },
          summary: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              inputPath: { type: 'string' },
              outputPath: { type: 'string' },
              targetText: { type: 'string' },
            },
            required: ['inputPath', 'outputPath', 'targetText'],
          },
        },
        required: ['status', 'summary', 'data'],
      },
    },
    {
      name: 'decompress_and_modify_word_xml',
      title: 'Decompress & Modify WordprocessingML XML',
      description:
        'Decompresses a Microsoft Word (.docx) ZIP archive in memory and applies regex or string pattern replacements across any inner XML file (`word/document.xml`, `word/styles.xml`, `word/numbering.xml`, `word/settings.xml`, `docProps/core.xml`), repacking the modified archive. Mutating tool that overwrites `filePath` in-place if `outputPath` is omitted, or saves to `outputPath` if provided. Behavior & Caution: Unpacks docx archive, searches for `searchPattern` within `targetXmlPath`, applies `replacementValue`, and recompresses with DEFLATE compression; fails with XmlManipulationError if target XML file or pattern is not found. Caution: injecting invalid XML syntax will corrupt document rendering. Parameter Relationships: `targetXmlPath` defaults to \'word/document.xml\' but can target any inner file; `searchPattern` is evaluated as a global regex; `replacementValue` is the replacement string. Returns structured result envelope with output file URI and matchCount. WHEN TO USE: Use for deep multi-file XML surgery, modifying style definitions in styles.xml, changing document-level bidi flags in settings.xml, or modifying numbering definitions. WHEN NOT TO USE: Do not use for basic text additions (use `add_paragraph_to_document`). ALTERNATIVES: `modify_word_xml_element` for simple document.xml replacements.',
      annotations: {
        readOnly: false,
        destructive: true,
        idempotent: false,
        openWorld: false,
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
      outputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'partial', 'blocked', 'failed'] },
          summary: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              outputPath: { type: 'string' },
              modifiedXmlPath: { type: 'string' },
              matchCount: { type: 'number' },
            },
            required: ['outputPath', 'modifiedXmlPath', 'matchCount'],
          },
        },
        required: ['status', 'summary', 'data'],
      },
    },
    {
      name: 'repair_arabic_text_formatting',
      title: 'Repair Arabic Text Formatting & Punctuation',
      description:
        'Pure in-memory text engine that inspects Arabic text strings and repairs common typography defects: normalizes Alef forms (أ, إ, آ -> ا), Dotless Yeh (ى -> ي), converts Western (0-9) or Eastern (٠-٩) digits, fixes inverted parentheses and punctuation marks in mixed RTL/LTR contexts, trims redundant whitespace, and strips tatweel/kashida characters. Non-mutating pure computational tool with zero filesystem side effects. Behavior & Parameters: Accepts raw text input and boolean transformation flags; `fixInvertedPunctuation` (default: true) corrects brackets flipped by RTL rendering; `standardizeDigits` (\'eastern\'/\'western\'/\'none\') unifies numeral format; `trimExtraSpaces` (default: true) removes duplicate blanks; `normalizeAlef` and `normalizeYeh` unify letter variants; `removeKashida` removes tatweel. Returns structured result envelope with repairedText string, originalText, and transformationsApplied array. WHEN TO USE: Use to sanitize and format Arabic text strings before inserting them into Word documents or databases. WHEN NOT TO USE: Do not use to edit .docx files directly on disk (use `add_paragraph_to_document` or `modify_word_xml_element` with the repaired text). ALTERNATIVES: `add_paragraph_to_document` for inserting text into documents.',
      annotations: {
        readOnly: true,
        destructive: false,
        idempotent: true,
        openWorld: false,
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
      outputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'partial', 'blocked', 'failed'] },
          summary: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              originalText: { type: 'string' },
              repairedText: { type: 'string' },
              transformationsApplied: { type: 'array', items: { type: 'string' } },
              digitFormat: { type: 'string' },
            },
            required: ['originalText', 'repairedText', 'transformationsApplied'],
          },
        },
        required: ['status', 'summary', 'data'],
      },
    },
    {
      name: 'inject_template_data',
      title: 'Inject Data into Docx Template',
      description:
        'Populates a pre-designed Microsoft Word (.docx) template file containing placeholder tags with JSON key-value data, writing the generated document to a new output path. Mutating tool that generates a new file at `outputPath` without modifying the source `templatePath`. Behavior & Side Effects: Reads `templatePath`, renders variables (`{key}`), conditionals (`{#condition}...{/}`), and loops (`{#items}...{/}`), and writes the result to `outputPath` (overwriting `outputPath` if it exists); leaves undefined tags blank; fails with error if `templatePath` is missing or has invalid docxtemplater syntax. Parameter Relationships: `templatePath` is the source .docx containing `{tags}`; `data` is a JSON object where keys match template tag names and array values populate table/list loops; `outputPath` is the destination file path. Returns a structured result envelope with output file URI and injected key count. WHEN TO USE: Use for automated document generation from standardized corporate or legal templates (e.g. contracts, invoices, certificates, form letters). WHEN NOT TO USE: Do not use to build documents from scratch without an existing template (use `create_word_document` or `resolve_and_execute_document_intent`). ALTERNATIVES: `resolve_and_execute_document_intent` for generative document creation without a template.',
      annotations: {
        readOnly: false,
        destructive: false,
        idempotent: false,
        openWorld: false,
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
      outputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'partial', 'blocked', 'failed'] },
          summary: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              templatePath: { type: 'string' },
              outputPath: { type: 'string' },
              injectedKeys: { type: 'array', items: { type: 'string' } },
            },
            required: ['templatePath', 'outputPath', 'injectedKeys'],
          },
        },
        required: ['status', 'summary', 'data'],
      },
    },
    {
      name: 'convert_word_to_markdown',
      title: 'Convert Docx to Markdown',
      description:
        'Extracts headings (H1-H3) and body paragraph text from an existing Microsoft Word (.docx) document and converts them into a clean, formatted Markdown string in memory. Non-mutating read-only tool with zero filesystem side effects (does not modify input file or create output files). Behavior & Scope: Unpacks `word/document.xml` in memory, translates heading runs to `#`, `##`, `###` and body runs to text blocks separated by double newlines; tables and images are omitted in the markdown string. Fails with FileOperationError if `filePath` is missing or not a valid docx archive. Returns structured result envelope with data.markdown string and character count. WHEN TO USE: Use when an AI assistant or human needs to read, summarize, query, or audit the text content of a Word document. WHEN NOT TO USE: Do not use when structural metadata, font names, image counts, or table dimensions are needed (use `inspect_word_document` instead). Do not use to modify documents. ALTERNATIVES: `inspect_word_document` for full structural inspection.',
      annotations: {
        readOnly: true,
        destructive: false,
        idempotent: true,
        openWorld: false,
      },
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string', description: 'Path to target .docx file to read and convert.' },
        },
        required: ['filePath'],
      },
      outputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'partial', 'blocked', 'failed'] },
          summary: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              filePath: { type: 'string' },
              markdown: { type: 'string' },
              characterCount: { type: 'number' },
            },
            required: ['filePath', 'markdown', 'characterCount'],
          },
        },
        required: ['status', 'summary', 'data'],
      },
    },
    {
      name: 'resolve_and_execute_document_intent',
      title: 'Auto-Resolve Natural Language Intent & Build Document',
      description:
        'Single-shot autonomous document generator that interprets high-level natural language requests (e.g. \'أنشئ خطاب رسمي موجه لوزارة التربية...\') and automatically resolves document archetype, typography hierarchy, headings, paragraphs, and tables, producing a complete styled Arabic Word document in a single execution. Mutating file-creation tool. Behavior & Side Effects: Analyzes prompt intent, creates a new `.docx` file at `outputPath` (or generates a timestamped filename if omitted), applies Arabic typography rules (Amiri font, RTL direction, line spacing 1.25x), and writes the file to disk. Returns structured result envelope with document archetype, metadata, and output file URI. WHEN TO USE: Use when the user requests an entire document in natural language without providing step-by-step formatting instructions. WHEN NOT TO USE: Do not use for granular single-element edits to existing documents (use `add_paragraph_to_document`, `add_table_to_document`, etc.). ALTERNATIVES: `create_word_document` followed by manual content addition tools.',
      annotations: {
        readOnly: false,
        destructive: true,
        idempotent: false,
        openWorld: false,
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
      outputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['success', 'partial', 'blocked', 'failed'] },
          summary: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              outputPath: { type: 'string' },
              archetype: { type: 'string' },
              title: { type: 'string' },
              recipient: { type: 'string' },
              author: { type: 'string' },
              subject: { type: 'string' },
            },
            required: ['outputPath', 'archetype', 'title'],
          },
        },
        required: ['status', 'summary', 'data'],
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
