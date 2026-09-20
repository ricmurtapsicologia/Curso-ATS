import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const core = readFileSync(new URL('../course-telemetry.js', import.meta.url), 'utf8');
const adapter = readFileSync(new URL('../course-telemetry-adapter.js', import.meta.url), 'utf8');
const authExtra = readFileSync(new URL('../auth-extra.js', import.meta.url), 'utf8');

const syntheticAccess = `(() => {
  const SESSION_KEY = 'curso_ats_auth_v3';
  document.addEventListener('submit', event => {
    const form = event.target;
    if (!form || form.id !== 'catsAuthForm') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const createdAt = Date.now();
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({authenticated:true,createdAt,expiresAt:createdAt+8*60*60*1000,version:3}));
    setTimeout(() => location.reload(), 180);
  }, true);
  window.__syntheticAccessReady = true;
})();`;

const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="cats-build" content="qa-cold-login"></head><body>
<form id="catsAuthForm"><input id="catsAuthInput"><button id="catsAuthSubmit" type="submit">Entrar</button></form>
<button id="googleResource" data-href="https://docs.google.com/presentation/d/fake">02 CATS 2026 - Psicopatologia do comportamento suicida</button>
<script src="https://ricmurtapsicologia.github.io/Curso-ATS/auth-extra.js?v=qa-cold-login"></script>
</body></html>`;

const events = [];
let identityRequests = 0;
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

await page.route('https://ricmurtapsicologia.github.io/Curso-ATS/**', async route => {
  const url = route.request().url();
  if (/\/Curso-ATS\/?(?:\?|$)/.test(url)) return route.fulfill({ status: 200, contentType: 'text/html', body: html });
  if (url.includes('/auth-extra.js')) return route.fulfill({ status: 200, contentType: 'application/javascript', body: authExtra });
  if (url.includes('/course-telemetry.js')) return route.fulfill({ status: 200, contentType: 'application/javascript', body: core });
  if (url.includes('/course-telemetry-adapter.js')) return route.fulfill({ status: 200, contentType: 'application/javascript', body: adapter });
  if (url.includes('/access-2026.js')) return route.fulfill({ status: 200, contentType: 'application/javascript', body: syntheticAccess });
  if (url.includes('/access-hotfix-20260918.js')) return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
  return route.fulfill({ status: 404, body: '' });
});

await page.route('https://secretaria-digital-core.vercel.app/api/course_telemetry/**', async route => {
  const request = route.request();
  const cors = {
    'access-control-allow-origin': 'https://ricmurtapsicologia.github.io',
    'access-control-allow-methods': 'GET,POST,OPTIONS',
    'access-control-allow-headers': 'Content-Type,Authorization',
    'content-type': 'application/json'
  };
  if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors, body: '' });
  if (request.url().endsWith('/identity')) {
    identityRequests += 1;
    const body = request.postDataJSON();
    assert.match(String(body.credential_hash || ''), /^[0-9a-f]{64}$/);
    assert.equal(JSON.stringify(body).includes('1234567'), false, 'raw credential must never leave browser');
    return route.fulfill({ status: 200, headers: cors, body: JSON.stringify({ ok:true, uid:'u_QAColdLoginTelemetry', token:'qa.token.signature.01234567890123456789', expires_in:28800 }) });
  }
  if (request.url().endsWith('/event')) {
    events.push(request.postDataJSON());
    return route.fulfill({ status: 202, headers: cors, body: JSON.stringify({ ok:true, accepted:true }) });
  }
  return route.fulfill({ status: 404, headers: cors, body: '{}' });
});

await page.goto('https://ricmurtapsicologia.github.io/Curso-ATS/', { waitUntil: 'domcontentloaded' });
await page.waitForFunction(() => Boolean(window.CATSCourseTelemetry && window.CATSCourseTelemetryAdapter && window.__syntheticAccessReady));
await page.fill('#catsAuthInput', '1234567');
await page.click('#catsAuthSubmit');

await page.waitForFunction(() => {
  try { return Boolean(JSON.parse(sessionStorage.getItem('cats_course_telemetry_v1') || 'null')?.token); } catch { return false; }
}, null, { timeout: 5000 });

await page.waitForLoadState('domcontentloaded');
await page.waitForFunction(() => Boolean(window.CATSCourseTelemetryAdapter));
await page.waitForTimeout(500);
assert.ok(identityRequests >= 1, 'cold login must establish telemetry identity before/through reload');
assert.ok(events.some(e => e.event === 'page_view' && e.page === 'curso-ats'), `missing page_view: ${JSON.stringify(events)}`);

await page.click('#googleResource');
await page.waitForTimeout(250);
const resourceEvent = events.find(e => e.event === 'content_open' && String(e.content_id).startsWith('google-resource-'));
assert.ok(resourceEvent, `missing Google resource content_open: ${JSON.stringify(events)}`);
assert.match(resourceEvent.content_id, /psicopatologia/);

await browser.close();
console.log(JSON.stringify({ ok:true, identityRequests, events: events.map(({event,page,content_id}) => ({event,page,content_id})) }, null, 2));
