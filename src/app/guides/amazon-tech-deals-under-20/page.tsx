export const metadata = {
  title: "Top Amazon Tech Deals Under £20 | SavvyDealsHub",
  description: "Useful tech accessories under £20 with direct Amazon links.",
};

const TAG = "savvydeals03d-21";

function amz(asin: string) {
  return `https://www.amazon.co.uk/dp/${asin}?tag=${TAG}`;
}

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <a href="/guides" className="mb-4 block text-sm underline opacity-80">
        ← Back to all guides
      </a>

      <h1 className="text-3xl font-bold">Top Amazon Tech Deals Under £20</h1>

      <p className="mt-3 text-base opacity-80">
        Affordable tech accessories can massively improve your day-to-day setup without costing a fortune.
        This page highlights useful, well-rated tech items on Amazon that typically come in under £20.
        These are practical gadgets people actually buy and use every day.
      </p>

      <p className="mt-2 text-base opacity-80">
        We focus on items with practical everyday use and solid reviews — no hype.
      </p>

      <h2 className="mt-8 text-xl font-semibold">🔗 Deals &amp; Useful Finds</h2>

      <ul className="mt-4 list-disc space-y-3 pl-6">
        <li>
          <strong>USB-C Fast Wall Charger (20W)</strong>{" "}
          <a className="underline" href={amz("B0CJ2B7TS1")} target="_blank" rel="nofollow sponsored noopener">
            View on Amazon
          </a>
        </li>
        <li>
          <strong>Wireless Mouse (USB / Bluetooth)</strong>{" "}
          <a className="underline" href={amz("B00552K0GM")} target="_blank" rel="nofollow sponsored noopener">
            View on Amazon
          </a>
        </li>
        <li>
          <strong>Bluetooth Earbuds (Budget Range)</strong>{" "}
          <a className="underline" href={amz("B09BVDNPGB")} target="_blank" rel="nofollow sponsored noopener">
            View on Amazon
          </a>
        </li>
        <li>
          <strong>Adjustable Phone Stand for Desk</strong>{" "}
          <a className="underline" href={amz("B07BK5P5ST")} target="_blank" rel="nofollow sponsored noopener">
            View on Amazon
          </a>
        </li>
        <li>
          <strong>USB LED Light Strip (TV / Desk Use)</strong>{" "}
          <a className="underline" href={amz("B07SH48YTR")} target="_blank" rel="nofollow sponsored noopener">
            View on Amazon
          </a>
        </li>
        <li>
          <strong>USB Hub (4-Port Expansion)</strong>{" "}
          <a className="underline" href={amz("B0CD1BHXPZ")} target="_blank" rel="nofollow sponsored noopener">
            View on Amazon
          </a>
        </li>
      </ul>

      <p className="mt-6 opacity-80">
        These tech deals are ideal for upgrading your workspace or gifting without overspending.
        Availability and pricing may vary, so it’s worth checking regularly for updates.
      </p>

      <hr className="my-10" />

      <p className="text-sm opacity-80">
        <strong>Disclosure:</strong> SavvyDealsHub is a participant in the Amazon Associates Program.
        As an Amazon Associate, we may earn from qualifying purchases at no extra cost to you.
      </p>
    </main>
  );
}
