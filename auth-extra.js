(() => {
  "use strict";

  // Credenciais complementares do VIII CATS Pouso Alegre 2026.
  // Lista deduplicada entre novos alunos e instrutores; somente hashes SHA-256.
  const EXTRA_HASH_B64 = `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`;

  const EXTRA_HASHES = (() => {
    const raw = atob(EXTRA_HASH_B64);
    const set = new Set();
    for (let i = 0; i + 32 <= raw.length; i += 32) set.add(raw.slice(i, i + 32));
    return set;
  })();

  const normalize = value => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    return /^[\d.\-\s]+$/.test(raw) ? raw.replace(/\D+/g, "") : raw;
  };

  async function digestKey(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return String.fromCharCode(...new Uint8Array(digest));
  }

  function saveSession() {
    const createdAt = Date.now();
    try {
      sessionStorage.setItem("curso_ats_auth_v3", JSON.stringify({
        authenticated: true,
        createdAt,
        expiresAt: createdAt + 8 * 60 * 60 * 1000,
        version: 3
      }));
    } catch {}
  }

  function unlockSupplemental(gate) {
    saveSession();
    const box = document.getElementById("catsAuthMessage");
    const label = document.getElementById("catsAuthMessageText");
    if (box && label) {
      box.classList.add("is-visible");
      box.dataset.tone = "success";
      label.textContent = "Acesso autorizado. Abrindo o ambiente.";
    }
    gate.hidden = true;
    document.documentElement.classList.remove("cats-auth-locked");
    const logout = document.getElementById("catsAuthLogout");
    if (logout) logout.hidden = false;
    window.dispatchEvent(new CustomEvent("cats:authenticated", { detail: { source: "supplemental" } }));
  }

  function bind() {
    const gate = document.getElementById("catsAuthGate");
    const form = document.getElementById("catsAuthForm");
    const input = document.getElementById("catsAuthInput");
    if (!gate || !form || !input || form.dataset.catsSupplementalBound === "1") return false;

    let bypass = false;
    form.dataset.catsSupplementalBound = "1";
    form.addEventListener("submit", async event => {
      if (bypass) {
        bypass = false;
        return;
      }

      const credential = normalize(input.value);
      if (!credential) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      try {
        const key = await digestKey(credential);
        if (EXTRA_HASHES.has(key)) {
          unlockSupplemental(gate);
          return;
        }
      } catch {}

      bypass = true;
      form.requestSubmit();
    }, true);
    return true;
  }

  function init() {
    if (bind()) return;
    const observer = new MutationObserver(() => {
      if (!bind()) return;
      observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 10000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
