import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../course-telemetry-adapter.js', import.meta.url), 'utf8');

for (const page of ['curso-ats','cats-pouso-alegre','podcast-ats','cats-precurso']) {
  assert.ok(source.includes(`"${page}"`), `missing page adapter: ${page}`);
}
for (const event of ['page_view','engaged_30s','content_open','download','video_start','media_start','media_25','media_50','media_75','media_complete','precurso_open','precurso_confirmed']) {
  assert.ok(source.includes(`"${event}"`), `missing event: ${event}`);
}
assert.ok(source.includes('data-persistence-confirmed'), 'pre-course confirmation must use the existing persistence-confirmed marker');
assert.ok(!source.includes('preventDefault('), 'telemetry adapter must not block page interactions');
assert.ok(!source.includes('stopPropagation('), 'telemetry adapter must not stop page interactions');
assert.ok(!source.includes('stopImmediatePropagation('), 'telemetry adapter must not stop page interactions');
assert.ok(!source.includes('localStorage'), 'adapter must not create persistent tracking storage');
assert.ok(!/cpf|bdi|alerg|sangue|diagn/i.test(source), 'adapter must not access clinical or identity fields');
console.log('COURSE_TELEMETRY_ADAPTER_WAVE3_OK');
