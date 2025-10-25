import { CryptoPrice, CryptoId } from './types';

// Binance API - ücretsiz, auth gerektirmiyor, rate limit: 2400/dakika
const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';

// Cache for 1 minute
let priceCache: { [key: string]: { data: CryptoPrice[]; timestamp: number } } = {};
const CACHE_DURATION = 60 * 1000; // 1 minute

// Binance symbol mapping
const SYMBOL_MAP: { [key in CryptoId]: string } = {
  'bitcoin': 'BTCUSDT',
  'ethereum': 'ETHUSDT',
};

export async function getCryptoPrices(
  coinIds: CryptoId[] = ['bitcoin', 'ethereum']
): Promise<CryptoPrice[]> {
  const now = Date.now();
  const cacheKey = coinIds.join(',');

  // Check cache
  if (priceCache[cacheKey] && now - priceCache[cacheKey].timestamp < CACHE_DURATION) {
    console.log('✅ Using cached prices');
    return priceCache[cacheKey].data;
  }

  try {
    console.log('📡 Fetching prices from Binance API...');
    
    // Fetch prices for all symbols
    const promises = coinIds.map(async (id) => {
      const symbol = SYMBOL_MAP[id];
      
      // Get current price and 24h stats
      const [priceRes, statsRes] = await Promise.all([
        fetch(`${BINANCE_BASE_URL}/ticker/price?symbol=${symbol}`),
        fetch(`${BINANCE_BASE_URL}/ticker/24hr?symbol=${symbol}`)
      ]);

      if (!priceRes.ok || !statsRes.ok) {
        throw new Error(`Binance API error: ${priceRes.status} / ${statsRes.status}`);
      }

      const priceData = await priceRes.json();
      const statsData = await statsRes.json();

      return {
        id,
        symbol: id === 'bitcoin' ? 'BTC' : 'ETH',
        name: id === 'bitcoin' ? 'Bitcoin' : 'Ethereum',
        currentPrice: parseFloat(priceData.price),
        priceChange24h: parseFloat(statsData.priceChange),
        priceChangePercentage24h: parseFloat(statsData.priceChangePercent),
        lastUpdated: Date.now(),
      };
    });

    const prices = await Promise.all(promises);
    console.log('✅ Binance prices:', prices.map(p => `${p.symbol}: $${p.currentPrice.toFixed(2)}`).join(', '));

    // Update cache
    priceCache[cacheKey] = { data: prices, timestamp: now };

    return prices;
  } catch (error) {
    console.error('❌ Binance API error:', error);
    
    // Return cached data if available
    if (priceCache[cacheKey]) {
      console.log('⚠️ Using expired cache');
      return priceCache[cacheKey].data;
    }

    // Fallback prices
    console.log('⚠️ Using fallback prices');
    return coinIds.map((id) => ({
      id,
      symbol: id === 'bitcoin' ? 'BTC' : 'ETH',
      name: id === 'bitcoin' ? 'Bitcoin' : 'Ethereum',
      currentPrice: id === 'bitcoin' ? 67000 : 2600,
      priceChange24h: 0,
      priceChangePercentage24h: 0,
      lastUpdated: Date.now(),
    }));
  }
}

export async function getSingleCryptoPrice(coinId: CryptoId): Promise<CryptoPrice | null> {
  const prices = await getCryptoPrices([coinId]);
  return prices[0] || null;
}

// Get historical price (Binance doesn't support this easily, use current for now)
export async function getHistoricalPrice(
  coinId: CryptoId,
  timestamp: number
): Promise<number | null> {
  console.log('⚠️ Historical prices not supported with Binance API, using current');
  const price = await getSingleCryptoPrice(coinId);
  return price?.currentPrice || null;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatPriceChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

// Get current price for prediction checking
export async function getCurrentPrice(coinId: CryptoId): Promise<number | null> {
  try {
    const price = await getSingleCryptoPrice(coinId);
    return price?.currentPrice || null;
  } catch (error) {
    console.error('Error getting current price:', error);
    return null;
  }
}
