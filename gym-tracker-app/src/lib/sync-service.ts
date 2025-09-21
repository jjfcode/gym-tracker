import { supabase } from './supabase';
import { offlineStorage } from './offline-storage';
import type { Workout, Exercise, ExerciseSet, WeightLog } from '../types';

interface SyncQueueItem {
  id: number;
  type: 'workout' | 'exercise' | 'exerciseSet' | 'weightLog';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
}

class SyncService {
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private syncCallbacks: Array<(status: 'syncing' | 'synced' | 'error') => void> = [];

  constructor() {
    this.setupOnlineListeners();
    this.setupPeriodicSync();
  }

  private setupOnlineListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncWhenOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private setupPeriodicSync(): void {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncWhenOnline();
      }
    }, 5 * 60 * 1000);
  }

  onSyncStatusChange(callback: (status: 'syncing' | 'synced' | 'error') => void): () => void {
    this.syncCallbacks.push(callback);
    return () => {
      const index = this.syncCallbacks.indexOf(callback);
      if (index > -1) {
        this.syncCallbacks.splice(index, 1);
      }
    };
  }

  private notifyCallbacks(status: 'syncing' | 'synced' | 'error'): void {
    this.syncCallbacks.forEach(callback => callback(status));
  }

  async syncWhenOnline(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) {
      return;
    }

    this.syncInProgress = true;
    this.notifyCallbacks('syncing');

    try {
      // First, pull latest data from server
      await this.pullFromServer();
      
      // Then, push local changes to server
      await this.pushToServer();
      
      await offlineStorage.setLastSync(Date.now());
      this.notifyCallbacks('synced');
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifyCallbacks('error');
    } finally {
      this.syncInProgress = false;
    }
  }

  private async pullFromServer(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const lastSync = await offlineStorage.getLastSync();
    const lastSyncDate = new Date(lastSync).toISOString();

    // Pull workouts
    const { data: workouts } = await supabase
      .from('workouts')
      .select(`
        *,
        exercises (
          *,
          exercise_sets (*)
        )
      `)
      .eq('user_id', user.id)
      .gte('updated_at', lastSyncDate);

    if (workouts) {
      for (const workout of workouts) {
        await offlineStorage.saveWorkout(workout as Workout);
        
        if (workout.exercises) {
          for (const exercise of workout.exercises) {
            await offlineStorage.saveExercise(exercise as Exercise);
            
            if (exercise.exercise_sets) {
              for (const set of exercise.exercise_sets) {
                await offlineStorage.saveExerciseSet(set as ExerciseSet);
              }
            }
          }
        }
      }
    }

    // Pull weight logs
    const { data: weightLogs } = await supabase
      .from('weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', lastSyncDate);

    if (weightLogs) {
      for (const weightLog of weightLogs) {
        await offlineStorage.saveWeightLog(weightLog as WeightLog);
      }
    }
  }

  private async pushToServer(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const syncQueue = await offlineStorage.getSyncQueue();
    
    for (const item of syncQueue as SyncQueueItem[]) {
      try {
        await this.processSyncItem(item, user.id);
        await offlineStorage.removeSyncQueueItem(item.id);
      } catch (error) {
        console.error('Failed to sync item:', item, error);
        // Continue with other items, failed items will be retried next sync
      }
    }
  }

  private async processSyncItem(item: SyncQueueItem, userId: string): Promise<void> {
    const data = { ...item.data, user_id: userId };

    switch (item.type) {
      case 'workout':
        if (item.action === 'create' || item.action === 'update') {
          await supabase.from('workouts').upsert(data);
        } else if (item.action === 'delete') {
          await supabase.from('workouts').delete().eq('id', data.id);
        }
        break;

      case 'exercise':
        if (item.action === 'create' || item.action === 'update') {
          await supabase.from('exercises').upsert(data);
        } else if (item.action === 'delete') {
          await supabase.from('exercises').delete().eq('id', data.id);
        }
        break;

      case 'exerciseSet':
        if (item.action === 'create' || item.action === 'update') {
          await supabase.from('exercise_sets').upsert(data);
        } else if (item.action === 'delete') {
          await supabase.from('exercise_sets').delete().eq('id', data.id);
        }
        break;

      case 'weightLog':
        if (item.action === 'create' || item.action === 'update') {
          await supabase.from('weight_logs').upsert(data);
        } else if (item.action === 'delete') {
          await supabase.from('weight_logs').delete().eq('measured_at', data.measured_at);
        }
        break;
    }
  }

  // Public methods for manual sync operations
  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.syncWhenOnline();
    }
  }

  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  getSyncStatus(): boolean {
    return this.syncInProgress;
  }

  async clearOfflineData(): Promise<void> {
    await offlineStorage.clear();
  }

  async getOfflineStorageInfo(): Promise<{ [key: string]: number }> {
    return await offlineStorage.getStorageSize();
  }
}

// Export singleton instance
export const syncService = new SyncService();