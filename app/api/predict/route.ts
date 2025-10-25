import { NextResponse } from 'next/server';
import { savePrediction, getUserStats, initializeUserStats, getUserPredictions, getStorageClient } from '@/lib/simple-storage';
import { getCurrentPrice } from '@/lib/binance';
import { Prediction, CryptoId, ChallengeType } from '@/lib/types';
import { CHALLENGE_DURATIONS } from '@/lib/scoring';
import { getCurrentRound, getUserRoundKey } from '@/lib/rounds';

export const dynamic = 'force-dynamic';

// GET: Fetch user predictions
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json(
        { success: false, error: 'FID is required' },
        { status: 400 }
      );
    }

    console.log('📊 Fetching predictions for FID:', fid);

    // Get user predictions
    const predictions = await getUserPredictions(parseInt(fid), 10);
    console.log('✅ Found predictions:', predictions?.length || 0);

    // Find active prediction - pending ve henüz expire olmamış
    const now = Date.now();
    const activePrediction = predictions?.find(
      p => p.status === 'pending' && p.expiresAt > now
    ) || null;
    
    if (activePrediction) {
      console.log('⏳ Active prediction:', activePrediction.id, 'expires in', Math.floor((activePrediction.expiresAt - now) / 1000), 'seconds');
    }

    return NextResponse.json({
      success: true,
      data: predictions || [],
      activePrediction,
    });
  } catch (error) {
    console.error('❌ GET predictions error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch predictions', data: [] },
      { status: 500 }
    );
  }
}

// POST: Create new prediction
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      fid, 
      username, 
      displayName, 
      pfpUrl, 
      cryptoId,
      coinId,
      challengeType,
      direction,
      predictedPrice,
      startPrice // Kullanıcının butona bastığı andaki fiyat
    } = body;

    const actualCoinId = (cryptoId || coinId) as CryptoId;

    console.log('📥 Received prediction request:', { 
      fid, 
      coinId: actualCoinId, 
      challengeType, 
      direction,
      startPrice,
      hasPredictedPrice: !!predictedPrice 
    });

    if (!fid || !actualCoinId || !challengeType || !direction || !startPrice) {
      console.error('❌ Missing required fields:', { fid, coinId: actualCoinId, challengeType, direction, startPrice });
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Mevcut round'u al
    const currentRound = getCurrentRound(challengeType as ChallengeType);
    console.log('🔄 Current round:', currentRound.roundId, 'isActive:', currentRound.isActive);
    
    // Round bitti mi kontrol et
    if (!currentRound.isActive) {
      console.warn('⏰ Round has ended');
      return NextResponse.json(
        { success: false, error: 'Current round has ended. Please wait for the next round.' },
        { status: 400 }
      );
    }

    // Kullanıcı bu round'a zaten tahmin yaptı mı?
    const storage = await getStorageClient();
    const userRoundKey = getUserRoundKey(fid, actualCoinId, challengeType as ChallengeType, currentRound.roundId);
    const alreadyPredicted = await storage.get(userRoundKey);
    
    if (alreadyPredicted) {
      console.warn('⚠️ User already predicted in this round');
      return NextResponse.json(
        { 
          success: false, 
          error: `You already predicted in this ${challengeType} round. Wait for the next round!`,
          timeRemaining: currentRound.timeRemaining
        },
        { status: 400 }
      );
    }

    // Get or create user stats
    let stats = await getUserStats(fid);
    if (!stats) {
      console.log('👤 Creating new user stats');
      stats = await initializeUserStats(fid, username, displayName, pfpUrl);
    }

    console.log('✅ Using startPrice from client:', startPrice);

    // Create prediction with user's button-click price
    const timestamp = Date.now();

    const prediction: Prediction = {
      id: `${fid}-${timestamp}`,
      fid,
      cryptoId: actualCoinId,
      coinId: actualCoinId,
      challengeType: challengeType as ChallengeType,
      direction: direction as 'up' | 'down',
      predictedPrice: predictedPrice ? parseFloat(predictedPrice) : undefined,
      startPrice: parseFloat(startPrice), // Kullanıcının butona bastığı andaki fiyat
      currentPrice: parseFloat(startPrice), // Backward compatibility
      timestamp,
      expiresAt: currentRound.endTime,
      status: 'pending',
    };

    console.log('💾 Saving prediction:', prediction.id);

    // Save prediction
    const saved = await savePrediction(prediction);
    if (!saved) {
      console.error('❌ Failed to save prediction to Redis');
      return NextResponse.json(
        { success: false, error: 'Failed to save prediction' },
        { status: 500 }
      );
    }

    // Bu kullanıcının bu round'a tahmin yaptığını işaretle
    await storage.set(userRoundKey, 'true', Math.ceil(currentRound.timeRemaining / 1000));

    console.log('✅ Prediction saved successfully for round:', currentRound.roundId);

    return NextResponse.json({
      success: true,
      data: prediction,
      roundInfo: currentRound,
      message: 'Prediction saved successfully',
    });
  } catch (error) {
    console.error('❌ Prediction error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
