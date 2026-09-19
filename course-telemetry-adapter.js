(() => {
  "use strict";

  const ROOT = window;
  const CORE = () => ROOT.CATSCourseTelemetry;
  const ALLOWED_PAGES = new Set(["curso-ats", "cats-pouso-alegre", "podcast-ats", "cats-precurso"]);
  const mediaProgress = new WeakMap();
  let mounted = false;
  let pageId = "";
  let bootPromise = null;

  const detectPage = () => {
    const path = String(ROOT.location?.pathname || "");
    if (/\/Podcast-ATS-CBMMG\//i.test(path)) return "podcast-ats";
    if (/\/CATS\.pousoalegre\/precurso\.html$/i.test(path)) return "cats-precurso";
    if (/\/CATS\.pousoalegre\//i.test(path)) return "cats-pouso-alegre";
    if (/\/Curso-ATS\//i.test(path)) return "curso-ats";
    return "";
  };

  const safeId = (value, fallback = "content") => {
    const normalized = String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9_.:/-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);
    return normalized || fallback;
  };

  const releaseId = () => {
    const meta = document.querySelector('meta[name="cats-build"]')?.content;
    return safeId(meta || "2026.09.19-wave3", "2026.09.19-wave3");
  };

  const track = (event, contentId = "") => {
    const core = CORE();
    if (!core?.track || !pageId) return Promise.resolve({ ok: false, status: "core_unavailable" });
    return core.track({
      page: pageId,
      event,
      content_id: contentId ? safeId(contentId) : "",
      release: releaseId(),
    });
  };

  const boot = async () => {
    if (bootPromise) return bootPromise;
    bootPromise = (async () => {
      const core = CORE();
      if (!core?.requestIdentity) return { ok: false, status: "core_unavailable" };
      const identity = await core.requestIdentity();
      if (!identity?.ok) return identity;
      if (identity.status === "identity_ready") await track("login_success");
      await track("page_view");
      if (pageId === "cats-precurso") await track("precurso_open");
      ROOT.setTimeout(() => { void track("engaged_30s"); }, 30_000);
      return identity;
    })().catch(() => ({ ok: false, status: "adapter_fail_open" }));
    return bootPromise;
  };

  const instrumentLinks = () => {
    const nodes = [...document.querySelectorAll('a[href],button[data-href],[data-slide-id]')];
    nodes.forEach((node, index) => {
      if (node.dataset.catsTelemetryBound === "1") return;
      node.dataset.catsTelemetryBound = "1";
      const contentId = node.dataset.telemetryId || node.dataset.slideId || `content-${index + 1}`;
      node.addEventListener("click", () => {
        const href = String(node.getAttribute("href") || node.dataset.href || "");
        const isDownload = node.hasAttribute("download") || /(?:\/export\/|\.(?:pdf|pptx?|epub|docx?|xlsx?|zip)(?:[?#]|$))/i.test(href);
        void track(isDownload ? "download" : "content_open", contentId);
      }, { passive: true });
    });
  };

  const instrumentMedia = () => {
    const nodes = [...document.querySelectorAll("audio,video")];
    nodes.forEach((media, index) => {
      if (media.dataset.catsTelemetryBound === "1") return;
      media.dataset.catsTelemetryBound = "1";
      const contentId = media.dataset.telemetryId || `media-${index + 1}`;
      mediaProgress.set(media, new Set());
      media.addEventListener("play", () => {
        const seen = mediaProgress.get(media);
        if (seen?.has("start")) return;
        seen?.add("start");
        void track(media.tagName === "VIDEO" ? "video_start" : "media_start", contentId);
      }, { passive: true });
      media.addEventListener("timeupdate", () => {
        const duration = Number(media.duration || 0);
        const current = Number(media.currentTime || 0);
        if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(current)) return;
        const ratio = current / duration;
        const seen = mediaProgress.get(media);
        [[0.25,"media_25"],[0.50,"media_50"],[0.75,"media_75"]].forEach(([threshold,event]) => {
          if (ratio >= threshold && !seen?.has(event)) {
            seen?.add(event);
            void track(event, contentId);
          }
        });
      }, { passive: true });
      media.addEventListener("ended", () => {
        const seen = mediaProgress.get(media);
        if (seen?.has("media_complete")) return;
        seen?.add("media_complete");
        void track("media_complete", contentId);
      }, { passive: true });
    });
  };

  const observeDynamicContent = () => {
    const observer = new MutationObserver(() => {
      instrumentLinks();
      instrumentMedia();
      if (pageId === "cats-precurso") bindPrecursoConfirmation();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };

  const bindPrecursoConfirmation = () => {
    if (pageId !== "cats-precurso") return false;
    const frame = document.getElementById("app");
    let doc;
    try { doc = frame?.contentDocument; } catch { return false; }
    const success = doc?.getElementById("success");
    if (!success || success.dataset.catsTelemetryConfirmBound === "1") return false;
    success.dataset.catsTelemetryConfirmBound = "1";
    let sent = false;
    const check = () => {
      if (sent || success.getAttribute("data-persistence-confirmed") !== "true") return;
      sent = true;
      void track("precurso_confirmed");
    };
    const observer = new MutationObserver(check);
    observer.observe(success, { attributes: true, attributeFilter: ["data-persistence-confirmed"] });
    check();
    return true;
  };

  const mount = () => {
    if (mounted) return true;
    pageId = detectPage();
    if (!ALLOWED_PAGES.has(pageId)) return false;
    mounted = true;
    instrumentLinks();
    instrumentMedia();
    bindPrecursoConfirmation();
    observeDynamicContent();
    const frame = document.getElementById("app");
    if (frame && pageId === "cats-precurso") frame.addEventListener("load", () => ROOT.setTimeout(bindPrecursoConfirmation, 0), { passive: true });
    void boot();
    return true;
  };

  ROOT.CATSCourseTelemetryAdapter = Object.freeze({
    mount,
    track,
    detectPage,
    version: "1.0.0-wave3",
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
