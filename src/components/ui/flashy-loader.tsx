import React from 'react';
import { motion } from 'motion/react';
import { Shirt, Zap, Cpu, Search } from 'lucide-react';

interface FlashyLoaderProps {
  message?: string;
  type?: 'analyze' | 'generate';
}

const FlashyLoader: React.FC<FlashyLoaderProps> = ({ 
  message = "PROCESSING...", 
  type = 'analyze' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 relative overflow-hidden min-h-[400px]">
      {/* Background Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-64 h-64 bg-[#FF6B00]/20 rounded-full blur-[80px]"
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Main Icon Container */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Rotating Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-2 border-dashed border-[#FF6B00]/30 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-10px] border border-[#FF6B00]/50 rounded-full"
          />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-[-20px] border-t-2 border-[#FF6B00] rounded-full"
          />

          {/* Center Icon */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              filter: ["drop-shadow(0 0 0px #FF6B00)", "drop-shadow(0 0 15px #FF6B00)", "drop-shadow(0 0 0px #FF6B00)"]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="bg-black/80 p-6 rounded-full border border-[#FF6B00] z-20"
          >
            {type === 'analyze' ? (
              <Search className="w-10 h-10 text-[#FF6B00]" />
            ) : (
              <Cpu className="w-10 h-10 text-[#FF6B00]" />
            )}
          </motion.div>

          {/* Scanning Line */}
          <motion.div 
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-[-30px] right-[-30px] h-[2px] bg-[#FF6B00] shadow-[0_0_15px_#FF6B00] z-30 opacity-70"
          />
        </div>

        {/* Text Area */}
        <div className="mt-16 text-center">
          <motion.h3 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-[#FF6B00] font-black text-2xl tracking-[0.3em] uppercase italic"
          >
            {message}
          </motion.h3>
          
          <div className="flex gap-1 justify-center mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: [4, 16, 4],
                  backgroundColor: ["#FF6B0033", "#FF6B00", "#FF6B0033"]
                }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                className="w-1 rounded-full"
              />
            ))}
          </div>

          <p className="text-white/40 text-[10px] mt-6 font-mono uppercase tracking-widest">
            {type === 'analyze' ? 'Neural Network Analyzing Fabric...' : 'Synthesizing Professional Visuals...'}
          </p>
        </div>
      </div>

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            y: [0, -100],
            x: [0, (i % 2 === 0 ? 50 : -50)],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{ 
            duration: 2 + Math.random() * 2, 
            repeat: Infinity, 
            delay: Math.random() * 2 
          }}
          className="absolute w-1 h-1 bg-[#FF6B00] rounded-full"
          style={{ 
            left: `${20 + Math.random() * 60}%`, 
            bottom: '20%' 
          }}
        />
      ))}
    </div>
  );
};

export default FlashyLoader;
