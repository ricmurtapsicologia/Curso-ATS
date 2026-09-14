(()=>{
  "use strict";
  const load=(src)=>{
    if(document.querySelector(`script[src*="${src.split('?')[0]}"]`))return;
    const s=document.createElement('script');
    s.src=src;
    s.async=false;
    document.head.appendChild(s);
  };

  const MANUAL_URL='https://manual-participante-cats-digital.vercel.app';
  const injectManualCta=()=>{
    if(document.getElementById('manual-participante-cta'))return;
    const heroActions=document.querySelector('.hero-actions');
    if(!heroActions)return;

    const link=document.createElement('a');
    link.id='manual-participante-cta';
    link.className='btn secondary';
    link.href=MANUAL_URL;
    link.target='_blank';
    link.rel='noopener noreferrer';
    link.setAttribute('aria-label','Acessar Manual do Participante CATS');
    link.innerHTML='<i class="ri-book-open-line" aria-hidden="true"></i> Manual do Participante';

    heroActions.appendChild(link);
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',injectManualCta,{once:true});
  }else{
    injectManualCta();
  }

  load('access-2026.js?v=20260909-1');
  load('app-core.js?v=20260909-1');
  load('restore-original-lessons.js?v=20260909-1');
})();