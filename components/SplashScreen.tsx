'use client';

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
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            duration: 0.8
          }}
          className="mb-8 relative"
        >
          <div className="relative inline-block">
            {/* Glow Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full blur-xl"
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Main Icon */}
            <div className="relative bg-gradient-to-br from-cyan-500 to-cyan-600 p-8 rounded-3xl shadow-2xl">
              <Sparkles className="w-20 h-20 text-white" strokeWidth={2.5} />
            </div>
            
            {/* Orbiting Icons */}
            <motion.div
              className="absolute -top-3 -right-3 bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow-lg"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <TrendingUp className="w-5 h-5 text-white" />
            </motion.div>

            <motion.div
              className="absolute -bottom-3 -left-3 bg-gradient-to-br from-green-500 to-emerald-500 p-2.5 rounded-xl shadow-lg"
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Zap className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold mb-3"
        >
          <span className="bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent">
            PredictX
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-gray-400 text-lg mb-8"
        >
          Predict. Win. Dominate.
        </motion.p>

        {/* Loading Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-cyan-500"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.15
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
