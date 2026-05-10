let state = loadState();

const app = document.getElementById("app");

function render(page = "home") {

  switch(page){

    case "home":
      app.innerHTML = renderHome();
      startCountdown();
      break;

    case "rsvp":
      app.innerHTML = renderRSVP();
      break;

    case "admin":
      app.innerHTML = renderAdmin();
      break;

    default:
      app.innerHTML = renderHome();
      startCountdown();
  }

  bindDynamicEvents();
}

function renderHome(){

  return `
    <section class="hero">

      <div class="hero-content">


        <h1>Line Nasya</h1>

        <p>
          Une journée magique pleine d’amour,
          d’élégance et de douceur.
        </p>

        <div class="countdown">

          <div class="cd-box">
            <strong class="cd-number">00</strong>
            <span>jours</span>
          </div>

          <div class="cd-box">
            <strong class="cd-number">00</strong>
            <span>heures</span>
          </div>

          <div class="cd-box">
            <strong class="cd-number">00</strong>
            <span>minutes</span>
          </div>

          <div class="cd-box">
            <strong class="cd-number">00</strong>
            <span>secondes</span>
          </div>

        </div>

        <div class="hero-actions">

          <button
            class="btn-primary"
            id="openRsvp"
          >
            🎀 Confirmer présence
          </button>

          <button
            class="btn-secondary"
          >
            🎪 Voir programme
          </button>

        </div>

      </div>

    </section>
  `;
}

function bindDynamicEvents(){

  document
    .getElementById("openRsvp")
    ?.addEventListener("click",()=>{

      render("rsvp");

    });

}

function init(){

  render("home");

  bindGlobalEvents();

  showLoader();

}

init();