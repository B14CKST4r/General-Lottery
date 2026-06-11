import { Song, Technique, TechPool } from '../types';

// ==================== 歌曲抽取系统 ====================

export class SongDrawSystem {
  private songs: Song[];
  private usedSongs: Set<string>;

  constructor(songs: Song[]) {
    this.songs = songs;
    this.usedSongs = new Set();
  }

  /**
   * 随机抽取一首未使用的歌曲
   */
  draw(): Song | null {
    const available = this.songs.filter((s) => !this.usedSongs.has(s.id));
    if (available.length === 0) {
      // 如果全部用完，重置
      this.reset();
      return this.draw();
    }

    const song = available[Math.floor(Math.random() * available.length)];
    this.usedSongs.add(song.id);
    return song;
  }

  /**
   * 获取随机歌曲（不标记为已使用）
   */
  getRandom(): Song | null {
    if (this.songs.length === 0) return null;
    return this.songs[Math.floor(Math.random() * this.songs.length)];
  }

  /**
   * 重置已使用记录
   */
  reset(): void {
    this.usedSongs.clear();
  }

  /**
   * 获取剩余歌曲数量
   */
  getRemainingCount(): number {
    return this.songs.length - this.usedSongs.size;
  }

  /**
   * 更新歌曲列表
   */
  updateSongs(songs: Song[]): void {
    this.songs = songs;
    this.reset();
  }
}

// ==================== 技术抽取系统 ====================

export class TechDrawSystem {
  private techPool: TechPool;
  private pickCounts: Map<string, number>;

  constructor(techPool: TechPool) {
    this.techPool = techPool;
    this.pickCounts = new Map();
  }

  /**
   * 从技池随机抽取一个技
   */
  draw(): Technique | null {
    const available = this.getAvailableTechs();
    if (available.length === 0) {
      // 如果全部用完，重置
      this.reset();
      return this.draw();
    }

    const tech = available[Math.floor(Math.random() * available.length)];
    this.markAsUsed(tech.id);
    return tech;
  }

  /**
   * 随机抽取多个技（不重复）
   */
  drawMultiple(count: number): Technique[] {
    const results: Technique[] = [];
    for (let i = 0; i < count; i++) {
      const tech = this.draw();
      if (tech) {
        results.push(tech);
      }
    }
    return results;
  }

  /**
   * 获取可用的技列表
   */
  getAvailableTechs(): Technique[] {
    const maxPicks = this.techPool.maxPicksPerTech || 1;
    return this.techPool.techniques.filter((tech) => {
      const count = this.pickCounts.get(tech.id) || 0;
      return count < maxPicks;
    });
  }

  /**
   * 获取已用完的技列表
   */
  getExhaustedTechs(): Technique[] {
    const maxPicks = this.techPool.maxPicksPerTech || 1;
    return this.techPool.techniques.filter((tech) => {
      const count = this.pickCounts.get(tech.id) || 0;
      return count >= maxPicks;
    });
  }

  /**
   * 标记技为已使用
   */
  markAsUsed(techId: string): void {
    const current = this.pickCounts.get(techId) || 0;
    this.pickCounts.set(techId, current + 1);
  }

  /**
   * 获取技的选择次数
   */
  getPickCount(techId: string): number {
    return this.pickCounts.get(techId) || 0;
  }

  /**
   * 重置技池
   */
  reset(): void {
    this.pickCounts.clear();
  }

  /**
   * 更新技池
   */
  updateTechPool(techPool: TechPool): void {
    this.techPool = techPool;
    this.reset();
  }
}

// ==================== 全局抽取管理器 ====================

export class DrawManager {
  private songSystem: SongDrawSystem;
  private techSystems: Map<string, TechDrawSystem>;

  constructor(songs: Song[], techPools: TechPool[]) {
    this.songSystem = new SongDrawSystem(songs);
    this.techSystems = new Map();

    techPools.forEach((pool) => {
      this.techSystems.set(pool.id, new TechDrawSystem(pool));
    });
  }

  /**
   * 抽取歌曲
   */
  drawSong(): Song | null {
    return this.songSystem.draw();
  }

  /**
   * 获取随机歌曲（用于滚动动画）
   */
  getRandomSong(): Song | null {
    return this.songSystem.getRandom();
  }

  /**
   * 抽取技术
   */
  drawTechniques(poolId: string, count: number): Technique[] {
    const system = this.techSystems.get(poolId);
    if (!system) return [];
    return system.drawMultiple(count);
  }

  /**
   * 获取可用技列表
   */
  getAvailableTechs(poolId: string): Technique[] {
    const system = this.techSystems.get(poolId);
    if (!system) return [];
    return system.getAvailableTechs();
  }

  /**
   * 获取已用完技列表
   */
  getExhaustedTechs(poolId: string): Technique[] {
    const system = this.techSystems.get(poolId);
    if (!system) return [];
    return system.getExhaustedTechs();
  }

  /**
   * 标记技为已使用
   */
  markTechAsUsed(poolId: string, techId: string): void {
    const system = this.techSystems.get(poolId);
    if (system) {
      system.markAsUsed(techId);
    }
  }

  /**
   * 获取技的选择次数
   */
  getTechPickCount(poolId: string, techId: string): number {
    const system = this.techSystems.get(poolId);
    if (!system) return 0;
    return system.getPickCount(techId);
  }

  /**
   * 重置所有抽取系统
   */
  resetAll(): void {
    this.songSystem.reset();
    this.techSystems.forEach((system) => system.reset());
  }

  /**
   * 重置指定技池
   */
  resetTechPool(poolId: string): void {
    const system = this.techSystems.get(poolId);
    if (system) {
      system.reset();
    }
  }

  /**
   * 更新歌曲列表
   */
  updateSongs(songs: Song[]): void {
    this.songSystem.updateSongs(songs);
  }

  /**
   * 更新技池
   */
  updateTechPools(techPools: TechPool[]): void {
    this.techSystems.clear();
    techPools.forEach((pool) => {
      this.techSystems.set(pool.id, new TechDrawSystem(pool));
    });
  }
}

// ==================== 单例模式 ====================

let drawManagerInstance: DrawManager | null = null;

export const initDrawManager = (songs: Song[], techPools: TechPool[]): DrawManager => {
  drawManagerInstance = new DrawManager(songs, techPools);
  return drawManagerInstance;
};

export const getDrawManager = (): DrawManager | null => {
  return drawManagerInstance;
};
