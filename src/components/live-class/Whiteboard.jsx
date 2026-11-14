
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Eraser,
  Pen,
  RotateCcw,
  RotateCw,
  Trash2,
  Type,
  PanelLeftClose,
  PanelLeftOpen,
  Check,
  X,
} from "lucide-react";

const COLORS = [
  "#111827",
  "#dc2626",
  "#2563eb",
  "#16a34a",
  "#9333ea",
  "#ea580c",
];

const SIZES = [2, 4, 7, 12, 18];
const MAX_HISTORY = 30;

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const getToken = () => {
  const keys = [
    "scholiqen_academy_token",
    "scholiqen_token",
    "academy_token",
    "student_token",
    "admin_token",
    "access_token",
    "token",
  ];

  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      if (value) return value;
    } catch {
      return "";
    }
  }

  return "";
};

const getHeaders = (tutorReference) => {
  const headers = {
    "Content-Type": "application/json",
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (tutorReference) {
    headers["x-tutor-reference"] = tutorReference;
  }

  return headers;
};

const createBlankCanvas = (canvas) => {
  if (!canvas) return;

  const context = canvas.getContext("2d");
  if (!context) return;

  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.globalCompositeOperation = "source-over";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.restore();
};

export default function Whiteboard({
  liveClassId,
  tutorReference,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const textInputRef = useRef(null);

  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const activePointerRef = useRef(null);

  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);

  const syncTimerRef = useRef(null);
  const pollTimerRef = useRef(null);
  const mountedRef = useRef(false);

  const readyRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const lastRemoteImageRef = useRef("");

  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#111827");
  const [size, setSize] = useState(4);

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [textMode, setTextMode] = useState(false);
  const [textEditor, setTextEditor] = useState(null);
  const [textValue, setTextValue] = useState("");

  const [syncError, setSyncError] = useState("");

  const [toolbarOpen, setToolbarOpen] = useState(true);

  const [syncStatus, setSyncStatus] = useState(
    liveClassId ? "loading" : "local"
  );

  // ============================================================
  // HISTORY
  // ============================================================

  const updateHistory = useCallback((items, index) => {
    historyRef.current = items;
    historyIndexRef.current = index;

    setHistory(items);
    setHistoryIndex(index);
  }, []);

  const getCanvasImage = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas || !canvas.width || !canvas.height) {
      return "";
    }

    try {
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Whiteboard image error:", error);
      return "";
    }
  }, []);

  const commitHistory = useCallback(() => {
    const image = getCanvasImage();

    if (!image) return "";

    let next = historyRef.current.slice(
      0,
      historyIndexRef.current + 1
    );

    next.push(image);

    if (next.length > MAX_HISTORY) {
      next = next.slice(-MAX_HISTORY);
    }

    updateHistory(next, next.length - 1);

    return image;
  }, [getCanvasImage, updateHistory]);

  const restoreImage = useCallback((image, callback) => {
    const canvas = canvasRef.current;

    if (!canvas || !image) {
      callback?.(false);
      return;
    }

    const imageObject = new Image();

    imageObject.onload = () => {
      const currentCanvas = canvasRef.current;

      if (!currentCanvas) {
        callback?.(false);
        return;
      }

      const context = currentCanvas.getContext("2d");

      if (!context) {
        callback?.(false);
        return;
      }

      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.globalCompositeOperation = "source-over";
      context.fillStyle = "#ffffff";

      context.fillRect(
        0,
        0,
        currentCanvas.width,
        currentCanvas.height
      );

      context.drawImage(
        imageObject,
        0,
        0,
        currentCanvas.width,
        currentCanvas.height
      );

      context.restore();

      callback?.(true);
    };

    imageObject.onerror = () => callback?.(false);
    imageObject.src = image;
  }, []);

  // ============================================================
  // RESIZE CANVAS
  // ============================================================

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();

    if (rect.width < 1 || rect.height < 1) return;

    const width = Math.max(300, Math.floor(rect.width));
    const height = Math.max(300, Math.floor(rect.height));

    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    const newWidth = Math.round(width * pixelRatio);
    const newHeight = Math.round(height * pixelRatio);

    if (
      canvas.width === newWidth &&
      canvas.height === newHeight
    ) {
      return;
    }

    const previous = document.createElement("canvas");

    previous.width = canvas.width || newWidth;
    previous.height = canvas.height || newHeight;

    const previousContext = previous.getContext("2d");

    if (previousContext && canvas.width && canvas.height) {
      previousContext.drawImage(canvas, 0, 0);
    }

    canvas.width = newWidth;
    canvas.height = newHeight;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.setTransform(
      pixelRatio,
      0,
      0,
      pixelRatio,
      0,
      0
    );

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);

    if (previous.width && previous.height) {
      context.drawImage(
        previous,
        0,
        0,
        previous.width,
        previous.height,
        0,
        0,
        width,
        height
      );
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const initialize = () => {
      resizeCanvas();
    };

    initialize();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(initialize)
        : null;

    if (observer && containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener("resize", initialize);

    return () => {
      mountedRef.current = false;

      observer?.disconnect();
      window.removeEventListener("resize", initialize);

      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }

      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [resizeCanvas]);

  // ============================================================
  // SAVE WHITEBOARD
  // ============================================================

  const saveRemoteBoard = useCallback(
    async (image) => {
      if (!liveClassId || !image) return;

      try {
        setSyncStatus("saving");
        setSyncError("");

        const endpoint =
          `${API_URL}/api/academy/live-classes/` +
          `${encodeURIComponent(liveClassId)}/whiteboard`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: getHeaders(tutorReference),
          credentials: "include",
          body: JSON.stringify({
            eventType: "state",
            payload: {
              image,
            },
          }),
        });

        const responseText = await response.text();

        let data = {};

        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch {
          data = {
            message: responseText,
          };
        }

        if (!response.ok || data.success === false) {
          const backendMessage =
            data.message ||
            data.error ||
            data.details ||
            responseText ||
            response.statusText ||
            "Unknown backend error";

          const errorMessage =
            `HTTP ${response.status}: ${backendMessage}`;

          console.error("WHITEBOARD SAVE FAILED", {
            endpoint,
            status: response.status,
            statusText: response.statusText,
            response: data,
            responseBody: responseText,
            imageLength: image.length,
            liveClassId,
          });

          throw new Error(errorMessage);
        }

        lastRemoteImageRef.current = image;

        if (mountedRef.current) {
          setSyncStatus("synced");
          setSyncError("");
        }

        console.info("Whiteboard saved successfully", {
          liveClassId,
          status: response.status,
        });
      } catch (error) {
        console.error("Whiteboard save error:", error);

        if (mountedRef.current) {
          setSyncStatus("offline");
          setSyncError(
            error?.message || "Unable to save whiteboard."
          );
        }
      } finally {
        pendingSaveRef.current = false;
      }
    },
    [liveClassId, tutorReference]
  );

  const queueRemoteSave = useCallback(
    (image) => {
      if (!liveClassId || !image) return;

      pendingSaveRef.current = true;

      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }

      syncTimerRef.current = setTimeout(() => {
        saveRemoteBoard(image);
      }, 500);
    },
    [liveClassId, saveRemoteBoard]
  );

  // ============================================================
  // EXTRACT REMOTE IMAGE
  // ============================================================

  const extractRemoteImage = useCallback((data) => {
    const payload =
      data?.whiteboard ??
      data?.data ??
      data?.event?.payload ??
      null;

    if (typeof payload === "string") {
      return payload.startsWith("data:image/") ? payload : "";
    }

    if (!payload || typeof payload !== "object") {
      return "";
    }

    return (
      payload.image ||
      payload.dataUrl ||
      payload.imageData ||
      payload.canvas ||
      payload.state?.image ||
      ""
    );
  }, []);

  // ============================================================
  // LOAD WHITEBOARD
  // ============================================================

  const loadRemoteBoard = useCallback(
    async (initial = false) => {
      if (!liveClassId) {
        readyRef.current = true;
        return;
      }

      try {
        const endpoint =
          `${API_URL}/api/academy/live-classes/` +
          `${encodeURIComponent(liveClassId)}/whiteboard`;

        const response = await fetch(endpoint, {
          method: "GET",
          headers: getHeaders(tutorReference),
          credentials: "include",
        });

        const responseText = await response.text();

        let data = {};

        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch {
          data = {
            message: responseText,
          };
        }

        if (!response.ok || data.success === false) {
          throw new Error(
            `HTTP ${response.status}: ${
              data.message ||
              data.error ||
              responseText ||
              "Could not load whiteboard"
            }`
          );
        }

        const remoteImage = extractRemoteImage(data);

        if (!remoteImage) {
          if (initial) {
            const blank = getCanvasImage();

            updateHistory(
              blank ? [blank] : [],
              blank ? 0 : -1
            );
          }

          readyRef.current = true;

          if (mountedRef.current) {
            setSyncStatus("synced");
            setSyncError("");
          }

          return;
        }

        if (
          !initial &&
          (drawingRef.current || pendingSaveRef.current)
        ) {
          return;
        }

        if (remoteImage === lastRemoteImageRef.current) {
          readyRef.current = true;
          return;
        }

        restoreImage(remoteImage, (success) => {
          if (!success) return;

          lastRemoteImageRef.current = remoteImage;

          if (initial) {
            updateHistory([remoteImage], 0);
          }

          readyRef.current = true;

          if (mountedRef.current) {
            setSyncStatus("synced");
            setSyncError("");
          }
        });
      } catch (error) {
        console.error("Whiteboard load error:", error);

        if (initial) {
          const blank = getCanvasImage();

          updateHistory(
            blank ? [blank] : [],
            blank ? 0 : -1
          );

          readyRef.current = true;
        }

        if (mountedRef.current) {
          setSyncStatus("offline");
          setSyncError(
            error?.message || "Could not load whiteboard."
          );
        }
      }
    },
    [
      liveClassId,
      tutorReference,
      extractRemoteImage,
      getCanvasImage,
      restoreImage,
      updateHistory,
    ]
  );

  useEffect(() => {
    readyRef.current = false;
    pendingSaveRef.current = false;
    lastRemoteImageRef.current = "";

    if (!liveClassId) {
      const image = getCanvasImage();

      readyRef.current = true;

      if (image) updateHistory([image], 0);

      setSyncStatus("local");
      setSyncError("");

      return;
    }

    setSyncStatus("loading");
    setSyncError("");

    const timer = setTimeout(() => {
      resizeCanvas();
      loadRemoteBoard(true);
    }, 150);

    return () => clearTimeout(timer);
  }, [
    liveClassId,
    getCanvasImage,
    updateHistory,
    resizeCanvas,
    loadRemoteBoard,
  ]);

  useEffect(() => {
    if (!liveClassId) return;

    pollTimerRef.current = setInterval(() => {
      if (
        !readyRef.current ||
        drawingRef.current ||
        pendingSaveRef.current
      ) {
        return;
      }

      loadRemoteBoard(false);
    }, 3000);

    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [liveClassId, loadRemoteBoard]);

  // ============================================================
  // POINTER POSITION
  // ============================================================

  const getPoint = useCallback((event) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return { x: 0, y: 0 };
    }

    const pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    return {
      x:
        ((event.clientX - rect.left) / rect.width) *
        (canvas.width / pixelRatio),

      y:
        ((event.clientY - rect.top) / rect.height) *
        (canvas.height / pixelRatio),
    };
  }, []);

  // ============================================================
  // TEXT EDITOR
  // ============================================================

  const openTextEditor = useCallback(
    (event) => {
      event.preventDefault();

      const point = getPoint(event);

      setTextValue("");
      setTextEditor(point);

      requestAnimationFrame(() => {
        textInputRef.current?.focus();
      });
    },
    [getPoint]
  );

  const submitText = useCallback(() => {
    const text = textValue.trim();

    if (!text || !textEditor) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    context.save();

    context.globalCompositeOperation = "source-over";
    context.fillStyle = color;
    context.font = `${Math.max(18, size * 5)}px Arial`;
    context.textBaseline = "top";

    const lines = text.split("\n");
    const lineHeight = Math.max(24, size * 7);

    lines.forEach((line, index) => {
      context.fillText(
        line,
        textEditor.x,
        textEditor.y + index * lineHeight
      );
    });

    context.restore();

    const image = commitHistory();

    queueRemoteSave(image);

    setTextEditor(null);
    setTextValue("");
    setTextMode(false);
    setTool("pen");
  }, [
    textValue,
    textEditor,
    color,
    size,
    commitHistory,
    queueRemoteSave,
  ]);

  const cancelText = useCallback(() => {
    setTextEditor(null);
    setTextValue("");
    setTextMode(false);
    setTool("pen");
  }, []);

  // ============================================================
  // START DRAWING
  // ============================================================

  const startDrawing = useCallback(
    (event) => {
      if (!readyRef.current) return;

      if (event.button !== undefined && event.button !== 0) {
        return;
      }

      if (tool === "text") {
        openTextEditor(event);
        return;
      }

      event.preventDefault();

      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");

      if (!canvas || !context) return;

      drawingRef.current = true;
      activePointerRef.current = event.pointerId;

      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is optional.
      }

      const point = getPoint(event);

      lastPointRef.current = point;

      context.save();
      context.lineCap = "round";
      context.lineJoin = "round";

      if (tool === "eraser") {
        context.globalCompositeOperation = "destination-out";
        context.fillStyle = "#000000";
      } else {
        context.globalCompositeOperation = "source-over";
        context.fillStyle = color;
      }

      const radius =
        tool === "eraser" ? size * 2 : size / 2;

      context.beginPath();

      context.arc(
        point.x,
        point.y,
        Math.max(1, radius),
        0,
        Math.PI * 2
      );

      context.fill();
      context.restore();
    },
    [tool, size, color, getPoint, openTextEditor]
  );

  // ============================================================
  // DRAW
  // ============================================================

  const draw = useCallback(
    (event) => {
      if (!drawingRef.current) return;

      if (
        activePointerRef.current !== null &&
        event.pointerId !== activePointerRef.current
      ) {
        return;
      }

      event.preventDefault();

      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");

      if (!canvas || !context) return;

      const point = getPoint(event);
      const previous = lastPointRef.current;

      if (!previous) {
        lastPointRef.current = point;
        return;
      }

      context.save();
      context.lineCap = "round";
      context.lineJoin = "round";

      if (tool === "eraser") {
        context.globalCompositeOperation = "destination-out";
        context.strokeStyle = "#000000";
        context.lineWidth = size * 4;
      } else {
        context.globalCompositeOperation = "source-over";
        context.strokeStyle = color;
        context.lineWidth = size;
      }

      context.beginPath();
      context.moveTo(previous.x, previous.y);
      context.lineTo(point.x, point.y);
      context.stroke();
      context.restore();

      lastPointRef.current = point;
    },
    [tool, size, color, getPoint]
  );

  // ============================================================
  // STOP DRAWING AND SAVE
  // ============================================================

  const stopDrawing = useCallback(
    (event) => {
      if (!drawingRef.current) return;

      if (
        event?.pointerId !== undefined &&
        activePointerRef.current !== null &&
        event.pointerId !== activePointerRef.current
      ) {
        return;
      }

      drawingRef.current = false;
      lastPointRef.current = null;

      const pointerId = activePointerRef.current;
      activePointerRef.current = null;

      const canvas = canvasRef.current;

      if (canvas && pointerId !== null) {
        try {
          if (canvas.hasPointerCapture(pointerId)) {
            canvas.releasePointerCapture(pointerId);
          }
        } catch {
          // Ignore pointer capture errors.
        }
      }

      const image = commitHistory();

      queueRemoteSave(image);
    },
    [commitHistory, queueRemoteSave]
  );

  // ============================================================
  // UNDO
  // ============================================================

  const undo = useCallback(() => {
    const currentIndex = historyIndexRef.current;
    const items = historyRef.current;

    if (currentIndex <= 0) return;

    const nextIndex = currentIndex - 1;
    const image = items[nextIndex];

    restoreImage(image, (success) => {
      if (!success) return;

      historyIndexRef.current = nextIndex;
      setHistoryIndex(nextIndex);

      queueRemoteSave(image);
    });
  }, [restoreImage, queueRemoteSave]);

  // ============================================================
  // REDO
  // ============================================================

  const redo = useCallback(() => {
    const currentIndex = historyIndexRef.current;
    const items = historyRef.current;

    if (currentIndex >= items.length - 1) return;

    const nextIndex = currentIndex + 1;
    const image = items[nextIndex];

    restoreImage(image, (success) => {
      if (!success) return;

      historyIndexRef.current = nextIndex;
      setHistoryIndex(nextIndex);

      queueRemoteSave(image);
    });
  }, [restoreImage, queueRemoteSave]);

  // ============================================================
  // CLEAR BOARD
  // ============================================================

  const clearBoard = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    createBlankCanvas(canvas);

    const image = commitHistory();

    queueRemoteSave(image);
  }, [commitHistory, queueRemoteSave]);

  const selectTool = (nextTool) => {
    setTool(nextTool);
    setTextMode(nextTool === "text");
    setTextEditor(null);
    setTextValue("");
  };

  // ============================================================
  // KEYBOARD SHORTCUTS
  // ============================================================

  useEffect(() => {
    const handleKeyboard = (event) => {
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        if (event.key === "Escape" && textEditor) {
          cancelText();
        }

        return;
      }

      if (
        event.ctrlKey &&
        event.key.toLowerCase() === "z"
      ) {
        event.preventDefault();
        undo();
      }

      if (
        event.ctrlKey &&
        event.key.toLowerCase() === "y"
      ) {
        event.preventDefault();
        redo();
      }

      if (event.key === "Escape" && textEditor) {
        cancelText();
      }
    };

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, [undo, redo, textEditor, cancelText]);

  // ============================================================
  // SYNC STATUS
  // ============================================================

  const syncLabel = {
    loading: "Loading board",
    saving: "Saving",
    synced: "Synced",
    offline: "Offline",
    local: "Local board",
  }[syncStatus] || "Local board";

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-xl border border-slate-300 bg-white"
      style={{
        height: "100%",
        minHeight: 0,
        width: "100%",
        flex: 1,
      }}
    >
      {/* COLLAPSIBLE TOOLBAR */}

      {toolbarOpen && (
        <div className="z-20 flex min-h-14 shrink-0 items-center gap-2 overflow-x-auto border-b border-slate-700 bg-slate-900 px-3 py-2 text-white">

          {/* PANEL TOGGLE */}

          <button
            type="button"
            onClick={() => setToolbarOpen(false)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
            title="Hide toolbar"
            aria-label="Hide toolbar"
          >
            <PanelLeftClose size={20} />
          </button>

          <div className="mx-1 h-7 w-px shrink-0 bg-white/10" />

          {/* PEN */}

          <button
            type="button"
            onClick={() => selectTool("pen")}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
              tool === "pen"
                ? "bg-slate-600"
                : "bg-white/10 hover:bg-white/15"
            }`}
            title="Marker"
          >
            <Pen size={18} />
          </button>

          {/* ERASER */}

          <button
            type="button"
            onClick={() => selectTool("eraser")}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
              tool === "eraser"
                ? "bg-slate-600"
                : "bg-white/10 hover:bg-white/15"
            }`}
            title="Eraser"
          >
            <Eraser size={18} />
          </button>

          {/* TEXT */}

          <button
            type="button"
            onClick={() => selectTool("text")}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
              tool === "text"
                ? "bg-slate-600"
                : "bg-white/10 hover:bg-white/15"
            }`}
            title="Text"
          >
            <Type size={18} />
          </button>

          <div className="mx-1 h-7 w-px shrink-0 bg-white/10" />

          {/* COLORS */}

          <div className="flex shrink-0 items-center gap-1.5">
            {COLORS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setColor(item);
                  setTool("pen");
                  setTextMode(false);
                  setTextEditor(null);
                }}
                className={`h-7 w-7 shrink-0 rounded-full border-2 transition ${
                  color === item
                    ? "scale-110 border-white"
                    : "border-white/20 hover:border-white/60"
                }`}
                style={{ backgroundColor: item }}
                title={`Pen color ${item}`}
                aria-label={`Select ${item} color`}
              />
            ))}
          </div>

          <div className="mx-1 h-7 w-px shrink-0 bg-white/10" />

          {/* SIZES */}

          <div className="flex shrink-0 items-center gap-1">
            {SIZES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSize(item)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                  size === item
                    ? "bg-white/20"
                    : "hover:bg-white/10"
                }`}
                title={`Marker size ${item}`}
              >
                <span
                  className="rounded-full bg-white"
                  style={{
                    width: Math.min(item + 2, 18),
                    height: Math.min(item + 2, 18),
                  }}
                />
              </button>
            ))}
          </div>

          <div className="min-w-2 flex-1" />

          {/* UNDO */}

          <button
            type="button"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/15 disabled:opacity-30"
            title="Undo"
          >
            <RotateCcw size={18} />
          </button>

          {/* REDO */}

          <button
            type="button"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/15 disabled:opacity-30"
            title="Redo"
          >
            <RotateCw size={18} />
          </button>

          {/* CLEAR */}

          <button
            type="button"
            onClick={clearBoard}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-slate-300 transition hover:bg-white/20 hover:text-white"
            title="Clear board"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}

      {/* WHITEBOARD AREA */}

      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden bg-white"
        style={{
          width: "100%",
          height: "100%",
          flex: 1,
          touchAction: "none",
        }}
      >
        {/* OPEN PANEL BUTTON */}

        {!toolbarOpen && (
          <button
            type="button"
            onClick={() => setToolbarOpen(true)}
            className="absolute left-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100"
            title="Show toolbar"
            aria-label="Show toolbar"
          >
            <PanelLeftOpen size={20} />
          </button>
        )}

        {/* CANVAS */}

        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onLostPointerCapture={() => {
            if (drawingRef.current) {
              stopDrawing();
            }
          }}
          className={`absolute left-0 top-0 block h-full w-full ${
            tool === "text"
              ? "cursor-text"
              : tool === "eraser"
                ? "cursor-cell"
                : "cursor-crosshair"
          }`}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            touchAction: "none",
            background: "#ffffff",
          }}
        />

        {/* TEXT EDITOR */}

        {textEditor && (
          <div
            className="absolute z-20 w-64 rounded-lg border border-slate-300 bg-white p-2 shadow-lg"
            style={{
              left: Math.max(
                8,
                Math.min(
                  textEditor.x,
                  (containerRef.current?.clientWidth || 300) - 270
                )
              ),
              top: Math.max(
                8,
                Math.min(
                  textEditor.y,
                  (containerRef.current?.clientHeight || 300) - 130
                )
              ),
            }}
            onPointerDown={(event) => event.stopPropagation()}
            onPointerMove={(event) => event.stopPropagation()}
          >
            <textarea
              ref={textInputRef}
              value={textValue}
              onChange={(event) => setTextValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitText();
                }

                if (event.key === "Escape") {
                  event.preventDefault();
                  cancelText();
                }
              }}
              placeholder="Type your text..."
              rows={3}
              className="w-full resize-none rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-900 outline-none focus:border-slate-500"
            />

            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={cancelText}
                className="flex h-8 items-center gap-1 rounded-md border border-slate-300 px-3 text-xs text-slate-700 hover:bg-slate-100"
              >
                <X size={14} />
                Cancel
              </button>

              <button
                type="button"
                onClick={submitText}
                disabled={!textValue.trim()}
                className="flex h-8 items-center gap-1 rounded-md bg-slate-800 px-3 text-xs text-white hover:bg-slate-700 disabled:opacity-40"
              >
                <Check size={14} />
                Add text
              </button>
            </div>
          </div>
        )}

        {/* TOOL INSTRUCTION */}

        <div className="pointer-events-none absolute bottom-3 left-3 z-10">
          <div className="rounded-lg bg-slate-900/85 px-3 py-1.5 text-xs text-white shadow-lg">
            {textMode
              ? "Click the board to type"
              : tool === "eraser"
                ? "Eraser selected"
                : "Marker selected"}
          </div>
        </div>

        {/* SYNC STATUS */}

        <div className="pointer-events-none absolute right-3 top-3 z-10">
          <div
            title={syncError || syncLabel}
            className="flex max-w-xs items-center gap-2 rounded-lg bg-slate-900/85 px-3 py-1.5 text-[10px] text-white/80 shadow-lg"
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                syncStatus === "synced"
                  ? "bg-emerald-400"
                  : syncStatus === "saving"
                    ? "bg-amber-400"
                    : syncStatus === "offline"
                      ? "bg-red-400"
                      : "bg-slate-400"
              }`}
            />

            <span className="truncate">
              {syncLabel}
            </span>
          </div>
        </div>

        {/* BOARD ID */}

        {liveClassId && (
          <div className="pointer-events-none absolute bottom-3 right-3 z-10">
            <div className="rounded-lg bg-slate-900/70 px-3 py-1.5 text-[10px] text-white/60">
              Board • {liveClassId}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
