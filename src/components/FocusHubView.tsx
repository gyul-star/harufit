import React, { useState, useEffect, useRef } from 'react';
import { Task, CompletedTask, FocusSession } from '../types';
import { playAmbientSound, stopAmbientSound } from '../utils/audio';

interface FocusHubViewProps {
  tasks: Task[];
  completedTasks?: CompletedTask[];
  initialMode?: 'focus' | 'insights';
  focusSessions: FocusSession[];
  onAddFocusSession: (session: FocusSession) => void;
  onShowToast: (message: string, icon?: string) => void;
  initialSelectedTaskId?: string;
  initialPresetDuration?: number;
}

export const FocusHubView: React.FC<FocusHubViewProps> = ({
  tasks,
  completedTasks = [],
  initialMode = 'focus',
  focusSessions,
  onAddFocusSession,
  onShowToast,
  initialSelectedTaskId,
  initialPresetDuration
}) => {
  const [activeTab, setActiveTab] = useState<'focus' | 'insights'>(initialMode);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    initialSelectedTaskId || (tasks[0]?.id ?? '')
  );

  // Timer states
  const [currentPresetMinutes, setCurrentPresetMinutes] = useState(initialPresetDuration || 25);
  const [sessionLabel, setSessionLabel] = useState(
    initialPresetDuration ? `맞춤 집중 ${initialPresetDuration}분` : '뽀모도로 25분'
  );
  const [totalSeconds, setTotalSeconds] = useState((initialPresetDuration || 25) * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activeSound, setActiveSound] = useState<'rain' | 'cafe' | 'binaural' | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ringCircumference = 640.88; // 2 * Math.PI * 102

  useEffect(() => {
    setActiveTab(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (initialSelectedTaskId) {
      setSelectedTaskId(initialSelectedTaskId);
    }
  }, [initialSelectedTaskId]);

  useEffect(() => {
    if (initialPresetDuration) {
      setPreset(initialPresetDuration, `맞춤 집중 ${initialPresetDuration}분`);
    }
  }, [initialPresetDuration]);

  // Tick timer
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleFinishSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAmbientSound();
    };
  }, []);

  const setPreset = (mins: number, label: string) => {
    setIsRunning(false);
    setCurrentPresetMinutes(mins);
    setSessionLabel(label);
    setTotalSeconds(mins * 60);
  };

  const handleCustomDuration = () => {
    const input = window.prompt('설정할 집중 시간(분 단위, 5~180)을 입력하세요:', '35');
    if (input) {
      const parsed = parseInt(input, 10);
      if (!isNaN(parsed) && parsed >= 5 && parsed <= 180) {
        setPreset(parsed, `사용자 정의 ${parsed}분`);
        onShowToast(`타이머가 ${parsed}분으로 설정되었습니다.`, 'tune');
      }
    }
  };

  const toggleTimer = () => {
    if (totalSeconds <= 0) {
      setTotalSeconds(currentPresetMinutes * 60);
    }
    const nextState = !isRunning;
    setIsRunning(nextState);
    if (nextState) {
      onShowToast(`몰입 타이머가 시작되었습니다! (${sessionLabel})`, 'play_arrow');
    } else {
      onShowToast('타이머가 일시 정지되었습니다.', 'pause');
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTotalSeconds(currentPresetMinutes * 60);
    onShowToast('타이머가 초기화되었습니다.', 'refresh');
  };

  const handleFinishSession = () => {
    setIsRunning(false);
    const selectedTask = tasks.find((t) => t.id === selectedTaskId);
    const taskName = selectedTask ? selectedTask.title : '일반 딥워크 세션';
    const cat = selectedTask ? selectedTask.category : '학습';
    const elapsedMinutes = Math.max(1, Math.round((currentPresetMinutes * 60 - totalSeconds) / 60));

    const now = new Date();
    const startTime = new Date(now.getTime() - elapsedMinutes * 60000);
    const formatTime = (d: Date) =>
      `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

    const newSession: FocusSession = {
      id: 'session-' + Date.now(),
      timeRange: `${formatTime(startTime)} - ${formatTime(now)}`,
      durationMinutes: elapsedMinutes,
      taskTitle: taskName,
      category: cat,
      status: '완료'
    };

    onAddFocusSession(newSession);
    setTotalSeconds(currentPresetMinutes * 60);
    onShowToast(`🎉 ${elapsedMinutes}분 집중 세션이 완료되어 기록되었습니다!`, 'verified');
  };

  const handleToggleSound = (type: 'rain' | 'cafe' | 'binaural') => {
    if (activeSound === type) {
      stopAmbientSound();
      setActiveSound(null);
      onShowToast('앰비언트 사운드를 껐습니다.', 'volume_off');
    } else {
      playAmbientSound(type);
      setActiveSound(type);
      const labels = {
        rain: '숲속 빗소리',
        cafe: '카페 백색소음',
        binaural: '알파파 바이노럴 비트'
      };
      onShowToast(`🎧 ${labels[type]} 재생 중`, 'volume_up');
    }
  };

  // Timer format display
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentPresetSeconds = currentPresetMinutes * 60;
  const progressRatio = currentPresetSeconds > 0 ? (currentPresetSeconds - totalSeconds) / currentPresetSeconds : 0;
  const strokeDashoffset = ringCircumference * (1 - progressRatio);

  // Compute real metrics from focusSessions & tasks
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
  const avgSessionLength =
    focusSessions.length > 0 ? Math.round(totalFocusMinutes / focusSessions.length) : 0;

  // Completion calculation for Insights
  const activeCompleted = tasks.filter((t) => t.status === 'COMPLETED');
  const totalCompletedCount = completedTasks.length + activeCompleted.length;
  const totalTasksCount = tasks.length + completedTasks.length;
  const completionRate =
    totalTasksCount > 0 ? Math.round((totalCompletedCount / totalTasksCount) * 100) : 0;

  // Overdue calculation
  const overdueTasks = tasks.filter((t) => t.status === 'OVERDUE');
  const delayRate = tasks.length > 0 ? Math.round((overdueTasks.length / tasks.length) * 100) : 0;

  // Category breakdown from real sessions
  const categoryMinutes: Record<string, number> = {};
  focusSessions.forEach((s) => {
    categoryMinutes[s.category] = (categoryMinutes[s.category] || 0) + s.durationMinutes;
  });
  const topCategoryEntry = Object.entries(categoryMinutes).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryEntry ? topCategoryEntry[0] : null;
  const topCategoryMinutes = topCategoryEntry ? topCategoryEntry[1] : 0;

  return (
    <div className="flex flex-col w-full gap-6 max-w-6xl mx-auto">
      {/* Top Banner Navigation & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-xl shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">timelapse</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-primary font-bold tracking-wider">
                PRO WORKFLOW
              </span>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                몰입 (Focus Hub)
              </h1>
            </div>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            딥워크 세션 측정 및 지능형 생산성 데이터 분석
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/30">
          <button
            type="button"
            onClick={() => setActiveTab('focus')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-label-lg text-label-lg transition-all cursor-pointer ${
              activeTab === 'focus'
                ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">timer</span>
            <span>집중 모드 (Timer)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-label-lg text-label-lg transition-all cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-surface-container-lowest text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">bar_chart</span>
            <span>통계 및 분석 (Insights)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: FOCUS MODE TIMER */}
      {activeTab === 'focus' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Interactive Stopwatch / Timer Card */}
            <div className="lg:col-span-8 bg-surface-container-lowest p-6 sm:p-8 rounded-xl shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
              {/* Task Selector Dropdown Header */}
              <div className="w-full max-w-md flex flex-col gap-1.5 mb-6">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                  집중할 대상 태스크 선택
                </span>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-label-md focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                  {tasks.length === 0 ? (
                    <option value="">등록된 할 일 없음 (자유 몰입 세션)</option>
                  ) : (
                    tasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.category}] {t.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Preset Quick Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
                <button
                  type="button"
                  onClick={() => setPreset(15, '숏 딥워크 15분')}
                  className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                    currentPresetMinutes === 15
                      ? 'bg-primary text-on-primary font-bold shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  15분 퀵
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(25, '뽀모도로 25분')}
                  className={`px-3.5 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                    currentPresetMinutes === 25
                      ? 'bg-primary text-on-primary font-bold shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  25분 뽀모도로
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(50, '딥 릴리즈 50분')}
                  className={`px-3.5 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                    currentPresetMinutes === 50
                      ? 'bg-primary text-on-primary font-bold shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  50분 몰입
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(90, '울트라 러닝 90분')}
                  className={`px-3.5 py-1.5 rounded-lg font-label-sm text-label-sm transition-all cursor-pointer ${
                    currentPresetMinutes === 90
                      ? 'bg-primary text-on-primary font-bold shadow-xs'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  90분 마라톤
                </button>
                <button
                  type="button"
                  onClick={handleCustomDuration}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-primary font-label-sm text-label-sm flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">tune</span>
                  <span>시간 직접 설정</span>
                </button>
              </div>

              {/* Large Circular Dial */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex flex-col items-center justify-center select-none my-2">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 240 240">
                  <circle
                    cx="120"
                    cy="120"
                    r="102"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-surface-container-high"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="102"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-500 ease-linear"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-label-sm text-label-sm text-primary font-bold tracking-widest uppercase mb-1">
                    {sessionLabel}
                  </span>
                  <span className="font-display-lg text-4xl sm:text-5xl font-black text-on-surface tracking-tight">
                    {timeString}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-2 font-medium">
                    {isRunning ? '몰입 진행 중' : '일시 정지됨'}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-4 flex items-center gap-2 px-4 py-2 bg-surface-container-low/80 rounded-full">
                <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {isRunning
                    ? '방해 없는 몰입 상태입니다. 집중 기록은 자동으로 Insights 통계에 누적됩니다.'
                    : '준비가 완료되면 시작 버튼을 눌러 몰입 세션을 개시하세요.'}
                </span>
              </div>

              {/* Action Control Bar */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
                <button
                  type="button"
                  onClick={toggleTimer}
                  className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-label-lg text-label-lg bg-primary-container text-on-primary hover:bg-primary transition-all duration-150 shadow-md transform active:scale-95 cursor-pointer font-bold"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {isRunning ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{isRunning ? '일시 정지 (Pause)' : '집중 시작 (Start)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinishSession}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-label-lg text-label-lg bg-surface-container-high text-on-surface hover:bg-surface-variant transition-all duration-150 cursor-pointer font-semibold"
                >
                  <span className="material-symbols-outlined text-[20px]">save</span>
                  <span>세션 완료 & 저장</span>
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  className="flex items-center justify-center w-12 h-12 rounded-xl bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all duration-150 cursor-pointer"
                  title="타이머 초기화"
                >
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
              </div>
            </div>

            {/* Right 4 Cols: Performance Metrics & Audio Helper */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Today's Focus Performance Metrics Card */}
              <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    오늘의 집중 달성
                  </span>
                  <span className="material-symbols-outlined text-secondary text-[22px]">local_fire_department</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 bg-surface-container-low rounded-xl flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">총 집중 시간</span>
                    <span className="font-headline-md text-headline-md text-primary mt-1 font-bold">
                      {focusTimeDisplay}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant/80 mt-0.5">
                      목표 4시간 ({focusGoalPercent}%)
                    </span>
                  </div>

                  <div className="p-3.5 bg-surface-container-low rounded-xl flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">완료 세션</span>
                    <span className="font-headline-md text-headline-md text-on-surface mt-1 font-bold">
                      {focusSessions.length}회
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary mt-0.5 font-medium">
                      {focusSessions.length > 0 ? '누적 집계됨' : '기록 없음'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-surface-container-low rounded-xl flex flex-col">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">평균 세션 길이</span>
                    <span className="font-headline-md text-headline-md text-on-surface mt-1 font-bold">
                      {avgSessionLength}분
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5 font-medium">
                      {focusSessions.length > 0 ? '실제 평균치' : '기록 없음'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-secondary-fixed/50 rounded-xl flex flex-col">
                    <span className="font-label-sm text-label-sm text-secondary font-semibold">연속 스트릭</span>
                    <span className="font-headline-md text-headline-md text-secondary mt-1 font-bold">
                      {focusSessions.length > 0 ? '1일차' : '0일'}
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary/90 mt-0.5 font-medium">
                      {focusSessions.length > 0 ? '진행 중' : '시작 대기'}
                    </span>
                  </div>
                </div>

                {/* Daily Goal Progress Mini Meter */}
                <div className="flex flex-col gap-1.5 pt-2">
                  <div className="flex justify-between font-label-sm text-label-sm">
                    <span className="text-on-surface-variant">일일 몰입 4시간 게이지</span>
                    <span className="text-primary font-bold">{totalFocusMinutes}분 / 240분</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                    <div
                      className="h-full bg-primary-container rounded-full transition-all duration-300"
                      style={{ width: `${focusGoalPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Ambient Focus Ambience & Sound Toggle Mini Card */}
              <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[20px]">headphones</span>
                    <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                      화이트 노이즈 & 앰비언트
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-tertiary-fixed text-tertiary font-bold">
                    집중 촉진
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleSound('rain')}
                    className={`sound-chip p-2.5 rounded-lg font-label-sm text-label-sm flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      activeSound === 'rain'
                        ? 'bg-primary text-on-primary shadow-sm font-bold'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">rainy</span>
                    <span>숲속 빗소리</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleSound('cafe')}
                    className={`sound-chip p-2.5 rounded-lg font-label-sm text-label-sm flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      activeSound === 'cafe'
                        ? 'bg-primary text-on-primary shadow-sm font-bold'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">waves</span>
                    <span>카페 소음</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleSound('binaural')}
                    className={`sound-chip p-2.5 rounded-lg font-label-sm text-label-sm flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      activeSound === 'binaural'
                        ? 'bg-primary text-on-primary shadow-sm font-bold'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">air</span>
                    <span>알파파 바이노럴</span>
                  </button>
                </div>
              </div>

              {/* Mindful Deep Work Quote */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary-fixed/30 to-surface-container-high flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[22px] mt-0.5">format_quote</span>
                <div className="flex flex-col">
                  <p className="font-body-sm text-body-sm text-on-surface font-medium leading-relaxed">
                    "한 번에 오직 하나의 태스크에만 전력을 다할 때, 뇌는 피로 대신 만족스러운 도파민을 분비합니다."
                  </p>
                  <span className="font-label-sm text-label-sm text-on-surface-variant mt-1.5 font-semibold">
                    — 하루핏 몰입 연구팀
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Focus Session History Log Card */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">history</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  오늘 기록된 집중 세션 목록
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                타이머 세션 종료 시 자동으로 누적됩니다
              </span>
            </div>

            {focusSessions.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant font-body-sm bg-surface-container-low rounded-xl">
                오늘 기록된 집중 세션이 없습니다. 상단 타이머를 시작하고 세션을 완료해 보세요.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
                      <th className="py-2.5 px-4 rounded-l-lg font-semibold">진행 시간 및 구간</th>
                      <th className="py-2.5 px-4 font-semibold">몰입 시간</th>
                      <th className="py-2.5 px-4 font-semibold">대상 태스크</th>
                      <th className="py-2.5 px-4 font-semibold">카테고리</th>
                      <th className="py-2.5 px-4 rounded-r-lg font-semibold text-right">상태</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md divide-y divide-surface-container-high/50">
                    {focusSessions.map((session) => (
                      <tr key={session.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3.5 px-4 font-medium text-on-surface">{session.timeRange}</td>
                        <td className="py-3.5 px-4 text-primary font-bold">{session.durationMinutes}분</td>
                        <td className="py-3.5 px-4 font-semibold text-on-surface">{session.taskTitle}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-label-sm text-label-sm font-semibold">
                            {session.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm font-bold">
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                            {session.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: INSIGHTS & ANALYTICS SECTION */}
      {activeTab === 'insights' && (
        <div className="flex flex-col gap-6">
          {/* KPI Metric Summary Row (4 Bento Metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Weekly Task Completion */}
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-md text-label-md font-medium">할 일 완료율</span>
                <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">task_alt</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display-lg text-display-lg text-on-surface font-bold leading-none">
                  {totalTasksCount > 0 ? `${completionRate}%` : '0%'}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                  {totalTasksCount > 0 ? `${totalCompletedCount}/${totalTasksCount}건` : '기록 없음'}
                </span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>

            {/* Metric 2: Focus Hours */}
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-md text-label-md font-medium">누적 몰입 시간</span>
                <div className="w-8 h-8 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display-lg text-display-lg text-on-surface font-bold leading-none">
                  {totalFocusMinutes > 0 ? `${(totalFocusMinutes / 60).toFixed(1)}h` : '0h'}
                </span>
                <span className="font-label-sm text-label-sm text-secondary font-bold">
                  {totalFocusMinutes > 0 ? `${totalFocusMinutes}분` : '기록 없음'}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-3">
                {totalFocusMinutes > 0 ? `세션 총 ${focusSessions.length}회 기록` : '기록 없음'}
              </span>
            </div>

            {/* Metric 3: Delay Rate */}
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-md text-label-md font-medium">지연 발생률</span>
                <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display-lg text-display-lg text-on-surface font-bold leading-none">
                  {tasks.length > 0 ? `${delayRate}%` : '0%'}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                  {tasks.length > 0 ? `${overdueTasks.length}건 지연` : '기록 없음'}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-3">
                {tasks.length > 0 ? `전체 ${tasks.length}개 작업 중` : '기록 없음'}
              </span>
            </div>

            {/* Metric 4: Top Focus Category */}
            <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span className="font-label-md text-label-md font-medium">최우수 몰입 카테고리</span>
                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface">
                  <span className="material-symbols-outlined text-[18px]">star</span>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg text-secondary font-bold leading-none truncate">
                  {topCategory ? `[${topCategory}]` : '기록 없음'}
                </span>
              </div>
              <div className="flex items-center justify-between mt-3 font-body-sm text-body-sm">
                <span className="text-on-surface-variant">총 몰입 시간</span>
                <span className="font-bold text-on-surface">
                  {topCategoryMinutes > 0 ? `${topCategoryMinutes}분` : '0분'}
                </span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: 7-Day Focus Time */}
            <div className="lg:col-span-7 bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    일별 몰입 시간 추이
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    최근 기록된 집중 세션 데이터
                  </span>
                </div>
                <span className="font-label-sm text-label-sm px-2.5 py-1 rounded-full bg-surface-container-low text-on-surface font-semibold">
                  {focusSessions.length > 0 ? `총 ${focusSessions.length}회 세션` : '기록 없음'}
                </span>
              </div>

              {/* Bar Graph */}
              {focusSessions.length === 0 ? (
                <div className="h-56 w-full flex flex-col items-center justify-center text-on-surface-variant gap-2 bg-surface-container-low rounded-xl">
                  <span className="material-symbols-outlined text-3xl text-outline">equalizer</span>
                  <p className="font-medium text-sm">아직 일별 집중 기록이 없습니다.</p>
                  <p className="text-xs text-outline">집중 타이머를 진행하면 일별 통계가 여기에 표시됩니다.</p>
                </div>
              ) : (
                <div className="w-full pt-4 pb-2">
                  <div className="h-56 w-full flex items-end justify-between gap-3 px-2">
                    {focusSessions.slice(-7).map((s, idx) => (
                      <div key={s.id || idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                          {s.durationMinutes}m
                        </span>
                        <div
                          className="w-full max-w-[42px] rounded-t-lg bg-primary transition-all duration-300"
                          style={{ height: `${Math.min(100, (s.durationMinutes / 60) * 100)}%` }}
                        />
                        <span className="font-label-sm text-label-sm text-on-surface font-medium truncate max-w-[50px]">
                          {s.taskTitle}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chart 2: Category Breakdown */}
            <div className="lg:col-span-5 bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    카테고리별 활동 비율
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    누적 시간 분배
                  </span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">pie_chart</span>
              </div>

              {focusSessions.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center text-on-surface-variant gap-2 bg-surface-container-low rounded-xl">
                  <span className="material-symbols-outlined text-3xl text-outline">donut_large</span>
                  <p className="font-medium text-sm">아직 카테고리별 몰입 기록이 없습니다.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 py-2">
                  {Object.entries(categoryMinutes).map(([cat, mins]) => {
                    const pct = totalFocusMinutes > 0 ? Math.round((mins / totalFocusMinutes) * 100) : 0;
                    return (
                      <div key={cat} className="flex flex-col gap-1">
                        <div className="flex justify-between font-label-md text-label-md">
                          <span className="font-semibold text-on-surface">{cat}</span>
                          <span className="text-primary font-bold">{mins}분 ({pct}%)</span>
                        </div>
                        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* AI Growth Feedback Banner */}
          <div className="bg-gradient-to-br from-primary-container to-primary text-on-primary p-6 rounded-xl shadow-md flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-label-md text-label-md uppercase tracking-wider text-on-primary/80 font-bold">
                  AI Growth Feedback
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-label-sm text-label-sm font-semibold backdrop-blur-sm">
                  {hasSufficientData ? '실시간 맞춤 분석' : '데이터 수집 대기'}
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg font-bold leading-snug">
                {hasSufficientData
                  ? `총 ${totalCompletedCount}개의 할 일과 ${focusSessions.length}회의 몰입 세션이 기록되었습니다!`
                  : '아직 분석할 데이터가 충분하지 않습니다.'}
              </h3>
              <p className="font-body-md text-body-md text-on-primary-container leading-relaxed mt-1">
                {hasSufficientData
                  ? `현재 달성률은 ${completionRate}%이며, 누적 집중 시간은 ${focusTimeDisplay}입니다. 꾸준한 루틴 유지를 통해 생산성을 더 높여 보세요.`
                  : '할 일을 등록하고 첫 번째 집중 세션을 완료하시면 최적 몰입 시간대와 생산성 피드백이 제공됩니다.'}
              </p>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('focus')}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-primary font-label-md text-label-md font-bold rounded-lg hover:bg-surface-container-high transition-colors shadow-sm cursor-pointer"
              >
                <span>지금 바로 타이머 시작하기</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
