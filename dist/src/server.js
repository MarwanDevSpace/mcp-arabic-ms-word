"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWordMcpServer = createWordMcpServer;
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const create_document_js_1 = require("./tools/create_document.js");
const inspect_document_js_1 = require("./tools/inspect_document.js");
const add_paragraph_js_1 = require("./tools/add_paragraph.js");
const add_heading_js_1 = require("./tools/add_heading.js");
const add_table_js_1 = require("./tools/add_table.js");
const add_image_js_1 = require("./tools/add_image.js");
const add_header_footer_js_1 = require("./tools/add_header_footer.js");
const modify_xml_element_js_1 = require("./tools/modify_xml_element.js");
const inject_template_js_1 = require("./tools/inject_template.js");
const convert_to_markdown_js_1 = require("./tools/convert_to_markdown.js");
const resolve_intent_js_1 = require("./tools/resolve_intent.js");
const index_js_2 = require("./resources/index.js");
const index_js_3 = require("./prompts/index.js");
const logger_js_1 = require("./core/logger.js");
function createWordMcpServer() {
    const server = new index_js_1.Server({
        name: 'mcp-arabic-ms-word',
        version: '1.0.0',
    }, {
        capabilities: {
            tools: {},
            resources: {},
            prompts: {},
        },
    });
    // Define tools metadata
    const tools = [
        {
            name: 'create_word_document',
            title: 'Create Arabic MS Word Document',
            description: 'Creates a new Microsoft Word (.docx) document with custom page setup, margins, metadata, and default Arabic font and RTL settings.',
            inputSchema: {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Output .docx file path relative to workspace or absolute' },
                    title: { type: 'string', description: 'Document title metadata' },
                    author: { type: 'string', description: 'Document author metadata' },
                    subject: { type: 'string', description: 'Document subject metadata' },
                    pageSize: { type: 'string', enum: ['A4', 'Letter', 'A3'], default: 'A4', description: 'Paper size' },
                    orientation: { type: 'string', enum: ['portrait', 'landscape'], default: 'portrait', description: 'Page orientation' },
                    defaultFont: { type: 'string', default: 'Amiri', description: 'Default Arabic font family' },
                    marginTopCm: { type: 'number', default: 2.54, description: 'Top margin in cm' },
                    marginBottomCm: { type: 'number', default: 2.54, description: 'Bottom margin in cm' },
                    marginLeftCm: { type: 'number', default: 2.54, description: 'Left margin in cm' },
                    marginRightCm: { type: 'number', default: 2.54, description: 'Right margin in cm' },
                },
                required: ['filePath'],
            },
        },
        {
            name: 'inspect_word_document',
            title: 'Inspect Word Document Architecture',
            description: 'Parses an existing .docx file and returns structural analysis (paragraph counts, headings, tables, detected fonts, RTL flags, metadata).',
            inputSchema: {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path to .docx file' },
                },
                required: ['filePath'],
            },
        },
        {
            name: 'add_paragraph_to_document',
            title: 'Add Styled Paragraph to Document',
            description: 'Appends a styled Arabic or English paragraph to a Word document with font, size, RTL, kashida justification, and line spacing.',
            inputSchema: {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path to .docx file' },
                    text: { type: 'string', description: 'Paragraph text content' },
                    fontFamily: { type: 'string', description: 'Font name (e.g. Amiri, Traditional Arabic, Cairo)' },
                    fontSizePt: { type: 'number', default: 14, description: 'Font size in pt' },
                    direction: { type: 'string', enum: ['rtl', 'ltr'], default: 'rtl', description: 'Text direction' },
                    alignment: { type: 'string', enum: ['right', 'left', 'center', 'justify', 'kashida'], default: 'right', description: 'Paragraph alignment' },
                    lineSpacingMultiplier: { type: 'number', default: 1.25, description: 'Line spacing multiplier' },
                    spaceBeforePt: { type: 'number', default: 0, description: 'Space before in pt' },
                    spaceAfterPt: { type: 'number', default: 6, description: 'Space after in pt' },
                    colorHex: { type: 'string', default: '000000', description: 'Text hex color' },
                    bold: { type: 'boolean', default: false, description: 'Bold weight' },
                    italic: { type: 'boolean', default: false, description: 'Italic style' },
                    underline: { type: 'boolean', default: false, description: 'Underline style' },
                },
                required: ['filePath', 'text'],
            },
        },
        {
            name: 'add_heading_to_document',
            title: 'Add Heading to Document',
            description: 'Appends a styled Heading (H1-H6) to a Word document with custom font size, color, alignment, and RTL support.',
            inputSchema: {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path to .docx file' },
                    text: { type: 'string', description: 'Heading text' },
                    level: { type: 'number', minimum: 1, maximum: 6, default: 1, description: 'Heading level 1-6' },
                    fontFamily: { type: 'string', description: 'Font name' },
                    fontSizePt: { type: 'number', description: 'Font size in pt' },
                    colorHex: { type: 'string', default: '1F4E78', description: 'Text color hex' },
                    alignment: { type: 'string', enum: ['right', 'left', 'center', 'justify'], default: 'right', description: 'Alignment' },
                    direction: { type: 'string', enum: ['rtl', 'ltr'], default: 'rtl', description: 'Text direction' },
                },
                required: ['filePath', 'text'],
            },
        },
        {
            name: 'add_table_to_document',
            title: 'Add RTL Table to Document',
            description: 'Appends a structured table with RTL layout (w:bidiVisual), header styling, custom cell shading, and borders to a Word document.',
            inputSchema: {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path to .docx file' },
                    columns: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                header: { type: 'string', description: 'Column header' },
                                widthPercent: { type: 'number', description: 'Column width percentage' },
                            },
                            required: ['header'],
                        },
                        description: 'Column header definitions',
                    },
                    rows: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                cells: { type: 'array', items: { type: 'string' }, description: 'Cell values' },
                                backgroundColor: { type: 'string', description: 'Custom row background hex' },
                            },
                            required: ['cells'],
                        },
                        description: 'Row data',
                    },
                    isRtl: { type: 'boolean', default: true, description: 'RTL layout flag' },
                },
                required: ['filePath', 'columns', 'rows'],
            },
        },
        {
            name: 'add_image_to_document',
            title: 'Add Image to Document',
            description: 'Embeds a PNG/JPEG image into a Word document with specified width, height, and alignment.',
            inputSchema: {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path to target .docx file' },
                    imagePath: { type: 'string', description: 'Path to input image file' },
                    widthPx: { type: 'number', default: 300, description: 'Display width in pixels' },
                    heightPx: { type: 'number', default: 200, description: 'Display height in pixels' },
                    align: { type: 'string', enum: ['right', 'center', 'left'], default: 'center', description: 'Image alignment' },
                },
                required: ['filePath', 'imagePath'],
            },
        },
        {
            name: 'add_header_footer_to_document',
            title: 'Configure Header and Footer',
            description: 'Configures document header and footer with custom text and Arabic page numbering (صفحة X من Y).',
            inputSchema: {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path to .docx file' },
                    headerText: { type: 'string', description: 'Header text' },
                    footerText: { type: 'string', description: 'Footer text' },
                    includePageNumbers: { type: 'boolean', default: true, description: 'Include page numbers' },
                    isRtl: { type: 'boolean', default: true, description: 'RTL direction' },
                },
                required: ['filePath'],
            },
        },
        {
            name: 'modify_word_xml_element',
            title: 'Modify WordprocessingML XML Element',
            description: 'Performs low-level XML text node or tag modification in document.xml for deep customization.',
            inputSchema: {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path to target .docx file' },
                    targetText: { type: 'string', description: 'Target string to find in document.xml' },
                    replacementText: { type: 'string', description: 'Replacement string or XML payload' },
                    outputPath: { type: 'string', description: 'Optional output path' },
                },
                required: ['filePath', 'targetText', 'replacementText'],
            },
        },
        {
            name: 'inject_template_data',
            title: 'Inject Data into Docx Template',
            description: 'Merges JSON key-value data into a .docx template containing tags (e.g., {name}, {#items}).',
            inputSchema: {
                type: 'object',
                properties: {
                    templatePath: { type: 'string', description: 'Path to input template .docx' },
                    data: { type: 'object', description: 'Key-value data object' },
                    outputPath: { type: 'string', description: 'Output .docx file path' },
                },
                required: ['templatePath', 'data', 'outputPath'],
            },
        },
        {
            name: 'convert_word_to_markdown',
            title: 'Convert Docx to Markdown',
            description: 'Extracts formatted headings and paragraph text from a Word document into structured Markdown for easy reading and analysis.',
            inputSchema: {
                type: 'object',
                properties: {
                    filePath: { type: 'string', description: 'Path to target .docx file' },
                },
                required: ['filePath'],
            },
        },
        {
            name: 'resolve_and_execute_document_intent',
            title: 'Auto-Resolve Natural Language Intent & Build Document',
            description: 'Single-shot automated document generator that converts high-level natural language requests (e.g. "أنشئ خطاب رسمي موجه لوزارة...") into complete styled Arabic Word documents.',
            inputSchema: {
                type: 'object',
                properties: {
                    prompt: { type: 'string', description: 'Natural language document request' },
                    outputPath: { type: 'string', description: 'Optional target .docx file path' },
                    recipient: { type: 'string', description: 'Optional recipient title/name' },
                    subject: { type: 'string', description: 'Optional document subject/title' },
                    author: { type: 'string', description: 'Optional document author' },
                    fontFamily: { type: 'string', description: 'Optional preferred font family' },
                },
                required: ['prompt'],
            },
        },
    ];
    // Tool Handlers
    server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
        tools,
    }));
    server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        logger_js_1.Logger.info(`Tool called: '${name}'`);
        let result;
        switch (name) {
            case 'create_word_document':
                result = await (0, create_document_js_1.handleCreateDocument)(args);
                break;
            case 'inspect_word_document':
                result = await (0, inspect_document_js_1.handleInspectDocument)(args);
                break;
            case 'add_paragraph_to_document':
                result = await (0, add_paragraph_js_1.handleAddParagraph)(args);
                break;
            case 'add_heading_to_document':
                result = await (0, add_heading_js_1.handleAddHeading)(args);
                break;
            case 'add_table_to_document':
                result = await (0, add_table_js_1.handleAddTable)(args);
                break;
            case 'add_image_to_document':
                result = await (0, add_image_js_1.handleAddImage)(args);
                break;
            case 'add_header_footer_to_document':
                result = await (0, add_header_footer_js_1.handleAddHeaderFooter)(args);
                break;
            case 'modify_word_xml_element':
                result = await (0, modify_xml_element_js_1.handleModifyXmlElement)(args);
                break;
            case 'inject_template_data':
                result = await (0, inject_template_js_1.handleInjectTemplate)(args);
                break;
            case 'convert_word_to_markdown':
                result = await (0, convert_to_markdown_js_1.handleConvertToMarkdown)(args);
                break;
            case 'resolve_and_execute_document_intent':
                result = await (0, resolve_intent_js_1.handleResolveIntent)(args);
                break;
            default:
                throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
            structuredContent: result,
        };
    });
    // Resources Handlers
    const resourcesList = (0, index_js_2.getResources)();
    server.setRequestHandler(types_js_1.ListResourcesRequestSchema, async () => ({
        resources: resourcesList.map((r) => ({
            uri: r.uri,
            name: r.name,
            description: r.description,
            mimeType: r.mimeType,
        })),
    }));
    server.setRequestHandler(types_js_1.ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;
        const found = resourcesList.find((r) => r.uri === uri);
        if (!found) {
            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, `Resource not found: ${uri}`);
        }
        const content = await found.readHandler();
        return {
            contents: [
                {
                    uri,
                    mimeType: found.mimeType,
                    text: content,
                },
            ],
        };
    });
    // Prompts Handlers
    const promptsList = (0, index_js_3.getPrompts)();
    server.setRequestHandler(types_js_1.ListPromptsRequestSchema, async () => ({
        prompts: promptsList.map((p) => ({
            name: p.name,
            description: p.description,
            arguments: p.arguments,
        })),
    }));
    server.setRequestHandler(types_js_1.GetPromptRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        const found = promptsList.find((p) => p.name === name);
        if (!found) {
            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidRequest, `Prompt not found: ${name}`);
        }
        const messages = found.getMessages(args || {});
        return {
            description: found.description,
            messages,
        };
    });
    return server;
}
//# sourceMappingURL=server.js.map