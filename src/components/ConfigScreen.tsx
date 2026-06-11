import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTournamentStore } from '../store/useTournamentStore';
import {
  Screen,
  TournamentConfig,
  Player,
  Song,
  TechPool,
  Technique,
  StageConfig,
  ThemeConfig,
  MatchMode,
  SongSource,
  TechSource,
  TournamentFormat,
  BackgroundStyle,
  THEME_PRESETS,
  MATCH_MODE_LABELS,
  SONG_SOURCE_LABELS,
  TECH_SOURCE_LABELS,
  FORMAT_LABELS,
  BACKGROUND_STYLE_LABELS,
} from '../types';
import { generateId } from '../lib/tournament-engine';

export const ConfigScreen: React.FC = () => {
  const { tournament, setTournament, setScreen } = useTournamentStore();
  const [activeTab, setActiveTab] = useState<'basic' | 'players' | 'songs' | 'techs' | 'stages' | 'theme'>('basic');

  // 本地状态
  const [config, setConfig] = useState<TournamentConfig>(
    tournament || {
      name: '',
      players: [],
      songs: [],
      techPools: [],
      stages: [],
      theme: THEME_PRESETS.classic,
    }
  );

  const updateConfig = (updates: Partial<TournamentConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    setTournament(config);
    setScreen(Screen.SPLASH);
  };

  return (
    <motion.div
      className="min-h-screen p-8"
      style={{ backgroundColor: config.theme.backgroundColor }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 标题 */}
      <div className="max-w-6xl mx-auto">
        <h1
          className="text-3xl font-bold mb-8"
          style={{ color: config.theme.primaryColor }}
        >
          比赛配置
        </h1>

        {/* 标签页 */}
        <div className="flex gap-4 mb-8">
          {[
            { key: 'basic', label: '基本信息' },
            { key: 'players', label: '选手' },
            { key: 'songs', label: '歌曲' },
            { key: 'techs', label: '技池' },
            { key: 'stages', label: '环节' },
            { key: 'theme', label: '主题' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor:
                  activeTab === tab.key
                    ? config.theme.primaryColor
                    : 'transparent',
                color:
                  activeTab === tab.key
                    ? config.theme.backgroundColor
                    : config.theme.textColor,
                border: `2px solid ${config.theme.primaryColor}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: config.theme.backgroundColor,
            border: `1px solid ${config.theme.primaryColor}30`,
          }}
        >
          {activeTab === 'basic' && (
            <BasicConfig config={config} updateConfig={updateConfig} />
          )}
          {activeTab === 'players' && (
            <PlayerConfig config={config} updateConfig={updateConfig} />
          )}
          {activeTab === 'songs' && (
            <SongConfig config={config} updateConfig={updateConfig} />
          )}
          {activeTab === 'techs' && (
            <TechConfig config={config} updateConfig={updateConfig} />
          )}
          {activeTab === 'stages' && (
            <StageConfigComponent config={config} updateConfig={updateConfig} />
          )}
          {activeTab === 'theme' && (
            <ThemeConfigComponent config={config} updateConfig={updateConfig} />
          )}
        </div>

        {/* 保存按钮 */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-lg font-bold transition-all hover:scale-105"
            style={{
              backgroundColor: config.theme.primaryColor,
              color: config.theme.backgroundColor,
            }}
          >
            保存配置
          </button>
          <button
            onClick={() => setScreen(Screen.SPLASH)}
            className="px-6 py-3 rounded-lg font-bold border-2 transition-all hover:scale-105"
            style={{
              borderColor: config.theme.primaryColor,
              color: config.theme.primaryColor,
              backgroundColor: 'transparent',
            }}
          >
            返回
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// 基本信息配置
const BasicConfig: React.FC<{
  config: TournamentConfig;
  updateConfig: (updates: Partial<TournamentConfig>) => void;
}> = ({ config, updateConfig }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2" style={{ color: config.theme.textColor }}>
          比赛名称
        </label>
        <input
          type="text"
          value={config.name}
          onChange={(e) => updateConfig({ name: e.target.value })}
          className="w-full p-3 rounded-lg border-2 bg-transparent"
          style={{
            borderColor: config.theme.primaryColor,
            color: config.theme.textColor,
          }}
          placeholder="输入比赛名称"
        />
      </div>
      <div>
        <label className="block mb-2" style={{ color: config.theme.textColor }}>
          比赛日期
        </label>
        <input
          type="date"
          value={config.date || ''}
          onChange={(e) => updateConfig({ date: e.target.value })}
          className="w-full p-3 rounded-lg border-2 bg-transparent"
          style={{
            borderColor: config.theme.primaryColor,
            color: config.theme.textColor,
          }}
        />
      </div>
      <div>
        <label className="block mb-2" style={{ color: config.theme.textColor }}>
          比赛地点
        </label>
        <input
          type="text"
          value={config.location || ''}
          onChange={(e) => updateConfig({ location: e.target.value })}
          className="w-full p-3 rounded-lg border-2 bg-transparent"
          style={{
            borderColor: config.theme.primaryColor,
            color: config.theme.textColor,
          }}
          placeholder="输入比赛地点"
        />
      </div>
    </div>
  );
};

// 选手配置
const PlayerConfig: React.FC<{
  config: TournamentConfig;
  updateConfig: (updates: Partial<TournamentConfig>) => void;
}> = ({ config, updateConfig }) => {
  const [newPlayerName, setNewPlayerName] = useState('');

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    const newPlayer: Player = {
      id: generateId(),
      name: newPlayerName.trim(),
    };
    updateConfig({ players: [...config.players, newPlayer] });
    setNewPlayerName('');
  };

  const removePlayer = (id: string) => {
    updateConfig({ players: config.players.filter((p) => p.id !== id) });
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
          className="flex-1 p-3 rounded-lg border-2 bg-transparent"
          style={{
            borderColor: config.theme.primaryColor,
            color: config.theme.textColor,
          }}
          placeholder="输入选手名称"
        />
        <button
          onClick={addPlayer}
          className="px-4 py-2 rounded-lg font-bold"
          style={{
            backgroundColor: config.theme.primaryColor,
            color: config.theme.backgroundColor,
          }}
        >
          添加
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {config.players.map((player) => (
          <motion.div
            key={player.id}
            className="p-3 rounded-lg flex items-center justify-between"
            style={{
              backgroundColor: `${config.theme.primaryColor}20`,
              border: `1px solid ${config.theme.primaryColor}40`,
            }}
            layout
          >
            <span style={{ color: config.theme.textColor }}>{player.name}</span>
            <button
              onClick={() => removePlayer(player.id)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// 歌曲配置
const SongConfig: React.FC<{
  config: TournamentConfig;
  updateConfig: (updates: Partial<TournamentConfig>) => void;
}> = ({ config, updateConfig }) => {
  const [newSongName, setNewSongName] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');

  const addSong = () => {
    if (!newSongName.trim()) return;
    const newSong: Song = {
      id: generateId(),
      name: newSongName.trim(),
      artist: newSongArtist.trim() || undefined,
    };
    updateConfig({ songs: [...config.songs, newSong] });
    setNewSongName('');
    setNewSongArtist('');
  };

  const removeSong = (id: string) => {
    updateConfig({ songs: config.songs.filter((s) => s.id !== id) });
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={newSongName}
          onChange={(e) => setNewSongName(e.target.value)}
          className="flex-1 p-3 rounded-lg border-2 bg-transparent"
          style={{
            borderColor: config.theme.primaryColor,
            color: config.theme.textColor,
          }}
          placeholder="歌曲名称"
        />
        <input
          type="text"
          value={newSongArtist}
          onChange={(e) => setNewSongArtist(e.target.value)}
          className="flex-1 p-3 rounded-lg border-2 bg-transparent"
          style={{
            borderColor: config.theme.primaryColor,
            color: config.theme.textColor,
          }}
          placeholder="艺术家（可选）"
        />
        <button
          onClick={addSong}
          className="px-4 py-2 rounded-lg font-bold"
          style={{
            backgroundColor: config.theme.primaryColor,
            color: config.theme.backgroundColor,
          }}
        >
          添加
        </button>
      </div>

      <div className="space-y-2">
        {config.songs.map((song) => (
          <motion.div
            key={song.id}
            className="p-3 rounded-lg flex items-center justify-between"
            style={{
              backgroundColor: `${config.theme.primaryColor}20`,
              border: `1px solid ${config.theme.primaryColor}40`,
            }}
            layout
          >
            <div>
              <span style={{ color: config.theme.textColor }}>{song.name}</span>
              {song.artist && (
                <span
                  className="ml-2 opacity-60"
                  style={{ color: config.theme.textColor }}
                >
                  - {song.artist}
                </span>
              )}
            </div>
            <button
              onClick={() => removeSong(song.id)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// 技池配置
const TechConfig: React.FC<{
  config: TournamentConfig;
  updateConfig: (updates: Partial<TournamentConfig>) => void;
}> = ({ config, updateConfig }) => {
  const [newPoolName, setNewPoolName] = useState('');
  const [newTechName, setNewTechName] = useState('');

  const addPool = () => {
    if (!newPoolName.trim()) return;
    const newPool: TechPool = {
      id: generateId(),
      name: newPoolName.trim(),
      techniques: [],
    };
    updateConfig({ techPools: [...config.techPools, newPool] });
    setNewPoolName('');
  };

  const addTech = (poolId: string) => {
    if (!newTechName.trim()) return;
    const newTech: Technique = {
      id: generateId(),
      name: newTechName.trim(),
    };
    updateConfig({
      techPools: config.techPools.map((pool) =>
        pool.id === poolId
          ? { ...pool, techniques: [...pool.techniques, newTech] }
          : pool
      ),
    });
    setNewTechName('');
  };

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={newPoolName}
          onChange={(e) => setNewPoolName(e.target.value)}
          className="flex-1 p-3 rounded-lg border-2 bg-transparent"
          style={{
            borderColor: config.theme.primaryColor,
            color: config.theme.textColor,
          }}
          placeholder="技池名称"
        />
        <button
          onClick={addPool}
          className="px-4 py-2 rounded-lg font-bold"
          style={{
            backgroundColor: config.theme.primaryColor,
            color: config.theme.backgroundColor,
          }}
        >
          创建技池
        </button>
      </div>

      <div className="space-y-4">
        {config.techPools.map((pool) => (
          <div
            key={pool.id}
            className="p-4 rounded-lg"
            style={{
              backgroundColor: `${config.theme.primaryColor}10`,
              border: `1px solid ${config.theme.primaryColor}30`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3
                className="font-bold"
                style={{ color: config.theme.primaryColor }}
              >
                {pool.name}
              </h3>
              <button
                onClick={() =>
                  updateConfig({
                    techPools: config.techPools.filter((p) => p.id !== pool.id),
                  })
                }
                className="text-red-500 hover:text-red-700"
              >
                删除
              </button>
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTechName}
                onChange={(e) => setNewTechName(e.target.value)}
                className="flex-1 p-2 rounded border bg-transparent"
                style={{
                  borderColor: config.theme.primaryColor,
                  color: config.theme.textColor,
                }}
                placeholder="技术名称"
              />
              <button
                onClick={() => addTech(pool.id)}
                className="px-3 py-2 rounded text-sm"
                style={{
                  backgroundColor: config.theme.primaryColor,
                  color: config.theme.backgroundColor,
                }}
              >
                添加
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {pool.techniques.map((tech) => (
                <span
                  key={tech.id}
                  className="px-2 py-1 rounded text-sm"
                  style={{
                    backgroundColor: `${config.theme.primaryColor}30`,
                    color: config.theme.textColor,
                  }}
                >
                  {tech.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 环节配置
const StageConfigComponent: React.FC<{
  config: TournamentConfig;
  updateConfig: (updates: Partial<TournamentConfig>) => void;
}> = ({ config, updateConfig }) => {
  const addStage = () => {
    const newStage: StageConfig = {
      id: generateId(),
      name: `环节${config.stages.length + 1}`,
      matchMode: MatchMode.SIMULTANEOUS,
      songSource: SongSource.RANDOM,
      techSource: TechSource.DRAW,
      techCount: 2,
      format: TournamentFormat.SINGLE_ELIMINATION,
      backgroundStyle: BackgroundStyle.DARK,
    };
    updateConfig({ stages: [...config.stages, newStage] });
  };

  const updateStage = (index: number, updates: Partial<StageConfig>) => {
    updateConfig({
      stages: config.stages.map((stage, i) =>
        i === index ? { ...stage, ...updates } : stage
      ),
    });
  };

  const removeStage = (index: number) => {
    updateConfig({
      stages: config.stages.filter((_, i) => i !== index),
    });
  };

  return (
    <div>
      <button
        onClick={addStage}
        className="px-4 py-2 rounded-lg font-bold mb-4"
        style={{
          backgroundColor: config.theme.primaryColor,
          color: config.theme.backgroundColor,
        }}
      >
        添加环节
      </button>

      <div className="space-y-4">
        {config.stages.map((stage, index) => (
          <div
            key={stage.id}
            className="p-4 rounded-lg"
            style={{
              backgroundColor: `${config.theme.primaryColor}10`,
              border: `1px solid ${config.theme.primaryColor}30`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={stage.name}
                onChange={(e) => updateStage(index, { name: e.target.value })}
                className="font-bold bg-transparent border-b-2"
                style={{
                  borderColor: config.theme.primaryColor,
                  color: config.theme.primaryColor,
                }}
              />
              <button
                onClick={() => removeStage(index)}
                className="text-red-500 hover:text-red-700"
              >
                删除
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: config.theme.textColor }}>
                  比赛模式
                </label>
                <select
                  value={stage.matchMode}
                  onChange={(e) =>
                    updateStage(index, { matchMode: e.target.value as MatchMode })
                  }
                  className="w-full p-2 rounded border bg-transparent"
                  style={{
                    borderColor: config.theme.primaryColor,
                    color: config.theme.textColor,
                  }}
                >
                  {Object.entries(MATCH_MODE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ color: config.theme.textColor }}>
                  歌曲来源
                </label>
                <select
                  value={stage.songSource}
                  onChange={(e) =>
                    updateStage(index, { songSource: e.target.value as SongSource })
                  }
                  className="w-full p-2 rounded border bg-transparent"
                  style={{
                    borderColor: config.theme.primaryColor,
                    color: config.theme.textColor,
                  }}
                >
                  {Object.entries(SONG_SOURCE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ color: config.theme.textColor }}>
                  技术来源
                </label>
                <select
                  value={stage.techSource}
                  onChange={(e) =>
                    updateStage(index, { techSource: e.target.value as TechSource })
                  }
                  className="w-full p-2 rounded border bg-transparent"
                  style={{
                    borderColor: config.theme.primaryColor,
                    color: config.theme.textColor,
                  }}
                >
                  {Object.entries(TECH_SOURCE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ color: config.theme.textColor }}>
                  技术数量
                </label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={stage.techCount}
                  onChange={(e) =>
                    updateStage(index, { techCount: parseInt(e.target.value) || 0 })
                  }
                  className="w-full p-2 rounded border bg-transparent"
                  style={{
                    borderColor: config.theme.primaryColor,
                    color: config.theme.textColor,
                  }}
                />
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ color: config.theme.textColor }}>
                  赛制
                </label>
                <select
                  value={stage.format}
                  onChange={(e) =>
                    updateStage(index, { format: e.target.value as TournamentFormat })
                  }
                  className="w-full p-2 rounded border bg-transparent"
                  style={{
                    borderColor: config.theme.primaryColor,
                    color: config.theme.textColor,
                  }}
                >
                  {Object.entries(FORMAT_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ color: config.theme.textColor }}>
                  背景风格
                </label>
                <select
                  value={stage.backgroundStyle}
                  onChange={(e) =>
                    updateStage(index, {
                      backgroundStyle: e.target.value as BackgroundStyle,
                    })
                  }
                  className="w-full p-2 rounded border bg-transparent"
                  style={{
                    borderColor: config.theme.primaryColor,
                    color: config.theme.textColor,
                  }}
                >
                  {Object.entries(BACKGROUND_STYLE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {stage.techSource === TechSource.DRAW && config.techPools.length > 0 && (
              <div className="mt-4">
                <label className="block text-sm mb-1" style={{ color: config.theme.textColor }}>
                  使用技池
                </label>
                <select
                  value={stage.techPoolId || ''}
                  onChange={(e) =>
                    updateStage(index, { techPoolId: e.target.value || undefined })
                  }
                  className="w-full p-2 rounded border bg-transparent"
                  style={{
                    borderColor: config.theme.primaryColor,
                    color: config.theme.textColor,
                  }}
                >
                  <option value="">选择技池</option>
                  {config.techPools.map((pool) => (
                    <option key={pool.id} value={pool.id}>
                      {pool.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 主题配置
const ThemeConfigComponent: React.FC<{
  config: TournamentConfig;
  updateConfig: (updates: Partial<TournamentConfig>) => void;
}> = ({ config, updateConfig }) => {
  const applyPreset = (presetKey: string) => {
    const preset = THEME_PRESETS[presetKey];
    if (preset) {
      updateConfig({ theme: { ...preset } });
    }
  };

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    updateConfig({ theme: { ...config.theme, ...updates } });
  };

  return (
    <div className="space-y-6">
      {/* 预设主题 */}
      <div>
        <label className="block mb-2" style={{ color: config.theme.textColor }}>
          预设主题
        </label>
        <div className="flex gap-4">
          {Object.entries(THEME_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className="px-4 py-2 rounded-lg border-2 transition-all hover:scale-105"
              style={{
                borderColor: preset.primaryColor,
                backgroundColor: preset.backgroundColor,
                color: preset.primaryColor,
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 自定义颜色 */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { key: 'primaryColor', label: '主色调' },
          { key: 'secondaryColor', label: '次色调' },
          { key: 'backgroundColor', label: '背景色' },
          { key: 'textColor', label: '文字色' },
          { key: 'accentColor', label: '强调色' },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block mb-2" style={{ color: config.theme.textColor }}>
              {label}
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={(config.theme as any)[key]}
                onChange={(e) => updateTheme({ [key]: e.target.value } as any)}
                className="w-12 h-10 rounded border-0"
              />
              <input
                type="text"
                value={(config.theme as any)[key]}
                onChange={(e) => updateTheme({ [key]: e.target.value } as any)}
                className="flex-1 p-2 rounded border bg-transparent"
                style={{
                  borderColor: config.theme.primaryColor,
                  color: config.theme.textColor,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 粒子效果 */}
      <div className="flex items-center gap-4">
        <label style={{ color: config.theme.textColor }}>启用粒子效果</label>
        <input
          type="checkbox"
          checked={config.theme.particleEnabled}
          onChange={(e) => updateTheme({ particleEnabled: e.target.checked })}
          className="w-5 h-5"
        />
      </div>
    </div>
  );
};
