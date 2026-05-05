import { NextResponse } from "next/server";

const FMP  = "https://financialmodelingprep.com";
const KEY  = process.env.FMP_API_KEY;

export interface TreasuryData {
  date:   string;
  year1:  number;
  year2:  number;
  year5:  number;
  year10: number;
  year20: number;
  year30: number;
}

export interface NewsItem {
  title:     string;
  source:    string;
  published: string;
  url:       string;
  symbol:    string;
}

export interface MarketData {
  spx:      { price: string; change: string } | null;
  treasury: TreasuryData | null;
  fedRate:  number | null;
  news:     NewsItem[];
}

export const revalidate = 300; // cache 5 min

export async function GET() {
  try {
    const today   = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

    const [spxRes, treasuryRes, newsRes, fedRes] = await Promise.all([
      fetch(`${FMP}/api/v3/quote/SPY?apikey=${KEY}`, { next: { revalidate: 300 } }),
      fetch(`${FMP}/api/v4/treasury?from=${weekAgo}&to=${today}&apikey=${KEY}`, { next: { revalidate: 300 } }),
      fetch(`${FMP}/api/v3/stock_news?tickers=TLT,SPY,BND,AGG&limit=8&apikey=${KEY}`, { next: { revalidate: 300 } }),
      fetch(`${FMP}/api/v4/economic?name=federalFunds&apikey=${KEY}`, { next: { revalidate: 300 } }),
    ]);

    const [spxData, treasuryData, newsData, fedData] = await Promise.all([
      spxRes.json(), treasuryRes.json(), newsRes.json(), fedRes.json(),
    ]);

    const spx = Array.isArray(spxData) && spxData[0] ? {
      price:  Number(spxData[0].price).toFixed(2),
      change: Number(spxData[0].changesPercentage).toFixed(2),
    } : null;

    const latest: TreasuryData | null = Array.isArray(treasuryData) && treasuryData.length > 0
      ? {
          date:   treasuryData[0].date,
          year1:  treasuryData[0].year1,
          year2:  treasuryData[0].year2,
          year5:  treasuryData[0].year5,
          year10: treasuryData[0].year10,
          year20: treasuryData[0].year20,
          year30: treasuryData[0].year30,
        }
      : null;

    const fedRate: number | null = Array.isArray(fedData) && fedData[0]
      ? Number(fedData[0].value)
      : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const news: NewsItem[] = Array.isArray(newsData) ? newsData.slice(0, 6).map((n: any) => ({
      title:     n.title     ?? "",
      source:    n.site      ?? "",
      published: n.publishedDate ?? "",
      url:       n.url       ?? "",
      symbol:    n.symbol    ?? "",
    })) : [];

    return NextResponse.json({ spx, treasury: latest, fedRate, news } satisfies MarketData);
  } catch (err) {
    console.error("[/api/market] FMP error:", err);
    return NextResponse.json({ spx: null, treasury: null, fedRate: null, news: [] } satisfies MarketData);
  }
}
