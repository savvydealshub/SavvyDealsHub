# CSV Feed Uploader (Offers)

This project includes a simple **admin CSV uploader** that populates the **True Price Comparison** engine.

- URL: `/admin/feeds`
- It ingests **authorised feeds only** (your own CSVs, affiliate network exports, or official retailer APIs converted to CSV).
- No scraping.

## 1) One-time database update

The CSV uploader writes to the `Offer` table.

After pulling this update, run one of:

- `npm run prisma:push` (fastest for dev)
- or `npx prisma migrate dev` (recommended when you start tracking migrations)

## 2) CSV format

Header row is required.

Minimum required columns:

- `sku`
- `title`
- `url`

Recommended columns:

- `retailer` (e.g. Amazon, Argos, eBay)
- `category` (slug like `electronics`, `tools`, `deals`)
- `price`
- `shippingPrice`
- `shippingIncluded` (Yes/No)
- `condition` (New/Used/Refurbished)
- `membershipRequired` (Yes/No)
- `membershipType` (Prime/Nectar/Clubcard)
- `imageUrl`
- `description`

### Example

```csv
sku,title,url,retailer,category,price,shippingPrice,shippingIncluded,condition,membershipRequired,membershipType,imageUrl,description
BOSCH-18V-123,Bosch 18V Drill (Starter Kit),https://example.com/affiliate?x=1,Amazon,tools,129.99,0,Yes,New,Yes,Prime,https://example.com/img.jpg,Includes battery & charger
```

## 3) How it shows up

The `/compare` page automatically uses database offers when at least one `Offer` exists.
If the DB is empty (fresh install), it falls back to the seed JSON so the site always works.
