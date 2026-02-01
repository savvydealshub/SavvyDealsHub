import 'server-only'

import { env } from './config'
import { affiliateUrl } from './affiliate'

type EbayToken = {
  access_token: string
  expires_in: number
  token_type: string
}

let cachedToken: { value: string; expiresAt: number } | null = null

function hasEbayCredentials() {
  return Boolean(env.ebay.clientId && env.ebay.clientSecret)
}

async function getEbayAccessToken(): Promise<string> {
  if (!hasEbayCredentials()) {
    throw new Error('EBAY_NOT_CONFIGURED')
  }

  const now = Date.now()
  if (cachedToken && cachedToken.expiresAt > now + 30_000) {
    return cachedToken.value
  }

  const basic = Buffer.from(`${env.ebay.clientId}:${env.ebay.clientSecret}`).toString('base64')
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: env.ebay.scope,
  })

  const res = await fetch(`${env.ebay.oauthBase}/identity/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,
    },
    body,
    // never cache tokens in edge caches
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`EBAY_OAUTH_FAILED:${res.status}:${text.slice(0, 200)}`)
  }

  const json = (await res.json()) as EbayToken
  const expiresAt = now + Math.max(60, json.expires_in) * 1000
  cachedToken = { value: json.access_token, expiresAt }
  return json.access_token
}

async function ebayFetch(path: string, init?: RequestInit) {
  const token = await getEbayAccessToken()
  const url = `${env.ebay.apiBase}${path}`

  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
      // Required by many Buy APIs to select the correct marketplace.
      'X-EBAY-C-MARKETPLACE-ID': env.ebay.marketplaceId,
      'Accept-Language': 'en-GB',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`EBAY_API_FAILED:${res.status}:${text.slice(0, 200)}`)
  }

  return res.json()
}

export type EbaySearchResult = {
  itemId: string
  title: string
  itemWebUrl: string
  imageUrl?: string
  price?: { value: number; currency: string }
  affiliateLink: string
}

export async function searchEbay(q: string, limit = 12): Promise<EbaySearchResult[]> {
  const safeQ = (q || '').trim()
  if (!safeQ) return []

  const params = new URLSearchParams({
    q: safeQ,
    limit: String(Math.min(50, Math.max(1, limit))),
  })

  const data = await ebayFetch(`/buy/browse/v1/item_summary/search?${params.toString()}`)
  const items = Array.isArray(data?.itemSummaries) ? data.itemSummaries : []

  return items.map((it: any) => {
    const itemWebUrl = String(it?.itemWebUrl || '')
    const title = String(it?.title || '')
    const itemId = String(it?.itemId || '')
    const imageUrl = it?.image?.imageUrl ? String(it.image.imageUrl) : undefined
    const priceValue = it?.price?.value != null ? Number(it.price.value) : NaN
    const currency = it?.price?.currency ? String(it.price.currency) : 'GBP'

    return {
      itemId,
      title,
      itemWebUrl,
      imageUrl,
      price: Number.isFinite(priceValue) ? { value: priceValue, currency } : undefined,
      affiliateLink: affiliateUrl(itemWebUrl),
    }
  })
}

export async function getEbayItem(itemId: string) {
  const id = (itemId || '').trim()
  if (!id) return null
  const data = await ebayFetch(`/buy/browse/v1/item/${encodeURIComponent(id)}`)
  return data
}
