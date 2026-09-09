(() => {
  "use strict";

  // Complemento canônico 09/09/2026: instrutores + alunos convocados.
  // 60 matrículas militares únicas; somente hashes SHA-256 são publicados.
  const EXTRA_HASHES = new Set([
    "facadc5f08021d016764f8a6879f008d31a57d1d5e6b9b35b5303a57c0edc64f",
    "7fc12a8bfaf88cc82a3f3f79a0a97a1be8dc2150739b9b21f9acb39d525c65ef",
    "2ed7359735cfe59a52f9010748e18305f1e223c7b3d7905de51e622900609651",
    "bdd707fafc18d604e5dc7216f46e3b02150da5d32669290c5bb94c77ed83d33c",
    "9f0ea12159aef1682c5e0f8c35c156c2ccf66135dbf86cf933f74db5da21af83",
    "6b3af9226d47c534419db11c2d788cd3d05f4f6a9240e26e79be9f84b4a36dc1",
    "a2d0c0651a442935ed18d81c8c460318edb3bab692f7d0321bbcd5a3cb8d7ddb",
    "75b0d48a835dfa023163625ae6349ee67e20338d769dbda48bb3a36be389ee88",
    "cf2c81ffca9ad9255fd8238322f5446826b99ce61facb246443e8602280b7261",
    "5fc1db36657d76e82316a6d2890238da8fffc8fadd1bd831aff8d1aaf373ab55",
    "643e7057eb9522cb1275059f2d1427679c2d030e3dc3e18eafa551a846b89641",
    "519875c1dff298e9e32088eacc3815cf8fc6189a1c577f086569caeb99532ee0",
    "554eeead395392ae357ea1cf05da68d13833e6f31e12307a3ec47806485acea9",
    "2d5f07d8990cf268a9ec9f8ec3bf31f1bdf84ebd848b74c36df985b537628928",
    "5d23a0b40af848d45c820d70bf87ffb94eecab44c410a5b0ecbfd773a39fdc95",
    "fb71dc75341df805c1832bce6b0135437077a658af5dfb318a80c89f62c03e69",
    "d043d875f65ea2ce96c13890821133ae61f4c78b5b337609052f3758854bfcea",
    "8d075d8a7176cf3f7cb3d53f4b31a7bccf3300b7f8d0d6efde1f639d9450be8b",
    "f47bf68e21b4faea0936d6f2dec6e8259ebc971928b7dd6264f855253569f3ec",
    "f0346a2b8d245870c757decd91cf05739781840672d696623919af0d293088c9",
    "ed762b911aeb195c03cfa924b41c8734c3365176c110f960350e60450af83c49",
    "fcb2ea3b81b13c9156c2565bc15d019729f012a87f0fcd341a184c108c2eb388",
    "72a2e2d8cf285ee5da20f4f6b3c658fef4fff37bd6b80fe7ab44abd42ba6b5e4",
    "80a98584115f33882a1133cde999429d4aa601cf0f7f8dee69b64ba573ef70fd",
    "71655f67d7e85a6cd2d0ed6149a9680c69f9851dda481fae7a50f5c9033abdb7",
    "5d57c7c444759c7267cd775b6d58a1660334f7930a46ca69376332998f58c11b",
    "6278068d8b6823f8d1974cc72319ec8f4924acbdd1f6df88db9051b6ad618942",
    "8cdbb7e572c6ec0e306b56abbfffa8021845515ab615a7eb471c55272f7ce2f4",
    "3357b0727e0aa095fb98ef6e8a20de7a3e503187c9a13b159c3cac1d41f7dcce",
    "30b3b58c449cfff87be9e3da8593d42e5fb3531aadfd4d2cd46b13364d8be591",
    "28fb1a33516a5c9c8f948322f1fc08918bb09c46896ef5bc63b9d03503538902",
    "0639abd8bba5d3d814538040ffe30d0d7c5a6469396c56a9ba006aba2ffd70cf",
    "4db25b5e8d80e30f0a437ae7d1538f3734cd3fcda6707ee4a0f9d4e71024e121",
    "f4ab5b71c20364ebd1ade67b176a2ca20e80d830abdbc19041d2b1be60a87756",
    "933d49e2aa12ec206ea93128fc7d414e38e733fff5762648bb0c00389e3ccaa9",
    "b560d377cfb47abbd4252378efef9dd13c292187037ba9bc719dbf5771a78104",
    "7b3f3a35d718c7299acb98c03446ecefcd76e824faff763264fbabf244b2a74c",
    "368b2bad27d2ba352bc44daae492dbf77cd1345f0f9587d5fb38538c8a76764e",
    "b2ec68728627292fa27043e1b1be0370936b4227d2a033a6672a5674fe16bb8f",
    "a71b38ffbc421d9d7ed23433567ef42a45bc01113f7c71949e7d45b2298d6acb",
    "ccd60fc68ed3c1a50f24be0871ddb819759b3b5ed32d2281635a3c5ba35e4709",
    "95b3c0c72102b306835be9a32b04219f55a3003b84f16b14c9a68ec90cc450a5",
    "41bbe914fbb7f6297c8890cfdc2afbdd57a8321e1a37cc864cb13bbb8f2cbd03",
    "ab9164f2b8aae7b0d2ab27fc6846661457405d0fb65bab8206226da6f7e50adf",
    "9fc0a8a68667af6fded257602bd5d8aa40ff1a1a03afc95e1fb1cb0b3027f3e2",
    "241660eb05bafd12854a60eae8d6df91e0fcfcaf86c5cfa6a448c84053f853a9",
    "6a0328bb3925b995fbbd0035897fa10807ced8ebac16b432c880833d790163f0",
    "8b9c8fa6b38bb0e39a506b0d5148571bdc278ea2a53aad8f353f35b2faf872e6",
    "80bba27d54ccabb6b22d47f4d4773c312228fba70f6e239e557bf4a2dd68442e",
    "af91f2d667c8db9bf2b2fe4da9f1287834a1be6f672fb6d8470c876988cec5db",
    "5a78d95fb49b359b22991ae1a127196f09bd4071da2497ce7bac24966fca0d1b",
    "8e0d06cd41deda86c776e1a041ee19d5e134e985ea97ac27b5dd4930d0946418",
    "9bd0123c47240b15376c40dbc3066e9244ac82332870cc3eea0bc29cf19f922c",
    "6c41b7ceacf87ab03e6bdcb46c13750985db35f827e3f20e88dd589e4b9d22c7",
    "9a535c2bc90cc17cce8132d925201266b1b036b88d68f303338d3f0256699681",
    "969e7d92d611e819cc6d34b52b448d3eb3e1faf0fe6c395e6a801ab6d9cd25df",
    "381e347c1c0cb03dd06bd081e04f3ee6d71174090eb4c5442d75949e5e7be796",
    "fdb73883218e9e7b1f378573efffee9ff14f7d52b97a8c1cf5064e639d4ff9c4",
    "6e1e9703cc8c6852fb00f7304765a9e3b5a4c1050db9bf71ea3bf99e60b0cab0",
    "c74996532bbe376d348510e44e382d634333096768ba6908e1d61067ad4fcc48"
  ]);

  const SESSION_KEY = "curso_ats_auth_v3";
  const ATTEMPTS_KEY = "ats_login_attempts_v3";
  const TTL_MS = 8 * 60 * 60 * 1000;

  const normalize = value => {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "";
    return /^[\d.\-\s]+$/.test(raw) ? raw.replace(/\D+/g, "") : raw;
  };

  async function sha256Hex(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  function saveSession() {
    const createdAt = Date.now();
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        authenticated: true,
        createdAt,
        expiresAt: createdAt + TTL_MS,
        version: 3
      }));
      localStorage.removeItem(ATTEMPTS_KEY);
    } catch {}
  }

  function successUi(form) {
    const input = form.querySelector("#catsAuthInput");
    const msg = form.querySelector("#catsAuthMessage");
    const text = form.querySelector("#catsAuthMessageText");
    const button = form.querySelector("#catsAuthSubmit");
    if (input) { input.setAttribute("aria-invalid", "false"); input.disabled = true; }
    if (msg) { msg.classList.add("is-visible"); msg.dataset.tone = "success"; }
    if (text) text.textContent = "Acesso autorizado. Abrindo o ambiente.";
    if (button) button.disabled = true;
  }

  function intercept(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== "catsAuthForm") return;

    if (form.dataset.extraAuthBypass === "1") {
      delete form.dataset.extraAuthBypass;
      return;
    }

    const input = form.querySelector("#catsAuthInput");
    const credential = normalize(input?.value);
    if (!/^\d{7}$/.test(credential)) return;

    // Bloqueia esta submissão enquanto verifica o complemento. Se não estiver
    // nele, reenvia uma única vez para a base canônica de auth.js.
    event.preventDefault();
    event.stopImmediatePropagation();

    sha256Hex(credential).then(hash => {
      if (EXTRA_HASHES.has(hash)) {
        saveSession();
        successUi(form);
        window.setTimeout(() => window.location.reload(), 180);
        return;
      }
      form.dataset.extraAuthBypass = "1";
      form.requestSubmit();
    }).catch(() => {
      form.dataset.extraAuthBypass = "1";
      form.requestSubmit();
    });
  }

  document.addEventListener("submit", intercept, true);
})();
