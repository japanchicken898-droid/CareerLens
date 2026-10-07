import React from "react";

export interface TechIconProps {
  name: string;
  className?: string;
}

export const TechIcon: React.FC<TechIconProps> = ({ name, className = "w-4 h-4" }) => {
  const norm = name.toLowerCase().trim();

  // Python
  if (norm.includes("python") || norm === "py") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.91 2C6.98 2 7.28 4.14 7.28 4.14L7.3 6.36H12V7.07H5.06S2 6.72 2 11.66C2 16.6 4.67 16.37 4.67 16.37H6.26V14.15S6.11 11.49 8.87 11.49H13.56S16.14 11.62 16.14 9.07V4.38S16.53 2 11.91 2ZM9.03 3.33C9.55 3.33 9.97 3.75 9.97 4.27C9.97 4.79 9.55 5.21 9.03 5.21C8.51 5.21 8.09 4.79 8.09 4.27C8.09 3.75 8.51 3.33 9.03 3.33Z" fill="#387EB8" />
        <path d="M12.09 22C17.02 22 16.72 19.86 16.72 19.86L16.7 17.64H12V16.93H18.94S22 17.28 22 12.34C22 7.4 19.33 7.63 19.33 7.63H17.74V9.85S17.89 12.51 15.13 12.51H10.44S7.86 12.38 7.86 14.93V19.62S7.47 22 12.09 22ZM14.97 20.67C14.45 20.67 14.03 20.25 14.03 19.73C14.03 19.21 14.45 18.79 14.97 18.79C15.49 18.79 15.91 19.21 15.91 19.73C15.91 20.25 15.49 20.67 14.97 20.67Z" fill="#FFE052" />
      </svg>
    );
  }

  // JavaScript
  if (norm.includes("javascript") || norm === "js") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#F7DF1E" />
        <path d="M7 16.5C7.5 17.5 8.5 18 10 18C11.5 18 12.5 17.2 12.5 15.8C12.5 14.5 11.7 14 10.3 13.4L9.5 13C7.5 12.2 6.5 11.2 6.5 9.2C6.5 7.2 8.1 5.8 10.5 5.8C12.2 5.8 13.5 6.5 14.2 7.8L12.5 8.9C12 8 11.3 7.6 10.4 7.6C9.5 7.6 8.8 8.1 8.8 8.9C8.8 9.8 9.5 10.2 10.7 10.7L11.5 11.1C13.8 12.1 14.8 13.2 14.8 15.4C14.8 17.8 13 19.5 10 19.5C7.8 19.5 6.3 18.4 5.5 16.8L7 16.5Z" fill="#000000" />
      </svg>
    );
  }

  // TypeScript
  if (norm.includes("typescript") || norm === "ts") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#3178C6" />
        <path d="M6 9H13V11H10.5V18H8.5V11H6V9ZM13.8 16.5C14.3 17.5 15.3 18 16.8 18C18.3 18 19.3 17.2 19.3 15.8C19.3 14.5 18.5 14 17.1 13.4L16.3 13C14.3 12.2 13.3 11.2 13.3 9.2C13.3 7.2 14.9 5.8 17.3 5.8C19 5.8 20.3 6.5 21 7.8L19.3 8.9C18.8 8 18.1 7.6 17.2 7.6C16.3 7.6 15.6 8.1 15.6 8.9C15.6 9.8 16.3 10.2 17.5 10.7L18.3 11.1C20.6 12.1 21.6 13.2 21.6 15.4C21.6 17.8 19.8 19.5 16.8 19.5C14.6 19.5 13.1 18.4 12.3 16.8L13.8 16.5Z" fill="#FFFFFF" />
      </svg>
    );
  }

  // React
  if (norm.includes("react")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#00D8FF" strokeWidth="1.5">
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(0 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r="2" fill="#00D8FF" />
      </svg>
    );
  }

  // Node.js
  if (norm.includes("node")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#339933">
        <path d="M12 2L3 7.2v9.6L12 22l9-5.2V7.2L12 2zm0 2.3l6.8 3.9v7.6L12 19.7 5.2 15.8V8.2L12 4.3z" />
        <path d="M12 7a5 5 0 0 0-5 5v3h2.5v-3a2.5 2.5 0 0 1 5 0v3H17v-3a5 5 0 0 0-5-5z" />
      </svg>
    );
  }

  // SQL / Databases
  if (norm.includes("sql") || norm.includes("postgres") || norm.includes("mysql") || norm.includes("sqlite") || norm.includes("oracle")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#336791" strokeWidth="1.8">
        <ellipse cx="12" cy="5" rx="9" ry="3" fill="#E8F1F5" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    );
  }

  // MongoDB
  if (norm.includes("mongo")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#47A248">
        <path d="M12 2C11.5 3 7 9.5 7 14c0 3.5 2.5 6 5 8 2.5-2 5-4.5 5-8 0-4.5-4.5-11-5-12zm0 18c-1.8-1.5-3.5-3.2-3.5-6 0-3 2.5-7 3.5-8.5 1 1.5 3.5 5.5 3.5 8.5 0 2.8-1.7 4.5-3.5 6z" />
      </svg>
    );
  }

  // Docker
  if (norm.includes("docker")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#2496ED">
        <path d="M13.5 5.5h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2zm9 3h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2zm9 3h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2zm-3 0h-2v2h2v-2zm12.5 2c-.3 0-1.5.1-2.2.8-.7-.4-1.6-.5-2.5-.5H3c-.6 0-1 .4-1 1 0 4.4 3.6 8 8 8 5.1 0 9.4-3.7 9.9-8.7.6-.2 1.3-.6 1.8-1.1-.3-.4-.8-.5-1.2-.5z" />
      </svg>
    );
  }

  // AWS / Cloud
  if (norm.includes("aws") || norm.includes("amazon") || norm.includes("cloud")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#FF9900">
        <path d="M18.8 14.5c-2.4 1.7-5.8 2.7-8.8 2.7-4.2 0-8-1.6-10-4.2-.3-.4-.1-.8.4-.6 2.3 1.1 5.1 1.8 8.1 1.8 2.7 0 5.7-.7 8.5-2.1.6-.3 1.2.3.6.8l1.2 1.6z" />
        <path d="M19.9 13.5c-.3-.4-1.9-.2-2.8-.1-.3 0-.4-.2-.1-.4 1.5-1.1 3.9-.8 4.2-.4.3.4-.2 2.8-1.6 4-.3.2-.5.1-.4-.2.4-.8.9-2.4.7-2.9z" />
      </svg>
    );
  }

  // Machine Learning / AI
  if (norm.includes("machine learning") || norm.includes("ai") || norm.includes("pytorch") || norm.includes("tensorflow") || norm.includes("scikit") || norm.includes("deep learning")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" fill="#EDE9FE" />
        <circle cx="4" cy="12" r="2" fill="#EDE9FE" />
        <circle cx="20" cy="12" r="2" fill="#EDE9FE" />
        <circle cx="12" cy="4" r="2" fill="#EDE9FE" />
        <circle cx="12" cy="20" r="2" fill="#EDE9FE" />
        <line x1="6" y1="12" x2="9" y2="12" />
        <line x1="15" y1="12" x2="18" y2="12" />
        <line x1="12" y1="6" x2="12" y2="9" />
        <line x1="12" y1="15" x2="12" y2="18" />
        <line x1="6.5" y1="6.5" x2="9.5" y2="9.5" />
        <line x1="14.5" y1="14.5" x2="17.5" y2="17.5" />
      </svg>
    );
  }

  // Git / GitHub
  if (norm.includes("git")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#F05032">
        <path d="M21.7 10.3l-8-8c-.4-.4-1-.4-1.4 0L10 4.6l2.9 2.9c.4-.1.9 0 1.2.3.4.4.4 1 0 1.4-.3.3-.8.4-1.2.3l-2.8 2.8v4.1c.4.2.7.6.7 1.1 0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5c0-.5.3-.9.7-1.1V12c-.4-.2-.7-.6-.7-1.1 0-.5.2-.9.6-1.1L5.6 7 2.3 10.3c-.4.4-.4 1 0 1.4l8 8c.4.4 1 .4 1.4 0l10-10c.4-.4.4-1 0-1.4z" />
      </svg>
    );
  }

  // Java
  if (norm.includes("java") && !norm.includes("script")) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#EA2D2E">
        <path d="M8.8 17.2s-.9.5 0 .7c1.3.3 2.9.2 4.4-.2 0 0 .5.3 1.1.2 0 0-2.3 1-6-0.3-.6-.2-.3-.5.5-.4zM8.3 15.6s-1.3.7-.1.9c1.7.3 4.2.4 6.7-.4 0 0 .3.4 1 .3 0 0-3.3 1.3-8.4-.4-.7-.2-.2-.5.8-.4z" />
        <path d="M12.9 12.8c1.3 1.4-.4 2.7-.4 2.7s2.5-1.3 1.3-3c-1.1-1.6-2.1-2.4 2.8-5.5 0 0-6.9 1.8-3.7 5.8z" />
      </svg>
    );
  }

  // Default fallback code icon
  return (
    <div className={`rounded flex items-center justify-center bg-[#E8E2D7] text-[#4A4036] font-mono text-[10px] font-bold ${className}`}>
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
};
