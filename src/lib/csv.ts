/**
 * Minimal CSV parser (RFC4180-ish) with quote handling.
 * - Supports commas, quoted fields, escaped quotes (""), CRLF/LF.
 * - Intended for small/medium uploads (admin tool), not streaming.
 */

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let i = 0
  let inQuotes = false

  const pushField = () => {
    row.push(field)
    field = ''
  }
  const pushRow = () => {
    // Ignore trailing empty line
    if (row.length === 1 && row[0] === '' && rows.length > 0) return
    rows.push(row)
    row = []
  }

  while (i < text.length) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1]
        if (next === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i += 1
        continue
      }
      field += ch
      i += 1
      continue
    }

    if (ch === '"') {
      inQuotes = true
      i += 1
      continue
    }

    if (ch === ',') {
      pushField()
      i += 1
      continue
    }

    if (ch === '\n') {
      pushField()
      pushRow()
      i += 1
      continue
    }

    if (ch === '\r') {
      // swallow CRLF
      const next = text[i + 1]
      if (next === '\n') {
        pushField()
        pushRow()
        i += 2
        continue
      }
      pushField()
      pushRow()
      i += 1
      continue
    }

    field += ch
    i += 1
  }

  // last field
  pushField()
  if (row.length) pushRow()

  return rows
}

export function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return []
  const headers = rows[0].map((h) => h.trim())
  const out: Record<string, string>[] = []
  for (let r = 1; r < rows.length; r++) {
    const obj: Record<string, string> = {}
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c]
      if (!key) continue
      obj[key] = (rows[r][c] ?? '').trim()
    }
    // skip fully empty rows
    const hasAny = Object.values(obj).some((v) => v !== '')
    if (hasAny) out.push(obj)
  }
  return out
}
