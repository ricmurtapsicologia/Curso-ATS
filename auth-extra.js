(() => {
  "use strict";

  const load = src => {
    const key = src.split('?')[0];
    if (document.querySelector(`script[src*="${key}"]`)) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
  };

  load("https://ricmurtapsicologia.github.io/Curso-ATS/access-2026.js?v=20260919-1");
  load("https://ricmurtapsicologia.github.io/Curso-ATS/access-hotfix-20260918.js?v=20260918-2");
})();
