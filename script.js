/** Секунд на один раунд (угадывание до истечения времени). */
const ROUND_SECONDS = 45;

/**
 * Каждый раунд: `emoji` — длинная цепочка по словам / образам названия;
 * `answers` — допустимые варианты написания.
 */
const rounds = [
  {
    emoji: "⚪⬜🌹🌹💃🪩✨",
    answers: ["белые розы"],
    note: "По словам: белый цвет → розы → танцпол.",
  },
  {
    emoji: "🎨🖌️🧠💭💙🔵🎵",
    answers: ["цвет настроения синий"],
    note: "Палитра → настроение в голове → синий цвет.",
  },
  {
    emoji: "🗺️⛪🏙️📻⛓️🧱🔊",
    answers: ["владимирский централ"],
    note: "Город/край → здания → «централ» как радио и зона.",
  },
  {
    emoji: "🥃🫗🍶➡️🪑🍽️🌙",
    answers: ["рюмка водки на столе"],
    note: "Рюмка → водка → на столе (посуда, ночь).",
  },
  {
    emoji: "1️⃣👑⭐🏆💯✨💃",
    answers: ["самая самая"],
    note: "«Самая» — про первое место, корону, звёздность.",
  },
  {
    emoji: "🌲🌳🤱👶🎄✨🎅",
    answers: ["в лесу родилась елочка", "в лесу родилась елка"],
    note: "Лес → родилась → ёлочка праздничная.",
  },
  {
    emoji: "💚👁️👁️✨🚕🚖🌃",
    answers: ["зеленоглазое такси"],
    note: "Зелёный + глаза + такси в городе.",
  },
  {
    emoji: "🌅🌄⏰☀️🌤️🎸💿",
    answers: ["на заре"],
    note: "Заря утром; в конце — отсылка к известной версии хита.",
  },
  {
    emoji: "👥🩸🅰️🅱️🪖🎸🇷🇺",
    answers: ["группа крови"],
    note: "Группа людей + кровь + буквы групп + рок-легенда.",
  },
  {
    emoji: "🏙️💧😢🙅‍♀️❌🎬💔",
    answers: ["москва слезам не верит"],
    note: "Москва → слёзы → «не верит» (отказ).",
  },
];

const state = {
  index: 0,
  score: 0,
  answered: false,
  secondsLeft: ROUND_SECONDS,
  timerId: null,
};

const roundCounterEl = document.querySelector("#round-counter");
const scoreCounterEl = document.querySelector("#score-counter");
const timerEl = document.querySelector("#timer");
const timerValueEl = document.querySelector("#timer-value");
const emojiHintEl = document.querySelector("#emoji-hint");
const roundNoteEl = document.querySelector("#round-note");
const answerInputEl = document.querySelector("#answer-input");
const feedbackEl = document.querySelector("#feedback");
const checkBtnEl = document.querySelector("#check-btn");
const nextBtnEl = document.querySelector("#next-btn");
const gameCardEl = document.querySelector("#game-card");
const resultCardEl = document.querySelector("#result-card");
const finalScoreEl = document.querySelector("#final-score");
const finalMessageEl = document.querySelector("#final-message");
const restartBtnEl = document.querySelector("#restart-btn");

function normalize(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

function clearRoundTimer() {
  if (state.timerId !== null) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function updateTimerVisual() {
  timerValueEl.textContent = String(state.secondsLeft);
  if (state.secondsLeft <= 10) {
    timerEl.classList.add("low");
  } else {
    timerEl.classList.remove("low");
  }
}

function startRoundTimer() {
  clearRoundTimer();
  state.secondsLeft = ROUND_SECONDS;
  updateTimerVisual();

  state.timerId = window.setInterval(() => {
    state.secondsLeft -= 1;
    updateTimerVisual();

    if (state.secondsLeft <= 0) {
      clearRoundTimer();
      onTimerExpired();
    }
  }, 1000);
}

function onTimerExpired() {
  if (state.answered) {
    return;
  }

  const currentRound = rounds[state.index];
  state.answered = true;
  checkBtnEl.disabled = true;
  nextBtnEl.disabled = false;
  answerInputEl.disabled = true;
  feedbackEl.textContent = `Время вышло. Правильный ответ: ${currentRound.answers[0]}`;
  feedbackEl.className = "feedback bad";
  timerEl.classList.remove("low");
  timerValueEl.textContent = "0";
}

function renderRound() {
  clearRoundTimer();
  const currentRound = rounds[state.index];
  roundCounterEl.textContent = `Раунд ${state.index + 1}/${rounds.length}`;
  scoreCounterEl.textContent = `Очки: ${state.score}`;
  emojiHintEl.textContent = currentRound.emoji;
  roundNoteEl.textContent = currentRound.note;
  answerInputEl.value = "";
  answerInputEl.disabled = false;
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  checkBtnEl.disabled = false;
  nextBtnEl.disabled = true;
  state.answered = false;
  timerEl.classList.remove("low");
  updateTimerVisual();
  answerInputEl.focus();
  startRoundTimer();
}

function getMessageByScore() {
  const total = rounds.length;
  if (state.score === total) {
    return "Идеально! Вы музыкальный гуру.";
  }
  if (state.score >= Math.ceil(total * 0.7)) {
    return "Отличный результат! Вы отлично ориентируетесь в русских хитах.";
  }
  if (state.score >= Math.ceil(total * 0.4)) {
    return "Хорошо! Ещё пара раундов тренировки и будет максимум.";
  }
  return "Ничего страшного — включайте любимый плейлист и попробуйте снова.";
}

function showResult() {
  clearRoundTimer();
  gameCardEl.classList.add("hidden");
  resultCardEl.classList.remove("hidden");
  finalScoreEl.textContent = `Вы набрали ${state.score} из ${rounds.length}`;
  finalMessageEl.textContent = getMessageByScore();
}

function checkAnswer() {
  if (state.answered) {
    return;
  }

  const userAnswer = normalize(answerInputEl.value);
  if (!userAnswer) {
    feedbackEl.textContent = "Введите название песни перед проверкой.";
    feedbackEl.className = "feedback bad";
    return;
  }

  clearRoundTimer();
  const currentRound = rounds[state.index];
  const isCorrect = currentRound.answers.some(
    (validAnswer) => normalize(validAnswer) === userAnswer,
  );

  if (isCorrect) {
    state.score += 1;
    feedbackEl.textContent = "Верно! Отличное попадание.";
    feedbackEl.className = "feedback ok";
    scoreCounterEl.textContent = `Очки: ${state.score}`;
  } else {
    feedbackEl.textContent = `Пока мимо. Правильный ответ: ${currentRound.answers[0]}`;
    feedbackEl.className = "feedback bad";
  }

  state.answered = true;
  checkBtnEl.disabled = true;
  nextBtnEl.disabled = false;
  answerInputEl.disabled = true;
  timerEl.classList.remove("low");
}

function nextRound() {
  if (!state.answered) {
    feedbackEl.textContent = "Сначала проверьте ответ или дождитесь конца времени.";
    feedbackEl.className = "feedback bad";
    return;
  }

  state.index += 1;
  if (state.index >= rounds.length) {
    showResult();
    return;
  }
  renderRound();
}

function restartGame() {
  clearRoundTimer();
  state.index = 0;
  state.score = 0;
  state.answered = false;
  resultCardEl.classList.add("hidden");
  gameCardEl.classList.remove("hidden");
  renderRound();
}

checkBtnEl.addEventListener("click", checkAnswer);
nextBtnEl.addEventListener("click", nextRound);
restartBtnEl.addEventListener("click", restartGame);
answerInputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !checkBtnEl.disabled && !state.answered) {
    checkAnswer();
  }
});

renderRound();
