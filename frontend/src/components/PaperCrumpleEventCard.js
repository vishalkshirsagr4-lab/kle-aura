import EventCard from "./events/EventCard";

export default function PaperCrumpleEventCard({
  ev,
  rule,
  hit,
  dimmed,
  mode,
  onOpen,
  onRegister,
  onFail,
}) {
  return (
    <EventCard
      event={ev}
      rule={rule}
      hit={hit}
      dimmed={dimmed}
      mode={mode}
      onViewRules={onOpen}
      onRegister={onRegister}
      onFail={onFail}
    />
  );
}
