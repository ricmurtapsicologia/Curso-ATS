import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../cats-analytics-v2.js', import.meta.url), 'utf8');
const loader = readFileSync(new URL('../auth-extra.js', import.meta.url), 'utf8');

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

const universalPos = loader.indexOf('cats-analytics-v2.js?v=20260920-v2');
const authCorePos = loader.indexOf('course-telemetry.js?v=20260919-coldlogin1');
assert.ok(universalPos >= 0, 'loader universal não publicado no auth-extra');
assert.ok(authCorePos >= 0, 'core autenticado não preservado');
assert.ok(universalPos < authCorePos, 'analytics universal precisa carregar antes do core autenticado');

for (const forbidden of ['credential_hash:', 'cpf:', 'bdi:', 'email:']) {
  assert.ok(!source.includes(forbidden), `coletor não pode emitir ${forbidden}`);
}

console.log('ANALYTICS_V2_CONTRACT_OK');
