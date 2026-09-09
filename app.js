(()=>{
  "use strict";
  const load=(src)=>{
    if(document.querySelector(`script[src*="${src.split('?')[0]}"]`))return;
    const s=document.createElement('script');
    s.src=src;
    s.async=false;
    document.head.appendChild(s);
  };
  load('access-2026.js?v=20260909-1');
  load('app-core.js?v=20260909-1');
  load('restore-original-lessons.js?v=20260909-1');
})();