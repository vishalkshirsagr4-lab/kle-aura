import { useRef, useState } from "react";
import {
  Landmark as FaBuildingColumns,
  ArrowRight as FaArrowRight,
  MapPin as FaLocationDot,
  Box as FaCube,
  Image as FaImage,
  ExternalLink as FaUpRightFromSquare,
} from "lucide-react";
import { COLLEGE } from "../data/college";
import SocialLinks from "./SocialLinks";
import Campus3D from "./Campus3D";

/* ---------- Drawn isometric campus (shows only if campus.jpg is missing) ---------- */
const S = 18;
const iso = (x, y, z) => [
  200 + (x - y) * S * 0.866,
  130 + (x + y) * S * 0.5 - z * S,
];
const pts = (list) =>
  list.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");

function Block({ x, y, z = 0, w, d, h, cols, rows }) {
  const top = [
    iso(x, y, z + h),
    iso(x + w, y, z + h),
    iso(x + w, y + d, z + h),
    iso(x, y + d, z + h),
  ];
  const left = [
    iso(x, y + d, z + h),
    iso(x + w, y + d, z + h),
    iso(x + w, y + d, z),
    iso(x, y + d, z),
  ];
  const right = [
    iso(x + w, y, z + h),
    iso(x + w, y + d, z + h),
    iso(x + w, y + d, z),
    iso(x + w, y, z),
  ];

  const windows = [];
  const win = (face, fn) => {
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const s0 = (i + 0.25) / cols,
          s1 = (i + 0.75) / cols;
        const t0 = (j + 0.28) / rows,
          t1 = (j + 0.72) / rows;
        windows.push(
          <polygon
            key={`${face}${i}-${j}`}
            points={pts([fn(s0, t0), fn(s1, t0), fn(s1, t1), fn(s0, t1)])}
            fill="#ffe9ae"
            opacity={(i + j) % 3 === 0 ? 0.55 : 0.9}
          />,
        );
      }
    }
  };
  win("l", (s, t) => iso(x + s * w, y + d, z + t * h));
  win("r", (s, t) => iso(x + w, y + d - s * d, z + t * h));

  return (
    <g>
      <polygon points={pts(left)} fill="#8b4fcf" />
      <polygon points={pts(right)} fill="#5a2a9e" />
      <polygon points={pts(top)} fill="#d9bfff" />
      {windows}
    </g>
  );
}

function Tree({ x, y }) {
  const [cx, cy] = iso(x, y, 0);
  return (
    <g>
      <rect x={cx - 1.5} y={cy - 8} width="3" height="9" fill="#5a2a9e" />
      <circle cx={cx} cy={cy - 14} r="9" fill="#7ad8a8" />
      <circle cx={cx - 4} cy={cy - 11} r="6" fill="#58c590" />
    </g>
  );
}

function CampusArt() {
  const ground = [iso(-6, -2, 0), iso(9, -2, 0), iso(9, 10, 0), iso(-6, 10, 0)];
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a0f4d" />
          <stop offset="1" stopColor="#7a3fc4" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#sky)" />
      <circle cx="330" cy="50" r="26" fill="#ffd9f6" opacity="0.85" />
      <polygon points={pts(ground)} fill="#a97bea" opacity="0.55" />
      <Block x={-4} y={1} w={4} d={3} h={3} cols={3} rows={3} />
      <Block x={0} y={0} w={6} d={4} h={4.5} cols={5} rows={4} />
      <Block
        x={2.4}
        y={0.9}
        z={4.5}
        w={1.3}
        d={1.3}
        h={2.4}
        cols={1}
        rows={3}
      />
      <Block x={2} y={4} w={3.5} d={3} h={3} cols={3} rows={3} />
      <Tree x={-5} y={5} />
      <Tree x={7} y={1} />
      <Tree x={-1} y={8} />
      <Tree x={6.5} y={7} />
    </svg>
  );
}

const Photo = () => (
  <img
    src="/images/campus.jpg"
    alt="KLE BCA & BBA College campus"
    className="absolute inset-0 size-full object-cover"
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
  />
);

/* ---------- Showcase: 3D tilt view + clear (normal) view ---------- */
const REST = { x: 8, y: -10 };

function CampusShowcase({ info }) {
  const stage = useRef(null);
  const [tilt, setTilt] = useState(REST);
  const [mode, setMode] = useState("3d"); // "3d" | "clear"
  const [webglFailed, setWebglFailed] = useState(false);

  const handleMove = (e) => {
    const r = stage.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 16, y: px * 18 });
  };

  return (
    <section className="mb-14 grid items-center gap-8 lg:grid-cols-[0.9fr_1.3fr]">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/10 px-3 py-1.5 text-sm font-bold text-accent">
          <FaBuildingColumns /> Our campus
        </span>
        <h2 className="mb-2 mt-3 bg-gradient-to-br from-primary to-accent bg-clip-text text-4xl font-extrabold leading-tight text-transparent sm:text-5xl">
          {COLLEGE.name}
        </h2>
        <p className="mb-4 flex items-center gap-2 font-bold text-accent">
          <FaLocationDot /> {COLLEGE.place}
        </p>
        <p className="font-medium text-muted">
          Where learning meets real-world skills: certificate courses, seminars,
          hackathon training and placement preparation. AI-AURA is our stage to
          showcase the talent of PUC students.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <a
            className="inline-flex items-center gap-3 rounded-full bg-gradient-to-br from-cyan to-[#9db4ff] px-7 py-3 font-extrabold text-obsidian shadow-lg shadow-primary/30 transition hover:-translate-y-1"
            href="#register"
          >
            Register now <FaArrowRight />
          </a>
          <SocialLinks info={info} />
        </div>
      </div>

      <div>
        <div className="mb-1 ml-4 inline-flex rounded-full border border-border bg-surface p-1">
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-bold ${mode === "3d" ? "bg-gradient-to-br from-primary to-accent text-white" : "text-muted"}`}
            onClick={() => setMode("3d")}
          >
            <FaCube /> 3D view
          </button>
          <button
            type="button"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-bold ${mode === "clear" ? "bg-gradient-to-br from-primary to-accent text-white" : "text-muted"}`}
            onClick={() => setMode("clear")}
          >
            <FaImage /> Clear view
          </button>
        </div>

        {mode === "3d" && !webglFailed ? (
          <Campus3D onFail={() => setWebglFailed(true)} />
        ) : mode === "3d" ? (
          <div
            className="touch-pan-y p-4 [perspective:1100px]"
            ref={stage}
            onPointerMove={handleMove}
            onPointerLeave={() => setTilt(REST)}
          >
            <div
              className="relative aspect-[766/400] [transform-style:preserve-3d] transition-transform duration-200"
              style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
              }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-br from-obsidian to-primary shadow-[0_40px_70px_rgba(79,124,255,0.45)]">
                <CampusArt />
                <Photo />
              </div>
              <div className="absolute -bottom-5 left-4 inline-flex max-w-[90%] items-center gap-2 rounded-full bg-white px-5 py-3 font-extrabold text-primary shadow-xl [transform:translateZ(70px)]">
                <FaBuildingColumns /> {COLLEGE.name}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4">
            <div className="relative aspect-[766/400] overflow-hidden rounded-2xl shadow-xl shadow-black/10">
              <CampusArt />
              <Photo />
            </div>
            <a
              className="mt-3 inline-flex items-center gap-2 font-bold text-accent hover:underline"
              href="/images/campus.jpg"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaUpRightFromSquare /> Open full photo
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export default CampusShowcase;
