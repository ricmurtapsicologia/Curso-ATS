(() => {
  "use strict";

  const ROOT = typeof window !== "undefined" ? window : globalThis;
  const AUTH_SESSION_KEY = "curso_ats_auth_v3";
  const TELEMETRY_SESSION_KEY = "cats_course_telemetry_v1";
  const COHORT = "cats-2026-pa";
  const DEFAULT_AUTH_WAIT_MS = 1600;
  const DEFAULT_AUTH_POLL_MS = 25;

  let credentialInMemory = "";
  let mounted = false;
  let identityPromise = null;
  let authPollTimer = null;

  const now = () => Date.now();

  const normalizeCredential = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    return /^[\d.\-\s]+$/.test(raw) ? raw.replace(/\D+/g, "") : raw;
  };

  const validCredential = (value) => /^(?:\d{7}|\d{11})$/.test(value);

  const safeSessionStorage = () => {
    try {
      return ROOT.sessionStorage || null;
    } catch {
      return null;
    }
  };

  const readJson = (key) => {
    const storage = safeSessionStorage();
    if (!storage) return null;
    try {
      const value = storage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  };

  const writeJson = (key, value) => {
    const storage = safeSessionStorage();
    if (!storage) return false;
    try {
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  };

  const removeKey = (key) => {
    const storage = safeSessionStorage();
    if (!storage) return;
    try {
      storage.removeItem(key);
    } catch {}
  };

  const authState = () => {
    const state = readJson(AUTH_SESSION_KEY);
    if (!state || state.authenticated !== true || Number(state.version) !== 3) return null;
    const expiresAt = Number(state.expiresAt || 0);
    if (!Number.isFinite(expiresAt) || expiresAt <= now()) return null;
    return state;
  };

  const telemetrySession = () => {
    const state = readJson(TELEMETRY_SESSION_KEY);
    if (!state || Number(state.schemaVersion) !== 1) return null;
    if (!/^u_[A-Za-z0-9_-]{12,80}$/.test(String(state.uid || ""))) return null;
    if (typeof state.token !== "string" || state.token.length < 20 || state.token.length > 4096) return null;
    const expiresAt = Number(state.expiresAt || 0);
    if (!Number.isFinite(expiresAt) || expiresAt <= now() + 5_000) return null;
    if (typeof state.sessionId !== "string" || !/^[A-Za-z0-9_.:-]{8,64}$/.test(state.sessionId)) return null;
    return state;
  };

  const clearTelemetrySession = () => removeKey(TELEMETRY_SESSION_KEY);

  const randomSessionId = () => {
    try {
      if (ROOT.crypto?.randomUUID) return ROOT.crypto.randomUUID().replace(/-/g, "");
      const bytes = new Uint8Array(16);
      ROOT.crypto.getRandomValues(bytes);
      return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    } catch {
      return `s_${now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
    }
  };

  const config = () => {
    const raw = ROOT.CATS_COURSE_TELEMETRY_CONFIG || {};
    const endpoint = String(raw.endpoint || "").trim().replace(/\/+$/, "");
    return {
      endpoint,
      authWaitMs: Math.max(100, Math.min(Number(raw.authWaitMs) || DEFAULT_AUTH_WAIT_MS, 5_000)),
      authPollMs: Math.max(10, Math.min(Number(raw.authPollMs) || DEFAULT_AUTH_POLL_MS, 250)),
    };
  };

  const endpointAllowed = (value) => {
    if (!value) return false;
    try {
      const parsed = new URL(value, ROOT.location?.href || "https://example.invalid/");
      if (parsed.protocol === "https:") return true;
      return parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname);
    } catch {
      return false;
    }
  };

  const sha256Hex = async (value) => {
    if (!ROOT.crypto?.subtle) throw new Error("WEBCRYPTO_UNAVAILABLE");
    const bytes = new TextEncoder().encode(value);
    const digest = await ROOT.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
  };

  const rememberCredential = (rawValue) => {
    const normalized = normalizeCredential(rawValue);
    credentialInMemory = validCredential(normalized) ? normalized : "";
    return Boolean(credentialInMemory);
  };

  const clearCredential = () => {
    credentialInMemory = "";
  };

  const persistIdentity = (payload) => {
    const uid = String(payload?.uid || "");
    const token = String(payload?.token || "");
    const expiresIn = Number(payload?.expires_in || 0);
    if (!/^u_[A-Za-z0-9_-]{12,80}$/.test(uid)) throw new Error("INVALID_UID_RESPONSE");
    if (token.length < 20 || token.length > 4096) throw new Error("INVALID_TOKEN_RESPONSE");
    if (!Number.isFinite(expiresIn) || expiresIn < 60 || expiresIn > 86_400) throw new Error("INVALID_EXPIRY_RESPONSE");
    const previous = telemetrySession();
    const state = {
      schemaVersion: 1,
      uid,
      token,
      expiresAt: now() + expiresIn * 1000,
      sessionId: previous?.sessionId || randomSessionId(),
    };
    writeJson(TELEMETRY_SESSION_KEY, state);
    return state;
  };

  const requestIdentity = async () => {
    const reusable = telemetrySession();
    if (reusable) return { ok: true, status: "session_reused", session: reusable };
    if (!authState()) return { ok: false, status: "auth_required" };
    if (!credentialInMemory) return { ok: false, status: "credential_unavailable" };

    const { endpoint } = config();
    if (!endpointAllowed(endpoint)) return { ok: false, status: "endpoint_unavailable" };
    if (identityPromise) return identityPromise;

    identityPromise = (async () => {
      const rawCredential = credentialInMemory;
      clearCredential();
      try {
        const credentialHash = await sha256Hex(rawCredential);
        const response = await ROOT.fetch(`${endpoint}/identity`, {
          method: "POST",
          mode: "cors",
          credentials: "omit",
          cache: "no-store",
          redirect: "error",
          referrerPolicy: "no-referrer",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential_hash: credentialHash, cohort: COHORT }),
        });
        if (!response?.ok) return { ok: false, status: "identity_rejected", httpStatus: Number(response?.status || 0) };
        const payload = await response.json();
        if (payload?.ok !== true) return { ok: false, status: "identity_rejected" };
        const session = persistIdentity(payload);
        return { ok: true, status: "identity_ready", session };
      } catch {
        return { ok: false, status: "identity_unavailable" };
      } finally {
        clearCredential();
        identityPromise = null;
      }
    })();

    return identityPromise;
  };

  const waitForExistingAuthentication = () => {
    if (authPollTimer) return;
    const { authWaitMs, authPollMs } = config();
    const deadline = now() + authWaitMs;
    const tick = () => {
      authPollTimer = null;
      if (authState()) {
        void requestIdentity();
        return;
      }
      if (now() >= deadline || !credentialInMemory) return;
      authPollTimer = ROOT.setTimeout(tick, authPollMs);
    };
    authPollTimer = ROOT.setTimeout(tick, 0);
  };

  const captureInput = (event) => {
    const target = event?.target;
    if (!target || target.id !== "catsAuthInput") return;
    rememberCredential(target.value);
  };

  const observeSubmit = (event) => {
    const form = event?.target;
    if (!form || form.id !== "catsAuthForm") return;
    const input = form.querySelector?.("#catsAuthInput");
    if (input) rememberCredential(input.value);
    waitForExistingAuthentication();
  };

  const onAuthenticatedSignal = () => {
    if (!authState()) return;
    void requestIdentity();
  };

  const mount = () => {
    if (mounted || !ROOT.document?.addEventListener) return false;
    mounted = true;
    ROOT.document.addEventListener("input", captureInput, true);
    ROOT.document.addEventListener("submit", observeSubmit, true);
    ROOT.addEventListener?.("cats:authenticated", onAuthenticatedSignal, { passive: true });
    return true;
  };

  const debugState = () => ({
    mounted,
    hasCredentialInMemory: Boolean(credentialInMemory),
    authenticated: Boolean(authState()),
    telemetrySessionReady: Boolean(telemetrySession()),
    endpointConfigured: endpointAllowed(config().endpoint),
  });

  ROOT.CATSCourseTelemetry = Object.freeze({
    mount,
    rememberCredential,
    requestIdentity,
    getSession: telemetrySession,
    clearSession: clearTelemetrySession,
    isAuthenticated: () => Boolean(authState()),
    debugState,
    version: "1.0.0-wave2",
  });

  if (ROOT.document?.readyState === "loading") {
    ROOT.document.addEventListener("DOMContentLoaded", mount, { once: true });
  } else {
    mount();
  }
})();
