import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Play,
  Pause,
  Image as ImageIcon,
  UserRound,
  Upload,
  Volume2,
  X,
  ChevronDown,
} from "lucide-react";

const DEFAULT_BACKGROUNDS = [
  {
    id: "original",
    name: "Original",
    type: "original",
  },
  {
    id: "blur",
    name: "Soft Blur",
    type: "blur",
  },
  {
    id: "office",
    name: "Modern Office",
    type: "color",
    value: "#172033",
  },
  {
    id: "studio",
    name: "Virtual Studio",
    type: "color",
    value: "#241b35",
  },
  {
    id: "classroom",
    name: "Classroom",
    type: "color",
    value: "#172b24",
  },
  {
    id: "library",
    name: "Library",
    type: "color",
    value: "#292017",
  },
];

const CHARACTER_OPTIONS = [
  {
    id: "none",
    name: "Original Me",
    type: "none",
  },

  {
    id: "person-1",
    name: "Professional Woman",
    type: "image",
    src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=500&q=80",
  },

  {
    id: "person-2",
    name: "Professional Man",
    type: "image",
    src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
  },

  {
    id: "person-3",
    name: "Young Woman",
    type: "image",
    src: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=80",
  },

  {
    id: "person-4",
    name: "Young Man",
    type: "image",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
  },

  {
    id: "person-5",
    name: "Teacher",
    type: "image",
    src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",
  },

  {
    id: "person-6",
    name: "Tutor",
    type: "image",
    src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80",
  },
];

const VOICE_OPTIONS = [
  {
    id: "normal",
    name: "Normal",
  },
  {
    id: "deep",
    name: "Deep",
  },
  {
    id: "bright",
    name: "Bright",
  },
  {
    id: "robot",
    name: "Robot",
  },
];

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(
    2,
    "0"
  )}`;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = "anonymous";

    image.onload = () => resolve(image);
    image.onerror = reject;

    image.src = src;
  });
}

const LiveVideo = ({
  liveClassId,
  tutorReference,
  tutorName = "Tutor",
  isLive = false,

  onScreenShareChange,
  onMediaStreamChange,

  compact = false,
}) => {
  /*
  |--------------------------------------------------------------------------
  | Refs
  |--------------------------------------------------------------------------
  */

  const videoRef = useRef(null);

  const screenVideoRef = useRef(null);

  const canvasRef = useRef(null);

  const cameraStreamRef = useRef(null);

  const screenStreamRef = useRef(null);

  const processedStreamRef = useRef(null);

  const animationFrameRef = useRef(null);

  const audioContextRef = useRef(null);

  const audioSourceRef = useRef(null);

  const audioDestinationRef = useRef(null);

  const customBackgroundImageRef = useRef(null);

  const customCharacterImageRef = useRef(null);

  const characterImagesRef = useRef({});

  /*
  |--------------------------------------------------------------------------
  | UI State
  |--------------------------------------------------------------------------
  */

  const [cameraEnabled, setCameraEnabled] = useState(true);

  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);

  const [screenSharing, setScreenSharing] = useState(false);

  const [playing, setPlaying] = useState(true);

  const [background, setBackground] = useState("original");

  const [customBackground, setCustomBackground] = useState(null);

  const [character, setCharacter] = useState("none");

  const [customCharacter, setCustomCharacter] = useState(null);

  const [voice, setVoice] = useState("normal");

  const [showBackgrounds, setShowBackgrounds] = useState(false);

  const [showCharacters, setShowCharacters] = useState(false);

  const [showVoices, setShowVoices] = useState(false);

  const [cameraError, setCameraError] = useState("");

  const [isProcessing, setIsProcessing] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Notify Parent About Stream
  |--------------------------------------------------------------------------
  */

  const notifyMediaStream = useCallback(() => {
    if (!onMediaStreamChange) return;

    const cameraStream = cameraStreamRef.current;

    const screenStream = screenStreamRef.current;

    const processedStream = processedStreamRef.current;

    onMediaStreamChange({
      cameraStream,
      screenStream,
      processedStream,
      cameraEnabled,
      microphoneEnabled,
      screenSharing,
    });
  }, [
    onMediaStreamChange,
    cameraEnabled,
    microphoneEnabled,
    screenSharing,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Start Camera
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const startCamera = async () => {
      try {
        setCameraError("");

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Camera access is not supported by this browser."
          );
        }

        const stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
              facingMode: "user",
            },
            audio: true,
          });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        cameraStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.muted = true;

          try {
            await videoRef.current.play();

            setPlaying(true);
          } catch {
            setPlaying(false);
          }
        }

        if (onMediaStreamChange) {
          onMediaStreamChange({
            cameraStream: stream,
            screenStream: null,
            processedStream: null,
            cameraEnabled: true,
            microphoneEnabled: true,
            screenSharing: false,
          });
        }
      } catch (error) {
        console.error("Camera error:", error);

        setCameraError(
          error?.message ||
            "Unable to access your camera or microphone."
        );
      }
    };

    startCamera();

    return () => {
      cancelled = true;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (screenStreamRef.current) {
        screenStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        screenStreamRef.current = null;
      }

      if (cameraStreamRef.current) {
        cameraStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        cameraStreamRef.current = null;
      }

      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }

        audioContextRef.current = null;
      }
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Keep Video Element Connected
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!videoRef.current) return;

    if (
      cameraStreamRef.current &&
      videoRef.current.srcObject !== cameraStreamRef.current
    ) {
      videoRef.current.srcObject =
        cameraStreamRef.current;
    }

    if (playing) {
      videoRef.current
        .play()
        .catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [compact, playing]);

  /*
  |--------------------------------------------------------------------------
  | Preload Character Images
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    const preloadCharacters = async () => {
      for (const option of CHARACTER_OPTIONS) {
        if (
          option.type !== "image" ||
          characterImagesRef.current[option.id]
        ) {
          continue;
        }

        try {
          const image = await loadImage(option.src);

          if (!cancelled) {
            characterImagesRef.current[option.id] = image;
          }
        } catch (error) {
          console.warn(
            `Could not load character ${option.id}`,
            error
          );
        }
      }
    };

    preloadCharacters();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load Custom Background
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!customBackground) {
      customBackgroundImageRef.current = null;
      return;
    }

    loadImage(customBackground)
      .then((image) => {
        customBackgroundImageRef.current = image;
      })
      .catch((error) => {
        console.error(
          "Unable to load custom background:",
          error
        );
      });
  }, [customBackground]);

  /*
  |--------------------------------------------------------------------------
  | Load Custom Character
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!customCharacter) {
      customCharacterImageRef.current = null;
      return;
    }

    loadImage(customCharacter)
      .then((image) => {
        customCharacterImageRef.current = image;
      })
      .catch((error) => {
        console.error(
          "Unable to load custom character:",
          error
        );
      });
  }, [customCharacter]);

  /*
  |--------------------------------------------------------------------------
  | Camera Toggle
  |--------------------------------------------------------------------------
  */

  const toggleCamera = useCallback(() => {
    const stream = cameraStreamRef.current;

    if (!stream) return;

    const nextState = !cameraEnabled;

    stream
      .getVideoTracks()
      .forEach((track) => {
        track.enabled = nextState;
      });

    setCameraEnabled(nextState);
  }, [cameraEnabled]);

  /*
  |--------------------------------------------------------------------------
  | Microphone Toggle
  |--------------------------------------------------------------------------
  */

  const toggleMicrophone = useCallback(() => {
    const stream = cameraStreamRef.current;

    if (!stream) return;

    const nextState = !microphoneEnabled;

    stream
      .getAudioTracks()
      .forEach((track) => {
        track.enabled = nextState;
      });

    setMicrophoneEnabled(nextState);
  }, [microphoneEnabled]);

  /*
  |--------------------------------------------------------------------------
  | Play / Pause
  |--------------------------------------------------------------------------
  */

  const togglePlay = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    if (playing) {
      video.pause();
      setPlaying(false);
    } else {
      video
        .play()
        .then(() => {
          setPlaying(true);
        })
        .catch(() => {});
    }
  }, [playing]);

  /*
  |--------------------------------------------------------------------------
  | Screen Share
  |--------------------------------------------------------------------------
  */

  const stopScreenShare = useCallback(() => {
    const stream = screenStreamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    screenStreamRef.current = null;

    setScreenSharing(false);

    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }

    if (onScreenShareChange) {
      onScreenShareChange(false, null);
    }

    notifyMediaStream();
  }, [
    onScreenShareChange,
    notifyMediaStream,
  ]);

  const startScreenShare = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error(
          "Screen sharing is not supported by this browser."
        );
      }

      const stream =
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

      screenStreamRef.current = stream;

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;

        screenVideoRef.current.muted = true;

        await screenVideoRef.current
          .play()
          .catch(() => {});
      }

      setScreenSharing(true);

      if (onScreenShareChange) {
        onScreenShareChange(true, stream);
      }

      stream
        .getVideoTracks()[0]
        ?.addEventListener("ended", () => {
          stopScreenShare();
        });

      notifyMediaStream();
    } catch (error) {
      console.error("Screen share error:", error);
    }
  }, [
    onScreenShareChange,
    stopScreenShare,
    notifyMediaStream,
  ]);

  const toggleScreenShare = useCallback(() => {
    if (screenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  }, [
    screenSharing,
    stopScreenShare,
    startScreenShare,
  ]);

  /*
  |--------------------------------------------------------------------------
  | File Upload Helper
  |--------------------------------------------------------------------------
  */

  const handleBackgroundUpload = (
    event
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setCustomBackground(reader.result);
      setBackground("custom");
      setShowBackgrounds(false);
    };

    reader.readAsDataURL(file);
  };

  const handleCharacterUpload = (
    event
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setCustomCharacter(reader.result);
      setCharacter("custom");
      setShowCharacters(false);
    };

    reader.readAsDataURL(file);
  };

  /*
  |--------------------------------------------------------------------------
  | Virtual Background Renderer
  |--------------------------------------------------------------------------
  |
  | This section provides the background selection layer.
  |
  | A production-grade person cutout requires a segmentation model.
  | The important thing here is that the selected image/background
  | belongs BEHIND the tutor instead of simply placing a picture
  | over the tutor's video.
  |--------------------------------------------------------------------------
  */

  const drawBackground = useCallback(
    (ctx, width, height) => {
      if (background === "original") {
        return;
      }

      if (background === "blur") {
        ctx.save();

        ctx.filter = "blur(18px)";

        ctx.drawImage(
          videoRef.current,
          -20,
          -20,
          width + 40,
          height + 40
        );

        ctx.restore();

        return;
      }

      if (
        background === "custom" &&
        customBackgroundImageRef.current
      ) {
        const image =
          customBackgroundImageRef.current;

        const imageRatio =
          image.width / image.height;

        const canvasRatio = width / height;

        let drawWidth = width;
        let drawHeight = height;
        let offsetX = 0;
        let offsetY = 0;

        if (imageRatio > canvasRatio) {
          drawHeight = height;

          drawWidth =
            drawHeight * imageRatio;

          offsetX =
            (width - drawWidth) / 2;
        } else {
          drawWidth = width;

          drawHeight =
            drawWidth / imageRatio;

          offsetY =
            (height - drawHeight) / 2;
        }

        ctx.drawImage(
          image,
          offsetX,
          offsetY,
          drawWidth,
          drawHeight
        );

        return;
      }

      const selected =
        DEFAULT_BACKGROUNDS.find(
          (item) => item.id === background
        );

      if (selected?.type === "color") {
        ctx.fillStyle =
          selected.value || "#111827";

        ctx.fillRect(
          0,
          0,
          width,
          height
        );
      }
    },
    [background]
  );

  /*
  |--------------------------------------------------------------------------
  | Character Renderer
  |--------------------------------------------------------------------------
  |
  | The character image is presented as a selected tutor avatar.
  | This intentionally does NOT pretend to perform a real face swap.
  |--------------------------------------------------------------------------
  */

  const getSelectedCharacterImage =
    useCallback(() => {
      if (character === "custom") {
        return customCharacterImageRef.current;
      }

      if (character === "none") {
        return null;
      }

      return characterImagesRef.current[
        character
      ];
    }, [character]);

  /*
  |--------------------------------------------------------------------------
  | Start Canvas Processing
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const video = videoRef.current;

    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    let stopped = false;

    const render = () => {
      if (stopped) return;

      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const width =
        video.videoWidth || 1280;

      const height =
        video.videoHeight || 720;

      if (
        canvas.width !== width ||
        canvas.height !== height
      ) {
        canvas.width = width;

        canvas.height = height;
      }

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      /*
      |--------------------------------------------------------------------------
      | Background
      |--------------------------------------------------------------------------
      */

      if (
        background === "original" &&
        character === "none"
      ) {
        ctx.drawImage(
          video,
          0,
          0,
          width,
          height
        );
      } else {
        /*
        |--------------------------------------------------------------------------
        | Draw background first.
        |--------------------------------------------------------------------------
        */

        if (background !== "original") {
          drawBackground(
            ctx,
            width,
            height
          );
        } else {
          ctx.fillStyle = "#080b12";

          ctx.fillRect(
            0,
            0,
            width,
            height
          );
        }

        /*
        |--------------------------------------------------------------------------
        | Draw the real tutor camera.
        |
        | This is kept here so the background remains BEHIND
        | the camera instead of covering the tutor.
        |--------------------------------------------------------------------------
        */

        ctx.drawImage(
          video,
          0,
          0,
          width,
          height
        );

        /*
        |--------------------------------------------------------------------------
        | Character preview
        |--------------------------------------------------------------------------
        */

        const selectedCharacter =
          getSelectedCharacterImage();

        if (selectedCharacter) {
          const size =
            Math.min(width, height) * 0.32;

          const x =
            width - size - 30;

          const y =
            height - size - 30;

          ctx.save();

          ctx.beginPath();

          ctx.arc(
            x + size / 2,
            y + size / 2,
            size / 2,
            0,
            Math.PI * 2
          );

          ctx.clip();

          ctx.drawImage(
            selectedCharacter,
            x,
            y,
            size,
            size
          );

          ctx.restore();

          ctx.strokeStyle =
            "rgba(255,255,255,.75)";

          ctx.lineWidth = 4;

          ctx.beginPath();

          ctx.arc(
            x + size / 2,
            y + size / 2,
            size / 2,
            0,
            Math.PI * 2
          );

          ctx.stroke();
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Keep generating frames.
      |--------------------------------------------------------------------------
      */

      animationFrameRef.current =
        requestAnimationFrame(render);
    };

    render();

    return () => {
      stopped = true;

      if (animationFrameRef.current) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
      }
    };
  }, [
    background,
    character,
    drawBackground,
    getSelectedCharacterImage,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Create Processed Stream
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    try {
      const stream =
        canvas.captureStream(30);

      processedStreamRef.current =
        stream;

      notifyMediaStream();
    } catch (error) {
      console.error(
        "Canvas stream error:",
        error
      );
    }
  }, [notifyMediaStream]);

  /*
  |--------------------------------------------------------------------------
  | Voice Effect
  |--------------------------------------------------------------------------
  |
  | Uses Web Audio filtering.
  |
  | This changes the tonal character of the microphone.
  | It is not a full AI pitch/voice-cloning system.
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const stream =
      cameraStreamRef.current;

    if (!stream) return;

    if (voice === "normal") {
      notifyMediaStream();

      return;
    }

    try {
      if (!audioContextRef.current) {
        const AudioContext =
          window.AudioContext ||
          window.webkitAudioContext;

        if (!AudioContext) return;

        const audioContext =
          new AudioContext();

        audioContextRef.current =
          audioContext;

        audioSourceRef.current =
          audioContext.createMediaStreamSource(
            stream
          );

        audioDestinationRef.current =
          audioContext.createMediaStreamDestination();

        audioSourceRef.current.connect(
          audioDestinationRef.current
        );
      }

      const context =
        audioContextRef.current;

      const source =
        audioSourceRef.current;

      const destination =
        audioDestinationRef.current;

      /*
      |--------------------------------------------------------------------------
      | Disconnect old effects.
      |--------------------------------------------------------------------------
      */

      try {
        source.disconnect();
      } catch {
        // ignore
      }

      let node;

      if (voice === "deep") {
        node =
          context.createBiquadFilter();

        node.type = "lowshelf";

        node.frequency.value = 180;

        node.gain.value = 8;
      }

      if (voice === "bright") {
        node =
          context.createBiquadFilter();

        node.type = "highshelf";

        node.frequency.value = 2500;

        node.gain.value = 8;
      }

      if (voice === "robot") {
        node =
          context.createBiquadFilter();

        node.type = "bandpass";

        node.frequency.value = 1100;

        node.Q.value = 8;
      }

      if (node) {
        source.connect(node);

        node.connect(destination);
      } else {
        source.connect(destination);
      }

      if (context.state === "suspended") {
        context.resume().catch(() => {});
      }

      notifyMediaStream();
    } catch (error) {
      console.error(
        "Voice effect error:",
        error
      );
    }
  }, [voice, notifyMediaStream]);

  /*
  |--------------------------------------------------------------------------
  | Notify When State Changes
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    notifyMediaStream();
  }, [
    cameraEnabled,
    microphoneEnabled,
    screenSharing,
    background,
    character,
    voice,
    notifyMediaStream,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Button Component
  |--------------------------------------------------------------------------
  */

  const ControlButton = ({
    active = false,
    danger = false,
    children,
    onClick,
    title,
  }) => {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={[
          "h-10 w-10",
          "rounded-xl",
          "flex items-center justify-center",
          "border",
          "transition-all duration-200",
          "backdrop-blur-xl",
          danger
            ? "bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30"
            : active
            ? "bg-white/15 border-white/20 text-white"
            : "bg-black/30 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white",
        ].join(" ")}
      >
        {children}
      </button>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Character Name
  |--------------------------------------------------------------------------
  */

  const selectedCharacter =
    CHARACTER_OPTIONS.find(
      (item) => item.id === character
    );

  /*
  |--------------------------------------------------------------------------
  | Main Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className={[
        "relative overflow-hidden",
        "w-full h-full",
        "bg-[#070a10]",
        "border border-white/10",
        compact
          ? "rounded-2xl shadow-2xl"
          : "rounded-3xl",
      ].join(" ")}
    >
      {/* 
      |--------------------------------------------------------------------------
      | Hidden processing canvas
      |--------------------------------------------------------------------------
      */}

      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* 
      |--------------------------------------------------------------------------
      | Screen video
      |--------------------------------------------------------------------------
      */}

      <video
        ref={screenVideoRef}
        className="hidden"
        playsInline
        muted
      />

      {/* 
      |--------------------------------------------------------------------------
      | CAMERA
      |
      | IMPORTANT:
      | This SAME video element stays mounted.
      | We only change its CSS/layout.
      |--------------------------------------------------------------------------
      */}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={[
          "absolute inset-0",
          "w-full h-full",
          "object-cover",
          "transition-all duration-300",
          cameraEnabled
            ? "opacity-100"
            : "opacity-0",
        ].join(" ")}
      />

      {/* 
      |--------------------------------------------------------------------------
      | Camera Off
      |--------------------------------------------------------------------------
      */}

      {!cameraEnabled && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080b12]">
          <div className="w-20 h-20 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
            <CameraOff
              size={30}
              className="text-slate-400"
            />
          </div>

          <p className="mt-4 text-white font-medium">
            Camera is off
          </p>

          <p className="text-sm text-slate-500 mt-1">
            {tutorName}
          </p>
        </div>
      )}

      {/* 
      |--------------------------------------------------------------------------
      | Screen Share Preview
      |--------------------------------------------------------------------------
      */}

      {screenSharing && (
        <div className="absolute inset-0 z-20 bg-black">
          <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />

          <div className="absolute top-4 left-4 px-3 py-2 rounded-xl bg-black/70 backdrop-blur-xl border border-white/10 text-xs text-white">
            You are sharing your screen
          </div>

          {/* Camera PiP */}
          <div className="absolute right-4 top-4 w-44 sm:w-56 aspect-video rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
            <video
              autoPlay
              playsInline
              muted
              ref={(element) => {
                if (
                  element &&
                  cameraStreamRef.current
                ) {
                  element.srcObject =
                    cameraStreamRef.current;
                }
              }}
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/60 text-[10px] text-white">
              {tutorName}
            </div>
          </div>
        </div>
      )}

      {/* 
      |--------------------------------------------------------------------------
      | Camera Info
      |--------------------------------------------------------------------------
      */}

      {!screenSharing && (
        <div className="absolute top-3 left-3 z-30">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/45 backdrop-blur-xl border border-white/10">
            <div
              className={[
                "w-2 h-2 rounded-full",
                isLive
                  ? "bg-red-500 animate-pulse"
                  : "bg-slate-500",
              ].join(" ")}
            />

            <span className="text-xs text-white">
              {tutorName}
            </span>
          </div>
        </div>
      )}

      {/* 
      |--------------------------------------------------------------------------
      | Camera Error
      |--------------------------------------------------------------------------
      */}

      {cameraError && (
        <div className="absolute top-16 left-3 right-3 z-50">
          <div className="rounded-xl border border-red-400/20 bg-red-950/70 backdrop-blur-xl p-3 text-sm text-red-200">
            {cameraError}
          </div>
        </div>
      )}

      {/* 
      |--------------------------------------------------------------------------
      | Character Badge
      |--------------------------------------------------------------------------
      */}

      {character !== "none" && (
        <div className="absolute bottom-20 left-3 z-30">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/55 backdrop-blur-xl border border-white/10">
            <UserRound
              size={13}
              className="text-violet-300"
            />

            <span className="text-xs text-white">
              {character === "custom"
                ? "Custom Character"
                : selectedCharacter?.name}
            </span>
          </div>
        </div>
      )}

      {/* 
      |--------------------------------------------------------------------------
      | CONTROL BAR
      |--------------------------------------------------------------------------
      */}

      <div
        className={[
          "absolute z-50",
          "left-1/2 -translate-x-1/2",
          "bottom-3",
          "flex items-center gap-1.5",
          "p-1.5",
          "rounded-2xl",
          "bg-black/60",
          "backdrop-blur-2xl",
          "border border-white/10",
          "shadow-2xl",
        ].join(" ")}
      >
        {/* Play */}
        <ControlButton
          active={playing}
          onClick={togglePlay}
          title={playing ? "Pause camera" : "Play camera"}
        >
          {playing ? (
            <Pause size={17} />
          ) : (
            <Play size={17} />
          )}
        </ControlButton>

        {/* Mic */}
        <ControlButton
          active={microphoneEnabled}
          danger={!microphoneEnabled}
          onClick={toggleMicrophone}
          title={
            microphoneEnabled
              ? "Mute microphone"
              : "Unmute microphone"
          }
        >
          {microphoneEnabled ? (
            <Mic size={17} />
          ) : (
            <MicOff size={17} />
          )}
        </ControlButton>

        {/* Camera */}
        <ControlButton
          active={cameraEnabled}
          danger={!cameraEnabled}
          onClick={toggleCamera}
          title={
            cameraEnabled
              ? "Turn camera off"
              : "Turn camera on"
          }
        >
          {cameraEnabled ? (
            <Camera size={17} />
          ) : (
            <CameraOff size={17} />
          )}
        </ControlButton>

        {/* Screen */}
        <ControlButton
          active={screenSharing}
          onClick={toggleScreenShare}
          title={
            screenSharing
              ? "Stop screen sharing"
              : "Share screen"
          }
        >
          {screenSharing ? (
            <MonitorOff size={17} />
          ) : (
            <Monitor size={17} />
          )}
        </ControlButton>

        {/* Background */}
        <div className="relative">
          <ControlButton
            active={
              background !== "original"
            }
            onClick={() => {
              setShowBackgrounds(
                (value) => !value
              );

              setShowCharacters(false);

              setShowVoices(false);
            }}
            title="Virtual background"
          >
            <ImageIcon size={17} />
          </ControlButton>

          {showBackgrounds && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-72 rounded-2xl bg-[#0b0f18]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Virtual Background
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Change what viewers see behind you
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowBackgrounds(false)
                  }
                  className="text-slate-500 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {DEFAULT_BACKGROUNDS.map(
                  (item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setBackground(
                          item.id
                        );

                        setShowBackgrounds(
                          false
                        );
                      }}
                      className={[
                        "rounded-xl overflow-hidden",
                        "border",
                        "text-left",
                        "transition",
                        background === item.id
                          ? "border-violet-400/60 bg-violet-500/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.07]",
                      ].join(" ")}
                    >
                      <div className="h-14 bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center">
                        {item.type ===
                        "color" ? (
                          <div
                            className="w-full h-full"
                            style={{
                              background:
                                item.value,
                            }}
                          />
                        ) : (
                          <ImageIcon
                            size={18}
                            className="text-slate-500"
                          />
                        )}
                      </div>

                      <div className="px-2 py-2">
                        <p className="text-[11px] text-white">
                          {item.name}
                        </p>
                      </div>
                    </button>
                  )
                )}

                {customBackground && (
                  <button
                    type="button"
                    onClick={() => {
                      setBackground(
                        "custom"
                      );

                      setShowBackgrounds(
                        false
                      );
                    }}
                    className={[
                      "rounded-xl overflow-hidden",
                      "border",
                      "text-left",
                      background === "custom"
                        ? "border-violet-400/60"
                        : "border-white/10",
                    ].join(" ")}
                  >
                    <img
                      src={customBackground}
                      alt="Custom background"
                      className="h-14 w-full object-cover"
                    />

                    <div className="px-2 py-2">
                      <p className="text-[11px] text-white">
                        My Image
                      </p>
                    </div>
                  </button>
                )}
              </div>

              <label className="mt-3 flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-dashed border-white/15 bg-white/[0.03] hover:bg-white/[0.07] cursor-pointer text-xs text-slate-300">
                <Upload size={14} />

                Upload Background

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={
                    handleBackgroundUpload
                  }
                />
              </label>
            </div>
          )}
        </div>

        {/* Character */}
        <div className="relative">
          <ControlButton
            active={
              character !== "none"
            }
            onClick={() => {
              setShowCharacters(
                (value) => !value
              );

              setShowBackgrounds(false);

              setShowVoices(false);
            }}
            title="Choose another person"
          >
            <UserRound size={17} />
          </ControlButton>

          {showCharacters && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-80 max-h-[390px] overflow-y-auto rounded-2xl bg-[#0b0f18]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-3">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Choose Person
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Select a different character
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowCharacters(false)
                  }
                  className="text-slate-500 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {CHARACTER_OPTIONS.map(
                  (item) => {
                    const image =
                      item.id === "custom"
                        ? customCharacter
                        : item.src;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setCharacter(
                            item.id
                          );

                          setShowCharacters(
                            false
                          );
                        }}
                        className={[
                          "group",
                          "rounded-xl",
                          "overflow-hidden",
                          "border",
                          "bg-white/[0.03]",
                          "transition",
                          character ===
                          item.id
                            ? "border-violet-400/70 ring-1 ring-violet-400/30"
                            : "border-white/10 hover:border-white/20",
                        ].join(" ")}
                      >
                        <div className="aspect-square bg-slate-900 overflow-hidden">
                          {item.id ===
                          "none" ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera
                                size={22}
                                className="text-slate-500"
                              />
                            </div>
                          ) : (
                            <img
                              src={
                                image
                              }
                              alt={
                                item.name
                              }
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          )}
                        </div>

                        <div className="px-1.5 py-2">
                          <p className="text-[10px] text-white truncate">
                            {item.name}
                          </p>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>

              <label className="mt-3 flex items-center justify-center gap-2 w-full h-10 rounded-xl border border-dashed border-white/15 bg-white/[0.03] hover:bg-white/[0.07] cursor-pointer text-xs text-slate-300">
                <Upload size={14} />

                Upload Different Person

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={
                    handleCharacterUpload
                  }
                />
              </label>

              <p className="mt-2 text-[10px] leading-4 text-slate-600 text-center">
                Character images are selectable
                avatars. True live face replacement
                requires a dedicated AI face model.
              </p>
            </div>
          )}
        </div>

        {/* Voice */}
        <div className="relative">
          <ControlButton
            active={voice !== "normal"}
            onClick={() => {
              setShowVoices(
                (value) => !value
              );

              setShowCharacters(false);

              setShowBackgrounds(false);
            }}
            title="Voice effect"
          >
            <Volume2 size={17} />
          </ControlButton>

          {showVoices && (
            <div className="absolute bottom-12 right-0 w-48 rounded-2xl bg-[#0b0f18]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-2">
              <div className="px-2 py-2">
                <p className="text-sm font-semibold text-white">
                  Voice
                </p>

                <p className="text-[11px] text-slate-500">
                  Change microphone tone
                </p>
              </div>

              {VOICE_OPTIONS.map(
                (item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setVoice(
                        item.id
                      );

                      setShowVoices(
                        false
                      );
                    }}
                    className={[
                      "w-full flex items-center justify-between",
                      "px-3 py-2.5 rounded-xl",
                      "text-xs",
                      "transition",
                      voice === item.id
                        ? "bg-violet-500/15 text-violet-200"
                        : "text-slate-300 hover:bg-white/[0.06]",
                    ].join(" ")}
                  >
                    <span>
                      {item.name}
                    </span>

                    {voice ===
                      item.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* 
      |--------------------------------------------------------------------------
      | Processing indicator
      |--------------------------------------------------------------------------
      */}

      {isProcessing && (
        <div className="absolute bottom-20 right-3 z-40 px-3 py-2 rounded-xl bg-black/60 backdrop-blur-xl border border-white/10 text-[11px] text-slate-300">
          Processing video…
        </div>
      )}
    </div>
  );
};

export default LiveVideo;
