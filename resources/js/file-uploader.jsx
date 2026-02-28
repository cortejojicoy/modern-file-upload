// import React from "react";
import ReactDOM from "react-dom/client";
import FileUploader from "./components/FileUploader";

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
