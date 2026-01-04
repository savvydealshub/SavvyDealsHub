# SavvyDealsHub — Test Checklist (All Updates Combined)

## 1) Install & run
```bash
npm install
npm run prisma:push
npm run dev
```
Open: http://localhost:8000

> If your project uses port 3000 on your machine, use that instead.

## 2) Quick sanity routes
- /compare
- /trending
- /c (categories index)
- /c/<category-slug>
- /how-pricing-works
- /privacy
- /terms
- /affiliate-disclosure
- /sitemap.xml
- /robots.txt

## 3) CSV offers (so Compare becomes "real")
- Go to: /admin/feeds
- Download the template CSV
- Upload a CSV with at least a few rows
- Return to: /compare and search

## 4) Watchlist + alerts
- From /compare (DB offers), click **Watch deal**
- Use your email
- Check /watchlist link generated

## 5) Click tracking + analytics
- Click an offer (DB offers) from /compare
- It will redirect via /out
- Check: /admin/analytics for recorded clicks

> Tip: the Compare table highlights the "Best total" row and uses different CTA tags (best/row) so you can see which buttons convert in /admin/analytics.

## 6) Offer freshness & price history (snapshots)

### Baseline snapshots
- Upload a CSV feed in /admin/feeds (this now records a snapshot for each offer referenced by the upload)
- Re-run Compare and click **Price history** on a DB offer row

### Scheduled snapshots (optional)
There is a cron endpoint to record snapshots for *all* offers in the DB:

- GET /api/cron/offer-snapshots
- Requires header: `Authorization: Bearer <CRON_SECRET>`

After a few runs over time, category pages will show **Biggest drops (last 7 days)** based on your snapshots.

## Notes
- Email sending uses SMTP env vars. If not configured, the app will log emails in dev (no crash).
