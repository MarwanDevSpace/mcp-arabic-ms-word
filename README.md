<div align="center">

<img src="assets/ms-ar.png" alt="mcp-arabic-ms-word Logo" width="200" style="border-radius: 16px; margin-bottom: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" />

# خادم خبير وورد العربي — MCP Arabic Microsoft Word Server

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/mcp-arabic-ms-word.svg)](https://www.npmjs.com/package/mcp-arabic-ms-word)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![MCP Protocol](https://img.shields.io/badge/MCP-Protocol--v1.0-purple.svg)](https://modelcontextprotocol.io)
[![Author](https://img.shields.io/badge/Author-MarwanDevSpace-orange.svg)](https://github.com/MarwanDevSpace)
[![mcp-arabic-ms-word MCP server](https://glama.ai/mcp/servers/MarwanDevSpace/mcp-arabic-ms-word/badges/score.svg)](https://glama.ai/mcp/servers/MarwanDevSpace/mcp-arabic-ms-word)

**خادم بروتوكول MCP المتقدم (WordMasterAgent) المتخصص في إنشاء وتنسيق وحقن وفحص وإصلاح نصوص وتفكيك شفرات XML لمستندات Microsoft Word بدعم كامل ودقيق للغة العربية والاتجاه من اليمين إلى اليسار (RTL).**

</div>

---

## 🌟 المحتويات | Table of Contents

- [العربية (Arabic)](#-العربية)
  - [المميزات الرئيسية](#-المميزات-الرئيسية)
  - [فهرس الأدوات المتاحة (13 Tools)](#-فهرس-الأدوات-المتاحة-13-tools)
  - [طريقة التركيب والتشغيل عبر npx](#-طريقة-التركيب-والتشغيل-عبر-npx)
  - [إعدادات العميل (mcp_config.json)](#-إعدادات-العميل-mcp_configjson)
  - [مواصفات Glama.json للمسرد](#-مواصفات-glamajson-للمسرد)
- [English Section](#-english-version)
  - [Key Features](#key-features)
  - [Tools Inventory](#tools-inventory)
  - [Installation & Setup](#installation--setup)

---

## 🇸🇦 العربية

### 🚀 المميزات الرئيسية

1. **دعم كامل للتيبوغرافيا وإصلاح النصوص العربية (RTL & Text Repair)**:
   - اتجاه الكتابة من اليمين إلى اليسار (`bidi` / `rtl`) في الفقرات والجداول.
   - إصلاح التيبوغرافيا التلقائي (`repair_arabic_text_formatting`): تصحيح الأقواس المقلوبة، توحيد الأرقام (شرقية/غربية)، إزالة الكشيدات الزائدة، وتصحيح همزات الألف والياء.
   - دعم كافة الخطوط العربية الشائعة: `Amiri`, `Traditional Arabic`, `Cairo`, `Sakkal Majalla`, `Simplified Arabic`.
2. **تفكيك وتعديل شفرات الـ XML المتقدم (`XML Decompression & Surgery`)**:
   - تفكيك أرشيف `.docx` والتعديل الجراحي المباشر على أي ملف XML داخلي (`decompress_and_modify_word_xml`) مثل `word/document.xml`, `word/styles.xml`, `word/numbering.xml`.
3. **إنشاء المستندات وإدارتها الشاملة**:
   - إمكانية إنشاء كافة أنواع الكتابات والمستندات (خطابات رسمية، تقارير تنفيذية، عقود قانونية، قرارات إدارية، أدلة سياسات، أوراق بحثية، محاضر اجتماعات).
4. **أتمتة ذكية دون الحاجة لأوامر نصية (`Zero Slash-Commands`)**:
   - محرك تحليل المقاصد (`resolve_and_execute_document_intent`) يفهم طلباتك النصية العادية ويقوم بتوليد المستند المنسق مباشرة بخطوة واحدة.

---

### 🛠️ فهرس الأدوات المتاحة (13 Tools)

| اسم الأداة | الوصف والتطبيق |
|---|---|
| `resolve_and_execute_document_intent` | إنشاء وتنسيق مستند وورد عربي كامل خطوة واحدة من خلال الوصف النصي العادي. |
| `repair_arabic_text_formatting` | فحص وإصلاح عيوب التيبوغرافيا العربية للأقواس المقلوبة والأرقام والألف والياء والمسافات. |
| `decompress_and_modify_word_xml` | تفكيك أرشيف docx والتعديل الجراحي بالـ Regex على أي ملف XML داخلي (document, styles, numbering). |
| `create_word_document` | إنشاء مستند `.docx` جديد بتحديد المقاس والبهامش والخط والاتجاه الافتراضي. |
| `add_paragraph_to_document` | إدراج فقرة نصية منسقة (الخط، الحجم، اللون، الاتجاه، الكشيدة، المسافات). |
| `add_heading_to_document` | إدراج عناوين رئيسية أو فرعية (H1-H6) بلون وتنسيق مخصص. |
| `add_table_to_document` | إدراج جدول بيانات متوافق مع الاتجاه العربي مع ألوان الهيدر والصفوف. |
| `add_image_to_document` | تضمين صور (PNG/JPEG) داخل المستند بأبعاد ومحاذاة محددة. |
| `add_header_footer_to_document` | ضبط رأس وتذييل المستند وترقيم الصفحات العربي (`صفحة X من Y`). |
| `inspect_word_document` | فحص مستند وورد واستخراج عدد الفقرات والعناوين والجداول والخطوط المكتشفة. |
| `convert_word_to_markdown` | استخراج محتوى مستند الوورد وتحويله إلى صيغة Markdown منظمة. |
| `inject_template_data` | دمج بيانات JSON في قالب وورد يحتوي على متغيرات `{placeholder}`. |
| `modify_word_xml_element` | استبدال نصوص أو عناصر شفرة WordprocessingML XML مباشرة. |

---

### 📦 طريقة التركيب والتشغيل عبر npx

```bash
npx -y mcp-arabic-ms-word@latest
```

---

### ⚙️ إعدادات العميل القياسية (`mcp_config.json`)

```json
{
  "mcpServers": {
    "mcp-arabic-ms-word": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-arabic-ms-word@latest"
      ]
    }
  }
}
```

---

### 📑 مواصفات Glama.json للمسرد

المشروع متوافق 100% مع مسرد Glama MCP Registry ومزود بملف [glama.json](glama.json) لتأكيد أعلى درجات التقييم (High Score).

---

## 🇬🇧 English Version

### Key Features

- **Arabic Text Repair Engine**: Automatic correction of inverted brackets in RTL text, digit standardization (Eastern/Western), whitespace trimming, and Alef/Yeh normalization.
- **XML Decompression & Surgery**: Decompress `.docx` ZIP archives and perform surgical pattern replacements in `word/document.xml`, `word/styles.xml`, and `word/numbering.xml`.
- **WordMasterAgent Integration**: Unified architecture orchestrating 13 specialized tools across 5 master skills.

---

## 📜 الترخيص والملكية | License & Author

- **المؤلف والحقوق | Author**: **[MarwanDevSpace](https://github.com/MarwanDevSpace)**
- **الترخيص | License**: [MIT License](LICENSE)
