# UberLogic AI Implementation Summary

## Overview

Successfully implemented a sophisticated "UberLogic" AI mode that combines multiple learning strategies to create the most effective Rock-Paper-Scissors opponent.

## Key Features

### 1. **Immediate Learning (No Waiting Period)**

- Turn 1: Random choice (no data available)
- Turn 2+: Starts learning and countering immediately
- Continuously improves predictions as more data accumulates

### 2. **Multi-Strategy Learning System**

#### Pattern Detection (Weighted by Length)

- **5-move patterns** (Weight: 50 points) - Highest priority
- **4-move patterns** (Weight: 35 points)
- **3-move patterns** (Weight: 25 points)
- **2-move patterns** (Weight: 15 points)

#### Contextual Behavior Tracking (Weight: 30 points each)

- **Post-Win Behavior** - What player does after winning
- **Post-Loss Behavior** - What player does after losing
- **Post-Draw Behavior** - What player does after drawing

#### Overall Frequency Analysis (Weight: 10 points)

- Tracks most-played hand (rock/paper/scissors)
- Used as baseline/fallback prediction

### 3. **Weighted Scoring System**

The AI assigns scores to each possible move (rock/paper/scissors) based on:

1. Longest matching pattern gets highest priority
2. Recent context (post-win/loss/draw) gets high weight
3. Overall frequency provides baseline
4. All scores are combined to make final prediction
5. AI counters the highest-scoring predicted move

## Technical Implementation

### Data Structures Added

```javascript
aiState = {
  moveCounts: { rock: 0, paper: 0, scissors: 0 },
  lastHumanMove: null,
  lastResult: null,
  afterLossMap: {}, // NEW
  afterWinMap: {}, // NEW
  afterDrawMap: {}, // NEW
  patterns: [],
  patterns2: [], // NEW - 2-move sequences
  patterns3: [], // NEW - 3-move sequences
  patterns4: [], // NEW - 4-move sequences
  patterns5: [], // NEW - 5-move sequences
};
```

### Learning Logic

After each player move, UberLogic tracks:

1. **Contextual behavior**: Records what player does after each result type
2. **Pattern sequences**: Stores 2-5 move sequences and what came next
3. **Move frequency**: Updates overall move counts

### Decision Logic

```
For each possible move (rock/paper/scissors):
  score = 0

  Check 5-move pattern → score += 50 if match
  Check 4-move pattern → score += 35 if match
  Check 3-move pattern → score += 25 if match
  Check 2-move pattern → score += 15 if match

  Check post-win/loss/draw → score += 30 if match

  Add frequency baseline → score += (frequency% * 10)

Select highest scoring move as prediction
Counter the prediction
```

## Example Decision Reasoning

The robot decision box will show reasoning like:

```
"predicted rock based on: 5-move pattern detected (3x),
after loss pattern (5x), overall frequency 45%"
```

This transparency helps players understand how the AI is learning and adapting.

## Advantages Over Previous Modes

### vs Random Choice

- Actually learns and adapts instead of pure randomness
- Exploits player patterns and tendencies

### vs Learn After 30

- No waiting period - starts learning immediately
- Tracks more types of patterns (not just post-loss)
- Uses weighted scoring instead of single strategy

### vs Pattern Matching

- Tracks multiple pattern lengths (2-5 instead of just 3)
- Includes contextual behavior (post-win/loss/draw)
- Combines multiple signals instead of single pattern match
- No waiting period (53 turns)

## UI Changes

### New Button Added

- **Label**: "UberLogic 🧠"
- **Tooltip**: "Advanced AI that learns from turn 2 onwards. Tracks 2-5 move patterns, post-win/loss/draw behavior, and overall frequency. Combines all strategies with weighted scoring for maximum effectiveness."
- **Position**: Fourth button in algorithm selector

### Game History

- Shows "UberLogic" in the Model column for games played with this mode

## Files Modified

1. **script.js**

   - Expanded `aiState` object with new tracking structures
   - Added UberLogic decision logic (~150 lines)
   - Added UberLogic learning logic (~60 lines)
   - Updated `modeLabel()` function

2. **index.html**

   - Added UberLogic button with tooltip

3. **style.css**
   - No changes needed (existing styles apply)

## Testing Recommendations

1. **Test Pattern Recognition**

   - Play repetitive patterns (e.g., rock-rock-rock)
   - See if AI adapts quickly

2. **Test Contextual Learning**

   - Always play rock after winning
   - See if AI predicts and counters this

3. **Test Combined Strategies**

   - Mix patterns with contextual behavior
   - Observe how AI weighs different signals

4. **Compare Performance**
   - Play 100 rounds with each mode
   - Compare win rates: Random vs Learn30 vs Pattern50 vs UberLogic

## Expected Behavior

- **Early game (turns 2-10)**: Limited data, mostly uses frequency
- **Mid game (turns 11-50)**: Patterns start emerging, better predictions
- **Late game (turns 51-100)**: Strong pattern recognition, contextual awareness, highly adaptive

The AI should become noticeably harder to beat as the game progresses!
