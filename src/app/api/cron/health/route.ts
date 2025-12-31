import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

/**
 * Lightweight health endpoint for monitoring.
 * Protected with CRON_SECRET to avoid public scraping.
 *
 * Example:
 *   GET /api/cron/health?token=YOUR_SECRET
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const secret = process.env.CRON_SECRET || "";

  if (!secret || token !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // Keep the query very cheap.
  const [categories, products] = await Promise.all([
    prisma.category.count(),
    prisma.product.count(),
  ]);

  return NextResponse.json({
    ok: true,
    categories,
    products,
    timestamp: new Date().toISOString(),
  });
}
