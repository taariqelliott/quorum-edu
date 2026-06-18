# Quorum — Build Order

Reference `QUORUM_PROJECT.md` for all specs, schema, and API contracts.

---

## 1. Project Setup

- Add `@anthropic-ai/sdk` to `apps/web/package.json`
- Add shadcn components needed: `textarea`, `input`, `badge` via `bunx shadcn@latest add`
- Add `@convex/*` path alias to `apps/web/tsconfig.json` pointing to `../../convex/_generated/*`
- Add `next.config.ts` transpile for `jspdf` and `qrcode.react` if needed

## 2. Data & Utilities

- `apps/web/data/words.json` — adjectives + educationWords arrays
- `apps/web/lib/roomCode.ts` — `generateRoomCode()` — 6-char uppercase, chars A-Z2-9 (no 0/O/1/I)
- `apps/web/lib/nameGenerator.ts` — `generateName()` — `adj_word_####` format

## 3. Convex Schema

- `convex/schema.ts` — rooms, players, questions, votes tables
- Add `.index("by_room_and_index", ["roomCode", "index"])` to questions table

## 4. Convex Backend Functions

- `convex/rooms.ts` — `createRoom`, `getRoom`, `startGame`, `advanceQuestion`, `endGame`
- `convex/players.ts` — `joinRoom`, `getPlayers`
- `convex/questions.ts` — `storeQuestions`, `getQuestions`, `getQuestion`
- `convex/votes.ts` — `submitVote`, `getVotes`, `getPlayerVote`

## 5. Question Generation API

- `apps/web/lib/claude.ts` — `generateQuestions(prompt)` — calls Claude, returns 10 questions
- `apps/web/app/api/generate/route.ts` — POST: calls Claude → creates room + stores questions in Convex → returns `{ code }`

## 6. Teacher Homepage

- `apps/web/app/page.tsx` — prompt textarea, "Create Game" button, loading state ("Creating your game..."), inline error with prompt preserved

## 7. Teacher Waiting Room

- `apps/web/components/QRCode.tsx` — wraps `qrcode.react`
- `apps/web/app/room/[code]/page.tsx` — QR code, room code display, live player list, "Start Game" button

## 8. Shared Game Components

- `apps/web/components/ScoreBoard.tsx` — displays `X/10 correct — X pts`
- `apps/web/components/QuestionCard.tsx` — question text + question number
- `apps/web/components/VoteTally.tsx` — animated live bar chart per option

## 9. Teacher Host View

- `apps/web/app/room/[code]/host/page.tsx` — question + vote tally + score + "Next Question"/"End Game" button + end screen (score + GenerateRecap button)

## 10. Student Join Page

- `apps/web/app/join/page.tsx` — room code input, name display, "Shuffle" button, "Join" button, saves name to localStorage

## 11. Student Game View

- `apps/web/components/VoteOptions.tsx` — 4 tappable answer buttons, disabled after vote
- `apps/web/app/play/[code]/page.tsx` — waiting state → vote view → tally view → end screen with full question recap

## 12. PDF Recap

- `apps/web/lib/pdf.ts` — `buildRecapPDF(intro, prompt, score, questions)` using jspdf (dynamic import, client-side only)
- `apps/web/lib/claude.ts` — add `generateRecapIntro(prompt, score, questions)`
- `apps/web/app/api/recap/route.ts` — POST: calls Claude for intro → returns `{ intro }`
- `apps/web/components/RecapPDF.tsx` — "Generate Recap" → spinner → "Report Ready" + download button
