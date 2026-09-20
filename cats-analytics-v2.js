(() => {
  "use strict";

  const ROOT = window;
  const ENDPOINT = "https://secretaria-digital-core.vercel.app/api/analytics/v2/collect";
  const LINK_ENDPOINT = "https://secretaria-digital-core.vercel.app/api/analytics/v2/link";
  const VISITOR_KEY = "cats_analytics_visitor_v2";
  const SESSION_KEY = "cats_analytics_session_v2";
  const SESSION_TTL_MS = 30 * 60 * 1000;
  const HEARTBEAT_MS = 60 * 1000;
  const RELEASE = "2026.09.20-analytics-v2";
  const scrollSeen = new Set();
  const mediaSeen = new WeakMap();
  let heartbeatTimer = 0;
  let started = false;

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
      if (id && /^v_[a-z0-9]+$/i.test(id)) return { id, fresh: false };
      id = randomId("v");
      ROOT.localStorage.setItem(VISITOR_KEY, id);
      return { id, fresh: true };
    } catch { return { id: randomId("v"), fresh: true }; }
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

  const touchSession = session => { try { ROOT.localStorage.setItem(SESSION_KEY, JSON.stringify({ id: session.id, last: Date.now(), landing: session.landing })); } catch {} };
  const browserName = () => { const ua=String(navigator.userAgent||""); if(/Edg\//.test(ua))return"Edge"; if(/OPR\//.test(ua))return"Opera"; if(/CriOS\//.test(ua))return"Chrome iOS"; if(/FxiOS\//.test(ua))return"Firefox iOS"; if(/Chrome\//.test(ua))return"Chrome"; if(/Firefox\//.test(ua))return"Firefox"; if(/Safari\//.test(ua)&&/Version\//.test(ua))return"Safari"; return"Other"; };
  const osName = () => { const ua=String(navigator.userAgent||""),p=String(navigator.userAgentData?.platform||navigator.platform||""); if(/Android/i.test(ua))return"Android"; if(/iPhone|iPad|iPod/i.test(ua))return"iOS"; if(/Win/i.test(p)||/Windows/i.test(ua))return"Windows"; if(/Mac/i.test(p)||/Mac OS/i.test(ua))return"macOS"; if(/Linux/i.test(p)||/Linux/i.test(ua))return"Linux"; return"Other"; };
  const deviceCategory = () => { if(typeof navigator.userAgentData?.mobile==="boolean") return navigator.userAgentData.mobile?"mobile":"desktop"; const ua=String(navigator.userAgent||""); if(/iPad|Tablet|PlayBook|Silk/i.test(ua)||(/Android/i.test(ua)&&!/Mobile/i.test(ua)))return"tablet"; if(/Mobi|Android|iPhone|iPod/i.test(ua))return"mobile"; return"desktop"; };
  const referrerDomain = () => { if(!document.referrer)return"direct"; try{return safe(new URL(document.referrer).hostname,"direct");}catch{return"direct";} };
  const acquisition = () => { const p=new URLSearchParams(ROOT.location.search||""),s=safe(p.get("utm_source")),m=safe(p.get("utm_medium")),c=safe(p.get("utm_campaign")); if(s)return{source:s,medium:m||"campaign",campaign:c}; const r=referrerDomain(); if(r==="direct")return{source:"direct",medium:"none",campaign:""}; if(/google\./.test(r))return{source:"google",medium:"organic",campaign:""}; if(/whatsapp|wa\.me/.test(r))return{source:"whatsapp",medium:"referral",campaign:""}; return{source:r,medium:"referral",campaign:""}; };

  const visitor=getVisitor(), session=getSession(), acquisitionData=acquisition(), page=pageId();
  const basePayload=()=>({visitor_id:visitor.id,session_id:session.id,page,current_path:safe(ROOT.location.pathname,"/"),landing_page:safe(session.landing,page),referrer_domain:referrerDomain(),source:acquisitionData.source,medium:acquisitionData.medium,campaign:acquisitionData.campaign,device_category:deviceCategory(),browser:browserName(),os:osName(),screen_width:Number(ROOT.screen?.width||0),screen_height:Number(ROOT.screen?.height||0),viewport_width:Number(ROOT.innerWidth||0),viewport_height:Number(ROOT.innerHeight||0),language:String(navigator.language||"unknown").slice(0,30),timezone:(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||"unknown";}catch{return"unknown";}})(),release:RELEASE});
  const payloadFor=(event,contentId="")=>({...basePayload(),event_id:randomId("e"),event,content_id:safe(contentId),timestamp:Date.now()});
  const send=(event,contentId="",useBeacon=false)=>{ if(!page)return false; touchSession(session); const payload=payloadFor(event,contentId); if(useBeacon&&navigator.sendBeacon){try{return navigator.sendBeacon(ENDPOINT,JSON.stringify(payload));}catch{}} try{void ROOT.fetch(ENDPOINT,{method:"POST",mode:"cors",credentials:"omit",cache:"no-store",keepalive:true,referrerPolicy:"strict-origin-when-cross-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)}).catch(()=>{});return true;}catch{return false;} };
  const contentIdFor=node=>{const x=node?.dataset?.telemetryId||node?.dataset?.slideId||node?.getAttribute?.("data-title");if(x)return safe(x,"content");return safe(node?.getAttribute?.("aria-label")||node?.getAttribute?.("title")||node?.textContent||"","content");};
  const classifyClick=node=>{const raw=String(node?.getAttribute?.("href")||node?.dataset?.href||"");if(!raw)return null;let url;try{url=new URL(raw,ROOT.location.href);}catch{return null;}const id=contentIdFor(node);const presentation=(/docs\.google\.com$/i.test(url.hostname)&&/\/presentation\//i.test(url.pathname))||(/drive\.google\.com$/i.test(url.hostname)&&/presentation|slides|ppt/i.test(`${id} ${url.pathname}`));if(presentation)return{event:"presentation_open",contentId:id};const dl=node.hasAttribute?.("download")||/\.(?:pdf|pptx?|epub|docx?|xlsx?|zip)(?:$|[?#])/i.test(raw)||/\/api\/(?:manual|epub)/i.test(url.pathname);if(dl)return{event:"download",contentId:id};if(url.origin===ROOT.location.origin)return{event:"internal_click",contentId:id};return{event:"external_click",contentId:safe(`${url.hostname}-${id}`,id)};};
  const bindClicks=()=>document.addEventListener("click",evt=>{const node=evt.target?.closest?.("a[href],button[data-href]");if(!node)return;const r=classifyClick(node);if(r)send(r.event,r.contentId,true);},true);
  const bindScroll=()=>ROOT.addEventListener("scroll",()=>{const d=document.documentElement,max=Math.max(1,d.scrollHeight-ROOT.innerHeight),ratio=Math.max(0,Math.min(1,ROOT.scrollY/max));[[.25,"scroll_25"],[.5,"scroll_50"],[.75,"scroll_75"],[.9,"scroll_90"]].forEach(([t,e])=>{if(ratio>=t&&!scrollSeen.has(e)){scrollSeen.add(e);send(e);}});},{passive:true});
  const bindMedia=()=>{const attach=media=>{if(mediaSeen.has(media))return;const seen=new Set();mediaSeen.set(media,seen);const id=safe(media.dataset?.telemetryId||media.getAttribute?.("aria-label")||media.currentSrc||media.src||media.tagName,"media");media.addEventListener("play",()=>{if(seen.has("start"))return;seen.add("start");send(media.tagName==="VIDEO"?"video_start":"media_start",id);},{passive:true});media.addEventListener("timeupdate",()=>{const duration=Number(media.duration||0),current=Number(media.currentTime||0);if(!Number.isFinite(duration)||duration<=0||!Number.isFinite(current))return;const ratio=current/duration;[[.25,"media_25"],[.5,"media_50"],[.75,"media_75"]].forEach(([t,e])=>{if(ratio>=t&&!seen.has(e)){seen.add(e);send(e,id);}});},{passive:true});media.addEventListener("ended",()=>{if(!seen.has("media_complete")){seen.add("media_complete");send("media_complete",id);}},{passive:true});};document.querySelectorAll("audio,video").forEach(attach);new MutationObserver(()=>document.querySelectorAll("audio,video").forEach(attach)).observe(document.documentElement,{childList:true,subtree:true});};
  const linkIdentity=async()=>{try{const auth=ROOT.CATSCourseTelemetry?.getSession?.();if(!auth?.token)return false;const response=await ROOT.fetch(LINK_ENDPOINT,{method:"POST",mode:"cors",credentials:"omit",cache:"no-store",keepalive:true,headers:{"Content-Type":"application/json","Authorization":`Bearer ${auth.token}`},body:JSON.stringify({visitor_id:visitor.id,session_id:session.id})});return Boolean(response?.ok);}catch{return false;}};
  const startHeartbeat=()=>{ROOT.clearInterval(heartbeatTimer);heartbeatTimer=0;if(document.visibilityState==="visible")heartbeatTimer=ROOT.setInterval(()=>{if(document.visibilityState==="visible")send("user_engagement");},HEARTBEAT_MS);};
  const boot=()=>{if(started||!page)return false;started=true;if(visitor.fresh)send("first_visit");if(session.fresh)send("session_start");send("page_view");if(page==="cats-precurso")send("precurso_open");if(page==="cats-manual")send("manual_open");bindClicks();bindScroll();bindMedia();startHeartbeat();ROOT.setTimeout(()=>{if(document.visibilityState==="visible")send("user_engagement");},30000);ROOT.addEventListener("cats:authenticated",()=>{void linkIdentity();},{passive:true});ROOT.addEventListener("cats:telemetry-ready",()=>{void linkIdentity();},{passive:true});ROOT.addEventListener("pageshow",evt=>{if(evt.persisted)send("page_view");},{passive:true});document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){send("user_engagement");startHeartbeat();}else{ROOT.clearInterval(heartbeatTimer);heartbeatTimer=0;send("page_exit","visibility-hidden",true);}},{passive:true});ROOT.addEventListener("pagehide",()=>send("page_exit","pagehide",true),{passive:true});ROOT.addEventListener("error",()=>send("technical_error","script_error",true),{passive:true});ROOT.addEventListener("unhandledrejection",()=>send("technical_error","unhandled_rejection",true),{passive:true});void linkIdentity();return true;};
  ROOT.CATSAnalyticsV2=Object.freeze({send,pageId,linkIdentity,version:"2.0.0"});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();
