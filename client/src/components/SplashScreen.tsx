import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center relative overflow-hidden">
      {/* Subtle Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.1, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        {/* Logo Animation - Centered without text */}
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 1.2
          }}
          className="mb-12 relative"
        >
          <div className="relative inline-block">
            {/* Glow Effect - More prominent */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full blur-2xl"
              animate={{
                opacity: [0.4, 0.7, 0.4],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Main Icon - Bigger and cleaner */}
            <div className="relative bg-gradient-to-br from-cyan-500 to-cyan-600 p-12 rounded-3xl shadow-2xl">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <circle cx="12" cy="12" r="2" fill="white"/>
                <path d="M 12,3 L 12.8,9.2 L 17,8.5 L 13,11 L 16,15 L 12,12.5 L 8,15 L 11,11 L 7,8.5 L 11.2,9.2 Z" fill="white" opacity="0.95"/>
                <circle cx="12" cy="12" r="9" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6"/>
                <circle cx="12" cy="2" r="1" fill="white"/>
                <circle cx="12" cy="22" r="1" fill="white"/>
                <circle cx="2" cy="12" r="1" fill="white"/>
                <circle cx="22" cy="12" r="1" fill="white"/>
              </svg>
            </div>
            
            {/* Orbiting Icons - Faster and smoother */}
            <motion.div
              className="absolute -top-4 -right-4 bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg"
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Zap className="w-6 h-6 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Loading Dots - More visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-3"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
