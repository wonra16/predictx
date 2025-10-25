import sdk from '@farcaster/frame-sdk';
import { FarcasterContext } from './types';

let isInitialized = false;
let cachedContext: FarcasterContext | null = null;

export async function initializeFarcaster(): Promise<FarcasterContext | null> {
  // Return cached if already initialized
  if (isInitialized && cachedContext) {
    console.log('✅ Using cached Farcaster context');
    return cachedContext;
  }

  try {
    console.log('🔄 Initializing Farcaster SDK...');
    
    // CRITICAL: Call ready() IMMEDIATELY to hide splash screen
    // Don't wait for context to be available
    try {
      sdk.actions.ready();
      console.log('✅ SDK ready() called successfully');
    } catch (readyError) {
      console.error('⚠️ Failed to call sdk.actions.ready():', readyError);
    }
    
    // Now try to get context (with timeout)
    const context = await Promise.race([
      sdk.context,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
    ]);
    
    if (!context || !context.user) {
      console.warn('⚠️ Farcaster context not available, using anonymous mode');
      return null;
    }

    console.log('✅ Farcaster SDK initialized:', {
      fid: context.user.fid,
      username: context.user.username,
    });

    const farcasterContext = {
      user: {
        fid: context.user.fid,
        username: context.user.username,
        displayName: context.user.displayName,
        pfpUrl: context.user.pfpUrl,
      },
      client: {
        added: false,
      },
    };

    isInitialized = true;
    cachedContext = farcasterContext;

    return farcasterContext;
  } catch (error) {
    console.error('❌ Farcaster initialization error:', error);
    
    // Always try to call ready() to hide splash
    try {
      sdk.actions.ready();
    } catch (readyError) {
      console.error('⚠️ Failed to call sdk.actions.ready():', readyError);
    }
    
    return null;
  }
}

export async function addMiniApp() {
  try {
    await sdk.actions.addFrame();
  } catch (error) {
    console.error('Add mini app error:', error);
  }
}

export function shareToWarpcast(text: string, embedUrl?: string) {
  try {
    const url = new URL('https://warpcast.com/~/compose');
    url.searchParams.set('text', text);
    if (embedUrl) {
      url.searchParams.set('embeds[]', embedUrl);
    }
    window.open(url.toString(), '_blank');
  } catch (error) {
    console.error('Share error:', error);
  }
}

export function getAvatarUrl(pfpUrl: string | undefined, fid: number): string {
  if (pfpUrl && pfpUrl.length > 0) {
    return pfpUrl;
  }
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${fid}`;
}
