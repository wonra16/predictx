// CoinGecko API - Free crypto price data (no geo-blocking)
import { CryptoPrice, CryptoId } from '@shared/schema';

// CoinGecko API endpoint (free tier, no API key required)
const API_BASE_URL = 'https://api.coingecko.com/api/v3';

// CoinGecko ID mapping
const COIN_MAP: Record<CryptoId, string> = {
  'bitcoin': 'bitcoin',
  'ethereum': 'ethereum',
};

// Price cache (updated by polling)
export let priceCache: Map<CryptoId, CryptoPrice> = new Map();

// Polling interval (30 seconds - avoid rate limiting)
const BASE_POLL_INTERVAL = 30000;
const BACKOFF_POLL_INTERVAL = 120000; // 2 minutes during failures
let currentPollInterval = BASE_POLL_INTERVAL;
let pollIntervalId: NodeJS.Timeout | null = null;
let failureCount = 0;
const MAX_FAILURES = 3;

/**
 * Fetch price from CoinGecko API
 */
async function fetchPriceFromCoinGecko(coinId: CryptoId): Promise<CryptoPrice | null> {
  try {
    const geckoId = COIN_MAP[coinId];
    const url = `${API_BASE_URL}/simple/price?ids=${geckoId}&vs_currencies=usd&include_24hr_change=true`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`CoinGecko API error for ${coinId}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    const coinData = data[geckoId];
    
    if (!coinData) {
      console.error(`No data returned for ${coinId}`);
      return null;
    }
    
    const price: CryptoPrice = {
      id: coinId,
      symbol: coinId === 'bitcoin' ? 'BTC' : 'ETH',
      name: coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum',
      currentPrice: coinData.usd,
      priceChange24h: coinData.usd_24h_change || 0,
      priceChangePercentage24h: coinData.usd_24h_change || 0,
      lastUpdated: Date.now(),
    };
    
    return price;
  } catch (error) {
    console.error(`Error fetching ${coinId} price from CoinGecko:`, error);
    return null;
  }
}

/**
 * Update all prices
 */
async function updateAllPrices() {
  const coinIds: CryptoId[] = ['bitcoin', 'ethereum'];
  let successCount = 0;
  
  for (const coinId of coinIds) {
    const price = await fetchPriceFromCoinGecko(coinId);
    
    if (price) {
      priceCache.set(coinId, price);
      console.log(`💰 ${price.symbol}: $${price.currentPrice.toLocaleString()} (${price.priceChangePercentage24h >= 0 ? '+' : ''}${price.priceChangePercentage24h.toFixed(2)}%)`);
      successCount++;
    }
  }
  
  // Track failures and implement backoff
  if (successCount === 0) {
    failureCount++;
    
    if (failureCount >= MAX_FAILURES && currentPollInterval === BASE_POLL_INTERVAL) {
      console.warn(`⚠️ ${failureCount} consecutive failures - switching to backoff mode (${BACKOFF_POLL_INTERVAL / 1000}s polling)`);
      
      // Clear current interval and restart with backoff
      if (pollIntervalId) {
        clearInterval(pollIntervalId);
      }
      currentPollInterval = BACKOFF_POLL_INTERVAL;
      pollIntervalId = setInterval(updateAllPrices, currentPollInterval);
    }
  } else {
    // Reset on success
    if (failureCount > 0) {
      console.log(`✅ Recovered from ${failureCount} failures - back to normal polling`);
      failureCount = 0;
      
      // Restore normal interval if we were in backoff
      if (currentPollInterval !== BASE_POLL_INTERVAL) {
        if (pollIntervalId) {
          clearInterval(pollIntervalId);
        }
        currentPollInterval = BASE_POLL_INTERVAL;
        pollIntervalId = setInterval(updateAllPrices, currentPollInterval);
      }
    }
  }
}

/**
 * Initialize CoinGecko price polling
 */
export async function initializeCoinGeckoPrices() {
  console.log('🚀 Initializing CoinGecko API price polling...');
  
  // Fetch initial prices immediately
  await updateAllPrices();
  
  // Start polling with base interval
  pollIntervalId = setInterval(updateAllPrices, currentPollInterval);
  
  console.log(`✅ Polling started (every ${currentPollInterval / 1000} seconds)`);
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
      // Always return cached price (even if stale) - never return 0
      prices.push(cachedPrice);
    } else {
      // Fallback: fetch directly on first request only
      console.warn(`⚠️ No cached data for ${coinId}, fetching directly...`);
      const price = await fetchPriceFromCoinGecko(coinId);
      
      if (price) {
        priceCache.set(coinId, price);
        prices.push(price);
      } else {
        // Still no cache after direct fetch - use demo price with warning
        console.error(`❌ Failed to fetch ${coinId}, using demo price`);
        const demoPrice: CryptoPrice = {
          id: coinId,
          symbol: coinId === 'bitcoin' ? 'BTC' : 'ETH',
          name: coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum',
          currentPrice: coinId === 'bitcoin' ? 67000 : 2600,
          priceChange24h: 0,
          priceChangePercentage24h: 0,
          lastUpdated: Date.now(),
        };
        priceCache.set(coinId, demoPrice);
        prices.push(demoPrice);
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
  const price = await fetchPriceFromCoinGecko(coinId);
  return price?.currentPrice || null;
}

/**
 * Stop price polling
 */
export function stopCoinGeckoPrices() {
  console.log('🔌 Stopping CoinGecko price polling...');
  
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }
  
  priceCache.clear();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  stopCoinGeckoPrices();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopCoinGeckoPrices();
  process.exit(0);
});
