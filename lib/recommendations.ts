export type Campaign = {
	id: string;
	title: string;
	summary?: string;
	image?: string;
};

const SAMPLE_CAMPAIGNS: Campaign[] = [
	{
		id: 'sample-1',
		title: 'Local Brand Pop-up',
		summary: 'Reach urban shoppers with a weekend pop-up promotion.',
	},
	{
		id: 'sample-2',
		title: 'College Campus Tour',
		summary: 'Engage students with branded freebies and events.',
	},
	{
		id: 'sample-3',
		title: 'Holiday Promo Drive',
		summary: 'Seasonal campaign to boost end-of-year sales.',
	},
];

// Single responsibility: return a list of recommended campaigns. Try API endpoints first, otherwise return sample data.
export async function getRecommendedCampaigns(): Promise<Campaign[]> {
	// Try specific recommended endpoint
	try {
		const res = await fetch('/api/advertiser/recommended', { cache: 'no-store' });
		if (res.ok) {
			const payload = await res.json();
			if (Array.isArray(payload?.campaigns) && payload.campaigns.length > 0) return payload.campaigns;
			if (Array.isArray(payload) && payload.length > 0) return payload;
		}
	} catch (e) {
		// swallow - fallback below
	}

	// Try generic campaigns endpoint
	try {
		const res = await fetch('/api/campaigns', { cache: 'no-store' });
		if (res.ok) {
			const payload = await res.json();
			if (Array.isArray(payload?.campaigns) && payload.campaigns.length > 0) return payload.campaigns;
			if (Array.isArray(payload) && payload.length > 0) return payload;
		}
	} catch (e) {
		// swallow - fallback below
	}

	// Always return something non-empty so the UI can show recommendations.
	return SAMPLE_CAMPAIGNS;
}
