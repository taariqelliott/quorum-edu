# Quorum

An AI-powered live quiz game for classrooms. Teachers describe a topic, Quorum generates a 10-question game in seconds, and students join from their phones with a room code.

## Meaning

quo·​rum

**plural quorums *or* quora** [ˈkwȯr-ə](https://www.merriam-webster.com/dictionary/quorum?pronunciation&lang=en_us&dir=q&file=quora)

**1:** the minimum number of officers or members of a body that is required to be present at a given meeting (as to transact business)

---

## Test The App Out

### [Quorum](https://quorum-edu.vercel.app)

---

### **Resources**

## How It Works

### For Teachers (Host)

1. Go to the home page and describe what you want to teach (e.g. *"help my students learn about the American Revolution"*)
2. Quorum uses AI to generate 10 multiple-choice questions on that topic
3. A waiting room opens with a **QR code** and a **6-character room code** - share either with students
4. Once students have joined, click **Start Game**
5. Questions are shown one at a time on the host screen; advance to the next question manually after reviewing results
6. At the end, a final score is shown

### For Students (Players)

1. Go to `/join` or scan the QR code
2. Enter the room code and pick a display name (or shuffle for a random one)
3. Wait for the teacher to start the game
4. Each question shows 4 answer choices - tap to lock in your vote
5. After voting, live results appear showing how the class answered
6. After all 10 questions, an answer key recap is shown with correct answers and explanations

## Game Rules

- 10 questions per game, multiple choice with 4 options each
- Each player can only vote once per question
- Votes are anonymous - the host sees class-wide tallies, not individual answers
- The game is paced by the teacher; students cannot advance questions themselves
- This is ideally where students will debate what the answer is and why to promote discussion & reasoning
- No time limit per question (teacher decides when to move on)
- Players who join late can still participate from the current question onward

## Tech Stack

- **Next.js** (App Router) - frontend
- **Convex** - real-time backend, database, and live subscriptions
- **Claude** (Haiku) - question generation via Anthropic SDK
- **Tailwind CSS v4** + **shadcn/ui** - styling

## Getting Started

### 1. Install dependencies

```bash
npm install
# or
bun install
```

### 2. Set up Convex

Run the Convex dev server once to create your deployment and auto-populate the Convex env vars:

```bash
npx convex dev
# or
bunx convex dev
```

This writes the following to `.env.local` automatically:

```env
CONVEX_DEPLOYMENT=dev:<your-deployment-name>
CONVEX_URL=https://<your-deployment-name>.convex.cloud
CONVEX_SITE_URL=https://<your-deployment-name>.convex.site
NEXT_PUBLIC_CONVEX_URL=https://<your-deployment-name>.convex.cloud
```

### 3. Add remaining environment variables

Add these to `apps/web/.env.local`:

```env
# Your app's URL -- http://localhost:3000 for local dev, or your deployed URL from Vercel, Render, etc.
NEXT_PUBLIC_APP_URL=

# Anthropic API key -- https://console.anthropic.com/settings/api-keys
ANTHROPIC_API_KEY=

# Upstash Redis -- https://console.upstash.com (create a Redis database, copy REST URL and token)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 4. Start the app

```bash
npm run dev
# or
bun dev
```
