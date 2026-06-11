import React from 'react';
import { motion } from 'framer-motion';
import { useTournamentStore } from '../store/useTournamentStore';
import { Screen } from '../types';

export const ChampionScreen: React.FC = () => {
  const { tournament, champion, setScreen, resetTournament } = useTournamentStore();

  const handleReturn = () => {
    setScreen(Screen.SPLASH);
  };

  const handleReset = () => {
    resetTournament();
    setScreen(Screen.SPLASH);
  };

  if (!tournament || !champion) return null;

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: tournament.theme.backgroundColor }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 背景效果 */}
      {tournament.theme.particleEnabled && <CelebrationBackground />}

      <div className="text-center z-10">
        {/* 冠军标题 */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div
            className="text-6xl mb-4"
            style={{ color: tournament.theme.primaryColor }}
          >
            🏆
          </div>
          <h1
            className="text-5xl font-bold mb-8"
            style={{ color: tournament.theme.primaryColor }}
          >
            冠军
          </h1>
        </motion.div>

        {/* 冠军信息 */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {champion.avatar ? (
            <motion.img
              src={champion.avatar}
              alt={champion.name}
              className="w-48 h-48 rounded-full object-cover border-8 mb-6"
              style={{ borderColor: tournament.theme.primaryColor }}
              animate={{
                boxShadow: [
                  `0 0 20px ${tournament.theme.primaryColor}40`,
                  `0 0 60px ${tournament.theme.primaryColor}80`,
                  `0 0 20px ${tournament.theme.primaryColor}40`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          ) : (
            <motion.div
              className="w-48 h-48 rounded-full flex items-center justify-center border-8 mb-6"
              style={{
                borderColor: tournament.theme.primaryColor,
                backgroundColor: `${tournament.theme.primaryColor}20`,
              }}
              animate={{
                boxShadow: [
                  `0 0 20px ${tournament.theme.primaryColor}40`,
                  `0 0 60px ${tournament.theme.primaryColor}80`,
                  `0 0 20px ${tournament.theme.primaryColor}40`,
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span
                className="text-7xl"
                style={{ color: tournament.theme.primaryColor }}
              >
                {champion.name.charAt(0)}
              </span>
            </motion.div>
          )}

          <motion.h2
            className="text-4xl font-bold mb-4"
            style={{ color: tournament.theme.textColor }}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            {champion.name}
          </motion.h2>

          <motion.p
            className="text-xl mb-8"
            style={{ color: tournament.theme.textColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {tournament.name}
          </motion.p>
        </motion.div>

        {/* 按钮 */}
        <motion.div
          className="flex gap-6 justify-center"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <button
            onClick={handleReturn}
            className="px-8 py-4 rounded-lg text-xl font-bold transition-all hover:scale-105"
            style={{
              backgroundColor: tournament.theme.primaryColor,
              color: tournament.theme.backgroundColor,
            }}
          >
            返回主页
          </button>
          <button
            onClick={handleReset}
            className="px-8 py-4 rounded-lg text-xl font-bold border-2 transition-all hover:scale-105"
            style={{
              borderColor: tournament.theme.primaryColor,
              color: tournament.theme.primaryColor,
              backgroundColor: 'transparent',
            }}
          >
            新建比赛
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// 庆祝背景
const CelebrationBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 浮动粒子 */}
      {Array.from({ length: 100 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][
              Math.floor(Math.random() * 5)
            ],
          }}
          animate={{
            y: [0, window.innerHeight + 100],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, 360],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear',
          }}
        />
      ))}

      {/* 闪烁星星 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute text-2xl"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
};
