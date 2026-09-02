const gradeBlock = document.getElementById("grade-block");
const gradeButtons = document.querySelectorAll(".grade-btn:not(.term-btn)");
const termButtons = document.querySelectorAll(".term-btn");
const termBlock = document.getElementById("term-block");
const countBlock = document.getElementById("count-block");
const countSelect = document.getElementById("count-select");
const countHint = document.getElementById("count-hint");
const blockModeToggle = document.getElementById("block-mode-toggle");
const blockModeSummary = document.getElementById("block-mode-summary");
const operationBlock = document.getElementById("operation-block");
const operationList = document.getElementById("operation-list");
const negSwitch = document.getElementById("neg-switch");
const negToggle = document.getElementById("neg-toggle");
const createBlock = document.getElementById("create-block");
const adMidRow = document.getElementById("ad-mid-row");
const createBtn = document.getElementById("create-btn");
const notesToggle = document.getElementById("notes-toggle");
const notesSwitch = document.getElementById("notes-switch");
const adSlots = document.querySelectorAll(".ad-slot");
const pageShell = document.querySelector(".page-shell");
const worksheet = document.getElementById("worksheet");
const blocks = document.getElementById("blocks");
const checkBtn = document.getElementById("check-btn");
const startBtn = document.getElementById("start-btn");
const statusEl = document.getElementById("status");
const timerEl = document.getElementById("timer");
const countdownToggle = document.getElementById("countdown-toggle");
const countdownSetup = document.getElementById("countdown-setup");
const countdownMinutesInput = document.getElementById("countdown-minutes");
const countdownEl = document.getElementById("countdown");
const pdfBtn = document.getElementById("pdf-btn");
const newSheetBtn = document.getElementById("new-sheet-btn");
const progressEl = document.getElementById("progress");
const printHeader = document.getElementById("print-header");
const pageCorner = document.getElementById("page-corner");
const practiceStartSlot = document.getElementById("practice-start-slot");
const practiceCheckSlot = document.getElementById("practice-check-slot");
const practiceFooterSlot = document.getElementById("practice-footer-slot");
const mobilePracticeQuery = window.matchMedia("(max-width: 1024px), (pointer: coarse)");

/* Werbung: auf true setzen und body-Klasse "ads-off" in index.html entfernen */
const SHOW_ADS = false;
const TASK_BLOCK_SIZE = 10;
const MAX_TASK_BLOCKS = 8;
const MIXED_COUNT_HINT = "Die Rechenarten werden auf dem Blatt gemischt.";
const BLOCK_MODE_HINT =
  "Jede Rechenart bekommt eigene 10er-Blöcke, nacheinander. Die Anzahl stellst du bei den Rechenarten ein.";

function layoutPracticeControls() {
  if (!pageCorner || !practiceStartSlot || !practiceCheckSlot || !practiceFooterSlot) {
    return;
  }
  if (mobilePracticeQuery.matches) {
    practiceStartSlot.append(countdownEl, startBtn);
    practiceCheckSlot.append(checkBtn);
    practiceFooterSlot.append(document.getElementById("reset-best-btn"));
    return;
  }
  pageCorner.append(
    countdownEl,
    startBtn,
    checkBtn,
    document.getElementById("reset-best-btn")
  );
}

layoutPracticeControls();
if (typeof mobilePracticeQuery.addEventListener === "function") {
  mobilePracticeQuery.addEventListener("change", layoutPracticeControls);
} else {
  mobilePracticeQuery.addListener(layoutPracticeControls);
}

const difficulty = {
  1: {
    1: {
      addMax: 10,
      addMin: 0,
      hint: "Plus und Minus bis 10.",
    },
    2: {
      addMax: 20,
      addMin: 1,
      hint: "Plus und Minus bis 20.",
    },
  },
  2: {
    1: {
      addMax: 50,
      addMin: 2,
      mul: { a: [1, 2, 5, 10], b: { min: 1, max: 10 } },
      div: { divisors: [1, 2, 5, 10], quotient: { min: 1, max: 10 } },
      hint: "Plus und Minus bis 50. Mal und Geteilt nur mit 1, 2, 5 und 10.",
    },
    2: {
      addMax: 100,
      addMin: 3,
      mul: { a: { min: 1, max: 10 }, b: { min: 1, max: 10 } },
      div: { divisors: { min: 1, max: 10 }, quotient: { min: 1, max: 10 } },
      hint: "Plus und Minus bis 100. Kleines Einmaleins 1 bis 10.",
    },
  },
  3: {
    1: {
      addMax: 500,
      addMin: 12,
      mul: { a: { min: 10, max: 30 }, b: { min: 2, max: 5 } },
      div: { divisors: { min: 2, max: 5 }, quotient: { min: 10, max: 30 } },
      hint: "Plus und Minus bis 500. Mal und Geteilt noch etwas leichter.",
    },
    2: {
      addMax: 1000,
      addMin: 15,
      mul: { a: { min: 10, max: 99 }, b: { min: 2, max: 9 } },
      div: { divisors: { min: 2, max: 9 }, quotient: { min: 10, max: 99 } },
      hint: "Plus und Minus bis 1000. Zweistellig mal einstellig.",
    },
  },
  4: {
    1: {
      addMax: 10000,
      addMin: 25,
      mul: { a: { min: 10, max: 99 }, b: { min: 2, max: 9 } },
      div: { divisors: { min: 2, max: 9 }, quotient: { min: 12, max: 50 } },
      hint: "Plus und Minus bis 10.000. Zweistellig mal einstellig.",
    },
    2: {
      addMax: 100000,
      addMin: 50,
      mul: { a: { min: 10, max: 99 }, b: { min: 10, max: 20 } },
      div: { divisors: { min: 2, max: 12 }, quotient: { min: 12, max: 80 } },
      hint: "Plus und Minus bis 100.000 und etwas schwerere Malaufgaben.",
    },
  },
  5: {
    1: {
      addMax: 1000000,
      addMin: 100,
      mul: { a: { min: 10, max: 99 }, b: { min: 10, max: 20 } },
      div: { divisors: { min: 2, max: 12 }, quotient: { min: 12, max: 80 } },
      hint: "Plus und Minus bis 1.000.000. Zweistellig mal zweistellig.",
      neg: {
        addMax: 40,
        addMin: 2,
        mul: { a: { min: 2, max: 12 }, b: { min: 2, max: 12 } },
        div: { divisors: { min: 2, max: 10 }, quotient: { min: 2, max: 12 } },
      },
    },
    2: {
      addMax: 1000000,
      addMin: 120,
      mul: { a: { min: 12, max: 99 }, b: { min: 11, max: 25 } },
      div: { divisors: { min: 2, max: 12 }, quotient: { min: 12, max: 90 } },
      hint: "Plus und Minus bis 1.000.000. Etwas umfangreichere Mal- und Geteiltaufgaben.",
      neg: {
        addMax: 50,
        addMin: 2,
        mul: { a: { min: 2, max: 12 }, b: { min: 2, max: 12 } },
        div: { divisors: { min: 2, max: 12 }, quotient: { min: 2, max: 12 } },
      },
    },
  },
  6: {
    1: {
      addMax: 1000000,
      addMin: 150,
      mul: { a: { min: 15, max: 99 }, b: { min: 12, max: 30 } },
      div: { divisors: { min: 3, max: 15 }, quotient: { min: 12, max: 80 } },
      hint: "Große Zahlen und umfangreichere Mal- und Geteiltaufgaben.",
      neg: {
        addMax: 60,
        addMin: 3,
        mul: { a: { min: 2, max: 15 }, b: { min: 2, max: 12 } },
        div: { divisors: { min: 2, max: 12 }, quotient: { min: 2, max: 15 } },
      },
    },
    2: {
      addMax: 1000000,
      addMin: 200,
      mul: { a: { min: 20, max: 99 }, b: { min: 12, max: 35 } },
      div: { divisors: { min: 3, max: 16 }, quotient: { min: 12, max: 90 } },
      hint: "Anspruchsvollere Aufgaben bis 1.000.000, auch mit größeren Faktoren.",
      neg: {
        addMax: 80,
        addMin: 3,
        mul: { a: { min: 3, max: 16 }, b: { min: 3, max: 12 } },
        div: { divisors: { min: 3, max: 12 }, quotient: { min: 3, max: 16 } },
      },
    },
  },
};

const symbols = {
  addition: "+",
  subtraction: "−",
  multiplication: "×",
  division: ":",
};

let selectedGrade = null;
let selectedTerm = null;
let pendingTopicIds = null;
let tasks = [];
let activeTopicIds = [];
let activeBlockMode = false;
let celebrated = false;
let fireworksFrame = 0;
let timerStartedAt = 0;
let timerElapsedMs = 0;
let timerInterval = 0;
let timerFrozen = false;
let timerStarted = false;
let countdownActive = false;
let countdownLimitMs = 0;
let countdownExpired = false;
let countdownMinutesDirty = false;

const successDialog = document.getElementById("success-dialog");
const successClose = document.getElementById("success-close");
const fireworksCanvas = document.getElementById("fireworks");
const fireworkColors = ["#ff5a36", "#ffd166", "#06d6a0", "#4cc9f0", "#f72585", "#fff4d6"];
const successMessages = [
  { title: "Prima!", text: "Du hast es geschafft. Alle Aufgaben sind richtig." },
  { title: "Super gemacht!", text: "Das hast du ganz allein gerechnet." },
  { title: "Klasse!", text: "Alle Ergebnisse stimmen. Toll!" },
  { title: "Bravo!", text: "Du bist ein echter Rechenkünstler." },
  { title: "Spitze!", text: "Kein Fehler – das war stark." },
  { title: "Toll!", text: "Du hast alle Aufgaben richtig gelöst." },
  { title: "Fantastisch!", text: "Weiter so, das Rechnen klappt super." },
  { title: "Geschafft!", text: "Heute bist du besonders gut drauf." },
  { title: "Stark!", text: "Alle Rechnungen sind richtig. Respekt!" },
  { title: "Ausgezeichnet!", text: "Das hat richtig gut geklappt." },
];
let lastSuccessIndex = -1;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickValue(spec) {
  if (Array.isArray(spec)) {
    return spec[randomInt(0, spec.length - 1)];
  }
  return randomInt(spec.min, spec.max);
}

function isTopicAllowed(topic, grade, term) {
  if (grade < topic.fromGrade) {
    return false;
  }
  if (grade === topic.fromGrade && term < topic.fromTerm) {
    return false;
  }
  if (topic.untilGrade != null && grade > topic.untilGrade) {
    return false;
  }
  if (
    topic.untilGrade != null &&
    grade === topic.untilGrade &&
    topic.untilTerm != null &&
    term > topic.untilTerm
  ) {
    return false;
  }
  return true;
}

function isTopicListed(topic, grade) {
  if (topic.untilGrade != null && grade > topic.untilGrade) {
    return false;
  }
  return topic.fromGrade <= grade + 1;
}

function getTopic(id) {
  return topics.find((item) => item.id === id);
}

function selectedTopics() {
  return [...operationList.querySelectorAll("input[data-topic]:checked:not(:disabled)")].map(
    (input) => input.value
  );
}

function isBlockMode() {
  return Boolean(blockModeToggle?.checked);
}

function topicBlocksOf(input) {
  const n = Number(input.dataset.blocks);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function selectedTopicQuotas() {
  return [...operationList.querySelectorAll("input[data-topic]:checked:not(:disabled)")].map((input) => ({
    id: input.value,
    blocks: Math.max(1, topicBlocksOf(input) || 1),
  }));
}

function totalSelectedBlocks() {
  return selectedTopicQuotas().reduce((sum, item) => sum + item.blocks, 0);
}

function selectedTaskCount() {
  if (isBlockMode()) {
    return totalSelectedBlocks() * TASK_BLOCK_SIZE;
  }
  return Number(countSelect.value) || 0;
}

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = randomInt(0, index);
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function buildBlockTopicPlan(blockCount, selectedOps) {
  const topicCount = selectedOps.length;
  let remainder = blockCount % topicCount;
  const blockPlan = [];
  for (const id of selectedOps) {
    let quota = Math.floor(blockCount / topicCount) + (remainder > 0 ? 1 : 0);
    if (remainder > 0) {
      remainder -= 1;
    }
    for (let i = 0; i < quota; i += 1) {
      blockPlan.push(id);
    }
  }
  return shuffleArray(blockPlan);
}

function buildTopicPlan(count, selectedOps, blockSize = 10) {
  const plan = [];
  for (let start = 0; start < count; start += blockSize) {
    plan.push(...buildBlockTopicPlan(Math.min(blockSize, count - start), selectedOps));
  }
  return plan;
}

function taskKey(task) {
  if (task.operation && Array.isArray(task.operands) && task.operands.length >= 2) {
    return `${task.type}|${task.operation}|${task.operands.join("|")}`;
  }
  if (task.a != null && task.b != null && task.operation) {
    return `${task.type}|${task.operation}|${task.a}|${task.b}`;
  }
  if (task.key) {
    return `${task.type}|${task.key}`;
  }
  const answerPart =
    task.answer != null && typeof task.answer === "object"
      ? JSON.stringify(task.answer)
      : String(task.answer);
  return `${task.type}|${task.prompt}|${answerPart}`;
}

function negativesAllowed() {
  return selectedGrade >= 5 && negToggle.checked;
}

const TOPIC_SECONDS = {
  addition: 22,
  subtraction: 24,
  multiplication: 26,
  division: 28,
  order_ops: 32,
  brackets: 36,
  laws: 22,
  placeholder: 30,
  equations: 48,
  fractions_share: 28,
  fractions_read: 16,
  fractions: 52,
  decimals: 40,
  percent: 36,
  proportion: 50,
  mean: 40,
  word: 52,
  decompose: 16,
  compare: 12,
  neighbor: 12,
  double_half: 18,
  even_odd: 10,
  round: 22,
  estimate: 28,
  divisible: 14,
  roman: 22,
  primes: 16,
  table_read: 24,
  money: 26,
  clock: 18,
  length: 18,
  length_convert: 22,
  weight: 18,
  time_units: 16,
  perimeter_area: 36,
  scale: 42,
  cuboid: 44,
  unit_convert: 24,
  shapes: 12,
  position: 12,
  pattern: 18,
  number_line: 16,
  mirror: 14,
  coordinates: 22,
  angles: 20,
};

function secondsForTopic(id, grade, term) {
  let seconds = TOPIC_SECONDS[id] ?? 25;
  const growsWithGrade = new Set([
    "addition",
    "subtraction",
    "multiplication",
    "division",
    "round",
    "estimate",
    "word",
    "money",
    "order_ops",
    "brackets",
  ]);
  if (growsWithGrade.has(id)) {
    seconds += (grade - 1) * 4;
    if (term === 2) {
      seconds += 3;
    }
  } else if (grade >= 5) {
    seconds += 4;
  }
  if (term === 2 && ["equations", "fractions", "decimals", "percent", "proportion", "cuboid", "perimeter_area"].includes(id)) {
    seconds += 8;
  }
  return seconds;
}

function suggestedCountdownMinutes() {
  const count = selectedTaskCount();
  const topicIds = selectedTopics();
  if (!count || !topicIds.length || !selectedGrade || !selectedTerm) {
    return 5;
  }
  const average =
    topicIds.reduce((sum, id) => sum + secondsForTopic(id, selectedGrade, selectedTerm), 0) / topicIds.length;
  let total = average * count * 1.25;
  if (notesToggle.checked) {
    total *= 1.4;
  }
  if (negativesAllowed()) {
    total *= 1.12;
  }
  return Math.min(90, Math.max(2, Math.round(total / 60)));
}

function syncCountdownPreset() {
  if (!countdownToggle.checked || countdownMinutesDirty) {
    return;
  }
  countdownMinutesInput.value = String(suggestedCountdownMinutes());
}

function withSigns(a, b, allowNegatives) {
  if (!allowNegatives) {
    return { a, b };
  }

  const pattern = randomInt(0, 2);
  if (pattern === 0) {
    return { a: -Math.abs(a), b: Math.abs(b) };
  }
  if (pattern === 1) {
    return { a: Math.abs(a), b: -Math.abs(b) };
  }
  return { a: -Math.abs(a), b: -Math.abs(b) };
}

const { topics, GROUP: topicGroups } = buildTopics({
  randomInt,
  pickValue,
  difficulty,
  withSigns,
  symbols,
});

function formatOperand(value, wrapNegative) {
  const text = String(value).replace("-", "−");
  if (wrapNegative && value < 0) {
    return `(${text})`;
  }
  return text;
}

function parseNumberInput(value) {
  const trimmed = value.trim().replace(/[−–]/g, "-").replace(/\s/g, "");
  if (trimmed === "" || trimmed === "-") {
    return null;
  }
  const normalized = trimmed.replace(/\.(?=\d{3}(?:\D|$))/g, "").replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : NaN;
}

function parseFractionInput(value) {
  const trimmed = value.trim().replace(/\s/g, "").replace("⁄", "/");
  const mixed = trimmed.match(/^(-?\d+)\/(\d+)$/);
  if (!mixed) {
    return null;
  }
  const n = Number(mixed[1]);
  const d = Number(mixed[2]);
  if (!d) {
    return null;
  }
  return { n, d };
}

function parseAnswer(value) {
  return parseNumberInput(value);
}

function generateTask(grade, term, topicId, allowNegatives) {
  const topic = getTopic(topicId);
  const task = topic.generate(grade, term, {
    allowNegatives: Boolean(allowNegatives && topic.usesNegatives),
  });
  return { ...task, type: topicId };
}

function createTasksFromPlan(grade, term, plan, allowNegatives) {
  const created = [];
  const seen = new Set();

  for (const topicId of plan) {
    let added = false;
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const task = generateTask(grade, term, topicId, allowNegatives);
      const key = taskKey(task);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      created.push(task);
      added = true;
      break;
    }
    if (!added) {
      created.push(generateTask(grade, term, topicId, allowNegatives));
    }
  }

  return created;
}

function generateTasks(grade, term, count, selectedOps, allowNegatives) {
  return createTasksFromPlan(grade, term, buildTopicPlan(count, selectedOps), allowNegatives);
}

function generateTasksFromQuotas(grade, term, quotas, allowNegatives) {
  const plan = [];
  for (const { id, blocks } of quotas) {
    const n = Math.max(0, blocks) * TASK_BLOCK_SIZE;
    for (let i = 0; i < n; i += 1) {
      plan.push(id);
    }
  }
  return createTasksFromPlan(grade, term, plan, allowNegatives);
}

function updateNegSwitch(grade) {
  if (grade >= 5) {
    show(negSwitch);
    return;
  }
  hide(negSwitch);
  negToggle.checked = false;
}

function updateNotesSwitch(grade) {
  if (grade >= 3) {
    show(notesSwitch);
    return;
  }
  hide(notesSwitch);
  setNotesEnabled(false);
}

function syncGroupToggle(groupEl) {
  const boxes = [...groupEl.querySelectorAll("input[data-topic]:not(:disabled)")];
  const toggle = groupEl.querySelector(".group-toggle");
  if (!toggle || !boxes.length) {
    return;
  }
  const checkedCount = boxes.filter((box) => box.checked).length;
  toggle.checked = checkedCount === boxes.length;
  toggle.indeterminate = checkedCount > 0 && checkedCount < boxes.length;
}

function fillOperations(grade, term) {
  const previous = pendingTopicIds ?? new Set(selectedTopics());
  pendingTopicIds = null;
  const hint = document.getElementById("operation-hint");
  operationList.innerHTML = "";

  const groupOrder = ["rechnen", "zahlen", "groessen", "geometrie"];
  groupOrder.forEach((groupId) => {
    const listed = topics.filter((item) => item.group === groupId && isTopicListed(item, grade));
    const hasAllowed = listed.some((item) => isTopicAllowed(item, grade, term));
    if (!hasAllowed) {
      return;
    }

    const group = document.createElement("section");
    group.className = "topic-group";
    group.dataset.group = groupId;

    const head = document.createElement("div");
    head.className = "topic-group-head";
    const title = document.createElement("h3");
    title.textContent = topicGroups[groupId];
    const allLabel = document.createElement("label");
    allLabel.className = "group-all";
    allLabel.innerHTML = `<input type="checkbox" class="group-toggle" /> Alle in dieser Gruppe`;
    head.append(title, allLabel);

    const grid = document.createElement("div");
    grid.className = "topic-grid";

    listed.forEach((item) => {
      const allowed = isTopicAllowed(item, grade, term);
      const label = document.createElement("label");
      label.className = allowed ? "topic-choice" : "topic-choice is-disabled";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.dataset.topic = item.id;
      checkbox.value = item.id;
      checkbox.disabled = !allowed;
      checkbox.checked = allowed && previous.has(item.id);
      const name = document.createElement("span");
      name.className = "topic-choice-name";
      name.textContent = allowed ? item.label : `${item.label} (ab Klasse ${item.fromGrade})`;
      const example = document.createElement("span");
      example.className = "topic-example";
      example.textContent = item.example(grade, term);
      const stepper = document.createElement("div");
      stepper.className = "topic-blocks";
      const safeLabel = escapeHtml(item.label);
      stepper.innerHTML = `
        <button type="button" class="topic-blocks-btn" data-block-delta="-1" aria-label="Einen 10er-Block weniger für ${safeLabel}">−</button>
        <span class="topic-blocks-count" aria-live="polite">1 × 10</span>
        <button type="button" class="topic-blocks-btn" data-block-delta="1" aria-label="Einen 10er-Block mehr für ${safeLabel}">+</button>
      `;
      label.append(checkbox, name, example, stepper);
      grid.append(label);
    });

    group.append(head, grid);
    operationList.append(group);
    syncGroupToggle(group);
  });

  hint.textContent = difficulty[grade][term].hint;
  updateNegSwitch(grade);
  updateNotesSwitch(grade);
  if (isBlockMode()) {
    ensureDefaultBlocks();
    updateBlockModeSummary();
    updateTopicBlockControls();
  }
}

function fillTermHints(grade) {
  document.getElementById("term-hint-1").textContent = difficulty[grade][1].hint;
  document.getElementById("term-hint-2").textContent = difficulty[grade][2].hint;
}

function show(element) {
  element.classList.remove("is-hidden");
}

function hide(element) {
  element.classList.add("is-hidden");
}

function ensureDefaultBlocks() {
  operationList.querySelectorAll("input[data-topic]:checked:not(:disabled)").forEach((input) => {
    if (topicBlocksOf(input) < 1) {
      input.dataset.blocks = "1";
    }
  });
}

function clampBlockBudget() {
  if (!isBlockMode()) {
    return;
  }
  let used = 0;
  operationList.querySelectorAll("input[data-topic]:checked:not(:disabled)").forEach((input) => {
    let blocks = Math.max(1, topicBlocksOf(input) || 1);
    if (used >= MAX_TASK_BLOCKS) {
      input.checked = false;
      delete input.dataset.blocks;
      return;
    }
    if (used + blocks > MAX_TASK_BLOCKS) {
      blocks = MAX_TASK_BLOCKS - used;
    }
    input.dataset.blocks = String(blocks);
    used += blocks;
  });
}

function updateTopicBlockControls() {
  if (!operationList) {
    return;
  }
  const used = isBlockMode() ? totalSelectedBlocks() : 0;
  operationList.querySelectorAll(".topic-choice").forEach((choice) => {
    const input = choice.querySelector("input[data-topic]");
    const valueEl = choice.querySelector(".topic-blocks-count");
    const minusBtn = choice.querySelector('[data-block-delta="-1"]');
    const plusBtn = choice.querySelector('[data-block-delta="1"]');
    if (!input || !valueEl) {
      return;
    }
    const blocks = Math.max(1, topicBlocksOf(input) || 1);
    valueEl.textContent = `${blocks} × 10`;
    if (minusBtn) {
      minusBtn.disabled = !input.checked || blocks <= 1;
    }
    if (plusBtn) {
      plusBtn.disabled = !input.checked || used >= MAX_TASK_BLOCKS;
    }
  });
}

function updateBlockModeSummary() {
  if (!blockModeSummary || !isBlockMode()) {
    return;
  }
  const quotas = selectedTopicQuotas();
  const total = quotas.reduce((sum, item) => sum + item.blocks, 0) * TASK_BLOCK_SIZE;
  if (!quotas.length) {
    blockModeSummary.textContent =
      "Wähle unten die Rechenarten. Jede startet mit einem 10er-Block (höchstens 8 Blöcke).";
    return;
  }
  const parts = quotas.map((item) => {
    const label = getTopic(item.id)?.label || item.id;
    return `${label} ${item.blocks}×10`;
  });
  const maxNote = total >= MAX_TASK_BLOCKS * TASK_BLOCK_SIZE ? " — Maximum erreicht." : "";
  blockModeSummary.textContent = `${total} Aufgaben: ${parts.join(", ")}${maxNote}`;
}

function setBlockModeUi(on) {
  if (countBlock) {
    countBlock.classList.toggle("is-block-mode", on);
  }
  if (countHint) {
    countHint.textContent = on ? BLOCK_MODE_HINT : MIXED_COUNT_HINT;
  }
  if (blockModeSummary) {
    blockModeSummary.classList.toggle("is-hidden", !on);
  }
  if (on) {
    ensureDefaultBlocks();
    clampBlockBudget();
    updateBlockModeSummary();
    updateTopicBlockControls();
    show(operationBlock);
    if (selectedTopics().length) {
      showCreateStep();
    } else {
      hideCreateStep();
    }
    return;
  }
  if (countSelect.value) {
    show(operationBlock);
    if (selectedTopics().length) {
      showCreateStep();
    } else {
      hideCreateStep();
    }
    return;
  }
  hide(operationBlock);
  hideCreateStep();
}

function scrollToNext(element, align = "reveal") {
  if (!element || element.classList.contains("is-hidden")) {
    return;
  }

  const run = () => {
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    if (align === "start") {
      element.scrollIntoView({ behavior, block: "start" });
      return;
    }
    if (align === "center-top") {
      const rect = element.getBoundingClientRect();
      const delta = rect.top - window.innerHeight / 2;
      if (Math.abs(delta) > 1) {
        window.scrollBy({ top: delta, behavior });
      }
      return;
    }

    const padding = 32;
    const rect = element.getBoundingClientRect();
    const hiddenBelow = rect.bottom - (window.innerHeight - padding);
    const hiddenAbove = padding - rect.top;
    let delta = 0;
    if (hiddenBelow > 0) {
      delta = hiddenBelow;
    } else if (hiddenAbove > 0) {
      delta = -hiddenAbove;
    }
    if (delta !== 0) {
      window.scrollBy({ top: delta, behavior });
    }
  };

  requestAnimationFrame(() => requestAnimationFrame(run));
}

function showAds() {
  if (!SHOW_ADS) {
    pageShell.classList.remove("is-practicing");
    return;
  }
  adSlots.forEach(show);
  pageShell.classList.remove("is-practicing");
}

function hideAds() {
  if (!SHOW_ADS) {
    pageShell.classList.add("is-practicing");
    return;
  }
  adSlots.forEach(hide);
  hide(adMidRow);
  pageShell.classList.add("is-practicing");
}

function showCreateStep() {
  if (SHOW_ADS) {
    show(adMidRow);
  }
  show(createBlock);
}

function hideCreateStep() {
  hide(adMidRow);
  hide(createBlock);
}

function resetLaterSteps({ preserveTopics = false } = {}) {
  countSelect.value = "";
  if (blockModeToggle) {
    blockModeToggle.checked = false;
  }
  setBlockModeUi(false);
  if (!preserveTopics) {
    operationList.querySelectorAll("input").forEach((input) => {
      input.checked = false;
      input.indeterminate = false;
    });
  }
  operationList.querySelectorAll("input[data-topic]").forEach((input) => {
    delete input.dataset.blocks;
  });
  hide(operationBlock);
  hideCreateStep();
  hide(worksheet);
  hide(checkBtn);
  hide(pdfBtn);
  hide(newSheetBtn);
  hide(progressEl);
  progressEl.textContent = "";
  hide(startBtn);
  startBtn.disabled = false;
  hide(countdownEl);
  clearTimerInterval();
  timerStarted = false;
  worksheet.classList.remove("is-overtime");
  showAds();
  statusEl.textContent = "";
  countdownMinutesDirty = false;
  syncCountdownPreset();
}

function selectGrade(grade, options = {}) {
  const { scroll = true } = options;
  selectedGrade = grade;
  selectedTerm = null;
  gradeButtons.forEach((item) =>
    item.classList.toggle("is-active", Number(item.dataset.grade) === grade)
  );
  termButtons.forEach((item) => item.classList.remove("is-active"));
  fillTermHints(selectedGrade);
  updateNegSwitch(selectedGrade);
  updateNotesSwitch(selectedGrade);
  show(termBlock);
  hide(countBlock);
  resetLaterSteps();
  if (scroll) {
    scrollToNext(termBlock);
  }
}

function selectTerm(term, options = {}) {
  const { scroll = true } = options;
  selectedTerm = term;
  termButtons.forEach((item) =>
    item.classList.toggle("is-active", Number(item.dataset.term) === term)
  );
  fillOperations(selectedGrade, selectedTerm);
  show(countBlock);
  resetLaterSteps({ preserveTopics: true });
  if (scroll) {
    scrollToNext(countBlock);
  }
}

function getLockedGrade() {
  const fromBody = Number(document.body.dataset.lockedGrade);
  if (fromBody >= 1 && fromBody <= 6) {
    return fromBody;
  }
  const match = window.location.pathname.match(/\/klasse-(\d+)\/uebungen\/?$/);
  if (match) {
    return Number(match[1]);
  }
  return 0;
}

function applyCompactSetupLayout() {
  if (gradeBlock) {
    hide(gradeBlock);
  }
  document.body.classList.add("is-grade-locked");
  const termTitle = termBlock.querySelector("h2");
  const countTitle = countBlock.querySelector("h2");
  const operationTitle = operationBlock.querySelector("h2");
  if (termTitle) {
    termTitle.textContent = "1. Halbjahr wählen";
  }
  if (countTitle) {
    countTitle.textContent = "2. Anzahl der Aufgaben";
  }
  if (operationTitle) {
    operationTitle.textContent = "3. Was möchtest du üben?";
  }
}

function parseTopicIds(themen) {
  if (!themen) {
    return [];
  }
  return themen
    .split(",")
    .map((item) => item.trim())
    .filter((item) => topics.some((topic) => topic.id === item));
}

function initPageEntry() {
  const lockedGrade = getLockedGrade();
  const params = new URLSearchParams(window.location.search);
  const gradeFromUrl = Number(params.get("klasse"));
  const termParam = Number(params.get("halbjahr"));
  const topicIds = parseTopicIds(params.get("themen"));
  const hasTerm = termParam === 1 || termParam === 2;

  if (!lockedGrade && gradeFromUrl >= 1 && gradeFromUrl <= 6) {
    params.delete("klasse");
    const query = params.toString();
    window.location.replace(`/klasse-${gradeFromUrl}/uebungen${query ? `?${query}` : ""}`);
    return;
  }

  if (!lockedGrade) {
    return;
  }

  applyCompactSetupLayout();
  selectGrade(lockedGrade, { scroll: false });

  if (hasTerm || topicIds.length) {
    if (topicIds.length) {
      pendingTopicIds = new Set(topicIds);
    }
    selectTerm(hasTerm ? termParam : 2, { scroll: false });
    if (topicIds.length) {
      scrollToNext(operationBlock, "center-top");
    } else if (hasTerm) {
      scrollToNext(countBlock);
    }
    return;
  }

  scrollToNext(termBlock);
}

gradeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectGrade(Number(button.dataset.grade));
  });
});

termButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectTerm(Number(button.dataset.term));
  });
});

initPageEntry();

countSelect.addEventListener("change", () => {
  if (!countSelect.value) {
    return;
  }
  show(operationBlock);
  countdownMinutesDirty = false;
  syncCountdownPreset();
  if (selectedTopics().length) {
    showCreateStep();
  } else {
    hideCreateStep();
    scrollToNext(operationBlock, "center-top");
  }
});

blockModeToggle?.addEventListener("change", () => {
  setBlockModeUi(isBlockMode());
  countdownMinutesDirty = false;
  syncCountdownPreset();
  if (isBlockMode() && !selectedTopics().length) {
    scrollToNext(operationBlock, "center-top");
  }
});

operationList.addEventListener("mousedown", (event) => {
  if (event.target.closest("[data-block-delta]")) {
    event.preventDefault();
  }
});

operationList.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-block-delta]");
  if (!btn || !isBlockMode()) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  const choice = btn.closest(".topic-choice");
  const input = choice?.querySelector("input[data-topic]");
  if (!input || !input.checked || input.disabled) {
    return;
  }
  const delta = Number(btn.dataset.blockDelta);
  const current = Math.max(1, topicBlocksOf(input) || 1);
  let next = current + delta;
  if (next < 1) {
    next = 1;
  }
  const others = totalSelectedBlocks() - current;
  if (others + next > MAX_TASK_BLOCKS) {
    next = MAX_TASK_BLOCKS - others;
  }
  input.dataset.blocks = String(Math.max(1, next));
  updateBlockModeSummary();
  updateTopicBlockControls();
  countdownMinutesDirty = false;
  syncCountdownPreset();
});

operationList.addEventListener("change", (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.classList.contains("group-toggle")) {
    const group = target.closest(".topic-group");
    group.querySelectorAll("input[data-topic]:not(:disabled)").forEach((box) => {
      box.checked = target.checked;
      if (!target.checked) {
        delete box.dataset.blocks;
      }
    });
  }
  if (isBlockMode() && target instanceof HTMLInputElement && target.matches("input[data-topic]")) {
    if (target.checked) {
      if (topicBlocksOf(target) < 1) {
        target.dataset.blocks = "1";
      }
    } else {
      delete target.dataset.blocks;
    }
  }
  if (isBlockMode()) {
    clampBlockBudget();
    ensureDefaultBlocks();
    updateBlockModeSummary();
    updateTopicBlockControls();
    operationList.querySelectorAll(".topic-group").forEach((groupEl) => syncGroupToggle(groupEl));
  }
  const group = target instanceof Element ? target.closest(".topic-group") : null;
  if (group) {
    syncGroupToggle(group);
  }
  countdownMinutesDirty = false;
  syncCountdownPreset();
  if (selectedTopics().length) {
    showCreateStep();
  } else {
    hideCreateStep();
  }
});

function snapshotTasks() {
  return [...document.querySelectorAll(".task")].map((row) => {
    const digits = [...row.querySelectorAll(".sum-digit-input")];
    const radios = [...row.querySelectorAll("input[type=radio]")];
    const input = row.querySelector(".answer-input");
    const notes = row.closest(".task-item")?.querySelector("textarea");
    let value = "";
    if (digits.length) {
      value = digits.map((digit) => digit.value);
    } else if (radios.length) {
      value = radios.find((radio) => radio.checked)?.value ?? "";
    } else if (input) {
      value = input.value;
    }
    return {
      stacked: digits.length > 0,
      choice: radios.length > 0,
      value,
      notes: notes ? notes.value : "",
      disabled: digits.length
        ? digits.every((digit) => digit.disabled)
        : radios.length
          ? radios.every((radio) => radio.disabled)
          : Boolean(input?.disabled),
      correct: row.classList.contains("is-correct"),
      wrong: row.classList.contains("is-wrong"),
      late: row.classList.contains("is-late"),
    };
  });
}

function applySnapshot(snapshot) {
  document.querySelectorAll(".task").forEach((row, index) => {
    const saved = snapshot[index];
    if (!saved) {
      return;
    }
    const digits = [...row.querySelectorAll(".sum-digit-input")];
    const radios = [...row.querySelectorAll("input[type=radio]")];
    const input = row.querySelector(".answer-input");
    const notes = row.closest(".task-item")?.querySelector("textarea");

    if (digits.length) {
      let values = Array.isArray(saved.value) ? [...saved.value] : String(saved.value ?? "").replace(/[^0-9]/g, "").split("");
      while (values.length < digits.length) {
        values.unshift("");
      }
      values = values.slice(-digits.length);
      digits.forEach((digit, digitIndex) => {
        digit.value = values[digitIndex] ?? "";
        digit.disabled = saved.disabled;
      });
    } else if (radios.length) {
      radios.forEach((radio) => {
        radio.checked = radio.value === saved.value;
        radio.disabled = saved.disabled;
      });
    } else if (input) {
      input.value = Array.isArray(saved.value)
        ? saved.value.join("").replace(/^0+(?=\d)/, "")
        : saved.value;
      input.disabled = saved.disabled;
    }

    if (notes) {
      notes.value = saved.notes;
    }
    row.classList.toggle("is-correct", saved.correct);
    row.classList.toggle("is-wrong", saved.wrong);
    row.classList.toggle("is-late", saved.late);
  });
}

function taskOperands(task) {
  if (Array.isArray(task.operands) && task.operands.length >= 2) {
    return task.operands;
  }
  if (task.a != null && task.b != null) {
    return [task.a, task.b];
  }
  return [];
}

function stackColumns(task) {
  const lengthOf = (number) => String(Math.abs(number)).length;
  const operands = taskOperands(task);
  let columns = Math.max(...operands.map(lengthOf), lengthOf(task.answer), 1);
  if (operands.some((number) => number < 0)) {
    columns += 1;
  }
  return columns;
}

function operandDigitHtml(number, columns) {
  const digits = String(Math.abs(number)).split("");
  const start = columns - digits.length;
  let html = "";
  for (let index = 0; index < columns; index += 1) {
    if (number < 0 && index === start - 1) {
      html += `<span class="sum-digit">−</span>`;
    } else if (index < start) {
      html += `<span class="sum-digit"></span>`;
    } else {
      html += `<span class="sum-digit">${digits[index - start]}</span>`;
    }
  }
  return html;
}

function answerDigitHtml(taskIndex, columns) {
  let html = "";
  for (let index = 0; index < columns; index += 1) {
    const isOnes = index === columns - 1;
    html += `
      <input
        class="sum-digit-input"
        type="text"
        inputmode="numeric"
        maxlength="1"
        name="d-${taskIndex}-${index}"
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        tabindex="${isOnes ? 0 : -1}"
        aria-label="Ziffer von rechts ${columns - index}, Aufgabe ${taskIndex + 1}"
      />
    `;
  }
  return html;
}

function readTaskAnswer(row) {
  const digits = [...row.querySelectorAll(".sum-digit-input")];
  if (digits.length) {
    if (digits.every((digit) => digit.value.trim() === "")) {
      return null;
    }
    const joined = digits.map((digit) => (digit.value.trim() === "" ? "0" : digit.value.trim())).join("");
    const number = Number(joined);
    return Number.isFinite(number) ? number : NaN;
  }
  const radios = [...row.querySelectorAll("input[type=radio]")];
  if (radios.length) {
    const chosen = radios.find((radio) => radio.checked);
    return chosen ? chosen.value : null;
  }
  const input = row.querySelector(".answer-input");
  if (!input) {
    return null;
  }
  const raw = input.value.trim();
  return raw === "" ? null : raw;
}

function isAnswerCorrect(task, value) {
  if (value === null) {
    return false;
  }
  if (task.kind === "choice" || task.kind === "text") {
    const left = String(value).trim().toLowerCase().replace(/\s/g, "");
    const right = String(task.answer).trim().toLowerCase().replace(/\s/g, "");
    if (task.type === "coordinates") {
      const normalize = (text) => text.replace(/[()]/g, "").replace(/[|,;]/g, "-");
      return normalize(left) === normalize(right);
    }
    if (task.type === "clock") {
      const clock = left.replace(".", ":");
      return clock === right || clock === `0${right}`;
    }
    return left === right;
  }
  if (task.kind === "fraction") {
    const parsed = parseFractionInput(String(value));
    if (!parsed) {
      const asNumber = parseNumberInput(String(value));
      return asNumber !== null && Number.isFinite(asNumber) && Math.abs(asNumber - task.answer.n / task.answer.d) < 0.001;
    }
    return parsed.n * task.answer.d === parsed.d * task.answer.n;
  }
  const number = parseNumberInput(String(value));
  if (number === null || Number.isNaN(number)) {
    return false;
  }
  if (task.kind === "decimal") {
    return Math.abs(number - Number(task.answer)) < 0.001;
  }
  return number === task.answer;
}

function setTaskInputsDisabled(row, disabled) {
  row.querySelectorAll("input, textarea").forEach((input) => {
    input.disabled = disabled;
  });
}

function setPracticeLocked(locked) {
  worksheet.classList.toggle("is-locked", locked);
  blocks.querySelectorAll("input, textarea").forEach((el) => {
    el.disabled = locked;
  });
}

function stackDigitInputs(row) {
  return [...row.querySelectorAll(".sum-digit-input")];
}

function focusTaskEntry(row) {
  const digits = stackDigitInputs(row);
  if (digits.length) {
    digits[digits.length - 1].focus();
    return;
  }
  const radio = row.querySelector("input[type=radio]");
  if (radio) {
    radio.focus();
    return;
  }
  row.querySelector(".answer-input")?.focus();
}

const workingTypes = new Set([
  "addition",
  "subtraction",
  "multiplication",
  "division",
  "order_ops",
  "brackets",
  "laws",
  "placeholder",
  "equations",
  "fractions_share",
  "fractions",
  "decimals",
  "percent",
  "proportion",
  "mean",
  "word",
  "double_half",
  "round",
  "estimate",
  "table_read",
  "money",
  "length",
  "length_convert",
  "weight",
  "time_units",
  "perimeter_area",
  "scale",
  "cuboid",
  "unit_convert",
  "pattern",
  "angles",
]);

function usesNotesField(task) {
  if (!notesToggle.checked || task.kind === "choice") {
    return false;
  }
  return workingTypes.has(task.type) || isArithmeticTask(task);
}

function appendNotesField(item, index) {
  const notes = document.createElement("label");
  notes.className = "task-notes";
  notes.innerHTML = `
    <span>Rechenweg</span>
    <textarea rows="2" aria-label="Rechenweg Aufgabe ${index + 1}"></textarea>
  `;
  item.append(notes);
}
function isArithmeticTask(task) {
  return (
    task.operation === "addition" ||
    task.operation === "subtraction" ||
    task.operation === "multiplication" ||
    task.operation === "division"
  );
}

function usesWrittenStack(task) {
  return (
    notesToggle.checked &&
    (task.operation === "addition" || task.operation === "subtraction")
  );
}

function answerInput(index, task, allowMinusInput) {
  const wide = task.wide ? " is-wide" : "";
  const mode = task.kind === "text" || task.kind === "fraction" || task.allowMinus || allowMinusInput ? "text" : "numeric";
  return `
    <input
      class="answer-input${wide}"
      type="text"
      inputmode="${mode}"
      autocomplete="off"
      aria-label="Ergebnis Aufgabe ${index + 1}"
    />
  `;
}

function answerControl(index, task, allowMinusInput) {
  const input = answerInput(index, task, allowMinusInput);
  if (!task.answerLabel) {
    return input;
  }
  return `<div class="answer-wrap"><span class="answer-label">${escapeHtml(task.answerLabel)}</span>${input}</div>`;
}

function choiceHtml(task, index) {
  const options = task.choices
    .map(
      (choice) => `
        <label class="choice-chip">
          <input type="radio" name="c-${index}" value="${escapeAttr(choice.value)}" />
          <span>${choice.html || escapeHtml(choice.label)}</span>
        </label>`
    )
    .join("");
  return `<div class="answer-choices" role="radiogroup" aria-label="Antwort Aufgabe ${index + 1}">${options}</div>`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(text) {
  return escapeHtml(text);
}

function setNotesEnabled(on, rerender = true) {
  const snapshot = rerender ? snapshotTasks() : [];
  notesToggle.checked = on;
  worksheet.classList.toggle("has-notes", on);
  if (rerender && tasks.length) {
    renderTasks();
    applySnapshot(snapshot);
    if (!timerStarted) {
      setPracticeLocked(true);
    }
  }
}

notesToggle.addEventListener("change", () => {
  setNotesEnabled(notesToggle.checked);
  countdownMinutesDirty = false;
  syncCountdownPreset();
});

countdownToggle.addEventListener("change", () => {
  if (countdownToggle.checked) {
    countdownMinutesDirty = false;
    show(countdownSetup);
    syncCountdownPreset();
    return;
  }
  hide(countdownSetup);
  countdownMinutesDirty = false;
});

countdownMinutesInput.addEventListener("input", () => {
  countdownMinutesDirty = true;
});

negToggle.addEventListener("change", () => {
  countdownMinutesDirty = false;
  syncCountdownPreset();
});

createBtn.addEventListener("click", () => {
  if (!buildWorksheet()) {
    return;
  }
  scrollToNext(worksheet, "start");
});

function countCorrectTasks() {
  return document.querySelectorAll(".task.is-correct").length;
}

function updateProgress() {
  if (!tasks.length || !timerStarted) {
    hide(progressEl);
    progressEl.textContent = "";
    return;
  }
  const correct = countCorrectTasks();
  show(progressEl);
  progressEl.textContent = `${correct} von ${tasks.length} richtig`;
}

function buildWorksheet() {
  const selectedOps = selectedTopics();
  const blockMode = isBlockMode();
  const count = selectedTaskCount();
  if (!count || !selectedTerm || !selectedOps.length) {
    return false;
  }
  tasks = blockMode
    ? generateTasksFromQuotas(selectedGrade, selectedTerm, selectedTopicQuotas(), negativesAllowed())
    : generateTasks(selectedGrade, selectedTerm, count, selectedOps, negativesAllowed());
  activeTopicIds = [...selectedOps];
  activeBlockMode = blockMode;
  celebrated = false;
  setNotesEnabled(notesToggle.checked, false);
  renderTasks();
  statusEl.textContent = "Klicke auf Aufgaben beginnen, wenn du so weit bist.";
  armTimers();
  setPracticeLocked(true);
  hideAds();
  show(worksheet);
  show(startBtn);
  startBtn.disabled = false;
  show(checkBtn);
  show(pdfBtn);
  show(newSheetBtn);
  hide(progressEl);
  progressEl.textContent = "";
  if (countdownActive) {
    show(countdownEl);
  } else {
    hide(countdownEl);
  }
  return true;
}

newSheetBtn.addEventListener("click", () => {
  stopFireworks();
  if (successDialog.open) {
    successDialog.close();
  }
  if (!buildWorksheet()) {
    return;
  }
  scrollToNext(worksheet, "start");
});

startBtn.addEventListener("click", () => {
  if (timerStarted) {
    return;
  }
  startTimer();
  setPracticeLocked(false);
  startBtn.disabled = true;
  if (statusEl.textContent === "Klicke auf Aufgaben beginnen, wenn du so weit bist.") {
    statusEl.textContent = "";
  }
  updateProgress();
});

function worksheetTopicLine() {
  if (activeBlockMode) {
    const counts = new Map();
    for (const task of tasks) {
      counts.set(task.type, (counts.get(task.type) || 0) + 1);
    }
    const parts = [...counts]
      .map(([id, n]) => {
        const label = getTopic(id)?.label;
        return label ? `${label} ${n}` : null;
      })
      .filter(Boolean);
    return parts.length ? `Themen: ${parts.join(", ")}` : "";
  }
  const topicNames = activeTopicIds.map((id) => getTopic(id)?.label).filter(Boolean);
  return topicNames.length ? `Themen: ${topicNames.join(", ")}` : "";
}

function worksheetMeta() {
  return {
    title: "Mathematik Übungsaufgaben",
    line: `Klasse ${selectedGrade} · ${selectedTerm}. Halbjahr · ${tasks.length} Aufgaben`,
    topics: worksheetTopicLine(),
    fileName: `mathe-klasse-${selectedGrade}-${selectedTerm}hj-${tasks.length}-aufgaben.pdf`,
  };
}

function fillPrintHeader() {
  if (!printHeader) {
    return;
  }
  const meta = worksheetMeta();
  printHeader.innerHTML = `
    <p class="kicker">Klassen 1 bis 6</p>
    <h1>${escapeHtml(meta.title)}</h1>
    <p>${escapeHtml(meta.line)}</p>
    ${meta.topics ? `<p>${escapeHtml(meta.topics)}</p>` : ""}
    <p class="print-meta">Name: ______________________ &nbsp; Datum: ______________</p>
  `;
}

function blockHeading(slice, start, end) {
  const range = `${start + 1}–${end}`;
  if (!activeBlockMode) {
    return `Aufgaben ${range}`;
  }
  const labels = [...new Set(slice.map((task) => getTopic(task.type)?.label).filter(Boolean))];
  if (labels.length === 1) {
    return `${labels[0]} · ${range}`;
  }
  return `Aufgaben ${range}`;
}

function renderTasks(target = blocks, options = {}) {
  const forPdf = Boolean(options.forPdf);
  if (target === blocks) {
    fillPrintHeader();
  }
  target.innerHTML = "";
  const blockCount = Math.ceil(tasks.length / 10);
  const allowMinusInput = tasks.some((task) => {
    const operands = taskOperands(task);
    return task.answer < 0 || operands.some((number) => number < 0);
  });

  for (let blockIndex = 0; blockIndex < blockCount; blockIndex += 1) {
    const start = blockIndex * 10;
    const end = Math.min(start + 10, tasks.length);
    const slice = tasks.slice(start, end);
    const block = document.createElement("article");
    block.className = "block";
    block.innerHTML = `<h3>${escapeHtml(blockHeading(slice, start, end))}</h3>`;

    for (let index = start; index < end; index += 1) {
      const task = tasks[index];
      const row = document.createElement("div");
      row.className = "task";
      row.dataset.index = String(index);
      const item = document.createElement("div");
      item.className = "task-item";
      if (!forPdf && usesWrittenStack(task)) {
        const columns = stackColumns(task);
        const operands = taskOperands(task);
        const operandRows = operands
          .map((number, operandIndex) => {
            const isLast = operandIndex === operands.length - 1;
            const op =
              operandIndex === 0
                ? `<span class="sum-op-space"></span>`
                : `<span class="sum-op">${symbols[task.operation]}</span>`;
            return `
            <div class="sum-row${isLast ? " sum-row-last" : ""}">
              ${op}
              ${operandDigitHtml(number, columns)}
            </div>`;
          })
          .join("");
        row.classList.add("is-stack");
        row.innerHTML = `
          <span class="task-num">${index + 1}.</span>
          <div class="sum-stack" style="--cols: ${columns}">
            ${operandRows}
            <div class="sum-row sum-row-answer">
              <span class="sum-op-space"></span>
              ${answerDigitHtml(index, columns)}
            </div>
          </div>
        `;
        item.append(row);
      } else if (isArithmeticTask(task)) {
        const operands = taskOperands(task);
        const equation =
          operands.length > 0
            ? operands
                .map((number, operandIndex) => {
                  if (operandIndex === 0) {
                    return `<span>${formatOperand(number, false)}</span>`;
                  }
                  return `<span>${symbols[task.operation]}</span><span>${formatOperand(number, true)}</span>`;
                })
                .join("")
            : "";
        row.innerHTML = `
          <span class="task-num">${index + 1}.</span>
          <span class="task-eq">
            ${equation}
            <span>=</span>
          </span>
          ${answerInput(index, task, allowMinusInput)}
        `;
        item.append(row);
        if (!forPdf && usesNotesField(task)) {
          appendNotesField(item, index);
        }
      } else {
        const prompt = task.promptHtml || escapeHtml(task.prompt);
        const control = task.kind === "choice" ? choiceHtml(task, index) : answerControl(index, task, Boolean(task.allowMinus));
        row.innerHTML = `
          <span class="task-num">${index + 1}.</span>
          <div class="task-main">
            ${task.visualHtml ? `<div class="task-visual">${task.visualHtml}</div>` : ""}
            <div class="task-prompt">${prompt}</div>
            ${control}
          </div>
        `;
        item.append(row);
        if (!forPdf && usesNotesField(task)) {
          appendNotesField(item, index);
        }
      }
      block.append(item);
    }

    target.append(block);
  }
}

function loadScriptOnce(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing) {
      if (existing.dataset.ready === "1") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Skript nicht geladen: ${src}`)), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.src = src;
    script.addEventListener("load", () => {
      script.dataset.ready = "1";
      resolve();
    }, { once: true });
    script.addEventListener("error", () => reject(new Error(`Skript nicht geladen: ${src}`)), { once: true });
    document.head.append(script);
  });
}

async function ensurePdfLibraries() {
  await loadScriptOnce("https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js");
  await loadScriptOnce("https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js");
  if (typeof window.html2canvas !== "function" || !window.jspdf?.jsPDF) {
    throw new Error("PDF-Bibliotheken nicht bereit");
  }
}

function clearPdfCloneInputs(root) {
  root.querySelectorAll("input").forEach((input) => {
    if (input.type === "radio" || input.type === "checkbox") {
      input.checked = false;
    } else {
      input.value = "";
    }
    input.disabled = false;
    input.removeAttribute("tabindex");
  });
  root.querySelectorAll("textarea").forEach((area) => {
    area.value = "";
    area.disabled = false;
  });
  root.querySelectorAll(".task").forEach((row) => {
    row.classList.remove("is-correct", "is-wrong", "is-late");
    row.removeAttribute("title");
  });
}

function pdfHeaderHtml() {
  const meta = worksheetMeta();
  return `
    <header class="pdf-header">
      <p class="kicker">Klassen 1 bis 6</p>
      <h1>${escapeHtml(meta.title)}</h1>
      <p>${escapeHtml(meta.line)}</p>
      ${meta.topics ? `<p>${escapeHtml(meta.topics)}</p>` : ""}
      <p class="print-meta">Name: ______________________ &nbsp; Datum: ______________</p>
    </header>
  `;
}

function pdfFooterHtml(pageNum, pageCount) {
  return `
    <footer class="pdf-site-footer">
      <span class="pdf-site-footer-page">Seite ${pageNum} von ${pageCount}</span>
      <span class="pdf-site-footer-promo">
        <span class="pdf-site-footer-text">Weitere Aufgaben unter mathe-testen.de</span>
        <img
          class="pdf-site-footer-qr"
          src="/icons/qr-mathe-testen.png"
          width="52"
          height="52"
          alt=""
        />
      </span>
    </footer>
  `;
}

function preparePdfAnswerCells(root) {
  root.querySelectorAll(".task > .answer-input").forEach((input) => {
    const cell = document.createElement("span");
    cell.className = "pdf-answer-cell";
    input.replaceWith(cell);
    cell.append(input);
  });
  root.querySelectorAll(".task > .answer-wrap").forEach((wrap) => {
    wrap.classList.add("pdf-answer-cell");
  });
}

async function buildPdfSheet() {
  const sheet = document.createElement("div");
  sheet.className = "pdf-sheet";
  sheet.setAttribute("aria-hidden", "true");

  const staging = document.createElement("div");
  renderTasks(staging, { forPdf: true });
  const blockEls = [...staging.children];
  const perPage = 8;
  const pageCount = Math.max(1, Math.ceil(blockEls.length / perPage));

  for (let i = 0; i < blockEls.length; i += perPage) {
    const pageNum = Math.floor(i / perPage) + 1;
    const page = document.createElement("section");
    page.className = "pdf-page pdf-keep";
    if (i === 0) {
      page.insertAdjacentHTML("afterbegin", pdfHeaderHtml());
    }
    const grid = document.createElement("div");
    grid.className = "pdf-blocks";
    blockEls.slice(i, i + perPage).forEach((block) => grid.append(block));
    page.append(grid);
    page.insertAdjacentHTML("beforeend", pdfFooterHtml(pageNum, pageCount));
    sheet.append(page);
  }

  clearPdfCloneInputs(sheet);
  preparePdfAnswerCells(sheet);
  document.body.append(sheet);
  await Promise.all(
    [...sheet.querySelectorAll("img")].map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            })
    )
  );
  return sheet;
}

async function capturePdfPiece(element, widthPx, heightPx) {
  const canvas = await window.html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    width: widthPx,
    height: heightPx,
    windowWidth: widthPx,
    windowHeight: heightPx,
    logging: false,
    useCORS: true,
  });
  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: canvas.width,
    height: canvas.height,
  };
}

async function downloadWorksheetPdf() {
  if (!tasks.length) {
    return;
  }

  const previousLabel = pdfBtn.textContent;
  pdfBtn.disabled = true;
  pdfBtn.textContent = "PDF wird erstellt…";

  let sheet = null;
  const widthPx = 794;
  const heightPx = 1123;

  try {
    await ensurePdfLibraries();
    await document.fonts?.ready;
    sheet = await buildPdfSheet();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const pieces = [...sheet.querySelectorAll(".pdf-keep")];
    const images = [];
    for (const piece of pieces) {
      images.push(await capturePdfPiece(piece, widthPx, heightPx));
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 8;
    const usableW = pageW - margin * 2;
    const usableH = pageH - margin * 2;

    images.forEach((image, index) => {
      if (index > 0) {
        doc.addPage();
      }
      doc.addImage(image.dataUrl, "PNG", margin, margin, usableW, usableH, undefined, "FAST");
    });

    doc.save(worksheetMeta().fileName);
  } catch (error) {
    console.error(error);
    window.print();
  } finally {
    sheet?.remove();
    pdfBtn.disabled = false;
    pdfBtn.textContent = previousLabel;
  }
}

pdfBtn.addEventListener("click", () => {
  downloadWorksheetPdf();
});

checkBtn.addEventListener("click", () => {
  if (!timerStarted) {
    statusEl.textContent = "Klicke zuerst auf Aufgaben beginnen.";
    return;
  }

  const rows = [...document.querySelectorAll(".task")];
  let correct = 0;
  let checked = 0;

  rows.forEach((row) => {
    const value = readTaskAnswer(row);
    if (value === null) {
      row.classList.remove("is-wrong");
      return;
    }

    checked += 1;
    const index = Number(row.dataset.index);
    const isCorrect = isAnswerCorrect(tasks[index], value);

    if (isCorrect) {
      correct += 1;
      row.classList.remove("is-wrong");
      row.classList.add("is-correct");
      setTaskInputsDisabled(row, true);
      row.title = row.classList.contains("is-late")
        ? "Richtig, aber nach der Zeit eingetragen"
        : "";
    } else {
      row.classList.remove("is-correct");
      row.classList.add("is-wrong");
      setTaskInputsDisabled(row, false);
      row.title = row.classList.contains("is-late") ? "Nach der Zeit eingetragen" : "";
    }
  });

  if (checked === 0) {
    statusEl.textContent = "Bitte zuerst Ergebnisse eintragen.";
    return;
  }

  const lateCorrect = rows.filter(
    (row) => row.classList.contains("is-correct") && row.classList.contains("is-late")
  ).length;
  const lateHint =
    lateCorrect === 0
      ? ""
      : lateCorrect === 1
        ? " 1 davon nach der Zeit."
        : ` ${lateCorrect} davon nach der Zeit.`;

  if (correct === tasks.length) {
    statusEl.textContent = `Sehr gut! Alle Aufgaben sind richtig.${lateHint}`;
    freezeTimer();
    updateProgress();
    if (!celebrated) {
      celebrated = true;
      openSuccess();
    }
    return;
  }

  statusEl.textContent = `${correct} von ${tasks.length} richtig.${lateHint} Falsche oder leere Felder kannst du noch ausfüllen.`;
  updateProgress();
});

function markLateIfNeeded(row, target) {
  if (!row || !countdownActive || !countdownExpired || target?.disabled) {
    return;
  }
  if (target instanceof HTMLTextAreaElement) {
    return;
  }
  row.classList.add("is-late");
}

blocks.addEventListener("change", (event) => {
  if (!(event.target instanceof HTMLInputElement) || event.target.type !== "radio") {
    return;
  }
  const row = event.target.closest(".task");
  if (row && !event.target.disabled) {
    row.classList.remove("is-wrong");
    markLateIfNeeded(row, event.target);
  }
});

blocks.addEventListener("input", (event) => {
  if (!(event.target instanceof HTMLInputElement)) {
    return;
  }
  const row = event.target.closest(".task");
  if (row && !event.target.disabled) {
    row.classList.remove("is-wrong");
    markLateIfNeeded(row, event.target);
  }

  if (!event.target.classList.contains("sum-digit-input") || event.target.disabled) {
    return;
  }
  const digit = event.target.value.replace(/\D/g, "").slice(-1);
  event.target.value = digit;
  if (!digit) {
    return;
  }
  const digits = stackDigitInputs(row);
  const index = digits.indexOf(event.target);
  if (index > 0) {
    digits[index - 1].focus();
    digits[index - 1].select();
  }
});

blocks.addEventListener("keydown", (event) => {
  if (!(event.target instanceof HTMLInputElement)) {
    return;
  }

  const row = event.target.closest(".task");
  const stacked = event.target.classList.contains("sum-digit-input");

  if (stacked) {
    const digits = stackDigitInputs(row);
    const index = digits.indexOf(event.target);

    if (event.key === "Backspace") {
      event.preventDefault();
      if (event.target.value) {
        event.target.value = "";
      } else if (index < digits.length - 1) {
        digits[index + 1].focus();
        digits[index + 1].value = "";
      }
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      digits[index - 1].focus();
      return;
    }

    if (event.key === "ArrowRight" && index < digits.length - 1) {
      event.preventDefault();
      digits[index + 1].focus();
      return;
    }
  }

  if (event.key !== "Enter") {
    return;
  }
  event.preventDefault();
  const tasksRows = [...blocks.querySelectorAll(".task")];
  const nextRow = tasksRows[tasksRows.indexOf(row) + 1];
  if (nextRow) {
    focusTaskEntry(nextRow);
  } else {
    checkBtn.click();
  }
});

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pickSuccessMessage() {
  let index = randomInt(0, successMessages.length - 1);
  if (successMessages.length > 1 && index === lastSuccessIndex) {
    index = (index + 1) % successMessages.length;
  }
  lastSuccessIndex = index;
  return successMessages[index];
}

function formatClock(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatDurationText(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const parts = [];
  if (hours) {
    parts.push(hours === 1 ? "1 Stunde" : `${hours} Stunden`);
  }
  if (minutes) {
    parts.push(minutes === 1 ? "1 Minute" : `${minutes} Minuten`);
  }
  if (seconds || parts.length === 0) {
    parts.push(seconds === 1 ? "1 Sekunde" : `${seconds} Sekunden`);
  }
  if (parts.length === 1) {
    return parts[0];
  }
  if (parts.length === 2) {
    return `${parts[0]} und ${parts[1]}`;
  }
  return `${parts[0]}, ${parts[1]} und ${parts[2]}`;
}

function timerNow() {
  if (!timerStarted) {
    return 0;
  }
  return timerFrozen ? timerElapsedMs : Date.now() - timerStartedAt;
}

function countdownRemaining() {
  if (!countdownActive) {
    return 0;
  }
  if (!timerStarted) {
    return countdownLimitMs;
  }
  const limitSec = Math.round(countdownLimitMs / 1000);
  const elapsedSec = Math.floor(timerNow() / 1000);
  return Math.max(0, limitSec - elapsedSec) * 1000;
}

function updateTimerDisplay() {
  timerEl.textContent = formatClock(timerNow());
  if (!countdownActive) {
    return;
  }
  const remaining = countdownRemaining();
  countdownEl.textContent = formatClock(remaining);
  countdownEl.classList.toggle("is-low", timerStarted && remaining > 0 && remaining <= 30000);
  countdownEl.classList.toggle("is-over", timerStarted && remaining === 0);
  if (timerStarted && remaining === 0 && !countdownExpired && !timerFrozen) {
    countdownExpired = true;
    worksheet.classList.add("is-overtime");
    if (!celebrated) {
      statusEl.textContent = "Die Zeit ist um. Du darfst trotzdem weiterrechnen.";
    }
  }
}

function clearTimerInterval() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = 0;
  }
}

function readCountdownMinutes() {
  return Math.min(90, Math.max(1, Number(countdownMinutesInput.value) || suggestedCountdownMinutes()));
}

function armTimers() {
  clearTimerInterval();
  timerStarted = false;
  timerFrozen = false;
  timerStartedAt = 0;
  timerElapsedMs = 0;
  countdownExpired = false;
  worksheet.classList.remove("is-overtime");
  const minutes = readCountdownMinutes();
  countdownMinutesInput.value = String(minutes);
  countdownActive = countdownToggle.checked && minutes >= 1;
  countdownLimitMs = countdownActive ? minutes * 60 * 1000 : 0;
  countdownEl.classList.remove("is-low", "is-over");
  updateTimerDisplay();
}

function startTimer() {
  clearTimerInterval();
  timerStarted = true;
  timerFrozen = false;
  timerStartedAt = Date.now();
  timerElapsedMs = 0;
  countdownExpired = false;
  updateTimerDisplay();
  timerInterval = setInterval(updateTimerDisplay, 200);
}

function freezeTimer() {
  if (!timerStarted || timerFrozen) {
    return;
  }
  timerElapsedMs = Date.now() - timerStartedAt;
  timerFrozen = true;
  clearTimerInterval();
  updateTimerDisplay();
}

function openSuccess() {
  const message = pickSuccessMessage();
  const count = tasks.length;
  const elapsed = timerNow();
  const taskText = count === 1 ? "die eine Aufgabe" : `die ${count} Aufgaben`;
  const best = recordBestTime(selectedGrade, selectedTerm, count, activeTopicIds, elapsed);
  const bestEl = document.getElementById("success-best");
  document.getElementById("success-title").textContent = message.title;
  document.getElementById("success-text").textContent = message.text;
  document.getElementById("success-time").textContent =
    `Für ${taskText} hast du ${formatDurationText(elapsed)} gebraucht.`;
  bestEl.textContent = bestTimeMessage(count, best);
  bestEl.classList.toggle("is-record", best.isNewBest);
  successDialog.showModal();
  if (!prefersReducedMotion()) {
    startFireworks();
  }
}

const BEST_TIMES_KEY = "mathe-bestzeiten-v1";

function bestTimeKey(grade, term, count, topicIds) {
  const mix = [...topicIds].sort().join("+");
  return `${grade}-${term}-${count}-${mix}`;
}

function loadBestTimes() {
  try {
    const raw = localStorage.getItem(BEST_TIMES_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveBestTimes(times) {
  try {
    localStorage.setItem(BEST_TIMES_KEY, JSON.stringify(times));
  } catch {
    /* Speicher voll oder blockiert – Bestzeit nur für diese Runde merken */
  }
}

function clearBestTimes() {
  try {
    localStorage.removeItem(BEST_TIMES_KEY);
  } catch {
    /* ignorieren */
  }
}

function timeScore(ms) {
  return Math.max(0, Math.floor(ms / 1000));
}

function recordBestTime(grade, term, count, topicIds, ms) {
  const times = loadBestTimes();
  const key = bestTimeKey(grade, term, count, topicIds);
  const previous = Number(times[key]);
  const hasPrevious = Number.isFinite(previous) && previous >= 0;
  const isNewBest = !hasPrevious || timeScore(ms) < timeScore(previous);
  if (isNewBest) {
    times[key] = ms;
    saveBestTimes(times);
  }
  return {
    hasPrevious,
    previous: hasPrevious ? previous : null,
    isNewBest,
  };
}

function bestTimeMessage(count, result) {
  const countText = count === 1 ? "1 Aufgabe" : `${count} Aufgaben`;
  if (!result.hasPrevious) {
    return `Für ${countText} ist das deine erste Bestzeit.`;
  }
  if (result.isNewBest) {
    return `Für ${countText} ist das eine neue Bestzeit! Vorher: ${formatDurationText(result.previous)}.`;
  }
  return `Deine Bestzeit für ${countText} ist ${formatDurationText(result.previous)}. Die knackst du bestimmt bald.`;
}

function closeSuccess() {
  stopFireworks();
  if (successDialog.open) {
    successDialog.close();
  }
}

successClose.addEventListener("click", closeSuccess);

successDialog.addEventListener("click", (event) => {
  if (event.target === successDialog) {
    closeSuccess();
  }
});

successDialog.addEventListener("close", stopFireworks);

const resetBestBtn = document.getElementById("reset-best-btn");
const resetBestDialog = document.getElementById("reset-best-dialog");
const resetBestCancel = document.getElementById("reset-best-cancel");
const resetBestConfirm = document.getElementById("reset-best-confirm");

function closeResetBestDialog() {
  if (resetBestDialog.open) {
    resetBestDialog.close();
  }
}

resetBestBtn.addEventListener("click", () => {
  resetBestDialog.showModal();
});

resetBestCancel.addEventListener("click", closeResetBestDialog);

resetBestConfirm.addEventListener("click", () => {
  clearBestTimes();
  closeResetBestDialog();
});

resetBestDialog.addEventListener("click", (event) => {
  if (event.target === resetBestDialog) {
    closeResetBestDialog();
  }
});

function startFireworks() {
  stopFireworks();
  const ctx = fireworksCanvas.getContext("2d");
  const particles = [];
  const burstsAt = [0, 180, 360, 560, 900, 1250, 1600, 2000, 2400, 2800, 3200, 3600];
  let started = 0;
  let last = performance.now();

  function resize() {
    fireworksCanvas.width = window.innerWidth;
    fireworksCanvas.height = window.innerHeight;
  }

  function burst() {
    const x = fireworksCanvas.width * (0.2 + Math.random() * 0.6);
    const y = fireworksCanvas.height * (0.18 + Math.random() * 0.28);
    const color = fireworkColors[randomInt(0, fireworkColors.length - 1)];
    for (let index = 0; index < 32; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.4 + Math.random() * 3.4;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
        size: 1.4 + Math.random() * 2.2,
      });
    }
  }

  function frame(now) {
    const delta = Math.min(32, now - last);
    last = now;
    started += delta;
    ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    while (burstsAt.length && started >= burstsAt[0]) {
      burstsAt.shift();
      burst();
    }

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.05;
      particle.vx *= 0.985;
      particle.life -= 0.016;
      ctx.globalAlpha = Math.max(0, particle.life);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      if (particles[index].life <= 0) {
        particles.splice(index, 1);
      }
    }

    if (started < 4800 || particles.length) {
      fireworksFrame = requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
      fireworksFrame = 0;
    }
  }

  resize();
  fireworksFrame = requestAnimationFrame(frame);
}

function stopFireworks() {
  if (fireworksFrame) {
    cancelAnimationFrame(fireworksFrame);
    fireworksFrame = 0;
  }
  const ctx = fireworksCanvas.getContext("2d");
  ctx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
}
