import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface NicknameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}

export const NicknameModal: React.FC<NicknameModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const { user, userProfile, updateNickname } = useAuth();
  const [nickname, setNickname] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.displayName) {
      setNickname(userProfile.displayName);
    } else if (user?.displayName) {
      setNickname(user.displayName);
    } else {
      setNickname('');
    }
  }, [userProfile, user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    setIsSaving(true);
    try {
      await updateNickname(nickname.trim());
      if (onShowToast) {
        onShowToast(`닉네임이 '${nickname.trim()}'(으)로 설정되었습니다!`, 'badge');
      }
      onClose();
    } catch (err) {
      console.error(err);
      if (onShowToast) {
        onShowToast('닉네임 저장 중 오류가 발생했습니다.', 'error');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5 transform transition-all border border-surface-container">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                하루핏 닉네임 설정
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                대시보드와 일정 화면에 표시될 이름을 설정하세요.
              </p>
            </div>
          </div>
          {userProfile?.displayName && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Email Badge */}
        {user?.email && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface-variant text-body-sm">
            <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
            <span className="truncate">{user.email}</span>
            <span className="ml-auto text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Google 연동
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              사용할 닉네임 *
            </label>
            <input
              required
              autoFocus
              type="text"
              maxLength={20}
              placeholder="예: 민지, 코딩러, 헬스매니아"
              className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <div className="flex justify-between font-label-sm text-label-sm text-outline">
              <span>한글, 영문, 숫자 2~20자 권장</span>
              <span>{nickname.length}/20</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
            {userProfile?.displayName && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-label-md text-label-md text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              disabled={!nickname.trim() || isSaving}
              className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSaving ? '저장 중...' : '저장하고 시작하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
