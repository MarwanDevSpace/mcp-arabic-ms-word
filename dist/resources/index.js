"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResources = getResources;
const workspace_state_js_1 = require("../state/workspace_state.js");
const arabic_typography_js_1 = require("../domain/arabic_typography.js");
function getResources() {
    return [
        {
            uri: 'word://workspace/documents',
            name: 'Workspace Word Documents Catalog',
            description: 'Dynamic JSON listing of all .docx files found within the current workspace directory.',
            mimeType: 'application/json',
            readHandler: async () => {
                const docs = workspace_state_js_1.workspaceState.listWorkspaceDocuments();
                return JSON.stringify({ count: docs.length, documents: docs }, null, 2);
            },
        },
        {
            uri: 'word://templates/arabic-standard',
            name: 'Standard Arabic Document Templates Catalog',
            description: 'Pre-configured layout templates for Arabic official letters, administrative reports, and academic research papers.',
            mimeType: 'application/json',
            readHandler: async () => {
                return JSON.stringify({
                    templates: [
                        {
                            id: 'arabic-official-letter',
                            name: 'خطاب رسمي (Official Khatab)',
                            font: arabic_typography_js_1.ARABIC_FONTS.AMIRI,
                            pageSize: 'A4',
                            marginsCm: 2.54,
                            placeholders: ['date', 'recipient', 'subject', 'salutation', 'body', 'signoff', 'senderName', 'title'],
                        },
                        {
                            id: 'arabic-executive-report',
                            name: 'تقرير إداري (Executive Report)',
                            font: arabic_typography_js_1.ARABIC_FONTS.TRADITIONAL_ARABIC,
                            pageSize: 'A4',
                            marginsCm: 2.54,
                            placeholders: ['reportTitle', 'subtitle', 'author', 'date', 'executiveSummary', 'kpiTable', 'recommendations'],
                        },
                        {
                            id: 'arabic-academic-paper',
                            name: 'ورقة بحثية أكاديمية (Academic Paper)',
                            font: arabic_typography_js_1.ARABIC_FONTS.SAKKAL_MAJALLA,
                            pageSize: 'A4',
                            marginsCm: 2.54,
                            placeholders: ['paperTitle', 'authors', 'abstract', 'keywords', 'introduction', 'methodology', 'references'],
                        },
                    ],
                }, null, 2);
            },
        },
        {
            uri: 'word://fonts/arabic-registry',
            name: 'Arabic Typography Font Registry',
            description: 'Catalog of supported Arabic fonts, recommended line heights, and fallback configurations.',
            mimeType: 'application/json',
            readHandler: async () => {
                return JSON.stringify({
                    supportedFonts: [
                        { name: 'Amiri', type: 'Serif / Naskh', idealFor: 'Formal documents, books, official letters' },
                        { name: 'Traditional Arabic', type: 'Classic', idealFor: 'Official government publications, contracts' },
                        { name: 'Simplified Arabic', type: 'Modern Clean', idealFor: 'Standard business documentation' },
                        { name: 'Sakkal Majalla', type: 'High Readability', idealFor: 'Magazines, headers, executive summaries' },
                        { name: 'Cairo', type: 'Modern Kufic / Sans', idealFor: 'Modern corporate reports & presentations' },
                        { name: 'Calibri / Arial', type: 'System Universal', idealFor: 'Cross-platform safe fallbacks' },
                    ],
                    defaultRules: {
                        lineSpacingMultiplier: 1.25,
                        defaultHeadingColorHex: '1F4E78',
                        direction: 'rtl',
                        numeralSystem: 'Eastern Arabic (٠-٩) or Western (0-9)',
                    },
                }, null, 2);
            },
        },
    ];
}
//# sourceMappingURL=index.js.map