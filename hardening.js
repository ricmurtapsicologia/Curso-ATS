(() => {
  "use strict";

  const VERSION = "2026-09-09.4";
  const GA_ID = "G-38D052F915";
  const PAGE_URL = "https://ricmurtapsicologia.github.io/Curso-ATS/";
  const PAGE_TITLE = "Atendimento a Tentativas de Suicídio | Aulas ATS — CBMMG";
  const PAGE_DESCRIPTION = "Material de apoio às aulas de Atendimento a Tentativas de Suicídio (ATS): apresentações, referências técnicas, vídeos e conteúdos institucionais do CBMMG.";
  const PAGE_IMAGE = "https://i.pinimg.com/originals/33/9d/0c/339d0cc2f05bbb719debe6a5efb414dd.jpg";

  const SLIDES_2026 = [
    ["1JaUe1ANJjWOAY2fzWHxFe-aiKbUwLAJB","1EuIjTZ-Eplx5kkF9hNJh5pNIy9_bEQ1ykOzh2OoEFgY","Fundamentos do ATS","Fundamentos do Atendimento a Tentativas de Suicídio, comportamento suicida, crise, fatores associados e bases para atuação técnica."],
    ["1oGkMsxGiAsvUPYueQqx00Z8CC7115Nbs","1tKGhq9upuUsVSYO3mkSTJkG-hDZkHpyIgsDK5Du7SVw","Abordagem Técnica no ATS","Aplicação da abordagem técnica em ATS, com foco em comunicação, vínculo, escuta e estratégias de intervenção."],
    ["1AN2XM7zEMdfKOsQcla39XqN-fpWq_ovp","14riZwvSFlkJ1ob_vxq-fCBU_qy2XVuXcDFtiySjaLLo","Cenários Específicos do ATS","Reconhecimento e intervenção em cenários específicos do ATS, considerando condições clínicas, comportamentais e operacionais."],
    ["1_6dVFpv3trAtLAd2dXSrZbMris95jy1B","16bl_lT9UJlDNQXK3mKEhnE7v2ucoAgAQbS1NVBTujMg","Gerenciamento da Ocorrência de ATS","Gerenciamento da ocorrência de ATS, coordenação da cena, funções, planejamento e tomada de decisão."]
  ];

  const ITO_OLD_ID = "1QW7Wzr6GgBHctNKf7oqTC_I1D0OMHxfA";
  const ITO_2026_ID = "1uAauPvrL-VW3KmVScx-k0UKCnsenbaHC";

  function setMeta(selector, attrs) {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      document.head.appendChild(el);
    }
    Object.entries(attrs).forEach(([key,value]) => el.setAttribute(key,value));
    return el;
  }

  function setupSeo() {
    document.title = PAGE_TITLE;
    setMeta('meta[name="robots"]',{name:"robots",content:"index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"});
    setMeta('meta[name="googlebot"]',{name:"googlebot",content:"index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"});
    setMeta('meta[name="description"]',{name:"description",content:PAGE_DESCRIPTION});
    setMeta('meta[property="og:title"]',{property:"og:title",content:PAGE_TITLE});
    setMeta('meta[property="og:description"]',{property:"og:description",content:PAGE_DESCRIPTION});
    setMeta('meta[property="og:url"]',{property:"og:url",content:PAGE_URL});
    setMeta('meta[property="og:type"]',{property:"og:type",content:"website"});
    setMeta('meta[property="og:site_name"]',{property:"og:site_name",content:"CBMMG — Aulas ATS"});
    setMeta('meta[property="og:locale"]',{property:"og:locale",content:"pt_BR"});
    setMeta('meta[property="og:image"]',{property:"og:image",content:PAGE_IMAGE});
    setMeta('meta[property="og:image:secure_url"]',{property:"og:image:secure_url",content:PAGE_IMAGE});
    setMeta('meta[property="og:image:alt"]',{property:"og:image:alt",content:"Material de apoio às aulas de Atendimento a Tentativas de Suicídio — CBMMG"});
    setMeta('meta[name="twitter:card"]',{name:"twitter:card",content:"summary_large_image"});
    setMeta('meta[name="twitter:title"]',{name:"twitter:title",content:PAGE_TITLE});
    setMeta('meta[name="twitter:description"]',{name:"twitter:description",content:PAGE_DESCRIPTION});
    setMeta('meta[name="twitter:image"]',{name:"twitter:image",content:PAGE_IMAGE});

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = PAGE_URL;

    if (!document.getElementById("atsStructuredData")) {
      const schema = document.createElement("script");
      schema.id = "atsStructuredData";
      schema.type = "application/ld+json";
      schema.textContent = JSON.stringify({
        "@context":"https://schema.org",
        "@type":"Course",
        "name":"Atendimento a Tentativas de Suicídio (ATS)",
        "description":PAGE_DESCRIPTION,
        "url":PAGE_URL,
        "inLanguage":"pt-BR",
        "provider":{"@type":"Organization","name":"Corpo de Bombeiros Militar de Minas Gerais","alternateName":"CBMMG"}
      });
      document.head.appendChild(schema);
    }
    document.documentElement.dataset.atsVersion = VERSION;
  }

  function disableAnalyticsUntilConsent() {
    window[`ga-disable-${GA_ID}`] = true;
    if (typeof window.gtag === "function") window.gtag("consent","update",{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"});
  }

  function replaceSlideReferences() {
    SLIDES_2026.forEach(([oldId,newId,title,description],index) => {
      const card = [...document.querySelectorAll(".lesson-card")].find(el => el.querySelector(`[data-slide-id="${oldId}"]`) || el.querySelector(`[href*="${oldId}"]`));
      if (card) {
        card.dataset.title = `Encontro ${index + 1}: ${title}`;
        const h = card.querySelector("h3"), p = card.querySelector(".card-body > p"), badge = card.querySelector(".badge");
        if (h) h.textContent = title;
        if (p) p.textContent = description;
        if (badge) badge.innerHTML = `<i class="ri-slideshow-2-line" aria-hidden="true"></i> Encontro ${index + 1} • 2026`;
      }
      document.querySelectorAll(`[data-slide-id="${oldId}"]`).forEach(el => el.dataset.slideId = newId);
      document.querySelectorAll(`a[href*="${oldId}"]`).forEach(a => a.href = a.href.replace(oldId,newId));
    });
  }

  function replaceItoReference() {
    document.querySelectorAll(`a[href*="${ITO_OLD_ID}"]`).forEach(a => {
      a.href = `https://drive.google.com/file/d/${ITO_2026_ID}/view`;
      a.textContent = "ITO Nº 30 — 2ª edição, revisão 2026 (v3.7 canônica)";
      a.dataset.canonicalSource = "ITO30-v3.7-2026";
    });
  }

  function addShareButton() {
    const actions = document.querySelector(".hero-actions");
    if (!actions || document.getElementById("atsShareButton")) return;
    const button = document.createElement("button");
    button.id = "atsShareButton";
    button.type = "button";
    button.className = "btn ghost";
    button.innerHTML = '<i class="ri-share-forward-line" aria-hidden="true"></i> Compartilhar';
    button.addEventListener("click", async () => {
      const data = {title:PAGE_TITLE,text:"Material de apoio às aulas de ATS — CBMMG",url:PAGE_URL};
      if (navigator.share) {
        try { await navigator.share(data); return; } catch (error) { if (error?.name === "AbortError") return; }
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(data.text + "\n" + PAGE_URL)}`,"_blank","noopener,noreferrer");
    });
    actions.appendChild(button);
  }

  function isolateBackground(locked) {
    const gate = document.getElementById("catsAuthGate");
    [...document.body.children].forEach(el => {
      if (el === gate || el.tagName === "SCRIPT") return;
      if (locked) {
        if (!el.hasAttribute("data-auth-prev-aria-hidden")) el.setAttribute("data-auth-prev-aria-hidden",el.getAttribute("aria-hidden") ?? "__none__");
        el.inert = true; el.setAttribute("aria-hidden","true");
      } else {
        el.inert = false;
        const previous = el.getAttribute("data-auth-prev-aria-hidden");
        if (previous === "__none__") el.removeAttribute("aria-hidden");
        else if (previous !== null) el.setAttribute("aria-hidden",previous);
        el.removeAttribute("data-auth-prev-aria-hidden");
      }
    });
  }

  const gateIsLocked = () => { const gate=document.getElementById("catsAuthGate"); return Boolean(gate && !gate.hidden); };
  const syncGateIsolation = () => isolateBackground(gateIsLocked());

  function trapGateFocus(event) {
    if (event.key !== "Tab" || !gateIsLocked()) return;
    const gate = document.getElementById("catsAuthGate");
    if (!gate) return;
    const focusable = [...gate.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el => !el.hidden && el.getClientRects().length > 0);
    if (!focusable.length) return;
    const first=focusable[0], last=focusable[focusable.length-1];
    if (event.shiftKey && document.activeElement===first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement===last) { event.preventDefault(); first.focus(); }
    else if (!gate.contains(document.activeElement)) { event.preventDefault(); first.focus(); }
  }

  function observeGate() {
    const start = () => {
      const gate=document.getElementById("catsAuthGate");
      if (!gate) return false;
      syncGateIsolation();
      new MutationObserver(syncGateIsolation).observe(gate,{attributes:true,attributeFilter:["hidden","class"]});
      return true;
    };
    if (start()) return;
    const observer=new MutationObserver(()=>{ if(start()) observer.disconnect(); });
    observer.observe(document.body,{childList:true});
  }

  function init() {
    setupSeo();
    disableAnalyticsUntilConsent();
    replaceSlideReferences();
    replaceItoReference();
    addShareButton();
    observeGate();
    document.addEventListener("keydown",trapGateFocus,true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true});
  else init();
})();
