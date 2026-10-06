import assert from 'node:assert/strict';
import fs from 'node:fs';

const canonical = fs.readFileSync(new URL('../access-2026.js', import.meta.url), 'utf8');
const legacyHotfix = fs.readFileSync(new URL('../access-hotfix-20260918.js', import.meta.url), 'utf8');
const loader = fs.readFileSync(new URL('../auth-extra.js', import.meta.url), 'utf8');

const submitListenerPattern = /document\.addEventListener\(["']submit["']/g;
const canonicalListeners = canonical.match(submitListenerPattern)?.length ?? 0;
const legacyListeners = legacyHotfix.match(submitListenerPattern)?.length ?? 0;

assert.equal(canonicalListeners, 1, 'A política canônica deve registrar exatamente um interceptor de submit.');
assert.equal(legacyListeners, 0, 'O hotfix legado deve permanecer inerte e não registrar interceptor de submit.');
assert.equal(
  canonicalListeners + legacyListeners,
  1,
  'Somente um interceptor suplementar de autenticação pode existir no conjunto publicado.'
);

assert.match(
  canonical,
  /\^\(\?:\\d\{7\}\|\\d\{11\}\)\$/,
  'A política canônica deve continuar aceitando matrícula de 7 dígitos e CPF de 11 dígitos.'
);

assert.match(
  loader,
  /access-2026\.js\?v=[A-Za-z0-9_.-]+/,
  'O loader deve apontar para access-2026.js com cache-bust válido.'
);
assert.match(
  loader,
  /access-hotfix-20260918\.js\?v=[A-Za-z0-9_.-]+/,
  'O loader pode manter o artefato legado apenas como marcador de compatibilidade.'
);
assert.ok(
  loader.indexOf('await bootAccess();') < loader.indexOf('void load(COMPAT_URL'),
  'A política canônica deve estar carregada antes do marcador legado.'
);
assert.ok(
  legacyHotfix.includes('NÃO registra listeners de submit'),
  'O arquivo legado deve declarar explicitamente que está inerte.'
);

console.log('PASS_ACCESS_POLICY_SINGLE_INTERCEPTOR');
console.log('PASS_CACHE_BUST_VERSION_AGNOSTIC');
