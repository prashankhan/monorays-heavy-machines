const grid = document.querySelector("#machine-grid");
const compare = document.querySelector("#machine-compare");
const filters = document.querySelector("#brand-filters");
const gridLabel = document.querySelector("#grid-label");
const dialog = document.querySelector("#machine-dialog");
const dialogMedia = document.querySelector("#dialog-media");
const dialogCount = document.querySelector("#dialog-count");
const closeDialog = document.querySelector("#close-dialog");
const prevMedia = document.querySelector("#prev-media");
const nextMedia = document.querySelector("#next-media");
const THUMB_LIMIT = 4;

const CLASS_LABEL = {
  "cat-308e2cr": "8-ton class",
  "komatsu-pc78uu": "8-ton class",
  "cat-030esr": "3-ton class",
  "komatsu-pc35mr-3": "3.5-ton class",
  "kobelco-sr30-sk30sr": "3-ton class",
  "komatsu-pc20uu-30": "2-ton class",
};

const FILTERS = [
  { id: "all", label: "All 6" },
  { id: "cat", label: "CAT" },
  { id: "komatsu", label: "Komatsu" },
  { id: "kobelco", label: "Kobelco" },
];

let activeMachine = null;
let activeIndex = 0;
let activeFilter = "all";

function whatsappHref(machine) {
  const text = encodeURIComponent(`Hi, I am interested in the ${machine.model_to_show}. Is it available for inspection in Vavuniya?`);
  return `https://wa.me/94766975261?text=${text}`;
}

function isVideo(item) {
  return item.type === "video";
}

function machineBrand(machine) {
  if (machine.id.startsWith("cat-")) return "CAT";
  if (machine.id.startsWith("komatsu-")) return "Komatsu";
  return "Kobelco";
}

function brandSlug(machine) {
  return machineBrand(machine).toLowerCase();
}

function classLabel(machine) {
  return CLASS_LABEL[machine.id] || "";
}

function mediaCounts(machine) {
  const videos = machine.media.filter(isVideo).length;
  const photos = machine.media.length - videos;
  return { photos, videos, total: machine.media.length };
}

function heroItem(machine) {
  return machine.hero_media || machine.media[0];
}

function heroIndex(machine) {
  const hero = heroItem(machine);
  const index = machine.media.findIndex((item) => item.src === hero.src);
  return index >= 0 ? index : 0;
}

function thumbEntries(machine) {
  const hero = heroItem(machine);
  return machine.media
    .map((item, index) => ({ item, index }))
    .filter((entry) => entry.item.src !== hero.src);
}

function isSold(machine) {
  return Boolean(machine.sold);
}

function card(machine) {
  const article = document.createElement("article");
  const brand = brandSlug(machine);
  const sold = isSold(machine);
  article.className = `machine-card brand-${brand}${sold ? " is-sold" : ""}`;
  article.id = machine.id;
  article.dataset.brand = brand;

  const counts = mediaCounts(machine);
  const thumbsSource = thumbEntries(machine);
  const visible = thumbsSource.slice(0, THUMB_LIMIT);
  const remaining = Math.max(thumbsSource.length - visible.length, 0);
  const thumbs = visible
    .map((entry, visibleIndex) => `
      <button type="button" data-machine="${machine.id}" data-index="${entry.index}" aria-label="Open ${machine.model_to_show} media ${visibleIndex + 1}">
        ${mediaThumb(entry.item, machine, visibleIndex)}
        ${visibleIndex === visible.length - 1 && remaining > 0 ? `<span class="thumb-more">+${remaining}</span>` : ""}
      </button>
    `)
    .join("");

  article.innerHTML = `
    ${heroMedia(machine, counts)}
    <div class="machine-body">
      <p class="machine-kicker">
        <span class="brand-chip ${brand}">${machineBrand(machine)}</span>
        <span>${classLabel(machine)}</span>
      </p>
      <div class="machine-title-row">
        <h2>${machine.model_to_show}</h2>
        <div class="price-block">
          <p class="price">${machine.price}</p>
          <span class="price-note">${sold ? "Sold" : "Negotiable"}</span>
        </div>
      </div>
      <div class="specs" aria-label="${machine.model_to_show} specifications">
        <div class="spec"><small>Year</small><strong>${machine.year}</strong></div>
        <div class="spec spec-hours"><small>Hours</small><strong>${machine.hours}</strong></div>
      </div>
      <div class="thumbs">${thumbs}</div>
      <button type="button" class="see-all" data-machine="${machine.id}" data-index="${heroIndex(machine)}">
        View all ${counts.total} photos${counts.videos ? ` · ${counts.videos} video${counts.videos === 1 ? "" : "s"}` : ""}
      </button>
      <div class="card-actions">
        <a href="tel:+94766975261">Call</a>
        <a class="primary" href="${whatsappHref(machine)}">WhatsApp</a>
      </div>
      <p class="note">${sold ? "This machine is sold." : `Ask for <strong>${machine.model_to_show}</strong> when you call.`}</p>
    </div>
  `;

  return article;
}

function heroMedia(machine, counts) {
  const hero = heroItem(machine);
  const sold = isSold(machine);
  const media = isVideo(hero)
    ? `<video class="hero-img" src="${hero.src}" muted playsinline preload="metadata"></video>`
    : `<img class="hero-img" src="${hero.src}" alt="${machine.model_to_show}">`;
  return `
    <button type="button" class="hero-btn" data-machine="${machine.id}" data-index="${heroIndex(machine)}" aria-label="Open ${machine.model_to_show} photos">
      ${media}
      ${sold ? `<span class="sold-stamp">Sold</span>` : ""}
      <span class="hero-overlay">
        <span class="hero-count">${counts.total} photos</span>
      </span>
    </button>
  `;
}

function mediaThumb(item, machine, index) {
  if (isVideo(item)) {
    return `<span class="video-thumb"><video src="${item.src}" muted playsinline preload="metadata" aria-label="${machine.model_to_show} video ${index + 1}"></video></span>`;
  }
  return `<img src="${item.src}" alt="${machine.model_to_show} view ${index + 1}" loading="lazy">`;
}

function showMedia(machine, index) {
  activeMachine = machine;
  activeIndex = (index + machine.media.length) % machine.media.length;
  const item = machine.media[activeIndex];
  const mediaMarkup = isVideo(item)
    ? `<video class="dialog-media" src="${item.src}" controls playsinline autoplay></video>`
    : `<img class="dialog-media" src="${item.src}" alt="${machine.model_to_show}">`;
  dialogMedia.innerHTML = mediaMarkup;
  dialogCount.textContent = `${activeIndex + 1} / ${machine.media.length}`;
  if (!dialog.open) dialog.showModal();
}

function stepMedia(delta) {
  if (!activeMachine) return;
  showMedia(activeMachine, activeIndex + delta);
}

function renderCompare(machines) {
  compare.innerHTML = `
    <div class="compare-head" aria-hidden="true">
      <span>Brand</span>
      <span>Machine</span>
      <span>Specs</span>
      <span class="idx-price-label">Price</span>
    </div>
    ${machines.map((machine) => `
      <a class="compare-row brand-${brandSlug(machine)}${isSold(machine) ? " is-sold" : ""}" href="#${machine.id}">
        <span class="brand-chip ${brandSlug(machine)}">${machineBrand(machine)}</span>
        <span class="idx-model">${machine.model_to_show}</span>
        <span class="idx-meta">${classLabel(machine).replace(" class", "")} · ${machine.year} · ${machine.hours}</span>
        <span class="idx-price-wrap">
          <strong class="idx-price">${machine.price}</strong>
          ${isSold(machine) ? `<span class="sold-flag">Sold</span>` : ""}
        </span>
      </a>
    `).join("")}
  `;
}

function renderFilters() {
  filters.innerHTML = FILTERS.map((item) => `
    <button type="button" class="filter${item.id === activeFilter ? " is-on" : ""}" data-filter="${item.id}" aria-pressed="${item.id === activeFilter}">
      ${item.label}
    </button>
  `).join("");
}

function applyFilter() {
  const cards = [...grid.querySelectorAll(".machine-card")];
  const rows = [...compare.querySelectorAll(".compare-row")];
  let visible = 0;
  cards.forEach((cardEl) => {
    const isVisible = activeFilter === "all" || cardEl.dataset.brand === activeFilter;
    cardEl.hidden = !isVisible;
    if (isVisible) visible += 1;
  });
  rows.forEach((row) => {
    const brand = [...row.classList].find((name) => name.startsWith("brand-"))?.replace("brand-", "");
    row.hidden = !(activeFilter === "all" || brand === activeFilter);
  });
  gridLabel.textContent = activeFilter === "all"
    ? `All ${visible} machines`
    : `${visible} ${FILTERS.find((item) => item.id === activeFilter).label} machine${visible === 1 ? "" : "s"}`;
  renderFilters();
}

const data = window.MONORAYS_DATA;
const byId = new Map(data.machines.map((machine) => [machine.id, machine]));

renderCompare(data.machines);
renderFilters();
data.machines.forEach((machine) => grid.appendChild(card(machine)));

grid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-index]");
  if (!button) return;
  const machine = byId.get(button.dataset.machine);
  showMedia(machine, Number(button.dataset.index));
});

filters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  applyFilter();
});

compare.addEventListener("click", (event) => {
  const row = event.target.closest("a.compare-row");
  if (!row) return;
  const id = row.getAttribute("href").slice(1);
  const cardEl = document.getElementById(id);
  if (!cardEl || cardEl.hidden) {
    activeFilter = "all";
    applyFilter();
  }
});

closeDialog.addEventListener("click", () => dialog.close());
prevMedia.addEventListener("click", () => stepMedia(-1));
nextMedia.addEventListener("click", () => stepMedia(1));

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

dialog.addEventListener("close", () => {
  activeMachine = null;
  dialogMedia.innerHTML = "";
  dialogCount.textContent = "";
});

document.addEventListener("keydown", (event) => {
  if (!dialog.open) return;
  if (event.key === "ArrowLeft") stepMedia(-1);
  if (event.key === "ArrowRight") stepMedia(1);
});

let swipeX = 0;
let swipeY = 0;

dialog.addEventListener("touchstart", (event) => {
  const touch = event.changedTouches[0];
  swipeX = touch.clientX;
  swipeY = touch.clientY;
}, { passive: true });

dialog.addEventListener("touchend", (event) => {
  if (!dialog.open || !activeMachine) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - swipeX;
  const dy = touch.clientY - swipeY;
  if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
  stepMedia(dx < 0 ? 1 : -1);
}, { passive: true });
