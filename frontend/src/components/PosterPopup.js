import { useState, useEffect, useRef } from "react";
import { X as FaXmark, ArrowRight as FaArrowRight } from "lucide-react";

// ---- Change these numbers (in seconds) ----
const FIRST_DELAY = 3; // first time the poster appears after the page opens
const SHOW_FOR = 12; // how long it stays before hiding itself
const REPEAT_EVERY = 40; // seconds before it appears again after hiding

function PosterPopup() {
  const [open, setOpen] = useState(false);
  const stopped = useRef(false); // true once the student clicks Register

  useEffect(() => {
    let timer;
    const schedule = (secs) => {
      timer = setTimeout(() => {
        if (stopped.current) return;
        setOpen(true);
      }, secs * 1000);
    };
    schedule(FIRST_DELAY);
    return () => clearTimeout(timer);
  }, []);

  // when shown: auto-hide after SHOW_FOR, then come back after REPEAT_EVERY
  useEffect(() => {
    if (!open) return undefined;
    const hide = setTimeout(() => setOpen(false), SHOW_FOR * 1000);
    return () => clearTimeout(hide);
  }, [open]);

  useEffect(() => {
    if (open || stopped.current) return undefined;
    // only schedule a repeat after the first showing has happened
    if (!PosterPopup.shown) return undefined;
    const again = setTimeout(
      () => !stopped.current && setOpen(true),
      REPEAT_EVERY * 1000,
    );
    return () => clearTimeout(again);
  }, [open]);

  useEffect(() => {
    if (open) PosterPopup.shown = true;
  }, [open]);

  if (!open) return null;

  const register = () => {
    stopped.current = true;
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-obsidian/75 p-4"
      role="dialog"
      aria-label="AI-AURA 2K26 poster"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-[min(94vw,760px)] overflow-hidden rounded-2xl bg-obsidian shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-black/60 text-white hover:bg-accent"
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
          className="mx-auto my-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-cyan to-[#9db4ff] px-6 py-3 font-extrabold text-obsidian"
          href="#register"
          onClick={register}
        >
          Register now <FaArrowRight />
        </a>
        <div
          className="absolute inset-x-0 bottom-0 h-1 origin-left animate-poster-bar bg-gradient-to-r from-amber-400 to-cyan"
          style={{ animationDuration: `${SHOW_FOR}s` }}
        />
      </div>
    </div>
  );
}

export default PosterPopup;
