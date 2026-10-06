(() => {
  "use strict";

  // Política canônica de acesso complementar para as três páginas:
  // Aulas ATS, VIII CATS Pouso Alegre e Podcast Ampulheta.
  // Somente hashes SHA-256 são publicados.
  const EXTRA_HASHES = new Set([
    "66e876aef0a8cbf432175f54ffae266fab1946a99e70ad60b8cbad9e780f9a51",
    "1bd2fd2ad645a7d6413629f09a5b6e43fc1812188159389cc5ea06ef2e32d3ce",
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
    "6278068d8b6823f8d1974cc72319ec8f4924acbdd1f6df88db9051b6ad618942",
    "8cdbb7e572c6ec0e306b56abbfffa8021845515ab615a7eb471c55272f7ce2f4",
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
    "c74996532bbe376d348510e44e382d634333096768ba6908e1d61067ad4fcc48",
    "5f6a8f8366adde3931d6b32f8d036a7b29fcd8f93a09610928a456f2e32c7410",
    "f5bb78ae6f90019d743ad959f2ad4c8dc6fab91a0122a3af1c67ca380200e93d",
    "48c07f2903eb9e0c11478d17b8caa457e849e7667f592397986126f44e23dafa",
    "e183b2c36352f04f75e73e1e1062a79d244b34712e648b6fd420eb2f67e4da4c",
    "588ff7c7bd91e4c7b00a0116f8f0e5dd1e18892ac9d2354c11466594f92d2569",
    "3283d28d0e3c991d10da9dca843aa85c89668b9a0482b4daf198ad7c9de06289",
    "bcfbb4d9c8eb8a01e0fcc6dfb377733d6af7dcc058dc32c049a147769c9926e6",
    "b99374538f716fa0bb4f37ca149ff02bc32f8be98d0cb707171abb9db595a12e",
    "33c541ce5cfa43ed0447f67ea6ef96c65f61da257d56099451f8760ba56e34c7",
    "b5575b8bb873f37cfcf809cd4b52747814a3ccdcd4a5fe1c6f8540dd37fdc6f3"
,
    "c3e48625806817d83791c7160e0d5b3f4231d14b6b3923dce5b062c7e69eacb1",
    "11615233a92b3ba7ba575d0df382c216fe5fe97b89d22739510df8741875b3f5",
    "a124b68fa935dc6f3b43771546ea05c47afb824cd0703bb64471d6df078b8205",
    "706f79d3209c34b437cbd575bd7fbbce09c34b01d7334a5fb8ac9956d0eb321a",
    "ba500e2afa776907b504010c662246529c6fe52f17c9dae6750a378bd7dd58f5",
    "387735c691f46be752f735442257303a6e26ba4512f74aa1eb16e574cf720a55",
    "f916be48af98b515efa7629ee12ee079905676b9423dbfa94bb4348be8a94df3",
    "7339f16c063d10b92808b6701f3cde67418e6b6d061804124002767ed7f8990d",
    "8d54770d8018b404e6c337d20988b4909f4616faab87ae9b0dcaaa2eea1fb485",
    "be46e1b158b1414c67e7dc45f16b60fd62f18a0f39d29ac7a0429395627c8998",
    "9fd664947cd113af3d67b7bfe992b13b6f7b380f814ab8665af3c5bcb6fe12fa",
    "9b31f73f58a46490a66bf14edcfbdc6648cfd3bb4fe3522881e3a667e8038aee",
    "c499d9831f42b52b0f3d79b4d317a8d394114d595755f8c9bf4dbc9986a3b0a4",
    "4bfa9e8b038264467dd8b35a91ebf9fbf614d597f23b0c0bff1655006437f5b9",
    "63cc058da675594f5f163131df0681e74416a1092c9923a3aca2039c27eeb3b7",
    "a6aae71c7ac223e91a879b9f6dfd8a12428347ff13ca200c96e37fe6a2b89845",
    "bbc9a65376b68ac09c0e5145184fe75d44c9ca4dc190c420e7980966f146f7dc",
    "95360a7b75b9cf0c1ebf11b6bce534ad67dc9299b4ccab5574aaf3e19b430e28",
    "8395d37c5ddadbaa3ce70e3dad89086a0a73e25d5b7d1609b3c8acf2cb387e28",
    "2b6051e185932f9db92f4120ede2f1065928809d0839248b02dd2fce790bb52d",
    "c6d66ccc3141915d90fcf834100a7bbb09fb7408c216b59525ca91779fd8425b",
    "65e6958447789396aa80bef59b1e10cf1d6eaf38499d71d06a48b04b05a58668",
    "7c370b40b07f4e2617608686940b0cf769ba5d1facde7714ed331c56085271f2",
    "d4caa56182e40397e2ba96ac052d5a2dee9292cfea4e8e365bdba66dc8be2f96",
    "bca5d89752503dd8cfda1bd89ddc2bf35c74b1b98e222b3ee50a94622ffd357a",
    "08c7223cfa9b5117f75047507c33bd7000a6e67a35ad8cb0e6cb429d990f942c",
    "58d515a22b7185b40e271afeff37a3b705fa025ad270bc836690b93d670851da",
    "fc34141241dbc46a0c8acdb0414b9ecaf17c6f2d51b09a93e4f8fcc01335f9b1",
    "8fa3c6e6f8cd2550b21b482905b02d453a7a8b7c08dbad564d0a13a800b23018",
    "376e145ba4fde00ad5f5498a86c698e0d77140efdea6af080f624158802433c9",
    "7663e2081608ace9b57b9b53f349f1587f2c7a3dd86fb722563ab9aa5eee6f6e",
    "30689a6246dbf5fa95ab3e0224d45e151668e6e962c9d361500bca86e37d7bfc",
    "de9b4650cf6494123b288d9848e562a875a1f6f45c2dc84dfcfaea7f7f25255d",
    "380ee3c68493e615b54ab7906f36fdd43a2f22927af0fbc81ac95816db6f6425",
    "49f7a27799b2868b8eeff5fa7035078c743f1448b67c27727656d445f7323874",
    "5bb06fc892e7917a956c0bc125fd5d801ae2d847803777ebe0aa8db4cc229eff",
    "80fd8927772bd14cb45c2a1ce846b0e8c5867c6265406b110bad93c271ae7920",
    "91f37a44b206c7a279db7316949d50e127a54092c3aa38a9a6e0d57dafbfcae3",
    "6c8f97c7f6a1c3aad577f13277889433f268b7a8cfcd2b37a039213c173320d1",
    "706aafaf3cd91db654ddb08264b5d75c29429254151dde218e3b4262be38e2fe",
    "0da56f921430bb20c967d8841415befda55cfacdedab7c76e74ec51e96b64569",
    "e6826419a35d4dcdb20596c3b6281314e2fb201bcfb9c82132c1479193950496",
    "d826f00cf54e5c2b40d1511b1cb4913975b3db8d04959e776c056c657e0f6d2f",
    "43b68fccd68a841543eaf40f77a1666e4ff2ebca6aa576fa622816863fbb0db8",
    "06c450173e03c84e35575565761015761029882944a07e0aaab92d360698f734",
    "4270306b7e300953004b3ec5caafda1a0aba767fdbc62af40143d4bfe906f7fc",
    "ac4044be34a3f02da77337c750da32783d24ae2cf87d59bed073e2f8d61ccf40",
    "9e6d0a23ff594b770a63455419677c93fc0915ae1dae0b82dcf6f13dd86a822a",
    "7faeb0bbb2d378ddc9cdd8c141bfe2f3cac582767b8ea10cc8ed03ceda4382cf",
    "49dae60d02f9beed0017355bca648efb8f693cfdf30d1cb40df24352749f9c31",
    "d473881370cceb1c7b816d5b30921533b4c05da5edd6cad01658a92cc6193d51",
    "016f1d28cdb3256857817877c9a8f70bb8a1365271d3d23dcdae9f927c5653ae",
    "f9c37af7406ab4a70e38fc7520cbb607f7f28bf412d1bb52770601597bc07179",
    "25c73354fdd43e58e07131387c36b6fdfffb7d4173bab677d2b14e0b4e33077c",
    "6a8c3975b2613b3137f6a6c8d9d183341e27978758a06909d1d513368076488c",
    "31492f6b7dc4701420280a0d4ee97e178434f66947df9fb13efd5499e5b7153f",
    "e1814649e968c6bccba1f918efeebe12d4ddb25b05993f2bfc362d6ff884665b",
    "a5c08ae2dfac60fe69bdad03502d2cc1092f4a8299c0a9589a6948acb7041a67",
    "270b9ec796151d5212bc0e69d6b384f8fdfcfce38f059eff71c24e6fbd72a726",
    "2aba0790a35c2df7709124352a4219e936cdb8267dbdbf1043f167b5563fa0ee"
  ]);

  const SESSION_KEY = "curso_ats_auth_v3";
  const ATTEMPTS_KEY = "ats_login_attempts_v3";
  const TTL_MS = 8 * 60 * 60 * 1000;
  const SHARED_BYPASS = "catsAccessBypass";

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

  function retryBase(form) {
    form.dataset[SHARED_BYPASS] = "1";
    try {
      form.requestSubmit();
    } finally {
      queueMicrotask(() => { delete form.dataset[SHARED_BYPASS]; });
    }
  }

  function intercept(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.id !== "catsAuthForm") return;
    if (form.dataset[SHARED_BYPASS] === "1") return;

    const input = form.querySelector("#catsAuthInput");
    const credential = normalize(input?.value);
    if (!/^(?:\d{7}|\d{11})$/.test(credential)) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    sha256Hex(credential).then(hash => {
      if (EXTRA_HASHES.has(hash)) {
        saveSession();
        successUi(form);
        window.setTimeout(() => window.location.reload(), 180);
        return;
      }
      retryBase(form);
    }).catch(() => retryBase(form));
  }

  document.addEventListener("submit", intercept, true);
})();