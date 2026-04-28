const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);

export const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const safeDivide = (numerator, denominator) => {
  const top = toNumber(numerator);
  const bottom = toNumber(denominator);
  if (!bottom) return 0;
  return top / bottom;
};

export const calculateAIS = (deal) => {
  const cost = toNumber(deal.deal_value || deal.cost || deal.sponsorship_value);
  const audience = toNumber(deal.audience);
  const engagement = toNumber(deal.engagement);
  const mediaValue = toNumber(deal.media_value);
  const brandExposure = clamp(toNumber(deal.brand_exposure, 55));
  const brandShare = clamp(toNumber(deal.brand_share, brandExposure));

  const cpa = safeDivide(cost, audience);
  const cpe = safeDivide(cost, engagement);
  const mvroi = safeDivide(mediaValue, cost);
  const sov = brandShare;
  const engagementRate = safeDivide(engagement, audience) * 100;

  const reachScore = clamp((audience / 1800000) * 100);
  const engagementScore = clamp(engagementRate * 9);
  const mvroiScore = clamp(mvroi * 22);
  const exposureScore = clamp(brandExposure);
  const sovScore = clamp(sov);
  const costEfficiencyScore = clamp(100 - cpa / 0.18);

  const svi =
    mvroiScore * 0.3 +
    engagementScore * 0.2 +
    reachScore * 0.15 +
    exposureScore * 0.14 +
    sovScore * 0.13 +
    costEfficiencyScore * 0.08;

  return {
    cpa,
    cpe,
    mvroi,
    sov,
    engagementRate,
    svi: clamp(svi),
    scores: {
      reach: reachScore,
      engagement: engagementScore,
      mvroi: mvroiScore,
      exposure: exposureScore,
      sov: sovScore,
      efficiency: costEfficiencyScore,
    },
  };
};

export const enrichDeal = (deal) => ({
  ...deal,
  metrics: calculateAIS(deal),
});

export const sortBySvi = (deals) =>
  [...deals].sort((a, b) => calculateAIS(b).svi - calculateAIS(a).svi);

export const formatCurrency = (value, options = {}) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
    notation: options.compact ? 'compact' : 'standard',
  }).format(toNumber(value));

export const formatNumber = (value, options = {}) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: options.maximumFractionDigits ?? 0,
    notation: options.compact ? 'compact' : 'standard',
  }).format(toNumber(value));

export const formatPercent = (value, maximumFractionDigits = 1) =>
  `${toNumber(value).toFixed(maximumFractionDigits)}%`;

export const buildTrendData = (deals) => {
  const source = deals.length ? deals : [];
  return source
    .slice()
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .map((deal, index) => ({
      name: deal.club_name?.slice(0, 10) || `Deal ${index + 1}`,
      mvroi: Number(calculateAIS(deal).mvroi.toFixed(2)),
      svi: Number(calculateAIS(deal).svi.toFixed(1)),
      cost: Math.round(toNumber(deal.deal_value) / 1000000),
      engagement: Math.round(toNumber(deal.engagement) / 1000),
    }));
};

export const average = (values) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + toNumber(value), 0) / values.length;
};
