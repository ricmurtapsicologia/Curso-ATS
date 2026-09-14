(() => {
  "use strict";

  // Credencial complementar adicionada em 14/09/2026.
  // Somente o hash SHA-256 é publicado; a credencial em texto puro não é armazenada.
  const AUTH_HASH_B64 = "SMB/KQPrngwRR40XuMqkV+hJ52Z/WSOXmGEm9E4j2vo=";
  const SESSION_KEY = "curso_ats_auth_v3";
  const FORM_ID = "catsAuthForm";
  const INPUT_ID = "catsAuthInput";
  const GATE_ID = "catsAuthGate";
  const BYPASS_ATTR = "data-auth-extra-20260914-bypass";

  const normalize = value => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    return /^[\d.\-\s]+$/.test(raw) ? raw.replace(/\D+/g, "") : raw;
  };

  async function digestB64(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
    let binary = "";
    for (const byte of digest) binary += String.fromCharCode(byte);
    return btoa(binary);
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
    const box = document.getElementById("catsAuthMessage");
    const label = document.getElementById("catsAuthMessageText");
    if (box && label) {
      box.classList.add("is-visible");
      box.dataset.tone = "success";
      label.textContent = "Acesso autorizado. Abrindo o ambiente.";
    }
    if (gate) gate.hidden = true;
    document.documentElement.classList.remove("cats-auth-locked");
    const logout = document.getElementById("catsAuthLogout");
    if (logout) logout.hidden = false;
    window.dispatchEvent(new CustomEvent("cats:authenticated", { detail: { source: "supplemental-20260914" } }));
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
      if (await digestB64(credential) === AUTH_HASH_B64) {
        unlock(document.getElementById(GATE_ID));
        return;
      }
    } catch {}

    form.setAttribute(BYPASS_ATTR, "1");
    form.requestSubmit();
  }

  document.addEventListener("submit", intercept, true);
})();
