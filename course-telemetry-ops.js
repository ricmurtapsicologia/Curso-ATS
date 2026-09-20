(() => {
  "use strict";

  const ROOT = window;
  const CORE = () => ROOT.CATSCourseTelemetry;
  const HEARTBEAT_MS = 60_000;
  const ALLOWED_PAGES = new Set(["curso-ats", "cats-pouso-alegre", "podcast-ats", "cats-precurso"]);
  let pageId = "";
  let mounted = false;
  let timer = 0;
  let inFlight = false;

  const detectPage = () => {
    const path = String(ROOT.location?.pathname || "");
    if (/\/Podcast-ATS-CBMMG\//i.test(path)) return "podcast-ats";
    if (/\/CATS\.pousoalegre\/precurso\.html$/i.test(path)) return "cats-precurso";
    if (/\/CATS\.pousoalegre\//i.test(path)) return "cats-pouso-alegre";
    if (/\/Curso-ATS\//i.test(path)) return "curso-ats";
    return "";
  };

  const safeId = (value, fallback = "release") => {
    const normalized = String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9_.:/-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
    return normalized || fallback;
  };

  const releaseId = () => safeId(document.querySelector('meta[name="cats-build"]')?.content || "2026.09.20-ops1", "2026.09.20-ops1");
  const deviceClass = () => {
    const width = Number(ROOT.innerWidth || 0);
    if (!width) return "unknown";
    if (width < 600) return "mobile";
    if (width < 1024) return "tablet";
    return "desktop";
  };

  const signalId = () => {
    try { return ROOT.crypto.randomUUID().replace(/-/g, ""); }
    catch { return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`; }
  };

  const endpoint = () => {
    const explicit = String(ROOT.CATS_COURSE_TELEMETRY_CONFIG?.opsEndpoint || "").trim();
    if (explicit) return explicit;
    const base = String(ROOT.CATS_COURSE_TELEMETRY_CONFIG?.endpoint || "").trim().replace(/\/+$/, "");
    if (!base) return "";
    try {
      const url = new URL(base);
      if (url.pathname.endsWith("/api/course_telemetry")) url.pathname = "/api/course_telemetry_signal";
      else url.pathname = `${url.pathname.replace(/\/+$/, "")}/signal`;
      url.search = "";
      url.hash = "";
      return url.href;
    } catch { return ""; }
  };

  const endpointAllowed = value => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
    } catch { return false; }
  };

  const send = async (signal, code = "") => {
    if (inFlight || !pageId || document.visibilityState === "hidden") return { ok: false, status: "inactive" };
    const core = CORE();
    let session = core?.getSession?.();
    if (!session && core?.isAuthenticated?.() && core?.requestIdentity) {
      try { await core.requestIdentity(); } catch {}
      session = core?.getSession?.();
    }
    const url = endpoint();
    if (!session || !endpointAllowed(url)) return { ok: false, status: "session_unavailable" };

    inFlight = true;
    try {
      const payload = {
        signal_id: signalId(),
        signal,
        page: pageId,
        session_id: session.sessionId,
        release: releaseId(),
        device_class: deviceClass(),
        timestamp: Date.now(),
      };
      if (code) payload.code = code;
      const response = await ROOT.fetch(url, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
        referrerPolicy: "no-referrer",
        keepalive: true,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.token}` },
        body: JSON.stringify(payload),
      });
      return { ok: Boolean(response?.ok), status: response?.ok ? "accepted" : "rejected", httpStatus: Number(response?.status || 0) };
    } catch {
      return { ok: false, status: "fail_open" };
    } finally {
      inFlight = false;
    }
  };

  const heartbeat = () => { void send("presence"); };
  const restart = () => {
    ROOT.clearInterval(timer);
    timer = 0;
    heartbeat();
    if (document.visibilityState !== "hidden") timer = ROOT.setInterval(heartbeat, HEARTBEAT_MS);
  };

  const mount = () => {
    if (mounted) return true;
    pageId = detectPage();
    if (!ALLOWED_PAGES.has(pageId)) return false;
    mounted = true;

    ROOT.addEventListener("cats:authenticated", restart, { passive: true });
    ROOT.addEventListener("pageshow", restart, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") restart();
      else { ROOT.clearInterval(timer); timer = 0; }
    }, { passive: true });

    ROOT.addEventListener("error", () => { void send("technical_error", "script_error"); }, { passive: true });
    ROOT.addEventListener("unhandledrejection", () => { void send("technical_error", "unhandled_rejection"); }, { passive: true });

    restart();
    return true;
  };

  ROOT.CATSCourseTelemetryOps = Object.freeze({ mount, heartbeat, send, detectPage, version: "1.0.0-ops1" });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
