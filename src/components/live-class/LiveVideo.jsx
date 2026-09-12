import React, {
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
  Video,
} from "lucide-react";

export default function LiveVideo({
  liveClassId,
  tutorReference,
  tutorName = "Tutor",
  isLive = false,
  onScreenShareChange,
  onMediaStreamChange,
  compact = false,
}) {
  const videoRef = useRef(null);
  const screenVideoRef = useRef(null);

  const [cameraOn, setCameraOn] =
    useState(true);

  const [micOn, setMicOn] =
    useState(true);

  const [screenSharing, setScreenSharing] =
    useState(false);

  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        if (
          !navigator.mediaDevices?.getUserMedia
        ) {
          console.warn(
            "Camera/microphone access is not supported by this browser."
          );

          return;
        }

        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              video: true,
              audio: true,
            }
          );

        if (!mounted) {
          stream
            .getTracks()
            .forEach((track) =>
              track.stop()
            );

          return;
        }

        cameraStreamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject =
            stream;
        }

        if (onMediaStreamChange) {
          onMediaStreamChange({
            cameraStream: stream,
            screenStream:
              screenStreamRef.current,
            cameraOn: true,
            micOn: true,
            screenSharing: false,
          });
        }
      } catch (error) {
        console.error(
          "Unable to access camera/microphone:",
          error
        );

        setCameraOn(false);
        setMicOn(false);

        if (onMediaStreamChange) {
          onMediaStreamChange({
            cameraStream: null,
            screenStream: null,
            cameraOn: false,
            micOn: false,
            screenSharing: false,
          });
        }
      }
    };

    startCamera();

    return () => {
      mounted = false;

      if (cameraStreamRef.current) {
        cameraStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        cameraStreamRef.current = null;
      }

      if (screenStreamRef.current) {
        screenStreamRef.current
          .getTracks()
          .forEach((track) =>
            track.stop()
          );

        screenStreamRef.current = null;
      }

      if (onMediaStreamChange) {
        onMediaStreamChange({
          cameraStream: null,
          screenStream: null,
          cameraOn: false,
          micOn: false,
          screenSharing: false,
        });
      }
    };
  }, []);

  const notifyStreams = (
    nextCameraOn = cameraOn,
    nextMicOn = micOn,
    nextScreenSharing = screenSharing,
    nextScreenStream = screenStreamRef.current
  ) => {
    if (!onMediaStreamChange) return;

    onMediaStreamChange({
      cameraStream:
        cameraStreamRef.current,
      screenStream: nextScreenStream,
      cameraOn: nextCameraOn,
      micOn: nextMicOn,
      screenSharing: nextScreenSharing,
    });
  };

  const toggleCamera = () => {
    const stream =
      cameraStreamRef.current;

    if (!stream) return;

    const nextState = !cameraOn;

    stream
      .getVideoTracks()
      .forEach((track) => {
        track.enabled = nextState;
      });

    setCameraOn(nextState);

    notifyStreams(
      nextState,
      micOn,
      screenSharing
    );
  };

  const toggleMicrophone = () => {
    const stream =
      cameraStreamRef.current;

    if (!stream) return;

    const nextState = !micOn;

    stream
      .getAudioTracks()
      .forEach((track) => {
        track.enabled = nextState;
      });

    setMicOn(nextState);

    notifyStreams(
      cameraOn,
      nextState,
      screenSharing
    );
  };

  const startScreenShare = async () => {
    try {
      if (
        !navigator.mediaDevices
          ?.getDisplayMedia
      ) {
        alert(
          "Screen sharing is not supported by this browser."
        );

        return;
      }

      const stream =
        await navigator.mediaDevices.getDisplayMedia(
          {
            video: true,
            audio: true,
          }
        );

      screenStreamRef.current = stream;

      setScreenSharing(true);

      if (onScreenShareChange) {
        onScreenShareChange(true);
      }

      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject =
          stream;
      }

      notifyStreams(
        cameraOn,
        micOn,
        true,
        stream
      );

      const videoTrack =
        stream.getVideoTracks()[0];

      if (videoTrack) {
        videoTrack.addEventListener(
          "ended",
          () => {
            stopScreenShare();
          },
          { once: true }
        );
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        console.error(
          "Screen sharing failed:",
          error
        );
      }
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      screenStreamRef.current = null;
    }

    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject =
        null;
    }

    setScreenSharing(false);

    if (onScreenShareChange) {
      onScreenShareChange(false);
    }

    notifyStreams(
      cameraOn,
      micOn,
      false,
      null
    );
  };

  const toggleScreenShare = () => {
    if (screenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  };

  /*
   * COMPACT / FLOATING CAMERA
   */
  if (compact) {
    return (
      <div className="w-full h-full relative rounded-2xl overflow-hidden bg-slate-950 border border-white/20 shadow-2xl">
        {cameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-2">
              <Video
                size={25}
                className="text-white/40"
              />
            </div>

            <p className="text-xs text-white/50">
              Camera off
            </p>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />

        <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
          <div className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur text-[11px] font-medium">
            {tutorName}
          </div>

          {isLive && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-600/90 text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </div>
          )}
        </div>

        {!cameraOn && (
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-red-600/80 text-[10px]">
            Camera off
          </div>
        )}

        <div className="absolute bottom-2 right-2 z-20 flex items-center gap-1">
          <button
            type="button"
            onClick={toggleMicrophone}
            className={`w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur transition ${
              micOn
                ? "bg-black/60 hover:bg-black/80"
                : "bg-red-600 hover:bg-red-700"
            }`}
            title={
              micOn
                ? "Mute microphone"
                : "Unmute microphone"
            }
          >
            {micOn ? (
              <Mic size={14} />
            ) : (
              <MicOff size={14} />
            )}
          </button>

          <button
            type="button"
            onClick={toggleCamera}
            className={`w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur transition ${
              cameraOn
                ? "bg-black/60 hover:bg-black/80"
                : "bg-red-600 hover:bg-red-700"
            }`}
            title={
              cameraOn
                ? "Turn camera off"
                : "Turn camera on"
            }
          >
            {cameraOn ? (
              <Camera size={14} />
            ) : (
              <CameraOff size={14} />
            )}
          </button>

          <button
            type="button"
            onClick={toggleScreenShare}
            className={`w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur transition ${
              screenSharing
                ? "bg-blue-600"
                : "bg-black/60 hover:bg-black/80"
            }`}
            title={
              screenSharing
                ? "Stop screen sharing"
                : "Share screen"
            }
          >
            {screenSharing ? (
              <MonitorOff size={14} />
            ) : (
              <Monitor size={14} />
            )}
          </button>
        </div>

        {screenSharing && (
          <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            muted
            className="hidden"
          />
        )}
      </div>
    );
  }

  /*
   * LARGE VIDEO MODE
   */
  return (
    <div className="w-full h-full min-h-[420px] bg-slate-950 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        {screenSharing ? (
          <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <>
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <Video
                    size={42}
                    className="text-white/40"
                  />
                </div>

                <p className="text-white/70 font-medium">
                  Camera is off
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 rounded-xl bg-black/60 backdrop-blur text-sm font-medium">
            {tutorName}
          </div>

          {isLive && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-600/90 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              LIVE
            </div>
          )}
        </div>

        {liveClassId && (
          <div className="hidden md:block px-3 py-2 rounded-xl bg-black/50 backdrop-blur text-xs text-white/60">
            Classroom #{liveClassId}
          </div>
        )}
      </div>

      {screenSharing && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold shadow-lg">
            <Monitor size={16} />
            Screen sharing
          </div>
        </div>
      )}

      {screenSharing && (
        <div className="absolute right-5 bottom-24 z-20 w-48 aspect-video rounded-2xl overflow-hidden border border-white/20 bg-black shadow-2xl">
          {cameraOn ? (
            <video
              ref={(element) => {
                if (!element) return;

                const stream =
                  cameraStreamRef.current;

                if (
                  stream &&
                  element.srcObject !== stream
                ) {
                  element.srcObject = stream;
                }
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">
              Camera off
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/75 backdrop-blur-xl border border-white/10 shadow-2xl">
          <button
            type="button"
            onClick={toggleMicrophone}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
              micOn
                ? "bg-white/10 hover:bg-white/20"
                : "bg-red-600 hover:bg-red-700"
            }`}
            title={
              micOn
                ? "Mute microphone"
                : "Unmute microphone"
            }
          >
            {micOn ? (
              <Mic size={19} />
            ) : (
              <MicOff size={19} />
            )}
          </button>

          <button
            type="button"
            onClick={toggleCamera}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
              cameraOn
                ? "bg-white/10 hover:bg-white/20"
                : "bg-red-600 hover:bg-red-700"
            }`}
            title={
              cameraOn
                ? "Turn camera off"
                : "Turn camera on"
            }
          >
            {cameraOn ? (
              <Camera size={19} />
            ) : (
              <CameraOff size={19} />
            )}
          </button>

          <button
            type="button"
            onClick={toggleScreenShare}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition ${
              screenSharing
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-white/10 hover:bg-white/20"
            }`}
            title={
              screenSharing
                ? "Stop screen sharing"
                : "Share screen"
            }
          >
            {screenSharing ? (
              <MonitorOff size={19} />
            ) : (
              <Monitor size={19} />
            )}
          </button>
        </div>
      </div>

      {!cameraOn && !screenSharing && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
          <div className="px-4 py-2 rounded-xl bg-black/60 backdrop-blur text-sm text-white/70">
            Your camera is turned off
          </div>
        </div>
      )}
    </div>
  );
}