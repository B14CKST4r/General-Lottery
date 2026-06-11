// ==================== 核心类型定义 ====================

// 选手
export interface Player {
  id: string;
  name: string;
  avatar?: string;
  isSeed?: boolean;
}

// 歌曲
export interface Song {
  id: string;
  name: string;
  artist?: string;
  filePath?: string;
  isThemeSong?: boolean;
}

// 技术
export interface Technique {
  id: string;
  name: string;
  category?: string;
}

// 技池
export interface TechPool {
  id: string;
  name: string;
  techniques: Technique[];
  maxPicksPerTech?: number;
}

// 比赛模式
export enum MatchMode {
  SIMULTANEOUS = 'simultaneous',
  ALTERNATING = 'alternating',
  ATTACK = 'attack',
}

export const MATCH_MODE_LABELS: Record<MatchMode, string> = {
  [MatchMode.SIMULTANEOUS]: '同台竞技',
  [MatchMode.ALTERNATING]: '轮流竞技',
  [MatchMode.ATTACK]: '对攻',
};

// 歌曲来源
export enum SongSource {
  RANDOM = 'random',
  PLAYER_CHOICE = 'player',
  ORGANIZER = 'organizer',
  THEME = 'theme',
}

export const SONG_SOURCE_LABELS: Record<SongSource, string> = {
  [SongSource.RANDOM]: '随机抽取',
  [SongSource.PLAYER_CHOICE]: '选手自选',
  [SongSource.ORGANIZER]: '组委会指定',
  [SongSource.THEME]: '主题曲',
};

// 技术来源
export enum TechSource {
  DRAW = 'draw',
  FREE = 'free',
  RANDOM = 'random',
  NONE = 'none',
}

export const TECH_SOURCE_LABELS: Record<TechSource, string> = {
  [TechSource.DRAW]: '技池抽取',
  [TechSource.FREE]: '自由技',
  [TechSource.RANDOM]: '系统随机',
  [TechSource.NONE]: '无技',
};

// 赛制
export enum TournamentFormat {
  SINGLE_ELIMINATION = 'single',
  DOUBLE_ELIMINATION = 'double',
  SWISS = 'swiss',
  BO3 = 'bo3',
  BO5 = 'bo5',
}

export const FORMAT_LABELS: Record<TournamentFormat, string> = {
  [TournamentFormat.SINGLE_ELIMINATION]: '单败淘汰',
  [TournamentFormat.DOUBLE_ELIMINATION]: '双败淘汰',
  [TournamentFormat.SWISS]: '瑞士轮',
  [TournamentFormat.BO3]: 'BO3',
  [TournamentFormat.BO5]: 'BO5',
};

// 背景风格
export enum BackgroundStyle {
  DARK = 'dark',
  PARTICLE = 'particle',
  VIDEO = 'video',
}

export const BACKGROUND_STYLE_LABELS: Record<BackgroundStyle, string> = {
  [BackgroundStyle.DARK]: '纯黑背景',
  [BackgroundStyle.PARTICLE]: '粒子效果',
  [BackgroundStyle.VIDEO]: '视频背景',
};

// 比赛状态
export enum MatchStatus {
  PENDING = 'pending',
  DRAWING = 'drawing',
  READY = 'ready',
  PERFORMING = 'performing',
  RESULT_ENTRY = 'result',
  COMPLETED = 'completed',
}

// 环节配置
export interface StageConfig {
  id: string;
  name: string;
  matchMode: MatchMode;
  songSource: SongSource;
  techSource: TechSource;
  techCount: number;
  techPoolId?: string;
  format: TournamentFormat;
  backgroundStyle: BackgroundStyle;
  customSongs?: string[];
  description?: string;
}

// 比赛
export interface Match {
  id: string;
  stageId: string;
  round: number;
  matchNumber: number;
  player1?: Player;
  player2?: Player;
  winner?: Player;
  song?: Song;
  techniques?: Technique[];
  status: MatchStatus;
  firstAttacker?: Player;
}

// 环节实例
export interface Stage {
  id: string;
  config: StageConfig;
  matches: Match[];
  isActive: boolean;
  isComplete: boolean;
  winnerBracket?: Match[];
  loserBracket?: Match[];
}

// 主题配置
export interface ThemeConfig {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
  particleEnabled: boolean;
  backgroundVideo?: string;
}

// 预设主题
export const THEME_PRESETS: Record<string, ThemeConfig> = {
  classic: {
    name: '经典黑金',
    primaryColor: '#FFD700',
    secondaryColor: '#FFA500',
    backgroundColor: '#0a0a0a',
    textColor: '#ffffff',
    accentColor: '#ff6b6b',
    fontFamily: 'Noto Sans SC, sans-serif',
    particleEnabled: true,
  },
  neon: {
    name: '霓虹科技',
    primaryColor: '#00ffff',
    secondaryColor: '#ff00ff',
    backgroundColor: '#000011',
    textColor: '#ffffff',
    accentColor: '#00ff00',
    fontFamily: 'Noto Sans SC, sans-serif',
    particleEnabled: true,
  },
  minimal: {
    name: '极简白黑',
    primaryColor: '#ffffff',
    secondaryColor: '#cccccc',
    backgroundColor: '#000000',
    textColor: '#ffffff',
    accentColor: '#666666',
    fontFamily: 'Noto Sans SC, sans-serif',
    particleEnabled: false,
  },
};

// 比赛配置
export interface TournamentConfig {
  name: string;
  logo?: string;
  date?: string;
  location?: string;
  players: Player[];
  songs: Song[];
  techPools: TechPool[];
  stages: StageConfig[];
  theme: ThemeConfig;
}

// ==================== 运行时状态 ====================

// 屏幕状态
export enum Screen {
  SPLASH = 'splash',
  CONFIG = 'config',
  CONFIG_WIZARD = 'wizard',
  STAGE_TRANSITION = 'transition',
  DRAW = 'draw',
  MATCH_READY = 'matchReady',
  PERFORMING = 'performing',
  RESULT = 'result',
  CHAMPION = 'champion',
}

// 抽取状态
export interface DrawState {
  isRolling: boolean;
  currentSong?: Song;
  currentTechniques?: Technique[];
  rollingSong?: string;
  rollingTechniques?: string[];
}

// 技池状态
export interface TechPoolState {
  isVisible: boolean;
  selectedTechId?: string;
  confirmedTechId?: string;
  usedTechIds: string[];
  pickCounts: Record<string, number>;
}

// 应用状态
export interface AppState {
  screen: Screen;
  tournament: TournamentConfig | null;
  stages: Stage[];
  currentStageIndex: number;
  currentMatchIndex: number;
  drawState: DrawState;
  techPoolState: TechPoolState;
  champion: Player | null;
}

// ==================== 工具类型 ====================

export interface SwissRecord {
  playerId: string;
  wins: number;
  losses: number;
  points: number;
}

export interface Pairing {
  player1: Player;
  player2: Player;
}
