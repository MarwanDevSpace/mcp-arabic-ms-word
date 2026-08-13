# خادم خبير وورد العربي — MCP Arabic Microsoft Word Server

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/mcp-arabic-ms-word.svg)](https://www.npmjs.com/package/mcp-arabic-ms-word)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![MCP Protocol](https://img.shields.io/badge/MCP-Protocol--v1.0-purple.svg)](https://modelcontextprotocol.io)
[![Author](https://img.shields.io/badge/Author-MarwanDevSpace-orange.svg)](https://github.com/MarwanDevSpace)

**خادم بروتوكول MCP المتخصص في إنشاء وتنسيق وحقن وفحص مستندات Microsoft Word بدعم كامل ودقيق للغة العربية والاتجاه من اليمين إلى اليسار (RTL).**

</div>

---

## 🌟 المحتويات | Table of Contents

- [العربية (Arabic)](#-العربية)
  - [المميزات الرئيسية](#-المميزات-الرئيسية)
  - [فهرس الأدوات المتاحة (Tools)](#-فهرس-الأدوات-المتاحة-tools)
  - [طريقة التركيب والتشغيل عبر npx](#-طريقة-التركيب-والتشغيل-عبر-npx)
  - [إعدادات العميل (mcp_config.json)](#-إعدادات-العميل-mcp_configjson)
- [English Section](#-english-version)
  - [Key Features](#key-features)
  - [Tools Inventory](#tools-inventory)
  - [Installation & Setup](#installation--setup)

---

## 🇸🇦 العربية

### 🚀 المميزات الرئيسية

1. **دعم كامل للتيبوغرافيا والخطوط العربية (RTL)**:
   - اتجاه الكتابة من اليمين إلى اليسار (`bidi` / `rtl`) في الفقرات والجداول.
   - دعم كافة الخطوط العربية الشائعة: `Amiri`, `Traditional Arabic`, `Cairo`, `Sakkal Majalla`, `Simplified Arabic`.
   - محاذاة الكشيدة (`distribute` / `kashida`) وتعديل المسافات بين الأسطر (1.25x - 1.5x) لضمان وضوح التشكيل والتشابك.
2. **إنشاء المستندات وإدارتها الشاملة**:
   - إمكانية إنشاء كافة أنواع الكتابات والمستندات (خطابات رسمية، تقارير تنفيذية، عقود قانونية، قرارات إدارية، أدلة سياسات، أوراق بحثية، محاضر اجتماعات).
   - تحكم كامل في حجم الورق (`A4`, `Letter`, `A3`) والبهامش والاتجاه (طولي/عرضي).
3. **أتمتة ذكية دون الحاجة لأوامر نصية (`Zero Slash-Commands`)**:
   - محرك تحليل المقاصد (`resolve_and_execute_document_intent`) يفهم طلباتك النصية العادية ويقوم بتوليد المستند المنسق مباشرة بخطوة واحدة.
4. **جداول متوافقة مع الاتجاه العربي (`RTL Tables`)**:
   - إنشاء جداول بخيار `visuallyRightToLeft: true` وتنسيق رأس الجدول وألوان الصفوف المتبادلة.
5. **حقن القوالب وتعديل الـ XML الجراحي**:
   - دمج بيانات JSON في قوالب `.docx` محددة المتغيرات (`docxtemplater`).
   - إمكانية استبدال النصوص والعناصر مباشرة في ملف `word/document.xml`.
6. **ترويس وتذييل وترقيم عربي**:
   - ترقيم الصفحات التلقائي في التذييل بصيغة (`صفحة X من Y`).

---

### 🛠️ فهرس الأدوات المتاحة (Tools)

| اسم الأداة | الوصف والتطبيق |
|---|---|
| `resolve_and_execute_document_intent` | إنشاء وتنسيق مستند وورد عربي كامل خطوة واحدة من خلال الوصف النصي العادي. |
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

#### التشغيل المباشر
```bash
npx -y mcp-arabic-ms-word@latest
```

#### التثبيت المباشر في مشروعك
```bash
npm install mcp-arabic-ms-word
```

---

### ⚙️ إعدادات العميل القياسية (`mcp_config.json`)

قم بإضافة الخادم إلى إعدادات تطبيق العميل (مثل Antigravity أو Claude Desktop):

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

## 🇬🇧 English Version

### Key Features

- **Deep Arabic Typography**: Native Right-to-Left (`rtl`) layout, `bidi` paragraph flags, Kashida justification (`distribute`), line height control, and Arabic font support (`Amiri`, `Traditional Arabic`, `Cairo`, `Sakkal Majalla`).
- **Universal Document Engine**: Automated creation and formatting for letters, reports, contracts, manuals, research papers, and technical specifications.
- **Natural Language Intent Engine**: `resolve_and_execute_document_intent` converts user prompts into complete Word documents in a single turn.
- **RTL Tables & Visual Styling**: RTL visual tables (`w:bidiVisual`), header background colors, cell padding, and alternating row shading.
- **XML Surgery & Docx Templating**: Precision WordprocessingML element replacement and JSON template merging (`docxtemplater`).

---

### Standard Configuration (`mcp_config.json`)

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

## 📜 الترخيص والملكية | License & Author

- **المؤلف والحقوق | Author**: **[MarwanDevSpace](https://github.com/MarwanDevSpace)**
- **الترخيص | License**: [MIT License](LICENSE)
