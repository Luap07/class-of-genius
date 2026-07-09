import React, { useState } from "react";
import { Upload, X } from "lucide-react";

const ImageUploader = ({ onUpload }) => {
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(URL.createObjectURL(file));
    onUpload?.(file);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <label className="cursor-pointer block">
        <div className="h-40 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center hover:border-blue-500 transition">
          {image ? (
            <img
              src={image}
              alt="preview"
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            <>
              <Upload size={30} className="text-blue-400" />
              <p className="text-sm text-slate-400 mt-2">
                Upload Image
              </p>
            </>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </label>

      {image && (
        <button
          type="button"
          onClick={() => setImage(null)}
          className="mt-3 flex items-center gap-2 text-red-400 text-sm"
        >
          <X size={16} />
          Remove
        </button>
      )}
    </div>
  );
};

export default ImageUploader;