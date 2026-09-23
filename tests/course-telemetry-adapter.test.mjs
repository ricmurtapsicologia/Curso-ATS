import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../course-telemetry-adapter.js', import.meta.url), 'utf8');
const authExtra = readFileSync(new URL('../auth-extra.js', import.meta.url), 'utf8');
const hardening = readFileSync(new URL('../hardening.js', import.meta.url), 'utf8');

for (const page of ['curso-ats','cats-pouso-alegre','podcast-ats','cats-precurso']) {
  assert.ok(source.includes(`"${page}"`), `missing page adapter: ${page}`);
}
for (const event of ['page_view','engaged_30s','content_open','download','video_start','media_start','media_25','media_50','media_75','media_complete','precurso_open','precurso_confirmed']) {
  assert.ok(source.includes(`"${event}"`), `missing event: ${event}`);
}
assert.ok(source.includes('data-persistence-confirmed'), 'pre-course confirmation must use the existing persistence-confirmed marker');
assert.ok(source.includes('cats:authenticated'), 'adapter must retry after authentication signal');
assert.ok(source.includes('cats:telemetry-ready'), 'adapter must accept telemetry-ready retry signal');
assert.ok(source.includes('bootPromise = null'), 'failed early boot must be retryable');
assert.ok(source.includes('core?.isAuthenticated?.()'), 'track must recover a missing telemetry session after authentication');
assert.ok(source.includes('google-resource-'), 'Google resources must receive recognizable content IDs');
assert.ok(source.includes('share-page'), 'share control must be observable');
assert.ok(hardening.includes('data.telemetryId') || hardening.includes('dataset.telemetryId'), 'course resources must expose telemetry IDs');
assert.ok(hardening.includes('share-page'), 'share button must expose telemetry ID');

const accessPos = authExtra.indexOf('access-2026.js');
const observabilityCall = authExtra.lastIndexOf('void bootObservability()');
assert.ok(accessPos >= 0 && observabilityCall > accessPos,
  'canonical access must initialize before observability');
assert.ok(authExtra.includes('access-hotfix-20260918.js'), 'legacy compatibility surface must remain discoverable');
assert.ok(authExtra.includes('DEFAULT_TIMEOUT_MS = 5000'), 'shared loader must fail open on stalled auxiliary scripts');
assert.ok(authExtra.includes('Promise.all(['), 'independent observability scripts should load concurrently');
assert.ok(authExtra.includes('void bootObservability()'), 'observability must remain non-blocking after access');

assert.ok(!source.includes('preventDefault('), 'telemetry adapter must not block page interactions');
assert.ok(!source.includes('stopPropagation('), 'telemetry adapter must not stop page interactions');
assert.ok(!source.includes('stopImmediatePropagation('), 'telemetry adapter must not stop page interactions');
assert.ok(!source.includes('localStorage'), 'adapter must not create persistent tracking storage');
assert.ok(!/cpf|bdi|alerg|sangue|diagn/i.test(source), 'adapter must not access clinical or identity fields');
console.log('COURSE_TELEMETRY_ADAPTER_COLD_LOGIN_OK');
