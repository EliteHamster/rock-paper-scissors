# Rock-Paper-Scissors AI Game 🎮

A 100-round Rock-Paper-Scissors game where players compete against an AI robot that uses different learning strategies to try to beat them. This web-based game is published on Netlify and features dynamic animations, real-time statistics, and intelligent AI opponents.

## 🎯 Project Overview

This is an interactive browser game that pits human players against AI algorithms designed to learn and adapt to playing patterns. The game runs for 100 rounds, tracking detailed statistics and providing visual feedback through animations and particle effects.

**Live Demo:** Deployed on Netlify (static site hosting)

> **🆕 NEW: UberLogic AI Mode!** 🧠  
> The most advanced AI opponent yet - combines 5 learning strategies simultaneously with no waiting period. Learns from turn 2 onwards using pattern detection (2-5 move sequences), contextual behavior tracking (post-win/loss/draw), and weighted scoring. See how you fare against the smartest robot!

---

## 📁 Project Structure

```
rock-paper-scissors/
├── index.html          (144 lines - main game interface)
├── script.js           (957 lines - game logic & AI)
├── style.css           (1048 lines - styling & animations)
├── img/
│   └── Logo.png        (1.7MB logo image)
└── README.md
```

---

## ✨ Key Features

### 1. Four AI Modes

- **Random Choice** - Robot makes completely random selections on every turn
- **Learn After 30** - Robot observes for 30 turns while learning, then uses pattern analysis to predict and counter player moves
- **Pattern Matching** - Robot watches for 3-move sequences and counters them after 53 turns of observation
- **UberLogic 🧠** - Advanced AI that learns from turn 2 onwards, tracking 2-5 move patterns, post-win/loss/draw behavior, and overall frequency with weighted scoring

### 2. Game Mechanics

- **100-round matches** with countdown display
- **Real-time score tracking** (Wins/Losses/Draws)
- **Per-move statistics** showing how well Rock/Paper/Scissors perform
- **Game history table** displaying the last 20 completed games
- **Animated orbital title** with rotating rock/paper/scissors icons

### 3. Visual Features

- **Animated logo** with orbiting rock/paper/scissors icons
- **Dynamic result display** with particle effects that fly to score counters
- **Pie chart** showing player's move distribution in real-time
- **Robot decision box** - displays AI's reasoning for each choice in terminal-style green text
- **Win circles** that change color (green/red) based on who's winning
- **Interactive tooltips** explaining each AI mode and game elements
- **Smooth animations** for all game state changes

### 4. Automation Features

- **Autopilot button** - plays random moves automatically at high speed
- **Auto-Patterns button** - repeats your previous move pattern automatically

---

## 🛠️ Technical Implementation

### JavaScript (script.js - 957 lines)

**Core Systems:**

- **Session tracking** - Manages current game state, moves, and statistics
- **AI algorithms** implementing three different strategies:
  - Move frequency analysis
  - Pattern detection (3-move sequences)
  - Post-loss behavior learning
- **Particle animation system** - Creates flying emoji particles on win/loss/draw
- **Robot thinking animation** - Cycles through choices while "thinking"
- **SVG pie chart generation** - Dynamically renders player move distribution

**Key Functions:**

- `getComputerMove()` - AI decision-making logic for all three modes
- `showDynamicResult()` - Handles result animations and particle effects
- `renderPlayerPieChart()` - Generates SVG pie chart from move data
- `updateScoreboard()` - Updates all score displays and win circles
- `startRobotThinking()` / `stopRobotThinking()` - Robot animation control

### HTML (index.html - 144 lines)

**Structure:**

- Clean semantic HTML5 structure
- Orbital animated title with logo
- Algorithm selector with radio buttons and tooltips
- Game area with player vs robot sections
- Dynamic result display area
- History table for past games
- Accessible form controls

### CSS (style.css - 1048 lines)

**Styling Features:**

- **Custom fonts** from Google Fonts (Jolly Lodger, Sixtyfour Convergence, Nosifer, Bungee, etc.)
- **Extensive animations:**
  - Orbital rotation for title icons (`@keyframes orbit-planet`)
  - Robot pulse animation (`@keyframes robotPulse`)
  - Result pulse effects (`@keyframes resultPulse`)
  - Particle fly-to-target animations
  - Disintegration effects (`@keyframes disintegrate`)
- **Responsive layout** using flexbox
- **Color-coded feedback** (green for wins, red for losses, blue for draws)
- **Glassmorphism effects** on various UI elements
- **Custom tooltips** with gradient backgrounds

---

## 🤖 AI Strategy Details

### Random Choice Mode

- Selects rock, paper, or scissors with equal probability (33.3% each)
- No learning or adaptation
- Baseline for comparison with learning algorithms

### Learn After 30 Mode

**Learning Phase (Rounds 1-30):**

- Makes random choices
- Tracks frequency of each player move
- Records what player does after losing

**Active Phase (Rounds 31-100):**

- Calculates probability distribution of player moves
- Predicts most likely next move based on:
  - Overall move frequency
  - Post-loss behavior patterns
- Counters the predicted move

**Example Logic:**

```javascript
// If player uses Rock 50% of the time
// AI predicts Rock → AI plays Paper to counter
```

### Pattern Matching Mode

**Learning Phase (Rounds 1-53):**

- Makes random choices
- Records all 3-move sequences and what came next

**Active Phase (Rounds 54-100):**

- Looks at player's last 3 moves
- Searches for matching patterns in history
- Predicts the 4th move based on past occurrences
- Counters the predicted move
- Falls back to random if no pattern found

**Example Logic:**

```javascript
// If player did: Rock → Paper → Scissors
// And historically, this was followed by Rock
// AI predicts Rock → AI plays Paper to counter
```

### UberLogic Mode 🧠

**The Most Advanced AI** - Combines all learning strategies with no waiting period.

**Turn 1:**

- Makes random choice (no data available)

**Turn 2+:**

- Immediately starts learning and adapting
- Uses weighted scoring system to combine multiple signals

**Learning Systems (all active simultaneously):**

1. **Pattern Detection** (Weighted by length)

   - 5-move patterns (Weight: 50 points) - Highest priority
   - 4-move patterns (Weight: 35 points)
   - 3-move patterns (Weight: 25 points)
   - 2-move patterns (Weight: 15 points)

2. **Contextual Behavior** (Weight: 30 points each)

   - Post-win behavior - What player does after winning
   - Post-loss behavior - What player does after losing
   - Post-draw behavior - What player does after drawing

3. **Overall Frequency** (Weight: 10 points)
   - Tracks most-played hand
   - Provides baseline prediction

**Decision Process:**

```javascript
// For each possible move (rock/paper/scissors):
// 1. Check all pattern lengths (5 down to 2)
// 2. Check contextual behavior (win/loss/draw)
// 3. Add frequency baseline
// 4. Sum all weighted scores
// 5. Predict highest-scoring move
// 6. Counter the prediction

// Example reasoning:
"predicted rock based on: 5-move pattern detected (3x),
after loss pattern (5x), overall frequency 45%"
```

**Advantages:**

- No waiting period - learns from turn 2
- Combines multiple strategies simultaneously
- Adapts to both patterns AND context
- Transparent reasoning shown in decision box
- Gets progressively harder to beat

**AI Mode Comparison:**

| Mode             | Learning Start | Strategies Used           | Adaptability | Transparency |
| ---------------- | -------------- | ------------------------- | ------------ | ------------ |
| Random           | Never          | 0                         | None         | N/A          |
| Learn After 30   | Turn 31        | 2 (frequency + post-loss) | Medium       | Low          |
| Pattern Matching | Turn 54        | 1 (3-move patterns)       | Low          | Medium       |
| **UberLogic** 🧠 | **Turn 2**     | **5 (all combined)**      | **High**     | **High**     |

**Expected Performance by Game Phase:**

- **Early game (turns 2-10)**: Limited data, mostly frequency-based predictions
- **Mid game (turns 11-50)**: Pattern recognition kicks in, better predictions
- **Late game (turns 51-100)**: Highly adaptive with strong pattern + context awareness

**Testing Recommendations:**

1. **Test Pattern Recognition**: Play repetitive patterns (e.g., rock-rock-rock) and see if AI adapts quickly
2. **Test Contextual Learning**: Always play rock after winning, observe if AI predicts and counters
3. **Test Combined Strategies**: Mix patterns with contextual behavior to see weighted scoring in action
4. **Compare Performance**: Play 100 rounds with each mode and compare win rates

---

## 🎨 Design Patterns

1. **No external dependencies** - Pure vanilla JavaScript, HTML, CSS
2. **State management** - Uses global objects (`session`, `aiState`, `gameHistory`)
3. **Event-driven architecture** - Button clicks trigger game flow
4. **Animation interruption** - Can speed up animations for rapid play
5. **Modular functions** - Separated concerns for game logic, UI updates, and animations
6. **Progressive enhancement** - Core game works without animations

---

## 🚀 Deployment

- **Platform:** Netlify (static site hosting)
- **Build process:** None required - pure static files
- **Configuration:** No netlify.toml needed (using default settings)
- **Deployment:** Simply push to connected Git repository or drag-and-drop files

### Local Development

1. Clone the repository
2. Open `index.html` in a web browser
3. No build step or dependencies required

### File Serving

All files are served statically:

- `index.html` - Entry point
- `script.js` - Loaded via `<script>` tag
- `style.css` - Loaded via `<link>` tag
- `img/Logo.png` - Referenced in HTML

---

## 📊 Game Statistics Tracked

**Per Session:**

- Total wins, losses, draws
- Moves remaining (100 - current round)
- Win/loss/draw count per move type (Rock, Paper, Scissors)
- Move distribution (visualized in pie chart)
- AI decision reasoning (displayed in decision box)

**Historical:**

- Last 20 game results
- Player name, AI mode used, final scores
- Winner determination

---

## 🎯 Future Enhancement Ideas

- LocalStorage integration for persistent game history
- Additional AI modes (e.g., Markov chains, neural networks)
- Multiplayer support
- Sound effects and music
- Difficulty levels
- Mobile-responsive improvements
- Export game statistics
- Leaderboard system

---

## 📝 License

This project is for testing AI approaches to win at Rock-Paper-Scissors.

---

## 🤝 Contributing

Feel free to fork, experiment with new AI strategies, and submit pull requests!
