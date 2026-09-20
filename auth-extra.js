(() => {
  "use strict";

  const load = (src, attrs = {}) => new Promise(resolve => {
    const key = src.split('?')[0];
    const existing = document.querySelector(`script[src*="${key}"]`);
    if (existing) {
      if (existing.dataset.catsLoaded === "1") return resolve(true);
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      window.setTimeout(() => resolve(Boolean(window.CATSCourseTelemetry || existing.dataset.catsLoaded === "1")), 1500);
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
          authWaitMs: 1600,
          authPollMs: 25
        });
      }
    } catch {}
  };

  const boot = async () => {
    configureTelemetry();

    // O core precisa observar o submit antes dos interceptadores de acesso que usam
    // stopImmediatePropagation. Se o core falhar, o acesso continua carregando normalmente.
    await load("https://ricmurtapsicologia.github.io/Curso-ATS/course-telemetry.js?v=20260919-coldlogin1", { catsTelemetry: "core" });

    // Política de acesso existente — comportamento preservado.
    await load("https://ricmurtapsicologia.github.io/Curso-ATS/access-2026.js?v=20260919-3");
    await load("https://ricmurtapsicologia.github.io/Curso-ATS/access-hotfix-20260918.js?v=20260919-3");

    // Adapter somente após core e políticas de acesso.
    await load("https://ricmurtapsicologia.github.io/Curso-ATS/course-telemetry-adapter.js?v=20260919-coldlogin1", { catsTelemetry: "adapter" });
  };

  void boot();
})();
