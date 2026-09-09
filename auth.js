(() => {
  "use strict";

  const CONFIG = Object.freeze({
    sessionKey: "curso_ats_auth_v3",
    attemptsKey: "ats_login_attempts_v3",
    maxAttempts: 5,
    cooldownMs: 30000,
    sessionTtlMs: 8 * 60 * 60 * 1000
  });

  /*
    406 credenciais autorizadas. Somente hashes SHA-256 são publicados.
    O conjunto reúne: base vigente, credenciais recuperadas do legado oficial
    e CPFs dos abordadores civis nas categorias definidas para acesso por CPF.
  */
  const HASH_B64 =
`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`;

  const HASHES = (() => {
    const raw = atob(HASH_B64);
    const set = new Set();
    for (let i = 0; i + 32 <= raw.length; i += 32) set.add(raw.slice(i, i + 32));
    return set;
  })();

  const ICONS = Object.freeze({
    error: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 14h-2v-2h2v2zm0-4h-2V6h2v6z"/>',
    success: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 14-4-4 1.4-1.4L11 13.2l5.6-5.6L18 9l-7 7z"/>'
  });

  let timer = null;
  const now = () => Date.now();
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

  function ensureStyles() {
    if (document.querySelector('link[data-cats-auth]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "auth.css?v=20260905-2";
    link.dataset.catsAuth = "1";
    document.head.appendChild(link);
  }

  function readSession() {
    try {
      const data = JSON.parse(sessionStorage.getItem(CONFIG.sessionKey) || "null");
      if (!data || data.authenticated !== true || now() >= Number(data.expiresAt || 0)) {
        sessionStorage.removeItem(CONFIG.sessionKey);
        return null;
      }
      return data;
    } catch { return null; }
  }

  function saveSession() {
    const createdAt = now();
    try {
      sessionStorage.setItem(CONFIG.sessionKey, JSON.stringify({authenticated:true, createdAt, expiresAt:createdAt + CONFIG.sessionTtlMs, version:3}));
    } catch {}
  }

  function readAttempts() {
    try {
      const data = JSON.parse(localStorage.getItem(CONFIG.attemptsKey) || "null");
      return data ? {count:Number(data.count||0), lockedUntil:Number(data.lockedUntil||0)} : {count:0, lockedUntil:0};
    } catch { return {count:0, lockedUntil:0}; }
  }
  function saveAttempts(state) { try { localStorage.setItem(CONFIG.attemptsKey, JSON.stringify(state)); } catch {} }
  function clearAttempts() { saveAttempts({count:0, lockedUntil:0}); }

  function createGate() {
    let gate = document.getElementById("catsAuthGate");
    if (gate) return gate;
    gate = document.createElement("section");
    gate.id = "catsAuthGate";
    gate.setAttribute("role", "dialog");
    gate.setAttribute("aria-modal", "true");
    gate.setAttribute("aria-labelledby", "catsAuthTitle");
    gate.innerHTML = `
      <main class="cats-auth-page"><div class="cats-auth-shell"><div class="cats-auth-stage">
        <section class="cats-auth-hero" aria-label="Material de apoio às aulas de ATS"><div class="cats-auth-hero-content">
          <div class="cats-auth-brand"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2l2.2 6.8H21l-5.5 4 2.1 6.7L12 15.7 6.4 19.5 8.5 12.8 3 8.8h6.8z"/></svg><span>CBMMG • Conteúdo institucional</span></div>
          <div class="cats-auth-hero-main"><span class="cats-auth-kicker">Material de apoio às aulas de ATS</span><h1 class="cats-auth-hero-title" id="catsAuthTitle">Atendimento a Tentativas de <span class="cats-auth-accent">Suicídio</span></h1><p class="cats-auth-hero-text">Apresentações, referências e vídeos selecionados para acompanhamento das aulas.</p></div>
          <div class="cats-auth-hero-foot"><b>→</b><span>Identifique-se ao lado para entrar no ambiente do curso.</span></div>
        </div></section>
        <section class="cats-auth-panel" aria-labelledby="catsAuthLoginTitle"><article class="cats-auth-card">
          <header class="cats-auth-header"><span class="cats-auth-eyebrow">Acesso do aluno</span><h2 class="cats-auth-title" id="catsAuthLoginTitle">Entre no <span class="cats-auth-accent">ambiente</span></h2><p class="cats-auth-subtitle">Informe sua credencial para acessar o material de apoio às aulas.</p></header>
          <div class="cats-auth-course"><div class="cats-auth-logo" aria-hidden="true"><svg viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#07101f"/><path d="M32 11l5.2 10.5L49 23.2l-8.5 8.3 2 11.7L32 37.7 21.5 43.2l2-11.7L15 23.2l11.8-1.7z" fill="#ffdd00"/></svg></div><div><p class="cats-auth-course-title">Atendimento a Tentativas de Suicídio</p><p class="cats-auth-course-note">Acesso destinado aos abordadores e participantes cadastrados.</p></div></div>
          <form class="cats-auth-form" id="catsAuthForm" novalidate><div class="cats-auth-field"><label class="cats-auth-label" for="catsAuthInput">Credencial</label><div class="cats-auth-input-wrap"><span class="cats-auth-input-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5Z"/></svg></span><input id="catsAuthInput" type="text" inputmode="text" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="32" placeholder="Matrícula BM/PM ou CPF" aria-describedby="catsAuthHelp catsAuthMessage" aria-required="true" /></div><p class="cats-auth-help" id="catsAuthHelp">Militares BM/PM: 7 números. Demais abordadores cadastrados: CPF com 11 números.</p></div><button id="catsAuthSubmit" type="submit"><span id="catsAuthButtonText">Entrar no ambiente</span><span class="cats-auth-arrow" aria-hidden="true">→</span></button><div id="catsAuthMessage" role="status" aria-live="polite" aria-atomic="true"><div class="cats-auth-message-row"><svg class="cats-auth-message-icon" id="catsAuthMessageIcon" viewBox="0 0 24 24" aria-hidden="true"></svg><span id="catsAuthMessageText"></span></div></div></form>
          <p class="cats-auth-note">O acesso é individual e direcionado às pessoas cadastradas.</p>
        </article></section>
      </div><footer class="cats-auth-footer"><span>© 2026 Corpo de Bombeiros Militar de Minas Gerais. Todos os direitos reservados.</span><b>•</b><span>Material de apoio às aulas de ATS</span></footer></div></main>`;
    document.body.appendChild(gate);
    return gate;
  }

  function ensureLogout() {
    let button = document.getElementById("catsAuthLogout");
    if (button) return button;
    button = document.createElement("button");
    button.id = "catsAuthLogout";
    button.type = "button";
    button.textContent = "Sair";
    button.addEventListener("click", () => { try { sessionStorage.removeItem(CONFIG.sessionKey); } catch {} lockPage("Sessão encerrada."); });
    document.body.appendChild(button);
    return button;
  }

  function showMessage(text, tone="error") {
    const box=document.getElementById("catsAuthMessage"), label=document.getElementById("catsAuthMessageText"), icon=document.getElementById("catsAuthMessageIcon"), input=document.getElementById("catsAuthInput");
    if (!box || !label || !icon) return;
    if (!text) { box.classList.remove("is-visible"); box.removeAttribute("data-tone"); label.textContent=""; icon.innerHTML=""; input?.setAttribute("aria-invalid","false"); return; }
    const safe=tone === "success" ? "success" : "error";
    box.classList.add("is-visible"); box.dataset.tone=safe; label.textContent=text; icon.innerHTML=ICONS[safe]; input?.setAttribute("aria-invalid",String(safe === "error"));
  }

  function setSubmitLocked(locked, text=null) {
    const button=document.getElementById("catsAuthSubmit"), label=document.getElementById("catsAuthButtonText");
    if (button) button.disabled=Boolean(locked);
    if (label) label.textContent=text || (locked ? "Aguarde" : "Entrar no ambiente");
  }

  function clearTimer() { if (timer !== null) { clearInterval(timer); timer=null; } }
  function syncCooldown() {
    const state=readAttempts(), remaining=Math.max(0,state.lockedUntil-now());
    if (remaining <= 0) { if (state.lockedUntil) clearAttempts(); setSubmitLocked(false); return false; }
    setSubmitLocked(true); showMessage(`Muitas tentativas. Aguarde ${Math.ceil(remaining/1000)}s antes de tentar novamente.`); return true;
  }
  function startCooldown() { clearTimer(); if (!syncCooldown()) return; timer=setInterval(()=>{ if(!syncCooldown()){ clearTimer(); showMessage(""); } },700); }

  function unlockPage() {
    clearTimer(); const gate=createGate(); gate.hidden=true; document.documentElement.classList.remove("cats-auth-locked"); const logout=ensureLogout(); logout.hidden=false;
  }
  function lockPage(message="") {
    ensureStyles(); const gate=createGate(); gate.hidden=false; document.documentElement.classList.add("cats-auth-locked"); const logout=ensureLogout(); logout.hidden=true; showMessage(message || ""); startCooldown(); setTimeout(()=>document.getElementById("catsAuthInput")?.focus(),60);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (syncCooldown()) return;
    const input=document.getElementById("catsAuthInput");
    if (!input) return;
    const credential=normalize(input.value);
    if (!credential) { showMessage("Informe sua credencial para continuar."); input.focus(); return; }
    if (/^\d+$/.test(credential) && credential.length !== 7 && credential.length !== 11 && credential.length !== 8 && credential.length !== 9) { showMessage("Formato inválido. Use a credencial cadastrada sem pontuação."); input.focus(); return; }
    try {
      const key=await digestKey(credential);
      if (HASHES.has(key)) {
        clearAttempts(); saveSession(); showMessage("Acesso autorizado. Abrindo o ambiente.","success"); setSubmitLocked(true,"Acesso autorizado"); setTimeout(unlockPage,250); return;
      }
    } catch { showMessage("Este navegador não conseguiu validar a credencial. Atualize-o e tente novamente."); return; }
    const state=readAttempts(), next=state.count+1;
    if (next >= CONFIG.maxAttempts) { saveAttempts({count:0,lockedUntil:now()+CONFIG.cooldownMs}); startCooldown(); return; }
    saveAttempts({count:next,lockedUntil:0}); showMessage(`Credencial não localizada. Verifique e tente novamente. (${CONFIG.maxAttempts-next} tentativa(s) restante(s))`); input.focus();
  }

  function init() {
    ensureStyles(); const gate=createGate(); gate.querySelector("#catsAuthForm")?.addEventListener("submit",handleSubmit); gate.querySelector("#catsAuthInput")?.addEventListener("input",()=>showMessage(""));
    if (readSession()) unlockPage(); else lockPage();
    setInterval(()=>{ const gateNow=document.getElementById("catsAuthGate"); if(!readSession() && gateNow?.hidden) lockPage("Sua sessão expirou. Entre novamente."); },60000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();