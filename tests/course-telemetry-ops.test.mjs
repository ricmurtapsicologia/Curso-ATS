import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../course-telemetry-ops.js', import.meta.url), 'utf8');
const authExtra = fs.readFileSync(new URL('../auth-extra.js', import.meta.url), 'utf8');

assert.match(source, /HEARTBEAT_MS\s*=\s*60_000/, 'presence heartbeat must run once per minute');
assert.match(source, /send\("presence"\)/, 'presence signal must be emitted');
assert.match(source, /technical_error/, 'coarse technical errors must be emitted');
assert.match(source, /unhandled_rejection/, 'unhandled rejections must be classified');
assert.match(source, /Authorization.*Bearer/, 'ops endpoint must reuse the signed telemetry token');
assert.ok(!source.includes('localStorage'), 'ops sidecar must not create persistent tracking storage');
assert.ok(!/\b(?:cpf|bdi|alerg|sangue|diagn)\b/i.test(source), 'ops sidecar must not access sensitive fields');
assert.ok(!source.includes('error.message'), 'raw error messages must never be sent');
assert.ok(!source.includes('error.stack'), 'raw stacks must never be sent');
assert.match(authExtra, /course-telemetry-ops\.js\?v=20260920-ops1/, 'auth loader must load the ops sidecar');
assert.match(authExtra, /\/api\/course_telemetry\/signal/, 'ops endpoint must use the multiplexed telemetry route');

console.log('COURSE_TELEMETRY_OPS_PRIVACY_REGRESSION_OK');
