import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import fs from 'node:fs';
import { FileOperationError, XmlManipulationError } from '../core/errors.js';

export class ArabicTemplateEngine {
  public static injectData(
    templatePath: string,
    data: Record<string, unknown>,
    outputPath: string
  ): string {
    if (!fs.existsSync(templatePath)) {
      throw new FileOperationError(`Template file not found: '${templatePath}'`);
    }

    try {
      const content = fs.readFileSync(templatePath, 'binary');
      const zip = new PizZip(content);

      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render(data);

      const buf = doc.getZip().generate({
        type: 'nodebuffer',
        compression: 'DEFLATE',
      });

      fs.writeFileSync(outputPath, buf);
      return outputPath;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new XmlManipulationError(`Template injection failed: ${msg}`);
    }
  }
}
