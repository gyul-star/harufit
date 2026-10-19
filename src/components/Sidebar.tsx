import React from 'react';
import { TabType } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  completionRate: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, completionRate }) => {
  const navItems: { path: TabType; label: string; icon: string }[] = [
    { path: 'dashboard', label: '대시보드', icon: 'grid_view' },
    { path: 'my-tasks', label: '할 일 관리', icon: 'check_circle' },
    { path: 'smart-schedule', label: '스마트 일정', icon: 'calendar_today' },
    { path: 'focus-mode', label: '집중 모드', icon: 'timer' },
    { path: 'insights', label: '통계 및 분석', icon: 'bar_chart' },
    { path: 'settings', label: '설정', icon: 'settings' },
    { path: 'intro-video', label: '하루핏 소개 영상', icon: 'smart_display' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest z-50 flex flex-col justify-between py-6 px-4 shadow-[0_1px_8px_rgba(0,0,0,0.04)] select-none">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div 
          onClick={() => onSelectTab('dashboard')} 
          className="flex items-center gap-3 px-2 cursor-pointer group"
          title="하루핏 대시보드로 이동"
        >
          <img 
            alt="하루핏 HARUFIT Logo" 
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105" 
            src="https://lh3.googleusercontent.com/aida/AEtjO1VHaUzAHIny4xDTyFcQQTOCvfSgn1Z3PVIi5RY8NoIH4uEDyMaTYv_LjSsvORmJtWPYlyZtDVQxE_9uzMdOmRDbLNeoYZikjyBzCxwMARVHGI7zaR8QTO1_ghtc0QmPE1L5ZrK0GZPiySLpodE15tntHzIaAVOa4-GIFmxb9hvJ8_CmoMI56FpvIdgq9RVYW4Z-42WWiKfUqV2RZlcVdxWpUmHA2Y2mxwFJSJE8LYeXsKMTPxgC7F9BIZc"
          />
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-bold">하루핏 HARUFIT</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">오늘의 할 일에 딱 맞는 하루.</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => onSelectTab(item.path)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-primary-container text-on-primary font-bold shadow-sm'
                    : 'font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Completion Meter Card */}
      <div 
        onClick={() => onSelectTab('insights')} 
        className="px-2 pt-4 bg-surface-container-low rounded-xl p-3 cursor-pointer hover:bg-surface-container transition-colors group"
        title="통계 및 분석 바로가기"
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-on-surface">오늘의 달성률</span>
            <span className="font-label-sm text-label-sm text-primary font-semibold">{completionRate}% 완료됨</span>
          </div>
          <span className="material-symbols-outlined text-primary text-[20px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
            trending_up
          </span>
        </div>
        <div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2 overflow-hidden">
          <div 
            className="bg-primary h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
