import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const where = {
    OR: [
      { url: { equals: "[ADD_AFFILIATE_URL]" } },
      { url: { startsWith: "[" } },
      { url: { contains: "ADD_AFFILIATE_URL" } },
      { url: { contains: "[ADD_" } },
    ],
  };

  const found = await prisma.offer.count({ where });
  const res = await prisma.offer.deleteMany({ where });

  console.log("Bad URL offers found:", found);
  console.log("Deleted offers:", res.count);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
