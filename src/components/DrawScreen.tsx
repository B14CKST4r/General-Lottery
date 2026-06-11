import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTournamentStore } from '../store/useTournamentStore';
import { Screen, SongSource, TechSource, MatchStatus } from '../types';
import { useKeyboard } from '../hooks/useKeyboard';
import { getDrawManager } from '../lib/draw-system';

export const DrawScreen: React.FC = () => {
  const {
    tournament,
    stages,
    currentStageIndex,
    currentMatchIndex,
    setScreen,
    setDrawState,
    drawState,
  } = useTournamentStore();

  const [isRolling, setIsRolling] = useState(false);
  const [rollingText, setRollingText] = useState('');
  const [showTechPool, setShowTechPool] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [confirmedTechId, setConfirmedTechId] = useState<string | null>(null);
  const [drawStep, setDrawStep] = useState<'song' | 'tech' | 'complete'>('song');

  const currentStage = stages[currentStageIndex];
  const currentMatch = currentStage?.matches[currentMatchIndex];
  const drawManager = getDrawManager();

  const rollingRef = useRef<NodeJS.Timeout | null>(null);

  // 歌曲滚动动画
  const startSongRoll = () => {
    if (!tournament || !drawManager) return;
    setIsRolling(true);
    setDrawStep('song');

    rollingRef.current = setInterval(() => {
      const randomSong = drawManager.getRandomSong();
      if (randomSong) {
        setRollingText(randomSong.name);
      }
    }, 100);
  };

  // 停止歌曲抽取
  const stopSongRoll = () => {
    if (!drawManager || !currentMatch) return;

    if (rollingRef.current) {
      clearInterval(rollingRef.current);
    }

    const song = drawManager.drawSong();
    if (song) {
      setRollingText(song.name);
      setDrawState({
        isRolling: false,
        currentSong: song,
      });

      // 更新比赛歌曲
      const updatedStages = [...stages];
      updatedStages[currentStageIndex].matches[currentMatchIndex] = {
        ...currentMatch,
        song,
        status: MatchStatus.DRAWING,
      };
    }

    setIsRolling(false);

    // 如果需要抽取技术，进入技术抽取步骤
    if (currentStage?.config.techSource !== TechSource.NONE) {
      setDrawStep('tech');
      if (currentStage?.config.techSource === TechSource.DRAW) {
        setShowTechPool(true);
      }
    } else {
      setDrawStep('complete');
    }
  };

  // 技术选择
  const selectTech = (techId: string) => {
    setSelectedTechId(techId);
  };

  // 确认技术选择
  const confirmTech = () => {
    if (!selectedTechId || !drawManager || !currentMatch) return;

    drawManager.markTechAsUsed(
      currentStage?.config.techPoolId || '',
      selectedTechId
    );
    setConfirmedTechId(selectedTechId);

    // 获取选中的技
    const techPool = tournament?.techPools.find(
      (p) => p.id === currentStage?.config.techPoolId
    );
    const technique = techPool?.techniques.find((t) => t.id === selectedTechId);

    if (technique) {
      const currentTechniques = drawState.currentTechniques || [];
      setDrawState({
        ...drawState,
        currentTechniques: [...currentTechniques, technique],
      });

      // 更新比赛技术
      const updatedStages = [...stages];
      updatedStages[currentStageIndex].matches[currentMatchIndex] = {
        ...currentMatch,
        techniques: [...currentTechniques, technique],
      };
    }

    // 检查是否需要继续抽取技术
    const techCount = currentStage?.config.techCount || 0;
    const currentTechCount = (drawState.currentTechniques?.length || 0) + 1;

    if (currentTechCount >= techCount) {
      setDrawStep('complete');
      setShowTechPool(false);
    } else {
      // 继续选择下一个技
      setSelectedTechId(null);
      setConfirmedTechId(null);
    }
  };

  // 完成抽取，进入比赛准备
  const completeDraw = () => {
    if (!currentMatch) return;

    const updatedStages = [...stages];
    updatedStages[currentStageIndex].matches[currentMatchIndex] = {
      ...currentMatch,
      status: MatchStatus.READY,
    };

    setScreen(Screen.MATCH_READY);
  };

  // 键盘快捷键
  useKeyboard({
    onSpace: () => {
      if (drawStep === 'song' && isRolling) {
        stopSongRoll();
      } else if (drawStep === 'complete') {
        completeDraw();
      }
    },
    onNumber: (num) => {
      if (drawStep === 'tech' && showTechPool) {
        const availableTechs = getAvailableTechs();
        const tech = availableTechs[num - 1];
        if (tech) {
          if (selectedTechId === tech.id) {
            confirmTech();
          } else {
            selectTech(tech.id);
          }
        }
      }
    },
    onEnter: () => {
      if (drawStep === 'tech' && selectedTechId && !confirmedTechId) {
        confirmTech();
      }
    },
  });

  // 获取可用技列表
  const getAvailableTechs = () => {
    if (!drawManager || !currentStage) return [];
    return drawManager.getAvailableTechs(currentStage.config.techPoolId || '');
  };

  // 获取已用完技列表
  const getExhaustedTechs = () => {
    if (!drawManager || !currentStage) return [];
    return drawManager.getExhaustedTechs(currentStage.config.techPoolId || '');
  };

  // 自动开始歌曲抽取（如果是随机歌曲）
  useEffect(() => {
    if (
      currentStage?.config.songSource === SongSource.RANDOM &&
      drawStep === 'song' &&
      !isRolling &&
      !drawState.currentSong
    ) {
      startSongRoll();
    }
  }, [currentStage, drawStep]);

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

      <div className="text-center z-10 w-full max-w-4xl px-8">
        {/* 环节和比赛信息 */}
        <motion.div
          className="mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div
            className="text-xl mb-2"
            style={{ color: tournament.theme.textColor }}
          >
            {currentStage.config.name} - 第{currentMatch.matchNumber}场
          </div>
          <div className="flex items-center justify-center gap-8">
            <PlayerCard
              player={currentMatch.player1}
              theme={tournament.theme}
            />
            <div
              className="text-3xl font-bold"
              style={{ color: tournament.theme.primaryColor }}
            >
              VS
            </div>
            <PlayerCard
              player={currentMatch.player2}
              theme={tournament.theme}
            />
          </div>
        </motion.div>

        {/* 歌曲抽取区域 */}
        <AnimatePresence mode="wait">
          {drawStep === 'song' && (
            <motion.div
              key="song"
              className="mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div
                className="text-lg mb-4"
                style={{ color: tournament.theme.textColor }}
              >
                歌曲抽取
              </div>
              <div
                className="text-4xl font-bold py-8 px-12 rounded-xl border-2"
                style={{
                  borderColor: tournament.theme.primaryColor,
                  color: tournament.theme.primaryColor,
                  backgroundColor: `${tournament.theme.primaryColor}10`,
                }}
              >
                {isRolling ? (
                  <motion.span
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.2, repeat: Infinity }}
                  >
                    {rollingText || '准备抽取...'}
                  </motion.span>
                ) : (
                  drawState.currentSong?.name || '按空格开始抽取'
                )}
              </div>
              {isRolling && (
                <p
                  className="mt-4 text-sm"
                  style={{ color: tournament.theme.textColor }}
                >
                  按空格键停止
                </p>
              )}
            </motion.div>
          )}

          {/* 技术抽取/选择区域 */}
          {drawStep === 'tech' && (
            <motion.div
              key="tech"
              className="mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div
                className="text-lg mb-4"
                style={{ color: tournament.theme.textColor }}
              >
                技术选择 ({drawState.currentTechniques?.length || 0}/
                {currentStage.config.techCount})
              </div>

              {showTechPool && (
                <div className="grid grid-cols-5 gap-4">
                  {getAvailableTechs().map((tech, index) => (
                    <motion.div
                      key={tech.id}
                      className="p-4 rounded-lg border-2 cursor-pointer transition-all"
                      style={{
                        borderColor:
                          selectedTechId === tech.id
                            ? tournament.theme.accentColor
                            : tournament.theme.primaryColor,
                        backgroundColor:
                          selectedTechId === tech.id
                            ? `${tournament.theme.accentColor}30`
                            : `${tournament.theme.primaryColor}10`,
                        color: tournament.theme.textColor,
                        transform:
                          selectedTechId === tech.id ? 'scale(1.1)' : 'scale(1)',
                      }}
                      onClick={() => selectTech(tech.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-2xl font-bold mb-1">
                        {index + 1}
                      </div>
                      <div className="text-sm">{tech.name}</div>
                    </motion.div>
                  ))}

                  {getExhaustedTechs().map((tech) => (
                    <div
                      key={tech.id}
                      className="p-4 rounded-lg border-2 opacity-30"
                      style={{
                        borderColor: tournament.theme.primaryColor,
                        color: tournament.theme.textColor,
                      }}
                    >
                      <div className="text-sm">{tech.name}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedTechId && !confirmedTechId && (
                <motion.p
                  className="mt-4 text-sm"
                  style={{ color: tournament.theme.textColor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  按 Enter 确认选择
                </motion.p>
              )}
            </motion.div>
          )}

          {/* 抽取完成 */}
          {drawStep === 'complete' && (
            <motion.div
              key="complete"
              className="mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div
                className="text-2xl font-bold mb-4"
                style={{ color: tournament.theme.primaryColor }}
              >
                抽取完成
              </div>
              <div
                className="p-6 rounded-xl border-2"
                style={{
                  borderColor: tournament.theme.primaryColor,
                  backgroundColor: `${tournament.theme.primaryColor}10`,
                }}
              >
                <div
                  className="text-xl mb-2"
                  style={{ color: tournament.theme.textColor }}
                >
                  歌曲: {drawState.currentSong?.name}
                </div>
                {drawState.currentTechniques &&
                  drawState.currentTechniques.length > 0 && (
                    <div
                      className="text-lg"
                      style={{ color: tournament.theme.textColor }}
                    >
                      技术:{' '}
                      {drawState.currentTechniques.map((t) => t.name).join(' · ')}
                    </div>
                  )}
              </div>
              <motion.button
                className="mt-6 px-8 py-3 rounded-lg font-bold"
                style={{
                  backgroundColor: tournament.theme.primaryColor,
                  color: tournament.theme.backgroundColor,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={completeDraw}
              >
                开始比赛
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// 选手卡片
const PlayerCard: React.FC<{
  player?: { name: string; avatar?: string };
  theme: any;
}> = ({ player, theme }) => {
  if (!player) {
    return (
      <div
        className="w-32 h-32 rounded-full flex items-center justify-center border-2 border-dashed"
        style={{ borderColor: theme.primaryColor }}
      >
        <span style={{ color: theme.textColor }}>轮空</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {player.avatar ? (
        <img
          src={player.avatar}
          alt={player.name}
          className="w-32 h-32 rounded-full object-cover border-4"
          style={{ borderColor: theme.primaryColor }}
        />
      ) : (
        <div
          className="w-32 h-32 rounded-full flex items-center justify-center border-4"
          style={{
            borderColor: theme.primaryColor,
            backgroundColor: `${theme.primaryColor}20`,
          }}
        >
          <span className="text-4xl" style={{ color: theme.primaryColor }}>
            {player.name.charAt(0)}
          </span>
        </div>
      )}
      <span
        className="mt-2 text-lg font-bold"
        style={{ color: theme.textColor }}
      >
        {player.name}
      </span>
    </div>
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
