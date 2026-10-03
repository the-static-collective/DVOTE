let campaign;
let catalog = { campaigns: [] };
let encounter;
let dayNumber = 1;
let selectedDoor = null;

const $ = id => document.getElementById(id);

function campaignSlug() {
  const requested = new URLSearchParams(location.search).get("campaign") || "paula-42-hope-restoration";
  return /^[a-z0-9-]+$/.test(requested) ? requested : "paula-42-hope-restoration";
}

async function loadCampaign() {
  const slug = campaignSlug();
  const response = await fetch("campaigns/" + slug + "/campaign.json");
  if (!response.ok) throw new Error("Campaign not found: " + slug);
  const data = await response.json();

  if (
    data.schema !== "dvote.campaign.v1" ||
    !data.id ||
    !Array.isArray(data.encounters) ||
    !data.encounters.length
  ) {
    throw new Error("Invalid DVOTE campaign");
  }

  return data;
}

async function loadCatalog() {
  try {
    const response = await fetch("campaigns/catalog.json");
    if (!response.ok) return { campaigns: [] };
    const data = await response.json();
    return Array.isArray(data.campaigns) ? data : { campaigns: [] };
  } catch {
    return { campaigns: [] };
  }
}

function key(name) {
  return "dvote." + campaign.id + "." + name;
}

const store = {
  get receipts() {
    return JSON.parse(localStorage.getItem(key("receipts")) || "[]");
  },
  set receipts(value) {
    localStorage.setItem(key("receipts"), JSON.stringify(value));
  },
  get enteredAt() {
    return localStorage.getItem(key("enteredAt")) || localStorage.getItem(key("startedAt")) || "";
  },
  enter() {
    if (!this.enteredAt) {
      localStorage.setItem(key("enteredAt"), new Date().toISOString());
    }
    return this.enteredAt;
  },
  getWeather(day) {
    return localStorage.getItem(key("weather." + day)) || "";
  },
  setWeather(day, value) {
    localStorage.setItem(key("weather." + day), value);
  }
};

function localDayStamp(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
}

function campaignDay() {
  if (!store.enteredAt) return 1;
  const start = new Date(store.enteredAt);
  const now = new Date();
  return Math.max(1, Math.floor(localDayStamp(now) - localDayStamp(start)) + 1);
}

function encounterForDay(day) {
  const after = campaign.progression?.after || "hold";
  if (after === "cycle") {
    return campaign.encounters[(day - 1) % campaign.encounters.length];
  }
  return campaign.encounters[Math.min(day - 1, campaign.encounters.length - 1)];
}

function currentCatalogEntry() {
  return catalog.campaigns.find(item => item.id === campaign.id) || {};
}

function renderThreshold() {
  const meta = currentCatalogEntry();
  $("threshold-title").textContent = campaign.title;
  $("threshold-subtitle").textContent = campaign.subtitle || meta.subtitle || "";
  $("threshold-author").textContent = campaign.author ? "by " + campaign.author : "";
  $("cover-sigil").textContent = meta.mark || String(campaign.encounters.length);
  $("threshold").classList.remove("hidden");
  document.body.classList.add("threshold-open");
}

function hideThreshold() {
  $("threshold").classList.add("hidden");
  document.body.classList.remove("threshold-open");
}

function renderEncounter() {
  $("daymark").textContent = "DAY " + String(dayNumber).padStart(3, "0");
  $("campaign-label").textContent = [campaign.title, campaign.author].filter(Boolean).join(" · ");
  $("encounter-title").textContent = encounter.title;
  $("encounter-text").textContent = encounter.text;
  $("carry-text").textContent = encounter.carry || "";

  const scriptures = Array.isArray(encounter.scriptures) ? encounter.scriptures : [];
  $("scripture-block").classList.toggle("hidden", scriptures.length === 0);
  $("scripture-list").innerHTML = scriptures
    .map(ref => '<span class="scripture-ref">' + escapeHtml(ref) + "</span>")
    .join("");

  const todayWeather = store.getWeather(dayNumber);
  document.querySelectorAll("[data-weather]").forEach(button => {
    button.classList.toggle("selected", button.dataset.weather === todayWeather);
  });

  renderDoors();
}

function renderDoors() {
  $("door-list").innerHTML = "";
  encounter.doors.forEach((door, index) => {
    const button = document.createElement("button");
    button.className = "door";
    button.innerHTML =
      '<span class="door-index">' + String(index + 1).padStart(2, "0") + "</span>" +
      "<span><strong>" + escapeHtml(door.title) + "</strong><span>" + escapeHtml(door.prompt) + "</span></span>";
    button.addEventListener("click", () => chooseDoor(index));
    $("door-list").appendChild(button);
  });
}

function chooseDoor(index) {
  if (!store.enteredAt) {
    renderThreshold();
    return;
  }

  selectedDoor = index;
  const door = encounter.doors[index];
  $("crossing-title").textContent = door.title;
  $("crossing-text").textContent = door.prompt;
  $("crossing").classList.remove("hidden");
  $("witness").classList.add("hidden");
  $("receipt").classList.add("hidden");
  $("crossing").scrollIntoView({ behavior: "smooth", block: "center" });
}

function switchCampaign(id) {
  const url = new URL(location.href);
  url.searchParams.set("campaign", id);
  location.href = url.toString();
}

function renderLibrary() {
  if (!catalog.campaigns.length) {
    $("campaign-shelf").innerHTML = '<p class="muted">The shelf is unavailable offline until it has been opened once.</p>';
    return;
  }

  $("campaign-shelf").innerHTML = catalog.campaigns.map(item => {
    const playable = item.status === "playable";
    const current = item.id === campaign.id;
    const state = current && store.enteredAt ? "CURRENT" : current ? "AT THRESHOLD" : playable ? "PLAYABLE" : "NEARBY DOOR";
    const action = playable
      ? '<button class="shelf-action" data-campaign="' + escapeHtml(item.id) + '">' + (current ? "OPEN" : "ENTER BOOK") + "</button>"
      : '<div class="shelf-action disabled">NOT YET OPEN</div>';

    return (
      '<article class="shelf-book ' + (current ? "current" : "") + " " + (!playable ? "nearby" : "") + '">' +
        '<div class="shelf-mark">' + escapeHtml(item.mark || "◌") + "</div>" +
        '<div class="shelf-state">' + escapeHtml(state) + "</div>" +
        "<h2>" + escapeHtml(item.title) + "</h2>" +
        '<p class="shelf-subtitle">' + escapeHtml(item.subtitle || "") + "</p>" +
        '<p class="shelf-author">' + escapeHtml(item.author || "") + "</p>" +
        (item.length ? '<div class="shelf-length">' + item.length + " encounters</div>" : "") +
        action +
      "</article>"
    );
  }).join("");

  document.querySelectorAll("[data-campaign]").forEach(button => {
    button.addEventListener("click", () => {
      if (button.dataset.campaign === campaign.id) {
        if (!store.enteredAt) renderThreshold();
        else showView("today");
      } else {
        switchCampaign(button.dataset.campaign);
      }
    });
  });
}

function renderInventory() {
  const items = store.receipts.filter(r => r.object).slice().reverse();
  $("inventory-list").innerHTML = items.length
    ? items.map(item =>
        '<div class="inventory-item">' + escapeHtml(item.object) +
        "<small>Day " + String(item.day).padStart(3, "0") + " · " + escapeHtml(item.encounter) + "</small></div>"
      ).join("")
    : '<p class="muted">Nothing has been deliberately carried forward yet.</p>';
}

function formatReceiptDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function renderReceipts() {
  const receipts = store.receipts.slice().reverse();

  if (!receipts.length) {
    $("receipt-list").innerHTML =
      '<div class="empty-receipt"><div class="tiny-label">NO RECEIPTS YET</div><p>Cross a door, come back, and witness what happened.</p></div>';
    renderInventory();
    return;
  }

  $("receipt-list").innerHTML = receipts.map((item, reverseIndex) => {
    const serial = store.receipts.length - reverseIndex;
    const note = item.note
      ? '<p class="receipt-note">' + escapeHtml(item.note) + "</p>"
      : '<p class="receipt-note muted">No note. The crossing itself was kept.</p>';
    const object = item.object
      ? '<div class="receipt-object"><span>CARRIED</span>' + escapeHtml(item.object) + "</div>"
      : "";

    return (
      '<article class="field-receipt">' +
        '<div class="receipt-head">' +
          '<div class="receipt-brand">DVOTE / RECEIPT</div>' +
          '<div class="receipt-serial">R-' + String(serial).padStart(3, "0") + "</div>" +
        "</div>" +
        '<div class="receipt-day">DAY ' + String(item.day || 1).padStart(3, "0") + "</div>" +
        '<h2>' + escapeHtml(item.encounter || "Encounter") + "</h2>" +
        '<div class="receipt-crossed"><span>CROSSED</span>' + escapeHtml(item.door || "Door") + "</div>" +
        note +
        object +
        '<div class="receipt-foot">' +
          "<span>" + escapeHtml(item.weather || "weather unmarked") + "</span>" +
          "<span>" + escapeHtml(formatReceiptDate(item.date)) + "</span>" +
        "</div>" +
      "</article>"
    );
  }).join("");

  renderInventory();
}

const stopWords = new Set(
  "the a an and or but to of in on at for from with is was are were be been being it this that i you we they he she my your our their one what where when how as not do did does into out up down just very today thing something".split(" ")
);

function topEchoes(receipts) {
  const words = {};
  receipts.forEach(r => {
    const text = ((r.note || "") + " " + (r.object || "")).toLowerCase();
    (text.match(/[a-z']{3,}/g) || []).forEach(word => {
      if (!stopWords.has(word)) words[word] = (words[word] || 0) + 1;
    });
  });

  return Object.entries(words)
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

function renderRemember() {
  const cutoff = Date.now() - 7 * 86400000;
  const recent = store.receipts.filter(r => new Date(r.date).getTime() >= cutoff);

  if (!recent.length) {
    $("remember-card").innerHTML = "<p>No receipts yet. The week cannot remember what has not been witnessed.</p>";
    return;
  }

  const echoes = topEchoes(recent);
  const doors = [...new Set(recent.map(r => r.door))];
  const objects = recent.filter(r => r.object).map(r => r.object);

  let html =
    '<div class="echo"><strong>' + recent.length + "</strong> receipt" +
    (recent.length === 1 ? "" : "s") + " held this week.</div>";

  html +=
    '<div class="echo"><strong>Doors crossed:</strong><br>' +
    doors.map(escapeHtml).join(" · ") + "</div>";

  if (objects.length) {
    html +=
      '<div class="echo"><strong>Carried forward:</strong><br>' +
      objects.map(escapeHtml).join(" · ") + "</div>";
  }

  if (echoes.length) {
    html +=
      '<div class="echo"><strong>Words that repeated:</strong><br>' +
      echoes.map(([word, count]) => escapeHtml(word) + " ×" + count).join(" · ") +
      "</div>";
  } else {
    html += '<div class="echo">Nothing repeats strongly enough yet. That is also a valid trace.</div>';
  }

  html += '<div class="echo muted">DVOTE shows recurrence. You decide whether any recurrence matters.</div>';
  $("remember-card").innerHTML = html;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showView(name) {
  if (name === "today" && !store.enteredAt) {
    renderThreshold();
    return;
  }

  document.querySelectorAll(".view").forEach(view => {
    view.classList.toggle("active", view.id === name);
  });

  document.querySelectorAll("[data-view]").forEach(button => {
    button.classList.toggle("active", button.dataset.view === name);
  });

  if (name === "library") renderLibrary();
  if (name === "receipts") renderReceipts();
  if (name === "remember") renderRemember();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindUI() {
  $("enter-campaign").addEventListener("click", () => {
    store.enter();
    dayNumber = campaignDay();
    encounter = encounterForDay(dayNumber);
    renderEncounter();
    hideThreshold();
    showView("today");
  });

  $("threshold-library").addEventListener("click", () => {
    hideThreshold();
    showView("library");
  });

  $("return-button").addEventListener("click", () => {
    $("witness").classList.remove("hidden");
    $("witness").scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => $("witness-note").focus(), 350);
  });

  document.querySelectorAll("[data-weather]").forEach(button => {
    button.addEventListener("click", () => {
      if (!store.enteredAt) {
        renderThreshold();
        return;
      }

      store.setWeather(dayNumber, button.dataset.weather);
      document.querySelectorAll("[data-weather]").forEach(b => {
        b.classList.toggle("selected", b === button);
      });
    });
  });

  $("save-witness").addEventListener("click", () => {
    if (selectedDoor === null) return;

    const door = encounter.doors[selectedDoor];
    const note = $("witness-note").value.trim();
    const object = $("object-input").value.trim();
    const receipts = store.receipts;

    receipts.push({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      date: new Date().toISOString(),
      campaignId: campaign.id,
      campaignVersion: campaign.version || null,
      day: dayNumber,
      encounterId: encounter.id || null,
      encounter: encounter.title,
      doorId: door.id || null,
      door: door.title,
      weather: store.getWeather(dayNumber) || null,
      note,
      object: object || null
    });

    store.receipts = receipts.slice(-100);
    $("witness").classList.add("hidden");
    $("receipt").classList.remove("hidden");
    $("receipt").scrollIntoView({ behavior: "smooth", block: "center" });
    renderReceipts();
    renderRemember();
  });

  $("view-receipts").addEventListener("click", () => {
    $("receipt").classList.add("hidden");
    showView("receipts");
  });

  $("close-day").addEventListener("click", () => {
    selectedDoor = null;
    $("crossing").classList.add("hidden");
    $("witness").classList.add("hidden");
    $("receipt").classList.add("hidden");
    $("witness-note").value = "";
    $("object-input").value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });
}

async function init() {
  try {
    [campaign, catalog] = await Promise.all([loadCampaign(), loadCatalog()]);
    dayNumber = campaignDay();
    encounter = encounterForDay(dayNumber);
    document.title = campaign.title + " · DVOTE";

    bindUI();
    renderEncounter();
    renderLibrary();
    renderReceipts();
    renderRemember();

    if (!store.enteredAt) renderThreshold();
  } catch (error) {
    $("encounter-title").textContent = "The campaign could not open";
    $("encounter-text").textContent = error.message;
    $("carry-text").textContent = "The runtime remains intact. The content door is unavailable.";
    $("door-list").innerHTML = "";
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

init();
