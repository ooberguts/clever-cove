import { useMemo, useState, type FormEvent } from "react";
import { ArrowLeft, BookOpen, Check, Download, Hash, Pencil, Plus, Save, ShieldCheck, UserRound, UsersRound, X } from "lucide-react";
import { kindergartenLetters, kindergartenTrickyWordGroups } from "../content";
import { COUNTING_MAXIMUMS, type CountingMaximum, GRADES, type Grade, type LearnerProfile, type TrickyWordGroup } from "../domain/models";
import type { AppServices } from "../services";
import { UpdatePanel } from "./UpdatePanel";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editGrade, setEditGrade] = useState<Grade>("K");
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

  const selectLearner = (learnerId: string) => {
    setSelectedId(learnerId);
    setIsEditing(false);
    setMessage("");
    setError("");
  };

  const beginEditing = () => {
    if (!selected) return;
    setEditName(selected.displayName);
    setEditGrade(selected.grade);
    setIsEditing(true);
    setMessage("");
    setError("");
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setMessage("");
    setError("");
  };

  const saveLearner = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!selected) return;
    try {
      await services.profiles.update(selected.id, editName, editGrade);
      setIsEditing(false);
      setMessage(`${editName.trim()}’s profile was updated.`);
      onRefresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update learner.");
    }
  };

  const saveStudentId = async (event: FormEvent) => {
    event.preventDefault(); setError(""); setMessage("");
    if (!selected) return;
    try {
      await services.privateValues.set(selected.id, "private.student_id", studentId);
      setStudentId(""); setMessage("Student ID saved locally. Guided practice is now unlocked."); onRefresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save Student ID."); }
  };

  const saveCountingMaximum = async (maximum: CountingMaximum) => {
    if (!selected) return;
    setError(""); setMessage("");
    try {
      await services.learningPreferences.setCountingMaximum(selected.id, maximum);
      setMessage(`Counting practice now goes to ${maximum}.`);
      onRefresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not update counting practice."); }
  };

  const toggleLetterFocus = async (letterId: string) => {
    if (!selected) return;
    const current = services.learningPreferences.get(selected.id).letterFocusIds;
    const next = current.includes(letterId) ? current.filter((id) => id !== letterId) : [...current, letterId];
    setError(""); setMessage("");
    try {
      await services.learningPreferences.setLetterFocusIds(selected.id, next);
      setMessage(next.length ? `${next.length} focus letter${next.length === 1 ? "" : "s"} selected.` : "Letter practice will use all A–Z.");
      onRefresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not update focus letters."); }
  };

  const clearLetterFocus = async () => {
    if (!selected) return;
    await services.learningPreferences.setLetterFocusIds(selected.id, []);
    setMessage("Letter practice will use all A–Z.");
    setError("");
    onRefresh();
  };

  const saveWordGroup = async (group: TrickyWordGroup) => {
    if (!selected) return;
    setError(""); setMessage("");
    try {
      await services.learningPreferences.setTrickyWordGroup(selected.id, group);
      const label = group === "all" ? "all four terms" : kindergartenTrickyWordGroups.find((item) => item.id === group)?.label ?? group;
      setMessage(`Tricky Word Match will use ${label}.`);
      onRefresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not update the word group."); }
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
          {learners.map((learner) => <button type="button" className={selectedId === learner.id ? "active" : ""} onClick={() => selectLearner(learner.id)} key={learner.id}><span className="avatar-small">{learner.displayName[0].toUpperCase()}</span><span><strong>{learner.displayName}</strong><small>Grade {learner.grade}</small></span></button>)}
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
              <div className="settings-title">
                <div className="avatar-large">{selected.displayName[0].toUpperCase()}</div>
                <div className="settings-title-copy"><span className="eyebrow">LEARNER SETTINGS</span><h2>{selected.displayName}</h2><p>Grade {selected.grade}</p></div>
                {!isEditing && <button className="secondary-button edit-learner-button" type="button" onClick={beginEditing}><Pencil /> Edit learner</button>}
              </div>
              {isEditing && (
                <article className="setting-card learner-edit-card">
                  <div className="setting-card-heading"><div className="setting-icon"><Pencil /></div><div><h3>Edit learner</h3><p>Update the name and grade shown on this computer.</p></div></div>
                  <form className="learner-edit-form" onSubmit={saveLearner}>
                    <div>
                      <label htmlFor="edit-learner-name">Display name</label>
                      <input id="edit-learner-name" value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={30} autoFocus />
                    </div>
                    <div>
                      <label htmlFor="edit-learner-grade">School grade</label>
                      <select id="edit-learner-grade" value={editGrade} onChange={(event) => setEditGrade(event.target.value as Grade)}>{GRADES.map((item) => <option key={item}>{item}</option>)}</select>
                    </div>
                    <div className="learner-edit-actions">
                      <button className="secondary-button" type="button" onClick={cancelEditing}><X /> Cancel</button>
                      <button className="primary-button" type="submit"><Save /> Save changes</button>
                    </div>
                  </form>
                </article>
              )}
              <article className="setting-card learning-settings-card">
                <div className="setting-card-heading"><div className="setting-icon warm"><BookOpen /></div><div><h3>Kindergarten learning pack</h3><p>Choose what {selected.displayName} is practicing right now.</p></div></div>
                <div className="learning-setting-row">
                  <div className="learning-setting-copy"><Hash /><span><strong>Counting range</strong><small>Default is 1–25.</small></span></div>
                  <label className="sr-only" htmlFor="counting-maximum">Counting practice maximum</label>
                  <select id="counting-maximum" value={selected.preferences.countingMaximum} onChange={(event) => void saveCountingMaximum(Number(event.target.value) as CountingMaximum)}>
                    {COUNTING_MAXIMUMS.map((maximum) => <option key={maximum} value={maximum}>1–{maximum}</option>)}
                  </select>
                </div>
                <div className="learning-setting-block">
                  <div className="learning-setting-heading"><span><strong>Letter focus</strong><small>Optional. With none selected, the game uses all A–Z.</small></span><button className="text-button" type="button" onClick={() => void clearLetterFocus()}>Use all A–Z</button></div>
                  <div className="letter-focus-grid" aria-label="Letter focus choices">
                    {kindergartenLetters.map((letter) => {
                      const active = selected.preferences.letterFocusIds.includes(letter.id);
                      return <button key={letter.id} type="button" className={active ? "active" : ""} aria-pressed={active} aria-label={`${active ? "Remove" : "Add"} letter ${letter.uppercase}`} onClick={() => void toggleLetterFocus(letter.id)}>{letter.uppercase}</button>;
                    })}
                  </div>
                </div>
                <div className="learning-setting-row">
                  <div className="learning-setting-copy"><BookOpen /><span><strong>Tricky words</strong><small>Choose one term or mix them all.</small></span></div>
                  <label className="sr-only" htmlFor="tricky-word-group">Tricky word group</label>
                  <select id="tricky-word-group" value={selected.preferences.trickyWordGroup} onChange={(event) => void saveWordGroup(event.target.value as TrickyWordGroup)}>
                    <option value="all">All terms</option>
                    {kindergartenTrickyWordGroups.map((group) => <option key={group.id} value={group.id}>{group.label}</option>)}
                  </select>
                </div>
              </article>
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
            </>
          ) : <div className="no-selection"><UserRound /><h2>Add your first learner</h2><p>Use the form on the left to create a profile.</p></div>}
          <UpdatePanel updates={services.updates} />
        </section>
      </div>
    </main>
  );
}
