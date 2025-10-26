// Farcaster SDK Integration (client-side only)
// This file contains types and helpers for server-side Farcaster operations

import { FarcasterContext } from '@shared/schema';

// Farcaster user validation using Neynar API
export async function validateFarcasterUser(fid: number): Promise<boolean> {
  try {
    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
    if (!NEYNAR_API_KEY) {
      console.warn('⚠️ NEYNAR_API_KEY not configured');
      return true; // Allow in development
    }

    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY,
      },
    });

    if (!response.ok) {
      console.error('❌ Neynar API error:', response.status);
      return true; // Allow on API error
    }

    const data = await response.json();
    return data.users && data.users.length > 0;
  } catch (error) {
    console.error('❌ Farcaster validation error:', error);
    return true; // Allow on error
  }
}

// Get Farcaster user details from Neynar
export async function getFarcasterUserDetails(fid: number): Promise<{
  username: string;
  displayName: string;
  pfpUrl: string;
} | null> {
  try {
    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
    if (!NEYNAR_API_KEY) {
      console.warn('⚠️ NEYNAR_API_KEY not configured');
      return {
        username: `user${fid}`,
        displayName: `User ${fid}`,
        pfpUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${fid}`,
      };
    }

    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.users && data.users.length > 0) {
      const user = data.users[0];
      return {
        username: user.username || `user${fid}`,
        displayName: user.display_name || user.username || `User ${fid}`,
        pfpUrl: user.pfp_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${fid}`,
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Error fetching Farcaster user:', error);
    return {
      username: `user${fid}`,
      displayName: `User ${fid}`,
      pfpUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${fid}`,
    };
  }
}

// Helper to get avatar URL
export function getAvatarUrl(pfpUrl: string | undefined, fid: number): string {
  if (pfpUrl && pfpUrl.length > 0) {
    return pfpUrl;
  }
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${fid}`;
}

// Create share text for Warpcast
export function createShareText(
  coinSymbol: string,
  direction: 'up' | 'down',
  challengeType: 'quick' | 'big',
  score?: number
): string {
  const emoji = direction === 'up' ? '📈' : '📉';
  const challenge = challengeType === 'quick' ? '5min' : '24h';
  
  if (score && score > 0) {
    return `I predicted ${coinSymbol} ${emoji} ${direction.toUpperCase()} in ${challenge} and won ${score} points on PredictX! 🎯`;
  }
  
  return `I just predicted ${coinSymbol} ${emoji} ${direction.toUpperCase()} in ${challenge} on PredictX! 🔮`;
}

// Validate Farcaster Frame message using Neynar API
export async function validateFrameMessage(frameMessage: any): Promise<{
  isValid: boolean;
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  error?: string;
}> {
  try {
    const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
    if (!NEYNAR_API_KEY) {
      console.warn('⚠️ NEYNAR_API_KEY not configured - Frame validation disabled');
      // In development, allow with mock data
      return {
        isValid: true,
        fid: frameMessage?.untrustedData?.fid,
        username: `user${frameMessage?.untrustedData?.fid}`,
        displayName: `User ${frameMessage?.untrustedData?.fid}`,
        pfpUrl: '',
      };
    }

    // Validate Frame signature with Neynar
    const response = await fetch('https://api.neynar.com/v2/farcaster/frame/validate', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api_key': NEYNAR_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        message_bytes_in_hex: frameMessage?.trustedData?.messageBytes,
      }),
    });

    if (!response.ok) {
      console.error('❌ Neynar Frame validation error:', response.status);
      return {
        isValid: false,
        error: 'Frame validation failed',
      };
    }

    const data = await response.json();
    
    if (!data.valid) {
      return {
        isValid: false,
        error: 'Invalid frame signature',
      };
    }

    // Extract validated user data
    const action = data.action;
    const interactor = action?.interactor;
    
    return {
      isValid: true,
      fid: interactor?.fid,
      username: interactor?.username,
      displayName: interactor?.display_name || interactor?.username,
      pfpUrl: interactor?.pfp_url,
    };
  } catch (error) {
    console.error('❌ Frame validation error:', error);
    return {
      isValid: false,
      error: 'Validation failed',
    };
  }
}
