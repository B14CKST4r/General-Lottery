import React from 'react';
import { motion } from 'framer-motion';
import { useTournamentStore } from '../store/useTournamentStore';
import { Screen, MatchStatus } from '../types';
import { useKeyboard } from '../hooks/useKeyboard';

export const ResultEntry: React.FC = () => {
  const {
    tournament,
    stages,
    currentStageIndex,
    currentMatchIndex,
    setScreen,
    completeMatch,
  } = useTournamentStore();

  const currentStage = stages[currentStageIndex];
  const currentMatch = currentStage?.matches[currentMatchIndex];

  // 选择胜者
  const selectWinner = (playerId: string) => {
    completeMatch(playerId);
  };

  // 键盘快捷键
  useKeyboard({
    onNumber: (num) => {
      if (num === 1 && currentMatch?.player1) {
        selectWinner(currentMatch.player1.id);
      } else if (num === 2 && currentMatch?.player2) {
        selectWinner(currentMatch.player2.id);
      }
    },
    onEscape: () => {
      // 返回比赛准备界面
      if (!currentMatch) return;
      const updatedStages = [...stages];
      updatedStages[currentStageIndex].matches[currentMatchIndex] = {
        ...currentMatch,
        status: MatchStatus.READY,
      };
      setScreen(Screen.MATCH_READY);
    },
  });

  if (!tournament || !currentStage || !currentMatch) return null;

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: tournament.theme.backgroundColor }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 背景效果 */}
      {tournament.theme.particleEnabled && <ParticleBackground />}

      <div className="text-center z-10">
        {/* 标题 */}
        <motion.h1
          className="text-3xl font-bold mb-8"
          style={{ color: tournament.theme.primaryColor }}
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          结果录入
        </motion.h1>

        {/* 选手对比 */}
        <div className="flex items-center justify-center gap-12 mb-8">
          {/* 选手A */}
          <motion.button
            className="flex flex-col items-center p-6 rounded-xl border-2 transition-all hover:scale-105"
            style={{
              borderColor: tournament.theme.primaryColor,
              backgroundColor: `${tournament.theme.primaryColor}10`,
            }}
            onClick={() =>
              currentMatch.player1 && selectWinner(currentMatch.player1.id)
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {currentMatch.player1?.avatar ? (
              <img
                src={currentMatch.player1.avatar}
                alt={currentMatch.player1.name}
                className="w-32 h-32 rounded-full object-cover border-4 mb-4"
                style={{ borderColor: tournament.theme.primaryColor }}
              />
            ) : (
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center border-4 mb-4"
                style={{
                  borderColor: tournament.theme.primaryColor,
                  backgroundColor: `${tournament.theme.primaryColor}20`,
                }}
              >
                <span
                  className="text-5xl"
                  style={{ color: tournament.theme.primaryColor }}
                >
                  {currentMatch.player1?.name.charAt(0)}
                </span>
              </div>
            )}
            <span
              className="text-2xl font-bold"
              style={{ color: tournament.theme.textColor }}
            >
              {currentMatch.player1?.name}
            </span>
            <span
              className="mt-2 text-sm opacity-60"
              style={{ color: tournament.theme.textColor }}
            >
              按 1 选择
            </span>
          </motion.button>

          {/* VS */}
          <motion.div
            className="text-4xl font-bold"
            style={{ color: tournament.theme.primaryColor }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            VS
          </motion.div>

          {/* 选手B */}
          <motion.button
            className="flex flex-col items-center p-6 rounded-xl border-2 transition-all hover:scale-105"
            style={{
              borderColor: tournament.theme.primaryColor,
              backgroundColor: `${tournament.theme.primaryColor}10`,
            }}
            onClick={() =>
              currentMatch.player2 && selectWinner(currentMatch.player2.id)
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {currentMatch.player2?.avatar ? (
              <img
                src={currentMatch.player2.avatar}
                alt={currentMatch.player2.name}
                className="w-32 h-32 rounded-full object-cover border-4 mb-4"
                style={{ borderColor: tournament.theme.primaryColor }}
              />
            ) : (
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center border-4 mb-4"
                style={{
                  borderColor: tournament.theme.primaryColor,
                  backgroundColor: `${tournament.theme.primaryColor}20`,
                }}
              >
                <span
                  className="text-5xl"
                  style={{ color: tournament.theme.primaryColor }}
                >
                  {currentMatch.player2?.name.charAt(0)}
                </span>
              </div>
            )}
            <span
              className="text-2xl font-bold"
              style={{ color: tournament.theme.textColor }}
            >
              {currentMatch.player2?.name}
            </span>
            <span
              className="mt-2 text-sm opacity-60"
              style={{ color: tournament.theme.textColor }}
            >
              按 2 选择
            </span>
          </motion.button>
        </div>

        {/* 比赛信息 */}
        <motion.div
          className="mb-8 p-4 rounded-lg"
          style={{
            backgroundColor: `${tournament.theme.primaryColor}10`,
            border: `1px solid ${tournament.theme.primaryColor}30`,
          }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div style={{ color: tournament.theme.textColor }}>
            歌曲: {currentMatch.song?.name}
          </div>
          {currentMatch.techniques && currentMatch.techniques.length > 0 && (
            <div style={{ color: tournament.theme.textColor }}>
              技术: {currentMatch.techniques.map((t) => t.name).join(' · ')}
            </div>
          )}
        </motion.div>

        {/* 提示 */}
        <motion.p
          className="text-sm opacity-50"
          style={{ color: tournament.theme.textColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
        >
          按 1 选择选手A胜 | 按 2 选择选手B胜 | 按 Esc 返回
        </motion.p>
      </div>
    </motion.div>
  );
};

// 粒子背景
const ParticleBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};
