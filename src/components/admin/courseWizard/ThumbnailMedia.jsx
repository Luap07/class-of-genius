import React, { useState } from "react";
import { Upload, Image } from "lucide-react";

const ThumbnailMedia = ({ data, setData }) => {
  const [preview, setPreview] = useState(data.thumbnail || "");

  const handleUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    setPreview(url);

    setData((prev) => ({
      ...prev,
      thumbnail: file,
      thumbnailPreview: url,
    }));
  };

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-semibold text-slate-100">
          Course Thumbnail
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Upload a professional image for your course.
        </p>
      </div>


      <label className="block cursor-pointer">

        <div className="border-2 border-dashed border-[#243047] rounded-3xl bg-[#111827] p-8 flex flex-col items-center justify-center hover:border-blue-500 transition">

          {preview ? (
            <img
              src={preview}
              alt="Course thumbnail"
              className="w-full max-w-md h-56 object-cover rounded-2xl"
            />
          ) : (
            <>
              <Image
                size={50}
                className="text-slate-400"
              />

              <p className="mt-4 text-slate-300">
                Click to upload thumbnail
              </p>

              <span className="text-xs text-slate-500 mt-2">
                PNG, JPG, WEBP
              </span>
            </>
          )}

        </div>


        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />

      </label>


      <div>
        <label className="text-sm text-slate-400">
          Intro Video URL
        </label>

        <input
          value={data.videoUrl || ""}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              videoUrl: e.target.value,
            }))
          }
          placeholder="https://youtube.com/..."
          className="w-full mt-2 rounded-xl bg-[#111827] border border-[#243047] px-4 py-3 text-white outline-none focus:border-blue-500"
        />
      </div>


      <div className="flex items-center gap-3 bg-[#111827] border border-[#243047] rounded-xl p-4">

        <Upload size={20} className="text-blue-400"/>

        <p className="text-sm text-slate-400">
          Recommended size: 1280 × 720px
        </p>

      </div>

    </div>
  );
};

export default ThumbnailMedia;