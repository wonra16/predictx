// Round Counter Component - Shows current round number and time remaining
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Zap, Crown } from 'lucide-react';
import type { ChallengeType, ApiResponse } from '@shared/schema';

// Round info structure from backend
interface RoundInfo {
  roundId: string;
  roundNumber?: number;
  startTime: number;
  endTime: number;
  timeRemaining: number;
  isActive: boolean;
}

interface Props {
  challengeType: ChallengeType;
}

export function RoundCounter({ challengeType }: Props) {
  const [timeLeft, setTimeLeft] = useState('');
  
  // Fetch current round info
  const { data } = useQuery<ApiResponse<RoundInfo>>({
    queryKey: ['/api/round', challengeType],
    refetchInterval: 1000, // Update every second for live countdown
  });
  
  const roundInfo = data?.data;
  
  // Calculate time remaining
  useEffect(() => {
    if (!roundInfo) return;
    
    const updateTime = () => {
      const now = Date.now();
      const remaining = roundInfo.endTime - now;
      
      if (remaining <= 0) {
        setTimeLeft('Round Ended');
        return;
      }
      
      const totalSeconds = Math.floor(remaining / 1000);
      
      if (challengeType === 'quick') {
        // For 5-minute rounds, show mm:ss
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        // For 24-hour rounds, show hh:mm:ss
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, [roundInfo, challengeType]);
  
  if (!roundInfo) {
    return null;
  }
  
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-border/40">
      <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center">
        {challengeType === 'quick' ? (
          <Zap className="w-6 h-6 text-cyan-400" />
        ) : (
          <Crown className="w-6 h-6 text-purple-400" />
        )}
      </div>
      
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">
          {challengeType === 'quick' ? 'Quick Round' : 'Big Round'} #{roundInfo.roundNumber || 'N/A'}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <p className="text-lg font-bold font-mono" data-testid="text-round-timer">
            {timeLeft}
          </p>
        </div>
      </div>
      
      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
        roundInfo.isActive 
          ? 'bg-success/20 text-success' 
          : 'bg-muted/50 text-muted-foreground'
      }`}>
        {roundInfo.isActive ? 'LIVE' : 'ENDED'}
      </div>
    </div>
  );
}
