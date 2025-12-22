export const site = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'SavvyDealsHub',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8000',
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || '',
}

export const env = {
  amazon: {
    tag: process.env.AMAZON_ASSOC_TAG || '',
    accessKey: process.env.AMAZON_ACCESS_KEY || '',
    secretKey: process.env.AMAZON_SECRET_KEY || '',
    apiBase: process.env.AMAZON_PARTNER_API_BASE || ''
  },
  /**
   * Optional: Wrap outbound product URLs with an affiliate/tracking template.
   *
   * Example (EPN rover links — paste your own from the EPN portal once approved):
   *   https://rover.ebay.com/rover/1/...?...&mpre={{url}}
   *
   * The code will replace:
   *  - {{url}}    -> encodeURIComponent(originalUrl)
   *  - {{urlRaw}} -> originalUrl
   */
  affiliate: {
    linkTemplate: process.env.AFFILIATE_LINK_TEMPLATE || '',
  },
  /**
   * Used to protect the hourly refresh endpoint.
   * Call /api/cron/refresh with: Authorization: Bearer <CRON_SECRET>
   */
  cron: {
    secret: process.env.CRON_SECRET || '',
    feedUrl: process.env.DEALS_FEED_URL || '',
  },
  paypal: {
    webhookId: process.env.PAYPAL_WEBHOOK_ID || '',
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    env: process.env.PAYPAL_ENV || 'sandbox'
  },
  email: {
    from: process.env.REPORTS_FROM || 'no-reply@savvydealshub.com',
    to: process.env.REPORTS_TO || '',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: Number(process.env.SMTP_PORT || 587),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || ''
    }
  },
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
}
