import React, { useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { saveAs } from "file-saver";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  Combine,
  Edit3,
  FileImage,
  FileSpreadsheet,
  FileText,
  ImagePlus,
  Layers,
  Minimize2,
  RotateCcw,
  Scissors,
  SearchCheck,
  Trash2,
  Wrench,
} from "lucide-react";
import "./styles.css";

const CATEGORIES = [
  {
    title: "Organize PDF",
    tools: [
      "merge-pdf",
      "split-pdf",
      "remove-pages",
      "extract-pages",
      "organize-pdf",
      "scan-to-pdf",
    ],
  },
  { title: "Optimize PDF", tools: ["compress-pdf", "repair-pdf", "ocr-pdf"] },
  {
    title: "Convert To PDF",
    tools: ["jpg-to-pdf", "word-to-pdf", "powerpoint-to-pdf", "excel-to-pdf", "html-to-pdf"],
  },
  {
    title: "Convert From PDF",
    tools: [
      "pdf-to-jpg",
      "pdf-to-word",
      "pdf-to-powerpoint",
      "pdf-to-excel",
      "pdf-to-pdfa",
    ],
  },
];

const TOOLS = {
  "merge-pdf": {
    title: "Merge PDF",
    description: "Combine PDFs in your selected order.",
    accept: ".pdf",
    multiple: true,
    minFiles: 2,
    icon: Combine,
    tone: "coral",
    action: mergePdf,
  },
  "split-pdf": {
    title: "Split PDF",
    description: "Create one PDF per page.",
    accept: ".pdf",
    icon: Scissors,
    tone: "coral",
    action: splitPdf,
  },
  "compress-pdf": {
    title: "Compress PDF",
    description: "Re-save and clean PDF object data.",
    accept: ".pdf",
    icon: Minimize2,
    tone: "green",
    action: compressPdf,
  },
  "pdf-to-word": {
    title: "PDF to Word",
    description: "Extract PDF text into an editable DOCX.",
    accept: ".pdf",
    icon: FileText,
    tone: "blue",
    action: pdfToWord,
  },
  "pdf-to-powerpoint": {
    title: "PDF to PowerPoint",
    description: "Render each PDF page into a PPTX slide.",
    accept: ".pdf",
    icon: Layers,
    tone: "orange",
    action: pdfToPowerPoint,
  },
  "pdf-to-excel": {
    title: "PDF to Excel",
    description: "Extract PDF text lines into workbook sheets.",
    accept: ".pdf",
    icon: FileSpreadsheet,
    tone: "green",
    action: pdfToExcel,
  },
  "word-to-pdf": {
    title: "Word to PDF",
    description: "Convert DOCX text into a browser-made PDF.",
    accept: ".docx",
    icon: FileText,
    tone: "blue",
    action: wordToPdf,
  },
  "powerpoint-to-pdf": {
    title: "PowerPoint to PDF",
    description: "Convert PPTX slide text into PDF pages.",
    accept: ".pptx",
    icon: Layers,
    tone: "orange",
    action: powerPointToPdf,
  },
  "excel-to-pdf": {
    title: "Excel to PDF",
    description: "Convert workbook values into PDF pages.",
    accept: ".xlsx,.xls",
    icon: FileSpreadsheet,
    tone: "green",
    action: excelToPdf,
  },
  "edit-pdf": {
    title: "Edit PDF",
    description: "Add text to the first page.",
    accept: ".pdf",
    icon: Edit3,
    tone: "purple",
    action: editPdf,
    needsText: true,
  },
  "pdf-to-jpg": {
    title: "PDF to JPG",
    description: "Render each PDF page as a JPG image.",
    accept: ".pdf",
    icon: FileImage,
    tone: "yellow",
    action: pdfToJpg,
  },
  "jpg-to-pdf": {
    title: "JPG to PDF",
    description: "Create a PDF from image files.",
    accept: "image/jpeg,image/png,image/webp",
    multiple: true,
    icon: ImagePlus,
    tone: "yellow",
    action: imagesToPdf,
  },
  "repair-pdf": {
    title: "Repair PDF",
    description: "Load and re-save damaged PDF structure.",
    accept: ".pdf",
    icon: Wrench,
    tone: "green",
    action: repairPdf,
  },
  "ocr-pdf": {
    title: "OCR PDF",
    description: "Run OCR locally and export searchable text as PDF.",
    accept: ".pdf",
    icon: SearchCheck,
    tone: "green",
    action: ocrPdf,
  },
  "remove-pages": {
    title: "Remove Pages",
    description: "Remove pages listed in the page box.",
    accept: ".pdf",
    icon: Trash2,
    tone: "coral",
    action: removePages,
    needsPages: true,
  },
  "extract-pages": {
    title: "Extract Pages",
    description: "Save selected pages as a new PDF.",
    accept: ".pdf",
    icon: ArrowDownToLine,
    tone: "coral",
    action: extractPages,
    needsPages: true,
  },
  "organize-pdf": {
    title: "Organize PDF",
    description: "Reorder pages using a page sequence.",
    accept: ".pdf",
    icon: ArrowLeftRight,
    tone: "coral",
    action: organizePdf,
    needsPages: true,
  },
  "scan-to-pdf": {
    title: "Scan to PDF",
    description: "Create a PDF from scanned image files.",
    accept: "image/jpeg,image/png,image/webp",
    multiple: true,
    icon: ImagePlus,
    tone: "coral",
    action: imagesToPdf,
  },
  "html-to-pdf": {
    title: "HTML to PDF",
    description: "Convert HTML text content to PDF.",
    accept: ".html,.htm",
    icon: FileText,
    tone: "yellow",
    action: htmlToPdf,
  },
  "pdf-to-pdfa": {
    title: "PDF to PDF/A",
    description: "Create a cleaned archival-style PDF.",
    accept: ".pdf",
    icon: RotateCcw,
    tone: "blue",
    action: pdfToPdfa,
  },
};

function App() {
  const [selectedId, setSelectedId] = useState("merge-pdf");
  const [files, setFiles] = useState([]);
  const [pages, setPages] = useState("1");
  const [editText, setEditText] = useState("Added locally");
  const [status, setStatus] = useState("Choose a tool and files.");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const picker = useRef(null);
  const tool = TOOLS[selectedId];

  const featured = useMemo(
    () => [
      "merge-pdf",
      "split-pdf",
      "compress-pdf",
      "pdf-to-word",
      "pdf-to-powerpoint",
      "pdf-to-excel",
      "word-to-pdf",
      "powerpoint-to-pdf",
      "excel-to-pdf",
      "edit-pdf",
      "pdf-to-jpg",
      "jpg-to-pdf",
    ],
    []
  );

  async function runTool() {
    if (!files.length) {
      setStatus("Select at least one file.");
      return;
    }
    setBusy(true);
    setStatus("Processing in this browser tab...");
    try {
      if (tool.minFiles && files.length < tool.minFiles) {
        setStatus(`${tool.title} needs at least ${tool.minFiles} files.`);
        return;
      }
      await tool.action(files, { pages, editText, setStatus });
      setStatus("Done. Your output was downloaded.");
    } catch (error) {
      console.error(error);
      setStatus(error?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function chooseTool(id) {
    setSelectedId(id);
    setFiles([]);
    if (picker.current) picker.current.value = "";
    setStatus("Choose files for this tool.");
  }

  function acceptFiles(nextFiles) {
    const valid = nextFiles.filter((file) => fileMatchesAccept(file, tool.accept));
    if (!valid.length) {
      setStatus(`This tool accepts: ${tool.accept}`);
      return;
    }
    setFiles(tool.multiple ? valid : [valid[0]]);
    const size = valid.reduce((total, file) => total + file.size, 0);
    setStatus(`${valid.length} file${valid.length === 1 ? "" : "s"} ready (${formatBytes(size)}).`);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    acceptFiles(Array.from(event.dataTransfer.files || []));
  }

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">Browser-only PDF tools</p>
          <h1>Local PDF Toolbox</h1>
          <p className="lede">
            Merge, split, compress, convert, OCR, and edit files without a backend upload.
            Vercel serves the app; your browser does the work.
          </p>
        </div>
        <div className="privacy">No server processing</div>
      </section>

      <section className="featured-grid" aria-label="Popular tools">
        {featured.map((id) => (
          <ToolCard key={id} id={id} selected={selectedId === id} onSelect={chooseTool} />
        ))}
      </section>

      <section className="workspace">
        <div className="panel">
          <div className="tool-heading">
            <ToolIcon tool={tool} />
            <div>
              <h2>{tool.title}</h2>
              <p>{tool.description}</p>
            </div>
          </div>

          <input
            key={selectedId}
            ref={picker}
            type="file"
            accept={tool.accept}
            multiple={tool.multiple}
            onChange={(event) => acceptFiles(Array.from(event.target.files || []))}
            hidden
          />
          <div
            className={dragging ? "upload-zone dragging" : "upload-zone"}
            onDragEnter={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            <button className="upload" onClick={() => picker.current?.click()}>
              Select {tool.multiple ? "files" : "file"}
            </button>
            <p>{tool.accept}</p>
          </div>
          <div className="file-list">
            {files.length ? files.map((file) => (
              <span key={`${file.name}-${file.size}`}>{file.name} <em>{formatBytes(file.size)}</em></span>
            )) : "No files selected"}
          </div>
          {files.length > 0 && (
            <button className="clear" onClick={() => {
              setFiles([]);
              if (picker.current) picker.current.value = "";
              setStatus("Files cleared.");
            }}>
              Clear files
            </button>
          )}

          {tool.needsPages && (
            <label className="field">
              <span>Pages or order</span>
              <input value={pages} onChange={(event) => setPages(event.target.value)} placeholder="1,3-5" />
            </label>
          )}

          {tool.needsText && (
            <label className="field">
              <span>Text to add</span>
              <input value={editText} onChange={(event) => setEditText(event.target.value)} />
            </label>
          )}

          <button className="run" disabled={busy} onClick={runTool}>
            {busy ? "Processing..." : `Run ${tool.title}`}
          </button>
          <p className="status">{status}</p>
        </div>

        <div className="directory">
          {CATEGORIES.map((category) => (
            <div key={category.title}>
              <h3>{category.title}</h3>
              {category.tools.map((id) => (
                <button key={id} className={selectedId === id ? "active link-tool" : "link-tool"} onClick={() => chooseTool(id)}>
                  <ToolIcon tool={TOOLS[id]} small />
                  {TOOLS[id].title}
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function ToolCard({ id, selected, onSelect }) {
  const tool = TOOLS[id];
  return (
    <button className={selected ? "card selected" : "card"} onClick={() => onSelect(id)}>
      <ToolIcon tool={tool} />
      <strong>{tool.title}</strong>
      <span>{tool.description}</span>
    </button>
  );
}

function ToolIcon({ tool, small = false }) {
  const Icon = tool.icon;
  return (
    <span className={`icon ${tool.tone} ${small ? "small" : ""}`}>
      <Icon size={small ? 16 : 24} strokeWidth={2.3} />
    </span>
  );
}

async function mergePdf(files) {
  const output = await PDFDocument.create();
  for (const file of files) {
    const pdf = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
    const pages = await output.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => output.addPage(page));
  }
  downloadBytes(await output.save(), "merged.pdf", "application/pdf");
}

async function splitPdf(files) {
  const { default: JSZip } = await import("jszip");
  const source = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  const zip = new JSZip();
  for (const index of source.getPageIndices()) {
    const output = await PDFDocument.create();
    const [page] = await output.copyPages(source, [index]);
    output.addPage(page);
    zip.file(`${baseName(files[0])}-page-${index + 1}.pdf`, await output.save());
  }
  saveAs(await zip.generateAsync({ type: "blob" }), `${baseName(files[0])}-split.zip`);
}

async function compressPdf(files) {
  const source = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  downloadBytes(await source.save({ useObjectStreams: true }), `${baseName(files[0])}-compressed.pdf`, "application/pdf");
}

async function repairPdf(files) {
  const source = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  downloadBytes(await source.save({ useObjectStreams: true }), `${baseName(files[0])}-repaired.pdf`, "application/pdf");
}

async function extractPages(files, options) {
  const source = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  const indexes = parsePageSpec(options.pages, source.getPageCount());
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indexes);
  pages.forEach((page) => output.addPage(page));
  downloadBytes(await output.save(), `${baseName(files[0])}-extracted.pdf`, "application/pdf");
}

async function removePages(files, options) {
  const source = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  const remove = new Set(parsePageSpec(options.pages, source.getPageCount()));
  const keep = source.getPageIndices().filter((index) => !remove.has(index));
  if (!keep.length) throw new Error("Cannot remove every page.");
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, keep);
  pages.forEach((page) => output.addPage(page));
  downloadBytes(await output.save(), `${baseName(files[0])}-pages-removed.pdf`, "application/pdf");
}

async function organizePdf(files, options) {
  const source = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  const indexes = parsePageSpec(options.pages, source.getPageCount());
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indexes);
  pages.forEach((page) => output.addPage(page));
  downloadBytes(await output.save(), `${baseName(files[0])}-organized.pdf`, "application/pdf");
}

async function pdfToWord(files) {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");
  const pages = await extractPdfText(files[0]);
  const doc = new Document({
    sections: [
      {
        children: pages.flatMap((page, index) => [
          new Paragraph({ children: [new TextRun({ text: `Page ${index + 1}`, bold: true })] }),
          ...page.split("\n").map((line) => new Paragraph(line)),
        ]),
      },
    ],
  });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${baseName(files[0])}.docx`);
}

async function pdfToExcel(files) {
  const pages = await extractPdfText(files[0]);
  const sheets = pages.map((text, index) => ({
    name: `Page ${index + 1}`,
    rows: text.split("\n").filter(Boolean).map((line) => [line]),
  }));
  saveAs(await createXlsx(sheets), `${baseName(files[0])}.xlsx`);
}

async function pdfToPowerPoint(files, options) {
  const { default: PptxGenJS } = await import("pptxgenjs");
  const images = await renderPdfPages(files[0], 1.5, "image/png");
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  images.forEach((image) => {
    const slide = pptx.addSlide();
    slide.addImage({ data: image, x: 0, y: 0, w: 13.333, h: 7.5 });
  });
  await pptx.writeFile({ fileName: `${baseName(files[0])}.pptx` });
  options.setStatus("Done. PPTX pages are images, which keeps visual fidelity.");
}

async function pdfToJpg(files, options) {
  const { default: JSZip } = await import("jszip");
  const images = await renderPdfPages(files[0], 2, "image/jpeg");
  const zip = new JSZip();
  for (let index = 0; index < images.length; index += 1) {
    options.setStatus(`Packaging JPG page ${index + 1} of ${images.length}...`);
    zip.file(`${baseName(files[0])}-page-${index + 1}.jpg`, dataUrlToUint8Array(images[index]));
  }
  saveAs(await zip.generateAsync({ type: "blob" }), `${baseName(files[0])}-jpg.zip`);
}

async function imagesToPdf(files) {
  const output = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const image = file.type.includes("png")
      ? await output.embedPng(bytes)
      : await output.embedJpg(await normalizeImageToJpeg(file));
    const page = output.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  downloadBytes(await output.save(), "images.pdf", "application/pdf");
}

async function wordToPdf(files) {
  const mammothModule = await import("mammoth/mammoth.browser");
  const mammoth = mammothModule.default ?? mammothModule;
  const result = await mammoth.extractRawText({ arrayBuffer: await files[0].arrayBuffer() });
  const pdf = await textPdf(result.value || files[0].name);
  downloadBytes(pdf, `${baseName(files[0])}.pdf`, "application/pdf");
}

async function powerPointToPdf(files) {
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(await files[0].arrayBuffer());
  const slideNames = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort(naturalSort);
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  let renderedSlides = 0;

  for (const name of slideNames) {
    const text = await extractPowerPointSlideText(zip, name);
    const images = await extractPowerPointSlideImages(zip, name);
    const page = pdf.addPage([960, 540]);

    if (images.length) {
      await drawBestSlideImage(pdf, page, images);
      renderedSlides += 1;
      if (text) {
        drawTextLines(page, text, font, {
          x: 36,
          y: 504,
          width: 888,
          maxLines: 5,
          size: 10,
          color: rgb(0.05, 0.06, 0.08),
        });
      }
      continue;
    }

    if (text) {
      drawTextLines(page, text, font, {
        x: 48,
        y: 486,
        width: 864,
        maxLines: 28,
        size: 16,
        color: rgb(0.08, 0.1, 0.14),
      });
      renderedSlides += 1;
      continue;
    }

    drawTextLines(page, "No extractable text or supported slide image found.", font, {
      x: 48,
      y: 486,
      width: 864,
      maxLines: 2,
      size: 16,
      color: rgb(0.4, 0.44, 0.52),
    });
  }
  if (!slideNames.length) throw new Error("No slides found in this PowerPoint file.");
  if (!renderedSlides) {
    throw new Error("No extractable PowerPoint text or supported slide images found. This browser-only tool cannot render complex native PowerPoint artwork.");
  }
  downloadBytes(await pdf.save(), `${baseName(files[0])}.pdf`, "application/pdf");
}

async function excelToPdf(files) {
  const text = await readXlsxText(files[0]);
  downloadBytes(await textPdf(text), `${baseName(files[0])}.pdf`, "application/pdf");
}

async function htmlToPdf(files) {
  const markup = await files[0].text();
  const text = new DOMParser().parseFromString(markup, "text/html").body.textContent || markup;
  downloadBytes(await textPdf(text), `${baseName(files[0])}.pdf`, "application/pdf");
}

async function editPdf(files, options) {
  const pdf = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  const page = pdf.getPage(0);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const { height } = page.getSize();
  page.drawText(options.editText || "Added locally", {
    x: 54,
    y: height - 80,
    size: 18,
    font,
    color: rgb(0.08, 0.1, 0.14),
  });
  downloadBytes(await pdf.save(), `${baseName(files[0])}-edited.pdf`, "application/pdf");
}

async function ocrPdf(files, options) {
  const { createWorker } = await import("tesseract.js");
  const images = await renderPdfPages(files[0], 2, "image/png");
  const worker = await createWorker("eng");
  const lines = [];
  for (let index = 0; index < images.length; index += 1) {
    options.setStatus(`OCR page ${index + 1} of ${images.length} locally...`);
    const { data } = await worker.recognize(images[index]);
    lines.push(`Page ${index + 1}\n${data.text}`);
  }
  await worker.terminate();
  downloadBytes(await textPdf(lines.join("\n\n")), `${baseName(files[0])}-ocr.pdf`, "application/pdf");
}

async function pdfToPdfa(files) {
  const pdf = await PDFDocument.load(await files[0].arrayBuffer(), { ignoreEncryption: true });
  pdf.setProducer("Local PDF Toolbox browser PDF/A-style export");
  pdf.setCreator("Local PDF Toolbox");
  downloadBytes(await pdf.save({ useObjectStreams: true }), `${baseName(files[0])}-pdfa-style.pdf`, "application/pdf");
}

async function extractPdfText(file) {
  const pdfjs = await loadPdfjs();
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const text = await page.getTextContent();
    pages.push(text.items.map((item) => item.str).join("\n"));
  }
  return pages;
}

async function renderPdfPages(file, scale, type) {
  const pdfjs = await loadPdfjs();
  const pdf = await pdfjs.getDocument({
    data: await file.arrayBuffer(),
    disableFontFace: false,
    useSystemFonts: true,
  }).promise;
  const images = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas rendering is not available in this browser.");
    context.save();
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
    await page.render({
      canvas,
      canvasContext: context,
      viewport,
      background: "white",
    }).promise;
    const dataUrl = canvas.toDataURL(type, 0.92);
    if (!dataUrl || dataUrl === "data:,") {
      throw new Error(`Could not render page ${pageNumber}.`);
    }
    images.push(dataUrl);
    page.cleanup();
  }
  await pdf.destroy();
  return images;
}

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
  return pdfjs;
}

async function createXlsx(sheets) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const safeSheets = sheets.map((sheet, index) => ({
    name: sanitizeSheetName(sheet.name || `Sheet ${index + 1}`),
    rows: sheet.rows || [],
  }));

  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  ${safeSheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}
</Types>`);
  zip.folder("_rels").file(".rels", `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`);
  zip.folder("xl").file("workbook.xml", `<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    ${safeSheets.map((sheet, index) => `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("")}
  </sheets>
</workbook>`);
  zip.folder("xl").folder("_rels").file("workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${safeSheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("")}
</Relationships>`);

  const worksheets = zip.folder("xl").folder("worksheets");
  safeSheets.forEach((sheet, sheetIndex) => {
    const rows = sheet.rows.map((row, rowIndex) => {
      const cells = row.map((cell, columnIndex) => {
        const ref = `${columnName(columnIndex + 1)}${rowIndex + 1}`;
        return `<c r="${ref}" t="inlineStr"><is><t>${escapeXml(String(cell ?? ""))}</t></is></c>`;
      }).join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    }).join("");
    worksheets.file(`sheet${sheetIndex + 1}.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rows}</sheetData>
</worksheet>`);
  });

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

async function readXlsxText(file) {
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const parser = new DOMParser();
  const sharedStrings = await readSharedStrings(zip, parser);
  const sheetNames = await readWorkbookSheetNames(zip, parser);
  const sheetFiles = Object.keys(zip.files)
    .filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))
    .sort(naturalSort);

  if (!sheetFiles.length) throw new Error("No worksheets found in this Excel file.");

  const sections = [];
  for (let index = 0; index < sheetFiles.length; index += 1) {
    const xml = await zip.files[sheetFiles[index]].async("text");
    const doc = parser.parseFromString(xml, "application/xml");
    const lines = [sheetNames[index] || `Sheet ${index + 1}`];
    Array.from(doc.getElementsByTagName("row")).forEach((row) => {
      const values = Array.from(row.getElementsByTagName("c"))
        .map((cell) => readCellValue(cell, sharedStrings))
        .filter((value) => value !== "");
      if (values.length) lines.push(values.join("    "));
    });
    sections.push(lines.join("\n"));
  }
  return sections.join("\n\n");
}

async function readSharedStrings(zip, parser) {
  const file = zip.files["xl/sharedStrings.xml"];
  if (!file) return [];
  const doc = parser.parseFromString(await file.async("text"), "application/xml");
  return Array.from(doc.getElementsByTagName("si")).map((item) =>
    Array.from(item.getElementsByTagName("t")).map((node) => node.textContent || "").join("")
  );
}

async function readWorkbookSheetNames(zip, parser) {
  const file = zip.files["xl/workbook.xml"];
  if (!file) return [];
  const doc = parser.parseFromString(await file.async("text"), "application/xml");
  return Array.from(doc.getElementsByTagName("sheet")).map((sheet) => sheet.getAttribute("name") || "");
}

function readCellValue(cell, sharedStrings) {
  const type = cell.getAttribute("t");
  const inline = cell.getElementsByTagName("is")[0];
  if (inline) {
    return Array.from(inline.getElementsByTagName("t")).map((node) => node.textContent || "").join("");
  }
  const raw = cell.getElementsByTagName("v")[0]?.textContent || "";
  if (type === "s") return sharedStrings[Number.parseInt(raw, 10)] || "";
  return raw;
}

function sanitizeSheetName(name) {
  return name.replace(/[\[\]:*?/\\]/g, " ").slice(0, 31) || "Sheet";
}

function columnName(index) {
  let name = "";
  while (index > 0) {
    const mod = (index - 1) % 26;
    name = String.fromCharCode(65 + mod) + name;
    index = Math.floor((index - mod) / 26);
  }
  return name;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function textPdf(text) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const size = 11;
  const margin = 54;
  const lineHeight = 15;
  let page = pdf.addPage();
  let { width, height } = page.getSize();
  let y = height - margin;
  const drawLine = (line) => {
    const safeLine = toPdfWinAnsi(line);
    if (y < margin) {
      page = pdf.addPage();
      ({ width, height } = page.getSize());
      y = height - margin;
    }
    page.drawText(safeLine, { x: margin, y, size, font, color: rgb(0.08, 0.1, 0.14) });
    y -= lineHeight;
  };
  text.split(/\r?\n/).forEach((raw) => {
    const words = toPdfWinAnsi(raw).split(/\s+/);
    let line = "";
    words.forEach((word) => {
      const next = `${line} ${word}`.trim();
      if (font.widthOfTextAtSize(next, size) < width - margin * 2) {
        line = next;
      } else {
        drawLine(line);
        line = word;
      }
    });
    drawLine(line || " ");
  });
  return pdf.save();
}

function parsePageSpec(spec, pageCount) {
  const pages = [];
  spec.split(",").forEach((part) => {
    const value = part.trim();
    if (!value) return;
    if (value.includes("-")) {
      const [start, end] = value.split("-").map((number) => Number.parseInt(number, 10));
      if (!Number.isInteger(start) || !Number.isInteger(end) || start > end) {
        throw new Error(`Invalid page range: ${value}`);
      }
      for (let page = start; page <= end; page += 1) pages.push(page - 1);
    } else {
      pages.push(Number.parseInt(value, 10) - 1);
    }
  });
  if (!pages.length) {
    throw new Error("Enter at least one page.");
  }
  if (pages.some((page) => !Number.isInteger(page) || page < 0 || page >= pageCount)) {
    throw new Error(`Pages must be between 1 and ${pageCount}.`);
  }
  return pages;
}

function fileMatchesAccept(file, accept) {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() || ""}`;
  const type = file.type.toLowerCase();
  return accept.split(",").some((entry) => {
    const normalized = entry.trim().toLowerCase();
    if (!normalized) return false;
    if (normalized.endsWith("/*")) return type.startsWith(normalized.slice(0, -1));
    if (normalized.startsWith(".")) return extension === normalized;
    if (type === normalized) return true;
    if (normalized === "image/jpeg") return [".jpg", ".jpeg"].includes(extension);
    if (normalized === "image/png") return extension === ".png";
    if (normalized === "image/webp") return extension === ".webp";
    return false;
  });
}

async function normalizeImageToJpeg(file) {
  if (file.type.includes("jpeg") || file.type.includes("jpg")) return file.arrayBuffer();
  const image = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.getContext("2d").drawImage(image, 0, 0);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  return blob.arrayBuffer();
}

async function extractPowerPointSlideText(zip, slidePath) {
  const slideXml = await zip.files[slidePath].async("text");
  const textParts = [extractSlideText(slideXml)];
  const relsPath = slidePath.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels";
  const relsFile = zip.files[relsPath];

  if (relsFile) {
    const relsXml = await relsFile.async("text");
    const relatedPaths = extractRelationshipTargets(relsXml, slidePath)
      .filter((target) => target.endsWith(".xml") && zip.files[target]);
    for (const target of relatedPaths) {
      const relatedXml = await zip.files[target].async("text");
      textParts.push(extractAnyOfficeXmlText(relatedXml));
    }
  }

  return uniqueLines(textParts.join("\n"));
}

async function extractPowerPointSlideImages(zip, slidePath) {
  const relsPath = slidePath.replace("ppt/slides/", "ppt/slides/_rels/") + ".rels";
  const relsFile = zip.files[relsPath];
  if (!relsFile) return [];

  const relsXml = await relsFile.async("text");
  const imagePaths = extractRelationshipTargets(relsXml, slidePath)
    .filter((target) => /\.(png|jpe?g)$/i.test(target) && zip.files[target]);
  const images = [];
  for (const path of imagePaths) {
    images.push({
      path,
      bytes: await zip.files[path].async("uint8array"),
      type: path.toLowerCase().endsWith(".png") ? "png" : "jpg",
    });
  }
  return images;
}

async function drawBestSlideImage(pdf, page, images) {
  let best = null;
  for (const imageFile of images) {
    const image = imageFile.type === "png"
      ? await pdf.embedPng(imageFile.bytes)
      : await pdf.embedJpg(imageFile.bytes);
    const area = image.width * image.height;
    if (!best || area > best.area) {
      best = { image, area };
    }
  }
  if (!best) return;

  const { width, height } = page.getSize();
  const scale = Math.min(width / best.image.width, height / best.image.height);
  const drawWidth = best.image.width * scale;
  const drawHeight = best.image.height * scale;
  page.drawImage(best.image, {
    x: (width - drawWidth) / 2,
    y: (height - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  });
}

function drawTextLines(page, text, font, options) {
  const size = options.size;
  const lineHeight = size * 1.25;
  let y = options.y;
  let linesDrawn = 0;

  String(text).split(/\r?\n/).forEach((raw) => {
    if (linesDrawn >= options.maxLines) return;
    const words = toPdfWinAnsi(raw).split(/\s+/).filter(Boolean);
    let line = "";
    words.forEach((word) => {
      if (linesDrawn >= options.maxLines) return;
      const next = `${line} ${word}`.trim();
      if (font.widthOfTextAtSize(next, size) <= options.width) {
        line = next;
        return;
      }
      if (line) {
        page.drawText(line, { x: options.x, y, size, font, color: options.color });
        y -= lineHeight;
        linesDrawn += 1;
      }
      line = word;
    });
    if (line && linesDrawn < options.maxLines) {
      page.drawText(line, { x: options.x, y, size, font, color: options.color });
      y -= lineHeight;
      linesDrawn += 1;
    }
  });
}

function extractSlideText(xml) {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const parserError = doc.getElementsByTagName("parsererror")[0];
  if (parserError) {
    return extractAnyOfficeXmlText(xml);
  }

  const nodes = Array.from(doc.getElementsByTagName("*")).filter((node) =>
    ["t", "title", "desc"].includes(node.localName)
  );
  const text = nodes
    .map((node) => node.textContent || "")
    .map((value) => value.trim())
    .filter(Boolean)
    .join("\n");
  return text || extractAnyOfficeXmlText(xml);
}

function extractAnyOfficeXmlText(xml) {
  const textTags = Array.from(xml.matchAll(/<(?:[A-Za-z0-9_]+:)?(?:t|title|desc)\b[^>]*>([\s\S]*?)<\/(?:[A-Za-z0-9_]+:)?(?:t|title|desc)>/g))
    .map((match) => decodeXml(match[1]).trim())
    .filter(Boolean);
  return textTags.join("\n");
}

function extractRelationshipTargets(relsXml, sourcePath) {
  const sourceDir = sourcePath.split("/").slice(0, -1).join("/");
  return Array.from(relsXml.matchAll(/<Relationship\b[^>]*\bTarget="([^"]+)"/g))
    .map((match) => decodeXml(match[1]))
    .filter((target) => !target.startsWith("http://") && !target.startsWith("https://"))
    .map((target) => normalizeZipPath(`${sourceDir}/${target}`));
}

function normalizeZipPath(path) {
  const parts = [];
  path.split("/").forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") parts.pop();
    else parts.push(part);
  });
  return parts.join("/");
}

function uniqueLines(text) {
  const seen = new Set();
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => {
      if (!line || seen.has(line)) return false;
      seen.add(line);
      return true;
    })
    .join("\n");
}

function decodeXml(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function toPdfWinAnsi(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replaceAll("→", "->")
    .replaceAll("←", "<-")
    .replaceAll("↔", "<->")
    .replaceAll("–", "-")
    .replaceAll("—", "-")
    .replaceAll("−", "-")
    .replaceAll("“", '"')
    .replaceAll("”", '"')
    .replaceAll("‘", "'")
    .replaceAll("’", "'")
    .replaceAll("•", "*")
    .replaceAll("…", "...")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "?");
}

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true });
}

function downloadBytes(bytes, name, type) {
  saveAs(new Blob([bytes], { type }), name);
}

function dataUrlToUint8Array(dataUrl) {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** exponent).toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function baseName(file) {
  return file.name.replace(/\.[^.]+$/, "");
}

createRoot(document.getElementById("root")).render(<App />);
