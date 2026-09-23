(() => {
  const data = window.WOLF_GUIDE;
  const $ = (s, root=document) => root.querySelector(s);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const nav = $('.nav');

  function openTab(id) {
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === id));
    document.querySelectorAll('.navlink').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
    nav.classList.remove('open');
    history.replaceState(null, '', `#${id}`);
    window.scrollTo({top:0,behavior:'smooth'});
  }
  document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', e => {e.preventDefault();openTab(b.dataset.tab)}));
  document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => openTab(b.dataset.go)));
  $('.nav-toggle').addEventListener('click', () => nav.classList.toggle('open'));
  const initial = location.hash.slice(1);
  if (['inicio','marcha','hg','esquemas'].includes(initial)) openTab(initial);

  const KEY = 'wolf-fgb-k24-project-v2';
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { saved = {}; }
  const stepsRoot = $('#startup-steps');
  stepsRoot.innerHTML = data.startup.map((step,i) => {
    const k = `step-${i}`;
    const ev = saved[k] || {};
    return `<article class="step-card" id="step-${i+1}"><div class="step-number">${String(i+1).padStart(2,'0')}</div><div><h2>${esc(step.title)}</h2><p class="purpose">${esc(step.purpose)}</p><ul>${step.items.map(item=>`<li>${esc(item)}</li>`).join('')}</ul><details><summary>Explicación y precauciones</summary><p>${esc(step.detail)}</p><span class="ref">${esc(step.ref)}</span></details><div class="check-row"><input type="checkbox" id="check-${i}" data-index="${i}" ${ev.checked?'checked':''}><label for="check-${i}">Etapa revisada con docente / responsable</label></div><div class="evidence"><label for="evidence-${i}">${esc(step.evidence)}</label><input id="evidence-${i}" data-evidence="${i}" value="${esc(ev.note||'')}" placeholder="Anotación breve; añade unidades cuando corresponda"></div></div></article>`;
  }).join('');

  function saveSteps() {
    const current = {};
    data.startup.forEach((_,i)=>{
      current[`step-${i}`] = {checked:$(`#check-${i}`).checked,note:$(`#evidence-${i}`).value};
    });
    saved = current;
    try { localStorage.setItem(KEY,JSON.stringify(current)); } catch {}
    const n = Object.values(current).filter(x=>x.checked).length;
    $('#progress-count').textContent = `${n} de ${data.startup.length} etapas`;
    $('#progress-bar').style.width = `${n/data.startup.length*100}%`;
  }
  stepsRoot.addEventListener('input', e => { if(e.target.matches('[data-index],[data-evidence]')) saveSteps(); });
  saveSteps();
  $('#reset-progress').addEventListener('click',()=>{
    if(!confirm('¿Borrar las marcas y notas guardadas en este navegador?')) return;
    localStorage.removeItem(KEY);
    data.startup.forEach((_,i)=>{$(`#check-${i}`).checked=false;$(`#evidence-${i}`).value='';});
    saveSteps();
  });

  const groupNames = {startup:'Puesta en marcha',heating:'Calefacción',dhw:'ACS / acumulador',service:'Instalación / servicio'};
  const results = $('#hg-results');
  function renderParams() {
    const query = $('#hg-search').value.trim().toLocaleLowerCase('es');
    const fuel = $('#fuel-filter').value;
    const group = $('#group-filter').value;
    const list = data.parameters.filter(p=>{
      const hay = `${p.code} ${p.name} ${p.explain} ${p.tags} ${p.when}`.toLocaleLowerCase('es');
      return (!query || hay.includes(query)) && (group==='all' || group===p.group);
    });
    results.innerHTML = list.length ? list.map(p=>{
      const val = fuel==='natural'?p.natural:p.lpg;
      return `<article class="parameter-card" role="button" tabindex="0" data-param="${esc(p.code)}" aria-label="Ver explicación del parámetro ${esc(p.code)}"><div class="parameter-head"><span class="code">${esc(p.code)}</span><span class="factory">${esc(val)} <small>${esc(p.unit)}</small></span></div><h3>${esc(p.name)}</h3><p>${esc(p.explain)}</p><div class="param-meta"><span>${esc(p.min)}–${esc(p.max)} ${esc(p.unit)}</span><span class="badge">${esc(groupNames[p.group])}</span></div></article>`;
    }).join('') : '<div class="card">No hay parámetros que coincidan con esa búsqueda.</div>';
  }
  function showDetail(code) {
    const p = data.parameters.find(item=>item.code===code);
    if(!p)return;
    const fuel = $('#fuel-filter').value;
    const fuelLabel = fuel==='natural'?'Gas natural':'Gas licuado P';
    const val = fuel==='natural'?p.natural:p.lpg;
    const box = $('#hg-detail');
    box.hidden=false;
    box.innerHTML = `<button class="text-button close-detail" type="button">Cerrar ×</button><span class="eyebrow">Parámetro ${esc(p.code)} · ${esc(fuelLabel)}</span><h2>${esc(p.name)}</h2><p><b>Valor de fábrica para FGB-K-24:</b> ${esc(val)} ${esc(p.unit)}. <b>Rango impreso:</b> ${esc(p.min)} a ${esc(p.max)} ${esc(p.unit)}.</p><p><b>Qué representa:</b> ${esc(p.explain)}</p><p><b>Visibilidad / condición:</b> ${esc(p.when)}</p><p class="ref"><b>Referencia:</b> Manual 3066484_202209, página impresa ${esc(p.page)}. Valores resumidos de la tabla de fábrica; comprueba variante y firmware.</p>`;
    box.scrollIntoView({behavior:'smooth',block:'center'});
    $('.close-detail',box).addEventListener('click',()=>{box.hidden=true;});
  }
  results.addEventListener('click', e=>{const card=e.target.closest('[data-param]');if(card)showDetail(card.dataset.param);});
  results.addEventListener('keydown', e=>{const card=e.target.closest('[data-param]');if(card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();showDetail(card.dataset.param);}});
  $('#hg-search').addEventListener('input',renderParams);
  $('#fuel-filter').addEventListener('change',renderParams);
  $('#group-filter').addEventListener('change',renderParams);
  renderParams();

  const slider = $('#curve-slider');
  slider.addEventListener('input',()=>$('#curve-output').textContent=slider.value);
})();
