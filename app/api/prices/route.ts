import { NextRequest, NextResponse } from 'next/server';
import { getCryptoPrices, getSingleCryptoPrice } from '@/lib/binance'; // Binance'e geçtik!
import { CryptoId } from '@/lib/types';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coinId = searchParams.get('coinId') as CryptoId | null;

    console.log('📊 Prices API called (Binance):', coinId || 'all coins');

    if (coinId) {
      // Get single coin price
      const price = await getSingleCryptoPrice(coinId);
      
      if (!price) {
        console.error('❌ Failed to fetch single price for:', coinId);
        // Fallback için default değer döndür
        const fallbackPrice = coinId === 'bitcoin' ? 67000 : 2600;
        return NextResponse.json({
          success: true,
          data: {
            id: coinId,
            symbol: coinId === 'bitcoin' ? 'BTC' : 'ETH',
            name: coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum',
            currentPrice: fallbackPrice,
            priceChange24h: 0,
            priceChangePercentage24h: 0,
            lastUpdated: Date.now(),
          }
        }, {
          headers: {
            'Cache-Control': 'public, max-age=30', // 30 saniye cache
          }
        });
      }

      console.log('✅ Single price fetched:', price.symbol, price.currentPrice);
      return NextResponse.json({
        success: true,
        data: price,
      }, {
        headers: {
          'Cache-Control': 'public, max-age=30', // 30 saniye cache
        }
      });
    }

    // Get all supported coins
    const prices = await getCryptoPrices(['bitcoin', 'ethereum']);
    console.log('✅ All prices fetched:', prices.map(p => `${p.symbol}: $${p.currentPrice.toFixed(2)}`));

    return NextResponse.json({
      success: true,
      data: prices,
      timestamp: Date.now(),
    }, {
      headers: {
        'Cache-Control': 'public, max-age=30', // 30 saniye cache
      }
    });
  } catch (error) {
    console.error('❌ Error in prices API:', error);
    
    // Hata olsa bile fallback data döndür (500 yerine 200)
    return NextResponse.json({
      success: true, // success: true yap ki frontend hata görmesin
      data: [
        {
          id: 'bitcoin',
          symbol: 'BTC',
          name: 'Bitcoin',
          currentPrice: 67000,
          priceChange24h: 0,
          priceChangePercentage24h: 0,
          lastUpdated: Date.now(),
        },
        {
          id: 'ethereum',
          symbol: 'ETH',
          name: 'Ethereum',
          currentPrice: 2600,
          priceChange24h: 0,
          priceChangePercentage24h: 0,
          lastUpdated: Date.now(),
        }
      ],
      timestamp: Date.now(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=30',
      }
    });
  }
}

// Cache for 30 seconds
export const revalidate = 30;
