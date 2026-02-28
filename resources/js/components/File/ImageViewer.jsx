import React from "react";
import { motion } from "framer-motion";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function ImageViewer({ pages, currentPage, zoom, containerRef}) {
    const currentImage = pages.find((p) => p.id === currentPage);
    
    if (!currentImage) return (
        <div className="flex-1 flex items-center justify-center bg-black/40">
            <p className="text-sm text-white/50">No image to display.</p>
        </div>
    );

    return (
        <div ref={containerRef} className="flex-1 overflow-auto flex items-center justify-center p-6 bg-black/40">
            <TransformWrapper
                initialScale={zoom}
                minScale={0.5}
                maxScale={4}
                centerOnInit
            >
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="flex items-center justify-center">
                    <motion.img
                        key={currentImage.id}
                        src={currentImage.src}
                        alt={currentImage.alt ?? `Page ${currentPage}`}
                        className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg object-contain select-none"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        draggable={false}
                    />
                </TransformComponent>
            </TransformWrapper>
        </div>
    );
}