# Faahlor

> **How good is your eye for color?**

A color perception game. You're shown a target color. Adjust hue and brightness sliders
to match it. The closer you get, the higher your score. Five rounds per match.

---

## Prerequisites

| Tool        | Version  | Install                          | Notes                           |
|-------------|----------|----------------------------------|---------------------------------|
| Java        | 21+      | https://adoptium.net             | Required                        |
| Maven       | 3.9+     | https://maven.apache.org         | Required                        |
| Node.js     | 20+      | https://nodejs.org               | Required                        |
| PostgreSQL  | 15+      | https://www.postgresql.org       | Optional (use H2 for local dev) |

---

## Setup

### 1. Clone or unzip the project

```bash
cd faahlor/
```

### 2. (Optional) Set up PostgreSQL for production

For local development, the backend uses **H2 in-memory database** by default — no setup needed.

To use PostgreSQL instead (for production or testing):

```sql
-- Connect as a superuser (e.g. psql -U postgres)
CREATE USER faahlor WITH PASSWORD 'faahlor';
CREATE DATABASE faahlor OWNER faahlor;
GRANT ALL PRIVILEGES ON DATABASE faahlor TO faahlor;
```

Then create `backend/src/main/resources/application-postgres.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/faahlor
spring.datasource.username=faahlor
spring.datasource.password=faahlor
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
server.port=8080
```

### 3. (Optional) Override frontend API URL

Edit `frontend/.env.local` if your backend runs on a different port:

```
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## Running

Open **two terminals**.

### Terminal 1 — Backend

#### Local Development (H2 in-memory database)

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

The backend starts on **http://localhost:8080**.

Flyway automatically creates the `match` and `round` tables on first startup. Uses H2 in-memory database — data is lost when the server stops.

#### Production (PostgreSQL)

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

Requires PostgreSQL to be running (see Setup section).

### Terminal 2 — Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on **http://localhost:3000**.

Open **http://localhost:3000** in your browser.

---

## Running Tests

### Backend tests

```bash
cd backend
mvn test
```

Tests use H2 in-memory database — no PostgreSQL required. All tests pass with the default H2 profile.

Covers:
- `ScoringServiceTest` — perfect score, worst score, hue wraparound, parameterized cases
- `ColorGenerationServiceTest` — range validation, saturation, randomness
- `MatchControllerIntegrationTest` — full 5-round flow, duplicate submission, validation errors (13 tests, all passing)

### Frontend tests

```bash
cd frontend
npx jest
```

Covers:
- `color.test.ts` — hslToCss, clamp, formatAccuracy, validation helpers
- `gameStore.test.ts` — all state transitions, reset, error handling

---

## Project Structure

```
faahlor/
├── vision.md             Product vision and scoring explanation
├── architecture.md       Technical architecture and design decisions
├── README.md
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/faahlor/
│       │   │   ├── FaahlorApplication.java
│       │   │   ├── config/           CorsConfig
│       │   │   ├── controller/       MatchController
│       │   │   ├── dto/              Request/response DTOs
│       │   │   ├── exception/        Domain exceptions + GlobalExceptionHandler
│       │   │   ├── mapper/           HslColorMapper
│       │   │   ├── model/            Match, Round, HslColor
│       │   │   ├── repository/       MatchRepository, RoundRepository
│       │   │   └── service/          MatchService, RoundService,
│       │   │                         ColorGenerationService, ScoringService
│       │   └── resources/
│       │       ├── application.properties
│       │       └── db/migration/V1__initial_schema.sql
│       └── test/
│           ├── java/com/faahlor/
│           │   ├── controller/       MatchControllerIntegrationTest
│           │   └── service/          ScoringServiceTest,
│           │                         ColorGenerationServiceTest
│           └── resources/
│               └── application.properties  (H2 config)
└── frontend/
    ├── app/              layout.tsx, page.tsx, globals.css
    ├── components/       WelcomeScreen, GameScreen, RoundResultScreen,
    │                     SummaryScreen, ColorSwatch, HueSlider,
    │                     BrightnessSlider, AccuracyBar, ErrorBanner
    ├── hooks/            useGame.ts
    ├── lib/              api.ts, color.ts
    ├── store/            gameStore.ts
    └── __tests__/        color.test.ts, gameStore.test.ts
```

---

## API Reference

| Method | Path                              | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | `/api/matches`                    | Create a new match       |
| GET    | `/api/matches/{id}/round/current` | Get current round        |
| POST   | `/api/rounds/submit`              | Submit a round answer    |
| GET    | `/api/matches/{id}/summary`       | Get completed match summary |

All errors return `{ "code": "...", "message": "..." }` with an appropriate HTTP status.

---

## Gameplay

1. Press **Start Match**
2. Study the **Target** color swatch
3. Drag the **Hue** slider to match the color family
4. Drag the **Brightness** slider to match the lightness
5. Press **Submit** — your accuracy and score appear
6. Repeat for all 5 rounds
7. See your **total score**, average accuracy, and round-by-round breakdown
8. Press **Play again** to start a new match immediately

**Scoring:** identical colors = 1000 points. Hue (70%) and brightness (30%) are
weighted by perceptual importance. Maximum score per match: 5000 points.
