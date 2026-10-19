import React from 'react';
import { Task } from '../types';

interface RecommendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFocus: (task: Task, duration: number) => void;
  recommendedTask: Task;
}

export const RecommendModal: React.FC<RecommendModalProps> = ({
  isOpen,
  onClose,
  onStartFocus,
  recommendedTask
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-xl flex flex-col gap-5 transform transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[24px]">bolt</span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
              하루핏 스마트 AI 추천 엔진
            </h3>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="font-body-md text-body-md text-on-surface-variant">
          민지님의 현재 남은 에너지, 마감 긴급도, 일일 목표 시간을 종합 분석하여 다음 집중 항목을 선정했습니다.
        </p>

        <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="bg-primary-container text-on-primary font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-semibold">
              1순위 추천 (적합도 {recommendedTask.score || 98}%)
            </span>
            <span className="text-error font-label-sm text-label-sm font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">timer</span>
              {recommendedTask.dueLabel || '마감 3시간 45분 전'}
            </span>
          </div>

          <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            [{recommendedTask.category}] {recommendedTask.title}
          </h4>

          <div className="grid grid-cols-2 gap-2 text-on-surface-variant font-body-sm text-body-sm pt-1">
            <div>권장 집중 시간: <strong className="text-on-surface">{recommendedTask.duration || 90}분 (블록)</strong></div>
            <div>예상 피로도: <strong className="text-on-surface">보통 (Tier 2)</strong></div>
            <div>피트 지수 예상: <strong className="text-primary">+6점 상승</strong></div>
            <div>추천 휴식 시각: <strong className="text-on-surface">15:00</strong></div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-container">
          <button
            type="button"
            className="px-4 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
            onClick={onClose}
          >
            나중에 하기
          </button>
          <button
            type="button"
            className="bg-secondary text-on-secondary px-5 py-2.5 rounded-lg font-label-lg text-label-lg shadow-sm hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            onClick={() => {
              onStartFocus(recommendedTask, recommendedTask.duration || 90);
              onClose();
            }}
          >
            <span className="material-symbols-outlined text-[18px]">play_circle</span>
            <span>지금 {recommendedTask.duration || 90}분 세션 시작</span>
          </button>
        </div>
      </div>
    </div>
  );
};
