export interface QuestionSummary {
  index: number
  question: string
  correctAnswer: string
  definition: string
  example: string
}

export async function buildRecapPDF(
  intro: string,
  prompt: string,
  score: number,
  questions: QuestionSummary[]
): Promise<void> {
  const { jsPDF } = await import("jspdf")
  const doc = new jsPDF()

  const margin = 20
  let y = 20
  const lineHeight = 7
  const pageHeight = doc.internal.pageSize.height

  const addText = (text: string, fontSize = 11, bold = false) => {
    doc.setFontSize(fontSize)
    doc.setFont("helvetica", bold ? "bold" : "normal")
    const lines = doc.splitTextToSize(text, 170) as string[]
    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(line, margin, y)
      y += lineHeight
    }
  }

  addText("QUORUM — Game Recap", 18, true)
  y += 4
  addText(intro)
  y += 4
  addText(`Teacher Prompt: "${prompt}"`, 10)
  addText(`Final Score: ${score} / 100`, 12, true)
  y += 6

  for (const q of questions) {
    addText(`Q${q.index + 1}: ${q.question}`, 12, true)
    addText(`Correct Answer: ${q.correctAnswer}`)
    addText(`Definition: ${q.definition}`)
    addText(`Example: ${q.example}`)
    y += 4
  }

  doc.save("quorum-recap.pdf")
}
