import Link from 'next/link';

export type Campaign = {
	id: string;
	title: string;
	summary?: string;
	image?: string;
};

export default function AdvertiserSuggestions({ campaigns = [] }: { campaigns?: Campaign[] }) {
	return (
		<section aria-labelledby="advertiser-suggestions-heading" className="advertiser-suggestions">
			<h2 id="advertiser-suggestions-heading" className="text-lg font-semibold">Some campaigns for you</h2>
			{campaigns.length === 0 ? (
				<p>No recommended campaigns yet.</p>
			) : (
				<ul className="mt-3 space-y-2">
					{campaigns.map((c) => (
						<li key={c.id} className="p-3 border rounded">
							<Link href={`/advertiser/campaigns/${c.id}`}>{c.title}</Link>
							{c.summary && <p className="text-sm text-muted">{c.summary}</p>}
						</li>
					))}
				</ul>
			)}

			<div className="mt-4">
				<Link href="/advertiser/campaigns" className="btn">Browse campaigns to see more</Link>
			</div>
		</section>
	);
}
