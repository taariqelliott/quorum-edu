import { adjectives, educationWords } from "./words"

export function generateName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const word = educationWords[Math.floor(Math.random() * educationWords.length)]
  const num = String(Math.floor(Math.random() * 9000) + 1000)
  return `${adj}_${word}_${num}`
}
