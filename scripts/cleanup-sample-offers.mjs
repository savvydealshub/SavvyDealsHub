import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const BAD_URL_SUBSTRINGS = [
  'example.com',
  '[add_affiliate_url]',
  'add_affiliate_url',
  '[add_image_url]',
  'add_image_url',
]

async function main() {
  const deleted = await prisma.offer.deleteMany({
    where: {
      OR: [
        { url: { contains: 'example.com', mode: 'insensitive' } },
        ...BAD_URL_SUBSTRINGS.map((s) => ({ url: { contains: s, mode: 'insensitive' } })),
        { title: { startsWith: 'Example', mode: 'insensitive' } },
      ],
    },
  })

  console.log('Deleted offers:', deleted.count)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
