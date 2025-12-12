const startBtn = document.getElementById("startBtn");
const playerNameInput = document.getElementById("playerName");
const gameArea = document.getElementById("gameArea");
const choiceBtns = document.querySelectorAll(".choiceBtn");
const gameStatus = document.getElementById("gameStatus");
const sessionScore = document.getElementById("sessionBoard");
const allTimeScore = document.getElementById("allTimeScore");
const playerHeading = document.getElementById("playerHeading");
const aiChoiceDisplay = document.getElementById("robotChoiceDisplay");
const orbitCount = document.getElementById("rps-orbit-count");
const playerNameDisplay = document.getElementById("playerNameDisplay");
const robotChoiceBtn = document.getElementById("robotChoiceBtn");

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
    scissors: { win: 0, loss: 0, draw: 0 },
  },
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
  afterWinMap: {},
  afterDrawMap: {},
  patterns: [],
  patterns2: [], // 2-move sequences
  patterns3: [], // 3-move sequences
  patterns4: [], // 4-move sequences
  patterns5: [], // 5-move sequences
};
let gameHistory = [];
let sessionMeta = null; // Store session metadata for current game

document.querySelectorAll('input[name="mode"]').forEach((el) => {
  el.addEventListener("change", () => {
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
    winner: "",
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
      scissors: { win: 0, loss: 0, draw: 0 },
    },
  };
  aiState = {
    moveCounts: { rock: 0, paper: 0, scissors: 0 },
    lastHumanMove: null,
    lastResult: null,
    afterLossMap: {},
    afterWinMap: {},
    afterDrawMap: {},
    patterns: [],
    patterns2: [],
    patterns3: [],
    patterns4: [],
    patterns5: [],
  };
  updateScoreboard();
  renderHistoryTable();
  // Remove old game status text - replaced with dynamic result display
  // gameStatus.textContent = "Game Started!";
  playerNameDisplay.textContent = humanName;
  aiChoiceDisplay.textContent = "";

  // Clear the AI decision box for new game
  const decisionContent = document.querySelector(".decision-content");
  if (decisionContent) {
    decisionContent.innerHTML = "";
  }

  if (orbitCount) orbitCount.textContent = 100;

  // Re-enable choice buttons
  choiceBtns.forEach((btn) => (btn.disabled = false));

  // Hide non-selected algorithm buttons during game
  const algoSelector = document.querySelector(".algo-selector");
  algoSelector.classList.add("game-active");

  // Mark the selected algorithm button
  const allBtns = document.querySelectorAll(".algo-btn");
  allBtns.forEach((btn) => btn.classList.remove("selected"));
  const selectedBtn = document.querySelector(
    '.algo-btn input[type="radio"]:checked'
  );
  if (selectedBtn) {
    selectedBtn.closest(".algo-btn").classList.add("selected");
  }

  renderPlayerPieChart();

  // Initialize robot button
  const robotBtn = document.getElementById("robotChoiceBtn");
  if (robotBtn) {
    robotBtn.innerHTML = `
      🤖 Thinking...
      <span class="btn-stats robot-stats">Wins: 0</span>
    `;
  }

  startRobotThinking();
};

choiceBtns.forEach((btn) => {
  btn.onclick = () => {
    const humanMove = btn.dataset.choice;
    const computerMove = getComputerMove(humanMove);

    // Stop robot thinking and show final choice
    stopRobotThinking(computerMove);

    const result = getResult(humanMove, computerMove);

    // Update pattern learning (Learn After 30)
    if (mode === "learn30" && aiState.lastResult === "lose") {
      const prev = aiState.lastHumanMove;
      if (!aiState.afterLossMap[prev]) aiState.afterLossMap[prev] = {};
      aiState.afterLossMap[prev][humanMove] =
        (aiState.afterLossMap[prev][humanMove] || 0) + 1;
    }

    // Update patterns (Pattern Matching)
    if (mode === "pattern50") {
      const recent = session.moves.slice(-3);
      if (recent.length === 3) {
        aiState.patterns.push({
          seq: recent.join(","),
          next: humanMove,
        });
      }
    }

    // Update patterns and context (UberLogic)
    if (mode === "uberlogic") {
      // Track post-win/loss/draw behavior
      if (aiState.lastResult === 'win') {
        const prev = aiState.lastHumanMove;
        if (!aiState.afterWinMap[prev]) aiState.afterWinMap[prev] = {};
        aiState.afterWinMap[prev][humanMove] = (aiState.afterWinMap[prev][humanMove] || 0) + 1;
      } else if (aiState.lastResult === 'lose') {
        const prev = aiState.lastHumanMove;
        if (!aiState.afterLossMap[prev]) aiState.afterLossMap[prev] = {};
        aiState.afterLossMap[prev][humanMove] = (aiState.afterLossMap[prev][humanMove] || 0) + 1;
      } else if (aiState.lastResult === 'draw') {
        const prev = aiState.lastHumanMove;
        if (!aiState.afterDrawMap[prev]) aiState.afterDrawMap[prev] = {};
        aiState.afterDrawMap[prev][humanMove] = (aiState.afterDrawMap[prev][humanMove] || 0) + 1;
      }

      // Track 2-move patterns
      if (session.moves.length >= 2) {
        const recent = session.moves.slice(-2);
        aiState.patterns2.push({
          seq: recent.join(","),
          next: humanMove,
        });
      }

      // Track 3-move patterns
      if (session.moves.length >= 3) {
        const recent = session.moves.slice(-3);
        aiState.patterns3.push({
          seq: recent.join(","),
          next: humanMove,
        });
      }

      // Track 4-move patterns
      if (session.moves.length >= 4) {
        const recent = session.moves.slice(-4);
        aiState.patterns4.push({
          seq: recent.join(","),
          next: humanMove,
        });
      }

      // Track 5-move patterns
      if (session.moves.length >= 5) {
        const recent = session.moves.slice(-5);
        aiState.patterns5.push({
          seq: recent.join(","),
          next: humanMove,
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
    if (result === "win") session.human++, allTime.human++;
    if (result === "lose") session.computer++, allTime.computer++;

    // Update session W/L/D
    if (result === "win") session.win++;
    if (result === "lose") session.loss++;
    if (result === "draw") session.draw++;

    // Update per-move stats
    if (result === "win") {
      session.moveStats[humanMove].win++;
    } else if (result === "lose") {
      session.moveStats[humanMove].loss++;
    } else if (result === "draw") {
      session.moveStats[humanMove].draw++;
    }

    updateScoreboard();

    // Update decision box with the result
    updateDecisionBox(computerMove, lastDecisionReason, result);

    // Show dynamic result with animations
    showDynamicResult(result);

    // Remove old static game status text
    // gameStatus.textContent = `${humanName} played ${humanMove} — Computer played ${computerMove}. You ${result}!`;
    aiChoiceDisplay.textContent = "";

    // Update counter
    if (orbitCount) {
      orbitCount.textContent = Math.max(100 - session.games, 0);
    }

    // End game logic
    if (session.games >= 100) {
      // Remove old static text - replaced with dynamic result display
      // gameStatus.textContent = `Game Over! Final Score - You: ${session.win}, Robot: ${session.loss}, Draws: ${session.draw}`;
      addGameToHistory();
      renderHistoryTable();
      // gameStatus.textContent = "Game Complete! Click Start Game for another round.";

      // Show all algorithm buttons again
      const algoSelector = document.querySelector(".algo-selector");
      algoSelector.classList.remove("game-active");
      // Remove selected class from all buttons
      document
        .querySelectorAll(".algo-btn")
        .forEach((btn) => btn.classList.remove("selected"));

      // Stop robot thinking completely
      clearInterval(robotThinkingInterval);
      robotThinkingInterval = null; // Clear the reference
      const robotBtn = document.getElementById("robotChoiceBtn");
      if (robotBtn) {
        robotBtn.classList.remove("robot-thinking");
        // Keep the final choice displayed without any animation
        // Force update the button to ensure it shows the final choice
        const choiceData = robotChoices.find(
          (c) => c.name.toLowerCase() === computerMove
        );
        if (choiceData) {
          robotBtn.innerHTML = `
            ${choiceData.emoji} ${choiceData.name}
            <span class="btn-stats robot-stats">Wins: ${session.loss}</span>
          `;
        }
      }

      // Disable choice buttons
      choiceBtns.forEach((btn) => (btn.disabled = true));

      // Don't restart thinking animation since game is over
      return;
    }

    // Update pie chart
    renderPlayerPieChart();

    // Start thinking again for next round (if game not over)
    if (session.games < 100) {
      setTimeout(startRobotThinking, 2000); // 2 second pause to see robot's choice
    }
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

let lastDecisionReason = ""; // Store the last decision reason

function getComputerMove(humanMove) {
  const randomMove = () =>
    ["rock", "paper", "scissors"][Math.floor(Math.random() * 3)];

  if (mode === "random") {
    const move = randomMove();
    lastDecisionReason = "random choice selected it";
    return move;
  }

  if (mode === "learn30") {
    if (session.games < 30) {
      const move = randomMove();
      lastDecisionReason = "still learning your patterns (random choice)";
      return move;
    }

    // 1. Learn player's overall tendencies
    const totalMoves = Object.values(aiState.moveCounts).reduce(
      (a, b) => a + b,
      0
    );
    const probs = {
      rock: aiState.moveCounts.rock / totalMoves,
      paper: aiState.moveCounts.paper / totalMoves,
      scissors: aiState.moveCounts.scissors / totalMoves,
    };

    // 2. Predict what human will play next
    let predicted = Object.entries(probs).sort((a, b) => b[1] - a[1])[0][0];
    let reason = `analysis shows you favor ${predicted} (${Math.round(
      probs[predicted] * 100
    )}%)`;

    // 3. After loss: learn what human plays next
    if (aiState.lastResult === "lose") {
      const prev = aiState.lastHumanMove;
      const nextMoveAfterLoss = aiState.afterLossMap[prev];
      if (nextMoveAfterLoss) {
        const mostLikely = Object.entries(nextMoveAfterLoss).sort(
          (a, b) => b[1] - a[1]
        )[0];
        predicted = mostLikely[0];
        reason = `after losing, you typically play ${predicted} next (${mostLikely[1]} times)`;
      }
    }

    const move = counterMove(predicted);
    lastDecisionReason = reason;
    return move;
  }

  if (mode === "pattern50") {
    if (session.games < 53) {
      const move = randomMove();
      lastDecisionReason = "still learning your patterns (random choice)";
      return move;
    }

    const last3 = session.moves.slice(-3).join(",");
    const found = aiState.patterns.find(p => p.seq === last3);
    if (found) {
      const patternCount = aiState.patterns.filter(p => p.seq === last3).length;
      const move = counterMove(found.next);
      lastDecisionReason = `human player did ${last3.replace(/,/g, ', ')} (${patternCount}) times already`;
      return move;
    } else {
      const move = randomMove();
      lastDecisionReason = `no pattern found for ${last3.replace(/,/g, ', ')} (random choice)`;
      return move;
    }
  }

  if (mode === "uberlogic") {
    // Turn 1: No data, play random
    if (session.games === 0) {
      const move = randomMove();
      lastDecisionReason = "first turn, no data available (random)";
      return move;
    }

    // Initialize predictions with 0 score
    const predictions = {
      rock: { score: 0, details: [] },
      paper: { score: 0, details: [] },
      scissors: { score: 0, details: [] }
    };

    // --- Helper to add scores ---
    const addScore = (move, baseScore, frequency, reasonLabel) => {
      const points = baseScore * frequency;
      predictions[move].score += points;
      predictions[move].details.push(`${reasonLabel} (${points}pts)`);
    };

    // 1. Overall Frequency (Base: 15pts * % frequency)
    // Using percentage (0-100) instead of raw count to normalize influence
    const totalMoves = Object.values(aiState.moveCounts).reduce((a, b) => a + b, 0);
    if (totalMoves > 0) {
      for (const [m, count] of Object.entries(aiState.moveCounts)) {
        if (count > 0) {
           const percent = Math.round((count / totalMoves) * 10); // scale 0-10
           // e.g., 50% frequency = 5 * 15 = 75 points
           addScore(m, 15, percent, `Freq ${Math.round((count/totalMoves)*100)}%`);
        }
      }
    }

    // 2. Patterns (Base Scores: 5-set=50, 4-set=40, 3-set=30, 2-set=20)
    // We check ALL pattern lengths and add their votes together
    
    // 5-move patterns
    if (session.moves.length >= 5) {
      const last5 = session.moves.slice(-5).join(",");
      const matches = aiState.patterns5.filter(p => p.seq === last5);
      matches.forEach(m => {
        // Multiplier is always 1 for each individual historical occurrence found
        addScore(m.next, 50, 1, "5-Set");
      });
    }

    // 4-move patterns
    if (session.moves.length >= 4) {
      const last4 = session.moves.slice(-4).join(",");
      const matches = aiState.patterns4.filter(p => p.seq === last4);
      matches.forEach(m => {
        addScore(m.next, 40, 1, "4-Set");
      });
    }

    // 3-move patterns
    if (session.moves.length >= 3) {
      const last3 = session.moves.slice(-3).join(",");
      const matches = aiState.patterns3.filter(p => p.seq === last3);
      matches.forEach(m => {
        addScore(m.next, 30, 1, "3-Set");
      });
    }

    // 2-move patterns
    if (session.moves.length >= 2) {
      const last2 = session.moves.slice(-2).join(",");
      const matches = aiState.patterns2.filter(p => p.seq === last2);
      matches.forEach(m => {
        addScore(m.next, 20, 1, "2-Set");
      });
    }

    // 3. Contextual Behavior (Base: 25pts)
    let contextHistory = null;
    let contextLabel = "";
    
    if (aiState.lastResult === 'win') {
      contextHistory = aiState.afterWinMap[aiState.lastHumanMove];
      contextLabel = "After Win";
    } else if (aiState.lastResult === 'lose') {
      contextHistory = aiState.afterLossMap[aiState.lastHumanMove];
      contextLabel = "After Loss";
    } else if (aiState.lastResult === 'draw') {
      contextHistory = aiState.afterDrawMap[aiState.lastHumanMove];
      contextLabel = "After Draw";
    }

    if (contextHistory) {
      for (const [m, count] of Object.entries(contextHistory)) {
        addScore(m, 25, count, contextLabel); // 25pts * times happened
      }
    }

    // --- Decision Time ---
    
    // Sort by score
    const sorted = Object.entries(predictions).sort((a, b) => b[1].score - a[1].score);
    const topMove = sorted[0]; // [move, data]
    const topMoveName = topMove[0];
    const topMoveScore = topMove[1].score;
    
    const totalScore = sorted.reduce((sum, item) => sum + item[1].score, 0);

    // Confidence Calculation
    // If total score is 0, we have no data -> random
    if (totalScore === 0) {
       const move = randomMove();
       lastDecisionReason = "No patterns found (Random)";
       return move;
    }

    const confidence = Math.round((topMoveScore / totalScore) * 100);

    // Construct detailed reasoning string
    // e.g. "High Confidence (80%): 2-Set (40pts), Strong Hand (150pts)"
    // We consolidate details to avoid spamming the logs
    
    // Summarize the top move's triggers
    // The details array looks like: ["2-Set (20pts)", "2-Set (20pts)", "Freq 50% (75pts)"]
    // We want to group them: "2-Set x2 (40pts), Freq 50% (75pts)"
    
    const reasonSummary = {};
    topMove[1].details.forEach(d => {
       // Extract label part (e.g. "2-Set")
       const label = d.split('(')[0].trim();
       const pts = parseInt(d.match(/\((\d+)pts\)/)[1]);
       
       if (!reasonSummary[label]) reasonSummary[label] = { pts: 0, count: 0 };
       reasonSummary[label].pts += pts;
       reasonSummary[label].count++;
    });

    const reasonsFormatted = Object.entries(reasonSummary)
      .map(([label, data]) => {
         const countStr = data.count > 1 ? `x${data.count}` : "";
         return `${label}${countStr} (${data.pts}pts)`;
      })
      .join(", ");

    lastDecisionReason = `Predicted <strong>${topMoveName}</strong> with <strong>${confidence}%</strong> confidence.<br>Votes: ${reasonsFormatted}`;

    // Counter the predicted move
    return counterMove(topMoveName);
  }

  const move = randomMove();
  lastDecisionReason = "default random choice";
  return move;
}

function counterMove(move) {
  if (move === "rock") return "paper";
  if (move === "paper") return "scissors";
  return "rock";
}

function updateDecisionBox(robotMove, reason, gameResult = null) {
  const decisionContent = document.querySelector(".decision-content");
  if (decisionContent) {
    // Use session.games directly since it's already been incremented when this function is called
    const turnNumber = session.games;
    let message = `${turnNumber}. Robot chose ${robotMove} because ${reason}.`;

    // Add result indicator if game result is provided
    if (gameResult) {
      let resultClass = "";
      let resultText = "";

      // Note: result is from human perspective, so flip for robot
      if (gameResult === "win") {
        resultClass = "result-loss"; // Human won, robot lost
        resultText = "L";
      } else if (gameResult === "lose") {
        resultClass = "result-win"; // Human lost, robot won
        resultText = "W";
      } else if (gameResult === "draw") {
        resultClass = "result-draw";
        resultText = "D";
      }

      message += ` <span class="result-indicator ${resultClass}">${resultText}</span>`;
    }

    // Add the new message to the top, keep ALL previous messages for the current game
    const currentContent = decisionContent.innerHTML;
    if (currentContent.trim()) {
      decisionContent.innerHTML = message + "<br><br>" + currentContent;
    } else {
      decisionContent.innerHTML = message;
    }

    // No limit on messages - keep all turns for the current game
    // (Messages will be cleared when a new game starts)

    // Scroll to top to show the latest message
    decisionContent.scrollTop = 0;
  }
}

function getResult(human, computer) {
  if (human === computer) return "draw";
  if (
    (human === "rock" && computer === "scissors") ||
    (human === "paper" && computer === "rock") ||
    (human === "scissors" && computer === "paper")
  )
    return "win";
  return "lose";
}

function updateScoreboard() {
  // Player side
  document.getElementById("sessionWin").textContent = session.win;
  document.getElementById("sessionLoss").textContent = session.loss;
  // Draw center
  document.getElementById("sessionDraw").textContent = session.draw;
  // Robot side (Robot's win = player's loss, Robot's loss = player's win)
  document.getElementById("robotWin").textContent = session.loss;
  document.getElementById("robotLoss").textContent = session.win;

  // Use session.win for player, session.loss for robot
  const playerWins = session.win;
  const robotWins = session.loss;

  // Update win circles
  const playerWinCircle = document.getElementById("playerWinCircle");
  const robotWinCircle = document.getElementById("robotWinCircle");
  if (playerWinCircle) playerWinCircle.textContent = playerWins;
  if (robotWinCircle) robotWinCircle.textContent = robotWins;

  // Set colors
  playerWinCircle.classList.remove("green", "red");
  robotWinCircle.classList.remove("green", "red");
  if (playerWins > robotWins) {
    playerWinCircle.classList.add("green");
    robotWinCircle.classList.add("red");
  } else if (robotWins > playerWins) {
    playerWinCircle.classList.add("red");
    robotWinCircle.classList.add("green");
  }
  // If tie, both remain grey

  // Per-move stats
  document.getElementById(
    "rockStats"
  ).textContent = `Wins: ${session.moveStats.rock.win}`;
  document.getElementById(
    "paperStats"
  ).textContent = `Wins: ${session.moveStats.paper.win}`;
  document.getElementById(
    "scissorsStats"
  ).textContent = `Wins: ${session.moveStats.scissors.win}`;

  // Update robot button stats if not currently thinking
  const robotBtn = document.getElementById("robotChoiceBtn");
  if (robotBtn && !robotBtn.classList.contains("robot-thinking")) {
    const robotStatsSpan = robotBtn.querySelector(".robot-stats");
    if (robotStatsSpan) {
      robotStatsSpan.textContent = `Wins: ${session.loss}`;
    }
  }
}

function addGameToHistory() {
  // Find existing row instead of adding new one
  const existingRow = gameHistory.find(
    (game) =>
      game.player === humanName &&
      game.model === modeLabel(mode) &&
      game.w === null &&
      game.l === null &&
      game.d === null
  );

  if (existingRow) {
    // Update existing row
    existingRow.w = session.win;
    existingRow.l = session.loss;
    existingRow.d = session.draw;
    existingRow.winner =
      session.win > session.loss
        ? humanName
        : session.loss > session.win
        ? "Robot"
        : "Draw";
  } else {
    // Fallback: add new row if somehow missing
    gameHistory.unshift({
      player: humanName,
      model: modeLabel(mode),
      w: session.win,
      l: session.loss,
      d: session.draw,
      winner:
        session.win > session.loss
          ? humanName
          : session.loss > session.win
          ? "Robot"
          : "Draw",
    });
    if (gameHistory.length > 20) gameHistory.length = 20;
  }
}

function modeLabel(mode) {
  if (mode === "random") return "Random";
  if (mode === "learn30") return "Learn after 30";
  if (mode === "pattern50") return "Patterns";
  if (mode === "uberlogic") return "UberLogic";
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
const rockIcon = document.getElementById("rps-rock");
const paperIcon = document.getElementById("rps-paper");
const scissorsIcon = document.getElementById("rps-scissors");
const rockWord = document.getElementById("rps-rock-word");
const paperWord = document.getElementById("rps-paper-word");
const scissorsWord = document.getElementById("rps-scissors-word");

// Helper for random timing
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Cartoon Actions ---

function rockBounceSmush() {
  rockIcon.classList.add("rock-bounce");
  setTimeout(() => {
    scissorsWord.classList.add("scissors-smush");
    setTimeout(() => {
      rockIcon.classList.remove("rock-bounce");
      scissorsWord.classList.remove("scissors-smush");
    }, 1200);
  }, 600);
}

function paperCrawlCover() {
  paperIcon.classList.add("paper-crawl");
  setTimeout(() => {
    rockWord.classList.add("rock-covered");
    setTimeout(() => {
      paperIcon.classList.remove("paper-crawl");
      rockWord.classList.remove("rock-covered");
    }, 1500);
  }, 700);
}

function scissorsCutPeel() {
  scissorsIcon.classList.add("scissors-cut");
  setTimeout(() => {
    paperWord.classList.add("paper-peel");
    setTimeout(() => {
      scissorsIcon.classList.remove("scissors-cut");
      paperWord.classList.remove("paper-peel");
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
const autopilotBtn = document.getElementById("autopilotBtn");

autopilotBtn.onclick = async function () {
  if (session.games >= 100) return;
  autopilotBtn.disabled = true;
  let delay = 60; // ms between moves for fast play
  while (session.games < 100) {
    // Pick a random move
    const moves = ["rock", "paper", "scissors"];
    const randomMove = moves[Math.floor(Math.random() * 3)];
    // Simulate button click
    const btn = document.querySelector(
      `.choiceBtn[data-choice="${randomMove}"]`
    );
    if (btn) btn.click();
    await new Promise((res) => setTimeout(res, delay));
  }
  autopilotBtn.disabled = false;
};

const autoPatternsBtn = document.getElementById("autoPatternsBtn");

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
    await new Promise((res) => setTimeout(res, delay));
  }
  autoPatternsBtn.disabled = false;
};

// New Player Pie Chart Logic
function renderPlayerPieChart() {
  const pieDiv = document.getElementById("playerPieChart");
  if (!pieDiv) return;

  // Count moves
  const counts = { rock: 0, paper: 0, scissors: 0 };
  session.moves.forEach((m) => counts[m]++);
  const total = session.moves.length;

  // If no moves yet, show empty chart
  if (total === 0) {
    pieDiv.innerHTML = `
      <svg width="192" height="192" viewBox="0 0 80 80">
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

  let svg = `<svg width="192" height="192" viewBox="0 0 80 80">`;

  // Background circle
  svg += `<circle r="40" cx="40" cy="40" fill="#eee"/>`;

  let currentAngle = 0;

  // Add rock slice if it exists
  if (rockAngle > 0) {
    svg += `<path d="${describeArc(
      40,
      40,
      40,
      currentAngle,
      currentAngle + rockAngle
    )}" fill="#ffb74d"/>`;

    // Add rock emoji on the slice
    const midAngle = currentAngle + rockAngle / 2;
    const iconPos = polarToCartesian(40, 40, 25, midAngle); // 25 is radius from center to place icon
    svg += `<text x="${iconPos.x}" y="${iconPos.y}" text-anchor="middle" dominant-baseline="central" font-size="8">🪨</text>`;

    currentAngle += rockAngle;
  }

  // Add paper slice if it exists
  if (paperAngle > 0) {
    svg += `<path d="${describeArc(
      40,
      40,
      40,
      currentAngle,
      currentAngle + paperAngle
    )}" fill="#64b5f6"/>`;

    // Add paper emoji on the slice
    const midAngle = currentAngle + paperAngle / 2;
    const iconPos = polarToCartesian(40, 40, 25, midAngle);
    svg += `<text x="${iconPos.x}" y="${iconPos.y}" text-anchor="middle" dominant-baseline="central" font-size="8">📄</text>`;

    currentAngle += paperAngle;
  }

  // Add scissors slice if it exists
  if (scissorsAngle > 0) {
    svg += `<path d="${describeArc(
      40,
      40,
      40,
      currentAngle,
      currentAngle + scissorsAngle
    )}" fill="#e57373"/>`;

    // Add scissors emoji on the slice
    const midAngle = currentAngle + scissorsAngle / 2;
    const iconPos = polarToCartesian(40, 40, 25, midAngle);
    svg += `<text x="${iconPos.x}" y="${iconPos.y}" text-anchor="middle" dominant-baseline="central" font-size="8">✂️</text>`;
  }

  svg += `</svg>`;
  pieDiv.innerHTML = svg;
}

// Helper to describe SVG arc
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M",
    cx,
    cy,
    "L",
    start.x,
    start.y,
    "A",
    r,
    r,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "Z",
  ].join(" ");
}
function polarToCartesian(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// Robot thinking animation functions
let robotThinkingInterval;
const robotChoices = [
  { emoji: "🪨", name: "Rock" },
  { emoji: "📄", name: "Paper" },
  { emoji: "✂️", name: "Scissors" },
];

function startRobotThinking() {
  // Don't start thinking if game is over
  if (session.games >= 100) {
    console.log("Game is over, not starting robot thinking");
    return;
  }

  const robotBtn = document.getElementById("robotChoiceBtn");
  if (!robotBtn) {
    console.log("Robot button not found");
    return;
  }

  // Clear any existing interval first
  if (robotThinkingInterval) {
    clearInterval(robotThinkingInterval);
  }

  console.log("Starting robot thinking animation");
  robotBtn.classList.add("robot-thinking");
  robotThinkingInterval = setInterval(() => {
    // Double check that game isn't over
    if (session.games >= 100) {
      clearInterval(robotThinkingInterval);
      robotThinkingInterval = null;
      robotBtn.classList.remove("robot-thinking");
      return;
    }

    const randomChoice = robotChoices[Math.floor(Math.random() * 3)];
    robotBtn.innerHTML = `
      ${randomChoice.emoji} ${randomChoice.name}
      <span class="btn-stats robot-stats">Wins: ${session.loss}</span>
    `;
  }, 200);
}

function stopRobotThinking(finalChoice) {
  const robotBtn = document.getElementById("robotChoiceBtn");
  if (!robotBtn) {
    return;
  }

  // Force clear the interval
  if (robotThinkingInterval) {
    clearInterval(robotThinkingInterval);
    robotThinkingInterval = null;
  }
  robotBtn.classList.remove("robot-thinking");

  const choiceData = robotChoices.find(
    (c) => c.name.toLowerCase() === finalChoice
  );
  if (choiceData) {
    robotBtn.innerHTML = `
      ${choiceData.emoji} ${choiceData.name}
      <span class="btn-stats robot-stats">Wins: ${session.loss}</span>
    `;
  }
}

// Dynamic Result Display System
let currentResultAnimation = null;
let isAnimationActive = false;

function showDynamicResult(result) {
  const dynamicResult = document.getElementById("dynamicResult");
  const drawCounter = document.getElementById("drawCounter");

  if (!dynamicResult) return;

  // If animation is already running, speed it up and interrupt
  if (isAnimationActive && currentResultAnimation) {
    interruptCurrentAnimation();
  }

  isAnimationActive = true;

  // Clear any existing animations
  dynamicResult.className = "dynamic-result";
  dynamicResult.innerHTML = "";

  // Set the text and style based on result
  let resultText = "";
  let resultClass = "";

  if (result === "win") {
    resultText = "You Win!";
    resultClass = "win";
  } else if (result === "lose") {
    resultText = "You Lose!";
    resultClass = "lose";
  } else if (result === "draw") {
    resultText = "It's a Draw!";
    resultClass = "draw";
  }

  dynamicResult.textContent = resultText;

  // Fade in with pulse animation
  const showTimeout = setTimeout(() => {
    dynamicResult.classList.add("show", resultClass);
  }, 100);

  // Create particle effects after shorter delay for rapid play
  const particleTimeout = setTimeout(() => {
    createParticleEffect(result, dynamicResult);
  }, 1000); // Reduced from 2000ms to 1000ms

  // Store timeouts for potential interruption
  currentResultAnimation = {
    showTimeout,
    particleTimeout,
    result,
    startTime: Date.now(),
  };
}

function interruptCurrentAnimation() {
  if (!currentResultAnimation) return;

  // Clear existing timeouts
  clearTimeout(currentResultAnimation.showTimeout);
  clearTimeout(currentResultAnimation.particleTimeout);

  const dynamicResult = document.getElementById("dynamicResult");
  const elapsed = Date.now() - currentResultAnimation.startTime;

  // If animation just started, fast-forward to particle stage
  if (elapsed < 500) {
    // Skip to particle effect immediately
    setTimeout(() => {
      createParticleEffect(currentResultAnimation.result, dynamicResult);
    }, 50);
  } else {
    // If we're mid-animation, speed up the current particles and finish
    speedUpCurrentParticles();
    setTimeout(() => {
      finishAnimation();
    }, 200);
  }
}

function speedUpCurrentParticles() {
  // Find all current particles and speed them up
  const particles = document.querySelectorAll(".particle");
  particles.forEach((particle) => {
    particle.style.transition = "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
  });
}

function createParticleEffect(result, sourceElement) {
  const sourceRect = sourceElement.getBoundingClientRect();
  const particleCount = 8; // Reduced from 12 for faster completion
  let targetElement;
  let targetRect;

  // Determine target based on result
  if (result === "win") {
    targetElement = document.getElementById("playerWinCircle");
  } else if (result === "lose") {
    targetElement = document.getElementById("robotWinCircle");
  } else if (result === "draw") {
    targetElement = document.getElementById("drawCounter");
    // Show draw counter
    targetElement.classList.add("show");
  }

  if (!targetElement) return;
  targetRect = targetElement.getBoundingClientRect();

  // Create particles
  for (let i = 0; i < particleCount; i++) {
    createParticle(sourceRect, targetRect, result, i);
  }

  // Hide the source text with disintegration effect
  sourceElement.style.animation = "disintegrate 0.6s ease forwards"; // Faster disintegration

  // After particles arrive, update counter and pulse
  setTimeout(() => {
    updateScoreCounter(result);
    sourceElement.classList.remove("show");
    sourceElement.style.animation = "";
    finishAnimation();
  }, 800); // Reduced from 1200ms
}

function finishAnimation() {
  isAnimationActive = false;
  currentResultAnimation = null;
}

function createParticle(sourceRect, targetRect, result, index) {
  const particle = document.createElement("div");
  particle.className = `particle ${result}`;

  // Set particle content based on result
  if (result === "win") {
    particle.textContent = "🎉";
  } else if (result === "lose") {
    particle.textContent = "💥";
  } else if (result === "draw") {
    particle.textContent = "⚖️";
  }

  // Random starting position around source
  const startX =
    sourceRect.left + sourceRect.width / 2 + (Math.random() - 0.5) * 100;
  const startY =
    sourceRect.top + sourceRect.height / 2 + (Math.random() - 0.5) * 50;

  // Target position
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;

  particle.style.position = "fixed";
  particle.style.left = startX + "px";
  particle.style.top = startY + "px";
  particle.style.zIndex = "1000";
  particle.style.pointerEvents = "none";

  document.body.appendChild(particle);

  // Animate to target with slight delay for each particle (reduced delay)
  setTimeout(() => {
    particle.style.transition = "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)"; // Faster transition
    particle.style.left = endX + "px";
    particle.style.top = endY + "px";
    particle.style.transform = "scale(0.2)";
    particle.style.opacity = "0";

    // Remove particle after animation
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 600); // Reduced cleanup time
  }, index * 50); // Reduced stagger delay from 100ms to 50ms
}

function updateScoreCounter(result) {
  let targetElement;

  if (result === "win") {
    targetElement = document.getElementById("playerWinCircle");
  } else if (result === "lose") {
    targetElement = document.getElementById("robotWinCircle");
  } else if (result === "draw") {
    targetElement = document.getElementById("drawCounter");
  }

  if (targetElement) {
    // Pulse animation
    targetElement.classList.add("pulse");
    setTimeout(() => {
      targetElement.classList.remove("pulse");
    }, 600);

    // Update draw counter specifically
    if (result === "draw") {
      targetElement.textContent = session.draw;
    }
  }
}
