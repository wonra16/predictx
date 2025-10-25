// Round (Tur) Yönetimi - Her challenge kendi zaman döngüsünde çalışır
import { getStorageClient } from './simple-storage';

export interface RoundInfo {
  roundId: string;
  roundNumber?: number;
  startTime: number;
  endTime: number;
  timeRemaining: number;
  isActive: boolean;
}

/**
 * Quick Challenge Round (5 dakika)
 * Her 5 dakikada bir otomatik başlar: 00:00, 00:05, 00:10, 00:15...
 */
export function getCurrentQuickRound(): RoundInfo {
  const now = Date.now();
  const FIVE_MINUTES = 5 * 60 * 1000;
  
  // Mevcut 5 dakikalık dilimin başlangıcı
  const roundStart = Math.floor(now / FIVE_MINUTES) * FIVE_MINUTES;
  const roundEnd = roundStart + FIVE_MINUTES;
  
  // Round ID: timestamp-based unique identifier
  const roundId = `quick-${roundStart}`;
  
  // Round number: günün başından itibaren kaçıncı 5dk round
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
 * Big Challenge Round (24 saat)
 * Her gün UTC 00:00'da başlar
 */
export function getCurrentBigRound(): RoundInfo {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  // Bugünün UTC 00:00
  const todayUTC = new Date();
  todayUTC.setUTCHours(0, 0, 0, 0);
  const roundStart = todayUTC.getTime();
  const roundEnd = roundStart + ONE_DAY;
  
  // Round ID: YYYY-MM-DD formatında
  const roundId = `big-${todayUTC.toISOString().split('T')[0]}`;
  
  // Round number: yılın kaçıncı günü
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
 * Belirli bir challenge type için mevcut round'u döndür
 */
export function getCurrentRound(challengeType: 'quick' | 'big'): RoundInfo {
  return challengeType === 'quick' 
    ? getCurrentQuickRound() 
    : getCurrentBigRound();
}

/**
 * Bir round için storage key oluştur
 */
export function getRoundKey(coinId: string, challengeType: 'quick' | 'big', roundId: string): string {
  return `round:${coinId}:${challengeType}:${roundId}`;
}

/**
 * Kullanıcının bu round'a zaten tahmin yapıp yapmadığını kontrol et
 */
export function getUserRoundKey(fid: number, coinId: string, challengeType: 'quick' | 'big', roundId: string): string {
  return `user-round:${fid}:${coinId}:${challengeType}:${roundId}`;
}

/**
 * Kalan süreyi format et
 */
export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  
  if (totalSeconds >= 3600) {
    // 1 saat veya daha fazla
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  } else if (totalSeconds >= 60) {
    // 1 dakika veya daha fazla
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  } else {
    // 1 dakikadan az
    return `${totalSeconds}s`;
  }
}

/**
 * Bir round'un bitip bitmediğini kontrol et
 */
export function isRoundFinished(roundInfo: RoundInfo): boolean {
  return Date.now() >= roundInfo.endTime;
}

/**
 * Geçmiş round ID'yi al (sonuç kontrolü için)
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
