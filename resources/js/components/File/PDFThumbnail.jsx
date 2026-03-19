import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

function ConfirmModal({ type, onConfirm, onCancel }) {
    const [remarks, setRemarks] = useState("");
    const isVerify = type === "verify";
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-[380px] p-6 animate-[filamentModal_0.2s_ease-out]">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                    {isVerify ? "Verify Document" : "Return Document"}
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {isVerify
                        ? "Are you sure you want to verify this document?"
                        : "Provide remarks before returning this document."}
                </p>

                {!isVerify && (
                    <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Reason for return…"
                        rows={3}
                        className="w-full border border-gray-200 dark:border-gray-700
                                   bg-white dark:bg-gray-800
                                   text-gray-800 dark:text-gray-100
                                   rounded-lg p-2 mb-4 text-sm resize-none
                                   focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                )}

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-1.5 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(remarks)}
                        disabled={!isVerify && !remarks.trim()}
                        className={`px-4 py-1.5 rounded-lg text-sm text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                    ${isVerify
                                        ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                    >
                        {isVerify ? "Verify" : "Return"}
                    </button>
                </div>
            </div>
        </div>
    )
}

function StatusBadge({ status }) {
    const styles = {
        verified: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
        returned: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    };

    return (
        <span className={`px-3 py-1 rounded text-xs font-medium ${styles[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

export default function PDFThumbnail({ 
    url, 
    actions = null
}) {
    const [showModal, setShowModal] = useState(false);
    const [textField, setTextField] = useState("");
    const [modalType, setModalType] = useState(null);
    const [error, setError]  = useState(false);
    // const isAdmin = roles?.includes("super_admin") || roles?.includes("SPMO");
    const canvasRef = useRef();

    useEffect(() => {
        if (!url) return;
        let cancelled = false;
        (async () => {
            try {
                const pdf = await pdfjsLib.getDocument(url).promise;
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 0.3 });
                const canvas = canvasRef.current;

                if (!canvas || cancelled) return;

                canvas.height = viewport.height;
                canvas.width  = viewport.width;

                await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
            } catch (err) {
                if (!cancelled) setError(true);
            }
        })();

        return () => { cancelled = true; };
    }, [url]);

    const handleConfirm = async (remarks) => {
        setModalType(null);
        await actions?.onAction?.(modalType, remarks || null);
    };

    return (
        <div className="relative flex justify-center items-center w-full h-full bg-black rounded-lg border border-gray-200 p-2">
            {actions && (
                <div className="absolute top-2 right-2 flex gap-2 z-10">
                    {actions.status === "verified" || actions.status === "returned" ? (
                        <StatusBadge status={actions.status} />
                    ) : (
                        <div className="flex gap-1">
                            <button
                                onClick={() => setModalType("verify")}
                                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-xs transition-colors">
                                Verify
                            </button>
                            <button
                                onClick={() => setModalType("return")}
                                className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-white text-xs transition-colors">
                                Return
                            </button>
                        </div>
                    )}
                </div>
            )}

            {error ? (
                <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-600 text-xs">
                    <span className="text-2xl">📄</span>
                    <span>Preview unavailable</span>
                </div>
            ) : (
                <canvas
                    ref={canvasRef}
                    className="rounded bg-gray-100 dark:bg-gray-800 max-w-full h-auto shadow-sm"
                />
            )}

            {modalType && (
                <ConfirmModal
                    type={modalType}
                    onConfirm={handleConfirm}
                    onCancel={() => setModalType(null)}
                />
            )}
        </div>
    );
}
