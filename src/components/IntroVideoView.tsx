import React, { useState, useRef, useEffect } from 'react';

interface IntroVideoViewProps {
  onShowToast?: (message: string, icon?: string) => void;
}

export const IntroVideoView: React.FC<IntroVideoViewProps> = ({ onShowToast }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);

  // Default path in Vite static assets
  const defaultVideoSrc = './videos/harufit-dashboard.mp4';
  const activeVideoSrc = localVideoUrl || defaultVideoSrc;

  const handleVideoError = () => {
    // When the video file is not found at the path
    setHasError(true);
    if (onShowToast) {
      onShowToast('영상을 불러올 수 없습니다. 영상 파일 경로를 확인해 주세요.', 'error');
    }
  };

  const handleVideoLoaded = () => {
    setHasError(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (localVideoUrl) {
        URL.revokeObjectURL(localVideoUrl);
      }
      const url = URL.createObjectURL(file);
      setLocalVideoUrl(url);
      setHasError(false);
      if (onShowToast) {
        onShowToast(`'${file.name}' 영상이 성공적으로 로드되었습니다.`, 'check_circle');
      }
    }
  };

  const handleRetry = () => {
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  useEffect(() => {
    return () => {
      if (localVideoUrl) {
        URL.revokeObjectURL(localVideoUrl);
      }
    };
  }, [localVideoUrl]);

  return (
    <div className="flex flex-col w-full gap-8 max-w-5xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-container/15 text-primary">
            <span className="material-symbols-outlined text-[16px]">smart_display</span>
            HARUFIT GUIDE
          </span>
          <span className="text-xs text-on-surface-variant font-medium">소개 및 가이드</span>
        </div>
        <h1 className="font-headline-lg text-2xl md:text-3xl text-on-surface tracking-tight font-bold">
          하루핏과 함께 만드는 더 나은 하루
        </h1>
        <p className="font-body-md text-sm md:text-base text-on-surface-variant">
          할 일 관리부터 스마트 일정, 집중 시간까지. 하루핏으로 나만의 하루를 계획해 보세요.
        </p>
      </div>

      {/* Main Video Card */}
      <div className="bg-surface-container-lowest rounded-2xl p-4 md:p-6 shadow-sm border border-outline-variant/30 flex flex-col gap-5">
        {/* 16:9 Video Player Container */}
        <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-inner flex items-center justify-center">
          {hasError ? (
            /* Error Fallback Display */
            <div className="flex flex-col items-center justify-center p-6 text-center text-white max-w-lg z-10">
              <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl">videocam_off</span>
              </div>
              <p className="text-base md:text-lg font-bold text-red-200 mb-2">
                영상을 불러올 수 없습니다. 영상 파일 경로를 확인해 주세요.
              </p>
              <p className="text-xs md:text-sm text-slate-300 mb-6 leading-relaxed">
                원본 영상을 프로젝트의 아래 경로에 배치해 주시면 자동으로 재생됩니다:
                <br />
                <code className="inline-block mt-2 px-3 py-1 bg-slate-800/90 text-primary-200 rounded font-mono text-xs border border-slate-700">
                  public/videos/harufit-dashboard.mp4
                </code>
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <label className="cursor-pointer px-4 py-2 bg-primary text-on-primary hover:bg-primary-hover font-label-md rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-colors shadow">
                  <span className="material-symbols-outlined text-[18px]">file_upload</span>
                  <span>로컬 영상 파일 직접 선택</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-label-md rounded-lg text-xs md:text-sm font-medium flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                  <span>다시 시도</span>
                </button>
              </div>
            </div>
          ) : (
            /* Video Element */
            <video
              ref={videoRef}
              key={activeVideoSrc}
              controls
              preload="metadata"
              playsInline
              className="w-full h-full object-contain bg-black"
              onError={handleVideoError}
              onLoadedData={handleVideoLoaded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={activeVideoSrc} type="video/mp4" />
              <source src="./videos/harufit-dashboard.mp4" type="video/mp4" />
              <source src="./harufit-dashboard.mp4" type="video/mp4" />
              <source src="/videos/harufit-dashboard.mp4" type="video/mp4" />
              영상을 불러올 수 없습니다. 영상 파일 경로를 확인해 주세요.
            </video>
          )}
        </div>

        {/* Video Controls & Status Footer */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container/15 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                {isPlaying ? 'motion_photos_paused' : 'smart_display'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-on-surface">HARUFIT 생산성 대시보드 영상</span>
              <span className="text-xs text-on-surface-variant font-mono">
                {localVideoUrl ? '선택된 로컬 파일 재생 중' : 'public/videos/harufit-dashboard.mp4'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label className="cursor-pointer px-3 py-1.5 rounded-lg border border-outline-variant text-xs text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>다른 영상 열기</span>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Feature Highlights Matching Harufit Brand Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Feature 1: Priority Algorithm */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 flex flex-col gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-primary-container/15 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">target</span>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-on-surface">스마트 우선순위 엔진</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              중요도(40%), 마감 시한(35%), 예상 소요 시간(15%), 상태(10%)를 종합 계산하여 최적의 다음 작업을 추천합니다.
            </p>
          </div>
        </div>

        {/* Feature 2: Smart Schedule Timeline */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 flex flex-col gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">view_timeline</span>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-on-surface">타임블록 자동 최적화</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              고정 일정 사이의 빈틈을 찾아 휴식 주기와 에너지 패턴에 맞춰 일정을 실시간으로 재배치합니다.
            </p>
          </div>
        </div>

        {/* Feature 3: Focus Timer & White Noise */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 flex flex-col gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">timer</span>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-on-surface">몰입 집중 & 백색소음</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              뽀모도로 타이머와 웹 오디오 기반 백색소음(비 소리, 카페, 알파파)으로 깊은 몰입 경험을 선사합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
