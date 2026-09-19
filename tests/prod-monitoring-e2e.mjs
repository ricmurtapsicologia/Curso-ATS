import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const BACKEND = 'https://secretaria-digital-core.vercel.app/api/course_telemetry';
const ORIGIN = 'https://ricmurtapsicologia.github.io';
const ACTIVE_HASH = '6278068d8b6823f8d1974cc72319ec8f4924acbdd1f6df88db9051b6ad618942';

const surfaces = [
  ['curso-ats', 'https://ricmurtapsicologia.github.io/Curso-ATS/'],
  ['cats-pouso-alegre', 'https://ricmurtapsicologia.github.io/CATS.pousoalegre/'],
  ['podcast-ats', 'https://ricmurtapsicologia.github.io/Podcast-ATS-CBMMG/'],
  ['cats-precurso', 'https://ricmurtapsicologia.github.io/CATS.pousoalegre/precurso.html'],
];

async function identity() {
  const response = await fetch(`${BACKEND}/identity`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'origin': ORIGIN,
      'referer': `${ORIGIN}/`,
    },
    body: JSON.stringify({ credential_hash: ACTIVE_HASH, cohort: 'cats-2026-pa' }),
  });
  const body = await response.json();
  assert.equal(response.status, 200, `identity HTTP ${response.status}: ${JSON.stringify(body)}`);
  assert.equal(body.ok, true);
  assert.match(body.uid, /^u_[A-Za-z0-9_-]{12,80}$/);
  assert.equal(typeof body.token, 'string');
  return body;
}

const auth = await identity();
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const [expectedPage, url] of surfaces) {
    const context = await browser.newContext({
      viewport: { width: 1365, height: 768 },
      locale: 'pt-BR',
    });
    const sessionId = `e2e-monitor-${expectedPage}-${Date.now().toString(36)}`;
    await context.addInitScript(({ uid, token, sessionId }) => {
      sessionStorage.setItem('cats_course_telemetry_v1', JSON.stringify({
        schemaVersion: 1,
        uid,
        token,
        expiresAt: Date.now() + 45 * 60 * 1000,
        sessionId,
      }));
    }, { uid: auth.uid, token: auth.token, sessionId });

    const page = await context.newPage();
    const seen = [];
    const responses = [];

    page.on('request', request => {
      if (!request.url().includes('/api/course_telemetry/event')) return;
      try {
        const payload = JSON.parse(request.postData() || '{}');
        seen.push(payload);
      } catch {}
    });

    page.on('response', async response => {
      if (!response.url().includes('/api/course_telemetry/event')) return;
      const record = { status: response.status(), url: response.url(), body: '' };
      responses.push(record);
      try { record.body = await response.text(); } catch {}
    });

    const nav = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    assert.ok(nav, `${expectedPage}: navigation produced no response`);
    assert.ok(nav.status() < 400, `${expectedPage}: navigation HTTP ${nav.status()}`);

    await page.waitForFunction(
      expected => {
        const adapter = window.CATSCourseTelemetryAdapter;
        return Boolean(adapter && adapter.detectPage && adapter.detectPage() === expected);
      },
      expectedPage,
      { timeout: 20_000 },
    );

    const deadline = Date.now() + 20_000;
    while (Date.now() < deadline && !seen.some(e => e.page === expectedPage && e.event === 'page_view')) {
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(1000);

    const pageViews = seen.filter(e => e.page === expectedPage && e.event === 'page_view');
    assert.ok(pageViews.length >= 1, `${expectedPage}: no page_view telemetry request observed; seen=${JSON.stringify(seen)}`);
    assert.ok(seen.every(e => e.page === expectedPage), `${expectedPage}: cross-page telemetry mismatch: ${JSON.stringify(seen)}`);
    assert.ok(seen.every(e => typeof e.session_id === 'string' && e.session_id.startsWith('e2e-monitor-')), `${expectedPage}: E2E session marker missing`);

    const accepted = responses.some(r => r.status === 202 || r.status === 200);
    assert.ok(accepted, `${expectedPage}: backend did not accept telemetry; seen=${JSON.stringify(seen)} responses=${JSON.stringify(responses)}`);

    if (expectedPage === 'cats-precurso') {
      const preOpen = seen.some(e => e.page === 'cats-precurso' && e.event === 'precurso_open');
      assert.ok(preOpen, 'cats-precurso: precurso_open not emitted');
    }

    results.push({
      page: expectedPage,
      navStatus: nav.status(),
      events: [...new Set(seen.map(e => e.event))],
      acceptedStatuses: [...new Set(responses.map(r => r.status))],
      sessionId,
    });

    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({ ok: true, results }, null, 2));
