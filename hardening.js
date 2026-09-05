(() => {
  "use strict";

  const VERSION = "2026-09-05.3";
  const GA_ID = "G-38D052F915";

  const SLIDES_2026 = [
    {
      oldId: "1JaUe1ANJjWOAY2fzWHxFe-aiKbUwLAJB",
      newId: "1EuIjTZ-Eplx5kkF9hNJh5pNIy9_bEQ1ykOzh2OoEFgY",
      title: "Fundamentos do ATS",
      description: "Fundamentos do Atendimento a Tentativas de Suicídio, comportamento suicida, crise, fatores associados e bases para atuação técnica."
    },
    {
      oldId: "1oGkMsxGiAsvUPYueQqx00Z8CC7115Nbs",
      newId: "1tKGhq9upuUsVSYO3mkSTJkG-hDZkHpyIgsDK5Du7SVw",
      title: "Abordagem Técnica no ATS",
      description: "Aplicação da abordagem técnica em ATS, com foco em comunicação, vínculo, escuta e estratégias de intervenção."
    },
    {
      oldId: "1AN2XM7zEMdfKOsQcla39XqN-fpWq_ovp",
      newId: "14riZwvSFlkJ1ob_vxq-fCBU_qy2XVuXcDFtiySjaLLo",
      title: "Cenários Específicos do ATS",
      description: "Reconhecimento e intervenção em cenários específicos do ATS, considerando condições clínicas, comportamentais e operacionais."
    },
    {
      oldId: "1_6dVFpv3trAtLAd2dXSrZbMris95jy1B",
      newId: "16bl_lT9UJlDNQXK3mKEhnE7v2ucoAgAQbS1NVBTujMg",
      title: "Gerenciamento da Ocorrência de ATS",
      description: "Gerenciamento da ocorrência de ATS, coordenação da cena, funções, planejamento e tomada de decisão."
    }
  ];

  const ITO_OLD_ID = "1QW7Wzr6GgBHctNKf7oqTC_I1D0OMHxfA";
  const ITO_2026_ID = "1uAauPvrL-VW3KmVScx-k0UKCnsenbaHC";

  function hardenIndexing() {
    const ensureMeta = (name, content) => {
      let el = document.head.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };
    ensureMeta("robots", "noindex,nofollow,noarchive");
    ensureMeta("googlebot", "noindex,nofollow,noarchive");
    document.documentElement.dataset.atsVersion = VERSION;
  }

  function disableAnalyticsUntilConsent() {
    window[`ga-disable-${GA_ID}`] = true;
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
    }
  }

  function replaceSlideReferences() {
    SLIDES_2026.forEach((item, index) => {
      const card = [...document.querySelectorAll(".lesson-card")].find(el =>
        el.querySelector(`[data-slide-id="${item.oldId}"]`) ||
        el.querySelector(`[href*="${item.oldId}"]`)
      );

      if (card) {
        card.dataset.title = `Encontro ${index + 1}: ${item.title}`;
        const heading = card.querySelector("h3");
        const text = card.querySelector(".card-body > p");
        const badge = card.querySelector(".badge");
        if (heading) heading.textContent = item.title;
        if (text) text.textContent = item.description;
        if (badge) badge.innerHTML = `<i class="ri-slideshow-2-line" aria-hidden="true"></i> Encontro ${index + 1} • 2026`;
      }

      document.querySelectorAll(`[data-slide-id="${item.oldId}"]`).forEach(el => {
        el.dataset.slideId = item.newId;
      });

      document.querySelectorAll(`a[href*="${item.oldId}"]`).forEach(a => {
        a.href = a.href.replace(item.oldId, item.newId);
      });
    });
  }

  function replaceItoReference() {
    document.querySelectorAll(`a[href*="${ITO_OLD_ID}"]`).forEach(a => {
      a.href = `https://drive.google.com/file/d/${ITO_2026_ID}/view`;
      a.textContent = "ITO Nº 30 — 2ª edição, revisão 2026 (v3.7 canônica)";
      a.dataset.canonicalSource = "ITO30-v3.7-2026";
    });
  }

  function isolateBackground(locked) {
    const gate = document.getElementById("catsAuthGate");
    [...document.body.children].forEach(el => {
      if (el === gate || el.tagName === "SCRIPT") return;
      if (locked) {
        if (!el.hasAttribute("data-auth-prev-aria-hidden")) {
          el.setAttribute("data-auth-prev-aria-hidden", el.getAttribute("aria-hidden") ?? "__none__");
        }
        el.inert = true;
        el.setAttribute("aria-hidden", "true");
      } else {
        el.inert = false;
        const previous = el.getAttribute("data-auth-prev-aria-hidden");
        if (previous === "__none__") el.removeAttribute("aria-hidden");
        else if (previous !== null) el.setAttribute("aria-hidden", previous);
        el.removeAttribute("data-auth-prev-aria-hidden");
      }
    });
  }

  function gateIsLocked() {
    const gate = document.getElementById("catsAuthGate");
    return Boolean(gate && !gate.hidden);
  }

  function syncGateIsolation() {
    isolateBackground(gateIsLocked());
  }

  function trapGateFocus(event) {
    if (event.key !== "Tab" || !gateIsLocked()) return;
    const gate = document.getElementById("catsAuthGate");
    if (!gate) return;
    const focusable = [...gate.querySelectorAll(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    )].filter(el => !el.hidden && el.getClientRects().length > 0);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    } else if (!gate.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
    }
  }

  function observeGate() {
    const start = () => {
      const gate = document.getElementById("catsAuthGate");
      if (!gate) return false;
      syncGateIsolation();
      new MutationObserver(syncGateIsolation).observe(gate, {
        attributes: true,
        attributeFilter: ["hidden", "class"]
      });
      return true;
    };

    if (start()) return;
    const observer = new MutationObserver(() => {
      if (start()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true });
  }

  function init() {
    hardenIndexing();
    disableAnalyticsUntilConsent();
    replaceSlideReferences();
    replaceItoReference();
    observeGate();
    document.addEventListener("keydown", trapGateFocus, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
