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

export default function Whiteboard({
  liveClassId,
  tutorReference,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);

  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#111827");
  const [size, setSize] = useState(4);

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [textMode, setTextMode] = useState(false);

  /*
   * Resize canvas while preserving drawing.
   */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const oldCanvas = document.createElement("canvas");
    oldCanvas.width = canvas.width;
    oldCanvas.height = canvas.height;

    const oldContext = oldCanvas.getContext("2d");

    if (oldContext && canvas.width && canvas.height) {
      oldContext.drawImage(canvas, 0, 0);
    }

    const rect = container.getBoundingClientRect();

    const width = Math.max(
      300,
      Math.floor(rect.width)
    );

    const height = Math.max(
      300,
      Math.floor(rect.height)
    );

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.fillStyle = "#ffffff";
    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (oldCanvas.width && oldCanvas.height) {
      context.drawImage(
        oldCanvas,
        0,
        0,
        oldCanvas.width,
        oldCanvas.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
    }
  }, []);

  /*
   * Initial canvas.
   */
  useEffect(() => {
    resizeCanvas();

    const observer = new ResizeObserver(() => {
      resizeCanvas();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [resizeCanvas]);

  /*
   * Save canvas state.
   */
  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const image = canvas.toDataURL("image/png");

    setHistory((previous) => {
      const next = previous.slice(
        0,
        historyIndex + 1
      );

      next.push(image);

      return next.slice(-30);
    });

    setHistoryIndex((previous) =>
      Math.min(previous + 1, 29)
    );
  }, [historyIndex]);

  /*
   * Get mouse/touch position.
   */
  const getPoint = (event) => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect = canvas.getBoundingClientRect();

    let clientX;
    let clientY;

    if (event.touches?.length) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if (event.changedTouches?.length) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    return {
      x:
        ((clientX - rect.left) /
          rect.width) *
        canvas.width,

      y:
        ((clientY - rect.top) /
          rect.height) *
        canvas.height,
    };
  };

  /*
   * Start drawing.
   */
  const startDrawing = (event) => {
    if (tool === "text") {
      addText(event);
      return;
    }

    event.preventDefault();

    const canvas = canvasRef.current;

    if (!canvas) return;

    drawingRef.current = true;

    const point = getPoint(event);

    lastPointRef.current = point;
  };

  /*
   * Draw.
   */
  const draw = (event) => {
    if (!drawingRef.current) return;

    event.preventDefault();

    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const point = getPoint(event);
    const previous = lastPointRef.current;

    if (!previous) {
      lastPointRef.current = point;
      return;
    }

    context.lineCap = "round";
    context.lineJoin = "round";

    if (tool === "eraser") {
      context.globalCompositeOperation =
        "destination-out";

      context.lineWidth = size * 4;
    } else {
      context.globalCompositeOperation =
        "source-over";

      context.strokeStyle = color;
      context.lineWidth = size;
    }

    context.beginPath();

    context.moveTo(
      previous.x,
      previous.y
    );

    context.lineTo(
      point.x,
      point.y
    );

    context.stroke();

    lastPointRef.current = point;
  };

  /*
   * Stop drawing.
   */
  const stopDrawing = () => {
    if (!drawingRef.current) return;

    drawingRef.current = false;
    lastPointRef.current = null;

    const canvas = canvasRef.current;

    if (!canvas) return;

    /*
     * Restore normal drawing mode.
     */
    const context = canvas.getContext("2d");

    if (context) {
      context.globalCompositeOperation =
        "source-over";
    }

    saveCanvasState();
  };

  /*
   * Add text to board.
   */
  const addText = (event) => {
    event.preventDefault();

    const text = window.prompt(
      "Enter text for the board:"
    );

    if (!text?.trim()) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const point = getPoint(event);

    context.globalCompositeOperation =
      "source-over";

    context.fillStyle = color;
    context.font = `${Math.max(
      18,
      size * 5
    )}px Arial`;

    context.fillText(
      text.trim(),
      point.x,
      point.y
    );

    saveCanvasState();

    setTextMode(false);
    setTool("pen");
  };

  /*
   * Restore an image from history.
   */
  const restoreState = (image) => {
    const canvas = canvasRef.current;

    if (!canvas || !image) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    const imageObject = new Image();

    imageObject.onload = () => {
      context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      context.drawImage(
        imageObject,
        0,
        0,
        canvas.width,
        canvas.height
      );
    };

    imageObject.src = image;
  };

  /*
   * Undo.
   */
  const undo = () => {
    if (historyIndex <= 0) {
      clearBoardVisualOnly();
      return;
    }

    const nextIndex =
      historyIndex - 1;

    setHistoryIndex(nextIndex);

    restoreState(
      history[nextIndex]
    );
  };

  /*
   * Redo.
   */
  const redo = () => {
    if (
      historyIndex >=
      history.length - 1
    ) {
      return;
    }

    const nextIndex =
      historyIndex + 1;

    setHistoryIndex(nextIndex);

    restoreState(
      history[nextIndex]
    );
  };

  /*
   * Clear board.
   */
  const clearBoardVisualOnly = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");

    if (!context) return;

    context.globalCompositeOperation =
      "source-over";

    context.fillStyle = "#ffffff";

    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  };

  const clearBoard = () => {
    clearBoardVisualOnly();

    saveCanvasState();
  };

  /*
   * Select tool.
   */
  const selectTool = (nextTool) => {
    setTool(nextTool);

    if (nextTool === "text") {
      setTextMode(true);
    } else {
      setTextMode(false);
    }
  };

  /*
   * Keyboard shortcuts.
   */
  useEffect(() => {
    const handleKeyboard = (event) => {
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
    };

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, [historyIndex, history]);

  /*
   * Save initial state.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;

      if (!canvas) return;

      const image =
        canvas.toDataURL("image/png");

      setHistory([image]);
      setHistoryIndex(0);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-full min-h-[420px] bg-white flex flex-col relative">
      {/* TOP TOOLBAR */}
      <div className="h-14 shrink-0 bg-slate-900 text-white border-b border-white/10 flex items-center gap-2 px-3 overflow-x-auto">
        {/* PEN */}
        <button
          type="button"
          onClick={() => selectTool("pen")}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            tool === "pen"
              ? "bg-blue-600"
              : "bg-white/10 hover:bg-white/15"
          }`}
          title="Marker"
        >
          <Pen size={18} />
        </button>

        {/* ERASER */}
        <button
          type="button"
          onClick={() =>
            selectTool("eraser")
          }
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            tool === "eraser"
              ? "bg-blue-600"
              : "bg-white/10 hover:bg-white/15"
          }`}
          title="Eraser"
        >
          <Eraser size={18} />
        </button>

        {/* TEXT */}
        <button
          type="button"
          onClick={() =>
            selectTool("text")
          }
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            tool === "text"
              ? "bg-blue-600"
              : "bg-white/10 hover:bg-white/15"
          }`}
          title="Text"
        >
          <Type size={18} />
        </button>

        <div className="h-7 w-px bg-white/10 mx-1" />

        {/* COLORS */}
        <div className="flex items-center gap-1.5">
          {COLORS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setColor(item);
                setTool("pen");
              }}
              className={`w-7 h-7 rounded-full border-2 ${
                color === item
                  ? "border-white scale-110"
                  : "border-white/20"
              }`}
              style={{
                backgroundColor: item,
              }}
              title={`Pen color ${item}`}
            />
          ))}
        </div>

        <div className="h-7 w-px bg-white/10 mx-1" />

        {/* SIZE */}
        <div className="flex items-center gap-1">
          {SIZES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSize(item)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                size === item
                  ? "bg-white/20"
                  : "hover:bg-white/10"
              }`}
              title={`Marker size ${item}`}
            >
              <span
                className="rounded-full bg-white"
                style={{
                  width: Math.min(
                    item + 2,
                    18
                  ),
                  height: Math.min(
                    item + 2,
                    18
                  ),
                }}
              />
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* UNDO */}
        <button
          type="button"
          onClick={undo}
          disabled={historyIndex <= 0}
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-30 flex items-center justify-center shrink-0"
          title="Undo"
        >
          <RotateCcw size={18} />
        </button>

        {/* REDO */}
        <button
          type="button"
          onClick={redo}
          disabled={
            historyIndex >=
            history.length - 1
          }
          className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-30 flex items-center justify-center shrink-0"
          title="Redo"
        >
          <RotateCw size={18} />
        </button>

        {/* CLEAR */}
        <button
          type="button"
          onClick={clearBoard}
          className="w-10 h-10 rounded-xl bg-red-500/15 text-red-300 hover:bg-red-500/25 flex items-center justify-center shrink-0"
          title="Clear board"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* BOARD */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 relative overflow-hidden bg-white touch-none"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        />

        {/* BOARD INFO */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/80 text-white text-xs">
            {textMode
              ? "Click the board to add text"
              : tool === "eraser"
              ? "Eraser"
              : "Marker"}
          </div>
        </div>

        {/* CLASSROOM ID */}
        {liveClassId && (
          <div className="absolute bottom-3 right-3 pointer-events-none">
            <div className="px-3 py-1.5 rounded-lg bg-slate-900/70 text-white/60 text-[10px]">
              Board • {liveClassId}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}