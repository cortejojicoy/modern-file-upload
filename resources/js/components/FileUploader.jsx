import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FileViewer from "../components/File/index";
import PDFThumbnail from "./File/PDFThumbnail";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];

const normalizeRawState = (state, multiple) => {
    if (multiple) {
        if (Array.isArray(state)) {
            return state.filter((value) => value !== null && value !== undefined && value !== "");
        }

        return state ? [state] : [];
    }

    return state ?? null;
};

const isImageFile = (file) => {
    if (file.type?.startsWith("image/")) {
        return true;
    }

    const extension = file.name?.split(".").pop()?.toLowerCase();

    return IMAGE_EXTENSIONS.includes(extension);
};

const getFileIcon = (type) => {
    if (type === "application/pdf") {
        return "PDF";
    }

    if (type?.includes("word")) {
        return "DOC";
    }

    if (type?.includes("sheet") || type?.includes("excel")) {
        return "XLS";
    }

    return "FILE";
};

const formatBytes = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const UploadPlaceholder = ({ multiple, inputId }) => (
    <label
        htmlFor={inputId}
        className="flex h-full w-full cursor-pointer select-none flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500"
    >
        <svg
            className="h-8 w-8 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 16v-8m0 0-3 3m3-3 3 3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"
            />
        </svg>
        <span className="text-sm font-medium">
            {multiple ? "Drag & drop or click to upload" : "Click to upload"}
        </span>
        <span className="text-xs text-gray-300 dark:text-gray-600">
            {multiple ? "Upload multiple files" : "Upload a single file"}
        </span>
    </label>
);

const ProgressCard = ({ fileKey, progress }) => (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2 truncate text-xs text-gray-500 dark:text-gray-400">
            <span>📄</span>
            <span className="truncate">{fileKey.split("-")[0]}</span>
            <span className="ml-auto shrink-0">{progress}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
                className="h-1 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
        </div>
    </div>
);

const FileCard = ({ file, onPreview, onRemove, multiple, fileActionMethod, wire }) => {
    const isImage = isImageFile(file);
    const isPdf = file.type === "application/pdf";

    const actions = (fileActionMethod && file.fileId && !file.isTemp)
        ? {
            status: file.status ?? null,
            onAction: async (type, remarks) => {
                await wire.call(fileActionMethod, file.fileId, type, remarks);
                window.location.reload();
            },
        }
        : null;

    return (
        <div
            className={`relative group cursor-pointer overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${multiple ? "aspect-square" : "flex items-center gap-3 p-2"}`}
            onClick={() => onPreview(file)}
        >
            {isImage ? (
                <img
                    src={file.url}
                    alt={file.name}
                    className={`w-full object-cover ${multiple ? "h-full" : "h-12 w-12 shrink-0 rounded"}`}
                />
            ) : isPdf ? (
                <div className={multiple ? "h-full w-full" : "h-12 w-12 shrink-0"}>
                    <PDFThumbnail
                        url={file.url}
                        action={actions}
                    />
                </div>
            ) : (
                <div className={`flex items-center justify-center bg-gray-50 text-2xl dark:bg-gray-700 ${multiple ? "h-full w-full" : "h-12 w-12 shrink-0 rounded"}`}>
                    {getFileIcon(file.type)}
                </div>
            )}

            {!multiple && (
                <div className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-medium text-gray-700 dark:text-gray-200">
                        {file.name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatBytes(file.size)}
                    </span>
                </div>
            )}

            {multiple && (
                <div className="absolute inset-0 flex flex-col justify-end bg-black/40 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="truncate text-xs font-medium text-white">{file.name}</span>
                    <span className="text-xs text-white/70">{formatBytes(file.size)}</span>
                </div>
            )}

            <button
                type="button"
                onClick={(event) => {
                    event.stopPropagation();
                    onRemove(file);
                }}
                className="absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                aria-label="Remove file"
            >
                ✕
            </button>

            {file.status === "verified" && (
                <div className="absolute right-1 top-1 rounded-full bg-green-500 px-2 py-1 text-[10px] text-white">
                    ✓ Verified
                </div>
            )}
        </div>
    );
};

function FileUploader({
    state,
    setState,
    wire,
    name,
    initialFiles = [],
    multiple = true,
    fileAction = null,
    accept = "*/*",
}) {
    const [files, setFiles] = useState(initialFiles || []);
    const [uploadProgress, setUploadProgress] = useState({});
    const [preview, setPreview] = useState(null);
    const stateRef = useRef(normalizeRawState(state, multiple));
    const inputId = `react-upload-input-${name.replace(/\./g, "-")}`;
    const hasContent = files.length > 0 || Object.keys(uploadProgress).length > 0;
    const fileActionMethod = fileAction?.method ?? null;

    useEffect(() => {
        const normalizedState = normalizeRawState(state, multiple);

        stateRef.current = normalizedState;

        if ((multiple && normalizedState.length === 0) || (!multiple && normalizedState === null)) {
            setFiles([]);
        }
    }, [multiple, state]);

    const syncState = (nextState) => {
        stateRef.current = nextState;

        if (typeof setState === "function") {
            setState(nextState);

            return;
        }

        wire.set(name, nextState);
    };

    const handleChange = (event) => {
        const selectedFiles = Array.from(event.target.files);

        selectedFiles.forEach((file) => {
            const fileKey = `${file.name}-${file.lastModified}`;

            setUploadProgress((prev) => ({ ...prev, [fileKey]: 0 }));

            wire.upload(
                name,
                file,
                async (uploadedStateValue) => {
                    let temporaryUrl = null;

                    try {
                        temporaryUrl = await wire.call("getTempFileUrl", uploadedStateValue);
                    } catch (error) {
                        console.warn("Temporary preview URL is unavailable.", error);
                    }

                    const uploadedFile = {
                        name: file.name,
                        path: uploadedStateValue,
                        stateValue: uploadedStateValue,
                        size: file.size,
                        type: file.type,
                        url: temporaryUrl,
                        isTemp: true,
                    };

                    const nextState = multiple
                        ? [...normalizeRawState(stateRef.current, true), uploadedStateValue]
                        : uploadedStateValue;

                    syncState(nextState);
                    setFiles((prev) => (multiple ? [...prev, uploadedFile] : [uploadedFile]));
                    setUploadProgress((prev) => {
                        const nextProgress = { ...prev };

                        delete nextProgress[fileKey];

                        return nextProgress;
                    });
                },
                (error) => {
                    console.error("Upload failed:", error);
                    setUploadProgress((prev) => {
                        const nextProgress = { ...prev };

                        delete nextProgress[fileKey];

                        return nextProgress;
                    });
                },
                (progressEvent) => {
                    const progress = Math.round((progressEvent.detail.progress / 100) * 100);

                    setUploadProgress((prev) => ({ ...prev, [fileKey]: progress }));
                },
            );
        });

        event.target.value = "";
    };

    const handleRemove = async (fileToRemove) => {
        const nextState = multiple
            ? normalizeRawState(stateRef.current, true).filter((value) => value !== fileToRemove.stateValue)
            : null;

        if (fileToRemove.isTemp && typeof wire.removeUpload === "function") {
            await new Promise((resolve) => {
                wire.removeUpload(name, fileToRemove.stateValue, resolve, resolve);
            });
        }

        syncState(nextState);
        setFiles((prev) => prev.filter((file) => file.path !== fileToRemove.path));
    };

    return (
        <>
            <div
                className={`relative rounded-xl border-2 border-dashed border-gray-400 bg-gray-200 transition-colors dark:border-gray-700 dark:bg-gray-900 ${!hasContent ? "flex min-h-[140px] items-center justify-center p-4" : "p-4"}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                    event.preventDefault();

                    if (event.dataTransfer?.files) {
                        handleChange({ target: { files: event.dataTransfer.files } });
                    }
                }}
            >
                <input
                    type="file"
                    multiple={multiple}
                    accept={accept}
                    onChange={handleChange}
                    className="hidden"
                    id={inputId}
                />

                {!hasContent && (
                    <UploadPlaceholder multiple={multiple} inputId={inputId} />
                )}

                {hasContent && (
                    <>
                        {multiple && (
                            <div className="mb-3 flex justify-end">
                                <label
                                    htmlFor={inputId}
                                    className="cursor-pointer text-xs font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    + Add more
                                </label>
                            </div>
                        )}

                        <div className={multiple ? "grid grid-cols-3 gap-3" : "flex flex-col gap-2"}>
                            {Object.entries(uploadProgress).map(([key, progress]) => (
                                <ProgressCard key={key} fileKey={key} progress={progress} />
                            ))}

                            {files.map((file, index) => (
                                <FileCard
                                    key={`${file.path}-${index}`}
                                    file={file}
                                    onPreview={setPreview}
                                    onRemove={handleRemove}
                                    fileActionMethod={fileActionMethod}
                                    multiple={multiple}
                                    wire={wire}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {preview && createPortal(
                <FileViewer
                    file={{
                        name: preview.name,
                        url: preview.url,
                        type: preview.type,
                    }}
                    onClose={() => setPreview(null)}
                />,
                document.body,
            )}
        </>
    );
}

export default FileUploader;
