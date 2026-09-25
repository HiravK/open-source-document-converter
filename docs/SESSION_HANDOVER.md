# Session Handover — Local PDF Toolbox (open-source-document-converter)

| Field | Value |
|---|---|
| Document ID | PDFTB-HANDOVER |
| Project | Local PDF Toolbox (open-source-document-converter) |
| Repository | [`HiravK/open-source-document-converter`](https://github.com/HiravK/open-source-document-converter) |
| Version | 1.0 |
| Status | Approved — living document |
| Owner | Hirav Kadikar |
| Classification | Public |
| Last updated | 2026-09-25 |

> **Purpose:** Lets the next person (or AI session) pick up the work cold: what exists, what state it is in, what is unfinished, and exactly what to do next.


## 1. Handover summary

| Item | Detail |
|---|---|
| Handover date | 2026-09-25 |
| Handed over by | Hirav Kadikar |
| Repository state | `main` @ `1a74476` — 2 commits, last change 2026-05-29 |
| Overall status | Active — live at convert.hirav.me |
| Live URL | https://convert.hirav.me |
| Health | Green — live and working |


## 2. Current state (plain English)

Version 1 with 20 tools was built and deployed on 2026-05-29 at convert.hirav.me. No work is in progress. The code is
in one large file and has no tests; a licence file is missing despite the "open-source" name.


## 3. What is done

- 20 browser-only tools
- Vercel deployment with custom domain


## 4. In progress / partially done

- Nothing.


## 5. Known issues and bugs

| # | Issue | Impact | Suggested fix |
|---|---|---|---|
| 1 | No LICENSE file | Not legally open source | Add MIT or Apache-2.0 |
| 2 | All logic in src/main.jsx (1,140 lines) | Hard to maintain | Split into tools/ modules |
| 3 | "Compress" only re-saves the file | Little size reduction for image-heavy PDFs | Add image downsampling (WebAssembly) |
| 4 | "PDF/A" is PDF/A-style only | Not compliant for archival submission | Label clearly or use a validator-backed tool |
| 5 | Encrypted PDFs are loaded with ignoreEncryption | Output may be wrong | Detect and warn |


## 6. Next steps (prioritised)

1. Add a LICENSE.
1. Split main.jsx and add per-tool tests.
1. Improve compression and add password/watermark tools.


## 7. How to resume work in 10 minutes

```bash
git clone https://github.com/HiravK/open-source-document-converter.git
cd open-source-document-converter
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/
```


## 8. Access, accounts and secrets

Secrets are **never** stored in this repository. The table lists where each credential lives, not its value.

| System | What you need | Where it lives |
|---|---|---|
| GitHub HiravK/open-source-document-converter | Write | GitHub |
| Vercel project for convert.hirav.me | Team access | vercel.com |
| Cloudflare DNS for hirav.me | DNS edit | dash.cloudflare.com |


## 9. Gotchas and tribal knowledge

- The pdf.js worker is imported with `?url` so Vite bundles it — keep that import when upgrading pdfjs-dist.
- `npm run dev` binds to 0.0.0.0 so phones on the same Wi-Fi can test.


## 10. Key files to read first

| File | Why |
|---|---|
| `src/main.jsx` | Everything |
| `vercel.json` | SPA rewrite |


## 11. Recent history

```text
2026-05-29  1a74476  add vite.config.js
2026-05-29  a1a2e52  initial commit
```


## 12. Handover checklist

- [ ] Repository builds from a clean clone using the README steps
- [ ] Environment variables documented in the README / runbook
- [ ] Open risks recorded in the risk register
- [ ] Next steps above agreed with the product owner
- [ ] Access to hosting / third-party accounts transferred or shared
