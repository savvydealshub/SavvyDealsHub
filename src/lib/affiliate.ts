import { env } from './config'

/**
 * Build an outbound product URL.
 *
 * - If NEXT_PUBLIC_AFFILIATE_LINK_TEMPLATE is set, it will be used for *any* URL.
 * - The template can contain:
 *    {{url}}     - URL-encoded product URL (recommended)
 *    {{urlRaw}}  - Raw product URL
 *    {{customId}} - Optional custom id string
 *
 * Example template (paste your own from your affiliate network once approved):
 *   https://rover.ebay.com/rover/1/0/0?mpre={{url}}&campid=123&toolid=10001&customid={{customId}}
 */
export function affiliateUrl(productUrl: string, opts?: { customId?: string }) {
  if (!productUrl) return productUrl

  // 1) Generic template wrapping (best for EPN, Awin, CJ, Impact, etc.)
  const tpl = env.affiliate.linkTemplate?.trim()
  if (tpl) {
    const customId = (opts?.customId ?? '').trim()
    return tpl
      .replaceAll('{{url}}', encodeURIComponent(productUrl))
      .replaceAll('{{urlRaw}}', productUrl)
      .replaceAll('{{customId}}', encodeURIComponent(customId))
  }

  // 2) Amazon tag appending (only if you are approved and have a valid tag)
  if (env.amazon.tag && /amazon\./i.test(productUrl)) {
    try {
      const u = new URL(productUrl)
      u.searchParams.set('tag', env.amazon.tag)
      return u.toString()
    } catch {
      return productUrl
    }
  }

  return productUrl
}
