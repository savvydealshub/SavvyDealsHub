export const metadata = {
  title: "Best Kitchen Gadgets Under £15 | SavvyDealsHub",
  description: "Popular kitchen gadgets under £15 with direct Amazon links.",
};

const TAG = "savvydeals03d-21";
const amz = (asin: string) => `https://www.amazon.co.uk/dp/${asin}?tag=${TAG}`;

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Best Kitchen Gadgets Under £15</h1>

      <p className="mt-3 text-base opacity-80">
        Small kitchen tools can make cooking quicker, cleaner, and more enjoyable.
        Below are popular kitchen gadgets on Amazon that are usually available for under £15.
        They’re simple, practical, and widely used in everyday homes.
      </p>

      <h2 className="mt-8 text-xl font-semibold">🔗 Deals &amp; Useful Finds</h2>

      <ul className="mt-4 list-disc space-y-3 pl-6">
        <li><strong>Stainless Steel Garlic Press</strong>{" "}
          <a className="underline" href={amz("B0XXXXXXX")} target="_blank" rel="nofollow sponsored noopener">View on Amazon</a>
        </li>
        <li><strong>Digital Kitchen Scale</strong>{" "}
          <a className="underline" href={amz("B0XXXXXXX")} target="_blank" rel="nofollow sponsored noopener">View on Amazon</a>
        </li>
        <li><strong>Silicone Cooking Utensil Set</strong>{" "}
          <a className="underline" href={amz("B0XXXXXXX")} target="_blank" rel="nofollow sponsored noopener">View on Amazon</a>
        </li>
        <li><strong>Manual Vegetable Chopper</strong>{" "}
          <a className="underline" href={amz("B0XXXXXXX")} target="_blank" rel="nofollow sponsored noopener">View on Amazon</a>
        </li>
        <li><strong>Measuring Cups &amp; Spoons Set</strong>{" "}
          <a className="underline" href={amz("B0XXXXXXX")} target="_blank" rel="nofollow sponsored noopener">View on Amazon</a>
        </li>
        <li><strong>Non-Slip Jar Opener</strong>{" "}
          <a className="underline" href={amz("B0XXXXXXX")} target="_blank" rel="nofollow sponsored noopener">View on Amazon</a>
        </li>
      </ul>

      <p className="mt-6 opacity-80">
        These budget kitchen essentials are great for everyday cooking and make thoughtful low-cost gifts.
        Product availability can change, so check Amazon for the latest options.
      </p>

      <hr className="my-10" />

      <p className="text-sm opacity-80">
        <strong>Disclosure:</strong> SavvyDealsHub is a participant in the Amazon Associates Program.
        As an Amazon Associate, we may earn from qualifying purchases at no extra cost to you.
      </p>
    </main>
  );
}
