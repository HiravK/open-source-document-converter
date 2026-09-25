# Product Requirements Document (PRD) — Local PDF Toolbox (open-source-document-converter)

| Field | Value |
|---|---|
| Document ID | PDFTB-PRD |
| Project | Local PDF Toolbox (open-source-document-converter) |
| Repository | [`HiravK/open-source-document-converter`](https://github.com/HiravK/open-source-document-converter) |
| Version | 1.0 |
| Status | Approved — living document |
| Owner | Hirav Kadikar |
| Classification | Public |
| Last updated | 2026-09-25 |

> **Purpose:** Defines what the product must do, for whom, and how success is measured. It is the single source of truth for scope.


## 1. Revision history

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-09-25 | Hirav Kadikar | Full documentation suite generated from a complete review of the repository. |


## 2. Executive summary

**Local PDF Toolbox** (repository `open-source-document-converter`, package `pdf-toolbox-web`) is a single-page React app
that offers 20 document tools — Merge, Split, Compress, Repair, Remove/Extract/Organize pages, Edit (add text), PDF↔Word,
PDF↔PowerPoint, PDF↔Excel, PDF↔JPG, Scan to PDF, HTML to PDF, OCR and "PDF/A-style" export. **Every file is processed
inside the user's browser** with JavaScript libraries (pdf-lib, pdf.js, mammoth, docx, pptxgenjs, JSZip, tesseract.js),
so documents never leave the device. It is a static Vite build hosted on Vercel at **convert.hirav.me**.

Because browsers do not contain Microsoft Office or LibreOffice, Office conversions preserve text/data or render pages
as images rather than reproducing exact layouts — this trade-off is intentional and stated in the app.


## 3. Problem statement

Popular PDF websites require uploading private documents (contracts, IDs, statements) to someone else's server, often
with file-size limits, ads, watermarks or paywalls. Users want the same everyday tools without giving their files away.


## 4. Goals and non-goals


### 4.1 Goals

- Cover the most-used PDF tools in one fast page.
- Never upload files — all processing client-side.
- Zero running cost (static hosting, no backend).
- Work on desktop and mobile browsers.


### 4.2 Non-goals (explicitly out of scope)

- Pixel-perfect Office rendering (needs a server-side Office/LibreOffice engine).
- Accounts, cloud storage or file history.
- True PDF/A or strong compression (browser libraries cannot re-encode images or embed ICC profiles).


## 5. Stakeholders (RACI)

| Stakeholder | Role | R/A/C/I | Interest |
|---|---|---|---|
| Hirav Kadikar | Owner and developer | R/A | Useful, private tools on hirav.me |
| Users | End users | I | Private, free conversions |


_R = Responsible, A = Accountable, C = Consulted, I = Informed._


## 6. Users and personas


### Student / office worker

Needs to merge scans, convert a PDF to Word or extract a few pages before emailing.
needs[]: No sign-up ;; No upload of private files ;; Works on a phone


### Privacy-conscious professional

Handles contracts and IDs.
needs[]: Proof files stay local ;; Open-source code to inspect


## 7. User stories

| ID | As a… | I want to… | So that… | Priority |
|---|---|---|---|---|
| US-01 | user | to merge several PDFs in a chosen order | I send one file | Must |
| US-02 | user | to split, remove, extract or reorder pages | I share only what is needed | Must |
| US-03 | user | to convert PDF to Word/Excel/PowerPoint/JPG and back | I can edit or share in the right format | Should |
| US-04 | user | to OCR a scanned PDF | I get searchable text | Should |
| US-05 | user | my files never uploaded | my documents stay private | Must |


## 8. Functional requirements

| ID | Area | Requirement | MoSCoW | Status |
|---|---|---|---|---|
| FR-01 | Core | Tool picker grouped by category (Organize, Optimise, Convert to/from PDF, Edit, Security-style tools) | Must | Done |
| FR-02 | Core | File input restricted per tool (`accept` list) with validation | Must | Done |
| FR-03 | Organize | Merge, split, remove, extract, organize with page-spec parser (e.g. 1-3,5) | Must | Done |
| FR-04 | Convert | Office and image conversions listed in Features | Should | Done (text/data fidelity, not exact layout) |
| FR-05 | OCR | Local OCR with tesseract.js | Should | Done |
| FR-06 | Output | Download result via file-saver / Blob | Must | Done |
| FR-07 | Hosting | Static SPA with rewrite to index.html | Must | Done |


## 9. Non-functional requirements

| ID | Category | Requirement | Current status |
|---|---|---|---|
| NFR-01 | Privacy | No file ever leaves the browser | Met |
| NFR-02 | Cost | No server; static hosting | Met |
| NFR-03 | Performance | Large PDFs limited by device memory; OCR is CPU heavy | Partly met |
| NFR-04 | Compatibility | Modern Chromium, Firefox, Safari | Met |
| NFR-05 | Maintainability | Single 1,140-line `main.jsx` | Partly met — should be split into modules |


## 10. User experience and key flows


### Merge PDFs

1. Open convert.hirav.me and choose Merge PDF
1. Add files and arrange the order
1. Click Run — pdf-lib copies pages into a new document in the browser
1. The merged file downloads immediately


## 11. Success metrics (KPIs)

| Metric | Target | How it is measured |
|---|---|---|
| Tool success rate | > 99% for valid files | Manual test set |
| Time to result (10-page PDF merge) | < 2 s on a laptop | Manual timing |
| Uploads to any server | 0 | Browser network tab |


## 12. Assumptions, constraints and dependencies


### Assumptions

- Users run a modern browser with enough memory for their files.


### Constraints

- No server-side rendering engines; everything must run in JavaScript/WebAssembly.


### External dependencies

| Dependency | Used for | Risk if unavailable |
|---|---|---|
| Vercel | Static hosting and SPA rewrite | Site offline |
| pdf-lib | Create/modify PDFs | Core features |
| pdfjs-dist | Read and render PDF pages (worker) | Rendering/text extraction |
| mammoth / docx | Read/write Word files | Word conversions |
| pptxgenjs / JSZip | Write PowerPoint; read Office zip packages | PowerPoint/Excel conversions |
| tesseract.js | Local OCR (downloads language data from a CDN) | OCR fails offline |


## 13. Release plan and roadmap

| Phase | Scope | Status |
|---|---|---|
| v1 (2026-05-29) | 20 tools, Vercel deploy at convert.hirav.me | Done |
| v1.1 | Split main.jsx into modules; add automated tests with sample files | Planned |
| v2 | Password protect/unlock, watermark, page numbers, image compression via WebAssembly | Proposed |


## 14. Open questions

- Should the repository get an open-source LICENSE (the name says "open-source" but no licence file exists)?
- Is ~/pdf-toolbox-web on the owner's Mac the same project (package name matches)?


## 15. Acceptance and sign-off

| Role | Name | Decision | Date |
|---|---|---|---|
| Product owner | Hirav Kadikar | Approved (baseline of current build) | 2026-09-25 |
