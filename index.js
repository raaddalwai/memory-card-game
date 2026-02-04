document.addEventListener("DOMContentLoaded", loadHome);

chars = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];

level1 = {
  A: "./images/prasad-mast.png",
  B: "./images/rakhi.png",
  C: "./images/dipanjan-sir.jpeg",
  D: "./images/gaurav-sir.jpeg",
  E: "./images/sai-sir.jpeg",
  F: "./images/jaykant.png",
  G: "./images/bichukale.png",
  H: "./images/sunil.png",
  I: "./images/prasad-sir.jpeg",
  
};

let currentGridLength = 4;
let currentGridWidth = 4;
let gameOver = false;

let timerInterval = null;
let timerRemaining = 0;
let timerDuration = 60;

let memoryTime = 1000;

function resetGame(gridLength, gridWidth) {
  currentGridLength = gridLength;
  timerDuration = 60 * 0.9 ** Number(difficultyRange.value);

  currentGridWidth = gridWidth;
  gameArea.innerHTML = "";
  gameArea.style.width = `50%`;
  scoreElem.innerText = "Score: 0";

  score = 0;

  usableChars = chars.slice(0, Math.ceil((gridLength * gridWidth) / 2)); // A B
  usableList = [[...usableChars], [...usableChars]]; // [A B] [A B]

  finalList = [];
  tempStore1 = null;
  tempStore2 = null;
  timeOutActive = false;
  resetCellDone = false;

  maxcorrects = Math.ceil((gridLength * gridWidth) / 2) - 1;

  for (let i = 0; i < gridWidth; i++) {
    row = document.createElement("div");
    row.classList.add("row");

    rowList = [];

    for (let j = 0; j < gridLength; j++) {
      // console.log(usableList)
      currUsableList = usableList[(i + j) % 2]; // We are choosing alternate list
      index = getRandomIntInclusive(0, currUsableList.length - 1);
      rowList.push(currUsableList[index]);

      currUsableList.splice(index, 1); //deleting the used

      cell = document.createElement("div");
      cell.classList.add("cell");
      cell.style.width = `calc(min(${Math.floor(100 / Math.max(gridLength, gridWidth))}vw, ${100 / Math.max(gridLength, gridWidth)}vh) - 120px)`;
      cell.style.height = `calc(min(${Math.floor(100 / Math.max(gridLength, gridWidth))}vw, ${100 / Math.max(gridLength, gridWidth)}vh) - 120px)`;
      cell.dataset.row = i;
      cell.dataset.column = j;

      cell.innerHTML = `
              <div class="cell-inner" data-row="${i}" data-column="${j}">
                <div class="cell-front" data-row="${i}" data-column="${j}"></div>
                <div class="cell-back" data-row="${i}" data-column="${j}"></div>
              </div>
            `;

      row.appendChild(cell);

      cell.addEventListener("click", cellClick);
    }

    gameArea.appendChild(row);
    finalList.push(rowList);
  }
  // store current grid size so Replay can use same configuration
  currentGridLength = gridLength;
  currentGridWidth = gridWidth;
  gameOver = false;
  // start timer scaled to grid area
  const duration = timerDuration;
  startTimer(duration);
}

function loadHome() {
  document.querySelectorAll("section").forEach((elem) => {
    elem.style.display = "none";
  });

  stopTimer();
  home.style.display = "flex";
}

function toGame(length, width) {
  document.querySelectorAll("section").forEach((elem) => {
    elem.style.display = "none";
  });

  game.style.display = "flex";
  resetGame(length, width);
}

function showCard(elem) {
  thisElem = elem; // cell
  currRow = thisElem.dataset.row;
  currColumn = thisElem.dataset.column;
  figure = finalList[currRow][currColumn];
  thisElem.querySelector(".cell-back").style.background =
    `url("${level1[figure]}") center/cover no-repeat`;
  elem.removeEventListener("click", cellClick);
  thisElem.querySelector(".cell-inner").classList.add("flipped");
}

function hideCard(elem) {
  // elem.innerText = ""
  elem.addEventListener("click", cellClick);
  elem.querySelector(".cell-inner").classList.remove("flipped");
}

// function

function cellClick(event) {
  thisElem = event.target; // cell
  currRow = thisElem.dataset.row;
  console.log(thisElem);
  currColumn = thisElem.dataset.column;
  figure = finalList[currRow][currColumn];

  // console.log(`clicked ${currRow}, ${currColumn}, ${finalList[event.target.dataset.row][event.target.dataset.column]}`)

  showCard(thisElem);

  if (tempStore1 == null) {
    tempStore1 = thisElem;
  } else {
    if (tempStore2 == null) {
      tempStore2 = thisElem;
      if (
        figure == finalList[tempStore1.dataset.row][tempStore1.dataset.column]
      ) {
        tempStore1.removeEventListener("click", cellClick);
        tempStore1.classList.add("correct");
        tempStore2.classList.add("correct");
        tempStore1 = null;
        tempStore2 = null;

        incrementScore();
        thisElem.removeEventListener("click", cellClick);
      } else {
        timeOutActive = true;
        setTimeout(
          () => {
            if (timeOutActive) {
              hideCard(tempStore1);
              hideCard(tempStore2);
              tempStore1 = null;
              tempStore2 = null;
              timeOutActive = false;
            }
          },
          1000 * 0.9 ** Number(difficultyRange.value),
        );
      }
    } else {
      hideCard(tempStore1);
      hideCard(tempStore2);
      tempStore1 = null;
      tempStore2 = null;
      timeOutActive = false;
      tempStore1 = thisElem;
    }
  }
}

function incrementScore() {
  score++;
  scoreElem.innerText = `Score: ${score}`;
  if (score == maxcorrects) {
    document.querySelectorAll(".cell").forEach((elem) => {
      elem.classList.add("correct");
      elem.removeEventListener("click", cellClick);
      showCard(elem);
    });
    // stop timer and end the game as a win
    stopTimer();
    document.querySelectorAll(".cell").forEach((elem) => {
      try {
        elem.removeEventListener("click", cellClick);
      } catch (e) {}
    });
    gameOver = true;
    const timeTaken = timerDuration - Math.max(0, timerRemaining);
    // check and update high-score for this board
    const result = checkAndUpdateHighScore(
      currentGridLength,
      currentGridWidth,
      score,
      timeTaken,
    );
    let message = `Score: ${score} — Time: ${timeTaken} seconds`;
    if (result.isNewRecord) {
      message += " — New High Score! 🎉";
    } else if (result.previous) {
      message += ` — Best: ${result.previous.score} (${result.previous.timeTaken}s)`;
    }
    showEndModal("You Won!", message);
  }
}

function quit() {
  if (confirm("Do you Really want to quit??")) {
    stopTimer();
    loadHome();
  }
}

// Timer implementation (non-intrusive UI)
// uses SVG circle radius 52 (circumference ~ 326.726)

function startTimer(seconds) {
  stopTimer();
  const el = document.getElementById("timer");
  if (!el) return;
  const secondsEl = el.querySelector(".timer-seconds");
  const progressEl = el.querySelector(".timer-progress");
  if (!secondsEl || !progressEl) return;

  el.classList.remove("time-up", "low", "medium");
  timerDuration = Math.max(5, Math.floor(seconds));
  timerRemaining = timerDuration;
  secondsEl.innerText = timerRemaining;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  progressEl.style.strokeDasharray = `${circumference}`;
  progressEl.style.strokeDashoffset = `${circumference}`;

  // immediate update
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timerRemaining -= 1;
    if (timerRemaining <= 0) {
      stopTimer();
      el.classList.add("time-up");
      secondsEl.innerText = 0;
      endGameByTimeout();
    } else {
      updateTimerDisplay();
    }
  }, 1000);
}

function showEndModal(title, message) {
  const modal = document.getElementById("endModal");
  if (!modal) return;
  const titleEl = modal.querySelector("#endTitle");
  const msgEl = modal.querySelector("#endMessage");
  if (titleEl) titleEl.innerText = title;
  if (msgEl) msgEl.innerText = message;

  // reveal with animation (CSS handles 0.2s delay)
  modal.classList.remove("hidden");
  modal.classList.remove("active");
  // allow the browser to paint before adding active so transition runs
  setTimeout(() => modal.classList.add("active"), 20);
}

function hideEndModal() {
  const modal = document.getElementById("endModal");
  if (!modal) return;
  // play exit animation then hide element after animation completes
  modal.classList.remove("active");
  setTimeout(() => modal.classList.add("hidden"), 480);
}

function endGameByTimeout() {
  // prevent further interaction
  document.querySelectorAll(".cell").forEach((elem) => {
    try {
      elem.removeEventListener("click", cellClick);
    } catch (e) {}
  });
  gameOver = true;
  stopTimer();
  const timeTaken = timerDuration - Math.max(0, timerRemaining);
  const result = checkAndUpdateHighScore(
    currentGridLength,
    currentGridWidth,
    score,
    timeTaken,
  );
  let message = `Score: ${score} — Time: ${timeTaken} seconds`;
  if (result.isNewRecord) {
    message += " — New High Score! 🎉";
  } else if (result.previous) {
    message += ` — Best: ${result.previous.score} (${result.previous.timeTaken}s)`;
  }
  showEndModal("Time's up!", message);
}

// setup modal buttons after DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const replayBtn = document.getElementById("replayBtn");
  const backBtn = document.getElementById("backBtn");
  if (replayBtn)
    replayBtn.addEventListener("click", () => {
      hideEndModal();
      resetGame(currentGridLength, currentGridWidth);
    });
  if (backBtn)
    backBtn.addEventListener("click", () => {
      hideEndModal();
      stopTimer();
      loadHome();
    });
});

function updateTimerDisplay() {
  const el = document.getElementById("timer");
  if (!el) return;
  const secondsEl = el.querySelector(".timer-seconds");
  const progressEl = el.querySelector(".timer-progress");
  const pct = Math.max(0, timerRemaining / timerDuration);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  progressEl.style.strokeDashoffset = `${offset}`;

  secondsEl.innerText = Math.ceil(timerRemaining);

  el.classList.toggle("low", pct <= 0.25);
  el.classList.toggle("medium", pct <= 0.6 && pct > 0.25);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}

// High-score helpers (per board size). Stores {score, timeTaken, date}
function getHighScoreKey(length, width) {
  return `memory_highscore_${length}x${width}`;
}

function getHighScore(length, width) {
  try {
    const raw = localStorage.getItem(getHighScoreKey(length, width));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveHighScore(length, width, entry) {
  try {
    localStorage.setItem(getHighScoreKey(length, width), JSON.stringify(entry));
  } catch (e) {}
}

// Returns {isNewRecord: bool, previous: object|null}
function checkAndUpdateHighScore(length, width, scoreVal, timeTaken) {
  const existing = getHighScore(length, width);
  const now = new Date().toISOString();
  const entry = { score: scoreVal, timeTaken: timeTaken, date: now };
  if (!existing) {
    saveHighScore(length, width, entry);
    return { isNewRecord: true, previous: null };
  }
  // Better if higher score, or equal score but less time taken
  if (
    scoreVal > existing.score ||
    (scoreVal === existing.score && timeTaken < existing.timeTaken)
  ) {
    saveHighScore(length, width, entry);
    return { isNewRecord: true, previous: existing };
  }
  return { isNewRecord: false, previous: existing };
}

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1)) + minCeiled;
}
