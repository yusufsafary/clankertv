

const CLANKER_BASE = "https://www.clanker.world";

const ETH_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

interface ClankerRawToken {
  id: number;
  contract_address: string;
  name: string;
  symbol: string;
  img_url?: string | null;
  pool_address?: string | null;
  cast_hash?: string | null;
  requestor_fid?: number | null;
  created_at: string;
  deployed_at?: string | null;
  pair?: string | null;
  type?: string | null;
  starting_market_cap?: number | null;
  social_context?: { username?: string | null } | null;
  related?: { market?: { marketCap?: number | null; volume24h?: number | null; priceChange24h?: number | null } | null } | null;
}

function mapToken(raw: ClankerRawToken) {
  const warpcastUrl =
    raw.cast_hash && raw.cast_hash.startsWith("0x")
      ? `https://warpcast.com/~/conversations/${raw.cast_hash}`
      : raw.cast_hash ?? null;
  return {
    id: raw.id,
    contract_address: raw.contract_address,
    name: raw.name,
    symbol: raw.symbol,
    decimals: 18,
    image_url: raw.img_url ?? null,
    pool_address: raw.pool_address ?? null,
    cast_hash: raw.cast_hash ?? null,
    requestor_fid: raw.requestor_fid ?? null,
    created_at: raw.deployed_at ?? raw.created_at,
    pair: raw.pair ?? null,
    description: null,
    type: raw.type ?? null,
    presale_price_in_eth: null,
    starting_market_cap: raw.starting_market_cap ?? null,
    current_market_cap: raw.related?.market?.marketCap ?? null,
    price_change_24h: raw.related?.market?.priceChange24h ?? null,
    volume_24h: raw.related?.market?.volume24h ?? null,
    warpcast_url: warpcastUrl,
    requestor_username: raw.social_context?.username ?? null,
    requestor_pfp: null,
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const address = String(req.query.address ?? "");
  if (!ETH_ADDRESS_RE.test(address)) {
    return res.status(400).json({ error: "Invalid contract address" });
  }

  try {
    const upstream = await fetch(`${CLANKER_BASE}/api/tokens/${address}`, {
      headers: { Accept: "application/json", "User-Agent": "ClankerTV/1.0" },
      signal: AbortSignal.timeout(12000),
    });
    if (!upstream.ok) throw new Error(`Upstream ${upstream.status}`);
    const raw: ClankerRawToken = await upstream.json();
    res.json(mapToken(raw));
  } catch (err) {
    res.status(404).json({ error: "Token not found" });
  }
}
