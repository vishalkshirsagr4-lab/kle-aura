import { useEffect, useState } from "react";
import { ArrowRight as FaArrowRight, Menu, X } from "lucide-react";

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
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-[900] border-b border-border bg-surface/95 pt-[env(safe-area-inset-top,0px)] shadow-sm backdrop-blur transition-transform duration-300 ${show ? "translate-y-0" : "-translate-y-[110%]"}`}
      aria-label="Sections"
    >
      <div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transition-[width]"
        style={{ width: `${pct}%` }}
      />
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center gap-2 px-3 py-2 sm:px-4 md:flex-nowrap md:gap-3">
        <a
          className="shrink-0 whitespace-nowrap text-sm font-bold text-foreground no-underline sm:text-base"
          href="#top"
          onClick={() => setMenuOpen(false)}
        >
          AI-AURA <b className="text-primary">2K26</b>
        </a>
        <div className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] md:flex">
          {LINKS.map((l) => (
            <a
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-muted no-underline transition hover:bg-primary/5 hover:text-primary"
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <a
            className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white no-underline shadow-sm transition hover:bg-indigo-700 sm:gap-2 sm:px-4 sm:text-sm"
            href="#register"
            onClick={() => setMenuOpen(false)}
          >
            Register <FaArrowRight />
          </a>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl border border-border bg-surface text-foreground transition hover:border-primary/40 hover:bg-primary/5 md:hidden"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
        {menuOpen && (
          <div
            id="mobile-navigation"
            className="grid basis-full gap-1 border-t border-border pt-2 md:hidden"
          >
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-foreground no-underline transition hover:bg-primary/5 hover:text-primary"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

export default StickyNav;
