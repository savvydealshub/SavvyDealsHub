import 'server-only'

import crypto from 'crypto'
import { env } from './config'

type PaapiResponse = any

function sha256Hex(data: string | Buffer) {
  return crypto.createHash('sha256').update(data).digest('hex')
}

function hmac(key: Buffer, data: string) {
  return crypto.createHmac('sha256', key).update(data).digest()
}

function getSignatureKey(secretKey: string, datestamp: string, region: string, service: string) {
  const kDate = hmac(Buffer.from(`AWS4${secretKey}`, 'utf8'), datestamp)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, service)
  const kSigning = hmac(kService, 'aws4_request')
  return kSigning
}

function amzDateParts(date = new Date()) {
  const pad = (n: number) => String(n).padStart(2, '0')
  const y = date.getUTCFullYear()
  const m = pad(date.getUTCMonth() + 1)
  const d = pad(date.getUTCDate())
  const hh = pad(date.getUTCHours())
  const mm = pad(date.getUTCMinutes())
  const ss = pad(date.getUTCSeconds())
  const datestamp = `${y}${m}${d}`
  const amzdate = `${datestamp}T${hh}${mm}${ss}Z`
  return { datestamp, amzdate }
}

function assertPaapiConfigured() {
  if (!env.amazon.accessKey || !env.amazon.secretKey || !env.amazon.tag) {
    throw new Error('PAAPI_NOT_CONFIGURED')
  }
}

export async function paapiGetItems(itemIds: string[], resources?: string[]): Promise<PaapiResponse> {
  assertPaapiConfigured()

  const ids = (itemIds || []).map((x) => String(x).trim()).filter(Boolean).slice(0, 10)
  if (ids.length === 0) return { ItemsResult: { Items: [] } }

  const host = env.amazon.host
  const region = env.amazon.region
  const service = 'ProductAdvertisingAPI'
  const method = 'POST'
  const canonicalUri = '/paapi5/getitems'
  const canonicalQuery = ''

  const target = 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems'
  const bodyObj = {
    ItemIds: ids,
    PartnerTag: env.amazon.tag,
    PartnerType: 'Associates',
    Marketplace: env.amazon.marketplace,
    Resources: resources ?? [
      'ItemInfo.Title',
      'Images.Primary.Large',
      'Offers.Listings.Price',
      'Offers.Listings.DeliveryInfo.IsFreeShippingEligible',
      'Offers.Listings.DeliveryInfo.ShippingCharges',
    ],
  }

  const payload = JSON.stringify(bodyObj)
  const payloadHash = sha256Hex(payload)

  const { datestamp, amzdate } = amzDateParts()

  // Canonical headers must be lowercase, sorted by header name.
  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${host}\n` +
    `x-amz-date:${amzdate}\n` +
    `x-amz-target:${target}\n`

  const signedHeaders = 'content-encoding;content-type;host;x-amz-date;x-amz-target'

  const canonicalRequest =
    `${method}\n` +
    `${canonicalUri}\n` +
    `${canonicalQuery}\n` +
    `${canonicalHeaders}\n` +
    `${signedHeaders}\n` +
    `${payloadHash}`

  const credentialScope = `${datestamp}/${region}/${service}/aws4_request`
  const stringToSign =
    `AWS4-HMAC-SHA256\n${amzdate}\n${credentialScope}\n${sha256Hex(canonicalRequest)}`

  const signingKey = getSignatureKey(env.amazon.secretKey, datestamp, region, service)
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex')

  const authorization =
    `AWS4-HMAC-SHA256 Credential=${env.amazon.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  const res = await fetch(`https://${host}${canonicalUri}`, {
    method,
    headers: {
      'Content-Encoding': 'amz-1.0',
      'Content-Type': 'application/json; charset=utf-8',
      Host: host,
      'X-Amz-Date': amzdate,
      'X-Amz-Target': target,
      Authorization: authorization,
    },
    body: payload,
    cache: 'no-store',
  })

  const text = await res.text().catch(() => '')
  if (!res.ok) {
    throw new Error(`PAAPI_FAILED:${res.status}:${text.slice(0, 400)}`)
  }

  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}
