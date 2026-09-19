import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BookMarked,
  BookOpen,
  Download,
  FileText,
  Loader2,
  Search,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";

import { motion } from "framer-motion";
import { useOutletContext } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const TEXTBOOKS_ENDPOINT =
  `${API_URL}/api/academy/student/textbooks`;

const DEMO_TEXTBOOKS = [
  {
    id: "tb-001",
    title: "Senior Secondary Mathematics",
    subject: "Mathematics",
    className: "SS 1",
    description:
      "A comprehensive mathematics textbook covering core SS1 topics.",
    author: "Scholiqen Academic Team",
    fileUrl: "",
    fileType: "PDF",
  },
  {
    id: "tb-002",
    title: "English Language for Secondary Schools",
    subject: "English Language",
    className: "SS 1",
    description:
      "Grammar, comprehension, vocabulary and writing resources.",
    author: "Scholiqen Academic Team",
    fileUrl: "",
    fileType: "PDF",
  },
  {
    id: "tb-003",
    title: "Introduction to Biology",
    subject: "Biology",
    className: "SS 1",
    description:
      "Foundational biology concepts and practical study materials.",
    author: "Scholiqen Academic Team",
    fileUrl: "",
    fileType: "PDF",
  },
  {
    id: "tb-004",
    title: "Basic Physics",
    subject: "Physics",
    className: "SS 1",
    description:
      "A student-friendly introduction to mechanics, energy and matter.",
    author: "Scholiqen Academic Team",
    fileUrl: "",
    fileType: "PDF",
  },
];

const getStudentId = (student) => {
  if (!student) return "";

  return (
    student.id ||
    student.studentId ||
    student.student_id ||
    student.enrollmentId ||
    student.enrollment_id ||
    ""
  );
};

const normalizeTextbook = (item, index) => ({
  id:
    item?.id ||
    item?.textbookId ||
    item?.textbook_id ||
    `textbook-${index}`,

  title:
    item?.title ||
    item?.name ||
    item?.textbookTitle ||
    "Untitled Textbook",

  subject:
    item?.subject ||
    item?.subjectName ||
    item?.subject_name ||
    "General",

  className:
    item?.className ||
    item?.class_name ||
    item?.class ||
    item?.grade ||
    "Student",

  description:
    item?.description ||
    item?.summary ||
    "Academic textbook available in the student learning portal.",

  author:
    item?.author ||
    item?.authorName ||
    "Scholiqen Academic Team",

  fileUrl:
    item?.fileUrl ||
    item?.file_url ||
    item?.url ||
    item?.downloadUrl ||
    item?.download_url ||
    "",

  fileType:
    item?.fileType ||
    item?.file_type ||
    "PDF",
});

export default function StudentTextbooks() {
  const { student } = useOutletContext() || {};

  const [textbooks, setTextbooks] = useState([]);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [usingDemo, setUsingDemo] = useState(false);
  const [error, setError] = useState("");
  const [selectedBook, setSelectedBook] = useState(null);

  const studentId = getStudentId(student);

  const loadTextbooks = async () => {
    setLoading(true);
    setError("");

    try {
      const url = new URL(TEXTBOOKS_ENDPOINT);

      if (studentId) {
        url.searchParams.set("studentId", studentId);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("Unable to load textbooks.");
      }

      const data = await response.json();

      const rawItems =
        Array.isArray(data)
          ? data
          : data.textbooks ||
            data.data ||
            data.items ||
            [];

      if (!Array.isArray(rawItems)) {
        throw new Error("Invalid textbook response.");
      }

      setTextbooks(
        rawItems.map(normalizeTextbook)
      );

      setUsingDemo(false);
    } catch (err) {
      console.error(
        "STUDENT TEXTBOOKS ERROR:",
        err
      );

      setTextbooks(DEMO_TEXTBOOKS);
      setUsingDemo(true);
      setError(
        "Textbooks could not be loaded from the server. Showing available sample textbooks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTextbooks();
  }, [studentId]);

  const subjects = useMemo(() => {
    const unique = [
      ...new Set(
        textbooks
          .map((book) => book.subject)
          .filter(Boolean)
      ),
    ];

    return ["All", ...unique];
  }, [textbooks]);

  const filteredTextbooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return textbooks.filter((book) => {
      const matchesSearch =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.subject.toLowerCase().includes(query) ||
        book.className.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query);

      const matchesSubject =
        subjectFilter === "All" ||
        book.subject === subjectFilter;

      return (
        matchesSearch &&
        matchesSubject
      );
    });
  }, [
    textbooks,
    search,
    subjectFilter,
  ]);

  const handleRead = (book) => {
    if (book.fileUrl) {
      window.open(
        book.fileUrl,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    setSelectedBook(book);
  };

  const handleDownload = (book) => {
    if (!book.fileUrl) {
      setSelectedBook(book);
      return;
    }

    const link =
      document.createElement("a");

    link.href = book.fileUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = book.title;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-full bg-[#020617] text-white">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <BookMarked
                size={24}
                className="text-cyan-300"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Textbooks
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Access your academic textbooks and
                study materials.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search textbooks..."
              className="w-full rounded-2xl border border-white/10 bg-[#071426] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition focus:border-cyan-400/40"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {subjects.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() =>
                  setSubjectFilter(subject)
                }
                className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-medium transition ${
                  subjectFilter === subject
                    ? "bg-cyan-400 text-slate-950"
                    : "border border-white/10 bg-[#071426] text-slate-300 hover:bg-white/5"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {usingDemo && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <RefreshCw size={14} />
            Demo textbooks are currently displayed.
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-slate-400">
              <Loader2
                size={22}
                className="animate-spin"
              />
              Loading textbooks...
            </div>
          </div>
        ) : filteredTextbooks.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#071426] p-12 text-center">
            <BookOpen
              size={42}
              className="mx-auto text-slate-600"
            />

            <h3 className="mt-4 text-lg font-semibold">
              No textbooks found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try another search or subject.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTextbooks.map(
              (book, index) => (
                <motion.div
                  key={book.id}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.04,
                  }}
                  className="group rounded-3xl border border-white/10 bg-[#071426] p-5 transition hover:border-cyan-400/20"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                      <BookOpen size={23} />
                    </div>

                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-slate-400">
                      {book.fileType}
                    </span>
                  </div>

                  <h2 className="mt-5 line-clamp-2 text-lg font-semibold">
                    {book.title}
                  </h2>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                    {book.description}
                  </p>

                  <div className="mt-5 space-y-2 text-xs text-slate-500">
                    <div>
                      Subject:{" "}
                      <span className="text-slate-300">
                        {book.subject}
                      </span>
                    </div>

                    <div>
                      Class:{" "}
                      <span className="text-slate-300">
                        {book.className}
                      </span>
                    </div>

                    <div>
                      Author:{" "}
                      <span className="text-slate-300">
                        {book.author}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleRead(book)
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                    >
                      <ExternalLink size={16} />
                      Read
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownload(book)
                      }
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/10"
                      title="Download textbook"
                    >
                      <Download size={17} />
                    </button>
                  </div>
                </motion.div>
              )
            )}
          </div>
        )}
      </div>

      {selectedBook && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#071426] p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {selectedBook.title}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  The textbook file has not been connected
                  yet.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedBook(null)
                }
                className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4 text-sm leading-6 text-slate-300">
              Once the backend provides a
              <code className="mx-1 text-cyan-300">
                fileUrl
              </code>
              or
              <code className="mx-1 text-cyan-300">
                file_url
              </code>
              for this textbook, the Read and Download
              buttons will automatically use it.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
