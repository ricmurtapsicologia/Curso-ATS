import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../cats-analytics-v2.js', import.meta.url), 'utf8');
const loader = readFileSync(new URL('../auth-extra.js', import.meta.url), 'utf8');
const accessCanonical = readFileSync(new URL('../access-2026.js', import.meta.url), 'utf8');
const accessHotfix = readFileSync(new URL('../access-hotfix-20260918.js', import.meta.url), 'utf8');

for (const required of [
  'session_start', 'page_view', 'manual_open', 'download', 'presentation_open',
  'precurso_open', 'precurso_confirmed', 'media_start', 'media_complete',
  'technical_error', 'session_summary'
]) {
  assert.ok(source.includes(`"${required}"`), `evento essencial ${required} ausente`);
}

for (const retired of [
  'scroll_25', 'scroll_50', 'scroll_75', 'scroll_90', 'user_engagement',
  'page_exit', 'internal_click', 'external_click', 'media_25', 'media_50', 'media_75'
]) {
  assert.ok(!source.includes(`"${retired}"`), `evento de baixo valor ${retired} não pode continuar sendo emitido`);
}

assert.match(source, /navigator\.sendBeacon/, 'saída resiliente via sendBeacon ausente');
assert.match(source, /utm_source/, 'aquisição UTM ausente');
assert.match(source, /referrerDomain/, 'referrer ausente');
assert.match(source, /browserName/, 'navegador ausente');
assert.match(source, /osName/, 'sistema operacional ausente');
assert.match(source, /deviceCategory/, 'categoria de dispositivo ausente');
assert.match(source, /screen_width/, 'resolução de tela ausente');
assert.match(source, /timezone/, 'timezone ausente');
assert.match(source, /max_scroll/, 'resumo de scroll ausente');
assert.match(source, /max_media_progress/, 'resumo de mídia ausente');
assert.match(source, /MAX_EVENTS_PER_SESSION\s*=\s*20/, 'orçamento cliente por sessão ausente');
assert.match(source, /MAX_TECHNICAL_ERRORS\s*=\s*3/, 'limite de erro técnico ausente');
assert.match(source, /LINK_ENDPOINT/, 'ponte de identidade ausente');
assert.match(source, /cats-manual/, 'Manual não incluído');
assert.match(source, /navigator\.webdriver === true/, 'filtro de automação ausente');
assert.match(source, /version:"2\.1\.0"/, 'versão 2.1.0 não exposta');
assert.match(source, /POLICY = "essential-v2\.1"/, 'política essencial não identificada');

assert.match(loader, /DEFAULT_TIMEOUT_MS\s*=\s*5000/, 'timeout fail-open do loader ausente');
assert.match(loader, /void bootObservability\(\)/, 'observabilidade precisa ser não bloqueante');
assert.match(loader, /catsAccess: "canonical"/, 'política canônica de acesso não priorizada');
assert.match(loader, /catsAccess: "compat"/, 'compatibilidade de acesso ausente');
assert.match(loader, /cats-analytics-v2\.js\?v=20260923-v210/, 'cache-bust da telemetria essencial ausente');

const accessPos = loader.indexOf('access-2026.js?v=20260920-v204');
const observeCallPos = loader.lastIndexOf('void bootObservability()');
assert.ok(accessPos >= 0 && observeCallPos >= 0 && accessPos < observeCallPos, 'autorização deve ser iniciada antes da observabilidade');
assert.ok(!loader.includes('await load("https://ricmurtapsicologia.github.io/Curso-ATS/cats-analytics-v2.js'), 'analytics não pode bloquear política de acesso');

assert.match(accessCanonical, /const SHARED_BYPASS = "catsAccessBypass"/, 'interceptor canônico precisa preservar o bypass compartilhado');
assert.match(accessCanonical, /if \(form\.dataset\[SHARED_BYPASS\] === "1"\) return;/, 'retry ao gate-base precisa atravessar o interceptor canônico');
assert.match(accessCanonical, /queueMicrotask\(\(\) => \{ delete form\.dataset\[SHARED_BYPASS\]; \}\)/, 'bypass precisa sobreviver ao evento de reenvio completo');
assert.match(accessCanonical, /function retryBase\(form\)/, 'fallback explícito ao validador-base ausente');
assert.match(accessHotfix, /migrated:\s*true/, 'hotfix legado deve permanecer inerte e explicitamente migrado');
assert.ok(!accessHotfix.includes('addEventListener("submit"'), 'hotfix legado não pode registrar um segundo interceptor');

for (const forbidden of ['credential_hash:', 'cpf:', 'bdi:', 'email:']) {
  assert.ok(!source.includes(forbidden), `coletor não pode emitir ${forbidden}`);
}

console.log('ANALYTICS_V21_ESSENTIAL_CONTRACT_OK');
