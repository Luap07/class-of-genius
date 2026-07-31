import React, { useRef, useState } from "react";
import { Image, X } from "lucide-react";

export default function LanguageImageUpload({ image, setImage }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(image || "");

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-bold text-slate-300">
        Language Image
      </label>

      <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-6">
        {preview ? (
          <div className="relative flex justify-center">
            <img
              src={preview}
              alt="Language Preview"
              className="h-40 w-40 rounded-3xl border border-slate-700 object-cover"
            />

            <button
              type="button"
              onClick={removeImage}
              className="absolute right-0 top-0 rounded-full bg-red-500 p-2 text-white transition hover:bg-red-600"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 py-8 text-slate-400 transition hover:text-white"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
              <Image size={26} />
            </div>

            <p className="font-bold">Upload Language Image</p>

            <span className="text-xs">PNG, JPG or WEBP</span>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </div>
  );
}