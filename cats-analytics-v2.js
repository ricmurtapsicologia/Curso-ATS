(() => {
  "use strict";

  const ROOT = window;
  const ENDPOINT = "https://secretaria-digital-core.vercel.app/api/analytics/v2/collect";
  const LINK_ENDPOINT = "https://secretaria-digital-core.vercel.app/api/analytics/v2/link";
  const VISITOR_KEY = "cats_analytics_visitor_v2";
  const SESSION_KEY = "cats_analytics_session_v2";
  const BUDGET_KEY = "cats_analytics_budget_v21";
  const SESSION_TTL_MS = 30 * 60 * 1000;
  const MAX_EVENTS_PER_SESSION = 20;
  const HARD_EVENTS_PER_SESSION = 24;
  const MAX_TECHNICAL_ERRORS = 3;
  const RELEASE = "2026.09.23-analytics-essential-v21";
  const POLICY = "essential-v2.1";
  const IS_AUTOMATION = navigator.webdriver === true;
  const mediaSeen = new WeakMap();
  let started = false;
  let maxScroll = 0;
  let maxMediaProgress = 0;
  let mediaCompleted = false;
  let summarySent = false;

  const CRITICAL_EVENTS = new Set([
    "download", "presentation_open", "precurso_confirmed", "media_complete", "technical_error"
  ]);
  const ESSENTIAL_EVENTS = new Set([
    "session_start", "page_view", "manual_open", "download", "presentation_open",
    "precurso_open", "precurso_confirmed", "media_start", "media_complete",
    "technical_error", "session_summary"
  ]);

  const randomId = prefix => {
    try { return `${prefix}_${ROOT.crypto.randomUUID().replace(/-/g, "")}`; }
    catch { return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 16)}`; }
  };

  const safe = (value, fallback = "") => {
    const text = String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9_.:/-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 150);
    return text || fallback;
  };

  const pageId = () => {
    const host = String(ROOT.location.hostname || "").toLowerCase();
    const path = String(ROOT.location.pathname || "");
    if (host.startsWith("manual-participante-cats-digital") && host.endsWith(".vercel.app")) return "cats-manual";
    if (/\/Podcast-ATS-CBMMG\//i.test(path)) return "podcast-ats";
    if (/\/CATS\.pousoalegre\/precurso\.html$/i.test(path)) return "cats-precurso";
    if (/\/CATS\.pousoalegre\//i.test(path)) return "cats-pouso-alegre";
    if (/\/Curso-ATS\//i.test(path)) return "curso-ats";
    return "";
  };

  const getVisitor = () => {
    try {
      let id = ROOT.localStorage.getItem(VISITOR_KEY);
      if (id && /^v_[a-z0-9]+$/i.test(id)) return { id };
      id = randomId("v");
      ROOT.localStorage.setItem(VISITOR_KEY, id);
      return { id };
    } catch { return { id: randomId("v") }; }
  };

  const getSession = () => {
    const now = Date.now();
    try {
      const raw = ROOT.localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.id && Number(parsed.last || 0) + SESSION_TTL_MS > now) {
          parsed.last = now;
          ROOT.localStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
          return { id: String(parsed.id), fresh: false, landing: String(parsed.landing || ROOT.location.pathname || "/") };
        }
      }
      const next = { id: randomId("s"), last: now, landing: ROOT.location.pathname || "/" };
      ROOT.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      return { id: next.id, fresh: true, landing: next.landing };
    } catch { return { id: randomId("s"), fresh: true, landing: ROOT.location.pathname || "/" }; }
  };

  const touchSession = session => {
    try { ROOT.localStorage.setItem(SESSION_KEY, JSON.stringify({ id: session.id, last: Date.now(), landing: session.landing })); }
    catch {}
  };

  const browserName = () => { const ua=String(navigator.userAgent||""); if(/Edg\//.test(ua))return"Edge"; if(/OPR\//.test(ua))return"Opera"; if(/CriOS\//.test(ua))return"Chrome iOS"; if(/FxiOS\//.test(ua))return"Firefox iOS"; if(/Chrome\//.test(ua))return"Chrome"; if(/Firefox\//.test(ua))return"Firefox"; if(/Safari\//.test(ua)&&/Version\//.test(ua))return"Safari"; return"Other"; };
  const osName = () => { const ua=String(navigator.userAgent||""),p=String(navigator.userAgentData?.platform||navigator.platform||""); if(/Android/i.test(ua))return"Android"; if(/iPhone|iPad|iPod/i.test(ua))return"iOS"; if(/Win/i.test(p)||/Windows/i.test(ua))return"Windows"; if(/Mac/i.test(p)||/Mac OS/i.test(ua))return"macOS"; if(/Linux/i.test(p)||/Linux/i.test(ua))return"Linux"; return"Other"; };
  const deviceCategory = () => { if(typeof navigator.userAgentData?.mobile==="boolean") return navigator.userAgentData.mobile?"mobile":"desktop"; const ua=String(navigator.userAgent||""); if(/iPad|Tablet|PlayBook|Silk/i.test(ua)||(/Android/i.test(ua)&&!/Mobile/i.test(ua)))return"tablet"; if(/Mobi|Android|iPhone|iPod/i.test(ua))return"mobile"; return"desktop"; };
  const referrerDomain = () => { if(!document.referrer)return"direct"; try{return safe(new URL(document.referrer).hostname,"direct");}catch{return"direct";} };
  const acquisition = () => { const p=new URLSearchParams(ROOT.location.search||""),s=safe(p.get("utm_source")),m=safe(p.get("utm_medium")),c=safe(p.get("utm_campaign")); if(s)return{source:s,medium:m||"campaign",campaign:c}; const r=referrerDomain(); if(r==="direct")return{source:"direct",medium:"none",campaign:""}; if(/google\./.test(r))return{source:"google",medium:"organic",campaign:""}; if(/whatsapp|wa\.me/.test(r))return{source:"whatsapp",medium:"referral",campaign:""}; return{source:r,medium:"referral",campaign:""}; };

  const visitor=getVisitor(), session=getSession(), acquisitionData=acquisition(), page=pageId();
  const basePayload=()=>({visitor_id:visitor.id,session_id:session.id,page,current_path:safe(ROOT.location.pathname,"/"),landing_page:safe(session.landing,page),referrer_domain:referrerDomain(),source:acquisitionData.source,medium:acquisitionData.medium,campaign:acquisitionData.campaign,device_category:deviceCategory(),browser:browserName(),os:osName(),screen_width:Number(ROOT.screen?.width||0),screen_height:Number(ROOT.screen?.height||0),viewport_width:Number(ROOT.innerWidth||0),viewport_height:Number(ROOT.innerHeight||0),language:String(navigator.language||"unknown").slice(0,30),timezone:(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||"unknown";}catch{return"unknown";}})(),release:RELEASE});
  const payloadFor=(event,contentId="",extra={})=>({...basePayload(),event_id:randomId("e"),event,content_id:safe(contentId),timestamp:Date.now(),...extra});

  const loadBudget = () => {
    try {
      const parsed = JSON.parse(ROOT.sessionStorage.getItem(BUDGET_KEY) || "null");
      if (parsed?.sessionId === session.id) return parsed;
    } catch {}
    return { sessionId: session.id, count: 0, technicalErrors: 0, last: {} };
  };
  const saveBudget = state => { try { ROOT.sessionStorage.setItem(BUDGET_KEY, JSON.stringify(state)); } catch {} };
  const cooldownFor = event => ({session_start:SESSION_TTL_MS,page_view:15000,manual_open:SESSION_TTL_MS,precurso_open:SESSION_TTL_MS,precurso_confirmed:300000,presentation_open:3000,download:3000,media_start:5000,media_complete:5000,session_summary:60000,technical_error:10000}[event]||0);
  const allowEvent = (event, contentId="") => {
    if (!ESSENTIAL_EVENTS.has(event)) return false;
    const state = loadBudget(), now = Date.now(), key = `${event}|${page}|${safe(contentId)}`;
    const last = Number(state.last?.[key] || 0), cooldown = cooldownFor(event);
    if (cooldown && now - last < cooldown) return false;
    if (event === "technical_error" && Number(state.technicalErrors || 0) >= MAX_TECHNICAL_ERRORS) return false;
    if (Number(state.count || 0) >= HARD_EVENTS_PER_SESSION) return false;
    if (Number(state.count || 0) >= MAX_EVENTS_PER_SESSION && !CRITICAL_EVENTS.has(event)) return false;
    state.count = Number(state.count || 0) + 1;
    state.last = state.last || {};
    state.last[key] = now;
    if (event === "technical_error") state.technicalErrors = Number(state.technicalErrors || 0) + 1;
    saveBudget(state);
    return true;
  };

  const send=(event,contentId="",useBeacon=false,extra={})=>{
    if(IS_AUTOMATION||!page||!allowEvent(event,contentId))return false;
    touchSession(session);
    const payload=payloadFor(event,contentId,extra);
    if(useBeacon&&navigator.sendBeacon){try{return navigator.sendBeacon(ENDPOINT,JSON.stringify(payload));}catch{}}
    try{void ROOT.fetch(ENDPOINT,{method:"POST",mode:"cors",credentials:"omit",cache:"no-store",keepalive:true,referrerPolicy:"strict-origin-when-cross-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}).catch(()=>{});return true;}catch{return false;}
  };

  const contentIdFor=node=>{const x=node?.dataset?.telemetryId||node?.dataset?.slideId||node?.getAttribute?.("data-title");if(x)return safe(x,"content");return safe(node?.getAttribute?.("aria-label")||node?.getAttribute?.("title")||node?.textContent||"","content");};
  const classifyClick=node=>{const raw=String(node?.getAttribute?.("href")||node?.dataset?.href||"");if(!raw)return null;let url;try{url=new URL(raw,ROOT.location.href);}catch{return null;}const id=contentIdFor(node);const presentation=(/docs\.google\.com$/i.test(url.hostname)&&/\/presentation\//i.test(url.pathname))||(/drive\.google\.com$/i.test(url.hostname)&&/presentation|slides|ppt/i.test(`${id} ${url.pathname}`));if(presentation)return{event:"presentation_open",contentId:id};const dl=node.hasAttribute?.("download")||/\.(?:pdf|pptx?|epub|docx?|xlsx?|zip)(?:$|[?#])/i.test(raw)||/\/api\/(?:manual|epub)/i.test(url.pathname);if(dl)return{event:"download",contentId:id};return null;};
  const bindClicks=()=>document.addEventListener("click",evt=>{const node=evt.target?.closest?.("a[href],button[data-href]");if(!node)return;const r=classifyClick(node);if(r)send(r.event,r.contentId,true);},true);

  const updateScroll=()=>{const d=document.documentElement,max=Math.max(1,d.scrollHeight-ROOT.innerHeight),ratio=Math.max(0,Math.min(1,ROOT.scrollY/max));maxScroll=Math.max(maxScroll,Math.round(ratio*100));};
  const bindScroll=()=>{updateScroll();ROOT.addEventListener("scroll",updateScroll,{passive:true});};

  const bindMedia=()=>{const attach=media=>{if(mediaSeen.has(media))return;const state={started:false,completed:false};mediaSeen.set(media,state);const id=safe(media.dataset?.telemetryId||media.getAttribute?.("aria-label")||media.currentSrc||media.src||media.tagName,"media");media.addEventListener("play",()=>{if(state.started)return;state.started=true;send("media_start",id);},{passive:true});media.addEventListener("timeupdate",()=>{const duration=Number(media.duration||0),current=Number(media.currentTime||0);if(!Number.isFinite(duration)||duration<=0||!Number.isFinite(current))return;maxMediaProgress=Math.max(maxMediaProgress,Math.round(Math.max(0,Math.min(1,current/duration))*100));},{passive:true});media.addEventListener("ended",()=>{maxMediaProgress=100;mediaCompleted=true;if(state.completed)return;state.completed=true;send("media_complete",id);},{passive:true});};document.querySelectorAll("audio,video").forEach(attach);new MutationObserver(()=>document.querySelectorAll("audio,video").forEach(attach)).observe(document.documentElement,{childList:true,subtree:true});};

  const sendSummary=()=>{if(summarySent)return false;summarySent=true;updateScroll();return send("session_summary","",true,{max_scroll:maxScroll,max_media_progress:maxMediaProgress,media_completed:mediaCompleted});};

  const linkIdentity=async()=>{if(IS_AUTOMATION)return false;try{const auth=ROOT.CATSCourseTelemetry?.getSession?.();if(!auth?.token)return false;const response=await ROOT.fetch(LINK_ENDPOINT,{method:"POST",mode:"cors",credentials:"omit",cache:"no-store",keepalive:true,headers:{"Content-Type":"application/json","Authorization":`Bearer ${auth.token}`},body:JSON.stringify({visitor_id:visitor.id,session_id:session.id})});return Boolean(response?.ok);}catch{return false;}};

  const boot=()=>{
    if(started||!page||IS_AUTOMATION)return false;
    started=true;
    if(session.fresh)send("session_start");
    send("page_view");
    if(page==="cats-precurso")send("precurso_open");
    if(page==="cats-manual")send("manual_open");
    bindClicks();
    bindScroll();
    bindMedia();
    ROOT.addEventListener("cats:authenticated",()=>{void linkIdentity();},{passive:true});
    ROOT.addEventListener("cats:telemetry-ready",()=>{void linkIdentity();},{passive:true});
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")sendSummary();},{passive:true});
    ROOT.addEventListener("pagehide",sendSummary,{passive:true});
    ROOT.addEventListener("error",()=>send("technical_error","script_error",true),{passive:true});
    ROOT.addEventListener("unhandledrejection",()=>send("technical_error","unhandled_rejection",true),{passive:true});
    void linkIdentity();
    return true;
  };

  ROOT.CATSAnalyticsV2=Object.freeze({send,pageId,linkIdentity,isAutomation:IS_AUTOMATION,version:"2.1.0",policy:POLICY});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
