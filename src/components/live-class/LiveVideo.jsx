
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
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

const LiveVideo = ({
  liveClassId,
  tutorReference,
  tutorName = "Tutor",
  isLive = false,
  compact = false,
  onScreenShareChange,
  onMediaStreamChange,
}) => {
  const cameraVideoRef = useRef(null);
  const screenVideoRef = useRef(null);

  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const cameraEnabledRef = useRef(false);
  const microphoneEnabledRef = useRef(false);
  const screenSharingRef = useRef(false);

  const mediaCallbackRef = useRef(onMediaStreamChange);
  const screenCallbackRef = useRef(onScreenShareChange);

  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [previewPaused, setPreviewPaused] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    mediaCallbackRef.current = onMediaStreamChange;
  }, [onMediaStreamChange]);

  useEffect(() => {
    screenCallbackRef.current = onScreenShareChange;
  }, [onScreenShareChange]);

  // Send BOTH streams to the parent classroom component.
  const notifyMediaStream = useCallback(() => {
    const cameraStream = cameraStreamRef.current;
    const screenStream = screenStreamRef.current;

    mediaCallbackRef.current?.({
      liveClassId,
      tutorReference,

      cameraStream,
      screenStream,

      // Backward compatibility only.
      // TutorLiveClassroom must use cameraStream and screenStream separately.
      outgoingStream: screenStream || cameraStream || null,

      cameraEnabled: cameraEnabledRef.current,
      microphoneEnabled: microphoneEnabledRef.current,
      screenSharing: screenSharingRef.current,
    });
  }, [liveClassId, tutorReference]);

  const attachCameraPreview = useCallback(() => {
    const video = cameraVideoRef.current;
    const stream = cameraStreamRef.current;

    if (!video) return;

    if (video.srcObject !== stream) {
      video.srcObject = stream || null;
    }

    if (stream) {
      video.muted = true;
      video.play().catch(() => {});
    }
  }, []);

  const attachScreenPreview = useCallback(() => {
    const video = screenVideoRef.current;
    const stream = screenStreamRef.current;

    if (!video) return;

    if (video.srcObject !== stream) {
      video.srcObject = stream || null;
    }

    if (stream) {
      video.muted = true;
      video.play().catch(() => {});
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (cameraStreamRef.current || busy) return;

    setBusy(true);
    setCameraError("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      cameraStreamRef.current = stream;

      cameraEnabledRef.current = true;
      microphoneEnabledRef.current = true;

      setCameraEnabled(true);
      setMicrophoneEnabled(true);

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      if (videoTrack) videoTrack.enabled = true;
      if (audioTrack) audioTrack.enabled = true;

      attachCameraPreview();

      // Notify parent only after refs contain the actual stream.
      notifyMediaStream();
    } catch (error) {
      console.error("CAMERA START ERROR:", error);

      setCameraError(
        error?.name === "NotAllowedError"
          ? "Camera or microphone permission was denied."
          : error?.name === "NotFoundError"
            ? "No camera or microphone was found."
            : error?.message || "Unable to access camera."
      );
    } finally {
      setBusy(false);
    }
  }, [busy, attachCameraPreview, notifyMediaStream]);

  const stopCamera = useCallback(() => {
    const stream = cameraStreamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });
    }

    cameraStreamRef.current = null;

    cameraEnabledRef.current = false;
    microphoneEnabledRef.current = false;

    setCameraEnabled(false);
    setMicrophoneEnabled(false);

    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }

    notifyMediaStream();
  }, [notifyMediaStream]);

  const toggleCamera = useCallback(async () => {
    const stream = cameraStreamRef.current;

    if (!stream) {
      await startCamera();
      return;
    }

    const videoTrack = stream.getVideoTracks()[0];

    if (!videoTrack) {
      await startCamera();
      return;
    }

    videoTrack.enabled = !videoTrack.enabled;

    cameraEnabledRef.current = videoTrack.enabled;
    setCameraEnabled(videoTrack.enabled);

    notifyMediaStream();
  }, [startCamera, notifyMediaStream]);

  const toggleMicrophone = useCallback(async () => {
    let stream = cameraStreamRef.current;

    if (!stream) {
      await startCamera();
      return;
    }

    let audioTrack = stream.getAudioTracks()[0];

    if (!audioTrack) {
      try {
        const audioStream =
          await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });

        audioTrack = audioStream.getAudioTracks()[0];

        if (audioTrack) {
          stream.addTrack(audioTrack);
        }
      } catch (error) {
        console.error("MICROPHONE ERROR:", error);
        setCameraError("Unable to access the microphone.");
        return;
      }
    }

    if (!audioTrack) return;

    audioTrack.enabled = !audioTrack.enabled;

    microphoneEnabledRef.current = audioTrack.enabled;
    setMicrophoneEnabled(audioTrack.enabled);

    notifyMediaStream();
  }, [startCamera, notifyMediaStream]);

  const stopScreenShare = useCallback(() => {
    const stream = screenStreamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });
    }

    screenStreamRef.current = null;

    screenSharingRef.current = false;
    setScreenSharing(false);

    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }

    screenCallbackRef.current?.(false);

    // Tell TutorLiveClassroom that the screen stream has disappeared.
    notifyMediaStream();
  }, [notifyMediaStream]);

  const startScreenShare = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setCameraError(
        "Screen sharing is not supported by this browser."
      );
      return;
    }

    if (screenStreamRef.current) return;

    setCameraError("");

    try {
      const stream =
        await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: { ideal: 30, max: 60 },
          },
          audio: true,
        });

      screenStreamRef.current = stream;

      screenSharingRef.current = true;
      setScreenSharing(true);

      const videoTrack = stream.getVideoTracks()[0];

      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }

      attachScreenPreview();

      screenCallbackRef.current?.(true);

      // Both cameraStream and screenStream are now available
      // to TutorLiveClassroom through this callback.
      notifyMediaStream();
    } catch (error) {
      if (
        error?.name !== "NotAllowedError" &&
        error?.name !== "AbortError"
      ) {
        console.error("SCREEN SHARE ERROR:", error);

        setCameraError(
          error?.message || "Unable to share your screen."
        );
      }
    }
  }, [
    attachScreenPreview,
    notifyMediaStream,
    stopScreenShare,
  ]);

  const toggleScreenShare = useCallback(() => {
    if (screenSharingRef.current) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  }, [startScreenShare, stopScreenShare]);

  const togglePreview = useCallback(() => {
    setPreviewPaused((previous) => !previous);
  }, []);

  useEffect(() => {
    attachCameraPreview();
  }, [cameraEnabled, attachCameraPreview]);

  useEffect(() => {
    attachScreenPreview();
  }, [screenSharing, attachScreenPreview]);

  // Publish the current media state when the classroom callback changes.
  useEffect(() => {
    notifyMediaStream();
  }, [notifyMediaStream]);

  useEffect(() => {
    return () => {
      cameraStreamRef.current?.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });

      screenStreamRef.current?.getTracks().forEach((track) => {
        track.onended = null;
        track.stop();
      });

      cameraStreamRef.current = null;
      screenStreamRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[180px] overflow-hidden rounded-2xl bg-[#020617] border border-white/10">
      {screenSharing ? (
        <video
          ref={screenVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-contain bg-black"
        />
      ) : cameraEnabled ? (
        <video
          ref={cameraVideoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${
            previewPaused ? "opacity-0" : ""
          }`}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0b1730] to-[#020617]">
          <div className="w-16 h-16 rounded-full bg-blue-500/15 border border-blue-400/20 flex items-center justify-center mb-3">
            <CameraOff className="w-7 h-7 text-blue-300" />
          </div>

          <p className="text-sm font-semibold text-white">
            {tutorName}
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Camera is off
          </p>
        </div>
      )}

      {previewPaused && cameraEnabled && !screenSharing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <p className="text-sm text-white">
            Preview paused
          </p>
        </div>
      )}

      <div className="absolute top-3 left-3 flex items-center gap-2">
        {isLive && (
          <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold tracking-wider">
            LIVE
          </span>
        )}

        {screenSharing && (
          <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[10px] font-bold">
            SHARING SCREEN
          </span>
        )}
      </div>

      {!compact && (
        <>
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {tutorName}
              </p>

              <p className="text-[10px] text-slate-300">
                {screenSharing
                  ? "Presenting screen"
                  : cameraEnabled
                    ? "Camera active"
                    : "Camera disabled"}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleCamera}
                disabled={busy}
                title={cameraEnabled ? "Turn camera off" : "Turn camera on"}
                className={`p-2.5 rounded-xl ${
                  cameraEnabled
                    ? "bg-white/15 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {cameraEnabled ? (
                  <Camera size={16} />
                ) : (
                  <CameraOff size={16} />
                )}
              </button>

              <button
                type="button"
                onClick={toggleMicrophone}
                disabled={busy}
                title={
                  microphoneEnabled
                    ? "Mute microphone"
                    : "Unmute microphone"
                }
                className={`p-2.5 rounded-xl ${
                  microphoneEnabled
                    ? "bg-white/15 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {microphoneEnabled ? (
                  <Mic size={16} />
                ) : (
                  <MicOff size={16} />
                )}
              </button>

              <button
                type="button"
                onClick={toggleScreenShare}
                title={
                  screenSharing
                    ? "Stop screen sharing"
                    : "Share screen"
                }
                className={`p-2.5 rounded-xl ${
                  screenSharing
                    ? "bg-blue-600 text-white"
                    : "bg-white/15 text-white"
                }`}
              >
                {screenSharing ? (
                  <MonitorOff size={16} />
                ) : (
                  <Monitor size={16} />
                )}
              </button>

              <button
                type="button"
                onClick={togglePreview}
                title={
                  previewPaused ? "Resume preview" : "Pause preview"
                }
                className="p-2.5 rounded-xl bg-white/15 text-white"
              >
                {previewPaused ? (
                  <Play size={16} />
                ) : (
                  <Pause size={16} />
                )}
              </button>
            </div>
          </div>

          {cameraError && (
            <div className="absolute top-12 left-3 right-3 flex items-start gap-2 rounded-xl bg-red-950/90 border border-red-500/30 p-3">
              <VolumeX
                size={15}
                className="text-red-300 shrink-0 mt-0.5"
              />

              <p className="text-xs text-red-100 flex-1">
                {cameraError}
              </p>

              <button
                type="button"
                onClick={() => setCameraError("")}
                className="text-red-200"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {busy && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-xs">
                Starting camera...
              </div>
            </div>
          )}
        </>
      )}

      {compact && (
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <span className="text-xs text-white font-medium drop-shadow">
            {tutorName}
          </span>

          <span className="flex items-center gap-1 text-[10px] text-white">
            <Volume2 size={12} />
            {microphoneEnabled ? "Audio on" : "Muted"}
          </span>
        </div>
      )}
    </div>
  );
};

export default LiveVideo;
