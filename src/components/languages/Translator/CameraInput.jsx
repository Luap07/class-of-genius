import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  CameraOff,
  ScanLine,
  ImagePlus,
  RefreshCw,
  Download,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const CameraInput = ({
  image,
  extractedText = "",
  onCapture,
  onImageSelect,
  onRetake,
  onClear,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });

      setStream(mediaStream);
      setCameraEnabled(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setError("");
    } catch (err) {
      setError("Unable to access camera.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    setCameraEnabled(false);
    setStream(null);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const dataUrl = canvas.toDataURL("image/png");

    onCapture?.(dataUrl);

    stopCamera();
  };

  const chooseImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    onImageSelect?.(file);
  };

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-3xl border border-white/10 bg-slate-900 p-6"
    >
      {/* Header */}

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-black text-white">
            Camera Translator
          </h2>

          <p className="mt-2 text-slate-400">
            Capture or upload an image to extract text for translation.
          </p>

        </div>

        <Camera className="text-cyan-400" size={34} />

      </div>

      {/* Camera */}

      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-black">

        {cameraEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-[400px] w-full object-cover"
          />
        ) : image ? (
          <img
            src={image}
            alt="Captured"
            className="h-[400px] w-full object-cover"
          />
        ) : (
          <div className="flex h-[400px] flex-col items-center justify-center">

            <CameraOff
              size={70}
              className="text-slate-600"
            />

            <p className="mt-6 text-slate-400">
              Camera preview will appear here.
            </p>

          </div>
        )}

      </div>

      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {error && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-red-500/10 p-4 text-red-300">

          <AlertTriangle size={20} />

          {error}

        </div>
      )}

      {/* OCR Result */}

      {extractedText && (
        <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">

          <div className="mb-3 flex items-center gap-2 text-cyan-300">

            <ScanLine size={18} />

            <span className="font-bold">
              Extracted Text
            </span>

          </div>

          <p className="whitespace-pre-wrap leading-8 text-slate-300">
            {extractedText}
          </p>

        </div>
      )}

      {/* Buttons */}

      <div className="mt-8 grid gap-3 md:grid-cols-3 lg:grid-cols-6">

        <button
          onClick={startCamera}
          className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-3 font-bold transition hover:bg-cyan-500"
        >
          <Camera size={18} />
          Start
        </button>

        <button
          onClick={captureImage}
          disabled={!cameraEnabled}
          className="flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-3 font-bold transition hover:bg-green-500 disabled:opacity-50"
        >
          <CheckCircle2 size={18} />
          Capture
        </button>

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 hover:bg-white/10">
          <ImagePlus size={18} />
          Upload

          <input
            type="file"
            accept="image/*"
            onChange={chooseImage}
            className="hidden"
          />
        </label>

        <button
          onClick={onRetake}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 hover:bg-white/10"
        >
          <RefreshCw size={18} />
          Retake
        </button>

        <button
          onClick={() => {
            if (!image) return;

            const link = document.createElement("a");
            link.href = image;
            link.download = "capture.png";
            link.click();
          }}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 hover:bg-white/10"
        >
          <Download size={18} />
          Save
        </button>

        <button
          onClick={onClear}
          className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 py-3 text-red-300 hover:bg-red-500/20"
        >
          <Trash2 size={18} />
          Clear
        </button>

      </div>
    </motion.section>
  );
};

export default CameraInput;