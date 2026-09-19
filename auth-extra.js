(() => {
  "use strict";

  const load = (src, attrs = {}) => {
    const key = src.split('?')[0];
    if (document.querySelector(`script[src*="${key}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    Object.entries(attrs).forEach(([name, value]) => { script.dataset[name] = value; });
    document.head.appendChild(script);
  };

  // Política de acesso existente — ordem e comportamento preservados.
  load("https://ricmurtapsicologia.github.io/Curso-ATS/access-2026.js?v=20260919-2");
  load("https://ricmurtapsicologia.github.io/Curso-ATS/access-hotfix-20260918.js?v=20260918-2");

  // Sidecar de telemetria. Falhas nesta camada nunca bloqueiam autenticação ou conteúdo.
  try {
    if (!window.CATS_COURSE_TELEMETRY_CONFIG) {
      window.CATS_COURSE_TELEMETRY_CONFIG = Object.freeze({
        endpoint: "https://secretaria-digital-core.vercel.app/api/course_telemetry",
        authWaitMs: 1600,
        authPollMs: 25
      });
    }
    load("https://ricmurtapsicologia.github.io/Curso-ATS/course-telemetry.js?v=20260919-wave3", { catsTelemetry: "core" });
    load("https://ricmurtapsicologia.github.io/Curso-ATS/course-telemetry-adapter.js?v=20260919-wave3", { catsTelemetry: "adapter" });
  } catch {}
})();
