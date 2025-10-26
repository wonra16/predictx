import sdk from "@farcaster/frame-sdk";

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
}

let cachedUser: FarcasterUser | null = null;

// Share/Add mini app to favorites
export async function addMiniAppToFavorites(): Promise<boolean> {
  try {
    const result: any = await sdk.actions.addMiniApp();
    if (result?.added === true) {
      console.log('✅ Mini app added to favorites!', result);
      return true;
    } else {
      console.log('❌ User rejected or error:', result?.reason || 'unknown');
      return false;
    }
  } catch (error) {
    console.error('Failed to add mini app:', error);
    return false;
  }
}

// Open external URL (for sharing)
export async function openExternalUrl(url: string): Promise<void> {
  try {
    await sdk.actions.openUrl(url);
  } catch (error) {
    console.error('Failed to open URL:', error);
    window.open(url, '_blank');
  }
}

// Close mini app
export async function closeMiniApp(): Promise<void> {
  try {
    await sdk.actions.close();
  } catch (error) {
    console.error('Failed to close mini app:', error);
  }
}

export async function initializeFarcaster(): Promise<FarcasterUser | null> {
  // Return cached user if available
  if (cachedUser) {
    return cachedUser;
  }

  try {
    // Wait for SDK to be ready with timeout
    const timeoutPromise = new Promise<null>((resolve) => 
      setTimeout(() => resolve(null), 2000)
    );

    const contextPromise = new Promise<FarcasterUser | null>(async (resolve) => {
      try {
        const context = await sdk.context;
        
        if (context?.user) {
          const user: FarcasterUser = {
            fid: context.user.fid,
            username: context.user.username || `user${context.user.fid}`,
            displayName: context.user.displayName || context.user.username || `User ${context.user.fid}`,
            pfpUrl: context.user.pfpUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${context.user.fid}`
          };
          
          cachedUser = user;
          resolve(user);
        } else {
          resolve(null);
        }
      } catch (error) {
        console.error('Failed to get Farcaster context:', error);
        resolve(null);
      }
    });

    const result = await Promise.race([contextPromise, timeoutPromise]);
    return result;
  } catch (error) {
    console.error('Farcaster initialization error:', error);
    return null;
  }
}

export function getMockUser(): FarcasterUser {
  return {
    fid: 12345,
    username: "demo_user",
    displayName: "Demo User",
    pfpUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=12345"
  };
}

export async function getCurrentUser(): Promise<FarcasterUser> {
  const user = await initializeFarcaster();
  return user || getMockUser();
}
