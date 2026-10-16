const screen = document.getElementById("screen");
const items = [
  {
    id: "one",
    prompt: "一つ",
    answer: "ひとつ",
    meaning: "one thing",
    explanation:
      "Read the whole word 一つ as ひとつ. A Kanji can have different readings in other words.",
  },
  {
    id: "moon",
    prompt: "月",
    answer: "つき",
    meaning: "moon",
    explanation:
      "In this example, 月 means moon and is read つき. Learn the reading with its meaning and context.",
  },
];
let index = 0,
  outcomes = [],
  help = false,
  currentItems = items;
function show(html) {
  screen.innerHTML = html;
  screen.focus();
}
function home() {
  show(
    `<p class="eyebrow">A little practice, every day</p><h1>What would you like to practise?</h1><p>Choose a short starting point, or revisit readings from your recent practice.</p><div class="grid"><article class="card"><span class="tag">Beginner preset</span><h2>First Hiragana</h2><p>Recognise the sounds あ・い・う・え・お.</p><button onclick="start()">Try the sample flow</button></article><article class="card"><span class="tag">Beginner preset</span><h2>Kanji in words</h2><p>Read a short word and connect its sound with its meaning.</p><button class="primary" onclick="start()">Start Kanji reading</button></article><article class="card"><span class="tag">Your reading review</span><h2>Practise again</h2><p>Choose readings to revisit, with a clear explanation for each recommendation.</p><button onclick="review()">Open sample review</button></article></div><p class="notice">Illustrative prototype. The sample flow uses two Kanji words. Real presets and persistent records are implemented separately.</p>`,
  );
}
function start(selected = items) {
  currentItems = selected;
  index = 0;
  outcomes = [];
  question();
}
function question() {
  help = false;
  const item = currentItems[index];
  show(
    `<div class="session"><p class="eyebrow">Kanji reading · ${index + 1} of ${currentItems.length}</p><h1>Read this word</h1><p class="muted">Connect the word with its complete Kana reading.</p><p class="glyph" lang="ja">${item.prompt}</p><p>${item.meaning}</p><label for="answer">Kana reading</label><input id="answer" type="text" autocomplete="off"><div class="actions"><button onclick="hint()">Show a hint</button><button onclick="submit(true)">Skip</button><button class="primary" onclick="submit(false)">Check answer</button></div><p id="hint" class="muted"></p><div id="feedback"></div></div>`,
  );
  document.getElementById("answer").focus();
  document.getElementById("answer").onkeydown = (e) => {
    if (e.key === "Enter") submit(false);
  };
}
function hint() {
  help = true;
  document.getElementById("hint").textContent =
    "Starts with " + currentItems[index].answer[0];
}
function submit(skipped) {
  const input = document.getElementById("answer");
  if (input.disabled) return;
  if (!skipped && !input.value.trim()) {
    input.focus();
    return;
  }
  const item = currentItems[index];
  const correct = !skipped && input.value.trim() === item.answer;
  outcomes.push({ item, correct, skipped, help });
  input.disabled = true;
  document.getElementById("feedback").innerHTML =
    `<section class="feedback" role="status"><strong>${skipped ? "Saved for another try" : correct ? "That’s right!" : "Let’s look at the reading"}</strong><p lang="ja">${item.prompt} → ${item.answer}</p><p>${item.explanation}</p>${help ? '<p class="muted">Hint requested before answering.</p>' : ""}<button class="primary" id="continue" onclick="next()">${index + 1 === currentItems.length ? "See results" : "Continue"}</button></section>`;
  document.getElementById("continue").focus();
}
function next() {
  index++;
  index < currentItems.length ? question() : results();
}
function rows(values) {
  return values
    .map(
      (value, i) =>
        `<label class="row"><input type="checkbox" value="${i}" ${!value.correct || value.help ? "checked" : ""}><strong lang="ja">${value.item.prompt}</strong> · ${value.item.answer}<br><span class="muted">${value.skipped ? "Skipped" : value.correct ? "Correct" : "Incorrect"}${value.help ? " · Hint requested" : ""}</span></label>`,
    )
    .join("");
}
function results() {
  show(
    `<div class="session"><p class="eyebrow">Your session</p><h1>Practice complete!</h1><p>Your session contained ${outcomes.length} words. Choose any you would like to practise again.</p><div class="card"><h2>Item results</h2>${rows(outcomes)}<div class="actions"><button class="primary" onclick="retry()">Retry selected readings</button><button onclick="review()">Open review</button><button onclick="home()">Back to Practice</button></div></div></div>`,
  );
}
function retry() {
  const selected = [...screen.querySelectorAll("input:checked")].map(
    (input) => outcomes[Number(input.value)].item,
  );
  if (selected.length) start(selected);
}
function startReview() {
  const available = outcomes.filter((value) => !value.correct || value.help);
  const selected = [...screen.querySelectorAll("input:checked")].map(
    (input) => available[Number(input.value)].item,
  );
  if (selected.length) start(selected);
}
function review() {
  if (!outcomes.length)
    outcomes = items.map((item) => ({
      item,
      correct: false,
      skipped: false,
      help: false,
    }));
  show(
    `<div class="session"><p class="eyebrow">Reading review</p><h1>A little more practice</h1><p>Revisit readings with an unsuccessful result or requested help in the sample session.</p><div class="card"><h2>Choose your readings</h2>${rows(outcomes.filter((value) => !value.correct || value.help))}<p class="notice">The implementation derives this collection from saved reading evidence. Older records retain unknown skip and help details.</p><div class="actions"><button class="primary" onclick="startReview()">Start sample review</button><button onclick="home()">Back to Practice</button></div></div></div>`,
  );
}
home();
