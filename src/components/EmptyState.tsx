import { ShieldCheck, UserRoundPlus } from "lucide-react";

export function EmptyState({ onParentMode }: { onParentMode: () => void }) {
  return (
    <div className="empty-state">
      <div className="empty-illustration" aria-hidden="true">
        <div className="empty-orbit one" /><div className="empty-orbit two" />
        <UserRoundPlus />
      </div>
      <span className="eyebrow">LET’S GET STARTED</span>
      <h1>Make learning feel like play.</h1>
      <p>A parent can create the first learner profile and set up private practice values. Everything stays on this computer.</p>
      <button className="primary-button" onClick={onParentMode} type="button">
        <ShieldCheck aria-hidden="true" /> Set up Parent Mode
      </button>
    </div>
  );
}
