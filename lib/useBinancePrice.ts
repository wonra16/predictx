// Binance WebSocket Hook - Real-time Price Updates
// TAMAMEN ÜCRETSIZ - Public WebSocket

import { useEffect, useState, useRef } from 'react';
import { CryptoId } from './types';

interface PriceUpdate {
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

const BINANCE_WS_URLS: Record<CryptoId, string> = {
  bitcoin: 'wss://stream.binance.com:9443/ws/btcusdt@trade',
  ethereum: 'wss://stream.binance.com:9443/ws/ethusdt@trade',
};

export function useBinancePrice(coinId: CryptoId | null) {
  const [priceData, setPriceData] = useState<PriceUpdate>({
    price: 0,
    change: 0,
    changePercent: 0,
    timestamp: Date.now(),
  });
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const lastPriceRef = useRef<number>(0);
  const initialPriceRef = useRef<number>(0);

  useEffect(() => {
    if (!coinId) return;

    const wsUrl = BINANCE_WS_URLS[coinId];
    if (!wsUrl) return;

    console.log('🔗 Connecting to Binance WebSocket:', coinId);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newPrice = parseFloat(data.p);

        // İlk fiyat referansı
        if (initialPriceRef.current === 0) {
          initialPriceRef.current = newPrice;
          lastPriceRef.current = newPrice;
        }

        // Değişim hesapla
        const change = newPrice - lastPriceRef.current;
        const changePercent = lastPriceRef.current > 0 
          ? ((change / lastPriceRef.current) * 100) 
          : 0;

        setPriceData({
          price: newPrice,
          change,
          changePercent,
          timestamp: Date.now(),
        });

        lastPriceRef.current = newPrice;
      } catch (error) {
        console.error('❌ WebSocket parse error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
    };

    // Cleanup
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [coinId]);

  return { ...priceData, isConnected };
}

// Fallback: Polling sistemi (WebSocket çalışmazsa)
export function usePricePolling(coinId: CryptoId | null, interval: number = 5000) {
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!coinId) return;

    const fetchPrice = async () => {
      try {
        const res = await fetch(`/api/prices?coinId=${coinId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setPrice(data.data.currentPrice);
        }
      } catch (error) {
        console.error('Price fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
    const timer = setInterval(fetchPrice, interval);

    return () => clearInterval(timer);
  }, [coinId, interval]);

  return { price, loading };
}

// Price formatting helper
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return price.toFixed(4);
}

// Price change color helper
export function getPriceColor(change: number): string {
  if (change > 0) return 'text-green-500';
  if (change < 0) return 'text-red-500';
  return 'text-gray-400';
}

// Animated price component helper
export function getPriceAnimation(change: number): string {
  if (change > 0) return 'animate-flash-green';
  if (change < 0) return 'animate-flash-red';
  return '';
}
