# Quorum

An AI-powered live quiz game for classrooms. Teachers describe a topic, Quorum generates a 10-question game in seconds, and students join from their phones with a room code — no accounts or downloads required.

### Meaning

quo·​rum

**pluralquorums *or* quora** [ˈkwȯr-ə](https://www.merriam-webster.com/dictionary/quorum?pronunciation&lang=en_us&dir=q&file=quora)

**1:** the minimum number of officers or members of a body that is required to be present at a given meeting (as to transact business)

---

## Test The App Out

[Quorum](https://quorum-edu.vercel.app)

### **Resources**

## How It Works

### For Teachers (Host)

1. Go to the home page and describe what you want to teach (e.g. *"help my students learn about the American Revolution"*)
2. Quorum uses AI to generate 10 multiple-choice questions on that topic
3. A waiting room opens with a **QR code** and a **6-character room code** — share either with students
4. Once students have joined, click **Start Game**
5. Questions are shown one at a time on the host screen; advance to the next question manually after reviewing results
6. At the end, a final score is shown

### For Students (Players)

1. Go to `/join` or scan the QR code
2. Enter the room code and pick a display name (or shuffle for a random one)
3. Wait for the teacher to start the game
4. Each question shows 4 answer choices — tap to lock in your vote
5. After voting, live results appear showing how the class answered
6. After all 10 questions, an answer key recap is shown with correct answers and explanations

## Game Rules

- 10 questions per game, multiple choice with 4 options each
- Each player can only vote once per question
- Votes are anonymous — the host sees class-wide tallies, not individual answers
- The game is paced by the teacher; students cannot advance questions themselves
- No time limit per question (teacher decides when to move on)
- Players who join late can still participate from the current question onward

## Tech Stack

- **Next.js** (App Router) — frontend
- **Convex** — real-time backend, database, and live subscriptions
- **Claude** (Haiku) — question generation via Anthropic SDK
- **Tailwind CSS v4** + **shadcn/ui** — styling
- **Space Grotesk** — typeface

## Getting Started

```bash
bun install
bun dev
```

Set up the required environment variables:

```env
ANTHROPIC_API_KEY=
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
```
