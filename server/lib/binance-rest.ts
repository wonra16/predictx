// Binance REST API - Real-time price updates via polling
import { CryptoPrice, CryptoId } from '@shared/schema';

// Binance REST API endpoint
const API_BASE_URL = 'https://api.binance.com/api/v3';

// Symbol mapping
const SYMBOL_MAP: Record<CryptoId, string> = {
  'bitcoin': 'BTCUSDT',
  'ethereum': 'ETHUSDT',
};

// Price cache (updated by polling)
export let priceCache: Map<CryptoId, CryptoPrice> = new Map();

// Polling interval (5 seconds)
const POLL_INTERVAL = 5000;
let pollIntervalId: NodeJS.Timeout | null = null;

/**
 * Fetch price from Binance REST API
 */
async function fetchPriceFromBinance(coinId: CryptoId): Promise<CryptoPrice | null> {
  try {
    const symbol = SYMBOL_MAP[coinId];
    const response = await fetch(`${API_BASE_URL}/ticker/24hr?symbol=${symbol}`);
    
    if (!response.ok) {
      console.error(`Binance API error for ${coinId}: ${response.status}`);
      return null;
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
    
    return price;
  } catch (error) {
    console.error(`Error fetching ${coinId} price from Binance:`, error);
    return null;
  }
}

/**
 * Update all prices
 */
async function updateAllPrices() {
  const coinIds: CryptoId[] = ['bitcoin', 'ethereum'];
  
  for (const coinId of coinIds) {
    const price = await fetchPriceFromBinance(coinId);
    
    if (price) {
      priceCache.set(coinId, price);
      console.log(`💰 ${price.symbol}: $${price.currentPrice.toLocaleString()} (${price.priceChangePercentage24h.toFixed(2)}%)`);
    }
  }
}

/**
 * Initialize Binance price polling
 */
export async function initializeBinancePrices() {
  console.log('🚀 Initializing Binance REST API price polling...');
  
  // Fetch initial prices immediately
  await updateAllPrices();
  
  // Start polling
  pollIntervalId = setInterval(updateAllPrices, POLL_INTERVAL);
  
  console.log(`✅ Polling started (every ${POLL_INTERVAL / 1000} seconds)`);
}

/**
 * Get all crypto prices
 */
export async function getCryptoPrices(
  coinIds: CryptoId[] = ['bitcoin', 'ethereum']
): Promise<CryptoPrice[]> {
  const prices: CryptoPrice[] = [];
  
  for (const coinId of coinIds) {
    const cachedPrice = priceCache.get(coinId);
    
    if (cachedPrice) {
      prices.push(cachedPrice);
    } else {
      // Fallback: fetch directly
      console.warn(`⚠️ No cached data for ${coinId}, fetching directly...`);
      const price = await fetchPriceFromBinance(coinId);
      
      if (price) {
        priceCache.set(coinId, price);
        prices.push(price);
      } else {
        // Last resort: use demo prices
        console.warn(`⚠️ Failed to fetch ${coinId}, using demo price`);
        prices.push({
          id: coinId,
          symbol: coinId === 'bitcoin' ? 'BTC' : 'ETH',
          name: coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum',
          currentPrice: coinId === 'bitcoin' ? 67000 : 2600,
          priceChange24h: 0,
          priceChangePercentage24h: 0,
          lastUpdated: Date.now(),
        });
      }
    }
  }
  
  return prices;
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
  const cachedPrice = priceCache.get(coinId);
  
  if (cachedPrice) {
    return cachedPrice.currentPrice;
  }
  
  // Fetch directly if not cached
  const price = await fetchPriceFromBinance(coinId);
  return price?.currentPrice || null;
}

/**
 * Stop price polling
 */
export function stopBinancePrices() {
  console.log('🔌 Stopping Binance price polling...');
  
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }
  
  priceCache.clear();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  stopBinancePrices();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopBinancePrices();
  process.exit(0);
});
