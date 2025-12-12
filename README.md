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

**The "Committee of Experts" AI** - Uses a **Dynamic Weighted Voting System**. Instead of a single logic module making the decision, every learning strategy casts "votes" on what the player will do next.

**Turn 1:**

- Makes random choice (no data available)

**Turn 2+:**

- All active strategies cast votes for what the player will play.
- **Votes are weighted** by how "proven" the pattern is (Score = Base × Frequency).
- The AI calculates a **Confidence Score** (%) based on the vote distribution.

**The Voting Committee (Base Scores):**

1. **Pattern Detection** (Multiplied by # of times pattern occurred)

   - **5-Set Pattern:** 50 points (x Count)
   - **4-Set Pattern:** 40 points (x Count)
   - **3-Set Pattern:** 30 points (x Count)
   - **2-Set Pattern:** 20 points (x Count)

2. **Contextual Habits** (Multiplied by # of times habit occurred)

   - **Post-Win/Loss/Draw:** 25 points (x Count)

3. **Overall Frequency** (Base 15 points x Percentage)
   - If player chooses Rock 60% of time → 15 \* 6 = 90 points.

**The Mathematical Algorithm:**

The AI calculates a **Vote Score** $V(m)$ for each possible move $m \in \{R, P, S\}$:

$$V(m) = V_{pattern}(m) + V_{context}(m) + V_{freq}(m)$$

Where:

- **Pattern Component:** $V_{pattern}(m) = \sum_{k=2}^{5} (W_k \times C_{k}(m) \times R_t)$
  - $W_k$: Base weights (100, 80, 60, 40)
  - $R_t$: **Recency Multiplier** ($1.0$ to $3.0$). Recent patterns are weighted **3x** higher than old ones.
- **Context Component:** $V_{context}(m) = 40 \times C_{ctx}(m)$
  - $C_{ctx}(m)$ = Times move $m$ was played after the current result (Win/Loss/Draw)
- **Frequency Component:** $V_{freq}(m) = 15 \times P(m)$
  - $P(m)$ = Player's usage percentage of move $m$ (scaled 0-10)

**Confidence Calculation:**

The confidence percentage $C$ is scaled by an **Experience Curve** based on games played $N$:

$$C = \left( \frac{\max(V(m))}{\sum V(m)} \right) \times \min\left(1, \frac{\log_{10}(N+1)}{2}\right) \times 100$$

- **Early Game ($N < 10$):** LOG factor reduces confidence (e.g., Turn 2 ≈ 15%).
- **Late Game ($N > 90$):** LOG factor allows up to 100% confidence.

**Decision Output:**

- Predict move $m$ with highest $V(m)$.
- Play counter-move to $m$.

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

## � Recent Updates

### December 2025 - UberLogic AI Implementation

**New Features:**

- ✅ Added **UberLogic 🧠** AI mode - the most advanced opponent
- ✅ Multi-strategy learning system (5 strategies combined)
- ✅ Weighted scoring algorithm for intelligent predictions
- ✅ Pattern detection for 2-5 move sequences
- ✅ Contextual behavior tracking (post-win/loss/draw)
- ✅ Transparent decision reasoning in robot decision box
- ✅ No waiting period - learns from turn 2 onwards

**Technical Improvements:**

- Enhanced `aiState` object with new tracking structures
- Added ~210 lines of sophisticated AI logic
- Comprehensive documentation in README and UBERLOGIC_IMPLEMENTATION.md

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
- AI learning visualization dashboard

---

## �📝 License

This project is for testing AI approaches to win at Rock-Paper-Scissors.

---

## 🤝 Contributing

Feel free to fork, experiment with new AI strategies, and submit pull requests!
