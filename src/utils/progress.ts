// Progress tracking utilities for Fusha Connect

export interface ProgressData {
  lessonId: string;
  completedAt: string;
  score?: number;
  timeSpent?: number; // in minutes
}

export interface ModuleProgress {
  moduleId: string;
  completedLessons: string[];
  totalLessons: number;
  completedAt?: string;
}

export interface LevelProgress {
  levelId: string;
  completedModules: string[];
  totalModules: number;
  completedAt?: string;
}

class ProgressTracker {
  private static readonly STORAGE_KEY = 'fusha_progress';

  // Get all progress data
  static getProgress(): ProgressData[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading progress from localStorage:', error);
      return [];
    }
  }

  // Save progress data
  static saveProgress(progress: ProgressData[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress to localStorage:', error);
    }
  }

  // Mark a lesson as completed
  static markLessonCompleted(lessonId: string, score?: number, timeSpent?: number): void {
    const progress = this.getProgress();
    const existingIndex = progress.findIndex(p => p.lessonId === lessonId);
    
    const newProgress: ProgressData = {
      lessonId,
      completedAt: new Date().toISOString(),
      score,
      timeSpent
    };

    if (existingIndex >= 0) {
      progress[existingIndex] = newProgress;
    } else {
      progress.push(newProgress);
    }

    this.saveProgress(progress);
  }

  // Check if a lesson is completed
  static isLessonCompleted(lessonId: string): boolean {
    const progress = this.getProgress();
    return progress.some(p => p.lessonId === lessonId);
  }

  // Get completion count for a module
  static getModuleProgress(moduleId: string, lessonIds: string[]): ModuleProgress {
    const progress = this.getProgress();
    const completedLessons = lessonIds.filter(lessonId => 
      progress.some(p => p.lessonId === lessonId)
    );

    return {
      moduleId,
      completedLessons,
      totalLessons: lessonIds.length,
      completedAt: completedLessons.length === lessonIds.length ? 
        new Date().toISOString() : undefined
    };
  }

  // Get completion count for a level
  static getLevelProgress(levelId: string, moduleIds: string[], allLessons: { [moduleId: string]: string[] }): LevelProgress {
    const completedModules = moduleIds.filter(moduleId => {
      const moduleProgress = this.getModuleProgress(moduleId, allLessons[moduleId] || []);
      return moduleProgress.completedLessons.length === moduleProgress.totalLessons;
    });

    return {
      levelId,
      completedModules,
      totalModules: moduleIds.length,
      completedAt: completedModules.length === moduleIds.length ? 
        new Date().toISOString() : undefined
    };
  }

  // Get overall progress statistics
  static getOverallProgress(allLessons: string[]): {
    completedLessons: number;
    totalLessons: number;
    completedModules: number;
    totalModules: number;
    completedLevels: number;
    totalLevels: number;
  } {
    const progress = this.getProgress();
    const completedLessons = progress.length;
    
    // This would need to be calculated based on your curriculum structure
    // For now, returning basic stats
    return {
      completedLessons,
      totalLessons: allLessons.length,
      completedModules: 0, // Would need curriculum structure
      totalModules: 0,     // Would need curriculum structure
      completedLevels: 0,  // Would need curriculum structure
      totalLevels: 0       // Would need curriculum structure
    };
  }

  // Clear all progress (for testing/reset)
  static clearProgress(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Export progress data (for backup)
  static exportProgress(): string {
    return JSON.stringify(this.getProgress(), null, 2);
  }

  // Import progress data (for restore)
  static importProgress(progressJson: string): boolean {
    try {
      const progress = JSON.parse(progressJson);
      this.saveProgress(progress);
      return true;
    } catch (error) {
      console.error('Error importing progress:', error);
      return false;
    }
  }
}

export default ProgressTracker;
