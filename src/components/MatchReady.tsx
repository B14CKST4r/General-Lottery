import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTournamentStore } from '../store/useTournamentStore';
import { Screen, MatchMode, MatchStatus, BackgroundStyle } from '../types';
import { useKeyboard } from '../hooks/useKeyboard';

export const MatchReady: React.FC = () => {
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

  // 开始演绎
  const startPerforming = () => {
    if (!currentMatch) return;

    const updatedStages = [...stages];
    updatedStages[currentStageIndex].matches[currentMatchIndex] = {
      ...currentMatch,
      status: MatchStatus.PERFORMING,
    };

    setScreen(Screen.PERFORMING);
  };

  // 键盘快捷键
  useKeyboard({
    onSpace: () => startPerforming(),
    onB: () => {
      // 切换背景风格
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
      <AnimatePresence>
        {showInfo && (
          <motion.div
            className="absolute inset-0 flex items-center justify-between px-16 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 选手A */}
            <PlayerDisplay
              player={currentMatch.player1}
              theme={tournament.theme}
              position="left"
              matchMode={currentStage.config.matchMode}
            />

            {/* 中间信息 */}
            <div className="text-center">
              <div
                className="text-2xl font-bold mb-4"
                style={{ color: tournament.theme.primaryColor }}
              >
                VS
              </div>
              <div
                className="text-lg mb-2"
                style={{ color: tournament.theme.textColor }}
              >
                {currentStage.config.name}
              </div>
              <div
                className="text-sm opacity-60"
                style={{ color: tournament.theme.textColor }}
              >
                按空格开始演绎
              </div>
            </div>

            {/* 选手B */}
            <PlayerDisplay
              player={currentMatch.player2}
              theme={tournament.theme}
              position="right"
              matchMode={currentStage.config.matchMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 歌曲和技术信息 */}
      {showInfo && (
        <motion.div
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-center z-10"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div
            className="text-2xl font-bold mb-2"
            style={{ color: tournament.theme.primaryColor }}
          >
            {currentMatch.song?.name}
          </div>
          {currentMatch.techniques && currentMatch.techniques.length > 0 && (
            <div
              className="text-lg"
              style={{ color: tournament.theme.textColor }}
            >
              技术: {currentMatch.techniques.map((t) => t.name).join(' · ')}
            </div>
          )}
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

// 选手展示
const PlayerDisplay: React.FC<{
  player?: { name: string; avatar?: string };
  theme: any;
  position: 'left' | 'right';
  matchMode: MatchMode;
}> = ({ player, theme, position, matchMode }) => {
  if (!player) return null;

  const isSolo = matchMode === MatchMode.ALTERNATING;

  return (
    <motion.div
      className={`flex flex-col items-center ${
        isSolo ? 'opacity-50' : 'opacity-100'
      }`}
      initial={{ x: position === 'left' ? -50 : 50, opacity: 0 }}
      animate={{ x: 0, opacity: isSolo ? 0.5 : 1 }}
      transition={{ delay: 0.2 }}
    >
      {player.avatar ? (
        <img
          src={player.avatar}
          alt={player.name}
          className="w-40 h-40 rounded-full object-cover border-4 mb-4"
          style={{ borderColor: theme.primaryColor }}
        />
      ) : (
        <div
          className="w-40 h-40 rounded-full flex items-center justify-center border-4 mb-4"
          style={{
            borderColor: theme.primaryColor,
            backgroundColor: `${theme.primaryColor}20`,
          }}
        >
          <span className="text-5xl" style={{ color: theme.primaryColor }}>
            {player.name.charAt(0)}
          </span>
        </div>
      )}
      <span
        className="text-2xl font-bold"
        style={{ color: theme.textColor }}
      >
        {player.name}
      </span>
    </motion.div>
  );
};

// 粒子背景
const ParticleBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.3,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

// AnimatePresence 组件（简化版）
const AnimatePresence: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <>{children}</>;
};
