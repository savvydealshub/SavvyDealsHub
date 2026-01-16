export const metadata = {
  title: "Top Home Essentials Under £10 | SavvyDealsHub",
  description: "Simple home essentials under £10 with direct Amazon links.",
};

const TAG = "savvydeals03d-21";
const amz = (asin: string) => `https://www.amazon.co.uk/dp/${asin}?tag=${TAG}`;

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Top Home Essentials Under £10</h1>

      <p className="mt-3 text-base opacity-80">
        Improving your home doesn’t always require big spending.
        Many useful household items cost less than £10 and can make daily life more comfortable and organised.
        This list focuses on simple home essentials that are commonly purchased on Amazon.
      </p>

      <h2 className="mt-8 text-xl font-semibold">🔗 Deals &amp; Useful Finds</h2>

      <ul className="mt-4 list-disc space-y-3 pl-6">
        <li><strong>Microfibre Cleaning Cloths (Multi-Pack)</strong>{" "}
          <a className="underline" href={amz("B0XXXXXXX")} target="_blank" rel="nofollow sponsored noopener">View on Amazon</a>
        </li>
        <li><strong>Motion Sensor Night Light</strong>{" "}
          <a className="underline" href={amz("B0XXXXXXX")} target="_blank" rel="nofollow sponsored noopener">View on Amazon</a>
        </li>
        <li><strong>Drawer Organiser Trays</strong>{" "}
          <a className="underline" href={amz("B0XXXXXXX")} target="_blank" rel="nofollow sponsored noopener">View on Amazon</a>
        </li>
        <li><strong>Door Draught Excluder</strong>{" "}
          <a className="underline" href={amz("B0XXXXXXX")} target="_blank" rel="nofollow sponsored noopener">View on Amazon</a>
        </li>
        <li><strong>Non-Slip Clothes Hangers</strong>{" "}
          <a className="underline" href={amz("B0XXXXXXX")} target="_blank" rel="nofollow sponsored noopener">View on Amazon</a>
        </li>
        <li><strong>Reusable Storage Bags</strong>{" "}
          <a className="underline" href={amz("B0XXXXXXX")} target="_blank" rel="nofollow sponsored noopener">View on Amazon</a>
        </li>
      </ul>

      <p className="mt-6 opacity-80">
        These affordable home essentials are easy upgrades that add comfort and organisation.
        Prices and stock levels may change, so check availability directly on Amazon.
      </p>

      <hr className="my-10" />

      <p className="text-sm opacity-80">
        <strong>Disclosure:</strong> SavvyDealsHub is a participant in the Amazon Associates Program.
        As an Amazon Associate, we may earn from qualifying purchases at no extra cost to you.
      </p>
    </main>
  );
}
