import React, { useState } from "react";
import { Upload, FileText, X } from "lucide-react";

const PDFUploader = ({ onUpload }) => {
  const [file, setFile] = useState(null);

  const handleChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    onUpload?.(selected);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <label className="cursor-pointer block">
        <div className="h-36 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center hover:border-blue-500 transition">
          {file ? (
            <>
              <FileText size={32} className="text-red-400" />
              <p className="text-sm mt-2 text-slate-300">
                {file.name}
              </p>
            </>
          ) : (
            <>
              <Upload size={30} className="text-blue-400" />
              <p className="text-sm text-slate-400 mt-2">
                Upload PDF
              </p>
            </>
          )}
        </div>

        <input
          type="file"
          accept="application/pdf"
          onChange={handleChange}
          className="hidden"
        />
      </label>

      {file && (
        <button
          type="button"
          onClick={() => setFile(null)}
          className="mt-3 flex items-center gap-2 text-red-400 text-sm"
        >
          <X size={16} />
          Remove PDF
        </button>
      )}
    </div>
  );
};

export default PDFUploader;