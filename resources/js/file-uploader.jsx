import ReactDOM from "react-dom/client";
import FileUploader from "./components/FileUploader";

window.mountReactFileUpload = (el, props = {}) => {
    if (!el.__reactRoot) {
        el.__reactRoot = ReactDOM.createRoot(el);
        el.__reactProps = props;

        el.addEventListener("modern-file-upload:set-state", (event) => {
            el.__reactProps = {
                ...el.__reactProps,
                state: event.detail,
            };

            el.__reactRoot.render(<FileUploader {...el.__reactProps} />);
        });
    } else {
        el.__reactProps = {
            ...el.__reactProps,
            ...props,
        };
    }

    el.__reactRoot.render(<FileUploader {...el.__reactProps} />);
};
