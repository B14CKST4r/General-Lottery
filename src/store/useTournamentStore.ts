import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Screen,
  TournamentConfig,
  Stage,
  Player,
  DrawState,
  TechPoolState,
  MatchStatus,
} from '../types';

interface TournamentState {
  // 状态
  screen: Screen;
  tournament: TournamentConfig | null;
  stages: Stage[];
  currentStageIndex: number;
  currentMatchIndex: number;
  drawState: DrawState;
  techPoolState: TechPoolState;
  champion: Player | null;

  // Actions
  setScreen: (screen: Screen) => void;
  setTournament: (tournament: TournamentConfig | null) => void;
  setStages: (stages: Stage[]) => void;
  setCurrentStageIndex: (index: number) => void;
  setCurrentMatchIndex: (index: number) => void;
  setDrawState: (drawState: DrawState) => void;
  setTechPoolState: (techPoolState: TechPoolState) => void;
  setChampion: (champion: Player | null) => void;

  // 复杂操作
  startTournament: () => void;
  nextMatch: () => void;
  completeMatch: (winnerId: string) => void;
  resetTournament: () => void;
}

const initialDrawState: DrawState = {
  isRolling: false,
};

const initialTechPoolState: TechPoolState = {
  isVisible: false,
  usedTechIds: [],
  pickCounts: {},
};

export const useTournamentStore = create<TournamentState>()(
  persist(
    (set, get) => ({
      // 初始状态
      screen: Screen.SPLASH,
      tournament: null,
      stages: [],
      currentStageIndex: 0,
      currentMatchIndex: 0,
      drawState: initialDrawState,
      techPoolState: initialTechPoolState,
      champion: null,

      // 基础 Actions
      setScreen: (screen) => set({ screen }),
      setTournament: (tournament) => set({ tournament }),
      setStages: (stages) => set({ stages }),
      setCurrentStageIndex: (index) => set({ currentStageIndex: index }),
      setCurrentMatchIndex: (index) => set({ currentMatchIndex: index }),
      setDrawState: (drawState) => set({ drawState }),
      setTechPoolState: (techPoolState) => set({ techPoolState }),
      setChampion: (champion) => set({ champion }),

      // 开始比赛
      startTournament: () => {
        const { tournament } = get();
        if (!tournament) return;

        // 初始化环节
        const stages: Stage[] = tournament.stages.map((config, index) => ({
          id: config.id,
          config,
          matches: [],
          isActive: index === 0,
          isComplete: false,
        }));

        set({
          stages,
          currentStageIndex: 0,
          currentMatchIndex: 0,
          screen: Screen.STAGE_TRANSITION,
          drawState: initialDrawState,
          techPoolState: initialTechPoolState,
          champion: null,
        });
      },

      // 下一场比赛
      nextMatch: () => {
        const { stages, currentStageIndex, currentMatchIndex } = get();
        const currentStage = stages[currentStageIndex];
        if (!currentStage) return;

        // 检查是否还有未完成的比赛
        const nextMatch = currentStage.matches.find(
          (m, idx) => idx > currentMatchIndex && m.status === MatchStatus.PENDING
        );

        if (nextMatch) {
          // 同环节下一场
          set({
            currentMatchIndex: currentStage.matches.indexOf(nextMatch),
            screen: Screen.DRAW,
            drawState: initialDrawState,
          });
        } else {
          // 检查是否完成当前环节
          const allComplete = currentStage.matches.every(
            (m) => m.status === MatchStatus.COMPLETED
          );

          if (allComplete) {
            // 标记当前环节完成
            const updatedStages = [...stages];
            updatedStages[currentStageIndex] = {
              ...currentStage,
              isComplete: true,
              isActive: false,
            };

            // 检查是否还有下一环节
            if (currentStageIndex + 1 < stages.length) {
              updatedStages[currentStageIndex + 1] = {
                ...updatedStages[currentStageIndex + 1],
                isActive: true,
              };

              set({
                stages: updatedStages,
                currentStageIndex: currentStageIndex + 1,
                currentMatchIndex: 0,
                screen: Screen.STAGE_TRANSITION,
                drawState: initialDrawState,
              });
            } else {
              // 比赛结束
              set({
                stages: updatedStages,
                screen: Screen.CHAMPION,
              });
            }
          }
        }
      },

      // 完成比赛
      completeMatch: (winnerId: string) => {
        const { stages, currentStageIndex, currentMatchIndex } = get();
        const currentStage = stages[currentStageIndex];
        if (!currentStage) return;

        const currentMatch = currentStage.matches[currentMatchIndex];
        if (!currentMatch) return;

        // 确定胜者
        const winner =
          currentMatch.player1?.id === winnerId
            ? currentMatch.player1
            : currentMatch.player2?.id === winnerId
            ? currentMatch.player2
            : undefined;

        if (!winner) return;

        // 更新比赛状态
        const updatedMatches = [...currentStage.matches];
        updatedMatches[currentMatchIndex] = {
          ...currentMatch,
          winner,
          status: MatchStatus.COMPLETED,
        };

        const updatedStages = [...stages];
        updatedStages[currentStageIndex] = {
          ...currentStage,
          matches: updatedMatches,
        };

        set({ stages: updatedStages });

        // 检查是否是决赛
        const completedMatches = updatedMatches.filter((m) => m.status === MatchStatus.COMPLETED).length;
        const totalMatches = updatedMatches.length;
        const isFinal = currentStageIndex === stages.length - 1 && completedMatches === totalMatches;

        if (isFinal) {
          set({ champion: winner, screen: Screen.CHAMPION });
        } else {
          // 继续下一场
          get().nextMatch();
        }
      },

      // 重置比赛
      resetTournament: () => {
        set({
          screen: Screen.SPLASH,
          stages: [],
          currentStageIndex: 0,
          currentMatchIndex: 0,
          drawState: initialDrawState,
          techPoolState: initialTechPoolState,
          champion: null,
        });
      },
    }),
    {
      name: 'wotagei-tournament-storage',
      partialize: (state) => ({
        tournament: state.tournament,
      }),
    }
  )
);
