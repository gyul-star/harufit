import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface SettingsViewProps {
  onResetData: () => void;
  onExportData: () => void;
  onShowToast: (message: string, icon?: string) => void;
  onOpenLogin: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onResetData,
  onExportData,
  onShowToast,
  onOpenLogin
}) => {
  const { user, userProfile, updateNickname, signOutUser } = useAuth();
  const [userName, setUserName] = useState(userProfile?.displayName || user?.displayName || '민지');
  const [priorityWeight, setPriorityWeight] = useState(40);
  const [deadlineWeight, setDeadlineWeight] = useState(35);
  const [durationWeight, setDurationWeight] = useState(15);
  const [penaltyWeight, setPenaltyWeight] = useState(10);
  const [defaultSessionDuration, setDefaultSessionDuration] = useState('25');
  const [defaultRestDuration, setDefaultRestDuration] = useState('15');
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [isSavingNickname, setIsSavingNickname] = useState(false);

  useEffect(() => {
    if (userProfile?.displayName) {
      setUserName(userProfile.displayName);
    } else if (user?.displayName) {
      setUserName(user.displayName);
    }
  }, [userProfile, user]);

  const handleSaveNickname = async () => {
    if (!userName.trim()) return;
    setIsSavingNickname(true);
    try {
      await updateNickname(userName.trim());
      onShowToast(`닉네임이 '${userName.trim()}'(으)로 저장되었습니다.`, 'badge');
    } catch (e) {
      console.error(e);
      onShowToast('닉네임 저장 실패', 'error');
    } finally {
      setIsSavingNickname(false);
    }
  };

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('스마트 우선순위 가중치가 저장되었습니다.', 'tune');
  };

  const displayAvatar = user?.photoURL ||
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDlKihTrw0XyDHY8YJrnyV46sn89oAtK5TzsqhjwhboLyo-oziEInf4JdJIx_8z01GMt7wwv6fSBUoEpUGU9fjyxZC2a9SwG0kd35_hn-uapChSA32kaXazjIB48VuUPUm8MWfr4MTBvaGdsmMtKUuhHQe433I10VvI31MXHg3O5igM6eCIp058fFxJW180Vj-wSe7vEwIw-dQeGbaYCVVRfqWFXaGLs1XpUKmuD3FCzK0cN42JTmmb';

  return (
    <div className="flex flex-col w-full gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
          설정 (Settings)
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          하루핏 사용자 프로필, 알고리즘 가중치 및 집중 세션 환경을 맞춤 설정하세요.
        </p>
      </div>

      {/* 1. Profile Section */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">person</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              사용자 프로필
            </h2>
          </div>
          {user ? (
            <button
              type="button"
              onClick={async () => {
                await signOutUser();
                onShowToast('로그아웃되었습니다.', 'logout');
              }}
              className="px-3 py-1.5 rounded-lg text-error hover:bg-error-container/50 font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>로그아웃</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold transition-all shadow-sm cursor-pointer"
            >
              Google 로그인
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <img
            alt="Profile Avatar"
            className="w-16 h-16 rounded-full object-cover ring-4 ring-primary/20 shadow-md"
            src={displayAvatar}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                {userProfile?.displayName || userName}님
              </span>
              {user && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-[11px] font-bold">
                  Cloud Firestore 연동
                </span>
              )}
            </div>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {user?.email || '비로그인 체험 모드 (로컬 저장소)'}
            </span>
            <span className="mt-1 font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              {user ? '개인 계정 격리 활성' : '로그인 시 다중 기기 실시간 동기화'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center">
              <label className="font-label-md text-label-md text-on-surface font-semibold">닉네임</label>
              {user && (
                <button
                  type="button"
                  disabled={isSavingNickname || !userName.trim()}
                  onClick={handleSaveNickname}
                  className="text-primary hover:underline font-label-sm text-label-sm font-bold cursor-pointer"
                >
                  {isSavingNickname ? '저장 중...' : '닉네임 저장'}
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="flex-1 h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                disabled={isSavingNickname || !userName.trim()}
                onClick={handleSaveNickname}
                className="px-3.5 h-10 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                저장
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface font-semibold">계정 이메일</label>
            <input
              type="text"
              readOnly
              value={user?.email || '로그인 후 확인 가능'}
              className="h-10 px-3 rounded-lg bg-surface-container text-outline font-body-md text-body-md border border-outline-variant/20 focus:outline-none cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* 2. Priority Engine Weights Customization */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">psychology</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              스마트 우선순위(Smart Priority) 엔진 가중치
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-secondary-fixed text-secondary font-bold">
            실시간 재정렬 적용
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          각 요소별 중요도 퍼센트를 조정하여 나만의 생산성 스타일에 최적화된 우선순위를 계산합니다.
        </p>

        <form onSubmit={handleSaveWeights} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Priority Weight */}
            <div className="flex flex-col gap-2 p-3 bg-surface-container-low rounded-xl">
              <div className="flex justify-between font-label-md text-label-md">
                <span className="text-on-surface font-semibold">태스크 중요도</span>
                <span className="text-primary font-bold">{priorityWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={priorityWeight}
                onChange={(e) => setPriorityWeight(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Deadline Urgency */}
            <div className="flex flex-col gap-2 p-3 bg-surface-container-low rounded-xl">
              <div className="flex justify-between font-label-md text-label-md">
                <span className="text-on-surface font-semibold">마감 긴급도</span>
                <span className="text-primary font-bold">{deadlineWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={deadlineWeight}
                onChange={(e) => setDeadlineWeight(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-2 p-3 bg-surface-container-low rounded-xl">
              <div className="flex justify-between font-label-md text-label-md">
                <span className="text-on-surface font-semibold">예상 소요 시간</span>
                <span className="text-primary font-bold">{durationWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={durationWeight}
                onChange={(e) => setDurationWeight(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>

            {/* Penalty */}
            <div className="flex flex-col gap-2 p-3 bg-surface-container-low rounded-xl">
              <div className="flex justify-between font-label-md text-label-md">
                <span className="text-on-surface font-semibold">지연 과업 페널티</span>
                <span className="text-primary font-bold">{penaltyWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={penaltyWeight}
                onChange={(e) => setPenaltyWeight(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm hover:bg-primary-container transition-all cursor-pointer"
            >
              가중치 저장 및 알고리즘 갱신
            </button>
          </div>
        </form>
      </div>

      {/* 3. Workflow Preferences */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary text-[22px]">tune</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            워크플로우 및 알림 환경
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              기본 집중 세션 길이
            </label>
            <select
              value={defaultSessionDuration}
              onChange={(e) => setDefaultSessionDuration(e.target.value)}
              className="h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/40 focus:outline-none cursor-pointer"
            >
              <option value="25">뽀모도로 25분</option>
              <option value="50">딥 포커스 50분</option>
              <option value="90">울트라디안 리듬 90분</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              기본 스마트 휴식 간격
            </label>
            <select
              value={defaultRestDuration}
              onChange={(e) => setDefaultRestDuration(e.target.value)}
              className="h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/40 focus:outline-none cursor-pointer"
            >
              <option value="5">숏 브레이크 5분</option>
              <option value="15">스마트 휴식 15분 (권장)</option>
              <option value="25">롱 브레이크 25분</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-surface-container">
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              스마트 브리핑 및 마감 임박 알림
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              골든 타임 진입 및 마감 3시간 전 인텔리전트 알림 수신
            </span>
          </div>
          <button
            type="button"
            onClick={() => setNotificationEnabled(!notificationEnabled)}
            className={`w-12 h-6 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer ${
              notificationEnabled ? 'bg-primary' : 'bg-outline-variant'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                notificationEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. Data Management & GitHub Pages Deployment Info */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-outline text-[22px]">database</span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
            로컬 데이터 및 배포 관리
          </h2>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          본 어플리케이션은 서버나 데이터베이스 없이 브라우저 로컬 저장소(localStorage)에서 100% 클라이언트 측으로 독립 동작하며, GitHub Pages에 바로 배포할 수 있도록 최적화되어 있습니다.
        </p>

        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <button
            type="button"
            onClick={onExportData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-container-highest font-label-md text-label-md font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>현재 데이터 JSON 내보내기</span>
          </button>
          <button
            type="button"
            onClick={onResetData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-error-container text-on-error-container hover:bg-error/20 font-label-md text-label-md font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span>샘플 데이터로 초기화</span>
          </button>
        </div>
      </div>
    </div>
  );
};
