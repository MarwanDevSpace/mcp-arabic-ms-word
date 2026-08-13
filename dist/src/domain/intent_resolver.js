"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAndExecuteIntent = resolveAndExecuteIntent;
const workspace_js_1 = require("../security/workspace.js");
const docx_builder_js_1 = require("./docx_builder.js");
const workspace_state_js_1 = require("../state/workspace_state.js");
const logger_js_1 = require("../core/logger.js");
async function resolveAndExecuteIntent(request) {
    const promptLower = request.prompt.toLowerCase();
    // Dynamic Archetype Detection
    let archetype = 'universal_document';
    if (promptLower.includes('خطاب') || promptLower.includes('كتاب') || promptLower.includes('رسالة') || promptLower.includes('letter')) {
        archetype = 'official_letter';
    }
    else if (promptLower.includes('تقرير') || promptLower.includes('report') || promptLower.includes('دراسة')) {
        archetype = 'executive_report';
    }
    else if (promptLower.includes('عقد') || promptLower.includes('اتفاقية') || promptLower.includes('contract')) {
        archetype = 'legal_contract';
    }
    else if (promptLower.includes('قرار') || promptLower.includes('تعميم') || promptLower.includes('decision')) {
        archetype = 'administrative_decision';
    }
    else if (promptLower.includes('بحث') || promptLower.includes('ورقة') || promptLower.includes('paper')) {
        archetype = 'academic_paper';
    }
    else if (promptLower.includes('دليل') || promptLower.includes('manual') || promptLower.includes('سياسة') || promptLower.includes('policy')) {
        archetype = 'policy_manual';
    }
    else if (promptLower.includes('محضر') || promptLower.includes('اجتماع') || promptLower.includes('minutes')) {
        archetype = 'meeting_minutes';
    }
    const fileName = request.outputPath || `arabic_${archetype}_${Date.now()}.docx`;
    const resolvedPath = (0, workspace_js_1.resolveWorkspacePath)(fileName);
    const font = request.fontFamily || (archetype === 'executive_report' || archetype === 'policy_manual' ? 'Cairo' : 'Amiri');
    logger_js_1.Logger.info(`Dynamically resolving document intent '${archetype}' for prompt: '${request.prompt}'`);
    const builder = new docx_builder_js_1.ArabicDocxBuilder({
        title: request.subject || request.prompt.substring(0, 40),
        author: request.author || 'المساعد الذكي MCP',
        defaultFont: font,
        pageSize: 'A4',
    });
    const elementsCreated = [];
    if (archetype === 'official_letter') {
        builder.addHeader('المملكة العربية السعودية | خطاب رسمي معتمد', true);
        builder.addHeading('بسم الله الرحمن الرحيم', 1, { alignment: 'center', fontFamily: font, fontSizePt: 16 });
        builder.addParagraph(`التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, { alignment: 'right', fontSizePt: 12 });
        const recipientText = request.recipient || 'سعادة المدير العام المحترم';
        builder.addParagraph(recipientText, { bold: true, fontSizePt: 14 });
        builder.addParagraph('السلام عليكم ورحمة الله وبركاته، وبعد:', { fontSizePt: 14, spaceAfterPt: 12 });
        const bodyText = request.prompt.length > 30
            ? `بناءً على طلبكم المحترم بشأن (${request.prompt})، يسرنا أن نرفع لسعادتكم هذا الخطاب للتركيز على كافة التفاصيل والمتطلبات المذكورة وتأكيد الجاهزية للتنفيذ.`
            : 'نود إحاطة سعادتكم علماً بالموضوع أعلاه والتأكيد على التزامنا التام بكافة التوجيهات والمعايير المعتمدة.';
        builder.addParagraph(bodyText, { alignment: 'justify', fontSizePt: 14, lineSpacingMultiplier: 1.25, spaceAfterPt: 18 });
        builder.addParagraph('وتفضلوا بقبول فائق الاحترام والتقدير،،', { alignment: 'center', bold: true, fontSizePt: 14, spaceAfterPt: 24 });
        builder.addParagraph('مرسل الخطاب: الإدارة العامة\nالتوقيع: _______________', { alignment: 'right', fontSizePt: 12 });
        builder.addFooter('خطاب رسمي معتمد', true, true);
        elementsCreated.push('Header', 'Basmala Heading', 'Recipient & Salutation', 'Letter Body', 'Sign-off', 'Footer with Page Numbers');
    }
    else if (archetype === 'executive_report' || archetype === 'policy_manual') {
        builder.addHeading(request.subject || (archetype === 'policy_manual' ? 'دليل السياسات والإجراءات' : 'تقرير إداري شامل'), 1, { alignment: 'right', fontFamily: font, fontSizePt: 22, colorHex: '1F4E78' });
        builder.addParagraph(`إعداد: ${request.author || 'فريق التطوير والتحليل'} | التاريخ: ${new Date().toLocaleDateString('ar-SA')}`, { colorHex: '555555', fontSizePt: 12, spaceAfterPt: 14 });
        builder.addHeading('1. الملخص والمقدمة', 2, { colorHex: '1F4E78', fontSizePt: 16 });
        builder.addParagraph(request.prompt, { alignment: 'justify', fontSizePt: 14, lineSpacingMultiplier: 1.25 });
        builder.addHeading('2. بنود التنفيذ والمؤشرات الرئيسية', 2, { colorHex: '1F4E78', fontSizePt: 16 });
        builder.addTable([
            { header: 'م', widthPercent: 10 },
            { header: 'البند / المؤشر', widthPercent: 60 },
            { header: 'حالة الإنجاز', widthPercent: 30 },
        ], [
            { cells: ['1', 'تحليل المتطلبات وتجهيز هيكلية المستند', 'مكتمل بنجاح'] },
            { cells: ['2', 'تطبيقات التنسيق العربي والخطوط والاتجاهات', 'مكتمل بنجاح'] },
            { cells: ['3', 'التشغيل والأتمتة التلقائية للأوامر', 'مكتمل بنجاح'] },
        ], true);
        builder.addHeading('3. التوصيات والقرارات النهائية', 2, { colorHex: '1F4E78', fontSizePt: 16 });
        builder.addParagraph('• الاعتماد والمضي قدماً في تطبيق كافة البنود الواردة بالمستند.\n• المتابعة الدورية للتحسين والتحديث المستمر.', { alignment: 'right', fontSizePt: 13, lineSpacingMultiplier: 1.25 });
        builder.addFooter('مستند رسمي معتمد', true, true);
        elementsCreated.push('Title & Subtitle', 'Executive Summary (H2)', 'KPI Table', 'Recommendations (H2)', 'Footer with Page Numbers');
    }
    else if (archetype === 'legal_contract') {
        builder.addHeading(request.subject || 'عقد اتفاقية وشراكة', 1, { alignment: 'center', fontFamily: font, fontSizePt: 20, bold: true });
        builder.addParagraph(`إنه في يوم ${new Date().toLocaleDateString('ar-SA')} تم الاتفاق والتراضي بين الطرفين:`, { alignment: 'right', fontSizePt: 14, spaceAfterPt: 12 });
        builder.addHeading('التمهيد', 2, { colorHex: '1F4E78', fontSizePt: 16 });
        builder.addParagraph(`حيث يرغب الطرفان في التعاون والتنسيق بشأن (${request.prompt})، فقد اتفقا على البنود الآتية:`, { alignment: 'justify', fontSizePt: 14, lineSpacingMultiplier: 1.25 });
        builder.addHeading('البند الأول: موضوع العقد', 3, { fontSizePt: 15, bold: true });
        builder.addParagraph('يلتزم الطرفان بكافة الالتزامات والمسؤوليات المنصوص عليها في هذه الاتفاقية بدقة أمانة وإتقان.', { alignment: 'justify', fontSizePt: 13, lineSpacingMultiplier: 1.25 });
        builder.addHeading('البند الثاني: الأحكام العامة', 3, { fontSizePt: 15, bold: true });
        builder.addParagraph('تعتبر كافة الملاحق المرفقة جزءاً لا يتجزأ من هذا العقد وتخضع لأحكام الأنظمة واللوائح المعتمدة.', { alignment: 'justify', fontSizePt: 13, lineSpacingMultiplier: 1.25 });
        builder.addParagraph('الطرف الأول: _______________       الطرف الثاني: _______________', { alignment: 'center', bold: true, fontSizePt: 14, spaceBeforePt: 24 });
        builder.addFooter('وثيقة عقد رسمية', true, true);
        elementsCreated.push('Contract Title', 'Preamble', 'Articles H3', 'Signatures', 'Footer');
    }
    else {
        // Universal Dynamic Document Builder for ANY prompt
        builder.addHeading(request.subject || request.prompt.substring(0, 40), 1, { alignment: 'right', fontFamily: font, fontSizePt: 20, colorHex: '1F4E78' });
        builder.addParagraph(`تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')} | إعداد: ${request.author || 'المساعد الذكي MCP'}`, { colorHex: '666666', fontSizePt: 11, spaceAfterPt: 14 });
        builder.addParagraph(request.prompt, { alignment: 'justify', fontSizePt: 14, lineSpacingMultiplier: 1.25, spaceAfterPt: 12 });
        builder.addFooter('مستند وورد عربي شمولياً', true, true);
        elementsCreated.push('Dynamic Title Heading', 'Dynamic Body Content', 'Footer with Page Numbers');
    }
    workspace_state_js_1.workspaceState.createDocumentHandle(resolvedPath, builder);
    await builder.saveToFile(resolvedPath);
    return {
        outputPath: resolvedPath,
        archetype,
        elementsCreated,
    };
}
//# sourceMappingURL=intent_resolver.js.map