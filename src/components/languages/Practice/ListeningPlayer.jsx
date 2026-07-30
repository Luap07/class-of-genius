import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Headphones,
} from "lucide-react";

const formatTime = (seconds = 0) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const ListeningPlayer = ({
  title = "Listening Exercise",
  subtitle = "Practice your listening skills",
  audioSrc = "",
  autoPlay = false,
  playbackRate = 1,
  onEnded,
  onTimeUpdate,
}) => {
  const audioRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    if (!audioRef.current) return;

    audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    if (autoPlay && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  }, [autoPlay]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setPlaying(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLoaded = () => {
    setDuration(audioRef.current.duration || 0);
  };

  const handleTime = () => {
    const current = audioRef.current.currentTime;

    setCurrentTime(current);

    onTimeUpdate?.(current);
  };

  const seek = (event) => {
    if (!audioRef.current) return;

    const value = Number(event.target.value);

    audioRef.current.currentTime = value;

    setCurrentTime(value);
  };

  const restart = () => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  const skip = (seconds) => {
    if (!audioRef.current) return;

    audioRef.current.currentTime += seconds;
  };

  const changeVolume = (value) => {
    if (!audioRef.current) return;

    const vol = Number(value);

    audioRef.current.volume = vol;

    setVolume(vol);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    audioRef.current.muted = !muted;

    setMuted(!muted);
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

      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 p-8">

        <div className="flex items-center gap-5">

          <div className="rounded-2xl bg-white/10 p-4">

            <Headphones
              size={34}
              className="text-white"
            />

          </div>

          <div>

            <h2 className="text-3xl font-black text-white">
              {title}
            </h2>

            <p className="mt-2 text-cyan-100">
              {subtitle}
            </p>

          </div>

        </div>

      </div>

      <div className="space-y-8 p-8">

        <audio
          ref={audioRef}
          src={audioSrc}
          onLoadedMetadata={handleLoaded}
          onTimeUpdate={handleTime}
          onEnded={() => {
            setPlaying(false);
            onEnded?.();
          }}
        />

        {/* Timeline */}

        <div>

          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={seek}
            className="w-full cursor-pointer"
          />

          <div className="mt-2 flex justify-between text-sm text-slate-400">

            <span>{formatTime(currentTime)}</span>

            <span>{formatTime(duration)}</span>

          </div>

        </div>

        {/* Controls */}

        <div className="flex flex-wrap items-center justify-center gap-4">

          <button
            onClick={() => skip(-10)}
            className="rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
          >
            <SkipBack />
          </button>

          <button
            onClick={restart}
            className="rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
          >
            <RotateCcw />
          </button>

          <button
            onClick={togglePlay}
            className="rounded-full bg-cyan-600 p-6 transition hover:scale-105 hover:bg-cyan-500"
          >
            {playing ? (
              <Pause size={30} />
            ) : (
              <Play size={30} />
            )}
          </button>

          <button
            onClick={() => skip(10)}
            className="rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
          >
            <SkipForward />
          </button>

        </div>

        {/* Volume */}

        <div className="flex items-center gap-4">

          <button
            onClick={toggleMute}
            className="rounded-xl bg-white/5 p-3 transition hover:bg-white/10"
          >
            {muted ? (
              <VolumeX />
            ) : (
              <Volume2 />
            )}
          </button>

          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) =>
              changeVolume(e.target.value)
            }
            className="flex-1"
          />

        </div>

        {/* Playback Speed */}

        <div className="flex flex-wrap gap-3">

          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (

            <button
              key={speed}
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.playbackRate = speed;
                }
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 transition hover:border-cyan-500"
            >
              {speed}x
            </button>

          ))}

        </div>

      </div>

    </motion.section>
  );
};

export default ListeningPlayer;