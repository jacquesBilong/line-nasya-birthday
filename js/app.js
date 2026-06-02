(() => {
  'use strict';

  const CONFIG = {
    eventName: '1er anniversaire de Line Nasya Bilong',
    eventDate: '15 août 2026',
    eventStart: '2026-08-15T10:00:00+02:00',
    venue: 'Parochiezaal “Ter Krokegem”',
    address: 'Dendermondsesteenweg 44, B-1730 Asse',
    parents: 'Jacques & Suzanne Bilong',
    storageKey: 'line_nasya_pro_complete_v1',
    sessionKey: 'line_nasya_session_v1',
    organizerCode: 'LINEORGANISATION',
    adminCode: 'LINEADMINVIP2026',
    legacyAdminCode: 'ADMIN',
    legacyAdminPass: 'admin'
  };

  const MEALS = ['Menu adulte', 'Viande - Poulet', 'Viande - Bœuf', 'Poisson', 'Végétarien', 'Menu enfant', 'Bébé / purée', 'Sans repas'];
  const DRINKS = ['Eau', 'Jus', 'Soda', 'Vin rouge', 'Vin blanc', 'Champagne', 'Bière', 'Cocktail', 'Sans alcool'];
  const DELAYS = [
    ['a_lheure', 'À l’heure'],
    ['retard_15', 'Retard possible : 15 min'],
    ['retard_30', 'Retard possible : 30 min'],
    ['retard_60', 'Retard possible : 1h ou plus'],
    ['ne_sais_pas', 'Je ne sais pas encore']
  ];
  const ALBUMS = [
    ['all', 'Tout'], ['line', 'Line'], ['arrivee', 'Arrivée'], ['famille', 'Famille'], ['enfants', 'Enfants'], ['gateau', 'Gâteau'], ['soiree', 'Soirée']
  ];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const app = $('#app');
  const navbar = $('#navbar');
  const navLinks = $('#navLinks');
  const navBackdrop = $('#navBackdrop');
  const menuToggle = $('#menuToggle');
  const toastMount = $('#toastMount');
  const modalMount = $('#modalMount');

  let page = 'gate';
  let session = loadSession();
  let state = loadState();
  let countdownTimer = null;
  let activeAdminTab = 'dashboard';
  let galleryAlbum = 'all';
  let galleryQuery = '';
  let galleryShown = 24;

  function defaultState(){
    return {
      invites: [
        { id: 1, code: 'LINE001', pass: '1234', family: 'Famille Alain Assomo', mainName: 'Alain Assomo', email: 'alain@example.com', phone: '+32470000001', maxGuests: 4, status: 'pending' },
        { id: 2, code: 'LINE002', pass: '1234', family: 'Famille Nathalie Tani', mainName: 'Nathalie Tani', email: 'nathalie@example.com', phone: '+32470000002', maxGuests: 3, status: 'pending' },
        { id: 3, code: 'LINE003', pass: '1234', family: 'Famille Andy Mvondo', mainName: 'Andy Mvondo', email: 'andy@example.com', phone: '+32470000003', maxGuests: 2, status: 'pending' },
        { id: 4, code: 'ALAIN-ASSOMO', pass: '1234', family: 'Famille Alain Assomo', mainName: 'Alain Assomo', email: '', phone: '', maxGuests: 4, status: 'pending' }
      ],
      responses: [],
      content: {
        note: 'La fête continuera dans une ambiance chaleureuse jusqu’au départ progressif des invités.'
      }
    };
  }

  function seedGallery(){
    return Array.from({ length: 12 }, (_, i) => {
      const albums = ['line','arrivee','famille','enfants','gateau','soiree'];
      return {
        id: i + 1,
        album: albums[i % albums.length],
        title: ['Portrait de Line','Arrivée des invités','Moment famille','Jeux enfants','Gâteau anniversaire','Ambiance festive'][i % 6],
        caption: 'Emplacement photo à remplacer par vos vraies images.',
        author: 'Famille',
        url: `assets/img/gallery-${(i % 8) + 1}.svg`,
        ratio: i % 3 === 0 ? '3/4' : (i % 3 === 1 ? '1/1' : '4/5'),
        approved: true,
        date: '2026-08-15'
      };
    });
  }

  function loadState(){
    try { return JSON.parse(localStorage.getItem(CONFIG.storageKey)) || defaultState(); }
    catch { return defaultState(); }
  }
  function saveState(){ localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); }
  function loadSession(){
    try { return JSON.parse(sessionStorage.getItem(CONFIG.sessionKey)) || null; }
    catch { return null; }
  }
  function saveSession(){ sessionStorage.setItem(CONFIG.sessionKey, JSON.stringify(session)); }
  function clearSession(){ session = null; sessionStorage.removeItem(CONFIG.sessionKey); }
  function uid(){ return Date.now() + Math.floor(Math.random() * 9999); }
  function normalize(v){ return String(v || '').trim().toUpperCase().replace(/\s+/g, ''); }
  function esc(v=''){
    return String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function ageCat(age){
    const n = Number(age);
    if (age === '' || Number.isNaN(n)) return 'Non précisé';
    if (n < 2) return 'Bébé';
    if (n < 12) return 'Enfant';
    if (n < 18) return 'Ado';
    return 'Adulte';
  }
  function labelDelay(v){ return (DELAYS.find(d => d[0] === v) || ['', '—'])[1]; }
  function currentInvite(){ return session?.inviteId ? state.invites.find(i => i.id === session.inviteId) : null; }
  function responseForInvite(id){ return state.responses.find(r => r.inviteId === id); }

  function toast(message, type='success'){
    const el = document.createElement('div');
    el.className = 'toast ' + (type === 'error' ? 'error' : type === 'info' ? 'info' : '');
    el.textContent = (type === 'error' ? '❌ ' : type === 'info' ? 'ℹ️ ' : '✅ ') + message;
    toastMount.appendChild(el);
    setTimeout(() => el.remove(), 3400);
  }
  function modal(html){
    modalMount.innerHTML = `<div class="modal-backdrop"><div class="modal-card">${html}</div></div>`;
    $('.modal-backdrop').addEventListener('click', e => { if(e.target.classList.contains('modal-backdrop')) closeModal(); });
    document.addEventListener('keydown', escCloseOnce);
  }
  function escCloseOnce(e){ if(e.key === 'Escape'){ closeModal(); document.removeEventListener('keydown', escCloseOnce); } }
  function closeModal(){ modalMount.innerHTML = ''; document.removeEventListener('keydown', escCloseOnce); }

  function boot(){
    if (session) page = session.role === 'organizer' || session.role === 'admin' ? 'organizer' : 'home';
    render();
    setTimeout(() => $('#loader')?.classList.add('hide'), 450);
  }

  function render(){
    stopCountdown();
    navbar.classList.toggle('hidden', page === 'gate');
    closeMobileMenu();
    renderNav();
    if(page === 'gate') app.innerHTML = renderGate();
    if(page === 'home') app.innerHTML = renderHome();
    if(page === 'program') app.innerHTML = renderProgramPage();
    if(page === 'reservation') app.innerHTML = renderReservation();
    if(page === 'organizer') app.innerHTML = renderOrganizer();
    bindGlobal();
    if(page === 'gate') bindGate();
    if(page === 'home') startCountdown();
    if(page === 'reservation') bindReservation();
    if(page === 'organizer') bindOrganizer();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function renderNav(){
    if(page === 'gate') return;
    const role = session?.role || 'guest';
    const items = [
      ['home','Accueil'], ['program','Programme'], ['reservation','Réservation']
    ];
    if(role === 'organizer' || role === 'admin') items.push(['organizer','Organisateur']);
    items.push(['logout','Quitter']);
    navLinks.innerHTML = items.map(([p,l]) => `<button type="button" data-nav="${p}" class="${page===p?'active':''}">${l}</button>`).join('');
  }

  function bindGlobal(){
    $('#brandBtn')?.addEventListener('click', () => go('home'));
    $$('[data-nav]').forEach(b => b.onclick = () => b.dataset.nav === 'logout' ? logout() : go(b.dataset.nav));
    menuToggle.onclick = () => toggleMobileMenu();
    navBackdrop.onclick = () => closeMobileMenu();
  }
  function go(p){ if(['gallery','guestbook','rsvp'].includes(p)) p='reservation'; page = p; render(); }
  function logout(){ clearSession(); page = 'gate'; render(); toast('Session fermée.', 'info'); }
  function toggleMobileMenu(){ const open = !navLinks.classList.contains('open'); navLinks.classList.toggle('open', open); navBackdrop.classList.toggle('hidden', !open); menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false'); }
  function closeMobileMenu(){ navLinks.classList.remove('open'); navBackdrop.classList.add('hidden'); menuToggle.setAttribute('aria-expanded','false'); }

  function renderGate(){
    return `<section class="gate">
      <div class="gate-visual"><div class="gate-signature"><div class="script">Line Nasya</div><p>Une invitation privée pour célébrer son tout premier anniversaire dans une ambiance douce, familiale et chic.</p></div></div>
      <div class="gate-panel"><div class="gate-card card">
        <span class="eyebrow">Invitation privée</span>
        <h1 class="title">Entrer dans la fête</h1>
        <p class="lead">Saisissez votre code personnel. Un mot de passe peut être demandé pour les anciens codes.</p>
        <form id="loginForm" style="display:grid;gap:12px;margin-top:22px">
          <input id="loginCode" class="input" placeholder="Code secret" autocomplete="off" required>
          <input id="loginPass" class="input" placeholder="Mot de passe si reçu" type="password" autocomplete="off">
          <div id="loginError" class="login-error"></div>
          <button class="btn btn-primary" type="submit">Entrer</button>
        </form>
        <p class="code-help">Codes test : LINE001 / 1234 · organisateur : Lineorganisation · admin : LineAdminVIP2026</p>
      </div></div>
    </section>`;
  }

  function bindGate(){
    $('#loginForm').addEventListener('submit', e => {
      e.preventDefault();
      const codeRaw = $('#loginCode').value;
      const pass = $('#loginPass').value.trim();
      const code = normalize(codeRaw);
      const err = $('#loginError');

      if(code === normalize(CONFIG.adminCode) || (code === normalize(CONFIG.legacyAdminCode) && pass === CONFIG.legacyAdminPass)){
        session = { role:'admin', name:'Admin principal' }; saveSession(); page = 'organizer'; render(); toast('Bienvenue admin.'); return;
      }
      if(code === normalize(CONFIG.organizerCode)){
        session = { role:'organizer', name:'Organisateur' }; saveSession(); page = 'organizer'; render(); toast('Bienvenue organisateur.'); return;
      }
      const guest = state.invites.find(i => normalize(i.code) === code && (!i.pass || !pass || i.pass === pass));
      if(guest){ session = { role:'guest', inviteId:guest.id, name:guest.mainName || guest.family }; saveSession(); page='home'; render(); toast(`Bienvenue ${guest.family}.`); return; }

      err.textContent = 'Code ou mot de passe incorrect.';
      $('.gate-card').classList.add('shake');
      setTimeout(() => $('.gate-card')?.classList.remove('shake'), 380);
    });
  }

  function renderHome(){
    const inv = currentInvite();
    const resp = inv ? responseForInvite(inv.id) : null;
    const c = countdown();
    return `<section class="hero"><div class="container hero-grid">
      <div class="hero-copy">
        <span class="eyebrow">15 août 2026 · Asse</span>
        <div><h1 class="title">1er anniversaire</h1><div class="script">Line Nasya</div></div>
        <p class="lead">${CONFIG.parents} ont la joie de vous inviter à une journée familiale, élégante et festive pour célébrer les 1 an de Line Nasya Bilong.</p>
        ${inv ? `<div class="card card-soft"><strong>${esc(inv.family)}</strong><p style="color:var(--muted)">Code : ${esc(inv.code)} · Places prévues : ${inv.maxGuests}</p>${resp?`<span class="badge ${resp.presence==='oui'?'ok':'no'}">${resp.presence==='oui'?'Présence confirmée':'Absence notée'}</span>`:'<span class="badge wait">Réservation en attente</span>'}</div>`:''}
        <div class="event-chips"><span class="chip-info">📍 ${CONFIG.venue}</span><span class="chip-info">🗺️ ${CONFIG.address}</span><span class="chip-info">🕐 À partir de 10h00</span></div>
        <div class="countdown">
          ${countCard(c.d,'Jours')}${countCard(c.h,'Heures')}${countCard(c.m,'Minutes')}${countCard(c.s,'Secondes')}
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-primary" data-nav="reservation">Faire ma réservation</button><button class="btn btn-soft" data-nav="program">Voir le programme</button></div>
      </div>
      <div class="hero-photo" aria-label="Photo de Line Nasya"></div>
    </div></section>${renderProgramIntro()}${renderFooter()}`;
  }
  function countCard(v,l){ return `<div class="count-card"><strong data-count="${l}">${String(v).padStart(2,'0')}</strong><span>${l}</span></div>`; }

  function renderProgramIntro(){ return `<section class="section"><div class="container"><div style="text-align:center;margin-bottom:28px"><span class="eyebrow">Programme</span><h2 class="title" style="font-size:clamp(2.2rem,5vw,4.4rem)">Une fête sans pression</h2><p class="lead">Pas d’heure de fin annoncée : la fête continue dans une ambiance chaleureuse jusqu’au départ progressif des invités.</p></div><div class="program-flow">${programItems().map(x=>`<div class="flow-card"><div class="flow-icon">${x.icon}</div><div class="flow-time">${x.time}</div><div class="flow-title">${x.title}</div><p>${x.text}</p></div>`).join('')}</div></div></section>`; }
  function programItems(){ return [
    {time:'10h00', icon:'☀️', title:'Accueil', text:'Arrivée progressive des invités, installation et premières photos.'},
    {time:'Matinée', icon:'🧸', title:'Animations enfants', text:'Jeux doux, espace enfants, rires et petits souvenirs.'},
    {time:'Midi', icon:'🍽️', title:'Repas convivial', text:'Repas adapté selon les RSVP, âges, allergies et préférences.'},
    {time:'Après-midi', icon:'🎂', title:'Gâteau', text:'Moment anniversaire, bougie, photos de famille et douceur.'},
    {time:'Toute la journée', icon:'💛', title:'Souvenirs', text:'Moments de famille, échanges, sourires et souvenirs autour de Line.'},
    {time:'Soirée', icon:'✨', title:'Ambiance festive', text:'Musique, danse, échanges et convivialité jusqu’au départ des invités.'}
  ]; }
  function renderProgramPage(){ return `${renderProgramIntro()}${renderFooter()}`; }

  function renderReservation(){
    const inv = currentInvite();
    if(!inv && session?.role === 'guest') return `<section class="section"><div class="narrow card"><h1 class="title">Accès requis</h1><p class="lead">Reconnectez-vous avec votre code invité.</p></div></section>`;
    if(!inv) return `<section class="section"><div class="narrow card"><h1 class="title">Mode organisateur</h1><p class="lead">Le formulaire de réservation est réservé aux invités.</p></div></section>${renderFooter()}`;
    const resp = responseForInvite(inv.id);
    if(resp) return renderReservationDone(inv, resp);
    return `<section class="section"><div class="narrow">
      <div style="text-align:center;margin-bottom:28px"><span class="eyebrow">Réservation personnalisée</span><h1 class="title">Votre réponse</h1><p class="lead">Merci de remplir les accompagnants avec prénom et âge pour aider le traiteur et le plan de salle.</p></div>
      <form id="reservationForm" class="card" style="display:grid;gap:18px">
        <div class="card card-soft" style="box-shadow:none"><strong>${esc(inv.family)}</strong><p style="color:var(--muted)">Places prévues : ${inv.maxGuests} · Code : ${esc(inv.code)}</p></div>
        <div class="grid-2"><div class="field"><label>Nom du répondant</label><input class="input" name="mainName" value="${esc(inv.mainName||'')}" required></div><div class="field"><label>Contact</label><input class="input" name="contact" value="${esc(inv.email||inv.phone||'')}" placeholder="email ou téléphone"></div></div>
        <div class="field"><label>Présence</label><div class="choice-row"><button type="button" class="choice selected" data-presence="oui">Oui, nous serons là</button><button type="button" class="choice" data-presence="non">Non, malheureusement</button></div></div>
        <div id="presentBlock" style="display:grid;gap:18px">
          <div class="grid-2"><div class="field"><label>Arrivée prévue</label><select class="select" name="arrival">${['10h00','10h30','11h00','11h30','12h00','12h30','13h00','14h00','15h00','17h00','18h00'].map(h=>`<option>${h}</option>`).join('')}</select></div><div class="field"><label>Retard possible</label><select class="select" name="delay">${DELAYS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div></div>
          <div class="field"><label>Boissons souhaitées</label><div class="chips">${DRINKS.map(d=>`<button type="button" class="chip" data-drink="${esc(d)}">${esc(d)}</button>`).join('')}</div></div>
          <div><div class="field"><label>Personnes présentes</label></div><div id="companions"></div><button type="button" class="btn btn-soft" id="addCompanion">Ajouter une personne</button></div>
          <div class="grid-2"><div class="field"><label>Allergies / régime</label><textarea class="textarea" name="allergies" placeholder="Ex : sans porc, arachides, halal, sans gluten..."></textarea></div><div class="field"><label>Souhait table / remarques</label><textarea class="textarea" name="tableWish" placeholder="Ex : proche enfants, poussette, famille..."></textarea></div></div>
        </div>
        <div class="field"><label>Petit message pour Line</label><textarea class="textarea" name="message" placeholder="Votre petit mot..."></textarea></div>
        <button class="btn btn-primary" type="submit">Enregistrer ma réponse</button>
      </form>
    </div></section>${renderFooter()}`;
  }
  function companionHtml(name='', age=''){
    return `<div class="companion"><div class="companion-head"><strong>Personne</strong><button type="button" class="btn btn-danger btn-small remove-companion">Retirer</button></div><div class="grid-3"><div class="field"><label>Prénom</label><input class="input comp-name" value="${esc(name)}" required></div><div class="field"><label>Âge</label><input class="input comp-age" type="number" min="0" max="120" value="${esc(age)}" placeholder="Ex : 8"></div><div class="field"><label>Repas</label><select class="select comp-meal">${MEALS.map(m=>`<option>${esc(m)}</option>`).join('')}</select></div></div><span class="small-cat">Catégorie : ${ageCat(age)}</span></div>`;
  }
  function renderReservationDone(inv, r){
    const msg = buildConfirmMessage(inv, r);
    return `<section class="section"><div class="narrow card" style="text-align:center"><div style="font-size:3rem">💝</div><h1 class="title">Réponse enregistrée</h1><p class="lead">${r.presence==='oui'?'Votre présence est confirmée.':'Votre absence est bien notée.'}</p><div class="card card-soft" style="margin:20px 0;box-shadow:none"><strong>${esc(inv.family)}</strong><p style="color:var(--muted)">Personnes : ${r.companions.length} · Retard : ${labelDelay(r.delay)} · Arrivée : ${r.arrival||'—'}</p></div><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn btn-green" target="_blank" href="${whatsApp(inv.phone, msg)}">WhatsApp</a><button class="btn btn-gold" id="downloadICS">Agenda</button><button class="btn btn-soft" id="editResponse">Modifier</button><button class="btn btn-danger" id="deleteResponse">Supprimer</button></div></div></section>${renderFooter()}`;
  }

  function bindReservation(){
    const inv = currentInvite();
    if(!inv) return;
    const existing = responseForInvite(inv.id);
    if(existing){
      $('#editResponse')?.addEventListener('click',()=>{ state.responses = state.responses.filter(r=>r.inviteId!==inv.id); saveState(); render(); });
      $('#deleteResponse')?.addEventListener('click',()=>{ if(confirm('Supprimer votre réponse ?')){ state.responses = state.responses.filter(r=>r.inviteId!==inv.id); saveState(); toast('Réponse supprimée.'); render(); }});
      $('#downloadICS')?.addEventListener('click', downloadICS);
      return;
    }
    let presence = 'oui'; let drinks = [];
    const add = (name='') => { $('#companions').insertAdjacentHTML('beforeend', companionHtml(name)); refreshCompanionEvents(); };
    add(inv.mainName || '');
    $('#addCompanion').addEventListener('click',()=>add());
    $$('[data-presence]').forEach(b=>b.addEventListener('click',()=>{presence=b.dataset.presence; $$('[data-presence]').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); $('#presentBlock').classList.toggle('hidden', presence !== 'oui');}));
    $$('[data-drink]').forEach(b=>b.addEventListener('click',()=>{const d=b.dataset.drink; drinks=drinks.includes(d)?drinks.filter(x=>x!==d):[...drinks,d]; b.classList.toggle('selected');}));
    $('#reservationForm').addEventListener('submit', e => {
      e.preventDefault(); const f=e.target;
      const companions = $$('.companion').map(c=>({name:$('.comp-name',c).value.trim(), age:$('.comp-age',c).value.trim(), category:ageCat($('.comp-age',c).value.trim()), meal:$('.comp-meal',c).value})).filter(c=>c.name);
      if(presence==='oui' && companions.length===0){ toast('Ajoute au moins une personne présente.','error'); return; }
      if(presence==='oui' && companions.length > inv.maxGuests && !confirm(`Vous avez indiqué ${companions.length} personnes pour ${inv.maxGuests} places prévues. Continuer ?`)) return;
      state.responses = state.responses.filter(r=>r.inviteId!==inv.id);
      state.responses.push({ id:uid(), inviteId:inv.id, presence, mainName:f.mainName.value.trim(), contact:f.contact.value.trim(), delay:f.delay?.value||'', arrival:f.arrival?.value||'', drinks, companions:presence==='oui'?companions:[], allergies:f.allergies?.value.trim()||'', tableWish:f.tableWish?.value.trim()||'', message:f.message.value.trim(), createdAt:new Date().toISOString() });
      inv.status = 'responded'; saveState(); toast('Réservation enregistrée.'); render();
    });
  }
  function refreshCompanionEvents(){
    $$('.remove-companion').forEach(b=>b.onclick=()=>{ if($$('.companion').length<=1){toast('Garde au moins une personne.','error');return;} b.closest('.companion').remove(); });
    $$('.comp-age').forEach(inp=>inp.oninput=()=>{ $('.small-cat', inp.closest('.companion')).textContent = 'Catégorie : ' + ageCat(inp.value); });
  }


  function renderOrganizer(){
    if(!session || !['organizer','admin'].includes(session.role)) return `<section class="section"><div class="narrow card"><h1 class="title">Accès refusé</h1><p class="lead">Cette page est réservée à l’organisation.</p></div></section>`;
    return `<section class="section"><div class="container"><div style="display:flex;justify-content:space-between;gap:20px;align-items:end;flex-wrap:wrap;margin-bottom:22px"><div><span class="eyebrow">Espace organisation</span><h1 class="title">Tableau de bord</h1><p class="lead">Suivi réservations, traiteur, retards, codes invités et exports.</p></div><button id="exportAll" class="btn btn-primary">Export global CSV</button></div><div class="admin-layout"><aside class="admin-side card"><div class="admin-menu">${['dashboard','invites','responses','catering'].map(t=>`<button class="${activeAdminTab===t?'active':''}" data-admin-tab="${t}">${adminLabel(t)}</button>`).join('')}</div></aside><div>${renderAdminTab()}</div></div></div></section>${renderFooter()}`;
  }
  function adminLabel(t){ return {dashboard:'Dashboard',invites:'Invités & codes',responses:'Réservations',catering:'Traiteur'}[t] || t; }
  function renderAdminTab(){
    if(activeAdminTab==='dashboard') return renderAdminDashboard();
    if(activeAdminTab==='invites') return renderAdminInvites();
    if(activeAdminTab==='responses') return renderAdminResponses();
    if(activeAdminTab==='catering') return renderAdminCatering();
    return '';
  }
  function computeStats(){
    let people=0, adults=0, children=0, babies=0, late=0, yes=0, no=0;
    state.responses.forEach(r=>{ if(r.presence==='oui'){ yes++; people += r.companions.length; if(r.delay && r.delay !== 'a_lheure') late++; r.companions.forEach(p=>{ if(['Adulte','Ado'].includes(p.category)) adults++; else if(p.category==='Enfant') children++; else if(p.category==='Bébé') babies++; }); } else no++; });
    return { people, adults, children, babies, late, yes, no, pending: state.invites.length - yes - no };
  }
  function renderAdminDashboard(){ const s=computeStats(); return `<div class="stats">${[['Invités',state.invites.length],['Réponses',state.responses.length],['Présents',s.yes],['Total personnes',s.people],['Retards',s.late]].map(([l,v])=>`<div class="stat"><strong>${v}</strong><span>${l}</span></div>`).join('')}</div><div class="grid-2" style="margin-top:18px"><div class="card"><h2 class="serif" style="color:var(--chocolate)">Synthèse traiteur</h2><p class="lead">Adultes : ${s.adults} · Enfants : ${s.children} · Bébés : ${s.babies}</p></div><div class="card"><h2 class="serif" style="color:var(--chocolate)">Actions rapides</h2><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button id="exportCatering" class="btn btn-green">Export traiteur</button><button id="printCodes" class="btn btn-gold">Imprimer codes</button><button id="copyAllCodes" class="btn btn-soft">Copier codes</button></div></div></div>`; }
  function renderAdminInvites(){ return `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px"><button id="addInvite" class="btn btn-primary">Ajouter invité</button><button id="generateCodes" class="btn btn-soft">Générer 50 codes</button><button id="printCodes2" class="btn btn-gold">Imprimer codes</button></div>${adminInviteRows()}`; }
  function adminInviteRows(){ return `<div class="table-wrap"><table><thead><tr><th>Code</th><th>Famille</th><th>Contact</th><th>Places</th><th>Statut</th><th>Actions</th></tr></thead><tbody>${state.invites.map(i=>{const r=responseForInvite(i.id); return `<tr><td><strong>${esc(i.code)}</strong><br><small>Pass : ${esc(i.pass||'—')}</small></td><td>${esc(i.family)}<br><small>${esc(i.mainName||'')}</small></td><td>${esc(i.email||'—')}<br><small>${esc(i.phone||'')}</small></td><td>${i.maxGuests}</td><td>${r?`<span class="badge ${r.presence==='oui'?'ok':'no'}">${r.presence==='oui'?'Présent':'Absent'}</span>`:'<span class="badge wait">Attente</span>'}</td><td><button class="btn btn-soft btn-small" data-edit-invite="${i.id}">Modifier</button><a class="btn btn-green btn-small" target="_blank" href="${whatsApp(i.phone, inviteMessage(i))}">WhatsApp</a></td></tr>`;}).join('')}</tbody></table></div><div class="admin-card-list">${state.invites.map(i=>`<div class="admin-guest-card"><strong>${esc(i.family)}</strong><p>Code : ${esc(i.code)} · Places : ${i.maxGuests}</p><button class="btn btn-soft btn-small" data-edit-invite="${i.id}">Modifier</button></div>`).join('')}</div>`; }
  function renderAdminResponses(){ return `<div class="table-wrap"><table><thead><tr><th>Famille</th><th>Présence</th><th>Personnes</th><th>Retard</th><th>Boissons</th><th>Allergies</th><th>Message</th></tr></thead><tbody>${state.invites.map(i=>{const r=responseForInvite(i.id); return r?`<tr><td>${esc(i.family)}</td><td><span class="badge ${r.presence==='oui'?'ok':'no'}">${r.presence==='oui'?'Oui':'Non'}</span></td><td>${r.companions.map(p=>`${esc(p.name)} (${esc(p.category)}, ${esc(p.meal)})`).join('<br>')||'—'}</td><td>${labelDelay(r.delay)}<br><small>${esc(r.arrival||'')}</small></td><td>${esc((r.drinks||[]).join(', ')||'—')}</td><td>${esc(r.allergies||'—')}</td><td>${esc(r.message||'—')}</td></tr>`:`<tr><td>${esc(i.family)}</td><td colspan="6"><span class="badge wait">En attente</span></td></tr>`}).join('')}</tbody></table></div>`; }
  function renderAdminCatering(){ const rows=[]; state.responses.forEach(r=>{ const i=state.invites.find(x=>x.id===r.inviteId); if(r.presence==='oui') r.companions.forEach(p=>rows.push({family:i?.family,code:i?.code,...p,delay:labelDelay(r.delay),arrival:r.arrival,allergies:r.allergies})); }); return `<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px"><button id="exportCatering2" class="btn btn-green">Exporter traiteur</button></div><div class="table-wrap"><table><thead><tr><th>Famille</th><th>Prénom</th><th>Âge</th><th>Catégorie</th><th>Repas</th><th>Retard</th><th>Allergies</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.family)}</td><td>${esc(r.name)}</td><td>${esc(r.age||'—')}</td><td>${esc(r.category)}</td><td>${esc(r.meal)}</td><td>${esc(r.delay)}<br><small>${esc(r.arrival||'')}</small></td><td>${esc(r.allergies||'—')}</td></tr>`).join('') || '<tr><td colspan="7">Aucune donnée traiteur.</td></tr>'}</tbody></table></div>`; }

  function bindOrganizer(){
    $$('[data-admin-tab]').forEach(b=>b.onclick=()=>{ activeAdminTab=b.dataset.adminTab; render(); });
    $('#exportAll')?.addEventListener('click', exportAllCSV);
    $('#exportCatering')?.addEventListener('click', exportCateringCSV);
    $('#exportCatering2')?.addEventListener('click', exportCateringCSV);
    $('#printCodes')?.addEventListener('click', printCodes);
    $('#printCodes2')?.addEventListener('click', printCodes);
    $('#copyAllCodes')?.addEventListener('click', copyAllCodes);
    $('#generateCodes')?.addEventListener('click', generateCodes);
    $('#addInvite')?.addEventListener('click',()=>editInvite());
    $$('[data-edit-invite]').forEach(b=>b.onclick=()=>editInvite(Number(b.dataset.editInvite)));
  }
  function editInvite(id=null){
    const inv = id ? state.invites.find(x=>x.id===id) : {id:uid(),code:'LINE'+String(state.invites.length+1).padStart(3,'0'),pass:'1234',family:'',mainName:'',email:'',phone:'',maxGuests:2,status:'pending'};
    modal(`<h2 class="serif" style="font-size:2.4rem;color:var(--chocolate)">${id?'Modifier':'Ajouter'} un invité</h2><div class="grid-2" style="margin-top:14px"><input class="input" id="mFamily" placeholder="Famille" value="${esc(inv.family)}"><input class="input" id="mCode" placeholder="Code" value="${esc(inv.code)}"><input class="input" id="mPass" placeholder="Mot de passe" value="${esc(inv.pass||'')}"><input class="input" id="mMax" type="number" min="1" placeholder="Places" value="${inv.maxGuests}"><input class="input" id="mMain" placeholder="Nom principal" value="${esc(inv.mainName||'')}"><input class="input" id="mEmail" placeholder="Email" value="${esc(inv.email||'')}"><input class="input" id="mPhone" placeholder="Téléphone" value="${esc(inv.phone||'')}"></div><div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px"><button class="btn btn-soft" id="cancelModal">Annuler</button><button class="btn btn-primary" id="saveInvite">Enregistrer</button></div>`);
    $('#cancelModal').onclick=closeModal; $('#saveInvite').onclick=()=>{Object.assign(inv,{family:$('#mFamily').value.trim(),code:normalize($('#mCode').value),pass:$('#mPass').value.trim(),mainName:$('#mMain').value.trim(),maxGuests:Number($('#mMax').value||1),email:$('#mEmail').value.trim(),phone:$('#mPhone').value.trim()}); if(!inv.family||!inv.code){toast('Famille et code obligatoires.','error');return;} if(!id)state.invites.push(inv); saveState(); closeModal(); toast('Invité enregistré.'); render();};
  }
  function generateCodes(){ for(let i=0;i<50;i++){ const n=state.invites.length+1; state.invites.push({id:uid()+i,code:'LINE'+String(n).padStart(3,'0'),pass:'1234',family:'Invité '+String(n).padStart(3,'0'),mainName:'',email:'',phone:'',maxGuests:2,status:'pending'}); } saveState(); toast('50 codes ajoutés.'); render(); }
  function copyAllCodes(){ const text=state.invites.map((i,k)=>`${k+1}. ${i.family} → Code : ${i.code} / Mot de passe : ${i.pass||'—'} (${i.maxGuests} pers.)`).join('\n'); navigator.clipboard?.writeText(text).then(()=>toast('Codes copiés.')).catch(()=>alert(text)); }
  function printCodes(){ const w=window.open('','_blank'); w.document.write(`<html><head><title>Codes Line Nasya</title><style>body{font-family:Arial;padding:24px}.card{border:1px solid #ddd;border-radius:12px;padding:14px;margin:10px 0}h1{color:#553633}</style></head><body><h1>Codes invités · Line Nasya</h1>${state.invites.map(i=>`<div class="card"><strong>${esc(i.family)}</strong><br>Code : <b>${esc(i.code)}</b><br>Mot de passe : <b>${esc(i.pass||'—')}</b><br>Places : ${i.maxGuests}</div>`).join('')}</body></html>`); w.document.close(); w.print(); }
  function exportAllCSV(){ const rows=state.invites.map(i=>{const r=responseForInvite(i.id); return [i.family,i.code,i.pass,i.maxGuests,r?.presence||'attente',r?.companions?.length||0,labelDelay(r?.delay),r?.arrival||'',(r?.drinks||[]).join('|'),r?.allergies||''];}); exportCSV('reservations_line_nasya.csv',['Famille','Code','Mot de passe','Places','Presence','Personnes','Retard','Arrivee','Boissons','Allergies'],rows); }
  function exportCateringCSV(){ const rows=[]; state.responses.forEach(r=>{const i=state.invites.find(x=>x.id===r.inviteId); if(r.presence==='oui') r.companions.forEach(p=>rows.push([i?.family,i?.code,p.name,p.age,p.category,p.meal,labelDelay(r.delay),r.arrival,r.allergies]));}); exportCSV('traiteur_line_nasya.csv',['Famille','Code','Prenom','Age','Categorie','Repas','Retard','Arrivee','Allergies'],rows); }
  function exportCSV(filename, headers, rows){ const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n'); const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=filename; a.click(); URL.revokeObjectURL(a.href); toast('Export téléchargé.'); }

  function countdown(){ const diff=Math.max(0,new Date(CONFIG.eventStart)-Date.now()); return {d:Math.floor(diff/864e5),h:Math.floor((diff%864e5)/36e5),m:Math.floor((diff%36e5)/6e4),s:Math.floor((diff%6e4)/1e3)}; }
  function startCountdown(){ stopCountdown(); if(page!=='home')return; countdownTimer=setInterval(()=>{ const c=countdown(); const labels={Jours:c.d,Heures:c.h,Minutes:c.m,Secondes:c.s}; $$('[data-count]').forEach(el=>el.textContent=String(labels[el.dataset.count]).padStart(2,'0')); },1000); }
  function stopCountdown(){ if(countdownTimer){ clearInterval(countdownTimer); countdownTimer=null; } }
  function whatsApp(phone,msg){ const p=String(phone||'').replace(/[^0-9]/g,''); return p ? `https://wa.me/${p}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`; }
  function inviteMessage(i){ return `Bonjour ${i.mainName||i.family},\n\nNous avons la joie de vous inviter au 1er anniversaire de Line Nasya Bilong.\n\nDate : ${CONFIG.eventDate}\nLieu : ${CONFIG.venue}\nAdresse : ${CONFIG.address}\n\nVotre code personnel : ${i.code}\nMot de passe : ${i.pass||'—'}\n\nMerci de confirmer votre présence via le site.\n\n${CONFIG.parents}`; }
  function buildConfirmMessage(inv,r){ return `Bonjour ${inv.mainName||inv.family},\n\nMerci pour votre réponse au 1er anniversaire de Line Nasya Bilong.\nPrésence : ${r.presence==='oui'?'confirmée':'absence notée'}\nPersonnes : ${r.companions.length}\nDate : ${CONFIG.eventDate}\nLieu : ${CONFIG.venue}\n\n${CONFIG.parents}`; }
  function downloadICS(){ const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Line Nasya Birthday//FR\nBEGIN:VEVENT\nUID:line-nasya-2026@example.com\nDTSTART:20260815T100000\nSUMMARY:${CONFIG.eventName}\nLOCATION:${CONFIG.venue}, ${CONFIG.address}\nDESCRIPTION:Anniversaire de Line Nasya Bilong.\nEND:VEVENT\nEND:VCALENDAR`; const blob=new Blob([ics],{type:'text/calendar;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='anniversaire-line-nasya.ics'; a.click(); URL.revokeObjectURL(a.href); }
  function renderFooter(){ return `<footer class="footer"><div class="container"><div class="script">Line Nasya Bilong</div><p>${CONFIG.eventDate} · ${CONFIG.venue}</p><p style="opacity:.75">« Votre présence est notre plus beau cadeau »</p></div></footer>`; }

  boot();
})();
