import { createContext, useState } from "react";

export const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const [documents, setDocuments] = useState(
    () => JSON.parse(localStorage.getItem("docs")) || []
  );

  const [pinned, setPinned] = useState(
    () => JSON.parse(localStorage.getItem("pinned")) || []
  );

  const [downloads, setDownloads] = useState(
    () => JSON.parse(localStorage.getItem("downloads")) || []
  );

  const save = (key, value) =>
    localStorage.setItem(key, JSON.stringify(value));

  /* ========== ADD DOC ========== */
  const addDocument = (doc) => {
    const newDocs = [doc, ...documents];
    setDocuments(newDocs);
    save("docs", newDocs);
  };

  /* ========== DELETE DOC ========== */
  const removeDocument = (id) => {
    const newDocs = documents.filter((d) => d.id !== id);
    setDocuments(newDocs);
    save("docs", newDocs);

    setPinned(pinned.filter((p) => p.id !== id));
    setDownloads(downloads.filter((d) => d.id !== id));
  };

  /* ========== OPEN DOC (TRACK RECENT) ========== */
  const openDocument = (doc) => {
    window.open(doc.url, "_blank");
  };

  /* ========== PIN / UNPIN ========== */
  const togglePin = (doc) => {
    const exists = pinned.find((p) => p.id === doc.id);
    let updated;

    if (exists) {
      updated = pinned.filter((p) => p.id !== doc.id);
    } else {
      updated = [doc, ...pinned];
    }

    setPinned(updated);
    save("pinned", updated);
  };

  /* ========== DOWNLOAD ========== */
  const addDownload = (doc) => {
    const exists = downloads.find((d) => d.id === doc.id);
    if (exists) return;

    const updated = [doc, ...downloads];
    setDownloads(updated);
    save("downloads", updated);

    // auto open download
    const a = document.createElement("a");
    a.href = doc.url;
    a.download = doc.name || "file";
    a.click();
  };

  return (
    <DocumentContext.Provider
      value={{
        documents,
        pinned,
        downloads,

        addDocument,
        removeDocument,
        openDocument,
        togglePin,
        addDownload,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};