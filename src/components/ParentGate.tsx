import { useState, type FormEvent } from "react";
import { LockKeyhole, ShieldCheck, X } from "lucide-react";
import type { AppServices } from "../services";

interface ParentGateProps {
  services: AppServices;
  onUnlock: () => void;
  onClose: () => void;
}

export function ParentGate({ services, onUnlock, onClose }: ParentGateProps) {
  const setup = !services.parentSettings.hasPin();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (setup) {
      const validationError = services.parentSettings.validatePin(pin);
      if (validationError) return setError(validationError);
      if (pin !== confirmPin) return setError("Those PINs do not match.");
      await services.parentSettings.setPin(pin);
      onUnlock();
      return;
    }
    if (await services.parentSettings.verifyPin(pin)) onUnlock();
    else setError("That PIN wasn’t recognized. Please try again.");
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="parent-gate" role="dialog" aria-modal="true" aria-labelledby="parent-gate-title">
        <button className="close-button" type="button" onClick={onClose} aria-label="Close Parent Mode"><X /></button>
        <div className="gate-icon"><ShieldCheck aria-hidden="true" /></div>
        <span className="eyebrow">PARENT MODE</span>
        <h2 id="parent-gate-title">{setup ? "Create your parent PIN" : "Parents only"}</h2>
        <p>{setup ? "This PIN keeps learner settings private. Choose 4–8 numbers you’ll remember." : "Enter your PIN to manage learners and private settings."}</p>
        <form onSubmit={submit}>
          <label htmlFor="parent-pin">{setup ? "New parent PIN" : "Parent PIN"}</label>
          <div className="input-with-icon"><LockKeyhole aria-hidden="true" /><input id="parent-pin" type="password" inputMode="numeric" pattern="[0-9]*" maxLength={8} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} autoFocus /></div>
          {setup && <><label htmlFor="confirm-parent-pin">Confirm PIN</label><div className="input-with-icon"><LockKeyhole aria-hidden="true" /><input id="confirm-parent-pin" type="password" inputMode="numeric" pattern="[0-9]*" maxLength={8} value={confirmPin} onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, ""))} /></div></>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button full" type="submit">{setup ? "Create PIN & continue" : "Unlock Parent Mode"}</button>
        </form>
        <small>Your PIN stays on this computer and is never included in exports.</small>
      </section>
    </div>
  );
}
