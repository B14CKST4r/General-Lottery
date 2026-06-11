import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTournamentStore } from '../store/useTournamentStore';
import { Screen, MatchStatus, BackgroundStyle } from '../types';
import { useKeyboard } from '../hooks/useKeyboard';

export const PerformingScreen: React.FC = () => {
  const {
    tournament,
    stages,
    currentStageIndex,
    currentMatchIndex,
    setScreen,
  } = useTournamentStore();

  const [showInfo, setShowInfo] = useState(true);
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>(
    BackgroundStyle.DARK
  );

  const currentStage = stages[currentStageIndex];
  const currentMatch = currentStage?.matches[currentMatchIndex];

  // 结束演绎
  const endPerforming = () => {
    if (!currentMatch) return;

    const updatedStages = [...stages];
    updatedStages[currentStageIndex].matches[currentMatchIndex] = {
      ...currentMatch,
      status: MatchStatus.RESULT_ENTRY,
    };

    setScreen(Screen.RESULT);
  };

  // 键盘快捷键
  useKeyboard({
    onSpace: () => endPerforming(),
    onB: () => {
      const styles = Object.values(BackgroundStyle);
      const currentIndex = styles.indexOf(backgroundStyle);
      const nextIndex = (currentIndex + 1) % styles.length;
      setBackgroundStyle(styles[nextIndex]);
    },
    onH: () => setShowInfo(!showInfo),
  });

  if (!tournament || !currentStage || !currentMatch) return null;

  const getBackgroundClass = () => {
    switch (backgroundStyle) {
      case BackgroundStyle.DARK:
        return 'bg-black';
      case BackgroundStyle.PARTICLE:
        return 'bg-gradient-to-br from-purple-900 via-blue-900 to-black';
      case BackgroundStyle.VIDEO:
        return 'bg-black';
      default:
        return 'bg-black';
    }
  };

  return (
    <motion.div
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden ${getBackgroundClass()}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 背景效果 */}
      {backgroundStyle === BackgroundStyle.PARTICLE && <ParticleBackground />}

      {/* 选手信息（可隐藏） */}
      {showInfo && (
        <motion.div
          className="absolute inset-0 flex items-center justify-between px-16 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* 选手A */}
          <div className="flex flex-col items-center">
            {currentMatch.player1?.avatar ? (
              <img
                src={currentMatch.player1.avatar}
                alt={currentMatch.player1.name}
                className="w-32 h-32 rounded-full object-cover border-4 mb-4 opacity-50"
                style={{ borderColor: tournament.theme.primaryColor }}
              />
            ) : (
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center border-4 mb-4 opacity-50"
                style={{
                  borderColor: tournament.theme.primaryColor,
                  backgroundColor: `${tournament.theme.primaryColor}20`,
                }}
              >
                <span className="text-4xl" style={{ color: tournament.theme.primaryColor }}>
                  {currentMatch.player1?.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-xl font-bold opacity-50" style={{ color: tournament.theme.textColor }}>
              {currentMatch.player1?.name}
            </span>
          </div>

          {/* 中间信息 */}
          <div className="text-center">
            <div className="text-2xl font-bold mb-4" style={{ color: tournament.theme.primaryColor }}>
              演绎中
            </div>
            <div className="text-sm opacity-60" style={{ color: tournament.theme.textColor }}>
              按空格结束演绎
            </div>
          </div>

          {/* 选手B */}
          <div className="flex flex-col items-center">
            {currentMatch.player2?.avatar ? (
              <img
                src={currentMatch.player2.avatar}
                alt={currentMatch.player2.name}
                className="w-32 h-32 rounded-full object-cover border-4 mb-4 opacity-50"
                style={{ borderColor: tournament.theme.primaryColor }}
              />
            ) : (
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center border-4 mb-4 opacity-50"
                style={{
                  borderColor: tournament.theme.primaryColor,
                  backgroundColor: `${tournament.theme.primaryColor}20`,
                }}
              >
                <span className="text-4xl" style={{ color: tournament.theme.primaryColor }}>
                  {currentMatch.player2?.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-xl font-bold opacity-50" style={{ color: tournament.theme.textColor }}>
              {currentMatch.player2?.name}
            </span>
          </div>
        </motion.div>
      )}

      {/* 隐藏信息时的提示 */}
      {!showInfo && (
        <motion.div
          className="absolute top-8 right-8 text-sm opacity-50"
          style={{ color: tournament.theme.textColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
        >
          按 H 显示信息
        </motion.div>
      )}
    </motion.div>
  );
};

// 粒子背景
const ParticleBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.2,
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
