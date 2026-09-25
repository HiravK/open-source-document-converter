# Project Overview (In Depth) — Local PDF Toolbox (open-source-document-converter)

| Field | Value |
|---|---|
| Document ID | PDFTB-PROJECT |
| Project | Local PDF Toolbox (open-source-document-converter) |
| Repository | [`HiravK/open-source-document-converter`](https://github.com/HiravK/open-source-document-converter) |
| Version | 1.0 |
| Status | Approved — living document |
| Owner | Hirav Kadikar |
| Classification | Public |
| Last updated | 2026-09-25 |

> **Purpose:** The complete, plain-English explanation of this project: why it exists, what it does, how every part works, how it evolved, its quality, security, risks and vocabulary.


## 1. The project in one paragraph

**Local PDF Toolbox** (repository `open-source-document-converter`, package `pdf-toolbox-web`) is a single-page React app
that offers 20 document tools — Merge, Split, Compress, Repair, Remove/Extract/Organize pages, Edit (add text), PDF↔Word,
PDF↔PowerPoint, PDF↔Excel, PDF↔JPG, Scan to PDF, HTML to PDF, OCR and "PDF/A-style" export. **Every file is processed
inside the user's browser** with JavaScript libraries (pdf-lib, pdf.js, mammoth, docx, pptxgenjs, JSZip, tesseract.js),
so documents never leave the device. It is a static Vite build hosted on Vercel at **convert.hirav.me**.

Because browsers do not contain Microsoft Office or LibreOffice, Office conversions preserve text/data or render pages
as images rather than reproducing exact layouts — this trade-off is intentional and stated in the app.


## 2. Background and why it exists

Popular PDF websites require uploading private documents (contracts, IDs, statements) to someone else's server, often
with file-size limits, ads, watermarks or paywalls. Users want the same everyday tools without giving their files away.


## 3. Fact sheet

|  |  |
|---|---|
| Repository | Public — `HiravK/open-source-document-converter` |
| Status | Active — live at convert.hirav.me |
| Live URL | https://convert.hirav.me |
| Hosting | Vercel (static Vite build) → https://convert.hirav.me |
| Primary language | JavaScript (React 19 + Vite 7) |
| Default branch | `main` |
| History | 2 commits from 2026-05-29 to 2026-05-29 |
| Contributors | Hirav K (2 commits) |


## 4. Features explained


### Organize PDF

Merge (ordered), Split (one PDF per page), Remove pages, Extract pages, Organize (reorder by page sequence)


### Optimise

Compress (re-save with object streams) and Repair (load and re-save)


### Convert from PDF

PDF → Word (text into DOCX), PDF → Excel (text lines into sheets), PDF → PowerPoint (each page rendered as a slide image), PDF → JPG (each page as an image, zipped)


### Convert to PDF

Word (DOCX text via mammoth), PowerPoint (slide text + best slide image), Excel (cell values), JPG/PNG/WebP images, Scan to PDF, HTML text


### Edit PDF

Add text to the first page


### OCR PDF

Renders pages and runs tesseract.js locally; exports searchable text as a PDF


### PDF/A-style

Cleaned archival-style export (metadata set; not certified PDF/A)


### Privacy by design

No backend, no upload endpoint; the only network use is loading the app and OCR language data


## 5. How it works end to end

A client-only React 19 single-page app built by Vite. `src/main.jsx` holds the tool catalogue (`CATEGORIES`, `TOOLS`),
the UI (`App`, `ToolCard`, `ToolIcon`) and one async function per tool (`mergePdf`, `splitPdf`, `pdfToWord` …). Tools read
the chosen files as ArrayBuffers, transform them with pdf-lib / pdf.js / mammoth / docx / pptxgenjs / JSZip / tesseract.js,
and hand the result to `downloadBytes` (file-saver). pdf.js runs its parser in a Web Worker bundled by Vite
(`pdf.worker.mjs?url`). There is no backend; `vercel.json` serves `dist/` and rewrites every path to `index.html`.


### Merge PDFs

1. Open convert.hirav.me and choose Merge PDF
1. Add files and arrange the order
1. Click Run — pdf-lib copies pages into a new document in the browser
1. The merged file downloads immediately

Diagrams and component detail: [ARCHITECTURE.md](ARCHITECTURE.md).


## 6. Technology choices

| Layer | Technology | Why it is used |
|---|---|---|
| UI | React 19, lucide-react | Interface and icons |
| Build | Vite 7 + @vitejs/plugin-react | Dev server and bundling |
| PDF | pdf-lib, pdfjs-dist 5 | Write and read PDFs |
| Office | mammoth, docx, pptxgenjs, JSZip | Word/PowerPoint/Excel handling |
| OCR | tesseract.js 6 | Local text recognition |
| Download | file-saver | Save results |
| Hosting | Vercel | Static hosting |


## 7. Codebase tour

```text
open-source-document-converter/
├── index.html
├── src/
│   ├── main.jsx      # UI + all 20 tools + helpers
│   └── styles.css
├── vite.config.js
├── vercel.json       # SPA rewrite, dist output
└── package.json      # name: pdf-toolbox-web
```

| Component | Location | What it does |
|---|---|---|
| Entry + UI | `src/main.jsx (App, ToolCard, ToolIcon)` | Tool picker, file input, options, run button, status |
| Tool catalogue | `src/main.jsx (CATEGORIES, TOOLS)` | Titles, descriptions, accepted types, handlers |
| PDF tools | `src/main.jsx (mergePdf … pdfToPdfa)` | One async function per tool |
| Helpers | `src/main.jsx (renderPdfPages, createXlsx, readXlsxText, textPdf, parsePageSpec …)` | Rendering, Office XML parsing, text PDF creation, page ranges |
| Styles | `src/styles.css` | Layout and theme |
| Build/deploy | `vite.config.js, vercel.json, package.json` | Vite + React plugin; SPA rewrite |


## 8. Project timeline

| Phase | Scope | Status |
|---|---|---|
| v1 (2026-05-29) | 20 tools, Vercel deploy at convert.hirav.me | Done |
| v1.1 | Split main.jsx into modules; add automated tests with sample files | Planned |
| v2 | Password protect/unlock, watermark, page numbers, image compression via WebAssembly | Proposed |

Recent commits:

```text
2026-05-29  add vite.config.js
2026-05-29  initial commit
```


## 9. Team and ownership

| Person / group | Role | Interest |
|---|---|---|
| Hirav Kadikar | Owner and developer | Useful, private tools on hirav.me |
| Users | End users | Private, free conversions |


## Quality and testing

No automated tests. Each tool was checked manually with sample files.

Acceptance checks to run before every release:

| # | Area | Check | Expected result |
|---|---|---|---|
| 1 | Merge | Merge 3 PDFs in a custom order | Pages in chosen order |
| 2 | Split | Split a 4-page PDF | 4 single-page PDFs |
| 3 | Pages | Remove "2-3" from a 5-page PDF | 3 pages remain |
| 4 | Convert | PDF to Word on a text PDF | DOCX with the text |
| 5 | Convert | Excel to PDF | Cell values on PDF pages |
| 6 | Images | JPG + PNG to PDF | One PDF, one image per page |
| 7 | OCR | Scanned PDF | Searchable text PDF |
| 8 | Privacy | Run any tool with DevTools Network open | No request carries the file |

Recommended improvements:

- Add a sample-file test suite (Vitest + jsdom or Playwright) per tool.


## Security and privacy

| Area | Current state |
|---|---|
| Authentication | None — no user accounts. |
| Authorisation | Not applicable. |
| Data handled | Files are processed in memory in the user's browser and never uploaded. |
| Secrets | No secrets required. |
| Transport | HTTPS via the hosting provider. |

| Threat | Scenario | Mitigation | Status |
|---|---|---|---|
| Information disclosure | Files sent to a server | No upload code; static hosting | Mitigated |
| Tampering | Malicious PDF exploits a parser | Libraries run in the browser sandbox; keep dependencies updated | Partly mitigated |
| Supply chain | Compromised npm dependency | Lockfile + Dependabot | Open |

No personal data is collected or stored; there are no cookies or analytics in the code.


## Risks and technical debt

| ID | Category | Risk | Score (L×I) | Mitigation |
|---|---|---|---|---|
| R-01 | Legal | No licence on a repo named open-source | 6 (Low) | Add LICENSE |
| R-02 | Quality | Users expect exact Office layouts | 6 (Low) | Clear in-app notes |
| R-03 | Maintenance | Large single file | 6 (Low) | Refactor |

| Tech debt | Severity | Fix |
|---|---|---|
| Monolithic main.jsx | Medium | Modularise |
| No tests | Medium | Add sample-file tests |


## How to use it


### Use a tool

1. Open https://convert.hirav.me
1. Pick a tool (e.g. Merge PDF)
1. Add your files (they stay on your device)
1. Set options such as page ranges (e.g. 1-3,5)
1. Click Run; the result downloads automatically


## Glossary

| Term | Meaning |
|---|---|
| **OCR** | Optical character recognition — turning images of text into text |
| **pdf-lib** | JavaScript library to create and modify PDFs |
| **pdf.js** | Mozilla's PDF renderer/parser |
| **PDF/A** | ISO archival PDF standard (this app produces a PDF/A-style file, not a certified one) |
| **SPA** | Single-page application |
