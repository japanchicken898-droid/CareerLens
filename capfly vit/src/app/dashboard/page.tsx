"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Search,
  ChevronDown,
  Settings2,
  X,
  ExternalLink,
  BarChart3,
  GraduationCap,
  Info,
  Target,
} from "lucide-react";

type ReadinessStatus =
  | "Eligible for Drive"
  | "Assigned: Cloud Workshop"
  | "Mandatory DSA Remediation"
  | "Assigned: SQL Bootcamp"
  | "Assigned: API Workshop";
type FilterTab = "all" | "ready" | "support";

interface Student {
  id: string;
  name: string;
  roll: string;
  dept: string;
  track: string;
  jrs: number;
  repos: number;
  leetcode: number;
  status: ReadinessStatus;
}

function useCountUp(target: number, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      if (!started.current) {
        started.current = true;
        requestAnimationFrame(tick);
      }
    }, delay);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);
  return value;
}

function AnimatedBar({ pct, color, delay }: { pct: number; color: string; delay: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), delay + 100);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="relative h-3 rounded-full bg-[#EDE8DE] overflow-visible">
      <div
        className="absolute top-0 left-0 h-full rounded-full transition-all duration-[1200ms] ease-out"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
      <div
        className="absolute top-[-4px] bottom-[-4px] w-0.5 bg-[#6E6659] opacity-60"
        style={{ left: "25%" }}
        title="Industry acceptable threshold: 25%"
      />
    </div>
  );
}

function DonutChart({ animated }: { animated: boolean }) {
  const segments = [
    { pct: 28, color: "#2E7D32", label: "Placement Ready (JRS >= 75)", detail: "Shortlist candidates for Tier-1 hiring drives." },
    { pct: 46, color: "#C67D0A", label: "Developing Track (JRS 50-74)", detail: "Needs 2-week polish sprint." },
    { pct: 26, color: "#B71C1C", label: "Intervention Needed (JRS < 50)", detail: "Needs mandatory hands-on bootcamps before recruitment." },
  ];
  const r = 80;
  const cx = 110;
  const cy = 110;
  const [progress, setProgress] = useState(0);
  const [tooltip, setTooltip] = useState<null | { x: number; y: number; seg: typeof segments[0] }>(null);

  useEffect(() => {
    if (!animated) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / 1200, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setProgress(eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [animated]);

  let cumulativePct = 0;
  const arcs = segments.map((seg) => {
    const startPct = cumulativePct;
    cumulativePct += seg.pct;
    const startAngle = (startPct / 100) * 360 - 90;
    const endAngle = ((startPct + seg.pct * progress) / 100) * 360 - 90;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = seg.pct * progress > 50 ? 1 : 0;
    return { ...seg, startPct, x1, y1, x2, y2, largeArc };
  });

  return (
    <div className="relative flex items-center justify-center">
      <svg width="220" height="220" className="overflow-visible">
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${arc.x1} ${arc.y1} A ${r} ${r} 0 ${arc.largeArc} 1 ${arc.x2} ${arc.y2} Z`}
            fill={arc.color}
            opacity={0.9}
            className="cursor-pointer"
            onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, seg: arc })}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.62} fill="#FFFFFF" />
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="800" fill="#141413">57.8</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#6E6659" fontWeight="600">MEAN COHORT JRS</text>
      </svg>
      {tooltip && (
        <div
          className="fixed z-50 max-w-[220px] p-3 bg-[#141413] text-[#FAF8F5] text-xs rounded-xl shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          <p className="font-bold mb-1">{tooltip.seg.label}</p>
          <p className="text-[#C8C0B4]">{tooltip.seg.detail}</p>
        </div>
      )}
    </div>
  );
}

const STUDENTS: Student[] = [
  { id: "s1",  name: "Deepak Bathirachalam", roll: "21CSE047", dept: "CSE", track: "Backend Developer",  jrs: 50, repos: 8,  leetcode: 62,  status: "Assigned: Cloud Workshop" },
  { id: "s2",  name: "Aisha Nair",           roll: "21CSE012", dept: "CSE", track: "Backend Developer",  jrs: 82, repos: 19, leetcode: 204, status: "Eligible for Drive" },
  { id: "s3",  name: "Rajan Mehra",          roll: "21IT009",  dept: "IT",  track: "Frontend Developer", jrs: 41, repos: 4,  leetcode: 28,  status: "Mandatory DSA Remediation" },
  { id: "s4",  name: "Priya Subramaniam",    roll: "21CSE031", dept: "CSE", track: "Data Analyst",       jrs: 76, repos: 11, leetcode: 145, status: "Eligible for Drive" },
  { id: "s5",  name: "Karthik Venugopal",    roll: "21ECE022", dept: "ECE", track: "Backend Developer",  jrs: 38, repos: 3,  leetcode: 19,  status: "Mandatory DSA Remediation" },
  { id: "s6",  name: "Sneha Ramachandran",   roll: "21IT018",  dept: "IT",  track: "Frontend Developer", jrs: 67, repos: 7,  leetcode: 88,  status: "Assigned: Cloud Workshop" },
  { id: "s7",  name: "Arjun Pillai",         roll: "21CSE055", dept: "CSE", track: "Backend Developer",  jrs: 88, repos: 24, leetcode: 312, status: "Eligible for Drive" },
  { id: "s8",  name: "Divya Krishnan",       roll: "21CSE067", dept: "CSE", track: "Data Analyst",       jrs: 55, repos: 9,  leetcode: 76,  status: "Assigned: SQL Bootcamp" },
  { id: "s9",  name: "Mohammed Farhan",      roll: "21IT033",  dept: "IT",  track: "Backend Developer",  jrs: 44, repos: 5,  leetcode: 34,  status: "Mandatory DSA Remediation" },
  { id: "s10", name: "Lakshmi Venkat",       roll: "21CSE089", dept: "CSE", track: "Frontend Developer", jrs: 79, repos: 14, leetcode: 167, status: "Eligible for Drive" },
  { id: "s11", name: "Rohan Desai",          roll: "21ECE044", dept: "ECE", track: "Data Analyst",       jrs: 61, repos: 6,  leetcode: 92,  status: "Assigned: SQL Bootcamp" },
  { id: "s12", name: "Kavitha Selvam",       roll: "21CSE102", dept: "CSE", track: "Backend Developer",  jrs: 33, repos: 2,  leetcode: 11,  status: "Mandatory DSA Remediation" },
  { id: "s13", name: "Nikhil Sharma",        roll: "21IT051",  dept: "IT",  track: "Frontend Developer", jrs: 85, repos: 21, leetcode: 241, status: "Eligible for Drive" },
  { id: "s14", name: "Pooja Nambiar",        roll: "21CSE115", dept: "CSE", track: "Data Analyst",       jrs: 58, repos: 8,  leetcode: 103, status: "Assigned: API Workshop" },
  { id: "s15", name: "Siddharth Bose",       roll: "21ECE061", dept: "ECE", track: "Backend Developer",  jrs: 72, repos: 12, leetcode: 134, status: "Assigned: Cloud Workshop" },
];

const DEFICIT_DATA = [
  { label: "System Design & CI/CD Pipelines",          pct: 71, color: "#B71C1C", tooltip: "341 students have no automated GitHub Actions or deployment scripts in their tracked repos." },
  { label: "Cloud & Containerization (Docker/K8s)",    pct: 62, color: "#C67D0A", tooltip: "298 out of 480 students lack verified Docker/K8s repositories or commit manifests." },
  { label: "Relational Databases & SQL",               pct: 58, color: "#C67D0A", tooltip: "278 students claim SQL but have 0 database schema models or query projects in repositories." },
  { label: "Algorithmic Depth (Medium/Hard LeetCode)", pct: 44, color: "#2563EB", tooltip: "211 students have solved fewer than 25 medium/hard DSA problems." },
  { label: "REST APIs & Backend Frameworks",           pct: 23, color: "#2E7D32", tooltip: "110 students have unverified API claims." },
];

export default function PlacementCellDashboard() {
  const [dept, setDept] = useState("All Departments");
  const [role, setRole] = useState("All Tracks");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [weightOpen, setWeightOpen] = useState(false);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const totalCount    = useCountUp(animated ? 480 : 0, 1200,   0);
  const readyCount    = useCountUp(animated ? 134 : 0, 1200, 150);
  const moderateCount = useCountUp(animated ? 221 : 0, 1200, 300);
  const supportCount  = useCountUp(animated ? 125 : 0, 1200, 450);

  const filteredStudents = useMemo(() => {
    let list = STUDENTS;
    if (dept !== "All Departments") list = list.filter(s => s.dept === dept);
    if (role !== "All Tracks") list = list.filter(s => s.track === role);
    if (filter === "ready") list = list.filter(s => s.jrs >= 75);
    if (filter === "support") list = list.filter(s => s.jrs < 50);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.roll.toLowerCase().includes(q) ||
        s.track.toLowerCase().includes(q)
      );
    }
    return list;
  }, [dept, role, filter, search]);

  const statusStyle = (s: ReadinessStatus) => {
    if (s === "Eligible for Drive") return "bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]";
    if (s === "Mandatory DSA Remediation") return "bg-[#FFEBEE] text-[#B71C1C] border border-[#EF9A9A]";
    return "bg-[#FFF8E1] text-[#C67D0A] border border-[#FFE082]";
  };

  const jrsPillStyle = (jrs: number) => {
    if (jrs >= 75) return "bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]";
    if (jrs >= 50) return "bg-[#FFF8E1] text-[#C67D0A] border border-[#FFE082]";
    return "bg-[#FFEBEE] text-[#B71C1C] border border-[#EF9A9A]";
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#141413]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#E5DFD5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#18231F] text-[#FAF8F5] flex items-center justify-center text-xs font-black">CL</div>
            <div>
              <span className="text-sm font-bold text-[#141413]">CareerLens</span>
              <span className="hidden sm:inline text-xs text-[#8A7E6C] ml-2 font-mono">Placement Cell Intelligence</span>
            </div>
          </div>
          <nav className="flex items-center gap-1 text-xs">
            <Link href="/" className="px-3 py-1.5 rounded-lg text-[#6E6659] hover:text-[#141413] hover:bg-[#EDE8DE] transition-colors font-medium">Home</Link>
            <Link href="/app" className="px-3 py-1.5 rounded-lg text-[#6E6659] hover:text-[#141413] hover:bg-[#EDE8DE] transition-colors font-medium">My Analysis</Link>
            <span className="px-3 py-1.5 rounded-lg bg-[#141413] text-[#FAF8F5] font-semibold cursor-default">Dashboard</span>
          </nav>
          <Link href="/" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#D6CEBE] text-xs font-semibold text-[#24201D] hover:bg-[#EDE8DE] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Return to Gateway</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-5 h-5 text-[#2E7D32]" />
              <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#8A7E6C]">Institutional Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#141413] tracking-tight">Placement Cell Dashboard</h1>
            <p className="text-sm text-[#6E6659] mt-1">Pre-placement readiness audit · Batch-level deficits · Student triage</p>
          </div>
          <button
            onClick={() => setWeightOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D6CEBE] bg-[#FFFFFF] text-sm font-semibold text-[#141413] hover:bg-[#F3EFE6] transition-colors shadow-sm cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-[#6E6659]" />
            Scoring Weight Configuration
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select value={dept} onChange={e => setDept(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-[#D6CEBE] bg-[#FFFFFF] text-sm font-medium text-[#141413] focus:outline-none focus:border-[#141413] transition-colors cursor-pointer shadow-sm">
              {["All Departments","CSE","IT","ECE"].map(d => <option key={d}>{d}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#8A7E6C] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
          <div className="relative">
            <select value={role} onChange={e => setRole(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-[#D6CEBE] bg-[#FFFFFF] text-sm font-medium text-[#141413] focus:outline-none focus:border-[#141413] transition-colors cursor-pointer shadow-sm">
              {["All Tracks","Backend Developer","Frontend Developer","Data Analyst"].map(r => <option key={r}>{r}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#8A7E6C] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
          <span className="text-xs text-[#8A7E6C] font-mono">Showing {filteredStudents.length} of {STUDENTS.length} students</span>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Users className="w-5 h-5 text-[#24201D]" />, label: "Total Cohort Audited",         value: totalCount,    unit: "Students", sub: "Across all departments",         pct: null,    color: "#141413" },
            { icon: <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />, label: "Pre-Placement Ready",   value: readyCount,    unit: "Students", sub: "Score >= 75 · Tier-1 Eligible",  pct: "27.9%", color: "#2E7D32" },
            { icon: <TrendingUp className="w-5 h-5 text-[#C67D0A]" />, label: "Moderate / Developing",   value: moderateCount, unit: "Students", sub: "Score 50-74 · Polish Sprint",     pct: "46.0%", color: "#C67D0A" },
            { icon: <AlertTriangle className="w-5 h-5 text-[#B71C1C]" />, label: "Training Required",    value: supportCount,  unit: "Students", sub: "Score < 50 · Mandatory Bootcamp", pct: "26.1%", color: "#B71C1C" },
          ].map((kpi, i) => (
            <div key={i} className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                {kpi.icon}
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#8A7E6C] leading-tight">{kpi.label}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black" style={{ color: kpi.color }}>{kpi.value.toLocaleString()}</span>
                <span className="text-sm text-[#6E6659] font-medium mb-0.5">{kpi.unit}</span>
                {kpi.pct && <span className="text-xs font-mono font-bold mb-0.5 ml-auto" style={{ color: kpi.color }}>{kpi.pct}</span>}
              </div>
              <p className="text-xs text-[#8A7E6C] mt-1">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Deficit Spectrum */}
          <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#141413]" />
                <h2 className="text-sm font-bold text-[#141413]">Batch Skill Deficit Spectrum</h2>
              </div>
              <p className="text-xs text-[#8A7E6C] mt-0.5">% of cohort lacking verifiable proof</p>
            </div>
            <div className="space-y-4">
              {DEFICIT_DATA.map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-[#141413]">{item.label}</span>
                      <div className="relative group">
                        <Info className="w-3 h-3 text-[#A89E8D] cursor-help" />
                        <div className="absolute left-5 top-0 z-20 hidden group-hover:block w-56 p-2.5 bg-[#141413] text-[#FAF8F5] text-[11px] rounded-xl shadow-lg pointer-events-none leading-relaxed">
                          {item.tooltip}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-bold" style={{ color: item.color }}>{item.pct}%</span>
                  </div>
                  <AnimatedBar pct={item.pct} color={item.color} delay={i * 150} />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-[#E5DFD5]">
              <div className="w-4 h-px bg-[#6E6659]" />
              <span className="text-[11px] text-[#8A7E6C] font-mono">25% = Industry acceptable threshold</span>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl p-6 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#141413]" />
                <h2 className="text-sm font-bold text-[#141413]">Placement Readiness Triage Distribution</h2>
              </div>
              <p className="text-xs text-[#8A7E6C] mt-0.5">JRS-based cohort segmentation · Hover segments for details</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <DonutChart animated={animated} />
              <div className="space-y-3 flex-1 w-full">
                {[
                  { label: "Placement Ready",     sub: "JRS >= 75 · Tier-1 Eligible",    pct: 28, count: 134, color: "#2E7D32", bg: "#E8F5E9" },
                  { label: "Developing Track",    sub: "JRS 50-74 · 2-Week Polish Sprint", pct: 46, count: 221, color: "#C67D0A", bg: "#FFF8E1" },
                  { label: "Intervention Needed", sub: "JRS < 50 · Mandatory Bootcamp",   pct: 26, count: 125, color: "#B71C1C", bg: "#FFEBEE" },
                ].map((seg, i) => (
                  <div key={i} className="p-3 rounded-xl border" style={{ backgroundColor: seg.bg, borderColor: seg.color + "40" }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                        <span className="text-xs font-semibold" style={{ color: seg.color }}>{seg.label}</span>
                      </div>
                      <span className="text-sm font-black" style={{ color: seg.color }}>{seg.pct}%</span>
                    </div>
                    <p className="text-[11px] mt-0.5 text-[#6E6659] pl-4">{seg.sub} · {seg.count} students</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Student Triage Table */}
        <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E5DFD5] space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#141413]" />
              <h2 className="text-sm font-bold text-[#141413]">Pre-Placement Student Triage</h2>
              <span className="ml-auto text-xs font-mono text-[#8A7E6C]">{filteredStudents.length} results</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-[#A89E8D] absolute left-3 top-2.5" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search student name, roll number, or skill..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#D6CEBE] bg-[#FAF8F5] text-sm text-[#141413] placeholder:text-[#A89E8D] focus:outline-none focus:border-[#141413] focus:bg-[#FFFFFF] transition-all" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {([
                  { key: "all",     label: "All (480)" },
                  { key: "ready",   label: "Placement Ready (134)" },
                  { key: "support", label: "Needs Support (125)" },
                ] as { key: FilterTab; label: string }[]).map(f => (
                  <button key={f.key} onClick={() => setFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${filter === f.key ? "bg-[#141413] text-[#FAF8F5]" : "bg-[#F3EFE6] text-[#6E6659] hover:bg-[#EDE8DE]"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5DFD5] bg-[#FAF8F5]">
                  {["Student","Target Track","JRS Score","Proof Signals","Triage Status","Action"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#8A7E6C] first:pl-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EBE3]">
                {filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#E8E2D7] text-[#141413] flex items-center justify-center text-xs font-bold shrink-0">{s.name.charAt(0)}</div>
                        <div>
                          <p className="font-semibold text-[#141413] text-xs">{s.name}</p>
                          <p className="text-[11px] text-[#8A7E6C] font-mono">{s.roll} · {s.dept}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5"><span className="text-xs text-[#4A4036] font-medium">{s.track}</span></td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black font-mono ${jrsPillStyle(s.jrs)}`}>{s.jrs}/100</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EDF7F0] text-[#2E7D32] border border-[#A5D6A7]">Git: {s.repos} repos</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]">LC: {s.leetcode} solved</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-1 rounded-lg ${statusStyle(s.status)}`}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Link href="/app" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D6CEBE] bg-[#FFFFFF] text-[11px] font-semibold text-[#141413] hover:bg-[#F3EFE6] hover:border-[#141413] transition-colors">
                        Audit Detail <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[#8A7E6C] font-mono">No students match the current filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Weight Config Modal */}
      {weightOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141413]/50 backdrop-blur-sm p-4">
          <div className="bg-[#FFFFFF] border border-[#E5DFD5] rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#141413]">Scoring Weight Configuration</h3>
                <p className="text-xs text-[#8A7E6C] mt-0.5">Adjust how JRS score is computed for this cohort</p>
              </div>
              <button onClick={() => setWeightOpen(false)} className="p-1.5 rounded-lg hover:bg-[#F3EFE6] transition-colors cursor-pointer">
                <X className="w-4 h-4 text-[#6E6659]" />
              </button>
            </div>
            {[
              { label: "GitHub Code Depth",   value: 35, color: "#2E7D32" },
              { label: "LeetCode Algorithms", value: 30, color: "#C67D0A" },
              { label: "Skill Evidence",      value: 25, color: "#2563EB" },
              { label: "Consistency Score",   value: 10, color: "#7C3AED" },
            ].map((w, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#141413]">{w.label}</span>
                  <span className="font-mono font-bold" style={{ color: w.color }}>{w.value}%</span>
                </div>
                <div className="relative h-2 rounded-full bg-[#EDE8DE]">
                  <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${w.value}%`, backgroundColor: w.color }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-[#E5DFD5] flex items-center justify-between">
              <span className="text-[11px] text-[#8A7E6C] font-mono">Total: 100%</span>
              <button onClick={() => setWeightOpen(false)} className="px-4 py-2 rounded-xl bg-[#141413] text-[#FAF8F5] text-xs font-semibold hover:bg-[#2B2925] transition-colors cursor-pointer">
                Apply Weights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
