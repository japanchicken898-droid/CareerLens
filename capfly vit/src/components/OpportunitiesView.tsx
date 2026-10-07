"use client";

import React, { useState } from "react";
import {
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
} from "lucide-react";
import type { ExamResult } from "@/types/exam";
import type { ExtractedProfile } from "@/types/extraction";

interface OpportunitiesViewProps {
  examResult: ExamResult | null;
  extractedProfile: ExtractedProfile | null;
  onTakeExam?: () => void;
  darkMode?: boolean;
}

interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "Full-Time" | "Internship";
  salary: string;
  matchScore: number;
  skills: string[];
  requiresDsaPassed: boolean;
  postedAgo: string;
  verifiedDirect: boolean;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  examResult,
  extractedProfile,
  onTakeExam,
  darkMode = false,
}) => {
  const dk = darkMode;
  const [appliedIds, setAppliedIds] = useState<string[]>([]);

  const dsaPassed = examResult?.passed ?? false;
  const dsaScore = examResult ? Math.round((examResult.marksEarned / examResult.totalMarks) * 100) : 0;

  const candidateSkills = extractedProfile
    ? extractedProfile.normalizedSkills.map((s) => s.normalized)
    : ["javascript", "react", "python"];

  const rawOpportunities: Opportunity[] = [
    {
      id: "opp-1",
      title: "Graduate Software Development Engineer (SDE-1)",
      company: "TechPulse Solutions",
      location: "Bengaluru, IN (Hybrid)",
      type: "Full-Time",
      salary: "₹12 - ₹16 LPA",
      matchScore: dsaPassed ? Math.min(98, 85 + Math.round(dsaScore * 0.12)) : 62,
      skills: ["Data Structures", "Algorithms", "Java", "REST APIs"],
      requiresDsaPassed: true,
      postedAgo: "2 days ago",
      verifiedDirect: true,
    },
    {
      id: "opp-2",
      title: "Frontend Engineering Intern",
      company: "InnovateX Labs",
      location: "Remote",
      type: "Internship",
      salary: "₹35,000 / mo",
      matchScore: 91,
      skills: ["React", "TypeScript", "Tailwind CSS", "JavaScript"],
      requiresDsaPassed: false,
      postedAgo: "1 day ago",
      verifiedDirect: true,
    },
    {
      id: "opp-3",
      title: "Backend & Systems Development Engineer",
      company: "CloudScale Systems",
      location: "Hyderabad, IN",
      type: "Full-Time",
      salary: "₹14 - ₹18 LPA",
      matchScore: dsaPassed ? Math.min(95, 80 + Math.round(dsaScore * 0.14)) : 58,
      skills: ["Python", "Node.js", "Data Structures", "PostgreSQL"],
      requiresDsaPassed: true,
      postedAgo: "3 days ago",
      verifiedDirect: true,
    },
    {
      id: "opp-4",
      title: "DSA & Problem Solving Engineering Trainee",
      company: "Capfly Partner Network",
      location: "Remote / Hybrid",
      type: "Internship",
      salary: "₹40,000 / mo",
      matchScore: dsaPassed ? 96 : 45,
      skills: ["Data Structures", "Algorithms", "C++", "Python"],
      requiresDsaPassed: true,
      postedAgo: "Today",
      verifiedDirect: true,
    },
  ];

  const handleApply = (id: string) => {
    if (!appliedIds.includes(id)) {
      setAppliedIds([...appliedIds, id]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div
        className={`rounded-2xl border p-6 shadow-xs relative overflow-hidden transition-colors ${
          dk
            ? "bg-[#1C1A17] border-[#2E2B27]"
            : "bg-[#FFFFFF] border-[#D6CEBE]"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                dk ? "bg-[#2A2722] text-[#4ADE80]" : "bg-[#EDF7F0] text-[#2E6B47]"
              }`}>
                Step 7 • Career Opportunities
              </span>
              <span className={`text-xs ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
                {rawOpportunities.length} Matched Roles
              </span>
            </div>
            <h2 className={`text-2xl font-black tracking-tight ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
              Verified Opportunities
            </h2>
            <p className={`text-xs mt-1 max-w-xl leading-relaxed ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
              Matched directly to your verified skills and Protected DSA Exam benchmark.
            </p>
          </div>

          {!dsaPassed && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-3 shrink-0 ${
              dk ? "bg-[#281815] border-[#4A201A] text-[#FCA5A5]" : "bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]"
            }`}>
              <div>
                <span className="font-bold block">Unlock High-Tier SDE Roles</span>
                <span className="text-[11px] opacity-90">Pass DSA Exam to boost match score to 95%+</span>
              </div>
              <button
                type="button"
                onClick={onTakeExam}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 cursor-pointer transition-colors"
              >
                Take Exam →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {rawOpportunities.map((opp) => {
          const isApplied = appliedIds.includes(opp.id);
          const meetsDsaReq = !opp.requiresDsaPassed || dsaPassed;

          return (
            <div
              key={opp.id}
              className={`p-6 rounded-2xl border transition-all ${
                dk
                  ? "bg-[#1C1A17] border-[#2E2B27] hover:border-[#3D3A35]"
                  : "bg-[#FFFFFF] border-[#D6CEBE] hover:border-[#B5AFA6]"
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                      opp.type === "Full-Time"
                        ? dk ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-100 text-emerald-800"
                        : dk ? "bg-blue-500/10 text-blue-400" : "bg-blue-100 text-blue-800"
                    }`}>
                      {opp.type}
                    </span>
                    {opp.verifiedDirect && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-500">
                        <ShieldCheck className="w-3 h-3" />
                        Capfly Direct Partner
                      </span>
                    )}
                  </div>
                  <h3 className={`text-lg font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                    {opp.title}
                  </h3>
                  <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mt-1 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                    <span className="flex items-center gap-1 font-semibold">
                      <Building2 className="w-3.5 h-3.5" />
                      {opp.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {opp.location}
                    </span>
                    <span className="flex items-center gap-1 font-mono font-medium">
                      <DollarSign className="w-3.5 h-3.5" />
                      {opp.salary}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-xs font-semibold ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                    Match Score
                  </div>
                  <div className={`text-2xl font-black ${
                    opp.matchScore >= 80
                      ? dk ? "text-[#4ADE80]" : "text-[#2E6B47]"
                      : dk ? "text-[#FCD34D]" : "text-[#B45309]"
                  }`}>
                    {opp.matchScore}%
                  </div>
                </div>
              </div>

              {/* Skills breakdown */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-dashed border-zinc-500/20">
                <span className={`text-[11px] font-semibold mr-1 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                  Required Skills:
                </span>
                {opp.skills.map((skill) => {
                  const isVerified = candidateSkills.some(
                    (cs) => cs.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs.toLowerCase())
                  );
                  return (
                    <span
                      key={skill}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                        isVerified
                          ? dk
                            ? "bg-[#2E6B47]/20 text-[#4ADE80] border border-[#2E6B47]/40"
                            : "bg-[#EDF7F0] text-[#2E6B47] border border-[#2E6B47]/30"
                          : dk
                          ? "bg-[#2A2722] text-[#9A9183]"
                          : "bg-[#F0ECE1] text-[#6E6659]"
                      }`}
                    >
                      {isVerified && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                      {skill}
                    </span>
                  );
                })}
              </div>

              {/* Apply Action */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-500/10">
                <span className={`text-[11px] ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>
                  Posted {opp.postedAgo}
                </span>

                <button
                  type="button"
                  onClick={() => handleApply(opp.id)}
                  disabled={isApplied}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    isApplied
                      ? "bg-emerald-600/20 text-emerald-500 border border-emerald-500/30 cursor-default"
                      : dk
                      ? "bg-[#EDE8DF] text-[#0F0E0C] hover:bg-white"
                      : "bg-[#24201D] text-[#FAF8F5] hover:bg-[#3D3732]"
                  }`}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Application Submitted
                    </>
                  ) : (
                    <>
                      <span>Apply with Capfly Verified Profile</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
