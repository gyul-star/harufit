import React, { useState, useEffect } from 'react';
import { Task, PriorityType, TaskStatus } from '../types';
import { calculateSmartScore } from '../data/initialData';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  initialTask?: Task | null;
  categories: string[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  categories
}) => {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('공부');
  const [priority, setPriority] = useState<PriorityType>('HIGH');
  const [dueDate, setDueDate] = useState('');
  const [duration, setDuration] = useState(60);
  const [repeat, setRepeat] = useState('NONE');
  const [status, setStatus] = useState<TaskStatus>('UPCOMING');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDesc(initialTask.desc || '');
      setCategory(initialTask.category || '공부');
      setPriority(initialTask.priority || 'HIGH');
      setDueDate(initialTask.due ? initialTask.due.slice(0, 16) : '');
      setDuration(initialTask.duration || 60);
      setStatus(initialTask.status || 'UPCOMING');

      if (initialTask.repeat === '매일 반복') setRepeat('DAILY');
      else if (initialTask.repeat === '평일 매일') setRepeat('WEEKDAYS');
      else if (initialTask.repeat === '주 3회 (월/수/금)') setRepeat('MWF');
      else if (initialTask.repeat === '매주 1회') setRepeat('WEEKLY');
      else setRepeat('NONE');
    } else {
      setTitle('');
      setDesc('');
      setCategory(categories[1] || '공부');
      setPriority('HIGH');
      const now = new Date();
      now.setHours(18, 0, 0, 0);
      const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setDueDate(iso);
      setDuration(60);
      setRepeat('NONE');
      setStatus('UPCOMING');
    }
  }, [initialTask, isOpen, categories]);

  if (!isOpen) return null;

  const currentScore = calculateSmartScore(priority, duration, status);

  let tierLabel = '보통';
  let tierBadgeClass = 'bg-surface-container-high text-on-surface';
  if (currentScore >= 90) {
    tierLabel = '매우 높음';
    tierBadgeClass = 'bg-error/10 text-error';
  } else if (currentScore >= 75) {
    tierLabel = '높음';
    tierBadgeClass = 'bg-primary/10 text-primary';
  } else if (currentScore >= 55) {
    tierLabel = '보통';
    tierBadgeClass = 'bg-surface-container-high text-on-surface';
  } else {
    tierLabel = '여유';
    tierBadgeClass = 'bg-surface-container text-on-surface-variant';
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let repeatText = '없음';
    if (repeat === 'DAILY') repeatText = '매일 반복';
    else if (repeat === 'WEEKDAYS') repeatText = '평일 매일';
    else if (repeat === 'MWF') repeatText = '주 3회 (월/수/금)';
    else if (repeat === 'WEEKLY') repeatText = '매주 1회';

    let dueLabel = '기한 미정';
    if (dueDate) {
      const d = new Date(dueDate);
      dueLabel = `${d.getMonth() + 1}월 ${d.getDate()}일 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }

    onSave({
      id: initialTask?.id,
      title: title.trim(),
      desc: desc.trim(),
      category,
      priority,
      due: dueDate,
      dueLabel,
      duration,
      repeat: repeatText,
      status,
      score: currentScore
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col p-6 gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                {initialTask ? '할 일 정보 수정' : '새 할 일 추가'}
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                정확한 정보를 입력할수록 스마트 우선순위가 정교해집니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Live Score Preview Meter */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
            <span className="font-label-md text-label-md text-on-surface font-medium">
              예상 스마트 우선순위 점수:
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-headline-md text-headline-md text-primary font-bold">
              {currentScore}점
            </span>
            <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-semibold ${tierBadgeClass}`}>
              {tierLabel}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="inputTitle">
              할 일 제목 *
            </label>
            <input
              id="inputTitle"
              required
              type="text"
              className="w-full h-10 px-3 rounded-lg bg-surface text-on-surface placeholder:text-outline font-body-md text-body-md border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="예: 알고리즘 기출 2회차 풀이 및 오답 노트"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="inputDesc">
              설명 / 세부 사항
            </label>
            <textarea
              id="inputDesc"
              rows={2}
              className="w-full p-3 rounded-lg bg-surface text-on-surface placeholder:text-outline font-body-md text-body-md border border-outline-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="체크해야 할 세부 사항이나 참고 링크를 기입하세요..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                카테고리
              </label>
              <select
                className="h-10 px-3 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/50 focus:outline-none cursor-pointer"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.filter(c => c !== '전체').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                중요도 (가중치 40%)
              </label>
              <select
                className="h-10 px-3 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/50 focus:outline-none cursor-pointer"
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityType)}
              >
                <option value="VERY_HIGH">매우 높음 (긴급 프로젝트 / 핵심 과업)</option>
                <option value="HIGH">높음 (주요 목표 관련)</option>
                <option value="MEDIUM">보통 (일반 일상 루틴)</option>
                <option value="LOW">낮음 (여유 시 진행)</option>
              </select>
            </div>
          </div>

          {/* Due Date & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                마감 기한 *
              </label>
              <input
                required
                type="datetime-local"
                className="h-10 px-3 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/50 focus:outline-none"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                예상 소요 시간 (분 단위)
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="5"
                  max="600"
                  step="5"
                  className="w-full h-10 px-3 pr-10 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/50 focus:outline-none"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value, 10) || 30)}
                />
                <span className="absolute right-3 font-label-sm text-label-sm text-outline">분</span>
              </div>
            </div>
          </div>

          {/* Repeat & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                반복 설정
              </label>
              <select
                className="h-10 px-3 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/50 focus:outline-none cursor-pointer"
                value={repeat}
                onChange={(e) => setRepeat(e.target.value)}
              >
                <option value="NONE">반복 없음</option>
                <option value="DAILY">매일 반복</option>
                <option value="WEEKDAYS">평일 매일 (월~금)</option>
                <option value="MWF">주 3회 (월/수/금)</option>
                <option value="WEEKLY">매주 1회</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                진행 상태
              </label>
              <select
                className="h-10 px-3 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/50 focus:outline-none cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value="UPCOMING">예정</option>
                <option value="IN_PROGRESS">진행 중</option>
                <option value="OVERDUE">지연됨</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-container">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-label-lg text-label-lg transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg transition-colors shadow-sm cursor-pointer"
            >
              {initialTask ? '수정 완료' : '저장 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
