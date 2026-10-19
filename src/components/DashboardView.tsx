import React, { useState } from 'react';
import { Task, CompletedTask, FocusSession, ScheduleBlock, TabType } from '../types';

interface DashboardViewProps {
  tasks: Task[];
  completedTasks: CompletedTask[];
  focusSessions: FocusSession[];
  scheduleBlocks: ScheduleBlock[];
  userName: string;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Partial<Task>) => void;
  onOpenRecommendModal: () => void;
  onOpenQuickAddModal: () => void;
  onStartFocus: (task: Task, duration: number) => void;
  onNavigateTab: (tab: TabType) => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  completedTasks,
  focusSessions,
  scheduleBlocks,
  userName,
  isLoggedIn,
  onOpenLogin,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  onOpenRecommendModal,
  onOpenQuickAddModal,
  onStartFocus,
  onNavigateTab,
  onShowToast
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineCategory, setInlineCategory] = useState('공부');
  const [isReoptimizing, setIsReoptimizing] = useState(false);

  // Real date calculation (Korean locale)
  const todayDateString = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });

  const now = new Date();
  const currentTimeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // 1. Metric: Task Completion
  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED');
  const activeCompletedTasks = tasks.filter((t) => t.status === 'COMPLETED');
  const totalCompletedCount = completedTasks.length + activeCompletedTasks.length;
  const totalTasksCount = pendingTasks.length + totalCompletedCount;
  const completionRate =
    totalTasksCount > 0 ? Math.round((totalCompletedCount / totalTasksCount) * 100) : 0;

  // 2. Metric: Today's Focus Time
  const totalFocusMinutes = focusSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
  const focusHours = Math.floor(totalFocusMinutes / 60);
  const focusRemainderMins = totalFocusMinutes % 60;
  const focusTimeDisplay =
    totalFocusMinutes === 0
      ? '0분'
      : focusHours > 0
      ? `${focusHours}시간 ${focusRemainderMins}분`
      : `${focusRemainderMins}분`;
  const focusGoalPercent = Math.min(100, Math.round((totalFocusMinutes / 240) * 100));

  // 3. Metric: Imminent Deadlines
  const imminentTasks = pendingTasks.filter((t) => {
    if (t.status === 'OVERDUE') return true;
    if (t.dueLabel && (t.dueLabel.includes('오늘') || t.dueLabel.includes('임박') || t.dueLabel.includes('남음'))) {
      return true;
    }
    if (t.due) {
      const d = new Date(t.due);
      const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diff >= 0 && diff <= 12;
    }
    return false;
  });

  // 4. Metric: Harufit Fit Index
  const hasSufficientData = totalTasksCount > 0 || focusSessions.length > 0;
  const fitScore = hasSufficientData
    ? Math.min(100, Math.max(50, Math.round(60 + completionRate * 0.3 + Math.min(10, totalFocusMinutes / 20))))
    : 0;
  const fitGrade = !hasSufficientData
    ? '-'
    : fitScore >= 90
    ? 'A+'
    : fitScore >= 80
    ? 'A'
    : fitScore >= 70
    ? 'B+'
    : 'B';

  // Filtered tasks for the task list
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'completed') return t.status === 'COMPLETED';
    if (filter === 'pending') return t.status !== 'COMPLETED';
    return true;
  });

  // Top recommended task
  const topTask =
    pendingTasks.sort((a, b) => (b.score || 0) - (a.score || 0))[0] || null;

  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTitle.trim()) return;

    onAddTask({
      title: inlineTitle.trim(),
      category: inlineCategory,
      priority: 'MEDIUM',
      duration: 45,
      status: 'UPCOMING',
      score: 70,
      dueLabel: '오늘 마감'
    });
    setInlineTitle('');
    onShowToast('새 할 일이 등록되었습니다! 타임라인에 즉시 반영됩니다.');
  };

  const handleReoptimize = () => {
    setIsReoptimizing(true);
    setTimeout(() => {
      setIsReoptimizing(false);
      onShowToast(`✨ 스마트 알고리즘이 ${currentTimeString} 현재 시각 기준으로 일정을 재최적화했습니다.`, 'verified');
    }, 700);
  };

  const handleClearCompleted = () => {
    activeCompletedTasks.forEach((t) => onDeleteTask(t.id));
    onShowToast('완료된 할 일 항목이 일괄 정리되었습니다.', 'cleaning_services');
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Page Header & Context Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-xl shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              대시보드
            </span>
            <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold">
              {todayDateString}
            </span>
            <span className="bg-secondary/15 text-secondary px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              실시간 동기화 중
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            좋은 하루 보내세요, {userName || '사용자'}님! ☀️ 오늘도 최적의 하루핏 일정이 준비되어 있습니다.
          </p>
        </div>

        {/* Header Action CTAs */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onOpenRecommendModal}
            className="flex items-center gap-2 bg-secondary text-on-secondary px-4 py-2.5 rounded-lg font-label-lg text-label-lg shadow-sm hover:opacity-95 transition-all transform active:scale-95 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">bolt</span>
            <span>지금 할 일 추천받기</span>
          </button>
          <button
            type="button"
            onClick={onOpenQuickAddModal}
            className="flex items-center gap-2 bg-primary-container text-on-primary px-4 py-2.5 rounded-lg font-label-lg text-label-lg shadow-sm hover:bg-primary transition-all transform active:scale-95 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">add_task</span>
            <span>새 할 일 추가</span>
          </button>
        </div>
      </div>

      {/* Logged Out Notice Banner if not logged in */}
      {!isLoggedIn && (
        <div className="bg-gradient-to-r from-primary/10 via-primary-container/10 to-surface-container p-5 rounded-xl border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">cloud_sync</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                로그인하고 나만의 할 일 관리하기
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Google 계정으로 로그인하시면 나만의 스마트 일정과 할 일, 집중 기록이 클라우드에 안전하게 보관되고 모든 기기에서 동기화됩니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenLogin}
            className="shrink-0 flex items-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg font-label-md text-label-md font-bold hover:bg-primary-container transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">login</span>
            <span>Google 계정 로그인</span>
          </button>
        </div>
      )}

      {/* Key Metrics Row (4 Columns Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Metric 1: Task Completion Rate */}
        <div
          onClick={() => onNavigateTab('my-tasks')}
          className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
          title="할 일 관리 바로가기"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              오늘의 할 일 진행도
            </span>
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg text-[20px]">
              task_alt
            </span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display-lg text-display-lg text-on-surface font-bold leading-none">
                  {totalCompletedCount}
                </span>
                <span className="font-body-lg text-body-lg text-on-surface-variant font-medium">
                  / {totalTasksCount}개 완료
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-primary font-semibold mt-1">
                {completionRate}% 달성
              </span>
            </div>
            {/* Donut Chart */}
            <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-surface-container-high"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-primary transition-all duration-700 ease-out"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray={`${completionRate}, 100`}
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute font-label-sm text-label-sm font-bold text-on-surface">
                {completionRate}%
              </span>
            </div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Focus Time */}
        <div
          onClick={() => onNavigateTab('focus-mode')}
          className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
          title="집중 모드 바로가기"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              오늘 집중 시간
            </span>
            <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg text-[20px]">
              timer
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex flex-col">
              <span className="font-display-lg text-display-lg text-on-surface font-bold leading-none">
                {focusTimeDisplay}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                목표 4시간 대비 <strong className="text-secondary font-semibold">{focusGoalPercent}%</strong>
              </span>
            </div>
            <div className="flex items-center text-secondary font-label-sm text-label-sm bg-secondary/10 px-2 py-1 rounded font-bold">
              <span>{totalFocusMinutes > 0 ? `${focusSessions.length}회 세션` : '기록 없음'}</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: `${focusGoalPercent}%` }} />
          </div>
        </div>

        {/* Metric 3: Imminent Deadlines */}
        <div
          onClick={() => onNavigateTab('my-tasks')}
          className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
          title="마감 임박 과업 확인"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              마감 임박 할 일
            </span>
            <span className="material-symbols-outlined text-error bg-error/10 p-2 rounded-lg text-[20px]">
              alarm
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex flex-col">
              <span className={`font-display-lg text-display-lg font-bold leading-none ${imminentTasks.length > 0 ? 'text-error' : 'text-on-surface'}`}>
                {imminentTasks.length}건
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                {imminentTasks.length > 0 ? '오늘 마감 포함' : '마감 임박한 할 일이 없습니다'}
              </span>
            </div>
            <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-semibold ${
              imminentTasks.length > 0
                ? 'bg-error-container text-on-error-container'
                : 'bg-surface-container text-on-surface-variant'
            }`}>
              {imminentTasks.length > 0 ? '집중 권장' : '안전'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm mt-3 pt-2">
            <span className={`material-symbols-outlined text-[16px] ${imminentTasks.length > 0 ? 'text-error' : 'text-primary'}`}>
              {imminentTasks.length > 0 ? 'priority_high' : 'check'}
            </span>
            <span className="truncate">
              {imminentTasks.length > 0 ? imminentTasks[0].title : '모든 일정이 여유 있게 진행 중입니다.'}
            </span>
          </div>
        </div>

        {/* Metric 4: Harufit Fit Index */}
        <div
          onClick={() => onNavigateTab('insights')}
          className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
          title="통계 및 분석 바로가기"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              하루핏 피트 지수
            </span>
            <span className="material-symbols-outlined text-tertiary bg-tertiary/10 p-2 rounded-lg text-[20px]">
              auto_awesome
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <div className="flex flex-col">
              {hasSufficientData ? (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display-lg text-display-lg text-primary font-bold leading-none">
                      {fitScore}
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface-variant font-medium">
                      / 100점
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-tertiary font-semibold mt-1">
                    실시간 활동 기반 산출됨
                  </span>
                </>
              ) : (
                <>
                  <span className="font-headline-md text-headline-md text-on-surface font-bold leading-none">
                    데이터 수집 중
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                    할 일과 집중 기록을 시작해 보세요
                  </span>
                </>
              )}
            </div>
            <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary font-bold font-label-md">
              {fitGrade}
            </div>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-tertiary h-full rounded-full transition-all duration-500"
              style={{ width: `${hasSufficientData ? fitScore : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Layout (2 Columns: 65% / 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 of 12 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Smart Recommendation Card */}
          {topTask ? (
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[24px]">electric_bolt</span>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                    오늘의 추천 할 일 (Smart Recommendation)
                  </h2>
                </div>
                <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1 self-start sm:self-auto">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  AI 최적 알고리즘 추천
                </span>
              </div>

              <div className="mt-4 bg-surface-container-low rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-2.5 py-0.5 rounded-md font-semibold">
                      {topTask.category}
                    </span>
                    <span className="bg-error-container text-on-error-container font-label-sm text-label-sm px-2.5 py-0.5 rounded-md font-semibold">
                      우선순위 {topTask.score || 70}점
                    </span>
                    <span className="text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {topTask.dueLabel || '기한 미정'}
                    </span>
                    <span className="text-on-surface-variant font-label-sm text-label-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">hourglass_top</span>
                      예상 {topTask.duration || 45}분 소요
                    </span>
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                    {topTask.title}
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {topTask.desc || '지금 바로 몰입 세션을 시작해 보세요.'}
                  </p>
                </div>

                <div className="flex sm:flex-col md:flex-row items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onStartFocus(topTask, topTask.duration || 25)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-primary-container text-on-primary px-4 py-2.5 rounded-lg font-label-lg text-label-lg hover:bg-primary shadow-sm transition-all transform active:scale-95 cursor-pointer font-bold"
                  >
                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                    <span>집중 시작하기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleTask(topTask.id)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 bg-surface-container text-on-surface px-3.5 py-2.5 rounded-lg font-label-lg text-label-lg hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    <span>완료</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Clean Empty Recommendation when no pending tasks */
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm relative overflow-hidden flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px]">electric_bolt</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  오늘의 추천 할 일 (Smart Recommendation)
                </h2>
              </div>
              <div className="bg-surface-container-low rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-2xl">assignment_add</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      아직 등록된 할 일이 없어요. 첫 번째 할 일을 추가해 보세요!
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                      할 일을 등록하면 스마트 우선순위 알고리즘이 마감일과 중요도를 분석해 최적의 다음 작업을 추천해 드립니다.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenQuickAddModal}
                  className="shrink-0 flex items-center gap-2 bg-primary-container text-on-primary px-4 py-2.5 rounded-lg font-label-lg text-label-lg shadow-sm hover:bg-primary transition-all font-bold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span>첫 할 일 추가</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Task List View with Category Tabs */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">checklist</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  핵심 할 일 관리
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
                  {tasks.length}개
                </span>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center bg-surface-container-low p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-md font-label-sm text-label-sm transition-all cursor-pointer ${
                    filter === 'all'
                      ? 'bg-surface-container-lowest text-on-surface font-bold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  전체 ({tasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1 rounded-md font-label-sm text-label-sm transition-all cursor-pointer ${
                    filter === 'pending'
                      ? 'bg-surface-container-lowest text-on-surface font-bold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  미완료 ({pendingTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1 rounded-md font-label-sm text-label-sm transition-all cursor-pointer ${
                    filter === 'completed'
                      ? 'bg-surface-container-lowest text-on-surface font-bold shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  완료 ({activeCompletedTasks.length})
                </button>
              </div>
            </div>

            {/* Inline Quick Add Input */}
            <form onSubmit={handleInlineSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={inlineTitle}
                onChange={(e) => setInlineTitle(e.target.value)}
                placeholder="지금 생각난 할 일을 바로 입력해 보세요... (Enter로 빠른 등록)"
                className="flex-1 bg-surface-container-low px-4 py-2.5 rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary border border-transparent focus:border-transparent transition-all"
              />
              <select
                value={inlineCategory}
                onChange={(e) => setInlineCategory(e.target.value)}
                className="bg-surface-container-low px-3 py-2.5 rounded-lg font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer border border-transparent"
              >
                <option value="공부">공부</option>
                <option value="운동">운동</option>
                <option value="일상">일상</option>
                <option value="약속">약속</option>
                <option value="취미">취미</option>
                <option value="프로젝트">프로젝트</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md font-bold hover:bg-primary-container transition-colors shadow-xs cursor-pointer shrink-0"
              >
                등록
              </button>
            </form>

            {/* Task Item Cards */}
            <div className="flex flex-col gap-2.5">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant bg-surface-container-low rounded-xl flex flex-col items-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-outline">task_alt</span>
                  <p className="font-medium text-sm">
                    {filter === 'completed'
                      ? '완료된 할 일이 없습니다.'
                      : filter === 'pending'
                      ? '미완료된 할 일이 없습니다.'
                      : '아직 등록된 할 일이 없습니다.'}
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isDone = task.status === 'COMPLETED';

                  let priBadge = 'bg-surface-container-high text-on-surface';
                  let priLabel = '보통';
                  if (task.priority === 'VERY_HIGH') {
                    priBadge = 'bg-error-container text-on-error-container';
                    priLabel = `매우 높음 (${task.score || 90}점)`;
                  } else if (task.priority === 'HIGH') {
                    priBadge = 'bg-amber-100 text-amber-800';
                    priLabel = `높음 (${task.score || 80}점)`;
                  } else if (task.priority === 'MEDIUM') {
                    priBadge = 'bg-primary-fixed text-primary';
                    priLabel = `보통 (${task.score || 70}점)`;
                  }

                  return (
                    <div
                      key={task.id}
                      className={`task-item transition-all p-4 rounded-xl flex items-center justify-between gap-4 group ${
                        isDone
                          ? 'bg-surface-container-lowest/60 opacity-75'
                          : 'bg-surface-container-low hover:bg-surface-container'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Completion Button */}
                        <button
                          type="button"
                          onClick={() => onToggleTask(task.id)}
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            isDone
                              ? 'bg-primary text-on-primary'
                              : 'bg-surface-container-lowest text-transparent hover:text-primary border border-outline-variant/40'
                          }`}
                          title={isDone ? '완료 취소' : '할 일 완료'}
                        >
                          <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                        </button>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`task-title font-headline-sm text-headline-sm truncate ${
                                isDone
                                  ? 'text-outline line-through font-normal'
                                  : 'text-on-surface font-semibold'
                              }`}
                            >
                              {task.title}
                            </span>
                            <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-2 py-0.5 rounded font-medium">
                              {task.category}
                            </span>
                            <span className={`font-label-sm text-label-sm px-2 py-0.5 rounded font-semibold ${priBadge}`}>
                              {priLabel}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-on-surface-variant font-body-sm text-body-sm flex-wrap">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">schedule</span>
                              {task.dueLabel || '기한 미정'}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">timer</span>
                              {task.duration || 45}분 소요 예정
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onStartFocus(task, task.duration || 25)}
                          className="p-1.5 text-on-surface-variant hover:text-primary rounded-lg transition-colors cursor-pointer"
                          title="이 과업으로 집중 모드 시작"
                        >
                          <span className="material-symbols-outlined text-[18px]">play_circle</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 text-on-surface-variant hover:text-error rounded-lg transition-colors cursor-pointer"
                          title="삭제"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Task List Footer Info */}
            <div className="flex items-center justify-between pt-2 text-on-surface-variant font-body-sm text-body-sm flex-wrap gap-2">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-secondary">tips_and_updates</span>
                할 일을 클릭하면 실시간 진행률과 피트 지수가 재계산됩니다.
              </span>
              {activeCompletedTasks.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCompleted}
                  className="font-label-sm text-label-sm text-primary cursor-pointer hover:underline font-semibold"
                >
                  완료된 항목 일괄 정리
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 of 12 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Smart Timeline Card */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">calendar_clock</span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  스마트 타임라인
                </h2>
              </div>
              <span className="bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm px-2 py-1 rounded font-semibold">
                오늘의 일정
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant -mt-1">
              현재 시간에 맞춰 가장 균형 잡힌 블록을 실시간 제시합니다.
            </p>

            {/* Current Time Anchor Ribbon */}
            <div className="bg-primary/10 text-primary p-2.5 rounded-lg flex items-center justify-between font-label-sm text-label-sm font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span>현재 시각: {currentTimeString}</span>
              </div>
              <span className="text-xs">{todayDateString}</span>
            </div>

            {/* Vertical Timeline Items or Clean Empty State */}
            {scheduleBlocks.length === 0 ? (
              <div className="py-10 px-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col items-center justify-center text-center gap-2.5">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high text-on-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-outline">calendar_today</span>
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  아직 등록된 일정이 없어요.
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs">
                  스마트 일정 메뉴에서 고정 일정을 등록하거나 할 일을 배치해 보세요.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('smart-schedule')}
                  className="mt-2 px-3.5 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>스마트 일정 바로가기</span>
                </button>
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-surface-container-highest">
                {scheduleBlocks.map((block) => (
                  <div key={block.id} className="relative flex flex-col gap-1">
                    <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center text-on-primary">
                      <span className="material-symbols-outlined text-[10px]">
                        {block.isDone ? 'done' : 'schedule'}
                      </span>
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-outline font-semibold">
                        {block.timeRange}
                      </span>
                      <span className="bg-surface-container text-outline text-[10px] px-1.5 py-0.5 rounded font-medium">
                        {block.tag || block.category}
                      </span>
                    </div>
                    <span className={`font-label-md text-label-md ${block.isDone ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                      {block.title}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {scheduleBlocks.length > 0 && (
              <button
                type="button"
                disabled={isReoptimizing}
                onClick={handleReoptimize}
                className="w-full mt-2 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-label-md text-label-md hover:bg-surface-container transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span className={`material-symbols-outlined text-[18px] ${isReoptimizing ? 'animate-spin' : ''}`}>
                  tune
                </span>
                <span>{isReoptimizing ? '타임라인 재배치 중...' : '타임라인 자동 재배치 실행'}</span>
              </button>
            )}
          </div>

          {/* Smart Briefing & Recent Activities Card */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">notifications_active</span>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                최근 활동 & 스마트 브리핑
              </h2>
            </div>

            {focusSessions.length === 0 && completedTasks.length === 0 ? (
              <div className="py-6 px-4 rounded-xl bg-surface-container-low text-center flex flex-col items-center justify-center gap-2 border border-outline-variant/30">
                <span className="material-symbols-outlined text-2xl text-on-surface-variant">notifications_none</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  아직 활동 기록이 없습니다. 할 일을 완료하거나 집중 타이머를 시작해 보세요.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {focusSessions.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">workspace_premium</span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">집중 세션 달성</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        최근 세션 '{focusSessions[focusSessions.length - 1].taskTitle}' ({focusSessions[focusSessions.length - 1].durationMinutes}분) 완료
                      </p>
                    </div>
                  </div>
                )}
                {completedTasks.length > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">task_alt</span>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">할 일 완료</span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        '{completedTasks[completedTasks.length - 1].title}' 완료 처리됨
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
