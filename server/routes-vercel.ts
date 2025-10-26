import type { Express } from "express";
import { storage } from "./storage";
import { getCryptoPrices, getSingleCryptoPrice, getCurrentPrice } from "./lib/okx-rest";
import { getCurrentRound, formatTimeRemaining, isBigChallengeLocked, isQuickChallengeLocked } from "./lib/rounds";
import { calculateTotalScore, isDirectionCorrect } from "./lib/scoring";
import { checkForNewBadges } from "./lib/game-logic";
import { getFarcasterUserDetails, validateFrameMessage } from "./lib/farcaster";
import { generateFrameHtml, getFrameImageUrl } from "./lib/frame-helper";
import type { CryptoId, ChallengeType, ApiResponse } from "@shared/schema";

export function registerRoutes(app: Express): void {
  
  // ============= FARCASTER v2 MINI APP MANIFEST =============
  
  // Serve Farcaster v2 Mini App Manifest
  app.get("/.well-known/farcaster.json", (req, res) => {
    // Use production URL if deployed, otherwise dev URL
    const baseUrl = process.env.REPLIT_DEPLOYMENT === '1' 
      ? 'https://PredictX.replit.app'
      : `https://${process.env.REPLIT_DEV_DOMAIN || 'PredictX.replit.app'}`;
    
    const manifest = {
      // Verified domain ownership via Farcaster auth signature (FID: 339972)
      accountAssociation: {
        header: "eyJmaWQiOjMzOTk3MiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDIxMUNGMzAwNjFDNTIyZDc0MjgzOGQzODc2ZEY2NTk3NzExQ0NCRTMifQ",
        payload: "eyJkb21haW4iOiJQcmVkaWN0WC5yZXBsaXQuYXBwIn0",
        signature: "ky/Ncur7GZUx5d7celadP7xexn0Sl3pKRCJhH2Seb4YNQ6pOmL+ZrDYkXisPTHIDJ56HXE/63UERtk5zIB4V5Bw="
      },
      frame: {
        version: "1",
        name: "PredictX",
        iconUrl: `${baseUrl}/api/icon`,
        homeUrl: baseUrl,
        imageUrl: `${baseUrl}/api/og-embed`,
        splashImageUrl: `${baseUrl}/api/splash`,
        splashBackgroundColor: "#0a0e1a",
        webhookUrl: `${baseUrl}/api/webhook`
      }
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.json(manifest);
  });
  
  // ============= PRICES API =============
  
  // Get all crypto prices
  app.get("/api/prices", async (req, res) => {
    try {
      const prices = await getCryptoPrices(['bitcoin', 'ethereum']);
      res.json({
        success: true,
        data: prices,
      });
    } catch (error) {
      console.error('Prices API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch prices',
      });
    }
  });
  
  // Get single crypto price
  app.get("/api/prices/:coinId", async (req, res) => {
    try {
      const coinId = req.params.coinId as CryptoId;
      const price = await getSingleCryptoPrice(coinId);
      
      if (!price) {
        return res.status(404).json({
          success: false,
          error: 'Coin not found',
        });
      }
      
      res.json({
        success: true,
        data: price,
      });
    } catch (error) {
      console.error('Single price API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch price',
      });
    }
  });
  
  // ============= PREDICTION API =============
  
  // Submit a new prediction
  app.post("/api/predict", async (req, res) => {
    try {
      const {
        fid,
        username,
        displayName,
        pfpUrl,
        coinId,
        cryptoId, // Alias support
        direction,
        challengeType,
        startPrice,
        exactPrice,
        roundId,
        roundStartTime,
        roundEndTime,
      } = req.body;
      
      const actualCoinId = coinId || cryptoId;
      
      // Validate required fields
      if (!fid || !actualCoinId || !direction || !challengeType || !startPrice) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
        });
      }
      
      // Check Quick Challenge lockout (last 1 minute)
      if (challengeType === 'quick' && isQuickChallengeLocked()) {
        return res.status(400).json({
          success: false,
          error: 'Quick Challenge betting closes in the last 60 seconds. Please wait for the next round!',
        });
      }
      
      // Check Big Challenge lockout (UTC 22:00-00:00)
      if (challengeType === 'big' && isBigChallengeLocked()) {
        return res.status(400).json({
          success: false,
          error: 'Big Challenge betting is locked between UTC 22:00-00:00. New round opens at 00:00:01.',
        });
      }
      
      // Get current round info
      const roundInfo = getCurrentRound(challengeType as ChallengeType);
      
      // Check round-based bet restriction
      const existingBetInRound = await storage.getPredictionInRound(fid, roundInfo.roundId);
      
      if (existingBetInRound) {
        if (challengeType === 'big') {
          // Big Challenge: 1 bet per day, cannot change
          return res.status(400).json({
            success: false,
            error: 'You can only make ONE bet per day on Big Challenge. Once placed, your prediction cannot be changed.',
          });
        } else {
          // Quick Challenge: This shouldn't happen in same round, but just in case
          return res.status(400).json({
            success: false,
            error: 'You already have a bet in this round. Please wait for the next round.',
          });
        }
      }
      
      // Get or create user stats
      let stats = await storage.getUserStats(fid);
      if (!stats) {
        stats = await storage.initializeUserStats(
          fid,
          username || `user${fid}`,
          displayName || `User ${fid}`,
          pfpUrl || ''
        );
      }
      
      // Create prediction
      const now = Date.now();
      const prediction = await storage.savePrediction({
        fid,
        coinId: actualCoinId,
        challengeType: challengeType as ChallengeType,
        direction,
        startPrice,
        currentPrice: startPrice,
        predictedPrice: exactPrice || null,
        timestamp: now,
        expiresAt: roundInfo.endTime,
        status: 'pending',
        roundId: roundId || roundInfo.roundId,
        roundStartTime: roundStartTime || roundInfo.startTime,
        roundEndTime: roundEndTime || roundInfo.endTime,
      });
      
      // Update user stats - increment pending
      await storage.updateUserStats({
        ...stats,
        badges: stats.badges as any, // Cast jsonb type
        pendingPredictions: stats.pendingPredictions + 1,
      });
      
      res.json({
        success: true,
        data: prediction,
        message: 'Prediction submitted successfully',
      });
    } catch (error) {
      console.error('Predict API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit prediction',
      });
    }
  });
  
  // Get user's predictions
  app.get("/api/user/predictions/:fid", async (req, res) => {
    try {
      const fid = parseInt(req.params.fid);
      const limit = parseInt(req.query.limit as string) || 10;
      
      const predictions = await storage.getUserPredictions(fid, limit);
      
      res.json({
        success: true,
        data: predictions,
      });
    } catch (error) {
      console.error('User predictions API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch predictions',
      });
    }
  });
  
  // Get active prediction
  app.get("/api/user/active/:fid", async (req, res) => {
    try {
      const fid = parseInt(req.params.fid);
      const prediction = await storage.getActivePrediction(fid);
      
      res.json({
        success: true,
        data: prediction,
      });
    } catch (error) {
      console.error('Active prediction API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active prediction',
      });
    }
  });
  
  // ============= STATS API =============
  
  // Get user stats
  app.get("/api/stats/:fid", async (req, res) => {
    try {
      const fid = parseInt(req.params.fid);
      let stats = await storage.getUserStats(fid);
      
      if (!stats) {
        // Return empty stats for new users
        return res.json({
          success: true,
          data: null,
        });
      }
      
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Stats API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch stats',
      });
    }
  });
  
  // Claim daily reward
  app.post("/api/daily-reward/claim", async (req, res) => {
    try {
      const fid = parseInt(req.body.fid);
      
      if (!fid) {
        return res.status(400).json({
          success: false,
          error: 'FID is required',
        });
      }
      
      const result = await storage.claimDailyReward(fid);
      
      if (result.alreadyClaimed) {
        return res.json({
          success: false,
          message: 'Daily reward already claimed today',
          data: result,
        });
      }
      
      res.json({
        success: result.success,
        data: result,
      });
    } catch (error) {
      console.error('Daily reward claim error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to claim daily reward',
      });
    }
  });
  
  // ============= LEADERBOARD API =============
  
  // Get leaderboard
  app.get("/api/leaderboard/:type?", async (req, res) => {
    try {
      const type = (req.params.type || req.query.type || 'total') as 'total' | 'quick' | 'big';
      const limit = parseInt(req.query.limit as string) || 100;
      
      const leaderboard = await storage.getLeaderboard(type, limit);
      
      res.json({
        success: true,
        data: leaderboard,
      });
    } catch (error) {
      console.error('Leaderboard API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch leaderboard',
      });
    }
  });
  
  // Get user rank
  app.get("/api/rank/:fid", async (req, res) => {
    try {
      const fid = parseInt(req.params.fid);
      const rank = await storage.getUserRank(fid);
      
      res.json({
        success: true,
        data: { rank },
      });
    } catch (error) {
      console.error('Rank API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch rank',
      });
    }
  });
  
  // ============= ROUND INFO API =============
  
  // Get current round info
  app.get("/api/round/:challengeType", async (req, res) => {
    try {
      const challengeType = req.params.challengeType as 'quick' | 'big';
      const roundInfo = getCurrentRound(challengeType);
      
      res.json({
        success: true,
        data: {
          ...roundInfo,
          timeRemainingFormatted: formatTimeRemaining(roundInfo.timeRemaining),
        },
      });
    } catch (error) {
      console.error('Round info API error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch round info',
      });
    }
  });
  
  // ============= CRON / BACKGROUND JOBS =============
  
  // Check and resolve pending predictions
  app.post("/api/cron/check-results", async (req, res) => {
    try {
      const pendingPredictions = await storage.getPendingResults(50);
      const results = [];
      
      for (const prediction of pendingPredictions) {
        try {
          // Get current price for this coin
          const currentPrice = await getSingleCryptoPrice(prediction.coinId as CryptoId);
          if (!currentPrice) {
            console.error(`Cannot get price for ${prediction.coinId}`);
            continue;
          }
          
          // Get user stats
          const stats = await storage.getUserStats(prediction.fid);
          if (!stats) {
            console.error(`Cannot find stats for fid ${prediction.fid}`);
            continue;
          }
          
          // Calculate score
          const scoreResult = calculateTotalScore(
            prediction,
            currentPrice.currentPrice,
            stats.currentStreak
          );
          
          // Update prediction with result
          const updatedPrediction = await storage.updatePrediction(prediction.id, {
            status: scoreResult.isWin ? 'won' : 'lost',
            endPrice: currentPrice.currentPrice,
            targetPrice: currentPrice.currentPrice,
            score: scoreResult.totalScore,
            earnedPoints: scoreResult.totalScore,
            streakBonus: scoreResult.streakBonus,
          });
          
          // Update user stats
          const newStats = {
            ...stats,
            pendingPredictions: stats.pendingPredictions - 1,
            totalPredictions: stats.totalPredictions + 1,
          };
          
          if (scoreResult.isWin) {
            newStats.wonPredictions = stats.wonPredictions + 1;
            newStats.currentStreak = stats.currentStreak + 1;
            newStats.longestStreak = Math.max(newStats.currentStreak, stats.longestStreak);
            newStats.totalScore = stats.totalScore + scoreResult.totalScore;
            
            if (prediction.challengeType === 'quick') {
              newStats.quickPredictions = stats.quickPredictions + 1;
              newStats.quickScore = stats.quickScore + scoreResult.totalScore;
            } else {
              newStats.bigPredictions = stats.bigPredictions + 1;
              newStats.bigScore = stats.bigScore + scoreResult.totalScore;
            }
          } else {
            newStats.lostPredictions = stats.lostPredictions + 1;
            newStats.currentStreak = 0;
          }
          
          newStats.winRate = (newStats.wonPredictions / newStats.totalPredictions) * 100;
          
          // Check for new badges
          const newBadges = checkForNewBadges(newStats);
          if (newBadges.length > 0) {
            const existingBadges = Array.isArray(newStats.badges) ? newStats.badges : [];
            newStats.badges = [...existingBadges, ...newBadges] as any;
          }
          
          await storage.updateUserStats({
            ...newStats,
            badges: newStats.badges as any, // Cast jsonb type
          });
          
          results.push({
            predictionId: prediction.id,
            fid: prediction.fid,
            isWin: scoreResult.isWin,
            score: scoreResult.totalScore,
          });
        } catch (error) {
          console.error(`Error processing prediction ${prediction.id}:`, error);
        }
      }
      
      res.json({
        success: true,
        data: {
          processed: results.length,
          results,
        },
      });
    } catch (error) {
      console.error('Check results cron error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check results',
      });
    }
  });

  // ============= FARCASTER FRAME API =============
  
  // Frame action handler - receives button clicks from Farcaster
  app.post("/api/frame-action", async (req, res) => {
    try {
      const frameMessage = req.body;
      
      // Validate Frame message signature
      const validation = await validateFrameMessage(frameMessage);
      
      if (!validation.isValid || !validation.fid) {
        // Return 200 with error frame (Farcaster expects 200)
        return res.status(200).send(generateFrameHtml({
          image: getFrameImageUrl(getBaseUrl(req), { result: 'error' }),
          buttons: [
            { label: '🔶 Predict BTC', action: 'post' },
            { label: '💎 Predict ETH', action: 'post' },
          ],
          postUrl: `${getBaseUrl(req)}/api/frame-action`,
          title: 'PredictX - Error',
          description: validation.error || 'Invalid frame message',
        }));
      }

      const fid = validation.fid;
      const buttonIndex = frameMessage?.untrustedData?.buttonIndex;
      
      // Handle different button actions
      switch (buttonIndex) {
        case 1: // Predict BTC
          return res.status(200).send(generateFrameHtml({
            image: getFrameImageUrl(getBaseUrl(req), { action: 'btc', fid }),
            buttons: [
              { label: '📈 UP (5min)', action: 'post' },
              { label: '📉 DOWN (5min)', action: 'post' },
              { label: '📈 UP (24h)', action: 'post' },
              { label: '📉 DOWN (24h)', action: 'post' },
            ],
            postUrl: `${getBaseUrl(req)}/api/frame-predict`,
            state: { coinId: 'bitcoin', fid },
            title: 'PredictX - Bitcoin Prediction',
            description: 'Predict Bitcoin price movement',
          }));

        case 2: // Predict ETH
          return res.status(200).send(generateFrameHtml({
            image: getFrameImageUrl(getBaseUrl(req), { action: 'eth', fid }),
            buttons: [
              { label: '📈 UP (5min)', action: 'post' },
              { label: '📉 DOWN (5min)', action: 'post' },
              { label: '📈 UP (24h)', action: 'post' },
              { label: '📉 DOWN (24h)', action: 'post' },
            ],
            postUrl: `${getBaseUrl(req)}/api/frame-predict`,
            state: { coinId: 'ethereum', fid },
            title: 'PredictX - Ethereum Prediction',
            description: 'Predict Ethereum price movement',
          }));

        case 4: // My Stats
          const stats = await storage.getUserStats(fid);
          return res.status(200).send(generateFrameHtml({
            image: getFrameImageUrl(getBaseUrl(req), { action: 'stats', fid }),
            buttons: [
              { label: '🔶 Predict BTC', action: 'post' },
              { label: '💎 Predict ETH', action: 'post' },
              { label: '🏆 Leaderboard', action: 'link', target: `${getBaseUrl(req)}/leaderboard` },
            ],
            postUrl: `${getBaseUrl(req)}/api/frame-action`,
            title: `${validation.displayName || 'User'}'s Stats`,
            description: `Score: ${stats?.totalScore || 0} | Streak: ${stats?.currentStreak || 0}`,
          }));

        default:
          // Default home frame
          return res.status(200).send(generateFrameHtml({
            image: getFrameImageUrl(getBaseUrl(req), {}),
            buttons: [
              { label: '🔶 Predict BTC', action: 'post' },
              { label: '💎 Predict ETH', action: 'post' },
              { label: '🏆 Leaderboard', action: 'link', target: `${getBaseUrl(req)}/leaderboard` },
              { label: '📊 My Stats', action: 'post' },
            ],
            postUrl: `${getBaseUrl(req)}/api/frame-action`,
          }));
      }
    } catch (error) {
      console.error('Frame action error:', error);
      res.status(200).send(generateFrameHtml({
        image: getFrameImageUrl(getBaseUrl(req), { result: 'error' }),
        buttons: [
          { label: '🔙 Try Again', action: 'post' },
        ],
        postUrl: `${getBaseUrl(req)}/api/frame-action`,
        title: 'PredictX - Error',
        description: 'Something went wrong',
      }));
    }
  });

  // Frame prediction submission
  app.post("/api/frame-predict", async (req, res) => {
    try {
      const frameMessage = req.body;
      
      // Validate Frame message
      const validation = await validateFrameMessage(frameMessage);
      
      if (!validation.isValid || !validation.fid) {
        return res.status(200).send(generateFrameHtml({
          image: getFrameImageUrl(getBaseUrl(req), { result: 'error' }),
          buttons: [
            { label: '🔙 Back to Home', action: 'post' },
          ],
          postUrl: `${getBaseUrl(req)}/api/frame-action`,
          title: 'PredictX - Error',
          description: validation.error || 'Invalid frame message',
        }));
      }

      const fid = validation.fid;
      const buttonIndex = frameMessage?.untrustedData?.buttonIndex;
      
      // Decode base64 state
      const stateBase64 = frameMessage?.untrustedData?.state;
      let state: any = {};
      if (stateBase64) {
        try {
          const stateJson = Buffer.from(stateBase64, 'base64').toString('utf-8');
          state = JSON.parse(stateJson);
        } catch (e) {
          console.error('Failed to decode state:', e);
        }
      }
      
      if (!buttonIndex || !state.coinId) {
        return res.status(200).send(generateFrameHtml({
          image: getFrameImageUrl(getBaseUrl(req), { result: 'error' }),
          buttons: [
            { label: '🔙 Back to Home', action: 'post' },
          ],
          postUrl: `${getBaseUrl(req)}/api/frame-action`,
          title: 'PredictX - Error',
          description: 'Invalid prediction data',
        }));
      }

      // Determine direction and challenge type from button index
      const direction = (buttonIndex === 1 || buttonIndex === 3) ? 'up' : 'down';
      const challengeType = (buttonIndex === 1 || buttonIndex === 2) ? 'quick' : 'big';
      
      // Get current price
      const price = await getSingleCryptoPrice(state.coinId);
      if (!price) {
        return res.status(200).send(generateFrameHtml({
          image: getFrameImageUrl(getBaseUrl(req), { result: 'error' }),
          buttons: [
            { label: '🔙 Back to Home', action: 'post' },
          ],
          postUrl: `${getBaseUrl(req)}/api/frame-action`,
          title: 'PredictX - Error',
          description: 'Price not available',
        }));
      }

      // Check for active prediction
      const activePrediction = await storage.getActivePrediction(fid);
      if (activePrediction) {
        return res.status(200).send(generateFrameHtml({
          image: getFrameImageUrl(getBaseUrl(req), { result: 'active' }),
          buttons: [
            { label: '🔙 Back to Home', action: 'post' },
          ],
          postUrl: `${getBaseUrl(req)}/api/frame-action`,
          title: 'Active Prediction',
          description: 'You already have an active prediction',
        }));
      }

      // Initialize stats if needed
      let stats = await storage.getUserStats(fid);
      if (!stats) {
        stats = await storage.initializeUserStats(
          fid,
          validation.username || `user${fid}`,
          validation.displayName || `User ${fid}`,
          validation.pfpUrl || ''
        );
      }

      // Create prediction
      const roundInfo = getCurrentRound(challengeType);
      const now = Date.now();
      
      await storage.savePrediction({
        fid,
        coinId: state.coinId,
        challengeType,
        direction,
        startPrice: price.currentPrice,
        currentPrice: price.currentPrice,
        predictedPrice: null,
        timestamp: now,
        expiresAt: roundInfo.endTime,
        status: 'pending',
        roundId: roundInfo.roundId,
        roundStartTime: roundInfo.startTime,
        roundEndTime: roundInfo.endTime,
      });

      // Return success frame
      const coinName = state.coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum';
      const dirText = direction === 'up' ? 'UP 📈' : 'DOWN 📉';
      const durationText = challengeType === 'quick' ? '5 minutes' : '24 hours';
      
      return res.status(200).send(generateFrameHtml({
        image: getFrameImageUrl(getBaseUrl(req), { 
          result: 'success', 
          coinId: state.coinId, 
          direction 
        }),
        buttons: [
          { label: '🔙 Back to Home', action: 'post' },
          { label: '📊 View Stats', action: 'post' },
        ],
        postUrl: `${getBaseUrl(req)}/api/frame-action`,
        title: 'Prediction Submitted!',
        description: `${coinName} ${dirText} in ${durationText}`,
      }));
    } catch (error) {
      console.error('Frame predict error:', error);
      res.status(200).send(generateFrameHtml({
        image: getFrameImageUrl(getBaseUrl(req), { result: 'error' }),
        buttons: [
          { label: '🔙 Back to Home', action: 'post' },
        ],
        postUrl: `${getBaseUrl(req)}/api/frame-action`,
        title: 'PredictX - Error',
        description: 'Failed to submit prediction',
      }));
    }
  });

  // Frame image generator - creates dynamic images for frames
  app.get("/api/frame-image", async (req, res) => {
    try {
      const { action, fid, coin, dir, result } = req.query;
      
      // For now, return a simple SVG image
      // In production, you would generate proper images with Sharp or Canvas
      const svg = generateFrameSvg({
        action: action as string,
        fid: fid ? parseInt(fid as string) : undefined,
        coinId: coin as string,
        direction: dir as string,
        result: result as string,
      });

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.send(svg);
    } catch (error) {
      console.error('Frame image error:', error);
      res.status(500).send('Image generation error');
    }
  });

  // App Icon endpoint (200x200 PNG-compatible SVG)
  app.get("/api/icon", async (req, res) => {
    try {
      const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00d9ff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0099ff;stop-opacity:1" />
          </linearGradient>
        </defs>
        
        <!-- Rounded square background with gradient -->
        <rect width="200" height="200" rx="44" fill="url(#iconGrad)"/>
        
        <!-- Star/Target symbol -->
        <g transform="translate(100, 100)">
          <!-- Center circle -->
          <circle cx="0" cy="0" r="8" fill="white"/>
          
          <!-- Star points -->
          <path d="M 0,-35 L 5,-12 L 28,-10 L 10,-2 L 15,20 L 0,8 L -15,20 L -10,-2 L -28,-10 L -5,-12 Z" 
                fill="white" opacity="0.95"/>
          
          <!-- Outer ring -->
          <circle cx="0" cy="0" r="42" fill="none" stroke="white" stroke-width="3" opacity="0.6"/>
          
          <!-- Small accent dots -->
          <circle cx="0" cy="-50" r="3.5" fill="white"/>
          <circle cx="0" cy="50" r="3.5" fill="white"/>
          <circle cx="-50" cy="0" r="3.5" fill="white"/>
          <circle cx="50" cy="0" r="3.5" fill="white"/>
        </g>
      </svg>`;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(svg);
    } catch (error) {
      console.error('Icon generation error:', error);
      res.status(500).send('Icon generation error');
    }
  });

  // OG Embed / Cast Preview endpoint (1200x630 for social sharing)
  app.get("/api/og-embed", async (req, res) => {
    try {
      const { coin, direction, score } = req.query;
      console.log('🖼️ OG Embed params:', { coin, direction, score });
      
      // Dynamic content based on query params
      const coinName = coin === 'bitcoin' ? 'Bitcoin' : coin === 'ethereum' ? 'Ethereum' : null;
      const directionArrow = direction === 'up' ? '↑ UP' : direction === 'down' ? '↓ DOWN' : null;
      const earnedPoints = score ? `+${score} points` : null;
      
      const isVictory = coinName && directionArrow && earnedPoints;
      console.log('🎯 Is Victory:', isVictory, { coinName, directionArrow, earnedPoints });
      
      const svg = isVictory ? `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0a0e27;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#1a0e2a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0a0e27;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#fbbf24;stop-opacity:0.3" />
            <stop offset="100%" style="stop-color:#f59e0b;stop-opacity:0.2" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="1200" height="630" fill="url(#bgGrad)"/>
        <rect width="1200" height="630" fill="url(#accentGrad)"/>
        
        <!-- Trophy Icon -->
        <g transform="translate(600, 140)">
          <text x="0" y="0" font-size="100" text-anchor="middle" filter="url(#glow)">🏆</text>
        </g>
        
        <!-- Victory Title -->
        <text x="600" y="280" font-size="64" font-weight="bold" text-anchor="middle" 
              fill="#fbbf24" font-family="system-ui, -apple-system, sans-serif" filter="url(#glow)">
          I Just Won!
        </text>
        
        <!-- Prediction Details -->
        <text x="600" y="360" font-size="40" text-anchor="middle" 
              fill="#ffffff" font-family="system-ui, -apple-system, sans-serif">
          Predicted ${coinName} ${directionArrow}
        </text>
        
        <!-- Points Earned -->
        <text x="600" y="430" font-size="36" font-weight="bold" text-anchor="middle" 
              fill="#10b981" font-family="system-ui, -apple-system, sans-serif">
          Earned ${earnedPoints}!
        </text>
        
        <!-- CTA -->
        <g transform="translate(600, 540)">
          <rect x="-200" y="-28" width="400" height="56" rx="28" 
                fill="#6366f1" filter="url(#glow)"/>
          <text x="0" y="8" font-size="30" font-weight="bold" text-anchor="middle" 
                fill="white" font-family="system-ui, -apple-system, sans-serif">
            🎯 Join me on PredictX!
          </text>
        </g>
      </svg>` : `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0a0e27;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#0a0e1a;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0a0e27;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00d9ff;stop-opacity:0.2" />
            <stop offset="100%" style="stop-color:#0088ff;stop-opacity:0.1" />
          </linearGradient>
          <linearGradient id="buttonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00d9ff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0088ff;stop-opacity:1" />
          </linearGradient>
          <filter id="btnGlow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="1200" height="630" fill="url(#bgGrad)"/>
        <rect width="1200" height="630" fill="url(#accentGrad)"/>
        
        <!-- Logo Icon (top) -->
        <g transform="translate(600, 160)">
          <rect x="-70" y="-70" width="140" height="140" rx="28" fill="url(#buttonGrad)" opacity="0.9"/>
          <circle cx="0" cy="0" r="6" fill="white"/>
          <path d="M 0,-28 L 4,-10 L 22,-8 L 8,-2 L 12,16 L 0,6 L -12,16 L -8,-2 L -22,-8 L -4,-10 Z" 
                fill="white" opacity="0.95"/>
          <circle cx="0" cy="0" r="34" fill="none" stroke="white" stroke-width="2.5" opacity="0.5"/>
        </g>
        
        <!-- Title -->
        <text x="600" y="300" font-size="80" font-weight="bold" text-anchor="middle" 
              fill="#00d9ff" font-family="system-ui, -apple-system, sans-serif">
          PredictX
        </text>
        
        <!-- Subtitle -->
        <text x="600" y="360" font-size="32" text-anchor="middle" 
              fill="#ffffff" opacity="0.8" font-family="system-ui, -apple-system, sans-serif">
          Predict Crypto Prices &amp; Win
        </text>
        
        <!-- Feature badges -->
        <g transform="translate(600, 420)">
          <text x="-180" y="0" font-size="22" text-anchor="middle" fill="#fbbf24" font-family="system-ui, sans-serif">⚡ Quick Predictions</text>
          <text x="0" y="0" font-size="22" text-anchor="middle" fill="#f59e0b" font-family="system-ui, sans-serif">🏆 Win Rewards</text>
          <text x="180" y="0" font-size="22" text-anchor="middle" fill="#10b981" font-family="system-ui, sans-serif">📈 Live Prices</text>
        </g>
        
        <!-- Start Predicting Button -->
        <g transform="translate(600, 530)">
          <rect x="-180" y="-30" width="360" height="60" rx="30" 
                fill="url(#buttonGrad)" filter="url(#btnGlow)"/>
          <text x="0" y="10" font-size="28" font-weight="bold" text-anchor="middle" 
                fill="white" font-family="system-ui, -apple-system, sans-serif">
            🎯 Start Predicting
          </text>
        </g>
      </svg>`;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(svg);
    } catch (error) {
      console.error('OG embed generation error:', error);
      res.status(500).send('OG embed generation error');
    }
  });

  // Splash Screen endpoint (200x200)
  app.get("/api/splash", async (req, res) => {
    try {
      const svg = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="splashBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0a0e27;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0a0e1a;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="splashIcon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00d9ff;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#0099ff;stop-opacity:1" />
          </linearGradient>
          <filter id="splashGlow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="200" height="200" fill="url(#splashBg)"/>
        
        <!-- Glowing icon -->
        <g transform="translate(100, 100)">
          <rect x="-50" y="-50" width="100" height="100" rx="22" 
                fill="url(#splashIcon)" filter="url(#splashGlow)"/>
          <circle cx="0" cy="0" r="6" fill="white"/>
          <path d="M 0,-26 L 4,-10 L 20,-8 L 8,-2 L 11,14 L 0,6 L -11,14 L -8,-2 L -20,-8 L -4,-10 Z" 
                fill="white" opacity="0.95"/>
          <circle cx="0" cy="0" r="32" fill="none" stroke="white" stroke-width="2.5" opacity="0.6"/>
          <circle cx="0" cy="-38" r="2.5" fill="white"/>
          <circle cx="0" cy="38" r="2.5" fill="white"/>
          <circle cx="-38" cy="0" r="2.5" fill="white"/>
          <circle cx="38" cy="0" r="2.5" fill="white"/>
        </g>
      </svg>`;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(svg);
    } catch (error) {
      console.error('Splash generation error:', error);
      res.status(500).send('Splash generation error');
    }
  });

  // Webhook endpoint for Farcaster v2 Mini App events
  app.post("/api/webhook", async (req, res) => {
    try {
      console.log('Webhook received:', JSON.stringify(req.body, null, 2));
      
      // Acknowledge receipt
      res.status(200).json({ 
        success: true,
        message: 'Webhook received'
      });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(200).json({ 
        success: false,
        error: 'Webhook processing failed'
      });
    }
  });

  // ============= CHECK RESULTS API =============
  
  // Check and resolve pending predictions (Called from frontend every 30 seconds)
  app.get("/api/check-results", async (req, res) => {
    try {
      // Rate limiting: max 10 predictions per request
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 10);

      console.log('🔄 Checking results...');
      const now = Date.now();
      const pendingPredictions = await storage.getPendingResults(limit);
      
      let checked = 0;
      let resolved = 0;
      const errors: string[] = [];

      for (const prediction of pendingPredictions) {
        checked++;

        try {
          const actualPrice = await getCurrentPrice(prediction.coinId as CryptoId);
          if (!actualPrice) {
            errors.push(`Failed to get price for ${prediction.coinId}`);
            continue;
          }

          const stats = await storage.getUserStats(prediction.fid);
          if (!stats) {
            errors.push(`No stats found for user ${prediction.fid}`);
            continue;
          }

          const directionCorrect = isDirectionCorrect(
            prediction.direction as 'up' | 'down',
            prediction.startPrice,
            actualPrice
          );

          if (directionCorrect) {
            const scoreResult = calculateTotalScore(
              prediction.direction as 'up' | 'down',
              prediction.startPrice,
              actualPrice,
              prediction.predictedPrice || undefined,
              stats.currentStreak,
              prediction.challengeType as 'quick' | 'big'
            );

            await storage.updatePrediction(prediction.id, {
              status: 'won',
              endPrice: actualPrice,
              score: scoreResult.totalScore,
              accuracy: scoreResult.accuracy,
              speedBonus: scoreResult.speedBonus || 0,
              accuracyBonus: scoreResult.accuracyBonus || 0,
              streakBonus: scoreResult.streakBonus || 0,
              earnedPoints: scoreResult.totalScore,
            });

            const newWonPredictions = stats.wonPredictions + 1;
            const newCurrentStreak = stats.currentStreak + 1;
            const newTotalPredictions = stats.totalPredictions + 1;

            const updates: any = {
              totalScore: stats.totalScore + scoreResult.totalScore,
              wonPredictions: newWonPredictions,
              currentStreak: newCurrentStreak,
              longestStreak: Math.max(newCurrentStreak, stats.longestStreak),
              totalPredictions: newTotalPredictions,
              winRate: (newWonPredictions / newTotalPredictions) * 100,
            };

            if (prediction.challengeType === 'quick') {
              updates.quickScore = stats.quickScore + scoreResult.totalScore;
              updates.quickPredictions = stats.quickPredictions + 1;
            } else {
              updates.bigScore = stats.bigScore + scoreResult.totalScore;
              updates.bigPredictions = stats.bigPredictions + 1;
            }

            await storage.updateUserStats({ ...stats, ...updates });
            console.log(`✅ User ${stats.fid} won ${scoreResult.totalScore} points`);
          } else {
            await storage.updatePrediction(prediction.id, {
              status: 'lost',
              endPrice: actualPrice,
              score: 0,
              earnedPoints: 0,
            });

            const newTotalPredictions = stats.totalPredictions + 1;
            await storage.updateUserStats({
              ...stats,
              currentStreak: 0,
              lostPredictions: stats.lostPredictions + 1,
              totalPredictions: newTotalPredictions,
              winRate: (stats.wonPredictions / newTotalPredictions) * 100,
            });

            console.log(`❌ User ${stats.fid} lost prediction`);
          }
          
          resolved++;
        } catch (error) {
          errors.push(`Error: ${error instanceof Error ? error.message : 'Unknown'}`);
          console.error(`❌ Prediction processing error:`, error);
        }
      }

      console.log(`✅ Check completed: ${checked} checked, ${resolved} resolved`);

      res.json({
        success: true,
        message: `Checked ${checked}, resolved ${resolved}`,
        checked,
        resolved,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: now,
      });
    } catch (error) {
      console.error('❌ Check results error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to check results'
      });
    }
  });
}


// Helper to get base URL from request
function getBaseUrl(req: any): string {
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
  const host = req.get('host') || 'localhost:5000';
  return `${protocol}://${host}`;
}

// Simple SVG generator for frame images
function generateFrameSvg(state: {
  action?: string;
  fid?: number;
  coinId?: string;
  direction?: string;
  result?: string;
}): string {
  const bgColor = '#0a0e27'; // Navy background
  const textColor = '#ffffff';
  const accentColor = '#00d9ff'; // Cyan accent
  
  let title = 'PredictX';
  let subtitle = 'Crypto Price Prediction Game';
  let emoji = '🎮';
  
  if (state.action === 'btc') {
    title = 'Bitcoin Prediction';
    subtitle = 'Predict BTC price movement';
    emoji = '🔶';
  } else if (state.action === 'eth') {
    title = 'Ethereum Prediction';
    subtitle = 'Predict ETH price movement';
    emoji = '💎';
  } else if (state.action === 'stats' && state.fid) {
    title = `User Stats`;
    subtitle = `FID: ${state.fid}`;
    emoji = '📊';
  } else if (state.result === 'success') {
    title = '✅ Prediction Submitted!';
    subtitle = state.coinId === 'bitcoin' ? 'Bitcoin' : 'Ethereum';
    emoji = state.direction === 'up' ? '📈' : '📉';
  } else if (state.result === 'active') {
    title = '⏳ Active Prediction';
    subtitle = 'Wait for your current prediction to finish';
    emoji = '🔄';
  }
  
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="${bgColor}"/>
    
    <!-- Gradient background -->
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${accentColor};stop-opacity:0.1" />
        <stop offset="100%" style="stop-color:${accentColor};stop-opacity:0" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#grad)"/>
    
    <!-- Logo -->
    <circle cx="600" cy="200" r="80" fill="${accentColor}" opacity="0.2"/>
    <text x="600" y="230" font-size="100" text-anchor="middle" fill="${textColor}">${emoji}</text>
    
    <!-- Title -->
    <text x="600" y="350" font-size="60" font-weight="bold" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif">
      ${title}
    </text>
    
    <!-- Subtitle -->
    <text x="600" y="420" font-size="32" text-anchor="middle" fill="${accentColor}" font-family="Arial, sans-serif">
      ${subtitle}
    </text>
    
    <!-- Footer -->
    <text x="600" y="570" font-size="24" text-anchor="middle" fill="${textColor}" opacity="0.6" font-family="Arial, sans-serif">
      Quick Challenge (5min) • Big Challenge (24h)
    </text>
  </svg>`;
}
