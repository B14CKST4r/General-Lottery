import React from 'react';
import { motion } from 'framer-motion';
import { useTournamentStore } from '../store/useTournamentStore';
import { Screen } from '../types';

export const SplashScreen: React.FC = () => {
  const { tournament, setScreen } = useTournamentStore();

  const handleStart = () => {
    if (tournament) {
      setScreen(Screen.STAGE_TRANSITION);
    } else {
      setScreen(Screen.CONFIG);
    }
  };

  const handleConfig = () => {
    setScreen(Screen.CONFIG);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: tournament?.theme.backgroundColor || '#0a0a0a' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 背景粒子效果 */}
      {tournament?.theme.particleEnabled && <ParticleBackground />}

      {/* Logo 区域 */}
      <motion.div
        className="text-center z-10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {tournament?.logo ? (
          <img
            src={tournament.logo}
            alt="比赛Logo"
            className="w-48 h-48 object-contain mx-auto mb-8"
          />
        ) : (
          <div
            className="w-48 h-48 mx-auto mb-8 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: tournament?.theme.primaryColor || '#FFD700',
              opacity: 0.2,
            }}
          >
            <span
              className="text-6xl font-bold"
              style={{ color: tournament?.theme.primaryColor || '#FFD700' }}
            >
              W
            </span>
          </div>
        )}

        {/* 比赛名称 */}
        <motion.h1
          className="text-5xl font-bold mb-4"
          style={{ color: tournament?.theme.primaryColor || '#FFD700' }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {tournament?.name || 'Wota艺比赛'}
        </motion.h1>

        {/* 日期和地点 */}
        {(tournament?.date || tournament?.location) && (
          <motion.p
            className="text-xl mb-12"
            style={{ color: tournament?.theme.textColor || '#ffffff' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {tournament.date && <span>{tournament.date}</span>}
            {tournament.date && tournament.location && <span> · </span>}
            {tournament.location && <span>{tournament.location}</span>}
          </motion.p>
        )}

        {/* 按钮组 */}
        <motion.div
          className="flex gap-6 justify-center"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={handleStart}
            className="px-8 py-4 rounded-lg text-xl font-bold transition-all duration-300 hover:scale-105"
            style={{
              backgroundColor: tournament?.theme.primaryColor || '#FFD700',
              color: tournament?.theme.backgroundColor || '#0a0a0a',
            }}
          >
            {tournament ? '开始比赛' : '新建比赛'}
          </button>

          <button
            onClick={handleConfig}
            className="px-8 py-4 rounded-lg text-xl font-bold border-2 transition-all duration-300 hover:scale-105"
            style={{
              borderColor: tournament?.theme.primaryColor || '#FFD700',
              color: tournament?.theme.primaryColor || '#FFD700',
              backgroundColor: 'transparent',
            }}
          >
            配置比赛
          </button>
        </motion.div>
      </motion.div>

      {/* 底部装饰 */}
      <motion.div
        className="absolute bottom-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p
          className="text-sm opacity-50"
          style={{ color: tournament?.theme.textColor || '#ffffff' }}
        >
          Wota艺比赛抽签系统 v2.0
        </p>
      </motion.div>
    </motion.div>
  );
};

// 粒子背景组件
const ParticleBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};
