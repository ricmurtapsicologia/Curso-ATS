(() => {
  "use strict";

  // Compatibilidade histórica do hotfix de 18/09/2026.
  // A credencial correspondente foi migrada para access-2026.js, que agora é
  // a única política suplementar autorizada a interceptar o formulário de login.
  // Este arquivo permanece publicável para clientes/cache antigos e auditoria,
  // mas NÃO registra listeners de submit nem altera o fluxo de autenticação.
  const MIGRATED_HASH = "9bd0123c47240b15376c40dbc3066e9244ac82332870cc3eea0bc29cf19f922c";

  try {
    window.CATS_ACCESS_HOTFIX_MIGRATION = Object.freeze({
      version: "2026-09-20-v204",
      migrated: true,
      canonical: "access-2026.js",
      hash: MIGRATED_HASH
    });
  } catch {}
})();