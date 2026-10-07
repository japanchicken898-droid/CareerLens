"use client";

import React from "react";
import { ProfileData } from "@/types/profile";
import { formatFileSize } from "@/utils/validation";
import { GithubIcon, LinkedinIcon, LeetcodeIcon } from "@/components/Icons";
import {
  User,
  FileText,
  Globe,
  Link2,
  Briefcase,
  Edit3,
  CheckCircle2,
} from "lucide-react";

interface ProfileDisplayCardProps {
  profile: ProfileData;
  onEdit: () => void;
}

export const ProfileDisplayCard: React.FC<ProfileDisplayCardProps> = ({
  profile,
  onEdit,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Confirmation Banner */}
      <div className="bg-[#E2EDE5] border border-[#B8D7C0] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2E6B47] text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#1C452E]">
              Profile Input Saved Successfully
            </h2>
            <p className="text-xs text-[#2E6B47]">
              Step 1 complete. Real candidate profile data registered without mock evaluation.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#24201D] border border-[#D6CEBE] text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#6E6659]" />
          <span>Edit Profile Input</span>
        </button>
      </div>

      {/* Profile Details Paper Card */}
      <div className="paper-card p-6 sm:p-7 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8E2D7] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#F0ECE1] text-[#24201D] flex items-center justify-center font-bold text-lg border border-[#D6CEBE]">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#24201D]">{profile.name}</h3>
              <p className="text-xs text-[#6E6659] font-medium flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-[#8A7E6C]" />
                  {profile.targetRole || "Custom Job Posting Target"}
                </span>
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-[#8A7E6C] bg-[#FAF8F5] border border-[#E8E2D7] px-2.5 py-1 rounded-lg">
            ID: {profile.id || "PROFILE_DATA"}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          {/* Left: Resume & Target Details */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7E6C] block mb-1.5">
                Resume PDF File
              </span>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7]">
                <FileText className="w-5 h-5 text-[#2E6B47] shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-semibold text-[#24201D] truncate">
                    {profile.resumeFileName || profile.resume?.name || "Uploaded Resume"}
                  </p>
                  {(profile.resumeFileSize || profile.resume?.size) && (
                    <p className="text-[11px] text-[#6E6659] font-mono">
                      {formatFileSize(profile.resumeFileSize || profile.resume?.size || 0)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7E6C] block mb-1.5">
                Target Role
              </span>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] font-semibold text-[#24201D]">
                {profile.targetRole || "None specified (Using Job Description)"}
              </div>
            </div>

            {profile.jobDescription && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7E6C] block mb-1.5">
                  Job Description Text
                </span>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] text-xs text-[#4A4036] max-h-32 overflow-y-auto whitespace-pre-wrap font-mono">
                  {profile.jobDescription}
                </div>
              </div>
            )}
          </div>

          {/* Right: Code & Social Profiles */}
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7E6C] block mb-1.5">
                GitHub Profile
              </span>
              <a
                href={profile.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] hover:border-[#24201D] font-mono text-xs text-[#24201D] truncate transition-colors"
              >
                <GithubIcon className="w-4 h-4 shrink-0 text-[#24201D]" />
                <span className="truncate">{profile.githubUrl}</span>
              </a>
            </div>

            {profile.leetcodeUrl && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7E6C] block mb-1.5 flex items-center justify-between">
                  <span>LeetCode Profile</span>
                  <span className="text-[10px] font-mono text-[#B8532F] bg-[#FAF1EC] border border-[#EAC9BC] px-1.5 py-0.2 rounded font-bold">
                    DSA PROOF
                  </span>
                </span>
                <a
                  href={profile.leetcodeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] hover:border-[#FFA116] font-mono text-xs text-[#24201D] truncate transition-colors"
                >
                  <LeetcodeIcon className="w-4 h-4 shrink-0 text-[#FFA116]" />
                  <span className="truncate">{profile.leetcodeUrl}</span>
                </a>
              </div>
            )}

            {profile.portfolioUrl && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7E6C] block mb-1.5">
                  Portfolio Website
                </span>
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] hover:border-[#24201D] font-mono text-xs text-[#24201D] truncate transition-colors"
                >
                  <Globe className="w-4 h-4 shrink-0 text-[#5A5144]" />
                  <span className="truncate">{profile.portfolioUrl}</span>
                </a>
              </div>
            )}

            {profile.linkedinUrl && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7E6C] block mb-1.5">
                  LinkedIn Profile
                </span>
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] hover:border-[#0A66C2] font-mono text-xs text-[#0A66C2] truncate transition-colors"
                >
                  <LinkedinIcon className="w-4 h-4 shrink-0 text-[#0A66C2]" />
                  <span className="truncate">{profile.linkedinUrl}</span>
                </a>
              </div>
            )}

            {profile.additionalLinks && profile.additionalLinks.length > 0 && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8A7E6C] block mb-1.5">
                  Additional Project Links
                </span>
                <div className="space-y-1.5">
                  {profile.additionalLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] hover:border-[#24201D] font-mono text-xs text-[#4A4036] truncate transition-colors"
                    >
                      <Link2 className="w-3.5 h-3.5 shrink-0 text-[#8A7E6C]" />
                      <span className="truncate">{link}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
