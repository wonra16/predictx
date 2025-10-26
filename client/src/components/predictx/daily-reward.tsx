import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Sparkles, X, Gift } from 'lucide-react';

interface DailyRewardProps {
  isOpen: boolean;
  onClose: () => void;
  streakDays: number;
  rewardPoints: number;
}

export default function DailyReward({ isOpen, onClose, streakDays, rewardPoints }: DailyRewardProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            data-testid="daily-reward-backdrop"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="relative w-full max-w-md my-auto">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-[#1a1f35] border border-white/10 flex items-center justify-center hover:border-cyan-500/50 transition-all z-10"
                data-testid="button-close-reward"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              {/* Content */}
              <div className="bg-[#0a0e1a] border-2 border-cyan-500/30 rounded-3xl p-6 md:p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto">
                {/* Animated Background Orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <motion.div
                    className="absolute top-0 left-0 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute bottom-0 right-0 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"
                    animate={{
                      scale: [1.2, 1, 1.2],
                      opacity: [0.5, 0.3, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.5
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Flame Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15
                    }}
                    className="flex justify-center mb-6"
                  >
                    <div className="relative">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-xl"
                        animate={{
                          opacity: [0.5, 0.8, 0.5],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-2xl">
                        <Flame className="w-12 h-12 text-white" strokeWidth={2.5} />
                      </div>
                    </div>
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-center mb-2"
                  >
                    <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                      YOUR DAILY STREAK
                    </span>
                  </motion.h2>

                  {/* Streak Days */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-6"
                  >
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30">
                      <Flame className="w-8 h-8 text-orange-500" />
                      <div className="text-6xl font-bold text-white" data-testid="text-streak-days">{streakDays}</div>
                    </div>
                    <div className="text-gray-400 text-sm mt-2">Days in a row</div>
                  </motion.div>

                  {/* Reward Box */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#1a1f35] border border-cyan-500/30 rounded-2xl p-6 mb-6"
                  >
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <Gift className="w-6 h-6 text-cyan-500" />
                      <div className="text-lg font-semibold text-white">Daily Streak Reward</div>
                    </div>
                    <div className="text-center">
                      <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent mb-1" data-testid="text-reward-points">
                        {rewardPoints}
                      </div>
                      <div className="text-sm text-gray-400">Bonus Points</div>
                    </div>
                  </motion.div>

                  {/* Info Text */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-cyan-500/10 rounded-xl p-4 mb-6 border border-cyan-500/20"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-300">
                        <span className="text-cyan-400 font-semibold">Tip:</span> Come back tomorrow to keep your streak alive and earn even more bonus points!
                      </div>
                    </div>
                  </motion.div>

                  {/* Claim Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-cyan-500/30 transition-all"
                    data-testid="button-claim-reward"
                  >
                    CLAIM REWARD
                  </motion.button>

                  {/* Come back text */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center text-xs text-gray-500 mt-4"
                  >
                    Come back tomorrow for day {streakDays + 1}
                  </motion.p>
                </div>

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        background: i % 2 === 0 ? '#06b6d4' : '#f59e0b',
                      }}
                      animate={{
                        y: [-20, -100],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
