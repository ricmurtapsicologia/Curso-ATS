import { chromium } from 'playwright';

const TARGET_ID = 'G-N1GEBDNZ8B';
const pages = [
  ['curso-ats','https://ricmurtapsicologia.github.io/Curso-ATS/'],
  ['cats-pouso-alegre','https://ricmurtapsicologia.github.io/CATS.pousoalegre/'],
  ['cats-precurso','https://ricmurtapsicologia.github.io/CATS.pousoalegre/precurso.html'],
  ['podcast-ats','https://ricmurtapsicologia.github.io/Podcast-ATS-CBMMG/'],
];

const browser = await chromium.launch({headless:true});
const results = [];
for (const [id,url] of pages) {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    try { localStorage.setItem('ric_analytics_consent','granted'); } catch {}
  });
  const observed = { gtag: [], collect: [] };
  context.on('request', req => {
    const u = req.url();
    if (u.includes('googletagmanager.com/gtag/js')) observed.gtag.push(u);
    if (u.includes('google-analytics.com/g/collect') || u.includes('google-analytics.com/j/collect')) observed.collect.push(u);
  });
  await context.route(/https:\/\/[^/]*google-analytics\.com\/(g|j)\/collect.*/, async route => {
    await route.fulfill({status:204, body:''});
  });
  const page = await context.newPage();
  let navStatus = 0;
  let navError = '';
  try {
    const response = await page.goto(url, {waitUntil:'domcontentloaded', timeout:45000});
    navStatus = response?.status() || 0;
    await page.waitForTimeout(5000);
  } catch (error) { navError = String(error?.message || error); }
  const client = await page.evaluate(() => ({
    ric: window.RICAnalytics ? {version:window.RICAnalytics.version,page:window.RICAnalytics.page,privacy:window.RICAnalytics.privacy} : null,
    consent: (()=>{try{return localStorage.getItem('ric_analytics_consent')}catch{return null}})(),
    gaScripts: [...document.scripts].filter(s=>s.src.includes('googletagmanager.com/gtag/js')).map(s=>s.src),
    dataLayer: Array.isArray(window.dataLayer) ? window.dataLayer.length : 0,
  })).catch(()=>({ric:null,consent:null,gaScripts:[],dataLayer:0}));
  const targetCollect = observed.collect.filter(u => u.includes(`tid=${encodeURIComponent(TARGET_ID)}`) || u.includes(`tid=${TARGET_ID}`));
  results.push({id,url,navStatus,navError,client,gtagRequests:observed.gtag.length,collectRequests:observed.collect.length,targetCollect:targetCollect.length});
  await context.close();
}
await browser.close();
console.log(JSON.stringify({targetMeasurementId:TARGET_ID,results}, null, 2));
