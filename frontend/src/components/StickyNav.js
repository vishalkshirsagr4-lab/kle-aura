import { useEffect, useState } from "react";
import { ArrowRight as FaArrowRight } from "lucide-react";

const LINKS = [
  { href: "#events", label: "Events" },
  { href: "#rules", label: "Rules" },
  { href: "#college", label: "Our College" },
  { href: "#seminars", label: "Seminars" },
];

// Appears after the hero, shows reading progress and a always-visible Register button
function StickyNav() {
  const [show, setShow] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      setShow(window.scrollY > 420);
      setPct(
        (window.scrollY / Math.max(1, h.scrollHeight - h.clientHeight)) * 100,
      );
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[900] bg-slate-900/90 pt-[env(safe-area-inset-top,0px)] shadow-xl shadow-black/30 backdrop-blur transition-transform duration-300 ${show ? "translate-y-0" : "-translate-y-[110%]"}`}
      aria-label="Sections"
    >
      <div
        className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-amber-400 via-cyan to-accent"
        style={{ width: `${pct}%` }}
      />
      <div className="mx-auto flex max-w-[1180px] items-center gap-3 px-4 py-2">
        <a
          className="hidden whitespace-nowrap font-extrabold text-white no-underline sm:block"
          href="#top"
        >
          AI-AURA <b className="text-amber-400">2K26</b>
        </a>
        <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto [scrollbar-width:none]">
          {LINKS.map((l) => (
            <a
              className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-white/80 no-underline hover:bg-white/15 hover:text-white"
              key={l.href}
              href={l.href}
            >
              {l.label}
            </a>
          ))}
        </div>
        <a
          className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-br from-accent to-cyan px-4 py-2 font-bold text-white no-underline shadow-lg shadow-cyan/30"
          href="#register"
        >
          Register <FaArrowRight />
        </a>
      </div>
    </nav>
  );
}

export default StickyNav;
