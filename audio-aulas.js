(()=>{
'use strict';

const MANIFEST_URL='audio/manifest.json?v=20260825';
const STORE_KEY='cursoATS.audio.v1';
const ROOT_ID='audio-aulas';

const state={
  manifest:null,
  audio:new Audio(),
  current:null,
  progress:readProgress(),
  lastSavedSecond:-1
};

state.audio.preload='metadata';

function readProgress(){
  try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return {}}
}
function saveProgress(){
  try{localStorage.setItem(STORE_KEY,JSON.stringify(state.progress))}catch{}
}
function esc(value=''){
  return String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function time(sec){
  if(!Number.isFinite(sec)||sec<0)return '0:00';
  const m=Math.floor(sec/60),s=Math.floor(sec%60);
  return `${m}:${String(s).padStart(2,'0')}`;
}
function trackEl(id){
  return document.querySelector(`[data-audio-track="${CSS.escape(id)}"]`);
}
function resetButtons(exceptId=null){
  document.querySelectorAll('[data-audio-play]').forEach(btn=>{
    if(btn.dataset.audioPlay===exceptId)return;
    btn.innerHTML='<i class="ri-play-fill" aria-hidden="true"></i> Ouvir';
    btn.setAttribute('aria-label','Reproduzir áudio');
  });
}
function updateCurrentUI(){
  const t=state.current;
  if(!t)return;
  const row=trackEl(t.id);
  if(!row)return;
  const btn=row.querySelector('[data-audio-play]');
  const range=row.querySelector('[data-audio-range]');
  const now=row.querySelector('[data-audio-now]');
  const total=row.querySelector('[data-audio-total]');
  const inline=row.querySelector('[data-audio-total-inline]');
  const status=row.querySelector('[data-audio-status]');
  const playing=!state.audio.paused&&!state.audio.ended;
  if(btn){
    btn.innerHTML=playing?'<i class="ri-pause-fill" aria-hidden="true"></i> Pausar':'<i class="ri-play-fill" aria-hidden="true"></i> Continuar';
    btn.setAttribute('aria-label',playing?'Pausar áudio':'Continuar áudio');
  }
  if(range){
    const duration=Number.isFinite(state.audio.duration)?state.audio.duration:0;
    range.max=duration||1;
    range.value=Math.min(state.audio.currentTime||0,duration||1);
  }
  if(now)now.textContent=time(state.audio.currentTime||0);
  if(Number.isFinite(state.audio.duration)){
    const label=time(state.audio.duration);
    if(total)total.textContent=label;
    if(inline)inline.textContent=label;
  }
  if(status)status.textContent=playing?'Reproduzindo':(state.audio.ended?'Concluído':'Pausado');
}
function setError(id,message){
  const row=trackEl(id);
  if(!row)return;
  const status=row.querySelector('[data-audio-status]');
  const btn=row.querySelector('[data-audio-play]');
  if(status)status.textContent=message;
  if(btn){
    btn.disabled=true;
    btn.innerHTML='<i class="ri-error-warning-line" aria-hidden="true"></i> Indisponível';
  }
}
async function playTrack(track){
  if(state.current?.id===track.id){
    if(state.audio.paused)await state.audio.play();
    else state.audio.pause();
    updateCurrentUI();
    return;
  }

  state.audio.pause();
  resetButtons();
  state.current=track;
  state.lastSavedSecond=-1;
  state.audio.src=`${track.file}?v=${encodeURIComponent(state.manifest.version||'1')}`;
  const saved=Number(state.progress[track.id]?.position||0);
  state.audio.addEventListener('loadedmetadata',()=>{
    if(saved>0&&saved<state.audio.duration-5)state.audio.currentTime=saved;
    updateCurrentUI();
  },{once:true});
  try{
    await state.audio.play();
    updateCurrentUI();
  }catch{
    setError(track.id,'Toque novamente para reproduzir.');
  }
}
function bindTrack(row,track){
  const play=row.querySelector('[data-audio-play]');
  const range=row.querySelector('[data-audio-range]');
  play?.addEventListener('click',()=>playTrack(track));
  range?.addEventListener('input',()=>{
    if(state.current?.id!==track.id)return;
    state.audio.currentTime=Number(range.value)||0;
    updateCurrentUI();
  });
}
function render(manifest){
  const existing=document.getElementById(ROOT_ID);
  if(existing)return;

  const trail=document.getElementById('trilha');
  if(!trail)return;

  const section=document.createElement('section');
  section.id=ROOT_ID;
  section.className='audio-course-section';
  section.setAttribute('aria-labelledby','audio-aulas-title');

  const byLesson=new Map();
  manifest.lessons.forEach(l=>byLesson.set(l.number,[]));
  manifest.tracks.forEach(t=>{
    if(!byLesson.has(t.lesson))byLesson.set(t.lesson,[]);
    byLesson.get(t.lesson).push(t);
  });

  const lessonsHtml=manifest.lessons.map((lesson,idx)=>{
    const tracks=byLesson.get(lesson.number)||[];
    return `<details class="audio-lesson" id="audio-encontro-${lesson.number}" ${idx===0?'open':''}>
      <summary>
        <span class="audio-lesson-number">Encontro ${lesson.number}</span>
        <span class="audio-lesson-title">${esc(lesson.title)}</span>
        <span class="audio-lesson-count">${tracks.length} microáudios</span>
      </summary>
      <div class="audio-track-list">
        ${tracks.map((t,n)=>`<article class="audio-track" data-audio-track="${esc(t.id)}">
          <div class="audio-track-index">${String(n+1).padStart(2,'0')}</div>
          <div class="audio-track-main">
            <div class="audio-track-head">
              <div>
                <h4>${esc(t.title)}</h4>
                <p>${esc(t.description)}</p>
              </div>
              <span class="audio-duration"><i class="ri-time-line" aria-hidden="true"></i> <span data-audio-total>1–2 min</span></span>
            </div>
            <div class="audio-controls">
              <button class="btn compact audio-play" type="button" data-audio-play="${esc(t.id)}" aria-label="Reproduzir áudio">
                <i class="ri-play-fill" aria-hidden="true"></i> Ouvir
              </button>
              <input class="audio-range" type="range" min="0" max="1" value="0" step="0.1" data-audio-range aria-label="Progresso do áudio">
              <span class="audio-time"><span data-audio-now>0:00</span> / <span data-audio-total-inline>--:--</span></span>
              <span class="audio-status" data-audio-status aria-live="polite">Pronto</span>
            </div>
            <details class="audio-transcript">
              <summary>Ver transcrição</summary>
              <p>${esc(t.script)}</p>
            </details>
          </div>
        </article>`).join('')}
      </div>
    </details>`;
  }).join('');

  section.innerHTML=`
    <div class="section-head audio-section-head">
      <span class="section-kicker">Revisão em áudio</span>
      <h2 class="section-title" id="audio-aulas-title">Aulas em áudio — CATS</h2>
      <p class="section-text">Microaulas curtas para revisar os principais pontos de cada encontro. Ouça em sequência ou escolha apenas o tema que precisa retomar.</p>
      <div class="audio-standard-note"><i class="ri-headphone-line" aria-hidden="true"></i><span>Áudio N2 pré-renderizado • voz neural pt-BR • sem voz sintética do navegador</span></div>
    </div>
    <div class="audio-lessons">${lessonsHtml}</div>`;

  trail.insertAdjacentElement('afterend',section);

  manifest.tracks.forEach(track=>{
    const row=trackEl(track.id);
    if(row)bindTrack(row,track);
  });

  document.querySelectorAll('.lesson-card').forEach((card,index)=>{
    const lesson=index+1;
    if(!manifest.lessons.some(l=>l.number===lesson))return;
    const actions=card.querySelector('.card-actions');
    if(!actions||actions.querySelector('[data-audio-jump]'))return;
    const a=document.createElement('a');
    a.className='btn ghost compact audio-jump';
    a.href=`#audio-encontro-${lesson}`;
    a.dataset.audioJump=String(lesson);
    a.innerHTML='<i class="ri-headphone-line" aria-hidden="true"></i> Ouvir microaulas';
    actions.appendChild(a);
  });

  const hero=document.querySelector('.hero-actions');
  if(hero&&!hero.querySelector('[data-audio-hero]')){
    const a=document.createElement('a');
    a.className='btn ghost';
    a.href='#audio-aulas';
    a.dataset.audioHero='true';
    a.innerHTML='<i class="ri-headphone-line" aria-hidden="true"></i> Aulas em áudio';
    hero.insertBefore(a,hero.lastElementChild);
  }
}

state.audio.addEventListener('loadedmetadata',updateCurrentUI);
state.audio.addEventListener('play',()=>{resetButtons(state.current?.id);updateCurrentUI()});
state.audio.addEventListener('pause',updateCurrentUI);
state.audio.addEventListener('timeupdate',()=>{
  updateCurrentUI();
  if(!state.current)return;
  const second=Math.floor(state.audio.currentTime||0);
  if(second===state.lastSavedSecond||second%5!==0)return;
  state.lastSavedSecond=second;
  state.progress[state.current.id]={position:state.audio.currentTime,complete:false};
  saveProgress();
});
state.audio.addEventListener('ended',()=>{
  if(!state.current)return;
  state.progress[state.current.id]={position:0,complete:true};
  saveProgress();
  const row=trackEl(state.current.id);
  row?.classList.add('is-complete');
  const status=row?.querySelector('[data-audio-status]');
  if(status)status.textContent='Concluído';
  updateCurrentUI();
});
state.audio.addEventListener('error',()=>{
  if(state.current)setError(state.current.id,'Áudio indisponível no momento.');
});

async function boot(){
  try{
    const res=await fetch(MANIFEST_URL,{cache:'no-store'});
    if(!res.ok)throw new Error(`manifest ${res.status}`);
    state.manifest=await res.json();
    render(state.manifest);
    Object.entries(state.progress).forEach(([id,p])=>{
      if(p?.complete)trackEl(id)?.classList.add('is-complete');
    });
  }catch(err){
    console.error('Falha ao carregar aulas em áudio',err);
  }
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();
