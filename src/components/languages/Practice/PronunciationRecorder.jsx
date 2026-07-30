import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Download,
  Volume2,
  CheckCircle2,
  Activity,
  Timer,
} from "lucide-react";

const PronunciationRecorder = ({
  prompt = "Read the sentence aloud.",
  targetText = "",
  onRecordingComplete,
  onDelete,
}) => {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval;

    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      const recorder = new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: "audio/webm",
        });

        const url = URL.createObjectURL(blob);

        setAudioBlob(blob);
        setAudioURL(url);

        onRecordingComplete?.(blob, url);

        stream.getTracks().forEach((track) =>
          track.stop()
        );
      };

      recorder.start();

      mediaRecorderRef.current = recorder;

      setSeconds(0);
      setIsRecording(true);
    } catch (error) {
      console.error(error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const togglePlayback = async () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }

    try {
      await audioRef.current.play();
      setPlaying(true);
    } catch (error) {
      console.error(error);
    }
  };

  const restartAudio = () => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setPlaying(true);
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }

    setAudioBlob(null);
    setAudioURL("");
    setPlaying(false);

    onDelete?.();
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
      className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900"
    >
      {/* Header */}

      <div className="bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-700 p-8">

        <div className="flex items-center gap-5">

          <div className="rounded-2xl bg-white/10 p-4">
            <Mic
              size={34}
              className="text-white"
            />
          </div>

          <div>
            <h2 className="text-3xl font-black text-white">
              Pronunciation Recorder
            </h2>

            <p className="mt-2 text-cyan-100">
              Practice speaking and compare your pronunciation.
            </p>
          </div>

        </div>

      </div>

      <div className="space-y-8 p-8">

        {/* Prompt */}

        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6">

          <h3 className="text-lg font-bold text-cyan-300">
            Prompt
          </h3>

          <p className="mt-3 text-slate-300">
            {prompt}
          </p>

          {targetText && (
            <div className="mt-5 rounded-xl bg-black/20 p-4">
              <p className="text-xl font-semibold text-white">
                {targetText}
              </p>
            </div>
          )}

        </div>

        {/* Recorder */}

        <div className="flex flex-col items-center gap-6">

          <motion.button
            whileTap={{ scale: 0.95 }}
            animate={
              isRecording
                ? {
                    scale: [1, 1.08, 1],
                  }
                : {}
            }
            transition={{
              repeat: Infinity,
              duration: 1.2,
            }}
            onClick={
              isRecording
                ? stopRecording
                : startRecording
            }
            className={`flex h-24 w-24 items-center justify-center rounded-full transition ${
              isRecording
                ? "bg-red-600"
                : "bg-cyan-600 hover:bg-cyan-500"
            }`}
          >
            {isRecording ? (
              <Square size={34} />
            ) : (
              <Mic size={34} />
            )}
          </motion.button>

          <div className="flex items-center gap-2 text-slate-300">

            <Timer size={18} />

            <span>{seconds}s</span>

          </div>

        </div>

        {/* Audio */}

        {audioURL && (
          <>
            <audio
              ref={audioRef}
              src={audioURL}
              onEnded={() => setPlaying(false)}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

              <button
                onClick={togglePlayback}
                className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-4 font-semibold transition hover:bg-cyan-500"
              >
                {playing ? (
                  <>
                    <Pause size={18} />
                    Pause
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Play
                  </>
                )}
              </button>

              <button
                onClick={restartAudio}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/10"
              >
                <RotateCcw size={18} />
                Restart
              </button>

              <a
                href={audioURL}
                download="pronunciation.webm"
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition hover:bg-white/10"
              >
                <Download size={18} />
                Download
              </a>

              <button
                onClick={deleteRecording}
                className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-300 transition hover:bg-red-500/20"
              >
                <Trash2 size={18} />
                Delete
              </button>

              <div className="flex items-center justify-center gap-2 rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-green-300">
                <CheckCircle2 size={18} />
                Saved
              </div>

            </div>
          </>
        )}

        {/* Tips */}

        <div className="rounded-2xl border border-white/10 bg-black/20 p-6">

          <div className="mb-4 flex items-center gap-2 text-cyan-300">

            <Activity size={20} />

            <h3 className="font-bold text-white">
              Pronunciation Tips
            </h3>

          </div>

          <ul className="space-y-3 text-slate-300">

            <li>• Speak slowly and clearly.</li>
            <li>• Listen to native pronunciation first.</li>
            <li>• Repeat difficult words multiple times.</li>
            <li>• Compare your recording with the original.</li>
            <li>• Focus on stress and intonation.</li>

          </ul>

        </div>

      </div>

    </motion.section>
  );
};

export default PronunciationRecorder;