import { ZoomIn, ZoomOut } from "lucide-react";

export default function ThumbnailNav({ pages, zoom, setZoom, containerRef, pageCount }) {
  const scrollToPage = (index) => {
    const pageEl = document.getElementById(`page-${index + 1}`);
    if (pageEl && containerRef.current) {
      containerRef.current.scrollTo({
        top: pageEl.offsetTop - 20,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col items-center p-3 bg-black/40 text-white backdrop-blur-sm gap-3">
      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto max-w-full pb-2">
        {pages.map((_, i) => (
          <button
            key={i}
            className="w-5 h-5 bg-black/40 rounded-sm flex-shrink-0 hover:ring-2 hover:ring-blue-400 transition-all duration-150"
            onClick={() => scrollToPage(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Zoom controls */}
      <div className="flex gap-4 items-center">
        <button onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}>
          <ZoomOut />
        </button>
        <span className="text-sm opacity-80">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => z + 0.1)}>
          <ZoomIn />
        </button>
      </div>
    </div>
  );
}