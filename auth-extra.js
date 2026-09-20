(() => {
  "use strict";

  const DEFAULT_TIMEOUT_MS = 5000;
  const ACCESS_URL = "https://ricmurtapsicologia.github.io/Curso-ATS/access-2026.js?v=20260920-v204";

  const load = (src, attrs = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => new Promise(resolve => {
    const key = src.split('?')[0];
    const existing = document.querySelector(`script[src*="${key}"]`);
    let settled = false;
    let timer = 0;

    const finish = value => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(Boolean(value));
    };

    if (existing) {
      if (existing.dataset.catsLoaded === "1") return finish(true);
      existing.addEventListener("load", () => finish(true), { once: true });
      existing.addEventListener("error", () => finish(false), { once: true });
      timer = window.setTimeout(() => finish(false), timeoutMs);
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    Object.entries(attrs).forEach(([name, value]) => { script.dataset[name] = value; });
    script.addEventListener("load", () => {
      script.dataset.catsLoaded = "1";
      finish(true);
    }, { once: true });
    script.addEventListener("error", () => {
      script.dataset.catsFailed = "1";
      finish(false);
    }, { once: true });
    document.head.appendChild(script);
    timer = window.setTimeout(() => finish(false), timeoutMs);
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

  const bootAccess = async () => {
    // Uma única política canônica registra o interceptor de submit.
    // Isso evita competição entre interceptores e impede que uma credencial válida
    // seja desviada para o autenticador-base antes de todas as autorizações serem avaliadas.
    const ok = await load(ACCESS_URL, { catsAccess: "canonical" });
    if (ok) return true;

    const failed = document.querySelector('script[src*="/Curso-ATS/access-2026.js"]');
    if (failed?.dataset.catsLoaded !== "1") failed.remove();
    return load(`${ACCESS_URL}&retry=${Date.now()}`, { catsAccess: "canonicalRetry" }, 7000);
  };

  const bootObservability = async () => {
    // Observabilidade é sempre fail-open e nunca antecede a política de acesso.
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

    // AUTORIZAÇÃO PRIMEIRO: nenhuma dependência de analytics, telemetria ou Vercel.
    await bootAccess();

    // Não aguardar observabilidade para liberar o restante do fluxo.
    void bootObservability();
  };

  void boot();
})();