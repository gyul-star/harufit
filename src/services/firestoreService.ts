import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Task, CompletedTask, FocusSession, ScheduleBlock, UserProfile } from '../types';

// User Profile
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), {
      ...profile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// User Tasks
export function subscribeUserTasks(
  uid: string,
  onUpdate: (tasks: Task[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const path = `users/${uid}/tasks`;
  const q = query(collection(db, 'users', uid, 'tasks'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Task[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as Task);
      });
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveUserTask(uid: string, task: Task): Promise<void> {
  const path = `users/${uid}/tasks/${task.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'tasks', task.id), {
      ...task,
      userId: uid
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserTask(uid: string, taskId: string): Promise<void> {
  const path = `users/${uid}/tasks/${taskId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'tasks', taskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// User Completed Tasks
export function subscribeUserCompletedTasks(
  uid: string,
  onUpdate: (completed: CompletedTask[]) => void
): () => void {
  const path = `users/${uid}/completedTasks`;
  const q = query(collection(db, 'users', uid, 'completedTasks'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: CompletedTask[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as CompletedTask);
      });
      // Sort recently completed first if available
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveUserCompletedTask(uid: string, compTask: CompletedTask): Promise<void> {
  const path = `users/${uid}/completedTasks/${compTask.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'completedTasks', compTask.id), {
      ...compTask,
      userId: uid
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteUserCompletedTask(uid: string, compTaskId: string): Promise<void> {
  const path = `users/${uid}/completedTasks/${compTaskId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'completedTasks', compTaskId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// User Focus Sessions
export function subscribeUserFocusSessions(
  uid: string,
  onUpdate: (sessions: FocusSession[]) => void
): () => void {
  const path = `users/${uid}/focusSessions`;
  const q = query(collection(db, 'users', uid, 'focusSessions'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: FocusSession[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as FocusSession);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveUserFocusSession(uid: string, session: FocusSession): Promise<void> {
  const path = `users/${uid}/focusSessions/${session.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'focusSessions', session.id), {
      ...session,
      userId: uid
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// User Schedule Blocks
export function subscribeUserScheduleBlocks(
  uid: string,
  onUpdate: (blocks: ScheduleBlock[]) => void
): () => void {
  const path = `users/${uid}/scheduleBlocks`;
  const q = query(collection(db, 'users', uid, 'scheduleBlocks'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: ScheduleBlock[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ScheduleBlock);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveUserScheduleBlock(uid: string, block: ScheduleBlock): Promise<void> {
  const path = `users/${uid}/scheduleBlocks/${block.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'scheduleBlocks', block.id), {
      ...block,
      userId: uid
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function batchSaveScheduleBlocks(uid: string, blocks: ScheduleBlock[]): Promise<void> {
  const path = `users/${uid}/scheduleBlocks`;
  try {
    const batch = writeBatch(db);
    blocks.forEach((b) => {
      const ref = doc(db, 'users', uid, 'scheduleBlocks', b.id);
      batch.set(ref, { ...b, userId: uid });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// User Preferences / Settings
export async function getUserSettings(uid: string): Promise<any | null> {
  const path = `users/${uid}/settings/preferences`;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'settings', 'preferences'));
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserSettings(uid: string, settings: any): Promise<void> {
  const path = `users/${uid}/settings/preferences`;
  try {
    await setDoc(doc(db, 'users', uid, 'settings', 'preferences'), {
      ...settings,
      userId: uid,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Initial Data Seeding / Migration for New Account
export async function seedInitialUserDataIfEmpty(
  _uid: string,
  _initialTasks: Task[],
  _initialCompleted: CompletedTask[],
  _initialSchedule: ScheduleBlock[],
  _initialSessions: FocusSession[]
): Promise<void> {
  // New users start with a clean empty slate - no fake sample data is seeded.
  return Promise.resolve();
}
