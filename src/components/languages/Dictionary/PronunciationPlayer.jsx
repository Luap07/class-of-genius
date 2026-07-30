import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Volume2,
  Pause,
  Play,
  RotateCcw,
  Mic,
  Waves,
} from "lucide-react";

const PronunciationPlayer = ({
  audioUrl,
  word,
  phonetic,
  onRecord,
}) => {
  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const updateProgress = () => {
      if (!audio.duration) return;

      setProgress(
        (audio.currentTime / audio.duration) * 100
      );
    };

    const handleEnded = () => {
      setPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setPlaying(!playing);
  };

  const restart = () => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setPlaying(true);
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
      <audio
        ref={audioRef}
        src={audioUrl}
      />

      {/* Header */}

      <div className="flex items-center gap-4">

        <div className="rounded-2xl bg-cyan-600 p-4">

          <Volume2
            size={30}
            className="text-white"
          />

        </div>

        <div>

          <h2 className="text-2xl font-black text-white">
            {word || "Pronunciation"}
          </h2>

          <p className="text-cyan-300">
            {phonetic || "/.../"}
          </p>

        </div>

      </div>

      {/* Wave */}

      <div className="mt-8 flex items-end justify-center gap-2">

        {Array.from({ length: 25 }).map((_, index) => (

          <motion.div
            key={index}
            animate={{
              height: playing
                ? [12, 40, 18, 36]
                : 12,
            }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              delay: index * 0.05,
            }}
            className="w-1 rounded-full bg-cyan-400"
          />

        ))}

      </div>

      {/* Progress */}

      <div className="mt-8">

        <div className="h-2 overflow-hidden rounded-full bg-white/10">

          <motion.div
            animate={{
              width: `${progress}%`,
            }}
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
          />

        </div>

      </div>

      {/* Controls */}

      <div className="mt-8 flex flex-wrap gap-4">

        <button
          onClick={togglePlayback}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-cyan-600 py-4 font-bold transition hover:bg-cyan-500"
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
          onClick={restart}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 font-bold transition hover:bg-white/10"
        >
          <RotateCcw size={18} />
          Replay
        </button>

        <button
          onClick={onRecord}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-4 font-bold transition hover:bg-white/10"
        >
          <Mic size={18} />
          Record
        </button>

      </div>

      <div className="mt-6 flex items-center justify-center gap-2 text-cyan-300">

        <Waves size={18} />

        <span className="text-sm">
          Listen carefully and imitate the pronunciation.
        </span>

      </div>

    </motion.section>
  );
};

export default PronunciationPlayer;