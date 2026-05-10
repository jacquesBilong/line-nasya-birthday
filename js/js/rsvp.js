function renderRSVP(){

  return `
    <section class="section">

      <div class="container">

        <div class="card">

          <h2
            style="
              margin-bottom:20px;
              font-size:2rem;
              color:#5D3A36;
            "
          >
            RSVP Premium
          </h2>

          <form id="rsvpForm">

            <input
              type="text"
              placeholder="Votre prénom"
              class="input-field"
              required
            >

            <br><br>

            <input
              type="email"
              placeholder="Votre email"
              class="input-field"
            >

            <br><br>

            <button
              class="btn-primary"
              type="submit"
            >
              Confirmer présence
            </button>

          </form>

        </div>

      </div>

    </section>
  `;
}