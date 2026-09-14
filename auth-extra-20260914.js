(() => {
  "use strict";

  // Política complementar compartilhada entre CATS Pouso Alegre, Podcast Ampulheta e Aulas ATS.
  // Credenciais são normalizadas para 7 dígitos e comparadas apenas por SHA-256.
  const ALLOW_HASHES_B64 = new Set([
    "X2qPg2at3jkx1rMvjQNqeyn82Pk6CWEJKKRW8uMsdBA=",
    "9bt4rm+QAZ10OtlZ8q1Mjcb6uRoBIqOvHGfKOAIA6T0=",
    "SMB/KQPrngwRR40XuMqkV+hJ52Z/WSOXmGEm9E4j2vo="
  ]);

  const REVOKED_HASHES_B64 = new Set([
    "XVfHxER1nHJnzXdbbVihZgM095MKRsppN2MymY9YwRs=",
    "M1ewcn4KoJX7mO9uiiDeej5QMYfJoTsVnDysHUH33M4=",
    "m9ASPEckCxU3bEDbwwZukkSsgjMocMw+6gvCnPGfkiw="
  ]);

  const SESSION_KEY = "curso_ats_auth_v3";
  const FORM_ID = "catsAuthForm";
  const INPUT_ID = "catsAuthInput";
  const GATE_ID = "catsAuthGate";
  const BYPASS_ATTR = "data-auth-policy-20260914-bypass";

  const normalize = value => String(value || "").replace(/\D+/g, "");

  async function digestB64(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
    let binary = "";
    for (const byte of digest) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  function showMessage(tone, text) {
    const box = document.getElementById("catsAuthMessage");
    const label = document.getElementById("catsAuthMessageText");
    if (!box || !label) return;
    box.classList.add("is-visible");
    box.dataset.tone = tone;
    label.textContent = text;
  }

  function saveSession() {
    const createdAt = Date.now();
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        authenticated: true,
        createdAt,
        expiresAt: createdAt + 8 * 60 * 60 * 1000,
        version: 3
      }));
    } catch {}
  }

  function unlock(gate) {
    saveSession();
    showMessage("success", "Acesso autorizado. Abrindo o ambiente.");
    if (gate) gate.hidden = true;
    document.documentElement.classList.remove("cats-auth-locked");
    const logout = document.getElementById("catsAuthLogout");
    if (logout) logout.hidden = false;
    window.dispatchEvent(new CustomEvent("cats:authenticated", { detail: { source: "shared-policy-20260914" } }));
  }

  async function intercept(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== FORM_ID) return;

    if (form.getAttribute(BYPASS_ATTR) === "1") {
      form.removeAttribute(BYPASS_ATTR);
      return;
    }

    const input = document.getElementById(INPUT_ID);
    const credential = normalize(input?.value);
    if (!credential) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    try {
      const hash = await digestB64(credential);

      if (REVOKED_HASHES_B64.has(hash)) {
        showMessage("error", "Credencial não autorizada.");
        if (input) {
          input.value = "";
          input.focus();
        }
        return;
      }

      if (credential.length === 7 && ALLOW_HASHES_B64.has(hash)) {
        unlock(document.getElementById(GATE_ID));
        return;
      }
    } catch {}

    form.setAttribute(BYPASS_ATTR, "1");
    form.requestSubmit();
  }

  document.addEventListener("submit", intercept, true);
})();
