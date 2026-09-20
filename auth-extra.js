(() => {
  "use strict";

  const load = (src, attrs = {}) => new Promise(resolve => {
    const key = src.split('?')[0];
    const existing = document.querySelector(`script[src*="${key}"]`);
    if (existing) {
      if (existing.dataset.catsLoaded === "1") return resolve(true);
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      window.setTimeout(() => resolve(Boolean(window.CATSAnalyticsV2 || window.CATSCourseTelemetry || existing.dataset.catsLoaded === "1")), 1500);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    Object.entries(attrs).forEach(([name, value]) => { script.dataset[name] = value; });
    script.addEventListener("load", () => { script.dataset.catsLoaded = "1"; resolve(true); }, { once: true });
    script.addEventListener("error", () => resolve(false), { once: true });
    document.head.appendChild(script);
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

  const boot = async () => {
    configureTelemetry();

    // Analytics universal nasce antes do login. Falha de analytics nunca bloqueia acesso.
    await load("https://ricmurtapsicologia.github.io/Curso-ATS/cats-analytics-v2.js?v=20260920-v2", { catsAnalytics: "v2" });

    // Core autenticado preservado para vincular sessão pseudônima ao integrante autorizado.
    await load("https://ricmurtapsicologia.github.io/Curso-ATS/course-telemetry.js?v=20260919-coldlogin1", { catsTelemetry: "core" });

    // Política de acesso existente — comportamento preservado.
    await load("https://ricmurtapsicologia.github.io/Curso-ATS/access-2026.js?v=20260919-3");
    await load("https://ricmurtapsicologia.github.io/Curso-ATS/access-hotfix-20260918.js?v=20260919-3");

    // Telemetria autenticada operacional permanece em paralelo.
    await load("https://ricmurtapsicologia.github.io/Curso-ATS/course-telemetry-adapter.js?v=20260919-coldlogin1", { catsTelemetry: "adapter" });
    await load("https://ricmurtapsicologia.github.io/Curso-ATS/course-telemetry-ops.js?v=20260920-ops1", { catsTelemetry: "ops" });
  };

  void boot();
})();
