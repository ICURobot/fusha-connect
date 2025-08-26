export interface Progress {
  id: string;
  lesson_id: string;
  completed_at: string; // ISO date string
  user_identifier: string;
}

export class ProgressEntity {
  static async list(): Promise<Progress[]> {
    // Get progress from localStorage for now - replace with actual API call
    const storedProgress = localStorage.getItem('fusha_progress');
    if (storedProgress) {
      return JSON.parse(storedProgress);
    }
    return [];
  }

  static async filter(criteria: Partial<Progress>): Promise<Progress[]> {
    const progress = await this.list();
    return progress.filter(record => {
      return Object.entries(criteria).every(([key, value]) => 
        record[key as keyof Progress] === value
      );
    });
  }

  static async create(data: Omit<Progress, 'completed_at' | 'id'>): Promise<Progress> {
    const progress: Progress = {
      id: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      completed_at: new Date().toISOString()
    };
    
    // Save to localStorage for now - replace with actual API call
    const existingProgress = await this.list();
    existingProgress.push(progress);
    localStorage.setItem('fusha_progress', JSON.stringify(existingProgress));
    
    return progress;
  }

  static async markCompleted(lessonId: string, userIdentifier: string): Promise<Progress> {
    // Check if already completed
    const existing = await this.filter({ 
      lesson_id: lessonId, 
      user_identifier: userIdentifier 
    });
    
    if (existing.length > 0) {
      return existing[0];
    }
    
    // Create new progress record
    return this.create({
      lesson_id: lessonId,
      user_identifier: userIdentifier
    });
  }

  static async getCompletedLessons(userIdentifier: string): Promise<string[]> {
    const progress = await this.filter({ user_identifier: userIdentifier });
    return progress.map(p => p.lesson_id);
  }

  static async isCompleted(lessonId: string, userIdentifier: string): Promise<boolean> {
    const progress = await this.filter({ 
      lesson_id: lessonId, 
      user_identifier: userIdentifier 
    });
    return progress.length > 0;
  }
}
