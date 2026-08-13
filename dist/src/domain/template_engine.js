"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArabicTemplateEngine = void 0;
const pizzip_1 = __importDefault(require("pizzip"));
const docxtemplater_1 = __importDefault(require("docxtemplater"));
const node_fs_1 = __importDefault(require("node:fs"));
const errors_js_1 = require("../core/errors.js");
class ArabicTemplateEngine {
    static injectData(templatePath, data, outputPath) {
        if (!node_fs_1.default.existsSync(templatePath)) {
            throw new errors_js_1.FileOperationError(`Template file not found: '${templatePath}'`);
        }
        try {
            const content = node_fs_1.default.readFileSync(templatePath, 'binary');
            const zip = new pizzip_1.default(content);
            const doc = new docxtemplater_1.default(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });
            doc.render(data);
            const buf = doc.getZip().generate({
                type: 'nodebuffer',
                compression: 'DEFLATE',
            });
            node_fs_1.default.writeFileSync(outputPath, buf);
            return outputPath;
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            throw new errors_js_1.XmlManipulationError(`Template injection failed: ${msg}`);
        }
    }
}
exports.ArabicTemplateEngine = ArabicTemplateEngine;
//# sourceMappingURL=template_engine.js.map