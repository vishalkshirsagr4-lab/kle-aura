import { useRef, useEffect } from "react";
import { MousePointerClick as FaHandPointer } from "lucide-react";
import { createCampusScene } from "../scenes3d";

// Real WebGL 3D view of the college photo. Calls onFail() if WebGL or the photo is unavailable.
function Campus3D({ onFail }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const dispose = createCampusScene(
      canvasRef.current,
      "/images/campus.jpg",
      (ok) => {
        if (!ok && onFail) onFail();
      },
    );
    if (!dispose && onFail) onFail();
    return () => {
      if (dispose) dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative m-4 aspect-[4/3] touch-pan-y overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_50%_35%,#4f7cff,#0b0d12_75%)] shadow-[0_30px_60px_rgba(79,124,255,0.45)]">
      <canvas
        className="block size-full"
        ref={canvasRef}
        aria-label="3D view of the college campus"
      />
      <span className="pointer-events-none absolute left-1/2 top-4 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1 text-xs font-bold text-white">
        <FaHandPointer /> Drag to rotate
      </span>
    </div>
  );
}

export default Campus3D;
