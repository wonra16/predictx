import { NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/simple-storage';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'total') as 'total' | 'quick' | 'big';
    
    const entries = await getLeaderboard(type, 100);

    return NextResponse.json({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
