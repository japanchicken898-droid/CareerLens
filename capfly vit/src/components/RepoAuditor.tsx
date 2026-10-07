"use client";

import React, { useState } from "react";
import { RepoItem } from "@/data/rolesData";
import { GitFork, Star, CheckCircle, XCircle, Code2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface RepoAuditorProps {
  repos: RepoItem[];
  githubUrl: string;
}

export const RepoAuditor: React.FC<RepoAuditorProps> = ({ repos, githubUrl }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="paper-card p-5 sm:p-6 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm space-y-4">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <Code2 className="w-4 h-4 text-[#4A4036]" />
          <div>
            <h3 className="text-sm font-bold text-[#24201D]">
              Audited Repositories ({repos.length})
            </h3>
            <p className="text-xs text-[#6E6659]">
              Inspected for architecture, tests, and commit cadence
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-xs font-mono text-[#6E6659] flex items-center gap-1 hover:text-[#24201D]"
        >
          {isOpen ? (
            <>
              Hide repositories <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Inspect repositories <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-3 pt-2 border-t border-[#E8E2D7]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {repos.map((repo, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-[#D6CEBE] bg-[#FAF8F5] space-y-2 hover:bg-[#FFFFFF] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-mono text-xs font-bold text-[#24201D] truncate flex items-center gap-1.5">
                    <span>{repo.name}</span>
                    <a
                      href={`${githubUrl}/${repo.name}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#8A7E6C] hover:text-[#24201D]"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <span className="text-[10px] font-mono bg-[#E8E2D7] text-[#4A4036] px-1.5 py-0.5 rounded">
                    {repo.language}
                  </span>
                </div>

                <p className="text-xs text-[#5A5144] line-clamp-2">
                  {repo.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-[#6E6659]">
                  <span className="flex items-center gap-1">
                    {repo.hasTests ? (
                      <CheckCircle className="w-3 h-3 text-[#2E6B47]" />
                    ) : (
                      <XCircle className="w-3 h-3 text-[#991B1B]" />
                    )}
                    {repo.hasTests ? "Tests found" : "0 tests"}
                  </span>

                  <span className="flex items-center gap-1">
                    {repo.hasCi ? (
                      <CheckCircle className="w-3 h-3 text-[#2E6B47]" />
                    ) : (
                      <XCircle className="w-3 h-3 text-[#8A7E6C]" />
                    )}
                    {repo.hasCi ? "CI workflow" : "No CI"}
                  </span>

                  <span className="text-[#8A7E6C]">
                    Updated {repo.lastCommitDaysAgo}d ago
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-[#8A7E6C] font-mono flex items-center justify-between pt-1">
            <span>Audit source: GitHub Public API & Git tree parser</span>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#4A4036] hover:underline"
            >
              View GitHub Profile →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
