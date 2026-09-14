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
    404 credenciais autorizadas. Somente hashes SHA-256 são publicados.
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