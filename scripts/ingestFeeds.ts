import fs from 'node:fs/promises'
import path from 'node:path'
import { prisma } from '../src/lib/db'

async function main() {
  // Example: read from a local JSON feed file (replace with your API fetch)
  const feedPath = path.join(process.cwd(), 'src', 'data', 'products-sample.json')
  const raw = await fs.readFile(feedPath, 'utf8')
  const items = JSON.parse(raw)
  const cats = await prisma.category.findMany()
  const bySlug = new Map(cats.map(c=>[c.slug, c.id]))

  for (const it of items) {
    const categoryId = bySlug.get(it.category) ?? cats[0]?.id
    await prisma.product.upsert({
      where: { sku: it.sku },
      update: { ...it, categoryId },
      create: { ...it, categoryId }
    })
  }
  console.log('Ingest complete.')
}

main().finally(()=>process.exit(0))
