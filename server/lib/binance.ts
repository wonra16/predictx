// Binance API - Free, Fast, No Rate Limit for Public Endpoints
import { CryptoPrice, CryptoId } from '@shared/schema';

const BINANCE_API_URL = 'https://api.binance.com/api/v3';

// Cache - 30 seconds (more frequent updates)
let priceCache: { [key: string]: { data: CryptoPrice[]; timestamp: number } } = {};
const CACHE_DURATION = 30 * 1000; // 30 seconds

// Binance symbol mapping
const SYMBOL_MAP: Record<CryptoId, string> = {
  'bitcoin': 'BTCUSDT',
  'ethereum': 'ETHUSDT',
};

// Fetch prices from Binance
export async function getCryptoPrices(
  coinIds: CryptoId[] = ['bitcoin', 'ethereum']
): Promise<CryptoPrice[]> {
  const now = Date.now();
  const cacheKey = coinIds.join(',');

  // Check cache
  if (priceCache[cacheKey] && now - priceCache[cacheKey].timestamp < CACHE_DURATION) {
    console.log('✅ Using cached Binance prices');
    return priceCache[cacheKey].data;
  }

  try {
    console.log('📡 Fetching prices from Binance...');
    
    // Fetch prices for each coin in parallel
    const promises = coinIds.map(async (coinId) => {
      const symbol = SYMBOL_MAP[coinId];
      
      // Retry logic - 3 attempts
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`🔄 Fetching ${symbol} (attempt ${attempt}/3)...`);
          
          // Add timeout - 5 seconds
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          // Binance ticker endpoint - with 24h price change
          const response = await fetch(
            `${BINANCE_API_URL}/ticker/24hr?symbol=${symbol}`,
            {
              headers: {
                'Accept': 'application/json',
              },
              signal: controller.signal,
            }
          );
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Binance API error: ${response.status}`);
          }

          const data = await response.json();
          
          const price: CryptoPrice = {
            id: coinId,
            symbol: coinId === 'bitcoin' ? 'BTC' : 'ETH',
            name: coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum',
            currentPrice: parseFloat(data.lastPrice),
            priceChange24h: parseFloat(data.priceChange),
            priceChangePercentage24h: parseFloat(data.priceChangePercent),
            lastUpdated: Date.now(),
          };

          console.log(`✅ ${price.symbol}: $${price.currentPrice.toFixed(2)} (${price.priceChangePercentage24h.toFixed(2)}%)`);
          return price;
          
        } catch (error) {
          console.error(`❌ Attempt ${attempt} failed for ${symbol}:`, error instanceof Error ? error.message : error);
          
          if (attempt === 3) {
            // Last attempt failed - use fallback
            console.warn(`⚠️ All attempts failed for ${symbol}, using fallback`);
            const fallbackPrice = coinId === 'bitcoin' ? 67000 : 2600;
            return {
              id: coinId,
              symbol: coinId === 'bitcoin' ? 'BTC' : 'ETH',
              name: coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum',
              currentPrice: fallbackPrice,
              priceChange24h: 0,
              priceChangePercentage24h: 0,
              lastUpdated: Date.now(),
            };
          }
          
          // Wait briefly and retry
          await new Promise(resolve => setTimeout(resolve, 500 * attempt));
        }
      }
      
      // Should not reach here but TypeScript needs it
      throw new Error('Unexpected code path');
    });

    const prices = await Promise.all(promises);

    // Update cache
    priceCache[cacheKey] = { data: prices, timestamp: now };

    console.log('✅ Binance prices updated successfully');
    return prices;
    
  } catch (error) {
    console.error('❌ Binance API error:', error);
    
    // Return from cache if available
    if (priceCache[cacheKey]) {
      console.log('⚠️ Using expired cache');
      return priceCache[cacheKey].data;
    }

    // Last resort fallback
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

// Get single crypto price
export async function getSingleCryptoPrice(coinId: CryptoId): Promise<CryptoPrice | null> {
  const prices = await getCryptoPrices([coinId]);
  return prices[0] || null;
}

// Get current price (for prediction checking)
export async function getCurrentPrice(coinId: CryptoId): Promise<number | null> {
  try {
    const price = await getSingleCryptoPrice(coinId);
    return price?.currentPrice || null;
  } catch (error) {
    console.error('Error getting current price:', error);
    return null;
  }
}

// Historical price - Binance klines API (optional)
export async function getHistoricalPrice(
  coinId: CryptoId,
  timestamp: number
): Promise<number | null> {
  try {
    const symbol = SYMBOL_MAP[coinId];
    const startTime = timestamp - 60000; // 1 minute before
    const endTime = timestamp + 60000; // 1 minute after
    
    const response = await fetch(
      `${BINANCE_API_URL}/klines?symbol=${symbol}&interval=1m&startTime=${startTime}&endTime=${endTime}&limit=1`
    );

    if (!response.ok) {
      throw new Error(`Binance historical API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Binance klines format: [timestamp, open, high, low, close, ...]
    if (data && data.length > 0) {
      const closePrice = parseFloat(data[0][4]); // Close price
      return closePrice;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching historical price:', error);
    return null;
  }
}

// Format helpers
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
