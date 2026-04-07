/**
 * Generate realistic example data from an OpenAPI schema using Claude API.
 * Requires VITE_ANTHROPIC_API_KEY to be set in .env.local
 */
export async function generateSampleWithAI(schemaYaml, count = 3) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error(
      'VITE_ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the dev server.'
    )
  }

  const prompt = `You are a data generation assistant. Given the following OpenAPI schema, generate ${count} realistic and diverse example JSON objects that conform to the schema.

OpenAPI Schema:
\`\`\`yaml
${schemaYaml}
\`\`\`

Generate ${count} realistic example objects. Return ONLY a valid JSON array with ${count} objects — no explanation, no markdown fences, no extra text. The data should be realistic and varied (different names, values, descriptions, etc.), not placeholder lorem ipsum text.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 4096,
      thinking: { type: 'adaptive' },
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  const textBlock = data.content.find((b) => b.type === 'text')
  if (!textBlock) throw new Error('No text in Claude response')

  try {
    // Strip any accidental markdown fences
    const cleaned = textBlock.text.replace(/```json?\n?/g, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    // Accept either an array or a single object
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    throw new Error('Claude returned non-JSON output: ' + textBlock.text.slice(0, 200))
  }
}
