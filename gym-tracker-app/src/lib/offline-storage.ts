import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Workout, Exercise, ExerciseSet, WeightLog } from '../types';

interface GymTrackerDB extends DBSchema {
  workouts: {
    key: string;
    value: Workout;
    indexes: { 'by-date': string; 'by-completed': boolean };
  };
  exercises: {
    key: number;
    value: Exercise;
    indexes: { 'by-workout': number };
  };
  exerciseSets: {
    key: number;
    value: ExerciseSet;
    indexes: { 'by-exercise': number };
  };
  weightLogs: {
    key: string;
    value: WeightLog;
    indexes: { 'by-date': string };
  };
  syncQueue: {
    key: number;
    value: {
      id: number;
      type: 'workout' | 'exercise' | 'exerciseSet' | 'weightLog';
      action: 'create' | 'update' | 'delete';
      data: any;
      timestamp: number;
    };
  };
  appData: {
    key: string;
    value: {
      lastSync: number;
      userId: string;
      version: number;
    };
  };
}

class OfflineStorage {
  private db: IDBPDatabase<GymTrackerDB> | null = null;
  private readonly DB_NAME = 'gym-tracker-db';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<GymTrackerDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Workouts store
        const workoutStore = db.createObjectStore('workouts', { keyPath: 'date' });
        workoutStore.createIndex('by-date', 'date');
        workoutStore.createIndex('by-completed', 'is_completed');

        // Exercises store
        const exerciseStore = db.createObjectStore('exercises', { keyPath: 'id' });
        exerciseStore.createIndex('by-workout', 'workout_id');

        // Exercise sets store
        const setStore = db.createObjectStore('exerciseSets', { keyPath: 'id' });
        setStore.createIndex('by-exercise', 'exercise_id');

        // Weight logs store
        const weightStore = db.createObjectStore('weightLogs', { keyPath: 'measured_at' });
        weightStore.createIndex('by-date', 'measured_at');

        // Sync queue store
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });

        // App data store
        db.createObjectStore('appData', { keyPath: 'key' });
      },
    });
  }

  // Workout operations
  async saveWorkout(workout: Workout): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.put('workouts', workout);
    await this.addToSyncQueue('workout', 'update', workout);
  }

  async getWorkout(date: string): Promise<Workout | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.get('workouts', date);
  }

  async getWorkouts(startDate?: string, endDate?: string): Promise<Workout[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction('workouts', 'readonly');
    const index = tx.store.index('by-date');
    
    let range: IDBKeyRange | undefined;
    if (startDate && endDate) {
      range = IDBKeyRange.bound(startDate, endDate);
    } else if (startDate) {
      range = IDBKeyRange.lowerBound(startDate);
    } else if (endDate) {
      range = IDBKeyRange.upperBound(endDate);
    }
    
    return await index.getAll(range);
  }

  // Exercise operations
  async saveExercise(exercise: Exercise): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.put('exercises', exercise);
    await this.addToSyncQueue('exercise', 'update', exercise);
  }

  async getExercisesByWorkout(workoutId: number): Promise<Exercise[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction('exercises', 'readonly');
    const index = tx.store.index('by-workout');
    return await index.getAll(workoutId);
  }

  // Exercise set operations
  async saveExerciseSet(set: ExerciseSet): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.put('exerciseSets', set);
    await this.addToSyncQueue('exerciseSet', 'update', set);
  }

  async getExerciseSets(exerciseId: number): Promise<ExerciseSet[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction('exerciseSets', 'readonly');
    const index = tx.store.index('by-exercise');
    return await index.getAll(exerciseId);
  }

  // Weight log operations
  async saveWeightLog(weightLog: WeightLog): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.put('weightLogs', weightLog);
    await this.addToSyncQueue('weightLog', 'update', weightLog);
  }

  async getWeightLog(date: string): Promise<WeightLog | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.get('weightLogs', date);
  }

  async getWeightLogs(limit?: number): Promise<WeightLog[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const tx = this.db.transaction('weightLogs', 'readonly');
    const index = tx.store.index('by-date');
    
    if (limit) {
      const cursor = await index.openCursor(null, 'prev');
      const results: WeightLog[] = [];
      let count = 0;
      
      while (cursor && count < limit) {
        results.push(cursor.value);
        count++;
        await cursor.continue();
      }
      
      return results;
    }
    
    return await index.getAll();
  }

  // Sync queue operations
  private async addToSyncQueue(
    type: 'workout' | 'exercise' | 'exerciseSet' | 'weightLog',
    action: 'create' | 'update' | 'delete',
    data: any
  ): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.add('syncQueue', {
      type,
      action,
      data,
      timestamp: Date.now(),
    } as any);
  }

  async getSyncQueue(): Promise<any[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.getAll('syncQueue');
  }

  async clearSyncQueue(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.clear('syncQueue');
  }

  async removeSyncQueueItem(id: number): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.delete('syncQueue', id);
  }

  // App data operations
  async setLastSync(timestamp: number): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const existing = await this.db.get('appData', 'sync') || { key: 'sync', lastSync: 0, userId: '', version: 1 };
    existing.lastSync = timestamp;
    await this.db.put('appData', existing);
  }

  async getLastSync(): Promise<number> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const data = await this.db.get('appData', 'sync');
    return data?.lastSync || 0;
  }

  // Utility methods
  async clear(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const storeNames = [
      'workouts', 'exercises', 'exerciseSets', 'weightLogs', 'syncQueue', 'appData'
    ] as const;
    
    for (const storeName of storeNames) {
      await this.db.clear(storeName);
    }
  }

  async getStorageSize(): Promise<{ [key: string]: number }> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const sizes: { [key: string]: number } = {};
    const storeNames = [
      'workouts', 'exercises', 'exerciseSets', 'weightLogs', 'syncQueue', 'appData'
    ] as const;
    
    for (const storeName of storeNames) {
      const count = await this.db.count(storeName);
      sizes[storeName] = count;
    }
    
    return sizes;
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorage();