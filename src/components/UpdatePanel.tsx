import { useState } from "react";
import { CheckCircle2, Download, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import type { UpdateService, UpdateStatus } from "../services/updateService";

type AvailableUpdate = Extract<UpdateStatus, { state: "available" }>;
type UpdatePhase = "idle" | "checking" | "current" | "available" | "installing" | "web-preview" | "error";

export function UpdatePanel({ updates }: { updates: UpdateService }) {
  const [phase, setPhase] = useState<UpdatePhase>("idle");
  const [available, setAvailable] = useState<AvailableUpdate | null>(null);
  const [error, setError] = useState("");

  const checkForUpdates = async () => {
    setPhase("checking");
    setAvailable(null);
    setError("");
    try {
      const result = await updates.check();
      if (result.state === "available") {
        setAvailable(result);
        setPhase("available");
      } else {
        setPhase(result.state);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The update service could not be reached.");
      setPhase("error");
    }
  };

  const installUpdate = async () => {
    if (!available) return;
    setPhase("installing");
    setError("");
    try {
      await available.install();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The update could not be installed.");
      setPhase("error");
    }
  };

  return (
    <article className="setting-card update-card">
      <div className="setting-card-heading">
        <div className="setting-icon update-icon"><RefreshCw /></div>
        <div>
          <h3>App updates</h3>
          <p>CleverCove {updates.currentVersion()} · Updates work on macOS and Windows.</p>
        </div>
      </div>

      <div className={`update-status ${phase === "error" ? "error" : phase}`} aria-live="polite">
        {phase === "idle" && <><ShieldCheck /><span><strong>Secure updates</strong><small>Only updates signed by CleverCove can be installed.</small></span></>}
        {phase === "checking" && <><LoaderCircle className="spin" /><span><strong>Checking for updates…</strong><small>This usually takes just a moment.</small></span></>}
        {phase === "current" && <><CheckCircle2 /><span><strong>CleverCove is up to date.</strong><small>You have the newest available version.</small></span></>}
        {phase === "available" && available && <><Download /><span><strong>CleverCove {available.version} is ready.</strong><small>Install it now, then CleverCove will restart.</small></span></>}
        {phase === "installing" && <><LoaderCircle className="spin" /><span><strong>Installing the update…</strong><small>Keep CleverCove open. It will restart when finished.</small></span></>}
        {phase === "web-preview" && <><InfoIcon /><span><strong>Open the installed CleverCove app to check.</strong><small>Updates are unavailable in a browser preview.</small></span></>}
        {phase === "error" && <><InfoIcon /><span><strong>Couldn’t check for updates.</strong><small>{error} Check the internet connection and try again.</small></span></>}
      </div>

      <div className="update-actions">
        {phase === "available" ? (
          <button className="primary-button" type="button" onClick={() => void installUpdate()}><Download /> Install and restart</button>
        ) : (
          <button className="secondary-button" type="button" disabled={phase === "checking" || phase === "installing"} onClick={() => void checkForUpdates()}><RefreshCw /> {phase === "checking" ? "Checking…" : "Check for updates"}</button>
        )}
      </div>
    </article>
  );
}

function InfoIcon() {
  return <span className="update-info-icon" aria-hidden="true">i</span>;
}
