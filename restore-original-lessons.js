(()=>{
  "use strict";

  // Conjunto histórico vigente em março de 2026.
  // Fonte: index.html no commit 6b397f44dad7407e759ed9f71dff737344e6083e (26/01/2026),
  // último estado do arquivo antes de abril de 2026.
  const lessons = [
    {
      title: "Aspectos Gerais",
      dataTitle: "Encontro 1: Aspectos Gerais",
      description: "Introdução aos conceitos gerais sobre o comportamento suicida, incluindo dinâmicas psicológicas, psicopatologia e mitos.",
      slideId: "1JaUe1ANJjWOAY2fzWHxFe-aiKbUwLAJB"
    },
    {
      title: "Abordagem Técnica",
      dataTitle: "Encontro 2: Abordagem Técnica",
      description: "Procedimentos técnicos em ocorrências de tentativas de suicídio, com foco na comunicação e estratégias de abordagem.",
      slideId: "1oGkMsxGiAsvUPYueQqx00Z8CC7115Nbs"
    },
    {
      title: "Aspectos Específicos",
      dataTitle: "Encontro 3: Aspectos Específicos",
      description: "Abordagens específicas para diferentes perfis de tentantes, como agressivos, depressivos e psicóticos.",
      slideId: "1AN2XM7zEMdfKOsQcla39XqN-fpWq_ovp"
    },
    {
      title: "Gerenciamento em ATS",
      dataTitle: "Encontro 4: Gerenciamento em ATS",
      description: "Gerenciamento de ocorrências envolvendo tentativas de suicídio, com foco em planos de ação e uso de métodos.",
      slideId: "1_6dVFpv3trAtLAd2dXSrZbMris95jy1B"
    }
  ];

  const apply = () => {
    const cards = [...document.querySelectorAll("#trilha .lesson-card")];
    if (cards.length < lessons.length) return;

    lessons.forEach((lesson, index) => {
      const card = cards[index];
      card.dataset.title = lesson.dataTitle;

      const badge = card.querySelector(".badge");
      if (badge) badge.innerHTML = `<i class="ri-slideshow-2-line" aria-hidden="true"></i> Encontro ${index + 1}`;

      const heading = card.querySelector("h3");
      if (heading) heading.textContent = lesson.title;

      const paragraph = card.querySelector(".card-body > p");
      if (paragraph) paragraph.textContent = lesson.description;

      const image = card.querySelector(".card-image img");
      if (image) image.alt = `Imagem de apoio do Encontro ${index + 1}: ${lesson.title}`;

      const presentationUrl = `https://docs.google.com/presentation/d/${lesson.slideId}/view`;
      const exportUrl = `https://docs.google.com/presentation/d/${lesson.slideId}/export/pptx`;

      const open = card.querySelector(".open-slide");
      if (open) {
        open.dataset.slideId = lesson.slideId;
        open.href = presentationUrl;
      }

      const links = card.querySelectorAll(".secondary-actions a");
      if (links[0]) links[0].href = presentationUrl;
      if (links[1]) links[1].href = exportUrl;
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply, { once: true });
  } else {
    apply();
  }
})();