// OKX REST API - Real-time crypto prices for Vercel
// FREE, NO API KEY REQUIRED - Serverless compatible
import { CryptoPrice, CryptoId } from '@shared/schema';

const OKX_REST_URL = 'https://www.okx.com/api/v5/market';

// In-memory cache for Vercel (per-function instance)
let priceCache: Map<CryptoId, CryptoPrice> = new Map();
let lastFetchTime = 0;
const CACHE_DURATION = 2000; // 2 seconds cache

// OKX instrument mapping
const INSTRUMENT_MAP: Record<CryptoId, string> = {
  'bitcoin': 'BTC-USDT',
  'ethereum': 'ETH-USDT',
};

/**
 * Fetch price from OKX REST API
 */
async function fetchOKXPrice(instId: string): Promise<any> {
  try {
    const response = await fetch(`${OKX_REST_URL}/ticker?instId=${instId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`OKX API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code !== '0' || !data.data || data.data.length === 0) {
      throw new Error('Invalid OKX response');
    }

    return data.data[0];
  } catch (error) {
    console.error(`Error fetching ${instId} price:`, error);
    return null;
  }
}

/**
 * Get all crypto prices (with caching)
 */
export async function getCryptoPrices(
  coinIds: CryptoId[] = ['bitcoin', 'ethereum']
): Promise<CryptoPrice[]> {
  const now = Date.now();
  
  // Return cached prices if still fresh
  if (now - lastFetchTime < CACHE_DURATION && priceCache.size > 0) {
    return coinIds.map(id => priceCache.get(id)).filter(Boolean) as CryptoPrice[];
  }

  const prices: CryptoPrice[] = [];

  // Fetch all prices in parallel
  const fetchPromises = coinIds.map(async (coinId) => {
    const instId = INSTRUMENT_MAP[coinId];
    const tickerData = await fetchOKXPrice(instId);

    if (!tickerData) {
      // Return demo price as fallback
      return {
        id: coinId,
        symbol: coinId === 'bitcoin' ? 'BTC' : 'ETH',
        name: coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum',
        currentPrice: coinId === 'bitcoin' ? 111400 : 3950,
        priceChange24h: 0,
        priceChangePercentage24h: 0.1,
        lastUpdated: now,
      };
    }

    const currentPrice = parseFloat(tickerData.last);
    const open24h = parseFloat(tickerData.open24h);
    const priceChange24h = currentPrice - open24h;
    const priceChangePercentage24h = (priceChange24h / open24h) * 100;

    const price: CryptoPrice = {
      id: coinId,
      symbol: coinId === 'bitcoin' ? 'BTC' : 'ETH',
      name: coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum',
      currentPrice,
      priceChange24h,
      priceChangePercentage24h,
      lastUpdated: now,
    };

    // Update cache
    priceCache.set(coinId, price);
    
    return price;
  });

  const results = await Promise.all(fetchPromises);
  lastFetchTime = now;
  
  return results;
}

/**
 * Get single crypto price
 */
export async function getSingleCryptoPrice(coinId: CryptoId): Promise<CryptoPrice | null> {
  const prices = await getCryptoPrices([coinId]);
  return prices[0] || null;
}

/**
 * Get current price (for prediction checking)
 */
export async function getCurrentPrice(coinId: CryptoId): Promise<number | null> {
  const price = await getSingleCryptoPrice(coinId);
  return price ? price.currentPrice : null;
}
