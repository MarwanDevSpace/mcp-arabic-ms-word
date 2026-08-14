import JSZip from 'jszip';
import fs from 'node:fs';
import { FileOperationError, XmlManipulationError } from '../core/errors.js';
import { Logger } from '../core/logger.js';

export interface BidiEnforcementOptions {
  fixHeadingsAlignment?: boolean;
  justifyBodyParagraphs?: boolean;
  preventVerseSplitting?: boolean;
  injectDynamicPageNumbering?: boolean;
  isolateEnglishSections?: boolean;
}

export interface BidiEnforcementResult {
  documentPath: string;
  headingsFixed: number;
  bodyParagraphsJustified: number;
  versesProtected: number;
  englishSectionsIsolated: number;
  pageNumbersInjected: boolean;
  totalParagraphsProcessed: number;
}

export class BidiOpenXmlSurgeon {
  /**
   * Performs deep OpenXML surgical repair on an Arabic DOCX file
   */
  public async enforceBidiAndTypography(
    filePath: string,
    options: BidiEnforcementOptions = {},
    outputPath?: string
  ): Promise<BidiEnforcementResult> {
    if (!fs.existsSync(filePath)) {
      throw new FileOperationError(`Target document not found: '${filePath}'`);
    }

    const {
      fixHeadingsAlignment = true,
      justifyBodyParagraphs = true,
      preventVerseSplitting = true,
      injectDynamicPageNumbering = true,
      isolateEnglishSections = true,
    } = options;

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const zip = await JSZip.loadAsync(fileBuffer);

      const docFile = zip.file('word/document.xml');
      if (!docFile) {
        throw new FileOperationError(`Invalid DOCX: missing 'word/document.xml'`);
      }

      let docXml = await docFile.async('text');

      let headingsFixed = 0;
      let bodyParagraphsJustified = 0;
      let versesProtected = 0;
      let englishSectionsIsolated = 0;
      let totalParagraphsProcessed = 0;

      // Extract and process each <w:p>...</w:p> paragraph individually
      docXml = docXml.replace(/<w:p\b[\s\S]*?<\/w:p>/g, (paragraphXml) => {
        totalParagraphsProcessed++;

        // Extract plain text inside this paragraph
        const textMatches = paragraphXml.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
        const plainText = textMatches.map((t) => t.replace(/<[^>]+>/g, '')).join('').trim();

        if (!plainText) {
          return paragraphXml;
        }

        let updatedP = paragraphXml;

        // Check if paragraph is primarily English / Latin
        const arabicCharCount = (plainText.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || []).length;
        const latinCharCount = (plainText.match(/[a-zA-Z]/g) || []).length;
        const isEnglish = latinCharCount > 0 && latinCharCount >= arabicCharCount;

        // Check if paragraph is a Heading (by style or text signature)
        const isHeading =
          paragraphXml.includes('w:val="Heading') ||
          paragraphXml.includes('w:val="heading') ||
          /^((المبحث|المطلب|الفصل|الباب|تمهيد|المقدمة|الخاتمة|الفهرس|المراجع|عنوان|أولاً|ثانياً|ثالثاً|رابعاً|خامساً)[\s:])/i.test(
            plainText
          );

        // Check if paragraph contains Quranic verse or Hadith
        const isVerseOrHadith =
          plainText.includes('﴿') ||
          plainText.includes('﴾') ||
          plainText.includes('قال تعالى') ||
          plainText.includes('عز وجل') ||
          plainText.includes('صلى الله عليه وسلم') ||
          plainText.includes('روى البخاري') ||
          plainText.includes('روى مسلم') ||
          plainText.includes('حديث شريف');

        // Extract or construct <w:pPr>
        let pPrMatch = /<w:pPr[\s\S]*?<\/w:pPr>/.exec(updatedP);
        let pPrContent = pPrMatch ? pPrMatch[0] : '<w:pPr></w:pPr>';

        if (isEnglish && isolateEnglishSections) {
          // Rule 5: English Sections -> <w:jc w:val="left"/>, NO <w:bidi/>, NO <w:rtl/>
          pPrContent = pPrContent.replace(/<w:bidi\/>/g, '');
          pPrContent = this.setJc(pPrContent, 'left');
          updatedP = updatedP.replace(/<w:rtl\/>/g, '');
          englishSectionsIsolated++;
        } else if (isHeading && fixHeadingsAlignment) {
          // Rule 1: Headings -> <w:jc w:val="right"/> + <w:keepNext/> + <w:widowControl/> + NO <w:bidi/> in pPr!
          // Note: In Word OpenXML, <w:bidi/> in pPr flips <w:jc w:val="right"/> to physical left!
          pPrContent = pPrContent.replace(/<w:bidi\/>/g, '');
          pPrContent = this.setJc(pPrContent, 'right');
          if (!pPrContent.includes('<w:keepNext/>')) {
            pPrContent = pPrContent.replace('</w:pPr>', '<w:keepNext/></w:pPr>');
          }
          if (!pPrContent.includes('<w:widowControl/>')) {
            pPrContent = pPrContent.replace('</w:pPr>', '<w:widowControl/></w:pPr>');
          }
          // Ensure all Arabic text runs have <w:rtl/>
          updatedP = this.ensureRunRtl(updatedP);
          headingsFixed++;
        } else if (isVerseOrHadith && preventVerseSplitting) {
          // Rule 4: Verses & Hadiths -> <w:keepLines/> + <w:bidi/> + <w:jc w:val="both"/> (or center)
          if (!pPrContent.includes('<w:keepLines/>')) {
            pPrContent = pPrContent.replace('</w:pPr>', '<w:keepLines/></w:pPr>');
          }
          if (!pPrContent.includes('<w:bidi/>')) {
            pPrContent = pPrContent.replace('</w:pPr>', '<w:bidi/></w:pPr>');
          }
          if (!pPrContent.includes('<w:jc ')) {
            pPrContent = this.setJc(pPrContent, 'both');
          }
          updatedP = this.ensureRunRtl(updatedP);
          versesProtected++;
        } else if (justifyBodyParagraphs) {
          // Rule 3: Arabic Body Paragraphs -> <w:bidi/> + <w:jc w:val="both"/> + <w:rtl/> in rPr
          if (!pPrContent.includes('<w:bidi/>')) {
            pPrContent = pPrContent.replace('</w:pPr>', '<w:bidi/></w:pPr>');
          }
          pPrContent = this.setJc(pPrContent, 'both');
          if (!pPrContent.includes('<w:widowControl/>')) {
            pPrContent = pPrContent.replace('</w:pPr>', '<w:widowControl/></w:pPr>');
          }
          updatedP = this.ensureRunRtl(updatedP);
          bodyParagraphsJustified++;
        }

        // Reinsert modified <w:pPr> into paragraph
        if (pPrMatch) {
          updatedP = updatedP.replace(pPrMatch[0], pPrContent);
        } else {
          updatedP = updatedP.replace('<w:p>', `<w:p>${pPrContent}`);
        }

        return updatedP;
      });

      zip.file('word/document.xml', docXml);

      // Inject dynamic page numbering into footer if requested
      let pageNumbersInjected = false;
      if (injectDynamicPageNumbering) {
        pageNumbersInjected = await this.injectPageNumberingXml(zip);
      }

      // Save output
      const finalOutputPath = outputPath || filePath;
      const newBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      fs.writeFileSync(finalOutputPath, newBuffer);

      Logger.info(`Enforced Arabic BiDi and OpenXML typography on '${finalOutputPath}'`);

      return {
        documentPath: finalOutputPath,
        headingsFixed,
        bodyParagraphsJustified,
        versesProtected,
        englishSectionsIsolated,
        pageNumbersInjected,
        totalParagraphsProcessed,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new XmlManipulationError(`Failed to enforce BiDi and typography on '${filePath}': ${msg}`);
    }
  }

  private setJc(pPr: string, alignment: 'right' | 'left' | 'center' | 'both'): string {
    if (pPr.includes('<w:jc ')) {
      return pPr.replace(/<w:jc\s+w:val="[^"]*"\/>/g, `<w:jc w:val="${alignment}"/>`);
    }
    return pPr.replace('</w:pPr>', `<w:jc w:val="${alignment}"/></w:pPr>`);
  }

  private ensureRunRtl(paragraphXml: string): string {
    return paragraphXml.replace(/<w:r\b[\s\S]*?<\/w:r>/g, (runXml) => {
      // Check if run has Arabic characters
      const tMatch = runXml.match(/<w:t[^>]*>(.*?)<\/w:t>/g) || [];
      const text = tMatch.map((t) => t.replace(/<[^>]+>/g, '')).join('');
      const hasArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);

      if (hasArabic) {
        if (runXml.includes('<w:rPr>')) {
          if (!runXml.includes('<w:rtl/>')) {
            return runXml.replace('<w:rPr>', '<w:rPr><w:rtl/>');
          }
        } else {
          return runXml.replace('<w:r>', '<w:r><w:rPr><w:rtl/></w:rPr>');
        }
      }
      return runXml;
    });
  }

  private async injectPageNumberingXml(zip: JSZip): Promise<boolean> {
    try {
      let footerXml = zip.file('word/footer1.xml');
      const footerContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Simplified Arabic" w:hAnsi="Simplified Arabic" w:cs="Simplified Arabic"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:rtl/>
      </w:rPr>
      <w:t xml:space="preserve">- </w:t>
    </w:r>
    <w:fldSimple w:instr="PAGE"/>
    <w:r>
      <w:rPr>
        <w:rFonts w:ascii="Simplified Arabic" w:hAnsi="Simplified Arabic" w:cs="Simplified Arabic"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
        <w:rtl/>
      </w:rPr>
      <w:t xml:space="preserve"> -</w:t>
    </w:r>
  </w:p>
</w:ftr>`;

      zip.file('word/footer1.xml', footerContent);
      return true;
    } catch {
      return false;
    }
  }
}
