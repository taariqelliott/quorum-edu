# Quorum — Project Scope & Tech Stack

## What Is Quorum

Quorum is a real-time classroom game platform. A teacher crafts a prompt describing what they want students to learn, AI generates a 10-question quiz, and the whole class plays together — voting collectively on each answer. Majority rules. The class wins or loses as one.

At the end of the game, AI generates a PDF recap with every question, the correct answer, a definition, and an example for each concept.

---

## Core User Flows

### Teacher Flow

1. Land on homepage (`/`)
2. Type a prompt (e.g. "help my students learn about fractions in a fun way")
3. Click "Create Game" — AI generates 10 questions in the background
4. Room is created, redirected to waiting room (`/room/[code]`)
5. Waiting room displays:
  - Large QR code (primary join method)
  - Room code (fallback join method)
  - Live list of students who have joined (showing their assigned names)
6. Teacher clicks "Start Game" once ready
7. Redirected to host view (`/room/[code]/host`)
8. Host view shows:
  - Current question + all 4 answer options
  - Live vote tally per option
  - Class score
  - "Next Question" button to advance (teacher-controlled pace)
9. After question 10, game ends — final score shown
10. Button to download AI-generated PDF recap

### Student Flow

1. Scan QR code OR go to `/join` and enter room code
2. Get assigned a random display name automatically — format: `[adjective]_[education_word]_[4-digit number]` (e.g. `silly_calculator_1239`)
  - Name is generated client-side using `data/words.json`
  - Student can tap "Shuffle" to get a new name before joining
  - Once they tap "Join" the name is locked in
3. Land in waiting room (`/play/[code]`) — see other students joining live with their assigned names
4. When teacher starts, question appears on screen
5. Tap one of 4 answer options to vote
6. See live vote results after majority locks in or teacher advances
7. See if class got it right — score updates
8. Repeat for all 10 questions
9. End screen shows final class score

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
  - PDF recap content generation

### QR Code

- `**qrcode.react`** — generate QR in-browser pointing to `/join?code=[roomCode]`

### PDF Export

- `**jspdf**` — client-side PDF generation for the end-of-game recap

### Styling

- **Tailwind CSS**
- **shadcn/ui** — use shadcn components throughout (Button, Card, Input, Badge, etc.)
- Large readable type — students may be reading from across a desk
- Mobile-first on student views (they're on phones)
- Desktop-first on teacher/host views

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

## File Structure

```
quorum/
├── app/
│   ├── page.tsx                        # Teacher home — prompt input + create game
│   ├── room/
│   │   └── [code]/
│   │       ├── page.tsx                # Teacher waiting room (QR + player list + start)
│   │       └── host/
│   │           └── page.tsx            # Teacher host view (question + votes + advance)
│   ├── join/
│   │   └── page.tsx                    # Student join — enter code, get assigned name, join
│   └── play/
│       └── [code]/
│           └── page.tsx                # Student game view — vote + score
├── components/
│   ├── QRCode.tsx                      # QR code display component
│   ├── WaitingRoom.tsx                 # Shared waiting state UI
│   ├── QuestionCard.tsx                # Question + 4 options display
│   ├── VoteOptions.tsx                 # Tappable vote buttons for students
│   ├── VoteTally.tsx                   # Live vote count for host view
│   ├── ScoreBoard.tsx                  # Class score display
│   └── RecapPDF.tsx                    # PDF generation trigger + download
├── convex/
│   ├── schema.ts
│   ├── rooms.ts                        # createRoom, getRoom, startGame, endGame
│   ├── players.ts                      # joinRoom, getPlayers
│   ├── questions.ts                    # storeQuestions, getQuestions
│   └── votes.ts                        # submitVote, getVotes, resolveQuestion
├── data/
│   └── words.json                      # { adjectives: [...], educationWords: [...] }
├── lib/
│   ├── claude.ts                       # generateQuestions(), generateRecapContent()
│   ├── nameGenerator.ts                # generateName() utility
│   ├── pdf.ts                          # buildPDF() using jspdf
│   └── roomCode.ts                     # generateRoomCode() utility
└── .env.local                          # ANTHROPIC_API_KEY, CONVEX_DEPLOYMENT
```

---

## Convex Functions

### `rooms.ts`

- `createRoom(prompt)` — creates room with a random 6-character code, status: "waiting", score: 0
- `getRoom(code)` — returns room by code
- `startGame(code)` — sets status to "active", currentQuestion to 0
- `advanceQuestion(code)` — increments currentQuestion, awards 10 points if majority was correct
- `endGame(code)` — sets status to "finished"

### `players.ts`

- `joinRoom(roomCode, name)` — adds player, rejects duplicate names in the same room
- `getPlayers(roomCode)` — returns all players in room (used for live waiting room list)

### `questions.ts`

- `storeQuestions(roomCode, questions)` — bulk insert 10 generated questions
- `getQuestions(roomCode)` — returns all questions for a room
- `getQuestion(roomCode, index)` — returns single question by index

### `votes.ts`

- `submitVote(roomCode, questionIndex, playerName, answer)` — stores one vote, prevents duplicate votes per player per question
- `getVotes(roomCode, questionIndex)` — returns all votes for current question (used for live tally)

---

## Claude API — Question Generation

**Endpoint:** `POST /api/generate` (Next.js API route)

**Prompt structure:**

```
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

---

## Claude API — PDF Recap Content

After game ends, call Claude to generate a summary paragraph for the PDF intro, then use the stored questions/answers/definitions/examples to build the document.

---

## Game State Logic

### Vote Resolution

- After all players have voted OR teacher advances manually:
  - Count votes per option
  - Winning option = most votes (majority)
  - If winning option === correctAnswer → add 10 points to room score
  - Advance to next question

### Score

- Max possible: 100 points (10 questions × 10 points)
- Stored on the room document, updated after each question resolves

---

## PDF Recap Structure

```
QUORUM — Game Recap
[Teacher's original prompt]
Final Score: [X] / 100

Q1: [Question text]
Correct Answer: [Answer]
Definition: [Definition]
Example: [Example]

Q2: ...
...
```

---

## Environment Variables

```
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
- No rejoin logic — if a student disconnects they re-enter and generate a new name

---

## Design Direction

- **Student view:** Mobile-first, big tap targets, minimal chrome
- **Teacher/host view:** Desktop-first, data-dense, clear hierarchy
- **Signature element:** The vote bar — a live animated bar chart showing votes per option updating in real time as students tap
- Colors and theme are owner's choice — configure via shadcn/ui theme and Tailwind config

