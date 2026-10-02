import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, Check, Download, Info, Plus, Save, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { GRADES, type Grade, type LearnerProfile } from "../domain/models";
import type { AppServices } from "../services";

interface ParentModeProps {
  services: AppServices;
  learners: LearnerProfile[];
  onRefresh: () => void;
  onExit: () => void;
}

export function ParentMode({ services, learners, onRefresh, onExit }: ParentModeProps) {
  const [selectedId, setSelectedId] = useState(learners[0]?.id ?? "");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState<Grade>("K");
  const [studentId, setStudentId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const selected = useMemo(() => learners.find((learner) => learner.id === selectedId), [learners, selectedId]);

  const addLearner = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setMessage("");
    try {
      const learner = await services.profiles.create(name, grade);
      setName(""); setGrade("K"); setSelectedId(learner.id); setMessage(`${learner.displayName} is ready to learn.`); onRefresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not add learner."); }
  };

  const saveStudentId = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setMessage("");
    if (!selected) return;
    try {
      await services.privateValues.set(selected.id, "private.student_id", studentId);
      setStudentId(""); setMessage("Student ID saved locally. Guided practice is now unlocked."); onRefresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save Student ID."); }
  };

  const downloadExport = () => {
    const data = JSON.stringify(services.anonymousExport.create(), null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url; link.download = `clever-cove-anonymous-export-${new Date().toISOString().slice(0, 10)}.json`; link.click();
    URL.revokeObjectURL(url); setMessage("Anonymous progress export created.");
  };

  return (
    <main className="parent-page">
      <header className="parent-header">
        <button className="back-link" type="button" onClick={onExit}><ArrowLeft /> Back to learner view</button>
        <div><span className="eyebrow">PRIVATE & LOCAL</span><h1>Parent Mode</h1><p>Manage learners and practice settings. These details stay on this computer.</p></div>
        <div className="privacy-seal"><ShieldCheck /><span><strong>Local only</strong><small>No cloud account</small></span></div>
      </header>

      {(message || error) && <div className={`notice ${error ? "error" : "ok"}`} role="status">{error || message}</div>}

      <div className="parent-layout">
        <aside className="parent-sidebar">
          <h2><UsersRound /> Learners</h2>
          {learners.map((learner) => <button type="button" className={selectedId === learner.id ? "active" : ""} onClick={() => { setSelectedId(learner.id); setMessage(""); setError(""); }} key={learner.id}><span className="avatar-small">{learner.displayName[0].toUpperCase()}</span><span><strong>{learner.displayName}</strong><small>Grade {learner.grade}</small></span></button>)}
          <form className="add-learner" onSubmit={addLearner}>
            <h3><Plus /> Add a learner</h3>
            <label htmlFor="new-name">Display name</label>
            <input id="new-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="First name" maxLength={30} />
            <label htmlFor="new-grade">School grade</label>
            <select id="new-grade" value={grade} onChange={(event) => setGrade(event.target.value as Grade)}>{GRADES.map((item) => <option key={item}>{item}</option>)}</select>
            <button className="secondary-button full" type="submit"><Plus /> Add learner</button>
          </form>
        </aside>

        <section className="settings-area">
          {selected ? (
            <>
              <div className="settings-title"><div className="avatar-large">{selected.displayName[0].toUpperCase()}</div><div><span className="eyebrow">LEARNER SETTINGS</span><h2>{selected.displayName}</h2><p>Grade {selected.grade}</p></div></div>
              <article className="setting-card">
                <div className="setting-card-heading"><div className="setting-icon"><UserRound /></div><div><h3>Student ID Practice</h3><p>Set the number {selected.displayName} practices entering at school.</p></div>{services.privateValues.isConfigured(selected.id, "private.student_id") && <span className="configured"><Check /> Configured</span>}</div>
                <div className="privacy-note"><ShieldCheck /><span><strong>Guided practice value</strong> — shown only inside this learner’s practice game. It is never added to progress history or anonymous exports.</span></div>
                <form className="setting-form" onSubmit={saveStudentId}>
                  <label htmlFor="student-id">Student ID</label>
                  <div className="setting-input-row"><input id="student-id" type="password" inputMode="numeric" pattern="[0-9]{1,12}" maxLength={12} placeholder={services.privateValues.isConfigured(selected.id, "private.student_id") ? "••••••  (saved)" : "1–12 numbers"} value={studentId} onChange={(event) => setStudentId(event.target.value.replace(/\D/g, ""))} /><button className="primary-button" type="submit"><Save /> {services.privateValues.isConfigured(selected.id, "private.student_id") ? "Replace" : "Save"}</button></div>
                  <small>The saved value is masked. Enter a new value anytime to replace it.</small>
                </form>
              </article>
              <article className="setting-card compact">
                <div className="setting-card-heading"><div className="setting-icon warm"><Download /></div><div><h3>Anonymous progress export</h3><p>Export safe learning totals without names, PINs, or entered digits.</p></div><button className="secondary-button" type="button" onClick={downloadExport}><Download /> Export JSON</button></div>
              </article>
              <article className="setting-card compact info-card"><Info /><p><strong>CleverCove 0.1.0</strong><br />Profiles and progress are stored in your operating system’s private app-data folder. App updates do not overwrite them.</p></article>
            </>
          ) : <div className="no-selection"><UserRound /><h2>Add your first learner</h2><p>Use the form on the left to create a profile.</p></div>}
        </section>
      </div>
    </main>
  );
}
