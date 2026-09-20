import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../cats-analytics-v2.js', import.meta.url), 'utf8');
const loader = readFileSync(new URL('../auth-extra.js', import.meta.url), 'utf8');
const hardening = readFileSync(new URL('../hardening.js', import.meta.url), 'utf8');

assert.match(source, /send\("page_view"\)/, 'page_view universal ausente');
assert.match(source, /presentation_open/, 'presentation_open ausente');
assert.match(source, /navigator\.sendBeacon/, 'saída resiliente via sendBeacon ausente');
assert.match(source, /utm_source/, 'aquisição UTM ausente');
assert.match(source, /referrerDomain/, 'referrer ausente');
assert.match(source, /browserName/, 'navegador ausente');
assert.match(source, /osName/, 'sistema operacional ausente');
assert.match(source, /deviceCategory/, 'categoria de dispositivo ausente');
assert.match(source, /screen_width/, 'resolução de tela ausente');
assert.match(source, /timezone/, 'timezone ausente');
assert.match(source, /scroll_25/, 'scroll 25 ausente');
assert.match(source, /scroll_90/, 'scroll 90 ausente');
assert.match(source, /user_engagement/, 'engajamento ausente');
assert.match(source, /LINK_ENDPOINT/, 'ponte de identidade ausente');
assert.match(source, /cats-manual/, 'Manual não incluído');
assert.match(source, /navigator\.webdriver === true/, 'filtro de automação ausente');
assert.match(source, /version:"2\.0\.1"/, 'versão 2.0.1 não exposta');

assert.match(loader, /DEFAULT_TIMEOUT_MS\s*=\s*3500/, 'timeout fail-open do loader ausente');
assert.match(loader, /void bootObservability\(\)/, 'observabilidade precisa ser não bloqueante');
assert.match(loader, /catsAccess: "canonical"/, 'política canônica de acesso não priorizada');
assert.match(loader, /catsAccess: "supplemental"/, 'política suplementar de acesso não priorizada');

const accessPos = loader.indexOf('access-2026.js?v=20260919-3');
const observeCallPos = loader.lastIndexOf('void bootObservability()');
assert.ok(accessPos >= 0 && observeCallPos >= 0 && accessPos < observeCallPos, 'autorização deve ser iniciada antes da observabilidade');
assert.ok(!loader.includes('await load("https://ricmurtapsicologia.github.io/Curso-ATS/cats-analytics-v2.js'), 'analytics não pode bloquear política de acesso');
assert.ok(hardening.includes('auth-extra.js?v=20260920-v202'), 'cache-bust v202 do loader de acesso ausente');

for (const forbidden of ['credential_hash:', 'cpf:', 'bdi:', 'email:']) {
  assert.ok(!source.includes(forbidden), `coletor não pode emitir ${forbidden}`);
}

console.log('ANALYTICS_V2_CONTRACT_OK');
