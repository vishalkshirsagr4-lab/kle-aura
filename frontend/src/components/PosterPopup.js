import { useState, useEffect } from "react";
import { X as FaXmark, ArrowRight as FaArrowRight } from "lucide-react";

function PosterPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openPoster = () => setOpen(true);
    window.addEventListener("aura:open-poster", openPoster);
    return () => window.removeEventListener("aura:open-poster", openPoster);
  }, []);

  // Auto-show like an ad every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setOpen(true);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-obsidian/75 p-4"
      role="presentation"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-[min(94vw,760px)] overflow-hidden rounded-2xl bg-obsidian shadow-2xl shadow-black/50"
        role="dialog"
        aria-modal="true"
        aria-label="AI-AURA 2K26 poster"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-black/60 text-white hover:bg-accent"
          aria-label="Close"
          onClick={() => setOpen(false)}
        >
          <FaXmark />
        </button>
        <img
          className="block max-h-[74vh] w-full object-contain"
          src="/images/gallery/ai-aura-poster.jpg"
          alt="AI-AURA 2K26 – A Talent Hunt for PU Students"
        />
        <a
          className="mx-auto my-3 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-primary transition hover:bg-indigo-50"
          href="#register"
          onClick={() => setOpen(false)}
        >
          Register now <FaArrowRight />
        </a>
      </div>
    </div>
  );
}

export default PosterPopup;
