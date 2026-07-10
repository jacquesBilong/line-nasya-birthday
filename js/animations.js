/* Line Nasya — animations.js · apparition douce des sections au défilement */
(function(){
  'use strict';
  window.__initReveal = function(){
    const els = document.querySelectorAll('.reveal:not(.in)');
    if(!els.length) return;
    if(!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      els.forEach(el=>el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
    els.forEach(el=>io.observe(el));
  };

  /* Bouton « remonter en haut » */
  document.addEventListener('DOMContentLoaded', function(){
    const btn = document.getElementById('toTop');
    if(!btn) return;
    const onScroll = ()=>btn.classList.toggle('show', window.scrollY > 500);
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
    btn.addEventListener('click', ()=>window.scrollTo({top:0, behavior:'smooth'}));
  });
})();
