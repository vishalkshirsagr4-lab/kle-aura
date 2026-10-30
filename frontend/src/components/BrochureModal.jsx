import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  Download,
  ExternalLink,
  X,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { PDF_URL, DRIVE_URL, DRIVE_PREVIEW_URL } from "../data/rules";

export default function BrochureModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("aura:open-brochure", handleOpen);
    return () => window.removeEventListener("aura:open-brochure", handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/85 p-2 sm:p-4 md:p-6 backdrop-blur-md"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="AI-AURA 2K26 Brochure Viewer"
    >
      <div
        className={`relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-400/40 bg-slate-950 shadow-2xl transition-all duration-300 ${
          isFullscreen
            ? "h-full w-full max-w-none"
            : "h-[92vh] w-full max-w-5xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/90 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="grid size-9 sm:size-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <FileText className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  Official PDF
                </span>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                  AI-AURA 2K26
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                Event Brochure &amp; Rules Guide
              </h3>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2">
            {/* Direct Download Button */}
            <a
              href={PDF_URL}
              download="AI-AURA-2K26-Rules-and-Regulations.pdf"
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-3 text-xs font-black text-slate-950 shadow-md hover:opacity-95 active:scale-95 transition"
              title="Download brochure PDF locally"
            >
              <Download className="size-3.5" />
              <span>Download PDF</span>
            </a>

            {/* Open in Google Drive */}
            <a
              href={DRIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/20 bg-slate-800 px-3 text-xs font-bold text-white hover:bg-slate-700 transition"
              title="Open brochure on Google Drive"
            >
              <ExternalLink className="size-3.5" />
              <span>Drive</span>
            </a>

            {/* Toggle Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen((f) => !f)}
              className="hidden md:grid size-9 place-items-center rounded-xl border border-white/20 bg-slate-800 text-slate-300 hover:text-white transition"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              <Maximize2 className="size-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid size-9 place-items-center rounded-xl border border-white/20 bg-slate-800 text-slate-300 hover:bg-rose-500 hover:text-white transition"
              aria-label="Close modal"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Embedded PDF & Drive Preview */}
        <div className="relative flex-1 w-full bg-slate-900 overflow-hidden">
          <iframe
            src={DRIVE_PREVIEW_URL}
            title="AI-AURA 2K26 Event Brochure"
            className="size-full border-0"
            allow="autoplay"
          />
        </div>

        {/* Modal Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-950 px-4 py-2 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3 text-amber-400" />
            <span>KLE Society&apos;s BCA &amp; BBA College, Mahalingpur</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={DRIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              Open direct Drive link
            </a>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-bold text-slate-300 hover:text-white"
            >
              Close Viewer
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
