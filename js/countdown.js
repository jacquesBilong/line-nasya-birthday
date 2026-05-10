let countdownInterval = null;

function startCountdown(){

  if(countdownInterval){

    clearInterval(countdownInterval);

  }

  countdownInterval = setInterval(()=>{

    updateCountdown();

  },1000);

  updateCountdown();

}

function updateCountdown(){

  const target =
    new Date("2026-08-15T10:00:00");

  const diff =
    target - Date.now();

  const d =
    Math.floor(diff / 86400000);

  const h =
    Math.floor((diff % 86400000) / 3600000);

  const m =
    Math.floor((diff % 3600000) / 60000);

  const s =
    Math.floor((diff % 60000) / 1000);

  const values = [d,h,m,s];

  document
    .querySelectorAll(".cd-number")
    .forEach((el,index)=>{

      el.textContent =
        String(values[index])
          .padStart(2,"0");

    });

}