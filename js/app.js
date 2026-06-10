(function(){
  'use strict';

  const CONFIG = {
    eventName:'1er anniversaire de Line Nasya Bilong',
    eventDate:'22 août 2026',
    eventStart:'2026-08-22T13:00:00+02:00',
    venue:'Parochiezaal “Ter Krokegem”',
    address:'Dendermondsesteenweg 44, B-1730 Asse',
    parents:'Jacques & Suzanne',
    organizerCode:'LINEORGANISATION',
    organizerAlias:'LINEORGANISATION',
    organizerHuman:'Lineorganisation',
    adminCode:'LINEADMINVIP2026',
    storageKey:'line_nasya_v10_premium_roles'
  };

  const MEALS = ['Standard','Halal','Végétarien','Menu enfant','Bébé / purée','Sans repas'];
  const DRINKS = ['Eau','Jus','Vin rouge','Champagne','Rosé','Bière','Whisky','Cocktail','Sans alcool'];
  const DELAYS = [
    ['a_lheure','À l’heure'],['retard_15','Retard possible : 15 min'],['retard_30','Retard possible : 30 min'],['retard_60','Retard possible : 1h ou plus'],['inconnu','Je ne sais pas encore']
  ];

  const $ = (sel, root=document)=>root.querySelector(sel);
  const $$ = (sel, root=document)=>Array.from(root.querySelectorAll(sel));
  const app = $('#app');
  let page = 'gate';
  let session = readSession();
  let state = loadState();
  let countdownTimer = null;
  let activeAdminTab = 'overview';

  if(session){ page = session.role === 'guest' ? 'home' : 'organizer'; }

  function seedState(){
    return {
      invites:[
        {id:1,code:'TOM',family:'Famille Tom',mainName:'Tom',email:'',phone:'',maxGuests:4,status:'pending'},
        {id:2,code:'BILONG',family:'Famille Bilong',mainName:'',email:'',phone:'',maxGuests:6,status:'pending'},
        {id:3,code:'CECILIA',family:'Cecilia Bilong',mainName:'Cecilia',email:'',phone:'',maxGuests:2,status:'pending'},
        {id:4,code:'LINE',family:'Invité de Line',mainName:'',email:'',phone:'',maxGuests:2,status:'pending'}
      ],
      responses:[],

      comments:[]
    };
  }


  function loadState(){
    try{ return JSON.parse(localStorage.getItem(CONFIG.storageKey)) || seedState(); }
    catch(e){ return seedState(); }
  }
  function saveState(){ localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); }
  function readSession(){ try{return JSON.parse(sessionStorage.getItem('line_nasya_session')||'null');}catch(e){return null;} }
  function writeSession(s){ session=s; sessionStorage.setItem('line_nasya_session',JSON.stringify(s)); }
  function clearSession(){ session=null; sessionStorage.removeItem('line_nasya_session'); }
  function uid(){ return Date.now()+Math.floor(Math.random()*999999); }
  function esc(v=''){ return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function normalize(v){ return String(v||'').trim().toUpperCase().replace(/\s+/g,''); }
  function ageCat(age){ const n=Number(age); if(age===''||Number.isNaN(n))return 'Non précisé'; if(n<2)return 'Bébé'; if(n<12)return 'Enfant'; if(n<18)return 'Ado'; return 'Adulte'; }
  function invite(){ return session?.inviteId ? state.invites.find(x=>x.id===session.inviteId) : null; }
  function responseFor(id){ return state.responses.find(r=>r.inviteId===id); }
  function isStaff(){ return session?.role === 'organizer' || session?.role === 'admin'; }
  function toast(msg,type='success'){
    const el=document.createElement('div'); el.className='toast '+(type==='error'?'error':''); el.textContent=(type==='error'?'❌ ':'✓ ')+msg; $('#toastMount').appendChild(el); setTimeout(()=>el.remove(),3300);
  }
  function modal(html){ $('#modalMount').innerHTML=`<div class="modal"><div class="modal-card">${html}</div></div>`; $('.modal').addEventListener('click',e=>{ if(e.target.classList.contains('modal')) closeModal(); }); }
  function closeModal(){ $('#modalMount').innerHTML=''; }

  function render(){
    $('#navbar').classList.toggle('hidden', page==='gate');
    if(page==='gate') app.innerHTML = renderGate();
    if(page==='home') app.innerHTML = renderHome();
    if(page==='rsvp') app.innerHTML = renderRsvp();
    if(page==='organizer') app.innerHTML = renderOrganizer();
    bind();
    updateNav();
    startCountdown();
    setTimeout(()=>$('#loader')?.classList.add('hide'),350);
  }

  function renderGate(){
    return `<section class="gate">
      <div class="gate-visual"><div class="gate-signature"><div class="script">Line Nasya</div><p>Une invitation privée pour entrer dans une fête douce, élégante et remplie de souvenirs.</p></div></div>
      <div class="gate-panel"><div class="gate-card card">
        <span class="eyebrow">Invitation privée</span>
        <h1 class="title">1 an</h1>
        <p class="lead">Entrez votre code personnel pour accéder à votre invitation et confirmer votre présence.</p>
        <div style="display:grid;gap:12px;margin-top:24px"><input id="codeInput" class="input" placeholder="Votre code secret" autocomplete="one-time-code"><button id="enterBtn" class="btn btn-primary">Entrer dans la fête</button></div>
        <p class="code-help">Codes test : TOM · BILONG · CECILIA · LINE<br>Organisateur : Lineorganisation · Admin : LineAdminVIP2026</p>
      </div></div>
    </section>`;
  }

  function renderHome(){
    const inv=invite(); const resp=inv?responseFor(inv.id):null;
    return `${renderHero(inv,resp)}${renderProgram()}${renderVenue()}${renderFooter()}`;
  }
  function renderHero(inv,resp){
    const cd=countdown();
    return `<section class="hero"><div class="container hero-grid"><div class="hero-copy">
      <span class="eyebrow">Célébration privée · ${CONFIG.eventDate}</span>
      <div><h1 class="title">Premier anniversaire</h1><div class="script">Line Nasya</div></div>
      <p class="lead">Une journée familiale, chic et chaleureuse pour célébrer la première année de Line Nasya Bilong.</p>
      ${inv?`<div class="card card-soft"><b>${esc(inv.family)}</b><p class="lead" style="font-size:.96rem;margin-top:4px">Code ${esc(inv.code)} · ${inv.maxGuests} place(s) prévue(s) ${resp?`· Présence déjà confirmée`:''}</p></div>`:''}
      <div class="event-chips"><span class="chip-info">📅 ${CONFIG.eventDate}</span><span class="chip-info">📍 Asse</span><span class="chip-info">🎀 Thème : marron & rose poudré</span></div>
      <div class="countdown">${countCard(cd.d,'Jours')}${countCard(cd.h,'Heures')}${countCard(cd.m,'Minutes')}${countCard(cd.s,'Secondes')}</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn btn-primary" data-nav="rsvp">Confirmer ma présence</button></div>
    </div><div class="hero-photo" aria-label="Photo de Line Nasya"></div></div></section>`;
  }
  function countCard(n,l){ return `<div class="count-card"><strong data-count="${l}">${String(n).padStart(2,'0')}</strong><span>${l}</span></div>`; }
  function renderProgram(){
    const items=[
      ['13h00','Accueil des invités','Installation, photos de famille, premières retrouvailles et ambiance douce.'],
      ['14h00','Repas & partage','Moment convivial autour du buffet familial, adapté aux adultes, enfants et bébés.'],
      ['16h00','Gâteau & bougies','Moment central pour Line Nasya : bougie, chants, photos et souvenirs de famille.'],
      ['18h00','Animation familiale','Jeux, danse, musique et bénédiction pour clôturer la journée en beauté.']
    ];
    return `<section class="program section"><div class="narrow"><div class="section-head"><div><span class="eyebrow">Déroulé naturel</span><h2 class="title" style="margin-top:12px">Programme de la fête</h2></div><p class="lead">Un programme souple, pensé pour les enfants et les familles, sans couper l’ambiance trop tôt.</p></div><div class="program-flow">${items.map(([t,a,d])=>`<div class="program-row"><div class="program-time">${t}</div><div><div class="program-title">${a}</div><div class="program-desc">${d}</div></div></div>`).join('')}</div><div class="no-end"><div class="script">La fête continue…</div><p>Après le dîner, l’ambiance musicale et familiale se poursuivra librement, jusqu’au départ progressif des invités.</p></div></div></section>`;
  }
  function renderVenue(){return `<section class="section"><div class="container"><div class="section-head"><div><span class="eyebrow">Informations pratiques</span><h2 class="title" style="margin-top:12px">Lieu & ambiance</h2></div><p class="lead">Un lieu prévu pour recevoir les familles, les enfants, les photos et une belle ambiance festive.</p></div><div class="venue-grid"><div class="venue-card"><b>📍 ${CONFIG.venue}</b><span>${CONFIG.address}</span></div><div class="venue-card"><b>👗 Dress code conseillé</b><span>Marron, rose poudré, beige, blanc cassé ou tons doux.</span></div><div class="venue-card"><b>🎁 Cadeaux</b><span>Votre présence est déjà un très beau cadeau pour Line Nasya.</span></div><div class="venue-card"><b>📞 Contact</b><span>Pour toute question, contactez directement la famille organisatrice.</span></div></div></div></section>`;}

  function renderRsvp(){
    const inv=invite(); if(!inv) return needAccess();
    const resp=responseFor(inv.id); if(resp) return renderRsvpDone(inv,resp);
    const invitationNo = `INV-2026-${String(inv.id).padStart(4,'0')}`;
    return `<section class="section premium-rsvp"><div class="narrow">
      <div class="vip-header card card-soft">
        <div>
          <span class="eyebrow">Invitation privée</span>
          <h1 class="title" style="margin-top:10px">Bienvenue ${esc(inv.mainName||inv.family)}</h1>
          <p class="lead">Nous sommes heureux de vous compter parmi les invités privilégiés du premier anniversaire de notre princesse <b>Line Nasya Bilong</b>.</p>
        </div>
        <div class="vip-ticket">
          <span>Invitation N°</span><strong>${invitationNo}</strong>
          <em>Statut : invitation active ✓</em>
          <em>Catégorie : Invité VIP</em>
        </div>
      </div>
      <div class="event-mini-grid">
        <div>📅 <b>${CONFIG.eventDate}</b><span>Date de la fête</span></div>
        <div>📍 <b>${CONFIG.venue}</b><span>${CONFIG.address}</span></div>
        <div>🎀 <b>Marron & rose poudré</b><span>Thème officiel</span></div>
        <div>👗 <b>Chic & élégant</b><span>Dress code conseillé</span></div>
      </div>
      <div class="section-head" style="margin-top:42px"><div><span class="eyebrow">Ma réponse</span><h2 class="title" style="margin-top:12px">Confirmation de présence</h2></div><p class="lead">Merci de compléter ces informations afin de préparer votre accueil, le repas, les enfants et le placement dans les meilleures conditions.</p></div>
      <form id="rsvpForm" class="card premium-form">
        <div class="rsvp-status vip-status"><b>${esc(inv.family)}</b><p>Code privé : ${esc(inv.code)} · ${inv.maxGuests} place(s) prévue(s)</p></div>
        <h3 class="form-section-title">Informations de l’invité principal</h3>
        <div class="grid-2"><div class="field"><label>Nom et prénom</label><input class="input" name="mainName" value="${esc(inv.mainName||inv.family||'')}" required></div><div class="field"><label>Téléphone</label><input class="input" name="contact" value="${esc(inv.phone||inv.email||'')}" placeholder="+32 ..."></div></div>
        <h3 class="form-section-title">Participation</h3>
        <div class="field"><label>Serez-vous présent ?</label><div class="choice-row"><button type="button" class="choice selected" data-presence="oui">Oui, avec plaisir</button><button type="button" class="choice" data-presence="non">Non, malheureusement</button></div></div>
        <div id="presentBlock">
          <h3 class="form-section-title">Votre groupe</h3>
          <div class="grid-2"><div class="field"><label>Nombre prévu par l’invitation</label><input class="input" value="${inv.maxGuests} personne(s) maximum" disabled></div><div class="field"><label>Arrivée prévue</label><input class="input" name="arrival" placeholder="Ex. 13h30"></div></div>
          <div class="field" style="margin-top:16px"><label>Accompagnants et âges</label><div id="companions"></div><button type="button" class="btn btn-soft" id="addCompanion" style="margin-top:12px;width:auto">Ajouter une personne</button></div>
          <h3 class="form-section-title">Restauration</h3>
          <div class="field"><label>Repas souhaités</label><p class="mini-help">Choisissez le repas pour chaque personne ajoutée ci-dessus : standard, halal, végétarien ou menu enfant.</p></div>
          <h3 class="form-section-title">Organisation</h3>
          <div class="grid-2"><div class="field"><label>Retard possible</label><select class="select" name="delay">${DELAYS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div><div class="field"><label>Placement / remarque</label><input class="input" name="tableWish" placeholder="Ex. avec enfants, proche famille..."></div></div>
          <div class="field" style="margin-top:16px"><label>Boissons souhaitées</label><div class="drink-grid">${DRINKS.map(d=>`<button type="button" class="drink-chip" data-drink="${d}">${d}</button>`).join('')}</div></div>
          <div class="field" style="margin-top:16px"><label>Allergies / remarques particulières</label><textarea class="textarea" name="allergies" placeholder="Ex : sans porc, arachides, chaise enfant, bébé avec purée..."></textarea></div>
        </div>
        <div class="field" style="margin-top:16px"><label>Petit message pour Line Nasya</label><textarea class="textarea" name="message" placeholder="Un mot doux que la famille pourra garder en souvenir."></textarea></div>
        <button class="btn btn-primary btn-confirm" style="margin-top:22px">🎀 Confirmer ma présence</button>
      </form>
    </div></section>${renderFooter()}`;
  }
  function renderRsvpDone(inv,resp){ return `<section class="section"><div class="narrow"><div class="card success-card" style="text-align:center"><div class="script" style="font-size:3.8rem;color:var(--gold)">Merci ${esc(resp.mainName||inv.mainName||inv.family)}</div><h2 class="title" style="font-size:3rem">Confirmation enregistrée</h2><p class="lead">${resp.presence==='oui'?`Votre présence a bien été confirmée pour ${resp.companions.length} personne(s).`:'Votre absence est bien notée.'}</p><p class="lead" style="margin-top:10px">Nous avons hâte de vous accueillir pour célébrer le premier anniversaire de <b>Line Nasya Bilong</b>. À très bientôt ❤️</p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:22px"><button class="btn btn-soft" id="editResponse">Modifier ma réponse</button><button class="btn btn-primary" id="downloadICS">Ajouter à mon agenda</button><a class="btn btn-soft" href="${whatsApp('',buildConfirmMessage(inv,resp))}" target="_blank">Partager WhatsApp</a></div></div></div></section>${renderFooter()}`; }
  function companionHtml(name=''){return `<div class="companion"><div class="companion-head"><b>Personne</b><button type="button" class="small-btn remove-companion">Retirer</button></div><div class="grid-3"><div class="field"><label>Prénom</label><input class="input comp-name" value="${esc(name)}" required></div><div class="field"><label>Âge</label><input class="input comp-age" type="number" min="0" max="120" placeholder="Ex : 4"></div><div class="field"><label>Repas</label><select class="select comp-meal">${MEALS.map(m=>`<option>${m}</option>`).join('')}</select></div></div><p class="small-cat" style="margin-top:10px;color:var(--muted);font-weight:800">Catégorie : Non précisé</p></div>`;}



  function renderOrganizer(){
    if(!isStaff()) return needAccess();
    const stats=computeStats();
    const tabs = session?.role === 'admin'
      ? [['overview','Vue générale'],['catering','Présences & prestataires'],['codes','Invités & mots de passe']]
      : [['overview','Vue générale'],['catering','Présences & prestataires']];
    if(session?.role !== 'admin' && activeAdminTab === 'codes') activeAdminTab = 'overview';
    return `<section class="section"><div class="container admin-shell"><aside class="admin-side"><h3>${session?.role==='admin'?'Administration':'Organisation'}</h3>${tabs.map(([k,l])=>`<button class="${activeAdminTab===k?'active':''}" data-admin-tab="${k}">${l}</button>`).join('')}</aside><div><div class="section-head"><div><span class="eyebrow">${session?.role==='admin'?'Espace Admin':'Espace Organisateur'}</span><h1 class="title" style="margin-top:12px">${session?.role==='admin'?'Gestion complète':'Présences & prestataires'}</h1></div><p class="lead">${session?.role==='admin'?'Personnalisation des invités, génération des mots de passe et suivi des confirmations.':'Suivi des présences confirmées et des besoins traiteur/prestataire.'}</p></div><div class="stat-grid"><div class="stat"><strong>${state.invites.length}</strong><span>Invitations</span></div><div class="stat"><strong>${state.responses.length}</strong><span>Réponses</span></div><div class="stat"><strong>${stats.people}</strong><span>Personnes attendues</span></div><div class="stat"><strong>${stats.children}</strong><span>Enfants / bébés</span></div></div>${activeAdminTab==='overview'?adminOverview():''}${activeAdminTab==='codes'?adminCodes():''}${activeAdminTab==='catering'?adminCatering():''}</div></div></section>${renderFooter()}`;
  }
  function adminOverview(){ return `<div class="admin-actions"><button class="btn btn-primary" id="exportAll">Exporter confirmations CSV</button>${session?.role==='admin'?'<button class="btn btn-soft" id="copyAllCodes">Copier tous les codes</button><button class="btn btn-soft" id="printCodes">Imprimer les codes</button><button class="btn btn-soft" id="copyWhatsapp">Texte WhatsApp</button><button class="btn btn-danger" id="clearData">Réinitialiser les données</button>':''}</div><div class="table-wrap"><table><thead><tr><th>Invité</th><th>Statut</th><th>Personnes</th><th>Arrivée</th><th>Retard</th><th>Prestataire</th></tr></thead><tbody>${state.invites.map(i=>{const r=responseFor(i.id);return `<tr><td><b>${esc(i.family)}</b><br><span style="color:var(--muted)">${session?.role==='admin'?`Code : ${esc(i.code)}`:esc(i.mainName||'')}</span></td><td>${r?`<span class="badge ${r.presence==='oui'?'badge-ok':'badge-no'}">${r.presence==='oui'?'Présent':'Absent'}</span>`:'<span class="badge badge-wait">En attente</span>'}</td><td>${r?.companions?.length||0}/${i.maxGuests}</td><td>${r?.arrival||'—'}</td><td>${r?labelDelay(r.delay):'—'}</td><td>${r?.presence==='oui'?'À prévoir':'—'}</td></tr>`}).join('')}</tbody></table></div>`;}
  function adminCodes(){ if(session?.role!=='admin') return `<div class="card"><h2 class="serif">Accès réservé à l’Admin</h2><p class="lead">Seul l’administrateur peut créer les invités et générer les mots de passe.</p></div>`; return `<div class="admin-actions"><button class="btn btn-primary" id="addInvite">Ajouter / personnaliser un invité</button><button class="btn btn-soft" id="generateCodes">Générer 50 codes</button><button class="btn btn-soft" id="copyAllCodes">Copier tous les codes</button><button class="btn btn-soft" id="printCodes">Imprimer les codes</button></div><div class="table-wrap"><table><thead><tr><th>Famille</th><th>Mot de passe</th><th>Contact</th><th>Places</th><th>Message</th><th>Action</th></tr></thead><tbody>${state.invites.map(i=>`<tr><td><b>${esc(i.family)}</b><br><span style="color:var(--muted)">${esc(i.mainName||'')}</span></td><td><b>${esc(i.code)}</b></td><td>${esc(i.email||i.phone||'—')}</td><td>${i.maxGuests}</td><td><a class="small-btn" href="${whatsApp(i.phone,inviteMessage(i))}" target="_blank">WhatsApp</a></td><td><button class="small-btn" data-edit-invite="${i.id}">Modifier</button></td></tr>`).join('')}</tbody></table></div>`;}
  function adminCatering(){ const rows=[]; state.responses.forEach(r=>{ const i=state.invites.find(x=>x.id===r.inviteId); if(r.presence==='oui') r.companions.forEach(p=>rows.push({family:i?.family||'',...p,delay:r.delay,arrival:r.arrival,allergies:r.allergies,contact:r.contact,drinks:(r.drinks||[]).join(', ')})); }); return `<div class="admin-actions"><button class="btn btn-primary" id="exportCatering">Exporter traiteur CSV</button></div><div class="table-wrap"><table><thead><tr><th>Famille</th><th>Personne</th><th>Âge</th><th>Catégorie</th><th>Repas</th><th>Arrivée</th><th>Boissons</th><th>Allergies</th></tr></thead><tbody>${rows.length?rows.map(r=>`<tr><td>${esc(r.family)}</td><td>${esc(r.name)}</td><td>${esc(r.age||'—')}</td><td>${esc(r.category)}</td><td>${esc(r.meal)}</td><td>${esc(r.arrival||'—')}</td><td>${esc(r.drinks||'—')}</td><td>${esc(r.allergies||'—')}</td></tr>`).join(''):'<tr><td colspan="8">Aucune présence confirmée pour le moment.</td></tr>'}</tbody></table></div>`; }
  function needAccess(){ return `<section class="section"><div class="narrow"><div class="card" style="text-align:center"><h1 class="title">Accès privé</h1><p class="lead">Veuillez entrer votre code personnel depuis la page d’entrée.</p><button class="btn btn-primary" data-nav="logout" style="margin-top:18px">Retour à l’entrée</button></div></div></section>`; }
  function renderFooter(){ return `<footer class="footer"><div class="container"><div class="script">Line Nasya Bilong</div><p>${CONFIG.eventDate} · ${CONFIG.venue}</p><p>Avec toute la tendresse de ${CONFIG.parents}</p><p style="margin-top:10px;font-size:.8rem;opacity:.6">© 2026 Line Nasya Bilong · 1er anniversaire</p></div></footer>`; }

  function bind(){
    $('#enterBtn')?.addEventListener('click',login);
    $('#codeInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')login();});
    $('#codeInput')?.addEventListener('input',e=>e.target.value=e.target.value.toUpperCase());
    $$('[data-nav]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.nav)));
    $('#brandBtn')?.addEventListener('click',()=>navigate('home'));
    $('#menuToggle')?.addEventListener('click',toggleMenu);
    $('#navBackdrop')?.addEventListener('click',closeMenu);
    if(page==='rsvp') bindRsvp();
    if(page==='organizer') bindOrganizer();
    $('#editResponse')?.addEventListener('click',()=>{ state.responses=state.responses.filter(r=>r.inviteId!==session.inviteId); saveState(); toast('Vous pouvez modifier votre réponse.'); render(); });
    $('#downloadICS')?.addEventListener('click',downloadICS);
  }
  function navigate(to){ closeMenu(); if(to==='logout'){clearSession(); page='gate'; render(); return;} if(to==='organizer'&&!isStaff()){toast('Accès réservé à l’organisation.','error');return;} page=to; render(); window.scrollTo({top:0,behavior:'smooth'}); }
  function updateNav(){ $$('#navLinks button').forEach(b=>b.classList.toggle('active',b.dataset.nav===page)); $$('[data-role="staff"]').forEach(b=>b.style.display=isStaff()?'inline-flex':'none'); }
  function toggleMenu(){ const open=!$('#navLinks').classList.contains('open'); $('#navLinks').classList.toggle('open',open); $('#navBackdrop').classList.toggle('hidden',!open); $('#menuToggle').setAttribute('aria-expanded',String(open)); document.body.style.overflow=open?'hidden':''; }
  function closeMenu(){ $('#navLinks')?.classList.remove('open'); $('#navBackdrop')?.classList.add('hidden'); $('#menuToggle')?.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
  function login(){ const code=normalize($('#codeInput').value); if(!code){toast('Entre ton code personnel.','error');return;} if(code===normalize(CONFIG.organizerCode)||code===normalize(CONFIG.organizerHuman)){writeSession({role:'organizer',code}); page='organizer'; render(); toast('Bienvenue dans l’espace organisateur.');return;} if(code===normalize(CONFIG.adminCode)){writeSession({role:'admin',code}); page='organizer'; render(); toast('Bienvenue admin.');return;} const inv=state.invites.find(i=>normalize(i.code)===code); if(inv){writeSession({role:'guest',inviteId:inv.id,code:inv.code}); page='home'; render(); toast('Bienvenue '+inv.family);return;} $('#codeInput').classList.add('shake'); setTimeout(()=>$('#codeInput')?.classList.remove('shake'),420); toast('Code incorrect.','error'); }

  function bindRsvp(){ let presence='oui', drinks=[]; const inv=invite(); const comps=$('#companions'); const add=(name='')=>{ comps.insertAdjacentHTML('beforeend',companionHtml(name)); refreshCompanionEvents(); }; add(inv.mainName||''); $('#addCompanion').addEventListener('click',()=>add()); $$('[data-presence]').forEach(b=>b.addEventListener('click',()=>{presence=b.dataset.presence; $$('[data-presence]').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); $('#presentBlock').classList.toggle('hidden',presence!=='oui');})); $$('[data-drink]').forEach(b=>b.addEventListener('click',()=>{const d=b.dataset.drink; drinks=drinks.includes(d)?drinks.filter(x=>x!==d):[...drinks,d]; b.classList.toggle('selected');})); $('#rsvpForm').addEventListener('submit',e=>{e.preventDefault(); const f=e.target; const companions=$$('.companion').map(c=>({name:$('.comp-name',c).value.trim(),age:$('.comp-age',c).value.trim(),category:ageCat($('.comp-age',c).value.trim()),meal:$('.comp-meal',c).value})).filter(c=>c.name); if(presence==='oui'&&companions.length===0){toast('Ajoute au moins une personne présente.','error');return;} if(presence==='oui'&&companions.length>inv.maxGuests&&!confirm(`Vous avez indiqué ${companions.length} personnes pour ${inv.maxGuests} places prévues. Continuer ?`))return; state.responses=state.responses.filter(r=>r.inviteId!==inv.id); state.responses.push({id:uid(),inviteId:inv.id,presence,mainName:f.mainName.value.trim(),contact:f.contact.value.trim(),delay:f.delay?.value||'',arrival:f.arrival?.value||'',tableWish:f.tableWish?.value.trim()||'',drinks,companions:presence==='oui'?companions:[],allergies:f.allergies?.value.trim()||'',message:f.message.value.trim(),createdAt:new Date().toISOString()}); inv.status='responded'; saveState(); toast('Confirmation enregistrée.'); render();}); }
  function refreshCompanionEvents(){ $$('.remove-companion').forEach(b=>b.onclick=()=>{ if($$('.companion').length<=1){toast('Garde au moins une personne.','error');return;} b.closest('.companion').remove();}); $$('.comp-age').forEach(inp=>inp.oninput=()=>{$('.small-cat',inp.closest('.companion')).textContent='Catégorie : '+ageCat(inp.value);}); }
  function bindOrganizer(){
    $$('[data-admin-tab]').forEach(b=>b.onclick=()=>{
      activeAdminTab=b.dataset.adminTab;
      render();
    });

    $('#exportAll')?.addEventListener('click',()=>{
      const rows = state.responses.map(r=>{
        const i=state.invites.find(x=>x.id===r.inviteId);
        return [i?.family,i?.code,r.presence,r.companions.length,labelDelay(r.delay),r.arrival,(r.drinks||[]).join('|'),r.allergies];
      });
      exportCSV('confirmations_line_nasya.csv',['Famille','Code','Presence','Personnes','Retard','Arrivee','Boissons','Allergies'],rows);
    });

    $('#exportCatering')?.addEventListener('click',()=>{
      const rows=[];
      state.responses.forEach(r=>{
        const i=state.invites.find(x=>x.id===r.inviteId);
        if(r.presence==='oui'){
          r.companions.forEach(p=>rows.push([i?.family,i?.code,p.name,p.age,p.category,p.meal,labelDelay(r.delay),r.arrival,r.allergies]));
        }
      });
      exportCSV('traiteur_line_nasya.csv',['Famille','Code','Prenom','Age','Categorie','Repas','Retard','Arrivee','Allergies'],rows);
    });

    $('#copyAllCodes')?.addEventListener('click',()=>{
      const text = state.invites.map((i,k)=>`${k+1}. ${i.family} → Code : ${i.code} (${i.maxGuests} pers.)`).join('\n');
      navigator.clipboard?.writeText(text);
      toast('Codes copiés.');
    });

    $('#printCodes')?.addEventListener('click',printCodes);

    $('#copyWhatsapp')?.addEventListener('click',()=>{
      navigator.clipboard?.writeText('Bonjour, merci de confirmer votre présence au 1er anniversaire de Line Nasya via le site, avec votre code d’invitation. 🎀');
      toast('Texte WhatsApp copié.');
    });

    $('#clearData')?.addEventListener('click',()=>{
      if(confirm('Supprimer toutes les confirmations enregistrées sur ce navigateur ?')){
        localStorage.removeItem(CONFIG.storageKey);
        state=loadState();
        toast('Données réinitialisées.');
        render();
      }
    });

    if(session?.role==='admin') $('#generateCodes')?.addEventListener('click',()=>{
      for(let i=0;i<50;i++){
        const n=state.invites.length+1;
        state.invites.push({id:uid()+i,code:'LINE'+String(n).padStart(3,'0'),family:'Invité '+String(n).padStart(3,'0'),mainName:'',email:'',phone:'',maxGuests:2,status:'pending'});
      }
      saveState();
      toast('50 codes ajoutés.');
      render();
    });

    if(session?.role==='admin') $('#addInvite')?.addEventListener('click',()=>editInvite());
    if(session?.role==='admin') $$('[data-edit-invite]').forEach(b=>b.onclick=()=>editInvite(Number(b.dataset.editInvite)));
  }
  function editInvite(id){ const i=id?state.invites.find(x=>x.id===id):{id:uid(),code:'LINE'+String(state.invites.length+1).padStart(3,'0'),family:'',mainName:'',email:'',phone:'',maxGuests:2,status:'pending'}; modal(`<h2 class="serif" style="font-size:2.5rem;color:var(--chocolate)">${id?'Modifier':'Ajouter'} un invité</h2><div class="grid-2" style="margin-top:14px"><input class="input" id="mFamily" placeholder="Famille" value="${esc(i.family)}"><input class="input" id="mCode" placeholder="Code" value="${esc(i.code)}"><input class="input" id="mMain" placeholder="Nom principal" value="${esc(i.mainName||'')}"><input class="input" id="mMax" type="number" min="1" placeholder="Places" value="${i.maxGuests}"><input class="input" id="mEmail" placeholder="Email" value="${esc(i.email||'')}"><input class="input" id="mPhone" placeholder="Téléphone" value="${esc(i.phone||'')}"></div><div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px"><button class="btn btn-soft" id="cancelModal">Annuler</button><button class="btn btn-primary" id="saveInvite">Enregistrer</button></div>`); $('#cancelModal').onclick=closeModal; $('#saveInvite').onclick=()=>{Object.assign(i,{family:$('#mFamily').value.trim(),code:normalize($('#mCode').value),mainName:$('#mMain').value.trim(),maxGuests:Number($('#mMax').value||1),email:$('#mEmail').value.trim(),phone:$('#mPhone').value.trim()}); if(!i.family||!i.code){toast('Famille et code obligatoires.','error');return;} if(!id)state.invites.push(i); saveState(); closeModal(); toast('Invité enregistré.'); render();}; }

  function countdown(){ const diff=Math.max(0,new Date(CONFIG.eventStart)-Date.now()); return {d:Math.floor(diff/864e5),h:Math.floor((diff%864e5)/36e5),m:Math.floor((diff%36e5)/6e4),s:Math.floor((diff%6e4)/1e3)}; }
  function startCountdown(){ if(countdownTimer)clearInterval(countdownTimer); if(page!=='home'){return;} countdownTimer=setInterval(()=>{const c=countdown(); const labels={Jours:c.d,Heures:c.h,Minutes:c.m,Secondes:c.s}; $$('[data-count]').forEach(el=>el.textContent=String(labels[el.dataset.count]).padStart(2,'0'));},1000); }
  function computeStats(){let people=0,children=0;state.responses.forEach(r=>{if(r.presence==='oui'){people+=r.companions.length;r.companions.forEach(p=>{if(['Bébé','Enfant'].includes(p.category))children++;});}});return{people,children};}
  function labelDelay(v){return DELAYS.find(x=>x[0]===v)?.[1]||'—';}
  function whatsApp(phone,msg){const p=String(phone||'').replace(/[^0-9]/g,'');return p?`https://wa.me/${p}?text=${encodeURIComponent(msg)}`:`https://wa.me/?text=${encodeURIComponent(msg)}`;}
  function inviteMessage(i){return `Bonjour ${i.mainName||i.family},\n\nVous êtes cordialement invité au premier anniversaire de Line Nasya Bilong.\n\nDate : ${CONFIG.eventDate}\nLieu : ${CONFIG.venue}\nAdresse : ${CONFIG.address}\n\nVotre code d’accès personnel : *${i.code}*\n\nMerci de confirmer votre présence via le site.\n\nLa famille Bilong 🎀`;}
  function buildConfirmMessage(inv,r){return `Bonjour ${inv.mainName||inv.family},\n\nMerci pour votre réponse au 1er anniversaire de Line Nasya Bilong.\nPrésence : ${r.presence==='oui'?'confirmée':'absence notée'}\nPersonnes : ${r.companions.length}\nDate : ${CONFIG.eventDate}\nLieu : ${CONFIG.venue}\n\n${CONFIG.parents}`;}
  function exportCSV(name,heads,rows){const csv=[heads,...rows].map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href);toast('Export téléchargé.');}
  function printCodes(){const w=window.open('','_blank');w.document.write(`<html><head><title>Codes Line Nasya</title><style>body{font-family:Arial;padding:30px}h1{color:#553633}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.card{border:1px solid #ddd;border-radius:14px;padding:14px}.code{font-size:24px;font-weight:bold;color:#553633}</style></head><body><h1>Codes invités · Line Nasya</h1><div class="grid">${state.invites.map(i=>`<div class="card"><b>${esc(i.family)}</b><div class="code">${esc(i.code)}</div><p>${i.maxGuests} place(s)</p></div>`).join('')}</div></body></html>`);w.document.close();w.print();}
  function downloadICS(){const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:line-nasya-2026@example.com\nDTSTART:20260822T130000\nDTEND:20260823T020000\nSUMMARY:${CONFIG.eventName}\nLOCATION:${CONFIG.venue}, ${CONFIG.address}\nDESCRIPTION:Anniversaire de Line Nasya Bilong\nEND:VEVENT\nEND:VCALENDAR`;const blob=new Blob([ics],{type:'text/calendar'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='anniversaire-line-nasya.ics';a.click();URL.revokeObjectURL(a.href);}

  render();
})();
