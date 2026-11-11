// Checkpoint 1 – Vanilla JavaScript: hantera glosor i en array.
// Varje glosa är ett objekt med ett unikt id och två ord.
const exempelglosor = [
  { id: 1, spanska: "Hola", svenska: "Hej" },
  { id: 2, spanska: "Gracias", svenska: "Tack" },
  { id: 3, spanska: "Mariposa", svenska: "Fjäril" },
  { id: 4, spanska: "Aprender", svenska: "Att lära sig" },
  { id: 5, spanska: "Siempre", svenska: "Alltid" }
];

// Hämta tidigare sparade glosor om det finns några.
let glosor;
try {
  const sparat = JSON.parse(localStorage.getItem("minaSpanskaGlosor"));
  glosor = Array.isArray(sparat) ? sparat : exempelglosor.map(glosa => ({ ...glosa }));
} catch (fel) {
  glosor = exempelglosor.map(glosa => ({ ...glosa }));
}

const formular = document.querySelector("#glosformular");
const spanskaFalt = document.querySelector("#spanska");
const svenskaFalt = document.querySelector("#svenska");
const lista = document.querySelector("#gloslista");
const antal = document.querySelector("#antal");
const sokFalt = document.querySelector("#sok");
const tomLista = document.querySelector("#tom-lista");
const sparaKnapp = document.querySelector("#spara-knapp");
const avbrytKnapp = document.querySelector("#avbryt-knapp");
const meddelande = document.querySelector("#meddelande");

let redigerarId = null;
let nastaId = Math.max(0, ...glosor.map(glosa => Number(glosa.id) || 0)) + 1;

// Spara arrayen i webbläsaren. Appen fungerar även om lagring blockeras.
function sparaGlosor() {
  try {
    localStorage.setItem("minaSpanskaGlosor", JSON.stringify(glosor));
  } catch (fel) {
    meddelande.textContent = "Ändringen visas, men kunde inte sparas i webbläsaren.";
  }
}

// Skapa en knapp för en viss glosa.
function skapaKnapp(text, klass, id) {
  const knapp = document.createElement("button");
  knapp.type = "button";
  knapp.textContent = text;
  knapp.className = klass;
  knapp.dataset.id = id;
  return knapp;
}

// Visa alltid arrayens aktuella innehåll i HTML.
function visaGlosor() {
  lista.replaceChildren();
  antal.textContent = glosor.length;

  const sokning = sokFalt.value.trim().toLocaleLowerCase("sv");
  const filtrerade = glosor.filter(glosa =>
    glosa.spanska.toLocaleLowerCase("sv").includes(sokning) ||
    glosa.svenska.toLocaleLowerCase("sv").includes(sokning)
  );

  tomLista.classList.toggle("dold", filtrerade.length > 0);
  tomLista.textContent = glosor.length === 0
    ? "Inga glosor ännu. Lägg till din första glosa ovan!"
    : "Inga glosor matchar din sökning.";

  filtrerade.forEach(glosa => {
    const rad = document.createElement("li");
    rad.className = "glosrad";

    const spansktOrd = document.createElement("span");
    spansktOrd.className = "spanskt-ord";
    spansktOrd.textContent = glosa.spanska;

    const svensktOrd = document.createElement("span");
    svensktOrd.className = "svenskt-ord";
    svensktOrd.textContent = glosa.svenska;

    const knappar = document.createElement("div");
    knappar.className = "radknappar";
    knappar.append(
      skapaKnapp("Redigera", "redigera", glosa.id),
      skapaKnapp("Ta bort", "ta-bort", glosa.id)
    );

    rad.append(spansktOrd, svensktOrd, knappar);
    lista.append(rad);
  });
}

// Återställ formuläret efter att en glosa sparats eller redigering avbrutits.
function aterstallFormular() {
  formular.reset();
  redigerarId = null;
  sparaKnapp.innerHTML = 'Lägg till glosa <span aria-hidden="true">＋</span>';
  avbrytKnapp.classList.add("dold");
  document.querySelector("#formular-rubrik").innerHTML = "Ett nytt <em>ord?</em>";
}

// Lägg till en ny glosa eller uppdatera en befintlig.
formular.addEventListener("submit", function (handelse) {
  handelse.preventDefault();
  const spanska = spanskaFalt.value.trim();
  const svenska = svenskaFalt.value.trim();
  if (!spanska || !svenska) {
    meddelande.textContent = "Fyll i både det spanska och det svenska ordet.";
    return;
  }

  if (redigerarId === null) {
    glosor.push({ id: nastaId++, spanska, svenska });
    meddelande.textContent = "Glosan har lagts till!";
  } else {
    const glosa = glosor.find(post => post.id === redigerarId);
    if (glosa) {
      glosa.spanska = spanska;
      glosa.svenska = svenska;
      meddelande.textContent = "Glosan har uppdaterats!";
    }
  }
  sparaGlosor();
  aterstallFormular();
  visaGlosor();
  spanskaFalt.focus();
});

// Hantera knapparna Redigera och Ta bort i listan.
lista.addEventListener("click", function (handelse) {
  const knapp = handelse.target.closest("button[data-id]");
  if (!knapp) return;
  const id = Number(knapp.dataset.id);
  const glosa = glosor.find(post => post.id === id);
  if (!glosa) return;

  if (knapp.classList.contains("redigera")) {
    redigerarId = id;
    spanskaFalt.value = glosa.spanska;
    svenskaFalt.value = glosa.svenska;
    sparaKnapp.textContent = "Spara ändringar";
    avbrytKnapp.classList.remove("dold");
    document.querySelector("#formular-rubrik").textContent = "Redigera glosa";
    meddelande.textContent = "";
    spanskaFalt.focus();
    spanskaFalt.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (knapp.classList.contains("ta-bort")) {
    glosor = glosor.filter(post => post.id !== id);
    if (redigerarId === id) aterstallFormular();
    meddelande.textContent = "Glosan har tagits bort.";
    sparaGlosor();
    visaGlosor();
  }
});

avbrytKnapp.addEventListener("click", function () {
  aterstallFormular();
  meddelande.textContent = "Redigeringen avbröts.";
});

// Sökningen filtrerar bara visningen och ändrar inte själva arrayen.
sokFalt.addEventListener("input", visaGlosor);

// Visa glosorna direkt när sidan öppnas.
visaGlosor();
