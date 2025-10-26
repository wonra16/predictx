// Binance WebSocket - Real-time price updates
import WebSocket from 'ws';
import { CryptoPrice, CryptoId } from '@shared/schema';

// WebSocket URLs for Binance streams
const WS_BASE_URL = 'wss://stream.binance.com:9443/ws';

// Symbol mapping
const SYMBOL_MAP: Record<CryptoId, string> = {
  'bitcoin': 'btcusdt',
  'ethereum': 'ethusdt',
};

// Price cache (updated by WebSocket)
export let priceCache: Map<CryptoId, CryptoPrice> = new Map();

// WebSocket connections
let wsConnections: Map<CryptoId, WebSocket> = new Map();

// Reconnection settings
const RECONNECT_INTERVAL = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 10;
let reconnectAttempts: Map<CryptoId, number> = new Map();

/**
 * Initialize WebSocket connections for real-time price updates
 */
export function initializeBinanceWebSocket() {
  console.log('🚀 Initializing Binance WebSocket connections...');
  
  // Connect to BTC and ETH streams
  connectToSymbol('bitcoin');
  connectToSymbol('ethereum');
}

/**
 * Connect to a single symbol stream
 */
function connectToSymbol(coinId: CryptoId) {
  const symbol = SYMBOL_MAP[coinId];
  const wsUrl = `${WS_BASE_URL}/${symbol}@ticker`;
  
  console.log(`📡 Connecting to ${symbol.toUpperCase()} WebSocket...`);
  
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', () => {
    console.log(`✅ ${symbol.toUpperCase()} WebSocket connected`);
    reconnectAttempts.set(coinId, 0); // Reset reconnect counter
  });
  
  ws.on('message', (data: WebSocket.Data) => {
    try {
      const ticker = JSON.parse(data.toString());
      
      // Update price cache
      const price: CryptoPrice = {
        id: coinId,
        symbol: coinId === 'bitcoin' ? 'BTC' : 'ETH',
        name: coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum',
        currentPrice: parseFloat(ticker.c), // Last price
        priceChange24h: parseFloat(ticker.p), // 24h price change
        priceChangePercentage24h: parseFloat(ticker.P), // 24h percentage change
        lastUpdated: Date.now(),
      };
      
      priceCache.set(coinId, price);
      
      // Log periodically (every 10 seconds)
      if (Math.random() < 0.1) {
        console.log(`💰 ${price.symbol}: $${price.currentPrice.toLocaleString()} (${price.priceChangePercentage24h.toFixed(2)}%)`);
      }
    } catch (error) {
      console.error(`❌ Error parsing ${symbol} WebSocket message:`, error);
    }
  });
  
  ws.on('error', (error) => {
    console.error(`❌ ${symbol.toUpperCase()} WebSocket error:`, error.message);
  });
  
  ws.on('close', () => {
    console.log(`🔌 ${symbol.toUpperCase()} WebSocket disconnected`);
    
    // Attempt reconnection
    const attempts = reconnectAttempts.get(coinId) || 0;
    
    if (attempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts.set(coinId, attempts + 1);
      console.log(`🔄 Reconnecting ${symbol.toUpperCase()} (attempt ${attempts + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
      
      setTimeout(() => {
        connectToSymbol(coinId);
      }, RECONNECT_INTERVAL);
    } else {
      console.error(`❌ Max reconnection attempts reached for ${symbol.toUpperCase()}`);
    }
  });
  
  wsConnections.set(coinId, ws);
}

/**
 * Get all crypto prices (from WebSocket cache)
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
      // Fallback if WebSocket not ready yet
      console.warn(`⚠️ No WebSocket data for ${coinId}, using fallback`);
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
  return cachedPrice?.currentPrice || null;
}

/**
 * Close all WebSocket connections (cleanup)
 */
export function closeBinanceWebSocket() {
  console.log('🔌 Closing Binance WebSocket connections...');
  
  wsConnections.forEach((ws, coinId) => {
    ws.close();
    console.log(`✅ Closed ${coinId} WebSocket`);
  });
  
  wsConnections.clear();
  priceCache.clear();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  closeBinanceWebSocket();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeBinanceWebSocket();
  process.exit(0);
});
