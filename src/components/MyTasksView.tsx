import React, { useState } from 'react';
import { Task, CompletedTask, PriorityType, TaskStatus } from '../types';

interface MyTasksViewProps {
  tasks: Task[];
  completedTasks: CompletedTask[];
  categories: string[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onCompleteTask: (id: string) => void;
  onUncompleteTask: (id: string) => void;
  onDeleteCompletedTask: (id: string) => void;
  onBulkComplete: (ids: string[]) => void;
  onDuplicateTask: (id: string) => void;
  onStartFocus: (task: Task, duration: number) => void;
  onAddCategory: (categoryName: string) => void;
  onShowToast: (message: string, icon?: string) => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks,
  completedTasks,
  categories,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onUncompleteTask,
  onDeleteCompletedTask,
  onBulkComplete,
  onDuplicateTask,
  onStartFocus,
  onAddCategory,
  onShowToast
}) => {
  const [currentCategory, setCurrentCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('SMART_SCORE');
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [isCompletedExpanded, setIsCompletedExpanded] = useState(true);

  // Category styles
  const categoryStyles: Record<string, string> = {
    '공부': 'bg-primary-container/10 text-primary',
    '운동': 'bg-tertiary-container/15 text-tertiary',
    '일상': 'bg-secondary-fixed text-on-secondary-fixed-variant',
    '약속': 'bg-error-container text-on-error-container',
    '취미': 'bg-surface-container-highest text-on-surface',
    '프로젝트': 'bg-secondary-container/20 text-secondary'
  };

  const priorityStyles: Record<PriorityType, { label: string; bg: string }> = {
    'VERY_HIGH': { label: '매우 높음', bg: 'bg-error/10 text-error' },
    'HIGH': { label: '높음', bg: 'bg-primary/10 text-primary' },
    'MEDIUM': { label: '보통', bg: 'bg-surface-container-high text-on-surface' },
    'LOW': { label: '낮음', bg: 'bg-surface-container text-on-surface-variant' }
  };

  const statusStyles: Record<TaskStatus, { label: string; bg: string }> = {
    'IN_PROGRESS': { label: '진행 중', bg: 'bg-primary text-on-primary' },
    'UPCOMING': { label: '예정', bg: 'bg-surface-container-highest text-on-surface' },
    'OVERDUE': { label: '지연됨', bg: 'bg-error text-on-error' },
    'COMPLETED': { label: '완료됨', bg: 'bg-surface-container text-on-surface-variant' }
  };

  const toggleTaskSelection = (id: string) => {
    const updated = new Set(selectedTaskIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedTaskIds(updated);
  };

  const handleBulkComplete = () => {
    if (selectedTaskIds.size === 0) {
      onShowToast('선택된 할 일이 없습니다.', 'info');
      return;
    }
    onBulkComplete(Array.from(selectedTaskIds));
    setSelectedTaskIds(new Set());
    onShowToast(`${selectedTaskIds.size}개 할 일을 완료 처리했습니다!`, 'check_circle');
  };

  const handleResetFilters = () => {
    setCurrentCategory('전체');
    setSearchQuery('');
    setPriorityFilter('ALL');
    setStatusFilter('ALL');
    setSortBy('SMART_SCORE');
    setSelectedTaskIds(new Set());
    onShowToast('모든 필터 조건이 초기화되었습니다.', 'restart_alt');
  };

  const handlePromptCategory = () => {
    const name = window.prompt('추가할 카테고리 이름을 입력하세요 (예: 독서, 재테크):');
    if (name && name.trim()) {
      onAddCategory(name.trim());
      onShowToast(`'${name.trim()}' 카테고리가 등록되었습니다!`, 'category');
    }
  };

  // Filter & Sort tasks
  const filteredTasks = tasks.filter((task) => {
    if (currentCategory !== '전체' && task.category !== currentCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!task.title.toLowerCase().includes(q) && !(task.desc || '').toLowerCase().includes(q)) {
        return false;
      }
    }
    if (priorityFilter !== 'ALL' && task.priority !== priorityFilter) return false;
    if (statusFilter !== 'ALL' && task.status !== statusFilter) return false;
    return true;
  });

  filteredTasks.sort((a, b) => {
    if (sortBy === 'SMART_SCORE') return (b.score || 0) - (a.score || 0);
    if (sortBy === 'DUE_DATE') {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return new Date(a.due).getTime() - new Date(b.due).getTime();
    }
    if (sortBy === 'DURATION') return b.duration - a.duration;
    if (sortBy === 'CREATED') return b.id.localeCompare(a.id);
    return 0;
  });

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm font-semibold">
              하루핏 모멘텀 v2.4
            </span>
            <span className="font-body-sm text-body-sm text-outline">•</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              오늘의 할 일에 딱 맞는 하루.
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
            할 일 관리 (My Tasks)
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            공부, 운동, 일상, 프로젝트 등 모든 할 일을 체계적으로 등록하고 스마트 우선순위 엔진으로 관리하세요.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleBulkComplete}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-label-lg text-label-lg transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">done_all</span>
            <span>선택 완료 ({selectedTaskIds.size})</span>
          </button>
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high font-label-lg text-label-lg transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span>필터 초기화</span>
          </button>
          <button
            type="button"
            onClick={onAddTask}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg transition-all shadow-md active:scale-95 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>새 할 일 추가</span>
          </button>
        </div>
      </div>

      {/* Smart Priority Info Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-low p-4 shadow-sm">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">psychology</span>
          </div>
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                스마트 우선순위(Smart Priority) 알고리즘 안내
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed-variant font-label-sm text-label-sm font-semibold">
                실시간 자동 산출
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              💡 <strong className="text-on-surface font-semibold">알고리즘 가중치:</strong> 중요도(40%) + 마감 긴급도(35%) + 예상 소요시간(15%) + 지연 페널티(10%)를 결합하여 일관된 스코어(0~100점)를 계산합니다. 점수가 높은 순으로 정렬하여 인지적 마찰 없이 다음 집중 대상을 결정하세요.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Controls Section */}
      <div className="flex flex-col gap-4 bg-surface-container-lowest rounded-xl p-4 shadow-sm">
        {/* Category Pills Bar */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 flex-nowrap">
            {categories.map((cat) => {
              const count = cat === '전체' ? tasks.length : tasks.filter(t => t.category === cat).length;
              const isActive = currentCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCurrentCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-md text-label-md transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-primary text-on-primary font-bold shadow-sm'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handlePromptCategory}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-low text-on-surface-variant hover:text-primary hover:bg-surface-container-high font-label-md text-label-md transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>카테고리 관리</span>
          </button>
        </div>

        {/* Secondary Controls: Search, Priority, Status, Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2">
          {/* Search Input */}
          <div className="md:col-span-4 relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
            <input
              className="w-full h-10 pl-9 pr-8 rounded-lg bg-surface text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none shadow-sm border border-outline-variant/30"
              placeholder="할 일 제목 또는 설명 검색..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <div className="md:col-span-3 flex items-center gap-1 bg-surface rounded-lg p-1 border border-outline-variant/30">
            <span className="material-symbols-outlined text-outline text-[18px] ml-1">flag</span>
            <select
              className="w-full bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer py-1"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">전체 중요도</option>
              <option value="VERY_HIGH">매우 높음 (Very High)</option>
              <option value="HIGH">높음 (High)</option>
              <option value="MEDIUM">보통 (Medium)</option>
              <option value="LOW">낮음 (Low)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2 flex items-center gap-1 bg-surface rounded-lg p-1 border border-outline-variant/30">
            <span className="material-symbols-outlined text-outline text-[18px] ml-1">trip_origin</span>
            <select
              className="w-full bg-transparent font-label-md text-label-md text-on-surface focus:outline-none cursor-pointer py-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">전체 상태</option>
              <option value="IN_PROGRESS">진행 중</option>
              <option value="UPCOMING">예정</option>
              <option value="OVERDUE">지연됨 (Overdue)</option>
            </select>
          </div>

          {/* Sort Selection */}
          <div className="md:col-span-3 flex items-center gap-1 bg-surface rounded-lg p-1 border border-outline-variant/30">
            <span className="material-symbols-outlined text-primary text-[18px] ml-1">sort</span>
            <select
              className="w-full bg-transparent font-label-md text-label-md text-on-surface font-semibold focus:outline-none cursor-pointer py-1"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="SMART_SCORE">스마트 우선순위순 (추천)</option>
              <option value="DUE_DATE">마감일 빠른순</option>
              <option value="DURATION">소요 시간순</option>
              <option value="CREATED">최신 등록순</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Task Feed Container */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm text-on-surface font-bold">할 일 목록</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-md text-label-md font-semibold">
              {filteredTasks.length}
            </span>
          </div>
          <div className="flex items-center gap-3 text-on-surface-variant font-label-sm text-label-sm">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error" /> 지연/임박</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> 스마트 우선순위 상위</span>
          </div>
        </div>

        {/* Dynamic Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-xl text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center text-outline mb-3">
              <span className="material-symbols-outlined text-[32px]">task_alt</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-1">
              일치하는 할 일이 없습니다
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mb-4">
              선택한 필터 조건에 해당하는 할 일이 없거나 모두 완료되었습니다.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-colors cursor-pointer"
            >
              필터 조건 재설정
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredTasks.map((task) => {
              const isSelected = selectedTaskIds.has(task.id);
              const isOverdue = task.status === 'OVERDUE';
              const catClass = categoryStyles[task.category] || 'bg-surface-container text-on-surface';
              const priorityInfo = priorityStyles[task.priority] || priorityStyles['MEDIUM'];
              const statusInfo = statusStyles[task.status] || statusStyles['UPCOMING'];

              return (
                <div
                  key={task.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-surface-container-lowest transition-all hover:bg-surface-container-low shadow-sm gap-4 ${
                    isSelected ? 'bg-primary-fixed/30 ring-1 ring-primary' : ''
                  } ${isOverdue ? 'border-l-4 border-l-error' : ''}`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Selection & Completion Checkboxes */}
                    <div className="pt-0.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleTaskSelection(task.id)}
                        title="다중 선택"
                        className="w-5 h-5 rounded flex items-center justify-center text-outline hover:text-primary transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isSelected ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onCompleteTask(task.id)}
                        title="할 일 완료"
                        className="w-6 h-6 rounded-md bg-surface-container-high hover:bg-primary hover:text-on-primary text-outline flex items-center justify-center transition-all group cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px] group-hover:scale-110">check</span>
                      </button>
                    </div>

                    {/* Main Info */}
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${catClass}`}>
                          {task.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-label-sm text-label-sm font-medium ${priorityInfo.bg}`}>
                          중요도: {priorityInfo.label}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-label-sm text-label-sm font-medium ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                        {task.repeat && task.repeat !== '없음' && (
                          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-md">
                            <span className="material-symbols-outlined text-[14px]">repeat</span>
                            {task.repeat}
                          </span>
                        )}
                      </div>

                      {/* Title & Desc */}
                      <div className="flex flex-col">
                        <h3
                          onClick={() => onEditTask(task)}
                          className="font-headline-sm text-headline-sm text-on-surface font-semibold truncate hover:text-primary transition-colors cursor-pointer"
                        >
                          {task.title}
                        </h3>
                        {task.desc && (
                          <p className="font-body-md text-body-md text-on-surface-variant line-clamp-1 mt-0.5">
                            {task.desc}
                          </p>
                        )}
                      </div>

                      {/* Meta Row */}
                      <div className="flex items-center gap-4 text-outline font-label-sm text-label-sm flex-wrap mt-0.5">
                        <span className={`flex items-center gap-1 ${isOverdue ? 'text-error font-semibold' : 'text-on-surface-variant'}`}>
                          <span className="material-symbols-outlined text-[15px]">
                            {isOverdue ? 'warning' : 'schedule'}
                          </span>
                          {task.dueLabel || '기한 미정'}
                        </span>
                        <span className="flex items-center gap-1 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[15px]">timer</span>
                          예상 {task.duration}분
                        </span>
                        <span
                          className="flex items-center gap-1 text-primary font-medium"
                          title={task.reason || ''}
                        >
                          <span className="material-symbols-outlined text-[15px]">insights</span>
                          스마트 지수: {task.score}점
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-surface-container">
                    <button
                      type="button"
                      onClick={() => onStartFocus(task, task.duration || 25)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary hover:bg-primary font-label-md text-label-md transition-all shadow-sm cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                      <span>집중 모드</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDuplicateTask(task.id)}
                      title="복제"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onEditTask(task)}
                      title="수정"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      title="삭제"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error-container transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Tasks Section (Collapsible Accordion) */}
      <div className="flex flex-col gap-3 pt-4">
        <button
          type="button"
          onClick={() => setIsCompletedExpanded(!isCompletedExpanded)}
          className="flex items-center justify-between w-full p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors shadow-sm cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-[20px] text-on-surface-variant transition-transform duration-200 ${
                isCompletedExpanded ? 'rotate-0' : '-rotate-90'
              }`}
            >
              expand_more
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              완료된 할 일
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm font-semibold">
              {completedTasks.length}
            </span>
          </div>
          <span className="font-label-sm text-label-sm text-outline">
            원클릭으로 완료 취소 가능
          </span>
        </button>

        {isCompletedExpanded && (
          <div className="flex flex-col gap-2 transition-all">
            {completedTasks.length === 0 ? (
              <div className="p-4 text-center text-on-surface-variant font-body-sm bg-surface-container-lowest rounded-xl">
                완료된 할 일이 없습니다.
              </div>
            ) : (
              completedTasks.map((task) => {
                const catClass = categoryStyles[task.category] || 'bg-surface-container text-on-surface';
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest/60 text-outline hover:bg-surface-container-lowest transition-all gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => onUncompleteTask(task.id)}
                        title="완료 취소"
                        className="w-6 h-6 rounded-md bg-primary text-on-primary flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      </button>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="line-through font-body-md text-body-md text-outline truncate">
                            {task.title}
                          </span>
                          <span className={`px-2 py-0.2 rounded-full font-label-sm text-label-sm ${catClass} opacity-70`}>
                            {task.category}
                          </span>
                        </div>
                        {task.desc && (
                          <span className="font-body-sm text-body-sm text-outline/70 line-clamp-1">
                            {task.desc}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-label-sm text-label-sm text-outline">
                        {task.completedAt}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUncompleteTask(task.id)}
                        className="px-2.5 py-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container font-label-sm text-label-sm transition-colors cursor-pointer"
                      >
                        완료 취소
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCompletedTask(task.id)}
                        className="w-7 h-7 rounded flex items-center justify-center text-outline hover:text-error hover:bg-error-container transition-colors cursor-pointer"
                        title="삭제"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
