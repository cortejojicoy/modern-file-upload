import React from "react";
import ReactDOM from "react-dom/client";
import { AnimatePresence } from "framer-motion";
import FileViewer from "./File";
import PDFThumbnail from "./File/PDFThumbnail";

const reactRoots = new WeakMap();
const mountingInstances = new Set();

// Navigation queue to handle rapid successive opens
const navigationQueue = {
  queue: [],
  isProcessing: false,
  minDelay: 100, // Minimum time between mounts in ms

  add(fn) {
    this.queue.push(fn);
    this.process();
  },

  async process() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const fn = this.queue.shift();
      await fn();

      // Wait minimum delay before next operation
      await new Promise(resolve => setTimeout(resolve, this.minDelay));
    }

    this.isProcessing = false;
  }
};

window.mountReactThumbnail = (el, props, wire) => {
  const current = reactRoots.get(el);
  if (current && current.url === props.url) return;

  // Clean up old root if exists
  if (el._reactRoot) {
    try {
      el._reactRoot.unmount();
    } catch (e) {
      console.warn('Thumbnail unmount error:', e);
    }
  }

  // Defer mounting to next animation frame
  requestAnimationFrame(() => {
    const root = ReactDOM.createRoot(el);
    root.render(
      <PDFThumbnail
        url={props.url}
        roles={props.roles}
        isAdminPanel={props.isAdminPanel}
        fileId={props.fileId}
        fileStatus={props.fileStatus}
        wire={wire}
      />
    );
    el._reactRoot = root;
    reactRoots.set(el);
  });
};

window.mountReactFileViewer = (el, file) => {
  const instanceId = `${file.url}-${Date.now()}`;

  // Prevent duplicate mounts of the SAME file
  const existingInstance = Array.from(mountingInstances).find(id =>
    id.startsWith(file.url)
  );

  if (existingInstance) {
    console.log('This file is already opening');
    return;
  }

  // Add to navigation queue to prevent browser throttling
  navigationQueue.add(async () => {
    // Track this instance
    mountingInstances.add(instanceId);

    // Cleanup function
    const cleanup = () => {
      mountingInstances.delete(instanceId);
      if (typeof file.onClose === "function") {
        try {
          file.onClose();
        } catch (e) {
          console.warn('onClose callback error:', e);
        }
      }
    };

    // Clean up old root if exists
    if (el._reactRoot) {
      try {
        el._reactRoot.unmount();
      } catch (e) {
        console.warn('Previous root unmount error:', e);
      }
      el._reactRoot = null;
    }

    // Mount with requestAnimationFrame for smooth rendering
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const root = ReactDOM.createRoot(el);

        // Internal wrapper with framer-motion for fade animations
        function Wrapper({ file }) {
          const [open, setOpen] = React.useState(true);

          const handleClose = () => {
            setOpen(false);
          };

          return (
            <AnimatePresence
              onExitComplete={() => {
                try {
                  root.unmount();
                } catch (e) {
                  console.warn('Root unmount error:', e);
                }

                // Remove DOM element
                if (el.parentNode) {
                  el.parentNode.removeChild(el);
                }

                // Cleanup tracking
                cleanup();
              }}
            >
              {open && <FileViewer file={file} onClose={handleClose} />}
            </AnimatePresence>
          );
        }

        root.render(<Wrapper file={file} />);
        el._reactRoot = root;

        // Failsafe cleanup after timeout
        setTimeout(() => {
          if (mountingInstances.has(instanceId)) {
            console.warn('Failsafe cleanup triggered for:', file.name);
            cleanup();
          }
        }, 10000);

        resolve();
      });
    });
  });
};

// Optional: Utility to check if a specific file is currently open
window.isFileViewerOpen = (url) => {
  return Array.from(mountingInstances).some(id => id.startsWith(url));
};

// Optional: Force cleanup all viewers
window.closeAllFileViewers = () => {
  mountingInstances.clear();
  navigationQueue.queue = [];
  console.log('All file viewer instances cleared');
};

// Optional: Adjust queue delay if needed
window.setViewerQueueDelay = (ms) => {
  navigationQueue.minDelay = Math.max(50, ms);
  console.log(`Viewer queue delay set to ${navigationQueue.minDelay}ms`);
};