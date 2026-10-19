import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenQuickAdd: () => void;
  onOpenLogin: () => void;
  onOpenNicknameModal: () => void;
  onSearch?: (query: string) => void;
  searchQuery: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenQuickAdd,
  onOpenLogin,
  onOpenNicknameModal,
  onSearch,
  searchQuery
}) => {
  const { user, userProfile, signOutUser } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const displayName = userProfile?.displayName || user?.displayName || '게스트';
  const displayAvatar = user?.photoURL ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDlKihTrw0XyDHY8YJrnyV46sn89oAtK5TzsqhjwhboLyo-oziEInf4JdJIx_8z01GMt7wwv6fSBUoEpUGU9fjyxZC2a9SwG0kd35_hn-uapChSA32kaXazjIB48VuUPUm8MWfr4MTBvaGdsmMtKUuhHQe433I10VvI31MXHg3O5igM6eCIp058fFxJW180Vj-wSe7vEwIw-dQeGbaYCVVRfqWFXaGLs1XpUKmuD3FCzK0cN42JTmmb';

  const notifications = [
    {
      id: 1,
      title: '집중 세션 보너스 달성!',
      desc: '방금 집중 세션 45분을 성공적으로 마쳤어요! (+45p 획득)',
      time: '15분 전',
      icon: 'workspace_premium',
      color: 'text-secondary'
    },
    {
      id: 2,
      title: '마감 임박 자동 감지',
      desc: '마감 3시간 전 할 일 1건이 감지되어 우선순위 상단으로 조정되었습니다.',
      time: '32분 전',
      icon: 'warning',
      color: 'text-error'
    },
    {
      id: 3,
      title: '골든 타임 브리핑',
      desc: '오후 13:30부터 90분간 집중도가 최상위 10%에 달하는 골든 타임입니다.',
      time: '1시간 전',
      icon: 'auto_schedule',
      color: 'text-primary'
    }
  ];

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface/85 backdrop-blur-xl z-40 px-gutter flex items-center justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Left: Greeting & Current Date */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-headline-sm text-on-surface leading-tight font-semibold">
              좋은 아침이에요, {displayName}님! ☀️
            </span>
            {user && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                클라우드 연동됨
              </span>
            )}
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            2025년 5월 19일 월요일
          </span>
        </div>
      </div>

      {/* Right: Quick Search, Action, Notification, Auth Button / Avatar */}
      <div className="flex flex-row items-center gap-3 shrink-0 flex-nowrap">
        {/* Quick Search */}
        <div className="relative flex items-center shrink-0">
          <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            className="h-9 pl-9 pr-3 rounded-lg bg-surface-container-lowest text-on-surface placeholder:text-outline font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-44 lg:w-52 transition-all"
            placeholder="빠른 검색 또는 필터..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>

        {/* Quick Add CTA */}
        <button
          type="button"
          onClick={onOpenQuickAdd}
          className="flex flex-row items-center gap-1.5 bg-primary-container text-on-primary px-3.5 py-2 rounded-lg font-label-lg text-label-lg hover:bg-primary transition-all shadow-sm active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
        >
          <span className="material-symbols-outlined text-[18px] shrink-0">add</span>
          <span className="whitespace-nowrap">빠른 할 일 추가</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
              setHasUnread(false);
            }}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            title="알림 센터"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>
          {hasUnread && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-white" />
          )}

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-surface-container p-3 z-50 flex flex-col gap-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  스마트 알림
                </span>
                <span className="font-label-sm text-label-sm text-primary font-medium">모두 읽음</span>
              </div>
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors flex items-start gap-2.5"
                  >
                    <span className={`material-symbols-outlined text-[18px] mt-0.5 ${item.color}`}>
                      {item.icon}
                    </span>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                          {item.title}
                        </span>
                        <span className="font-label-sm text-[10px] text-outline ml-1">{item.time}</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-2 leading-tight">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Account State: Login Button or Profile Dropdown */}
        {user ? (
          <div className="relative pl-1">
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-container transition-colors cursor-pointer group"
              title="계정 메뉴"
            >
              <img
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/30 shadow-sm"
                src={displayAvatar}
              />
              <span className="hidden xl:inline font-label-md text-label-md text-on-surface font-semibold max-w-[100px] truncate">
                {displayName}
              </span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-on-surface">
                arrow_drop_down
              </span>
            </button>

            {/* Profile Menu Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-12 w-64 bg-surface-container-lowest rounded-xl shadow-2xl border border-surface-container p-3 z-50 flex flex-col gap-3">
                <div className="flex items-center gap-3 pb-3 border-b border-surface-container">
                  <img
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
                    src={displayAvatar}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-on-surface font-bold truncate">
                      {displayName}
                    </span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant truncate">
                      {user.email}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenNicknameModal();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg font-label-md text-label-md text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">edit</span>
                    <span>닉네임 변경</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setShowProfileMenu(false);
                      await signOutUser();
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg font-label-md text-label-md text-error hover:bg-error-container/50 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>로그아웃</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenLogin}
            className="flex flex-row items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-primary text-primary hover:bg-primary/10 font-label-lg text-label-lg font-bold transition-all shadow-sm cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
          >
            <span className="material-symbols-outlined text-[18px] shrink-0">login</span>
            <span className="whitespace-nowrap inline-block leading-none">로그인</span>
          </button>
        )}
      </div>
    </header>
  );
};
