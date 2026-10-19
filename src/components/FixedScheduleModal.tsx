import React, { useState } from 'react';

interface FixedScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, start: string, end: string) => void;
}

export const FixedScheduleModal: React.FC<FixedScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('14:00');
  const [end, setEnd] = useState('15:00');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), start, end);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">lock_clock</span>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              새 고정 일정 등록
            </h3>
          </div>
          <button
            type="button"
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          고정 일정은 AI 자동 배치 알고리즘이 침범하지 않고 최우선으로 보호합니다.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface font-medium block">
              일정 명칭 *
            </label>
            <input
              required
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="예: 병원 정기 검진, 고객사 미팅"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface font-medium block">
                시작 시간
              </label>
              <input
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-md text-label-md text-on-surface font-medium block">
                종료 시간
              </label>
              <input
                className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-container-highest transition-colors cursor-pointer"
              onClick={onClose}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-bold hover:bg-primary transition-all cursor-pointer shadow-sm"
            >
              등록 및 일정 보호
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
