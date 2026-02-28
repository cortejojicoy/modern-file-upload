import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { createPortal } from "react-dom";
import FileViewer from "../components/FileViewer";
import PDFThumbnail from "./FileViewer/PDFThumbnail";

const formatBytes = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const UploadPlaceholder = ({ multiple, inputId }) => (
    <label 
        htmlFor={inputId}
        className="flex flex-col items-center justify-center gap-2 cursor-pointertext-gray-400 dark:text-gray-500 select-none w-full h-full"
    >
        <svg
            className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m0 0-3 3m3-3 3 3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"/>
        </svg>
        <span className="text-sm font-medium">
            {multiple ? "Drag & drop or click to upload" : "Click to upload"}
        </span>
        <span className="text-xs text-gray-300 dark:text-gray-600">
            {multiple ? "Upload multiple files" : "Upload a single file"}
        </span>
    </label>
)

const ProgressCard = ({ fileKey, progress }) => (
    <div className="flex flex-col gap-2 rounded-lg p-2 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 truncate">
            <span>📄</span>
            <span className="truncate">{fileKey.split("-")[0]}</span>
            <span className="ml-auto shrink-0">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
            <div
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
            />
        </div>
    </div>
)

const FileCard = ({ file, onPreview, onRemove, isGallery, multiple, fileActionMethod, wire }) => {
    const isImage = file.type?.startsWith("image/");
    const isPdf   = file.type === "application/pdf";
    
    const actions = (fileActionMethod && file.fileId && !file.isTemp)
        ? {
            status:   file.status ?? null,
            onAction: async (type, remarks) => {
                await wire.call(fileActionMethod, file.fileId, type, remarks);
                window.location.reload();
            }
          }
        : null;

    return (
        <div
            className={`relative group rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer transition hover:shadow-md 
                ${multiple ? "aspect-square" : "flex items-center gap-3 p-2"}`} 
            onClick={() => onPreview(file)}>
            {isImage ? (
                <img
                    src={file.url}
                    alt={file.name}
                    className={`object-cover w-full ${multiple ? "h-full" : "h-12 w-12 rounded shrink-0"}`}
                />
                )  : isPdf ? (
                    <div className={multiple ? "h-full w-full" : "h-12 w-12 shrink-0"}>
                        <PDFThumbnail 
                            url={file.url}
                            action={actions}
                        />
                    </div>
                ) : (
                <div className={`flex items-center justify-center bg-gray-50 dark:bg-gray-700 text-2xl ${multiple ? "h-full w-full" : "h-12 w-12 rounded shrink-0"}`}>
                    {getFileIcon(file.type)}
                </div>
            )}

            {!(multiple) && (
                <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                        {file.name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                        {formatBytes(file.size)}
                    </span>
                </div>
            )}

            {multiple && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <span className="text-white text-xs font-medium truncate">{file.name}</span>
                    <span className="text-white/70 text-xs">{formatBytes(file.size)}</span>
                </div>
            )}

            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(file); }}
                className="absolute top-1 right-1 z-10 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove file">
                ✕
            </button>

            {(file.status === 'uploaded' || file.status === 'returned') && (
                <button type="button"
                    onClick={(e) => {
                        e.stopPropagation(); onRemove(idx);
                    }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 py-1 text-[10px] hover:bg-red-600">
                    {file.status === 'returned' ? '✕ Returned' : '✕'}
                </button>
            )}
            
            {file.status === 'verified' && (
                <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full px-2 py-1 text-[10px]">
                    ✓ Verified
                </div>
            )}

        </div>
    );
}

function FileUploader({
    state,
    wire,
    name,
    multiple = true,
    fileAction  = null,
    view = "gallery",
    accept = "*/*"
}) {
    const [files, setFiles] = useState(state || []);
    const [uploadProgress, setUploadProgress] = useState({});
    const [preview, setPreview] = useState(null);
    const [zoom, setZoom] = useState(1);
    const inputId = `react-upload-input-${name.replace(/\./g, "-")}`;
    const hasContent = files.length > 0 || Object.keys(uploadProgress).length > 0;
    const fileActionMethod  = fileAction?.method ?? null;

    const handleChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        selectedFiles.forEach((file) => {
            const fileKey = file.name + "-" + file.lastModified;
            setUploadProgress((prev) => ({ ...prev, [fileKey]: 0 }));

            // Livewire file upload
            wire.upload(
                name,
                file,

                async (uploadedPath) => {
                    const url = await wire.call('getTempFileUrl', uploadedPath);

                    const uploadedFile = {
                        name: file.name,
                        path: uploadedPath,
                        size: file.size,
                        type: file.type,
                        url,
                        isTemp: true
                    };

                    setFiles((prev) => (multiple ? [...prev, uploadedFile] : [uploadedFile]));
                    setUploadProgress((prev) => {
                        const newState = { ...prev };
                        delete newState[fileKey];
                        return newState;
                    });
                },
                (error) => {
                    console.error("Upload failed:", error);
                    setUploadProgress((prev) => {
                        const newState = { ...prev };
                        delete newState[fileKey];
                        return newState;
                    });
                },
                (event) => {
                    const progress = Math.round((event.detail.progress / 100) * 100);
                    setUploadProgress((prev) => ({ ...prev, [fileKey]: progress }));
                }
            );
        });
        e.target.value = "";
    };

    // const handleRemove = async (index) => {
    //     const fileToRemove = files[index];
        
    //     await wire.call('removeFile', name, {
    //         index: index,
    //         id: fileToRemove.template_id || null,
    //         name: fileToRemove.name || null,
    //         url: fileToRemove.url || null,
    //         path: fileToRemove.path || null,
    //         isTemp: fileToRemove.isTemp || false,
    //     });

    //     const updatedFiles = files.filter((_, i) => i !== index);
    //     setFiles(updatedFiles);
    //     if (typeof state === "function") state(updatedFiles);
    // };

    const handleRemove = (fileToRemove) => {
        setFiles((prev) => prev.filter((f) => f.path !== fileToRemove.path));
    };

    const openPreview = (file) => {
        setPreview(file);
        setZoom(1);
    };

    const closePreview = () => {
        setPreview(null);
        setZoom(1);
    };

    return (
        <>
            <div
                className={`relative border-2 border-dashed rounded-xl transition-colors border-gray-400 dark:border-gray-700 bg-gray-200 dark:bg-gray-900
                            ${!hasContent ? "min-h-[140px] flex items-center justify-center p-4" : "p-4"}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    const dt = e.dataTransfer;
                    if (dt?.files) {
                        handleChange({ target: { files: dt.files }, preventDefault: () => {} });
                    }
                }}
                // onClick={!multiple ? () => document.getElementById(inputId).click() : undefined}
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
                            <div className="flex justify-end mb-3">
                                <label
                                    htmlFor={inputId}
                                    className="text-xs cursor-pointer text-blue-500 hover:text-blue-600
                                               dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                                >
                                    + Add more
                                </label>
                            </div>
                        )}

                        <div className={multiple
                            ? "grid grid-cols-3 gap-3"
                            : "flex flex-col gap-2"}>
                                
                            {Object.entries(uploadProgress).map(([key, progress]) => (
                                <ProgressCard key={key} fileKey={key} progress={progress} />
                            ))}

                            {/* Completed files */}
                            {files.map((file, idx) => (
                                <FileCard
                                    key={`${file.path}-${idx}`}
                                    file={file}
                                    onPreview={openPreview}
                                    onRemove={handleRemove}
                                    fileActionMethod={fileActionMethod} 
                                    // isGallery={isGallery}
                                    multiple={multiple}
                                    wire={wire}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {preview && (
                createPortal(
                    <FileViewer
                        file={{
                            name: preview.name,
                            // url: `/storage/livewire-tmp/${preview.path}`,
                            url: preview.url,
                            type: preview.type,
                        }}
                        onClose={closePreview}
                    />,
                    document.body
                )
            )}
        </>
    );
}


window.mountReactFileUpload = (el, state, wire, props = {}) => {
    if (el.__reactRoot) return;
    const root = ReactDOM.createRoot(el);
    el.__reactRoot = root;
    root.render(
        <FileUploader
            state={state}
            wire={wire}
            {...props}
        />
    );
};

export default FileUploader;