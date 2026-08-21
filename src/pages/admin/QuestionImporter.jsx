import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Upload,
  FileText,
  Image as ImageIcon,
  File,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  ArrowLeft,
  ScanText,
  Sparkles,
  Copy,
  Download,
  Eye,
  RotateCcw,
  FileType2,
  Brain,
  ChevronDown,
} from "lucide-react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import Tesseract from "tesseract.js";

import * as pdfjsLib from "pdfjs-dist";

import * as mammoth from "mammoth";
/* ============================================================
   PDF WORKER
============================================================ */

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/* ============================================================
   CONFIG
============================================================ */

const ACCEPTED_TYPES = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
  ".docx",
  ".txt",
];

const MAX_FILE_SIZE =
  25 * 1024 * 1024;

/*
 * OCR passes.
 *
 * Different PSM modes work better for different layouts.
 */
const OCR_PASSES = [
  {
    name: "Structured",
    psm: 6,
  },
  {
    name: "Automatic",
    psm: 3,
  },
  {
    name: "Sparse",
    psm: 11,
  },
];

/* ============================================================
   FILE HELPERS
============================================================ */

function formatBytes(bytes) {
  if (!bytes) return "0 B";

  const units = [
    "B",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024)
    ),
    units.length - 1
  );

  return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(index === 0 ? 0 : 1)} ${
    units[index]
  }`;
}

function getFileType(file) {
  const type =
    file?.type?.toLowerCase() || "";

  const name =
    file?.name?.toLowerCase() || "";

  if (
    type.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp)$/i.test(name)
  ) {
    return "image";
  }

  if (
    type === "application/pdf" ||
    name.endsWith(".pdf")
  ) {
    return "pdf";
  }

  if (
    type.includes("wordprocessingml") ||
    name.endsWith(".docx")
  ) {
    return "docx";
  }

  if (name.endsWith(".txt")) {
    return "text";
  }

  return "file";
}

function validateFile(file) {
  if (!file) {
    return "Invalid file.";
  }

  const lowerName =
    file.name.toLowerCase();

  const validExtension =
    ACCEPTED_TYPES.some((extension) =>
      lowerName.endsWith(extension)
    );

  if (!validExtension) {
    return `Unsupported file type: ${file.name}`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `${file.name} is larger than 25MB.`;
  }

  return null;
}

/* ============================================================
   FILE ICON
============================================================ */

function FileIcon({ file }) {
  const type = getFileType(file);

  if (type === "image") {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
        <ImageIcon size={22} />
      </div>
    );
  }

  if (type === "pdf") {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
        <FileText size={22} />
      </div>
    );
  }

  if (type === "docx") {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
        <FileType2 size={22} />
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
        <FileText size={22} />
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white/60">
      <File size={22} />
    </div>
  );
}

/* ============================================================
   TEXT NORMALIZATION
============================================================ */

function normalizeOCRText(text) {
  if (!text) return "";

  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")

    // Common OCR substitutions
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[‐-‒–—]/g, "-")

    // Remove obvious OCR control characters
    .replace(/[^\S\n]+/g, " ")

    // Keep paragraph structure
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{4,}/g, "\n\n")

    .trim();
}

function cleanLine(line) {
  return String(line || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/* ============================================================
   OCR NORMALIZATION
============================================================ */

/*
 * OCR commonly changes:
 *
 * 1. Question
 * I. Question
 * l. Question
 * 01. Question
 * 1) Question
 * 1 - Question
 *
 * This function converts common false variants.
 */

function normalizeQuestionNumber(line) {
  return line
    .replace(
      /^\s*[Il|]\s*[\.\)]\s+/,
      "1. "
    )
    .replace(
      /^\s*O(\d+)\s*[\.\)]/,
      "$1."
    )
    .replace(
      /^\s*(\d+)\s*[\.\):\-]\s*/,
      "$1. "
    );
}

/* ============================================================
   QUESTION START
============================================================ */

function getQuestionStart(line) {
  if (!line) return null;

  const normalized =
    normalizeQuestionNumber(line);

  /*
   * Normal:
   * 1. Question
   * 1) Question
   * 1: Question
   * 1 - Question
   */
  let match =
    normalized.match(
      /^\s*(\d{1,4})\s*[\.\):\-]\s*(.+)$/i
    );

  if (match) {
    return {
      number: match[1],
      text: match[2].trim(),
    };
  }

  /*
   * OCR sometimes gives:
   *
   * 1 Question
   * 12 Question
   */
  match =
    normalized.match(
      /^\s*(\d{1,4})\s+(.{4,})$/i
    );

  if (
    match &&
    !/^\d+$/.test(match[2])
  ) {
    return {
      number: match[1],
      text: match[2].trim(),
    };
  }

  return null;
}

/* ============================================================
   OPTION DETECTION
============================================================ */

function parseOption(line) {
  if (!line) return null;

  /*
   * Supported:
   *
   * A. text
   * A) text
   * (A) text
   * A - text
   * A: text
   * A text
   */

  const match =
    line.match(
      /^\s*\(?([A-D])\)?\s*[\.\):\-]\s*(.+)$/i
    );

  if (match) {
    return {
      letter:
        match[1].toUpperCase(),
      text: match[2].trim(),
    };
  }

  /*
   * OCR often removes punctuation:
   *
   * A answer
   * B answer
   */
  const loose =
    line.match(
      /^\s*\(?([A-D])\)?\s+(.{2,})$/i
    );

  if (loose) {
    return {
      letter:
        loose[1].toUpperCase(),
      text: loose[2].trim(),
    };
  }

  return null;
}

/* ============================================================
   MULTI-OPTION SAME LINE
============================================================ */

function splitInlineOptions(line) {
  if (!line) return [];

  /*
   * Handles:
   *
   * A. Apple B. Orange C. Mango D. Banana
   *
   * A) Apple B) Orange C) Mango D) Banana
   */

  const regex =
    /(?:^|\s)(?:\(?([A-D])\)?)[\.\):\-]\s*/gi;

  const matches = [];

  let match;

  while (
    (match = regex.exec(line))
  ) {
    matches.push({
      letter:
        match[1].toUpperCase(),
      index: match.index,
      end:
        regex.lastIndex,
    });
  }

  if (matches.length < 2) {
    return [];
  }

  const result = [];

  for (
    let i = 0;
    i < matches.length;
    i++
  ) {
    const current =
      matches[i];

    const next =
      matches[i + 1];

    const start =
      current.end;

    const end = next
      ? next.index
      : line.length;

    const text =
      line
        .slice(start, end)
        .trim();

    if (text) {
      result.push({
        letter: current.letter,
        text,
      });
    }
  }

  return result;
}

/* ============================================================
   ANSWER DETECTION
============================================================ */

function extractAnswer(line) {
  if (!line) return "";

  const patterns = [
    /(?:correct\s*answer|correct\s*option|answer|ans|key)\s*[:\-]?\s*\(?([A-D])\)?/i,

    /^\s*\(?([A-D])\)?\s*(?:is\s+correct|correct)\s*$/i,

    /^\s*(?:answer|ans)\s*[:\-]?\s*(?:option\s*)?\(?([A-D])\)?\s*$/i,
  ];

  for (const pattern of patterns) {
    const match =
      line.match(pattern);

    if (match) {
      return match[1].toUpperCase();
    }
  }

  return "";
}

/* ============================================================
   REASON
============================================================ */

function extractReason(line) {
  if (!line) return null;

  const match =
    line.match(
      /^\s*(?:reason|explanation|solution|rationale)\s*[:\-]\s*(.+)$/i
    );

  return match
    ? match[1].trim()
    : null;
}

/* ============================================================
   OCR QUESTION PARSER
============================================================ */

function parseQuestions(rawText) {
  const text =
    normalizeOCRText(rawText);

  if (!text) return [];

  /*
   * First split lines.
   */
  const lines = text
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);

  const questions = [];

  let current = null;

  let currentOption = null;

  const saveCurrent = () => {
    if (!current) return;

    current.question =
      cleanLine(current.question);

    for (const letter of [
      "A",
      "B",
      "C",
      "D",
    ]) {
      current[`option${letter}`] =
        cleanLine(
          current[
            `option${letter}`
          ] || ""
        );
    }

    current.answer =
      cleanLine(
        current.answer || ""
      );

    current.reason =
      cleanLine(
        current.reason || ""
      );

    /*
     * Do not require all four options.
     *
     * Bad OCR can destroy one option.
     *
     * We still keep the question so
     * the user can manually repair it.
     */
    const optionCount = [
      current.optionA,
      current.optionB,
      current.optionC,
      current.optionD,
    ].filter(Boolean).length;

    if (
      current.question &&
      optionCount >= 1
    ) {
      questions.push({
        question:
          current.question,
        optionA:
          current.optionA,
        optionB:
          current.optionB,
        optionC:
          current.optionC,
        optionD:
          current.optionD,
        answer:
          current.answer,
        reason:
          current.reason,
      });
    }
  };

  for (
    let index = 0;
    index < lines.length;
    index++
  ) {
    let line = lines[index];

    /*
     * --------------------------------------------------------
     * QUESTION
     * --------------------------------------------------------
     */

    const question =
      getQuestionStart(line);

    if (question) {
      saveCurrent();

      current = {
        question:
          question.text,
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        answer: "",
        reason: "",
      };

      currentOption = null;

      /*
       * Sometimes question and options
       * are on the SAME OCR line.
       *
       * Example:
       *
       * 1. What is photosynthesis? A. Respiration B. ...
       */

      const inlineOptions =
        splitInlineOptions(
          question.text
        );

      if (
        inlineOptions.length >= 2
      ) {
        const firstOptionIndex =
          question.text.search(
            /\s+\(?[A-D]\)?[\.\):\-]\s+/i
          );

        if (
          firstOptionIndex >= 0
        ) {
          current.question =
            question.text
              .slice(
                0,
                firstOptionIndex
              )
              .trim();
        }

        inlineOptions.forEach(
          (option) => {
            current[
              `option${option.letter}`
            ] = option.text;
          }
        );

        currentOption =
          "D";
      }

      continue;
    }

    /*
     * --------------------------------------------------------
     * INLINE OPTIONS
     * --------------------------------------------------------
     */

    if (current) {
      const inlineOptions =
        splitInlineOptions(
          line
        );

      if (
        inlineOptions.length >= 2
      ) {
        inlineOptions.forEach(
          (option) => {
            current[
              `option${option.letter}`
            ] = option.text;
          }
        );

        currentOption =
          "D";

        continue;
      }
    }

    /*
     * --------------------------------------------------------
     * NORMAL OPTION
     * --------------------------------------------------------
     */

    const option =
      parseOption(line);

    if (
      option &&
      current
    ) {
      currentOption =
        option.letter;

      current[
        `option${option.letter}`
      ] = option.text;

      continue;
    }

    /*
     * --------------------------------------------------------
     * ANSWER
     * --------------------------------------------------------
     */

    if (current) {
      const answer =
        extractAnswer(line);

      if (answer) {
        current.answer =
          answer;

        currentOption = null;

        continue;
      }
    }

    /*
     * --------------------------------------------------------
     * REASON
     * --------------------------------------------------------
     */

    if (current) {
      const reason =
        extractReason(line);

      if (reason) {
        current.reason =
          reason;

        currentOption = null;

        continue;
      }
    }

    /*
     * --------------------------------------------------------
     * CONTINUE CURRENT OPTION
     * --------------------------------------------------------
     */

    if (
      current &&
      currentOption
    ) {
      const key =
        `option${currentOption}`;

      current[key] =
        `${current[key]} ${line}`.trim();

      continue;
    }

    /*
     * --------------------------------------------------------
     * CONTINUE QUESTION
     * --------------------------------------------------------
     */

    if (
      current &&
      !currentOption
    ) {
      current.question =
        `${current.question} ${line}`.trim();
    }
  }

  saveCurrent();

  return questions;
}

/* ============================================================
   IMAGE PREPROCESSING
============================================================ */

/*
 * This is VERY important.
 *
 * Poor screenshots often produce garbage like:
 *
 * BA [53 SoRE £5...
 *
 * Upscaling + grayscale + contrast
 * usually gives Tesseract a much better
 * image.
 */

async function preprocessImage(
  file
) {
  const bitmap =
    await createImageBitmap(file);

  /*
   * Do not make the OCR canvas
   * ridiculously huge.
   */

  const scale = Math.min(
    3,
    Math.max(
      1.5,
      1800 / bitmap.width
    )
  );

  const width =
    Math.round(
      bitmap.width * scale
    );

  const height =
    Math.round(
      bitmap.height * scale
    );

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width = width;
  canvas.height = height;

  const ctx =
    canvas.getContext("2d", {
      willReadFrequently: true,
    });

  ctx.drawImage(
    bitmap,
    0,
    0,
    width,
    height
  );

  const imageData =
    ctx.getImageData(
      0,
      0,
      width,
      height
    );

  const data =
    imageData.data;

  /*
   * Grayscale + contrast.
   */

  for (
    let i = 0;
    i < data.length;
    i += 4
  ) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    let gray =
      0.299 * r +
      0.587 * g +
      0.114 * b;

    /*
     * Contrast.
     */
    gray =
      ((gray - 128) * 1.45) +
      128;

    gray =
      Math.max(
        0,
        Math.min(255, gray)
      );

    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  ctx.putImageData(
    imageData,
    0,
    0
  );

  return canvas;
}

/* ============================================================
   OCR IMAGE
============================================================ */

async function runOCRPass(
  image,
  psm,
  onProgress
) {
  const result =
    await Tesseract.recognize(
      image,
      "eng",
      {
        logger: (info) => {
          if (
            info.status ===
              "recognizing text" &&
            typeof info.progress ===
              "number"
          ) {
            onProgress(
              Math.round(
                info.progress * 100
              )
            );
          }
        },

        config: {
          tessedit_pageseg_mode:
            String(psm),

          preserve_interword_spaces:
            "1",
        },
      }
    );

  return (
    result?.data?.text || ""
  );
}

/* ============================================================
   MULTI-PASS IMAGE OCR
============================================================ */

async function extractImageText(
  file,
  onProgress,
  onPass
) {
  const processed =
    await preprocessImage(
      file
    );

  const outputs = [];

  for (
    let i = 0;
    i < OCR_PASSES.length;
    i++
  ) {
    const pass =
      OCR_PASSES[i];

    onPass?.(
      `${pass.name} OCR`
    );

    const text =
      await runOCRPass(
        processed,
        pass.psm,
        (progress) => {
          const base =
            (i /
              OCR_PASSES.length) *
            100;

          const portion =
            progress /
            OCR_PASSES.length;

          onProgress(
            Math.min(
              100,
              Math.round(
                base + portion
              )
            )
          );
        }
      );

    if (text.trim()) {
      outputs.push(text);
    }
  }
  return outputs.join(
    "\n\n"
  );
}

/* ============================================================
   PDF → IMAGE → OCR
============================================================ */

async function extractPDFText(
  file,
  onProgress,
  onPass
) {
  const buffer =
    await file.arrayBuffer();

  const pdf =
    await pdfjsLib.getDocument({
      data: buffer,
    }).promise;

  const allText = [];

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber++
  ) {
    onPass?.(
      `PDF page ${pageNumber}/${pdf.numPages}`
    );

    const page =
      await pdf.getPage(
        pageNumber
      );

    const viewport =
      page.getViewport({
        scale: 2.2,
      });

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      Math.ceil(
        viewport.width
      );

    canvas.height =
      Math.ceil(
        viewport.height
      );

    const ctx =
      canvas.getContext(
        "2d"
      );

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    const pageText =
      await extractImageText(
        canvas,
        (pageProgress) => {
          const pageStart =
            ((pageNumber - 1) /
              pdf.numPages) *
            100;

          const pagePart =
            pageProgress /
            pdf.numPages;

          onProgress(
            Math.round(
              pageStart +
                pagePart
            )
          );
        },
        onPass
      );

    allText.push(
      `\n${pageText}\n`
    );
  }

  return allText.join(
    "\n"
  );
}

/* ============================================================
   DOCX TEXT
============================================================ */

async function extractDOCXText(
  file,
  onProgress
) {
  onProgress(10);

  const arrayBuffer =
    await file.arrayBuffer();

  onProgress(50);

  const result =
    await mammoth.extractRawText({
      arrayBuffer,
    });

  onProgress(100);

  return result?.value || "";
}

/* ============================================================
   TXT
============================================================ */

async function extractTXTText(
  file,
  onProgress
) {
  onProgress(50);

  const text =
    await file.text();

  onProgress(100);

  return text;
}

/* ============================================================
   CSV
============================================================ */

function escapeCSV(value) {
  const text =
    value == null
      ? ""
      : String(value);

  return `"${text.replace(
    /"/g,
    '""'
  )}"`;
}

function questionsToCSV(
  questions
) {
  const header = [
    "question",
    "optionA",
    "optionB",
    "optionC",
    "optionD",
    "answer",
    "reason",
  ];

  const rows =
    questions.map(
      (question) =>
        [
          question.question,
          question.optionA,
          question.optionB,
          question.optionC,
          question.optionD,
          question.answer,
          question.reason,
        ]
          .map(escapeCSV)
          .join(",")
    );

  return [
    header.join(","),
    ...rows,
  ].join("\n");
}

/* ============================================================
   MAIN
============================================================ */

export default function QuestionImporter() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const inputRef =
    useRef(null);

  const [
    files,
    setFiles,
  ] = useState([]);

  const [
    dragActive,
    setDragActive,
  ] = useState(false);

  const [
    extracting,
    setExtracting,
  ] = useState(false);

  const [
    extractProgress,
    setExtractProgress,
  ] = useState(0);

  const [
    extractingFile,
    setExtractingFile,
  ] = useState("");

  const [
    extractionStage,
    setExtractionStage,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    rawText,
    setRawText,
  ] = useState("");

  const [
    questions,
    setQuestions,
  ] = useState([]);

  const [
    showRawText,
    setShowRawText,
  ] = useState(false);

  /* ==========================================================
     ADD FILES
  ========================================================== */

  const addFiles =
    useCallback(
      (incomingFiles) => {
        setError("");
        setMessage("");

        const selected =
          Array.from(
            incomingFiles || []
          );

        if (
          !selected.length
        ) {
          return;
        }

        const valid = [];
        const errors = [];

        selected.forEach(
          (file) => {
            const validation =
              validateFile(
                file
              );

            if (validation) {
              errors.push(
                validation
              );
            } else {
              valid.push(file);
            }
          }
        );

        if (errors.length) {
          setError(
            errors.join(" ")
          );
        }

        if (!valid.length) {
          return;
        }

        setFiles(
          (previous) => {
            const existing =
              new Set(
                previous.map(
                  (file) =>
                    `${file.name}-${file.size}-${file.lastModified}`
                )
              );

            const newFiles =
              valid.filter(
                (file) => {
                  const key =
                    `${file.name}-${file.size}-${file.lastModified}`;

                  return !existing.has(
                    key
                  );
                }
              );

            return [
              ...previous,
              ...newFiles,
            ];
          }
        );
      },
      []
    );

  /* ==========================================================
     INPUT
  ========================================================== */

  const handleInputChange =
    (event) => {
      addFiles(
        event.target.files
      );

      event.target.value = "";
    };

  /* ==========================================================
     DRAG
  ========================================================== */

  const handleDragEnter =
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!extracting) {
        setDragActive(true);
      }
    };

  const handleDragOver =
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (!extracting) {
        setDragActive(true);
      }
    };

  const handleDragLeave =
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (
        event.currentTarget ===
        event.target
      ) {
        setDragActive(false);
      }
    };

  const handleDrop =
    (event) => {
      event.preventDefault();
      event.stopPropagation();

      setDragActive(false);

      if (extracting) {
        return;
      }

      addFiles(
        event.dataTransfer.files
      );
    };

  /* ==========================================================
     REMOVE
  ========================================================== */

  const removeFile =
    (index) => {
      if (extracting) {
        return;
      }

      setFiles(
        (previous) =>
          previous.filter(
            (_, i) =>
              i !== index
          )
      );
    };

  /* ==========================================================
     CLEAR
  ========================================================== */

  const clearAll = () => {
    if (extracting) {
      return;
    }

    setFiles([]);
    setQuestions([]);
    setRawText("");
    setMessage("");
    setError("");
    setExtractProgress(0);
    setExtractingFile("");
    setExtractionStage("");
  };

  /* ==========================================================
     EXTRACT
  ========================================================== */

  const extractQuestions =
    async () => {
      if (extracting) {
        return;
      }

      if (!files.length) {
        setError(
          "Upload an image, PDF, DOCX or TXT file first."
        );
        return;
      }

      setExtracting(true);
      setError("");
      setMessage("");
      setQuestions([]);
      setRawText("");
      setExtractProgress(0);

      try {
        let combinedText =
          "";

        for (
          let i = 0;
          i < files.length;
          i++
        ) {
          const file =
            files[i];

          const type =
            getFileType(file);

          setExtractingFile(
            file.name
          );

          setExtractProgress(0);

          let text = "";

          /*
           * IMAGE
           */

          if (
            type === "image"
          ) {
            setExtractionStage(
              "Preparing image..."
            );

            text =
              await extractImageText(
                file,
                setExtractProgress,
                setExtractionStage
              );
          }

          /*
           * PDF
           */

          else if (
            type === "pdf"
          ) {
            setExtractionStage(
              "Reading PDF..."
            );

            text =
              await extractPDFText(
                file,
                setExtractProgress,
                setExtractionStage
              );
          }

          /*
           * DOCX
           */

          else if (
            type === "docx"
          ) {
            setExtractionStage(
              "Reading Word document..."
            );

            text =
              await extractDOCXText(
                file,
                setExtractProgress
              );
          }

          /*
           * TXT
           */

          else if (
            type === "text"
          ) {
            setExtractionStage(
              "Reading text..."
            );

            text =
              await extractTXTText(
                file,
                setExtractProgress
              );
          }

          if (text) {
            combinedText +=
              `\n${text}\n`;
          }
        }

        setExtractionStage(
          "Cleaning OCR text..."
        );

        combinedText =
          normalizeOCRText(
            combinedText
          );

        setRawText(
          combinedText
        );

        /*
         * Parse even if OCR isn't perfect.
         */

        setExtractionStage(
          "Detecting questions..."
        );

        const parsed =
          parseQuestions(
            combinedText
          );

        setQuestions(
          parsed
        );

        if (!combinedText) {
          setError(
            "Nothing could be extracted from the uploaded material."
          );
        } else if (
          !parsed.length
        ) {
          setError(
            "Text was extracted, but the question structure could not be detected. The OCR text is available under “View OCR Text”."
          );
        } else {
          setMessage(
            `${parsed.length} question${
              parsed.length === 1
                ? ""
                : "s"
            } extracted. Review them before exporting.`
          );
        }
      } catch (err) {
        console.error(
          "Extraction error:",
          err
        );

        setError(
          err?.message ||
            "Question extraction failed."
        );
      } finally {
        setExtracting(false);
        setExtractingFile("");
        setExtractionStage("");
      }
    };

  /* ==========================================================
     UPDATE
  ========================================================== */

  const updateQuestion =
    (
      index,
      field,
      value
    ) => {
      setQuestions(
        (previous) =>
          previous.map(
            (
              question,
              questionIndex
            ) =>
              questionIndex ===
              index
                ? {
                    ...question,
                    [field]:
                      value,
                  }
                : question
          )
      );
    };

  /* ==========================================================
     DELETE
  ========================================================== */

  const deleteQuestion =
    (index) => {
      setQuestions(
        (previous) =>
          previous.filter(
            (_, i) =>
              i !== index
          )
      );
    };

  /* ==========================================================
     COPY
  ========================================================== */

  const copyCSV =
    async () => {
      if (!questions.length) {
        return;
      }

      try {
        await navigator.clipboard.writeText(
          questionsToCSV(
            questions
          )
        );

        setMessage(
          "CSV copied to clipboard."
        );
      } catch {
        setError(
          "Could not copy CSV."
        );
      }
    };

  /* ==========================================================
     DOWNLOAD
  ========================================================== */

  const downloadCSV =
    () => {
      if (!questions.length) {
        setError(
          "There are no questions to download."
        );
        return;
      }

      const blob =
        new Blob(
          [
            questionsToCSV(
              questions
            ),
          ],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const anchor =
        document.createElement(
          "a"
        );

      anchor.href = url;

      anchor.download =
        "extracted_questions.csv";

      document.body.appendChild(
        anchor
      );

      anchor.click();

      anchor.remove();

      URL.revokeObjectURL(
        url
      );

      setMessage(
        "CSV downloaded successfully."
      );
    };

  /* ==========================================================
     RESET
  ========================================================== */

  const resetExtraction =
    () => {
      setQuestions([]);
      setRawText("");
      setMessage("");
      setError("");
      setShowRawText(false);
      setExtractProgress(0);
    };

  /* ==========================================================
     STATS
  ========================================================== */

  const stats =
    useMemo(() => {
      const complete =
        questions.filter(
          (q) =>
            q.question &&
            q.optionA &&
            q.optionB &&
            q.optionC &&
            q.optionD
        ).length;

      const answers =
        questions.filter(
          (q) =>
            ["A", "B", "C", "D"].includes(
              q.answer
            )
        ).length;

      return {
        total:
          questions.length,
        complete,
        answers,
      };
    }, [questions]);

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const goToQuestionBank =
    () => {
      navigate(
        "/admin/cbt/questions"
      );
    };

  const goToCBT = () => {
    navigate(
      "/admin/cbt"
    );
  };

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#05070d] text-white">

      {/* BACKGROUND */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize:
              "24px 24px",
          }}
        />

      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">

            <button
              type="button"
              onClick={
                goToQuestionBank
              }
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft
                size={19}
              />
            </button>

            <div>

              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-300">

                <ScanText
                  size={14}
                />

                Smart Question Extractor

              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Extract Questions
                from Images & Documents
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                Upload images, PDFs or Word
                documents. OCR runs directly
                in your browser and the
                extracted questions become
                editable immediately.
              </p>

            </div>

          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={goToCBT}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
            >
              CBT Dashboard
            </button>

            <button
              type="button"
              onClick={
                goToQuestionBank
              }
              className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-2.5 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20"
            >
              Question Bank
            </button>

          </div>

        </div>

        {/* MESSAGES */}

        <AnimatePresence>

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-300"
            >
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0"
              />

              <span>
                {error}
              </span>
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-300"
            >
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0"
              />

              <span>
                {message}
              </span>
            </motion.div>
          )}

        </AnimatePresence>

        {/* MAIN */}

        <div className="grid gap-6 xl:grid-cols-[400px_1fr]">

          {/* LEFT */}

          <div className="space-y-5">

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20">

              {/* DROPZONE */}

              <div
                onDragEnter={
                  handleDragEnter
                }
                onDragOver={
                  handleDragOver
                }
                onDragLeave={
                  handleDragLeave
                }
                onDrop={
                  handleDrop
                }
                onClick={() =>
                  !extracting &&
                  inputRef.current?.click()
                }
                className={[
                  "relative flex min-h-[270px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-5 py-10 text-center transition",

                  dragActive
                    ? "border-blue-400 bg-blue-400/10"
                    : "border-white/10 bg-black/10 hover:border-blue-400/40 hover:bg-blue-400/[0.035]",

                  extracting
                    ? "cursor-not-allowed opacity-70"
                    : "",
                ].join(" ")}
              >

                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  accept={ACCEPTED_TYPES.join(
                    ","
                  )}
                  onChange={
                    handleInputChange
                  }
                  disabled={
                    extracting
                  }
                  className="hidden"
                />

                <motion.div
                  animate={{
                    scale:
                      dragActive
                        ? 1.08
                        : 1,
                  }}
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300"
                >
                  <Upload
                    size={28}
                  />
                </motion.div>

                <h2 className="font-semibold">
                  {dragActive
                    ? "Drop files here"
                    : "Upload question material"}
                </h2>

                <p className="mt-2 max-w-xs text-xs leading-5 text-white/40">
                  Images, PDF, Word
                  documents or TXT
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-1.5">

                  {[
                    "JPG",
                    "PNG",
                    "WEBP",
                    "PDF",
                    "DOCX",
                    "TXT",
                  ].map(
                    (type) => (
                      <span
                        key={type}
                        className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-bold text-white/40"
                      >
                        {type}
                      </span>
                    )
                  )}

                </div>

                <p className="mt-3 text-[10px] text-white/25">
                  Maximum 25MB per file
                </p>

              </div>

              {/* FILE LIST */}

              {files.length > 0 && (
                <div className="mt-5 space-y-2">

                  {files.map(
                    (
                      file,
                      index
                    ) => (
                      <div
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3"
                      >

                        <FileIcon
                          file={
                            file
                          }
                        />

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-xs font-semibold text-white/80">
                            {
                              file.name
                            }
                          </p>

                          <p className="mt-1 text-[10px] text-white/30">
                            {formatBytes(
                              file.size
                            )}
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFile(
                              index
                            )
                          }
                          disabled={
                            extracting
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-400/10 hover:text-red-300"
                        >
                          <X
                            size={16}
                          />
                        </button>

                      </div>
                    )
                  )}

                </div>
              )}

              {/* EXTRACT */}

              <button
                type="button"
                onClick={
                  extractQuestions
                }
                disabled={
                  extracting ||
                  !files.length
                }
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
              >

                {extracting ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />

                    {extractionStage ||
                      "Extracting..."}
                  </>
                ) : (
                  <>
                    <Sparkles
                      size={19}
                    />

                    Extract Questions
                  </>
                )}

              </button>

              {/* PROGRESS */}

              {extracting && (
                <div className="mt-5">

                  <div className="mb-2 flex items-center justify-between">

                    <span className="text-xs text-white/40">
                      {extractingFile}
                    </span>

                    <span className="text-xs font-bold text-blue-300">
                      {
                        extractProgress
                      }%
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/5">

                    <motion.div
                      className="h-full rounded-full bg-blue-500"
                      animate={{
                        width: `${extractProgress}%`,
                      }}
                    />

                  </div>

                </div>
              )}

              {files.length > 0 &&
                !extracting && (
                  <button
                    type="button"
                    onClick={
                      clearAll
                    }
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white/40 transition hover:bg-white/5 hover:text-red-300"
                  >
                    <Trash2
                      size={14}
                    />
                    Clear files
                  </button>
                )}

            </div>

            {/* ENGINE INFO */}

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">

              <div className="flex items-center gap-2">

                <Brain
                  size={18}
                  className="text-blue-400"
                />

                <h3 className="font-semibold">
                  Smart OCR Engine
                </h3>

              </div>

              <p className="mt-3 text-xs leading-6 text-white/40">
                Images are enlarged and
                processed before OCR. Multiple
                Tesseract layouts are tested so
                the extractor has a better chance
                of recovering questions from
                difficult screenshots.
              </p>

              <div className="mt-4 space-y-2 text-xs text-white/40">

                {[
                  "Image preprocessing",
                  "Multiple OCR passes",
                  "PDF page extraction",
                  "DOCX text extraction",
                  "Flexible question detection",
                  "Flexible A–D option detection",
                ].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2
                        size={14}
                        className="text-emerald-400"
                      />
                      {item}
                    </div>
                  )
                )}

              </div>

            </div>

          </div>

          {/* RIGHT */}

          <div className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/20 sm:p-7">

            {/* RESULT HEADER */}

            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <ScanText
                    size={19}
                    className="text-blue-400"
                  />

                  <h2 className="text-lg font-bold">
                    Extracted Questions
                  </h2>

                </div>

                <p className="mt-1 text-xs text-white/35">
                  Review and repair OCR
                  results before exporting.
                </p>

              </div>

              {questions.length >
                0 && (
                <div className="flex flex-wrap gap-2">

                  <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-300">
                    {
                      stats.total
                    }{" "}
                    Questions
                  </span>

                  <span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
                    {
                      stats.complete
                    }{" "}
                    Complete
                  </span>

                  <span className="rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-300">
                    {
                      stats.answers
                    }{" "}
                    Answers
                  </span>

                </div>
              )}

            </div>

            {/* ACTIONS */}

            {(rawText ||
              questions.length >
                0) && (
              <div className="mt-5 flex flex-wrap gap-2">

                {rawText && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowRawText(
                        (v) => !v
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <Eye
                      size={14}
                    />

                    {showRawText
                      ? "Hide OCR Text"
                      : "View OCR Text"}
                  </button>
                )}

                {questions.length >
                  0 && (
                  <>
                    <button
                      type="button"
                      onClick={
                        copyCSV
                      }
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      <Copy
                        size={14}
                      />
                      Copy CSV
                    </button>

                    <button
                      type="button"
                      onClick={
                        downloadCSV
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-black transition hover:bg-emerald-400"
                    >
                      <Download
                        size={14}
                      />
                      Download CSV
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={
                    resetExtraction
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/40 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <RotateCcw
                    size={14}
                  />
                  Reset
                </button>

              </div>
            )}

            {/* RAW TEXT */}

            {showRawText &&
              rawText && (
                <div className="mt-5 rounded-2xl border border-blue-400/10 bg-black/30 p-4">

                  <div className="mb-2 flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <ScanText
                        size={14}
                        className="text-blue-400"
                      />

                      <p className="text-xs font-bold text-blue-300">
                        Raw OCR Text
                      </p>

                    </div>

                    <span className="text-[10px] text-white/25">
                      {
                        rawText.length
                      }{" "}
                      characters
                    </span>

                  </div>

                  <textarea
                    value={
                      rawText
                    }
                    onChange={(
                      event
                    ) =>
                      setRawText(
                        event.target
                          .value
                      )
                    }
                    className="min-h-[220px] w-full resize-y rounded-xl border border-white/10 bg-black/30 p-3 font-mono text-xs leading-5 text-white/60 outline-none focus:border-blue-500/40"
                  />

                </div>
              )}

            {/* EMPTY */}

            {!questions.length && (
              <div className="flex min-h-[500px] flex-col items-center justify-center text-center">

                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.035] text-white/20">

                  <ScanText
                    size={34}
                  />

                </div>

                <h3 className="mt-5 text-sm font-semibold text-white/60">
                  No questions extracted yet
                </h3>

                <p className="mt-2 max-w-sm text-xs leading-5 text-white/30">
                  Upload your question
                  image, PDF or DOCX and
                  click{" "}
                  <span className="text-blue-300">
                    Extract Questions
                  </span>
                  .
                </p>

              </div>
            )}

            {/* QUESTIONS */}

            {questions.length >
              0 && (
              <div className="mt-6 space-y-5">

                {questions.map(
                  (
                    question,
                    index
                  ) => (
                    <motion.div
                      key={index}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="rounded-2xl border border-white/10 bg-black/20 p-5"
                    >

                      {/* TOP */}

                      <div className="mb-4 flex items-center justify-between">

                        <div className="flex items-center gap-3">

                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-300">
                            {
                              index +
                              1
                            }
                          </span>

                          <span className="text-xs font-semibold uppercase tracking-wider text-white/30">
                            Question
                          </span>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            deleteQuestion(
                              index
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-white/25 transition hover:bg-red-400/10 hover:text-red-300"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>

                      </div>

                      {/* QUESTION */}

                      <textarea
                        value={
                          question.question
                        }
                        onChange={(
                          event
                        ) =>
                          updateQuestion(
                            index,
                            "question",
                            event.target
                              .value
                          )
                        }
                        placeholder="Question"
                        className="min-h-[90px] w-full resize-y rounded-xl border border-white/10 bg-white/[0.025] p-3 text-sm leading-6 text-white outline-none transition focus:border-blue-500/40"
                      />

                      {/* OPTIONS */}

                      <div className="mt-4 grid gap-3 md:grid-cols-2">

                        {[
                          "A",
                          "B",
                          "C",
                          "D",
                        ].map(
                          (letter) => (
                            <div
                              key={
                                letter
                              }
                              className="relative"
                            >

                              <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-[10px] font-bold text-blue-300">
                                {
                                  letter
                                }
                              </span>

                              <input
                                value={
                                  question[
                                    `option${letter}`
                                  ] ||
                                  ""
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateQuestion(
                                    index,
                                    `option${letter}`,
                                    event.target
                                      .value
                                  )
                                }
                                placeholder={`Option ${letter}`}
                                className="w-full rounded-xl border border-white/10 bg-white/[0.025] py-3 pl-12 pr-3 text-xs text-white outline-none transition focus:border-blue-500/40"
                              />

                            </div>
                          )
                        )}

                      </div>

                      {/* ANSWER / REASON */}

                      <div className="mt-4 grid gap-3 md:grid-cols-[150px_1fr]">

                        <select
                          value={
                            question.answer ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            updateQuestion(
                              index,
                              "answer",
                              event.target
                                .value
                            )
                          }
                          className="rounded-xl border border-white/10 bg-[#0a0d15] px-3 py-3 text-xs font-semibold text-white outline-none focus:border-blue-500/40"
                        >

                          <option value="">
                            Answer
                          </option>

                          <option value="A">
                            A
                          </option>

                          <option value="B">
                            B
                          </option>

                          <option value="C">
                            C
                          </option>

                          <option value="D">
                            D
                          </option>

                        </select>

                        <input
                          value={
                            question.reason ||
                            ""
                          }
                          onChange={(
                            event
                          ) =>
                            updateQuestion(
                              index,
                              "reason",
                              event.target
                                .value
                            )
                          }
                          placeholder="Reason / explanation"
                          className="rounded-xl border border-white/10 bg-white/[0.025] px-3 py-3 text-xs text-white outline-none focus:border-blue-500/40"
                        />

                      </div>

                    </motion.div>
                  )
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}

