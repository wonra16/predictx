// Auto Result Checker Hook
// Automatically polls /api/cron/check-results every 30 seconds
// to resolve pending predictions and update scores

import { useEffect, useRef } from 'react';
import { queryClient } from '@/lib/queryClient';

const CHECK_INTERVAL = 30000; // 30 seconds

export function useAutoResultChecker() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Function to check and resolve pending results
    const checkResults = async () => {
      try {
        const response = await fetch('/api/cron/check-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // If any predictions were processed, invalidate relevant queries
          if (data.success && data.data.processed > 0) {
            console.log(`✅ Auto-resolved ${data.data.processed} predictions`);
            
            // Invalidate all user-related queries to refresh data (use exact: false for prefix matching)
            queryClient.invalidateQueries({ queryKey: ['/api/user/predictions'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['/api/user/active'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['/api/stats'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'], exact: false });
            queryClient.invalidateQueries({ queryKey: ['/api/rank'], exact: false });
          }
        }
      } catch (error) {
        console.error('Auto result checker error:', error);
        // Don't throw - just log and continue polling
      }
    };

    // Initial check after 5 seconds
    const initialTimeout = setTimeout(() => {
      checkResults();
    }, 5000);

    // Set up interval for subsequent checks
    intervalRef.current = setInterval(() => {
      checkResults();
    }, CHECK_INTERVAL);

    // Cleanup on unmount
    return () => {
      if (initialTimeout) clearTimeout(initialTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}
