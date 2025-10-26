// OKX WebSocket API - Real-time crypto prices
// FREE, FAST, NO API KEY REQUIRED - Sub-second latency
import { CryptoPrice, CryptoId } from '@shared/schema';
import WebSocket from 'ws';

const OKX_WS_URL = 'wss://ws.okx.com:8443/ws/v5/public';

// Price cache (updated by WebSocket)
export let priceCache: Map<CryptoId, CryptoPrice> = new Map();

// WebSocket connection
let ws: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

// OKX instrument mapping
const INSTRUMENT_MAP: Record<CryptoId, string> = {
  'bitcoin': 'BTC-USDT',
  'ethereum': 'ETH-USDT',
};

// Reverse mapping for price updates
const REVERSE_MAP: Record<string, CryptoId> = {
  'BTC-USDT': 'bitcoin',
  'ETH-USDT': 'ethereum',
};

/**
 * Initialize OKX WebSocket connection
 */
export function initializeOKXWebSocket() {
  if (isConnecting || ws) {
    console.log('⚠️ WebSocket already connecting or connected');
    return;
  }

  console.log('🚀 Initializing OKX WebSocket connection...');
  isConnecting = true;

  try {
    ws = new WebSocket(OKX_WS_URL);

    ws.on('open', () => {
      console.log('✅ OKX WebSocket connected!');
      isConnecting = false;
      reconnectAttempts = 0;

      // Subscribe to BTC and ETH ticker channels
      const subscribeMessage = {
        op: 'subscribe',
        args: [
          {
            channel: 'tickers',
            instId: 'BTC-USDT'
          },
          {
            channel: 'tickers',
            instId: 'ETH-USDT'
          }
        ]
      };

      ws?.send(JSON.stringify(subscribeMessage));
      console.log('📡 Subscribed to BTC-USDT and ETH-USDT tickers');
    });

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());

        // Handle ticker updates
        if (message.arg && message.arg.channel === 'tickers' && message.data) {
          const tickerData = message.data[0];
          const instId = message.arg.instId;
          const coinId = REVERSE_MAP[instId];

          if (!coinId || !tickerData) return;

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
            lastUpdated: Date.now(),
          };

          priceCache.set(coinId, price);
          
          // Log updates every 5 seconds to avoid spam
          if (Math.random() < 0.01) { // ~1% of messages
            console.log(`💰 ${price.symbol}: $${price.currentPrice.toLocaleString()} (${priceChangePercentage24h >= 0 ? '+' : ''}${priceChangePercentage24h.toFixed(2)}%)`);
          }
        }
      } catch (error) {
        console.error('❌ Error parsing WebSocket message:', error);
      }
    });

    ws.on('error', (error) => {
      console.error('❌ OKX WebSocket error:', error.message);
      isConnecting = false;
    });

    ws.on('close', (code, reason) => {
      console.warn(`🔌 OKX WebSocket closed (code: ${code}, reason: ${reason.toString()})`);
      ws = null;
      isConnecting = false;

      // Attempt to reconnect with exponential backoff
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectAttempts++;
        
        console.log(`⏳ Reconnecting in ${delay / 1000}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
        
        reconnectTimeout = setTimeout(() => {
          initializeOKXWebSocket();
        }, delay);
      } else {
        console.error('❌ Max reconnection attempts reached. Please restart the server.');
      }
    });

    ws.on('ping', () => {
      ws?.pong();
    });

  } catch (error) {
    console.error('❌ Failed to initialize OKX WebSocket:', error);
    isConnecting = false;
  }
}

/**
 * Get all crypto prices from cache
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
      // Return demo price if WebSocket hasn't populated cache yet
      console.warn(`⚠️ No cached data for ${coinId}, using demo price`);
      const demoPrice: CryptoPrice = {
        id: coinId,
        symbol: coinId === 'bitcoin' ? 'BTC' : 'ETH',
        name: coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum',
        currentPrice: coinId === 'bitcoin' ? 111400 : 3950,
        priceChange24h: 0,
        priceChangePercentage24h: 0.1,
        lastUpdated: Date.now(),
      };
      prices.push(demoPrice);
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
  
  // Return demo price if not in cache
  return coinId === 'bitcoin' ? 111400 : 3950;
}

/**
 * Stop WebSocket connection
 */
export function stopOKXWebSocket() {
  console.log('🔌 Stopping OKX WebSocket...');

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  if (ws) {
    ws.close();
    ws = null;
  }

  priceCache.clear();
  isConnecting = false;
  reconnectAttempts = 0;
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  stopOKXWebSocket();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopOKXWebSocket();
  process.exit(0);
});
