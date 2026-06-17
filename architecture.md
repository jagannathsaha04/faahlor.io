# Faahlor — Architecture

## Overview

Faahlor is a client-server application with a clear boundary of responsibility:

- **Backend** owns all game logic: color generation, scoring, match state, persistence.
- **Frontend** owns all UI: rendering, slider controls, screen transitions, local loading state.

The frontend never generates colors or calculates scores. It only sends player input
and renders what the server returns.

---

## System Diagram

```
Browser (Next.js)
      │
      │  HTTP/JSON (REST)
      ▼
Spring Boot API  (:8080)
      │
      │  JDBC (JPA/Hibernate)
      ▼
PostgreSQL  (:5432)
```

---

## Backend

### Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Runtime       | Java 21                             |
| Framework     | Spring Boot 3.2                     |
| Web           | Spring Web (Spring MVC)             |
| Persistence   | Spring Data JPA + Hibernate         |
| Database      | PostgreSQL 15+                      |
| Migrations    | Flyway                              |
| Build         | Maven                               |

### Package Structure

```
com.faahlor/
├── FaahlorApplication.java       Entry point
├── config/
│   └── CorsConfig.java           CORS: allows localhost:3000
├── controller/
│   └── MatchController.java      REST endpoints
├── dto/
│   ├── CreateMatchResponse.java
│   ├── CurrentRoundResponse.java
│   ├── ErrorResponse.java
│   ├── HslColorDto.java
│   ├── MatchSummaryResponse.java
│   ├── SubmitRoundRequest.java
│   └── SubmitRoundResponse.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── InvalidGameStateException.java
│   ├── MatchNotFoundException.java
│   └── RoundNotFoundException.java
├── mapper/
│   └── HslColorMapper.java
├── model/
│   ├── HslColor.java             Value object
│   ├── Match.java                JPA entity
│   └── Round.java                JPA entity
├── repository/
│   ├── MatchRepository.java
│   └── RoundRepository.java
└── service/
    ├── ColorGenerationService.java
    ├── MatchService.java
    ├── RoundService.java
    └── ScoringService.java
```

### Service Responsibilities

**ColorGenerationService**
- Generates a random `HslColor` with:
  - Hue: uniform random in [0, 360)
  - Saturation: fixed at 1.0
  - Brightness: uniform random in [0.25, 0.75]
- Used only by `RoundService` at match creation time.

**ScoringService**
- Pure function: takes target and submitted `HslColor`, returns accuracy and score.
- Uses the weighted perceptual distance formula (see `vision.md`).
- No dependencies. Fully unit-testable.

**RoundService**
- Creates rounds for a match.
- Validates that a round has not already been submitted (prevents duplicate submission).
- Delegates scoring to `ScoringService`.

**MatchService**
- Orchestrates the full match lifecycle.
- On `createMatch`: persists a `Match`, pre-generates all 5 `Round` rows with target colors.
- On `submitRound`: validates match state, applies submitted color, checks if all rounds
  are complete, marks match as completed if so.
- On `getMatchSummary`: validates match is complete, assembles the summary DTO.

### Design Decisions

**All 5 rounds pre-generated at match creation**

Rounds and their target colors are created when `POST /api/matches` is called, not
lazily per round. This eliminates timing issues and means `GET /round/current` is
always a simple read. It also enables future features like revealing upcoming round
count.

**Saturation forced to 1.0 on submit**

The submit request only accepts `hue` and `brightness`. The backend constructs the
`HslColor` with `saturation = 1.0` unconditionally. This matches the game design:
saturation is not user-controlled.

**JPA generates UUIDs**

IDs are generated in Java using `GenerationType.UUID` rather than relying on
`gen_random_uuid()` in SQL. This makes the schema portable across PostgreSQL and H2
(used in integration tests).

---

## Database Schema

```sql
CREATE TABLE match (
    id           UUID PRIMARY KEY,
    started_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP,           -- NULL until all 5 rounds submitted
    total_score  INTEGER              -- NULL until complete
);

CREATE TABLE round (
    id                   UUID PRIMARY KEY,
    match_id             UUID NOT NULL REFERENCES match(id) ON DELETE CASCADE,
    round_number         INTEGER NOT NULL,     -- 1–5
    target_hue           DOUBLE PRECISION NOT NULL,
    target_saturation    DOUBLE PRECISION NOT NULL,
    target_brightness    DOUBLE PRECISION NOT NULL,
    submitted_hue        DOUBLE PRECISION,     -- NULL until submitted
    submitted_saturation DOUBLE PRECISION,
    submitted_brightness DOUBLE PRECISION,
    accuracy             DOUBLE PRECISION,     -- NULL until submitted
    score                INTEGER,              -- NULL until submitted
    UNIQUE (match_id, round_number)
);
```

Submission state is inferred: a round is submitted when `submitted_hue IS NOT NULL`.

---

## API

All endpoints live under `/api`. All responses are JSON.

### Error shape

```json
{ "code": "MATCH_NOT_FOUND", "message": "Match not found: <uuid>" }
```

| Code                | HTTP Status | Cause                              |
|---------------------|-------------|------------------------------------|
| `MATCH_NOT_FOUND`   | 404         | No match with the given ID         |
| `ROUND_NOT_FOUND`   | 404         | Round number not found in match    |
| `INVALID_GAME_STATE`| 409         | Duplicate submit, match complete   |
| `INVALID_REQUEST`   | 400         | Validation failure (hue, brightness) |
| `INTERNAL_ERROR`    | 500         | Unexpected server error            |

### Endpoints

#### `POST /api/matches`
Creates a new match and pre-generates all 5 rounds.

```json
// Response 201
{ "matchId": "550e8400-e29b-41d4-a716-446655440000" }
```

#### `GET /api/matches/{id}/round/current`
Returns the current unsubmitted round.

```json
// Response 200
{
  "matchId": "550e8400-...",
  "roundNumber": 1,
  "targetColor": { "hue": 217.4, "saturation": 1.0, "brightness": 0.412 }
}
```

#### `POST /api/rounds/submit`
Submits the player's answer for the current round.

```json
// Request
{ "matchId": "550e8400-...", "roundNumber": 1, "hue": 200.0, "brightness": 0.45 }

// Response 200
{
  "accuracy": 88.4,
  "score": 884,
  "targetColor": { "hue": 217.4, "saturation": 1.0, "brightness": 0.412 },
  "submittedColor": { "hue": 200.0, "saturation": 1.0, "brightness": 0.45 },
  "isMatchComplete": false,
  "nextRoundNumber": 2
}
```

#### `GET /api/matches/{id}/summary`
Returns the completed match summary. Returns 409 if match is not yet complete.

```json
// Response 200
{
  "matchId": "550e8400-...",
  "totalScore": 4210,
  "averageAccuracy": 84.2,
  "rounds": [
    {
      "roundNumber": 1,
      "targetColor": { ... },
      "submittedColor": { ... },
      "accuracy": 88.4,
      "score": 884
    }
    // ... 4 more
  ]
}
```

---

## Frontend

### Stack

| Layer         | Technology            |
|---------------|-----------------------|
| Framework     | Next.js 15 (App Router) |
| UI            | React 19, TypeScript  |
| State         | Zustand               |
| Styling       | Tailwind CSS          |
| Testing       | Jest + ts-jest        |

### Structure

```
frontend/
├── app/
│   ├── layout.tsx        Root layout, metadata
│   ├── page.tsx          Phase router (idle/playing/round-result/summary)
│   └── globals.css       CSS custom properties, slider styles
├── components/
│   ├── WelcomeScreen.tsx
│   ├── GameScreen.tsx
│   ├── RoundResultScreen.tsx
│   ├── SummaryScreen.tsx
│   ├── ColorSwatch.tsx   Renders a color block with ARIA label
│   ├── HueSlider.tsx     Rainbow gradient slider
│   ├── BrightnessSlider.tsx  Hue-tracking gradient slider
│   ├── AccuracyBar.tsx   ARIA progressbar
│   └── ErrorBanner.tsx   aria-live="assertive" error display
├── hooks/
│   └── useGame.ts        All API calls; orchestrates state transitions
├── lib/
│   ├── api.ts            Typed fetch wrapper, FaahlorApiError class
│   └── color.ts          hslToCss, formatAccuracy, validation helpers
├── store/
│   └── gameStore.ts      Zustand store: phase, match, round, player color
└── __tests__/
    ├── color.test.ts     25 tests
    └── gameStore.test.ts 15 tests
```

### State Machine

```
idle ──[startMatch]──► playing ──[submitRound]──► round-result
  ▲                                                    │
  │                                          [advanceAfterRound]
  │                                               │         │
  │                                          (rounds       (last
  │                                          remain)       round)
  │                                               │         │
  │                                          playing    summary
  │                                                         │
  └─────────────────────[playAgain]─────────────────────────┘
```

### Key Design Decisions

**`useGame` owns all async logic**

The Zustand store holds state. The `useGame` hook holds all `async/await` logic and
API calls. Components call `useGame` actions and read from the store. This separation
keeps components simple and makes the async flow easy to follow and test.

**Saturation fixed at 1.0 client-side**

The player color in the store always has `saturation: 1.0`. The `setPlayerHue` and
`setPlayerBrightness` actions only update those fields. The submit request sends only
`hue` and `brightness` — the backend is the authority on saturation.

**Brightness slider gradient tracks hue**

The `BrightnessSlider` rerenders its gradient whenever `playerColor.hue` changes,
showing the full dark-to-light range at the current hue. This makes it immediately
clear what adjusting brightness will do.

---

## Testing Strategy

### Backend (JUnit 5 + Spring Boot Test)

| Test class                         | Type        | Coverage                                |
|------------------------------------|-------------|-----------------------------------------|
| `ScoringServiceTest`               | Unit        | Perfect score, worst score, hue wraparound, parameterized cases |
| `ColorGenerationServiceTest`       | Unit        | Ranges, saturation=1.0, randomness (50 repetitions) |
| `MatchControllerIntegrationTest`   | Integration | Full 5-round flow, duplicate submit, post-completion submit, all validation errors, 404s |

Integration tests use **H2 in-memory database** (PostgreSQL-compatible mode) with
Flyway running the same migration as production. No mocking of the database layer.

### Frontend (Jest + ts-jest)

| Test file             | Coverage                                               |
|-----------------------|--------------------------------------------------------|
| `color.test.ts`       | hslToCss, defaultPlayerColor, clamp, formatAccuracy, isValidHue, isValidBrightness |
| `gameStore.test.ts`   | All state transitions, reset, loading, error           |

---

## Security Considerations

- CORS is restricted to `http://localhost:3000` in development.
- All input is validated with Bean Validation before reaching service layer.
- No authentication: this is a local MVP. Production would add rate limiting and auth.
- No user-provided strings are interpolated into queries (JPA parameterized queries throughout).
