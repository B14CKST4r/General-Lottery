import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTournamentStore } from '../store/useTournamentStore';
import { Screen, MatchStatus } from '../types';
import { initializeStage } from '../lib/tournament-engine';
import { initDrawManager } from '../lib/draw-system';

export const StageTransition: React.FC = () => {
  const {
    tournament,
    stages,
    currentStageIndex,
    setStages,
    setScreen,
    setCurrentMatchIndex,
  } = useTournamentStore();

  const currentStage = stages[currentStageIndex];
  const prevStage = currentStageIndex > 0 ? stages[currentStageIndex - 1] : null;

  useEffect(() => {
    if (!tournament) return;

    // 如果当前环节还没有初始化，进行初始化
    if (!currentStage || currentStage.matches.length === 0) {
      const players =
        currentStageIndex === 0
          ? tournament.players
          : // 从上一环节获取晋级选手
            prevStage?.matches
              .filter((m) => m.status === MatchStatus.COMPLETED && m.winner)
              .map((m) => m.winner!) || [];

      const initializedStage = initializeStage(
        players,
        tournament.stages[currentStageIndex],
        prevStage || undefined
      );

      const updatedStages = [...stages];
      updatedStages[currentStageIndex] = initializedStage;
      setStages(updatedStages);

      // 初始化抽取管理器
      initDrawManager(tournament.songs, tournament.techPools);
    }

    // 3秒后自动进入抽取界面
    const timer = setTimeout(() => {
      setCurrentMatchIndex(0);
      setScreen(Screen.DRAW);
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentStageIndex, tournament]);

  if (!tournament || !currentStage) return null;

  // 获取上一场比赛的胜者（如果有）
  const lastMatch =
    prevStage?.matches[prevStage.matches.length - 1];

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
        {/* 上一场比赛结果（如果有） */}
        {lastMatch?.winner && (
          <motion.div
            className="mb-8"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div
              className="text-2xl mb-2"
              style={{ color: tournament.theme.textColor }}
            >
              {prevStage?.config.name} 结束
            </div>
            <div
              className="text-4xl font-bold"
              style={{ color: tournament.theme.primaryColor }}
            >
              ⭐ {lastMatch.winner.name} 获胜 ⭐
            </div>
          </motion.div>
        )}

        {/* 环节切换动画 */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="text-xl mb-4"
            style={{ color: tournament.theme.textColor }}
          >
            下一环节
          </div>
          <h1
            className="text-6xl font-bold mb-4"
            style={{ color: tournament.theme.primaryColor }}
          >
            {currentStage.config.name}
          </h1>
        </motion.div>

        {/* 环节信息 */}
        <motion.div
          className="space-y-2 text-lg"
          style={{ color: tournament.theme.textColor }}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div>比赛模式: {getModeLabel(currentStage.config.matchMode)}</div>
          <div>歌曲来源: {getSongSourceLabel(currentStage.config.songSource)}</div>
          <div>技术来源: {getTechSourceLabel(currentStage.config.techSource)}</div>
          <div>赛制: {getFormatLabel(currentStage.config.format)}</div>
        </motion.div>

        {/* 提示 */}
        <motion.p
          className="mt-12 text-sm opacity-50"
          style={{ color: tournament.theme.textColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.2 }}
        >
          按任意键或等待自动进入...
        </motion.p>
      </div>
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
          className="absolute w-2 h-2 rounded-full bg-white opacity-10"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

// 辅助函数
const getModeLabel = (mode: string) => {
  const labels: Record<string, string> = {
    simultaneous: '同台竞技',
    alternating: '轮流竞技',
    attack: '对攻',
  };
  return labels[mode] || mode;
};

const getSongSourceLabel = (source: string) => {
  const labels: Record<string, string> = {
    random: '随机抽取',
    player: '选手自选',
    organizer: '组委会指定',
    theme: '主题曲',
  };
  return labels[source] || source;
};

const getTechSourceLabel = (source: string) => {
  const labels: Record<string, string> = {
    draw: '技池抽取',
    free: '自由技',
    random: '系统随机',
    none: '无技',
  };
  return labels[source] || source;
};

const getFormatLabel = (format: string) => {
  const labels: Record<string, string> = {
    single: '单败淘汰',
    double: '双败淘汰',
    swiss: '瑞士轮',
    bo3: 'BO3',
    bo5: 'BO5',
  };
  return labels[format] || format;
};
