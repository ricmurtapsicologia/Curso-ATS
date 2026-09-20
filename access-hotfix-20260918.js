(() => {
  "use strict";

  // Hotfix complementar de acesso — somente hash SHA-256 é publicado.
  const ALLOWED_HASH = "9bd0123c47240b15376c40dbc3066e9244ac82332870cc3eea0bc29cf19f922c";
  const SESSION_KEY = "curso_ats_auth_v3";
  const ATTEMPTS_KEY = "ats_login_attempts_v3";
  const TTL_MS = 8 * 60 * 60 * 1000;
  const SHARED_BYPASS = "catsAccessBypass";

  const normalize = value => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    return /^[\d.\-\s]+$/.test(raw) ? raw.replace(/\D+/g, "") : raw;
  };

  async function sha256Hex(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  function saveSession() {
    const createdAt = Date.now();
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        authenticated: true,
        createdAt,
        expiresAt: createdAt + TTL_MS,
        version: 3
      }));
      localStorage.removeItem(ATTEMPTS_KEY);
    } catch {}
  }

  function successUi(form) {
    const input = form.querySelector("#catsAuthInput");
    const msg = form.querySelector("#catsAuthMessage");
    const text = form.querySelector("#catsAuthMessageText");
    const button = form.querySelector("#catsAuthSubmit");
    if (input) { input.setAttribute("aria-invalid", "false"); input.disabled = true; }
    if (msg) { msg.classList.add("is-visible"); msg.dataset.tone = "success"; }
    if (text) text.textContent = "Acesso autorizado. Abrindo o ambiente.";
    if (button) button.disabled = true;
  }

  function retryBase(form) {
    form.dataset[SHARED_BYPASS] = "1";
    try {
      form.requestSubmit();
    } finally {
      queueMicrotask(() => { delete form.dataset[SHARED_BYPASS]; });
    }
  }

  function intercept(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== "catsAuthForm") return;
    if (form.dataset[SHARED_BYPASS] === "1") return;

    const credential = normalize(form.querySelector("#catsAuthInput")?.value);
    if (!/^\d{7}$/.test(credential)) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    sha256Hex(credential).then(hash => {
      if (hash === ALLOWED_HASH) {
        saveSession();
        successUi(form);
        window.setTimeout(() => window.location.reload(), 180);
        return;
      }
      retryBase(form);
    }).catch(() => retryBase(form));
  }

  document.addEventListener("submit", intercept, true);
})();