import { X, Printer, Download } from "lucide-react";

export default function Toolbar({ file, onClose }) {
  const handlePrint = () => {
    const win = window.open(file.url, "_blank");
    win?.print();
  };

  return (
    <div className="flex justify-between items-center px-6 py-3 bg-black/40 text-white shadow-lg backdrop-blur-sm">
      <div className="flex gap-3">
        <button onClick={handlePrint} className="hover:text-gray-300">
          <Printer />
        </button>
        <a href={file.url} download className="hover:text-gray-300">
          <Download />
        </a>
      </div>
      <p className="font-semibold truncate">{file.name}</p>
      <button onClick={onClose} className="hover:text-gray-300">
        <X />
      </button>
    </div>
  );
}