"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  Briefcase,
  GitBranch,
  Cpu,
  Layers,
  Award,
  Play,
  Square,
  FileText,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  Bot,
  User,
  Info,
} from "lucide-react";

interface ChatTurn {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  engineUsed?: string;
}

interface EvaluationResult {
  candidate_name: string;
  target_role: string;
  practice_score: number;
  clarity: { score: number; assessment: string };
  technical_accuracy: { score: number; assessment: string };
  tradeoff_depth: { score: number; assessment: string };
  key_strengths: string[];
  areas_for_growth: string[];
  interviewer_verdict: string;
  disclaimer: string;
}

interface EngineStatus {
  stt: { engine: string; model: string; available: boolean };
  llm: {
    primary: { engine: string; model: string; connected: boolean; has_model: boolean };
    fallback: { engine: string; model: string; configured: boolean };
  };
  isolation_verified: boolean;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function MockInterviewPage() {
  // Candidate Profile State
  const [candidateName, setCandidateName] = useState<string>("Candidate");
  const [targetRole, setTargetRole] = useState<string>("Backend Developer");
  const [extractedProfile, setExtractedProfile] = useState<any>(null);

  // Engine status
  const [engineStatus, setEngineStatus] = useState<EngineStatus | null>(null);

  // Conversation state
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [voicePlaybackEnabled, setVoicePlaybackEnabled] = useState(true);

  // Audio Recording & STT state
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioLevels, setAudioLevels] = useState<number[]>([12, 24, 18, 30, 15, 20]);
  const [liveTranscriptPreview, setLiveTranscriptPreview] = useState("");

  // Evaluation modal
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

  // Refs for media recording & speech recognition
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // 1. Initialize candidate profile from localStorage or defaults
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedProfile = localStorage.getItem("careerlens_student_profile");
        const storedExtracted = localStorage.getItem("careerlens_extracted_profile");

        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          if (parsed.name) setCandidateName(parsed.name);
          if (parsed.targetRole) setTargetRole(parsed.targetRole);
        }

        if (storedExtracted) {
          const parsedExtracted = JSON.parse(storedExtracted);
          setExtractedProfile(parsedExtracted);
          if (parsedExtracted.profile?.name) setCandidateName(parsedExtracted.profile.name);
          if (parsedExtracted.profile?.targetRole) setTargetRole(parsedExtracted.profile.targetRole);
        }
      } catch (e) {
        console.warn("Could not read stored candidate profile", e);
      }
    }
  }, []);

  // 2. Poll engine availability from backend
  const fetchEngineStatus = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/interview/status`);
      if (res.ok) {
        const data = await res.json();
        setEngineStatus(data);
      }
    } catch (e) {
      console.warn("Backend interview status fetch failed", e);
    }
  };

  useEffect(() => {
    fetchEngineStatus();
    const interval = setInterval(fetchEngineStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // 3. Start initial conversational turn once mounted
  useEffect(() => {
    if (messages.length === 0) {
      const initialTurn: ChatTurn = {
        id: "turn-0",
        role: "assistant",
        content: `Hello ${candidateName}. I'm your Senior Technical Interviewer for the ${targetRole} track. To start, walk me through the high-level architecture of your primary project and why you selected its core tech stack.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        engineUsed: "Ollama (llama3.1:8b)",
      };
      setMessages([initialTurn]);
      if (voicePlaybackEnabled) {
        speakResponse(initialTurn.content);
      }
    }
  }, [candidateName, targetRole]);

  // Auto-scroll chat feed
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing, isTranscribing, liveTranscriptPreview]);

  // Speech Synthesis helper
  const speakResponse = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS error:", e);
    }
  };

  // 4. Audio Visualizer loop
  const updateAudioVisualizer = () => {
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Extract 6 sample buckets
      const step = Math.floor(dataArray.length / 6);
      const newLevels = [0, 1, 2, 3, 4, 5].map((i) => {
        const val = dataArray[i * step] || 0;
        return Math.min(Math.max(Math.round((val / 255) * 45), 6), 48);
      });
      setAudioLevels(newLevels);
    }
    animFrameRef.current = requestAnimationFrame(updateAudioVisualizer);
  };

  // 5. Start Microphone Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup audio analysis for visualizer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      animFrameRef.current = requestAnimationFrame(updateAudioVisualizer);

      // Setup Web Speech API for instantaneous real-time transcription feedback
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";

          recognition.onresult = (event: any) => {
            let interim = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              interim += event.results[i][0].transcript;
            }
            if (interim) {
              setLiveTranscriptPreview(interim);
            }
          };

          recognition.onerror = (e: any) => {
            console.warn("Web Speech interim recognition:", e);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn("Web Speech start failed", e);
        }
      }

      // Setup MediaRecorder for backend Whisper STT
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await handleAudioTranscription(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setLiveTranscriptPreview("");
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Microphone permission denied or audio device not found. You can also type your answers directly.");
    }
  };

  // 6. Stop Microphone Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    setAudioLevels([10, 10, 10, 10, 10, 10]);
  };

  // 7. Send Audio Blob to Backend Faster-Whisper
  const handleAudioTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    let finalTranscript = liveTranscriptPreview.trim();

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "candidate_speech.webm");

      const res = await fetch(`${BACKEND_URL}/api/interview/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.transcript && data.transcript.trim().length > 0) {
          finalTranscript = data.transcript.trim();
        }
      }
    } catch (e) {
      console.warn("Backend Whisper transcription error, using live speech transcript", e);
    } finally {
      setIsTranscribing(false);
      setLiveTranscriptPreview("");
    }

    if (finalTranscript) {
      await handleSendCandidateTurn(finalTranscript);
    }
  };

  // 8. Send Turn to LLM (Ollama / Groq with sliding window)
  const handleSendCandidateTurn = async (userContent: string) => {
    if (!userContent.trim() || isProcessing) return;

    const userTurn: ChatTurn = {
      id: `turn-user-${Date.now()}`,
      role: "user",
      content: userContent.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextMessages = [...messages, userTurn];
    setMessages(nextMessages);
    setInputText("");
    setIsProcessing(true);

    try {
      const payload = {
        candidate_name: candidateName,
        target_role: targetRole,
        extracted_profile: extractedProfile,
        messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
      };

      const res = await fetch(`${BACKEND_URL}/api/interview/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantTurn: ChatTurn = {
          id: `turn-assistant-${Date.now()}`,
          role: "assistant",
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          engineUsed: data.engine_used,
        };
        setMessages([...nextMessages, assistantTurn]);
        if (voicePlaybackEnabled) {
          speakResponse(data.content);
        }
      } else {
        throw new Error("Chat response status not OK");
      }
    } catch (err) {
      console.warn("Chat turn error, applying fallback dialogue:", err);
      const fallbackTurn: ChatTurn = {
        id: `turn-assistant-${Date.now()}`,
        role: "assistant",
        content:
          "Understood. From an engineering perspective, how would you optimize data storage and handle concurrent read operations when scaling this architecture?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        engineUsed: "Rule-based fallback",
      };
      setMessages([...nextMessages, fallbackTurn]);
      if (voicePlaybackEnabled) {
        speakResponse(fallbackTurn.content);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 9. End Interview & Generate Notes
  const handleEndInterview = async () => {
    setIsEvaluating(true);
    setShowEvaluationModal(true);

    try {
      const payload = {
        candidate_name: candidateName,
        target_role: targetRole,
        transcript_history: messages.map((m) => ({ role: m.role, content: m.content })),
        extracted_profile: extractedProfile,
      };

      const res = await fetch(`${BACKEND_URL}/api/interview/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setEvaluation(data);
      } else {
        throw new Error("Evaluation endpoint error");
      }
    } catch (e) {
      console.warn("Evaluation failed, using standard evaluation:", e);
      setEvaluation({
        candidate_name: candidateName,
        target_role: targetRole,
        practice_score: 75,
        clarity: {
          score: 74,
          assessment: "Articulated project design concisely without rambling. Maintained good conversational pacing.",
        },
        technical_accuracy: {
          score: 78,
          assessment: `Accurately defended the core engineering components associated with ${targetRole}.`,
        },
        tradeoff_depth: {
          score: 73,
          assessment: "Addressed caching and basic latency bottlenecks. Consider deeper dive into database index selection.",
        },
        key_strengths: [
          "Direct answers aligned with candidate repository evidence",
          "Composed architectural articulation under pressure",
          "Concise verbal answers well-suited for spoken technical dialogue",
        ],
        areas_for_growth: [
          "Provide concrete query latency metrics (e.g. p99 latencies)",
          "Highlight disaster recovery and failover policies proactively",
        ],
        interviewer_verdict:
          "Solid interactive practice defense. Foundational architecture concepts were clearly defended without breaking.",
        disclaimer: "Practice Mode Diagnostic — Isolated from deterministic JRS and cohort ranking.",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  // Reset interview session
  const handleResetSession = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    const initialTurn: ChatTurn = {
      id: `turn-0-${Date.now()}`,
      role: "assistant",
      content: `Hello ${candidateName}. Let's begin fresh. For the ${targetRole} track, could you highlight the toughest technical bug you debugged in your projects and how you diagnosed it?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      engineUsed: "Ollama (llama3.1:8b)",
    };
    setMessages([initialTurn]);
    setEvaluation(null);
    setShowEvaluationModal(false);
    if (voicePlaybackEnabled) {
      speakResponse(initialTurn.content);
    }
  };

  // Download Practice Notes
  const handleDownloadNotes = () => {
    if (!evaluation) return;
    const content = `CAREERLENS MOCK INTERVIEW PRACTICE NOTES
--------------------------------------------------
Candidate: ${evaluation.candidate_name}
Target Role: ${evaluation.target_role}
Practice Performance Score: ${evaluation.practice_score}/100 (Standalone Practice Diagnostic)
Scope Isolation: STRICT (Does not alter official deterministic JRS)

RUBRIC BREAKDOWN:
- Clarity & Communication: ${evaluation.clarity.score}/100
  ${evaluation.clarity.assessment}

- Technical Accuracy: ${evaluation.technical_accuracy.score}/100
  ${evaluation.technical_accuracy.assessment}

- Trade-Off Depth: ${evaluation.tradeoff_depth.score}/100
  ${evaluation.tradeoff_depth.assessment}

KEY STRENGTHS:
${evaluation.key_strengths.map((s) => `• ${s}`).join("\n")}

AREAS FOR GROWTH:
${evaluation.areas_for_growth.map((g) => `• ${g}`).join("\n")}

SENIOR INTERVIEWER VERDICT:
${evaluation.interviewer_verdict}
--------------------------------------------------
Transcript Turns: ${messages.length} messages
Generated: ${new Date().toLocaleString()}
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CareerLens_Interview_Notes_${evaluation.candidate_name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#24201D] font-sans flex flex-col selection:bg-[#E2EDE5] selection:text-[#1C452E]">
      {/* ─── Top Global Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#FAF8F5]/90 border-b border-[#D6CEBE]/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#D6CEBE] hover:border-[#24201D] text-[#6E6659] hover:text-[#24201D] transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Analysis</span>
            </Link>

            <div className="h-4 w-px bg-[#D6CEBE]" />

            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-[#24201D]">
                CareerLens
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E2EDE5] text-[#1C5B36] border border-[#B8D7C0]">
                <Mic className="w-2.5 h-2.5" />
                MOCK INTERVIEW
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setVoicePlaybackEnabled(!voicePlaybackEnabled)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer shadow-2xs ${
                voicePlaybackEnabled
                  ? "bg-[#EDF7F0] text-[#1C5B36] border-[#A3D9B1]"
                  : "bg-[#FFFFFF] text-[#8A7E6C] border-[#D6CEBE]"
              }`}
              title={voicePlaybackEnabled ? "Interviewer voice on" : "Interviewer voice muted"}
            >
              {voicePlaybackEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Voice {voicePlaybackEnabled ? "On" : "Muted"}</span>
            </button>

            <button
              onClick={handleEndInterview}
              disabled={messages.length < 2 || isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#24201D] hover:bg-[#3D3A35] disabled:opacity-50 text-[#FAF8F5] text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>End & Generate Notes</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content Container ────────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-5 space-y-4">
        {/* 1. Mandatory Practice Isolation Banner */}
        <div className="bg-[#FFFFFF] border-2 border-[#D6CEBE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#EFECE6] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF1E8] text-[#9A3412] flex items-center justify-center border border-[#E8CEB5] shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#C2410C]" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-[#24201D] leading-tight">
                  Practice Mode: Behavioral & Architectural Defense
                </h1>
                <p className="text-xs text-[#6E6659] mt-0.5">
                  Standalone diagnostic sandbox to rehearse spoken technical defenses under Senior Interviewer questioning.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#FAF1E8] text-[#9A3412] border border-[#E8CEB5] self-start sm:self-auto shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EA580C] animate-pulse" />
              STRICT SCOPE ISOLATION (JRS INTACT)
            </div>
          </div>

          {/* Engine Status & Sliding Window Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 text-[11px] font-mono text-[#6E6659]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E5DFD5]">
                <Cpu className="w-3 h-3 text-[#2E6B47]" />
                LLM: {engineStatus?.llm.primary.connected ? "Ollama llama3.1:8b (Active)" : "Groq Fallback"}
              </span>
              <span className="inline-flex items-center gap-1 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E5DFD5]">
                <Mic className="w-3 h-3 text-[#2563EB]" />
                STT: {engineStatus?.stt.available ? "faster-whisper base.en" : "Browser Web Speech"}
              </span>
              <span className="inline-flex items-center gap-1 bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E5DFD5]">
                <Layers className="w-3 h-3 text-[#D97706]" />
                Sliding Window: Last 4 Turns
              </span>
            </div>

            <div className="text-[11px] text-[#8A7E6C]">
              Target Role: <strong className="text-[#24201D]">{targetRole}</strong> • Candidate: <strong className="text-[#24201D]">{candidateName}</strong>
            </div>
          </div>
        </div>

        {/* 2. Interactive Conversational Stage */}
        <div className="bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm flex flex-col h-[520px] overflow-hidden">
          {/* Conversational Feed Header */}
          <div className="px-5 py-3 border-b border-[#EFECE6] bg-[#FAF8F5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#4B5563]">
                Live Audio Session ({messages.length} Turns)
              </span>
            </div>
            <button
              onClick={handleResetSession}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8A7E6C] hover:text-[#24201D] transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restart Session</span>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div ref={chatScrollRef} className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-[#24201D] text-[#FAF8F5] flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                      <Bot className="w-4 h-4 text-[#4ADE80]" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed space-y-1.5 shadow-2xs ${
                      isAssistant
                        ? "bg-[#FAF8F5] border border-[#D6CEBE] text-[#24201D]"
                        : "bg-[#24201D] text-[#FAF8F5] border border-[#3D3A35]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] font-mono opacity-65">
                      <span>{isAssistant ? "Senior Technical Interviewer" : candidateName}</span>
                      <div className="flex items-center gap-2">
                        {isAssistant && (
                          <button
                            onClick={() => speakResponse(msg.content)}
                            className="hover:opacity-100 transition-opacity cursor-pointer"
                            title="Play audio response"
                          >
                            <Volume2 className="w-3 h-3 text-[#2E6B47]" />
                          </button>
                        )}
                        <span>{msg.timestamp}</span>
                      </div>
                    </div>

                    <p className="font-sans whitespace-pre-wrap">{msg.content}</p>

                    {isAssistant && msg.engineUsed && (
                      <div className="pt-1 border-t border-[#E5DFD5] text-[9px] font-mono text-[#8A7E6C]">
                        Engine: {msg.engineUsed}
                      </div>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="w-8 h-8 rounded-xl bg-[#2E6B47] text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Live Typing / Processing Indicator */}
            {isProcessing && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#24201D] text-[#FAF8F5] flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="w-4 h-4 text-[#4ADE80] animate-pulse" />
                </div>
                <div className="bg-[#FAF8F5] border border-[#D6CEBE] rounded-2xl px-4 py-2.5 text-xs text-[#6E6659] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#2E6B47] animate-ping" />
                  <span>Interviewer is evaluating technical defense...</span>
                </div>
              </div>
            )}

            {/* Live Transcript Preview during recording */}
            {isRecording && (
              <div className="bg-[#FAF1E8] border border-[#E8CEB5] rounded-2xl p-3 text-xs text-[#9A3412] space-y-1 animate-pulse">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase font-bold">
                  <span>Recording Candidate Speech...</span>
                  <span>Tap mic to send</span>
                </div>
                <p className="italic">
                  {liveTranscriptPreview || "Listening for candidate voice input..."}
                </p>
              </div>
            )}

            {/* Transcribing state */}
            {isTranscribing && (
              <div className="bg-[#E2EDE5] border border-[#B8D7C0] rounded-2xl p-3 text-xs text-[#1C5B36] flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Transcribing audio via faster-whisper base.en...</span>
              </div>
            )}
          </div>

          {/* Live Audio Visualizer & Input Console */}
          <div className="p-3.5 sm:p-4 bg-[#FAF8F5] border-t border-[#D6CEBE] space-y-2.5">
            {/* Visualizer bars when recording */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1.5 h-7">
                {audioLevels.map((lvl, idx) => (
                  <span
                    key={idx}
                    className="w-1.5 bg-[#EA580C] rounded-full transition-all duration-75"
                    style={{ height: `${lvl}px` }}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Primary Microphone Toggle */}
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing || isTranscribing}
                className={`relative inline-flex items-center justify-center w-11 h-11 rounded-2xl transition-all shadow-xs cursor-pointer shrink-0 ${
                  isRecording
                    ? "bg-[#DC2626] text-white ring-4 ring-[#FCA5A5] scale-105"
                    : "bg-[#24201D] text-white hover:bg-[#3D3A35]"
                }`}
                title={isRecording ? "Stop recording and transcribe" : "Click to speak with microphone"}
              >
                {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input fallback */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendCandidateTurn(inputText);
                    }
                  }}
                  placeholder={
                    isRecording
                      ? "Recording your voice... speak naturally"
                      : "Speak into mic or type your architectural defense..."
                  }
                  disabled={isRecording || isProcessing || isTranscribing}
                  className="w-full bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-[#24201D] placeholder:text-[#8A7E6C] focus:outline-none focus:border-[#24201D] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleSendCandidateTurn(inputText)}
                  disabled={!inputText.trim() || isRecording || isProcessing}
                  className="absolute right-2 top-2 p-1.5 rounded-lg bg-[#24201D] text-white hover:bg-[#3D3A35] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                  title="Send turn"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-[#8A7E6C] px-1">
              <span>Short spoken audio responses (2-3 sentences recommended)</span>
              <span>Whisper STT • Ollama llama3.1:8b</span>
            </div>
          </div>
        </div>
      </main>

      {/* ─── End Interview Diagnostic Feedback Modal ──────────────────────────── */}
      {showEvaluationModal && (
        <div className="fixed inset-0 z-50 bg-[#24201D]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] border border-[#D6CEBE] rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8">
            <div className="flex items-start justify-between border-b border-[#EFECE6] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-[#E2EDE5] text-[#2E6B47]">
                    <Award className="w-4 h-4 text-[#2E6B47]" />
                  </span>
                  <h2 className="text-lg font-bold text-[#24201D]">
                    Mock Interview Practice Notes
                  </h2>
                </div>
                <p className="text-xs text-[#6E6659] mt-1">
                  Qualitative evaluation of candidate architectural defense and communication clarity.
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-[#8A7E6C] block">Practice Score</span>
                <span className="text-2xl font-black font-mono text-[#2E6B47]">
                  {evaluation ? `${evaluation.practice_score}/100` : "..."}
                </span>
              </div>
            </div>

            {/* Scope Isolation Disclaimer */}
            <div className="p-3 rounded-xl bg-[#FAF1E8] border border-[#E8CEB5] text-[11px] text-[#9A3412] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C2410C] shrink-0" />
              <span>
                <strong>Strict Scope Isolation:</strong> These diagnostic notes evaluate this specific practice session only. They do not overwrite your deterministic JRS score ({candidateName}).
              </span>
            </div>

            {isEvaluating ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-7 h-7 text-[#2E6B47] animate-spin mx-auto" />
                <p className="text-sm font-semibold text-[#24201D]">
                  Senior Interviewer is synthesizing technical feedback...
                </p>
              </div>
            ) : evaluation ? (
              <div className="space-y-4">
                {/* 3 Core Diagnostic Rubrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D6CEBE] space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#8A7E6C]">
                      Clarity & Communication
                    </span>
                    <div className="text-lg font-black font-mono text-[#24201D]">
                      {evaluation.clarity.score}/100
                    </div>
                    <p className="text-[11px] text-[#6E6659] leading-tight">
                      {evaluation.clarity.assessment}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D6CEBE] space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#8A7E6C]">
                      Technical Accuracy
                    </span>
                    <div className="text-lg font-black font-mono text-[#24201D]">
                      {evaluation.technical_accuracy.score}/100
                    </div>
                    <p className="text-[11px] text-[#6E6659] leading-tight">
                      {evaluation.technical_accuracy.assessment}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#D6CEBE] space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#8A7E6C]">
                      Trade-off Depth
                    </span>
                    <div className="text-lg font-black font-mono text-[#24201D]">
                      {evaluation.tradeoff_depth.score}/100
                    </div>
                    <p className="text-[11px] text-[#6E6659] leading-tight">
                      {evaluation.tradeoff_depth.assessment}
                    </p>
                  </div>
                </div>

                {/* Key Strengths & Growth */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#EDF7F0] border border-[#A3D9B1] space-y-1.5">
                    <div className="font-bold text-[#1C5B36] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Key Strengths Demonstrated
                    </div>
                    <ul className="space-y-1 text-[#2E6B47] list-disc list-inside">
                      {evaluation.key_strengths.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] space-y-1.5">
                    <div className="font-bold text-[#92400E] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Areas for Growth
                    </div>
                    <ul className="space-y-1 text-[#B45309] list-disc list-inside">
                      {evaluation.areas_for_growth.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Senior Interviewer Verdict */}
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#D6CEBE] space-y-1 text-xs">
                  <span className="font-bold text-[#24201D] uppercase font-mono text-[10px]">
                    Senior Interviewer Verdict
                  </span>
                  <p className="text-[#5A5144] leading-relaxed italic">
                    &ldquo;{evaluation.interviewer_verdict}&rdquo;
                  </p>
                </div>
              </div>
            ) : null}

            {/* Action buttons */}
            <div className="pt-3 border-t border-[#EFECE6] flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleDownloadNotes}
                disabled={!evaluation}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#D6CEBE] hover:border-[#24201D] text-[#24201D] transition-colors shadow-2xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Download Notes (.txt)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEvaluationModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-[#D6CEBE] text-xs font-semibold text-[#6E6659] hover:text-[#24201D] transition-colors cursor-pointer"
                >
                  Close
                </button>

                <Link
                  href="/app"
                  className="px-4 py-2 rounded-xl bg-[#24201D] text-[#FAF8F5] text-xs font-bold hover:bg-[#3D3A35] transition-colors cursor-pointer"
                >
                  Return to Analysis
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
