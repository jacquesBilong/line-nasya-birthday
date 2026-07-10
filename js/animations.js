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
})();
