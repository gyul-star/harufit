import React, { useState, useRef } from 'react';
import { ScheduleBlock } from '../types';

interface SmartScheduleViewProps {
  scheduleBlocks: ScheduleBlock[];
  onOpenAddFixedModal: () => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const SmartScheduleView: React.FC<SmartScheduleViewProps> = ({
  scheduleBlocks,
  onOpenAddFixedModal,
  onShowToast
}) => {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [isReoptimizing, setIsReoptimizing] = useState(false);
  const [restMinutes, setRestMinutes] = useState(15);
  const [isDeadlineWeightEnabled, setIsDeadlineWeightEnabled] = useState(true);
  const [lockedTasks, setLockedTasks] = useState<Record<string, boolean>>({});
  const [completedBlocks, setCompletedBlocks] = useState<Record<string, boolean>>({});

  const rulesRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const todayDateString = now.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });
  const currentTimeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const fixedBlocksCount = scheduleBlocks.filter((b) => b.isLocked || b.tag === '고정').length;
  const placedBlocksCount = scheduleBlocks.filter((b) => !b.isLocked && b.tag !== '고정' && b.type !== 'EMPTY').length;

  const handleReoptimize = () => {
    setIsReoptimizing(true);
    setTimeout(() => {
      setIsReoptimizing(false);
      onShowToast(
        `✨ 최적 스케줄 재산출 완료: ${currentTimeString} 현재 시각 기준으로 타임라인이 재배치되었습니다.`,
        'verified'
      );
    }, 700);
  };

  const handleSwitchView = (mode: 'day' | 'week') => {
    setViewMode(mode);
    onShowToast(
      mode === 'day'
        ? '일간 타임라인 상세 뷰로 전환했습니다.'
        : '주간 스마트 스케줄 캘린더 매트릭스 뷰로 확장됩니다.'
    );
  };

  const toggleLock = (id: string) => {
    const nextState = !lockedTasks[id];
    setLockedTasks((prev) => ({ ...prev, [id]: nextState }));
    onShowToast(
      nextState
        ? '이 작업의 시간대를 고정 잠금 상태로 전환했습니다.'
        : '작업 잠금이 해제되었습니다.',
      'lock'
    );
  };

  const toggleComplete = (id: string) => {
    const nextState = !completedBlocks[id];
    setCompletedBlocks((prev) => ({ ...prev, [id]: nextState }));
    onShowToast(
      nextState ? '작업 완료 체크!' : '작업 완료가 취소되었습니다.',
      'task_alt'
    );
  };

  const scrollToParameters = () => {
    rulesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="flex flex-col w-full">
      {/* Page Header & Global Scheduler Controls */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-primary-fixed text-primary font-bold">
                <span className="material-symbols-outlined text-[14px] mr-1">auto_awesome</span>
                스마트 일정 엔진
              </span>
              <span className="font-label-sm text-label-sm text-outline">실시간 최적화 가동 중</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              스마트 일정 (Smart Schedule)
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              남은 가용 시간과 할 일의 소요 시간을 분석해 충돌 없이 최적의 일정을 자동 구성합니다.
            </p>
          </div>

          {/* Action Cluster */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Day / Week View Segmented Toggle */}
            <div className="flex items-center bg-surface-container-high p-1 rounded-xl shadow-inner">
              <button
                type="button"
                onClick={() => handleSwitchView('day')}
                className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                  viewMode === 'day'
                    ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                일간 타임라인
              </button>
              <button
                type="button"
                onClick={() => handleSwitchView('week')}
                className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-surface-container-lowest text-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                주간 매트릭스
              </button>
            </div>

            {/* Register Fixed Block CTA */}
            <button
              type="button"
              onClick={onOpenAddFixedModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container-low text-on-surface font-label-md text-label-md font-semibold transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">lock_clock</span>
              <span>고정 일정 등록</span>
            </button>

            {/* Re-optimize CTA */}
            <button
              type="button"
              disabled={isReoptimizing || scheduleBlocks.length === 0}
              onClick={handleReoptimize}
              className="relative group flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container text-on-primary hover:bg-primary transition-all shadow-md active:scale-95 font-label-md text-label-md font-bold overflow-hidden cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className={`material-symbols-outlined text-[18px] ${isReoptimizing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isReoptimizing ? 'AI 알고리즘 분석 중...' : '일정 자동 재최적화'}</span>
            </button>
          </div>
        </div>

        {/* Algorithm Status Bar & Live Metrics Banner */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Status Card */}
          <div className="md:col-span-8 bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-label-md text-label-md text-primary font-bold">
                    {scheduleBlocks.length > 0 ? '최적화 완료됨' : '등록된 일정 없음'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    {scheduleBlocks.length > 0
                      ? `고정 일정 ${fixedBlocksCount}건 보호됨 · 배치 일정 ${placedBlocksCount}건`
                      : '고정 일정을 추가해 하루핏 스마트 타임라인을 시작하세요.'}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface mt-0.5">
                  {scheduleBlocks.length > 0
                    ? `휴식 시간 ${restMinutes}분을 포함하여 일정 충돌 없이 구성되었습니다.`
                    : '새로운 일정을 추가하면 AI 엔진이 가용 시간과 최적 배치 슬롯을 자동으로 계산합니다.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-center shrink-0 pl-2">
              <div className="flex flex-col items-end">
                <span className="font-label-sm text-label-sm text-on-surface-variant">마감 준수율</span>
                <span className="font-headline-md text-headline-md text-primary font-bold">
                  {scheduleBlocks.length > 0 ? '100%' : '0%'}
                </span>
              </div>
              <div className="flex flex-col items-end pl-3 border-l border-surface-container">
                <span className="font-label-sm text-label-sm text-on-surface-variant">남은 여유 시간</span>
                <span className="font-headline-md text-headline-md text-secondary font-bold">
                  {scheduleBlocks.length > 0 ? '계산 완료' : '0분'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Schedule Constraints Tag Card */}
          <div className="md:col-span-4 bg-surface-container-low p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">현재 적용 규칙</span>
              <span className="font-label-md text-label-md text-on-surface font-bold mt-0.5">08:00 ~ 23:00 (15시간)</span>
              <span className="font-body-sm text-body-sm text-secondary font-semibold">스마트 인터벌: {restMinutes}분 휴식</span>
            </div>
            <button
              type="button"
              onClick={scrollToParameters}
              className="p-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all cursor-pointer"
              title="규칙 변경하기"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Work Canvas (2 Columns: Timeline / Aux Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT SIDE: Interactive Schedule Timeline */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          {/* Timeline Control & Legend Strip */}
          <div className="bg-surface-container-lowest px-5 py-3 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {viewMode === 'day' ? '오늘 하루 타임라인' : '주간 스마트 스케줄 매트릭스'}
              </span>
              <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container-highest text-on-surface-variant font-medium">
                {todayDateString}
              </span>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-surface-container-highest shadow-inner" />
                <span className="font-label-sm text-label-sm text-on-surface-variant">고정 일정 (Lock)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-primary-fixed shadow-inner" />
                <span className="font-label-sm text-label-sm text-on-surface-variant">스마트 자동배치</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-secondary-fixed shadow-inner" />
                <span className="font-label-sm text-label-sm text-on-surface-variant">리프레시 휴식</span>
              </div>
            </div>
          </div>

          {/* Timeline Main View Container */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-4 sm:p-6 relative overflow-hidden">
            {scheduleBlocks.length === 0 ? (
              <div className="py-16 px-4 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">event_busy</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  아직 등록된 일정이 없어요.
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
                  우측 상단의 고정 일정 등록 버튼을 눌러 회의나 학습 일정을 추가해 보세요.
                </p>
                <button
                  type="button"
                  onClick={onOpenAddFixedModal}
                  className="mt-2 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>고정 일정 등록하기</span>
                </button>
              </div>
            ) : (
              <div className="relative flex flex-col gap-6 select-none">
                {scheduleBlocks.map((block) => {
                  const isCompleted = completedBlocks[block.id];
                  const isLocked = lockedTasks[block.id] ?? block.isLocked;

                  return (
                    <div key={block.id} className="flex items-start gap-4">
                      <div className="w-14 shrink-0 text-right font-label-md text-label-md text-on-surface-variant font-semibold pt-1">
                        {block.timeRange.split(' - ')[0]}
                      </div>
                      <div className="flex-1 bg-surface-container-low rounded-xl p-4 shadow-sm flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded font-label-sm text-label-sm bg-primary/10 text-primary font-bold">
                              {block.tag || block.category}
                            </span>
                            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                              {block.title}
                            </span>
                          </div>
                          <span className="text-xs text-on-surface-variant font-mono">
                            {block.timeRange}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleLock(block.id)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                            title={isLocked ? '잠금 해제' : '고정 잠금'}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isLocked ? 'lock' : 'lock_open'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleComplete(block.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isCompleted ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                            title={isCompleted ? '완료 취소' : '완료 처리'}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isCompleted ? 'task_alt' : 'check_circle'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT SIDE: Aux Panels (Unscheduled, Parameters, Diff Viewer) */}
        <aside className="lg:col-span-4 flex flex-col gap-6">
          {/* 1. Unscheduled Tasks Card */}
          <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">pending_actions</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  미배치 할 일
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold bg-surface-container-high text-outline">
                0건 대기
              </span>
            </div>

            <div className="py-6 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-primary text-[32px] mb-1">done_all</span>
              <p className="font-label-md text-label-md text-on-surface font-bold">
                미배치된 할 일이 없습니다.
              </p>
              <p className="font-body-sm text-body-sm text-outline mt-0.5">
                할 일을 추가하면 자동으로 최적 타임슬롯을 계산합니다.
              </p>
            </div>
          </div>

          {/* 2. User Parameters Card */}
          <div ref={rulesRef} className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">tune</span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  스마트 최적화 규칙
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRestMinutes(15);
                  setIsDeadlineWeightEnabled(true);
                  onShowToast('스마트 배치 규칙이 권장 기본값으로 재설정되었습니다.', 'restart_alt');
                }}
                className="font-label-sm text-label-sm text-outline hover:text-primary transition-colors cursor-pointer"
              >
                기본값 복원
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* Day Start */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-medium">하루 시작 시간</span>
                  <span className="font-body-sm text-body-sm text-outline">작업 가능 시작 시점</span>
                </div>
                <select className="bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                  <option>07:30</option>
                  <option defaultValue="08:30">08:30</option>
                  <option>09:00</option>
                </select>
              </div>

              {/* Day End */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-medium">하루 마감 시간</span>
                  <span className="font-body-sm text-body-sm text-outline">이후 집중 작업 배제</span>
                </div>
                <select className="bg-surface-container-low text-on-surface font-label-md text-label-md rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                  <option>22:00</option>
                  <option defaultValue="23:00">23:00</option>
                  <option>24:00</option>
                </select>
              </div>

              {/* Interval Rest */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-medium">인터벌 휴식</span>
                  <span className="font-body-sm text-body-sm text-outline">집중 세션 후 자동 삽입</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRestMinutes(Math.max(5, restMinutes - 5))}
                    className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-on-surface hover:bg-surface-container-highest cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-label-md text-label-md font-bold px-2 text-on-surface">
                    {restMinutes}분
                  </span>
                  <button
                    type="button"
                    onClick={() => setRestMinutes(Math.min(45, restMinutes + 5))}
                    className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-on-surface hover:bg-surface-container-highest cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Deadline Weight Switch */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-medium">마감 임박 작업 가중치</span>
                  <span className="font-body-sm text-body-sm text-outline">마감 24시간 이내 작업 우선 배치</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDeadlineWeightEnabled(!isDeadlineWeightEnabled)}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer ${
                    isDeadlineWeightEnabled ? 'bg-primary' : 'bg-outline-variant'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                      isDeadlineWeightEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onShowToast(`스마트 규칙(${restMinutes}분 휴식)을 적용하여 일정을 재계산했습니다.`, 'verified')}
              className="w-full mt-2 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-md text-label-md font-bold transition-colors cursor-pointer"
            >
              규칙 적용 및 즉시 재배치
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
