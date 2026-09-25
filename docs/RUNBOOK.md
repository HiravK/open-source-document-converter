# Operations Runbook — Local PDF Toolbox (open-source-document-converter)

| Field | Value |
|---|---|
| Document ID | PDFTB-RUNBOOK |
| Project | Local PDF Toolbox (open-source-document-converter) |
| Repository | [`HiravK/open-source-document-converter`](https://github.com/HiravK/open-source-document-converter) |
| Version | 1.0 |
| Status | Approved — living document |
| Owner | Hirav Kadikar |
| Classification | Public |
| Last updated | 2026-09-25 |

> **Purpose:** Step-by-step instructions to set up, deploy, operate, monitor, recover and support the system.


## 1. Service overview

| Item | Detail |
|---|---|
| Service | Local PDF Toolbox (open-source-document-converter) |
| Hosting | Vercel (static Vite build) → https://convert.hirav.me |
| Live URL | https://convert.hirav.me |
| Owner / on-call | Hirav Kadikar |
| Criticality | Low — non-revenue critical |
| Target availability | Best effort (no contractual SLA) |


## 2. Environments

| Environment | Where | Notes |
|---|---|---|
| Local | http://localhost:5173 (`npm run dev`, bound to 0.0.0.0) | Vite dev server |
| Production | Vercel → https://convert.hirav.me | Static `dist/` |


## 3. Local setup


### Prerequisites

- Node.js 20+
- npm


### Steps

```bash
git clone https://github.com/HiravK/open-source-document-converter.git
cd open-source-document-converter
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/
```


## 4. Configuration and secrets

No configuration required.


## 5. Build and release

1. Push to `main`; Vercel builds automatically (framework preset Vite).
1. Check https://convert.hirav.me and run two or three tools.


## 6. Rollback

1. Revert the offending commit on the default branch (`git revert <sha>`) and push; the host redeploys the previous good state.
1. If the host keeps previous deployments (e.g. Vercel/Netlify), promote the last good deployment from the dashboard for an instant rollback.


## 7. Monitoring and logging

No monitoring is configured. Minimum recommendation: an uptime check on the live URL and error alerts from the host.


## 8. Backup and disaster recovery

No data to back up; code in Git.

| Metric | Target |
|---|---|
| RPO (max data loss) | 0 — code is in Git |
| RTO (max downtime) | < 1 hour — redeploy from Git |


## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Tool never finishes on a huge PDF | Browser memory limit | Use a smaller file or desktop browser |
| OCR stuck at 0% | Language data blocked/offline | Allow the tesseract CDN; retry online |
| Word/PowerPoint output looks different | In-browser conversion keeps text, not exact layout | Expected (documented) |


## 10. Incident response

1. **Detect** — alert, user report or failed check.
1. **Triage** — confirm impact; classify: SEV1 (site down / data exposed), SEV2 (major feature broken), SEV3 (minor).
1. **Mitigate** — roll back (section 6) before debugging if users are affected.
1. **Fix** — reproduce locally, patch on a branch, test, deploy.
1. **Review** — write a short blameless post-mortem: timeline, root cause, actions; add new risks to the risk register.


## 11. Routine maintenance

- Monthly: update dependencies and re-run the test plan.
- Quarterly: rotate secrets and review access.
- Per release: update CHANGELOG.md and the session handover.
