function toggleMenu(){

  document
    .getElementById("navLinks")
    .classList.toggle("open");

}

function showLoader(){

  setTimeout(()=>{

    const loader =
      document.getElementById("loader");

    if(loader){

      loader.style.opacity = "0";

      setTimeout(()=>{

        loader.remove();

      },500);

    }

  },1200);

}

function bindGlobalEvents(){

  document
    .getElementById("menuToggle")
    ?.addEventListener("click",toggleMenu);

  document
    .querySelectorAll("[data-page]")
    .forEach(btn=>{

      btn.addEventListener("click",()=>{

        render(btn.dataset.page);

      });

    });

}