/**
 * PDF Name Extractor
 *
 * Extracts the candidate's name from page 1 of a resume PDF using pdfjs-dist.
 * Uses font size / positional heuristics and common resume patterns.
 * Falls back to clean filename heuristics if text parsing fails or is image-based.
 */

export async function extractCandidateNameFromPdf(file: File): Promise<string | null> {
  try {
    const pdfjs = await import("pdfjs-dist");

    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    if (pdf.numPages >= 1) {
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();

      interface LineGroup {
        y: number;
        text: string;
      }

      const lines: LineGroup[] = [];

      for (const item of textContent.items) {
        if (!("str" in item) || typeof item.str !== "string") continue;
        const str = item.str.trim();
        if (!str) continue;

        const transform = "transform" in item && Array.isArray(item.transform) ? item.transform : [1, 0, 0, 1, 0, 0];
        const y = Math.round(Number(transform[5]) || 0);

        // Find existing line within 4px Y distance
        const existingLine = lines.find((l) => Math.abs(l.y - y) <= 4);
        if (existingLine) {
          existingLine.text += (existingLine.text ? " " : "") + str;
        } else {
          lines.push({ y, text: str });
        }
      }

      // Sort lines by Y descending (PDF coordinates: higher Y = top of the page)
      lines.sort((a, b) => b.y - a.y);

      // Noise words to reject
      const rejectPattern = /\b(resume|curriculum|vitae|cv|profile|contact|email|phone|objective|education|experience|skills|github|linkedin|leetcode|portfolio|http|https|www|page|address|summary)\b/i;
      const contactPattern = /(@|\+|\.com|\.org|\.io|\.edu|\d{4,})/;

      for (const line of lines.slice(0, 8)) {
        const text = line.text.trim();
        if (!text || text.length < 2 || text.length > 50) continue;
        if (rejectPattern.test(text)) continue;
        if (contactPattern.test(text)) continue;

        // Clean punctuation
        const cleaned = text.replace(/^[•\-*|:]+/, "").replace(/[|:;]+$/, "").trim();

        // A valid name consists of 2 to 4 words, each starting with an uppercase letter
        // e.g. "Alex Rivera", "Maya Lin", "John M. Doe", "Samir Khan"
        const nameRegex = /^[A-Z][a-zA-Z'.]+(?:\s+[A-Z][a-zA-Z'.]+){1,3}$/;
        if (nameRegex.test(cleaned)) {
          return cleaned;
        }

        // Also check if line contains title case name followed by role/tags e.g. "Alex Rivera - Software Engineer"
        const splitMatch = cleaned.split(/[-–|•,]/)[0].trim();
        if (nameRegex.test(splitMatch)) {
          return splitMatch;
        }
      }
    }
  } catch (error) {
    console.warn("PDF name extraction failed, falling back to filename:", error);
  }

  // Fallback: Extract from filename
  // e.g. "Alex_Rivera_Resume.pdf" -> "Alex Rivera"
  // "John-Doe-CV.pdf" -> "John Doe"
  const cleanBase = file.name
    .replace(/\.[^/.]+$/, "") // strip extension
    .replace(/[-_]/g, " ") // replace underscores and hyphens with spaces
    .replace(/\b(resume|cv|curriculum|vitae|profile|final|updated|202[0-9]|draft)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (cleanBase && cleanBase.length >= 3 && cleanBase.length <= 40) {
    // Format to Title Case
    const titleCased = cleanBase
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

    if (/^[A-Z][a-zA-Z'.]+(?:\s+[A-Z][a-zA-Z'.]+){1,3}$/.test(titleCased)) {
      return titleCased;
    }
  }

  return null;
}

export interface ExtractedPdfProfile {
  name: string | null;
  githubUrl: string | null;
  leetcodeUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
}

export async function extractResumeMetadataFromPdf(file: File): Promise<ExtractedPdfProfile> {
  let name = await extractCandidateNameFromPdf(file);
  let githubUrl: string | null = null;
  let leetcodeUrl: string | null = null;
  let linkedinUrl: string | null = null;
  let portfolioUrl: string | null = null;

  try {
    const pdfjs = await import("pdfjs-dist");
    if (!pdfjs.GlobalWorkerOptions.workerSrc) {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

    if (pdf.numPages >= 1) {
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      const allText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");

      // Regex for profiles
      const ghMatch = allText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
      if (ghMatch) githubUrl = `https://github.com/${ghMatch[1]}`;

      const lcMatch = allText.match(/(?:https?:\/\/)?(?:www\.)?leetcode\.com\/(?:u\/)?([a-zA-Z0-9_-]+)/i);
      if (lcMatch) leetcodeUrl = `https://leetcode.com/u/${lcMatch[1]}`;

      const liMatch = allText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
      if (liMatch) linkedinUrl = `https://linkedin.com/in/${liMatch[1]}`;

      // Portfolio match e.g. https://...dev, .me, .tech, .io, .site, .app (not github/linkedin/leetcode)
      const portMatch = allText.match(/https?:\/\/([a-zA-Z0-9.-]+\.(?:dev|me|tech|io|site|app|portfolio|live|work))(?:\/[^\s,]*)?/i);
      if (portMatch && !portMatch[0].includes("github.com") && !portMatch[0].includes("linkedin.com") && !portMatch[0].includes("leetcode.com")) {
        portfolioUrl = portMatch[0];
      }
    }
  } catch (err) {
    console.warn("Could not extract links from PDF:", err);
  }

  return {
    name,
    githubUrl,
    leetcodeUrl,
    linkedinUrl,
    portfolioUrl,
  };
}
