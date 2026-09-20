(() => {
  "use strict";

  const DEFAULT_TIMEOUT_MS = 3500;

  const load = (src, attrs = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => new Promise(resolve => {
    const key = src.split('?')[0];
    const existing = document.querySelector(`script[src*="${key}"]`);
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      resolve(Boolean(value));
    };
    const armTimeout = () => window.setTimeout(() => finish(false), timeoutMs);

    if (existing) {
      if (existing.dataset.catsLoaded === "1") return finish(true);
      existing.addEventListener("load", () => finish(true), { once: true });
      existing.addEventListener("error", () => finish(false), { once: true });
      armTimeout();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    Object.entries(attrs).forEach(([name, value]) => { script.dataset[name] = value; });
    script.addEventListener("load", () => { script.dataset.catsLoaded = "1"; finish(true); }, { once: true });
    script.addEventListener("error", () => finish(false), { once: true });
    document.head.appendChild(script);
    armTimeout();
  });

  const configureTelemetry = () => {
    try {
      if (!window.CATS_COURSE_TELEMETRY_CONFIG) {
        window.CATS_COURSE_TELEMETRY_CONFIG = Object.freeze({
          endpoint: "https://secretaria-digital-core.vercel.app/api/course_telemetry",
          opsEndpoint: "https://secretaria-digital-core.vercel.app/api/course_telemetry/signal",
          analyticsEndpoint: "https://secretaria-digital-core.vercel.app/api/analytics/v2/collect",
          analyticsLinkEndpoint: "https://secretaria-digital-core.vercel.app/api/analytics/v2/link",
          authWaitMs: 1600,
          authPollMs: 25
        });
      }
    } catch {}
  };

  const bootObservability = async () => {
    await Promise.all([
      load("https://ricmurtapsicologia.github.io/Curso-ATS/cats-analytics-v2.js?v=20260920-v201", { catsAnalytics: "v2" }),
      load("https://ricmurtapsicologia.github.io/Curso-ATS/course-telemetry.js?v=20260919-coldlogin1", { catsTelemetry: "core" })
    ]);
    await Promise.all([
      load("https://ricmurtapsicologia.github.io/Curso-ATS/course-telemetry-adapter.js?v=20260919-coldlogin1", { catsTelemetry: "adapter" }),
      load("https://ricmurtapsicologia.github.io/Curso-ATS/course-telemetry-ops.js?v=20260920-ops1", { catsTelemetry: "ops" })
    ]);
  };

  const boot = async () => {
    configureTelemetry();

    // Autorização vem primeiro e cada política recebe um cache-bust próprio desta correção.
    await Promise.all([
      load("https://ricmurtapsicologia.github.io/Curso-ATS/access-2026.js?v=20260920-bypass1", { catsAccess: "canonical" }),
      load("https://ricmurtapsicologia.github.io/Curso-ATS/access-hotfix-20260918.js?v=20260920-bypass1", { catsAccess: "supplemental" })
    ]);

    void bootObservability();
  };

  void boot();
})();
