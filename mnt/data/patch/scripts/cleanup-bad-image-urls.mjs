import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const tokens = [
  '[ADD_IMAGE_URL]',
  '[ADD IMAGE URL]',
  'ADD_IMAGE_URL',
  '[ADD_IMAGE]',
  '[IMAGE_URL]',
]

async function main() {
  const r1 = await db.offer.updateMany({
    where: { imageUrl: { in: tokens } },
    data: { imageUrl: null },
  })

  const r2 = await db.offer.updateMany({
    where: { imageUrl: { startsWith: '[' } },
    data: { imageUrl: null },
  })

  const r3 = await db.offer.updateMany({
    where: { imageUrl: { contains: 'ADD_IMAGE_URL' } },
    data: { imageUrl: null },
  })

  console.log('Cleaned placeholder imageUrl rows:', {
    exactTokens: r1.count,
    startsWithBracket: r2.count,
    containsToken: r3.count,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
