(()=>{
  if(!document.querySelector('script[src*="auth.js"]')){
    const script=document.createElement('script');
    script.src='auth.js?v=20260905-2';
    script.async=false;
    document.head.appendChild(script);
  }
})();

(()=>{"use strict";const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)],KEY="curso-ats:onboarding-v2";const Splash={el:$("#splash-screen"),hide(){if(this.el)this.el.style.display="none"}};const Onboarding={root:$("#onboarding"),panel:$(".onboarding-panel"),slides:$$(".onboarding-slide"),skip:$("#skip-btn"),next:$("#next-btn"),reopen:$("#how-to-btn"),index:0,lastFocus:null,init(){this.show(0);this.next?.addEventListener("click",()=>this.advance());this.skip?.addEventListener("click",()=>this.close(true));this.reopen?.addEventListener("click",()=>this.open(false,this.reopen));document.addEventListener("keydown",e=>{if(!this.root?.classList.contains("is-visible"))return;if(e.key==="Escape")this.close(false);if(e.key==="Tab")this.trap(e)})},seen(){try{return localStorage.getItem(KEY)==="seen"}catch{return false}},mark(){try{localStorage.setItem(KEY,"seen")}catch{}},show(i){this.index=Math.min(Math.max(i,0),this.slides.length-1);this.slides.forEach((sl,n)=>sl.hidden=n!==this.index);const h=$("h2",this.slides[this.index]);if(h?.id)this.root?.setAttribute("aria-labelledby",h.id);if(this.next)this.next.textContent=this.index>=this.slides.length-1?"Começar":"Próximo"},open(reset=false,trigger=null){if(!this.root)return;this.lastFocus=trigger||document.activeElement;if(reset)this.index=0;this.show(this.index);this.root.classList.add("is-visible");this.root.setAttribute("aria-hidden","false");document.documentElement.style.overflow="hidden";setTimeout(()=>this.next?.focus(),60)},close(mark=false){if(!this.root)return;if(mark)this.mark();this.root.classList.remove("is-visible");this.root.setAttribute("aria-hidden","true");document.documentElement.style.overflow="";this.lastFocus?.focus?.()},advance(){if(this.index>=this.slides.length-1){this.mark();this.close();return}this.show(this.index+1)},trap(e){if(!this.panel)return;const f=$$('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])',this.panel).filter(x=>!x.hidden);if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}};const Materials={btn:$("#materials-btn"),links:$("#materials-links"),init(){this.btn?.addEventListener("click",()=>this.toggle())},toggle(){if(!this.btn||!this.links)return;const show=!this.links.classList.contains("is-visible");this.links.classList.toggle("is-visible",show);this.links.setAttribute("aria-hidden",String(!show));this.btn.classList.toggle("active",show);this.btn.setAttribute("aria-expanded",String(show));if(show)$("a",this.links)?.focus({preventScroll:true})}};const Dialog={show(d){if(!d)return;document.documentElement.style.overflow="hidden";if(typeof d.showModal==="function")d.showModal();else d.setAttribute("open","")},close(d){if(!d)return;if(d.open&&typeof d.close==="function")d.close();else{d.removeAttribute("open");document.documentElement.style.overflow=""}}};const Viewer={dialog:$("#slidesViewer"),frame:$("#slidesFrame"),title:$("#slidesTitle"),external:$("#openExternal"),download:$("#downloadPptx"),closeBtn:$("#slidesClose"),closeX:$("#closeX"),lastFocus:null,init(){$$("a.open-slide").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();const id=a.dataset.slideId,card=a.closest(".lesson-card,.complementary-card"),title=card?.dataset.title||card?.querySelector("h3")?.textContent||"Aula";this.open(id,title,a)}));[this.closeBtn,this.closeX].forEach(b=>b?.addEventListener("click",()=>this.close()));this.dialog?.addEventListener("click",e=>{if(e.target===this.dialog)this.close()});this.dialog?.addEventListener("close",()=>{if(this.frame)this.frame.src="about:blank";document.documentElement.style.overflow="";this.lastFocus?.focus?.()})},open(id,title,trigger){if(!this.dialog||!this.frame||!this.title||!this.external||!this.download||!id)return;this.lastFocus=trigger||document.activeElement;this.title.innerHTML=`<i class="ri-slideshow-2-line" aria-hidden="true"></i> Apresentação – ${title}`;this.frame.src=`https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=60000`;this.external.href=`https://docs.google.com/presentation/d/${id}/view`;this.download.href=`https://docs.google.com/presentation/d/${id}/export/pptx`;Dialog.show(this.dialog);setTimeout(()=>this.closeX?.focus(),80)},close(){if(this.frame)this.frame.src="about:blank";Dialog.close(this.dialog)}};const Privacy={dialog:$("#privacyDialog"),openBtn:$("#privacy-btn"),closeBtn:$("#privacyClose"),closeX:$("#privacyCloseX"),lastFocus:null,init(){this.openBtn?.addEventListener("click",()=>this.open());[this.closeBtn,this.closeX].forEach(b=>b?.addEventListener("click",()=>this.close()));this.dialog?.addEventListener("click",e=>{if(e.target===this.dialog)this.close()});this.dialog?.addEventListener("close",()=>{document.documentElement.style.overflow="";this.lastFocus?.focus?.()})},open(){this.lastFocus=document.activeElement;Dialog.show(this.dialog);setTimeout(()=>this.closeX?.focus(),80)},close(){Dialog.close(this.dialog)}};Onboarding.init();Materials.init();Viewer.init();Privacy.init();window.addEventListener("load",()=>{const first=!Onboarding.seen();setTimeout(()=>{Splash.hide();if(first)Onboarding.open(true)},first?420:140)})})();

;(()=>{
  "use strict";
  let timer=0;

  const digits=value=>String(value||"").replace(/\D/g,"");

  function bindAutoAccess(){
    const gate=document.getElementById("catsAuthGate");
    const form=gate?.querySelector("#catsAuthForm");
    const input=gate?.querySelector("#catsAuthInput");
    const submit=gate?.querySelector("#catsAuthSubmit");
    if(!gate||!form||!input)return false;

    if(submit){
      submit.hidden=true;
      submit.setAttribute("aria-hidden","true");
      submit.tabIndex=-1;
    }

    const help=gate.querySelector("#catsAuthHelp");
    if(help) help.textContent="Digite sua matrícula BM/PM (7 números) ou CPF cadastrado (11 números). O acesso é validado automaticamente.";

    if(input.dataset.autoAccessBound==="1")return true;
    input.dataset.autoAccessBound="1";

    const trySubmit=(delay=0)=>{
      window.clearTimeout(timer);
      const current=digits(input.value);
      if(current.length!==7&&current.length!==11)return;
      timer=window.setTimeout(()=>{
        if(input.disabled)return;
        const latest=digits(input.value);
        if(latest!==current)return;
        if(latest.length!==7&&latest.length!==11)return;
        form.requestSubmit();
      },delay);
    };

    input.addEventListener("input",()=>{
      const length=digits(input.value).length;
      window.clearTimeout(timer);
      if(length===11)trySubmit(0);
      else if(length===7)trySubmit(550);
    });
    return true;
  }

  function initAutoAccess(){
    if(bindAutoAccess())return;
    const observer=new MutationObserver(()=>{
      if(bindAutoAccess())observer.disconnect();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initAutoAccess,{once:true});
  else initAutoAccess();
})();

;(()=>{
  if(!document.querySelector('link[href*="audio-aulas.css"]')){
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href='audio-aulas.css?v=20260825';
    document.head.appendChild(link);
  }
  if(!document.querySelector('script[src*="audio-aulas.js"]')){
    const script=document.createElement('script');
    script.src='audio-aulas.js?v=20260825';
    script.defer=true;
    document.head.appendChild(script);
  }
})();

;(()=>{
  if(!document.querySelector('script[src*="hardening.js"]')){
    const script=document.createElement('script');
    script.src='hardening.js?v=20260905-3';
    script.defer=true;
    document.head.appendChild(script);
  }
})();
