# Local PDF Toolbox

A Vercel-ready browser app for common PDF tasks. Files are processed in the
browser with client-side JavaScript libraries; there is no upload endpoint or
backend service.

## Run Locally

```bash
npm install
npm run dev
```

## Deploy To Vercel

Import this folder as a Vercel project.

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Notes

The app runs locally in the browser, including when hosted on Vercel. Exact
Office layout conversion is limited because browsers do not include Microsoft
Office or LibreOffice rendering engines. The Word, PowerPoint, and Excel tools
preserve useful text/data or render PDF pages as images where needed.
