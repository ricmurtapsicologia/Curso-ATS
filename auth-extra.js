(() => {
  "use strict";

  // Compatibilidade: a lista suplementar de credenciais foi consolidada em access-2026.js.
  // Este arquivo não contém credenciais nem hashes próprios.
  if (document.querySelector('script[src*="access-2026.js"]')) return;
  const script = document.createElement("script");
  script.src = "https://ricmurtapsicologia.github.io/Curso-ATS/access-2026.js?v=20260914-3";
  script.async = false;
  document.head.appendChild(script);
})();
