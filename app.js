const encounters = [
  {
    title: "The Door That Didn't Open",
    text: "Something refuses to happen today. Do not rush to name the refusal. A closed door is first a fact; meaning can wait.",
    carry: "What appears empty may merely be unoccupied.",
    doors: [
      { title: "PASS DIFFERENTLY", prompt: "Take a route you normally ignore. Notice one thing you would not have seen otherwise." },
      { title: "ASK ONCE", prompt: "Ask one honest question you have been postponing. Do not force an answer." },
      { title: "LEAVE SPACE", prompt: "Cancel one unnecessary act of filling. Keep ten minutes deliberately unoccupied." }
    ]
  },
  {
    title: "A Small Thing Has Followed You",
    text: "Look for the ordinary object, phrase, sound, or color that has appeared more than once lately. Repetition is not proof. It is permission to notice.",
    carry: "Attention can hold a thing without explaining it.",
    doors: [
      { title: "PHOTOGRAPH IT", prompt: "Record one recurring ordinary thing exactly as it appears." },
      { title: "NAME THE ECHO", prompt: "Write down the repeated word, object, color, or sound. Nothing more." },
      { title: "GIVE IT AWAY", prompt: "Tell someone else one small thing you noticed today and let their response remain theirs." }
    ]
  },
  {
    title: "The Map Has a Blank Place",
    text: "There is somewhere nearby you have never entered, even though your life repeatedly passes its edge. Today the edge is enough to begin.",
    carry: "Unknown does not mean distant.",
    doors: [
      { title: "CROSS A THRESHOLD", prompt: "Enter one public place you normally pass by. Stay long enough to notice its texture." },
      { title: "WALK TO THE EDGE", prompt: "Go to the boundary of a familiar route and look past it." },
      { title: "ASK FOR A NAME", prompt: "Learn the name of one place, plant, street, object, or person you usually leave unnamed." }
    ]
  },
  {
    title: "Borrowed Weather",
    text: "Not every mood in a room began inside you. Notice what you are carrying, and what may have arrived from somewhere else.",
    carry: "You may witness weather without becoming weather.",
    doors: [
      { title: "STEP OUTSIDE", prompt: "Change rooms or go outdoors for five minutes before deciding what you feel." },
      { title: "RETURN A BURDEN", prompt: "Write one responsibility that is actually yours and one that is not." },
      { title: "BRING CALM", prompt: "Do one small thing that lowers friction for another person without announcing it." }
    ]
  },
  {
    title: "Inventory of Enough",
    text: "Before seeking another tool, answer, purchase, or permission, examine what is already within reach.",
    carry: "Provision often enters the story before the need has a name.",
    doors: [
      { title: "EMPTY YOUR POCKETS", prompt: "Make a literal inventory of what you are carrying right now." },
      { title: "USE THE OLD TOOL", prompt: "Finish one small task using something you already own." },
      { title: "SHARE SURPLUS", prompt: "Give, lend, or offer one useful thing that is sitting idle." }
    ]
  },
  {
    title: "The Unfinished Conversation",
    text: "Some conversations remain alive because they were interrupted rather than completed. You do not have to resolve one today. You can simply locate it.",
    carry: "Unfinished is a condition, not a verdict.",
    doors: [
      { title: "WRITE THE NEXT LINE", prompt: "Privately write the next honest sentence in an unfinished conversation." },
      { title: "SEND A GENTLE PING", prompt: "Where appropriate and safe, send a simple message that asks for nothing except contact." },
      { title: "LET IT REST", prompt: "Choose not to reopen one conversation today. Record why rest is the better crossing." }
    ]
  },
  {
    title: "The Week Leaves a Trace",
    text: "Before beginning something new, look backward without trying to make a lesson. What remains after the week is evidence of where attention actually went.",
    carry: "A trace is smaller than a theory and often more useful.",
    doors: [
      { title: "READ YOUR RECEIPTS", prompt: "Review the notes you kept this week. Circle one repeated word." },
      { title: "KEEP ONE OBJECT", prompt: "Choose one physical or digital object from the week and preserve it deliberately." },
      { title: "CLOSE ONE LOOP", prompt: "Finish one task that has remained open for at least three days." }
    ]
  }
];

const store = {
  get receipts() {
    return JSON.parse(localStorage.getItem("dvote.receipts") || "[]");
  },
  set receipts(value) {
    localStorage.setItem("dvote.receipts", JSON.stringify(value));
  },
  get weather() {
    return localStorage.getItem("dvote.weather") || "";
  },
  set weather(value) {
    localStorage.setItem("dvote.weather", value);
  }
};

const startDate = new Date("2026-10-03T00:00:00");
const now = new Date();
const dayNumber = Math.max(1, Math.floor((now - startDate) / 86400000) + 1);
const encounter = encounters[(dayNumber - 1) % encounters.length];

let selectedDoor = null;

const $ = (id) => document.getElementById(id);

$("daymark").textContent = `DAY ${String(dayNumber).padStart(3, "0")}`;
$("encounter-title").textContent = encounter.title;
$("encounter-text").textContent = encounter.text;
$("carry-text").textContent = encounter.carry;

function renderDoors() {
  $("door-list").innerHTML = "";
  encounter.doors.forEach((door, index) => {
    const button = document.createElement("button");
    button.className = "door";
    button.innerHTML = `
      <span class="door-index">0${index + 1}</span>
      <span><strong>${door.title}</strong><span>${door.prompt}</span></span>
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

$("return-button").addEventListener("click", () => {
  $("witness").classList.remove("hidden");
  $("witness").scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => $("witness-note").focus(), 350);
});

document.querySelectorAll("[data-weather]").forEach(button => {
  if (button.dataset.weather === store.weather) button.classList.add("selected");
  button.addEventListener("click", () => {
    store.weather = button.dataset.weather;
    document.querySelectorAll("[data-weather]").forEach(b => b.classList.toggle("selected", b === button));
  });
});

$("save-witness").addEventListener("click", () => {
  if (selectedDoor === null) return;
  const note = $("witness-note").value.trim();
  const object = $("object-input").value.trim();
  const receipts = store.receipts;
  receipts.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date: new Date().toISOString(),
    day: dayNumber,
    encounter: encounter.title,
    door: encounter.doors[selectedDoor].title,
    weather: store.weather || null,
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

function renderInventory() {
  const items = store.receipts.filter(r => r.object).slice().reverse();
  $("inventory-list").innerHTML = items.length
    ? items.map(item => `<div class="inventory-item">${escapeHtml(item.object)}<small>Day ${String(item.day).padStart(3, "0")} · ${escapeHtml(item.encounter)}</small></div>`).join("")
    : '<p class="muted">Nothing has been deliberately carried forward yet.</p>';
}

const stopWords = new Set("the a an and or but to of in on at for from with is was are were be been being it this that i you we they he she my your our their one what where when how as not do did does into out up down just very today thing something".split(" "));

function topEchoes(receipts) {
  const words = {};
  receipts.forEach(r => {
    const text = `${r.note || ""} ${r.object || ""}`.toLowerCase();
    (text.match(/[a-z']{3,}/g) || []).forEach(word => {
      if (!stopWords.has(word)) words[word] = (words[word] || 0) + 1;
    });
  });
  return Object.entries(words).filter(([, count]) => count > 1).sort((a,b) => b[1] - a[1]).slice(0, 5);
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
    html += `<div class="echo"><strong>Words that repeated:</strong><br>${echoes.map(([word,count]) => `${escapeHtml(word)} ×${count}`).join(" · ")}</div>`;
  } else {
    html += '<div class="echo">Nothing repeats strongly enough yet. That is also a valid trace.</div>';
  }

  html += '<div class="echo muted">DVOTE shows recurrence. You decide whether any recurrence matters.</div>';
  $("remember-card").innerHTML = html;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function showView(name) {
  document.querySelectorAll(".view").forEach(view => view.classList.toggle("active", view.id === name));
  document.querySelectorAll("[data-view]").forEach(button => button.classList.toggle("active", button.dataset.view === name));
  if (name === "inventory") renderInventory();
  if (name === "remember") renderRemember();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-view]").forEach(button => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

renderDoors();
renderInventory();
renderRemember();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}