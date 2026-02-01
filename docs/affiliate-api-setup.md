# Affiliate API setup (Amazon + eBay)

This project can work **without** retailer APIs by importing offers via CSV or a deals feed.
When you’re eligible and have keys, you can enable **optional** API endpoints to fetch product data.

---

## Amazon (Product Advertising API / PA-API)

### Eligibility (important)

Amazon PA-API access is not always available immediately. If your Associates account does not yet have PA-API enabled,
the endpoint will return an error until you are eligible.

### Environment variables

Set these on the **server** (Vercel/host env vars or `.env.local`). Never commit secrets.

```
AMAZON_ASSOC_TAG=yourtag-21
AMAZON_ACCESS_KEY=AKIA...
AMAZON_SECRET_KEY=...

# Optional (defaults shown)
AMAZON_PARTNER_API_HOST=webservices.amazon.co.uk
AMAZON_PARTNER_API_REGION=eu-west-1
AMAZON_MARKETPLACE=www.amazon.co.uk
```

### Test endpoint

```
GET /api/amazon/items?asins=B08WJCSHWS,B0...
```

If configured correctly and enabled on your account, you’ll get back a JSON list of items with title, imageUrl, and price.

---

## eBay (Buy Browse API)

### Environment variables

Set these on the **server** (Vercel/host env vars or `.env.local`). Never commit secrets.

```
EBAY_CLIENT_ID=...
EBAY_CLIENT_SECRET=...

# Optional (defaults shown)
EBAY_API_BASE=https://api.ebay.com
EBAY_OAUTH_BASE=https://api.ebay.com
EBAY_MARKETPLACE_ID=EBAY_GB
EBAY_OAUTH_SCOPE=https://api.ebay.com/oauth/api_scope
```

### Test endpoints

Search:

```
GET /api/ebay/search?q=cordless+vacuum&limit=12
```

Fetch a single item:

```
GET /api/ebay/item?itemId=v1|1234567890|0
```

Both endpoints return an `affiliateLink` field. This uses your existing `AFFILIATE_LINK_TEMPLATE` if set.

---

## Affiliate link wrapping (EPN “rover” + others)

If you want to wrap outbound links with a tracking template (for eBay rover links, Skimlinks, etc.), set:

```
AFFILIATE_LINK_TEMPLATE=https://rover.ebay.com/rover/...&mpre={{url}}
```

Placeholders:

- `{{url}}` → `encodeURIComponent(originalUrl)`
- `{{urlRaw}}` → originalUrl

---

## Compliance notes (safe defaults)

- Outbound product links are marked `rel="nofollow sponsored"`.
- Cookie consent controls non-essential scripts (analytics/marketing) on SavvyDealsHub.
- Always keep your **Privacy Policy**, **Terms**, **Affiliate Disclosure**, and **Contact** pages live and linked from the footer.