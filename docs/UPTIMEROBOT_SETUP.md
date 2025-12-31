# UptimeRobot (Free) – Hourly Product Refresh

AWS Amplify doesn't run traditional cron jobs for you. The simplest **free** workaround is to use an external uptime monitor that hits a protected URL every hour.

This project includes a secure refresh endpoint:

- `GET /api/cron/refresh?token=YOUR_CRON_SECRET`

It refreshes the "launch" product feed and can be extended later to pull from affiliate feeds (eBay EPN, Amazon PA-API, etc.).

## 1) Set your CRON secret

Create a long random string (30+ chars). Example:

```
CRON_SECRET="paste-a-long-random-string-here"
```

Set it in **your hosting provider** environment variables (Amplify: App settings → Environment variables).

## 2) Create the UptimeRobot monitor

1. Create a free account at UptimeRobot.
2. Add a new monitor:
   - Monitor type: **HTTP(s)**
   - Friendly name: `SavvyDealsHub hourly refresh`
   - URL:
     - `https://www.savvydealshub.com/api/cron/refresh?token=YOUR_CRON_SECRET`
   - Monitoring interval: **60 minutes**
3. Save.

That’s it. UptimeRobot will call the endpoint every hour.

## 3) Optional: add a health monitor

This project also includes a lightweight health endpoint (counts products/categories):

- `GET /api/cron/health?token=YOUR_CRON_SECRET`

You can create a second monitor for it (also hourly) so you can quickly see if the database is reachable.

## Notes

- Do **not** expose your CRON secret anywhere public.
- You can rotate `CRON_SECRET` at any time; just update UptimeRobot.
- If you later move to Vercel, you can replace this with Vercel Cron Jobs.
