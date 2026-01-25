# SavvyDealsHub Offers Validator Patch

## What this patch does
Adds/updates:
- scripts/offer-rules.json
- scripts/validate-offers-csv.mjs

Locks offer rules:
- price <= 100
- required enums always Yes/No: shippingIncluded, membershipRequired, isSponsored
- shippingPrice enforced, 0.00 when shippingIncluded=Yes
- UK delivery proxy enforced via UK retailer URL patterns
- rejects placeholder URLs (example.com) unless allowPlaceholderUrls=true

## Install
Extract the zip into your project root:
C:\Users\Brega\Desktop\SavvyDealsHub_Full_Merged_Enterprise_v1\

## Run
From project root:
node scripts\validate-offers-csv.mjs --in offers.csv --out offers.cleaned.csv

Outputs:
- offers.cleaned.csv (upload this)
- offers.rejected.csv (contains reasons)
