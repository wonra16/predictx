// Round Management - Each challenge runs in its own time cycle

export interface RoundInfo {
  roundId: string;
  roundNumber?: number;
  startTime: number;
  endTime: number;
  timeRemaining: number;
  isActive: boolean;
}

/**
 * Quick Challenge Round (5 minutes)
 * Auto-starts every 5 minutes: 00:00, 00:05, 00:10, 00:15...
 */
export function getCurrentQuickRound(): RoundInfo {
  const now = Date.now();
  const FIVE_MINUTES = 5 * 60 * 1000;
  
  // Start of current 5-minute slot
  const roundStart = Math.floor(now / FIVE_MINUTES) * FIVE_MINUTES;
  const roundEnd = roundStart + FIVE_MINUTES;
  
  // Round ID: timestamp-based unique identifier
  const roundId = `quick-${roundStart}`;
  
  // Round number: how many 5min rounds since start of day
  const todayStart = new Date(now).setHours(0, 0, 0, 0);
  const roundNumber = Math.floor((roundStart - todayStart) / FIVE_MINUTES) + 1;
  
  return {
    roundId,
    roundNumber,
    startTime: roundStart,
    endTime: roundEnd,
    timeRemaining: roundEnd - now,
    isActive: now < roundEnd,
  };
}

/**
 * Big Challenge Round (24 hours)
 * Starts every day at UTC 00:00
 */
export function getCurrentBigRound(): RoundInfo {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  // Today's UTC 00:00
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);
  const roundStart = todayUTC.getTime();
  const roundEnd = roundStart + ONE_DAY;
  
  // Round ID: YYYY-MM-DD format
  const roundId = `big-${todayUTC.toISOString().split('T')[0]}`;
  
  // Round number: day of year
  const yearStart = new Date(todayUTC.getFullYear(), 0, 1).getTime();
  const roundNumber = Math.floor((roundStart - yearStart) / ONE_DAY) + 1;
  
  return {
    roundId,
    roundNumber,
    startTime: roundStart,
    endTime: roundEnd,
    timeRemaining: roundEnd - now,
    isActive: now < roundEnd,
  };
}

/**
 * Get current round for specific challenge type
 */
export function getCurrentRound(challengeType: 'quick' | 'big'): RoundInfo {
  return challengeType === 'quick' 
    ? getCurrentQuickRound() 
    : getCurrentBigRound();
}

/**
 * Create storage key for a round
 */
export function getRoundKey(coinId: string, challengeType: 'quick' | 'big', roundId: string): string {
  return `round:${coinId}:${challengeType}:${roundId}`;
}

/**
 * Create user-specific round key
 */
export function getUserRoundKey(fid: number, coinId: string, challengeType: 'quick' | 'big', roundId: string): string {
  return `user-round:${fid}:${coinId}:${challengeType}:${roundId}`;
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  
  if (totalSeconds >= 3600) {
    // 1 hour or more
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  } else if (totalSeconds >= 60) {
    // 1 minute or more
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  } else {
    // Less than 1 minute
    return `${totalSeconds}s`;
  }
}

/**
 * Check if round is finished
 */
export function isRoundFinished(roundInfo: RoundInfo): boolean {
  return Date.now() >= roundInfo.endTime;
}

/**
 * Get previous round ID (for result checking)
 */
export function getPreviousRoundId(challengeType: 'quick' | 'big'): string {
  if (challengeType === 'quick') {
    const FIVE_MINUTES = 5 * 60 * 1000;
    const now = Date.now();
    const previousRoundStart = Math.floor(now / FIVE_MINUTES) * FIVE_MINUTES - FIVE_MINUTES;
    return `quick-${previousRoundStart}`;
  } else {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(0, 0, 0, 0);
    return `big-${yesterday.toISOString().split('T')[0]}`;
  }
}

/**
 * Check if Quick Challenge betting is locked (last 1 minute)
 * Lockout: final 60 seconds of each 5-minute round
 */
export function isQuickChallengeLocked(): boolean {
  const roundInfo = getCurrentQuickRound();
  const timeRemaining = roundInfo.timeRemaining;
  // Lockout window: last 60 seconds (1 minute)
  return timeRemaining <= 60 * 1000;
}

/**
 * Check if Big Challenge betting is locked (UTC 22:00-00:00)
 * New bets open at 00:00:01, close at 22:00, results at 00:00
 * Lockout window: 22:00-midnight (2 hours before round closes)
 */
export function isBigChallengeLocked(): boolean {
  const now = new Date();
  const utcHour = now.getUTCHours();
  // Lockout window: 22:00-midnight (can't bet during last 2 hours)
  return utcHour >= 22; // 22:00-23:59
}
