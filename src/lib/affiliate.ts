import { env } from './config'

export function affiliateUrl(baseUrl: string) {
  // Simple example for Amazon Associates tag
  const url = new URL(baseUrl)
  if (env.amazon.tag) url.searchParams.set('tag', env.amazon.tag)
  return url.toString()
}
