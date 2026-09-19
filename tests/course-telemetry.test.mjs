import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { webcrypto, randomUUID } from 'node:crypto';

const source = readFileSync(new URL('../course-telemetry.js', import.meta.url), 'utf8');

class StorageMock {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(String(key), String(value)); }
  removeItem(key) { this.map.delete(String(key)); }
  values() { return [...this.map.values()]; }
}

function createHarness({ fetchImpl } = {}) {
  const sessionStorage = new StorageMock();
  const listeners = new Map();
  const documentListeners = new Map();
  const document = {
    readyState: 'complete',
    addEventListener(type, fn) { documentListeners.set(type, fn); },
  };
  const window = {
    document,
    sessionStorage,
    location: { href: 'https://ricmurtapsicologia.github.io/Curso-ATS/' },
    crypto: {
      subtle: webcrypto.subtle,
      getRandomValues: (array) => webcrypto.getRandomValues(array),
      randomUUID,
    },
    CATS_COURSE_TELEMETRY_CONFIG: {
      endpoint: 'https://telemetry.example/api/course_telemetry',
      authWaitMs: 100,
      authPollMs: 10,
    },
    fetch: fetchImpl || (async () => { throw new Error('fetch-not-configured'); }),
    addEventListener(type, fn) { listeners.set(type, fn); },
    setTimeout,
    clearTimeout,
  };
  window.window = window;
  window.globalThis = window;

  const context = vm.createContext({
    window,
    globalThis: window,
    document,
    sessionStorage,
    crypto: window.crypto,
    fetch: window.fetch,
    URL,
    TextEncoder,
    Uint8Array,
    Math,
    Date,
    JSON,
    Object,
    Array,
    Number,
    String,
    Boolean,
    RegExp,
    Error,
    Promise,
    setTimeout,
    clearTimeout,
  });
  vm.runInContext(source, context, { filename: 'course-telemetry.js' });
  return { window, sessionStorage, api: window.CATSCourseTelemetry, listeners, documentListeners };
}

function setAuthenticated(sessionStorage) {
  sessionStorage.setItem('curso_ats_auth_v3', JSON.stringify({
    authenticated: true,
    createdAt: Date.now(),
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    version: 3,
  }));
}

assert.ok(!source.includes('localStorage'), 'telemetry core must not use localStorage');
assert.ok(!source.includes('console.log'), 'telemetry core must not log identity material');
assert.ok(source.includes('credential_hash'), 'identity request must use a one-way credential hash');
assert.ok(!source.includes('body: JSON.stringify({ credential:'), 'raw credential must never be transmitted');

{
  let fetchCalls = 0;
  const harness = createHarness({
    fetchImpl: async (_url, options) => {
      fetchCalls += 1;
      const body = JSON.parse(options.body);
      assert.match(body.credential_hash, /^[0-9a-f]{64}$/);
      assert.equal(body.cohort, 'cats-2026-pa');
      assert.ok(!options.body.includes('1729458'), 'raw credential leaked into request body');
      return {
        ok: true,
        status: 200,
        json: async () => ({
          ok: true,
          uid: 'u_abcdefghijklmnopqrstuvwx',
          token: 'token.payload.signature.0123456789',
          expires_in: 28800,
        }),
      };
    },
  });

  assert.equal(harness.api.version, '1.0.0-wave2');
  assert.equal(harness.api.debugState().mounted, true);
  assert.equal(harness.api.rememberCredential('172945-8'), true);
  assert.equal(harness.api.debugState().hasCredentialInMemory, true);
  assert.ok(harness.sessionStorage.values().every((value) => !value.includes('1729458')));

  const beforeAuth = await harness.api.requestIdentity();
  assert.equal(beforeAuth.status, 'auth_required');
  assert.equal(fetchCalls, 0);
  assert.equal(harness.api.debugState().hasCredentialInMemory, true, 'credential should remain only in RAM while waiting for existing auth');

  setAuthenticated(harness.sessionStorage);
  const identity = await harness.api.requestIdentity();
  assert.equal(identity.ok, true);
  assert.equal(identity.status, 'identity_ready');
  assert.equal(fetchCalls, 1);
  assert.equal(harness.api.debugState().hasCredentialInMemory, false);
  const stored = harness.api.getSession();
  assert.equal(stored.uid, 'u_abcdefghijklmnopqrstuvwx');
  assert.equal(stored.token, 'token.payload.signature.0123456789');
  assert.ok(stored.expiresAt > Date.now());
  assert.ok(stored.sessionId.length >= 8);
  assert.ok(harness.sessionStorage.values().every((value) => !value.includes('1729458')));

  const reused = await harness.api.requestIdentity();
  assert.equal(reused.status, 'session_reused');
  assert.equal(fetchCalls, 1);
}

{
  let fetchCalls = 0;
  const harness = createHarness({
    fetchImpl: async () => {
      fetchCalls += 1;
      throw new Error('network-down');
    },
  });
  setAuthenticated(harness.sessionStorage);
  assert.equal(harness.api.rememberCredential('885.625.576-68'), true);
  const result = await harness.api.requestIdentity();
  assert.equal(result.ok, false);
  assert.equal(result.status, 'identity_unavailable');
  assert.equal(fetchCalls, 1);
  assert.equal(harness.api.debugState().hasCredentialInMemory, false);
  assert.equal(harness.api.getSession(), null);
}

{
  let fetchCalls = 0;
  const harness = createHarness({
    fetchImpl: async () => {
      fetchCalls += 1;
      return { ok: false, status: 403, json: async () => ({ ok: false }) };
    },
  });
  setAuthenticated(harness.sessionStorage);
  assert.equal(harness.api.rememberCredential('abc'), false);
  const result = await harness.api.requestIdentity();
  assert.equal(result.status, 'credential_unavailable');
  assert.equal(fetchCalls, 0);
}

{
  const harness = createHarness();
  const submitHandler = harness.documentListeners.get('submit');
  assert.equal(typeof submitHandler, 'function');
  let prevented = false;
  let stopped = false;
  const form = {
    id: 'catsAuthForm',
    querySelector: () => ({ id: 'catsAuthInput', value: '172945-8' }),
  };
  submitHandler({
    target: form,
    preventDefault: () => { prevented = true; },
    stopImmediatePropagation: () => { stopped = true; },
  });
  assert.equal(prevented, false, 'telemetry must never block authentication submit');
  assert.equal(stopped, false, 'telemetry must never stop authentication propagation');
}

console.log('COURSE_TELEMETRY_WAVE2_OK');
