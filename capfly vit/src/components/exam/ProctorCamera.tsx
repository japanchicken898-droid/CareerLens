"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { CameraOff, ShieldCheck, UserCheck, AlertTriangle, Eye } from "lucide-react";
import type { IntegrityEventType } from "@/types/exam";

interface ProctorCameraProps {
  onViolation?: (type: IntegrityEventType, message?: string) => void;
  onStatusChange?: (status: "active" | "warning" | "error" | "turned_away") => void;
  darkMode?: boolean;
}

type ProctoringStatus = "initializing" | "verified" | "no_face" | "mobile_detected" | "error";

// ── Skin-tone pixel detection ─────────────────────────────────────────────
// Returns the fraction of pixels in the frame that match human skin tones
function getSkinRatio(ctx: CanvasRenderingContext2D, w: number, h: number): number {
  const data = ctx.getImageData(0, 0, w, h).data;
  let skinPixels = 0;
  const total = w * h;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // Classic skin-tone range (works for multiple skin tones)
    if (
      r > 60 && g > 40 && b > 20 &&
      r > g && r > b &&
      r - Math.min(g, b) > 15 &&
      Math.abs(r - g) > 10
    ) {
      skinPixels++;
    }
  }
  return skinPixels / total;
}

// ── Skin centroid: where is the face mass concentrated? ───────────────────
function getSkinCentroid(ctx: CanvasRenderingContext2D, w: number, h: number): { cx: number; cy: number; count: number } {
  const data = ctx.getImageData(0, 0, w, h).data;
  let sumX = 0, sumY = 0, count = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (
        r > 60 && g > 40 && b > 20 &&
        r > g && r > b &&
        r - Math.min(g, b) > 15 &&
        Math.abs(r - g) > 10
      ) {
        sumX += x; sumY += y; count++;
      }
    }
  }
  if (count === 0) return { cx: w / 2, cy: h / 2, count: 0 };
  return { cx: sumX / count / w, cy: sumY / count / h, count };
}

// ── Detect rectangular dark border (phone/tablet frame shape) ────────────
function detectMobileInFrame(ctx: CanvasRenderingContext2D, w: number, h: number): boolean {
  // Sample corners — if all corners are very dark (black bezel), it might be a phone screen
  const corners = [
    [2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3],
    [w >> 1, 2], [w >> 1, h - 3], [2, h >> 1], [w - 3, h >> 1],
  ];
  let darkCorners = 0;
  const data = ctx.getImageData(0, 0, w, h).data;
  for (const [cx, cy] of corners) {
    const idx = (cy * w + cx) * 4;
    const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    if (brightness < 30) darkCorners++;
  }
  // Heuristic: many dark outer pixels suggests a phone being held up
  return darkCorners >= 5;
}

export const ProctorCamera: React.FC<ProctorCameraProps> = ({
  onViolation,
  onStatusChange,
  darkMode = false,
}) => {
  const dk = darkMode;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyzerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const noFaceStartRef = useRef<number | null>(null);
  const mobileStartRef = useRef<number | null>(null);
  const violationFiredRef = useRef<Set<string>>(new Set());

  const [procStatus, setProcStatus] = useState<ProctoringStatus>("initializing");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [statusLabel, setStatusLabel] = useState("Initializing AI Proctor...");

  // ── Analysis loop ──────────────────────────────────────────────────────
  const startAnalysis = useCallback(() => {
    if (analyzerRef.current) clearInterval(analyzerRef.current);

    analyzerRef.current = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const W = canvas.width;
      const H = canvas.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, W, H);
      const skinRatio = getSkinRatio(ctx, W, H);
      const { cx, cy, count } = getSkinCentroid(ctx, W, H);
      const hasMobile = detectMobileInFrame(ctx, W, H);

      // ── Mobile device detection ──
      if (hasMobile && skinRatio > 0.02) {
        if (!mobileStartRef.current) {
          mobileStartRef.current = Date.now();
        } else if (Date.now() - mobileStartRef.current > 2500) {
          // Confirmed mobile for 2.5s
          if (!violationFiredRef.current.has("mobile")) {
            violationFiredRef.current.add("mobile");
            setProcStatus("mobile_detected");
            setStatusLabel("Mobile device detected!");
            onStatusChange?.("warning");
            onViolation?.("MOBILE_DEVICE_DETECTED", "A mobile or tablet device was detected in the camera view");
          }
          return;
        }
      } else {
        mobileStartRef.current = null;
      }

      // ── Face presence detection ──
      const FACE_SKIN_THRESHOLD = 0.025; // at least 2.5% of frame must be skin
      const facePresent = skinRatio >= FACE_SKIN_THRESHOLD;

      if (!facePresent) {
        if (!noFaceStartRef.current) {
          noFaceStartRef.current = Date.now();
          setProcStatus("no_face");
          setStatusLabel("Face not detected — look at camera");
          onStatusChange?.("warning");
        } else if (Date.now() - noFaceStartRef.current > 5000) {
          // Face missing for 5 continuous seconds — fire violation
          if (!violationFiredRef.current.has("face_missing")) {
            violationFiredRef.current.add("face_missing");
            onViolation?.("FACE_MISSING", "Your face was not visible for over 5 seconds");
          }
        }
      } else {
        // Face is present — clear timers and reset
        if (noFaceStartRef.current) {
          noFaceStartRef.current = null;
          violationFiredRef.current.delete("face_missing");
        }
        violationFiredRef.current.delete("mobile");
        mobileStartRef.current = null;

        // ── Head turned away detection ──
        // If skin centroid is far from center, candidate may be looking away
        const isTurnedAway =
          count > 100 && // enough skin pixels to be reliable
          (cx < 0.15 || cx > 0.85 || cy < 0.05 || cy > 0.90);

        if (isTurnedAway) {
          setProcStatus("no_face");
          setStatusLabel("Please face the camera");
          onStatusChange?.("turned_away");
        } else {
          setProcStatus("verified");
          setStatusLabel("Candidate Verified");
          onStatusChange?.("active");
        }
      }
    }, 800); // Check every 800ms
  }, [onViolation, onStatusChange]);

  // ── Start Webcam ───────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    // Stop any existing stream first to avoid AbortError
    if (analyzerRef.current) clearInterval(analyzerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraError(null);
    setProcStatus("initializing");
    setStatusLabel("Initializing AI Proctor...");
    noFaceStartRef.current = null;
    mobileStartRef.current = null;
    violationFiredRef.current.clear();

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user", frameRate: { ideal: 15 } },
        audio: false,
      });

      streamRef.current = mediaStream;
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        try {
          await videoRef.current.play();
        } catch (playErr: unknown) {
          // Ignore AbortError from rapid remounts
          const err = playErr as Error;
          if (err.name !== "AbortError") throw playErr;
          return;
        }
      }

      // Give camera 1.5s warm-up before analysis starts
      setTimeout(() => {
        setProcStatus("verified");
        setStatusLabel("Candidate Verified");
        onStatusChange?.("active");
        startAnalysis();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      console.error("Camera access error:", msg);
      const errMsg = "Webcam access denied. Please allow camera access to continue.";
      setCameraError(errMsg);
      setProcStatus("error");
      onViolation?.("CAMERA_DISABLED", errMsg);
      onStatusChange?.("error");
    }
  }, [onViolation, onStatusChange, startAnalysis]);

  useEffect(() => {
    startCamera();
    return () => {
      if (analyzerRef.current) clearInterval(analyzerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Status UI config ───────────────────────────────────────────────────
  const statusConfig: Record<ProctoringStatus, { color: string; dot: string; icon: React.ReactNode; border: string }> = {
    initializing: {
      color: "text-amber-400",
      dot: "bg-amber-400",
      border: "border-amber-500/60",
      icon: <ShieldCheck className="w-3 h-3 animate-spin" />,
    },
    verified: {
      color: "text-emerald-400",
      dot: "bg-emerald-500",
      border: "border-emerald-500/80",
      icon: <UserCheck className="w-3 h-3" />,
    },
    no_face: {
      color: "text-amber-400",
      dot: "bg-amber-400 animate-ping",
      border: "border-amber-500/80",
      icon: <Eye className="w-3 h-3 animate-pulse" />,
    },
    mobile_detected: {
      color: "text-red-400",
      dot: "bg-red-500 animate-ping",
      border: "border-red-500/80",
      icon: <AlertTriangle className="w-3 h-3 animate-bounce" />,
    },
    error: {
      color: "text-red-400",
      dot: "bg-red-500",
      border: "border-red-500/80",
      icon: <CameraOff className="w-3 h-3" />,
    },
  };

  const cfg = statusConfig[procStatus];

  return (
    <div className={`relative rounded-2xl border shadow-md overflow-hidden transition-all duration-300 ${
      dk ? "bg-[#1C1A17] border-[#3D3A35]" : "bg-white border-[#D6CEBE]"
    }`}>
      {/* Hidden canvas for analysis */}
      <canvas ref={canvasRef} width={160} height={120} className="hidden" />

      {/* Live Video */}
      <div className="relative w-full h-44 bg-black flex items-center justify-center overflow-hidden">
        {cameraError ? (
          <div className="p-3 text-center space-y-2">
            <CameraOff className="w-8 h-8 text-red-500 mx-auto animate-pulse" />
            <span className="text-[10px] text-red-400 font-bold block leading-tight">
              Camera Access Denied
            </span>
            <button
              type="button"
              onClick={startCamera}
              className="px-2.5 py-1 rounded bg-red-600 text-white text-[10px] font-bold cursor-pointer hover:bg-red-700"
            >
              Retry Camera
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />

            {/* Detection Overlay Frame */}
            <div className={`absolute inset-3 border-2 ${cfg.border} bg-transparent rounded-xl transition-all duration-300 pointer-events-none`}>
              {/* Corner reticles */}
              <div className={`absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${cfg.color.replace("text-", "border-")}`} />
              <div className={`absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 ${cfg.color.replace("text-", "border-")}`} />
              <div className={`absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 ${cfg.color.replace("text-", "border-")}`} />
              <div className={`absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${cfg.color.replace("text-", "border-")}`} />

              {/* Status Badge */}
              <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 shadow ${
                procStatus === "verified" ? "bg-emerald-600 text-white"
                : procStatus === "mobile_detected" ? "bg-red-600 text-white"
                : procStatus === "no_face" ? "bg-amber-600 text-white"
                : procStatus === "error" ? "bg-red-800 text-white"
                : "bg-zinc-700 text-amber-300"
              }`}>
                {cfg.icon}
                {procStatus === "verified" ? "CANDIDATE OK"
                  : procStatus === "mobile_detected" ? "MOBILE DETECTED"
                  : procStatus === "no_face" ? "FACE AWAY"
                  : procStatus === "error" ? "CAM ERROR"
                  : "INITIALIZING"}
              </div>
            </div>

            {/* Initializing overlay */}
            {procStatus === "initializing" && (
              <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center gap-2 text-xs font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400 animate-pulse" />
                Initializing AI Proctor...
              </div>
            )}

            {/* Mobile warning overlay */}
            {procStatus === "mobile_detected" && (
              <div className="absolute inset-0 bg-red-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-1 text-center px-3">
                <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />
                <span className="text-[11px] font-bold text-red-300">Mobile Device Detected</span>
                <span className="text-[9px] text-red-400">This will be reported as a violation</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className={`p-2.5 flex items-center justify-between text-[11px] font-bold border-t ${
        dk ? "bg-[#141210] text-[#EDE8DF] border-[#2E2B27]" : "bg-[#FAF8F5] text-[#24201D] border-[#E8E2D7]"
      }`}>
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
          <span className="truncate">{statusLabel}</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[9px] font-mono ${
          procStatus === "verified" ? "bg-emerald-500/20 text-emerald-400"
          : procStatus === "mobile_detected" ? "bg-red-500/20 text-red-400"
          : "bg-amber-500/20 text-amber-400"
        }`}>
          AI Proctor
        </span>
      </div>
    </div>
  );
};
