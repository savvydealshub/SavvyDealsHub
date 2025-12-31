import { PrismaClient } from '@prisma/client'
import categories from '../src/data/categories.json' assert { type: 'json' };
import products from '../src/data/products-sample.json' assert { type: 'json' };

const prisma = new PrismaClient()

async function main() {
  // Categories
  const slugId: Record<string, number> = {}

  // Create parents first
  for (const c of categories.filter(c=>!c.parent)) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: { slug: c.slug, name: c.name }
    })
    slugId[c.slug] = created.id
  }
  // Then children
  for (const c of categories.filter(c=>c.parent)) {
    const parentId = slugId[c.parent!]
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, parentId },
      create: { slug: c.slug, name: c.name, parentId }
    })
    slugId[c.slug] = created.id
  }

  // Products
  for (const p of (products as any).items ?? products) {
    const categoryId = slugId[p.category] ?? Object.values(slugId)[0]
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: { title: p.title, price: p.price, imageUrl: p.imageUrl, url: p.url, categoryId },
      create: { sku: p.sku, title: p.title, price: p.price, imageUrl: p.imageUrl, url: p.url, categoryId, description: p.description }
    })
  }

  console.log('Seeded categories and products.')
}

main().finally(()=>prisma.$disconnect())
