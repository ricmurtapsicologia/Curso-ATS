(() => {
  "use strict";

  const ROOT = window;
  const CORE = () => ROOT.CATSCourseTelemetry;
  const ALLOWED_PAGES = new Set(["curso-ats", "cats-pouso-alegre", "podcast-ats", "cats-precurso"]);
  const ESSENTIAL_EVENTS = new Set(["login_success", "page_view", "download", "media_start", "media_complete", "precurso_open", "precurso_confirmed"]);
  const MAX_EVENTS_PER_PAGE_LIFECYCLE = 16;
  const mediaState = new WeakMap();
  const emittedAt = new Map();
  let emittedCount = 0;
  let mounted = false;
  let pageId = "";
  let bootPromise = null;
  let telemetryStarted = false;

  const detectPage = () => {
    const path = String(ROOT.location?.pathname || "");
    if (/\/Podcast-ATS-CBMMG\//i.test(path)) return "podcast-ats";
    if (/\/CATS\.pousoalegre\/precurso\.html$/i.test(path)) return "cats-precurso";
    if (/\/CATS\.pousoalegre\//i.test(path)) return "cats-pouso-alegre";
    if (/\/Curso-ATS\//i.test(path)) return "curso-ats";
    return "";
  };

  const safeId = (value, fallback = "content") => {
    const normalized = String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9_.:/-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
    return normalized || fallback;
  };

  const releaseId = () => safeId(document.querySelector('meta[name="cats-build"]')?.content || "2026.09.23-essential-v21", "2026.09.23-essential-v21");
  const endpoint = () => String(ROOT.CATS_COURSE_TELEMETRY_CONFIG?.endpoint || "").trim().replace(/\/+$/, "");
  const endpointAllowed = value => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
    } catch { return false; }
  };
  const deviceClass = () => {
    const width = Number(ROOT.innerWidth || 0);
    if (!width) return "unknown";
    if (width < 600) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  };
  const eventId = () => {
    try { return ROOT.crypto.randomUUID().replace(/-/g, ""); }
    catch { return `e_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`; }
  };

  const resolveSession = async () => {
    const core = CORE();
    let session = core?.getSession?.();
    if (session) return session;
    if (!core?.isAuthenticated?.() || !core?.requestIdentity) return null;
    try { await core.requestIdentity(); } catch {}
    session = core?.getSession?.();
    return session || null;
  };

  const cooldownFor = event => ({ login_success: 300000, page_view: 300000, precurso_open: 300000, precurso_confirmed: 300000, download: 3000, media_start: 5000, media_complete: 5000 }[event] || 0);
  const allowTrack = (event, contentId) => {
    if (!ESSENTIAL_EVENTS.has(event) || emittedCount >= MAX_EVENTS_PER_PAGE_LIFECYCLE) return false;
    const key = `${event}|${safeId(contentId, "")}`;
    const now = Date.now();
    const prior = Number(emittedAt.get(key) || 0);
    const cooldown = cooldownFor(event);
    if (cooldown && now - prior < cooldown) return false;
    emittedAt.set(key, now);
    emittedCount += 1;
    return true;
  };

  const track = async (event, contentId = "") => {
    try {
      if (!allowTrack(event, contentId)) return { ok: true, status: "discarded_by_essential_budget" };
      const session = await resolveSession();
      const base = endpoint();
      if (!session || !pageId) return { ok: false, status: "session_unavailable" };
      if (!endpointAllowed(base)) return { ok: false, status: "endpoint_unavailable" };
      const payload = {
        event_id: eventId(), page: pageId, event,
        content_id: contentId ? safeId(contentId) : "",
        session_id: session.sessionId,
        timestamp: Date.now(), release: releaseId(), device_class: deviceClass(),
      };
      const response = await ROOT.fetch(`${base}/event`, {
        method: "POST", mode: "cors", credentials: "omit", cache: "no-store", redirect: "error",
        referrerPolicy: "no-referrer", keepalive: true,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.token}` },
        body: JSON.stringify(payload),
      });
      return { ok: Boolean(response?.ok), status: response?.ok ? "accepted" : "rejected", httpStatus: Number(response?.status || 0) };
    } catch { return { ok: false, status: "fail_open" }; }
  };

  const boot = async () => {
    if (telemetryStarted) return { ok: true, status: "already_started" };
    if (bootPromise) return bootPromise;
    bootPromise = (async () => {
      const core = CORE();
      if (!core?.requestIdentity) return { ok: false, status: "core_unavailable" };
      const identity = await core.requestIdentity();
      if (!identity?.ok) return identity;
      if (telemetryStarted) return { ok: true, status: "already_started" };
      telemetryStarted = true;
      if (identity.status === "identity_ready") await track("login_success");
      await track("page_view");
      if (pageId === "cats-precurso") await track("precurso_open");
      return identity;
    })().catch(() => ({ ok: false, status: "adapter_fail_open" }));
    const result = await bootPromise;
    bootPromise = null;
    return result;
  };

  const retryBoot = () => {
    if (telemetryStarted) return;
    bootPromise = null;
    ROOT.setTimeout(() => { void boot(); }, 0);
  };

  const descriptiveText = node => {
    const own = node?.getAttribute?.("aria-label") || node?.getAttribute?.("title") || node?.textContent || "";
    if (String(own).trim().length >= 4) return own;
    const container = node?.closest?.("article,section,li,.card,.resource,.lesson,.module,div");
    return container?.querySelector?.("h1,h2,h3,h4,strong")?.textContent || own;
  };

  const contentIdForNode = (node, index) => {
    const explicit = node?.dataset?.telemetryId || node?.dataset?.slideId;
    if (explicit) return safeId(explicit, `content-${index + 1}`);
    const label = safeId(descriptiveText(node), "resource");
    return label !== "resource" ? label : `content-${index + 1}`;
  };

  const instrumentDownloads = () => {
    [...document.querySelectorAll('a[href]')].forEach((node, index) => {
      if (node.dataset.catsEssentialDownloadBound === "1") return;
      const href = String(node.getAttribute("href") || "");
      const isDownload = node.hasAttribute("download") || /(?:\/export\/|\.(?:pdf|pptx?|epub|docx?|xlsx?|zip)(?:[?#]|$))/i.test(href);
      if (!isDownload) return;
      node.dataset.catsEssentialDownloadBound = "1";
      const contentId = contentIdForNode(node, index);
      node.addEventListener("click", () => { void track("download", contentId); }, { passive: true });
    });
  };

  const instrumentMedia = () => {
    [...document.querySelectorAll("audio,video")].forEach((media, index) => {
      if (media.dataset.catsEssentialMediaBound === "1") return;
      media.dataset.catsEssentialMediaBound = "1";
      const contentId = media.dataset.telemetryId || `media-${index + 1}`;
      mediaState.set(media, { started: false, completed: false });
      media.addEventListener("play", () => {
        const state = mediaState.get(media); if (!state || state.started) return; state.started = true;
        void track("media_start", contentId);
      }, { passive: true });
      media.addEventListener("ended", () => {
        const state = mediaState.get(media); if (!state || state.completed) return; state.completed = true;
        void track("media_complete", contentId);
      }, { passive: true });
    });
  };

  const bindPrecursoConfirmation = () => {
    if (pageId !== "cats-precurso") return false;
    const frame = document.getElementById("app"); let doc;
    try { doc = frame?.contentDocument; } catch { return false; }
    const success = doc?.getElementById("success");
    if (!success || success.dataset.catsTelemetryConfirmBound === "1") return false;
    success.dataset.catsTelemetryConfirmBound = "1";
    let sent = false;
    const check = () => {
      if (sent || success.getAttribute("data-persistence-confirmed") !== "true") return;
      sent = true; void track("precurso_confirmed");
    };
    const observer = new MutationObserver(check);
    observer.observe(success, { attributes: true, attributeFilter: ["data-persistence-confirmed"] });
    check(); return true;
  };

  const observeDynamicContent = () => {
    const observer = new MutationObserver(() => { instrumentDownloads(); instrumentMedia(); if (pageId === "cats-precurso") bindPrecursoConfirmation(); });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };

  const mount = () => {
    if (mounted) return true;
    pageId = detectPage(); if (!ALLOWED_PAGES.has(pageId)) return false;
    mounted = true;
    instrumentDownloads(); instrumentMedia(); bindPrecursoConfirmation(); observeDynamicContent();
    const frame = document.getElementById("app");
    if (frame && pageId === "cats-precurso") frame.addEventListener("load", () => ROOT.setTimeout(bindPrecursoConfirmation, 0), { passive: true });
    ROOT.addEventListener?.("cats:authenticated", retryBoot, { passive: true });
    ROOT.addEventListener?.("cats:telemetry-ready", retryBoot, { passive: true });
    ROOT.addEventListener?.("pageshow", retryBoot, { passive: true });
    void boot(); return true;
  };

  ROOT.CATSCourseTelemetryAdapter = Object.freeze({ mount, track, detectPage, version: "1.2.0-essential-v21" });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true }); else mount();
})();
