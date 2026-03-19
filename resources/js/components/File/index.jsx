import { useState, useEffect, useRef } from "react";
import PdfViewer from "./PdfViewer";
import Toolbar from "./Toolbar";
import ThumbnailNav from "./ThumbnailNav";
import ImageViewer from "./ImageViewer";
import { motion } from "framer-motion";

export default function FileViewer({ file, onClose }) {
    const [pages, setPages] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1); 
    const [zoom, setZoom] = useState(1);
    const containerRef = useRef(null);

    const isPdf = file?.type?.includes("pdf");
    const isImage = file?.type?.startsWith("image/");
    
    useEffect(() => {
        if (Array.isArray(file?.urls)) {
            setPages(file.urls.map((url, i) => ({ id: i + 1, src: url })));
            setPageCount(file.urls.length);
        } else if (isImage) {
            setPages([{ id: 1, src: file.url }]);
            setPageCount(1);
        }
    }, [file]);
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex flex-col"
            style={{
                backgroundColor: "rgba(0, 0, 0, 0.88)",
                backdropFilter: "blur(2px)",
            }}
        >
            <Toolbar file={file} onClose={onClose} />
            {isPdf && (
                <PdfViewer
                file={file}
                zoom={zoom}
                pages={pages}
                setPages={setPages}
                setPageCount={setPageCount}
                pageCount={pageCount}
                containerRef={containerRef}
                />
            )}

            {isImage && (
                <ImageViewer
                pages={pages}
                containerRef={containerRef}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                zoom={zoom}
                />
            )}

            <ThumbnailNav
                pages={pages}
                zoom={zoom}
                setZoom={setZoom}
                containerRef={containerRef}
                pageCount={pageCount}
            />
        </motion.div>
    );
}

window.mountReactFileViewer = (el, file) => {
    let container = document.getElementById("react-file-viewer-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "react-file-viewer-container";
        document.body.appendChild(container);
    }

    if (container._reactRoot) {
        container._reactRoot.unmount();
    }

    const root = ReactDOM.createRoot(container);

    const handleClose = () => {
        root.unmount();
        container.remove();
    };

    root.render(<FileViewer file={file} onClose={handleClose} />);
    container._reactRoot = root;
};
