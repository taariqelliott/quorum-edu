import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic()

export interface Question {
  index: number
  question: string
  options: string[]
  correctAnswer: string
  definition: string
  example: string
}

export async function generateQuestions(prompt: string): Promise<Question[]> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are generating quiz questions for a K-12 classroom game.

Teacher's request: "${prompt}"

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
- correctAnswer must exactly match one of the options exactly as written
- Questions should be age-appropriate and progressively harder
- Keep questions clear and concise
- options should be plausible (no obvious throwaway wrong answers)`,
      },
    ],
  })

  const block = message.content[0]
  const raw = block?.type === "text" ? block.text : "[]"
  const text = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "")
  return JSON.parse(text) as Question[]
}

export async function generateRecapIntro(
  prompt: string,
  score: number,
  questions: { question: string }[]
): Promise<string> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Write a 2-3 sentence intro paragraph for a classroom game recap report. The teacher's original prompt was: "${prompt}". The class scored ${score}/100. Topics covered: ${questions.map((q) => q.question).join("; ")}. Be encouraging and educational. Return only the paragraph text, no additional formatting.`,
      },
    ],
  })

  const block = message.content[0]
  return block?.type === "text" ? block.text : ""
}
