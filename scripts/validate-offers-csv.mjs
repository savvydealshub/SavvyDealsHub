#!/usr/bin/env node
/**
 * SavvyDealsHub Offer Validator (UK / Enterprise-safe)
 *
 * Enforces:
 * - price <= maxPrice
 * - UK delivery proxy: retailer-based UK URL patterns
 * - required enum fields always Yes/No: shippingIncluded, membershipRequired, isSponsored
 * - shippingPrice numeric; if shippingIncluded=Yes -> shippingPrice=0.00
 * - condition allowed; optional enforce New only
 * - membershipType required only when membershipRequired=Yes
 * - sponsorLabel required only when isSponsored=Yes
 *
 * Outputs:
 * - cleaned CSV (upload this)
 * - rejected CSV (with reasons column)
 *
 * Usage:
 *   node scripts/validate-offers-csv.mjs --in offers.csv --out offers.cleaned.csv
 * Optional:
 *   --rules scripts/offer-rules.json
 *   --rejected offers.rejected.csv
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      out[key] = val;
    }
  }
  return out;
}

function readText(p) {
  return fs.readFileSync(p, "utf-8");
}

function writeText(p, s) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, s, "utf-8");
}

// CSV parse (quotes+commas)
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") {
        row.push(cur);
        cur = "";
      } else if (ch === "\n") {
        row.push(cur);
        cur = "";
        rows.push(row);
        row = [];
      } else if (ch !== "\r") {
        cur += ch;
      }
    }
  }

  row.push(cur);
  if (!(row.length === 1 && row[0] === "")) rows.push(row);
  return rows;
}

function toCSV(rows) {
  return rows
    .map((r) =>
      r
        .map((cell) => {
          const s = cell == null ? "" : String(cell);
          if (s.includes('"') || s.includes(",") || s.includes("\n") || s.includes("\r")) {
            return '"' + s.replaceAll('"', '""') + '"';
          }
          return s;
        })
        .join(",")
    )
    .join("\n");
}

function normalizeYesNo(v, fallback) {
  const s = String(v ?? "").trim();
  if (!s) return fallback;
  const low = s.toLowerCase();
  if (["yes", "y", "true", "1"].includes(low)) return "Yes";
  if (["no", "n", "false", "0"].includes(low)) return "No";
  if (s === "Yes" || s === "No") return s;
  return fallback;
}

function isNumberLike(v) {
  const s = String(v ?? "").trim();
  if (!s) return false;
  const cleaned = s.replace(/[^0-9.\-]/g, "");
  return cleaned !== "" && !Number.isNaN(Number(cleaned));
}

function num(v) {
  const s = String(v ?? "").trim();
  const cleaned = s.replace(/[^0-9.\-]/g, "");
  return cleaned ? Number(cleaned) : NaN;
}

function urlHasAnyPattern(url, patterns) {
  const u = String(url ?? "").trim().toLowerCase();
  if (!u) return false;
  return (patterns || []).some((p) => u.includes(String(p).toLowerCase()));
}

function isPlaceholderUrl(url, placeholderPatterns) {
  return urlHasAnyPattern(url, placeholderPatterns);
}

function loadRules(rulesPath) {
  const rules = JSON.parse(readText(rulesPath));

  rules.maxPrice = typeof rules.maxPrice === "number" ? rules.maxPrice : 100;

  rules.requiredColumns =
    Array.isArray(rules.requiredColumns) && rules.requiredColumns.length
      ? rules.requiredColumns
      : [
          "sku","title","description","category","retailer","url","imageUrl","price",
          "shippingPrice","shippingIncluded","condition","membershipRequired","membershipType","isSponsored","sponsorLabel"
        ];

  rules.defaults = rules.defaults || {};
  rules.defaults.shippingIncluded = rules.defaults.shippingIncluded || "No";
  rules.defaults.membershipRequired = rules.defaults.membershipRequired || "No";
  rules.defaults.isSponsored = rules.defaults.isSponsored || "No";
  rules.defaults.condition = rules.defaults.condition || "New";
  rules.defaults.membershipTypeIfRequired = rules.defaults.membershipTypeIfRequired || "Prime";
  rules.defaults.sponsorLabelIfSponsored = rules.defaults.sponsorLabelIfSponsored || "Sponsored";

  rules.allowedEnums = rules.allowedEnums || {};
  rules.allowedEnums.condition =
    Array.isArray(rules.allowedEnums.condition) && rules.allowedEnums.condition.length
      ? rules.allowedEnums.condition
      : ["New", "Used", "Refurbished"];

  rules.enforceConditionNewOnly = !!rules.enforceConditionNewOnly;

  rules.requireUkDelivery = rules.requireUkDelivery !== false;

  rules.ukRetailerPatterns = rules.ukRetailerPatterns || {};
  rules.ukFallbackPatterns = Array.isArray(rules.ukFallbackPatterns) ? rules.ukFallbackPatterns : [".co.uk"];

  rules.allowPlaceholderUrls = !!rules.allowPlaceholderUrls;
  rules.placeholderPatterns = Array.isArray(rules.placeholderPatterns)
    ? rules.placeholderPatterns
    : ["example.com", "localhost"];

  return rules;
}

function main() {
  const args = parseArgs(process.argv);

  const inPath = args.in;
  if (!inPath) {
    console.error("Missing --in offers.csv");
    process.exit(1);
  }

  const outPath = args.out || inPath.replace(/\.csv$/i, ".cleaned.csv");
  const rejectedPath = args.rejected || inPath.replace(/\.csv$/i, ".rejected.csv");
  const rulesPath = args.rules || path.join("scripts", "offer-rules.json");

  if (!fs.existsSync(rulesPath)) {
    console.error(`Rules file not found: ${rulesPath}`);
    process.exit(1);
  }

  const rules = loadRules(rulesPath);

  const text = readText(inPath);
  const rawRows = parseCSV(text);

  if (rawRows.length < 2) {
    console.error("CSV looks empty.");
    process.exit(1);
  }

  const header = rawRows[0].map((h) => String(h).trim());
  const required = rules.requiredColumns;

  const missingCols = required.filter((c) => !header.includes(c));
  if (missingCols.length) {
    console.error("CSV is missing required columns:", missingCols.join(", "));
    console.error("Your header row is:", header.join(", "));
    process.exit(1);
  }

  const idx = Object.fromEntries(header.map((h, i) => [h, i]));

  const cleaned = [required];
  const rejected = [required.concat(["reasons"])];

  let kept = 0;
  let dropped = 0;

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.every((c) => String(c ?? "").trim() === "")) continue;

    const obj = {};
    for (const h of header) obj[h] = row[idx[h]] ?? "";

    const reasons = [];

    obj.shippingIncluded = normalizeYesNo(obj.shippingIncluded, rules.defaults.shippingIncluded);
    obj.membershipRequired = normalizeYesNo(obj.membershipRequired, rules.defaults.membershipRequired);
    obj.isSponsored = normalizeYesNo(obj.isSponsored, rules.defaults.isSponsored);

    if (!String(obj.sku ?? "").trim()) reasons.push("missing sku");
    if (!String(obj.title ?? "").trim()) reasons.push("missing title");
    if (!String(obj.category ?? "").trim()) reasons.push("missing category");
    if (!String(obj.retailer ?? "").trim()) reasons.push("missing retailer");
    if (!String(obj.url ?? "").trim()) reasons.push("missing url");
    if (!String(obj.imageUrl ?? "").trim()) reasons.push("missing imageUrl");

    if (!isNumberLike(obj.price)) {
      reasons.push("price not numeric");
    } else {
      const p = num(obj.price);
      if (p < 0) reasons.push("price < 0");
      if (p > rules.maxPrice) reasons.push(`price > ${rules.maxPrice}`);
      obj.price = Number.isFinite(p) ? p.toFixed(2) : obj.price;
    }

    if (obj.shippingIncluded === "Yes") {
      obj.shippingPrice = "0.00";
    } else {
      if (!isNumberLike(obj.shippingPrice)) reasons.push("shippingPrice missing/non-numeric");
      else {
        const sp = num(obj.shippingPrice);
        if (sp < 0) reasons.push("shippingPrice < 0");
        obj.shippingPrice = Number.isFinite(sp) ? sp.toFixed(2) : obj.shippingPrice;
      }
    }

    const cond = String(obj.condition ?? "").trim() || rules.defaults.condition;
    obj.condition = cond;
    if (!rules.allowedEnums.condition.includes(cond)) {
      reasons.push("condition invalid");
      obj.condition = rules.defaults.condition;
    }
    if (rules.enforceConditionNewOnly && obj.condition !== "New") {
      reasons.push("condition must be New");
    }

    if (obj.membershipRequired === "No") {
      obj.membershipType = "";
    } else {
      const mt = String(obj.membershipType ?? "").trim();
      obj.membershipType = mt || rules.defaults.membershipTypeIfRequired;
      if (!obj.membershipType) reasons.push("membershipType required when membershipRequired=Yes");
    }

    if (obj.isSponsored === "No") {
      obj.sponsorLabel = "";
    } else {
      const sl = String(obj.sponsorLabel ?? "").trim();
      obj.sponsorLabel = sl || rules.defaults.sponsorLabelIfSponsored;
      if (!obj.sponsorLabel) reasons.push("sponsorLabel required when isSponsored=Yes");
    }

    if (rules.requireUkDelivery) {
      const url = String(obj.url ?? "").trim();
      const retailer = String(obj.retailer ?? "").trim();

      if (!rules.allowPlaceholderUrls && isPlaceholderUrl(url, rules.placeholderPatterns)) {
        reasons.push("placeholder url not allowed");
      } else {
        const patterns = rules.ukRetailerPatterns[retailer] || rules.ukFallbackPatterns;
        const ok = urlHasAnyPattern(url, patterns);
        if (!ok) reasons.push("url not UK-like (rule)");
      }
    }

    const outRow = required.map((c) => (obj[c] ?? "").toString().trim());

    if (reasons.length) {
      rejected.push(outRow.concat([reasons.join("; ")]));
      dropped++;
    } else {
      cleaned.push(outRow);
      kept++;
    }
  }

  writeText(outPath, toCSV(cleaned));
  writeText(rejectedPath, toCSV(rejected));

  console.log("Done.");
  console.log(`Kept: ${kept}`);
  console.log(`Rejected: ${dropped}`);
  console.log(`Cleaned CSV: ${outPath}`);
  console.log(`Rejected CSV: ${rejectedPath}`);
}

main();
