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

  /* Tema oscuro (predeterminado) o claro: la elección se recuerda en este navegador */
  const themeButton = $('.theme-toggle');
  const themeMeta = $('#theme-color');
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const isLight = theme === 'light';
    themeButton.textContent = isLight ? '☾' : '☀';
    themeButton.setAttribute('aria-label', isLight ? 'Activar tema oscuro' : 'Activar tema claro');
    themeButton.setAttribute('title', themeButton.getAttribute('aria-label'));
    if (themeMeta) themeMeta.setAttribute('content', isLight ? '#f9f8f8' : '#0a0a0a');
    try { localStorage.setItem('wolf-fgb-k24-theme', theme); } catch {}
  }
  applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  themeButton.addEventListener('click', () => {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  });

  const initial = location.hash.slice(1);
  if (['inicio','marcha','gas','hg','esquemas'].includes(initial)) openTab(initial);

  /* Si la fotografía oficial no se puede cargar (sin conexión o abierto desde el
     disco duro), el hueco se rellena con el esquema funcional local en lugar de
     dejar un icono de imagen rota. */
  const productPhoto = $('.product-photo img');
  if (productPhoto) {
    productPhoto.addEventListener('error', () => {
      productPhoto.src = 'assets/system.svg';
      productPhoto.classList.add('photo-fallback');
      const caption = productPhoto.closest('figure')?.querySelector('figcaption');
      if (caption) caption.textContent = 'La fotografía oficial necesita conexión; se muestra el esquema funcional del equipo incluido en esta guía.';
    }, { once: true });
  }

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

  const gasProfiles = {
    eh:{name:'Gas natural E/H',h12:'5',note:'El manual indica que el equipo sale ajustado para gas natural E/H. Confirmar siempre la placa y presión de conexión. Si el aparato ya está configurado y la categoría coincide, no deducir que haga falta convertirlo.'},
    ll:{name:'Gas natural LL',h12:'5',note:'El manual indica cambio de tipo de gas para gas natural LL. La conversión física debe realizarse con el obturador/piezas especificados por WOLF para la variante y siguiendo las figuras de la página 45; no extrapolar el color o la pieza de otro modelo.'},
    lpg:{name:'Gas licuado P (GLP)',h12:'6',note:'El manual indica cambio de tipo de gas para GLP. La conversión física debe realizarse con las piezas aprobadas por WOLF y con la presión/categoría que marca la placa (en España hay variantes de 37 y 50 mbar).'}
  };
  function renderGasSummary(){
    const profile=gasProfiles[$('#gas-target').value];
    $('#gas-summary').innerHTML=`<span class="eyebrow">Selección de estudio · ${esc(profile.name)}</span><h2>FGB-K-24 · H12 de referencia ${esc(profile.h12)}</h2><p>${esc(profile.note)}</p><p><b>Firmware:</b> el manual requiere FW 4.30 para seleccionar la clase de potencia de 24 kW por H12. <b>Al cambiar H12:</b> H02–H04 se actualizan automáticamente según combustible/modelo.</p><button class="text-button" type="button" data-go="hg">Abrir explicación del parámetro H12 →</button> <a class="text-button" href="#gas-pressures" data-gas-pressure>Ver tabla de presión en esta guía ↓</a>`;
    $('#gas-summary [data-go="hg"]').addEventListener('click',()=>openTab('hg'));
    $('#gas-summary [data-gas-pressure]').addEventListener('click',e=>{e.preventDefault();openTab('esquemas');setTimeout(()=>document.querySelector('#gas-pressures')?.scrollIntoView({behavior:'smooth'}),0)});
  }
  $('#gas-target').addEventListener('change',renderGasSummary);
  renderGasSummary();
  $('.pressure-card').id='gas-pressures';

  const combustionReference={
    natural:[{condition:'Abierto · ajuste',load:'Máxima',co2:9.1,o2:4.5},{condition:'Abierto · ajuste',load:'Mínima',co2:8.9,o2:5.0},{condition:'Cerrado · análisis final',load:'Máxima',co2:9.3,o2:4.2},{condition:'Cerrado · análisis final',load:'Mínima',co2:9.1,o2:4.7}],
    lpg:[{condition:'Abierto · ajuste',load:'Máxima',co2:10.2,o2:5.4},{condition:'Abierto · ajuste',load:'Mínima',co2:9.8,o2:6.0},{condition:'Cerrado · análisis final',load:'Máxima',co2:10.5,o2:4.9},{condition:'Cerrado · análisis final',load:'Mínima',co2:10.0,o2:5.7}]
  };
  const combustionKey='wolf-fgb-k24-combustion-v1';
  let combustionSaved={};
  try{combustionSaved=JSON.parse(localStorage.getItem(combustionKey)||'{}')}catch{}
  const combustionFuel=$('#combustion-fuel');
  combustionFuel.value=combustionSaved.fuel||'natural';
  function renderCombustion(){
    const fuel=combustionFuel.value;
    const tbody=$('#combustion-table tbody');
    tbody.innerHTML=combustionReference[fuel].map((row,i)=>{
      const previous=combustionSaved.rows?.[`${fuel}-${i}`]||{};
      return `<tr><td>${esc(row.condition)}</td><td>${esc(row.load)}</td><td>${row.co2.toFixed(1)} ±0,2</td><td>${row.o2.toFixed(1)} ±0,3</td><td><input class="reading-input" type="number" min="0" max="20" step="0.1" inputmode="decimal" aria-label="CO₂ medido ${esc(row.condition)}, ${esc(row.load)}" data-gas-row="${fuel}-${i}" data-kind="co2" value="${esc(previous.co2??'')}"></td><td><input class="reading-input" type="number" min="0" max="20" step="0.1" inputmode="decimal" aria-label="O₂ medido ${esc(row.condition)}, ${esc(row.load)}" data-gas-row="${fuel}-${i}" data-kind="o2" value="${esc(previous.o2??'')}"></td><td id="reading-status-${i}" aria-live="polite">Pendiente</td></tr>`;
    }).join('');
    tbody.querySelectorAll('input').forEach(input=>input.addEventListener('input',saveCombustion));
    combustionSaved.fuel=fuel;
    try{localStorage.setItem(combustionKey,JSON.stringify(combustionSaved))}catch{}
    updateCombustionStatuses();
  }
  function updateCombustionStatuses(){
    const fuel=combustionFuel.value;
    combustionReference[fuel].forEach((row,i)=>{
      const co2Input=$(`[data-gas-row="${fuel}-${i}"][data-kind="co2"]`);
      const o2Input=$(`[data-gas-row="${fuel}-${i}"][data-kind="o2"]`);
      const co2=Number(co2Input?.value),o2=Number(o2Input?.value);
      const status=$(`#reading-status-${i}`);
      if(!co2Input?.value||!o2Input?.value||!Number.isFinite(co2)||!Number.isFinite(o2)){status.textContent='Pendiente';status.className='';return;}
      const ok=Math.abs(co2-row.co2)<=0.200001&&Math.abs(o2-row.o2)<=0.300001;
      status.textContent=ok?'Dentro de tolerancia de referencia':'Fuera de tolerancia: revisar';
      status.className=ok?'reading-ok':'reading-out';
    });
  }
  function saveCombustion(){
    combustionSaved.fuel=combustionFuel.value;
    combustionSaved.rows=combustionSaved.rows||{};
    document.querySelectorAll('[data-gas-row]').forEach(input=>{
      const row=combustionSaved.rows[input.dataset.gasRow]||{};
      row[input.dataset.kind]=input.value;
      combustionSaved.rows[input.dataset.gasRow]=row;
    });
    try{localStorage.setItem(combustionKey,JSON.stringify(combustionSaved))}catch{}
    updateCombustionStatuses();
  }
  combustionFuel.addEventListener('change',renderCombustion);
  renderCombustion();

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
