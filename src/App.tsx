import React, { useState, useEffect } from 'react';
import { TabType, Task, CompletedTask, FocusSession, ScheduleBlock } from './types';
import {
  INITIAL_TASKS,
  INITIAL_COMPLETED_TASKS,
  INITIAL_FOCUS_SESSIONS,
  INITIAL_SCHEDULE_BLOCKS
} from './data/initialData';
import { useAuth } from './context/AuthContext';
import {
  subscribeUserTasks,
  saveUserTask,
  deleteUserTask,
  subscribeUserCompletedTasks,
  saveUserCompletedTask,
  deleteUserCompletedTask,
  subscribeUserFocusSessions,
  saveUserFocusSession,
  subscribeUserScheduleBlocks,
  saveUserScheduleBlock,
  seedInitialUserDataIfEmpty
} from './services/firestoreService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MyTasksView } from './components/MyTasksView';
import { SmartScheduleView } from './components/SmartScheduleView';
import { FocusHubView } from './components/FocusHubView';
import { SettingsView } from './components/SettingsView';
import { IntroVideoView } from './components/IntroVideoView';
import { TaskModal } from './components/TaskModal';
import { FixedScheduleModal } from './components/FixedScheduleModal';
import { RecommendModal } from './components/RecommendModal';
import { NicknameModal } from './components/NicknameModal';
import { LoginModal } from './components/LoginModal';
import { ToastContainer, ToastData } from './components/Toast';

export default function App() {
  const { user, userProfile, loading: authLoading, isNicknameModalOpen, setIsNicknameModalOpen } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');

  // Application Data States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [categories, setCategories] = useState<string[]>([
    '전체',
    '공부',
    '운동',
    '일상',
    '약속',
    '취미',
    '프로젝트'
  ]);

  // Modals & Overlay States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFixedModalOpen, setIsFixedModalOpen] = useState(false);
  const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Focus Navigation state
  const [focusTargetTaskId, setFocusTargetTaskId] = useState<string | undefined>(undefined);
  const [focusTargetDuration, setFocusTargetDuration] = useState<number | undefined>(undefined);

  // Global Search state
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Toast feedback state
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Toast helper
  const showToast = (message: string, icon = 'check_circle') => {
    const newToast: ToastData = {
      id: Date.now(),
      message,
      icon
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 3200);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync data with Firebase Firestore per user
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // Logged in: Clear any previous user's data first
      setDataLoading(true);
      setTasks([]);
      setCompletedTasks([]);
      setFocusSessions([]);
      setScheduleBlocks([]);

      // Seed initial data if user's account is newly registered
      seedInitialUserDataIfEmpty(
        user.uid,
        INITIAL_TASKS,
        INITIAL_COMPLETED_TASKS,
        INITIAL_SCHEDULE_BLOCKS,
        INITIAL_FOCUS_SESSIONS
      ).catch((err) => console.error('Seed error:', err));

      // Subscribe to real-time Firestore collections under /users/{uid}/
      const unsubTasks = subscribeUserTasks(
        user.uid,
        (items) => {
          setTasks(items);
          setDataLoading(false);
        },
        () => setDataLoading(false)
      );

      const unsubCompleted = subscribeUserCompletedTasks(user.uid, (items) => {
        setCompletedTasks(items);
      });

      const unsubSessions = subscribeUserFocusSessions(user.uid, (items) => {
        setFocusSessions(items);
      });

      const unsubSchedule = subscribeUserScheduleBlocks(user.uid, (items) => {
        setScheduleBlocks(items.length > 0 ? items : INITIAL_SCHEDULE_BLOCKS);
      });

      return () => {
        unsubTasks();
        unsubCompleted();
        unsubSessions();
        unsubSchedule();
      };
    } else {
      // Logged out: Clear private data from memory completely
      setTasks(INITIAL_TASKS);
      setCompletedTasks(INITIAL_COMPLETED_TASKS);
      setFocusSessions(INITIAL_FOCUS_SESSIONS);
      setScheduleBlocks(INITIAL_SCHEDULE_BLOCKS);
      setDataLoading(false);
    }
  }, [user, authLoading]);

  // Completion calculation
  const totalItemsCount = tasks.length + completedTasks.length;
  const completionRate =
    totalItemsCount > 0 ? Math.round((completedTasks.length / totalItemsCount) * 100) : 72;

  // Task Actions
  const handleToggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (user) {
      try {
        if (task.status === 'COMPLETED') {
          await saveUserTask(user.uid, { ...task, status: 'UPCOMING' });
          showToast('할 일이 미완료로 변경되었습니다.', 'radio_button_unchecked');
        } else {
          // Move from tasks to completedTasks in Firestore
          await deleteUserTask(user.uid, id);
          const newCompleted: CompletedTask = {
            id: 'comp-' + Date.now(),
            title: task.title,
            desc: task.desc,
            category: task.category,
            completedAt: '방금 전',
            originalTaskId: task.id
          };
          await saveUserCompletedTask(user.uid, newCompleted);
          showToast('할 일을 완료했습니다! 피트 점수가 상승합니다.', 'task_alt');
        }
      } catch (err) {
        console.error(err);
        showToast('작업 처리 중 오류가 발생했습니다.', 'error');
      }
    } else {
      // Local Guest fallback
      if (task.status === 'COMPLETED') {
        setTasks(tasks.map((t) => (t.id === id ? { ...t, status: 'UPCOMING' } : t)));
        showToast('할 일이 미완료로 변경되었습니다.', 'radio_button_unchecked');
      } else {
        setTasks(tasks.filter((t) => t.id !== id));
        const newCompleted: CompletedTask = {
          id: 'comp-' + Date.now(),
          title: task.title,
          desc: task.desc,
          category: task.category,
          completedAt: '방금 전',
          originalTaskId: task.id
        };
        setCompletedTasks([newCompleted, ...completedTasks]);
        showToast('할 일을 완료했습니다! (로그인 시 클라우드 저장)', 'task_alt');
      }
    }
  };

  const handleCompleteTaskFromMyTasks = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    if (user) {
      try {
        await deleteUserTask(user.uid, id);
        const newCompleted: CompletedTask = {
          id: 'comp-' + Date.now(),
          title: task.title,
          desc: task.desc,
          category: task.category,
          completedAt: '방금 전',
          originalTaskId: task.id
        };
        await saveUserCompletedTask(user.uid, newCompleted);
        showToast(`'${task.title}' 완료되었습니다!`, 'task_alt');
      } catch (err) {
        console.error(err);
      }
    } else {
      setTasks(tasks.filter((t) => t.id !== id));
      const newCompleted: CompletedTask = {
        id: 'comp-' + Date.now(),
        title: task.title,
        desc: task.desc,
        category: task.category,
        completedAt: '방금 전',
        originalTaskId: task.id
      };
      setCompletedTasks([newCompleted, ...completedTasks]);
      showToast(`'${task.title}' 완료되었습니다!`, 'task_alt');
    }
  };

  const handleUncompleteTask = async (completedId: string) => {
    const compTask = completedTasks.find((c) => c.id === completedId);
    if (!compTask) return;

    const reactivated: Task = {
      id: compTask.originalTaskId || 'task-' + Date.now(),
      title: compTask.title,
      desc: compTask.desc,
      category: compTask.category || '일상',
      priority: 'MEDIUM',
      duration: 30,
      repeat: '없음',
      status: 'UPCOMING',
      score: 65,
      reason: '방금 재활성화된 과업',
      dueLabel: '기한 미정'
    };

    if (user) {
      try {
        await deleteUserCompletedTask(user.uid, completedId);
        await saveUserTask(user.uid, reactivated);
        showToast(`'${compTask.title}' 완료가 취소되어 목록에 복원되었습니다.`, 'undo');
      } catch (err) {
        console.error(err);
      }
    } else {
      setCompletedTasks(completedTasks.filter((c) => c.id !== completedId));
      setTasks([reactivated, ...tasks]);
      showToast(`'${compTask.title}' 완료가 취소되어 목록에 복원되었습니다.`, 'undo');
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (user) {
      try {
        await deleteUserTask(user.uid, id);
        showToast('할 일이 삭제되었습니다.', 'delete');
      } catch (err) {
        console.error(err);
      }
    } else {
      setTasks(tasks.filter((t) => t.id !== id));
      showToast('할 일이 삭제되었습니다.', 'delete');
    }
  };

  const handleDeleteCompletedTask = async (id: string) => {
    if (user) {
      try {
        await deleteUserCompletedTask(user.uid, id);
        showToast('완료 기록이 삭제되었습니다.', 'delete');
      } catch (err) {
        console.error(err);
      }
    } else {
      setCompletedTasks(completedTasks.filter((c) => c.id !== id));
      showToast('완료 기록이 삭제되었습니다.', 'delete');
    }
  };

  const handleBulkComplete = async (ids: string[]) => {
    const idSet = new Set(ids);
    const toComplete = tasks.filter((t) => idSet.has(t.id));

    if (user) {
      try {
        for (const t of toComplete) {
          await deleteUserTask(user.uid, t.id);
          await saveUserCompletedTask(user.uid, {
            id: `comp-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            title: t.title,
            desc: t.desc,
            category: t.category,
            completedAt: '방금 전',
            originalTaskId: t.id
          });
        }
        showToast(`${ids.length}개 할 일이 일괄 완료되었습니다!`, 'done_all');
      } catch (err) {
        console.error(err);
      }
    } else {
      const remaining = tasks.filter((t) => !idSet.has(t.id));
      const newlyCompleted: CompletedTask[] = toComplete.map((t) => ({
        id: `comp-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        title: t.title,
        desc: t.desc,
        category: t.category,
        completedAt: '방금 전',
        originalTaskId: t.id
      }));
      setTasks(remaining);
      setCompletedTasks([...newlyCompleted, ...completedTasks]);
      showToast(`${ids.length}개 할 일이 일괄 완료되었습니다!`, 'done_all');
    }
  };

  const handleDuplicateTask = async (id: string) => {
    const source = tasks.find((t) => t.id === id);
    if (!source) return;

    const clone: Task = {
      ...source,
      id: 'task-' + Date.now(),
      title: `${source.title} (복제본)`
    };

    if (user) {
      try {
        await saveUserTask(user.uid, clone);
        showToast('할 일이 복제되어 저장되었습니다.', 'content_copy');
      } catch (err) {
        console.error(err);
      }
    } else {
      setTasks([clone, ...tasks]);
      showToast('할 일이 복제되었습니다.', 'content_copy');
    }
  };

  const handleSaveTaskModal = async (taskData: Partial<Task>) => {
    const taskId = taskData.id || 'task-' + Date.now();
    const newTask: Task = {
      id: taskId,
      title: taskData.title || '새 할 일',
      desc: taskData.desc || '',
      category: taskData.category || '공부',
      priority: taskData.priority || 'HIGH',
      due: taskData.due || '',
      dueLabel: taskData.dueLabel || '기한 미정',
      duration: taskData.duration || 60,
      repeat: taskData.repeat || '없음',
      status: taskData.status || 'UPCOMING',
      score: taskData.score || 75
    };

    if (user) {
      try {
        await saveUserTask(user.uid, newTask);
        showToast(taskData.id ? '할 일 정보가 수정되었습니다.' : '새 할 일이 등록되었습니다!', 'check_circle');
      } catch (err) {
        console.error(err);
      }
    } else {
      if (taskData.id) {
        setTasks(tasks.map((t) => (t.id === taskData.id ? newTask : t)));
        showToast('할 일 정보가 수정되었습니다.', 'edit');
      } else {
        setTasks([newTask, ...tasks]);
        showToast('새 할 일이 등록되었습니다! (로그인 시 클라우드 저장)', 'check_circle');
      }
    }
  };

  const handleSaveFixedSchedule = async (title: string, start: string, end: string) => {
    const newBlock: ScheduleBlock = {
      id: 'sched-fixed-' + Date.now(),
      time: start,
      timeRange: `${start} - ${end}`,
      durationMinutes: 60,
      title,
      type: 'FIXED',
      isLocked: true,
      tag: '사용자 지정'
    };

    if (user) {
      try {
        await saveUserScheduleBlock(user.uid, newBlock);
      } catch (err) {
        console.error(err);
      }
    } else {
      setScheduleBlocks([...scheduleBlocks, newBlock]);
    }
    showToast(`'${title}' 고정 일정이 등록되어 보호 구간으로 지정되었습니다.`, 'lock');
  };

  const handleAddFocusSession = async (session: FocusSession) => {
    if (user) {
      try {
        await saveUserFocusSession(user.uid, session);
      } catch (err) {
        console.error(err);
      }
    } else {
      setFocusSessions([session, ...focusSessions]);
    }
  };

  const handleStartFocus = (task: Task, duration: number) => {
    setFocusTargetTaskId(task.id);
    setFocusTargetDuration(duration);
    setCurrentTab('focus-mode');
    showToast(`'${task.title}' ${duration}분 집중 모드가 준비되었습니다.`, 'timer');
  };

  const handleAddCategory = (name: string) => {
    if (!categories.includes(name)) {
      setCategories([...categories, name]);
    }
  };

  const handleExportData = () => {
    const data = {
      user: user ? { uid: user.uid, email: user.email, displayName: userProfile?.displayName } : null,
      tasks,
      completedTasks,
      focusSessions,
      scheduleBlocks,
      categories,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harufit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('현재 하루핏 데이터 백업 파일이 다운로드되었습니다.', 'download');
  };

  const handleResetData = () => {
    if (window.confirm('정말로 기본 샘플 데이터로 복원하시겠습니까?')) {
      setTasks(INITIAL_TASKS);
      setCompletedTasks(INITIAL_COMPLETED_TASKS);
      setFocusSessions(INITIAL_FOCUS_SESSIONS);
      setScheduleBlocks(INITIAL_SCHEDULE_BLOCKS);
      showToast('기본 샘플 데이터로 복원되었습니다.', 'restart_alt');
    }
  };

  // User display nickname
  const currentDisplayName = userProfile?.displayName || user?.displayName || '민지';

  // Loading Splash Screen while checking Firebase Auth status
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <img
          alt="하루핏 HARUFIT Logo"
          className="h-12 w-auto object-contain animate-pulse"
          src="https://lh3.googleusercontent.com/aida/AEtjO1VHaUzAHIny4xDTyFcQQTOCvfSgn1Z3PVIi5RY8NoIH4uEDyMaTYv_LjSsvORmJtWPYlyZtDVQxE_9uzMdOmRDbLNeoYZikjyBzCxwMARVHGI7zaR8QTO1_ghtc0QmPE1L5ZrK0GZPiySLpodE15tntHzIaAVOa4-GIFmxb9hvJ8_CmoMI56FpvIdgq9RVYW4Z-42WWiKfUqV2RZlcVdxWpUmHA2Y2mxwFJSJE8LYeXsKMTPxgC7F9BIZc"
        />
        <div className="flex items-center gap-2 text-primary font-label-md text-label-md font-bold">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>하루핏 계정 인증 상태 확인 중...</span>
        </div>
      </div>
    );
  }

  // Top recommended task for recommend modal
  const recommendedTask = tasks[0] || INITIAL_TASKS[0];

  return (
    <div className="bg-background font-body-md text-body-md text-on-surface antialiased min-h-screen">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        completionRate={completionRate}
      />

      {/* Main Layout Area */}
      <div className="pl-64">
        {/* Fixed Top Header */}
        <Header
          onOpenQuickAdd={() => {
            setEditingTask(null);
            setIsTaskModalOpen(true);
          }}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onOpenNicknameModal={() => setIsNicknameModalOpen(true)}
          searchQuery={globalSearchQuery}
          onSearch={(query) => {
            setGlobalSearchQuery(query);
            if (currentTab !== 'my-tasks') {
              setCurrentTab('my-tasks');
            }
          }}
        />

        {/* Dynamic Page Views */}
        <main className="w-full pt-16 bg-background px-gutter py-space-lg min-h-screen">
          {dataLoading && (
            <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="font-label-sm text-label-sm text-primary font-medium">
                Cloud Firestore에서 {currentDisplayName}님의 데이터를 안전하게 동기화하고 있습니다...
              </span>
            </div>
          )}

          {currentTab === 'dashboard' && (
            <DashboardView
              tasks={tasks}
              userName={currentDisplayName}
              isLoggedIn={!!user}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={(partial) => handleSaveTaskModal(partial)}
              onOpenRecommendModal={() => setIsRecommendModalOpen(true)}
              onOpenQuickAddModal={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              onStartFocus={handleStartFocus}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'my-tasks' && (
            <MyTasksView
              tasks={tasks}
              completedTasks={completedTasks}
              categories={categories}
              onAddTask={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onCompleteTask={handleCompleteTaskFromMyTasks}
              onUncompleteTask={handleUncompleteTask}
              onDeleteCompletedTask={handleDeleteCompletedTask}
              onBulkComplete={handleBulkComplete}
              onDuplicateTask={handleDuplicateTask}
              onStartFocus={handleStartFocus}
              onAddCategory={handleAddCategory}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'smart-schedule' && (
            <SmartScheduleView
              scheduleBlocks={scheduleBlocks}
              onOpenAddFixedModal={() => setIsFixedModalOpen(true)}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'focus-mode' && (
            <FocusHubView
              tasks={tasks}
              initialMode="focus"
              focusSessions={focusSessions}
              onAddFocusSession={handleAddFocusSession}
              onShowToast={showToast}
              initialSelectedTaskId={focusTargetTaskId}
              initialPresetDuration={focusTargetDuration}
            />
          )}

          {currentTab === 'insights' && (
            <FocusHubView
              tasks={tasks}
              initialMode="insights"
              focusSessions={focusSessions}
              onAddFocusSession={handleAddFocusSession}
              onShowToast={showToast}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              onResetData={handleResetData}
              onExportData={handleExportData}
              onShowToast={showToast}
              onOpenLogin={() => setIsLoginModalOpen(true)}
            />
          )}

          {currentTab === 'intro-video' && (
            <IntroVideoView onShowToast={showToast} />
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTaskModal}
        initialTask={editingTask}
        categories={categories}
      />

      <FixedScheduleModal
        isOpen={isFixedModalOpen}
        onClose={() => setIsFixedModalOpen(false)}
        onSave={handleSaveFixedSchedule}
      />

      <RecommendModal
        isOpen={isRecommendModalOpen}
        onClose={() => setIsRecommendModalOpen(false)}
        onStartFocus={handleStartFocus}
        recommendedTask={recommendedTask}
      />

      {/* Nickname Setup Modal */}
      <NicknameModal
        isOpen={isNicknameModalOpen}
        onClose={() => setIsNicknameModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Google Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Floating Interactive Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
