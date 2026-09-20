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

const corePos = authExtra.indexOf('course-telemetry.js');
const accessPos = authExtra.indexOf('access-2026.js');
const hotfixPos = authExtra.indexOf('access-hotfix-20260918.js');
const adapterPos = authExtra.indexOf('course-telemetry-adapter.js');
assert.ok(corePos >= 0 && accessPos > corePos && hotfixPos > accessPos && adapterPos > hotfixPos,
  'telemetry core must load before access interceptors and adapter must load last');
assert.ok(authExtra.includes('await load('), 'shared loader must enforce sequential loading');

assert.ok(!source.includes('preventDefault('), 'telemetry adapter must not block page interactions');
assert.ok(!source.includes('stopPropagation('), 'telemetry adapter must not stop page interactions');
assert.ok(!source.includes('stopImmediatePropagation('), 'telemetry adapter must not stop page interactions');
assert.ok(!source.includes('localStorage'), 'adapter must not create persistent tracking storage');
assert.ok(!/cpf|bdi|alerg|sangue|diagn/i.test(source), 'adapter must not access clinical or identity fields');
console.log('COURSE_TELEMETRY_ADAPTER_COLD_LOGIN_OK');
