(function(){
  'use strict';

  const CONFIG = {
    eventName:'1er anniversaire de Line Nasya Bilong',
    eventDate:'15 août 2026',
    eventStart:'2026-08-15T15:00:00+02:00',
    venue:'Parochiezaal “Ter Krokegem”',
    address:'Dendermondsesteenweg 44, B-1730 Asse',
    parents:'Jacques & Suzanne',
    contactPhone:'+32485496555',
    contactPhoneDisplay:'+32 485 49 65 55',
    contactEmail:'jacques@bilongdigital.com',
    creatorName:'Bilong Digital',
    creatorUrl:'https://bilongdigital.com',
    formSubmitEndpoint:'https://formsubmit.co/ajax/jacques@bilongdigital.com',
    galleryPhotos:[
      ['g1.jpg','Line avant son grand jour'],
      ['g2.jpg','Lumières et ballons'],
      ['g3.jpg','Le nœud rose poudré'],
      ['g4.jpg','La douceur des fleurs'],
      ['g5.jpg','Un petit chignon de princesse'],
      ['g6.jpg','Un an de bonheur']
    ],
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
  let seatView='list';
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
    let s;
    try{ s = JSON.parse(localStorage.getItem(CONFIG.storageKey)) || seedState(); }
    catch(e){ s = seedState(); }
    if(!Array.isArray(s.tables)) s.tables = [];
    s.tables = s.tables.map((t,index)=>({
      id:t.id||uid(), name:t.name||`Table ${index+1}`, seats:Math.max(1,Number(t.seats)||8),
      assigned:Array.isArray(t.assigned)?t.assigned.map(v=>String(v)):[],
      x:Number.isFinite(Number(t.x))?Number(t.x):undefined, y:Number.isFinite(Number(t.y))?Number(t.y):undefined
    }));
    if(!Array.isArray(s.invites)) s.invites=[];
    if(!Array.isArray(s.responses)) s.responses=[];
    return s;
  }
  function saveState(){ localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); }
  function readSession(){ try{return JSON.parse(sessionStorage.getItem('line_nasya_session')||'null');}catch(e){return null;} }
  function writeSession(s){ session=s; sessionStorage.setItem('line_nasya_session',JSON.stringify(s)); }
  function clearSession(){ session=null; sessionStorage.removeItem('line_nasya_session'); }
  function uid(){ return Date.now()+Math.floor(Math.random()*999999); }
  function esc(v=''){ return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function normalize(v){ return String(v||'').trim().toUpperCase().replace(/\s+/g,''); }
  function ageCat(){ return 'Adulte'; }
  function invite(){ return session?.inviteId ? state.invites.find(x=>x.id===session.inviteId) : null; }
  function responseFor(id){ return state.responses.find(r=>r.inviteId===id); }
  function isStaff(){ return session?.role === 'organizer' || session?.role === 'admin'; }
  function toast(msg,type='success'){
    const el=document.createElement('div'); el.className='toast '+(type==='error'?'error':''); el.textContent=(type==='error'?'':'✓ ')+msg; $('#toastMount').appendChild(el); setTimeout(()=>el.remove(),3300);
  }
  function modal(html){ $('#modalMount').innerHTML=`<div class="modal"><div class="modal-card">${html}</div></div>`; $('.modal').addEventListener('click',e=>{ if(e.target.classList.contains('modal')) closeModal(); }); }
  function closeModal(){ $('#modalMount').innerHTML=''; }

  function render(){
    const isGate = page==='gate';
    $('#navbar').classList.toggle('hidden', isGate);
    document.body.classList.toggle('has-app-nav', !isGate);
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
    return `<section class="gate gate-redesign">
      <div class="gate-visual" role="img" aria-label="Décoration du premier anniversaire de Line Nasya">
        <div class="gate-mobile-title"><strong>Line Nasya Bilong</strong><span>${CONFIG.eventDate}</span></div>
      </div>
      <div class="gate-panel">
        <div class="gate-float card-glass" style="text-align:center">
          <span class="gate-kicker">1er anniversaire</span>
          <h1 class="gate-title">Bienvenue dans le petit monde de Line</h1>
          <p class="gate-copy">Entrez le code reçu avec votre invitation pour découvrir la fête et nous dire si vous serez parmi nous.</p>
          <div class="gate-form">
            <label class="visually-hidden" for="codeInput">Code d’accès</label>
            <input id="codeInput" class="input" placeholder="Votre code d’accès" autocomplete="one-time-code" inputmode="text" autocapitalize="characters" aria-label="Code d’accès">
            <button id="enterBtn" class="btn btn-primary">Ouvrir mon invitation <span aria-hidden="true">→</span></button>
          </div>
          <p class="code-help">Réponse souhaitée avant le 31 juillet 2026.</p>
        </div>
      </div>
    </section>`;
  }

  function renderHome(){
    const inv=invite(); const resp=inv?responseFor(inv.id):null;
    const answer = inv ? `<section id="confirmation" class="section premium-rsvp answer-first reveal"><div class="narrow"><div class="section-head answer-heading response-page-head"><div><span class="eyebrow">Votre réponse</span><h2 class="title">Serez-vous parmi nous ?</h2></div><p class="lead">Indiquez simplement qui sera présent afin que nous préparions les repas et les places.</p></div>${rsvpContent(inv)}</div></section>` : '';
    return `${renderHero(inv,resp)}${answer}${renderInfos()}${renderGallery()}${renderProgram()}${renderFooter()}`;
  }
  function renderInfos(){
    return `<section id="infos" class="section infos-section reveal"><div class="container">
      <div class="section-head compact-head"><div><span class="eyebrow">Informations pratiques</span><h2 class="title" style="margin-top:12px">L’essentiel pour votre venue</h2></div><p class="lead">Une vue claire de l’adresse, des horaires, de la tenue et des contacts.</p></div>
      <div class="practical-layout">
        <div class="practical-copy">
          <article class="practical-block"><span class="mini-label">Quand</span><h3>Samedi 15 août 2026</h3><p>Accueil des familles dès <strong>15h00</strong>. Le grand dîner est prévu à <strong>17h30</strong>, puis la fête se poursuit en musique jusque tard dans la nuit.</p></article>
          <article class="practical-block"><span class="mini-label">Où</span><h3>${CONFIG.venue}</h3><p>${CONFIG.address}</p><a class="text-action" href="${mapsUrl()}" target="_blank" rel="noopener">Ouvrir l’itinéraire</a></article>
          <article class="practical-block dress-block"><span class="mini-label">Tenue souhaitée</span><h3>Couleurs de la fête</h3><div class="dress-palette"><span class="dress-item"><i style="--swatch:#6b3f35"></i><b>Marron</b></span><span class="dress-item"><i style="--swatch:#d9a0a7"></i><b>Rose poudré</b></span><span class="dress-item"><i style="--swatch:#e7c4b4"></i><b>Nude</b></span><span class="dress-item"><i style="--swatch:#c9a44c"></i><b>Doré</b></span></div></article>
          <article class="practical-block contact-block"><span class="mini-label">Un renseignement ?</span><h3>Jacques & Suzanne</h3><div class="contact-actions"><a href="tel:${CONFIG.contactPhone}" aria-label="Appeler Jacques"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></svg><span>Appeler</span></a><a href="https://wa.me/${CONFIG.contactPhone.replace('+','')}" target="_blank" rel="noopener" aria-label="Écrire sur WhatsApp"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8A8.5 8.5 0 0 1 12.5 20a8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9 8.38 8.38 0 0 1 12.5 3H13a8.48 8.48 0 0 1 8 8z"/></svg><span>WhatsApp</span></a><a href="mailto:${CONFIG.contactEmail}" aria-label="Envoyer un email"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="m22 6-10 7L2 6"/></svg><span>Email</span></a></div></article>
        </div>
        <div class="map-panel"><iframe title="Carte de Parochiezaal Ter Krokegem" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2515.0926390586983!2d4.185648500000001!3d50.92200330000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c3bfc42b1b44d3%3A0xe50af4a19f8db2df!2sParochiezaal%20Ter%20Krokegem!5e0!3m2!1sfr!2sbe!4v1783643332092!5m2!1sfr!2sbe" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>
      </div>
    </div></section>`;
  }
  function renderGallery(){
    const shots=CONFIG.galleryPhotos;
    return `<section id="gallery" class="section gallery-section reveal"><div class="container"><div class="section-head compact-head"><div><span class="eyebrow">Souvenirs de Line</span><h2 class="title" style="margin-top:12px">Ses petits instants précieux</h2></div><p class="lead">Faites défiler les photos ou touchez l’image pour l’agrandir.</p></div><div class="memory-carousel" aria-roledescription="carousel"><button type="button" class="carousel-arrow carousel-prev" aria-label="Photo précédente">‹</button><div class="carousel-track">${shots.map(([f,alt],i)=>`<button type="button" class="carousel-slide ${i===0?'is-active':''}" data-gallery-index="${i}" aria-label="Agrandir la photo : ${alt}"><img src="assets/img/gallery/${f}" alt="${alt}" loading="${i===0?'eager':'lazy'}" decoding="async"><span class="carousel-caption">${alt}</span></button>`).join('')}</div><button type="button" class="carousel-arrow carousel-next" aria-label="Photo suivante">›</button><div class="carousel-dots">${shots.map((_,i)=>`<button type="button" class="carousel-dot ${i===0?'is-active':''}" data-carousel-dot="${i}" aria-label="Afficher la photo ${i+1}"></button>`).join('')}</div></div></div></section>`;
  }
  function renderHero(inv,resp){
    const cd=countdown();
    return `<section class="hero"><div class="container hero-grid"><div class="hero-copy">
      <span class="eyebrow">Samedi ${CONFIG.eventDate}</span>
      <div><h1 class="title">Line Nasya fête ses 1 an</h1></div>
      <div class="countdown countdown-priority">${countCard(cd.d,'Jours')}${countCard(cd.h,'Heures')}${countCard(cd.m,'Minutes')}${countCard(cd.s,'Secondes')}</div>
      <p class="count-line" id="countLine">${cd.d<=0&&cd.h<=0?'C’est le grand jour !':`Plus que ${cd.d} jour${cd.d>1?'s':''} avant la fête`}</p>
      <p class="lead">Une journée familiale et chaleureuse pour célébrer sa première année.</p>
      <div class="hero-primary-action"><button class="btn btn-primary btn-rsvp-main" data-nav="rsvp">Confirmer ma présence</button><span>Réponse avant le 31 juillet 2026</span></div>
      ${inv?`<div class="welcome-note"><b>${esc(inv.mainName||inv.family)}</b><span>${inv.maxGuests} place(s) prévue(s)${resp?' · Réponse enregistrée':''}</span></div>`:''}
    </div><div class="hero-photo" aria-label="Photo de Line Nasya"></div></div></section>`;
  }
  function countCard(n,l){ return `<div class="count-card"><strong data-count="${l}">${String(n).padStart(2,'0')}</strong><span>${l}</span></div>`; }
  function programIcon(type){
    const icons={
      welcome:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 45c8-10 32-10 40 0"/><circle cx="22" cy="23" r="7"/><circle cx="42" cy="23" r="7"/><path d="M32 12v8M28 16h8"/></svg>',
      castle:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 52V25h10v8h8V25h8v8h8v-8h10v27H12Z"/><path d="M19 25V14h8v11M37 25V14h8v11M27 52V40h10v12"/></svg>',
      clown:'<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="31" r="17"/><path d="M20 18c5-9 19-9 24 0"/><circle cx="25" cy="29" r="2"/><circle cx="39" cy="29" r="2"/><path d="M25 38c4 4 10 4 14 0"/><circle cx="32" cy="34" r="3"/></svg>',
      magic:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="m18 46 28-28"/><path d="m40 14 10 10M14 20l4 4M12 32h6M46 46l4 4M32 10v6"/><path d="m22 14 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z"/></svg>',
      meal:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 12v18M12 12v12c0 5 12 5 12 0V12M18 30v22M42 12c7 8 7 18 0 26v14M42 12v26"/></svg>',
      cake:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 34h36v18H14z"/><path d="M18 34v-8h28v8M24 26v-8M32 26v-8M40 26v-8"/><path d="M22 18c2-4 4-4 6 0M30 18c2-4 4-4 6 0M38 18c2-4 4-4 6 0"/></svg>',
      cocktail:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 14h24L24 34v14M16 52h16M42 18h10l-5 18v12M41 52h12"/><circle cx="47" cy="14" r="4"/></svg>',
      music:'<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M26 18v28M26 22l22-6v24"/><circle cx="20" cy="48" r="6"/><circle cx="42" cy="42" r="6"/></svg>'
    };
    return `<span class="program-icon program-icon-${type}">${icons[type]||icons.welcome}</span>`;
  }
  function renderProgram(){
    const welcome=[
      ['15h00','Accueil & cocktail de bienvenue','Cocktails, boissons, jus et petites gourmandises pour les enfants et les parents, installation et premières photos.','cocktail'],
      ['15h30','Activités & convivialité','Jeux et animations pour les enfants pendant que les parents profitent des échanges, de la musique d’ambiance et de l’espace photo.','castle'],
      ['16h45','Rassemblement & photos','Photos de famille, photos avec Line et transition douce vers le grand dîner.','welcome']
    ];
    const celebration=[
      ['17h30','Grand dîner','Buffet principal servi à tous les invités dans une ambiance familiale, chaleureuse et conviviale.','meal'],
      ['19h30','Animations & remerciements','Jeux en famille, petites surprises, prises de parole et photos souvenirs.','magic'],
      ['20h00','Bougie & coupure du gâteau','Chant d’anniversaire, bougie, coupure du gâteau, dessert et photos officielles autour de Line.','cake'],
      ['21h00','Musique & danse','Ouverture de la piste et soirée festive pour toutes les générations.','music'],
      ['Jusqu’au petit matin','La fête continue','Musique, danse, échanges et départ progressif des invités, sans précipitation.','cocktail']
    ];
    const rows=(items)=>items.map(([t,a,d,i])=>`<article class="program-row"><div class="program-visual">${programIcon(i)}<div class="program-time">${t}</div></div><div class="program-copy"><div class="program-title">${a}</div><div class="program-desc">${d}</div></div></article>`).join('');
    return `<section id="programme" class="program section program-soft reveal"><div class="narrow">
      <div class="section-head program-heading"><div><span class="eyebrow">Le déroulement de la fête</span><h2 class="title" style="margin-top:12px">Une fête, un parcours partagé</h2></div><p class="lead">Enfants, parents et proches vivent la journée ensemble, avec des temps adaptés à chacun.</p></div>
      <div class="program-split program-unified">
        <section class="program-part program-part-kids"><div class="program-part-head"><span>15h00 — 17h30</span><h3>Accueil & activités</h3><p>Cocktails, boissons, animations et retrouvailles pour toute la famille.</p></div><div class="program-flow">${rows(welcome)}</div></section>
        <section class="program-part program-part-adults"><div class="program-part-head"><span>Dès 17h30</span><h3>Dîner & célébration</h3><p>Grand dîner, gâteau, animations, musique et danse dans une même ambiance.</p></div><div class="program-flow">${rows(celebration)}</div></section>
      </div>
    </div></section>`;
  }

  function openGallery(index){
    const photos=CONFIG.galleryPhotos;
    const item=photos[index]; if(!item) return;
    const [file,alt]=item;
    modal(`<div class="gallery-lightbox" role="dialog" aria-modal="true" aria-label="Photo agrandie">
      <button class="lightbox-close" type="button" aria-label="Fermer">×</button>
      <button class="lightbox-nav lightbox-prev" type="button" aria-label="Photo précédente">‹</button>
      <img src="assets/img/gallery/${file}" alt="${alt}">
      <button class="lightbox-nav lightbox-next" type="button" aria-label="Photo suivante">›</button>
      <p>${alt}</p>
    </div>`);
    $('.lightbox-close')?.addEventListener('click',closeModal);
    $('.lightbox-prev')?.addEventListener('click',()=>{closeModal();openGallery((index-1+photos.length)%photos.length)});
    $('.lightbox-next')?.addEventListener('click',()=>{closeModal();openGallery((index+1)%photos.length)});
  }

  function renderRsvp(){
    const inv=invite(); if(!inv) return needAccess();
    return `<section class="section premium-rsvp"><div class="narrow">${rsvpContent(inv)}</div></section>${renderFooter()}`;
  }
  function rsvpContent(inv){
    const resp=responseFor(inv.id); if(resp) return doneCard(inv,resp);
    const invitationNo = `INV-2026-${String(inv.id).padStart(4,'0')}`;
    return `
      <div class="invite-summary" aria-label="Résumé de l’invitation">
        <div><span class="mini-label">Invitation</span><strong>${esc(inv.mainName||inv.family)}</strong></div>
        <div><span class="mini-label">Référence</span><strong>${invitationNo}</strong></div>
        <div><span class="mini-label">Places prévues</span><strong>${inv.maxGuests}</strong></div>
      </div>
      <form id="rsvpForm" class="card premium-form">
        <h3 class="form-section-title step-title"><span class="step-n">1</span>Votre présence</h3>
        <div class="field"><label>Serez-vous présent ?</label><div class="choice-row choice-xl"><button type="button" class="choice selected" data-presence="oui">Oui, avec plaisir</button><button type="button" class="choice" data-presence="non">Non, malheureusement</button></div></div>
        <h3 class="form-section-title step-title"><span class="step-n">2</span>Vos coordonnées</h3>
        <div class="grid-2"><div class="field"><label>Nom et prénom</label><input class="input input-locked" name="mainName" value="${esc(inv.mainName||inv.family||'')}" readonly></div><div class="field"><label>Téléphone</label><input class="input" name="contact" value="${esc(inv.phone||inv.email||'')}" placeholder="+32 ..."></div></div>
        <div id="presentBlock">
          <h3 class="form-section-title step-title"><span class="step-n">3</span>Les personnes présentes</h3>
          <p class="mini-help">Votre invitation prévoit ${inv.maxGuests} personne(s). Complétez une fiche pour chacune.</p>
          <div class="grid-2"><div class="field"><label>Places prévues</label><input class="input" value="${inv.maxGuests} personne(s)" disabled></div><div class="field"><label>Arrivée prévue</label><input class="input" name="arrival" placeholder="Ex. 13h30"></div></div>
          <div class="field companion-zone"><div id="companions"></div><button type="button" class="btn btn-soft" id="addCompanion">Demander une place supplémentaire</button><p class="mini-help">Une place supplémentaire reste soumise à l’accord des organisateurs selon les disponibilités.</p></div>
          <h3 class="form-section-title step-title"><span class="step-n">4</span>Organisation</h3>
          <div class="grid-2"><div class="field"><label>Retard possible</label><select class="select" name="delay">${DELAYS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div><div class="field"><label>Souhait de placement</label><input class="input" name="tableWish" placeholder="Ex. près des enfants..."></div></div>
          <div class="field"><label>Boissons souhaitées</label><div class="drink-grid">${DRINKS.map(d=>`<button type="button" class="drink-chip" data-drink="${d}">${d}</button>`).join('')}</div></div>
          <div class="field"><label>Allergies ou besoins particuliers</label><textarea class="textarea" name="allergies" placeholder="Ex. arachides, chaise enfant, sans porc..."></textarea></div>
        </div>
        <h3 class="form-section-title step-title"><span class="step-n">5</span>Un petit mot pour Line</h3>
        <div class="field"><label class="visually-hidden">Message pour Line</label><textarea class="textarea" name="message" placeholder="Un mot doux à garder en souvenir."></textarea></div>
        <button class="btn btn-primary btn-confirm">Confirmer ma présence</button>
      </form>`;
  }
  function doneCard(inv,resp){ return `<div class="card success-card" style="text-align:center"><div class="script" style="font-size:3.8rem;color:var(--gold)">Merci ${esc(resp.mainName||inv.mainName||inv.family)}</div><h2 class="title" style="font-size:3rem">Confirmation enregistrée</h2><p class="lead">${resp.presence==='oui'?`Votre présence a bien été confirmée pour ${resp.companions.length} personne(s).`:'Votre absence est bien notée.'}</p><p class="lead" style="margin-top:10px">Nous avons hâte de vous accueillir pour célébrer le premier anniversaire de <b>Line Nasya Bilong</b>. À très bientôt.</p><div class="vip-ticket" style="margin:22px auto 0;max-width:340px"><span>Invitation N°</span><strong>INV-2026-${String(inv.id).padStart(4,'0')}</strong><em>Statut : ${resp.presence==='oui'?'Confirmé ✓':'Absence notée'}</em><em>Catégorie : Invité VIP</em></div><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:22px"><button class="btn btn-soft" id="editResponse">Modifier ma réponse</button><button class="btn btn-primary" id="downloadICS">Ajouter à mon agenda</button><a class="btn btn-soft" href="${whatsApp('',buildConfirmMessage(inv,resp))}" target="_blank">Partager WhatsApp</a></div></div>`; }
  function companionHtml(name=''){return `<div class="companion"><div class="companion-head"><b>Personne invitée</b><button type="button" class="small-btn remove-companion">Retirer</button></div><div class="grid-3"><div class="field"><label>Prénom et nom</label><input class="input comp-name" value="${esc(name)}" placeholder="Ex. Marie Bilong" required></div><div class="field"><label>Catégorie</label><select class="select comp-category"><option value="Adulte">Adulte</option><option value="Enfant">Enfant</option></select></div><div class="field"><label>Repas</label><select class="select comp-meal">${MEALS.map(m=>`<option>${m}</option>`).join('')}</select></div></div></div>`;}


  function renderOrganizer(){
    if(!isStaff()) return needAccess();
    const stats=computeStats(); const fx=computeFull();
    const tabs = session?.role === 'admin'
      ? [['overview','Vue générale'],['catering','Présences & repas'],['seating','Plan de salle'],['codes','Invités & accès']]
      : [['overview','Vue générale'],['catering','Présences & repas'],['seating','Plan de salle']];
    if(session?.role !== 'admin' && activeAdminTab === 'codes') activeAdminTab = 'overview';
    return `<section class="section admin-page"><div class="container admin-shell"><aside class="admin-side"><h3>${session?.role==='admin'?'Administration':'Organisation'}</h3>${tabs.map(([k,l])=>`<button class="${activeAdminTab===k?'active':''}" data-admin-tab="${k}">${l}</button>`).join('')}</aside><div class="admin-main"><div class="admin-page-head"><div><span class="eyebrow">${session?.role==='admin'?'Espace admin':'Espace organisateur'}</span><h1>${session?.role==='admin'?'Gestion de l’événement':'Suivi de l’événement'}</h1></div><p>${session?.role==='admin'?'Invités, réponses, repas et plan de salle au même endroit.':'Réponses, repas et placement des invités.'}</p></div><div class="stat-grid stat-grid-with-places"><div class="stat"><strong>${state.invites.length}</strong><span>Invitations</span></div><div class="stat"><strong>${fx.yes}</strong><span>Confirmées</span></div><div class="stat"><strong>${fx.no}</strong><span>Absentes</span></div><div class="stat"><strong>${fx.wait}</strong><span>En attente</span></div><div class="stat stat-places"><strong>${fx.people}</strong><span>Places confirmées</span></div></div>${activeAdminTab==='overview'?adminOverview():''}${activeAdminTab==='codes'?adminCodes():''}${activeAdminTab==='catering'?adminCatering():''}${activeAdminTab==='seating'?adminSeating():''}</div></div></section>${renderFooter()}`;
  }
  function adminOverview(){
    const f=computeFull();
    const totalInv=state.invites.length;
    const {rows,pager}=guestRowsHtml();
    const mealsHtml=Object.keys(f.meals).length?Object.entries(f.meals).map(([m,v])=>barRow(m,v,f.people)).join(''):'<p class="lead" style="font-size:.9rem">Les repas apparaîtront avec les premières confirmations.</p>';
    return `<div class="admin-actions"><button class="btn btn-primary" id="exportAll">Exporter confirmations CSV</button><button class="btn btn-soft" id="exportBackup">Sauvegarder toutes les données</button><label class="btn btn-soft import-label">Restaurer une sauvegarde<input id="importBackup" type="file" accept="application/json" hidden></label>${session?.role==='admin'?'<button class="btn btn-soft" id="copyAllCodes">Copier tous les codes</button><button class="btn btn-soft" id="printCodes">Imprimer les codes</button><button class="btn btn-soft" id="copyWhatsapp">Texte WhatsApp</button><button class="btn btn-danger" id="clearData">Réinitialiser les données</button>':''}</div>
    <div class="charts-grid">
      <div class="chart-card"><h3>Réponses</h3>${barRow('Confirmés',f.yes,totalInv)}${barRow('Refusés',f.no,totalInv)}${barRow('En attente',f.wait,totalInv)}</div>
      <div class="chart-card"><h3>Personnes attendues</h3>${barRow('Adultes',f.adults,f.people)}${barRow('Enfants',f.children,f.people)}${barRow('Bébés',f.babies,f.people)}</div>
      <div class="chart-card"><h3>Repas</h3>${mealsHtml}</div>
      <div class="chart-card"><h3>À surveiller</h3>${barRow('Allergies signalées',f.allergies,f.yes||1)}${barRow('Taux de réponse',f.yes+f.no,totalInv)}</div>
    </div>
    ${guestToolbar(true)}
    <div class="table-wrap"><table><thead><tr><th>Invité</th><th>Présence</th><th>Personnes</th><th>Arrivée</th><th>Repas</th></tr></thead><tbody id="guestTbody">${rows}</tbody></table></div><div id="guestPager">${pager}</div>`;
  }
  function adminCodes(){ if(session?.role!=='admin') return `<div class="card"><h2 class="serif">Accès réservé à l\u2019Admin</h2><p class="lead">Seul l\u2019administrateur peut créer les invités et générer les mots de passe.</p></div>`;
    const {rows,pager}=guestRowsHtml();
    return `<div class="admin-actions"><button class="btn btn-primary" id="addInvite">Ajouter / personnaliser un invité</button><button class="btn btn-soft" id="generateCodes">Générer 50 codes</button><button class="btn btn-soft" id="copyAllCodes">Copier tous les codes</button><button class="btn btn-soft" id="printCodes">Imprimer les codes</button></div>${guestToolbar(true)}<div class="table-wrap"><table><thead><tr><th>Famille</th><th>Mot de passe</th><th>Contact</th><th>Places</th><th>Présence</th><th>Actions</th></tr></thead><tbody id="guestTbody">${rows}</tbody></table></div><div id="guestPager">${pager}</div>`;}

  function seatingPeople(){
    const people=[];
    state.responses.forEach(r=>{
      if(r.presence!=='oui')return;
      const inv=state.invites.find(i=>i.id===r.inviteId);
      (r.companions||[]).forEach((p,index)=>people.push({
        key:`${r.inviteId}:${index}`,
        inviteId:r.inviteId,
        name:p.name||`${inv?.family||'Invité'} ${index+1}`,
        category:p.category||'Adulte',
        meal:p.meal||'',
        family:inv?.family||''
      }));
    });
    return people;
  }
  function normalizeSeatAssignments(){
    const persons=seatingPeople();
    state.tables.forEach(t=>{
      const expanded=[];
      (t.assigned||[]).forEach(raw=>{
        const key=String(raw);
        if(key.includes(':')) expanded.push(key);
        else persons.filter(p=>String(p.inviteId)===key).forEach(p=>expanded.push(p.key));
      });
      t.assigned=[...new Set(expanded)].filter(k=>persons.some(p=>p.key===k));
    });
  }
  function adminSeating(){
    normalizeSeatAssignments();
    const persons=seatingPeople();
    const canEdit=isStaff();
    const assigned=new Set(state.tables.flatMap(t=>t.assigned||[]));
    const unassigned=persons.filter(p=>!assigned.has(p.key));
    const toggle=`<div class="seat-toggle" role="tablist"><button class="${seatView==='list'?'active':''}" data-seat-view="list">Liste des tables</button><button class="${seatView==='plan'?'active':''}" data-seat-view="plan">Plan de la salle</button></div>`;
    const actions=canEdit?`<div class="admin-actions seating-actions"><button class="btn btn-primary" id="addTable">Ajouter une table</button><button class="btn btn-soft" id="autoRoom">Disposer automatiquement</button><button class="btn btn-soft" id="exportRoom">Exporter le plan</button></div>`:'';
    if(!state.tables.length)return `${toggle}${actions}<div class="card empty-state"><h3>Commencez par créer une table</h3><p>Ajoutez les tables, puis placez chaque invité individuellement.</p></div>`;
    const occupancy=t=>(t.assigned||[]).length;
    const personChip=key=>{const p=persons.find(x=>x.key===key);if(!p)return'';return `<span class="seat-chip"><span><b>${esc(p.name)}</b><small>${esc(p.category)} · ${esc(p.family)}</small></span>${canEdit?`<button class="seat-x" data-unassign="${esc(key)}" aria-label="Retirer ${esc(p.name)}">×</button>`:''}</span>`;};
    if(seatView==='plan'){
      return `${toggle}${actions}<div class="room-toolbar"><span>Déplacez les tables pour reproduire la salle. Touchez une table pour la modifier.</span><button type="button" class="small-btn" id="resetRoom">Réinitialiser</button></div><div class="room-plan" id="roomPlan"><div class="room-label room-stage">SCÈNE / TABLE D’HONNEUR</div><div class="room-dance">PISTE DE DANSE</div><div class="room-label room-entry">ENTRÉE</div>${state.tables.map((t,idx)=>{const occ=occupancy(t),full=occ>=t.seats,x=Number.isFinite(t.x)?t.x:12+(idx%4)*22,y=Number.isFinite(t.y)?t.y:22+Math.floor(idx/4)*28;return `<button type="button" class="room-table ${full?'full':''}" data-room-table="${t.id}" style="left:${x}%;top:${y}%"><b>${esc(t.name)}</b><span>${occ}/${t.seats}</span><small>${(t.assigned||[]).slice(0,2).map(k=>esc(persons.find(p=>p.key===k)?.name||'')).filter(Boolean).join(', ')}</small></button>`;}).join('')}</div><div class="plan-legend"><span><i class="legend-free"></i>Places disponibles</span><span><i class="legend-full"></i>Table complète</span></div>`;
    }
    return `${toggle}${actions}${unassigned.length?`<div class="card card-soft seat-unassigned"><div><b>Invités à placer (${unassigned.length})</b><p>Choisissez une table pour chaque personne.</p></div><div class="unassigned-people">${unassigned.map(p=>`<span>${esc(p.name)} <small>${esc(p.category)} · ${esc(p.family)}</small></span>`).join('')}</div></div>`:''}<div class="seat-list">${state.tables.map(t=>{const occ=occupancy(t);const options=unassigned.map(p=>`<option value="${esc(p.key)}">${esc(p.name)} — ${esc(p.family)}</option>`).join('');return `<div class="card seat-card"><div class="seat-head"><div><b>${esc(t.name)}</b><small>${occ} invité(s) placé(s)</small></div><span class="badge ${occ>t.seats?'badge-no':occ===t.seats?'badge-ok':'badge-wait'}">${occ}/${t.seats}</span>${canEdit?`<button class="small-btn" data-edit-table="${t.id}">Modifier</button><button class="small-btn" data-del-table="${t.id}">Supprimer</button>`:''}</div><div class="seat-chips">${(t.assigned||[]).map(personChip).join('')||'<span class="mini-help">Aucun invité placé</span>'}</div>${canEdit&&options&&occ<t.seats?`<div class="seat-assign"><select class="select" data-assign-select="${t.id}"><option value="">Placer un invité…</option>${options}</select></div>`:''}</div>`;}).join('')}</div>`;
  }
  function bindSeating(){
    $$('[data-seat-view]').forEach(b=>b.onclick=()=>{seatView=b.dataset.seatView;render();});
    $('#addTable')?.addEventListener('click',()=>{
      modal(`<h2 class="modal-title">Nouvelle table</h2><div class="grid-2 modal-grid"><div class="field"><label>Nom</label><input class="input" id="tName" placeholder="Ex. Table 1"></div><div class="field"><label>Nombre de places</label><input class="input" id="tSeats" type="number" min="1" max="30" value="8"></div></div><div class="modal-actions"><button class="btn btn-soft" id="cancelModal">Annuler</button><button class="btn btn-primary" id="saveTable">Créer</button></div>`);
      $('#cancelModal').onclick=closeModal;
      $('#saveTable').onclick=()=>{const name=$('#tName').value.trim(),seats=Math.max(1,Number($('#tSeats').value)||8);if(!name){toast('Donnez un nom à la table.','error');return;}state.tables.push({id:uid(),name,seats,assigned:[]});saveState();closeModal();toast('Table créée.');render();};
    });
    $$('[data-edit-table]').forEach(b=>b.onclick=()=>editTable(b.dataset.editTable));
    $$('[data-del-table]').forEach(b=>b.onclick=()=>{if(confirm('Supprimer cette table ?')){state.tables=state.tables.filter(t=>String(t.id)!==String(b.dataset.delTable));saveState();render();}});
    $$('[data-assign-select]').forEach(sel=>sel.addEventListener('change',()=>{const key=sel.value;if(!key)return;const t=state.tables.find(t=>String(t.id)===String(sel.dataset.assignSelect));if(t&&(t.assigned||[]).length<t.seats&&!t.assigned.includes(key)){t.assigned.push(key);saveState();toast('Invité placé.');render();}}));
    $$('[data-unassign]').forEach(b=>b.onclick=()=>{const key=b.dataset.unassign;state.tables.forEach(t=>t.assigned=t.assigned.filter(x=>x!==key));saveState();render();});
    const plan=$('#roomPlan');
    if(plan){
      $$('[data-room-table]').forEach(el=>{
        let dragging=false,moved=false,rect,startX=0,startY=0;
        const move=ev=>{if(!dragging)return;ev.preventDefault();if(Math.abs(ev.clientX-startX)>5||Math.abs(ev.clientY-startY)>5)moved=true;const x=Math.max(7,Math.min(93,((ev.clientX-rect.left)/rect.width)*100));const y=Math.max(14,Math.min(88,((ev.clientY-rect.top)/rect.height)*100));el.style.left=x+'%';el.style.top=y+'%';};
        const end=ev=>{if(!dragging)return;dragging=false;el.classList.remove('is-dragging');const t=state.tables.find(t=>String(t.id)===String(el.dataset.roomTable));if(t){t.x=parseFloat(el.style.left);t.y=parseFloat(el.style.top);saveState();}window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);if(!moved)editTable(el.dataset.roomTable);};
        el.addEventListener('pointerdown',ev=>{if(!isStaff())return;ev.preventDefault();dragging=true;moved=false;startX=ev.clientX;startY=ev.clientY;rect=plan.getBoundingClientRect();el.classList.add('is-dragging');window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',end);});
      });
    }
    $('#resetRoom')?.addEventListener('click',()=>{state.tables.forEach(t=>{delete t.x;delete t.y;});saveState();render();});
    $('#autoRoom')?.addEventListener('click',autoLayoutRoom);
    $('#exportRoom')?.addEventListener('click',exportRoomPlan);
  }
  function editTable(tableId){
    const t=state.tables.find(x=>String(x.id)===String(tableId)); if(!t)return;
    modal(`<h2 class="serif modal-title">Modifier la table</h2><div class="grid-2 modal-grid"><div class="field"><label>Nom de la table</label><input class="input" id="editTName" value="${esc(t.name)}"></div><div class="field"><label>Nombre de places</label><input class="input" id="editTSeats" type="number" min="1" max="30" value="${t.seats}"></div></div><div class="modal-actions"><button class="btn btn-soft" id="cancelModal">Annuler</button><button class="btn btn-primary" id="saveTableEdit">Enregistrer</button></div>`);
    $('#cancelModal').onclick=closeModal;
    $('#saveTableEdit').onclick=()=>{const name=$('#editTName').value.trim();const seats=Math.max(1,Number($('#editTSeats').value)||8);if(!name){toast('Donnez un nom à la table.','error');return;}t.name=name;t.seats=seats;saveState();closeModal();toast('Table mise à jour.');render();};
  }
  function autoLayoutRoom(){
    const count=Math.max(1,state.tables.length); const cols=Math.min(5,Math.ceil(Math.sqrt(count))); const rows=Math.ceil(count/cols);
    state.tables.forEach((t,i)=>{const col=i%cols,row=Math.floor(i/cols);t.x=12+(cols===1?38:col*(76/(cols-1)));t.y=23+(rows===1?30:row*(55/(rows-1)));});
    saveState();render();toast('Disposition automatique appliquée.');
  }
  function exportRoomPlan(){
    const data={event:CONFIG.eventName,updatedAt:new Date().toISOString(),tables:state.tables,invites:state.invites,responses:state.responses};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='plan-salle-line-nasya.json';a.click();URL.revokeObjectURL(a.href);toast('Plan de salle exporté.');
  }
  function exportBackup(){
    const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='sauvegarde-line-nasya-'+new Date().toISOString().slice(0,10)+'.json';a.click();URL.revokeObjectURL(a.href);toast('Sauvegarde téléchargée.');
  }
  function importBackupFile(file){
    const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result);const incoming=parsed.state||parsed;if(!Array.isArray(incoming.invites)||!Array.isArray(incoming.responses))throw new Error('format');state=incoming;if(!Array.isArray(state.tables))state.tables=[];saveState();toast('Sauvegarde restaurée.');render();}catch(e){toast('Fichier de sauvegarde invalide.','error');}};reader.readAsText(file);
  }

  function adminCatering(){ const rows=[]; state.responses.forEach(r=>{ const i=state.invites.find(x=>x.id===r.inviteId); if(r.presence==='oui') r.companions.forEach(p=>rows.push({family:i?.family||'',...p,delay:r.delay,arrival:r.arrival,allergies:r.allergies,contact:r.contact,drinks:(r.drinks||[]).join(', ')})); }); return `<div class="admin-actions"><button class="btn btn-primary" id="exportCatering">Exporter traiteur CSV</button></div><div class="table-wrap"><table><thead><tr><th>Famille</th><th>Personne</th><th>Âge</th><th>Catégorie</th><th>Repas</th><th>Arrivée</th><th>Boissons</th><th>Allergies</th></tr></thead><tbody>${rows.length?rows.map(r=>`<tr><td data-label="Famille">${esc(r.family)}</td><td data-label="Personne">${esc(r.name)}</td><td data-label="Âge">${esc(r.age||'—')}</td><td data-label="Catégorie">${esc(r.category)}</td><td data-label="Repas">${esc(r.meal)}</td><td data-label="Arrivée">${esc(r.arrival||'—')}</td><td data-label="Boissons">${esc(r.drinks||'—')}</td><td data-label="Allergies">${esc(r.allergies||'—')}</td></tr>`).join(''):'<tr><td colspan="8">Aucune présence confirmée pour le moment.</td></tr>'}</tbody></table></div>`; }
  function needAccess(){ return `<section class="section"><div class="narrow"><div class="card" style="text-align:center"><h1 class="title">Accès privé</h1><p class="lead">Veuillez entrer votre code personnel depuis la page d’entrée.</p><button class="btn btn-primary" data-nav="logout" style="margin-top:18px">Retour à l’entrée</button></div></div></section>`; }
  function renderFooter(){ return `<footer class="footer"><div class="container"><div class="script">Line Nasya Bilong</div><p>${CONFIG.eventDate} · <a class="map-link map-link-light" href="${mapsUrl()}" target="_blank" rel="noopener">${CONFIG.venue}</a></p><p>Merci du fond du cœur à toutes celles et ceux qui rendront cette journée inoubliable.</p><p>Organisation : famille Bilong — ${CONFIG.parents}</p><p><a class="map-link map-link-light" href="tel:${CONFIG.contactPhone}">${CONFIG.contactPhoneDisplay}</a> · <a class="map-link map-link-light" href="mailto:${CONFIG.contactEmail}">${CONFIG.contactEmail}</a></p><p class="site-credit">Conception et développement : <a href="${CONFIG.creatorUrl}" target="_blank" rel="noopener">${CONFIG.creatorName}</a></p><p style="margin-top:8px;font-size:.8rem;opacity:.6">© 2026 Line Nasya Bilong · 1er anniversaire</p></div></footer>`; }

  function bind(){
    $('#enterBtn')?.addEventListener('click',login);
    $$('.shot[data-gallery-index], .carousel-slide[data-gallery-index]').forEach(b=>b.addEventListener('click',()=>openGallery(Number(b.dataset.galleryIndex))));
    const slides=$$('.carousel-slide');
    const dots=$$('.carousel-dot');
    let current=0;
    const showSlide=(idx)=>{ if(!slides.length)return; current=(idx+slides.length)%slides.length; slides.forEach((el,i)=>el.classList.toggle('is-active',i===current)); dots.forEach((el,i)=>el.classList.toggle('is-active',i===current)); };
    $('.carousel-prev')?.addEventListener('click',()=>showSlide(current-1));
    $('.carousel-next')?.addEventListener('click',()=>showSlide(current+1));
    dots.forEach((d,i)=>d.addEventListener('click',()=>showSlide(i)));
    $('#codeInput')?.addEventListener('keydown',e=>{if(e.key==='Enter')login();});
    $('#codeInput')?.addEventListener('input',e=>e.target.value=e.target.value.toUpperCase());
    $$('[data-nav]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.nav)));
    $('#brandBtn')?.addEventListener('click',()=>navigate('home'));
    $('#menuToggle')?.addEventListener('click',toggleMenu);
    $('#navBackdrop')?.addEventListener('click',closeMenu);
    window.addEventListener('resize',()=>{ if(window.innerWidth>960) closeMenu(); });
    if($('#rsvpForm')) bindRsvp();
    if(page==='organizer') bindOrganizer();
    $('#editResponse')?.addEventListener('click',()=>{ state.responses=state.responses.filter(r=>r.inviteId!==session.inviteId); saveState(); toast('Vous pouvez modifier votre réponse.'); render(); });
    $('#downloadICS')?.addEventListener('click',downloadICS);
  }
  function scrollToSection(id, smooth=true){
    const el=document.getElementById(id);
    if(!el)return;
    const nav=$('#navbar');
    const offset=(nav && !nav.classList.contains('hidden') ? nav.getBoundingClientRect().height : 0)+18;
    const top=Math.max(0, window.scrollY+el.getBoundingClientRect().top-offset);
    window.scrollTo({top,behavior:smooth?'smooth':'auto'});
  }

  function navigate(to){
    closeMenu();
    if(to==='logout'){clearSession(); page='gate'; render(); return;}
    if(to==='organizer'&&!isStaff()){toast('Accès réservé à l’organisation.','error');return;}
    if(['infos','gallery','programme'].includes(to) && session?.role==='guest'){
      if(page!=='home'){ page='home'; render(); }
      requestAnimationFrame(()=>scrollToSection(to,true));
      return;
    }
    if(to==='rsvp'&&session?.role==='guest'){ page='rsvp'; render(); window.scrollTo({top:0,behavior:'smooth'}); return; }
    page=to; render(); window.scrollTo({top:0,behavior:'smooth'});
  }
  function updateNav(){
    $$('#navLinks button').forEach(b=>{ const active=b.dataset.nav===page; b.classList.toggle('active',active); if(active) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); });
    $$('[data-role="staff"]').forEach(b=>b.style.display=isStaff()?'inline-flex':'none');
    $$('[data-role="guest"]').forEach(b=>b.style.display=session?.role==='guest'?'inline-flex':'none');
  }
  function toggleMenu(){ const open=!$('#navLinks').classList.contains('open'); $('#navLinks').classList.toggle('open',open); $('#navBackdrop').classList.toggle('hidden',!open); $('#menuToggle').setAttribute('aria-expanded',String(open)); document.body.style.overflow=open?'hidden':''; }
  function closeMenu(){ $('#navLinks')?.classList.remove('open'); $('#navBackdrop')?.classList.add('hidden'); $('#menuToggle')?.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
  function login(){ const code=normalize($('#codeInput').value); if(!code){toast('Entre ton code personnel.','error');return;} if(code===normalize(CONFIG.organizerCode)||code===normalize(CONFIG.organizerHuman)){writeSession({role:'organizer',code}); page='organizer'; render(); toast('Bienvenue dans l’espace organisateur.');return;} if(code===normalize(CONFIG.adminCode)){writeSession({role:'admin',code}); page='organizer'; render(); toast('Bienvenue admin.');return;} const inv=state.invites.find(i=>normalize(i.code)===code); if(inv){writeSession({role:'guest',inviteId:inv.id,code:inv.code}); page='home'; render(); setTimeout(()=>showGuestWelcome(inv),180); return;} $('#codeInput').classList.add('shake'); setTimeout(()=>$('#codeInput')?.classList.remove('shake'),420); toast('Code incorrect.','error'); }

  function showGuestWelcome(inv){
    const starName=esc(inv.mainName||inv.family||'Invité de Line');
    modal(`<div class="star-welcome" role="dialog" aria-modal="true" aria-labelledby="starWelcomeTitle">
      <div class="star-sparkles" aria-hidden="true">✦ ✨ ★ ✨ ✦</div>
      <span class="star-kicker">Votre invitation personnelle</span>
      <h2 id="starWelcomeTitle">Bienvenue<br><strong>${starName}</strong></h2>
      <p>Vous êtes notre invité(e) d’honneur pour célébrer le premier anniversaire de Line Nasya.</p>
      <div class="star-symbol" aria-hidden="true">★</div>
      <button class="btn btn-primary" id="enterGuestWorld">Découvrir mon invitation</button>
    </div>`);
    $('#enterGuestWorld')?.addEventListener('click',closeModal);
  }

  function bindRsvp(){
    let presence='oui', drinks=[]; const inv=invite(); const comps=$('#companions');
    const add=(name='')=>{ comps.insertAdjacentHTML('beforeend',companionHtml(name)); refreshCompanionEvents(); };
    for(let i=0;i<inv.maxGuests;i++) add(i===0?(inv.mainName||inv.family||''):'');
    $('#addCompanion')?.addEventListener('click',()=>{
      add();
      toast('La personne supplémentaire sera soumise à la validation des organisateurs selon les places disponibles.');
    });
    $$('[data-presence]').forEach(b=>b.addEventListener('click',()=>{presence=b.dataset.presence; $$('[data-presence]').forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); $('#presentBlock').classList.toggle('hidden',presence!=='oui'); const cb=$('.btn-confirm'); if(cb)cb.textContent=presence==='oui'?'Confirmer ma présence':'Confirmer mon absence';}));
    $$('[data-drink]').forEach(b=>b.addEventListener('click',()=>{const d=b.dataset.drink; drinks=drinks.includes(d)?drinks.filter(x=>x!==d):[...drinks,d]; b.classList.toggle('selected');}));
    $('#rsvpForm').addEventListener('submit',e=>{
      e.preventDefault(); const f=e.target;
      const companions=$$('.companion').map(c=>({name:$('.comp-name',c).value.trim(),category:$('.comp-category',c).value,meal:$('.comp-meal',c).value}));
      if(presence==='oui'){
        const incomplete=companions.some(c=>!c.name||!c.category||!c.meal);
        if(incomplete){toast('Complète le nom, la catégorie et le repas de chaque personne.','error');return;}
        if(companions.length<inv.maxGuests){toast(`Ton invitation prévoit ${inv.maxGuests} personnes. Renseigne les ${inv.maxGuests} personnes pour valider.`, 'error');return;}
        if(companions.length>inv.maxGuests&&!confirm(`Les ${companions.length-inv.maxGuests} personne(s) supplémentaire(s) seront placées en attente et devront être validées par les organisateurs. Envoyer la demande ?`)) return;
      }
      state.responses=state.responses.filter(r=>r.inviteId!==inv.id);
      const savedResponse={id:uid(),inviteId:inv.id,presence,mainName:f.elements.mainName.value.trim(),contact:f.elements.contact.value.trim(),delay:f.elements.delay?.value||'',arrival:f.elements.arrival?.value||'',tableWish:f.elements.tableWish?.value.trim()||'',drinks,companions:presence==='oui'?companions:[],extraGuests:Math.max(0,companions.length-inv.maxGuests),extraStatus:companions.length>inv.maxGuests?'pending_organizer_approval':'none',allergies:f.elements.allergies?.value.trim()||'',message:f.elements.message.value.trim(),createdAt:new Date().toISOString()};
      state.responses.push(savedResponse);
      inv.status='responded'; saveState();
      sendConfirmationEmail(inv,savedResponse);
      page='rsvp'; render(); window.scrollTo({top:0,behavior:'smooth'}); toast('Confirmation enregistrée.');
    });
  }
  function refreshCompanionEvents(){
    $$('.remove-companion').forEach(b=>b.onclick=()=>{
      if($$('.companion').length<=1){toast('Garde au moins une personne.','error');return;}
      b.closest('.companion').remove();
    });
  }
  function bindOrganizer(){
    $$('[data-admin-tab]').forEach(b=>b.onclick=()=>{
      activeAdminTab=b.dataset.adminTab;
      render();
      requestAnimationFrame(()=>{ const target=$('.admin-page-head')||$('.admin-main'); if(target){ const nav=$('#navbar'); const offset=(nav?.getBoundingClientRect().height||0)+18; window.scrollTo({top:Math.max(0,window.scrollY+target.getBoundingClientRect().top-offset),behavior:'smooth'}); } });
    });

    $('#exportBackup')?.addEventListener('click',exportBackup);
    $('#importBackup')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importBackupFile(f);});
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
    bindGuestControls(true);
    if(activeAdminTab==='seating') bindSeating();
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
          if(p.category==='Bébé')s.babies++;else if(p.category==='Enfant')s.children++;else s.adults++;
          if(p.meal)s.meals[p.meal]=(s.meals[p.meal]||0)+1;
        });
      } else s.no++;
    });
    return s;
  }

  function sendConfirmationEmail(inv,r){
    const extra=Number(r.extraGuests||0);
    const subject=`[Line Nasya] ${r.presence==='oui'?'CONFIRMATION':'ABSENCE'} — ${inv.family}${extra?` (+${extra} EN ATTENTE)`:''}`;
    const people=(r.companions||[]).map((c,i)=>`${i+1}. ${c.name} — ${c.category} — ${c.meal}`).join('\n')||'Aucune';
    const payload={
      _subject:subject,
      _template:'table',
      _captcha:'false',
      Invitation:`${inv.family} — code ${inv.code}`,
      Présence:r.presence==='oui'?'Oui':'Non',
      Contact:r.contact||'Non communiqué',
      Personnes:people,
      'Personnes supplémentaires':extra?`${extra} — À VALIDER par les organisateurs`:'Aucune',
      Arrivée:r.arrival||'Non précisée',
      Retard:labelDelay(r.delay),
      Boissons:(r.drinks||[]).join(', ')||'Non précisées',
      Allergies:r.allergies||'Aucune signalée',
      Placement:r.tableWish||'Aucune remarque',
      Message:r.message||'Aucun message'
    };
    fetch(CONFIG.formSubmitEndpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(payload)}).catch(()=>{});
  }

  function imageExists(src){
    return new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(true);img.onerror=()=>resolve(false);img.src=src;});
  }
  async function discoverGalleryPhotos(){
    const known=new Set(CONFIG.galleryPhotos.map(x=>x[0]));
    const candidates=Array.from({length:24},(_,i)=>`photo${i+1}.jpg`).filter(f=>!known.has(f));
    const checks=await Promise.all(candidates.map(async f=>[f,await imageExists(`assets/img/gallery/${f}`)]));
    checks.filter(([,ok])=>ok).forEach(([f])=>CONFIG.galleryPhotos.push([f,`Souvenir de Line ${CONFIG.galleryPhotos.length+1}`]));
  }
  async function init(){
    await discoverGalleryPhotos();
    render();
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
      if(isCodes)return `<tr><td data-label="Famille"><b>${esc(i.family)}</b><br><span style="color:var(--muted)">${esc(i.mainName||'')}</span></td><td data-label="Mot de passe"><b>${esc(i.code)}</b></td><td data-label="Contact">${esc(i.phone||i.email||'—')}</td><td data-label="Places">${i.maxGuests}</td><td data-label="Présence">${st}</td><td data-label="" class="row-actions"><button class="small-btn" data-edit-invite="${i.id}">Modifier</button> <button class="small-btn" data-copy-invite="${i.id}">Message</button> <button class="small-btn" data-del-invite="${i.id}">Suppr.</button></td></tr>`;
      return `<tr><td data-label="Invité"><b>${esc(i.family)}</b><br><span style="color:var(--muted)">${session?.role==='admin'?`Code : ${esc(i.code)}`:esc(i.mainName||'')}</span></td><td data-label="Présence">${st}</td><td data-label="Personnes">${r?.companions?.length||0}/${i.maxGuests}</td><td data-label="Arrivée">${r?.arrival||'—'}</td><td data-label="Repas">${r&&r.presence==='oui'?(r.companions.map(c=>c.meal).filter(Boolean).join(', ')||'—'):'—'}</td></tr>`;
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
  function mapsUrl(){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent('Parochiezaal Ter Krokegem Dendermondsesteenweg 44 B-1730 Asse');}
  function whatsApp(phone,msg){const p=String(phone||'').replace(/[^0-9]/g,'');return p?`https://wa.me/${p}?text=${encodeURIComponent(msg)}`:`https://wa.me/?text=${encodeURIComponent(msg)}`;}
  function inviteMessage(i){return `Bonjour ${i.mainName||i.family},\n\nVous êtes cordialement invité au premier anniversaire de Line Nasya Bilong.\n\nDate : ${CONFIG.eventDate}\nLieu : ${CONFIG.venue}\nAdresse : ${CONFIG.address}\n\nVotre code d’accès personnel : *${i.code}*\n\nMerci de confirmer votre présence via le site.\n\nLa famille Bilong 🎀`;}
  function buildConfirmMessage(inv,r){return `Bonjour ${inv.mainName||inv.family},\n\nMerci pour votre réponse au 1er anniversaire de Line Nasya Bilong.\nPrésence : ${r.presence==='oui'?'confirmée':'absence notée'}\nPersonnes : ${r.companions.length}\nDate : ${CONFIG.eventDate}\nLieu : ${CONFIG.venue}\n\n${CONFIG.parents}`;}
  function exportCSV(name,heads,rows){const csv=[heads,...rows].map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(';')).join('\n');const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();URL.revokeObjectURL(a.href);toast('Export téléchargé.');}
  function printCodes(){const w=window.open('','_blank');w.document.write(`<html><head><title>Codes Line Nasya</title><style>body{font-family:Arial;padding:30px}h1{color:#553633}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.card{border:1px solid #ddd;border-radius:14px;padding:14px}.code{font-size:24px;font-weight:bold;color:#553633}</style></head><body><h1>Codes invités · Line Nasya</h1><div class="grid">${state.invites.map(i=>`<div class="card"><b>${esc(i.family)}</b><div class="code">${esc(i.code)}</div><p>${i.maxGuests} place(s)</p></div>`).join('')}</div></body></html>`);w.document.close();w.print();}
  function downloadICS(){const ics=`BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nUID:line-nasya-2026@example.com\nDTSTART:20260815T150000\nDTEND:20260816T030000\nSUMMARY:${CONFIG.eventName}\nLOCATION:${CONFIG.venue}, ${CONFIG.address}\nDESCRIPTION:Anniversaire de Line Nasya Bilong\nEND:VEVENT\nEND:VCALENDAR`;const blob=new Blob([ics],{type:'text/calendar'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='anniversaire-line-nasya.ics';a.click();URL.revokeObjectURL(a.href);}

  init();
})();

// Responsive usability controls
(()=>{const b=document.getElementById('backToTop');if(!b)return;const sync=()=>b.classList.toggle('show',window.scrollY>550);window.addEventListener('scroll',sync,{passive:true});b.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));sync();})();
