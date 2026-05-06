export const fmt    = (n: number, opts: object = {}) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 1, ...opts }).format(n);

export const fmtUSD = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

export const fmtM   = (n: number) =>
  n >= 1_000_000 ? `$${fmt(n / 1_000_000)}M` : `$${fmt(n / 1_000)}K`;

export function generateRetirementData(
  age: number,
  retirementAge: number,
  assets: number,
  contributions: number,
  risk: string,
) {
  const years = retirementAge - age + 20;
  const rate  = ({ Conservative: 0.055, Moderate: 0.075, Aggressive: 0.095 } as Record<string, number>)[risk] ?? 0.075;
  let base = assets, pess = assets, opti = assets;
  return Array.from({ length: years + 1 }, (_, i) => {
    const yr     = age + i;
    const contrib = yr >= retirementAge ? -60_000 : contributions;
    if (i > 0) {
      base = base * (1 + rate)         + contrib;
      pess = pess * (1 + rate - 0.03)  + contrib;
      opti = opti * (1 + rate + 0.025) + contrib;
    }
    return { year: yr, base: Math.max(0, Math.round(base)), pessimistic: Math.max(0, Math.round(pess)), optimistic: Math.max(0, Math.round(opti)) };
  });
}

export function simulateRILA({
  amount, cap, buffer, participation, meanReturn, volatility, years,
}: {
  amount: number; cap: number; buffer: number; participation: number;
  meanReturn: number; volatility: number; years: number;
}) {
  const simCount = 500;
  const finalValues: number[] = [];

  for (let s = 0; s < simCount; s++) {
    let val = amount;
    for (let y = 0; y < years; y++) {
      const z1   = Math.random(), z2 = Math.random();
      const norm  = Math.sqrt(-2 * Math.log(z1)) * Math.cos(2 * Math.PI * z2);
      const idx   = (meanReturn / 100) + (volatility / 100) * norm;
      let cr: number;
      if      (idx < -(buffer / 100)) cr = idx + (buffer / 100);
      else if (idx < 0)               cr = 0;
      else                            cr = Math.min(idx * (participation / 100), cap / 100);
      val *= (1 + cr);
    }
    finalValues.push(val);
  }

  finalValues.sort((a, b) => a - b);
  const p10 = finalValues[Math.floor(simCount * 0.10)];
  const p50 = finalValues[Math.floor(simCount * 0.50)];
  const p90 = finalValues[Math.floor(simCount * 0.90)];

  const growthData = Array.from({ length: years + 1 }, (_, i) => ({
    year:      `Y${i}`,
    worstCase: Math.round(amount + (p10 - amount) * (i / years)),
    median:    Math.round(amount + (p50 - amount) * (i / years)),
    bestCase:  Math.round(amount + (p90 - amount) * (i / years)),
  }));

  const buckets = 20;
  const minV = finalValues[0], maxV = finalValues[simCount - 1], step = (maxV - minV) / buckets;
  const hist = Array.from({ length: buckets }, (_, i) => {
    const lo = minV + i * step, hi = lo + step;
    return { range: `$${fmt(lo / 1000)}K`, count: finalValues.filter(v => v >= lo && v < hi).length };
  });

  return { growthData, hist, p10, p50, p90 };
}
