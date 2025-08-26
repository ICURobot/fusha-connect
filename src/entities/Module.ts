export interface Module {
  id: string;
  level_code: string;
  number: number;
  title: string;
  description: string;
  order: number;
}

export class ModuleEntity {
  static async list(orderBy?: string): Promise<Module[]> {
    // Mock data for now - replace with actual API call
    const mockModules: Module[] = [
      {
        id: '1',
        level_code: 'A1',
        number: 1,
        title: 'Basic Greetings',
        description: 'Learn essential greetings and introductions',
        order: 1
      },
      {
        id: '2',
        level_code: 'A1',
        number: 2,
        title: 'Numbers and Colors',
        description: 'Master basic numbers and color vocabulary',
        order: 2
      },
      {
        id: '3',
        level_code: 'A1',
        number: 3,
        title: 'Family Members',
        description: 'Learn family-related vocabulary and sentences',
        order: 3
      },
      {
        id: '4',
        level_code: 'A2',
        number: 1,
        title: 'Daily Activities',
        description: 'Describe your daily routine in Arabic',
        order: 4
      },
      {
        id: '5',
        level_code: 'A2',
        number: 2,
        title: 'Food and Dining',
        description: 'Order food and discuss meals',
        order: 5
      }
    ];
    
    // Sort by order if specified
    if (orderBy === 'order') {
      return mockModules.sort((a, b) => a.order - b.order);
    }
    
    return mockModules;
  }

  static async get(levelCode: string, moduleNumber: number): Promise<Module | null> {
    const modules = await this.list();
    return modules.find(module => 
      module.level_code === levelCode && module.number === moduleNumber
    ) || null;
  }

  static async filter(criteria: Partial<Module>): Promise<Module[]> {
    const modules = await this.list();
    return modules.filter(module => {
      return Object.entries(criteria).every(([key, value]) => 
        module[key as keyof Module] === value
      );
    });
  }

  static async getByLevel(levelCode: string): Promise<Module[]> {
    return this.filter({ level_code: levelCode });
  }
}
