export const metadata = {
  title: "Deal Guides | SavvyDealsHub",
  description: "Curated deal guides and budget-friendly product picks from trusted retailers.",
};

export default function GuidesIndexPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Deal Guides</h1>
      <p className="mt-3 text-base opacity-80">
        Browse quick, practical guides with budget-friendly picks and direct retailer links.
      </p>

      <div className="mt-8 space-y-4">
        <a
          className="block rounded-xl border p-4 hover:opacity-90"
          href="/guides/amazon-tech-deals-under-20"
        >
          <div className="font-semibold">Top Amazon Tech Deals Under £20</div>
          <div className="text-sm opacity-80">
            Chargers, accessories, and everyday tech upgrades.
          </div>
        </a>

        <a
          className="block rounded-xl border p-4 hover:opacity-90"
          href="/guides/kitchen-gadgets-under-15"
        >
          <div className="font-semibold">Best Kitchen Gadgets Under £15</div>
          <div className="text-sm opacity-80">
            Handy tools that make cooking quicker and easier.
          </div>
        </a>

        <a
          className="block rounded-xl border p-4 hover:opacity-90"
          href="/guides/home-essentials-under-10"
        >
          <div className="font-semibold">Top Home Essentials Under £10</div>
          <div className="text-sm opacity-80">
            Simple upgrades for comfort and organisation.
          </div>
        </a>
      </div>

      <hr className="my-10" />

      <p className="text-sm opacity-80">
        <strong>Disclosure:</strong> SavvyDealsHub is a participant in the Amazon Associates Program.
        As an Amazon Associate, we may earn from qualifying purchases at no extra cost to you.
      </p>
    </main>
  );
}
