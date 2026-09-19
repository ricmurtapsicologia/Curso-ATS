from __future__ import annotations

from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
AUTH_EXTRA = (ROOT / "auth-extra.js").read_text(encoding="utf-8")
CORE = (ROOT / "course-telemetry.js").read_text(encoding="utf-8")
ADAPTER = (ROOT / "course-telemetry-adapter.js").read_text(encoding="utf-8")

TARGETS = {
    "curso-ats": {
        "url": "https://ricmurtapsicologia.github.io/Curso-ATS/",
        "selector": ".lesson-card",
        "minimum": 4,
    },
    "podcast-ats": {
        "url": "https://ricmurtapsicologia.github.io/Podcast-ATS-CBMMG/",
        "selector": "#seriesGrid",
        "minimum": 1,
    },
    "cats-pouso-alegre": {
        "url": "https://ricmurtapsicologia.github.io/CATS.pousoalegre/",
        "selector": ".card",
        "minimum": 4,
    },
    "cats-precurso": {
        "url": "https://ricmurtapsicologia.github.io/CATS.pousoalegre/precurso.html",
        "selector": "#app",
        "minimum": 1,
    },
}

SESSION_SCRIPT = r"""
(() => {
  const auth = JSON.stringify({authenticated:true,createdAt:Date.now(),expiresAt:Date.now()+8*60*60*1000,version:3});
  sessionStorage.setItem('curso_ats_auth_v3', auth);
  sessionStorage.setItem('gav_auth_v1', auth);
  sessionStorage.setItem('cats_pa_auth_v1', auth);
  sessionStorage.setItem('cats_course_telemetry_v1', JSON.stringify({
    schemaVersion:1,
    uid:'u_wave4synthetic000000000001',
    token:'wave4.synthetic.token.for.browser.regression.000001',
    expiresAt:Date.now()+8*60*60*1000,
    sessionId:'wave4-browser-session-01'
  }));
  localStorage.setItem('ric_analytics_consent','denied');
  localStorage.setItem('curso-ats:onboarding-v2','1');
  window.CATS_COURSE_TELEMETRY_CONFIG = {
    endpoint:'https://telemetry.wave4.invalid/api/course_telemetry',
    authWaitMs:100,
    authPollMs:10
  };
})();
"""


def install_branch_routes(page, events, fail_collector=False):
    page.route("**/Curso-ATS/auth-extra.js*", lambda route: route.fulfill(status=200, content_type="application/javascript", body=AUTH_EXTRA))
    page.route("**/Curso-ATS/course-telemetry.js*", lambda route: route.fulfill(status=200, content_type="application/javascript", body=CORE))
    page.route("**/Curso-ATS/course-telemetry-adapter.js*", lambda route: route.fulfill(status=200, content_type="application/javascript", body=ADAPTER))

    def telemetry(route, request):
        if fail_collector:
            route.abort("failed")
            return
        try:
            events.append(request.post_data_json or {})
        except Exception:
            events.append({"_unparsed": True})
        route.fulfill(status=202, content_type="application/json", body='{"ok":true,"accepted":true,"deduplicated":false}')

    page.route("https://telemetry.wave4.invalid/api/course_telemetry/event", telemetry)
    page.route("**/*.mp3*", lambda route: route.abort("blockedbyclient"))


def assert_surface(page, name, spec):
    response = page.goto(spec["url"], wait_until="domcontentloaded", timeout=60000)
    assert response and response.ok, f"{name}: HTTP failure"
    page.wait_for_timeout(1800)
    locator = page.locator(spec["selector"])
    assert locator.count() >= spec["minimum"], f"{name}: critical selector missing"

    gate = page.locator("#catsAuthGate")
    if gate.count():
        assert not gate.is_visible(), f"{name}: access gate remained visible despite valid session"

    assert page.evaluate("document.documentElement.scrollWidth - window.innerWidth") <= 6, f"{name}: horizontal overflow"

    if name == "cats-precurso":
        frame = page.frame_locator("#app")
        frame.locator("#catsForm").wait_for(timeout=20000)
        form = frame.locator("#catsForm")
        assert form.count() == 1, "precurso: form missing"
        action = form.get_attribute("action") or ""
        assert "docs.google.com/forms" in action, "precurso: Google Forms action regressed"
        assert frame.locator("#catsVerifyAgain").count() == 1, "precurso: persistence verification guard missing"


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        for fail_collector in (False, True):
            mode = "collector-down" if fail_collector else "collector-accepting"
            for name, spec in TARGETS.items():
                context = browser.new_context(viewport={"width": 390, "height": 844})
                context.add_init_script(SESSION_SCRIPT)
                page = context.new_page()
                events = []
                errors = []
                page.on("pageerror", lambda exc: errors.append(str(exc)))
                install_branch_routes(page, events, fail_collector=fail_collector)
                assert_surface(page, name, spec)

                assert not errors, f"{name}/{mode}: page errors: {errors[:3]}"
                adapter = page.evaluate("Boolean(window.CATSCourseTelemetryAdapter)")
                core = page.evaluate("Boolean(window.CATSCourseTelemetry)")
                assert core and adapter, f"{name}/{mode}: Wave 4 sidecar not loaded"

                if not fail_collector:
                    page.wait_for_timeout(400)
                    event_names = [item.get("event") for item in events if isinstance(item, dict)]
                    assert "page_view" in event_names, f"{name}: page_view not emitted"
                    if name == "cats-precurso":
                        assert "precurso_open" in event_names, "precurso: precurso_open not emitted"
                else:
                    assert page.locator(spec["selector"]).count() >= spec["minimum"], f"{name}: collector outage blocked UI"

                print(f"PASS_{name}_{mode}")
                context.close()

        browser.close()

    print("WAVE4_FOUR_SURFACES_OK")


if __name__ == "__main__":
    main()
