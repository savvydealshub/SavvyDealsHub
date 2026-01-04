import { z } from 'zod'

// Canonical incoming feed item format (local JSON or authorised feeds).
// This is intentionally minimal so multiple sources can map into it.
export const FeedItemSchema = z.object({
  sku: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.number().finite().optional(),
  imageUrl: z.string().url().optional(),
  url: z.string().url(),
  category: z.string().min(1),
  shippingPrice: z.number().finite().optional(),
  shippingIncluded: z.boolean().optional(),
  isSponsored: z.boolean().optional(),
  sponsorLabel: z.string().optional(),
  source: z.string().optional(),
  // ISO timestamp used for "last updated" microcopy (optional).
  updatedAt: z.string().optional(),
})

export type FeedItem = z.infer<typeof FeedItemSchema>

export function safeParseFeedItems(input: unknown): FeedItem[] {
  const items = Array.isArray(input) ? input : (input as any)?.items
  if (!Array.isArray(items)) return []

  const out: FeedItem[] = []
  for (const it of items) {
    const parsed = FeedItemSchema.safeParse(it)
    if (parsed.success) out.push(parsed.data)
  }
  return out
}
