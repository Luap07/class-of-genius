import { useEffect, useState } from "react";

const Downloads = () => {
  const [files, setFiles] = useState([]);

  // ================= LOAD FILES =================
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("downloads"));

      if (Array.isArray(saved)) {
        setFiles(saved);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.log("Error loading downloads:", err);
      setFiles([]);
    }
  }, []);

  // ================= DELETE ONE FILE =================
  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);

    setFiles(updated);
    localStorage.setItem("downloads", JSON.stringify(updated));
  };

  // ================= CLEAR ALL =================
  const clearAll = () => {
    localStorage.removeItem("downloads");
    setFiles([]);
  };

  return (
    <div className="min-h-screen p-6 text-white bg-gradient-to-b from-[#070b14] via-[#0a0f1f] to-[#05070f]">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          📁 Downloads
        </h1>

        {files.length > 0 && (
          <button
            onClick={clearAll}
            className="text-red-400 hover:text-red-300 font-semibold transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* EMPTY STATE */}
      {files.length === 0 ? (
        <div className="text-gray-400">
          No downloads yet
        </div>
      ) : (
        <div className="space-y-3">

          {files.map((file, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl flex justify-between items-center hover:bg-white/10 transition"
            >

              {/* FILE INFO */}
              <div>
                <p className="font-semibold">
                  {file?.name?.endsWith(".pdf")
                    ? "📕"
                    : "📄"}{" "}
                  {file?.name || "Unknown file"}
                </p>

                <p className="text-xs text-gray-400 break-all">
                  {file?.url || "No URL"}
                </p>
              </div>

              {/* ACTIONS */}
              <div className="flex gap-3">

                <a
                  href={file?.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition"
                >
                  Download
                </a>

                <button
                  onClick={() => removeFile(i)}
                  className="text-red-400 hover:text-red-300 font-semibold transition"
                >
                  Delete
                </button>

              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
};

export default Downloads;