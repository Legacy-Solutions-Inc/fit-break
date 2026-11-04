"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { Icon } from "./icons";
import { asset } from "./links";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}

type WebkitVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitRequestFullscreen?: () => void;
};

/**
 * "See FitBreak in Action" — the source's custom video player: big play button,
 * first play unmutes, controls fade out 3s after the last mouse move while
 * playing, click-to-seek progress bar, two fullscreen buttons, replay on end,
 * and auto-pause when less than 30% of the video is on screen.
 */
export function IntroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const hasUserPlayed = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [ended, setEnded] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState("0:00");

  const showControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(hideTimer.current);
    if (videoRef.current && !videoRef.current.paused) {
      hideTimer.current = setTimeout(() => setControlsVisible(false), 3000);
    }
  }, []);

  useEffect(() => () => clearTimeout(hideTimer.current), []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && !entry.isIntersecting && !video.paused) video.pause();
      },
      { threshold: 0.3 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      if (!hasUserPlayed.current) {
        video.muted = false;
        setMuted(false);
        hasUserPlayed.current = true;
      }
      void video.play();
    } else {
      video.pause();
    }
  };

  const goFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current as WebkitVideo | null;
    if (!video) return;
    if (video.requestFullscreen) void video.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-black shadow-2xl">
      <div className="relative aspect-video" onMouseMove={showControls}>
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={asset("/videos/intro-compressed.mp4")}
          poster={asset("/images/fitbreak12.webp")}
          // Starts muted (as on the source); mute state is then driven through
          // the element ref so play() sees the change synchronously.
          muted
          playsInline
          preload="auto"
          onClick={togglePlay}
          onPlay={() => {
            setPlaying(true);
            setEnded(false);
            showControls();
          }}
          onPause={() => {
            setPlaying(false);
            setControlsVisible(true);
            clearTimeout(hideTimer.current);
          }}
          onEnded={() => {
            setPlaying(false);
            setEnded(true);
            setProgress(100);
            setControlsVisible(true);
          }}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration) {
              setProgress((v.currentTime / v.duration) * 100);
              setTime(formatTime(v.currentTime));
            }
          }}
        />

        {/* Subtle vignette */}
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.2)]" />

        <button
          type="button"
          aria-label="Fullscreen"
          onClick={goFullscreen}
          className="absolute right-4 bottom-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-black/70"
        >
          <Icon name="expand" className="h-6 w-6" />
        </button>

        <button
          type="button"
          aria-label={playing ? "Pause video" : "Play video"}
          onClick={togglePlay}
          className={cn(
            "absolute inset-0 z-10 flex h-full w-full items-center justify-center",
            // While playing the overlay must not swallow clicks meant for the
            // video; the source hides it via its icon's pointer-events-none.
            (playing || ended) && "pointer-events-none",
          )}
        >
          <div
            className={cn(
              "relative transition-all duration-500 ease-out hover:scale-110",
              (playing || ended) && "pointer-events-none scale-50 opacity-0",
            )}
          >
            <div className="absolute inset-0 scale-125 animate-pulse rounded-full bg-white/20" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/95 shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-xl md:h-32 md:w-32">
              <svg
                className="ml-1.5 h-10 w-10 text-gray-900 md:ml-2 md:h-14 md:w-14"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </button>

        <div
          className={cn(
            "absolute right-0 bottom-0 left-0 z-20 bg-linear-to-t from-black/70 via-black/30 to-transparent p-5 transition-all duration-300 md:p-8",
            controlsVisible ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <div className="flex items-center gap-4 md:gap-6">
            {ended && (
              <button
                type="button"
                aria-label="Replay"
                onClick={(e) => {
                  e.stopPropagation();
                  const v = videoRef.current;
                  if (!v) return;
                  v.currentTime = 0;
                  void v.play();
                }}
                className="flex h-10 w-10 items-center justify-center text-white/80 transition-colors hover:text-white"
              >
                <Icon name="replay" className="h-6 w-6" />
              </button>
            )}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              className="group/progress flex-1 cursor-pointer py-2"
              onClick={(e) => {
                e.stopPropagation();
                const v = videoRef.current;
                if (!v || !v.duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
              }}
              onKeyDown={(e) => {
                const v = videoRef.current;
                if (!v || !v.duration) return;
                if (e.key === "ArrowRight") v.currentTime = Math.min(v.duration, v.currentTime + 5);
                if (e.key === "ArrowLeft") v.currentTime = Math.max(0, v.currentTime - 5);
              }}
            >
              <div className="h-1 overflow-hidden rounded-full bg-white/30 transition-all group-hover/progress:h-1.5">
                <div
                  className="h-full rounded-full bg-white transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <span className="min-w-[45px] text-sm font-medium text-white tabular-nums md:text-base">
              {time}
            </span>
            <button
              type="button"
              aria-label="Toggle sound"
              onClick={(e) => {
                e.stopPropagation();
                const v = videoRef.current;
                if (!v) return;
                v.muted = !v.muted;
                setMuted(v.muted);
              }}
              className="flex h-10 w-10 items-center justify-center text-white/80 transition-colors hover:text-white"
            >
              <Icon name={muted ? "soundOff" : "soundOn"} className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Fullscreen"
              onClick={goFullscreen}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 hover:text-white"
            >
              <Icon name="expand" className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
