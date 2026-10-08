"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  GitCommit,
  Code2,
  Shield,
  Layers,
  FileText,
  Activity,
  Terminal,
  Cpu,
  BarChart3,
  Lock,
  Compass,
  Zap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  const [backendActive, setBackendActive] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/benchmark-metrics")
      .then((res) => {
        setBackendActive(res.ok);
      })
      .catch(() => {
        setBackendActive(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#141413] font-sans selection:bg-[#18231F] selection:text-[#FAF8F5] antialiased">
      {/* ─── Top Editorial Navigation ─────────────────────────────────── */}
      <header className="w-full border-b border-[#E5DFD5] sticky top-0 bg-[#FAF8F5]/90 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-[#18231F] text-[#FAF8F5] flex items-center justify-center font-bold text-xs tracking-wider shadow-xs group-hover:scale-105 transition-transform">
                CL
              </div>
              <div className="flex flex-col">
                <span className="font-serif-display text-lg sm:text-xl font-bold tracking-tight text-[#141413]">
                  CareerLens
                </span>
                <span className="text-[9px] uppercase tracking-widest font-mono text-[#6E6659] -mt-1 hidden sm:block">
                  Employability Engine
                </span>
              </div>
            </Link>

            {/* Live Backend Telemetry Indicator */}
            {backendActive !== null && (
              <span
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
                  backendActive
                    ? "bg-[#EBF5EE] text-[#1E5631] border-[#C3E4CD]"
                    : "bg-[#FDF2F2] text-[#991B1B] border-[#F8C4C4]"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    backendActive ? "bg-emerald-600 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span>{backendActive ? "API Ground Truth: 8000" : "API Offline"}</span>
              </span>
            )}
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-wider font-medium text-[#524E48]">
            <a href="#architecture" className="hover:text-[#141413] transition-colors">
              Architecture
            </a>
            <a href="#methodology" className="hover:text-[#141413] transition-colors">
              Methodology
            </a>
            <a href="#benchmark" className="hover:text-[#141413] transition-colors">
              Benchmarks
            </a>
            <Link href="/app" className="hover:text-[#141413] transition-colors">
              Audit Tool
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#141413] text-[#FAF8F5] text-xs font-semibold hover:bg-[#2B2925] transition-all shadow-xs cursor-pointer group"
            >
              <span>Resume Analyzer</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero Section ────────────────────────────────────────────── */}
      <section className="pt-16 sm:pt-24 pb-16 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Centered Validation Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFFFF] border border-[#E5DFD5] shadow-2xs text-xs font-mono text-[#524E48]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-[#18231F]">Curated Benchmark Validation</span>
            <span className="text-[#A39E93]">•</span>
            <span className="font-bold text-[#1E5631]">93.3% F1 Precision</span>
          </div>

          {/* Strikethrough Category Tags */}
          <div className="flex items-center justify-center gap-3 flex-wrap text-xs sm:text-sm font-mono text-[#7A746B]">
            <span className="line-through decoration-[#B84040] decoration-1.5 text-[#8A847B]">
              Keyword ATS Parsers
            </span>
            <span className="text-[#C2BCB0]">•</span>
            <span className="line-through decoration-[#B84040] decoration-1.5 text-[#8A847B]">
              Unverified AI Wrappers
            </span>
            <span className="text-[#C2BCB0]">•</span>
            <span className="font-sans font-semibold text-[#18231F] bg-[#E8E4DA] px-2.5 py-0.5 rounded-md">
              ✓ Ground-Truth Telemetry
            </span>
          </div>

          {/* Large Serif Display Heading */}
          <h1 className="font-serif-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#141413] leading-[1.08] max-w-3xl mx-auto">
            The Deterministic{" "}
            <span className="bg-gradient-to-r from-[#8C4F1F] via-[#D89445] to-[#783912] bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(216,148,69,0.25)]">
              Employability Engine.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-editorial text-lg sm:text-xl md:text-2xl text-[#4A453E] max-w-2xl mx-auto leading-relaxed">
            CareerLens replaces resume inflation with live developer telemetry. We cross-audit candidate claims
            against live GitHub commit manifests, LeetCode problem difficulty, and market-weighted benchmarks.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-3">
            <Link
              href="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#141413] text-[#FAF8F5] text-sm font-semibold hover:bg-[#2B2925] transition-all shadow-sm group cursor-pointer"
            >
              <span>Resume Analyzer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FFFFFF] border border-[#D6CEBE] text-[#141413] text-sm font-semibold hover:bg-[#F3EFE6] transition-all shadow-2xs cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#6E6659]" />
              <span>Placement Cell</span>
            </Link>
          </div>

          {/* Subtle Key Metrics Strip */}
          <div className="pt-8 sm:pt-12 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            {[
              { label: "Cohort Training Set", val: "500 Verified Instances", sub: "80/20 Regressor Split" },
              { label: "Model Architecture", val: "Random Forest Regressor", sub: "R² = 0.852 • 4.58 RMSE" },
              { label: "Ground Truth Control", val: "25 Curated Profiles", sub: "93.3% Precision & Recall" },
              { label: "Candidate Verification", val: "Zero-Trust PDF First", sub: "GitHub & LeetCode Audits" },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-[#FFFFFF]/70 border border-[#E5DFD5] shadow-2xs backdrop-blur-xs"
              >
                <span className="text-[10px] font-mono uppercase text-[#7A746B] block font-medium">
                  {stat.label}
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#141413] block mt-0.5">
                  {stat.val}
                </span>
                <span className="text-[10px] font-mono text-[#524E48] block mt-0.5">
                  {stat.sub}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Section 2: "The Engine & Verification Architecture" (Dark Bento Card with Classical Tapestry Frame) ─── */}
      <section id="architecture" className="py-16 sm:py-24 px-4 sm:px-6 relative">
        <div className="max-w-6xl mx-auto">
          {/* Classical Tapestry Canvas Outer Frame (matches Moative Image 2) */}
          <div
            className="rounded-[28px] sm:rounded-[36px] p-2.5 sm:p-5 lg:p-7 shadow-2xl border border-[#D6CEBE]/80 relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: "url('/bento-tapestry-bg.jpg')" }}
          >
            {/* Ambient vignette overlay to ensure elegant contrast */}
            <div className="absolute inset-0 bg-[#0F1714]/25 backdrop-blur-[1px]" />

            {/* Deep Forest-Green / Slate Bento Container */}
            <div className="bg-[#14201B]/95 text-[#EDE8DF] border border-[#2B3E36] rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-md relative z-10 overflow-hidden">
              {/* Top Card Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#283832] pb-8">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#66B085] font-semibold block mb-2">
                  System Topology & Specification
                </span>
                <h2 className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#FAF8F5]">
                  The Engine & Verification Architecture
                </h2>
                <p className="text-xs sm:text-sm text-[#9FA8A3] mt-2 max-w-xl">
                  Dual-tier execution environment partitioning raw telemetry extraction from deterministic
                  accreditation, empirical market weighting, and proctored code integrity.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#202E29] border border-[#33483F] text-[11px] font-mono text-[#A7B8B0]">
                  Pipeline: 8 Real-Time Services
                </span>
              </div>
            </div>

            {/* Partitioned Tier 1: ANALYTICAL ENGINES */}
            <div className="pt-8 space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#4ADE80]" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#72A687] font-semibold">
                  Analytical Engines • Tier 1
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: "TelemetryScraper",
                    badge: "Live REST API",
                    desc: "Audits commit cadence, commit streak frequency, and public repository code manifests via GitHub.",
                    stat: "AST Inspection",
                    color: "border-[#2E423A] bg-[#1E2C27]",
                  },
                  {
                    name: "LeetMatrix",
                    badge: "Algorithmic Depth",
                    desc: "Interrogates public LeetCode problem difficulty profiles, Med/Hard problem ratios, and contest cadence.",
                    stat: "DSA Spectrum",
                    color: "border-[#2E423A] bg-[#1E2C27]",
                  },
                  {
                    name: "JRS Calculator",
                    badge: "Deterministic Core",
                    desc: "Computes Job Readiness Score arithmetic using rigorous multi-factor deterministic logic (0-100).",
                    stat: "Formulaic JRS",
                    color: "border-[#2E423A] bg-[#1E2C27]",
                  },
                  {
                    name: "BenchmarkML",
                    badge: "Scikit-Learn Regressor",
                    desc: "Trained Random Forest (100 estimators) on 500 cohort instances with an 80/20 train-test control split.",
                    stat: "R² = 0.852 • 4.58 RMSE",
                    color: "border-[#2E423A] bg-[#1E2C27]",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 sm:p-5 rounded-2xl border ${item.color} flex flex-col justify-between hover:border-[#4B685B] transition-all`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-[#FAF8F5]">
                          {item.name}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#18231F] text-[#4ADE80] border border-[#2B4036]">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#9FA8A3] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="pt-4 mt-3 border-t border-[#293B33] flex items-center justify-between text-[11px] font-mono text-[#BAC8C1]">
                      <span>Metric</span>
                      <span className="font-semibold text-[#4ADE80]">{item.stat}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Partitioned Tier 2: VERIFICATION PLATFORM */}
            <div className="pt-8 mt-8 border-t border-[#253630] space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#60A5FA]" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#72A687] font-semibold">
                  Verification Platform • Tier 2
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    name: "EntityParser",
                    badge: "Zero-Hallucination",
                    desc: "Extracts strictly bounded PDF text, project blocks, and asserted skills with mandatory file verification.",
                    stat: "pdfplumber Regex",
                    color: "border-[#2E423A] bg-[#1E2C27]",
                  },
                  {
                    name: "MarketWeight",
                    badge: "Dynamic Weights",
                    desc: "Calibrates role weights: SQL (0.32), REST APIs (0.28), Containerization (0.22) from live job indices.",
                    stat: "Empirical Demand",
                    color: "border-[#2E423A] bg-[#1E2C27]",
                  },
                  {
                    name: "Groq Llama 3.3",
                    badge: "Diagnostic Synthesis",
                    desc: "Synthesizes diagnostic candidate verdicts, structured proof citations, and 4-week remedial roadmaps in <1s.",
                    stat: "Groq 70B Engine",
                    color: "border-[#2E423A] bg-[#1E2C27]",
                  },
                  {
                    name: "ProctorShield",
                    badge: "Protected Exam",
                    desc: "Enforces full-screen lock, audio/video monitoring, tab switch detection, and timed DSA challenges.",
                    stat: "Proctor Telemetry",
                    color: "border-[#2E423A] bg-[#1E2C27]",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 sm:p-5 rounded-2xl border ${item.color} flex flex-col justify-between hover:border-[#4B685B] transition-all`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-[#FAF8F5]">
                          {item.name}
                        </span>
                        <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#18231F] text-[#60A5FA] border border-[#2B4036]">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-[#9FA8A3] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                    <div className="pt-4 mt-3 border-t border-[#293B33] flex items-center justify-between text-[11px] font-mono text-[#BAC8C1]">
                      <span>Protocol</span>
                      <span className="font-semibold text-[#60A5FA]">{item.stat}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bento Footer Banner */}
            <div className="mt-8 pt-6 border-t border-[#253630] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-[#8C9893]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
                <span>Deterministic pipeline guarantees reproducible candidate accreditation scores.</span>
              </div>
              <Link
                href="/app"
                className="text-[#4ADE80] hover:text-[#86EFAC] font-semibold inline-flex items-center gap-1"
              >
                <span>Run Pipeline in App</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* ─── Section 3: "Ingest. Audit. Remediate." (3-Column Editorial Cards) ─── */}
      <section id="methodology" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#F5F2EB] border-y border-[#E5DFD5]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6E6659] font-bold">
              The 3-Step Verification Protocol
            </span>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold tracking-tight text-[#141413]">
              Ingest. Audit. Remediate.
            </h2>
            <p className="font-editorial text-base sm:text-lg text-[#524E48]">
              A continuous, auditable progression from unverified resume claims to substantiated code proof
              and prioritized industry gap remediation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 01: Ingest */}
            <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between hover:shadow-md transition-all group">
              <div>
                {/* Full-width editorial artwork (matches Image 3) */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#E9E1D2]">
                  <img
                    src="/editorial-ingest.jpg"
                    alt="Bounded Ingest & Zero-Hallucination Extraction"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#141413]/75 backdrop-blur-xs text-[10px] font-mono font-semibold text-[#FAF8F5] tracking-wider uppercase">
                    Stage 01 • Ingest
                  </div>
                </div>

                <div className="p-6 sm:p-7 space-y-4">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#A35922] uppercase tracking-wider block mb-1">
                      01
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#141413]">
                      Ingest.
                    </h3>
                    <h4 className="text-xs font-mono font-semibold text-[#6E6659] uppercase tracking-wider mt-1">
                      Strict Resume-First Extraction
                    </h4>
                  </div>

                  <p className="text-xs text-[#524E48] leading-relaxed">
                    Candidate onboarding enforces mandatory PDF upload before any downstream inspection triggers.
                    Entity parser extracts academic records, claimed frameworks, and public repository links without
                    mock fallback.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[#F0ECE1] text-[11px] font-mono text-[#6E6659]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Boundary-checked PDF entity parser</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Enforced Step 1-2 lock guards</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-7 pt-0">
                <div className="pt-4 border-t border-[#E5DFD5]">
                  <Link
                    href="/app"
                    className="text-xs font-semibold text-[#141413] hover:text-[#2E6B47] inline-flex items-center gap-1.5 group/link"
                  >
                    <span>Upload & Test Ingest</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 02: Audit */}
            <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between hover:shadow-md transition-all group">
              <div>
                {/* Full-width editorial artwork (matches Image 3) */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#D5E5DA]">
                  <img
                    src="/editorial-audit.jpg"
                    alt="Cross-Audit Telemetry Engine"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#141413]/75 backdrop-blur-xs text-[10px] font-mono font-semibold text-[#FAF8F5] tracking-wider uppercase">
                    Stage 02 • Audit
                  </div>
                </div>

                <div className="p-6 sm:p-7 space-y-4">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#2E6B47] uppercase tracking-wider block mb-1">
                      02
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#141413]">
                      Audit.
                    </h3>
                    <h4 className="text-xs font-mono font-semibold text-[#2E6B47] uppercase tracking-wider mt-1">
                      Proof vs. Assertion Verification
                    </h4>
                  </div>

                  <p className="text-xs text-[#524E48] leading-relaxed">
                    Every listed skill is cross-checked against actual public source trees, AST files, commit streak
                    cadence, and LeetCode algorithmic complexity. Claims without telemetry proof are flagged unverified.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[#F0ECE1] text-[11px] font-mono text-[#6E6659]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Real-time GitHub repository inspection</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Proctored DSA integrity assessment</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-7 pt-0">
                <div className="pt-4 border-t border-[#E5DFD5]">
                  <Link
                    href="/app"
                    className="text-xs font-semibold text-[#141413] hover:text-[#2E6B47] inline-flex items-center gap-1.5 group/link"
                  >
                    <span>Explore Verification Grid</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 03: Remediate */}
            <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between hover:shadow-md transition-all group">
              <div>
                {/* Full-width editorial artwork (matches Image 3) */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-[#C2D4E8]">
                  <img
                    src="/editorial-remediate.jpg"
                    alt="Market-Weighted Remediation Academy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#141413]/75 backdrop-blur-xs text-[10px] font-mono font-semibold text-[#FAF8F5] tracking-wider uppercase">
                    Stage 03 • Remediate
                  </div>
                </div>

                <div className="p-6 sm:p-7 space-y-4">
                  <div>
                    <span className="text-[11px] font-mono font-bold text-[#1E5B99] uppercase tracking-wider block mb-1">
                      03
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-serif-display font-bold text-[#141413]">
                      Remediate.
                    </h3>
                    <h4 className="text-xs font-mono font-semibold text-[#1E5B99] uppercase tracking-wider mt-1">
                      Market-Weighted Remedial Sprint
                    </h4>
                  </div>

                  <p className="text-xs text-[#524E48] leading-relaxed">
                    Identified blindspots are mapped to real-time hiring demand frequency (SQL 86%, Docker 78%, APIs 92%).
                    Generates an actionable 4-week structured sprint complete with curated documentation and project targets.
                  </p>

                  <div className="space-y-2 pt-2 border-t border-[#F0ECE1] text-[11px] font-mono text-[#6E6659]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Role-weighted gap priority ordering</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Structured 4-week roadmap progression</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-7 pt-0">
                <div className="pt-4 border-t border-[#E5DFD5]">
                  <Link
                    href="/app"
                    className="text-xs font-semibold text-[#141413] hover:text-[#2E6B47] inline-flex items-center gap-1.5 group/link"
                  >
                    <span>View Sample Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section 4: Cohort Intelligence & Validation Metrics ─────── */}
      <section id="benchmark" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6E6659] font-bold">
              Controlled Empirical Evaluation
            </span>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold tracking-tight text-[#141413]">
              Placement Cohort Feature Attribution
            </h2>
            <p className="text-xs sm:text-sm text-[#524E48]">
              Feature importances derived from Random Forest Regressor trained on 500 engineering cohort profiles.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0ECE1] pb-3 text-xs font-mono text-[#6E6659]">
              <span>Feature Signal</span>
              <span>Model Weight Index</span>
            </div>

            {[
              { label: "Verified Skills Ratio (Cross-audited via public commits)", weight: "35.6%", pct: 35.6, bar: "bg-emerald-600" },
              { label: "LeetCode Depth (Med & Hard problem depth)", weight: "33.2%", pct: 33.2, bar: "bg-blue-600" },
              { label: "Commit Consistency & Streak Cadence", weight: "17.7%", pct: 17.7, bar: "bg-amber-600" },
              { label: "Academic Standing (CGPA Foundation)", weight: "6.2%", pct: 6.2, bar: "bg-slate-600" },
              { label: "Claimed Skill Breadth (Self-reported inventory)", weight: "4.0%", pct: 4.0, bar: "bg-stone-500" },
            ].map((feat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#141413]">{feat.label}</span>
                  <span className="font-mono font-bold text-[#141413]">{feat.weight}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#F0ECE1] overflow-hidden">
                  <div className={`h-full rounded-full ${feat.bar}`} style={{ width: `${feat.pct * 2.5}%` }} />
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-[#F0ECE1] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[#6E6659]">
              <span>R² Score: 0.852 • RMSE: 4.58 • 80/20 Cohort Split</span>
              <span className="text-emerald-700 font-semibold">Trained & Cached in backend/ml_engine.py</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bottom Call to Action ───────────────────────────────────── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-[#18231F] text-[#FAF8F5]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#4ADE80] font-bold">
            Deploy Ground Truth Telemetry
          </span>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-bold tracking-tight">
            Ready to audit candidate employability with zero hallucinations?
          </h2>
          <p className="font-editorial text-base sm:text-xl text-[#B4C2BA] leading-relaxed max-w-xl mx-auto">
            Test candidate credentials with live GitHub telemetry, proctored algorithmic evaluations,
            and machine-learning verified readiness scores.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#FAF8F5] text-[#18231F] text-sm font-bold hover:bg-[#FFFFFF] transition-all shadow-md group cursor-pointer"
            >
              <span>Resume Analyzer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#23332D] border border-[#354D43] text-[#FAF8F5] text-sm font-semibold hover:bg-[#2C4039] transition-all cursor-pointer"
            >
              <span>Open Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Editorial Footer ────────────────────────────────────────── */}
      <footer className="border-t border-[#E5DFD5] py-12 px-4 sm:px-6 text-xs text-[#6E6659] bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-[#18231F] text-[#FAF8F5] flex items-center justify-center font-bold text-[10px]">
              CL
            </div>
            <span className="font-serif-display font-bold text-sm text-[#141413]">CareerLens</span>
            <span className="text-[#A39E93]">•</span>
            <span>The Deterministic Employability Engine</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <Link href="/app" className="hover:text-[#141413] transition-colors">
              Live Audit Tool
            </Link>
            <Link href="/dashboard" className="hover:text-[#141413] transition-colors">
              Candidate View
            </Link>
            <a href="#architecture" className="hover:text-[#141413] transition-colors">
              Engine Specs
            </a>
            <span className="text-[#A39E93]">•</span>
            <span>Next.js 16 • FastAPI • Scikit-Learn</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
