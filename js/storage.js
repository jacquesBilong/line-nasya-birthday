const STORAGE_KEY =
  "line_nasya_premium";

function loadState(){

  const saved =
    localStorage.getItem(STORAGE_KEY);

  if(saved){

    return JSON.parse(saved);

  }

  return {

    invites:[
      {
        id:1,
        code:"LINE1",
        family:"Famille Tom",
        maxGuests:4
      }
    ],

    responses:[]

  };

}

function saveState(){

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

}