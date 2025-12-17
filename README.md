# SavvyDealsHub — Enterprise-ready Starter

This is a production-ready Next.js 14 (App Router) project for SavvyDealsHub.com with:

- TailwindCSS UI and a **Hexagon** category menu
- Profile dropdown and basic session JWT
- Prisma ORM (SQLite by default)
- API routes for products, ingestion, PayPal webhooks, AdSense reports (stubs)
- Data folder for **categories.json** and sample products
- Scripts for **daily earnings report** and **feed ingestion**
- Dockerfile for containerized deployment

## 1) Quick Start

```bash
# 1. Unzip and enter the folder
npm install
cp .env.example .env  # fill values
npx prisma db push
npm run dev           # http://localhost:8000
```

## 2) Build for Production
```bash
npm run build
npm start
```

## 3) Docker
```bash
docker build -t savvydealshub .
docker run -p 8000:8000 --env-file .env savvydealshub
```

## 4) Where to put your API keys
Edit **.env** (single place for tokens/IDs). Frontend public keys start with `NEXT_PUBLIC_`.

## 5) Feeds and Reports
- Ingestion (affiliate feeds): `npm run ingest`
- Daily email report: `npm run report:daily`

> Replace stubs with your real providers as needed. All code is ready to extend.
