"use client";

import React from "react";
import { TARGET_ROLES } from "@/types/profile";
import { Compass, Layers } from "lucide-react";

interface TopBarProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
  bgMode: "fabric" | "plaid";
  onToggleBg: () => void;
  onReset: () => void;
  stepBadge?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  selectedRole,
  onRoleChange,
  bgMode,
  onToggleBg,
  onReset,
  stepBadge = "Step 3: Skill Verification",
}) => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#FAF8F5]/85 border-b border-[#D6CEBE]/80 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* App Title & Tagline */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
            title="Reset profile"
          >
            <div className="w-9 h-9 rounded-xl bg-[#24201D] text-[#FAF8F5] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-[#FAF8F5]" strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg tracking-tight text-[#24201D]">
                  CareerLens
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-[#E8E2D7] text-[#4A4036] border border-[#D6CEBE]">
                  {stepBadge}
                </span>
              </div>
              <p className="text-xs text-[#6E6659] font-normal leading-tight">
                AI-Powered Employability & Career Readiness Analyzer
              </p>
            </div>
          </button>
        </div>

        {/* Right side controls: Role selector & Background toggle */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Target Role Selector */}
          <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#D6CEBE] rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-xs font-medium text-[#6E6659] whitespace-nowrap">
              Target Role:
            </span>
            <select
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="bg-transparent text-sm font-semibold text-[#24201D] focus:outline-none cursor-pointer pr-1"
              id="target-role-dropdown"
            >
              <option value="">-- Custom / JD --</option>
              {TARGET_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Background Texture Switch */}
          <button
            type="button"
            onClick={onToggleBg}
            title={`Switch to ${bgMode === "fabric" ? "subtle grid canvas" : "fabric photo texture"}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5A5144] hover:text-[#24201D] bg-[#FFFFFF] hover:bg-[#FAF8F5] border border-[#D6CEBE] px-2.5 py-1.5 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#8A7E6C]" />
            <span className="hidden sm:inline">
              {bgMode === "fabric" ? "Fabric Texture" : "Canvas Plaid"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
