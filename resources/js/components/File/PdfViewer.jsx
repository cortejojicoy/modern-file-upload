import { useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import "pdfjs-dist/web/pdf_viewer.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function PdfViewer({ file, zoom, pages, setPages, pageCount, setPageCount, containerRef }) {
  useEffect(() => {
    const loadPdf = async () => {
      const loadingTask = pdfjsLib.getDocument(file.url);
      const pdf = await loadingTask.promise;
      setPageCount(pdf.numPages);

      const loadedPages = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        loadedPages.push(page);
      }
      setPages(loadedPages);
    };

    loadPdf();
  }, [file.url, setPages, setPageCount]);

  useEffect(() => {
    const renderPages = async () => {
      pages.forEach(async (page, i) => {
        const canvas = document.getElementById(`page-${i + 1}`);
        if (!canvas) return;
        const context = canvas.getContext("2d");

        const viewport = page.getViewport({ scale: zoom });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        context.clearRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: context, viewport }).promise;
      });
    };

    if (pages.length > 0) renderPages();
  }, [zoom, pages]);

  return (
    <div ref={containerRef} className="flex-1 overflow-auto p-6 bg-black/40">
      {Array.from({ length: pageCount }).map((_, i) => (
        <canvas
          key={i}
          id={`page-${i + 1}`}
          className="pdf-page mb-6 mx-auto rounded shadow-2xl
          bg-white transition-transform duration-200"
        />
      ))}
    </div>
  );
}
