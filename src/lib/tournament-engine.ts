import {
  Player,
  Match,
  Stage,
  StageConfig,
  TournamentFormat,
  MatchStatus,
  SwissRecord,
} from '../types';

// ==================== 工具函数 ====================

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ==================== 对阵生成 ====================

/**
 * 生成单败淘汰赛对阵
 */
export const generateSingleElimination = (
  players: Player[],
  stageConfig: StageConfig
): Match[] => {
  const shuffled = shuffleArray(players);
  const matches: Match[] = [];
  const matchCount = Math.ceil(shuffled.length / 2);

  for (let i = 0; i < matchCount; i++) {
    const player1 = shuffled[i * 2];
    const player2 = shuffled[i * 2 + 1];

    matches.push({
      id: generateId(),
      stageId: stageConfig.id,
      round: 1,
      matchNumber: i + 1,
      player1,
      player2,
      status: MatchStatus.PENDING,
    });
  }

  return matches;
};

/**
 * 生成双败淘汰赛对阵
 */
export const generateDoubleElimination = (
  players: Player[],
  stageConfig: StageConfig
): { winnerBracket: Match[]; loserBracket: Match[] } => {
  const winnerMatches = generateSingleElimination(players, stageConfig);
  const loserMatches: Match[] = [];

  // 败者组轮次根据胜者组轮数确定
  const rounds = Math.ceil(Math.log2(players.length));
  for (let round = 1; round <= rounds; round++) {
    const matchCount = Math.floor(winnerMatches.length / Math.pow(2, round));
    for (let i = 0; i < matchCount; i++) {
      loserMatches.push({
        id: generateId(),
        stageId: stageConfig.id,
        round,
        matchNumber: i + 1,
        status: MatchStatus.PENDING,
      });
    }
  }

  return { winnerBracket: winnerMatches, loserBracket: loserMatches };
};

/**
 * 生成瑞士轮对阵
 */
export const generateSwissRound = (
  players: Player[],
  records: SwissRecord[],
  stageConfig: StageConfig,
  round: number
): Match[] => {
  // 按积分排序
  const sortedPlayers = [...players].sort((a, b) => {
    const recordA = records.find((r) => r.playerId === a.id);
    const recordB = records.find((r) => r.playerId === b.id);
    return (recordB?.points || 0) - (recordA?.points || 0);
  });

  // 配对：同积分组内随机配对
  const matches: Match[] = [];
  const usedPlayers = new Set<string>();

  for (const player of sortedPlayers) {
    if (usedPlayers.has(player.id)) continue;

    const playerRecord = records.find((r) => r.playerId === player.id);
    const playerPoints = playerRecord?.points || 0;

    // 找同积分且未使用的对手
    const opponents = sortedPlayers.filter(
      (p) =>
        p.id !== player.id &&
        !usedPlayers.has(p.id) &&
        records.find((r) => r.playerId === p.id)?.points === playerPoints
    );

    if (opponents.length > 0) {
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      usedPlayers.add(player.id);
      usedPlayers.add(opponent.id);

      matches.push({
        id: generateId(),
        stageId: stageConfig.id,
        round,
        matchNumber: matches.length + 1,
        player1: player,
        player2: opponent,
        status: MatchStatus.PENDING,
      });
    }
  }

  return matches;
};

/**
 * 生成BO3/BO5对阵
 */
export const generateBOMatches = (
  players: Player[],
  stageConfig: StageConfig,
  _gamesNeeded: number
): Match[] => {
  const shuffled = shuffleArray(players);
  const matches: Match[] = [];

  for (let i = 0; i < shuffled.length; i += 2) {
    const player1 = shuffled[i];
    const player2 = shuffled[i + 1];

    if (player1 && player2) {
      matches.push({
        id: generateId(),
        stageId: stageConfig.id,
        round: 1,
        matchNumber: Math.floor(i / 2) + 1,
        player1,
        player2,
        status: MatchStatus.PENDING,
      });
    }
  }

  return matches;
};

// ==================== 晋级逻辑 ====================

/**
 * 单败淘汰晋级
 */
export const advanceSingleElimination = (
  matches: Match[],
  nextStageConfig: StageConfig
): Match[] => {
  const winners = matches
    .filter((m) => m.winner)
    .map((m) => m.winner!);

  if (winners.length <= 1) return [];

  return generateSingleElimination(winners, nextStageConfig);
};

/**
 * 双败淘汰晋级
 */
export const advanceDoubleElimination = (
  winnerBracket: Match[],
  loserBracket: Match[],
  stageConfig: StageConfig
): { winnerBracket: Match[]; loserBracket: Match[] } => {
  // 胜者组晋级
  const winnerBracketWinners = winnerBracket
    .filter((m) => m.winner)
    .map((m) => m.winner!);

  // 败者组晋级（败者组胜者继续，败者淘汰）
  const loserBracketWinners = loserBracket
    .filter((m) => m.winner)
    .map((m) => m.winner!);

  const newWinnerBracket =
    winnerBracketWinners.length > 1
      ? generateSingleElimination(winnerBracketWinners, stageConfig)
      : [];

  const newLoserBracket =
    loserBracketWinners.length > 1
      ? generateSingleElimination(loserBracketWinners, stageConfig)
      : [];

  return {
    winnerBracket: newWinnerBracket,
    loserBracket: newLoserBracket,
  };
};

/**
 * 瑞士轮晋级判断
 */
export const checkSwissAdvancement = (
  records: SwissRecord[],
  winsNeeded: number
): Player[] => {
  return records
    .filter((r) => r.wins >= winsNeeded)
    .map((r) => ({ id: r.playerId, name: '' } as Player));
};

// ==================== 初始化环节 ====================

/**
 * 初始化环节对阵
 */
export const initializeStage = (
  players: Player[],
  stageConfig: StageConfig,
  _previousStage?: Stage
): Stage => {
  let matches: Match[] = [];
  let winnerBracket: Match[] | undefined;
  let loserBracket: Match[] | undefined;

  switch (stageConfig.format) {
    case TournamentFormat.SINGLE_ELIMINATION:
      matches = generateSingleElimination(players, stageConfig);
      break;

    case TournamentFormat.DOUBLE_ELIMINATION:
      const de = generateDoubleElimination(players, stageConfig);
      winnerBracket = de.winnerBracket;
      loserBracket = de.loserBracket;
      matches = de.winnerBracket;
      break;

    case TournamentFormat.SWISS:
      // 瑞士轮需要记录，第一轮随机配对
      const initialRecords: SwissRecord[] = players.map((p) => ({
        playerId: p.id,
        wins: 0,
        losses: 0,
        points: 0,
      }));
      matches = generateSwissRound(players, initialRecords, stageConfig, 1);
      break;

    case TournamentFormat.BO3:
      matches = generateBOMatches(players, stageConfig, 2);
      break;

    case TournamentFormat.BO5:
      matches = generateBOMatches(players, stageConfig, 3);
      break;
  }

  return {
    id: stageConfig.id,
    config: stageConfig,
    matches,
    isActive: false,
    isComplete: false,
    winnerBracket,
    loserBracket,
  };
};

// ==================== 瑞士轮记录管理 ====================

export const createInitialSwissRecords = (players: Player[]): SwissRecord[] => {
  return players.map((p) => ({
    playerId: p.id,
    wins: 0,
    losses: 0,
    points: 0,
  }));
};

export const updateSwissRecord = (
  records: SwissRecord[],
  winnerId: string,
  loserId: string
): SwissRecord[] => {
  return records.map((record) => {
    if (record.playerId === winnerId) {
      return {
        ...record,
        wins: record.wins + 1,
        points: record.points + 1,
      };
    }
    if (record.playerId === loserId) {
      return {
        ...record,
        losses: record.losses + 1,
      };
    }
    return record;
  });
};
