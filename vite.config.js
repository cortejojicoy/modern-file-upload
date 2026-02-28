import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        react({
            jsxRuntime: "automatic", // ← uses react-jsx transform, not preserve
        }),
    ],
    build: {
        outDir: "resources/dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                "file-uploader": "resources/js/file-uploader.jsx",
                // "file-viewer":   "resources/js/file-viewer.js",
            },
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "chunks/[name]-[hash].js",
            },
        },
    }
});