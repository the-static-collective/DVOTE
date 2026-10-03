let campaign;
let encounter;
let dayNumber = 1;
let selectedDoor = null;

const $ = (id) => document.getElementById(id);

function campaignSlug() {
  const requested = new URLSearchParams(location.search).get("campaign") || "field-notes-001";
  return /^[a-z0-9-]+$/.test(requested) ? requested : "field-notes-001";
}

async function loadCampaign() {
  const slug = campaignSlug();
  const response = await fetch(`campaigns/${slug}/campaign.json`);
  if (!response.ok) throw new Error(`Campaign not found: ${slug}`);
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

function key(name) {
  return `dvote.${campaign.id}.${name}`;
}

const store = {
  get receipts() {
    return JSON.parse(localStorage.getItem(key("receipts")) || "[]");
  },
  set receipts(value) {
    localStorage.setItem(key("receipts"), JSON.stringify(value));
  },
  get startedAt() {
    const existing = localStorage.getItem(key("startedAt"));
    if (existing) return existing;
    const value = new Date().toISOString();
    localStorage.setItem(key("startedAt"), value);
    return value;
  },
  getWeather(day) {
    return localStorage.getItem(key(`weather.${day}`)) || "";
  },
  setWeather(day, value) {
    localStorage.setItem(key(`weather.${day}`), value);
  }
};

function localDayStamp(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
}

function campaignDay() {
  const start = new Date(store.startedAt);
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

function renderEncounter() {
  $("daymark").textContent = `DAY ${String(dayNumber).padStart(3, "0")}`;
  $("encounter-title").textContent = encounter.title;
  $("encounter-text").textContent = encounter.text;
  $("carry-text").textContent = encounter.carry || "";

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
    button.innerHTML = `
      <span class="door-index">${String(index + 1).padStart(2, "0")}</span>
      <span><strong>${escapeHtml(door.title)}</strong><span>${escapeHtml(door.prompt)}</span></span>
    `;
    button.addEventListener("click", () => chooseDoor(index));
    $("door-list").appendChild(button);
  });
}

function chooseDoor(index) {
  selectedDoor = index;
  const door = encounter.doors[index];
  $("crossing-title").textContent = door.title;
  $("crossing-text").textContent = door.prompt;
  $("crossing").classList.remove("hidden");
  $("witness").classList.add("hidden");
  $("receipt").classList.add("hidden");
  $("crossing").scrollIntoView({ behavior: "smooth", block: "center" });
}

function renderInventory() {
  const items = store.receipts.filter(r => r.object).slice().reverse();
  $("inventory-list").innerHTML = items.length
    ? items.map(item => `<div class="inventory-item">${escapeHtml(item.object)}<small>Day ${String(item.day).padStart(3, "0")} · ${escapeHtml(item.encounter)}</small></div>`).join("")
    : '<p class="muted">Nothing has been deliberately carried forward yet.</p>';
}

const stopWords = new Set(
  "the a an and or but to of in on at for from with is was are were be been being it this that i you we they he she my your our their one what where when how as not do did does into out up down just very today thing something".split(" ")
);

function topEchoes(receipts) {
  const words = {};
  receipts.forEach(r => {
    const text = `${r.note || ""} ${r.object || ""}`.toLowerCase();
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

  let html = `<div class="echo"><strong>${recent.length}</strong> receipt${recent.length === 1 ? "" : "s"} held this week.</div>`;
  html += `<div class="echo"><strong>Doors crossed:</strong><br>${doors.map(escapeHtml).join(" · ")}</div>`;

  if (objects.length) {
    html += `<div class="echo"><strong>Carried forward:</strong><br>${objects.map(escapeHtml).join(" · ")}</div>`;
  }

  if (echoes.length) {
    html += `<div class="echo"><strong>Words that repeated:</strong><br>${echoes.map(([word, count]) => `${escapeHtml(word)} ×${count}`).join(" · ")}</div>`;
  } else {
    html += '<div class="echo">Nothing repeats strongly enough yet. That is also a valid trace.</div>';
  }

  html += '<div class="echo muted">DVOTE shows recurrence. You decide whether any recurrence matters.</div>';
  $("remember-card").innerHTML = html;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function showView(name) {
  document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === name));
  document.querySelectorAll("[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === name));
  if (name === "inventory") renderInventory();
  if (name === "remember") renderRemember();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function bindUI() {
  $("return-button").addEventListener("click", () => {
    $("witness").classList.remove("hidden");
    $("witness").scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => $("witness-note").focus(), 350);
  });

  document.querySelectorAll("[data-weather]").forEach(button => {
    button.addEventListener("click", () => {
      store.setWeather(dayNumber, button.dataset.weather);
      document.querySelectorAll("[data-weather]").forEach(b => b.classList.toggle("selected", b === button));
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
    renderInventory();
    renderRemember();
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
    campaign = await loadCampaign();
    dayNumber = campaignDay();
    encounter = encounterForDay(dayNumber);
    document.title = `${campaign.title} · DVOTE`;
    bindUI();
    renderEncounter();
    renderInventory();
    renderRemember();
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
