const CLANKER_BASE = "https://www.clanker.world";

export interface ClankerRawToken {
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
  social_context?: {
    username?: string | null;
    platform?: string | null;
    id?: string | null;
  } | null;
  related?: {
    market?: {
      marketCap?: number | null;
      volume24h?: number | null;
      priceChange24h?: number | null;
    } | null;
  } | null;
}

export interface ClankerToken {
  id: number;
  contract_address: string;
  name: string;
  symbol: string;
  decimals: number;
  image_url: string | null;
  pool_address: string | null;
  cast_hash: string | null;
  requestor_fid: number | null;
  created_at: string;
  pair: string | null;
  description: string | null;
  type: string | null;
  presale_price_in_eth: number | null;
  starting_market_cap: number | null;
  current_market_cap: number | null;
  price_change_24h: number | null;
  volume_24h: number | null;
  warpcast_url: string | null;
  requestor_username: string | null;
  requestor_pfp: string | null;
}

export interface ClankerListResponse {
  data: ClankerToken[];
  page: number;
  limit: number;
  total: number;
}

function mapToken(raw: ClankerRawToken): ClankerToken {
  const username = raw.social_context?.username ?? null;
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
    requestor_username: username,
    requestor_pfp: null,
  };
}

async function fetchClanker<T>(
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const url = new URL(`${CLANKER_BASE}${endpoint}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) {
      url.searchParams.set(k, String(v));
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "ClankerTV/1.0",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!response.ok) {
    throw new Error(
      `Clanker API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

interface RawListResponse {
  data: ClankerRawToken[];
  page?: number;
  limit?: number;
  total?: number;
}

export async function fetchTokens(
  page = 1,
  limit = 20,
  sort = "newest"
): Promise<ClankerListResponse> {
  const safeLimit = Math.min(limit, 20);
  const params: Record<string, string | number> = { page, limit: safeLimit };
  if (sort === "oldest") {
    params.sort = "asc";
  }
  const raw = await fetchClanker<RawListResponse>("/api/tokens", params);

  return {
    data: (raw.data ?? []).map(mapToken),
    page: raw.page ?? page,
    limit: raw.limit ?? limit,
    total: raw.total ?? (raw.data?.length ?? 0),
  };
}

export async function fetchToken(address: string): Promise<ClankerToken> {
  const raw = await fetchClanker<ClankerRawToken>(`/api/tokens/${address}`);
  return mapToken(raw);
}

export async function fetchTrending(timeframe = "24h"): Promise<ClankerListResponse> {
  const raw = await fetchClanker<RawListResponse>("/api/tokens", {
    page: 1,
    limit: 20,
  });

  return {
    data: (raw.data ?? []).map(mapToken),
    page: 1,
    limit: 20,
    total: raw.total ?? (raw.data?.length ?? 0),
  };
}
