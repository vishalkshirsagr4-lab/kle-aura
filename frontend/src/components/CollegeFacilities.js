import { GraduationCap as FaGraduationCap } from "lucide-react";
import { FACILITIES } from "../data/college";

function CollegeFacilities() {
  return (
    <section className="mb-14">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="flex items-center gap-2 border-l-[6px] border-accent pl-4 text-2xl font-extrabold sm:text-3xl">
          <FaGraduationCap className="text-accent" /> LIFE AT KLE BCA & BBA
        </h2>
        <p className="text-sm text-muted">
          What our students get beyond the classroom
        </p>
      </div>

      <div className="mb-6 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
        {FACILITIES.map(({ id, Icon, title, text }) => (
          <article
            className="tilt rounded-2xl border border-border bg-surface p-5 shadow-lg shadow-black/5 transition duration-300 hover:-translate-y-1.5 hover:border-accent [transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] [transform-style:preserve-3d]"
            key={id}
          >
            <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-primary text-xl text-white shadow-lg shadow-accent/30">
              <Icon />
            </div>
            <h3 className="mb-1 text-lg font-bold">{title}</h3>
            <p className="text-sm font-medium text-muted">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default CollegeFacilities;
