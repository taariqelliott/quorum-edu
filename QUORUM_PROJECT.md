# Quorum — Project Scope & Tech Stack

## What Is Quorum

Quorum is a real-time classroom game platform. A teacher crafts a prompt describing what they want students to learn, AI generates a 10-question quiz, and the whole class plays together — voting collectively on each answer. Majority rules. The class wins or loses as one.

At the end of the game, the teacher can generate a PDF recap with every question, the correct answer, a definition, and an example for each concept.

---

## Core User Flows

### Teacher Flow

1. Land on homepage (`/`)
2. Type a prompt (e.g. "help my students learn about fractions in a fun way")
3. Click "Create Game" — loading state appears ("Creating your game...") while AI generates 10 questions
4. On success, redirected to waiting room (`/room/[code]`)
5. On failure, inline error shown with prompt preserved — teacher can retry
6. Waiting room displays:
   - Large QR code (primary join method)
   - Room code (fallback join method)
   - Live list of students who have joined (showing their assigned names)
7. Teacher clicks "Start Game" once ready
8. Redirected to host view (`/room/[code]/host`)
9. Host view shows:
   - Current question + all 4 answer options
   - Live vote tally per option
   - Class score
   - "Next Question" button to advance (teacher controls pace — no auto-advance)
10. After question 10, game ends — end screen appears inline showing:
    - Final score: `X/10 correct` and `X pts`
    - "Generate Recap" button → spinner → "Report Ready" + download button (no new route)

### Student Flow

1. Scan QR code OR go to `/join` and enter room code
2. Get assigned a random display name automatically — format: `[adjective]_[education_word]_[4-digit number]` (e.g. `silly_calculator_1239`)
   - Name is generated client-side using `data/words.json`
   - Student can tap "Shuffle" to get a new name before joining
   - Once they tap "Join" the name is locked in
3. Land in waiting room (`/play/[code]`) — see other students joining live with their assigned names
4. When teacher starts, question appears on screen
5. Tap one of 4 answer options to vote
6. See live vote tally update in real time as other students vote
7. When teacher advances, see if class got it right — score updates
8. Repeat for all 10 questions
9. End screen appears inline showing:
   - Final class score (`X/10 correct`, `X pts`)
   - Scrollable recap of all 10 questions with the correct answer revealed for each

---

## Tech Stack

### Framework

- **Next.js 14** (App Router) with **TypeScript**

### Real-Time Backend

- **Convex** — handles all database state and real-time subscriptions
  - No separate WebSocket setup needed
  - Live queries update all clients instantly when state changes

### AI

- **Anthropic Claude API** (`claude-sonnet-4-6`)
  - Question generation from teacher prompt
  - PDF recap intro paragraph generation

### QR Code

- **qrcode.react** — generate QR in-browser pointing to `/join?code=[roomCode]`

### PDF Export

- **jspdf** — client-side PDF generation for the end-of-game recap

### Styling

- **Tailwind CSS**
- **shadcn/ui** — use shadcn components throughout (Button, Card, Input, Badge, etc.)
- Theme: education-inspired greens and blues via a shadcn/tweakcn preset (configured separately)
- Large readable type — students may be reading from across a desk
- Mobile-first on student views (they're on phones)
- Desktop-first on teacher/host views

---

## Monorepo Structure

This project uses Turborepo. The Next.js app lives in `apps/web/`, Convex lives at the root.

```text
quorum-edu/
├── convex/                          # Convex backend (root-level)
│   ├── schema.ts
│   ├── rooms.ts
│   ├── players.ts
│   ├── questions.ts
│   └── votes.ts
├── apps/
│   └── web/                         # Next.js app
│       ├── app/
│       │   ├── layout.tsx
│       │   ├── page.tsx             # Teacher home — prompt input + loading state
│       │   ├── ConvexClientProvider.tsx
│       │   ├── api/
│       │   │   ├── generate/
│       │   │   │   └── route.ts     # POST — Claude question generation + room creation
│       │   │   └── recap/
│       │   │       └── route.ts     # POST — Claude recap intro + PDF assembly trigger
│       │   ├── room/
│       │   │   └── [code]/
│       │   │       ├── page.tsx     # Teacher waiting room (QR + player list + start)
│       │   │       └── host/
│       │   │           └── page.tsx # Teacher host view + end screen
│       │   ├── join/
│       │   │   └── page.tsx         # Student join — enter code, shuffle/lock name
│       │   └── play/
│       │       └── [code]/
│       │           └── page.tsx     # Student game view + end screen
│       ├── components/              # App-specific components (flat)
│       │   ├── QRCode.tsx
│       │   ├── QuestionCard.tsx
│       │   ├── VoteOptions.tsx
│       │   ├── VoteTally.tsx
│       │   ├── ScoreBoard.tsx
│       │   └── RecapPDF.tsx
│       ├── lib/
│       │   ├── claude.ts            # generateQuestions(), generateRecapIntro()
│       │   ├── nameGenerator.ts     # generateName()
│       │   ├── pdf.ts               # buildPDF()
│       │   └── roomCode.ts          # generateRoomCode()
│       └── data/
│           └── words.json           # { adjectives: [...], educationWords: [...] }
└── packages/
    ├── ui/                          # Shared shadcn primitives (Button, Card, etc.)
    ├── eslint-config/
    └── typescript-config/
```

---

## Convex Schema

```ts
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    code: v.string(),
    prompt: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("active"),
      v.literal("finished")
    ),
    currentQuestion: v.number(), // 0-indexed, 0-9
    score: v.number(),
    createdAt: v.number(),
  }).index("by_code", ["code"]),

  players: defineTable({
    roomCode: v.string(),
    name: v.string(),
    joinedAt: v.number(),
  }).index("by_room", ["roomCode"]),

  questions: defineTable({
    roomCode: v.string(),
    index: v.number(),
    question: v.string(),
    options: v.array(v.string()), // exactly 4 options
    correctAnswer: v.string(),    // must match one of the options exactly
    definition: v.string(),
    example: v.string(),
  }).index("by_room", ["roomCode"]),

  votes: defineTable({
    roomCode: v.string(),
    questionIndex: v.number(),
    playerName: v.string(),
    answer: v.string(),
  }).index("by_room_question", ["roomCode", "questionIndex"]),
});
```

---

## Convex Functions

### `rooms.ts`

- `createRoom(prompt)` — creates room with a random 6-character uppercase alphanumeric code (A-Z, 2-9 only — excludes 0/O and 1/I to avoid ambiguity), status: `"waiting"`, score: `0`
- `getRoom(code)` — returns room by code
- `startGame(code)` — sets status to `"active"`, currentQuestion to `0`
- `advanceQuestion(code)` — tallies votes for currentQuestion; if majority answer === correctAnswer, adds 10pts; increments currentQuestion or calls `endGame` if on question 9
- `endGame(code)` — sets status to `"finished"`

### `players.ts`

- `joinRoom(roomCode, name)` — adds player, rejects duplicate names in the same room
- `getPlayers(roomCode)` — returns all players in room (live waiting room list)

### `questions.ts`

- `storeQuestions(roomCode, questions)` — bulk insert 10 generated questions
- `getQuestions(roomCode)` — returns all questions for a room
- `getQuestion(roomCode, index)` — returns single question by index

### `votes.ts`

- `submitVote(roomCode, questionIndex, playerName, answer)` — stores one vote, prevents duplicate votes per player per question
- `getVotes(roomCode, questionIndex)` — returns all votes for current question (used for live tally)

---

## API Routes

### `POST /api/generate`

Called from the teacher homepage on "Create Game". Runs server-side.

1. Calls Claude with the teacher's prompt
2. Parses returned JSON (10 questions)
3. Calls `createRoom(prompt)` then `storeQuestions(roomCode, questions)` via Convex
4. Returns `{ roomCode }` on success

**Loading state:** Homepage shows "Creating your game..." spinner for the duration.
**Error state:** Returns error message, homepage shows inline error, prompt is preserved.

**Prompt structure:**

```text
You are generating quiz questions for a K-12 classroom game.

Teacher's request: "{prompt}"

Generate exactly 10 multiple choice questions. Return ONLY valid JSON, no markdown, no explanation.

Format:
[
  {
    "index": 0,
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "definition": "One sentence definition of the core concept.",
    "example": "One concrete real-world example."
  }
]

Rules:
- correctAnswer must exactly match one of the options
- Questions should be age-appropriate and progressively harder
- Keep questions clear and concise
- options should be plausible (no obvious throwaway wrong answers)
```

### `POST /api/recap`

Called from the host end screen when teacher clicks "Generate Recap".

1. Fetches all questions for the room from Convex
2. Calls Claude to generate a 2–3 sentence intro paragraph summarizing the session
3. Returns `{ intro }` — PDF is assembled client-side via `jspdf`

---

## Game State Logic

### Room Lifecycle

```text
"waiting" → "active" → "finished"
```

### Vote Resolution

Teacher clicks "Next Question" → `advanceQuestion(code)` mutation:
1. Fetches all votes for `(roomCode, currentQuestion)`
2. Tallies votes per option
3. Winning option = most votes (ties: first option in array wins)
4. If winner === `correctAnswer` → `score += 10`
5. If `currentQuestion === 9` → `endGame(code)`, else `currentQuestion += 1`

Vote resolution is **purely teacher-controlled** — no auto-advance when all players vote.

### Score

- Max: 100 points (10 questions × 10 pts)
- Stored as raw integer on room document
- Displayed as: `7/10 correct — 70 pts`

---

## End Screens

### Teacher (host view — inline, no new route)

- Final score: `X/10 correct`, `X pts`
- "Generate Recap" button
  - On click: spinner ("Generating report...")
  - On success: "Report Ready" + Download button
  - On failure: inline error, retry available

### Student (play view — inline, no new route)

- Final score: `X/10 correct`, `X pts`
- Scrollable list of all 10 questions showing:
  - Question text
  - Correct answer highlighted
  - Definition
  - Example

---

## PDF Recap Structure

```text
QUORUM — Game Recap
[AI-generated intro paragraph]
[Teacher's original prompt]
Final Score: X / 100

Q1: [Question text]
Correct Answer: [Answer]
Definition: [Definition]
Example: [Example]

Q2: ...
...
```

---

## Edge Cases

| Scenario | Behavior |
| --- | --- |
| Claude fails / times out on `/api/generate` | Inline error on homepage, prompt preserved, no room created |
| Student enters wrong room code | Inline error: "Room not found" |
| Student tries to join active/finished room | Inline error: "This game has already started" |
| Duplicate player name | `joinRoom` rejects it, client silently regenerates a new name |
| Teacher refreshes host view | `useQuery` resubscribes on mount, state restored from Convex |
| `/api/recap` fails | Inline error below button, spinner resets, teacher can retry |

---

## Environment Variables

```bash
ANTHROPIC_API_KEY=
NEXT_PUBLIC_CONVEX_URL=
CONVEX_DEPLOY_KEY=
```

---

## What This Is NOT (Prototype Scope)

- No auth — teacher creates a game anonymously, no accounts
- No persistent history — games are ephemeral
- No student scoring — class wins or loses together, no individual leaderboard
- No image support in questions
- No timer — teacher controls pace manually via "Next Question"
- No auto-advance — teacher always controls when the class moves to the next question
- No rejoin logic — if a student disconnects they re-enter and generate a new name

---

## Design Direction

- **Student view:** Mobile-first, big tap targets, minimal chrome
- **Teacher/host view:** Desktop-first, data-dense, clear hierarchy
- **Signature element:** The vote tally — a live animated bar chart showing votes per option updating in real time as students tap
- **Theme:** Education-inspired greens and blues via shadcn/tweakcn preset (configured separately)
