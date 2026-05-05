export const MOCK_CLIENTS = [
  { id: 1, name: "Margaret Chen",     age: 58, retirementAge: 65, assets: 1_240_000, contributions: 24_000, risk: "Moderate",     status: "On Track"  },
  { id: 2, name: "Robert Halverson",  age: 62, retirementAge: 67, assets: 890_000,   contributions: 18_000, risk: "Conservative", status: "At Risk"   },
  { id: 3, name: "Patricia Williams", age: 54, retirementAge: 65, assets: 2_150_000, contributions: 36_000, risk: "Aggressive",   status: "Excellent" },
  { id: 4, name: "James Okonkwo",     age: 49, retirementAge: 65, assets: 640_000,   contributions: 22_000, risk: "Moderate",     status: "On Track"  },
];

export const ANNUITY_PRODUCTS = [
  { id: 1,  carrier: "Allianz Life",      product: "360 RILA",            buffer: 10, cap: 12.5, participation: 100, term: 6, liquidity: "10% Free", fees: "0.00%" },
  { id: 2,  carrier: "Brighthouse",       product: "Shield Level Select", buffer: 10, cap: 14.0, participation: 100, term: 6, liquidity: "10% Free", fees: "0.00%" },
  { id: 3,  carrier: "Nationwide",        product: "Peaks RILA",          buffer: 15, cap: 11.0, participation: 100, term: 6, liquidity: "10% Free", fees: "0.25%" },
  { id: 4,  carrier: "Lincoln Financial", product: "Level Advantage",     buffer: 10, cap: 13.5, participation: 100, term: 3, liquidity: "10% Free", fees: "0.00%" },
  { id: 5,  carrier: "Protective",        product: "Protective RILA",     buffer: 20, cap: 9.5,  participation: 100, term: 6, liquidity: "10% Free", fees: "0.10%" },
  { id: 6,  carrier: "Global Atlantic",   product: "ForeStructured",      buffer: 10, cap: 15.0, participation: 110, term: 6, liquidity: "10% Free", fees: "0.00%" },
  { id: 7,  carrier: "F and G",           product: "Flourish RILA",       buffer: 15, cap: 12.0, participation: 100, term: 6, liquidity: "10% Free", fees: "0.00%" },
  { id: 8,  carrier: "Midland National",  product: "Endeavor RILA",       buffer: 10, cap: 11.5, participation: 100, term: 3, liquidity: "10% Free", fees: "0.15%" },
  { id: 9,  carrier: "American Equity",   product: "AssetShield",         buffer: 10, cap: 13.0, participation: 100, term: 6, liquidity: "10% Free", fees: "0.00%" },
  { id: 10, carrier: "Pacific Life",      product: "Pacific Odyssey",     buffer: 10, cap: 14.5, participation: 105, term: 6, liquidity: "10% Free", fees: "0.00%" },
];

export const MARKET_UPDATES = [
  { time: "09:42", tag: "FED",     msg: "Fed holds rates steady; markets react positively to forward guidance" },
  { time: "08:15", tag: "EQUITY",  msg: "S&P 500 futures +0.4%; tech sector leads gains ahead of earnings" },
  { time: "07:30", tag: "RATES",   msg: "10-yr Treasury yield at 4.31%, down 5bps after jobs data revision" },
  { time: "06:55", tag: "ANNUITY", msg: "Allianz increases RILA cap rates by 50bps effective next month" },
];

export const NAV_ITEMS = [
  { id: "dashboard",  label: "Dashboard",        icon: "▦", children: [] },
  { id: "clients",    label: "Clients",           icon: "◉", children: [
    { id: "clientplanner", label: "Client Planner" },
  ]},
  { id: "simulators", label: "Simulators",        icon: "◈", children: [
    { id: "rila", label: "RILA Simulator" },
  ]},
  { id: "products",   label: "Products",          icon: "⊞", children: [] },
  { id: "strategy",   label: "Strategy Builder",  icon: "◇", children: [] },
  { id: "research",   label: "Market Research",   icon: "◎", children: [] },
  { id: "compare",    label: "Product Compare",   icon: "⊟", children: [] },
  { id: "settings",   label: "Settings",          icon: "◌", children: [] },
];
