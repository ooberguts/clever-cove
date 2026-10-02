import { useEffect, useMemo, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { ChildDashboard } from "./components/ChildDashboard";
import { EmptyState } from "./components/EmptyState";
import { Logo } from "./components/Logo";
import { ParentGate } from "./components/ParentGate";
import { ParentMode } from "./components/ParentMode";
import type { LearnerProfile } from "./domain/models";
import { StudentIdGame } from "./games/student-id/StudentIdGame";
import { STUDENT_ID_GAME_ID } from "./games/student-id/manifest";
import { createServices } from "./services";
import "./styles.css";

type View = "dashboard" | "parent" | "student-id";

export default function App() {
  const services = useMemo(() => createServices(), []);
  const [ready, setReady] = useState(false);
  const [learners, setLearners] = useState<LearnerProfile[]>([]);
  const [activeLearnerId, setActiveLearnerId] = useState("");
  const [view, setView] = useState<View>("dashboard");
  const [showParentGate, setShowParentGate] = useState(false);

  const refresh = () => {
    const next = services.profiles.list();
    setLearners(next);
    setActiveLearnerId((current) => next.some((learner) => learner.id === current) ? current : (next[0]?.id ?? ""));
  };

  useEffect(() => {
    void services.appData.initialize().then(() => { refresh(); setReady(true); });
    // Services are stable for the life of the app.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services]);

  const activeLearner = learners.find((learner) => learner.id === activeLearnerId);
  const requestParentMode = () => setShowParentGate(true);

  if (!ready) return <div className="app-loading"><Logo /><div className="loading-dots"><i /><i /><i /></div></div>;
  if (view === "student-id" && activeLearner) return <StudentIdGame learner={activeLearner} services={services} onExit={() => { refresh(); setView("dashboard"); }} />;
  if (view === "parent") return <ParentMode services={services} learners={learners} onRefresh={refresh} onExit={() => { refresh(); setView("dashboard"); }} />;

  return (
    <div className="app-shell">
      <header className="topbar"><Logo /><button className="parent-button" type="button" onClick={requestParentMode}><ShieldCheck aria-hidden="true" /> Parent Mode</button></header>
      {learners.length === 0 ? <EmptyState onParentMode={requestParentMode} /> : <ChildDashboard learners={learners} activeLearnerId={activeLearnerId} services={services} onSelectLearner={setActiveLearnerId} onLaunch={(gameId) => { if (gameId === STUDENT_ID_GAME_ID) setView("student-id"); }} />}
      <footer><span>Learning stays here.</span><span className="footer-dot">•</span><span>Private by design.</span></footer>
      {showParentGate && <ParentGate services={services} onClose={() => setShowParentGate(false)} onUnlock={() => { setShowParentGate(false); setView("parent"); }} />}
    </div>
  );
}
