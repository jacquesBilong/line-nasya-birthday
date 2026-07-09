(function(){
  'use strict';

  const CONFIG = {
    eventName:'1er anniversaire de Line Nasya Bilong',
    eventDate:'15 août 2026',
    eventStart:'2026-08-15T13:00:00+02:00',
    venue:'Parochiezaal “Ter Krokegem”',
    address:'Dendermondsesteenweg 44, 1730 Asse',
    parents:'Jacques & Suzanne',
    contactPhone:'+32 485 49 65 55',
    contactPhoneRaw:'32485496555',
    contactEmail:'jacquesbilong.webdev@gmail.com',
    mapsUrl:'https://www.google.com/maps/search/?api=1&query=Parochiezaal%20Ter%20Krokegem%20Dendermondsesteenweg%2044%201730%20Asse',
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
  let gQuery='', gFilter='all', gSort='asc', gPage=1;
  const G_PER_PAGE = 20;

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
  function ageCat(v){ return String(v||'adulte')==='enfant' ? 'Enfant' : 'Adulte'; }
  function invite(){ return session?.inviteId ? state.invites.find(x=>x.id===session.inviteId) : null; }
  function responseFor(id){ return state.responses.find(r=>r.inviteId===id); }
  function isStaff(){ return session?.role === 'organizer' || session?.role === 'admin'; }
  function toast(msg,type='success'){
    const el=document.createElement('div'); el.className='toast '+(type==='error'?'error':''); el.textContent=(type==='error'?'':'✓ ')+msg; $('#toastMount').appendChild(el); setTimeout(()=>el.remove(),3300);
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
    window.__initReveal&&window.__initReveal();
    startCountdown();
    setTimeout(()=>$('#loader')?.classList.add('hide'),350);
  }

  function renderGate(){
    return `<section class="gate">
      <div class="gate-caption"><div class="script">Line Nasya Bilong</div><p>${CONFIG.eventDate}</p></div>
      <div class="gate-float card-glass" style="text-align:center">
        <h1 class="eyebrow" style="font-size:.9rem">Invitation privée</h1>
        <p class="lead" style="font-size:.98rem;margin-top:14px">Entrez votre code personnel pour ouvrir l\u2019invitation et confirmer votre présence.</p>
        <div style="display:grid;gap:12px;margin-top:22px">
          <input id="codeInput" class="input" placeholder="Votre code d\u2019accès" autocomplete="one-time-code" aria-label="Code d\u2019accès">
          <button id="enterBtn" class="btn btn-primary">Entrer dans la fête <span aria-hidden="true">→</span></button>
        </div>
        <p class="code-help">Merci de confirmer avant le 31 juillet 2026.</p>
      </div>
    </section>`;
  }

  function renderHome(){
    const inv=invite(); const resp=inv?responseFor(inv.id):null;
    return `${renderHero(inv,resp)}${renderInfos()}${inv?`<section id="confirmation" class="section premium-rsvp reveal"><div class="narrow">${rsvpContent(inv)}</div></section>`:''}${renderGallery()}${renderProgram()}${renderFooter()}`;
  }
  function renderInfos(){
    const addressLine = `${CONFIG.venue} — ${CONFIG.address}`;
    const giftIban = 'BE00 0000 0000 0000';
    const giftName = 'Jacques & Suzanne Bilong';
    const cards = [
      `<article class="info-card pro-info-card compact-info"><span class="info-label">Lieu</span><h3>Adresse</h3><p><a class="inline-link" href="${CONFIG.mapsUrl}" target="_blank" rel="noopener">${addressLine}</a></p><a class="info-action" href="${CONFIG.mapsUrl}" target="_blank" rel="noopener">Ouvrir Google Maps</a></article>`,
      `<article class="info-card pro-info-card compact-info"><span class="info-label">Horaire</span><h3>Heure</h3><p><strong>13h00</strong> · Accueil des enfants et des familles<br><strong>17h00</strong> · Début de la soirée adulte</p><a class="info-action" href="#programme">Voir le programme</a></article>`,
      `<article class="info-card pro-info-card compact-info"><span class="info-label">Tenue</span><h3>Dress code</h3><div class="dress-list"><span><i style="--c:#6b3b32"></i>Marron</span><span><i style="--c:#d9a2a5"></i>Rose poudré</span><span><i style="--c:#e8d6c1"></i>Beige</span><span><i style="--c:#f6efe7"></i>Ivoire</span></div></article>`,
      `<article class="info-card pro-info-card compact-info"><span class="info-label">Parents</span><h3>Contact</h3><div class="contact-buttons"><a href="tel:${CONFIG.contactPhone.replaceAll(' ','')}">Appeler Jacques</a><a href="https://wa.me/${CONFIG.contactPhoneRaw}" target="_blank" rel="noopener">Écrire sur WhatsApp</a><a href="mailto:${CONFIG.contactEmail}">Envoyer un email</a></div></article>`,
      `<article class="info-card pro-info-card compact-info gift-card"><span class="info-label">Cadeau</span><h3>Espace cadeau</h3><p>Votre présence est déjà un très beau cadeau. Pour celles et ceux qui souhaitent offrir une participation, un virement bancaire est possible.</p><button class="copy-bank" type="button" data-copy="${giftIban}">Copier l’IBAN</button><span class="bank-line">${giftIban}<br>${giftName}</span></article>`
    ];
    return `<section class="section infos-section reveal" id="infos"><div class="container"><div class="section-head pro-section-head"><div><span class="eyebrow">Informations pratiques</span><h2 class="title" style="margin-top:12px">L’essentiel pour votre venue</h2><p class="lead info-intro">Lieu, horaires, tenue, contacts et cadeau : uniquement ce qui est utile pour préparer la fête sereinement.</p></div></div><div class="info-grid info-grid-5">${cards.join('')}</div></div></section>`;
  }

  function renderGallery(){
    const shots=[['g1.jpg','Line, notre petite princesse'],['g2.jpg','Ballons et lumières'],['g3.jpg','Le nœud satin'],['g4.jpg','Roses poudrées'],['g5.jpg','Petit chignon, grand jour'],['g6.jpg','Un an d\u2019amour']];
    return `<section class="section gallery-section reveal"><div class="container"><div class="section-head"><div><span class="eyebrow">Souvenirs</span><h2 class="title" style="margin-top:12px">Galerie</h2></div><p class="lead">Quelques images douces en attendant celles du grand jour.</p></div><div class="masonry">${shots.map(([f,alt])=>`<figure class="shot"><img src="assets/img/gallery/${f}" alt="${alt}" loading="lazy"><figcaption>${alt}</figcaption></figure>`).join('')}</div></div></section>`;
  }
  function renderHero(inv,resp){
    const cd=countdown();
    return `<section class="hero"><div class="container hero-grid"><div class="hero-copy">
      <span class="eyebrow">Célébration privée · ${CONFIG.eventDate}</span>
      <div><h1 class="title">Premier anniversaire</h1><div class="script">Line Nasya</div></div>
      <p class="lead">Une journée familiale, chic et chaleureuse pour célébrer la première année de Line Nasya Bilong.</p>
      ${inv?`<div class="card card-soft hero-welcome"><b style="font-size:1.12rem">Bienvenue ${esc(inv.mainName||inv.family)}</b>${resp?`<p class="lead" style="font-size:.9rem;margin-top:8px"><b style="color:var(--gold)">Présence confirmée ✓</b></p>`:''}</div>`:''}
      <div class="countdown">${countCard(cd.d,'Jours')}${countCard(cd.h,'Heures')}${countCard(cd.m,'Minutes')}${countCard(cd.s,'Secondes')}</div>
      <p class="count-line" id="countLine">${cd.d<=0&&cd.h<=0?'C’est le grand jour !':`Plus que ${cd.d} jour${cd.d>1?'s':''} avant la fête`}</p>
      <div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn btn-primary" data-nav="rsvp">Confirmer ma présence</button></div>
    </div><div class="hero-photo" aria-label="Photo de Line Nasya"></div></div></section>`;
  }
  function countCard(n,l){ return `<div class="count-card"><strong data-count="${l}">${String(n).padStart(2,'0')}</strong><span>${l}</span></div>`; }
  function renderProgram(){
    const items=[
      ['13h00','Fête des enfants','Accueil des enfants, repas adapté, premières photos et lancement des jeux.'],
      ['14h00','Jeux & château gonflable','Temps libre pour courir, rire, jouer ensemble et profiter de l’espace enfants.'],
      ['15h00','Clown & magie','Animation douce avec le clown, petit spectacle de magie et surprises pour les enfants.'],
      ['16h00','Gâteau avec Line','Bougie, chants, photos et coupure du gâteau avec Line entourée des enfants.'],
      ['17h00','Ouverture de la soirée adulte','Accueil des adultes, apéritif, retrouvailles, ambiance familiale et musicale.'],
      ['19h30','Repas & partage','Buffet familial, discussions, bénédiction et moment convivial autour des tables.'],
      ['22h00','Musique & danse','La fête continue avec danse, souvenirs, photos et ambiance jusqu’au petit matin.']
    ];
    return `<section class="program section program-soft reveal" id="programme"><div class="narrow"><div class="section-head"><div><span class="eyebrow">Déroulé naturel</span><h2 class="title" style="margin-top:12px">Programme de la fête</h2></div><p class="lead">D’abord un vrai moment pour les enfants dès 13h00, puis une soirée familiale et adulte à partir de 17h00.</p></div><div class="program-flow">${items.map(([t,a,d])=>`<div class="program-row"><div class="program-time">${t}</div><div><div class="program-title">${a}</div><p class="program-desc">${d}</p></div></div>`).join('')}</div><div class="no-end"><div class="script">La fête continue…</div><p>Après 22h00, l’ambiance reste libre : musique, danse, partage et départ progressif selon le rythme de chacun.</p></div></div></section>`;
  }

  function rsvpContent(inv){
    const resp=responseFor(inv.id); if(resp) return doneCard(inv,resp);
    const invitationNo = `INV-2026-${String(inv.id).padStart(4,'0')}`;
    return `
      <div class="section-head confirm-top">
        <div>
          <span class="eyebrow">Votre réponse</span>
          <h2 class="title" style="margin-top:12px">Confirmez votre présence</h2>
          <p class="lead">Merci de répondre avant le 31 juillet afin de nous aider à bien préparer l’accueil.</p>
        </div>
        <div class="invite-badge"><strong>${invitationNo}</strong><span>Code : ${esc(inv.code)}</span><span>${inv.maxGuests} invité(s) maximum</span></div>
      </div>
      <form id="rsvpForm" class="card premium-form stepped-form">
        <div class="form-step step-presence">
          <span class="step-number">1</span>
          <div class="step-body">
            <h3>Serez-vous présent ?</h3>
            <p>Cette réponse est la plus importante pour l’organisation.</p>
            <div class="choice-row big-choice"><button type="button" class="choice selected" data-presence="oui">Oui, avec plaisir</button><button type="button" class="choice" data-presence="non">Non, malheureusement</button></div>
          </div>
        </div>
        <div class="form-step">
          <span class="step-number">2</span>
          <div class="step-body">
            <h3>Vos coordonnées</h3>
            <div class="grid-2"><div class="field"><label>Nom et prénom</label><input class="input input-locked" name="mainName" value="${esc(inv.mainName||inv.family||'')}" readonly title="Identité liée à votre invitation — gérée par l’organisation"></div><div class="field"><label>Téléphone</label><input class="input" name="contact" value="${esc(inv.phone||inv.email||'')}" placeholder="+32 ..."></div></div>
          </div>
        </div>
        <div id="presentBlock">
          <div class="form-step">
            <span class="step-number">3</span>
            <div class="step-body">
              <h3>Votre groupe</h3>
              <div class="grid-2"><div class="field"><label>Nombre prévu par l’invitation</label><input class="input" value="${inv.maxGuests} personne(s) maximum" disabled></div><div class="field"><label>Arrivée prévue</label><input class="input" name="arrival" placeholder="Ex. 13h30"></div></div>
              <div class="field" style="margin-top:16px"><label>Personnes présentes</label><div id="companions"></div><button type="button" class="btn btn-soft" id="addCompanion" style="margin-top:12px;width:auto">Ajouter une personne</button></div>
            </div>
          </div>
          <div class="form-step">
            <span class="step-number">4</span>
            <div class="step-body">
              <h3>Repas & organisation</h3>
              <div class="field"><label>Repas souhaités</label><p class="mini-help">Le repas se choisit pour chaque personne ajoutée.</p></div>
              <div class="grid-2"><div class="field"><label>Retard possible</label><select class="select" name="delay">${DELAYS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div><div class="field"><label>Placement / remarque</label><input class="input" name="tableWish" placeholder="Ex. avec enfants, proche famille..."></div></div>
              <div class="field" style="margin-top:16px"><label>Boissons souhaitées</label><div class="drink-grid">${DRINKS.map(d=>`<button type="button" class="drink-chip" data-drink="${d}">${d}</button>`).join('')}</div></div>
              <div class="field" style="margin-top:16px"><label>Allergies / remarques particulières</label><textarea class="textarea" name="allergies" placeholder="Ex : sans porc, arachides, chaise enfant, bébé avec purée..."></textarea></div>
            </div>
          </div>
        </div>
        <div class="form-step">
          <span class="step-number">5</span>
          <div class="step-body">
            <h3>Un petit mot pour Line</h3>
            <div class="field"><label>Message facultatif</label><textarea class="textarea" name="message" placeholder="Un mot doux que la famille pourra garder en souvenir."></textarea></div>
          </div>
        </div>
        <button class="btn btn-primary btn-confirm">Confirmer ma présence</button>
      </form>`;
  }
  function doneCard(inv,resp){ return `<div class="card success-card" style="text-align:center"><div class="script" style="font-size:3.8rem;color:var(--gold)">Merci ${esc(resp.mainName||inv.mainName||inv.family)}</div><h2 class="title" style="font-size:3rem">Confirmation enregistrée</h2><p class="lead">${resp.presence==='oui'?`Votre présence a bien été confirmée pour ${resp.companions.length} personne(s).`:'Votre absence est bien notée.'}</p><p class="lead" style="margin-top:10px">Nous avons hâte de vous accueillir pour célébrer le premier anniversaire de <b>Line Nasya Bilong</b>. À très bientôt.</p><div class="vip-ticket" style="margin:22px auto 0;max-width:340px"><span>Invitation N°</span><strong>INV-2026-${String(inv.id).padStart(4,'0')}</strong><em>Statut : ${resp.presence==='oui'?'Confirmé ✓':'Absence notée'}</em><em>Catégorie : Invité</em></div><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:22px"><button class="btn btn-soft" id="editResponse">Modifier ma réponse</button><button class="btn btn-primary" id="downloadICS">Ajouter à mon agenda</button><a class="btn btn-soft" href="${whatsApp('',buildConfirmMessage(inv,resp))}" target="_blank">Partager WhatsApp</a></div></div>`; }
  function companionHtml(name=''){
    return `<div class="companion"><div class="companion-head"><b>Personne</b><button type="button" class="small-btn remove-companion">Retirer</button></div><div class="grid-3"><div class="field"><label>Prénom</label><input class="input comp-name" value="${esc(name)}" required></div><div class="field"><label>Catégorie</label><select class="select comp-category"><option value="adulte">Adulte</option><option value="enfant">Enfant</option></select></div><div class="field"><label>Repas</label><select class="select comp-meal">${MEALS.map(m=>`<option>${m}</option>`).join('')}</select></div></div></div>`;
  }



  function renderOrganizer(){
    if(!isStaff()) return needAccess();
    const stats=computeStats(); const fx=computeFull();
    const tabs = session?.role === 'admin'
      ? [['overview','Vue générale'],['catering','Présences & prestataires'],['codes','Invités & mots de passe']]
      : [['overview','Vue générale'],['catering','Présences & prestataires']];
    if(session?.role !== 'admin' && activeAdminTab === 'codes') activeAdminTab = 'overview';
    return `<section class="section"><div class="container admin-shell"><aside class="admin-side"><h3>${session?.role==='admin'?'Administration':'Organisation'}</h3>${tabs.map(([k,l])=>`<button class="${activeAdminTab===k?'active':''}" data-admin-tab="${k}">${l}</button>`).join('')}</aside><div><div class="section-head"><div><span class="eyebrow">${session?.role==='admin'?'Espace Admin':'Espace Organisateur'}</span><h1 class="title" style="margin-top:12px">${session?.role==='admin'?'Gestion complète':'Présences & prestataires'}</h1></div><p class="lead">${session?.role==='admin'?'Personnalisation des invités, génération des mots de passe et suivi des confirmations.':'Suivi des présences confirmées et des besoins traiteur/prestataire.'}</p></div><div class="stat-grid"><div class="stat"><strong>${state.invites.length}</strong><span>Invités</span></div><div class="stat"><strong>${fx.yes}</strong><span>Présents</span></div><div class="stat"><strong>${fx.no}</strong><span>Absents</span></div><div class="stat"><strong>${fx.wait}</strong><span>En attente</span></div></div>${activeAdminTab==='overview'?adminOverview():''}${activeAdminTab==='codes'?adminCodes():''}${activeAdminTab==='catering'?adminCatering():''}</div></div></section>${renderFooter()}`;
  }
  function adminOverview(){
    const f=computeFull();
    const totalInv=state.invites.length;
    const {rows,pager}=guestRowsHtml();
    const mealsHtml=Object.keys(f.meals).length?Object.entries(f.meals).map(([m,v])=>barRow(m,v,f.people)).join(''):'<p class="lead" style="font-size:.9rem">Les repas apparaîtront avec les premières confirmations.</p>';
    return `<div class="admin-actions"><button class="btn btn-primary" id="exportAll">Exporter confirmations CSV</button>${session?.role==='admin'?'<button class="btn btn-soft" id="copyAllCodes">Copier tous les codes</button><button class="btn btn-soft" id="printCodes">Imprimer les codes</button><button class="btn btn-soft" id="copyWhatsapp">Texte WhatsApp</button><button class="btn btn-danger" id="clearData">Réinitialiser les données</button>':''}</div>
    <div class="charts-grid charts-grid-clean">
      <div class="chart-card"><h3>Personnes attendues</h3>${barRow('Adultes',f.adults,f.people)}${barRow('Enfants',f.children,f.people)}</div>
      <div class="chart-card"><h3>Repas</h3>${mealsHtml}</div>
      <div class="chart-card"><h3>Points de vigilance</h3>${barRow('Allergies signalées',f.allergies,f.yes||1)}${barRow('Taux de réponse',f.yes+f.no,totalInv)}</div>
    </div>
    ${guestToolbar(true)}
    <div class="table-wrap"><table><thead><tr><th>Invité</th><th>Présence</th><th>Personnes</th><th>Arrivée</th><th>Repas</th></tr></thead><tbody id="guestTbody">${rows}</tbody></table></div><div id="guestPager">${pager}</div>`;
  }
  function adminCodes(){ if(session?.role!=='admin') return `<div class="card"><h2 class="serif">Accès réservé à l\u2019Admin</h2><p class="lead">Seul l\u2019administrateur peut créer les invités et générer les mots de passe.</p></div>`;
    const {rows,pager}=guestRowsHtml();
    return `<div class="admin-actions"><button class="btn btn-primary" id="addInvite">Ajouter / personnaliser un invité</button><button class="btn btn-soft" id="generateCodes">Générer 50 codes</button><button class="btn btn-soft" id="copyAllCodes">Copier tous les codes</button><button class="btn btn-soft" id="printCodes">Imprimer les codes</button></div>${guestToolbar(true)}<div class="table-wrap"><table><thead><tr><th>Famille</th><th>Mot de passe</th><th>Contact</th><th>Places</th><th>Présence</th><th>Actions</th></tr></thead><tbody id="guestTbody">${rows}</tbody></table></div><div id="guestPager">${pager}</div>`;}
  function adminCatering(){ const rows=[]; state.responses.forEach(r=>{ const i=state.invites.find(x=>x.id===r.inviteId); if(r.presence==='oui') r.companions.forEach(p=>rows.push({family:i?.family||'',...p,delay:r.delay,arrival:r.arrival,allergies:r.allergies,contact:r.contact,drinks:(r.drinks||[]).join(', ')})); }); return `<div class="admin-actions"><button class="btn btn-primary" id="exportCatering">Exporter traiteur CSV</button></div><div class="table-wrap"><table><thead><tr><th>Famille</th><th>Personne</th><th>Catégorie</th><th>Repas</th><th>Arrivée</th><th>Boissons</th><th>Allergies</th></tr></thead><tbody>${rows.length?rows.map(r=>`<tr><td>${esc(r.family)}</td><td>${esc(r.name)}</td><td>${esc(r.category)}</td><td>${esc(r.meal)}</td><td>${esc(r.arrival||'—')}</td><td>${esc(r.drinks||'—')}</td><td>${esc(r.allergies||'—')}</td></tr>`).join(''):'<tr><td colspan="8">Aucune présence confirmée pour le moment.</td></tr>'}</tbody></table></div>`; }
  function needAccess(){ return `<section class="section"><div class="narrow"><div class="card" style="text-align:center"><h1 class="title">Accès privé</h1><p class="lead">Veuillez entrer votre code personnel depuis la page d’entrée.</p><button class="btn btn-primary" data-nav="logout" style="margin-top:18px">Retour à l’entrée</button></div></div></section>`; }
  function renderFooter(){ return `<footer class="footer"><div class="container"><div class="script">Line Nasya Bilong</div><p>${CONFIG.eventDate} · <a class="footer-link" href="${CONFIG.mapsUrl}" target="_blank" rel="noopener">${CONFIG.venue}</a></p><p>Merci du fond du cœur à toutes celles et ceux qui rendront cette journée inoubliable.</p><p>Organisation : famille Bilong — ${CONFIG.parents}</p><p class="footer-contact"><a href="tel:+${CONFIG.contactPhoneRaw}">${CONFIG.contactPhone}</a> · <a href="mailto:${CONFIG.contactEmail}">${CONFIG.contactEmail}</a></p><p style="margin-top:10px;font-size:.8rem;opacity:.6">© 2026 Line Nasya Bilong · 1er anniversaire</p></div></footer>`; }

  function bind(){
    $('#enterBtn')?.addEventListener('click',login);
    $('#codeInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')login();});
    $('#codeInput')?.addEventListener('input',e=>e.target.value=e.target.value.toUpperCase());
    $$('[data-nav]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.nav)));
    $('#brandBtn')?.addEventListener('click',()=>navigate('home'));
    $('#menuToggle')?.addEventListener('click',toggleMenu);
    $('#navBackdrop')?.addEventListener('click',closeMenu);
    if($('#rsvpForm')) bindRsvp();
    if(page==='organizer') bindOrganizer();
    $('#editResponse')?.addEventListener('click',()=>{ state.responses=state.responses.filter(r=>r.inviteId!==session.inviteId); saveState(); toast('Vous pouvez modifier votre réponse.'); render(); });
    $('#downloadICS')?.addEventListener('click',downloadICS);
    $$('.copy-bank').forEach(b=>b.addEventListener('click', async ()=>{ try{ await navigator.clipboard.writeText(b.dataset.copy||''); toast('IBAN copié.'); }catch(e){ toast('IBAN : '+(b.dataset.copy||'')); } }));
  }
  function navigate(to){ closeMenu(); if(to==='logout'){clearSession(); page='gate'; render(); return;} if(to==='organizer'&&!isStaff()){toast('Accès réservé à l’organisation.','error');return;} if(to==='rsvp'&&session?.role==='guest'){ page='home'; render(); setTimeout(()=>{document.querySelector('#confirmation')?.scrollIntoView({behavior:'smooth'});},80); return; } page=to; render(); window.scrollTo({top:0,behavior:'smooth'}); }
  function updateNav(){ $$('#navLinks button').forEach(b=>b.classList.toggle('active',b.dataset.nav===page)); $$('[data-role="staff"]').forEach(b=>b.style.display=isStaff()?'inline-flex':'none'); }
  function toggleMenu(){ const open=!$('#navLinks').classList.contains('open'); $('#navLinks').classList.toggle('open',open); $('#navBackdrop').classList.toggle('hidden',!open); $('#menuToggle').setAttribute('aria-expanded',String(open)); document.body.style.overflow=open?'hidden':''; }
  function closeMenu(){ $('#navLinks')?.classList.remove('open'); $('#navBackdrop')?.classList.add('hidden'); $('#menuToggle')?.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
  function login(){ const code=normalize($('#codeInput').value); if(!code){toast('Entre ton code personnel.','error');return;} if(code===normalize(CONFIG.organizerCode)||code===normalize(CONFIG.organizerHuman)){writeSession({role:'organizer',code}); page='organizer'; render(); toast('Bienvenue dans l’espace organisateur.');return;} if(code===normalize(CONFIG.adminCode)){writeSession({role:'admin',code}); page='organizer'; render(); toast('Bienvenue admin.');return;} const inv=state.invites.find(i=>normalize(i.code)===code); if(inv){writeSession({role:'guest',inviteId:inv.id,code:inv.code}); page='home'; render(); toast('Bienvenue '+inv.family);return;} $('#codeInput').classList.add('shake'); setTimeout(()=>$('#codeInput')?.classList.remove('shake'),420); toast('Code incorrect.','error'); }

  function bindRsvp(){
    let presence='oui', drinks=[];
    const inv=invite();
    const comps=$('#companions');
    const add=(name='')=>{ comps.insertAdjacentHTML('beforeend',companionHtml(name)); refreshCompanionEvents(); };
    add(inv.mainName||'');
    $('#addCompanion')?.addEventListener('click',()=>add());
    $$('[data-presence]').forEach(b=>b.addEventListener('click',()=>{
      presence=b.dataset.presence;
      $$('[data-presence]').forEach(x=>x.classList.remove('selected'));
      b.classList.add('selected');
      $('#presentBlock')?.classList.toggle('hidden',presence!=='oui');
      $('.btn-confirm').textContent = presence==='oui' ? 'Confirmer ma présence' : 'Confirmer mon absence';
    }));
    $$('[data-drink]').forEach(b=>b.addEventListener('click',()=>{const d=b.dataset.drink; drinks=drinks.includes(d)?drinks.filter(x=>x!==d):[...drinks,d]; b.classList.toggle('selected');}));
    $('#rsvpForm').addEventListener('submit',e=>{
      e.preventDefault();
      const f=e.target;
      const companions=$$('.companion').map(c=>({
        name:$('.comp-name',c).value.trim(),
        category:ageCat($('.comp-category',c).value),
        meal:$('.comp-meal',c).value
      })).filter(c=>c.name);
      if(presence==='oui'&&companions.length===0){toast('Ajoute au moins une personne présente.','error');return;}
      if(presence==='oui'&&companions.length>inv.maxGuests&&!confirm(`Vous avez indiqué ${companions.length} personnes pour ${inv.maxGuests} places prévues. Continuer ?`))return;
      state.responses=state.responses.filter(r=>r.inviteId!==inv.id);
      state.responses.push({id:uid(),inviteId:inv.id,presence,mainName:f.elements.mainName.value.trim(),contact:f.elements.contact.value.trim(),delay:f.elements.delay?.value||'',arrival:f.elements.arrival?.value||'',tableWish:f.elements.tableWish?.value.trim()||'',drinks,companions:presence==='oui'?companions:[],allergies:f.elements.allergies?.value.trim()||'',message:f.elements.message.value.trim(),createdAt:new Date().toISOString()});
      inv.status='responded';
      saveState();
      toast('Confirmation enregistrée.');
      render();
    });
  }
  function refreshCompanionEvents(){
    $$('.remove-companion').forEach(b=>b.onclick=()=>{ if($$('.companion').length<=1){toast('Garde au moins une personne.','error');return;} b.closest('.companion').remove();});
  }

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
          r.companions.forEach(p=>rows.push([i?.family,i?.code,p.name,p.category,p.meal,labelDelay(r.delay),r.arrival,r.allergies]));
        }
      });
      exportCSV('traiteur_line_nasya.csv',['Famille','Code','Prenom','Categorie','Repas','Retard','Arrivee','Allergies'],rows);
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
    bindGuestControls(true);
  }
  function editInvite(id){ const i=id?state.invites.find(x=>x.id===id):{id:uid(),code:'LINE'+String(state.invites.length+1).padStart(3,'0'),family:'',mainName:'',email:'',phone:'',maxGuests:2,status:'pending'}; modal(`<h2 class="serif" style="font-size:2.5rem;color:var(--chocolate)">${id?'Modifier':'Ajouter'} un invité</h2><div class="grid-2" style="margin-top:14px"><input class="input" id="mFamily" placeholder="Famille" value="${esc(i.family)}"><input class="input" id="mCode" placeholder="Code" value="${esc(i.code)}"><input class="input" id="mMain" placeholder="Nom principal" value="${esc(i.mainName||'')}"><input class="input" id="mMax" type="number" min="1" placeholder="Places" value="${i.maxGuests}"><input class="input" id="mEmail" placeholder="Email" value="${esc(i.email||'')}"><input class="input" id="mPhone" placeholder="Téléphone" value="${esc(i.phone||'')}"></div><div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px"><button class="btn btn-soft" id="cancelModal">Annuler</button><button class="btn btn-primary" id="saveInvite">Enregistrer</button></div>`); $('#cancelModal').onclick=closeModal; $('#saveInvite').onclick=()=>{Object.assign(i,{family:$('#mFamily').value.trim(),code:normalize($('#mCode').value),mainName:$('#mMain').value.trim(),maxGuests:Number($('#mMax').value||1),email:$('#mEmail').value.trim(),phone:$('#mPhone').value.trim()}); if(!i.family||!i.code){toast('Famille et code obligatoires.','error');return;} if(!id)state.invites.push(i); saveState(); closeModal(); toast('Invité enregistré.'); render();}; }

  function countdown(){ const diff=Math.max(0,new Date(CONFIG.eventStart)-Date.now()); return {d:Math.floor(diff/864e5),h:Math.floor((diff%864e5)/36e5),m:Math.floor((diff%36e5)/6e4),s:Math.floor((diff%6e4)/1e3)}; }
  function startCountdown(){ if(countdownTimer)clearInterval(countdownTimer); if(page!=='home'){return;} countdownTimer=setInterval(()=>{const c=countdown(); const labels={Jours:c.d,Heures:c.h,Minutes:c.m,Secondes:c.s}; $$('[data-count]').forEach(el=>el.textContent=String(labels[el.dataset.count]).padStart(2,'0')); const line=$('#countLine'); if(line) line.textContent=(c.d<=0&&c.h<=0)?'C’est le grand jour !':`Plus que ${c.d} jour${c.d>1?'s':''} avant la fête`;},1000); }
  function computeStats(){let people=0,children=0;state.responses.forEach(r=>{if(r.presence==='oui'){people+=r.companions.length;r.companions.forEach(p=>{if(['Bébé','Enfant'].includes(p.category))children++;});}});return{people,children};}
  function computeFull(){
    const s={yes:0,no:0,wait:0,people:0,adults:0,children:0,babies:0,allergies:0,meals:{}};
    state.invites.forEach(i=>{
      const r=responseFor(i.id);
      if(!r){s.wait++;return;}
      if(r.presence==='oui'){s.yes++;s.people+=r.companions.length;
        if((r.allergies||'').trim())s.allergies++;
        r.companions.forEach(p=>{
          if(p.category==='Enfant')s.children++;else s.adults++;
          if(p.meal)s.meals[p.meal]=(s.meals[p.meal]||0)+1;
        });
      } else s.no++;
    });
    return s;
  }
  function guestList(){
    let list=[...state.invites];
    const q=gQuery.trim().toLowerCase();
    if(q)list=list.filter(i=>((i.family||'')+' '+(i.mainName||'')+' '+(i.code||'')).toLowerCase().includes(q));
    if(gFilter!=='all')list=list.filter(i=>{const r=responseFor(i.id);if(gFilter==='yes')return r&&r.presence==='oui';if(gFilter==='no')return r&&r.presence==='non';return !r;});
    list.sort((a,b)=>(a.family||'').localeCompare(b.family||'','fr')*(gSort==='asc'?1:-1));
    return list;
  }
  function barRow(label,val,total){const pct=total?Math.round(val/total*100):0;return `<div class="bar-row"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div><b>${val}<i>${pct}%</i></b></div>`;}
  function guestToolbar(withFilters){
    const filters=[['all','Tous'],['yes','Confirmés'],['wait','En attente'],['no','Refusés']];
    return `<div class="guest-toolbar"><input id="guestSearch" class="input" placeholder="Rechercher un invité (nom, code...)" value="${esc(gQuery)}">${withFilters?`<div class="filter-row">${filters.map(([v,l])=>`<button type="button" class="filter-chip ${gFilter===v?'active':''}" data-gfilter="${v}">${l}</button>`).join('')}</div>`:''}<button type="button" class="btn btn-soft sort-btn" id="gSortBtn">Nom ${gSort==='asc'?'A→Z':'Z→A'}</button></div>`;
  }
  function guestRowsHtml(){
    const list=guestList();
    const pages=Math.max(1,Math.ceil(list.length/G_PER_PAGE));
    if(gPage>pages)gPage=pages;
    const slice=list.slice((gPage-1)*G_PER_PAGE, gPage*G_PER_PAGE);
    const isCodes = activeAdminTab==='codes';
    const rows = slice.map(i=>{
      const r=responseFor(i.id);
      const st=r?(r.presence==='oui'?'<span class="badge badge-ok">Présent</span>':'<span class="badge badge-no">Absent</span>'):'<span class="badge badge-wait">En attente</span>';
      if(isCodes)return `<tr><td><b>${esc(i.family)}</b><br><span style="color:var(--muted)">${esc(i.mainName||'')}</span></td><td><b>${esc(i.code)}</b></td><td>${esc(i.phone||i.email||'—')}</td><td>${i.maxGuests}</td><td>${st}</td><td class="row-actions"><button class="small-btn" data-edit-invite="${i.id}">Modifier</button> <button class="small-btn" data-copy-invite="${i.id}">Message</button> <button class="small-btn" data-del-invite="${i.id}">Suppr.</button></td></tr>`;
      return `<tr><td><b>${esc(i.family)}</b><br><span style="color:var(--muted)">${session?.role==='admin'?`Code : ${esc(i.code)}`:esc(i.mainName||'')}</span></td><td>${st}</td><td>${r?.companions?.length||0}/${i.maxGuests}</td><td>${r?.arrival||'—'}</td><td>${r&&r.presence==='oui'?(r.companions.map(c=>c.meal).filter(Boolean).join(', ')||'—'):'—'}</td></tr>`;
    }).join('') || `<tr><td colspan="6" style="color:var(--muted)">Aucun invité ne correspond à la recherche.</td></tr>`;
    const pager = pages>1?`<div class="pager"><button class="small-btn" data-gpage="${gPage-1}" ${gPage<=1?'disabled':''}>Précédent</button><span>Page ${gPage} / ${pages} · ${list.length} invité(s)</span><button class="small-btn" data-gpage="${gPage+1}" ${gPage>=pages?'disabled':''}>Suivant</button></div>`:`<div class="pager"><span>${list.length} invité(s)</span></div>`;
    return {rows,pager};
  }
  function refreshGuestTable(){
    const {rows,pager}=guestRowsHtml();
    const tb=$('#guestTbody'); if(tb)tb.innerHTML=rows;
    const pg=$('#guestPager'); if(pg)pg.innerHTML=pager;
    bindGuestControls(false);
  }
  function bindGuestControls(withSearch=true){
    if(withSearch){
      const s=$('#guestSearch');
      s?.addEventListener('input',()=>{gQuery=s.value;gPage=1;refreshGuestTable();});
      $('#gSortBtn')?.addEventListener('click',()=>{gSort=gSort==='asc'?'desc':'asc';$('#gSortBtn').textContent='Nom '+(gSort==='asc'?'A→Z':'Z→A');refreshGuestTable();});
      $$('[data-gfilter]').forEach(b=>b.addEventListener('click',()=>{gFilter=b.dataset.gfilter;gPage=1;$$('[data-gfilter]').forEach(x=>x.classList.toggle('active',x===b));refreshGuestTable();}));
    }
    $$('[data-gpage]').forEach(b=>b.onclick=()=>{gPage=Number(b.dataset.gpage);refreshGuestTable();});
    $$('[data-edit-invite]').forEach(b=>b.onclick=()=>editInvite(Number(b.dataset.editInvite)));
    $$('[data-copy-invite]').forEach(b=>b.onclick=()=>{const i=state.invites.find(x=>x.id===Number(b.dataset.copyInvite));if(!i)return;navigator.clipboard?.writeText(inviteMessage(i));toast('Message d\u2019invitation copié.');});
    $$('[data-del-invite]').forEach(b=>b.onclick=()=>{const id=Number(b.dataset.delInvite);if(confirm('Supprimer cet invité et son code ?')){state.invites=state.invites.filter(x=>x.id!==id);state.responses=state.responses.filter(r=>r.inviteId!==id);saveState();toast('Invité supprimé.');render();}});
  }
  function labelDelay(v){return DELAYS.find(x=>x[0]===v)?.[1]||'—';}
  function whatsApp(phone,msg){const p=String(phone||'').replace(/[^0-9]/g,'');return p?`https://wa.me/${p}?text=${encodeURIComponent(msg)}`:`https://wa.me/?text=${encodeURIComponent(msg)}`;}
  function inviteMessage(i){return `Bonjour ${i.mainName||i.family},\n\nVous êtes cordialement invité au premier anniversaire de Line Nasya Bilong.\n\nDate : ${CONFIG.eventDate}\nLieu : ${CONFIG.venue}\nAdresse : ${CONFIG.address}\n\nVotre code d’accès personnel : *${i.code}*\n\nMerci de confirmer votre présence via le site.\n\nLa famille Bilong 🎀`;}
  function buildConfirmMessage(inv,r){return `Bonjour ${inv.mainName||inv.family},\n\nMerci pour votre réponse au 1er anniversaire de Line Nasya Bilong.\nPrésence : ${r.presence==='oui'?'confirmée':'absence notée'}\nPersonnes : ${r.companions.length}\nDate : ${CONFIG.eventDate}\nLieu : ${CONFIG.venue}\n\n${CONFIG.parents}`;}
  function exportCSV(name,heads,rows){const csv=[heads,...rows].map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href);toast('Export téléchargé.');}
  function printCodes(){const w=window.open('','_blank');w.document.write(`<html><head><title>Codes Line Nasya</title><style>body{font-family:Arial;padding:30px}h1{color:#553633}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.card{border:1px solid #ddd;border-radius:14px;padding:14px}.code{font-size:24px;font-weight:bold;color:#553633}</style></head><body><h1>Codes invités · Line Nasya</h1><div class="grid">${state.invites.map(i=>`<div class="card"><b>${esc(i.family)}</b><div class="code">${esc(i.code)}</div><p>${i.maxGuests} place(s)</p></div>`).join('')}</div></body></html>`);w.document.close();w.print();}
  function downloadICS(){const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:line-nasya-2026@example.com\nDTSTART:20260815T130000\nDTEND:20260816T020000\nSUMMARY:${CONFIG.eventName}\nLOCATION:${CONFIG.venue}, ${CONFIG.address}\nDESCRIPTION:Anniversaire de Line Nasya Bilong\nEND:VEVENT\nEND:VCALENDAR`;const blob=new Blob([ics],{type:'text/calendar'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='anniversaire-line-nasya.ics';a.click();URL.revokeObjectURL(a.href);}

  render();
})();