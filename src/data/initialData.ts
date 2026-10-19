import { Task, CompletedTask, FocusSession, ScheduleBlock } from '../types';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: '알고리즘 코딩 테스트 기출 분석',
    desc: 'DFS/BFS 및 다이나믹 프로그래밍 빈출 유형 4문제 심층 분석 및 최적화',
    category: '공부',
    priority: 'VERY_HIGH',
    due: '2025-05-19T17:00',
    dueLabel: '오늘 17:00 (3시간 남음)',
    duration: 90,
    repeat: '매일 반복',
    status: 'IN_PROGRESS',
    score: 98,
    reason: '마감 3시간 전, 중요도 매우 높음 가중치'
  },
  {
    id: 'task-2',
    title: '하루핏 핵심 스케줄러 로직 작성',
    desc: '우선순위 지수 가중치 산출 함수 및 캘린더 타임블록 자동 배치 알고리즘 PR 생성',
    category: '프로젝트',
    priority: 'VERY_HIGH',
    due: '2025-05-20T12:00',
    dueLabel: '내일 12:00',
    duration: 120,
    repeat: '없음',
    status: 'UPCOMING',
    score: 92,
    reason: '핵심 릴리즈 기한 24시간 내'
  },
  {
    id: 'task-3',
    title: 'CS 컴퓨터 구조 핵심 개념 복습',
    desc: '캐시 메모리 매핑 기법(직접/세트 연관) 및 가상 메모리 페이징 결함 정리',
    category: '공부',
    priority: 'HIGH',
    due: '2025-05-18T22:00',
    dueLabel: '지연: 어제 22:00',
    duration: 45,
    repeat: '없음',
    status: 'OVERDUE',
    score: 89,
    reason: '마감 기한 초과 페널티 + 높은 중요도'
  },
  {
    id: 'task-4',
    title: '스터디 그룹 주간 회고 및 공유',
    desc: '디스코드 음성 채널에서 5월 3주차 학습 결과물 발표 및 피드백 회고록 작성',
    category: '약속',
    priority: 'HIGH',
    due: '2025-05-21T20:00',
    dueLabel: '5월 21일 20:00',
    duration: 60,
    repeat: '매주 수요일',
    status: 'UPCOMING',
    score: 80,
    reason: '협업 일정 및 마감 임박'
  },
  {
    id: 'task-5',
    title: '헬스장 전신 웨이트 & 유산소 30분',
    desc: '데드리프트 5세트, 랫풀다운 4세트, 밀리터리 프레스 후 인터벌 러닝',
    category: '운동',
    priority: 'MEDIUM',
    due: '2025-05-19T21:00',
    dueLabel: '오늘 21:00',
    duration: 60,
    repeat: '주 3회 (월/수/금)',
    status: 'UPCOMING',
    score: 74,
    reason: '당일 저녁 루틴 일정'
  },
  {
    id: 'task-6',
    title: '주간 식단 장보기 및 밀프렙',
    desc: '닭가슴살, 파프리카, 오트밀 구입 후 3일치 도시락 일괄 소분 조리',
    category: '일상',
    priority: 'MEDIUM',
    due: '2025-05-25T18:00',
    dueLabel: '이번 주 일 18:00',
    duration: 45,
    repeat: '매주 1회',
    status: 'UPCOMING',
    score: 60,
    reason: '주말 일상 루틴 과업'
  },
  {
    id: 'task-7',
    title: '디지털 드로잉 브러시 연습',
    desc: '인체 크로키 10분, 텍스처 브러시 질감 테스트 5종 완료하기',
    category: '취미',
    priority: 'LOW',
    due: '',
    dueLabel: '마감일 없음',
    duration: 30,
    repeat: '없음',
    status: 'UPCOMING',
    score: 42,
    reason: '여유 진행 가능 과업'
  }
];

export const INITIAL_COMPLETED_TASKS: CompletedTask[] = [
  {
    id: 'comp-1',
    title: '주간 업무 스프린트 킥오프 회의',
    desc: '우선순위 지표 공유 및 스프린트 목표 얼라인 완료',
    category: '프로젝트',
    completedAt: '오늘 오전 09:30'
  },
  {
    id: 'comp-2',
    title: '아침 공복 스트레칭 15분',
    desc: '상체 모빌리티 루틴 완료',
    category: '운동',
    completedAt: '오늘 오전 07:45'
  },
  {
    id: 'comp-3',
    title: '영양제 및 비타민 섭취',
    desc: '오메가3, 마그네슘 복용 완료',
    category: '일상',
    completedAt: '오늘 오전 08:00'
  },
  {
    id: 'comp-4',
    title: 'CS 네트워크 HTTP/3 규격 논문 요약',
    desc: 'QUIC 프로토콜 핸드셰이크 구조 정리',
    category: '공부',
    completedAt: '어제 21:10'
  },
  {
    id: 'comp-5',
    title: '도서관 대출 도서 반납',
    desc: '컴파일러 구조 및 리팩토링 서적 반납',
    category: '일상',
    completedAt: '5월 17일 16:30'
  }
];

export const INITIAL_FOCUS_SESSIONS: FocusSession[] = [
  {
    id: 'session-1',
    timeRange: '10:15 - 11:05',
    durationMinutes: 50,
    taskTitle: '알고리즘 문제 풀이 3제 완독',
    category: '공부',
    status: '기록 완료'
  },
  {
    id: 'session-2',
    timeRange: '11:20 - 11:45',
    durationMinutes: 25,
    taskTitle: '영어 뉴스 및 팟캐스트 쉐도잉',
    category: '어학',
    status: '기록 완료'
  },
  {
    id: 'session-3',
    timeRange: '13:30 - 14:15',
    durationMinutes: 45,
    taskTitle: '하루핏 기획 및 아키텍처 구조화',
    category: '프로젝트',
    status: '기록 완료'
  }
];

export const INITIAL_SCHEDULE_BLOCKS: ScheduleBlock[] = [
  {
    id: 'sched-1',
    time: '08:00',
    timeRange: '08:00 - 09:00',
    durationMinutes: 60,
    title: '기상 및 일과 준비 버퍼',
    type: 'BUFFER',
    icon: 'wb_sunny'
  },
  {
    id: 'sched-2',
    time: '09:00',
    timeRange: '09:00 - 10:00',
    durationMinutes: 60,
    title: '팀 모닝 스크럼 및 금일 스프린트 점검',
    desc: 'Google Meet 회의실 · 전원 필수 참석',
    type: 'FIXED',
    isLocked: true,
    tag: '사내 캘린더 연동'
  },
  {
    id: 'sched-buffer-1',
    time: '10:00',
    timeRange: '10:00 - 10:15',
    durationMinutes: 15,
    title: '정리 버퍼 15분',
    type: 'BUFFER'
  },
  {
    id: 'sched-3',
    time: '10:15',
    timeRange: '10:15 - 11:45',
    durationMinutes: 90,
    title: '알고리즘 코딩테스트 고난도 문제 풀이 3제',
    desc: '그래프 탐색 (DFS/BFS) 및 다이나믹 프로그래밍 2문항 정리',
    type: 'TASK',
    category: '공부',
    score: 98,
    dueNotice: '마감 17:00 전 완료 보장',
    isLocked: false
  },
  {
    id: 'sched-break-1',
    time: '11:45',
    timeRange: '11:45 - 12:00',
    durationMinutes: 15,
    title: '스마트 휴식',
    desc: '눈 피로 회복 및 가벼운 어깨 스트레칭',
    type: 'BREAK',
    icon: 'coffee'
  },
  {
    id: 'sched-4',
    time: '12:00',
    timeRange: '12:00 - 13:00',
    durationMinutes: 60,
    title: '점심 식사 및 산책 리프레시',
    desc: '충분한 영양 섭취와 자연광 15분 쬐기',
    type: 'FIXED',
    isLocked: true
  },
  {
    id: 'sched-buffer-2',
    time: '13:00',
    timeRange: '13:00 - 13:30',
    durationMinutes: 30,
    title: '식후 집중력 적응 버퍼 30분',
    type: 'BUFFER'
  },
  {
    id: 'sched-5',
    time: '13:30',
    timeRange: '13:30 - 15:00',
    durationMinutes: 90,
    title: '하루핏 핵심 스케줄러 알고리즘 로직 작성',
    desc: '타임슬롯 분할 및 우선순위 정렬 그리디 엔진 구현',
    type: 'TASK',
    category: '프로젝트',
    score: 92,
    isNext: true,
    isLocked: false
  },
  {
    id: 'sched-break-2',
    time: '15:00',
    timeRange: '15:00 - 15:15',
    durationMinutes: 15,
    title: '스마트 휴식',
    desc: '수분 보충 및 딥 브리딩 5분',
    type: 'BREAK',
    icon: 'nature_people'
  },
  {
    id: 'sched-6',
    time: '15:15',
    timeRange: '15:15 - 16:15',
    durationMinutes: 60,
    title: 'CS 컴퓨터 구조 복습 (캐시 메모리 & 가상 메모리)',
    desc: '운영체제 페이징 시스템 및 캐시 히트율 요약 노트 작성',
    type: 'TASK',
    category: '공부',
    score: 84,
    isLocked: false
  },
  {
    id: 'sched-buffer-3',
    time: '16:15',
    timeRange: '16:15 - 16:30',
    durationMinutes: 15,
    title: '운동 이동 및 환복 버퍼 15분',
    type: 'BUFFER'
  },
  {
    id: 'sched-7',
    time: '16:30',
    timeRange: '16:30 - 17:30',
    durationMinutes: 60,
    title: '전신 웨이트 트레이닝 & 유산소 인터벌',
    desc: '스쿼트, 데드리프트 5세트 + 트레드밀 20분',
    type: 'TASK',
    category: '운동',
    isLocked: false
  },
  {
    id: 'sched-empty-slot',
    time: '17:30',
    timeRange: '17:30 - 18:00',
    durationMinutes: 30,
    title: '가용 여유 시간 (30분 빈 슬롯) - 미배치 작업을 여기로 드래그할 수 있습니다.',
    type: 'EMPTY'
  },
  {
    id: 'sched-8',
    time: '18:00',
    timeRange: '18:00 - 19:00',
    durationMinutes: 60,
    title: '사내 사이드 프로젝트 주간 싱크업 미팅',
    desc: '주간 진행률 공유 및 익일 릴리즈 계획 확인',
    type: 'FIXED',
    isLocked: true
  },
  {
    id: 'sched-9',
    time: '19:00',
    timeRange: '19:00 ~',
    durationMinutes: 180,
    title: '저녁 식사, 자유 휴식 및 개인 정비 시간',
    desc: '취침 권장 23:30',
    type: 'BUFFER',
    icon: 'nightlight'
  }
];

export function calculateSmartScore(priority: string, duration: number, status: string): number {
  let score = 50;
  if (priority === 'VERY_HIGH') score += 30;
  else if (priority === 'HIGH') score += 20;
  else if (priority === 'MEDIUM') score += 10;

  if (status === 'OVERDUE') score += 18;
  else if (status === 'IN_PROGRESS') score += 10;

  if (duration >= 90) score += 5;

  return Math.min(100, Math.max(10, score));
}
