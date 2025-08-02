const startBtn = document.getElementById('startBtn');
const playerNameInput = document.getElementById('playerName');
const gameArea = document.getElementById('gameArea');
const choiceBtns = document.querySelectorAll('.choiceBtn');
const gameStatus = document.getElementById('gameStatus');
const sessionScore = document.getElementById('sessionScore');
const allTimeScore = document.getElementById('allTimeScore');
const playerHeading = document.getElementById('playerHeading');
const aiChoiceDisplay = document.getElementById('robotChoiceDisplay');
const orbitCount = document.getElementById('rps-orbit-count');
const playerNameDisplay = document.getElementById('playerNameDisplay');

let mode = "random";
let humanName = "";
let session = {
  human: 0,
  computer: 0,
  games: 0,
  moves: [],
  win: 0,
  loss: 0,
  draw: 0,
  moveStats: {
    rock: { win: 0, loss: 0, draw: 0 },
    paper: { win: 0, loss: 0, draw: 0 },
    scissors: { win: 0, loss: 0, draw: 0 }
  }
};
let allTime = {
  human: 0,
  computer: 0,
};
let aiState = {
  moveCounts: { rock: 0, paper: 0, scissors: 0 },
  lastHumanMove: null,
  lastResult: null,
  afterLossMap: {},
  patterns: [],
};
let gameHistory = [];
let sessionMeta = null; // Store session metadata for current game

document.querySelectorAll('input[name="mode"]').forEach(el => {
  el.addEventListener('change', () => {
    mode = el.value;
  });
});

startBtn.onclick = () => {
  humanName = playerNameInput.value.trim();
  if (!humanName) return alert("Enter your name.");
  mode = document.querySelector('input[name="mode"]:checked').value;
  gameArea.style.display = "block";

  // Start a new session meta and add a new row to history
  sessionMeta = {
    player: humanName,
    model: modeLabel(mode),
    w: null,
    l: null,
    d: null,
    winner: ""
  };
  gameHistory.unshift(sessionMeta);
  if (gameHistory.length > 20) gameHistory.length = 20;

  // Reset session state
  session = {
    human: 0,
    computer: 0,
    games: 0,
    moves: [],
    win: 0,
    loss: 0,
    draw: 0,
    moveStats: {
      rock: { win: 0, loss: 0, draw: 0 },
      paper: { win: 0, loss: 0, draw: 0 },
      scissors: { win: 0, loss: 0, draw: 0 }
    }
  };
  aiState = {
    moveCounts: { rock: 0, paper: 0, scissors: 0 },
    lastHumanMove: null,
    lastResult: null,
    afterLossMap: {},
    patterns: [],
  };
  updateScoreboard();
  renderHistoryTable();
  gameStatus.textContent = "Game Started!";
  playerNameDisplay.textContent = humanName;
  aiChoiceDisplay.textContent = "";

  if (orbitCount) orbitCount.textContent = 100;

  // Re-enable choice buttons
  choiceBtns.forEach(btn => btn.disabled = false);

  renderPlayerPieChart();
};

choiceBtns.forEach(btn => {
  btn.onclick = () => {
    const humanMove = btn.dataset.choice;
    const computerMove = getComputerMove(humanMove);
    const result = getResult(humanMove, computerMove);

    // Update pattern learning (Learn After 30)
    if (mode === "learn30" && aiState.lastResult === "lose") {
      const prev = aiState.lastHumanMove;
      if (!aiState.afterLossMap[prev]) aiState.afterLossMap[prev] = {};
      aiState.afterLossMap[prev][humanMove] = (aiState.afterLossMap[prev][humanMove] || 0) + 1;
    }

    // Update patterns (Pattern Matching)
    if (mode === "pattern50") {
      const recent = session.moves.slice(-3);
      if (recent.length === 3) {
        aiState.patterns.push({
          seq: recent.join(","),
          next: humanMove
        });
      }
    }

    // Update state
    session.games++;
    session.moves.push(humanMove);
    aiState.moveCounts[humanMove]++;
    aiState.lastHumanMove = humanMove;
    aiState.lastResult = result;

    // Score tracking
    if (result === 'win') session.human++, allTime.human++;
    if (result === 'lose') session.computer++, allTime.computer++;

    // Update session W/L/D
    if (result === 'win') session.win++;
    if (result === 'lose') session.loss++;
    if (result === 'draw') session.draw++;

    // Update per-move stats
    if (result === "win") {
      session.moveStats[humanMove].win++;
    } else if (result === "lose") {
      session.moveStats[humanMove].loss++;
    } else if (result === "draw") {
      session.moveStats[humanMove].draw++;
    }

    updateScoreboard();
    gameStatus.textContent = `${humanName} played ${humanMove} — Computer played ${computerMove}. You ${result}!`;
    aiChoiceDisplay.textContent = getChoiceEmoji(computerMove) + " " + capitalize(computerMove);

    // Update counter
    if (orbitCount) {
      orbitCount.textContent = Math.max(100 - session.games, 0);
    }

    // End game logic
    if (session.games >= 100) {
      gameStatus.textContent = `Game Over! Final Score - You: ${session.win}, Robot: ${session.loss}, Draws: ${session.draw}`;
      addGameToHistory();
      renderHistoryTable();
      // Disable buttons
      choiceBtns.forEach(btn => btn.disabled = true);
    }

    // Update pie chart
    renderPlayerPieChart();
  };
});

// Helper functions
function getChoiceEmoji(choice) {
  if (choice === "rock") return "🪨";
  if (choice === "paper") return "📄";
  if (choice === "scissors") return "✂️";
  return "";
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getComputerMove(humanMove) {
  const randomMove = () => ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];

  if (mode === "random") {
    return randomMove();
  }

  if (mode === "learn30") {
    if (session.games < 30) {
      return randomMove();
    }

    // 1. Learn player's overall tendencies
    const totalMoves = Object.values(aiState.moveCounts).reduce((a, b) => a + b, 0);
    const probs = {
      rock: aiState.moveCounts.rock / totalMoves,
      paper: aiState.moveCounts.paper / totalMoves,
      scissors: aiState.moveCounts.scissors / totalMoves,
    };

    // 2. Predict what human will play next
    let predicted = Object.entries(probs).sort((a, b) => b[1] - a[1])[0][0];

    // 3. After loss: learn what human plays next
    if (aiState.lastResult === 'lose') {
      const prev = aiState.lastHumanMove;
      const nextMoveAfterLoss = aiState.afterLossMap[prev];
      if (nextMoveAfterLoss) {
        predicted = Object.entries(nextMoveAfterLoss).sort((a, b) => b[1] - a[1])[0][0];
      }
    }

    return counterMove(predicted);
  }

  if (mode === "pattern50") {
    if (session.games < 53) {
      return randomMove();
    }

    const last3 = session.moves.slice(-3).join(",");
    const found = aiState.patterns.find(p => p.seq === last3);
    if (found) {
      return counterMove(found.next);
    } else {
      return randomMove();
    }
  }

  return randomMove();
}

function counterMove(move) {
  if (move === "rock") return "paper";
  if (move === "paper") return "scissors";
  return "rock";
}

function getResult(human, computer) {
  if (human === computer) return "draw";
  if (
    (human === "rock" && computer === "scissors") ||
    (human === "paper" && computer === "rock") ||
    (human === "scissors" && computer === "paper")
  ) return "win";
  return "lose";
}

function updateScoreboard() {
  // Player side
  document.getElementById('sessionWin').textContent = session.win;
  document.getElementById('sessionLoss').textContent = session.loss;
  // Draw center
  document.getElementById('sessionDraw').textContent = session.draw;
  // Robot side (Robot's win = player's loss, Robot's loss = player's win)
  document.getElementById('robotWin').textContent = session.loss;
  document.getElementById('robotLoss').textContent = session.win;

  // Use session.win for player, session.loss for robot
  const playerWins = session.win;
  const robotWins = session.loss;

  // Update win circles
  const playerWinCircle = document.getElementById('playerWinCircle');
  const robotWinCircle = document.getElementById('robotWinCircle');
  if (playerWinCircle) playerWinCircle.textContent = playerWins;
  if (robotWinCircle) robotWinCircle.textContent = robotWins;

  // Set colors
  playerWinCircle.classList.remove('green', 'red');
  robotWinCircle.classList.remove('green', 'red');
  if (playerWins > robotWins) {
    playerWinCircle.classList.add('green');
    robotWinCircle.classList.add('red');
  } else if (robotWins > playerWins) {
    playerWinCircle.classList.add('red');
    robotWinCircle.classList.add('green');
  }
  // If tie, both remain grey

  // Per-move stats
  document.getElementById('rockStats').textContent =
    `W-${session.moveStats.rock.win}/L-${session.moveStats.rock.loss}/D-${session.moveStats.rock.draw}`;
  document.getElementById('paperStats').textContent =
    `W-${session.moveStats.paper.win}/L-${session.moveStats.paper.loss}/D-${session.moveStats.paper.draw}`;
  document.getElementById('scissorsStats').textContent =
    `W-${session.moveStats.scissors.win}/L-${session.moveStats.scissors.loss}/D-${session.moveStats.scissors.draw}`;
}

function addGameToHistory() {
  // Find existing row instead of adding new one
  const existingRow = gameHistory.find(game => 
    game.player === humanName && game.model === modeLabel(mode) && 
    game.w === null && game.l === null && game.d === null);
  
  if (existingRow) {
    // Update existing row
    existingRow.w = session.win;
    existingRow.l = session.loss;
    existingRow.d = session.draw;
    existingRow.winner = session.win > session.loss ? humanName : 
                         session.loss > session.win ? "Robot" : "Draw";
  } else {
    // Fallback: add new row if somehow missing
    gameHistory.unshift({
      player: humanName,
      model: modeLabel(mode),
      w: session.win,
      l: session.loss,
      d: session.draw,
      winner: session.win > session.loss ? humanName : 
             session.loss > session.win ? "Robot" : "Draw"
    });
    if (gameHistory.length > 20) gameHistory.length = 20;
  }
}

function modeLabel(mode) {
  if (mode === "random") return "Random";
  if (mode === "learn30") return "Learn after 30";
  if (mode === "pattern50") return "Patterns";
  return mode;
}

function renderHistoryTable() {
  const tbody = document.querySelector("#historyTable tbody");
  tbody.innerHTML = "";
  for (const game of gameHistory) {
    const winnerText = game.winner || "";
    // Color row: green for human win, pink for robot win
    let rowClass = "";
    if (game.winner === game.player) rowClass = "history-win";
    else if (game.winner === "Robot") rowClass = "history-loss";
    const tr = document.createElement("tr");
    tr.className = rowClass;
    tr.innerHTML = `
      <td>${game.player}</td>
      <td>${game.model}</td>
      <td>${game.w !== null ? game.w : ""}</td>
      <td>${game.l !== null ? game.l : ""}</td>
      <td>${game.d !== null ? game.d : ""}</td>
      <td>${winnerText}</td>
    `;
    tbody.appendChild(tr);
  }
}

// When the page loads, render the table (in case of reload)
renderHistoryTable();

// Animated Title Cartoon Logic
const rockIcon = document.getElementById('rps-rock');
const paperIcon = document.getElementById('rps-paper');
const scissorsIcon = document.getElementById('rps-scissors');
const rockWord = document.getElementById('rps-rock-word');
const paperWord = document.getElementById('rps-paper-word');
const scissorsWord = document.getElementById('rps-scissors-word');

// Helper for random timing
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Cartoon Actions ---

function rockBounceSmush() {
  rockIcon.classList.add('rock-bounce');
  setTimeout(() => {
    scissorsWord.classList.add('scissors-smush');
    setTimeout(() => {
      rockIcon.classList.remove('rock-bounce');
      scissorsWord.classList.remove('scissors-smush');
    }, 1200);
  }, 600);
}

function paperCrawlCover() {
  paperIcon.classList.add('paper-crawl');
  setTimeout(() => {
    rockWord.classList.add('rock-covered');
    setTimeout(() => {
      paperIcon.classList.remove('paper-crawl');
      rockWord.classList.remove('rock-covered');
    }, 1500);
  }, 700);
}

function scissorsCutPeel() {
  scissorsIcon.classList.add('scissors-cut');
  setTimeout(() => {
    paperWord.classList.add('paper-peel');
    setTimeout(() => {
      scissorsIcon.classList.remove('scissors-cut');
      paperWord.classList.remove('paper-peel');
    }, 1200);
  }, 600);
}

const actions = [rockBounceSmush, paperCrawlCover, scissorsCutPeel];

function runRandomCartoonAction() {
  const action = actions[Math.floor(Math.random() * actions.length)];
  action();
  setTimeout(runRandomCartoonAction, randomDelay(8000, 12000));
}

setTimeout(runRandomCartoonAction, randomDelay(1000, 3000));

// Autopilot Button Logic
const autopilotBtn = document.getElementById('autopilotBtn');

autopilotBtn.onclick = async function () {
  if (session.games >= 100) return;
  autopilotBtn.disabled = true;
  let delay = 60; // ms between moves for fast play
  while (session.games < 100) {
    // Pick a random move
    const moves = ["rock", "paper", "scissors"];
    const randomMove = moves[Math.floor(Math.random() * 3)];
    // Simulate button click
    const btn = document.querySelector(`.choiceBtn[data-choice="${randomMove}"]`);
    if (btn) btn.click();
    await new Promise(res => setTimeout(res, delay));
  }
  autopilotBtn.disabled = false;
};

const autoPatternsBtn = document.getElementById('autoPatternsBtn');

autoPatternsBtn.onclick = async function () {
  if (session.games >= 100 || session.moves.length === 0) return;
  autoPatternsBtn.disabled = true;
  let delay = 60; // ms between moves for fast play
  let i = 0;
  while (session.games < 100) {
    // Repeat moves in order, looping
    const move = session.moves[i % session.moves.length];
    const btn = document.querySelector(`.choiceBtn[data-choice="${move}"]`);
    if (btn) btn.click();
    i++;
    await new Promise(res => setTimeout(res, delay));
  }
  autoPatternsBtn.disabled = false;
};

// New Player Pie Chart Logic
function renderPlayerPieChart() {
  const pieDiv = document.getElementById('playerPieChart');
  if (!pieDiv) return;

  // Count moves
  const counts = { rock: 0, paper: 0, scissors: 0 };
  session.moves.forEach(m => counts[m]++);
  const total = session.moves.length;

  // If no moves yet, show empty chart
  if (total === 0) {
    pieDiv.innerHTML = `
      <svg width="240" height="240" viewBox="0 0 80 80">
        <circle r="40" cx="40" cy="40" fill="#eee"/>
        <text x="40" y="45" text-anchor="middle" font-size="8" fill="#666">No moves yet</text>
      </svg>
    `;
    return;
  }

  // Calculate angles
  const rockAngle = (counts.rock / total) * 360;
  const paperAngle = (counts.paper / total) * 360;
  const scissorsAngle = (counts.scissors / total) * 360;

  let svg = `<svg width="240" height="240" viewBox="0 0 80 80">`;
  
  // Background circle
  svg += `<circle r="40" cx="40" cy="40" fill="#eee"/>`;
  
  let currentAngle = 0;
  
  // Add rock slice if it exists
  if (rockAngle > 0) {
    svg += `<path d="${describeArc(40,40,40,currentAngle,currentAngle+rockAngle)}" fill="#ffb74d"/>`;
    currentAngle += rockAngle;
  }
  
  // Add paper slice if it exists
  if (paperAngle > 0) {
    svg += `<path d="${describeArc(40,40,40,currentAngle,currentAngle+paperAngle)}" fill="#64b5f6"/>`;
    currentAngle += paperAngle;
  }
  
  // Add scissors slice if it exists
  if (scissorsAngle > 0) {
    svg += `<path d="${describeArc(40,40,40,currentAngle,currentAngle+scissorsAngle)}" fill="#e57373"/>`;
  }
  
  svg += `</svg>`;
  pieDiv.innerHTML = svg;
}

// Helper to describe SVG arc
function describeArc(cx, cy, r, startAngle, endAngle){
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", cx, cy,
    "L", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
    "Z"
  ].join(" ");
}
function polarToCartesian(cx, cy, r, angle){
  const rad = (angle-90) * Math.PI / 180.0;
  return {
    x: cx + (r * Math.cos(rad)),
    y: cy + (r * Math.sin(rad))
  };
}

// Call this after each move and on game start
// Add to your choiceBtns.forEach(btn => { btn.onclick = ... }) and startBtn.onclick:
