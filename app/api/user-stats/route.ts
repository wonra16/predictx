import { NextRequest, NextResponse } from 'next/server';
import { getUserStats, getUserPredictions, getUserRank } from '@/lib/simple-storage';

export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fidParam = searchParams.get('fid');

    if (!fidParam) {
      return NextResponse.json(
        { success: false, error: 'FID is required' },
        { status: 400 }
      );
    }

    const fid = parseInt(fidParam);

    // Get user stats
    const stats = await getUserStats(fid);
    if (!stats) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user rank
    const rank = await getUserRank(fid);
    stats.rank = rank;

    // Get recent predictions
    const predictions = await getUserPredictions(fid, 10);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        predictions,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cache for 30 seconds
export const revalidate = 30;
