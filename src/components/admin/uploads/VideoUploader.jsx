import React, { useState } from "react";
import { Upload, X, Video } from "lucide-react";

const VideoUploader = ({ onUpload }) => {
  const [video, setVideo] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVideo(URL.createObjectURL(file));
    onUpload?.(file);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <label className="cursor-pointer block">
        <div className="h-44 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center hover:border-blue-500 transition overflow-hidden">
          {video ? (
            <video
              src={video}
              controls
              className="h-full w-full object-cover rounded-xl"
            />
          ) : (
            <>
              <Video size={32} className="text-blue-400" />
              <p className="text-sm text-slate-400 mt-2">
                Upload Video
              </p>
            </>
          )}
        </div>

        <input
          type="file"
          accept="video/*"
          onChange={handleChange}
          className="hidden"
        />
      </label>

      {video && (
        <button
          type="button"
          onClick={() => setVideo(null)}
          className="mt-3 flex items-center gap-2 text-red-400 text-sm"
        >
          <X size={16} />
          Remove Video
        </button>
      )}
    </div>
  );
};

export default VideoUploader;