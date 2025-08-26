export interface Level {
  id: string;
  code: string;
  title: string;
  description: string;
  order: number;
  color?: string;
}

export class LevelEntity {
  static async list(orderBy?: string): Promise<Level[]> {
    // Mock data for now - replace with actual API call
    const mockLevels: Level[] = [
      {
        id: '1',
        code: 'A1',
        title: 'Beginner Foundation',
        description: 'Master basic sentence structures and essential vocabulary',
        order: 1,
        color: 'from-green-100 to-green-200'
      },
      {
        id: '2',
        code: 'A2',
        title: 'Elementary Progress',
        description: 'Build confidence with everyday conversations and grammar',
        order: 2,
        color: 'from-cyan-100 to-cyan-200'
      },
      {
        id: '3',
        code: 'B1',
        title: 'Intermediate Skills',
        description: 'Develop fluency in complex topics and advanced structures',
        order: 3,
        color: 'from-amber-100 to-amber-200'
      },
      {
        id: '4',
        code: 'B2',
        title: 'Upper Intermediate',
        description: 'Achieve sophisticated expression and academic proficiency',
        order: 4,
        color: 'from-gray-200 to-gray-300'
      }
    ];
    
    // Sort by order if specified
    if (orderBy === 'order') {
      return mockLevels.sort((a, b) => a.order - b.order);
    }
    
    return mockLevels;
  }

  static async get(code: string): Promise<Level | null> {
    const levels = await this.list();
    return levels.find(level => level.code === code) || null;
  }

  static async filter(criteria: Partial<Level>): Promise<Level[]> {
    const levels = await this.list();
    return levels.filter(level => {
      return Object.entries(criteria).every(([key, value]) => 
        level[key as keyof Level] === value
      );
    });
  }
}
