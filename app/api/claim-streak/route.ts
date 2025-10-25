import { NextResponse } from 'next/server';
import { getUserStats, initializeUserStats, updateUserStats } from '@/lib/simple-storage';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fid, username, displayName, pfpUrl, streakDays, rewardPoints } = body;

    if (!fid || !streakDays || !rewardPoints) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('📅 Claiming daily streak:', { fid, streakDays, rewardPoints });

    // Get or create user stats
    let stats = await getUserStats(fid);
    if (!stats) {
      console.log('👤 Creating new user stats');
      stats = await initializeUserStats(fid, username, displayName, pfpUrl);
    }

    // Update stats with streak reward
    stats.totalScore += rewardPoints;
    stats.currentStreak = streakDays;
    
    if (streakDays > stats.longestStreak) {
      stats.longestStreak = streakDays;
    }

    // Save updated stats
    const updated = await updateUserStats(stats);
    if (!updated) {
      console.error('❌ Failed to update user stats');
      return NextResponse.json(
        { success: false, error: 'Failed to update stats' },
        { status: 500 }
      );
    }

    console.log('✅ Streak claimed successfully:', { 
      totalScore: stats.totalScore, 
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak 
    });

    return NextResponse.json({
      success: true,
      data: {
        totalScore: stats.totalScore,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
      },
      message: 'Streak reward claimed successfully',
    });
  } catch (error) {
    console.error('❌ Claim streak error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
