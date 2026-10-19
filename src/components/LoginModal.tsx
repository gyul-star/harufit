import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string, icon?: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      if (onShowToast) {
        onShowToast('Google 계정으로 로그인되었습니다!', 'verified');
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg('로그인 중 문제가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5 transform transition-all border border-surface-container">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              alt="하루핏 HARUFIT Logo"
              className="h-9 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1VHaUzAHIny4xDTyFcQQTOCvfSgn1Z3PVIi5RY8NoIH4uEDyMaTYv_LjSsvORmJtWPYlyZtDVQxE_9uzMdOmRDbLNeoYZikjyBzCxwMARVHGI7zaR8QTO1_ghtc0QmPE1L5ZrK0GZPiySLpodE15tntHzIaAVOa4-GIFmxb9hvJ8_CmoMI56FpvIdgq9RVYW4Z-42WWiKfUqV2RZlcVdxWpUmHA2Y2mxwFJSJE8LYeXsKMTPxgC7F9BIZc"
            />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                하루핏 계정 로그인
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                오늘의 할 일에 딱 맞는 하루.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Informative Cloud Sync Benefits */}
        <div className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-primary font-label-md text-label-md font-bold">
            <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
            <span>클라우드 안전 동기화</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            로그인하시면 계정별 Cloud Firestore 데이터베이스에 할 일, 일정, 집중 타이머 기록이 자동 저장되며, 모든 기기에서 안전하게 불러올 수 있습니다.
          </p>

          <div className="flex flex-col gap-1.5 pt-1 border-t border-surface-container font-label-sm text-label-sm text-on-surface">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-primary">check</span>
              <span>사용자 UID 기반 철저한 개인 데이터 분리 및 보안</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-primary">check</span>
              <span>나만의 닉네임 및 우선순위 알고리즘 가중치 저장</span>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Login Button */}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 rounded-xl border border-outline-variant/60 hover:border-primary bg-surface-container-lowest hover:bg-surface-container transition-all flex items-center justify-center gap-3 shadow-sm cursor-pointer group active:scale-98"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span className="font-label-lg text-label-lg text-on-surface font-semibold group-hover:text-primary transition-colors">
            {loading ? '로그인 처리 중...' : 'Google 계정으로 계속하기'}
          </span>
        </button>

        <p className="font-body-sm text-body-sm text-center text-outline">
          로그인하지 않은 상태에서는 로컬 체험 모드로 이용하실 수 있습니다.
        </p>
      </div>
    </div>
  );
};
