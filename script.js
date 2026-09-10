const grid = document.querySelector("#machine-grid");
const dialog = document.querySelector("#machine-dialog");
const dialogContent = document.querySelector("#dialog-content");
const closeDialog = document.querySelector("#close-dialog");

const formatPhone = "+94 76 697 5261";

function whatsappHref(machine) {
  const text = encodeURIComponent(`Hi, I am interested in the ${machine.model_to_show}. Is it available for inspection in Vavuniya?`);
  return `https://wa.me/94766975261?text=${text}`;
}

function card(machine) {
  const article = document.createElement("article");
  article.className = "machine-card";
  article.id = machine.id;

  const visibleMedia = machine.media.slice(0, 8);
  const remaining = Math.max(machine.media.length - visibleMedia.length, 0);
  const thumbs = visibleMedia
    .map((item, index) => `
      <button type="button" data-machine="${machine.id}" data-index="${index}" aria-label="Open ${machine.model_to_show} media ${index + 1}">
        ${mediaThumb(item, machine, index)}
        ${index === visibleMedia.length - 1 && remaining > 0 ? `<span class="thumb-more">+${remaining}</span>` : ""}
      </button>
    `)
    .join("");

  article.innerHTML = `
    ${heroMedia(machine)}
    <div class="machine-body">
      <div class="machine-title-row">
        <div>
          <h2>${machine.display_name}</h2>
          <p class="model">${machine.model_to_show}</p>
        </div>
        <div class="price">${machine.price}</div>
      </div>
      <div class="specs" aria-label="${machine.model_to_show} specifications">
        <div class="spec"><small>Year</small><strong>${machine.year}</strong></div>
        <div class="spec"><small>Hours</small><strong>${machine.hours}</strong></div>
        <div class="spec"><small>Location</small><strong>Vavuniya</strong></div>
      </div>
      <div class="thumbs">${thumbs}</div>
      <div class="card-actions">
        <a href="tel:+94766975261">Call</a>
        <a class="primary" href="${whatsappHref(machine)}">WhatsApp</a>
      </div>
      <p class="note">Inspection available in Vavuniya. Ask for ${machine.model_to_show} when calling.</p>
    </div>
  `;

  return article;
}

function isVideo(item) {
  return item.type === "video";
}

function heroMedia(machine) {
  const hero = machine.hero_media || machine.media[0];
  if (isVideo(hero)) {
    return `<video class="hero-img" src="${hero.src}" muted playsinline controls preload="metadata"></video>`;
  }
  return `<img class="hero-img" src="${hero.src}" alt="${machine.model_to_show}">`;
}

function mediaThumb(item, machine, index) {
  if (isVideo(item)) {
    return `<video src="${item.src}" muted playsinline preload="metadata" aria-label="${machine.model_to_show} video ${index + 1}"></video>`;
  }
  return `<img src="${item.src}" alt="${machine.model_to_show} view ${index + 1}" loading="lazy">`;
}

function showMedia(machine, item) {
  const mediaMarkup = isVideo(item)
    ? `<video class="dialog-media" src="${item.src}" controls playsinline autoplay></video>`
    : `<img class="dialog-media" src="${item.src}" alt="${machine.model_to_show}">`;
  dialogContent.innerHTML = `
    ${mediaMarkup}
    <div class="dialog-body">
      <h2>${machine.model_to_show}</h2>
      <p class="model">${machine.year} | ${machine.hours} | ${machine.price} | Vavuniya</p>
      <div class="card-actions">
        <a href="tel:+94766975261">Call ${formatPhone}</a>
        <a class="primary" href="${whatsappHref(machine)}">WhatsApp</a>
      </div>
    </div>
  `;
  dialog.showModal();
}

const data = window.MONORAYS_DATA;
const byId = new Map(data.machines.map((machine) => [machine.id, machine]));

data.machines.forEach((machine) => grid.appendChild(card(machine)));

grid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (!button) return;
  const machine = byId.get(button.dataset.machine);
  const item = machine.media[Number(button.dataset.index)];
  showMedia(machine, item);
});

closeDialog.addEventListener("click", () => dialog.close());
