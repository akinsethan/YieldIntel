const ALPHA_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY;

export async function fetchQuote(symbol: string): Promise<{ price: string; change: string } | null> {
  try {
    const res  = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_KEY}`);
    const data = await res.json();
    const q    = data["Global Quote"];
    if (!q || !q["05. price"]) return null;
    return {
      price:  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(q["05. price"])),
      change: parseFloat(q["10. change percent"].replace("%", "")).toFixed(2),
    };
  } catch {
    return null;
  }
}
