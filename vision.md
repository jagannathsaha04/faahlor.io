# Faahlor — Vision

## Tagline

**How good is your eye for color?**

## What Is Faahlor?

Faahlor is a color perception game that tests a player's ability to visually identify
and reproduce colors. The player is shown a randomly generated target color and must
recreate it by adjusting hue and brightness sliders. The closer the match, the higher
the score.

## Core Experience

- **Immediate**: No accounts, no setup. Click Start Match and you're playing.
- **Tactile**: Sliders update the color in real time. The feedback is instantaneous.
- **Fair**: Scoring is mathematically consistent. A good eye always wins.
- **Replayable**: Each match generates five new random colors. No two matches are alike.

## Game Rules

- A **match** consists of exactly **5 rounds**.
- Each round:
  1. The backend generates a random target color (server-side, never predictable).
  2. The player adjusts hue and brightness sliders to recreate it.
  3. The player submits.
  4. The backend calculates score and accuracy.
  5. Results are displayed.
  6. The next round begins.
- After round 5, the match is complete. A summary shows total score, average accuracy,
  and a per-round breakdown.
- The player can start a new match immediately.

## Color Model

Colors are represented in **HSL** (Hue, Saturation, Lightness):

| Component  | Range     | User-controlled? |
|------------|-----------|-----------------|
| Hue        | 0–360°    | Yes             |
| Saturation | 1.0 fixed | No              |
| Brightness | 0.0–1.0   | Yes             |

Saturation is fixed at 100% to maximize color vividness and perceptual distinctness.
Target brightness is constrained to 0.25–0.75 to avoid near-black and near-white
colors where hue becomes imperceptible.

## Scoring

Scoring uses a weighted perceptual distance formula:

```
hueDiff          = min(|h1 − h2|, 360 − |h1 − h2|)   // circular
brightnessDiff   = |b1 − b2|

normalizedDistance = 0.70 × (hueDiff / 180)
                   + 0.30 × (brightnessDiff / 0.50)

accuracy  = max(0, (1 − normalizedDistance) × 100)    // 0–100%
score     = round(accuracy × 10)                       // 0–1000 points
```

- Identical colors: **100% accuracy, 1000 points**.
- Hue is weighted 70% because it is the dominant perceptual dimension.
- Brightness is weighted 30%.
- A perfect 5-round match scores **5000 points**.

## Design Principles

1. **Server owns game state.** Colors are generated server-side. Score is calculated
   server-side. The frontend never computes a score or generates a color.

2. **Simple controls, deep challenge.** Two sliders. Infinite variation. The game is
   easy to understand and hard to master.

3. **Honest feedback.** Accuracy and score are shown immediately after each round.
   The player always knows exactly how they did and why.

4. **Accessible.** All interactive elements support keyboard navigation and carry
   ARIA labels. Color is never the sole carrier of information.

## Target Audience

Anyone curious about their own color perception — designers, artists, or people who
just want to know if their eyes are as sharp as they think.
